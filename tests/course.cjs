const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/ar3-course.js','utf8');
function load(raw,blocked=false){
  const storage={raw};
  const context=vm.createContext({localStorage:{
    getItem(){if(blocked)throw new Error('Storage blocked');return storage.raw;},
    setItem(key,value){assert.equal(key,'ar3-course-v1');if(blocked)throw new Error('Storage blocked');storage.raw=value;}
  }});
  vm.runInContext(source,context);return {context,storage,read:code=>JSON.parse(JSON.stringify(vm.runInContext(code,context)))};
}
const normal=load(null),lessons=normal.read('robotCourseLessons'),copies=normal.read('robotCourseCopy');
assert.deepEqual(lessons.map(l=>l.id),['startup','basics','advanced','vision','compilation','ros2','kinematics']);
assert.equal(new Set(lessons.map(l=>l.video)).size,7);
for(const item of lessons){
  assert.match(item.video,/^[\w-]{11}$/);
  assert(['joint','cartesian','flow'].includes(item.lesson));
  assert(Number.isInteger(item.joint)&&item.joint>=0&&item.joint<6);
}
for(const [lang,copy] of Object.entries(copies)){
  assert.deepEqual(Object.keys(copy).sort(),Object.keys(copies.ko).sort(),lang);
  assert.equal(copy.lessons.length,7);
  for(const lesson of copy.lessons){
    assert.deepEqual(Object.keys(lesson).sort(),['answer','limit','question','reading','steps','title']);
    assert.equal(lesson.steps.length,3);
    for(const value of Object.values(lesson).flat())assert(typeof value==='string'&&value.trim().length>0);
  }
}
const defaultState={current:'startup',completed:[]};
for(const raw of [null,'null','[]','42','"text"','{}','bad JSON'])assert.deepEqual(load(raw).read('robotCourseState'),defaultState);
const restored=load(JSON.stringify({current:'ros2',completed:['startup','startup','bad','kinematics']}));
assert.deepEqual(restored.read('robotCourseState'),{current:'ros2',completed:['startup','kinematics']});
assert.deepEqual(load('{"current":"__proto__","completed":"startup"}').read('robotCourseState'),defaultState);
normal.read("robotCourseState.current='basics';robotCourseState.completed=['startup'];robotCourseSave();robotCourseSaved");
assert.deepEqual(JSON.parse(normal.storage.raw),{current:'basics',completed:['startup']});
const blocked=load(null,true);
assert.deepEqual(blocked.read('robotCourseState'),defaultState);
assert.equal(blocked.read('robotCourseSave();robotCourseSaved'),false);
const elements=new Map();
normal.context.document={
  getElementById(id){if(!elements.has(id))elements.set(id,{replaceChildren(...children){this.children=children;}});return elements.get(id);},
  createElement(){return {};}
};
normal.context.robotUI={st:{q:[1,2,3,4,5,6],lesson:'joint'}};
const robotBefore=JSON.stringify(normal.context.robotUI);
for(const lang of Object.keys(copies)){
  normal.context.robotLanguage=lang;
  for(const [index,lesson] of lessons.entries()){
    normal.read(`robotCourseSelect('${lesson.id}');robotCourseState`);
    assert.equal(elements.get('course-select').value,lesson.id);
    assert.equal(elements.get('course-select').children.length,7);
    assert.equal(elements.get('course-previous').disabled,index===0);
    assert.equal(elements.get('course-next').disabled,index===6);
    assert(elements.get('course-study').innerHTML.includes(`https://www.youtube.com/watch?v=${lesson.video}`));
    assert(elements.get('course-study').innerHTML.includes(copies[lang].lessons[index].question));
    assert.equal(JSON.stringify(normal.context.robotUI),robotBefore,'Reading or changing language must not move the robot');
    assert.deepEqual(normal.read('robotCourseState.completed'),['startup'],'Navigation must not mark lessons complete');
  }
}
assert.equal(normal.read("robotCourseSelect('bad');robotCourseState.current"),'kinematics');
console.log('PASS: official order, practice mappings, 21 localized lesson renders, navigation bounds without robot motion or auto-completion, persistence, invalid data and blocked storage');
