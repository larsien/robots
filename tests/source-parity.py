"""Ensure teaching geometry matches the upstream Xacro actually used by MoveIt."""
import json, math, re, subprocess, xml.etree.ElementTree as ET
model = json.loads(subprocess.check_output(['node','-e',"const fs=require('fs'),vm=require('vm');console.log(JSON.stringify(vm.runInNewContext(fs.readFileSync('src/ar3-model.js','utf8')+';AR3Model.joints')));"],text=True))
expressions={'${pi}':math.pi,'${-39.6/180.0*pi}':-39.6/180*math.pi,'${pi/2.0}':math.pi/2}
def scalar(value):
    value=''.join(value.split())
    return expressions[value] if value.startswith('${') else float(value)
def vector(value):
    return [scalar(v) for v in re.findall(r'\$\{[^}]+\}|[^\s]+',value)]
root=ET.parse('tests/fixtures/ar3.urdf.xacro').getroot()
for i,joint in enumerate(root.findall('joint')):
    assert joint.get('name')==f'joint_{i+1}'
    actual=model[i]
    for key in ['xyz','rpy']:
        expected=vector(joint.find('origin').get(key))
        assert all(abs(a-b)<1e-12 for a,b in zip(actual[key],expected)),(i,key)
    axis=vector(joint.find('axis').get('xyz'))
    expected_axis=[actual['sign'] if n=='xyz'.index(actual['axis']) else 0 for n in range(3)]
    assert axis==expected_axis,(i,'axis')
    limits=joint.find('limit')
    assert all(abs(a-scalar(limits.get(key)))<1e-12 for a,key in zip(actual['limits'],['lower','upper'])),(i,'limits')
print('PASS: all 6 joint names, origins, RPY transforms, axis signs and position limits match pinned upstream Xacro.')
