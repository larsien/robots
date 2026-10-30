// Order and video links checked against anninrobotics.com/tutorials on 2026-10-19.
const robotCourseLessons=[
  {id:'startup',video:'yM0rBT2chiY',lesson:'joint',joint:0,start:496},
  {id:'basics',video:'M2BC0hjSo-E',lesson:'cartesian',joint:1},
  {id:'advanced',video:'FW-BaQY1Paw',lesson:'cartesian',joint:4},
  {id:'vision',video:'exKHj2LXChQ',lesson:'cartesian',joint:0},
  {id:'compilation',video:'cwQjzYSAIQQ',lesson:'joint',joint:5},
  {id:'ros2',video:'9jmXEHAL-Vk',lesson:'flow',joint:1},
  {id:'kinematics',video:'FNuiNmoqaZM',lesson:'joint',joint:5}
];
const robotCourseCopy={
  ko:{
    heading:'공식 튜토리얼과 함께 공부하기',order:'Annin Robotics 홈페이지 순서',choose:'학습할 튜토리얼',
    note:'자료는 AR4, 옆의 실습 모델은 AR3입니다. 공통 제어 개념을 관찰합니다.',
    progress:'직접 확인한 단계',saved:'이 브라우저에 진도가 저장됩니다.',unsaved:'진도를 저장할 수 없습니다. 이 탭에서만 유지됩니다.',
    read:'01 · 자료 읽기',watch:'공식 영상 ↗',segment:'조그 설명부터 · 8:16 ↗',
    practice:'02 · 로봇으로 관찰하기',prepare:'기준 자세로 실습 준비',controls:'로봇 조작',collapse:'접기',expand:'펼치기',
    check:'03 · 확인 질문',answer:'설명 보기',done:'자료와 확인 질문을 학습했어요',previous:'← 이전',next:'다음 →',finished:'모든 단계를 확인했습니다. 원하는 단계를 다시 살펴보세요.',
    lessons:[
      {title:'시동과 보정',reading:'공식 1번 영상에서 소프트웨어 설치, 센서 확인, 축별 조그, 보정 순서를 봅니다. 먼저 전체 흐름을 읽고, 조그 설명에서 잠시 멈춰 옆의 모델을 움직여보세요.',
       steps:['실습 준비를 누른 뒤 J1에 +10°를 한 번 입력하세요.','명령 배열의 첫 번째 값과 팔 전체의 움직임을 비교하세요.','J2와 J3도 하나씩 선택해 +10°를 주고, 함께 움직이는 Link (링크)를 찾으세요.'],
       question:'기준 자세로 돌아오는 것과 영점을 보정하는 것은 어떻게 다를까요?',answer:'기준 자세는 이미 정해진 관절 각도로 이동하는 것입니다. 보정은 센서와 기구의 기준을 이용해 실제 위치와 Controller (제어기) 값의 관계를 맞춥니다. 이 화면의 기준 자세 버튼은 보정하지 않습니다.',limit:'센서 검사·펌웨어 설치·자동 보정은 원본 자료로 학습합니다. 여기서는 축별 움직임만 관찰합니다.'},
      {title:'HMI 기본 프로그래밍',reading:'공식 2번 영상에서 HMI 구성, 가상 로봇, 조그 방식과 프로그램 작성 흐름을 봅니다. 관절 조그와 좌표 조그가 어떤 요청인지 비교하는 것이 이번 실습의 목표입니다.',
       steps:['실습 준비 후 Z +20 mm를 누르고 J1~J3의 변화를 보세요.','관절 명령 탭에서 J2를 선택하고 +10°를 누르세요.','두 경우의 목표 단위와 끝단 좌표 변화를 비교하세요.'],
       question:'Z를 20 mm 바꾸라는 명령이 왜 여러 관절을 움직일까요?',answer:'Z는 끝단 위치의 목표입니다. 그 위치를 만들 관절 조합을 역기구학으로 계산하기 때문에 여러 각도가 함께 바뀔 수 있습니다.',limit:'HMI 프로그램 실행과 Tool Frame 조그는 이 모델에 없습니다. 좌표 조그는 base_link 기준의 Flange (플랜지) 위치만 맞춥니다.'},
      {title:'고급 이동과 특이점',reading:'공식 3번 영상에서 원호·원·스플라인 경로와 Wrist (손목) 구성을 봅니다. 여기서는 도착점과 이동 경로가 서로 다른 조건이라는 점을 관찰합니다.',
       steps:['실습 준비 후 X +20 mm를 누르세요.','움직이는 동안 끝단을 보고, 도착 좌표도 확인하세요.','같은 도착점이라도 직선·원호처럼 경로 조건을 따로 지정해야 하는 이유를 설명하세요.'],
       question:'끝단이 목표점에 도착했다면 직선 이동에도 성공한 것일까요?',answer:'아닙니다. 이 모델은 시작과 끝의 관절 각도를 보간합니다. 목표점 도달만으로 경로의 직선성이나 중간 자세가 보장되지는 않습니다.',limit:'원호·원·스플라인 실행과 특이점 검출은 제공하지 않습니다. 해당 동작은 공식 영상과 HMI 가상 로봇에서 학습하세요.'},
      {title:'비전으로 물체 집기',reading:'공식 4번 영상에서 카메라 보정, 물체 등록, 검출 위치를 이용한 이동 흐름을 봅니다. 이 실습은 검출 이후의 좌표 오프셋 개념을 다룹니다.',
       steps:['실습 준비 후 X +20 mm, Y +20 mm를 차례로 누르세요.','각 이동이 끝난 뒤 좌표 변화량을 기록하세요.','관절 명령 탭에서 Gripper (집게)를 열고 닫아 팔의 이동과 구분하세요.'],
       question:'카메라의 픽셀 좌표를 그대로 로봇의 mm 좌표로 쓸 수 있을까요?',answer:'그대로 쓸 수 없습니다. 카메라 보정과 좌표 변환을 통해 로봇이 사용하는 기준 좌표로 연결해야 합니다. 여기서 입력한 20 mm는 이미 로봇 기준의 거리입니다.',limit:'카메라·인식·물체·파지 성공 판정은 없습니다. Gripper (집게)는 시각적 개폐만 보여줍니다.'},
      {title:'프로그래밍 종합 복습',reading:'공식 5번 종합 영상에서 위치 티칭, 이동, 분기와 I/O를 연결해 봅니다. 필요한 부분을 다시 보며 팔의 동작과 Gripper (집게) 명령을 구분해 정리하세요.',
       steps:['실습 준비 후 J6에 +10°를 입력하세요.','Gripper (집게)를 닫고, J1~J6 명령 배열이 그대로인지 확인하세요.','J1을 +10° 움직인 뒤 Gripper (집게)를 열며 동작 순서를 말로 설명하세요.'],
       question:'Gripper (집게)를 닫는 명령은 여섯 번째 관절 각도일까요?',answer:'아닙니다. J6는 Tool (도구)의 회전이고 Gripper (집게) 개폐는 별도 구동입니다. 프로그램에서는 팔 이동과 Gripper (집게) I/O를 서로 다른 동작으로 다룹니다.',limit:'수동으로 동작 순서를 관찰합니다. 프로그램 저장·반복·I/O·Modbus는 공식 소프트웨어에서 다룹니다.'},
      {title:'ROS 2 설치와 제어',reading:'공식 6번 영상에서 노드, MoveIt, Controller (제어기)와 Hardware interface (하드웨어 인터페이스)의 역할을 봅니다. 먼저 명령이 어떤 경로로 Motor (모터)에 전달되는지 연결해 보세요.',
       steps:['실습 준비를 눌러 Control cabinet (제어함)과 명령 흐름을 펼치세요.','J2에 +10°를 주고 joint_2의 목표값을 확인하세요.','PC의 목표에서 Controller (제어기)와 Motor (모터)까지 전달되는 과정을 따라가세요.'],
       question:'화면의 positions 값은 Motor (모터)에 보내는 펄스 수일까요?',answer:'아닙니다. positions는 관절 목표 각도(rad)입니다. 실제 드라이버는 기종의 보정값과 통신 규약에 맞게 이를 변환합니다.',limit:'이 그림은 AR3의 ROS 모델·Teensy 3.5 흐름입니다. AR4 ROS 2·Teensy 4.1 실행 환경이나 실제 통신을 재현하지 않습니다.'},
      {title:'로봇 기구학',reading:'공식 7번 영상에서 회전행렬, 좌표 변환, FK와 IK를 학습합니다. 수식의 입력과 출력이 옆의 관절 각도·끝단 좌표에 어떻게 대응하는지 확인하세요.',
       steps:['실습 준비 후 J6에 +10°를 주고 Flange (플랜지) XYZ가 유지되는지 보세요.','J2를 선택해 +10°를 주며 각도에서 좌표가 계산되는 FK를 확인하세요.','끝단 위치 탭에서 Z +20 mm를 눌러 좌표에서 각도를 구하는 IK와 비교하세요.'],
       question:'J6를 돌렸는데 XYZ가 같다면 로봇의 자세도 같을까요?',answer:'위치가 같아도 방향은 달라질 수 있습니다. 여기서 XYZ는 Flange (플랜지) 원점이며, J6 회전은 그 원점의 위치를 유지하면서 Tool (도구)의 방향을 바꿉니다.',limit:'이 IK는 J1~J3으로 위치만 계산합니다. 6축 위치·방향 해, 다중 해와 충돌 검사는 포함하지 않습니다.'}
    ]
  },
  en:{
    heading:'Study alongside the official tutorials',order:'Annin Robotics website order',choose:'Choose a tutorial',
    note:'The sources cover AR4; the model beside them is AR3. Explore the shared control concepts.',
    progress:'Steps you have reviewed',saved:'Progress is saved in this browser.',unsaved:'Progress cannot be saved. It lasts for this tab only.',
    read:'01 · Read & watch',watch:'Official video ↗',segment:'Jogging section · 8:16 ↗',
    practice:'02 · Observe with the robot',prepare:'Prepare practice at the ready pose',controls:'Robot controls',collapse:'Collapse',expand:'Expand',
    check:'03 · Check your understanding',answer:'Show explanation',done:'I reviewed the material and question',previous:'← Previous',next:'Next →',finished:'You have reviewed every step. Revisit any tutorial.',
    lessons:[
      {title:'Startup and calibration',reading:'In official tutorial 1, follow software setup, sensor checks, axis jogging and calibration. Watch the overview, then pause at jogging to explore the model.',steps:['Prepare practice, then press +10° for J1.','Compare the first command entry with the movement of the whole arm.','Select J2 and J3 in turn, add +10°, and find the links that follow.'],question:'How does returning to a ready pose differ from calibration?',answer:'A ready pose specifies known joint angles. Calibration establishes the relationship between physical references and controller values. The ready button here does not calibrate anything.',limit:'Use the source for sensor checks, firmware and auto-calibration. This exercise shows joint motion only.'},
      {title:'HMI programming basics',reading:'In official tutorial 2, explore the HMI, virtual robot, jogging modes and programming workflow. Compare requests made in joint space and Cartesian space.',steps:['Prepare practice, press Z +20 mm and watch J1–J3.','Open Joint commands, select J2 and press +10°.','Compare the target units and the resulting flange coordinates.'],question:'Why can a 20 mm Z request move several joints?',answer:'Z specifies an end-position target. Inverse kinematics finds joint angles that achieve it, so several angles may change together.',limit:'HMI program execution and Tool Frame jogging are not included. Cartesian jogging targets the flange position in base_link.'},
      {title:'Advanced motion and singularities',reading:'Official tutorial 3 covers arcs, circles, splines and wrist configurations. Use this exercise to distinguish an endpoint from the path taken to reach it.',steps:['Prepare practice, then press X +20 mm.','Observe the moving end and its final coordinates.','Explain why a straight or curved path requires a separate path constraint.'],question:'Does reaching the target prove that the motion was a straight line?',answer:'No. This model interpolates joint angles between two configurations. Reaching the endpoint does not guarantee a straight path or particular intermediate poses.',limit:'Arc, circle and spline execution and singularity detection are not implemented. Study those in the video and official HMI virtual robot.'},
      {title:'Vision-guided picking',reading:'Official tutorial 4 covers camera calibration, object teaching and motion from detections. Here, explore coordinate offsets after detection.',steps:['Prepare practice, then press X +20 mm followed by Y +20 mm.','Record the coordinate changes after each move finishes.','Open Joint commands and open/close the gripper separately from arm motion.'],question:'Can camera pixels be used directly as robot millimetres?',answer:'No. Camera calibration and coordinate transforms relate detections to the robot frame. The 20 mm entered here is already a distance in that frame.',limit:'There is no camera, recognition, object or grasp-success check. The gripper only illustrates opening and closing.'},
      {title:'Programming review',reading:'Use official tutorial 5 to connect taught positions, motion, branching and I/O. Revisit the relevant parts and separate arm commands from gripper actions.',steps:['Prepare practice and add +10° to J6.','Close the gripper and check that the J1–J6 command vector stays unchanged.','Move J1 by +10°, then open the gripper and describe the sequence.'],question:'Is closing the gripper the sixth joint angle?',answer:'No. J6 rotates the tool; opening and closing the gripper uses a separate actuator. A program treats arm motion and gripper I/O as separate actions.',limit:'This is a manual sequence. Program storage, loops, I/O and Modbus belong in the official software.'},
      {title:'ROS 2 setup and control',reading:'Official tutorial 6 introduces nodes, MoveIt, controllers and the hardware interface. Trace how a target reaches the motors before installing anything.',steps:['Prepare practice to open the cabinet and control-flow view.','Add +10° to J2 and inspect the joint_2 target.','Trace the request from the PC through the controller to the motor.'],question:'Are the displayed positions values motor pulse counts?',answer:'No. They are target joint angles in radians. The real driver converts them using the robot’s calibration and communication protocol.',limit:'This diagram uses the AR3 ROS model and Teensy 3.5. It does not run the AR4 ROS 2 / Teensy 4.1 stack or communicate with hardware.'},
      {title:'Robot kinematics',reading:'Official tutorial 7 develops rotation matrices, transforms, FK and IK. Relate their inputs and outputs to the joint angles and end coordinates beside you.',steps:['Prepare practice, add +10° to J6 and check that flange XYZ stays fixed.','Select J2 and add +10° to observe FK: angles to coordinates.','Open End position and press Z +20 mm to compare IK: coordinates to angles.'],question:'If J6 changes while XYZ stays fixed, is the pose unchanged?',answer:'Position may stay fixed while orientation changes. XYZ here refers to the flange origin; J6 rotates the tool without translating that origin.',limit:'This IK solves position with J1–J3 only. Full six-axis pose solutions, multiple solutions and collision checks are not included.'}
    ]
  },
  es:{
    heading:'Estudia con los tutoriales oficiales',order:'Orden de la web de Annin Robotics',choose:'Elige un tutorial',
    note:'Las fuentes explican el AR4; el modelo es un AR3. Observa los conceptos de control que comparten.',
    progress:'Pasos que has revisado',saved:'El progreso se guarda en este navegador.',unsaved:'No se puede guardar el progreso. Solo durará en esta pestaña.',
    read:'01 · Lee y mira',watch:'Vídeo oficial ↗',segment:'Sección de jogging · 8:16 ↗',
    practice:'02 · Observa con el robot',prepare:'Preparar práctica en postura de referencia',controls:'Controles del robot',collapse:'Contraer',expand:'Expandir',
    check:'03 · Comprueba lo aprendido',answer:'Ver explicación',done:'He revisado el material y la pregunta',previous:'← Anterior',next:'Siguiente →',finished:'Has revisado todos los pasos. Puedes volver a cualquier tutorial.',
    lessons:[
      {title:'Puesta en marcha y calibración',reading:'En el tutorial oficial 1, sigue la instalación, las comprobaciones de sensores, el jogging y la calibración. Pausa en el jogging para explorar el modelo.',steps:['Prepara la práctica y pulsa +10° para J1.','Compara la primera entrada del comando con el movimiento del brazo.','Selecciona J2 y J3 por turnos, suma +10° y observa qué Links (eslabones) las siguen.'],question:'¿En qué se diferencia volver a una postura de referencia de calibrar?',answer:'La postura especifica ángulos conocidos. Calibrar establece la relación entre referencias físicas y valores del Controller (controlador). Este botón no calibra el robot.',limit:'Consulta la fuente para sensores, firmware y calibración automática. Aquí solo observamos movimiento articular.'},
      {title:'Programación básica del HMI',reading:'El tutorial oficial 2 explica el HMI, el robot virtual, el jogging y la programación. Compara peticiones en espacio articular y cartesiano.',steps:['Prepara la práctica, pulsa Z +20 mm y observa J1–J3.','Abre Comandos articulares, selecciona J2 y pulsa +10°.','Compara las unidades del objetivo y las coordenadas resultantes.'],question:'¿Por qué una petición de 20 mm en Z puede mover varias articulaciones?',answer:'Z indica una posición final. La cinemática inversa calcula los ángulos para alcanzarla; varios pueden cambiar a la vez.',limit:'No se ejecutan programas HMI ni jogging en Tool Frame. El jogging cartesiano fija la posición de la Flange (brida) respecto a base_link.'},
      {title:'Movimientos avanzados y singularidades',reading:'El tutorial oficial 3 explica arcos, círculos, splines y configuraciones de Wrist (muñeca). Distingue el destino de la trayectoria para alcanzarlo.',steps:['Prepara la práctica y pulsa X +20 mm.','Observa el extremo durante el movimiento y sus coordenadas finales.','Explica por qué una trayectoria recta o curva necesita una condición adicional.'],question:'¿Llegar al objetivo demuestra que se siguió una línea recta?',answer:'No. Este modelo interpola ángulos articulares. Llegar al destino no garantiza una trayectoria recta ni posturas intermedias concretas.',limit:'No hay arcos, círculos, splines ni detección de singularidades. Estúdialos en el vídeo y el robot virtual del HMI oficial.'},
      {title:'Recogida guiada por visión',reading:'El tutorial oficial 4 explica calibración de cámara, registro de objetos y movimiento desde detecciones. Aquí exploramos desplazamientos tras la detección.',steps:['Prepara la práctica y pulsa X +20 mm y después Y +20 mm.','Anota los cambios de coordenadas al terminar cada movimiento.','Abre Comandos articulares y abre/cierra la Gripper (pinza) por separado.'],question:'¿Se pueden usar píxeles de cámara directamente como milímetros del robot?',answer:'No. La calibración y las transformaciones relacionan las detecciones con el sistema del robot. Los 20 mm introducidos aquí ya están en ese sistema.',limit:'No hay cámara, reconocimiento, objetos ni comprobación de agarre. La Gripper (pinza) solo ilustra apertura y cierre.'},
      {title:'Repaso de programación',reading:'El tutorial oficial 5 conecta posiciones enseñadas, movimientos, condiciones y E/S. Repasa las partes necesarias y distingue el brazo de la Gripper (pinza).',steps:['Prepara la práctica y suma +10° a J6.','Cierra la Gripper (pinza) y comprueba que el vector J1–J6 no cambia.','Mueve J1 +10°, abre la Gripper (pinza) y describe la secuencia.'],question:'¿Cerrar la Gripper (pinza) es el sexto ángulo articular?',answer:'No. J6 gira la Tool (herramienta) y la Gripper (pinza) tiene un actuador independiente. El programa trata el movimiento del brazo y las E/S de la Gripper (pinza) por separado.',limit:'La secuencia es manual. El almacenamiento de programas, bucles, E/S y Modbus se estudia en el software oficial.'},
      {title:'Instalación y control con ROS 2',reading:'El tutorial oficial 6 presenta nodos, MoveIt, controladores e Hardware interface (interfaz de hardware). Sigue cómo llega una petición al Motor (motor) antes de instalar nada.',steps:['Prepara la práctica para abrir el Control cabinet (armario) y el flujo de control.','Suma +10° a J2 y observa el objetivo joint_2.','Sigue la petición desde el PC, pasando por el Controller (controlador), hasta el Motor (motor).'],question:'¿Los valores positions son cantidades de pulsos del Motor (motor)?',answer:'No. Son ángulos articulares objetivo en radianes. El driver real los convierte según la calibración y el protocolo del robot.',limit:'El esquema usa el modelo ROS del AR3 y Teensy 3.5. No ejecuta AR4 ROS 2 / Teensy 4.1 ni se comunica con hardware.'},
      {title:'Cinemática del robot',reading:'El tutorial oficial 7 desarrolla matrices de rotación, transformaciones, FK e IK. Relaciona sus entradas y salidas con los ángulos y coordenadas del modelo.',steps:['Prepara la práctica, suma +10° a J6 y comprueba que XYZ no cambia.','Selecciona J2 y suma +10° para observar FK: ángulos a coordenadas.','Abre Posición final y pulsa Z +20 mm para comparar IK: coordenadas a ángulos.'],question:'Si cambia J6 pero XYZ sigue igual, ¿la postura es la misma?',answer:'La posición puede mantenerse mientras cambia la orientación. XYZ se refiere al origen de la Flange (brida); J6 gira la Tool (herramienta) sin trasladar ese origen.',limit:'Esta IK solo calcula posición con J1–J3. No incluye postura completa de seis ejes, soluciones múltiples ni colisiones.'}
    ]
  }
};
let robotCourseSaved=true;
function robotCourseLoad(){
  const state={current:robotCourseLessons[0].id,completed:[]};
  try{
    const saved=JSON.parse(localStorage.getItem('ar3-course-v1'));
    if(saved&&robotCourseLessons.some(l=>l.id===saved.current))state.current=saved.current;
    if(Array.isArray(saved?.completed))state.completed=robotCourseLessons.filter(l=>saved.completed.includes(l.id)).map(l=>l.id);
  }catch{robotCourseSaved=false;}
  return state;
}
const robotCourseState=robotCourseLoad();
function robotCourseSave(){
  try{localStorage.setItem('ar3-course-v1',JSON.stringify(robotCourseState));robotCourseSaved=true;}catch{robotCourseSaved=false;}
}
function robotCourseSelect(id){
  if(!robotCourseLessons.some(l=>l.id===id))return;
  robotCourseState.current=id;robotCourseSave();robotCourseRender();
}
function robotCourseMount(panel){
  const course=document.createElement('section');course.className='course-bar';course.setAttribute('aria-labelledby','course-heading');
  course.innerHTML='<div><h2 id="course-heading"></h2><a id="course-source" href="https://anninrobotics.com/tutorials" target="_blank" rel="noopener"></a><p id="course-note"></p></div><div class="course-choice"><label for="course-select" id="course-select-label"></label><select id="course-select"></select><div id="course-progress" role="status"></div></div>';
  document.querySelector('header').after(course);
  const controls=document.createElement('details');controls.id='practice-controls';controls.open=true;
  const summary=document.createElement('summary');summary.id='practice-controls-label';controls.append(summary);
  controls.append(...panel.children);
  const study=document.createElement('section');study.id='course-study';study.setAttribute('aria-labelledby','course-title');
  const navigation=document.createElement('div');navigation.className='course-navigation';
  navigation.innerHTML='<label class="course-completion"><input type="checkbox" id="course-complete"><span id="course-complete-label"></span></label><div class="course-paging"><button id="course-previous"></button><button id="course-next"></button></div><p id="course-storage"></p><p id="course-finished" role="status"></p>';
  panel.append(study,navigation,controls);
  document.getElementById('course-select').onchange=e=>robotCourseSelect(e.target.value);
  document.getElementById('course-complete').onchange=e=>{
    const id=robotCourseState.current;
    robotCourseState.completed=robotCourseState.completed.filter(value=>value!==id);
    if(e.target.checked)robotCourseState.completed.push(id);
    robotCourseSave();robotCourseRender();
  };
  for(const [id,delta] of [['previous',-1],['next',1]])document.getElementById(`course-${id}`).onclick=()=>{
    const next=robotCourseLessons.findIndex(l=>l.id===robotCourseState.current)+delta;
    if(robotCourseLessons[next])robotCourseSelect(robotCourseLessons[next].id);
  };
  study.addEventListener('click',e=>{
    if(!e.target.closest('#course-prepare'))return;
    const current=robotCourseLessons.find(l=>l.id===robotCourseState.current);
    controls.open=true;
    robotReset();robotUI.st.inside=current.lesson==='flow';robotLesson(current.lesson);robotSelect(current.joint);
    // Keep the model and instructions in view; move keyboard focus to its first control.
    document.querySelector('.actions .act').focus({preventScroll:true});
  });
}
function robotCourseRender(){
  const copy=robotCourseCopy[robotLanguage],index=robotCourseLessons.findIndex(l=>l.id===robotCourseState.current),lesson=robotCourseLessons[index],text=copy.lessons[index];
  for(const [id,key] of [['course-heading','heading'],['course-source','order'],['course-note','note'],['course-select-label','choose'],['course-complete-label','done'],['course-previous','previous'],['course-next','next']])document.getElementById(id).textContent=copy[key];
  document.getElementById('practice-controls-label').innerHTML=`${copy.controls}<span class="control-collapse">${copy.collapse} −</span><span class="control-expand">${copy.expand} +</span>`;
  const select=document.getElementById('course-select');
  select.replaceChildren(...robotCourseLessons.map((item,i)=>{
    const option=document.createElement('option');option.value=item.id;option.textContent=`${String(i+1).padStart(2,'0')} · ${copy.lessons[i].title}${robotCourseState.completed.includes(item.id)?' ✓':''}`;return option;
  }));select.value=lesson.id;
  document.getElementById('course-progress').textContent=`${copy.progress} · ${robotCourseState.completed.length} / ${robotCourseLessons.length}`;
  document.getElementById('course-study').innerHTML=`<div class="axis">TUTORIAL ${String(index+1).padStart(2,'0')} / 07 · AR4</div><h2 id="course-title">${text.title}</h2><h3>${copy.read}</h3><p>${text.reading}</p><div class="course-links"><a href="https://www.youtube.com/watch?v=${lesson.video}" target="_blank" rel="noopener">${copy.watch}</a>${lesson.start?`<a href="https://www.youtube.com/watch?v=${lesson.video}&t=${lesson.start}s" target="_blank" rel="noopener">${copy.segment}</a>`:''}</div><h3>${copy.practice}</h3><ol>${text.steps.map(step=>`<li>${step}</li>`).join('')}</ol><button id="course-prepare">${copy.prepare}</button><p class="course-limit">${text.limit}</p><h3>${copy.check}</h3><p>${text.question}</p><details><summary>${copy.answer}</summary><p>${text.answer}</p></details>`;
  document.getElementById('course-complete').checked=robotCourseState.completed.includes(lesson.id);
  document.getElementById('course-previous').disabled=index===0;
  document.getElementById('course-next').disabled=index===robotCourseLessons.length-1;
  document.getElementById('course-storage').textContent=copy[robotCourseSaved?'saved':'unsaved'];
  document.getElementById('course-finished').textContent=robotCourseState.completed.length===robotCourseLessons.length?copy.finished:'';
}
