/* A classic Windows desktop with native, readable portfolio content. */
const sections = {
  welcome: { name: 'Meu portfólio', icon: 'home' },
  sobre: { name: 'Sobre mim', icon: 'person' },
  projetos: { name: 'Projetos', icon: 'folder' },
  experiencia: { name: 'Experiência e formação', icon: 'document' },
  servicos: { name: 'Serviços', icon: 'tools' },
  contato: { name: 'Contato', icon: 'mail' },
  tamagotchi: { name: 'Tamagotchi da Laura', icon: 'game' }
};
const projectItems = [
  ['Solé Café','Branding · Identidade visual','sole','257837691/Sol-Caf-Branding-Visual-Identity','Identidade visual para uma cafeteria, com aplicações da marca em embalagens e materiais de comunicação.'],
  ['MSS Engenharia','Web design · Experiência digital','mss','257214365/MSS-Engenharia-Website-Digital-Experience','Website para apresentar a MSS Engenharia, seus projetos e serviços em uma experiência de navegação visual.'],
  ['OMY','UX/UI · Redesign conceitual','omy','256887011/OMY-Jewelry-Website-Redesign-UXUI-Web-Experience','Redesign conceitual de um site de joias, com pesquisa, organização das interfaces e documentação para desenvolvimento.'],
  ['MORA','UX/UI · Estudo autoral','mora','255126133/MORA-UXUI-Case-Study','Estudo autoral sobre a primeira compra de um imóvel, com proposta de experiência digital e plano de validação.'],
  ['Jamly','UX/UI · Colaboração musical','jamly','254522915/Jamly-Music-Collaboration-Platform-UXUI-Case-Study','Estudo autoral de uma plataforma para conectar músicos e facilitar a descoberta de parceiros para criar juntos.'],
  ['Moça Bonita Store','Design digital · Banners','moca-bonita','242329263/Web-Banners-Moca-Bonita-Store-Semi-Joias','Banners para uma loja de semijoias, com destaque para os produtos e as chamadas da vitrine digital.'],
  ['Beauty Heals','Design digital · Banners','beauty-heals','240646883/Beauty-Heals-Web-Banners','Banners que apresentam produtos de beleza em composições voltadas ao universo do autocuidado.'],
  ['L’ARRËE Cosméticos','Design digital · Banners','larree','240644887/LARREE-Cosmticos-Web-Banners','Conjunto de seis banners para e-commerce de cosméticos, com composição editorial e destaque para os produtos.'],
  ['Itaú Saúde e Bem-Estar','UX/UI · Projeto acadêmico','itau-saude','233357083/Itau-Saude-e-Bem-Estar','Projeto acadêmico de UX/UI que explora uma experiência digital voltada à saúde e ao bem-estar.'],
  ['Synk','UX/UI · Estudo autoral','synk','230775125/Synk-UXUI-para-quem-vive-no-ritmo-da-musica','Conceito de aplicativo para descobrir eventos de música eletrônica e explorar a jornada de escolha de ingressos.']
];
function icon(type) {
  const files={home:'computer',person:'user',folder:'folder',document:'document',tools:'paint',mail:'mail',game:'game',speaker:'speaker'};
  return `<img class="ad-system-icon" src="assets/windows/${files[type]||'folder'}.png" width="32" height="32" alt="" draggable="false">`;
}
const action = (name, label, cls='') => `<button type="button" class="ad-button ${cls}" data-open="${name}">${label}<span aria-hidden="true">→</span></button>`;
const contactEmail = 'ponteslaura13@gmail.com';
function content(name) {
  if (name === 'welcome') return `<div class="ad-welcome"><div class="ad-welcome-badge"><img class="ad-welcome-logo" src="assets/coruja-preta.webp" alt="Logo de Laura Pontes" width="90" height="90"></div><p class="ad-kicker">LAURA PONTES · PORTFÓLIO</p><h1>Explore meu trabalho.</h1><p>Aqui você encontra meus projetos, minha trajetória e os serviços que ofereço. Escolha por onde começar.</p><div class="ad-actions">${action('projetos','Ver meus projetos','ad-button-primary')}${action('sobre','Sobre mim')}</div><button class="ad-pet-invite" data-open="tamagotchi" type="button">${icon('game')}<span>Uma pausa para a nostalgia?<small>Conheça minha versão em pixels.</small></span><b aria-hidden="true">→</b></button><p class="ad-small">Abra uma pasta ou use o menu Iniciar para navegar.</p></div>`;
  if (name === 'sobre') return `<article class="ad-article"><div class="ad-about-heading"><div><p class="ad-kicker">POR TRÁS DAS TELAS</p><h1>Oi, eu sou a Laura.</h1><p class="ad-lead">Sou designer de Marília, no interior de São Paulo.</p></div><img class="ad-portrait" src="assets/laura-profile.webp" width="160" height="160" alt="Retrato de Laura Pontes"></div><p>Trabalho com web design, UX/UI e identidade visual. Meu processo passa pela organização das informações, pelo desenho das telas e pelos detalhes que orientam cada interação.</p><p>Gosto de aproximar identidade e usabilidade: cuidar de como um projeto se apresenta e de como as pessoas encontram o que precisam.</p><div class="ad-tags"><span>Web design</span><span>UX/UI</span><span>Identidade visual</span></div><div class="ad-actions">${action('projetos','Ver meus projetos','ad-button-primary')}${action('contato','Ver contatos')}</div></article>`;
  if (name === 'tamagotchi') return `<article class="ad-pet-page"><h1 class="ad-sr">Tamagotchi da Laura</h1><div class="ad-pet-mount" data-tamagotchi-mount><p role="status">Abrindo o Tamagotchi…</p></div></article>`;
  if (name === 'projetos') return `<article class="ad-article ad-projects"><p class="ad-kicker">SELEÇÃO DE TRABALHOS</p><h1>Meus projetos</h1><p>Identidades visuais, sites e interfaces. Abra um projeto para ver o trabalho completo no Behance, em outra aba.</p><div class="ad-project-grid">${projectItems.map(p=>`<a class="ad-project" href="https://www.behance.net/gallery/${p[3]}" target="_blank" rel="noopener noreferrer"><div class="ad-project-image"><img src="assets/${p[2]}.webp" alt="" loading="lazy" decoding="async" width="550" height="367"></div><h2>${p[0]} <span aria-hidden="true">↗</span></h2><p class="ad-project-kind">${p[1]}</p><p class="ad-project-description">${p[4]}</p><span class="ad-sr"> — abrir no Behance em outra aba</span></a>`).join('')}</div><a class="ad-button ad-more" href="https://www.behance.net/laurapontes3" target="_blank" rel="noopener noreferrer">Ver mais projetos no Behance <span aria-hidden="true">↗</span></a></article>`;
  if (name === 'experiencia') return `<article class="ad-article ad-resume">
   <p class="ad-kicker">TRAJETÓRIA E REPERTÓRIO</p><h1>Experiência e formação</h1>
   <p class="ad-lead">Minha trajetória reúne criação de marcas, interfaces digitais e organização de projetos.</p>
   <section class="ad-resume-work" aria-labelledby="resume-freelance"><p class="ad-resume-label">EXPERIÊNCIA PROFISSIONAL</p><h2 id="resume-freelance">Freelancer desde 2021</h2><p class="ad-resume-meta">Design gráfico e identidade visual · Marília/SP</p><p>Conduzo projetos do briefing à entrega, conectando pesquisa visual, conceito e aplicações da marca.</p><ul><li>Identidades visuais: logotipo, cores, tipografia e manual de uso.</li><li>Materiais impressos, embalagens, sinalização e comunicação digital.</li><li>Organização das entregas e acompanhamento em contato com o cliente.</li></ul></section>
   <section aria-labelledby="resume-education"><h2 id="resume-education" class="ad-resume-section-title">Formação acadêmica</h2><div class="ad-education"><section><span>EBAC · fev–out/2025</span><h3>UX/UI e Produtos Digitais</h3><p>Pós-graduação concluída</p></section><section><span>Univem · jan/2023–jan/2025</span><h3>Design Gráfico</h3><p>Tecnólogo concluído</p></section></div></section>
   <section aria-labelledby="resume-practice"><h2 id="resume-practice" class="ad-resume-section-title">O que levo para os projetos</h2><dl class="ad-resume-practice"><div><dt>Identidade e direção visual</dt><dd>Conceito, composição, tipografia e aplicações que mantêm a marca coerente em diferentes formatos.</dd></div><div><dt>Experiência e interfaces</dt><dd>Pesquisa, organização de conteúdo, fluxos e protótipos para web e mobile, com aplicação em estudos autorais e acadêmicos.</dd></div><div><dt>Sistemas e documentação</dt><dd>Componentes, variantes, estados e tokens no Figma, com documentação para orientar a continuidade e o desenvolvimento.</dd></div></dl><p class="ad-resume-tools"><strong>Ferramentas de criação</strong> Figma, Illustrator, Photoshop, InDesign, Lightroom e Adobe XD. Também estudo animação e modelagem 3D no Blender.</p></section>
   <div class="ad-resume-details"><details><summary>Cursos complementares <span>7 cursos</span></summary><div class="ad-course-groups"><section><h3>2025 · EBAC</h3><ul><li>Figma Aplicado</li><li>Inteligência Artificial</li></ul></section><section><h3>2024 · Udemy</h3><ul><li>Blender 3.0: Product Animation MasterClass</li><li>UI & UX Design de Aplicativos e Sites (Adobe XD e PSD 2024)</li></ul></section><section><h3>2023 · Udemy</h3><ul><li>Figma: Design de Interfaces do Zero ao Profissional</li><li>UX & Design Thinking: Experiência do Usuário nos Negócios</li><li>UX Design de A a Z: Tudo sobre Experiência do Usuário</li></ul></section></div></details>
   <details><summary>Experiência complementar <span>IBGE</span></summary><h3>Agente Censitária Municipal</h3><p class="ad-resume-meta">Jun–nov/2022 · IBGE · Guaimbê/SP</p><p>Coordenei rotinas de coleta, cronogramas e distribuição de tarefas, com foco em planejamento, comunicação da equipe e acompanhamento de processos.</p></details></div>
   <div class="ad-actions">${action('projetos','Ver meus projetos','ad-button-primary')}${action('contato','Ver contatos')}</div>
  </article>`;
  if (name === 'servicos') return `<article class="ad-article"><p class="ad-kicker">COMO POSSO AJUDAR</p><h1>Meus serviços</h1><dl class="ad-services"><div><dt>Identidade visual</dt><dd>Crio a linguagem visual da marca, com cores, tipografia e aplicações que mantêm sua identidade nos diferentes materiais.</dd></div><div><dt>Web design</dt><dd>Desenho a estrutura e o visual de sites e portfólios, com layouts adaptados a computador e celular.</dd></div><div><dt>Design de interfaces · UI</dt><dd>Desenho telas, componentes e estados de interação para orientar o uso de sites e aplicativos.</dd></div><div><dt>Experiência do usuário · UX</dt><dd>Pesquiso necessidades, organizo conteúdos e desenho fluxos e protótipos para avaliar a navegação.</dd></div></dl>${action('contato','Ver formas de contato','ad-button-primary')}</article>`;
  return `<article class="ad-article ad-contact"><p class="ad-kicker">CONTATO</p><h1>Vamos conversar?</h1><p class="ad-lead">Tem um projeto ou uma oportunidade em mente?</p><p>Me conte o que você precisa criar. Se já tiver um objetivo ou prazo definido, pode incluir essas informações na mensagem.</p><div class="ad-actions ad-contact-actions"><div><a class="ad-button ad-button-primary" href="https://www.linkedin.com/in/lauraspontes" target="_blank" rel="noopener noreferrer" aria-describedby="contact-linkedin-hint">Ver meu perfil no LinkedIn <span aria-hidden="true">↗</span></a><p class="ad-contact-hint" id="contact-linkedin-hint">Abre meu perfil em outra aba.</p></div><div><button type="button" class="ad-button" data-action="email-choices" aria-expanded="false" aria-controls="contact-email-options" aria-describedby="contact-email-hint">Escrever por e-mail</button><p class="ad-contact-hint" id="contact-email-hint">Escolha Gmail, Outlook ou seu aplicativo.</p></div></div>
   <section class="ad-email-options" id="contact-email-options" aria-labelledby="contact-email-options-title" hidden><h2 id="contact-email-options-title">Escolha como escrever</h2><p>Uma nova mensagem será aberta com meu endereço preenchido.</p><div class="ad-email-option-links"><a class="ad-button" href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=ponteslaura13%40gmail.com" target="_blank" rel="noopener noreferrer">Abrir no Gmail <span aria-hidden="true">↗</span></a><a class="ad-button" href="https://outlook.live.com/mail/0/deeplink/compose?to=ponteslaura13%40gmail.com" target="_blank" rel="noopener noreferrer">Abrir no Outlook <span aria-hidden="true">↗</span></a><a class="ad-button" href="mailto:ponteslaura13@gmail.com">Usar aplicativo de e-mail</a></div><p class="ad-email-options-note">Gmail e Outlook abrem em outra aba. A opção de aplicativo precisa de um programa de e-mail configurado no dispositivo.</p></section>
   <div class="ad-contact-address"><p>Meu endereço de e-mail:</p><span class="ad-email" id="contact-email-address" data-email-address tabindex="-1">${contactEmail}</span><button type="button" class="ad-button ad-copy-email" data-action="copy-email">Copiar e-mail</button><p class="ad-email-copy-status" role="status" aria-live="polite" aria-atomic="true"></p></div></article>`;
}

export function initDesktop({root, onExit=()=>{}, onSectionChange=()=>{}}) {
  if (!root) throw new TypeError('initDesktop requires a root element');
  root.classList.add('ad-desktop');root.setAttribute('aria-label','Área de trabalho de Laura Pontes');
  const entries=Object.entries(sections).filter(([id])=>id!=='welcome');
  root.innerHTML = `<div class="ad-wallpaper" aria-hidden="true"></div>
   <div class="ad-desktop-top"><span>Laura Pontes · Meu computador</span><button type="button" class="ad-exit" data-action="exit">← Voltar à entrada</button></div>
   <nav class="ad-icons" aria-label="Pastas do portfólio">${entries.map(([id,s])=>`<button type="button" class="ad-icon" data-open="${id}">${icon(s.icon)}<span>${s.name}</span></button>`).join('')}</nav>
   <section class="ad-window" aria-labelledby="ad-window-title" hidden>
    <header class="ad-titlebar"><span class="ad-window-icon"></span><h2 id="ad-window-title"></h2><div class="ad-window-controls"><button type="button" data-action="minimize" aria-label="Minimizar janela" title="Minimizar">−</button><button type="button" data-action="maximize" aria-label="Maximizar janela" title="Maximizar">□</button><button type="button" class="ad-close" data-action="close" aria-label="Fechar janela" title="Fechar">×</button></div></header>
    <nav class="ad-menubar" aria-label="Navegação da janela"><button type="button" data-action="home">Início</button><button type="button" data-open="sobre">Sobre mim</button><button type="button" data-open="projetos">Projetos</button><button type="button" data-open="contato">Contato</button></nav>
    <div class="ad-toolbar"><span class="ad-address-label">Endereço</span><div class="ad-address">${icon('folder')}<span>Portfólio</span><b aria-hidden="true">›</b><span class="ad-address-name"></span></div></div>
    <div class="ad-window-body" tabindex="-1"></div><footer class="ad-statusbar"><span class="ad-status-name"></span><span>Laura Pontes</span></footer>
   </section>
   <div class="ad-start-menu" id="ad-start-menu" hidden><aside aria-hidden="true">Laura <b>Pontes</b></aside><div class="ad-start-main"><header><img src="assets/coruja-preta.webp" width="38" height="38" alt=""><span>Meu portfólio<small>Web design · UX/UI · Marcas</small></span></header><nav aria-label="Menu Iniciar">${entries.map(([id,s])=>`<button type="button" data-open="${id}">${icon(s.icon)}<span>${s.name}</span></button>`).join('')}</nav><footer><button type="button" data-action="exit">${icon('home')}<span>Voltar à entrada</span></button></footer></div></div>
   <footer class="ad-taskbar"><button type="button" class="ad-start" aria-expanded="false" aria-controls="ad-start-menu" data-action="start"><img src="assets/coruja-preta.webp" alt="" width="25" height="25"><span>Iniciar</span></button><span class="ad-task-divider" aria-hidden="true"></span><button type="button" class="ad-task" data-action="restore" hidden><span class="ad-task-icon"></span><span class="ad-task-name"></span></button><div class="ad-tray"><button type="button" class="ad-sound" data-action="sound" aria-pressed="false" aria-label="Desativar som" title="Desativar som">${icon('speaker')}<span class="ad-muted-mark" aria-hidden="true">×</span></button><time class="ad-clock"></time></div></footer>`;
  const $=s=>root.querySelector(s), win=$('.ad-window'), menu=$('.ad-start-menu'), start=$('.ad-start'), body=$('.ad-window-body'), task=$('.ad-task'), icons=$('.ad-icons'), titlebar=$('.ad-titlebar');
  let current=null, active=false, clockTimer=null, previousFocus=null, petCleanup=null, openVersion=0, dragging=null;
  function setMenu(show) {menu.hidden=!show;start.setAttribute('aria-expanded',String(show));if(show)menu.querySelector('button').focus()}
  function clock() {const now=new Date();const el=$('.ad-clock');el.dateTime=now.toISOString();el.textContent=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});el.title=now.toLocaleDateString('pt-BR',{dateStyle:'long'})}
  function syncIcons(){icons.inert=innerWidth<=640&&!win.hidden}
  function disposePet(){if(typeof petCleanup==='function')petCleanup();else petCleanup?.destroy?.();petCleanup=null;openVersion++}
  function resetPosition(){win.style.removeProperty('left');win.style.removeProperty('top');win.style.removeProperty('translate')}
  function open(name='welcome') {
    if (!sections[name]) return;
    disposePet();const version=openVersion;
    current=name;const s=sections[name];setMenu(false);win.hidden=false;task.hidden=false;
    root.dataset.section=name;win.classList.toggle('ad-pet-window',name==='tamagotchi');
    $('.ad-window-icon').innerHTML=icon(s.icon);$('#ad-window-title').textContent=s.name;
    $('.ad-address-name').textContent=s.name;$('.ad-status-name').textContent=name==='projetos'?`${projectItems.length} projetos`:s.name;
    $('.ad-task-icon').innerHTML=icon(s.icon);$('.ad-task-name').textContent=s.name;
    body.innerHTML=content(name);body.scrollTop=0;
    const heading=body.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});
    task.setAttribute('aria-pressed','true');
    root.querySelectorAll('.ad-icon').forEach(el=>{if(el.dataset.open===name)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});
    syncIcons();onSectionChange(name);
    if(name==='tamagotchi')import('./aero-tamagotchi.js?v=5').then(module=>{if(version!==openVersion)return;const result=module.mountTamagotchi(body.querySelector('[data-tamagotchi-mount]'));petCleanup=result;const title=body.querySelector('.tg-layout h1');if(title&&!win.hidden){title.tabIndex=-1;title.focus({preventScroll:true})}}).catch(error=>{if(version!==openVersion)return;body.querySelector('[data-tamagotchi-mount]').innerHTML='<p role="status">Não foi possível abrir o Tamagotchi. Feche esta janela e tente novamente.</p>';console.warn('Tamagotchi:',error.message)});
  }
  function close() {disposePet();win.hidden=true;task.hidden=true;current=null;root.dataset.section='desktop';root.querySelectorAll('.ad-icon').forEach(el=>el.removeAttribute('aria-current'));syncIcons();onSectionChange('desktop');start.focus({preventScroll:true})}
  function exit() {disposePet();active=false;clearInterval(clockTimer);clockTimer=null;setMenu(false);root.hidden=true;onExit();previousFocus?.focus?.({preventScroll:true})}
  function enter(name='welcome') {previousFocus=document.activeElement;active=true;root.hidden=false;clock();clearInterval(clockTimer);clockTimer=setInterval(clock,30000);open(name)}
  function maximize(){const large=win.classList.toggle('ad-maximized');resetPosition();const button=$('[data-action="maximize"]');button.setAttribute('aria-label',large?'Restaurar tamanho da janela':'Maximizar janela');button.title=large?'Restaurar':'Maximizar';button.textContent=large?'❐':'□'}
  function emailChoices(button){const panel=body.querySelector('#contact-email-options');if(!panel)return;panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)panel.querySelector('a').focus({preventScroll:false})}
  async function copyEmail(button){
    const address=body.querySelector('[data-email-address]'),status=body.querySelector('.ad-email-copy-status'),version=openVersion;
    if(!address||!status)return;
    button.disabled=true;status.textContent='';
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(contactEmail);
      if(version===openVersion&&status.isConnected)status.textContent='E-mail copiado. Cole no destinatário da sua mensagem.';
    }catch{
      if(version!==openVersion||!address.isConnected)return;
      address.focus({preventScroll:true});
      const selection=window.getSelection(),range=document.createRange();range.selectNodeContents(address);selection?.removeAllRanges();selection?.addRange(range);
      status.textContent='Não foi possível copiar automaticamente. Selecione ou mantenha pressionado o endereço acima para copiar.';
    }finally{if(button.isConnected)button.disabled=false}
  }
  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-open],[data-action]');
    if(!button){if(!event.target.closest('.ad-start-menu'))setMenu(false);return}
    if(button.dataset.open){open(button.dataset.open);return}
    switch(button.dataset.action){
      case 'exit':exit();break;
      case 'start':setMenu(menu.hidden);break;
      case 'home':open('welcome');break;
      case 'minimize':win.hidden=true;task.setAttribute('aria-pressed','false');syncIcons();task.focus();break;
      case 'maximize':maximize();break;
      case 'close':close();break;
      case 'restore':if(current){win.hidden=!win.hidden;task.setAttribute('aria-pressed',String(!win.hidden));syncIcons();if(!win.hidden)body.focus({preventScroll:true})}break;
      case 'sound':window.dispatchEvent(new CustomEvent('portfolio-sound-toggle'));break;
      case 'email-choices':emailChoices(button);break;
      case 'copy-email':copyEmail(button);break;
    }
  });
  window.addEventListener('portfolio-sound-state',event=>{const muted=Boolean(event.detail?.muted),button=$('.ad-sound');button.setAttribute('aria-pressed',String(muted));button.setAttribute('aria-label',muted?'Ativar som':'Desativar som');button.title=muted?'Ativar som':'Desativar som'});
  titlebar.addEventListener('dblclick',event=>{if(!event.target.closest('button')&&innerWidth>640)maximize()});
  titlebar.addEventListener('pointerdown',event=>{if(event.button!==0||event.target.closest('button')||innerWidth<=640||win.classList.contains('ad-maximized'))return;const r=win.getBoundingClientRect();dragging={id:event.pointerId,x:event.clientX-r.left,y:event.clientY-r.top};win.style.translate='none';win.style.left=r.left+'px';win.style.top=r.top+'px';titlebar.setPointerCapture(event.pointerId);event.preventDefault()});
  titlebar.addEventListener('pointermove',event=>{if(!dragging||event.pointerId!==dragging.id)return;win.style.left=Math.max(0,Math.min(innerWidth-win.offsetWidth,event.clientX-dragging.x))+'px';win.style.top=Math.max(0,Math.min(innerHeight-60-win.offsetHeight,event.clientY-dragging.y))+'px'});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])titlebar.addEventListener(type,()=>{dragging=null});
  addEventListener('resize',()=>{resetPosition();syncIcons()},{passive:true});
  root.addEventListener('keydown',event=>{if(!active)return;if(!menu.hidden&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){const items=[...menu.querySelectorAll('button')],i=items.indexOf(document.activeElement);const next=event.key==='Home'?0:event.key==='End'?items.length-1:(i+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;items[next].focus();event.preventDefault();return}if(event.key!=='Escape')return;event.preventDefault();if(!menu.hidden){setMenu(false);start.focus()}else if(!win.hidden)close();else exit()});
  return {enter,exit,open};
}
