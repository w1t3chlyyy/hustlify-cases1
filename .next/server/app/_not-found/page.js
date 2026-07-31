(()=>{var e={};e.id=409,e.ids=[409],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},8688:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>i.a,__next_app__:()=>d,originalPathname:()=>f,pages:()=>c,routeModule:()=>p,tree:()=>s}),r(5866),r(2523),r(7974);var o=r(3191),l=r(8716),n=r(7922),i=r.n(n),a=r(5231),u={};for(let e in a)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(u[e]=()=>a[e]);r.d(t,u);let s=["",{children:["/_not-found",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,2523)),"/workspaces/hustlify-cases1/src/app/not-found.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,7974)),"/workspaces/hustlify-cases1/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(r.bind(r,2523)),"/workspaces/hustlify-cases1/src/app/not-found.tsx"]}],c=[],f="/_not-found/page",d={require:r,loadChunk:()=>Promise.resolve()},p=new o.AppPageRouteModule({definition:{kind:l.x.APP_PAGE,page:"/_not-found/page",pathname:"/_not-found",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:s}})},4249:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,2994,23)),Promise.resolve().then(r.t.bind(r,6114,23)),Promise.resolve().then(r.t.bind(r,9727,23)),Promise.resolve().then(r.t.bind(r,9671,23)),Promise.resolve().then(r.t.bind(r,1868,23)),Promise.resolve().then(r.t.bind(r,4759,23))},8313:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,9404,23))},4036:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,4064,23)),Promise.resolve().then(r.bind(r,4145)),Promise.resolve().then(r.bind(r,6116))},5303:()=>{},4145:(e,t,r)=>{"use strict";r.d(t,{default:()=>v});var o=r(326),l=r(7577),n=r(8919),i=r(8823),a=r(6999),u=r(8300);r(7809);let s=e=>{let t=e.replace("#","").padEnd(6,"0");return[parseInt(t.slice(0,2),16)/255,parseInt(t.slice(2,4),16)/255,parseInt(t.slice(4,6),16)/255]},c=e=>{let t=(e&&e.length?e:["#4F46E5","#06B6D4","#E0F2FE"]).slice(0,8),r=t.length,o=[];for(let e=0;e<8;e++)o.push(s(t[Math.min(e,t.length-1)]));let l=[0,0,0];for(let e=0;e<r;e++)l[0]+=o[e][0],l[1]+=o[e][1],l[2]+=o[e][2];return l[0]/=r,l[1]/=r,l[2]/=r,{arr:o,count:r,avg:l}},f=e=>{switch(e){case"up":return[0,1];case"down":default:return[0,-1];case"left":return[-1,0];case"right":return[1,0]}},d=`
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
`,m=({className:e,dpr:t,paused:r=!1,colors:s=["#ffffff","#ffffff","#ffffff"],speed:m=.5,scale:v=1.6,turbulence:h=1,fluidity:x=.1,rimWidth:g=.2,sharpness:b=2.5,shimmer:y=1.5,glow:C=2,flowDirection:w="down",opacity:j=1,mouseInteraction:_=!0,mouseStrength:P=1,mouseRadius:k=.35,mouseDampening:M=.15,mixBlendMode:S})=>{let R=(0,l.useRef)(null),E=(0,l.useRef)(null),A=(0,l.useRef)(null),F=(0,l.useRef)(null),I=(0,l.useRef)(null),T=(0,l.useRef)(null),N=(0,l.useRef)([0,0]),q=(0,l.useRef)(0);return(0,l.useEffect)(()=>{let e=R.current;if(!e)return;let o=new n.T({dpr:t??1,alpha:!0,antialias:!0});T.current=o;let l=o.gl,S=l.canvas;l.clearColor(0,0,0,0),S.style.width="100%",S.style.height="100%",S.style.display="block",e.appendChild(S);let{arr:G,count:B,avg:O}=c(s),z={iResolution:{value:[l.drawingBufferWidth,l.drawingBufferHeight,1]},iMouse:{value:[0,0]},iTime:{value:0},uColor0:{value:G[0]},uColor1:{value:G[1]},uColor2:{value:G[2]},uColor3:{value:G[3]},uColor4:{value:G[4]},uColor5:{value:G[5]},uColor6:{value:G[6]},uColor7:{value:G[7]},uColorCount:{value:B},uMouseColor:{value:O},uFlow:{value:f(w)},uSpeed:{value:m},uScale:{value:v},uTurbulence:{value:h},uFluidity:{value:x},uRimWidth:{value:g},uSharpness:{value:b},uShimmer:{value:y},uGlow:{value:C},uOpacity:{value:j},uMouseEnabled:{value:_?1:0},uMouseStrength:{value:P},uMouseRadius:{value:k}},H=new i.$(l,{vertex:d,fragment:p,uniforms:z});A.current=H;let W=new a.C(l);I.current=W;let U=new u.K(l,{geometry:W,program:H});F.current=U;let $=()=>{let t=e.getBoundingClientRect();o.setSize(t.width,t.height),z.iResolution.value=[l.drawingBufferWidth,l.drawingBufferHeight,1]};$();let D=new ResizeObserver($);D.observe(e);let L=e=>{let t=S.getBoundingClientRect(),r=o.dpr||1,l=(e.clientX-t.left)*r,n=(t.height-(e.clientY-t.top))*r;N.current=[l,n],M<=0&&(z.iMouse.value=[l,n])};_&&S.addEventListener("pointermove",L);let X=e=>{if(E.current=requestAnimationFrame(X),z.iTime.value=.001*e,M>0){q.current||(q.current=e);let t=(e-q.current)/1e3;q.current=e;let r=1-Math.exp(-t/Math.max(1e-4,M));r>1&&(r=1);let o=N.current,l=z.iMouse.value;l[0]+=(o[0]-l[0])*r,l[1]+=(o[1]-l[1])*r}else q.current=e;if(!r&&A.current&&F.current)try{o.render({scene:F.current})}catch(e){console.error(e)}};return E.current=requestAnimationFrame(X),()=>{E.current&&cancelAnimationFrame(E.current),_&&S.removeEventListener("pointermove",L),D.disconnect(),S.parentElement===e&&e.removeChild(S);let t=(e,t)=>{let r=e&&e[t];"function"==typeof r&&r.call(e)};t(A.current,"remove"),t(I.current,"remove"),t(F.current,"remove"),t(T.current,"destroy"),A.current=null,I.current=null,F.current=null,T.current=null}},[t,r,s,m,v,h,x,g,b,y,C,w,j,_,P,k,M]),o.jsx("div",{ref:R,className:`ferrofluid-container ${e??""}`,style:{...S&&{mixBlendMode:S}}})};function v(){return o.jsx("div",{className:"fixed inset-0 z-0","aria-hidden":!0,children:o.jsx(m,{className:"h-full w-full",dpr:1,mixBlendMode:"normal",colors:["#ffffff","#ffffff","#ffffff"],speed:.5,scale:1.6,turbulence:1,fluidity:.1,rimWidth:.2,sharpness:2.5,shimmer:1.5,glow:2,flowDirection:"down",opacity:1,mouseInteraction:!0,mouseStrength:1,mouseRadius:.35})})}},6116:(e,t,r)=>{"use strict";function o(){return null}r.d(t,{default:()=>o}),r(7577)},5866:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return n}}),r(3370);let o=r(9510);r(1159);let l={error:{fontFamily:'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',height:"100vh",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},desc:{display:"inline-block"},h1:{display:"inline-block",margin:"0 20px 0 0",padding:"0 23px 0 0",fontSize:24,fontWeight:500,verticalAlign:"top",lineHeight:"49px"},h2:{fontSize:14,fontWeight:400,lineHeight:"49px",margin:0}};function n(){return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("title",{children:"404: This page could not be found."}),(0,o.jsx)("div",{style:l.error,children:(0,o.jsxs)("div",{children:[(0,o.jsx)("style",{dangerouslySetInnerHTML:{__html:"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}),(0,o.jsx)("h1",{className:"next-error-h1",style:l.h1,children:"404"}),(0,o.jsx)("div",{style:l.desc,children:(0,o.jsx)("h2",{style:l.h2,children:"This page could not be found."})})]})})]})}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},7974:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>h,metadata:()=>m,viewport:()=>v});var o=r(9510),l=r(7114),n=r.n(l),i=r(942),a=r.n(i),u=r(131),s=r.n(u),c=r(9720),f=r(8570);let d=(0,f.createProxy)(String.raw`/workspaces/hustlify-cases1/src/components/TelegramInit.tsx#default`),p=(0,f.createProxy)(String.raw`/workspaces/hustlify-cases1/src/components/AppBackground.tsx#default`);r(5023);let m={title:"Hustlify — Кейсы",description:"Закрытые заказы Hustlify. Каждый кейс — доведённый до конца проект."},v={themeColor:"#0A0A0A",width:"device-width",initialScale:1,maximumScale:1,userScalable:!1};function h({children:e}){return(0,o.jsxs)("html",{lang:"ru",className:`${n().variable} ${a().variable} ${s().variable}`,children:[o.jsx("head",{children:o.jsx(c.default,{src:"https://telegram.org/js/telegram-web-app.js",strategy:"beforeInteractive"})}),(0,o.jsxs)("body",{className:"grain relative min-h-screen bg-ink text-paper antialiased",children:[o.jsx(p,{}),o.jsx(d,{}),o.jsx("div",{className:"relative z-10",children:e})]})]})}},2523:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>n});var o=r(9510),l=r(7371);function n(){return(0,o.jsxs)("main",{className:"flex min-h-screen flex-col items-center justify-center px-6 text-center",children:[o.jsx("p",{className:"eyebrow",children:"404"}),o.jsx("h1",{className:"mt-4 font-display text-3xl font-semibold",children:"Кейс не найден"}),o.jsx("p",{className:"mt-2 text-fog",children:"Возможно, он ещё не опубликован."}),o.jsx(l.default,{href:"/cases",className:"mt-8 rounded-full border border-paper/25 px-6 py-3 font-display text-xs uppercase tracking-widest hover:border-paper",children:"Ко всем кейсам"})]})}},5023:()=>{},7809:()=>{},3370:(e,t,r)=>{"use strict";function o(e){return e&&e.__esModule?e:{default:e}}r.r(t),r.d(t,{_:()=>o,_interop_require_default:()=>o})}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[276,611],()=>r(8688));module.exports=o})();