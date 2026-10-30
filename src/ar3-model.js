/* AR3 kinematics from ongdexter/ar3_core, cd43fed1 (MIT, Dexter Ong).
   Uses the Xacro loaded by planning_context.launch, not the obsolete standalone URDF.
   Joint values are radians; translations are metres in base_link. */
const AR3Model = (() => {
  const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
  const add=(a,b)=>a.map((v,i)=>v+b[i]), scale=(a,k)=>a.map(v=>v*k);
  const mv=(r,v)=>r.map(row=>row.reduce((s,x,i)=>s+x*v[i],0));
  const mm=(a,b)=>a.map(row=>b[0].map((_,j)=>row.reduce((s,x,k)=>s+x*b[k][j],0)));
  const identity=()=>[[1,0,0],[0,1,0],[0,0,1]];
  function rot(axis,angle){
    const c=Math.cos(angle),s=Math.sin(angle);
    return axis==='x'?[[1,0,0],[0,c,-s],[0,s,c]]:axis==='y'?[[c,0,s],[0,1,0],[-s,0,c]]:[[c,-s,0],[s,c,0],[0,0,1]];
  }
  const rpy=([r,p,y])=>mm(mm(rot('z',y),rot('y',p)),rot('x',r));
  const at=(p,r,v)=>add(p,mv(r,v));
  const joints=[
    {xyz:[0,0,.003445],rpy:[Math.PI,0,0],axis:'z',sign:1,limits:[-2.96706,2.96706]},
    {xyz:[0,.064146,-.16608],rpy:[1.5708,.5236,-1.5708],axis:'z',sign:-1,limits:[rad(-39.6),Math.PI/2]},
    {xyz:[.1525,-.26414,0],rpy:[0,0,-1.04720367321],axis:'z',sign:-1,limits:[.0174533,2.5080381]},
    {xyz:[0,0,.00675],rpy:[1.5708,-1.2554,-1.5708],axis:'z',sign:-1,limits:[-2.8710666,2.8710666]},
    {xyz:[0,0,-.22225],rpy:[Math.PI,0,-2.8262],axis:'x',sign:1,limits:[-1.81776042,1.81776042]},
    {xyz:[-.000294,0,.02117],rpy:[0,0,3.1416],axis:'z',sign:1,limits:[-2.5848326,2.5848326]}
  ];
  const ranges=joints.map(j=>j.limits);
  const home=[90,45,90,0,-45,0].map(rad);
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const within=q=>q.length===6&&q.every((v,i)=>Number.isFinite(v)&&v>=ranges[i][0]-1e-9&&v<=ranges[i][1]+1e-9);
  function pose(q){
    if(!Array.isArray(q)||q.length!==6||!q.every(Number.isFinite))throw new Error('Six finite joint angles required');
    let p=[0,0,0],r=identity();const points=[],axes=[],frames=[];
    joints.forEach((j,i)=>{
      p=at(p,r,j.xyz);r=mm(r,rpy(j.rpy));
      const axis=j.axis==='x'?[j.sign,0,0]:[0,0,j.sign];
      points.push(p);axes.push(mv(r,axis));r=mm(r,rot(j.axis,j.sign*q[i]));frames.push(r);
    });
    return {points,axes,frames,tool:p,rotation:r};
  }
  function frame(pose,index){
    if(!Number.isInteger(index)||index<0||index>6)throw new Error('Frame index must be 0–6');
    return index===0?{origin:[0,0,0],rotation:identity()}:{origin:pose.points[index-1],rotation:pose.frames[index-1]};
  }
  function inFrame(point,reference){
    const delta=point.map((v,i)=>v-reference.origin[i]);
    return reference.rotation[0].map((_,i)=>reference.rotation.reduce((sum,row,j)=>sum+row[i]*delta[j],0));
  }
  const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  function solve3(a,b){
    const t=a.map((row,i)=>[...row,b[i]]);
    for(let k=0;k<3;k++){
      let pivot=k;for(let i=k+1;i<3;i++)if(Math.abs(t[i][k])>Math.abs(t[pivot][k]))pivot=i;
      [t[k],t[pivot]]=[t[pivot],t[k]];
      if(Math.abs(t[k][k])<1e-12)return null;
      const d=t[k][k];for(let j=k;j<4;j++)t[k][j]/=d;
      for(let i=0;i<3;i++)if(i!==k){const f=t[i][k];for(let j=k;j<4;j++)t[i][j]-=f*t[k][j];}
    }
    return t.map(row=>row[3]);
  }
  // Position-only IK: adjust J1–J3, preserve the J4–J6 angles, with no collision checking.
  function inverse(target,seed){
    if(!Array.isArray(target)||target.length!==3||!target.every(Number.isFinite)||!within(seed))return null;
    let q=[...seed];
    for(let n=0;n<240;n++){
      const p=pose(q).tool,error=target.map((v,i)=>v-p[i]);
      if(Math.hypot(...error)<.00015)return q;
      const jac=[0,1,2].map(i=>{const v=[...q];v[i]+=.00001;return pose(v).tool.map((x,k)=>(x-p[k])/.00001);});
      const matrix=jac.map((c,i)=>jac.map((d,j)=>c.reduce((sum,v,k)=>sum+v*d[k],0)+(i===j?.0002:0)));
      const rhs=jac.map(c=>c.reduce((sum,v,k)=>sum+v*error[k],0));
      const delta=solve3(matrix,rhs);if(!delta)return null;
      for(let i=0;i<3;i++)q[i]=clamp(q[i]+clamp(delta[i],-.12,.12),...ranges[i]);
    }
    return null;
  }
  return {rad,deg,add,scale,mv,mm,rot,rpy,at,identity,joints,ranges,home,clamp,within,pose,frame,inFrame,lerp,inverse};
})();
