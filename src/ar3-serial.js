/* Legacy Annin AR3/ARCS Teensy 3.5 protocol (115200 baud).
   Reference: kentavv/annin_robotics_ar3, e1485f08, ARCS_teensy_sketch.ino.
   No LM/LL commands: reference calibration never changes firmware encoder counts. */
const AR3Serial = (() => {
  // GP/MJ normally snap encoders to the supplied targets on success. Deliberately
  // unreachable targets preserve raw feedback; their mismatch flags are expected.
  const sentinel='U-1000000V-1000000W-1000000X-1000000Y-1000000Z-1000000';
  function parse(line){
    const match=/^01[01]{6}A(-?\d+)B(-?\d+)C(-?\d+)D(-?\d+)E(-?\d+)F(-?\d+)$/.exec(line.trim());
    if(!match)throw new Error('protocol');
    const raw=match.slice(1).map(Number);
    if(raw.some(v=>!Number.isSafeInteger(v)||Math.abs(v)>20000))throw new Error('protocol');
    return raw;
  }
  function validateScale(scale){
    if(scale.length!==6||scale.some(v=>!Number.isFinite(v)||Math.abs(v)<1||Math.abs(v)>200))throw new Error('settings');
  }
  function angles(raw,cal){
    return raw.map((v,i)=>cal.q[i]+AR3Model.rad((v-cal.raw[i])/cal.scale[i]));
  }
  function plan(raw,cal,target,joint,directions){
    validateScale(cal.scale);
    const current=angles(raw,cal);
    if(!AR3Model.within(current)||!AR3Model.within(target)||!Number.isInteger(joint)||joint<0||joint>5||directions.length!==6||directions.some(v=>v!==0&&v!==1))throw new Error('settings');
    const delta=AR3Model.clamp(AR3Model.deg(target[joint]-current[joint]),-1,1);
    const steps=Math.trunc(Math.abs(delta*cal.scale[joint]));
    if(!steps)throw new Error('atTarget');
    const increase=delta*cal.scale[joint]>0,bit=increase?directions[joint]:1-directions[joint];
    const expected=[...raw];expected[joint]+=(increase?1:-1)*steps;
    const q=angles(expected,cal);
    if(!AR3Model.within(q))throw new Error('settings');
    const axes=raw.map((_,i)=>`${'ABCDEF'[i]}${i===joint?bit:0}${i===joint?steps:0}`).join('');
    return {command:`MJ${axes}T00S5G10H10I10K10${sentinel}\n`,q};
  }
  class Connection{
    constructor(serial,onChange=()=>{},onLog=()=>{}){this.serial=serial;this.onChange=onChange;this.onLog=onLog;this.port=null;this.pending=null;this.reader=null;this.buffer='';this.fault=false;}
    async connect(){
      if(this.port)throw new Error('busy');
      this.onLog('choosing');
      const port=await this.serial.requestPort();
      const info=port.getInfo?.()||{};
      this.onLog('opening',JSON.stringify(info));
      await port.open({baudRate:115200});this.port=port;this.fault=false;
      this.onLog('open','115200 baud');
      this.reader=port.readable.getReader();this.reading=this.readLoop();
      try{return await this.query();}catch(error){await this.close();throw error;}
    }
    async readLoop(){
      const decoder=new TextDecoder();
      try{
        while(this.port){
          const {value,done}=await this.reader.read();if(done)break;
          const chunk=decoder.decode(value,{stream:true});
          this.onLog('rx',chunk);this.buffer+=chunk;
          if(this.buffer.length>4096)throw new Error('protocol');
          let end;
          while((end=this.buffer.indexOf('\n'))>=0){
            const line=this.buffer.slice(0,end).trim();this.buffer=this.buffer.slice(end+1);
            if(!line)continue;
            if(!this.pending)throw new Error('protocol');
            const raw=parse(line),pending=this.pending;this.pending=null;clearTimeout(pending.timer);
            this.onLog('verified',raw.join(', '));pending.resolve(raw);
          }
        }
      }catch(error){this.fail(error);}
      finally{if(this.port&&!this.fault)this.fail(new Error('disconnected'));}
    }
    fail(error){
      this.fault=true;
      this.onLog('error',`${error.name}: ${error.message}`);
      if(this.pending){clearTimeout(this.pending.timer);this.pending.reject(error);this.pending=null;}
      this.onChange(error);
    }
    async request(command){
      if(!this.port||this.fault)throw new Error('disconnected');
      if(this.pending)throw new Error('busy');
      const result=new Promise((resolve,reject)=>{this.pending={resolve,reject,timer:setTimeout(()=>this.fail(new Error('timeout')),8000)};});
      result.catch(()=>{}); // A read failure can arrive while write() is still pending.
      let writer;
      try{writer=this.port.writable.getWriter();this.onLog('tx',command);await writer.write(new TextEncoder().encode(command));}catch(error){this.fail(error);}finally{writer?.releaseLock();}
      return result;
    }
    query(){return this.request(`GP${sentinel}\n`);}
    async close(){
      const port=this.port;this.port=null;
      if(!port)return;
      if(this.pending)this.fail(new Error('disconnected'));
      try{await this.reader.cancel();await this.reading;}finally{this.reader.releaseLock();await port.close();this.reader=null;this.buffer='';this.onLog('closed');}
    }
  }
  return {parse,validateScale,angles,plan,Connection};
})();
