import test from 'node:test';
import assert from 'node:assert/strict';
import { passwordValidation, authenticateWithPassword, passwordErrorMessage } from '../lib/password-auth.ts';
test('signup validates password and confirmation while login accepts existing passwords', () => {
  assert.ok(passwordValidation('', '', false));
  assert.ok(passwordValidation('short','short',true));
  assert.ok(passwordValidation('long-password','different',true));
  assert.ok(passwordValidation('x'.repeat(129),'x'.repeat(129),true));
  assert.equal(passwordValidation('long-password','long-password',true),null);
  assert.equal(passwordValidation('legacy','',false),null);
});
test('signup and login call only their matching password method and preserve password whitespace', async () => {
  const calls=[];
  const auth={signUp:async x=>{calls.push(['signup',x]);return {data:{session:{}},error:null};},signInWithPassword:async x=>{calls.push(['login',x]);return {data:{session:{}},error:null};}};
  await authenticateWithPassword(auth,'test@example.com',' password ',true);
  await authenticateWithPassword(auth,'test@example.com',' password ',false);
  assert.deepEqual(calls,[['signup',{email:'test@example.com',password:' password '}],['login',{email:'test@example.com',password:' password ' }]]);
});
test('a signup without a session is not treated as successful login', async () => {
  await assert.rejects(authenticateWithPassword({signUp:async()=>({data:{session:null},error:null})},'test@example.com','password',true),e=>e.code==='confirmation_required');
  assert.match(passwordErrorMessage({code:'invalid_credentials'}),/incorrect/);
  assert.match(passwordErrorMessage({code:'weak_password'}),/stronger/);
  assert.doesNotMatch(passwordErrorMessage(new Error('secret detail')),/secret detail/);
});
