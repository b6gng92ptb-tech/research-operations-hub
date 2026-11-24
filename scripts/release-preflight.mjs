import { existsSync } from 'node:fs';
const required=['package.json','.env.example','README.md','.github/workflows/ci.yml'];
const missing=required.filter(x=>!existsSync(new URL('../'+x,import.meta.url)));
for(const item of required) console.log(`${missing.includes(item)?'MISSING':'FOUND'} ${item}`);
const lock=existsSync(new URL('../package-lock.json',import.meta.url));
console.log(`${lock?'FOUND':'NOT GENERATED'} package-lock.json`);
if(!lock) console.warn('Release blocker: generate a genuine lockfile with npm install on a machine with registry access, then use npm ci in CI.');
if(missing.length||!lock) process.exitCode=1;
