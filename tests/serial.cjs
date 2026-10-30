const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const context=vm.createContext({TextEncoder,TextDecoder,setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync('src/ar3-model.js','utf8')+fs.readFileSync('src/ar3-serial.js','utf8')+';globalThis.api=AR3Serial;globalThis.model=AR3Model',context);
const {api,model}=context;
const raw=[7600,2322,100,7600,2287,3312];
const line=v=>'01111111'+v.map((x,i)=>'ABCDEF'[i]+x).join('')+'\r\n';
assert.deepEqual(Array.from(api.parse(line(raw))),raw);
for(const value of ['00000000','JP1A2','01111111A1B2C3D4E5FNaN','01111111A1B2C3D4E5F1000000','01111111A1B2C3D4E5F6extra'])assert.throws(()=>api.parse(value),/protocol/);
const cal={raw,q:Array.from(model.home),scale:[44,56,-56,43,22,-22]};
assert.deepEqual(Array.from(api.angles(raw,cal)),cal.q);
const changed=[...raw];changed[2]+=56;
assert(Math.abs(model.deg(api.angles(changed,cal)[2]-cal.q[2])+1)<1e-8);
for(let joint=0;joint<6;joint++)for(const sign of [-1,1]){
  const target=[...cal.q];target[joint]+=model.rad(sign*5);
  const plan=api.plan(raw,cal,target,joint,[1,0,1,0,1,0]);
  assert.match(plan.command,/^MJ.*T00S5G10H10I10K10U-1000000V-1000000W-1000000X-1000000Y-1000000Z-1000000\n$/);
  for(let i=0;i<6;i++)assert(Math.abs(model.deg(plan.q[i]-cal.q[i]))<=(i===joint?1.000001:1e-9));
  const expectedDirection=sign*cal.scale[joint]>0?[1,0,1,0,1,0][joint]:1-[1,0,1,0,1,0][joint];
  assert(plan.command.includes('ABCDEF'[joint]+expectedDirection+Math.abs(cal.scale[joint])));
}
assert.throws(()=>api.plan(raw,cal,cal.q,0,[1,1,1,1,1,1]),/atTarget/);
assert.throws(()=>api.plan(raw,cal,[NaN,...cal.q.slice(1)],0,[1,1,1,1,1,1]),/settings/);
assert.throws(()=>api.plan(raw,cal,cal.q,0,[1,1,1,1,1,2]),/settings/);
for(const scale of [[0,1,1,1,1,1],[Infinity,1,1,1,1,1],[1,1]])assert.throws(()=>api.validateScale(scale),/settings/);
async function main(){
  const sent=[];let deliver,reading=false,closed=false;
  const port={
    async open(options){assert.equal(options.baudRate,115200);},
    readable:{getReader(){return {read(){reading=true;return new Promise(resolve=>deliver=resolve);},async cancel(){deliver({done:true});},releaseLock(){}};}},
    writable:{getWriter(){return {async write(bytes){sent.push(new TextDecoder().decode(bytes));queueMicrotask(()=>deliver({value:new TextEncoder().encode(line(raw)),done:false}));},releaseLock(){}};}},
    async close(){closed=true;}
  };
  const logs=[];
  const connection=new api.Connection({async requestPort(){return port;}},()=>{},(type,detail)=>logs.push({type,detail}));
  assert.deepEqual(Array.from(await connection.connect()),raw);
  assert(reading);
  assert.equal(sent.length,1);assert.match(sent[0],/^GPU-1000000/);assert(!sent.some(s=>/MJ|LM|LL/.test(s)),'Connecting must never move or reset encoders');
  assert.deepEqual(logs.map(entry=>entry.type),['choosing','opening','open','tx','rx','verified']);
  assert.equal(logs.find(entry=>entry.type==='tx').detail,sent[0]);
  assert.equal(logs.find(entry=>entry.type==='rx').detail,line(raw));
  const query=connection.query();await assert.rejects(connection.query(),/busy/);await query;
  // Fragmented CRLF responses must resolve one pending request only.
  port.writable.getWriter=()=>({async write(){const reply=line(raw);deliver({value:new TextEncoder().encode(reply.slice(0,12)),done:false});setTimeout(()=>deliver({value:new TextEncoder().encode(reply.slice(12)),done:false}),0);},releaseLock(){}});
  assert.deepEqual(Array.from(await connection.query()),raw);
  port.writable.getWriter=()=>({async write(){queueMicrotask(()=>deliver({value:new TextEncoder().encode('wrong firmware\n'),done:false}));},releaseLock(){}});
  await assert.rejects(connection.query(),/protocol/);assert(connection.fault);
  assert(logs.some(entry=>entry.type==='rx'&&entry.detail==='wrong firmware\n'),'Invalid replies must be visible before parsing fails');
  assert(logs.some(entry=>entry.type==='error'&&entry.detail.includes('protocol')));
  await assert.rejects(connection.query(),/disconnected/);
  await connection.close();assert(closed);
  assert.equal(logs.at(-1).type,'closed');
  const originalTimer=context.setTimeout;let expire;
  context.setTimeout=(callback,delay)=>{assert.equal(delay,8000);expire=callback;return 0;};
  const timeoutLogs=[],timeout=new api.Connection({},()=>{},(type,detail)=>timeoutLogs.push({type,detail}));
  timeout.port={writable:{getWriter(){return {async write(){},releaseLock(){}};}}};
  const waiting=timeout.query();expire();await assert.rejects(waiting,/timeout/);
  assert(timeout.fault);assert(timeoutLogs.some(entry=>entry.type==='error'&&entry.detail.includes('timeout')));
  context.setTimeout=originalTimer;
  console.log('PASS: legacy framing, raw encoder preservation, signed calibration, 12 capped one-joint moves, limits, incompatible firmware, fragmented replies, concurrent-command rejection, close cleanup, connect never moves');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
