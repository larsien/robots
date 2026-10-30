const robotMetal={l:'#e5e7e3',m:'#b9c2c1',d:'#747e81'};
const robotRubber={l:'#535957',m:'#343b3b',d:'#262c2c'};
const robotBoard={l:'#e6dfd0',m:'#d3c5b0',d:'#a8987d'};
const robotMint={l:'#97c7aa',m:'#75a78d',d:'#416651'};
function robotBox(p,r,a,b,m){
  const v=(x,y,z)=>AR3Model.at(p,r,[x,y,z]);
  const [x,y,z]=a,[X,Y,Z]=b;
  const faces=[
    [[1,0,0],[v(X,y,z),v(X,Y,z),v(X,Y,Z),v(X,y,Z)]],
    [[-1,0,0],[v(x,y,z),v(x,Y,z),v(x,Y,Z),v(x,y,Z)]],
    [[0,1,0],[v(x,Y,z),v(X,Y,z),v(X,Y,Z),v(x,Y,Z)]],
    [[0,-1,0],[v(x,y,z),v(X,y,z),v(X,y,Z),v(x,y,Z)]],
    [[0,0,1],[v(x,y,Z),v(X,y,Z),v(X,Y,Z),v(x,Y,Z)]],
    [[0,0,-1],[v(x,y,z),v(X,y,z),v(X,Y,z),v(x,Y,z)]]
  ];
  return faces.filter(([n])=>vis(AR3Model.mv(r,n))).map(([n,pts])=>shape(pts,tone(AR3Model.mv(r,n),m),.8)).join('')+
    hullInk([v(x,y,z),v(X,y,z),v(x,Y,z),v(X,Y,z),v(x,y,Z),v(X,y,Z),v(x,Y,Z),v(X,Y,Z)],2);
}
function robotJoint(p,axis,radius,m,index,st){
  const start=AR3Model.add(p,AR3Model.scale(axis,-3.5)),end=AR3Model.add(p,AR3Model.scale(axis,3.5));
  const visible=dot(axis,[1,1,1])>=0?end:start;
  const offset=dot(axis,[1,1,1])>=0?.4:-.4;
  const cap=AR3Model.add(visible,AR3Model.scale(axis,offset));
  let out=rod(start,end,radius,m,tone,1.5);
  out+=rod(visible,cap,radius*.68,robotMetal,toneI,1.1);
  out+=rod(cap,AR3Model.add(cap,AR3Model.scale(axis,offset*.5)),radius*.20,robotRubber,toneI,.7);
  return act('joint',out,`data-joint="${index}"`);
}
function robotArc(p,axis,radius){
  const u=norm(cross(axis,Math.abs(axis[2])>.9?[1,0,0]:[0,0,1])),v=cross(axis,u);
  const pts=Array.from({length:25},(_,i)=>{const a=(-35+i*270/24)*Math.PI/180;return AR3Model.add(p,AR3Model.add(AR3Model.scale(u,Math.cos(a)*radius),AR3Model.scale(v,Math.sin(a)*radius)));});
  const tip=pts.at(-1),prev=pts.at(-2),dir=norm(sub(tip,prev));
  return `<path d="${pd(pts,false)}" fill="none" stroke="#bc4e36" stroke-width="2" stroke-dasharray="4 2"/>`+
    shape([tip,AR3Model.add(tip,AR3Model.add(AR3Model.scale(dir,-3),AR3Model.scale(axis,1.4))),AR3Model.add(tip,AR3Model.add(AR3Model.scale(dir,-3),AR3Model.scale(axis,-1.4)))],'#bc4e36',0);
}
function robotCable(pts){
  const d=pd(pts,false);
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#737b77" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
}
const robotViewRotation=AR3Model.rot('z',Math.PI);
const robotWorld=p=>AR3Model.add([22,34,7],AR3Model.scale(AR3Model.mv(robotViewRotation,p),100));
const robotVector=v=>AR3Model.mv(robotViewRotation,v);
function robotFrame(a,b){
  const x=norm(sub(b,a)),y=norm(cross(Math.abs(x[2])>.95?[0,1,0]:[0,0,1],x)),z=cross(x,y);
  return [[x[0],y[0],z[0]],[x[1],y[1],z[1]],[x[2],y[2],z[2]]];
}
function robotScene(st,m){
  const pose=AR3Model.pose(window.robotHardware?.sample()?.q||st.q),pts=pose.points.map(robotWorld),axes=pose.axes.map(robotVector),toolFrame=AR3Model.mm(robotViewRotation,pose.rotation);
  const [base,shoulder,elbow,roll,wrist,flange]=pts,upper=robotFrame(shoulder,elbow),fore=robotFrame(roll,wrist);
  const upperLen=Math.hypot(...sub(elbow,shoulder)),foreLen=Math.hypot(...sub(wrist,roll));
  let out=board(3,4,91,79,3,3,robotBoard);
  const clip=boardTop(3,4,91,79,3,3);
  for(const [a,b,r] of [[base,shoulder,6],[shoulder,elbow,4],[roll,wrist,3]]){
    out+=castShadow([a,b].flatMap(p=>[-1,1].flatMap(x=>[-1,1].map(y=>[p[0]+x*r,p[1]+y*r,p[2]]))),3,clip);
  }
  out+=castShadow([[4,57,3],[24,74,3],[4,57,17],[24,74,17]],3,clip);
  out+=robotCable([[24,63,7],[28,58,4],[17,49,4],[18,39,8],[22,34,10]]);
  // A separate illustration of the motor drive belongs in AR3's external enclosure.
  const control=()=>{
    let s=box(4,57,3,24,74,17,robotMetal,toneI,1.4);
    if(st.inside){
      s+=shape(on(PX(24.2),rectUV(59,5,72,15)),robotRubber.m,1);
      s+=box(24.4,67,6,25.5,71,14,robotMint,toneI,.8);
      for(let i=0;i<6;i++)s+=box(24.4,59+(i%3)*2,6+Math.floor(i/3)*4.5,25.8,60.4+(i%3)*2,9.3+Math.floor(i/3)*4.5,DARK,toneI,.6);
      s+=txY(14,74.2,9,'TEENSY 3.5',2.5);
    }else{
      s+=shape(on(PX(24.2),rrUV(60,8,71,14,1)),m.l,1);
      s+=tx(24.3,65.5,10,'AR3 CTRL',2.2);
      for(let k=0;k<4;k++)s+=line([[8+k*3,74.2,6],[8+k*3,74.2,13]],.8);
    }
    return s+cyl(9,63,17,18.2,2,matOf('#d75c44'),toneI,.8)+txY(14,74.2,4.3,robotT('external'),1.8);
  };
  const parts=[{at:[14,66,10],svg:control()},{at:[22,34,5],svg:box(11,23,3,33,45,7,robotMetal,toneI,1.3)},
    {at:[22,34,10],svg:cyl(22,34,7,12,7.5,m,tone,1.8)},
    {at:avg([base,shoulder]),svg:rod(base,shoulder,5.4,m,tone,1.7)},
    {at:avg([shoulder,elbow]),svg:robotBox(shoulder,upper,[0,-3.2,-2.4],[upperLen,3.2,2.4],robotMetal)+
      robotBox(shoulder,upper,[3,-3.8,-2],[upperLen-3,-3.2,2],m)},
    {at:avg([roll,wrist]),svg:rod(roll,wrist,2.6,robotMetal,toneI,1.5)}];
  // Pulleys and belt on the upper arm (schematic L-series transmission).
  const bp=v=>AR3Model.at(shoulder,upper,v);
  parts.push({at:bp([upperLen/2,3.6,0]),svg:ink(pd([bp([2,3.6,1.7]),bp([upperLen-2,3.6,1.7]),bp([upperLen-2,3.6,-1.7]),bp([2,3.6,-1.7])]),1.3)});
  for(let j=1;j<6;j++){
    const p=pts[j],axis=axes[j];
    if(j===1||j===2){
      const end=AR3Model.add(p,AR3Model.scale(axis,-8));
      parts.push({at:AR3Model.add(p,AR3Model.scale(axis,-5.5)),svg:rod(AR3Model.add(p,AR3Model.scale(axis,-3)),end,3,robotRubber,toneI,1.1)+rod(end,AR3Model.add(end,AR3Model.scale(axis,-1)),2.3,robotMint,toneI,.9)});
    }
    // J3 and J4 share a compact elbow assembly; a short sleeve keeps both axes readable.
    const jointPoint=j===3?AR3Model.add(p,AR3Model.scale(norm(sub(wrist,p)),4)):p;
    parts.push({at:jointPoint,svg:robotJoint(jointPoint,axis,j<3?4.6:j===3?3.5:2.7,m,j,st)});
  }
  parts.push({at:flange,svg:rod(wrist,flange,2.4,robotMetal,toneI,1.1)});
  const palm=AR3Model.at(flange,toolFrame,[0,0,4]);
  parts.push({at:palm,svg:robotBox(flange,toolFrame,[-4,-2.3,1],[4,2.3,5],robotRubber)});
  const opening=st.grip?2:4.8;
  for(const sign of [-1,1])parts.push({at:AR3Model.at(flange,toolFrame,[sign*opening,0,7]),svg:robotBox(flange,toolFrame,[sign*opening-.55,-1.2,4],[sign*opening+.55,1.2,10],robotMetal)});
  out+=byDepth(parts);
  if(st.target){
    const t=robotWorld(st.target);out+=line([flange,t],.7);
    const [x,y]=P(...t);out+=`<circle cx="${x}" cy="${y}" r="${4*INK_K}" fill="none" stroke="#bf533a" stroke-width="1.5" stroke-dasharray="2 2"/>`;
  }
  const drawFrame=(origin,rotation,dashed)=>{
    let svg='';
    for(const [i,color,label] of [[0,'#bf533a','X'],[1,'#3c8567','Y'],[2,'#5079b0','Z']]){
      const tip=robotWorld(AR3Model.at(origin,rotation,[0,0,0].map((_,j)=>j===i?.12:0))),q=P(...tip);
      svg+=`<path d="${pd([robotWorld(origin),tip],false)}" fill="none" stroke="${color}" stroke-width="2" ${dashed?'stroke-dasharray="4 3"':''}/><text x="${q[0]}" y="${q[1]-2}" fill="${color}" font-size="${10*INK_K}" font-weight="800">${label}${dashed?'*':''}</text>`;
    }
    return svg;
  };
  const reference=AR3Model.frame(pose,st.frame??0),goal=AR3Model.pose(st.commandQ),goalPoint=robotWorld(goal.tool),screenGoal=P(...goalPoint);
  out+=`<g class="coordinate-frames">${drawFrame(reference.origin,reference.rotation,false)}${drawFrame(goal.tool,goal.rotation,true)}<path d="${pd([flange,goalPoint],false)}" fill="none" stroke="#805193" stroke-width="1.5" stroke-dasharray="3 2"/><circle cx="${screenGoal[0]}" cy="${screenGoal[1]}" r="${4*INK_K}" fill="none" stroke="#805193" stroke-width="1.5"/></g>`;
  if(st.selected>=0&&st.lesson!=='cartesian')out+=robotArc(pts[st.selected],axes[st.selected],st.selected<3?9:6);
  const offsets=[[-30,78],[-105,-8],[-50,-55],[45,-45],[78,-12],[90,33]];
  for(let i=0;i<6;i++)out+=act('joint',tag(pts[i],...offsets[i],robotTranslations[robotLanguage].jointTags[i],st.lesson==='cartesian'?Math.abs(st.commandQ[i]-st.previous[i])>AR3Model.rad(.05):st.selected===i),`data-joint="${i}"`);
  return out;
}
