import { createRemoteJWKSet, jwtVerify } from 'jose';
import { tokenIdentity } from './token-policy.mjs';
let cachedJwksUrl, jwks;
export async function identity(request) {
 const issuer=process.env.OIDC_ISSUER, audience=process.env.OIDC_AUDIENCE, jwksUrl=process.env.OIDC_JWKS_URL;
 if(!issuer||!audience||!jwksUrl) return null; // fail closed
 const header=request.headers.get('authorization')||'';
 if(!header.startsWith('Bearer ') || header.length > 8192) return null;
 try {
  if (cachedJwksUrl !== jwksUrl) { jwks=createRemoteJWKSet(new URL(jwksUrl)); cachedJwksUrl=jwksUrl; }
  const {payload}=await jwtVerify(header.slice(7),jwks,{issuer,algorithms:['RS256']});
  return tokenIdentity(payload,audience);
 }catch{return null;}
}
export async function requireIdentity(request,roles=['admin','reviewer','requester']) {
 const user=await identity(request);
 if(!user)return {error:Response.json({error:'Authentication required'},{status:401})};
 if(!roles.includes(user.role))return {error:Response.json({error:'Forbidden'},{status:403})};
 return {user};
}
