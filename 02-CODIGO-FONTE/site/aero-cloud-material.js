/* Diffuse cloud shading: smooth wrapped light and baked local occlusion.
   No transparent shell, shadow pass or animation-dependent mesh rebuild. */
export function createCloudMaterial(THREE) {
 return new THREE.ShaderMaterial({
  name:'Soft-cumulus',
  uniforms:{
   shadowTint:{value:new THREE.Color('#a9b5d3')},
   bodyTint:{value:new THREE.Color('#e4deed')},
   sunTint:{value:new THREE.Color('#fffaf3')},
   rimTint:{value:new THREE.Color('#edf7ff')}
  },
  vertexShader:`
   attribute float occlusion;
   varying vec3 cloudNormal;
   varying vec3 cloudWorld;
   varying vec3 cloudLocal;
   varying float cloudAO;
   void main(){
    vec4 world=modelMatrix*vec4(position,1.0);
    cloudNormal=normalize(mat3(modelMatrix)*normal);
    cloudWorld=world.xyz;
    cloudLocal=position;
    cloudAO=occlusion;
    gl_Position=projectionMatrix*viewMatrix*world;
   }
  `,
  fragmentShader:`
   uniform vec3 shadowTint;
   uniform vec3 bodyTint;
   uniform vec3 sunTint;
   uniform vec3 rimTint;
   varying vec3 cloudNormal;
   varying vec3 cloudWorld;
   varying vec3 cloudLocal;
   varying float cloudAO;
   void main(){
    vec3 n=normalize(cloudNormal);
    vec3 light=normalize(vec3(-0.48,0.82,0.46));
    vec3 eye=normalize(cameraPosition-cloudWorld);
    float diffuse=clamp((dot(n,light)+0.48)/1.48,0.0,1.0);
    float sky=clamp(n.y*0.5+0.5,0.0,1.0);
    float open=clamp(cloudAO,0.0,1.0);
    float bodyLight=clamp(0.24+diffuse*0.55+sky*0.18,0.0,1.0);
    vec3 color=mix(shadowTint,bodyTint,bodyLight);
    color=mix(color,sunTint,pow(diffuse,1.7)*(0.68+sky*0.22));
    color=mix(shadowTint*0.88,color,0.73+open*0.27);
    float edge=pow(1.0-max(dot(n,eye),0.0),2.5);
    color=mix(color,rimTint,edge*0.13*(0.55+sky*0.45));
    gl_FragColor=vec4(color,1.0);
    #include <colorspace_fragment>
   }
  `,
  toneMapped:false,
  depthWrite:true
 });
}
