(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,686804,e=>{"use strict";var t=e.i(577819);e.s(["SubscriberUrlParam",0,function(){return(0,t.useConvertkitSubscriberUrlParam)(),null}])},397357,e=>{"use strict";var t=e.i(823047),o=e.i(908287),r=e.i(94447);let i={brand:[[.866,.431,.122],[.949,.749,.722],[.122,.31,.788],[.941,.902,.839],[.957,.769,.141],[.839,.224,.141]],brandVibrant:[[1,.42,.08],[1,.36,.62],[.07,.28,.95],[1,.78,.32],[1,.78,0],[.96,.16,.12]],brandHot:[[.957,.769,.141],[.866,.431,.122],[.839,.224,.141],[.949,.749,.722],[.122,.31,.788],[.941,.902,.839]],rainbow:[[1,.2,.2],[1,.55,.1],[1,.85,.15],[.25,.8,.35],[.2,.45,.95],[.65,.25,.9]]},a=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
	vUv = aPos * 0.5 + 0.5;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`,n=`#version 300 es
precision highp float;
in vec2 vUv;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uTime;
uniform float uSpeed;
uniform float uSeed;
uniform float uFreq;
uniform float uDispAmp;
uniform float uDispFreq;
uniform float uFlowY;
uniform float uFlowX;
uniform float uIntensity;
uniform float uSaturation;
uniform float uSharpness;
uniform float uGrain;
uniform float uGrainTexture;
uniform float uGrainScale;
uniform float uGrainSpeed;
uniform float uChromaOffset;
uniform float uVignette;
uniform float uMouseHalo;
uniform float uPosterize;
uniform float uColorDrift;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uC4;
uniform vec3 uC5;
out vec4 fragColor;

float grainHash(vec2 p) {
	return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 ramp(float t) {
	t = fract(t);
	float s = t * 6.0;
	float idx = floor(s);
	float w = mix(0.5, 0.04, clamp(uSharpness, 0.0, 1.0));
	float f = smoothstep(0.5 - w, 0.5 + w, fract(s));
	vec3 a, b;
	if (idx < 0.5)      { a = uC0; b = uC1; }
	else if (idx < 1.5) { a = uC1; b = uC2; }
	else if (idx < 2.5) { a = uC2; b = uC3; }
	else if (idx < 3.5) { a = uC3; b = uC4; }
	else if (idx < 4.5) { a = uC4; b = uC5; }
	else                { a = uC5; b = uC0; }
	return mix(a, b, f);
}

vec2 gentleDisplacement(vec2 uv, vec2 mouse, float t) {
	float dist = length(uv - mouse);
	return uv + uDispAmp * sin(uv.xy * uDispFreq + dist * uDispFreq + t);
}

float flowPattern(vec2 uv, float t) {
	float a = sin(uv.x * uFreq + t) * 0.5 + 0.5;
	float b = sin((uv.x + uv.y * uFlowX) * uFreq * 0.7 - t * 0.6) * 0.5 + 0.5;
	float c = sin((uv.x * 0.5 - uv.y * uFlowY * 0.4) * uFreq * 1.3 + t * 0.4) * 0.5 + 0.5;
	return (a + b * 0.7 + c * 0.5) / 2.2;
}

void main() {
	float aspect = uRes.x / uRes.y;
	vec2 uv = vUv;
	uv.x *= aspect;

	vec2 mouse = uMouse;
	mouse.x *= aspect;

	float t = uTime * uSpeed + uSeed;
	uv = gentleDisplacement(uv, mouse, t);

	// Sample the flow at three slightly offset positions — when chromaOffset > 0
	// the R and B channels split horizontally like CMYK misregistration.
	vec2 chromaOff = vec2(uChromaOffset / max(uRes.y, 1.0), 0.0);
	float patG = flowPattern(uv, t);
	float patR = flowPattern(uv + chromaOff, t);
	float patB = flowPattern(uv - chromaOff, t);

	// Optional posterize: snap pattern values into N flat bands.
	float steps = max(uPosterize, 1.0);
	float poster = step(1.5, uPosterize);
	patG = mix(patG, (floor(patG * steps) + 0.5) / steps, poster);
	patR = mix(patR, (floor(patR * steps) + 0.5) / steps, poster);
	patB = mix(patB, (floor(patB * steps) + 0.5) / steps, poster);

	float drift = t * uColorDrift;
	vec3 col = vec3(
		ramp(patR + drift).r,
		ramp(patG + drift).g,
		ramp(patB + drift).b
	);

	// Saturation boost before grain so the chroma boost doesn't amplify noise.
	float luma = dot(col, vec3(0.299, 0.587, 0.114));
	col = mix(vec3(luma), col, uSaturation);
	col *= uIntensity;

	// ---- GRAIN ----
	// Threshold-gated binary stipple — most pixels stay clean, a percentage
	// get a discrete dark/light ink dot. Feels like riso print, not luma fuzz.
	vec2 px = gl_FragCoord.xy / max(uGrainScale, 0.0001);
	float grainTime = floor(uTime * uGrainSpeed);

	// Fine layer (1px dots). Grain knob controls density AND amplitude together
	// so at low values there are few dots AND they're faint.
	float g1 = clamp(uGrain, 0.0, 1.0);
	float density1 = g1 * 0.45;
	float amp1 = g1 * 0.22;
	float h1 = grainHash(px + grainTime);
	float h2 = grainHash(px + grainTime + 71.3);
	col += vec3(step(1.0 - density1, h2) - step(1.0 - density1, h1)) * amp1;

	// Chunky layer (2-3px blobs) via quantization.
	float g2 = clamp(uGrainTexture, 0.0, 1.0);
	vec2 px2 = floor(px * 0.45);
	float density2 = g2 * 0.5;
	float amp2 = g2 * 0.18;
	float h3 = grainHash(px2 + grainTime);
	float h4 = grainHash(px2 + grainTime + 41.7);
	col += vec3(step(1.0 - density2, h4) - step(1.0 - density2, h3)) * amp2;

	// ---- MOUSE HALO ----
	// Soft additive bloom around the cursor — calmer than displacement.
	float md = distance(uv, mouse);
	col += exp(-md * md * 18.0) * uMouseHalo;

	// ---- VIGNETTE ----
	// Pull corners down a touch to integrate with surrounding page.
	vec2 vc = vUv * 2.0 - 1.0;
	float vd = dot(vc, vc);
	float vig = 1.0 - smoothstep(0.55, 1.6, vd);
	col *= mix(1.0, vig, uVignette);

	col = clamp(col, 0.0, 1.0);
	fragColor = vec4(col, 1.0);
}
`;function u(e,t,o){let r=e.createShader(t);return r?(e.shaderSource(r,o),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))?r:(console.error("shader compile error:",e.getShaderInfoLog(r)),e.deleteShader(r),null):null}e.s(["HeroShader",0,function({speed:e=.6,seed:l=0,frequency:f=8,displacement:s=.122,displacementFreq:m=5,mouseFollow:c=.035,flowY:p=.5,flowX:d=0,intensity:h=1,saturation:g=1.25,sharpness:v=0,grain:x=0,grainTexture:b=0,grainScale:w=.5,grainSpeed:S=0,mouseInfluence:y=.6,chromaOffset:C=0,vignette:U=0,mouseHalo:L=0,posterize:A=0,colorDrift:P=.04,colors:T=i.brandVibrant,className:F}){let R=o.useRef(null),G=o.useRef({speed:e,seed:l,frequency:f,displacement:s,displacementFreq:m,mouseFollow:c,flowY:p,flowX:d,intensity:h,saturation:g,sharpness:v,grain:x,grainTexture:b,grainScale:w,grainSpeed:S,mouseInfluence:y,chromaOffset:C,vignette:U,mouseHalo:L,posterize:A,colorDrift:P,colors:T});return o.useEffect(()=>{G.current={speed:e,seed:l,frequency:f,displacement:s,displacementFreq:m,mouseFollow:c,flowY:p,flowX:d,intensity:h,saturation:g,sharpness:v,grain:x,grainTexture:b,grainScale:w,grainSpeed:S,mouseInfluence:y,chromaOffset:C,vignette:U,mouseHalo:L,posterize:A,colorDrift:P,colors:T}},[e,l,f,s,m,c,p,d,h,g,v,x,b,w,S,y,C,U,L,A,P,T]),o.useEffect(()=>{let e,t=R.current;if(!t)return;let o=t.getContext("webgl2",{antialias:!1,premultipliedAlpha:!1,powerPreference:"low-power"});if(!o)return;let r=u(o,o.VERTEX_SHADER,a),l=u(o,o.FRAGMENT_SHADER,n);if(!r||!l)return;let f=(e=o.createProgram())?(o.attachShader(e,r),o.attachShader(e,l),o.linkProgram(e),o.getProgramParameter(e,o.LINK_STATUS))?e:(console.error("program link error:",o.getProgramInfoLog(e)),o.deleteProgram(e),null):null;if(!f)return;let s=o.createVertexArray();o.bindVertexArray(s);let m=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,m),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);let c=o.getAttribLocation(f,"aPos");o.enableVertexAttribArray(c),o.vertexAttribPointer(c,2,o.FLOAT,!1,0,0);let p=o.getUniformLocation(f,"uRes"),d=o.getUniformLocation(f,"uMouse"),h=o.getUniformLocation(f,"uTime"),g=o.getUniformLocation(f,"uSpeed"),v=o.getUniformLocation(f,"uSeed"),x=o.getUniformLocation(f,"uFreq"),b=o.getUniformLocation(f,"uDispAmp"),w=o.getUniformLocation(f,"uDispFreq"),S=o.getUniformLocation(f,"uFlowY"),y=o.getUniformLocation(f,"uFlowX"),C=o.getUniformLocation(f,"uIntensity"),U=o.getUniformLocation(f,"uSaturation"),L=o.getUniformLocation(f,"uSharpness"),A=o.getUniformLocation(f,"uGrain"),P=o.getUniformLocation(f,"uGrainTexture"),T=o.getUniformLocation(f,"uGrainScale"),F=o.getUniformLocation(f,"uGrainSpeed"),k=o.getUniformLocation(f,"uChromaOffset"),D=o.getUniformLocation(f,"uVignette"),E=o.getUniformLocation(f,"uMouseHalo"),q=o.getUniformLocation(f,"uPosterize"),O=o.getUniformLocation(f,"uColorDrift"),M=[o.getUniformLocation(f,"uC0"),o.getUniformLocation(f,"uC1"),o.getUniformLocation(f,"uC2"),o.getUniformLocation(f,"uC3"),o.getUniformLocation(f,"uC4"),o.getUniformLocation(f,"uC5")];o.useProgram(f);let H=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,I=()=>{let e=Math.min(window.devicePixelRatio||1,2),r=Math.max(1,Math.floor(t.clientWidth*e)),i=Math.max(1,Math.floor(t.clientHeight*e));(t.width!==r||t.height!==i)&&(t.width=r,t.height=i,o.viewport(0,0,r,i))},B=new ResizeObserver(I);B.observe(t),I();let z=!0,V=new IntersectionObserver(e=>{z=e[0]?.isIntersecting??!0},{threshold:0});V.observe(t);let N={x:.5,y:.5},_={x:.5,y:.5},j=e=>{let o=t.getBoundingClientRect();0!==o.width&&0!==o.height&&(N.x=(e.clientX-o.left)/o.width,N.y=1-(e.clientY-o.top)/o.height)};window.addEventListener("pointermove",j,{passive:!0});let Y=0,X=performance.now(),K=e=>{if(z){let r=G.current;_.x+=(N.x-_.x)*r.mouseFollow,_.y+=(N.y-_.y)*r.mouseFollow;let a=.5+(_.x-.5)*r.mouseInfluence,n=.5+(_.y-.5)*r.mouseInfluence;o.uniform2f(p,t.width,t.height),o.uniform2f(d,a,n),o.uniform1f(h,H?1.7:(e-X)/1e3),o.uniform1f(g,r.speed),o.uniform1f(v,r.seed),o.uniform1f(x,r.frequency),o.uniform1f(b,r.displacement),o.uniform1f(w,r.displacementFreq),o.uniform1f(S,r.flowY),o.uniform1f(y,r.flowX),o.uniform1f(C,r.intensity),o.uniform1f(U,r.saturation),o.uniform1f(L,r.sharpness),o.uniform1f(A,r.grain),o.uniform1f(P,r.grainTexture),o.uniform1f(T,r.grainScale),o.uniform1f(F,r.grainSpeed),o.uniform1f(k,r.chromaOffset),o.uniform1f(D,r.vignette),o.uniform1f(E,r.mouseHalo),o.uniform1f(q,r.posterize),o.uniform1f(O,r.colorDrift);let u=r.colors??i.brand;for(let e=0;e<6;e++){let t=u[e]??u[u.length-1],r=M[e]??null;o.uniform3f(r,t[0],t[1],t[2])}o.drawArrays(o.TRIANGLES,0,3)}H||(Y=requestAnimationFrame(K))};return Y=requestAnimationFrame(K),()=>{cancelAnimationFrame(Y),window.removeEventListener("pointermove",j),B.disconnect(),V.disconnect(),o.deleteBuffer(m),o.deleteVertexArray(s),o.deleteProgram(f),o.deleteShader(r),o.deleteShader(l)}},[]),(0,t.jsx)("canvas",{ref:R,"aria-hidden":!0,className:(0,r.cn)("block h-full w-full",F)})},"PALETTES",0,i])},164577,e=>{e.v(t=>Promise.all(["static/immutable/chunks/3wil596qkvase.js","static/immutable/chunks/197ng827wkq0e.js","static/immutable/chunks/1kt-a3m8vkueg.js"].map(t=>e.l(t))).then(()=>t(885896)))},233774,e=>{e.v(t=>Promise.all(["static/immutable/chunks/3nppywnheoay6.js","static/immutable/chunks/0cf3i8h4seh1t.js"].map(t=>e.l(t))).then(()=>t(98565)))},133765,e=>{e.v(t=>Promise.all(["static/immutable/chunks/34utxxqr9-54p.js"].map(t=>e.l(t))).then(()=>t(669819)))}]);