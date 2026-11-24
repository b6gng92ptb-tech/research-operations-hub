import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenIdentity } from '../lib/token-policy.mjs';
test('rejects missing subject and ID tokens',()=>{
 assert.equal(tokenIdentity({aud:'app'},'app'),null);
 assert.equal(tokenIdentity({sub:'u',token_use:'id',aud:'app'},'app'),null);
});
test('requires Cognito client ID for access tokens',()=>{
 assert.equal(tokenIdentity({sub:'u',token_use:'access',client_id:'other'},'app'),null);
 assert.deepEqual(tokenIdentity({sub:'u',token_use:'access',client_id:'app'},'app'),{sub:'u',role:'requester'});
});
test('supports standards-based audience arrays and group precedence',()=>{
 assert.deepEqual(tokenIdentity({sub:'u',aud:['app','other'],'cognito:groups':['reviewer','admin']},'app'),{sub:'u',role:'admin'});
 assert.equal(tokenIdentity({sub:'u',aud:['other']},'app'),null);
});
