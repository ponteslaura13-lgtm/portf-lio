"""Classic egg-shaped pocket LCD toy; fixed front camera for a pixel-perfect UI overlay."""
import bpy, bmesh, math, json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'dist/assets/tamagotchi';OUT.mkdir(parents=True,exist_ok=True)
SRC=Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def rgb(h):
    v=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(((x+.055)/1.055)**2.4 if x>.04045 else x/12.92 for x in v)+(1,)
def mat(name,color,rough=.3,metal=0,coat=.1):
    m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=rgb(color);p.inputs['Roughness'].default_value=rough
    p.inputs['Metallic'].default_value=metal;p.inputs['Coat Weight'].default_value=coat;p.inputs['Coat Roughness'].default_value=.22
    return m
pink=mat('Warm pink molded ABS','ef93b4',.31,0,.20)
backPink=mat('Back cover pink ABS','df81a5',.33,0,.15)
yellow=mat('Pale butter molded zigzag frame','f9dfa1',.34,0,.11)
buttonMat=mat('Butter yellow silicone buttons','f0d693',.43,0,.03)
seatMat=mat('Recess pink shadow','b9567d',.50)
seamMat=mat('Hairline case seam','bb6487',.5)
gasketMat=mat('LCD graphite seal','525d4e',.65)
lcdMat=mat('Reflective green LCD substrate','b7c29c',.52)
steel=mat('Polished nickel keychain','c7c9ce',.23,.92,.12)
for m in [pink,backPink,yellow]:
    nt=m.node_tree;n=nt.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=330;n.inputs['Detail'].default_value=1
    b=nt.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=.09;b.inputs['Distance'].default_value=.0005
    nt.links.new(n.outputs['Fac'],b.inputs['Height']);nt.links.new(b.outputs['Normal'],nt.nodes.get('Principled BSDF').inputs['Normal'])
def smooth(o):
    for p in o.data.polygons:p.use_smooth=True
    return o
def box(name,loc,size,r,material):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    b=o.modifiers.new('Small molded edge radius','BEVEL');b.width=r;b.segments=5;bpy.ops.object.modifier_apply(modifier=b.name)
    if material:o.data.materials.append(material)
    smooth(o);o.modifiers.new('Weighted planar normals','WEIGHTED_NORMAL');return o
def difference(o,c):
    bpy.context.view_layer.objects.active=o;b=o.modifiers.new('Actual LCD recess','BOOLEAN');b.operation='DIFFERENCE';b.object=c;b.solver='EXACT'
    bpy.ops.object.modifier_apply(modifier=b.name);bpy.data.objects.remove(c,do_unlink=True)
def tube(name,points,r,material):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=16;c.bevel_depth=r;c.bevel_resolution=4
    s=c.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
    for p,co in zip(s.bezier_points,points):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(material);return o

# A compact egg, with gently flattened front and rounded injection-molded sides.
# The previous device was elongated and had a monitor-like projecting frame.
verts=[];faces=[];N=160;M=112
for j in range(M+1):
    a=math.pi*j/M;t=math.cos(a);s=math.sin(a)
    for i in range(N):
        b=2*math.pi*i/N
        # A 0.65 exponent creates a broad front cap rather than a spherical pebble.
        sy=math.sin(b);yy=math.copysign(abs(sy)**.65,sy)
        verts.append((1.32*s*(1-.105*t)*math.cos(b),.43*(s**.55)*yy,1.60*t))
for j in range(M):
    for i in range(N):
        k=j*N+i;l=j*N+(i+1)%N;faces.append((k,l,l+N,k+N))
mesh=bpy.data.meshes.new('Compact original-style egg shell');mesh.from_pydata(verts,[],faces);mesh.update()
bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000001);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
shell=bpy.data.objects.new('Pink front shell',mesh);bpy.context.collection.objects.link(shell);shell.data.materials.append(pink);smooth(shell)
difference(shell,box('Screen pocket cutter',(0,-.50,.19),(1.235,.48,1.235),.040,None))

# Shallow iconic jagged surround: a thin plastic inlay, not a bulky separate monitor.
outline=[(-.82,.72),(-.57,.65),(-.39,.80),(-.19,.66),(0,.82),(.19,.66),(.39,.80),(.57,.65),(.82,.72),
         (.70,.48),(.83,.27),(.70,.06),(.84,-.15),(.70,-.36),(.83,-.57),(.68,-.76),
         (.45,-.68),(.23,-.83),(0,-.69),(-.23,-.83),(-.45,-.68),(-.68,-.76),
         (-.83,-.57),(-.70,-.36),(-.84,-.15),(-.70,.06),(-.83,.27),(-.70,.48)]
zshift=.19
verts=[(x,y,z+zshift) for y in [-.450,-.495] for x,z in outline]
L=len(outline);faces=[tuple(range(L-1,-1,-1)),tuple(range(L,2*L))]+[(i,(i+1)%L,(i+1)%L+L,i+L) for i in range(L)]
me=bpy.data.meshes.new('Jagged shallow screen inlay');me.from_pydata(verts,[],faces);me.update()
frame=bpy.data.objects.new('Cream zigzag screen surround',me);bpy.context.collection.objects.link(frame);frame.data.materials.append(yellow)
bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free()
difference(frame,box('Square LCD opening',(0,-.50,.19),(1.205,.45,1.205),.035,None))
b=frame.modifiers.new('Fine soft inlay edge','BEVEL');b.width=.018;b.segments=4
frame.modifiers.new('Weighted inlay normals','WEIGHTED_NORMAL')
box('Dark inset LCD seal',(0,-.443,.19),(1.23,.035,1.23),.035,gasketMat)
box('LCD reflective background',(0,-.465,.19),(1.16,.012,1.16),.024,lcdMat)

# Small silicone buttons in a horizontal line. Invisible hit targets can be larger.
buttonUI=[]
for i,x in enumerate([-.46,0,.46]):
    z=-.94;t=z/1.60;s=math.sqrt(1-t*t);rx=1.32*s*(1-.105*t)
    y=-.43*(s**.55)*(max(.01,1-(x/rx)**2)**.325)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=32,location=(x,y-.006,z));o=bpy.context.object;o.name=f'Button {i+1} inset seat';o.scale=(.135,.027,.135);o.data.materials.append(seatMat);smooth(o)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=32,location=(x,y-.037,z));o=bpy.context.object;o.name=f'Button {i+1} small rubber cap';o.scale=(.110,.055,.110);o.data.materials.append(buttonMat);smooth(o)
    buttonUI.append((x,y-.09,z))

pts=[]
for i in range(161):
    a=2*math.pi*i/160;t=math.cos(a);pts.append((1.313*math.sin(a)*(1-.105*t),-.032,1.592*t))
tube('Case parting line',pts,.0045,seamMat)

# Small functional eyelet and short ball chain. No oversized dangling charm.
bpy.ops.mesh.primitive_torus_add(major_segments=64,minor_segments=16,location=(.78,-.02,1.30),major_radius=.088,minor_radius=.032,rotation=(math.pi/2,0,0))
o=bpy.context.object;o.name='Small molded chain eyelet';o.data.materials.append(pink);smooth(o)
chain=[]
for i in range(28):
    a=2*math.pi*i/28;chain.append((1.04+.22*math.sin(a),-.035+.05*math.cos(a),1.32+.30*math.cos(a)))
for i,p in enumerate(chain):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=.029,location=p);o=bpy.context.object;o.name=f'Chain bead {i+1}';o.data.materials.append(steel);smooth(o)
tube('Chain bead links',chain+[chain[0]],.008,steel)
box('Ball-chain clasp',(.835,-.055,1.36),(.075,.053,.12),.022,steel)

def area(name,loc,power,size,color,sy=None):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='RECTANGLE';d.size=size;d.size_y=sy or size;d.color=color
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
area('Broad warm key',(-3.2,-4.5,4.0),320,3.0,(1,.95,.91),3.8)
area('Large front fill',(2.4,-4.0,.5),180,3.2,(.94,.97,1),3.4)
area('Top soft reflection',(.2,-1,4.0),130,2.2,(1,1,1),.7)
area('Right outline',(3,1,1),170,2.0,(1,.90,.95),2.8)
world=bpy.data.worlds.new('Neutral studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.42,.42,.45,1);world.node_tree.nodes['Background'].inputs[1].default_value=.55;bpy.context.scene.world=world
scene=bpy.context.scene;bpy.ops.object.camera_add(location=(0,-12,0));cam=bpy.context.object;cam.name='Front UI orthographic camera';cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=3.85;scene.camera=cam
scene.render.resolution_x=1200;scene.render.resolution_y=1400;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.image_settings.color_depth='8';scene.render.filepath=str(OUT/'device-v4.png')
scene.render.engine='CYCLES';scene.cycles.samples=80;scene.cycles.use_denoising=True;scene.cycles.max_bounces=6
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.18;scene.render.image_settings.compression=40
bpy.ops.wm.save_as_mainfile(filepath=str(SRC/'laura-pocket-device-v4.blend'))
def pixel(p):
    q=world_to_camera_view(scene,cam,Vector(p));return [round(q.x*1200,3),round((1-q.y)*1400,3)]
def rect(x0,x1,z0,z1,y):
    a=pixel((x0,y,z1));b=pixel((x1,y,z0));return dict(x=a[0],y=a[1],width=round(b[0]-a[0],3),height=round(b[1]-a[1],3))
meta={'image':'device-v4.png','width':1200,'height':1400,'projection':'orthographic front; no homography required','screen':rect(-.568,.568,-.378,.758,-.473),'screenCornerRadius':8,'buttons':[{'id':n,'center':pixel(p),'visibleRadius':round(.110*1400/3.85,3),'hitRadius':round(.205*1400/3.85,3)} for n,p in zip(['care','create','reset'],buttonUI)],'brandCenter':pixel((0,-.41,1.18)),'source':'tools/tamagotchi/laura-pocket-device-v4.blend','render':'Cycles, 80 samples, AgX, transparent background','reference':'https://tamagotchi-official.com/us/series/original/item/01_266/','identity':'Custom Laura device inspired by the original pocket LCD toy; no commercial logos'}
(OUT/'device-v4-layout.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf8')
print('DEVICE_LAYOUT',json.dumps(meta),flush=True)
bpy.ops.render.render(write_still=True)
print('DEVICE_READY',str(OUT/'device-v4.png'),flush=True)
