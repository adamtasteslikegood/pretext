(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function r(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(o){if(o.ep)return;o.ep=!0;const a=r(o);fetch(o.href,a)}})();const K=2,N={app:"UI Shader",description:"A standalone animated gradient with blended color drift, soft ribbon motion, and direct browser controls.",scene:{palette:"sessions",speed:K,paused:!1,renderer:"webgl"},palettes:[{id:"sessions",label:"Prism",summary:"Electric lemon, charged pink, ultraviolet, and cobalt sweep."},{id:"lagoon",label:"Lagoon",summary:"Mint cyan, sea-glass light, and a blue-violet wave finish."},{id:"ember",label:"Ember",summary:"Apricot flare, persimmon heat, rose neon, and twilight purple."},{id:"aurora",label:"Aurora",summary:"Lime glow, aquamarine lift, ice blue, and orchid afterlight."}],renderers:[{id:"webgl",label:"WebGL"},{id:"fallback",label:"Fallback"}]},E={paletteCatalog:{sessions:{label:"Prism",summary:"Electric lemon, charged pink, ultraviolet, and cobalt sweep.",colors:["#fff06a","#ff4fd8","#7c3dff","#2b63ff"]},lagoon:{label:"Lagoon",summary:"Mint cyan, sea-glass light, and a blue-violet wave finish.",colors:["#7df9ff","#2ec5ff","#8ff7dc","#6d5efc"]},ember:{label:"Ember",summary:"Amber fire, vermilion heat, ember red, and smoke-plum depth.",colors:["#ffd166","#ff7a18","#ff3b30","#7a1f45"]},aurora:{label:"Aurora",summary:"Lime glow, aquamarine lift, ice blue, and orchid afterlight.",colors:["#d8ff72","#00d7a7","#7df9ff","#8e5dff"]}},speedRange:{min:.15,max:5,step:.05}},D=document.querySelector("#webgl-stage"),S=document.querySelector("#fallback-stage"),le=document.querySelector("#summary"),ie=document.querySelector("#panel-note"),ce=document.querySelector("#palette-status"),de=document.querySelector("#host-status"),O=document.querySelector("#controls-chip"),Z=document.querySelector(".panel"),B=document.querySelector("#palette-grid"),ee=document.querySelector("#renderer-webgl"),te=document.querySelector("#renderer-fallback"),k=document.querySelector("#speed-input"),fe=document.querySelector("#speed-value"),re=document.querySelector("#play-toggle"),ue=document.querySelector("#compatibility-note"),pe=document.querySelector("#compatibility-note-label"),H=document.querySelector("#fullscreen-button"),he=new Set(["sessions","lagoon","ember","aurora"]),ae=new Set(["webgl","fallback"]),Y="ui-shader:scene",F=new URLSearchParams(window.location.search);function me(t){return t==="true"?!0:t==="false"?!1:null}function ge(){const e={...N.scene},r=F.get("palette"),i=F.get("renderer"),o=F.get("speed"),a=me(F.get("paused"));if(r&&he.has(r)&&(e.palette=r),i&&ae.has(i)&&(e.renderer=i),o!==null){const s=Number(o);Number.isFinite(s)&&(e.speed=s)}return a!==null&&(e.paused=a),e}let L={...N,scene:ge()},c=E;const n={palette:"sessions",speed:K,speedPreferenceSet:!1,paused:!1,desiredRenderer:"webgl",activeRenderer:"fallback",playhead:0,lastTick:0,needsRender:!0,theme:window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark",displayMode:"standalone",controlsCollapsed:!1};let V=0,y=null;function z(t,e,r){return Math.min(r,Math.max(e,t))}function J(t){const e=t.replace("#",""),r=Number.parseInt(e,16);return{r:r>>16&255,g:r>>8&255,b:r&255}}function p(t,e,r,i=1){const o=J(t),a=J(e),s=(d,x)=>Math.round(d+(x-d)*z(r,0,1));return"rgba("+s(o.r,a.r)+", "+s(o.g,a.g)+", "+s(o.b,a.b)+", "+i+")"}function I(){return(c==null?void 0:c.paletteCatalog)??E.paletteCatalog}function be(){return(L==null?void 0:L.scene)??N.scene}function we(){try{const t=window.localStorage.getItem(Y);return t?JSON.parse(t):{}}catch(t){return console.warn("Failed to read saved UI Shader state.",t),{}}}function ne(){const t=be(),e=we(),r=(c==null?void 0:c.speedRange)??E.speedRange,i=I(),o=e.palette&&i[e.palette]?e.palette:t.palette,a=e.speedPreferenceSet===!0&&Number.isFinite(Number(e.speed));n.palette=o;const s=a?e.speed:t.speed??K;n.speed=z(Number(s),r.min,r.max),n.speedPreferenceSet=a,n.paused=!!(e.paused??t.paused??!1),n.desiredRenderer=e.renderer&&ae.has(e.renderer)?e.renderer:t.renderer??"webgl"}function q(){const t={palette:n.palette,speed:Number(n.speed.toFixed(2)),speedPreferenceSet:n.speedPreferenceSet,paused:n.paused,renderer:n.desiredRenderer};try{window.localStorage.setItem(Y,JSON.stringify(t))}catch(e){console.warn("Failed to save UI Shader state.",e)}}function oe(t){n.theme=t||"dark",document.documentElement.dataset.theme=String(n.theme).includes("light")?"light":"dark"}function Se(t,e="0px"){return typeof t=="number"&&Number.isFinite(t)?Math.max(0,t)+"px":typeof t=="string"&&t.trim()?/^-?\d+(\.\d+)?$/.test(t.trim())?Math.max(0,Number(t))+"px":t:e}function X(){const t=document.documentElement.style;t.setProperty("--safe-top","0px"),t.setProperty("--safe-right","0px"),t.setProperty("--safe-bottom","0px"),t.setProperty("--safe-left","0px"),t.setProperty("--app-height",Se(window.innerHeight,"100dvh"))}function xe(t){n.displayMode=t||"standalone",document.documentElement.dataset.displayMode=n.displayMode,X()}function ye(t,e){const r=document.createElement("button");r.className="palette-button",r.type="button",r.dataset.paletteId=t,r.setAttribute("aria-pressed","false");const i=document.createElement("div");i.className="swatches",e.colors.forEach(a=>{const s=document.createElement("span");s.className="swatch",s.style.background=a,i.appendChild(s)});const o=document.createElement("div");return o.className="palette-label",o.innerHTML="<strong>"+e.label+"</strong><span>"+e.summary+"</span>",r.appendChild(i),r.appendChild(o),r.addEventListener("click",()=>{n.palette=t,n.needsRender=!0,q(),v(),b()}),r}function ve(t){const e=t.getContext("webgl",{alpha:!1,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1})||t.getContext("experimental-webgl");if(!e)return null;const r=`
          attribute vec2 a_position;
          varying vec2 v_uv;

          void main() {
            v_uv = 0.5 * (a_position + 1.0);
            gl_Position = vec4(a_position, 0.0, 1.0);
          }
        `,i=`
          precision highp float;

          varying vec2 v_uv;
          uniform vec2 u_resolution;
          uniform float u_time;
          uniform vec3 u_palette[4];

          float gaussian1(float value, float sigma) {
            return exp(-0.5 * (value * value) / max(sigma * sigma, 0.0001));
          }

          void main() {
            vec2 uv = v_uv;
            vec2 p = uv * 2.0 - 1.0;
            float aspect = u_resolution.x / max(u_resolution.y, 1.0);
            p.x *= aspect;

            float t = u_time * 0.42;
            vec3 paper = vec3(0.92, 0.924, 0.945);
            paper = mix(paper, vec3(0.985, 0.985, 0.99), 0.06 * smoothstep(0.0, 1.0, uv.y));
            paper += vec3(
              0.003 * sin(uv.x * 3.0 + t * 0.24) +
              0.002 * cos(uv.y * 5.8 - t * 0.18)
            );

            vec2 q = p;
            float ux = p.x / max(aspect, 0.0001);
            q.y +=
              0.06 * sin(ux * 2.4 - t * 0.62) +
              0.026 * sin(ux * 6.8 + t * 0.44);
            q.x += aspect * (
              0.035 * sin(q.y * 2.6 + t * 0.36) +
              0.012 * cos(q.y * 6.2 - t * 0.21)
            );

            float center =
              -0.06 +
              0.22 * sin(ux * 1.18 - t * 0.46) +
              0.07 * sin(ux * 3.75 + t * 0.28);
            center += 0.12 * exp(-5.4 * pow(ux - 0.78, 2.0)) * sin(t * 0.72 + ux * 4.6);
            center -= 0.08 * exp(-6.5 * pow(ux + 0.62, 2.0)) * cos(t * 0.54 - 0.3);

            float thickness =
              0.84 +
              0.12 * sin(ux * 1.6 + t * 0.18) +
              0.05 * cos(ux * 4.8 - t * 0.22);
            float feather = max(0.0055, 2.4 / max(u_resolution.y, 1.0));

            float upper =
              center -
              thickness * (0.47 + 0.06 * sin(ux * 2.9 - t * 0.24));
            float lower =
              center +
              thickness * (0.43 + 0.05 * cos(ux * 2.5 + t * 0.21));

            float surface =
              smoothstep(upper - feather * 3.2, upper + feather * 2.0, q.y) *
              (1.0 - smoothstep(lower - feather * 2.0, lower + feather * 3.2, q.y));

            float local = clamp((q.y - upper) / max(lower - upper, 0.0001), 0.0, 1.0);
            float fold =
              0.11 * sin(ux * 7.2 - t * 0.78 + local * 6.2) +
              0.04 * sin(ux * 13.4 + t * 0.41 - local * 8.6);
            float sample = clamp(local + fold * 0.24, 0.0, 1.0);

            vec3 violet = mix(u_palette[3], u_palette[2], 0.18);
            vec3 magenta = mix(u_palette[2], vec3(1.0, 0.34, 0.84), 0.12);
            vec3 orange = mix(u_palette[1], vec3(1.0, 0.66, 0.18), 0.1);
            vec3 gold = mix(u_palette[0], vec3(1.0, 0.95, 0.62), 0.08);

            float w0 = gaussian1(sample - (0.13 + 0.04 * sin(ux * 1.8 - t * 0.22)), 0.18);
            float w1 = gaussian1(sample - (0.38 + 0.03 * cos(ux * 2.6 + t * 0.19)), 0.16);
            float w2 = gaussian1(sample - (0.64 + 0.03 * sin(ux * 2.2 - t * 0.27)), 0.16);
            float w3 = gaussian1(sample - (0.88 + 0.02 * cos(ux * 2.9 + t * 0.16)), 0.15);

            w0 = pow(w0, 1.2);
            w1 = pow(w1, 1.22);
            w2 = pow(w2, 1.18);
            w3 = pow(w3, 1.15);

            vec3 wash =
              (w0 * violet + w1 * magenta + w2 * orange + w3 * gold) /
              max(w0 + w1 + w2 + w3, 0.0001);

            float upperEdge = exp(-pow((q.y - upper) / max(feather * 14.0, 0.001), 2.0));
            float lowerEdge = exp(-pow((q.y - lower) / max(feather * 14.0, 0.001), 2.0));
            float sheen =
              exp(-pow((sample - (0.18 + 0.03 * sin(ux * 4.0 - t * 0.56))) / 0.035, 2.0)) * 0.06 +
              exp(-pow((sample - (0.52 + 0.04 * cos(ux * 3.4 + t * 0.42))) / 0.045, 2.0)) * 0.05;

            vec3 color = mix(paper, wash, surface * 0.98);
            color += vec3(1.0) * upperEdge * surface * 0.12;
            color += wash * sheen * surface * 0.16;
            color += vec3(1.0, 0.94, 0.88) * sheen * surface * 0.08;
            color -= vec3(0.06, 0.04, 0.08) * lowerEdge * surface * 0.12;

            float bodyShadow = smoothstep(lower - 0.02, lower + thickness * 0.1, q.y) * surface;
            color -= vec3(0.02, 0.015, 0.03) * bodyShadow * 0.5;

            float glow = exp(-4.0 * pow(q.y - (center + thickness * 0.1), 2.0)) * surface * 0.04;
            color += wash * glow;

            float vignette = smoothstep(1.75, 0.22, length(vec2(ux * 0.84, q.y * 0.9)));
            color = mix(paper * 0.95, color, vignette);
            color = pow(clamp(color, 0.0, 1.0), vec3(0.95));

            gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
          }
        `;function o(m,_){const u=e.createShader(m);if(e.shaderSource(u,_),e.compileShader(u),!e.getShaderParameter(u,e.COMPILE_STATUS)){const g=e.getShaderInfoLog(u);throw e.deleteShader(u),new Error(g||"Shader compilation failed.")}return u}const a=o(e.VERTEX_SHADER,r),s=o(e.FRAGMENT_SHADER,i),d=e.createProgram();if(e.attachShader(d,a),e.attachShader(d,s),e.linkProgram(d),!e.getProgramParameter(d,e.LINK_STATUS)){const m=e.getProgramInfoLog(d);throw new Error(m||"Program linking failed.")}e.useProgram(d);const x=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,x),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const R=e.getAttribLocation(d,"a_position");e.enableVertexAttribArray(R),e.vertexAttribPointer(R,2,e.FLOAT,!1,0,0);const U=e.getUniformLocation(d,"u_resolution"),C=e.getUniformLocation(d,"u_time"),G=e.getUniformLocation(d,"u_palette[0]"),A={gl:e,canvas:t,draw(m,_){const u=Math.min(window.devicePixelRatio||1,3),g=Math.max(1,Math.floor(t.clientWidth*u)),l=Math.max(1,Math.floor(t.clientHeight*u));(t.width!==g||t.height!==l)&&(t.width=g,t.height=l,e.viewport(0,0,g,l));const f=new Float32Array(_.flatMap(h=>{const w=J(h);return[w.r/255,w.g/255,w.b/255]}));e.uniform2f(U,g,l),e.uniform1f(C,m),e.uniform3fv(G,f),e.drawArrays(e.TRIANGLES,0,3)}};return t.addEventListener("webglcontextlost",m=>{m.preventDefault(),y=null,P(),b()}),A}function Re(t,e){const r=S.getContext("2d");if(!r)return;const i=Math.min(window.devicePixelRatio||1,3),o=Math.max(1,Math.floor(S.clientWidth*i)),a=Math.max(1,Math.floor(S.clientHeight*i));(S.width!==o||S.height!==a)&&(S.width=o,S.height=a),r.setTransform(1,0,0,1,0,0),r.clearRect(0,0,o,a);const s=r.createLinearGradient(0,0,o,a);s.addColorStop(0,p(e[0],"#eef2ff",.9)),s.addColorStop(.5,"rgba(238, 238, 246, 1)"),s.addColorStop(1,p(e[3],"#e8ebf8",.84)),r.fillStyle=s,r.fillRect(0,0,o,a);const d=r.createRadialGradient(o*.08,a*.32,0,o*.08,a*.32,Math.max(o,a)*.72);d.addColorStop(0,"rgba(10, 18, 31, 0.26)"),d.addColorStop(1,"rgba(14, 22, 38, 0)"),r.fillStyle=d,r.fillRect(0,0,o,a);const x=r.createRadialGradient(o*.52,a*.42,0,o*.52,a*.42,Math.max(o,a)*.42);x.addColorStop(0,p(e[0],"#ffffff",.22,.12)),x.addColorStop(.4,p(e[1],"#ffffff",.38,.06)),x.addColorStop(1,"rgba(255, 255, 255, 0)"),r.fillStyle=x,r.fillRect(0,0,o,a);const R={violet:p(e[3],"#5f22ff",.12),magenta:p(e[2],"#ff63df",.1),orange:p(e[1],"#ffb459",.08),gold:p(e[0],"#fff0b5",.06)};function U(l){const f=-.18+l*1.36;let h=a*.48+Math.sin(f*Math.PI*1.18-t*.92)*a*.18+Math.sin(f*Math.PI*3.6+t*.52)*a*.06+Math.cos(f*Math.PI*7.4-t*.24)*a*.015;return h+=Math.exp(-5.4*Math.pow(f-.82,2))*Math.sin(t*.66+f*4.8)*a*.14,h-=Math.exp(-6.2*Math.pow(f+.58,2))*Math.cos(t*.48-.3)*a*.08,h}function C(l,f,h,w=0){const M=new Path2D,j=96;for(let T=0;T<=j;T+=1){const W=T/j,Q=l+(f-l)*W,$=U(W)+h.offset+Math.sin(W*Math.PI*7-t*.54+h.phase)*a*.01+w;T===0?M.moveTo(Q,$):M.lineTo(Q,$)}return M}function G(l,f,h,w,M){r.lineCap="round",r.lineJoin="round",r.lineWidth=f*1.04,r.strokeStyle=w,r.stroke(l),r.lineWidth=f,r.strokeStyle=h,r.stroke(l),r.globalAlpha=.34,r.lineWidth=Math.max(2,f*.08),r.strokeStyle=M,r.stroke(l),r.globalAlpha=1}const A=-o*.12,m=o*1.12;[{offset:-a*.24,width:a*.14,color:R.violet,shadow:"rgba(18, 22, 38, 0.08)",highlight:p(e[2],"#ffffff",.74,.38),phase:.12},{offset:-a*.09,width:a*.135,color:R.magenta,shadow:"rgba(18, 22, 38, 0.07)",highlight:p(e[2],"#ffffff",.7,.34),phase:.46},{offset:a*.06,width:a*.13,color:R.orange,shadow:"rgba(18, 22, 38, 0.07)",highlight:p(e[0],"#ffffff",.62,.32),phase:.82},{offset:a*.22,width:a*.125,color:R.gold,shadow:"rgba(18, 22, 38, 0.06)",highlight:"rgba(255, 255, 255, 0.36)",phase:1.14}].forEach(l=>{const f=C(A,m,l,l.width*.12);r.lineCap="round",r.lineJoin="round",r.lineWidth=l.width*1.05,r.strokeStyle="rgba(18, 22, 38, 0.05)",r.stroke(f);const h=C(A,m,l);G(h,l.width,l.color,l.shadow,l.highlight);const w=C(A,m,l,-l.width*.18);r.globalAlpha=.26,r.lineWidth=Math.max(2,l.width*.06),r.strokeStyle=l.highlight,r.stroke(w),r.globalAlpha=1});const u=r.createRadialGradient(o*.5,a*.55,0,o*.5,a*.55,Math.max(o,a)*.42);u.addColorStop(0,p(e[2],"#ffffff",.28,.1)),u.addColorStop(.55,p(e[1],"#ffffff",.34,.05)),u.addColorStop(1,"rgba(255, 255, 255, 0)"),r.fillStyle=u,r.fillRect(0,0,o,a);const g=r.createRadialGradient(o*.54,a*.48,Math.min(o,a)*.18,o*.54,a*.48,Math.max(o,a)*.82);g.addColorStop(0,"rgba(0, 0, 0, 0)"),g.addColorStop(1,"rgba(7, 12, 24, 0.16)"),r.fillStyle=g,r.fillRect(0,0,o,a)}function se(){return I()[n.palette]??I().sessions}function Ee(){const t=n.activeRenderer==="webgl";D.classList.toggle("is-active",t),S.classList.toggle("is-active",!t),D.setAttribute("aria-hidden",String(!t)),S.setAttribute("aria-hidden",String(t))}function P(){if(n.desiredRenderer==="webgl"&&!y)try{y=ve(D)}catch(t){console.error("WebGL renderer failed, falling back.",t),y=null}n.activeRenderer=n.desiredRenderer==="webgl"&&y?"webgl":"fallback",Ee()}function ke(){de.textContent="Local browser"}function Le(){O.hidden=!0,Z.hidden=!1,O.setAttribute("aria-expanded","true"),H.hidden=!1,H.textContent="Reset scene"}function Pe(){B.innerHTML="",Object.entries(I()).forEach(([t,e])=>{B.appendChild(ye(t,e))})}function v(){var i,o,a;const t=se(),e=n.activeRenderer==="fallback",r=n.activeRenderer==="fallback"&&n.desiredRenderer==="webgl";le.textContent=(L==null?void 0:L.description)??N.description,Z.dataset.compatibility=r?"true":"false",ie.hidden=!r,ue.hidden=!e,pe.textContent=r?"Compatibility fallback active":"Ribbon fallback selected",ce.textContent=t.label,O.textContent="Show controls",fe.textContent=n.speed.toFixed(2)+"x",k.value=String(n.speed),k.min=String(((i=c==null?void 0:c.speedRange)==null?void 0:i.min)??E.speedRange.min),k.max=String(((o=c==null?void 0:c.speedRange)==null?void 0:o.max)??E.speedRange.max),k.step=String(((a=c==null?void 0:c.speedRange)==null?void 0:a.step)??E.speedRange.step),re.textContent=n.paused?"Resume animation":"Pause animation",ee.setAttribute("aria-pressed",String(n.desiredRenderer==="webgl")),te.setAttribute("aria-pressed",String(n.desiredRenderer==="fallback")),B.querySelectorAll("[data-palette-id]").forEach(s=>{s.setAttribute("aria-pressed",String(s.dataset.paletteId===n.palette))}),ke(),Le()}function Ce(){const t=se().colors;if(n.activeRenderer==="webgl"&&y)try{y.draw(n.playhead,t);return}catch(e){console.error("WebGL draw failed, falling back.",e),y=null,P(),v()}Re(n.playhead,t)}function Ae(t){V=0,n.lastTick||(n.lastTick=t);const e=Math.min(.05,(t-n.lastTick)/1e3);n.lastTick=t,n.paused||(n.playhead+=e*n.speed),(n.needsRender||!n.paused)&&(Ce(),n.needsRender=!1),n.paused||b()}function b(){V||(V=window.requestAnimationFrame(Ae))}k.addEventListener("input",()=>{const t=(c==null?void 0:c.speedRange)??E.speedRange;n.speed=z(Number(k.value),t.min,t.max),n.speedPreferenceSet=!0,n.needsRender=!0,q(),v(),b()});re.addEventListener("click",()=>{n.paused=!n.paused,n.needsRender=!0,n.lastTick=performance.now(),q(),v(),b()});ee.addEventListener("click",()=>{n.desiredRenderer="webgl",n.lastTick=performance.now(),P(),n.needsRender=!0,q(),v(),b()});te.addEventListener("click",()=>{n.desiredRenderer="fallback",n.lastTick=performance.now(),P(),n.needsRender=!0,q(),v(),b()});H.addEventListener("click",()=>{window.localStorage.removeItem(Y),n.playhead=0,n.lastTick=performance.now(),ne(),P(),n.needsRender=!0,v(),b()});window.addEventListener("resize",()=>{X(),n.needsRender=!0,b()},{passive:!0});const Me=window.matchMedia("(prefers-color-scheme: light)");Me.addEventListener("change",t=>{oe(t.matches?"light":"dark")});oe(n.theme);xe(n.displayMode);X();ne();Pe();P();v();b();
