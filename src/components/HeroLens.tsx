"use client";

import { useEffect, useRef } from "react";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/motion";

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Lente líquido: un círculo de borde orgánico (fbm) que sigue al cursor,
// se estira con la velocidad y refracta la imagen B con separación RGB en el borde.
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uTime;
uniform float uReveal;
uniform float uPosX;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = r * p * 2.02 + 11.3;
    a *= 0.5;
  }
  return v;
}
vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return uv * s + (1.0 - s) * vec2(uPosX, 0.5);
}
void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vUv - uMouse;
  p.x *= aspect;
  vec2 vel = uVel * vec2(aspect, 1.0);
  float speed = clamp(length(vel) * 9.0, 0.0, 1.0);
  vec2 dir = normalize(vel + 1e-5);
  p -= dir * dot(p, dir) * speed * 0.32;

  float n = fbm(vUv * vec2(aspect, 1.0) * 3.6 + vec2(uTime * 0.05, -uTime * 0.035));
  float radius = uReveal * (0.21 + speed * 0.03);
  float d = length(p) + (n - 0.5) * (0.07 + speed * 0.02) * uReveal;
  float mask = 1.0 - smoothstep(radius - 0.022, radius + 0.004, d);

  float edge = smoothstep(radius * 0.45, radius, d) * mask;
  vec2 bend = (vUv - uMouse) * edge * 0.07;
  vec2 uvB = cover(vUv - bend);
  float ca = edge * 0.01 + speed * 0.004;
  vec2 shift = vec2(ca, 0.0) + dir * speed * 0.003;
  vec3 colB = vec3(
    texture2D(uB, uvB + shift).r,
    texture2D(uB, uvB).g,
    texture2D(uB, uvB - shift).b
  );
  vec3 colA = texture2D(uA, cover(vUv)).rgb;
  float rim = smoothstep(radius - 0.03, radius - 0.006, d) * (1.0 - smoothstep(radius - 0.006, radius + 0.01, d));
  vec3 col = mix(colA, colB, mask) + rim * 0.07 * uReveal;
  gl_FragColor = vec4(col, 1.0);
}`;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function HeroLens({ a, b, posX = 0.64 }: { a: string; b: string; posX?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion() || !isFinePointer()) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "high-performance" });
    if (!gl) return;
    const hero = canvas.closest<HTMLElement>(".hero")!;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = u("uRes"), uImg = u("uImg"), uMouse = u("uMouse"), uVel = u("uVel");
    const uTime = u("uTime"), uReveal = u("uReveal");
    gl.uniform1f(u("uPosX"), posX);
    gl.uniform1i(u("uA"), 0);
    gl.uniform1i(u("uB"), 1);

    const texture = (img: HTMLImageElement, unit: number) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      const { width, height } = hero.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, width, height);
    };

    const target = { x: 0.6, y: 0.55 };
    const mouse = { x: 0.6, y: 0.55 };
    const vel = { x: 0, y: 0 };
    const state = { reveal: 0 };
    let raf = 0;
    let visible = true;
    let disposed = false;
    const start = performance.now();

    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
    };
    const onEnter = () => gsap.to(state, { reveal: 1, duration: 0.9, ease: "power3.out", overwrite: true });
    const onLeave = () => gsap.to(state, { reveal: 0, duration: 0.6, ease: "power2.out", overwrite: true });

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const px = mouse.x, py = mouse.y;
      mouse.x += (target.x - mouse.x) * 0.12;
      mouse.y += (target.y - mouse.y) * 0.12;
      vel.x += (mouse.x - px - vel.x) * 0.25;
      vel.y += (mouse.y - py - vel.y) * 0.25;
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform2f(uVel, vel.x, vel.y);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform1f(uReveal, state.reveal);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(hero);

    Promise.all([loadImage(a), loadImage(b)])
      .then(([imgA, imgB]) => {
        if (disposed) return;
        texture(imgA, 0);
        texture(imgB, 1);
        gl.uniform2f(uImg, imgA.naturalWidth, imgA.naturalHeight);
        resize();
        frame();
        canvas.classList.add("is-ready");
        hero.addEventListener("pointermove", onMove);
        hero.addEventListener("pointerenter", onEnter);
        hero.addEventListener("pointerleave", onLeave);
        window.addEventListener("resize", resize);
      })
      .catch(() => {});

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerenter", onEnter);
      hero.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [a, b, posX]);

  return <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />;
}
