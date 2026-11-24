/** Stream-bounded UTF-8 body reader for signed webhooks. */
export async function readRawBody(request, maxBytes=100_000) {
 const length=request.headers.get('content-length');
 if(length!==null&&(!/^\d+$/.test(length)||Number(length)>maxBytes))return {ok:false,status:413,error:'Payload too large'};
 const reader=request.body?.getReader();
 if(!reader)return {ok:false,status:400,error:'Body required'};
 let size=0;const chunks=[];
 try {
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();return {ok:false,status:413,error:'Payload too large'};}chunks.push(value);}
  const buffer=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength;}
  return {ok:true,body:new TextDecoder('utf-8',{fatal:true}).decode(buffer)};
 }catch{return {ok:false,status:400,error:'Invalid UTF-8 body'};}
}
