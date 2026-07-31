exports.id=761,exports.ids=[761],exports.modules={4249:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,2994,23)),Promise.resolve().then(r.t.bind(r,6114,23)),Promise.resolve().then(r.t.bind(r,9727,23)),Promise.resolve().then(r.t.bind(r,9671,23)),Promise.resolve().then(r.t.bind(r,1868,23)),Promise.resolve().then(r.t.bind(r,4759,23))},8313:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,9404,23))},4036:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,4064,23)),Promise.resolve().then(r.bind(r,4145)),Promise.resolve().then(r.bind(r,6116))},4145:(e,t,r)=>{"use strict";r.d(t,{default:()=>v});var l=r(326),o=r(7577),n=r(8919),u=r(8823),a=r(6999),i=r(8300);r(7809);let s=e=>{let t=e.replace("#","").padEnd(6,"0");return[parseInt(t.slice(0,2),16)/255,parseInt(t.slice(2,4),16)/255,parseInt(t.slice(4,6),16)/255]},c=e=>{let t=(e&&e.length?e:["#4F46E5","#06B6D4","#E0F2FE"]).slice(0,8),r=t.length,l=[];for(let e=0;e<8;e++)l.push(s(t[Math.min(e,t.length-1)]));let o=[0,0,0];for(let e=0;e<r;e++)o[0]+=l[e][0],o[1]+=l[e][1],o[2]+=l[e][2];return o[0]/=r,o[1]/=r,o[2]/=r,{arr:l,count:r,avg:o}},f=e=>{switch(e){case"up":return[0,1];case"down":default:return[0,-1];case"left":return[-1,0];case"right":return[1,0]}},d=`
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`,p=`
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec3  uMouseColor;
uniform vec2  uFlow;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uFluidity;
uniform float uRimWidth;
uniform float uSharpness;
uniform float uShimmer;
uniform float uGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

#define PI 3.14159265

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * PI - PI / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  float ref = 700.0 / max(uScale, 0.05);
  vec2 p = fragCoord / iResolution.y * ref;

  float spd = 200.0 * uSpeed;
  float t = iTime;

  vec2 dir = uFlow;
  vec2 perp = vec2(-dir.y, dir.x);

  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;

  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);

  float mapeaks = smin(peaks, peaks2, max(uFluidity, 0.001));

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mp = iMouse / iResolution.y * ref;
    float md = length(p - mp) / ref;
    float rr = max(uMouseRadius, 0.02);
    mGlow = exp(-md * md / (rr * rr)) * uMouseStrength;
  }

  float band = (uRimWidth - abs((mapeaks - 0.4) * 2.0)) * 5.0;
  float ltn = clamp(band - vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer, 0.0, 1.0);
  ltn = pow(ltn, uSharpness) * uGlow;
  ltn *= clamp(1.0 - mGlow, 0.0, 1.0);

  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 col = palette(h);

  vec3 outc = col * ltn;
  float a = clamp(max(outc.r, max(outc.g, outc.b)), 0.0, 1.0);
  fragColor = vec4(outc, a * uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`,m=({className:e,dpr:t,paused:r=!1,colors:s=["#ffffff","#ffffff","#ffffff"],speed:m=.5,scale:v=1.6,turbulence:h=1,fluidity:x=.1,rimWidth:g=.2,sharpness:b=2.5,shimmer:C=1.5,glow:w=2,flowDirection:y="down",opacity:R=1,mouseInteraction:S=!0,mouseStrength:j=1,mouseRadius:k=.35,mouseDampening:M=.15,mixBlendMode:P})=>{let N=(0,o.useRef)(null),F=(0,o.useRef)(null),E=(0,o.useRef)(null),I=(0,o.useRef)(null),T=(0,o.useRef)(null),B=(0,o.useRef)(null),A=(0,o.useRef)([0,0]),z=(0,o.useRef)(0);return(0,o.useEffect)(()=>{let e=N.current;if(!e)return;let l=new n.T({dpr:t??1,alpha:!0,antialias:!0});B.current=l;let o=l.gl,P=o.canvas;o.clearColor(0,0,0,0),P.style.width="100%",P.style.height="100%",P.style.display="block",e.appendChild(P);let{arr:G,count:W,avg:$}=c(s),O={iResolution:{value:[o.drawingBufferWidth,o.drawingBufferHeight,1]},iMouse:{value:[0,0]},iTime:{value:0},uColor0:{value:G[0]},uColor1:{value:G[1]},uColor2:{value:G[2]},uColor3:{value:G[3]},uColor4:{value:G[4]},uColor5:{value:G[5]},uColor6:{value:G[6]},uColor7:{value:G[7]},uColorCount:{value:W},uMouseColor:{value:$},uFlow:{value:f(y)},uSpeed:{value:m},uScale:{value:v},uTurbulence:{value:h},uFluidity:{value:x},uRimWidth:{value:g},uSharpness:{value:b},uShimmer:{value:C},uGlow:{value:w},uOpacity:{value:R},uMouseEnabled:{value:S?1:0},uMouseStrength:{value:j},uMouseRadius:{value:k}},H=new u.$(o,{vertex:d,fragment:p,uniforms:O});E.current=H;let U=new a.C(o);T.current=U;let D=new i.K(o,{geometry:U,program:H});I.current=D;let L=()=>{let t=e.getBoundingClientRect();l.setSize(t.width,t.height),O.iResolution.value=[o.drawingBufferWidth,o.drawingBufferHeight,1]};L();let q=new ResizeObserver(L);q.observe(e);let _=e=>{let t=P.getBoundingClientRect(),r=l.dpr||1,o=(e.clientX-t.left)*r,n=(t.height-(e.clientY-t.top))*r;A.current=[o,n],M<=0&&(O.iMouse.value=[o,n])};S&&P.addEventListener("pointermove",_);let K=e=>{if(F.current=requestAnimationFrame(K),O.iTime.value=.001*e,M>0){z.current||(z.current=e);let t=(e-z.current)/1e3;z.current=e;let r=1-Math.exp(-t/Math.max(1e-4,M));r>1&&(r=1);let l=A.current,o=O.iMouse.value;o[0]+=(l[0]-o[0])*r,o[1]+=(l[1]-o[1])*r}else z.current=e;if(!r&&E.current&&I.current)try{l.render({scene:I.current})}catch(e){console.error(e)}};return F.current=requestAnimationFrame(K),()=>{F.current&&cancelAnimationFrame(F.current),S&&P.removeEventListener("pointermove",_),q.disconnect(),P.parentElement===e&&e.removeChild(P);let t=(e,t)=>{let r=e&&e[t];"function"==typeof r&&r.call(e)};t(E.current,"remove"),t(T.current,"remove"),t(I.current,"remove"),t(B.current,"destroy"),E.current=null,T.current=null,I.current=null,B.current=null}},[t,r,s,m,v,h,x,g,b,C,w,y,R,S,j,k,M]),l.jsx("div",{ref:N,className:`ferrofluid-container ${e??""}`,style:{...P&&{mixBlendMode:P}}})};function v(){return l.jsx("div",{className:"fixed inset-0 z-0","aria-hidden":!0,children:l.jsx(m,{className:"h-full w-full",dpr:1,mixBlendMode:"normal",colors:["#ffffff","#ffffff","#ffffff"],speed:.5,scale:1.6,turbulence:1,fluidity:.1,rimWidth:.2,sharpness:2.5,shimmer:1.5,glow:2,flowDirection:"down",opacity:1,mouseInteraction:!0,mouseStrength:1,mouseRadius:.35})})}},7732:(e,t,r)=>{"use strict";r.d(t,{Z:()=>n});var l=r(326),o=r(434);function n({href:e,onClick:t,children:r,className:n=""}){let u=`uiverse-btn group w-full sm:w-auto ${n}`.trim();return e?l.jsx(o.default,{href:e,onClick:t,className:u,children:r}):l.jsx("button",{onClick:t,className:u,children:r})}},6116:(e,t,r)=>{"use strict";function l(){return null}r.d(t,{default:()=>l}),r(7577)},8458:(e,t,r)=>{"use strict";function l(e="light"){}function o(e){}r.d(t,{DL:()=>o,ON:()=>l})},7974:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>h,metadata:()=>m,viewport:()=>v});var l=r(9510),o=r(7114),n=r.n(o),u=r(942),a=r.n(u),i=r(131),s=r.n(i),c=r(9720),f=r(8570);let d=(0,f.createProxy)(String.raw`/workspaces/hustlify-cases1/src/components/TelegramInit.tsx#default`),p=(0,f.createProxy)(String.raw`/workspaces/hustlify-cases1/src/components/AppBackground.tsx#default`);r(5023);let m={title:"Hustlify — Кейсы",description:"Закрытые заказы Hustlify. Каждый кейс — доведённый до конца проект."},v={themeColor:"#0A0A0A",width:"device-width",initialScale:1,maximumScale:1,userScalable:!1};function h({children:e}){return(0,l.jsxs)("html",{lang:"ru",className:`${n().variable} ${a().variable} ${s().variable}`,children:[l.jsx("head",{children:l.jsx(c.default,{src:"https://telegram.org/js/telegram-web-app.js",strategy:"beforeInteractive"})}),(0,l.jsxs)("body",{className:"grain relative min-h-screen bg-ink text-paper antialiased",children:[l.jsx(p,{}),l.jsx(d,{}),l.jsx("div",{className:"relative z-10",children:e})]})]})}},2523:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>n});var l=r(9510),o=r(7371);function n(){return(0,l.jsxs)("main",{className:"flex min-h-screen flex-col items-center justify-center px-6 text-center",children:[l.jsx("p",{className:"eyebrow",children:"404"}),l.jsx("h1",{className:"mt-4 font-display text-3xl font-semibold",children:"Кейс не найден"}),l.jsx("p",{className:"mt-2 text-fog",children:"Возможно, он ещё не опубликован."}),l.jsx(o.default,{href:"/cases",className:"mt-8 rounded-full border border-paper/25 px-6 py-3 font-display text-xs uppercase tracking-widest hover:border-paper",children:"Ко всем кейсам"})]})}},5023:()=>{},7809:()=>{}};