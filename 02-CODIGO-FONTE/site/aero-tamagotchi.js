/* Local toy: a Blender render and a purpose-made sprite share one coordinate grid. */
const heartPixels=['01100110','11111111','11111111','01111110','00111100','00011000'];
const starPixels=['0001000','0001000','0011100','1111111','0011100','0001000','0001000'];
const lcdPalette=[[46,61,44],[91,111,75],[148,168,115],[207,218,170]];

export function mountTamagotchi(element){
 if(!element)throw new TypeError('mountTamagotchi requires a host element');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let alive=true,frame=0,resetTimer=0,latestPaint=0,affection=1,idea=0,inView=true;
 let ready=false,effect=null,colorMode=false,mood='curiosa';
 const ideas=['Primeiro, um rascunho.','E se a gente tentasse outra cor?','Um botão, uma ação clara.','Mais espaço para respirar.'];
 element.innerHTML=`
  <section class="tg-layout" aria-label="Meu Tamagotchi">
   <div class="tg-stage"><div class="tg-device">
    <img class="tg-device-art" src="assets/tamagotchi/device-v4.webp?v=2" width="1200" height="1400" alt="" draggable="false" decoding="async">
    <span class="tg-brand" aria-hidden="true">LAURA.EXE</span>
    <div class="tg-screen"><canvas class="tg-portrait" width="96" height="96" role="img" aria-label="Avatar de Laura em pixel art, na tela LCD clássica"></canvas><span class="tg-lcd-glass" aria-hidden="true"></span></div>
    <div class="tg-device-buttons" role="group" aria-label="Controles do Tamagotchi">
     <button type="button" class="tg-button tg-care" data-tg="care" aria-label="Dar carinho à Laura" title="Carinho"><span class="tg-button-press" aria-hidden="true"></span><span class="tg-button-label">Carinho</span></button>
     <button type="button" class="tg-button tg-create" data-tg="create" aria-label="Mostrar uma ideia" title="Mostrar uma ideia"><span class="tg-button-press" aria-hidden="true"></span><span class="tg-button-label">Ideia</span></button>
     <button type="button" class="tg-button tg-reset" data-tg="reset" aria-label="Reset: reiniciar o Tamagotchi" title="Reiniciar"><span class="tg-button-press" aria-hidden="true"></span><span class="tg-button-label">Reset</span></button>
    </div>
   </div></div>
   <div class="tg-copy">
    <p class="tg-kicker">UM POUCO DE NOSTALGIA</p><h1>Laura em pixels.</h1>
    <p class="tg-description">Uma versão de bolso de mim, com um toque de nostalgia.</p>
    <p class="tg-instruction">Use os botões para dar carinho, ver uma ideia ou reiniciar.</p>
    <div class="tg-feedback"><span class="tg-state">Humor: <strong>curiosa</strong></span><p class="tg-caption" role="status" aria-live="polite" aria-atomic="true">Oi! Que bom ver você por aqui.</p></div>
    <label class="tg-color-toggle"><input type="checkbox" data-tg-color><span>Tela colorida</span></label>
    <p class="tg-mode-note">LCD clássico · avatar em pixels</p>
   </div>
  </section>`;
 const canvas=element.querySelector('.tg-portrait'),context=canvas.getContext('2d',{alpha:false});
 context.imageSmoothingEnabled=false;
 const colorSprite=document.createElement('canvas'),lcdSprite=document.createElement('canvas');
 colorSprite.width=colorSprite.height=lcdSprite.width=lcdSprite.height=64;
 const spriteContext=colorSprite.getContext('2d',{willReadFrequently:true}),lcdContext=lcdSprite.getContext('2d');
 const image=new Image(),shell=element.querySelector('.tg-device-art');
 shell.onerror=()=>{if(alive)element.querySelector('.tg-device').classList.add('tg-render-unavailable')};
 image.onload=()=>{
  if(!alive)return;
  // Contain the complete transparent bust, retaining hair and shoulders.
  const fit=Math.min(64/image.naturalWidth,64/image.naturalHeight),width=image.naturalWidth*fit,height=image.naturalHeight*fit;
  spriteContext.imageSmoothingEnabled=false;spriteContext.clearRect(0,0,64,64);
  spriteContext.drawImage(image,(64-width)/2,(64-height)/2,width,height);
  const pixels=spriteContext.getImageData(0,0,64,64);
  for(let p=0;p<pixels.data.length;p+=4){
   if(!pixels.data[p+3])continue;
   const value=.2126*pixels.data[p]+.7152*pixels.data[p+1]+.0722*pixels.data[p+2],shade=lcdPalette[value<61?0:value<128?1:value<188?2:3];
   pixels.data[p]=shade[0];pixels.data[p+1]=shade[1];pixels.data[p+2]=shade[2];pixels.data[p+3]=pixels.data[p+3]<96?0:255;
  }
  lcdContext.putImageData(pixels,0,0);ready=true;paint(0);
 };
 image.onerror=()=>{if(alive){canvas.setAttribute('aria-label','Avatar de Laura indisponível');paint(0)}};
 image.src='assets/tamagotchi/laura-avatar-v1.webp';
 function sprite(pattern,x,y,color,alpha=1){
  context.globalAlpha=alpha;context.fillStyle=color;
  pattern.forEach((row,j)=>[...row].forEach((pixel,i)=>{if(pixel==='1')context.fillRect(Math.round(x)+i,Math.round(y)+j,1,1)}));context.globalAlpha=1;
 }
 function paint(progress){
  if(!alive)return;
  context.fillStyle=colorMode?'#c6d7b4':'#bccb9c';context.fillRect(0,0,96,96);
  context.fillStyle=colorMode?'#445649':'#495d3e';context.font='bold 6px monospace';context.textAlign='left';context.textBaseline='top';context.fillText('LAURA',5,3);
  for(let i=0;i<3;i++)sprite(heartPixels,65+i*10,3,colorMode?'#a85279':'#496039',i<affection?1:.18);
  if(ready)context.drawImage(colorMode?colorSprite:lcdSprite,16,17,64,64);
  else{context.font='bold 8px monospace';context.textAlign='center';context.fillText('LAURA',48,42)}
  context.fillStyle=colorMode?'#445649':'#495d3e';context.font='5px monospace';context.textAlign='left';context.fillText(mood.toUpperCase(),4,88);
  if(!effect)return;
  const lift=reduce.matches?0:Math.round(progress*12),alpha=reduce.matches?1:Math.min(1,(1-progress)*3),pattern=effect==='care'?heartPixels:starPixels;
  const effectColor=colorMode?(effect==='care'?'#c5608b':'#fff6b3'):'#435c36';
  sprite(pattern,6,47-lift,effectColor,alpha);sprite(pattern,82,30-lift,effectColor,alpha);
  if(effect==='create')sprite(starPixels,7,19-lift*.3,colorMode?'#b4ffef':'#5a7048',alpha);
 }
 function stopAnimation(){cancelAnimationFrame(frame);clearTimeout(resetTimer);frame=0;resetTimer=0;effect=null}
 function animate(kind){
  stopAnimation();effect=kind;if(document.hidden||!inView){effect=null;paint(0);return}
  if(reduce.matches){paint(0);resetTimer=setTimeout(()=>{effect=null;paint(0)},900);return}
  const start=performance.now();latestPaint=0;
  function step(now){
   if(!alive||document.hidden||!inView)return;
   const progress=Math.min(1,(now-start)/1050);
   if(now-latestPaint>1000/24||progress===1){paint(progress);latestPaint=now}
   if(progress<1)frame=requestAnimationFrame(step);else{frame=0;effect=null;paint(0)}
  }
  frame=requestAnimationFrame(step);
 }
 function status(nextMood,caption){mood=nextMood;element.querySelector('.tg-caption').textContent=caption;element.querySelector('.tg-state strong').textContent=mood}
 function click(event){
  const button=event.target.closest('[data-tg]');if(!button||!element.contains(button))return;
  if(button.dataset.tg==='care'){affection=Math.min(3,affection+1);status('feliz','Carinho recebido. Obrigada pela visita!');animate('care')}
  else if(button.dataset.tg==='create'){status('inspirada',ideas[idea++%ideas.length]);animate('create')}
  else{stopAnimation();affection=1;idea=0;status('curiosa','Oi! Que bom ver você por aqui.');paint(0)}
 }
 function change(event){
  if(!event.target.matches('[data-tg-color]'))return;colorMode=event.target.checked;
  element.querySelector('.tg-screen').classList.toggle('tg-color-screen',colorMode);
  element.querySelector('.tg-mode-note').textContent=colorMode?'Paleta original do avatar':'LCD clássico · avatar em pixels';
  canvas.setAttribute('aria-label',`Avatar de Laura em pixel art, ${colorMode?'colorido':'na tela LCD clássica'}`);paint(0);
 }
 function motionChanged(){if(reduce.matches){stopAnimation();paint(0)}}
 function visibilityChanged(){if(document.hidden){stopAnimation();paint(0)}}
 const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(!inView){stopAnimation();paint(0)}},{threshold:.01});
 observer.observe(element);element.addEventListener('click',click);element.addEventListener('change',change);reduce.addEventListener('change',motionChanged);document.addEventListener('visibilitychange',visibilityChanged);paint(0);
 return()=>{alive=false;stopAnimation();observer.disconnect();image.onload=null;image.onerror=null;shell.onerror=null;element.removeEventListener('click',click);element.removeEventListener('change',change);reduce.removeEventListener('change',motionChanged);document.removeEventListener('visibilitychange',visibilityChanged)};
}
