import * as THREE from './assets/vendor/three.module.js';
import {initDesktop} from './aero-desktop.js?v=7';
import {createHeroScene} from './aero-scene.js?v=5';
import {initPortfolioAudio} from './aero-audio.js?v=5';

const hero=document.querySelector('#aero-hero'),host=document.querySelector('#aero-world');
const enterButton=document.querySelector('#aero-enter'),motionButton=document.querySelector('#aero-motion');
const desktopRoot=document.querySelector('#aero-desktop');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const motionRequested=new URLSearchParams(location.search).get('movimento');
let motionPreference=null;
try{const saved=localStorage.getItem('laura-motion');if(saved==='on'||saved==='off')motionPreference=saved}catch{}
if(motionRequested==='1')motionPreference='on';else if(motionRequested==='0')motionPreference='off';
let paused=motionPreference?motionPreference==='off':reduced.matches,inside=false,transition=null,renderer,camera,scene,computer,screen;
let raf=0,lastTime=0,hover=false,boot=0,screenDirty=true,measuredFrames=0,measurementStart=0;
let sceneReady=false,sceneLayout=()=>{},shadowYaw=null;
const pointer=new THREE.Vector2(0,0),ray=new THREE.Raycaster(),floaters=[];
const monitorHitbox=new THREE.Box3(new THREE.Vector3(-1.82,.88,-1.86),new THREE.Vector3(1.82,4.01,1.12)),localHitRay=new THREE.Ray(),inverseComputer=new THREE.Matrix4();
function pointsAtMonitor(){inverseComputer.copy(computer.matrixWorld).invert();localHitRay.copy(ray.ray).applyMatrix4(inverseComputer);return localHitRay.intersectsBox(monitorHitbox)}
const sectionRoutes=new Set(['sobre','projetos','contato','experiencia','servicos','tamagotchi','desktop']);
let restoringRoute=false,handledLocation='';
function routeFromHash(){
 let name;try{name=decodeURIComponent(location.hash.slice(1)).toLowerCase()}catch{return null}
 if(name==='atuacao')name='servicos';
 return sectionRoutes.has(name)?name:null;
}
function updateRoute(section){
 if(restoringRoute)return;
 const route=section==='welcome'?'desktop':section;
 const hash=route?'#'+route:'';
 if(location.hash!==hash)history.pushState(null,'',location.pathname+location.search+hash);
 handledLocation=location.href;
}
const desktop=initDesktop({root:desktopRoot,onExit:leave,onSectionChange:updateRoute});
const sound=initPortfolioAudio({button:document.querySelector('#aero-sound'),musicUrl:'assets/audio/hero-7-weeks-3-days.m4a?v=1'});
// A shared section URL opens the desktop silently, without starting the hero soundtrack.
if(routeFromHash())sound.setScene('desktop');

const textureCanvas=document.createElement('canvas');textureCanvas.width=1920;textureCanvas.height=1440;
const ctx=textureCanvas.getContext('2d');ctx.scale(1.5,1.5);const screenTexture=new THREE.CanvasTexture(textureCanvas);screenTexture.colorSpace=THREE.SRGBColorSpace;screenTexture.anisotropy=4;
const logo=new Image();logo.onload=()=>{screenDirty=true;requestTick()};logo.src='assets/coruja-preta.webp';
const wallpaper=new Image();wallpaper.onload=()=>{screenDirty=true;requestTick()};wallpaper.src='assets/windows/bliss.jpg';
const screenIcons=['user','folder','mail'].map(name=>{const image=new Image();image.onload=()=>{screenDirty=true;requestTick()};image.src=`assets/windows/${name}.png`;return image});
function roundRect(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}}
function drawScreen(){
 const c=ctx,w=1280,h=960;c.clearRect(0,0,w,h);c.fillStyle='#368ad4';c.fillRect(0,0,w,h);
 if(wallpaper.complete&&wallpaper.naturalWidth)c.drawImage(wallpaper,0,0,w,h);
 const labels=['Sobre mim','Projetos','Contato'];labels.forEach((label,i)=>{const y=68+i*185;if(screenIcons[i].complete&&screenIcons[i].naturalWidth){c.imageSmoothingEnabled=false;c.drawImage(screenIcons[i],62,y,70,70);c.imageSmoothingEnabled=true}c.fillStyle='#fff';c.font='bold 25px Tahoma, Arial';c.textAlign='center';c.shadowColor='#18313a';c.shadowBlur=3;c.fillText(label,97,y+108);c.shadowBlur=0});
 c.fillStyle='#c0c0c0';c.fillRect(270,280,840,438);c.strokeStyle='#fff';c.lineWidth=4;c.strokeRect(270,280,840,438);c.strokeStyle='#404040';c.strokeRect(274,284,832,430);
 const g=c.createLinearGradient(278,0,1100,0);g.addColorStop(0,'#000080');g.addColorStop(1,'#1a89c3');c.fillStyle=g;c.fillRect(278,288,824,50);c.fillStyle='#fff';c.font='bold 26px Tahoma, Arial';c.textAlign='left';c.fillText('Meu portfólio',294,322);
 c.fillStyle='#c0c0c0';c.fillRect(1044,296,48,33);c.strokeStyle='#fff';c.strokeRect(1044,296,48,33);c.fillStyle='#111';c.font='bold 30px Arial';c.fillText('×',1058,323);
 c.fillStyle='#fbfbf7';c.fillRect(291,352,798,342);
 if(logo.complete&&logo.naturalWidth)c.drawImage(logo,650,377,80,87);c.textAlign='center';c.fillStyle='#17253c';c.font='800 43px "Nunito Sans",Tahoma,Arial';c.fillText('Explore meu trabalho.',690,518);c.font='26px Tahoma,Arial';c.fillStyle='#34405a';c.fillText('Laura Pontes · Web design e UX/UI',690,562);
 c.fillStyle='#c0c0c0';c.fillRect(474,603,433,61);c.strokeStyle='#fff';c.strokeRect(474,603,433,61);c.strokeStyle='#777';c.strokeRect(478,607,425,53);c.fillStyle='#111';c.font='bold 25px Tahoma,Arial';c.fillText('Entrar no computador  →',690,643);
 c.fillStyle='#c0c0c0';c.fillRect(0,900,1280,60);c.fillStyle='#fff';c.fillRect(0,900,1280,3);c.strokeStyle='#fff';c.strokeRect(8,909,164,42);c.strokeStyle='#555';c.strokeRect(11,912,158,36);c.fillStyle='#111';c.font='bold 27px Tahoma,Arial';c.fillText('Iniciar',90,941);c.font='23px Tahoma,Arial';c.fillText('Meu portfólio',326,940);
 if(boot>0){c.fillStyle=`rgba(227,250,255,${Math.sin(boot*Math.PI)*.38})`;c.fillRect(0,0,w,h)}screenTexture.needsUpdate=true;screenDirty=false;
}
function setup(){
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.shadowMap.type=THREE.VSMShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;host.append(renderer.domElement);const gl=renderer.getContext(),gpuInfo=gl.getExtension('WEBGL_debug_renderer_info');if(gpuInfo)hero.dataset.graphicsRenderer=gl.getParameter(gpuInfo.UNMASKED_RENDERER_WEBGL);
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.1,80);
 const env=new THREE.Scene();env.add(new THREE.Mesh(new THREE.BoxGeometry(30,30,30),new THREE.MeshBasicMaterial({color:'#b8b1bc',side:THREE.BackSide})));
 for(const [x,y,z,sx,sy,sz,intensity]of [[-7,5,4,1,7,5,5],[5,6,-3,3,5,1,3],[0,10,0,8,1,7,3]]){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshBasicMaterial({color:new THREE.Color(intensity,intensity,intensity)}));m.position.set(x,y,z);env.add(m)}
 const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.035).texture;pmrem.dispose();env.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});
 scene.add(new THREE.HemisphereLight('#d3ecff','#977a94',.95));const key=new THREE.DirectionalLight('#ffe3db',3.1);key.position.set(-4,7,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:10,bottom:-7,near:.1,far:35});key.shadow.normalBias=.015;key.shadow.bias=-.00015;key.shadow.radius=3;key.shadow.blurSamples=8;scene.add(key);const fill=new THREE.DirectionalLight('#8fd4e3',1.05);fill.position.set(6,3,2);scene.add(fill);const rim=new THREE.DirectionalLight('#f8a5cb',1.4);rim.position.set(2,5,-3);scene.add(rim);
 computer=new THREE.Group();scene.add(computer);computer.rotation.y=-.32;
 const built=createHeroScene({THREE,scene,computer,screenTexture});screen=built.screen;floaters.push(...built.floaters);sceneLayout=built.setCompact||(()=>{});sceneReady=true;
 hero.dataset.sceneTriangles=String(Math.round(built.stats.triangleCount));
 drawScreen();resize();requestTick();
}
function cameraHome(){const mobile=innerWidth<700,aspect=host.clientWidth/host.clientHeight;const z=mobile?Math.max(13.7,8.8/aspect):12.7;camera.position.set(0,3.5,z);camera.lookAt(0,mobile?2.32:2.38,0)}
function resize(){if(!sceneReady||inside)return;sceneLayout(innerWidth<700);renderer.shadowMap.needsUpdate=true;const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(!transition)cameraHome();requestTick()}
function requestTick(){if(sceneReady&&!raf&&!document.hidden&&!inside)raf=requestAnimationFrame(tick)}
function tick(now){raf=0;if(!sceneReady||document.hidden||inside)return;const time=now*.001;if(!paused&&!transition){for(const f of floaters){f.mesh.position.y=f.y+Math.sin(time*.8+f.seed)*.065;f.mesh.rotation.y=Math.sin(time*.5+f.seed)*.06;f.mesh.rotation.z=Math.sin(time*.55+f.seed)*.025}computer.rotation.x=0}
 if(transition){const p=Math.min(1,(now-transition.start)/transition.duration),e=p*p*(3-2*p);camera.position.lerpVectors(transition.from,transition.to,e);const look=new THREE.Vector3().lerpVectors(transition.look,transition.toLook,e);camera.lookAt(look);const nextBoot=p<.25?p*4:0;if(nextBoot!==boot){boot=nextBoot;screenDirty=true;}hero.style.opacity=String(1-THREE.MathUtils.smoothstep(p,.78,1));if(p===1){finishEntry();return}}
 if(screenDirty)drawScreen();if(shadowYaw===null||Math.abs(computer.rotation.y-shadowYaw)>.00005){renderer.shadowMap.needsUpdate=true;shadowYaw=computer.rotation.y}renderer.render(scene,camera);lastTime=now;measuredFrames++;if(!measurementStart)measurementStart=now;if(now-measurementStart>=2000){hero.dataset.renderFps=String(Math.round(measuredFrames*1000/(now-measurementStart)));hero.dataset.drawCalls=String(renderer.info.render.calls);measuredFrames=0;measurementStart=now}if(!paused||transition)requestTick();
}
function enter(section){
 if(transition||inside)return;
 // The system preference reduces ambient motion. Enter is an intentional zoom;
 // a visitor's explicit pause choice disables both ambient and entry animations.
 const duration=motionPreference==='off'?0:1450;
 sound.playStartup(duration===0?0:.72);enterButton.disabled=true;
 const entryRect=hero.getBoundingClientRect();hero.classList.add('is-entering');
 Object.assign(hero.style,{top:entryRect.top+'px',left:entryRect.left+'px',width:entryRect.width+'px',height:entryRect.height+'px',bottom:'auto',right:'auto'});
 desktopRoot.hidden=false;desktopRoot.inert=true;
 hero.dataset.entryDuration=String(sceneReady?duration:0);
 if(!sceneReady||duration===0){transition={section};finishEntry();return}
 const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),distance=Math.min(2.72/(2*tangent*camera.aspect),2.04/(2*tangent))*.96;
 transition={start:performance.now(),duration,section,from:camera.position.clone(),to:computer.localToWorld(new THREE.Vector3(0,2.5,1.05+distance)),toLook:computer.localToWorld(new THREE.Vector3(0,2.5,1.05)),look:new THREE.Vector3(0,innerWidth<700?2.32:2.38,0),rotation:computer.rotation.y};
 requestTick();
}
function finishEntry(){measuredFrames=0;measurementStart=0;const section=transition?.section||'welcome';inside=true;transition=null;hero.hidden=true;hero.inert=true;desktopRoot.inert=false;sound.setScene('desktop');desktop.enter(section);if(raf)cancelAnimationFrame(raf);raf=0}
function leave(){sound.setScene('hero');inside=false;transition=null;desktopRoot.hidden=true;hero.hidden=false;hero.inert=false;hero.style.opacity='';hero.classList.remove('is-entering');for(const property of ['top','left','width','height','bottom','right'])hero.style.removeProperty(property);enterButton.disabled=false;boot=0;screenDirty=true;if(sceneReady){computer.rotation.set(0,-.32,0);cameraHome()}resize();updateRoute(null);enterButton.focus({preventScroll:true});requestTick()}
function restoreRoute(){
 // Back/forward can emit both popstate and hashchange for the same navigation.
 if(handledLocation===location.href)return;
 const route=routeFromHash();
 if(route&&location.hash!=='#'+route)history.replaceState(null,'',location.pathname+location.search+'#'+route);
 handledLocation=location.href;restoringRoute=true;
 try{
  if(!route){if(inside)desktop.exit();else if(transition)leave();return}
  sound.setScene('desktop');
  const section=route==='desktop'?'welcome':route;
  if(inside)desktop.open(section);
  else{transition={section};finishEntry()}
 }finally{restoringRoute=false}
}
enterButton.addEventListener('click',()=>enter());document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>enter(b.dataset.open)));
function setPaused(value){paused=value;measuredFrames=0;measurementStart=0;hero.classList.toggle('is-paused',paused);hero.classList.toggle('has-motion',!paused);motionButton.setAttribute('aria-pressed',String(paused));motionButton.innerHTML=paused?'Retomar movimento <span aria-hidden="true">▷</span>':'Pausar movimento <span aria-hidden="true">Ⅱ</span>';requestTick()}
motionButton.addEventListener('click',()=>{motionPreference=paused?'on':'off';try{localStorage.setItem('laura-motion',motionPreference)}catch{}setPaused(!paused)});
reduced.addEventListener('change',()=>{if(motionPreference===null)setPaused(reduced.matches)});setPaused(paused);
host.addEventListener('pointermove',e=>{if(!sceneReady||transition)return;const r=host.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));ray.setFromCamera(pointer,camera);hover=pointsAtMonitor();host.classList.toggle('is-hover',hover);requestTick()});host.addEventListener('pointerleave',()=>{pointer.set(0,0);hover=false;host.classList.remove('is-hover')});host.addEventListener('click',e=>{if(!sceneReady)return;const r=host.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),camera);if(pointsAtMonitor())enter()});
addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;measuredFrames=0;measurementStart=0}else requestTick()});
try{setup()}catch(error){sceneReady=false;cancelAnimationFrame(raf);raf=0;renderer?.dispose();console.warn('3D preview unavailable:',error.message);document.querySelector('#aero-status').hidden=false;host.hidden=true}
addEventListener('popstate',restoreRoute);addEventListener('hashchange',restoreRoute);restoreRoute();
document.fonts.ready.then(()=>{screenDirty=true;requestTick()});










