import test from 'node:test';
import assert from 'node:assert/strict';
import {readRawBody} from '../lib/raw-body.mjs';
test('accepts signed webhook raw body unchanged',async()=>{
 const body='{"eventId":"one","value":"é"}';
 const result=await readRawBody(new Request('https://example.test',{method:'POST',body}));
 assert.deepEqual(result,{ok:true,body});
});
test('rejects oversized streaming body',async()=>{
 const result=await readRawBody(new Request('https://example.test',{method:'POST',body:'x'.repeat(100)}),20);
 assert.equal(result.status,413);
});
test('rejects malformed content-length',async()=>{
 const result=await readRawBody(new Request('https://example.test',{method:'POST',headers:{'content-length':'nonsense'},body:'{}'}));
 assert.equal(result.status,413);
});
test('rejects malformed utf8',async()=>{
 const body=new Uint8Array([0xff,0xfe]);
 const result=await readRawBody(new Request('https://example.test',{method:'POST',body}));
 assert.equal(result.status,400);
});
