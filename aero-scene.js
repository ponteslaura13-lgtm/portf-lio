import {createCloudGeometries} from './assets/clouds/sculpted-clouds.js';
import {createCloudMaterial} from './aero-cloud-material.js?v=5';
/* Editable 1990s CRT still-life. Geometry, light response and backdrop are native 3D. */
export function createHeroScene({THREE,scene,computer,screenTexture,logoTexture=null}) {
 const floaters=[],ownedGeometries=new Set();
 const own=g=>(ownedGeometries.add(g),g);
 function rounded(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
 function plastic(color,roughness=.49){return new THREE.MeshStandardMaterial({color,roughness,metalness:.015,envMapIntensity:.48})}
 function solid(w,h,d,r=.08){const small=r<.04,g=own(new THREE.ExtrudeGeometry(rounded(w-r*.6,h-r*.6,r),{depth:Math.max(.012,d-r*.5),bevelEnabled:true,bevelSegments:small?2:3,bevelSize:r*.3,bevelThickness:r*.25,curveSegments:small?3:8}));g.translate(0,0,-(d-r*.5)/2);return g}
 function mesh(g,mat,parent,x=0,y=0,z=0,shadow=true){const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;parent.add(m);return m}
 function block(w,h,d,r,mat,parent,x,y,z){return mesh(solid(w,h,d,r),mat,parent,x,y,z)}
 function ring(w,h,iw,ih,r,depth,mat,x,y,z,holeY=0){const s=rounded(w,h,r),points=rounded(iw,ih,r*.72).getPoints(12).reverse();points.forEach(p=>p.y+=holeY);s.holes.push(new THREE.Path(points));const g=own(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:4,bevelSize:.035,bevelThickness:.035,curveSegments:16}));return mesh(g,mat,computer,x,y,z)}
 function tube(points,r,mat,parent=scene){const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(own(new THREE.TubeGeometry(path,48,r,8,false)),mat,parent)}
 function smoothMoldedNormals(g){const p=g.attributes.position,n=g.attributes.normal,groups=new Map();for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e6)).join(','),v=groups.get(key)||new THREE.Vector3();v.x+=n.getX(i);v.y+=n.getY(i);v.z+=n.getZ(i);groups.set(key,v)}for(const v of groups.values())v.normalize();for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e6)).join(','),v=groups.get(key);n.setXYZ(i,v.x,v.y,v.z)}return g}
 const ivory=plastic('#dfdbd0'),side=plastic('#c7c5bd',.52),edge=plastic('#e3ded2',.46),charcoal=plastic('#353a40',.36),keys=plastic('#e3dfd3',.53),keyGrey=plastic('#b7b8b5',.56),rubber=plastic('#565352',.77);
 // Subtle molded-polymer grain is a surface normal detail, never a replacement image.
 const noise=new Uint8Array(128*128*4);let seed=7229;for(let i=0;i<128*128;i++){seed=(seed*1664525+1013904223)>>>0;const n=119+(seed>>>28);noise.set([n,n,n,255],i*4)}const bump=new THREE.DataTexture(noise,128,128,THREE.RGBAFormat);bump.wrapS=bump.wrapT=THREE.RepeatWrapping;bump.repeat.set(5,5);bump.needsUpdate=true;for(const m of [ivory,side,edge,keys,keyGrey]){m.bumpMap=bump;m.bumpScale=.0025}
 // The deep shell narrows at the rear: a cathode-ray tube housing, not a flat monitor.
 const sections=[{w:3.57,h:3.02,r:.095,z:.75,y:2.44},{w:3.54,h:2.99,r:.12,z:.29,y:2.45},{w:3.22,h:2.70,r:.18,z:-.88,y:2.47},{w:2.58,h:2.13,r:.19,z:-1.79,y:2.49}];
 const outlines=sections.map(s=>rounded(s.w,s.h,s.r).getPoints(10));const count=outlines[0].length-1,positions=[],indices=[],uvs=[];
 sections.forEach((s,j)=>{for(let i=0;i<count;i++){positions.push(outlines[j][i].x,outlines[j][i].y+s.y,s.z);uvs.push(i/count,j/(sections.length-1))}});
 for(let j=0;j<sections.length-1;j++)for(let i=0;i<count;i++){const a=j*count+i,b=j*count+(i+1)%count,c=(j+1)*count+i,d=(j+1)*count+(i+1)%count;indices.push(a,c,b,b,c,d)}
 const shellG=own(new THREE.BufferGeometry());shellG.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));shellG.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));shellG.setIndex(indices);shellG.computeVertexNormals();mesh(shellG,side,computer);
 block(2.56,2.12,.09,.17,side,computer,0,2.49,-1.80);
 ring(3.57,3.02,2.98,2.31,.105,.19,ivory,0,2.44,.76,.06);
 // Distinct chamfer and charcoal inner lip catch real light around the curved glass.
 ring(3.015,2.35,2.765,2.075,.14,.038,plastic('#a5a5a1',.46),0,2.5,.96);
 ring(2.79,2.10,2.705,2.015,.17,.018,charcoal,0,2.5,1.006);
 const sg=own(new THREE.PlaneGeometry(2.72,2.04,32,24)),p=sg.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i)/1.36,y=p.getY(i)/1.02;p.setZ(i,.035*(1-x*x)*(1-y*y))}sg.computeVertexNormals();
 const screen=mesh(sg,new THREE.MeshBasicMaterial({map:screenTexture,toneMapped:false}),computer,0,2.5,1.031,false);screen.name='crt-screen';screen.receiveShadow=false;
 const glass=mesh(sg,new THREE.MeshBasicMaterial({color:'#d6e7f2',transparent:true,opacity:.025,depthWrite:false}),computer,0,2.5,1.034,false);glass.receiveShadow=false;glass.name='crt-glass';
 // Front controls are placed on the lower bezel, with a small green power LED.
 const button=block(.16,.085,.028,.012,plastic('#aeafa8',.51),computer,1.30,1.155,1.024);
 const led=mesh(own(new THREE.SphereGeometry(.022,12,8)),new THREE.MeshBasicMaterial({color:'#c5ed81'}),computer,1.10,1.155,1.047,false);led.name='power-led';
 for(let i=0;i<4;i++)block(.085,.025,.018,.006,plastic('#9d9e99',.53),computer,.28+i*.16,1.15,1.025);
 // The physical casing is deliberately unbranded. Identity belongs on the screen.
 // Side louvers follow the tapered body. Repeated meshes share one small geometry.
 const ventG=own(new THREE.BoxGeometry(.018,.028,.68)),ventMat=plastic('#787b76',.75);
 const ventDummy=new THREE.Object3D(),vents=new THREE.InstancedMesh(ventG,ventMat,28);let ventIndex=0;for(const sign of [-1,1])for(let i=0;i<14;i++){ventDummy.position.set(sign*1.682,1.96+i*.073,-.42);ventDummy.rotation.set(0,sign*.136,0);ventDummy.updateMatrix();vents.setMatrixAt(ventIndex++,ventDummy.matrix)}vents.receiveShadow=true;computer.add(vents);
 const topVentG=own(new THREE.BoxGeometry(.034,.016,.42)),topVents=new THREE.InstancedMesh(topVentG,ventMat,18);for(let i=0;i<18;i++){ventDummy.position.set(-.75+i*.087,3.884,-.34);ventDummy.rotation.set(-.1064,0,0);ventDummy.updateMatrix();topVents.setMatrixAt(i,ventDummy.matrix)}topVents.receiveShadow=true;computer.add(topVents);
 const screwG=own(new THREE.CylinderGeometry(.033,.033,.018,12));for(const sign of [-1,1])for(const y of [1.36,3.58]){const s=mesh(screwG,plastic('#9c8d93',.51),computer,sign*1.65,y,.955);s.rotation.x=Math.PI/2;block(.031,.006,.004,.001,charcoal,computer,sign*1.65,y,.969)}
 // Adjustable stand and weighted base. No printer, tray, paper or large disk slot.
 const pivot=mesh(own(new THREE.CylinderGeometry(.32,.34,.52,28)),side,computer,0,.94,-.12);pivot.rotation.x=.15;
 block(1.25,.23,1.05,.14,ivory,computer,0,.64,-.12);block(2.05,.18,1.58,.15,edge,computer,0,.455,.04);
 for(const x of [-.74,.74])for(const z of [-.46,.54])block(.20,.035,.20,.04,rubber,computer,x,.367,z);
 const monitor=new THREE.Group();monitor.name='crt-monitor';for(const part of [...computer.children])monitor.add(part);computer.add(monitor);
 // Full-size early-1990s keyboard: staggered alphanumeric rows, function groups,
 // navigation block, inverted-T arrows and a complete numeric keypad.
 const keyboard=new THREE.Group();keyboard.name='keyboard';keyboard.rotation.y=.12;computer.add(keyboard);
 block(4.76,.21,1.72,.075,ivory,keyboard,0,.525,0);block(4.52,.05,1.50,.028,plastic('#aaa99f',.66),keyboard,0,.653,0);
 for(const x of [-2.03,2.03])for(const z of [-.60,.60])block(.17,.05,.17,.022,rubber,keyboard,x,.401,z);
 const pitch=.193,capG=solid(.170,.092,.180,.020),normal=[],modifiers=[],labels=[],matrix=new THREE.Matrix4();
 function key(t,x,z,units=1,grey=false,heightUnits=1){const w=pitch*units-.023,d=.218*heightUnits-.038;labels.push({x,z,t});if(units===1&&heightUnits===1)(grey?modifiers:normal).push([x,.719,z]);else block(w,.092,d,.02,grey?keyGrey:keys,keyboard,x,.719,z)}
 function row(items,z){let cursor=-2.18;for(const item of items){const [t,u=1,grey=false]=Array.isArray(item)?item:[item,1,false];key(t,cursor+u*pitch/2,z,u,grey);cursor+=u*pitch}}
 row(['`','1','2','3','4','5','6','7','8','9','0','−','=', ['Back',2,true]],-.35);
 row([['Tab',1.5,true],'Q','W','E','R','T','Y','U','I','O','P','[',']',['\\',1.5,true]],-.132);
 row([['Caps',1.75,true],'A','S','D','F','G','H','J','K','L',';','\'',['Enter',2.25,true]],.086);
 row([['Shift',2.25,true],'Z','X','C','V','B','N','M',',','.','/',['Shift',2.75,true]],.304);
 row([['Ctrl',1.25,true],['Win',1.25,true],['Alt',1.25,true],['',6.25],['Alt',1.25,true],['Win',1.25,true],['Menu',1.25,true],['Ctrl',1.25,true]],.522);
 key('Esc',-2.084,-.657,1,true);for(let group=0;group<3;group++)for(let j=0;j<4;j++)key(`F${group*4+j+1}`,-1.70+group*.92+j*pitch,-.657,1,true);
 const navX=.87;[['Ins','Home','PgUp'],['Del','End','PgDn']].forEach((r,j)=>r.forEach((t,i)=>key(t,navX+i*pitch,-.35+j*.218,1,true)));
 key('↑',navX+pitch,.304,1,true);['←','↓','→'].forEach((t,i)=>key(t,navX+i*pitch,.522,1,true));
 const numX=1.58;['Num','/','*','−'].forEach((t,i)=>key(t,numX+i*pitch,-.35,1,true));[['7','8','9'],['4','5','6'],['1','2','3']].forEach((r,j)=>r.forEach((t,i)=>key(t,numX+i*pitch,-.132+j*.218)));key('+',numX+3*pitch,-.023,1,true,2);key('Enter',numX+3*pitch,.413,1,true,2);key('0',numX+pitch/2,.522,2);key('.',numX+2*pitch,.522);
 for(const [positions,mat]of [[normal,keys],[modifiers,keyGrey]]){const caps=new THREE.InstancedMesh(capG,mat,positions.length);positions.forEach((pos,i)=>{matrix.makeTranslation(...pos);caps.setMatrixAt(i,matrix)});caps.castShadow=true;caps.receiveShadow=true;keyboard.add(caps)}
 const legend=document.createElement('canvas');legend.width=2048;legend.height=740;const k=legend.getContext('2d');k.fillStyle='#51534f';k.textAlign='center';k.textBaseline='middle';for(const item of labels){k.font=`500 ${item.t.length>3?13:20}px Arial`;k.fillText(item.t,(item.x/4.76+.5)*2048,(item.z/1.72+.5)*740)}const legendT=new THREE.CanvasTexture(legend);legendT.colorSpace=THREE.SRGBColorSpace;const legends=mesh(own(new THREE.PlaneGeometry(4.76,1.72)),new THREE.MeshBasicMaterial({map:legendT,transparent:true,depthWrite:false,toneMapped:false}),keyboard,0,.768,0,false);legends.rotation.x=-Math.PI/2;
 for(let i=0;i<3;i++){const status=mesh(own(new THREE.SphereGeometry(.014,8,6)),new THREE.MeshBasicMaterial({color:i?'#6a7365':'#b6d677'}),keyboard,1.68+i*.17,.643,-.723,false);status.name='keyboard-led'}
 const keyboardCable=tube([[0,.50,1],[-1.95,.43,1.18],[-2.25,.43,.4],[-1.68,.44,-.95],[0,.52,-1.60]],.018,rubber,computer);keyboardCable.name='keyboard-cable';
 // A low, broad two-button serial ball mouse. Its front is flat, the rear is
 // rounded, and the distinct button caps follow the molded upper shell.
 const mouse=new THREE.Group();mouse.name='mouse';mouse.rotation.y=.22;mouse.scale.y=.78;computer.add(mouse);
 const mouseOutline=new THREE.Shape();mouseOutline.moveTo(-.225,.51);mouseOutline.lineTo(.225,.51);mouseOutline.bezierCurveTo(.282,.51,.314,.475,.315,.425);mouseOutline.lineTo(.328,-.262);mouseOutline.bezierCurveTo(.331,-.426,.212,-.526,.032,-.53);mouseOutline.lineTo(-.035,-.53);mouseOutline.bezierCurveTo(-.223,-.526,-.327,-.422,-.323,-.254);mouseOutline.lineTo(-.304,.425);mouseOutline.bezierCurveTo(-.303,.478,-.278,.51,-.225,.51);
 const mouseG=own(new THREE.ExtrudeGeometry(mouseOutline,{depth:.15,bevelEnabled:true,bevelThickness:.055,bevelSize:.025,bevelSegments:6,curveSegments:20}));mouseG.rotateX(-Math.PI/2);mouseG.translate(0,-.09,0);
 const dome=z=>.073*Math.sin(Math.PI*THREE.MathUtils.clamp((z+.55)/1.12,0,1));
 const mp=mouseG.attributes.position;for(let i=0;i<mp.count;i++){const y=mp.getY(i);mp.setY(i,y+dome(mp.getZ(i))*THREE.MathUtils.smoothstep(y,-.04,.085))}mouseG.computeVertexNormals();smoothMoldedNormals(mouseG);mesh(mouseG,ivory,mouse).name='mouse-shell';
 function mouseButton(sign,mat){const shape=rounded(.265,.46,.052),g=own(new THREE.ExtrudeGeometry(shape,{depth:.017,bevelEnabled:true,bevelThickness:.014,bevelSize:.015,bevelSegments:6,curveSegments:14}));g.rotateX(-Math.PI/2);g.translate(sign*.162,.121,-.275);const pos=g.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,pos.getY(i)+dome(pos.getZ(i)));g.computeVertexNormals();smoothMoldedNormals(g);const cap=mesh(g,mat,mouse);cap.name=sign<0?'mouse-left-button':'mouse-right-button';return cap}
 mouseButton(-1,plastic('#d4d0c4',.46));mouseButton(1,plastic('#ccc9bd',.48));
 const buttonSeamMat=plastic('#74776d',.68),centerSeam=own(new THREE.PlaneGeometry(.017,.466,1,20));centerSeam.rotateX(-Math.PI/2);centerSeam.translate(0,.120,-.275);for(let i=0;i<centerSeam.attributes.position.count;i++){const sp=centerSeam.attributes.position;sp.setY(i,sp.getY(i)+dome(sp.getZ(i)))}centerSeam.computeVertexNormals();mesh(centerSeam,buttonSeamMat,mouse,0,0,0,false).receiveShadow=false;
 const buttonDivider=mesh(own(new THREE.PlaneGeometry(.607,.013)),buttonSeamMat,mouse,0,.120+dome(-.027),-.027,false);buttonDivider.rotation.x=-Math.PI/2;buttonDivider.receiveShadow=false;
 // The detachable bottom cover really has an aperture for its recessed ball.
 const baseShape=rounded(.605,.99,.17),ballHole=new THREE.Path();ballHole.absarc(0,-.14,.09,0,Math.PI*2,true);baseShape.holes.push(ballHole);
 const baseG=own(new THREE.ExtrudeGeometry(baseShape,{depth:.025,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:3,curveSegments:24}));baseG.rotateX(-Math.PI/2);baseG.translate(0,-.174,0);mesh(baseG,plastic('#a4a39c',.62),mouse).name='mouse-bottom-cover';
 const retainingRing=mesh(own(new THREE.RingGeometry(.088,.143,48)),plastic('#757973',.63),mouse,0,-.184,.14,false);retainingRing.rotation.x=Math.PI/2;retainingRing.name='mouse-ball-retainer';retainingRing.receiveShadow=false;
 const mouseBall=mesh(own(new THREE.SphereGeometry(.083,24,16)),plastic('#4a4f48',.88),mouse,0,-.109,.14,false);mouseBall.name='mouse-ball';mouseBall.receiveShadow=false;
 const footG=own(new THREE.SphereGeometry(1,12,8)),mouseFeet=new THREE.InstancedMesh(footG,plastic('#555954',.85),4),mouseDetail=new THREE.Object3D();[[-.23,-.30],[.23,-.30],[-.20,.34],[.20,.34]].forEach(([x,z],i)=>{mouseDetail.position.set(x,-.182,z);mouseDetail.scale.set(.045,.010,.084);mouseDetail.updateMatrix();mouseFeet.setMatrixAt(i,mouseDetail.matrix)});mouseFeet.name='mouse-glides';mouse.add(mouseFeet);
 const collarG=own(new THREE.TorusGeometry(.027,.006,8,16)),collars=new THREE.InstancedMesh(collarG,rubber,5);for(let i=0;i<5;i++){mouseDetail.position.set(0,-.005,-.55-i*.021);mouseDetail.scale.set(1,1,1);mouseDetail.updateMatrix();collars.setMatrixAt(i,mouseDetail.matrix)}collars.name='mouse-cable-strain-relief';mouse.add(collars);
 const strainCore=mesh(own(new THREE.CylinderGeometry(.021,.026,.114,16)),rubber,mouse,0,-.005,-.589,false);strainCore.rotation.x=Math.PI/2;
 const mouseCable=tube([[0,0,0],[1,0,0]],.016,rubber,computer);mouseCable.name='mouse-cable';

 // A quiet glazed tile desk, with shallow grout and restrained pastel variation.
 const room=new THREE.Group();room.name='dreamcore-room';scene.add(room);
 const grout=plastic('#b9aeb7',.66),tileMaterial=plastic('#ffffff',.26);
 block(9.4,.29,6.2,.08,grout,room,0,.2,.0);
 const tileG=own(new THREE.BoxGeometry(.738,.032,.738)),tiles=new THREE.InstancedMesh(tileG,tileMaterial,12*8);let ti=0;const palette=['#e9d7dc','#e6d4d9','#e9d9d4','#dce2e2'];for(let row=0;row<8;row++)for(let col=0;col<12;col++){matrix.makeTranslation((col-5.5)*.75,.36,(row-3.5)*.75);tiles.setMatrixAt(ti,matrix);tiles.setColorAt(ti,new THREE.Color(palette[(col*3+row*7)%palette.length]));ti++}tiles.receiveShadow=true;tiles.castShadow=false;room.add(tiles);
 block(9.38,.075,.065,.025,plastic('#ddd0d5',.30),room,0,.295,3.1);
 // Proper hollow glazed-ceramic mug: outside wall, rolled rim, inner wall and bottom.
 const mug=new THREE.Group();mug.rotation.y=-Math.PI/2;room.add(mug);mug.name='coffee-mug';
 const mugMat=new THREE.MeshPhysicalMaterial({color:'#c68e9e',roughness:.23,metalness:0,clearcoat:.85,clearcoatRoughness:.13,envMapIntensity:.7});
 const cupProfile=new THREE.Path();cupProfile.moveTo(0,.018);cupProfile.lineTo(.226,.018);cupProfile.bezierCurveTo(.263,.018,.287,.034,.294,.071);cupProfile.bezierCurveTo(.312,.19,.326,.526,.326,.686);cupProfile.bezierCurveTo(.326,.709,.322,.727,.309,.727);cupProfile.bezierCurveTo(.295,.727,.289,.709,.289,.687);cupProfile.bezierCurveTo(.289,.51,.278,.24,.268,.158);cupProfile.bezierCurveTo(.263,.124,.248,.11,.216,.11);cupProfile.lineTo(0,.11);
 const cupBody=mesh(own(new THREE.LatheGeometry(cupProfile.getPoints(7),96)),mugMat,mug);cupBody.name='coffee-mug-body';
 const handlePath=new THREE.CurvePath();handlePath.add(new THREE.CubicBezierCurve3(new THREE.Vector3(.29,.612,0),new THREE.Vector3(.49,.696,0),new THREE.Vector3(.621,.618,0),new THREE.Vector3(.621,.43,0)));handlePath.add(new THREE.CubicBezierCurve3(new THREE.Vector3(.621,.43,0),new THREE.Vector3(.621,.24,0),new THREE.Vector3(.47,.16,0),new THREE.Vector3(.301,.228,0)));mesh(own(new THREE.TubeGeometry(handlePath,64,.057,16,false)),mugMat,mug).name='coffee-mug-handle';
 const coffee=mesh(own(new THREE.CircleGeometry(.284,96)),new THREE.MeshPhysicalMaterial({color:'#372419',roughness:.22,metalness:.05,clearcoat:.8,clearcoatRoughness:.14,envMapIntensity:.8}),mug,0,.624,0,false);coffee.rotation.x=-Math.PI/2;coffee.receiveShadow=false;
 const meniscus=mesh(own(new THREE.TorusGeometry(.282,.005,8,96)),new THREE.MeshStandardMaterial({color:'#69452c',roughness:.23,metalness:.05}),mug,0,.625,0,false);meniscus.rotation.x=Math.PI/2;meniscus.receiveShadow=false;
 const coaster=mesh(own(new THREE.CylinderGeometry(.36,.36,.025,64)),plastic('#a99b9d',.75),room);coaster.name='coffee-coaster';
 // One 3.5-inch diskette with bevelled ABS case, steel shutter, label and write-protect slot.
 const floppy=new THREE.Group();floppy.position.set(2.73,.381,.65);floppy.rotation.set(-Math.PI/2,0,.18);room.add(floppy);floppy.name='1990s-diskette';
 const fs=new THREE.Shape();fs.moveTo(-.44,-.455);fs.lineTo(.44,-.455);fs.lineTo(.44,.36);fs.lineTo(.345,.455);fs.lineTo(-.44,.455);fs.closePath();
 const fg=own(new THREE.ExtrudeGeometry(fs,{depth:.047,bevelEnabled:true,bevelSegments:2,bevelSize:.008,bevelThickness:.006}));mesh(fg,plastic('#66657e',.58),floppy);
 const shutterMat=new THREE.MeshStandardMaterial({color:'#bfc3c7',roughness:.31,metalness:.83});block(.405,.273,.009,.012,shutterMat,floppy,-.045,.298,.056);
 block(.078,.18,.004,.003,plastic('#434651',.7),floppy,.063,.298,.063);block(.084,.063,.006,.003,plastic('#383c47',.7),floppy,-.327,.362,.053);
 const label=mesh(own(new THREE.PlaneGeometry(.648,.433)),new THREE.MeshStandardMaterial({color:'#f0e9dd',roughness:.93}),floppy,0,-.14,.054,false);
 for(let i=0;i<3;i++)block(.53,.005,.002,.001,plastic('#b8adb0',.9),floppy,0,-.08-i*.085,.056);
 block(.15,.025,.003,.002,plastic('#c591a1',.7),floppy,-.23,.035,.056);
 // An actual annular compact disc, including clear polycarbonate hub and a fine outer edge.
 const disc=new THREE.Group();disc.position.set(-3.14,.385,2.18);disc.rotation.set(-Math.PI/2,0,-.12);room.add(disc);disc.name='compact-disc';
 const discMat=new THREE.MeshPhysicalMaterial({color:'#d3d6dc',roughness:.20,metalness:.88,iridescence:1,iridescenceIOR:1.35,iridescenceThicknessRange:[160,430],clearcoat:.85,clearcoatRoughness:.1,side:THREE.DoubleSide,envMapIntensity:1.1});
 mesh(own(new THREE.RingGeometry(.079,.49,96)),discMat,disc,0,0,.005,false);
 const outer=mesh(own(new THREE.TorusGeometry(.488,.005,6,96)),new THREE.MeshStandardMaterial({color:'#aeb9c5',roughness:.21,metalness:.7}),disc);
 mesh(own(new THREE.RingGeometry(.079,.137,64)),new THREE.MeshPhysicalMaterial({color:'#e6edf4',roughness:.14,metalness:.05,transparent:true,opacity:.54,clearcoat:1,side:THREE.DoubleSide}),disc,0,0,.006,false);
 mesh(own(new THREE.TorusGeometry(.136,.006,6,64)),new THREE.MeshStandardMaterial({color:'#b6bac8',roughness:.3,metalness:.65}),disc,0,0,.007,false);
 // Three unified cloud sculptures share geometry; local occlusion is baked once.
 // Their softly wrapped light stays inexpensive during camera movement.
 const cloudGeometries=createCloudGeometries(THREE).map(own),cloudMat=createCloudMaterial(THREE);
 function cloud(x,y,z,s){const i=floaters.length,group=new THREE.Group();group.name=`cumulus-${i+1}`;group.position.set(x,y,z);group.scale.setScalar(s);room.add(group);const volume=new THREE.Mesh(cloudGeometries[i%cloudGeometries.length],cloudMat);volume.rotation.y=[.08,-.18,.24,-.34][i];volume.receiveShadow=false;volume.castShadow=false;group.add(volume);floaters.push({mesh:group,y,seed:i*1.8});return group}
 const cloudLayout=[[-4.6,3.1,-3.8,.66],[4.9,3.75,-5.0,.78],[-6.8,5.3,-6.2,.53],[6.7,1.7,-3.4,.56]];
 const compactCloudLayout=[[-2.65,3.85,-3.8,.42],[2.55,4.0,-5.0,.42],[-3.3,5.0,-6.2,.33],[3.25,1.8,-3.4,.32]];
 cloudLayout.forEach(p=>cloud(...p));
 // Every desktop accessory is laid out in world space at the fixed CRT yaw.
 // Cable control points use the same transform, so their routes cannot drift
 // through world-aligned props when the computer is viewed at an angle.
 const worldToRig=(x,y,z)=>computer.worldToLocal(new THREE.Vector3(x,y,z));
 function cableRoute(cable,worldPoints,radius){const old=cable.geometry,path=new THREE.CatmullRomCurve3(worldPoints.map(p=>worldToRig(...p)));cable.geometry=own(new THREE.TubeGeometry(path,72,radius,8,false));ownedGeometries.delete(old);old.dispose();cable.position.set(0,0,0)}
 let compact=null;
 function setCompact(value){
  value=Boolean(value);if(compact===value)return;compact=value;
  keyboard.scale.set(value ? .82 : 1,1,value ? .82 : 1);keyboard.position.set(value ? 0 : -.40,0,value ? 1.98 : 1.94);
  computer.updateWorldMatrix(true,true);mouse.position.copy(worldToRig(value ? 1.98 : 2.40,.52576,value ? 2.20 : 2.00));computer.updateWorldMatrix(true,true);
  mug.position.set(value ? -2.40 : -3.03,.3825,value ? -.60 : -.40);coaster.position.set(mug.position.x,.388,mug.position.z);
  floppy.position.set(value ? 2.00 : 3.00,.381,value ? .60 : .25);disc.position.set(value ? -1.95 : -2.65,.3803,value ? -1.65 : -1.50);
  const mouseOut=mouse.localToWorld(new THREE.Vector3(0,-.005,-.646)).toArray(),tail=computer.localToWorld(new THREE.Vector3(1.1,.43,-1.62)).toArray();
  cableRoute(mouseCable,value ? [mouseOut,[2.60,.43,1.55],[2.95,.405,.48],[2.96,.405,-.55],[2.43,.405,-1.32],tail] : [mouseOut,[3.18,.43,1.33],[3.83,.405,.46],[3.82,.405,-.55],[2.87,.405,-1.36],tail],.016);
  const keyboardOut=keyboard.localToWorld(new THREE.Vector3(-.9,.49,-.86)).toArray(),keyboardTail=computer.localToWorld(new THREE.Vector3(-.54,.46,-1.63)).toArray();
  cableRoute(keyboardCable,[keyboardOut,[value ? -1.85 : -2.48,.405,.48],[value ? -1.78 : -2.31,.405,-.39],[-1.27,.405,-1.13],keyboardTail],.018);
  (value?compactCloudLayout:cloudLayout).forEach(([x,y,z,s],i)=>{floaters[i].mesh.position.set(x,y,z);floaters[i].mesh.scale.setScalar(s);floaters[i].y=y});
 }
 setCompact(false);
 return {screen,floaters,screenCenter:[0,2.5,1.031],screenSize:[2.72,2.04],room,setCompact,
  stats:{geometries:ownedGeometries.size,triangleCount:[...ownedGeometries].reduce((n,g)=>n+(g.index?g.index.count:g.attributes.position?.count||0)/3,0)}};
}




