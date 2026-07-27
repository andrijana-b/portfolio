/**
 * hero-gradient-blinds.js
 *
 * Recreates the "Gradient Blinds" animated background used behind
 * the hero — diagonal blind-style stripes lit by a cursor-follow
 * spotlight, rendered with raw WebGL (no libraries/build step).
 *
 * Uniform names and fragment-shader math mirror the reference
 * effect 1:1; only the JS scaffolding (buffers, resize, mouse
 * smoothing, render loop) is written from scratch here.
 */

(function () {
  'use strict';

  const canvas = document.querySelector('.hero__bg-canvas');
  const container = document.querySelector('.hero__bg');
  const heroSection = document.querySelector('.hero');
  if (!canvas || !container || !heroSection) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
    || canvas.getContext('experimental-webgl', { alpha: true, antialias: true });
  if (!gl) return;

  /* ── Config — matches the reference effect's defaults ────── */
  const config = {
    angle: 25,
    noise: 0.3,
    blindCount: 16,
    blindMinWidth: 60,
    mouseDampening: 0.15,
    mirrorGradient: false,
    spotlightRadius: 0.5,
    spotlightSoftness: 1,
    spotlightOpacity: 1,
    distortAmount: 0,
    shineDirection: 'left',
    gradientColors: ['#000000', '#000000', '#000000'],
  };

  function hexToRgb(hex) {
    const clean = hex.replace('#', '').padEnd(6, '0');
    return [
      parseInt(clean.slice(0, 2), 16) / 255,
      parseInt(clean.slice(2, 4), 16) / 255,
      parseInt(clean.slice(4, 6), 16) / 255,
    ];
  }

  const colors = config.gradientColors.slice(0, 8);
  if (colors.length === 1) colors.push(colors[0]);
  while (colors.length < 8) colors.push(colors[colors.length - 1]);
  const colorCount = Math.max(2, Math.min(8, config.gradientColors.length));

  /* ── Shaders ──────────────────────────────────────────────── */
  const VERTEX_SRC = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

  const FRAGMENT_SRC = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

vec2 rotate2D(vec2 p, float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec3 getGradientColor(float t){
  float tt = clamp(t, 0.0, 1.0);
  int count = uColorCount;
  if (count < 2) count = 2;
  float scaled = tt * float(count - 1);
  float seg = floor(scaled);
  float f = fract(scaled);

  if (seg < 1.0) return mix(uColor0, uColor1, f);
  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
  if (count > 7) return uColor7;
  if (count > 6) return uColor6;
  if (count > 5) return uColor5;
  if (count > 4) return uColor4;
  if (count > 3) return uColor3;
  if (count > 2) return uColor2;
  return uColor1;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv0 = fragCoord.xy / iResolution.xy;

    float aspect = iResolution.x / iResolution.y;
    vec2 p = uv0 * 2.0 - 1.0;
    p.x *= aspect;
    vec2 pr = rotate2D(p, uAngle);
    pr.x /= aspect;
    vec2 uv = pr * 0.5 + 0.5;

    vec2 uvMod = uv;
    if (uDistort > 0.0) {
      float a = uvMod.y * 6.0;
      float b = uvMod.x * 6.0;
      float w = 0.01 * uDistort;
      uvMod.x += sin(a) * w;
      uvMod.y += cos(b) * w;
    }
    float t = uvMod.x;
    if (uMirror > 0.5) {
      t = 1.0 - abs(1.0 - 2.0 * fract(t));
    }
    vec3 base = getGradientColor(t);

    vec2 offset = vec2(iMouse.x/iResolution.x, iMouse.y/iResolution.y);
    float d = length(uv0 - offset);
    float r = max(uSpotlightRadius, 1e-4);
    float dn = d / r;
    float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
    vec3 cir = vec3(spot);
    float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
    if (uShineFlip > 0.5) stripe = 1.0 - stripe;
    vec3 ran = vec3(stripe);

    vec3 col = cir + base - ran;
    col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;

    fragColor = vec4(col, 1.0);
}

void main() {
    vec4 color;
    mainImage(color, vUv * iResolution.xy);
    gl_FragColor = color;
}
`;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SRC);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  /* ── Oversized full-screen triangle (avoids a seam down the middle) ── */
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const positionLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  const uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 2, 0, 0, 2]), gl.STATIC_DRAW);
  const uvLoc = gl.getAttribLocation(program, 'uv');
  gl.enableVertexAttribArray(uvLoc);
  gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  [
    'iResolution', 'iMouse', 'iTime', 'uAngle', 'uNoise', 'uBlindCount',
    'uSpotlightRadius', 'uSpotlightSoftness', 'uSpotlightOpacity', 'uMirror',
    'uDistort', 'uShineFlip', 'uColor0', 'uColor1', 'uColor2', 'uColor3',
    'uColor4', 'uColor5', 'uColor6', 'uColor7', 'uColorCount',
  ].forEach((name) => { u[name] = gl.getUniformLocation(program, name); });

  gl.uniform1f(u.uAngle, (config.angle * Math.PI) / 180);
  gl.uniform1f(u.uNoise, config.noise);
  gl.uniform1f(u.uSpotlightRadius, config.spotlightRadius);
  gl.uniform1f(u.uSpotlightSoftness, config.spotlightSoftness);
  gl.uniform1f(u.uSpotlightOpacity, config.spotlightOpacity);
  gl.uniform1f(u.uMirror, config.mirrorGradient ? 1 : 0);
  gl.uniform1f(u.uDistort, config.distortAmount);
  gl.uniform1f(u.uShineFlip, config.shineDirection === 'right' ? 1 : 0);
  gl.uniform1i(u.uColorCount, colorCount);
  colors.forEach((hex, i) => gl.uniform3fv(u['uColor' + i], hexToRgb(hex)));

  /* ── Mouse state — smoothed toward target each frame ─────── */
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let mouseTarget = [0, 0];
  let mouseCurrent = [0, 0];
  let firstResize = true;

  function resize() {
    const rect = container.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform3f(u.iResolution, w, h, 1);

    const maxBlinds = config.blindMinWidth > 0
      ? Math.max(1, Math.floor(rect.width / config.blindMinWidth))
      : Infinity;
    gl.uniform1f(u.uBlindCount, Math.max(1, Math.min(config.blindCount, maxBlinds)));

    if (firstResize) {
      firstResize = false;
      mouseTarget = [w / 2, h / 2];
      mouseCurrent = [w / 2, h / 2];
    }
  }
  resize();
  new ResizeObserver(resize).observe(container);

  heroSection.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * dpr;
    const y = (rect.height - (e.clientY - rect.top)) * dpr;
    mouseTarget = [x, y];
    if (config.mouseDampening <= 0) mouseCurrent = [x, y];
  });

  let rafId = null;
  let lastTime = null;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    gl.uniform1f(u.iTime, now * 0.001);

    if (config.mouseDampening > 0) {
      if (lastTime === null) lastTime = now;
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const tau = Math.max(1e-4, config.mouseDampening);
      const k = Math.min(1, 1 - Math.exp(-dt / tau));
      mouseCurrent[0] += (mouseTarget[0] - mouseCurrent[0]) * k;
      mouseCurrent[1] += (mouseTarget[1] - mouseCurrent[1]) * k;
    } else {
      lastTime = now;
    }
    gl.uniform2f(u.iMouse, mouseCurrent[0], mouseCurrent[1]);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  if (reduceMotion) {
    /* Render a single static frame — no animation, no noise flicker */
    gl.uniform1f(u.iTime, 0);
    gl.uniform2f(u.iMouse, mouseCurrent[0], mouseCurrent[1]);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  } else {
    rafId = requestAnimationFrame(frame);
  }
})();
