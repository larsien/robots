const robotHardware=(()=>{
  const section=document.createElement('section');section.className='hardware frame-viewer';
  section.innerHTML=`<h3 data-i18n="usbTitle"></h3><p data-i18n="usbIntro"></p><p id="usb-support" data-i18n="usbUnsupported" hidden></p>
    <button id="usb-connect" data-i18n="usbConnect"></button> <button id="usb-disconnect" data-i18n="usbDisconnect" disabled></button>
    <p id="usb-status" role="status" aria-live="polite"></p>
    <p id="usb-health" role="status" aria-live="polite"></p>
    <div class="usb-log-head"><h4 data-i18n="usbLogTitle"></h4><button id="usb-log-clear" data-i18n="usbLogClear"></button></div>
    <pre id="usb-log" role="log" aria-live="off" tabindex="0"></pre>
    <details><summary data-i18n="usbSetup"></summary><p data-i18n="usbSetupNote"></p>
    <div class="usb-table"><table><thead><tr><th>Joint</th><th data-i18n="usbRaw"></th><th data-i18n="usbReference"></th><th data-i18n="usbScale"></th><th data-i18n="usbDirection"></th></tr></thead><tbody>${AR3Model.home.map((v,i)=>`<tr><th scope="row">J${i+1}</th><td id="usb-raw-${i}">—</td><td><input id="usb-ref-${i}" aria-label="J${i+1} reference °" type="number" step="0.1"></td><td><input id="usb-scale-${i}" aria-label="J${i+1} signed step/°" type="number" step="any"></td><td><select id="usb-dir-${i}" aria-label="J${i+1} +count bit"><option value="">—</option><option>0</option><option>1</option></select></td></tr>`).join('')}</tbody></table></div>
    <label class="usb-check"><input id="usb-match" type="checkbox"><span data-i18n="usbMatch"></span></label>
    <button id="usb-calibrate" data-i18n="usbCalibrate" disabled></button><p data-i18n="usbEstimate"></p></details>
    <label class="usb-check"><input id="usb-arm" type="checkbox" disabled><span data-i18n="usbArm"></span></label>
    <button id="usb-move" data-i18n="usbMove" disabled></button> <button id="usb-lock" data-i18n="usbLock"></button><p data-i18n="usbSafety"></p>`;
  document.querySelector('.telemetry').prepend(section);
  const style=document.createElement('style');style.textContent='.hardware{margin-bottom:22px}.hardware p{font-size:12px;line-height:1.8;color:var(--muted);max-width:850px}.hardware button{font-size:12px;margin:4px 0;padding:8px 12px}.usb-check{display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:1.8;margin:12px 0}.usb-check input{margin-top:5px;flex-shrink:0}.usb-table{overflow-x:auto}.hardware input[type=number]{width:85px;padding:6px;border:1px solid var(--rule);border-radius:4px;background:#fbf8f0;color:var(--ink)}.hardware select{padding:6px}.hardware details{margin:14px 0}.hardware summary{cursor:pointer;font-size:13px}.hardware #usb-status{font-weight:650}';document.head.append(style);
  const el=id=>document.getElementById('usb-'+id);
  const logStyle=document.createElement('style');logStyle.textContent='.usb-log-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.usb-log-head h4{font-size:12px;margin:8px 0}#usb-log{box-sizing:border-box;max-width:100%;height:190px;overflow:auto;padding:12px;border:1px solid var(--rule);border-radius:4px;background:#e8e4d9;font:11px/1.7 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere}#usb-health{font-weight:650}';document.head.append(logStyle);
  let raw=null,received=0,cal=null,busy=false,active=false,status='usbOffline',phase='usbLogIdle',lastReply=null;
  const logKeys={choosing:'usbLogChoosing',opening:'usbLogOpening',open:'usbLogOpen',tx:'usbLogTx',rx:'usbLogRx',verified:'usbLogVerified',error:'usbLogError',closed:'usbLogClosed'};
  function log(type,detail=''){
    const key=logKeys[type];
    if(!key)return;
    if(!['tx','rx'].includes(type)&&!(type==='closed'&&phase==='usbLogError'))phase=key;
    if(type==='verified')lastReply=new Date().toLocaleTimeString();
    if(type==='choosing')lastReply=null;
    const box=el('log'),atBottom=box.scrollTop+box.clientHeight>=box.scrollHeight-12;
    const row=document.createElement('div');
    row.textContent=`[${new Date().toLocaleTimeString()}] ${robotT(key)}${detail?' · '+JSON.stringify(String(detail).slice(0,2048)):''}`;
    box.append(row);while(box.childElementCount>100)box.firstElementChild.remove();
    if(atBottom)box.scrollTop=box.scrollHeight;
    el('health').textContent=robotT(phase)+(lastReply?' · '+robotT('usbLogLast')+' '+lastReply:'');
  }
  const supported=Boolean(navigator.serial&&window.isSecureContext);
  const connection=new AR3Serial.Connection(navigator.serial,error=>{
    status=error.message==='protocol'?'usbProtocol':error.message==='timeout'?'usbTimeout':'usbDisconnected';
    raw=null;cal=null;el('arm').checked=false;render();
  },log);
  function fresh(){return raw&&!connection.fault&&Date.now()-received<3000;}
  function sample(){
    if(!active)return null;
    const q=fresh()&&cal?AR3Serial.angles(raw,cal):null;
    return {q:q&&AR3Model.within(q)?q:null,age:((Date.now()-received)/1000).toFixed(1)};
  }
  function render(){
    section.querySelectorAll('[data-i18n]').forEach(node=>node.textContent=robotT(node.dataset.i18n));
    el('support').hidden=supported;
    el('connect').disabled=!supported||busy||Boolean(connection.port);
    el('disconnect').disabled=!connection.port||busy;
    el('status').textContent=robotT(busy?'usbBusy':status);
    el('health').textContent=robotT(phase)+(lastReply?' · '+robotT('usbLogLast')+' '+lastReply:'');
    el('log').setAttribute('aria-label',robotT('usbLogTitle'));
    el('calibrate').disabled=!fresh()||busy||!el('match').checked;
    el('arm').disabled=!fresh()||!cal||busy||connection.fault;
    el('move').disabled=!fresh()||!cal||!el('arm').checked||busy||robotUI.st.running;
    section.querySelectorAll('input[type=number],select,#usb-match').forEach(node=>node.disabled=busy);
    for(let i=0;i<6;i++)el('raw-'+i).textContent=raw?raw[i]:'—';
  }
  function accept(value){raw=value;received=Date.now();}
  function report(error){
    const keys={protocol:'usbProtocol',timeout:'usbTimeout',disconnected:'usbDisconnected',settings:'usbSettings',atTarget:'usbAtTarget',deviation:'usbDeviation'};
    status=keys[error.message]||'usbError';el('arm').checked=false;
    if(!connection.fault)log('error',`${error.name}: ${error.message}`);
  }
  async function run(action){
    if(busy)return;
    busy=true;render();
    try{await action();}catch(error){report(error);}finally{busy=false;render();robotUI.render();}
  }
  el('connect').onclick=()=>run(async()=>{
    raw=null;cal=null;el('arm').checked=false;el('match').checked=false;
    accept(await connection.connect());active=true;status='usbUncalibrated';
  });
  el('disconnect').onclick=()=>run(async()=>{
    await connection.close();active=false;raw=null;cal=null;status='usbOffline';el('arm').checked=false;el('match').checked=false;
  });
  el('match').onchange=render;
  el('log-clear').onclick=()=>el('log').replaceChildren();
  section.querySelectorAll('input[type=number],select').forEach(node=>node.onchange=()=>{
    cal=null;el('arm').checked=false;el('match').checked=false;status=connection.port?'usbUncalibrated':'usbOffline';render();robotUI.render();
  });
  el('calibrate').onclick=()=>run(async()=>{
    if(!el('match').checked)throw new Error('settings');
    const q=Array.from({length:6},(_,i)=>AR3Model.rad(el('ref-'+i).valueAsNumber));
    const scale=Array.from({length:6},(_,i)=>el('scale-'+i).valueAsNumber);
    const directions=Array.from({length:6},(_,i)=>el('dir-'+i).value);
    AR3Serial.validateScale(scale);
    if(!AR3Model.within(q)||directions.some(v=>v===''))throw new Error('settings');
    accept(await connection.query());cal={q,raw:[...raw],scale,directions:directions.map(Number)};
    el('arm').checked=false;status='usbCalibrated';
  });
  el('arm').onchange=render;
  el('lock').onclick=()=>{el('arm').checked=false;render();};
  el('move').onclick=()=>{
    if(!fresh()||!cal||!el('arm').checked||busy||robotUI.st.running)return;
    const target=[...robotUI.st.commandQ],joint=robotUI.st.selected;
    run(async()=>{
      accept(await connection.query());
      if(!el('arm').checked||!cal)return;
      const plan=AR3Serial.plan(raw,cal,target,joint,cal.directions);
      accept(await connection.request(plan.command));
      const actual=AR3Serial.angles(raw,cal);
      if(!AR3Model.within(actual)||actual.some((v,i)=>Math.abs(AR3Model.deg(v-plan.q[i]))>.5))throw new Error('deviation');
      status='usbConnected';
    });
  };
  // shortcut: legacy firmware blocks feedback during MJ; small moves and the
  // physical E-stop are required until an interruptible firmware is supported.
  setInterval(()=>{
    if(connection.port&&!connection.fault&&!busy)run(async()=>{accept(await connection.query());});
    else{render();if(active)robotUI.render();}
  },1000);
  const hardware={sample,render};window.robotHardware=hardware;
  render();robotUI.render();return hardware;
})();
