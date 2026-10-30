const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/ar3-i18n.js','utf8');
function load(saved,blocked=false){
  const context=vm.createContext({localStorage:{getItem(){if(blocked)throw new Error('Storage blocked');return saved;}}});
  vm.runInContext(source,context);return context;
}
const context=load(null),translations=vm.runInContext('robotTranslations',context);
const keys=Object.keys(translations.ko).sort();
const placeholders=text=>[...new Set(text.match(/\{\w+\}/g)||[])].sort();
for(const [lang,copy] of Object.entries(translations)){
  assert.deepEqual(Object.keys(copy).sort(),keys,`${lang}: same translation keys`);
  for(const key of keys){
    assert.equal(typeof copy[key],typeof translations.ko[key],`${lang}.${key}: type`);
    if(Array.isArray(copy[key])){
      assert.equal(copy[key].length,translations.ko[key].length,`${lang}.${key}: array length`);
      assert(copy[key].every(v=>typeof v==='string'&&v.length));
    }else{
      assert(copy[key].length,`${lang}.${key}: not empty`);
      assert.deepEqual(placeholders(copy[key]),placeholders(translations.ko[key]),`${lang}.${key}: parameters`);
      context.testLanguage=lang;context.testKey=key;
      const result=vm.runInContext("robotLanguage=testLanguage;robotT(testKey,{joint:6,delta:'+10',axis:'Z',angle:'30.0',degrees:'30.0',radians:'0.5236',color:'Mint',age:'1.0'})",context);
      assert(!/undefined|\{\w+\}/.test(result),`${lang}.${key}: all parameters resolved`);
    }
  }
}
for(const [saved,expected] of [[null,'en'],['en','en'],['es','es'],['ko','ko'],['unknown','en'],['__proto__','en']]){
  assert.equal(vm.runInContext('robotLanguage',load(saved)),expected);
}
assert.equal(vm.runInContext('robotLanguage',load(null,true)),'en','Blocked storage still loads English');
assert(vm.runInContext("robotLanguage='es';robotT('selected',{joint:6})",context).includes(translations.es.jointExplanations[5]));
console.log(`PASS: ${keys.length} translation keys × 3 languages, placeholders, joint descriptions and saved-language fallback`);
