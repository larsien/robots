const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const m=vm.runInNewContext(fs.readFileSync('src/ar3-model.js','utf8')+';AR3Model');
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
assert.ok(m.within(m.home));near(m.rad(180),Math.PI);near(m.deg(Math.PI/2),90);
assert.throws(()=>m.pose([NaN,0,0,0,0,0]));assert.equal(m.within([Infinity,0,0,0,0,0]),false);
let states=0;
for(let n=0;n<50;n++){
 const q=m.ranges.map(([lo,hi],i)=>lo+(hi-lo)*(.1+.8*(Math.sin(n*1.7+i*2.1)*.5+.5)));
 const p=m.pose(q);assert.ok(p.tool.every(Number.isFinite));
 for(let j=0;j<6;j++){
  const next=[...q];next[j]+=1e-6;const pp=m.pose(next);
  const numeric=pp.tool.map((v,k)=>(v-p.tool[k])/1e-6);
  const analytic=cross(p.axes[j],p.tool.map((v,k)=>v-p.points[j][k]));
  assert.ok(distance(numeric,analytic)<1e-6,`Joint ${j+1}: wrong rotation axis/sign`);
  for(let k=0;k<=j;k++)assert.ok(distance(p.points[k],pp.points[k])<1e-9,'An upstream joint moved');
 }
 const q6=[...q];q6[5]+=.2;const p6=m.pose(q6);
 assert.ok(distance(p.tool,p6.tool)<1e-12,'J6 translated flange origin');
 assert.ok(distance(p.rotation.flat(),p6.rotation.flat())>.1,'J6 failed to rotate tool');states++;
}
for(let axis=0;axis<3;axis++)for(const delta of [-.02,.02]){
 const target=m.pose(m.home).tool;target[axis]+=delta;const seed=[...m.home];const solved=m.inverse(target,seed);
 assert.ok(solved&&m.within(solved),'Reachable goal rejected');assert.ok(distance(m.pose(solved).tool,target)<.00015);
 for(let j=3;j<6;j++)near(solved[j],seed[j]);
 assert.ok(distance(seed,m.home)<1e-12,'Solver mutated seed');
}
assert.equal(m.inverse([10,10,10],m.home),null);assert.equal(m.inverse([NaN,0,0],m.home),null);
console.log(`PASS: ${states} poses × 6 axis derivatives; upstream invariance; J6 position/orientation; 6 IK goals (<0.15 mm); invalid/unreachable input.`);

for(let index=0;index<=6;index++){
 const pose=m.pose(m.home),frame=m.frame(pose,index);
 assert.ok(distance(m.inFrame(frame.origin,frame),[0,0,0])<1e-12);
 const local=[.1,-.2,.3],world=m.at(frame.origin,frame.rotation,local);
 assert.ok(distance(m.inFrame(world,frame),local)<1e-10,'Frame transform round trip');
 const next=[...m.home];next[0]+=.1;const target=m.pose(next).tool;
 near(distance(m.inFrame(target,frame),m.inFrame(pose.tool,frame)),distance(target,pose.tool));
}
assert.throws(()=>m.frame(m.pose(m.home),7));
console.log('PASS: all 7 coordinate frames, inverse transforms and position error invariance');
