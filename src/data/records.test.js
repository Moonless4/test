import test from 'node:test';
import assert from 'node:assert/strict';
import { addOrder, listOrders, deleteOrder } from './records.js';

const fixture = { code: 'TEST-REGISTRATION', total: 100 };
const registered = { registrationCompleted: true, user: { firstName: 'Customer' } };

test('order writes require a persisted registered customer session', async (t) => {
  const original = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  t.after(() => { globalThis.localStorage = original; });

  await t.test('no session cannot save an order', () => {
    assert.equal(addOrder(fixture), null);
    assert.deepEqual(listOrders(), []);
  });
  await t.test('an orphaned session cannot save an order', () => {
    values.set('naval-account-session-v1', '09900000001');
    assert.equal(addOrder(fixture), null);
    assert.deepEqual(listOrders(), []);
  });
  await t.test('an old automatic profile cannot save an order', () => {
    values.set('naval-accounts-v1', JSON.stringify({ '09900000001': { user: {} } }));
    assert.equal(addOrder(fixture), null);
    assert.deepEqual(listOrders(), []);
  });
  await t.test('guest is not a customer session', () => {
    values.set('naval-account-session-v1', 'guest');
    values.set('naval-accounts-v1', JSON.stringify({ guest: registered }));
    assert.equal(addOrder(fixture), null);
    assert.deepEqual(listOrders(), []);
  });
  await t.test('corrupt storage fails closed', () => {
    values.set('naval-accounts-v1', '{invalid');
    assert.equal(addOrder(fixture), null);
    assert.deepEqual(listOrders(), []);
  });
  await t.test('completed registration can save and remove its own order', () => {
    values.set('naval-account-session-v1', '09900000001');
    values.set('naval-accounts-v1', JSON.stringify({ '09900000001': registered }));
    const order = addOrder(fixture);
    assert.ok(order.id);
    assert.equal(listOrders()[0].id, order.id);
    deleteOrder(order.id);
    assert.deepEqual(listOrders(), []);
  });
});
