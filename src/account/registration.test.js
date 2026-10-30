import test from 'node:test';
import assert from 'node:assert/strict';
import { isRegisteredAccount, loginAccount } from './registration.js';

const key = '09900000001';
const registered = { registrationCompleted: true, user: { firstName: 'Customer' } };

test('an unknown login is rejected without creating an account', () => {
  const accounts = {};
  assert.equal(loginAccount(accounts, key).ok, false);
  assert.deepEqual(accounts, {});
});

test('an old auto-created profile is not a registered account or session', () => {
  const profile = { user: { firstName: 'Old profile' }, orders: [{ id: 'existing' }] };
  const accounts = { [key]: profile };
  assert.equal(isRegisteredAccount(key, profile), false);
  assert.equal(loginAccount(accounts, key).ok, false);
  assert.equal(accounts[key], profile);
});

test('the guest entry never authenticates, even with a registration flag', () => {
  assert.equal(isRegisteredAccount('guest', registered), false);
  assert.equal(loginAccount({ guest: registered }, 'guest').ok, false);
});

test('a completed registration can sign in without changing its saved data', () => {
  const accounts = { [key]: registered };
  const result = loginAccount(accounts, key);
  assert.equal(result.ok, true);
  assert.equal(result.account, registered);
  assert.deepEqual(accounts, { [key]: registered });
});

test('a registration flag without a session identifier or user does not authenticate', () => {
  assert.equal(isRegisteredAccount(null, registered), false);
  assert.equal(isRegisteredAccount('', registered), false);
  assert.equal(isRegisteredAccount(key, { registrationCompleted: true }), false);
});
