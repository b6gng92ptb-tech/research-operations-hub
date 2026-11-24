import test from 'node:test';
import assert from 'node:assert/strict';
import {readJsonBody} from '../lib/http.mjs';
const request=(body,headers={})=>new Request('http://localhost/api/requests',{method:'POST',headers,body});
test('accepts valid bounded JSON object',async()=>{const result=await readJsonBody(request('{"title":"Test"}'));assert.equal(result.ok,true);assert.equal(result.data.title,'Test')});
test('rejects invalid JSON and array payloads',async()=>{assert.equal((await readJsonBody(request('{oops'))).status,400);assert.equal((await readJsonBody(request('[]'))).status,400)});
test('rejects oversized body even without content-length',async()=>{const result=await readJsonBody(request(JSON.stringify({data:'x'.repeat(100)})),32);assert.equal(result.status,413)});
test('rejects oversized content-length before streaming',async()=>{const result=await readJsonBody(request('{}',{'content-length':'99999'}));assert.equal(result.status,413)});
test('accepts UTF-8 content',async()=>{const result=await readJsonBody(request('{"title":"Ricerca climática"}'));assert.equal(result.data.title,'Ricerca climática')});
