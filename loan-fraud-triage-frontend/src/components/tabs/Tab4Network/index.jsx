import { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';
import Card from '../../common/Card';
import RiskBadge from '../../common/RiskBadge';
import { getFraudNetwork } from '../../../services/fraudService';

const EDGE_COLORS = {
  device: '#2dd4bf',
  phone: '#f472b6',
  email: '#38bdf8',
  address: '#fbbf24',
  employer: '#a78bfa',
};

function layoutNodes(nodes, width, height) {
  const n = nodes.length;
  if (n === 0) return [];
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 48;
  return nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / n - Math.PI / 2;
    return {
      ...node,
      x: n === 1 ? cx : cx + radius * Math.cos(angle),
      y: n === 1 ? cy : cy + radius * Math.sin(angle),
    };
  });
}

export default function Tab4Network() {
  const [graph, setGraph] = useState({ nodes: [], edges: [], counts: { nodes: 0, edges: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const width = 720;
  const height = 420;
  const positioned = layoutNodes(graph.nodes, width, height);
  const byId = Object.fromEntries(positioned.map((n) => [n.id, n]));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFraudNetwork();
        if (!cancelled) setGraph(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load network');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <Card
        title="Fraud ring network"
        subtitle="Links among stored evaluations: shared device, phone, email, address, or employer. Not confirmed fraud."
      >
        {loading && <p className="text-sm text-slate-400">Loading network…</p>}
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {!loading && !error && graph.nodes.length === 0 && (
          <p className="text-sm text-slate-400">
            Evaluate at least one application. Edges appear when two stored cases share a signal
            (evaluate Rahul then Amit Sharma to see a device/phone ring).
          </p>
        )}
        {!loading && graph.nodes.length > 0 && (
          <>
            <p className="mb-3 text-xs text-slate-500">
              {graph.counts.nodes} applications · {graph.counts.edges} shared-signal edges
            </p>
            <div className="mb-3 flex flex-wrap gap-3 text-[11px] uppercase tracking-wider text-slate-400">
              {Object.entries(EDGE_COLORS).map(([type, color]) => (
                <span key={type} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-6 rounded-full" style={{ background: color }} />
                  {type}
                </span>
              ))}
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-950/50">
              <svg viewBox={`0 0 ${width} ${height}`} className="h-[420px] w-full min-w-[640px]">
                {graph.edges.map((edge, index) => {
                  const a = byId[edge.from];
                  const b = byId[edge.to];
                  if (!a || !b) return null;
                  return (
                    <line
                      key={`${edge.from}-${edge.to}-${edge.type}-${index}`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={EDGE_COLORS[edge.type] || '#64748b'}
                      strokeWidth="2"
                      opacity="0.85"
                    />
                  );
                })}
                {positioned.map((node) => (
                  <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                    <circle r="18" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" />
                    <text
                      y="4"
                      textAnchor="middle"
                      className="fill-teal-200"
                      fontSize="9"
                      fontFamily="ui-monospace, monospace"
                    >
                      {String(node.id).slice(-4)}
                    </text>
                    <text
                      y="34"
                      textAnchor="middle"
                      className="fill-slate-300"
                      fontSize="10"
                    >
                      {(node.applicantName || '').slice(0, 16)}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <ul className="mt-4 space-y-2">
              {graph.nodes.map((node) => (
                <li
                  key={node.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/50 bg-slate-950/40 px-3 py-2"
                >
                  <span className="inline-flex items-center gap-2 text-sm text-slate-200">
                    <Share2 size={14} className="text-teal-300" />
                    <span className="font-mono text-xs text-teal-300">{node.id}</span>
                    {node.applicantName}
                  </span>
                  <RiskBadge score={node.riskScore} tier={node.riskTier} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
