"""Build small, smooth cloud meshes and an importable, dependency-free web asset."""
import bpy, math, json, base64, struct
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'dist' / 'assets' / 'clouds'
OUT.mkdir(parents=True, exist_ok=True)
SRC = Path(__file__).resolve().parent

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# x, y(up), z(depth), three radii. The lower edge is made of uneven billows,
# never a single flattened disk. The front/rear lobes give the union real depth.
variants = [
 [(-1.48,-.05,.03,.57,.43,.45),(-.98,.22,-.03,.77,.62,.61),
  (-.31,.43,-.09,.92,.80,.65),(.52,.23,-.05,.86,.66,.62),
  (1.28,-.04,.04,.66,.45,.48),(1.72,-.15,.03,.35,.27,.31),
  (-1.67,-.18,.20,.38,.26,.34),(-.80,-.25,.28,.60,.31,.51),
  (-.08,-.25,.34,.65,.33,.50),(.72,-.24,.28,.58,.30,.47),
  (-.52,.69,.10,.45,.45,.44),(.22,.56,-.31,.55,.48,.49),
  (-.94,.16,.48,.42,.40,.34),(.42,.11,.47,.48,.42,.34)],
 [(-1.60,-.15,.04,.46,.32,.35),(-1.12,.02,-.05,.64,.51,.51),
  (-.54,.20,-.12,.78,.63,.65),(.21,.48,-.05,.88,.80,.65),
  (.94,.13,.01,.76,.58,.58),(1.57,-.13,.02,.50,.36,.41),
  (-1.20,-.27,.24,.49,.25,.37),(-.52,-.25,.33,.60,.30,.46),
  (.19,-.23,.34,.64,.34,.49),(.91,-.26,.27,.54,.29,.45),
  (.05,.76,-.01,.43,.39,.39),(.74,.44,-.31,.48,.46,.47),
  (-.67,.16,.45,.38,.34,.36),(.62,.07,.51,.39,.36,.32)],
 [(-1.61,-.16,.03,.40,.29,.33),(-1.16,.05,.01,.63,.48,.50),
  (-.54,.33,-.08,.87,.69,.64),(.24,.24,-.07,.91,.66,.65),
  (1.06,.02,.01,.74,.48,.53),(1.62,-.18,.04,.45,.29,.35),
  (-1.08,-.28,.24,.49,.26,.40),(-.40,-.25,.31,.62,.33,.48),
  (.31,-.27,.32,.61,.31,.48),(1.01,-.27,.22,.48,.27,.39),
  (-.80,.58,-.18,.43,.44,.40),(-.02,.63,-.26,.51,.47,.44),
  (-.67,.11,.49,.43,.39,.33),(.47,.10,.48,.43,.36,.34)]
]

def build_cloud(index, lobes):
    parts=[]
    for i,(x,y,z,rx,ry,rz) in enumerate(lobes):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, location=(x,z,y))
        obj=bpy.context.object
        obj.name=f'Cloud_{index+1}_lobe_{i+1}'
        obj.scale=(rx,rz,ry)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        parts.append(obj)
    bpy.ops.object.select_all(action='DESELECT')
    for p in parts:p.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join()
    obj=bpy.context.object
    obj.name=f'Cloud_Cumulus_{index+1}'
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    remesh=obj.modifiers.new('Continuous volume union','REMESH')
    remesh.mode='VOXEL'; remesh.voxel_size=.052; remesh.use_smooth_shade=True
    bpy.ops.object.modifier_apply(modifier=remesh.name)
    sm=obj.modifiers.new('Soft billow junctions','SMOOTH');sm.factor=1.3;sm.iterations=7
    bpy.ops.object.modifier_apply(modifier=sm.name)
    # A tiny broad surface variation gives the silhouette a less mathematical
    # finish, while preserving the cumulus outline. No per-frame displacement.
    tex=bpy.data.textures.new(f'Cloud volume texture {index+1}',type='CLOUDS')
    tex.noise_scale=.29;tex.noise_depth=1
    dis=obj.modifiers.new('Delicate volume variation','DISPLACE')
    dis.texture=tex;dis.texture_coords='GLOBAL';dis.strength=.026;dis.mid_level=.5
    bpy.ops.object.modifier_apply(modifier=dis.name)
    sm=obj.modifiers.new('Final surface polish','SMOOTH');sm.factor=.5;sm.iterations=2
    bpy.ops.object.modifier_apply(modifier=sm.name)
    tri=obj.modifiers.new('Stable triangles','TRIANGULATE')
    bpy.ops.object.modifier_apply(modifier=tri.name)
    initial=len(obj.data.polygons)
    dec=obj.modifiers.new('Web detail budget','DECIMATE');dec.ratio=min(1,11500/initial)
    bpy.ops.object.modifier_apply(modifier=dec.name)
    tri=obj.modifiers.new('Final triangles','TRIANGULATE')
    bpy.ops.object.modifier_apply(modifier=tri.name)
    # Keep matching footprint to the current hero placements.
    coords=[v.co for v in obj.data.vertices]
    mins=[min(v[i] for v in coords) for i in range(3)]
    maxs=[max(v[i] for v in coords) for i in range(3)]
    for v in obj.data.vertices:
        v.co.x=(v.co.x-(mins[0]+maxs[0])/2)*(4.12/(maxs[0]-mins[0]))
        v.co.y=(v.co.y-(mins[1]+maxs[1])/2)*(1.55/(maxs[1]-mins[1]))
        v.co.z=-.45+(v.co.z-mins[2])*(1.62/(maxs[2]-mins[2]))
    for p in obj.data.polygons:p.use_smooth=True
    obj.data.update()
    return obj

objects=[build_cloud(i,lobes) for i,lobes in enumerate(variants)]
packets=[];stats=[]
for obj in objects:
    me=obj.data
    # Blender z-up -> Three y-up, retaining a right-handed coordinate system.
    positions=[n for v in me.vertices for n in (v.co.x,v.co.z,-v.co.y)]
    normals=[n for v in me.vertices for n in (v.normal.x,v.normal.z,-v.normal.y)]
    indices=[vi for p in me.polygons for vi in p.vertices]
    bvh=BVHTree.FromPolygons([v.co for v in me.vertices],[p.vertices[:] for p in me.polygons],all_triangles=True)
    occlusion=[]
    sample_count=14
    for vert in me.vertices:
        normal=vert.normal.normalized()
        tangent=normal.cross(Vector((0,0,1)) if abs(normal.z)<.9 else Vector((0,1,0))).normalized()
        bitangent=normal.cross(tangent).normalized()
        hit_weight=0
        for s in range(sample_count):
            radius=math.sqrt((s+.5)/sample_count);angle=s*2.399963229728653
            direction=(tangent*(radius*math.cos(angle))+bitangent*(radius*math.sin(angle))+normal*math.sqrt(1-radius*radius)).normalized()
            location,_,_,distance=bvh.ray_cast(vert.co+normal*.012,direction,.85)
            if location is not None:hit_weight+=1-min(1,distance/.85)*.55
        occlusion.append(max(.46,1-hit_weight/sample_count*.7))
    assert len(indices)%3==0
    assert all(math.isfinite(x) for x in positions+normals)
    assert all(abs(Vector(normals[i:i+3]).length-1)<.002 for i in range(0,len(normals),3))
    edges={}
    for p in me.polygons:
        ids=list(p.vertices)
        for i in range(len(ids)):
            pair=tuple(sorted((ids[i],ids[(i+1)%len(ids)])))
            edges[pair]=edges.get(pair,0)+1
    assert all(count==2 for count in edges.values()),'Cloud surface must be closed'
    def b64(values,fmt):return base64.b64encode(struct.pack('<'+fmt*len(values),*values)).decode('ascii')
    packets.append({'name':obj.name,'p':b64(positions,'f'),'n':b64(normals,'f'),'i':b64(indices,'H'),'o':b64(occlusion,'f')})
    stats.append({'name':obj.name,'vertices':len(me.vertices),'triangles':len(me.polygons),'closed':True,'finite':True})

module='''/* Generated from tools/clouds/sculpt_clouds.py. Three distinct smooth,
closed cumulus surfaces; no runtime meshing, texture fetches or dependencies. */
const packets = '''+json.dumps(packets,separators=(',',':'))+''';
function bytes(encoded){const text=atob(encoded),out=new Uint8Array(text.length);for(let i=0;i<text.length;i++)out[i]=text.charCodeAt(i);return out.buffer}
export function createCloudGeometries(THREE){return packets.map(({name,p,n,i,o})=>{const g=new THREE.BufferGeometry();g.name=name;g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(bytes(p)),3));g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(bytes(n)),3));g.setAttribute('occlusion',new THREE.BufferAttribute(new Float32Array(bytes(o)),1));g.setIndex(new THREE.BufferAttribute(new Uint16Array(bytes(i)),1));g.computeBoundingBox();g.computeBoundingSphere();return g})}
'''
(OUT/'sculpted-clouds.js').write_text(module,encoding='utf8')
(OUT/'geometry-stats.json').write_text(json.dumps(stats,indent=2),encoding='utf8')

# Source and a simple shape inspection render. Material is intentionally quiet;
# the application owns its final scene illumination and material treatment.
mat=bpy.data.materials.new('Dreamy cloud study');mat.use_nodes=True
bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(.84,.86,.96,1);bsdf.inputs['Roughness'].default_value=.9
for i,obj in enumerate(objects):
    obj.data.materials.append(mat)
    obj.location.x=(i-1)*4.7
world=bpy.context.scene.world or bpy.data.worlds.new('World');bpy.context.scene.world=world
world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.14,.20,.34,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.55
def area(name,location,power,size,color):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
    ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob);ob.location=location;ob.rotation_euler=(Vector((0,0,.3))-ob.location).to_track_quat('-Z','Y').to_euler()
area('Wide warm key',(-5,-7,8),1600,8,(1,.91,.85))
area('Sky fill',(6,-4,4),750,9,(.68,.81,1))
area('Pink rim',(0,4,6),1200,7,(1,.72,.85))
data=bpy.data.cameras.new('Cloud study camera');cam=bpy.data.objects.new('Cloud study camera',data);bpy.context.collection.objects.link(cam);cam.location=(0,-14,3.5);cam.rotation_euler=(Vector((0,0,.3))-cam.location).to_track_quat('-Z','Y').to_euler();data.type='ORTHO';data.ortho_scale=14.5
scene=bpy.context.scene;scene.camera=cam;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.render.resolution_x=1600;scene.render.resolution_y=500;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(SRC/'cloud-shapes-study.png')
bpy.ops.wm.save_as_mainfile(filepath=str(SRC/'dreamcore-clouds.blend'))
bpy.ops.render.render(write_still=True)
print('CLOUD_EXPORT_DONE',json.dumps(stats))
