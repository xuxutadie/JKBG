<template>
  <div ref="containerRef" class="grainient-container"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const props = defineProps({
  timeSpeed: { type: Number, default: 0.25 },
  colorBalance: { type: Number, default: 0.0 },
  warpStrength: { type: Number, default: 1.0 },
  warpFrequency: { type: Number, default: 5.0 },
  warpSpeed: { type: Number, default: 2.0 },
  warpAmplitude: { type: Number, default: 50.0 },
  blendAngle: { type: Number, default: 0.0 },
  blendSoftness: { type: Number, default: 0.05 },
  rotationAmount: { type: Number, default: 500.0 },
  noiseScale: { type: Number, default: 2.0 },
  grainAmount: { type: Number, default: 0.1 },
  grainScale: { type: Number, default: 2.0 },
  grainAnimated: { type: Boolean, default: false },
  contrast: { type: Number, default: 1.5 },
  gamma: { type: Number, default: 1.0 },
  saturation: { type: Number, default: 1.0 },
  centerX: { type: Number, default: 0.0 },
  centerY: { type: Number, default: 0.0 },
  zoom: { type: Number, default: 0.9 },
  color1: { type: String, default: '#a6e668' }, // Light yellow-green
  color2: { type: String, default: '#76d659' }, // Bright green
  color3: { type: String, default: '#2a6b53' }  // Dark green
});

const containerRef = ref(null);
let raf = 0;
let ro = null;

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  
  // 结合片元坐标，生成高频、视觉静止的细小噪点，并打散摩尔纹
  float noiseVal = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  
  // 在混合渐变前注入微弱的 Dither（抖动）来打破色带(Banding)
  float dither = (noiseVal - 0.5) * 0.03;
  vec3 layer1 = mix(colDark, colOrg, S(edge0, edge1, blendX) + dither);
  vec3 layer2 = mix(colOrg, colLav, S(edge0, edge1, blendX) + dither);
  vec3 col = mix(layer1, layer2, S(v0, v1, tuv.y) + dither);

  col=(col-0.5)*uContrast+0.5;

  // 叠加颗粒度
  col += (noiseVal - 0.5) * uGrainAmount;

  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`;

onMounted(() => {
  if (!containerRef.value) return;
  // Make sure to only run in browser (H5)
  if (typeof window === 'undefined') return;

  const container = containerRef.value;
  
  const renderer = new Renderer({
    webgl: 2,
    alpha: true,
    antialias: false,
    dpr: Math.min(window.devicePixelRatio || 1, 2)
  });

  const gl = renderer.gl;
  const canvas = gl.canvas;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';

  container.appendChild(canvas);

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new Float32Array([1, 1]) },
      uTimeSpeed: { value: props.timeSpeed },
      uColorBalance: { value: props.colorBalance },
      uWarpStrength: { value: props.warpStrength },
      uWarpFrequency: { value: props.warpFrequency },
      uWarpSpeed: { value: props.warpSpeed },
      uWarpAmplitude: { value: props.warpAmplitude },
      uBlendAngle: { value: props.blendAngle },
      uBlendSoftness: { value: props.blendSoftness },
      uRotationAmount: { value: props.rotationAmount },
      uNoiseScale: { value: props.noiseScale },
      uGrainAmount: { value: props.grainAmount },
      uGrainScale: { value: props.grainScale },
      uGrainAnimated: { value: props.grainAnimated ? 1.0 : 0.0 },
      uContrast: { value: props.contrast },
      uGamma: { value: props.gamma },
      uSaturation: { value: props.saturation },
      uCenterOffset: { value: new Float32Array([props.centerX, props.centerY]) },
      uZoom: { value: props.zoom },
      uColor1: { value: new Float32Array(hexToRgb(props.color1)) },
      uColor2: { value: new Float32Array(hexToRgb(props.color2)) },
      uColor3: { value: new Float32Array(hexToRgb(props.color3)) }
    }
  });

  const mesh = new Mesh(gl, { geometry, program });

  const setSize = () => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height);
    const res = program.uniforms.iResolution.value;
    res[0] = gl.drawingBufferWidth;
    res[1] = gl.drawingBufferHeight;
    renderer.render({ scene: mesh });
  };

  ro = new ResizeObserver(setSize);
  ro.observe(container);
  setSize();

  const t0 = performance.now();
  const loop = t => {
    program.uniforms.iTime.value = (t - t0) * 0.001;
    renderer.render({ scene: mesh });
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  if (ro) ro.disconnect();
  if (containerRef.value) {
    try {
      const canvas = containerRef.value.querySelector('canvas');
      if (canvas) {
        containerRef.value.removeChild(canvas);
      }
    } catch {
      // Ignore
    }
  }
});

// Update uniforms when props change
watch(
  () => props,
  (newProps) => {
    // If we want dynamic updates, we would need a ref to the program, but since it's a background effect, we usually mount once.
    // To keep it simple, we skip reactive prop updates for this implementation.
  },
  { deep: true }
);
</script>

<style scoped>
.grainient-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  overflow: hidden;
  background-color: #8ce061; /* Fallback color */
}
</style>