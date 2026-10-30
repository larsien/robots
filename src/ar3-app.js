const robotInitial={q:[...AR3Model.home],commandQ:[...AR3Model.home],selected:0,frame:0,inside:false,grip:false,running:false,lesson:'joint',target:null,version:0,last:['initial'],previous:[...AR3Model.home]};
let robotFlashMessage=null;
function robotFlash(key,params={}){
  robotFlashMessage=[key,params];robotUI.flash(robotT(key,params));
}
function robotSelect(index){
  if(!Number.isInteger(index)||index<0||index>5)return;
  robotUI.st.selected=index;robotUI.st.last=['selected',{joint:index+1}];robotUI.render();
}
function robotMove(q,message){
  const st=robotUI.st;
  if(st.running){robotFlash('busy');return false;}
  if(!AR3Model.within(q)){robotFlash('invalid');return false;}
  const from=[...st.q],version=++st.version;st.previous=from;st.commandQ=[...q];st.running=true;st.last=message;
  const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?.06:2;let elapsed=0;
  robotUI.animate(dt=>{
    if(version!==st.version)return false;
    elapsed+=dt;const t=Math.min(1,elapsed/duration);st.q=AR3Model.lerp(from,q,ease(t));
    if(t===1){st.q=[...q];st.running=false;return false;}return true;
  });return true;
}
function robotJog(delta){
  const st=robotUI.st,i=st.selected,q=[...st.q],raw=q[i]+AR3Model.rad(delta);
  q[i]=AR3Model.clamp(raw,...AR3Model.ranges[i]);st.target=null;
  if(Math.abs(q[i]-st.q[i])<1e-8){robotFlash('boundary');return;}
  robotMove(q,['jog',{joint:i+1,delta:`${delta>0?'+':''}${delta}`,limited:q[i]!==raw}]);
}
function robotReset(){
  const st=robotUI.st;st.version++;st.running=false;st.q=[...AR3Model.home];st.commandQ=[...st.q];st.previous=[...st.q];st.selected=0;st.grip=false;st.target=null;
  st.last=['reset'];robotUI.render();
}
function robotCartesian(axis,delta){
  const st=robotUI.st;if(st.running)return robotFlash('busy');
  const target=[...AR3Model.pose(st.q).tool];target[axis]+=delta/1000;
  const solution=AR3Model.inverse(target,st.q);
  if(!solution){st.target=target;st.last=['noSolution'];robotFlash('noSolutionFlash');robotUI.render();return;}
  st.target=target;robotMove(solution,['cartMove',{axis:'XYZ'[axis],delta:`${delta>0?'+':''}${delta}`}]);
}
const robotLessonKeys={joint:'Joint',cartesian:'Cartesian',flow:'Flow'};
function robotLesson(lesson){
  if(!Object.hasOwn(robotLessonKeys,lesson))return;
  robotUI.st.lesson=lesson;if(lesson==='flow')robotUI.st.inside=true;
  robotUI.st.last=[`lesson${robotLessonKeys[lesson]}`];robotUI.render();
}
const robotUI=mountFigure({
  fig:'01',title:robotT('title'),hint:robotT('subtitle'),size:[91,79,67],palette:'cobalt',state:robotInitial,scene:robotScene,
  buttonsLabel:robotT('tryJoints'),
  buttons:[
    {label:robotT('chooseJoint'),choices:st=>robotTranslations[robotLanguage].jointNames.map((name,i)=>({label:`J${i+1} · ${name}`,current:st.selected===i,onCurrent:()=>robotFlash('already',{joint:i+1}),onClick:()=>robotSelect(i)}))},
    {label:'−10°',onClick:()=>robotJog(-10)},
    {label:'+10°',onClick:()=>robotJog(10)},
    {label:robotT('ready'),onClick:robotReset},
    {label:robotT('cabinet'),onClick:st=>{st.inside=!st.inside;st.last=[st.inside?'cabinetOpen':'cabinetClosed'];}}
  ],
  acts:{joint:(st,el)=>robotSelect(Number(el.dataset.joint))},
  params:(st,q)=>{
    const lesson=q.get('lesson');if(Object.hasOwn(robotLessonKeys,lesson))st.lesson=lesson;
    const selected=Number(q.get('joint'));if(Number.isInteger(selected)&&selected>=1&&selected<=6)st.selected=selected-1;
    if(q.has('q')){const values=q.get('q').split(',').map(Number).map(AR3Model.rad);if(AR3Model.within(values)){st.q=values;st.commandQ=[...values];}}
    if(q.get('inside')==='1'||st.lesson==='flow')st.inside=true;
  }
});
const robotStyle=document.createElement('style');robotStyle.textContent=`
:root{--muted:#696457;--rule:#d6d0c4;--accent:#76a0e2}body{padding:34px 32px 26px;font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR',sans-serif}
header,.stage,.controls,.made-with{max-width:1120px}header{display:block;align-items:flex-start;margin:0 0 24px}header h1{font-size:34px;line-height:1.3;letter-spacing:-1.2px;font-weight:750}header span{font-size:12px;letter-spacing:.04em;padding-top:9px}
.eyebrow{font:700 10px ui-monospace,monospace;letter-spacing:.2em;color:#696457;margin-bottom:12px}.sub{font-size:14px;color:#696457;line-height:1.7;margin:9px 0 0;max-width:650px}
.lab{width:100%;max-width:1120px;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:24px;align-items:start}.stage{min-width:0;margin-top:4px}#fig{max-width:none;width:100%;height:450px;margin:4px 0 0}.actions{position:static;flex-wrap:wrap;flex-direction:row;max-width:none;gap:7px;align-items:center;min-height:46px}.actions .cap{display:none}.act{font-size:12px;padding:7px 12px;background:#f7f3e9}.chips{left:0;min-width:min(290px,calc(100vw - 40px));top:calc(100% + 8px);max-width:290px}.toast{max-width:370px}.stats{display:none}
.tabs{width:100%;max-width:1120px;display:flex;gap:24px;border-bottom:1px solid var(--rule);margin:0 0 22px}.tabs button{border:0;border-radius:0;padding:12px 2px 13px;font-size:13px;color:var(--muted);border-bottom:3px solid transparent}.tabs button[aria-pressed=true]{border-bottom-color:var(--ink);color:var(--ink);font-weight:750}.tabs small{font:11px ui-monospace,monospace;margin-right:7px}
.panel{border-left:1px solid var(--rule);padding-left:24px}.panel h2{font-size:24px;letter-spacing:-.7px;margin:10px 0 3px}.panel .axis{font:700 11px ui-monospace,monospace;color:#536e90;letter-spacing:.08em}.panel p{font-size:12px;line-height:1.7;color:#696457}.joint-row{padding:10px 0;border-bottom:1px solid #e0d9ce}.joint-row.active{background:#e7e6dd;margin:0 -9px;padding-left:9px;padding-right:9px;border-radius:5px}.joint-row .rowhead{display:flex;align-items:center;justify-content:space-between;gap:10px}.joint-row label{font-size:12px;cursor:pointer}.joint-row label b{font-family:ui-monospace,monospace;margin-right:8px}.joint-row input[type=number]{width:69px;text-align:right;background:#fbf8f0;border:1px solid #b6b0a3;border-radius:4px;padding:5px 4px;font:12px ui-monospace,monospace;color:var(--ink)}.joint-row input[type=range]{margin-top:9px;height:14px;display:block}.joint-row .unit{font-size:11px;color:#696457;margin-left:3px}.joint-row input:disabled{opacity:.55}.gripper{font-size:11px;padding:7px 10px;margin:14px 0 4px}.status{width:100%;max-width:1120px;padding:12px 0;display:flex;gap:10px;align-items:baseline;border-top:1px solid var(--rule);margin-top:16px;font-size:12px;line-height:1.6;min-height:54px}.status b{font:10px ui-monospace,monospace;white-space:nowrap;color:#42745c}.status p{margin:0;color:#5c584c}
.coords{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:8px 0 10px;padding:13px 0;border-top:1px solid var(--rule)}.coords small{font:10px ui-monospace,monospace;display:block;color:#696457}.coords strong{font:600 18px ui-monospace,monospace;display:block;margin-top:5px}.coords em{font:10px ui-monospace,monospace;color:#696457}.coord-note{font-size:10px;color:#696457;line-height:1.6}
.learning{width:100%;max-width:1120px;display:grid;grid-template-columns:1fr 1fr;gap:36px;border-top:1px solid var(--rule);padding-top:22px;margin:16px 0 24px}.command-pane{margin-top:8px}.command-pane h3{font-size:13px;margin:0 0 8px}.learning{grid-template-columns:1fr}.learning h3{font-size:14px;margin:0 0 12px}.learning p{font-size:12px;line-height:1.85;color:#666052;margin:0 0 10px}.code{margin:0;background:#e8e4d9;border-radius:4px;padding:16px;font:11px/1.8 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere}.code strong{color:#a74731;background:#f4dac9;border-radius:2px;padding:1px 2px}.code-meta{overflow-wrap:anywhere;line-height:1.6;font-size:10px;color:#696457;margin-top:7px}.equation{font:13px ui-monospace,monospace;padding:9px 0;color:#365e85}.legend{font-size:11px;line-height:1.8;color:#696457}.badge{display:inline-block;border:1px solid #a9b9a5;color:#416b4e;padding:4px 8px;font:10px ui-monospace,monospace;letter-spacing:.05em;border-radius:4px;white-space:nowrap}
.cart-controls{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:14px 0}.cart-controls button{font-size:12px;border-radius:4px;padding:9px 4px}.flow-list{list-style:none;padding:0;counter-reset:flow}.flow-list li{counter-increment:flow;border-bottom:1px solid var(--rule);padding:10px 0;font-size:12px;line-height:1.8}.flow-list li:before{content:'0' counter(flow);font:10px ui-monospace,monospace;color:#7d7a6d;margin-right:10px}.flow-list small{display:block;color:#696457;font-size:10px;padding-left:24px}.flow-note{background:#e5e9dd;padding:12px;border-radius:5px}
.controls{grid-template-columns:1fr 1fr 1fr;font-size:11px;padding-top:14px}.controls .ctl label{font-size:10px}.controls button{font-size:10px}.sw{width:23px;height:23px}.made-with{margin-top:16px;font-size:9px}.sources{width:100%;max-width:1120px;font-size:10px;color:#736d61;line-height:1.8;border-top:1px solid var(--rule);padding-top:13px;margin-top:18px}.sources a{color:inherit;text-underline-offset:3px}.sources details{margin-top:8px}.sources summary{cursor:pointer}.source-links{display:flex;gap:14px;flex-wrap:wrap}.mobile-caption{font-size:11px;line-height:1.6;color:#696457;margin:0 0 8px}.visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}button:focus-visible,input:focus-visible,summary:focus-visible{outline:2px solid #375f8c;outline-offset:3px}button:disabled{opacity:.45;cursor:wait} .not-current{display:none!important}
.header-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px}.header-top .eyebrow{margin:0}.header-copy{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.languages{display:flex;gap:3px;padding:3px;border:1px solid var(--rule);border-radius:6px}.languages button{font-size:12px;line-height:1.5;padding:6px 10px;border:0;border-radius:3px;white-space:nowrap}.languages button[aria-pressed=true]{background:var(--ink);color:var(--paper,#f7f3e9);font-weight:700}.angle-input{white-space:nowrap;flex-shrink:0}.panel .axis{line-height:1.7}.tabs button{white-space:nowrap}.joint-row label{line-height:1.5}.toast{width:calc(100% - 24px)}
.frame-viewer{border-top:1px solid var(--rule);padding:14px 0;margin-top:10px}.frame-viewer h3{font-size:14px;margin:0 0 12px}.frame-viewer label,.frame-viewer select{font-size:12px}.frame-viewer select{padding:5px;background:#fbf8f0;color:var(--ink);border:1px solid #b6b0a3;border-radius:4px}.frame-viewer table{border-collapse:collapse;width:100%;font:11px ui-monospace,monospace;font-variant-numeric:tabular-nums}.frame-viewer caption{text-align:left;font:600 12px ui-sans-serif,sans-serif;padding:10px 0}.frame-viewer th,.frame-viewer td{padding:6px 3px;border-bottom:1px solid var(--rule);text-align:right}.frame-viewer th:first-child{text-align:left}.frame-viewer thead th{font:10px ui-sans-serif,sans-serif}.course-bar{width:100%;max-width:1120px;display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,340px);gap:24px;border-top:1px solid var(--rule);padding:18px 0 8px}.course-bar h2{font-size:17px;margin:0 0 7px;letter-spacing:-.4px}.course-bar a,.course-links a{font-size:12px;color:#365e85;text-underline-offset:3px}.course-bar p{font-size:11px;line-height:1.7;color:var(--muted);margin:7px 0}.course-choice{min-width:0}.course-choice label{display:block;font-size:11px;margin-bottom:7px}.course-choice select{width:100%;font:inherit;font-size:13px;background:#fbf8f0;color:var(--ink);border:1px solid #b6b0a3;border-radius:4px;padding:10px 6px}.course-choice select:focus-visible,a:focus-visible{outline:2px solid #375f8c;outline-offset:3px}#course-progress{font-size:11px;color:#416b4e;margin-top:8px}.lab{grid-template-columns:minmax(0,1fr) 360px}#course-study h2{font-size:23px;margin:5px 0 20px}#course-study h3{font-size:11px;letter-spacing:.03em;margin:22px 0 8px;color:#536e90}#course-study p{margin:8px 0 12px}#course-study ol{padding-left:20px;margin:8px 0 14px;font-size:12px;line-height:1.8}#course-study li+li{margin-top:6px}.course-links{display:flex;gap:8px 16px;flex-wrap:wrap}#course-prepare{font-size:12px;line-height:1.5;border-radius:4px;padding:9px 12px;background:#e5e9dd;text-align:left}#course-study .course-limit{font-size:10px;line-height:1.7;border-left:2px solid #b6b0a3;padding-left:10px;margin-top:14px}#course-study details{font-size:12px;line-height:1.8}.panel summary{cursor:pointer}.course-navigation{padding:18px 0;margin-bottom:18px;border-bottom:1px solid var(--rule)}.course-completion{display:flex;align-items:flex-start;gap:7px;font-size:12px;line-height:1.7}.course-completion input{margin:4px 0 0;accent-color:#416b4e;flex-shrink:0}.course-paging{display:flex;justify-content:space-between;gap:12px;margin:14px 0}.course-paging button{font-size:12px;padding:7px 14px}.course-paging button:disabled{cursor:default}#course-storage{font-size:10px;margin:0}#course-finished:empty{display:none}#practice-controls>summary{font-size:13px;font-weight:700;padding:12px;margin-bottom:14px;border:1px solid var(--rule);border-radius:5px;background:#e8e4d9;cursor:pointer}#practice-controls>summary span{float:right;font-size:12px;font-weight:500}#practice-controls .control-collapse{display:none}#practice-controls[open] .control-collapse{display:inline}#practice-controls[open] .control-expand{display:none}#practice-controls .coords{margin-top:16px}
#practice-controls,.course-details{width:100%;max-width:1120px}.telemetry,.course-details{grid-column:1 / -1;min-width:0}.course-details{border-left:0;border-top:1px solid var(--rule);padding:20px 0 0}
@media(min-width:800px){#fig{margin-top:10px}}@media(max-width:800px){body{padding:22px 16px}header h1{font-size:28px}.lab{grid-template-columns:1fr;gap:12px}.panel{border-left:0;border-top:1px solid var(--rule);padding:20px 0 0}.panel h2{font-size:21px}#fig{height:auto;min-height:260px}.joint-row{padding:9px 0}.learning{grid-template-columns:1fr;gap:22px}.tabs{gap:18px}.tabs button{font-size:12px}.tabs small{margin-right:4px}.controls{grid-template-columns:1fr 1fr}.status{align-items:flex-start}.actions{gap:5px}.act{font-size:11px;padding:6px 10px}.code{font-size:10px}header .badge{display:none}.mobile-caption{margin-top:4px}}
@media(max-width:400px){.tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.tabs button{white-space:normal;font-size:11px;line-height:1.5}.tabs small{display:block;margin:0 0 3px}}
@media(max-width:800px){.course-bar{grid-template-columns:1fr;gap:12px;padding-bottom:14px}.lab{grid-template-columns:minmax(0,1fr)}.panel{min-width:0}#course-study h2{margin-bottom:14px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;document.head.appendChild(robotStyle);
document.querySelector('header').innerHTML=`<div class="header-top"><div class="eyebrow" data-i18n="eyebrow"></div><div class="languages" role="group" data-i18n-aria="language">${[['en','English'],['ko','한국어'],['es','Español']].map(([lang,name])=>`<button type="button" data-lang="${lang}" lang="${lang}" aria-pressed="false">${name}</button>`).join('')}</div></div><div class="header-copy"><div><h1 data-i18n="heading"></h1><p class="sub" data-i18n="subtitle"></p></div><span class="badge" data-i18n="badge"></span></div>`;
const tabs=document.createElement('nav');tabs.className='tabs';tabs.dataset.i18nAria='topics';tabs.innerHTML=Object.entries(robotLessonKeys).map(([key,label],i)=>`<button data-lesson="${key}" aria-pressed="false"><small>0${i+1}</small><span data-i18n="tab${label}"></span></button>`).join('');document.querySelector('header').after(tabs);
const layout=document.createElement('main');layout.className='lab';layout.dataset.i18nAria='lab';tabs.after(layout);layout.append(document.querySelector('.stage'));
const panel=document.createElement('aside');panel.className='panel';layout.append(panel);
panel.innerHTML=`<section id="joint-panel"><div class="axis" id="joint-id"></div><h2 id="joint-title"></h2><p id="joint-explain"></p><div id="sliders"></div><button class="gripper" id="gripper" data-i18n="gripper"></button><p class="coord-note" data-i18n="gripperNote"></p></section>
<section id="cart-panel" class="not-current"><div class="axis" data-i18n="cartAxis"></div><h2 data-i18n="cartHeading"></h2><p data-i18n="cartIntro"></p><div class="cart-controls">${['X','Y','Z'].flatMap((name,i)=>[-20,20].map(v=>`<button data-axis="${i}" data-delta="${v}">${name} ${v>0?'+':''}${v} mm</button>`)).join('')}</div><p data-i18n="cartWrist"></p><p class="flow-note" data-i18n="cartPath"></p><div id="ik-changes" class="code"></div></section>
<section id="flow-panel" class="not-current"><div class="axis" data-i18n="flowAxis"></div><h2 data-i18n="flowHeading"></h2><ol class="flow-list">${[1,2,3,4,5].map(i=>`<li><span data-i18n="flow${i}"></span><small data-i18n="flow${i}Note"></small></li>`).join('')}</ol><p class="flow-note" data-i18n="flowNote"></p></section>
<div class="coords" data-i18n-aria="coords">${['X','Y','Z'].map((v,i)=>`<div><small>${v}</small><strong id="coord-${i}"></strong><em>mm</em></div>`).join('')}</div><div class="coord-note" data-i18n="coordNote"></div>`;
const sliders=document.getElementById('sliders');sliders.innerHTML=AR3Model.ranges.map((limits,i)=>{
  const [min,max]=limits.map(AR3Model.deg);
  return `<div class="joint-row" data-row="${i}"><div class="rowhead"><label for="joint-${i}"><b>J${i+1}</b><span class="joint-name"></span></label><span class="angle-input"><input id="number-${i}" type="number" step="0.1" min="${min}" max="${max}"><span class="unit">°</span></span></div><input id="joint-${i}" data-index="${i}" type="range" min="${min}" max="${max}" step="0.1"></div>`;
}).join('');
robotCourseMount(panel);
const status=document.createElement('div');status.className='status';status.innerHTML='<b id="connection"></b><p id="message" role="status" aria-live="polite"></p>';layout.after(status);
const learning=document.createElement('section');learning.className='learning';learning.innerHTML=`<div><h3 id="command-heading" data-i18n="commandHeading"></h3><pre id="command" class="code" data-i18n-aria="commandLabel"></pre><div class="code-meta" data-i18n="commandMeta"></div></div><div><h3 id="theory-title"></h3><div id="theory"></div></div>`;status.after(learning);
const sources=document.createElement('section');sources.className='sources';sources.innerHTML=`<div class="source-links"><a href="https://github.com/ongdexter/ar3_core/blob/cd43fed1cc67341dc8b1e0aaf8cea10e0e5634d8/ar3_description/urdf/ar3.urdf.xacro" target="_blank" rel="noopener" data-i18n="sourceJoints"></a><a href="https://github.com/ongdexter/ar3_core/blob/cd43fed1cc67341dc8b1e0aaf8cea10e0e5634d8/ar3_hardware_interface/config/controllers.yaml" target="_blank" rel="noopener" data-i18n="sourceCommands"></a><a href="https://anninrobotics.com/docs/are-the-ar4-encoders-closed-loop" target="_blank" rel="noopener" data-i18n="sourceEncoder"></a></div><details><summary data-i18n="limits"></summary><p data-i18n="modelNote"></p><p data-i18n="calibrationNote"></p><p data-i18n="ar4Note"></p></details>`;document.querySelector('.controls').after(sources);
document.querySelector('label[for="wb"]').dataset.i18n='wobble';
document.querySelector('#pals').parentElement.querySelector('label').dataset.i18n='color';
document.querySelector('#lblctl label').dataset.i18n='labels';
document.querySelector('.actions .cap').dataset.i18n='tryJoints';
document.querySelector('.made-with a').dataset.i18n='credit';
document.getElementById('fig').dataset.i18nAria='title';
const commandPane=learning.firstElementChild;commandPane.className='command-pane';document.querySelector('.stage').append(commandPane);
const coordinates=panel.querySelector('.coords'),coordinateNote=coordinates.nextElementSibling;
commandPane.before(coordinates,coordinateNote);
const frameViewer=document.createElement('section');frameViewer.className='frame-viewer';
frameViewer.innerHTML=`<h3 data-i18n="frameHeading"></h3><label for="frame-select" data-i18n="frameLabel"></label> <select id="frame-select">${Array.from({length:7},(_,i)=>`<option value="${i}">${i===0?'base_link':`link_${i}`}</option>`).join('')}</select><p class="coord-note" data-i18n="frameNote"></p><p class="coord-note" data-i18n="positionLegend"></p><table><caption data-i18n="positionHeading"></caption><thead><tr><th scope="col" data-i18n="positionAxis"></th><th scope="col" data-i18n="commanded"></th><th scope="col" data-i18n="measured"></th><th scope="col" data-i18n="positionError"></th></tr></thead><tbody id="position-rows"></tbody></table><p id="position-distance" class="coord-note"></p><p class="coord-note" data-i18n="measurementNote"></p>`;
coordinates.before(frameViewer);
document.getElementById('frame-select').addEventListener('change',event=>{robotUI.st.frame=Number(event.target.value);robotUI.render();});
const telemetry=document.createElement('section');telemetry.className='telemetry';
telemetry.append(frameViewer,coordinates,coordinateNote,commandPane);layout.append(telemetry);
const courseDetails=document.createElement('section');courseDetails.className='panel course-details';
courseDetails.append(document.getElementById('course-study'),panel.querySelector('.course-navigation'));layout.append(courseDetails);
const practice=document.getElementById('practice-controls');
panel.append(...Array.from(practice.children).filter(el=>el.tagName!=='SUMMARY'));
layout.before(practice);practice.append(tabs,layout,status,learning);practice.after(courseDetails);



function robotApplyLanguage(lang){
  if(!Object.hasOwn(robotTranslations,lang))return;
  robotLanguage=lang;
  try{localStorage.setItem('ar3-language',lang);}catch{}
  document.documentElement.lang=lang;document.title=robotT('title');
  document.querySelector('meta[name="description"]').content=robotT('description');
  document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===lang));
  document.querySelectorAll('[data-i18n]').forEach(el=>el.innerHTML=robotT(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',robotT(el.dataset.i18nAria)));
  const actions=document.querySelectorAll('.actions .act');
  actions[0].innerHTML=`${robotT('chooseJoint')}<span class="car">▾</span>`;
  actions[3].textContent=robotT('ready');actions[4].textContent=robotT('cabinet');
  document.querySelectorAll('.stepwrap.open').forEach(el=>el.classList.remove('open'));
  // Rebuild the picker in the new language the next time it opens.
  document.querySelectorAll('.chips').forEach(el=>el.replaceChildren());
  const copy=robotTranslations[lang];
  for(let i=0;i<6;i++){
    document.querySelector(`[data-row="${i}"] .joint-name`).textContent=copy.jointNames[i];
    document.getElementById(`joint-${i}`).setAttribute('aria-label',`J${i+1} ${copy.jointNames[i]}`);
    document.getElementById(`number-${i}`).setAttribute('aria-label',robotT('targetAngle',{joint:i+1}));
  }
  document.querySelectorAll('.sw').forEach((b,i)=>{b.title=copy.colors[i];b.setAttribute('aria-label',robotT('colorLabel',{color:copy.colors[i]}));});
  if(robotUI._flash&&robotFlashMessage){
    const text=robotT(...robotFlashMessage);document.getElementById('toast').textContent=text;document.getElementById('readout').textContent=text;
  }
  robotCourseRender();window.robotHardware?.render();robotUI.render();
}
const baseRender=robotUI.render;
let robotDefaultBox=null;
function robotUpdate(){
  const st=robotUI.st,i=st.selected,pose=AR3Model.pose(st.q),copy=robotTranslations[robotLanguage];
  document.querySelectorAll('[data-lesson]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lesson===st.lesson));
  ['joint','cart','flow'].forEach(key=>document.getElementById(`${key}-panel`).classList.toggle('not-current',st.lesson!==(key==='cart'?'cartesian':key)));
  document.getElementById('joint-id').textContent=robotT('jointId',{joint:i+1});
  document.getElementById('joint-title').textContent=copy.jointNames[i];document.getElementById('joint-explain').textContent=copy.jointExplanations[i];
  for(let j=0;j<6;j++){
    const degrees=AR3Model.deg(st.q[j]);const range=document.getElementById(`joint-${j}`),number=document.getElementById(`number-${j}`);
    range.value=degrees;range.disabled=st.running;number.disabled=st.running;
    if(document.activeElement!==number)number.value=degrees.toFixed(1);
    document.querySelector(`[data-row="${j}"]`).classList.toggle('active',i===j);
  }
  pose.tool.forEach((v,j)=>document.getElementById(`coord-${j}`).textContent=(v*1000).toFixed(1));
  const hardware=window.robotHardware?.sample();
  const actualQ=hardware?hardware.q:st.q,actualPose=actualQ?AR3Model.pose(actualQ):null;
  const reference=AR3Model.frame(actualPose||pose,st.frame),goal=AR3Model.pose(st.commandQ);
  const measured=actualPose?AR3Model.inFrame(actualPose.tool,reference):[null,null,null],commanded=AR3Model.inFrame(goal.tool,reference);
  const rows=[...measured.map((v,j)=>['XYZ'[j]+' (mm)',commanded[j]*1000,v===null?null:v*1000]),...st.q.map((_,j)=>['J'+(j+1)+' (°)',AR3Model.deg(st.commandQ[j]),actualQ?AR3Model.deg(actualQ[j]):null])];
  const fixed=v=>(Math.abs(v)<.05?0:v).toFixed(1);
  document.getElementById('position-rows').innerHTML=rows.map(([name,cmd,value])=>`<tr><th scope="row">${name}</th><td>${fixed(cmd)}</td><td>${value===null?'—':fixed(value)}</td><td>${value===null?'—':fixed(cmd-value)}</td></tr>`).join('');
  document.getElementById('position-distance').textContent=robotT('distanceError')+': '+(actualPose?fixed(Math.hypot(...goal.tool.map((v,j)=>(v-actualPose.tool[j])*1000))):'—')+' mm';
  document.querySelector('[data-i18n="measurementNote"]').textContent=hardware?robotT(actualQ?'usbMeasurement':'usbNoMeasurement',{age:hardware.age}):robotT('measurementNote');
  document.querySelector('[data-i18n="measured"]').textContent=robotT(hardware?'usbMeasured':'measured');

  document.getElementById('connection').textContent=robotT(hardware?(actualQ?'usbConnected':'usbNoMeasurement'):st.running?'moving':'local');
  const message=robotT(...st.last)+(st.last[0]==='jog'&&st.last[1].limited?' '+robotT('jogLimit'):'');
  const messageEl=document.getElementById('message');if(messageEl.textContent!==message)messageEl.textContent=message;
  const names=st.q.map((_,j)=>`joint_${j+1}`).join(', ');
  document.getElementById('command').innerHTML=`joint_names:\n  [${names}]\npositions (rad):\n  [${st.commandQ.map((v,j)=>(st.lesson==='cartesian'?Math.abs(v-st.previous[j])>AR3Model.rad(.05):j===i)?`<strong>${v.toFixed(4)}</strong>`:v.toFixed(4)).join(', ')}]\ntime_from_start: 2.0 s`;
  const theoryKey=`theory${robotLessonKeys[st.lesson]}`;
  document.getElementById('theory-title').textContent=robotT(theoryKey+'Title');
  document.getElementById('theory').innerHTML=robotT(theoryKey,{joint:i+1,degrees:AR3Model.deg(st.commandQ[i]).toFixed(1),radians:st.commandQ[i].toFixed(4)});
  document.getElementById('lbl').textContent=robotT(document.documentElement.classList.contains('nolabels')?'off':'on');
  document.getElementById('ik-changes').textContent=st.q.slice(0,3).map((v,j)=>`J${j+1}  ${AR3Model.deg(v).toFixed(1)}°  (${AR3Model.deg(v-st.previous[j])>=0?'+':''}${AR3Model.deg(v-st.previous[j]).toFixed(1)}°)`).join('\n');
}
robotUI.render=()=>{
  baseRender();
  const b=document.getElementById('art').getBBox();
  if(!robotDefaultBox)robotDefaultBox={x:b.x,y:b.y,right:b.x+b.width,bottom:b.y+b.height};
  const x=Math.min(robotDefaultBox.x,b.x)-8,y=Math.min(robotDefaultBox.y,b.y)-8;
  const right=Math.max(robotDefaultBox.right,b.x+b.width)+8,bottom=Math.max(robotDefaultBox.bottom,b.y+b.height)+8;
  document.getElementById('fig').setAttribute('viewBox',`${x} ${y} ${right-x} ${bottom-y}`);
  robotUpdate();
};
for(let i=0;i<6;i++){
  const range=document.getElementById(`joint-${i}`),number=document.getElementById(`number-${i}`);
  range.addEventListener('pointerdown',()=>robotSelect(i));
  range.addEventListener('input',()=>{
    const st=robotUI.st;if(st.running)return;st.selected=i;st.previous=[...st.q];st.q[i]=AR3Model.clamp(AR3Model.rad(Number(range.value)),...AR3Model.ranges[i]);st.commandQ=[...st.q];st.target=null;st.last=['slider',{joint:i+1}];robotUI.render();
  });
  number.addEventListener('change',()=>{
    const value=number.valueAsNumber;
    if(!Number.isFinite(value)||value<AR3Model.deg(AR3Model.ranges[i][0])||value>AR3Model.deg(AR3Model.ranges[i][1])){
      number.value=AR3Model.deg(robotUI.st.q[i]).toFixed(1);robotFlash('numberInvalid');return;
    }
    robotSelect(i);const q=[...robotUI.st.q];q[i]=AR3Model.rad(value);robotUI.st.target=null;robotMove(q,['numberGoal',{joint:i+1,angle:value.toFixed(1)}]);
  });
}
tabs.addEventListener('click',event=>{const b=event.target.closest('[data-lesson]');if(b)robotLesson(b.dataset.lesson);});
panel.addEventListener('click',event=>{const b=event.target.closest('[data-axis]');if(b)robotCartesian(Number(b.dataset.axis),Number(b.dataset.delta));});
document.getElementById('gripper').onclick=()=>{robotUI.st.grip=!robotUI.st.grip;robotUI.st.last=[robotUI.st.grip?'gripperClosed':'gripperOpen'];robotUI.render();};
document.querySelector('.languages').addEventListener('click',event=>{const b=event.target.closest('[data-lang]');if(b)robotApplyLanguage(b.dataset.lang);});
document.getElementById('lbl').addEventListener('click',robotUpdate);
robotApplyLanguage(robotLanguage);
window.robotApp={ui:robotUI,jog:robotJog,select:robotSelect,reset:robotReset,cartesian:robotCartesian,lesson:robotLesson};
