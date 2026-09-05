import Header from './components/layout/Header';
import RbacBanner from './components/layout/RbacBanner';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Tab1Evaluation from './components/tabs/Tab1Evaluation';
import Tab2FraudLog from './components/tabs/Tab2FraudLog';
import Tab3Assistant from './components/tabs/Tab3Assistant';
import { AppProvider, useAppContext } from './context';

function TabContent() {
  const { activeTab } = useAppContext();

  switch (activeTab) {
    case 'fraudLog':
      return <Tab2FraudLog />;
    case 'assistant':
      return <Tab3Assistant />;
    case 'evaluation':
    default:
      return <Tab1Evaluation />;
  }
}

function DashboardShell() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-atmosphere" aria-hidden />
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 rounded-full bg-cyan-600/10 blur-3xl" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <RbacBanner />
        <Navbar />
        <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1">
          <Sidebar />
          <main className="min-w-0 w-full max-w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <TabContent />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardShell />
    </AppProvider>
  );
}
