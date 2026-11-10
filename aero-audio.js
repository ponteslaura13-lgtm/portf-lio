// Local hero soundtrack; an intentional gesture retries browser-blocked autoplay.
export function initPortfolioAudio({button,musicUrl=null}){
 let muted=false,context=null,buffer=null,loading=null,source=null;
 let inDesktop=false,entering=false,startupRequest=0,musicRequest=0,needsGesture=true,musicFailed=false;
 try{muted=localStorage.getItem('laura-sound')==='off'}catch{}
 const music=musicUrl?document.createElement('audio'):null;
 const canPlayMusic=()=>Boolean(music&&!muted&&!inDesktop&&!entering&&!document.hidden&&!musicFailed);
 function musicState(value){if(music)music.dataset.state=value;button.dataset.musicState=value}
 function announce(){
  button.setAttribute('aria-pressed',String(muted));button.setAttribute('aria-label',muted?'Ativar som':'Desativar som');button.title=muted?'Ativar som':'Desativar som';
  button.innerHTML=`<img src="assets/windows/speaker.png" alt="" width="16" height="16"> Som: ${muted?'desligado':'ligado'}`;
  window.dispatchEvent(new CustomEvent('portfolio-sound-state',{detail:{muted}}));
 }
 function pauseMusic(reason='paused'){
  musicRequest++;
  if(music){music.pause();music.dataset.pauseReason=reason}
  musicState(musicFailed?'error':reason);
 }
 async function tryMusic(reason='resume'){
  if(!canPlayMusic())return;
  if(!music.paused){needsGesture=false;musicState('playing');return}
  const request=++musicRequest;music.dataset.playReason=reason;musicState('starting');
  try{
   await music.play();
   // A stale resolution must not interrupt a newer, valid attempt.
   if(request!==musicRequest){if(!canPlayMusic())music.pause();return}
   if(!canPlayMusic()){pauseMusic(entering?'entering':inDesktop?'desktop':muted?'muted':'hidden');return}
   needsGesture=false;musicState('playing');
  }catch(error){
   if(request!==musicRequest||!canPlayMusic())return;
   if(error?.name==='NotAllowedError'){needsGesture=true;musicState('awaiting-interaction')}
   else if(error?.name==='AbortError'){musicState('paused')}
   else{musicFailed=true;musicState('error');music.dataset.error=error?.name||'playback-unavailable'}
  }
 }
 if(music){
  music.id='hero-background-music';music.loop=true;music.volume=.08;music.preload='metadata';music.autoplay=true;music.muted=muted;music.controls=false;
  music.setAttribute('playsinline','');music.setAttribute('aria-hidden','true');music.dataset.volume='0.08';music.dataset.state='idle';
  music.addEventListener('play',()=>{if(!canPlayMusic())pauseMusic(entering?'entering':inDesktop?'desktop':muted?'muted':'hidden')});
  music.addEventListener('playing',()=>{if(!canPlayMusic()){pauseMusic(entering?'entering':inDesktop?'desktop':muted?'muted':'hidden');return}needsGesture=false;musicState('playing')});
  music.addEventListener('waiting',()=>{if(canPlayMusic()&&!music.paused)musicState('buffering')});
  music.addEventListener('error',()=>{musicFailed=true;music.dataset.error=String(music.error?.code||'media-unavailable');pauseMusic('error')});
  music.src=musicUrl;document.body.append(music);
 }
 function stopStartup(){
  startupRequest++;const current=source;source=null;try{current?.stop()}catch{}button.dataset.playback='stopped';
 }
 function prepare(){
  if(!context){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return Promise.resolve(null);try{context=new Ctx()}catch{return Promise.resolve(null)}}
  if(buffer)return Promise.resolve(buffer);
  if(!loading)loading=fetch('assets/windows/startup.wav').then(r=>{if(!r.ok)throw Error('Startup sound unavailable');return r.arrayBuffer()}).then(data=>context.decodeAudioData(data)).then(value=>buffer=value).catch(()=>{loading=null;return null});
  return loading;
 }
 async function playStartup(delay=.7){
  // Block music synchronously, before the camera transition calls setScene().
  entering=true;pauseMusic('entering');stopStartup();
  if(muted||document.hidden)return;
  const request=startupRequest;const ready=prepare();context?.resume().catch(()=>{});const sound=await ready;
  if(!sound||muted||!context||document.hidden||request!==startupRequest)return;
  const current=context.createBufferSource();current.buffer=sound;const gain=context.createGain();gain.gain.value=.24;current.connect(gain);gain.connect(context.destination);source=current;
  current.onended=()=>{gain.disconnect();if(source===current){source=null;button.dataset.playback='ended'}};
  current.start(context.currentTime+delay);button.dataset.playback='started';button.dataset.audioDuration=sound.duration.toFixed(2);
 }
 function toggle(){
  muted=!muted;try{localStorage.setItem('laura-sound',muted?'off':'on')}catch{}
  if(music)music.muted=muted;
  if(muted){stopStartup();pauseMusic('muted')}
  else{prepare();context?.resume().catch(()=>{});tryMusic('unmute')}
  announce();
 }
 function setScene(name){
  inDesktop=name==='desktop';entering=false;
  if(inDesktop)pauseMusic('desktop');
  else{stopStartup();tryMusic('hero')}
 }
 function intentionalInteraction(event){
  if(!needsGesture||!canPlayMusic()||event.isTrusted===false)return;
  if(event.type==='pointerdown'&&event.button!==0)return;
  if(event.type==='keydown'&&(event.repeat||event.isComposing||['Shift','Control','Alt','Meta','CapsLock'].includes(event.key)))return;
  // Entry and mute controls decide their own sound behavior in their click handler.
  if(event.target instanceof Element&&event.target.closest('#aero-enter,#aero-sound,[data-open],[data-action="sound"]'))return;
  tryMusic('interaction');
 }
 button.addEventListener('click',toggle);window.addEventListener('portfolio-sound-toggle',toggle);window.addEventListener('portfolio-sound-query',announce);
 document.addEventListener('pointerdown',intentionalInteraction,{capture:true,passive:true});document.addEventListener('keydown',intentionalInteraction,{capture:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopStartup();pauseMusic('hidden')}else tryMusic('visible')});
 announce();if(music){if(muted)pauseMusic('muted');else tryMusic('autoplay')}
 return {playStartup,setScene,muted:()=>muted};
}
