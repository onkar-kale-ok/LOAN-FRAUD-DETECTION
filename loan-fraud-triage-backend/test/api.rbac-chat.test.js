import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import app from '../src/app.js';

const analyst = { 'X-User-Role': 'ANALYST' };
const guest = { 'X-User-Role': 'GUEST' };

describe('POST /api/v1/applications/:id/chat', () => {
  it('returns 400 when message is missing', async () => {
    const res = await request(app)
      .post('/api/v1/applications/APP-2026-1001/chat')
      .set(analyst)
      .send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'A valid user message is required.');
  });

  it('returns 400 when message is blank', async () => {
    const res = await request(app)
      .post('/api/v1/applications/APP-2026-1001/chat')
      .set(analyst)
      .send({ message: '   ' });
    assert.equal(res.status, 400);
  });

  it('returns 404 when the application does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/applications/APP-0000-0000/chat')
      .set(analyst)
      .send({ message: 'Why is this high risk?' });
    assert.equal(res.status, 404);
    assert.equal(res.body.message, 'Application record not found.');
  });

  it('returns 403 for Guest role', async () => {
    const res = await request(app)
      .post('/api/v1/applications/APP-2026-1001/chat')
      .set(guest)
      .send({ message: 'Why is this high risk?' });
    assert.equal(res.status, 403);
  });
});

describe('PATCH /api/v1/applications/:id/decision', () => {
  it('returns 403 for Guest role', async () => {
    const res = await request(app)
      .patch('/api/v1/applications/APP-2026-1001/decision')
      .set(guest)
      .send({ decisionStatus: 'APPROVED' });
    assert.equal(res.status, 403);
  });

  it('returns 400 for an invalid decisionStatus', async () => {
    const res = await request(app)
      .patch('/api/v1/applications/APP-2026-1001/decision')
      .set(analyst)
      .send({ decisionStatus: 'CLEARED' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});
