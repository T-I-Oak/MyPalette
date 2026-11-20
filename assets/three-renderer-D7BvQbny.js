import{U as Dt,c as tr,N as It,S as nr,C as Qe,R as ir,e as $e,w as We,V as gt,l as ai,M as $t,F as ar,a as ua,W as ri,b as wt,d as et,L as kt,H as yt,D as Nt,B as St,f as ln,g as Ge,p as rr,h as oi,i as or,j as sr,A as nn,O as lr,k as cr,m as fr,n as dr,o as ur,q as pr,r as hr,s as mr,t as _r,u as gr,v as vr,x as Sr,y as Er,z as Mr,Z as xr,E as Tr,G as Hn,I as Ar,J as Ln,K as bt,P as mn,Q as Rr,T as zt,X as br,Y as Cr,_ as pa,$ as Pr,a0 as ha,a1 as Lr,a2 as ma,a3 as Dr,a4 as wr,a5 as Ur,a6 as Qt,a7 as vt,a8 as _a,a9 as Nr,aa as Kt,ab as vn,ac as Ir,ad as Zt,ae as on,af as Jt,ag as cn,ah as Bt,ai as fn,aj as ga,ak as Yt,al as si,am as yr,an as Or,ao as Xt,ap as jt,aq as Ke,ar as Fr,as as Dn,at as Br,au as wn,av as Gt,aw as Gr,ax as Hr,ay as Vr,az as qt,aA as Fe,aB as Wr,aC as va,aD as Sa,aE as Ea,aF as Mn,aG as Ma,aH as xa,aI as kr,aJ as zr,aK as Xr,aL as Kr,aM as Yr,aN as qr,aO as Zr,aP as $r,aQ as li,aR as Qr,aS as Sn,aT as Jr,aU as ci,aV as fi,aW as di,aX as jr,aY as ui,aZ as eo,a_ as An,a$ as Vn,b0 as Ta,b1 as Aa,b2 as Ra,b3 as Wn,b4 as ba,b5 as to,b6 as no,b7 as io,b8 as ao,b9 as Ca,ba as ro,bb as oo,bc as so,bd as Un,be as Nn,bf as In,bg as yn,bh as pi,bi as hi,bj as mi,bk as _i,bl as gi,bm as vi,bn as Si,bo as Ei,bp as Mi,bq as kn,br as xi,bs as Ti,bt as Ai,bu as Ri,bv as bi,bw as Ci,bx as Pi,by as Li,bz as Di,bA as wi,bB as Ui,bC as Ni,bD as Ii,bE as yi,bF as Oi,bG as Fi,bH as Bi,bI as Gi,bJ as Hi,bK as Vi,bL as zn,bM as Wi,bN as Pa,bO as ki,bP as La,bQ as lo,bR as co,bS as zi,bT as _t,bU as fo,bV as Da,bW as wa,bX as Ua,bY as Na,bZ as Ia,b_ as ya,b$ as Oa,c0 as On,c1 as Fn,c2 as Fa,c3 as xn,c4 as dn,c5 as uo,c6 as po,c7 as ho,c8 as mo,c9 as _o,ca as go,cb as vo,cc as So,cd as Eo,ce as Mo}from"./three-core-wxcGM9R_.js";function Ba(){let e=null,n=!1,t=null,i=null;function c(s,d){i=e.requestAnimationFrame(c),t(s,d)}return{start:function(){n!==!0&&t!==null&&e!==null&&(i=e.requestAnimationFrame(c),n=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(i),n=!1},setAnimationLoop:function(s){t=s},setContext:function(s){e=s}}}function xo(e){const n=new WeakMap;function t(_,N){const S=_.array,W=_.usage,y=S.byteLength,E=e.createBuffer();e.bindBuffer(N,E),e.bufferData(N,S,W),_.onUploadCallback();let v;if(S instanceof Float32Array)v=e.FLOAT;else if(typeof Float16Array<"u"&&S instanceof Float16Array)v=e.HALF_FLOAT;else if(S instanceof Uint16Array)_.isFloat16BufferAttribute?v=e.HALF_FLOAT:v=e.UNSIGNED_SHORT;else if(S instanceof Int16Array)v=e.SHORT;else if(S instanceof Uint32Array)v=e.UNSIGNED_INT;else if(S instanceof Int32Array)v=e.INT;else if(S instanceof Int8Array)v=e.BYTE;else if(S instanceof Uint8Array)v=e.UNSIGNED_BYTE;else if(S instanceof Uint8ClampedArray)v=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+S);return{buffer:E,type:v,bytesPerElement:S.BYTES_PER_ELEMENT,version:_.version,size:y}}function i(_,N,S){const W=N.array,y=N.updateRanges;if(e.bindBuffer(S,_),y.length===0)e.bufferSubData(S,0,W);else{y.sort((v,L)=>v.start-L.start);let E=0;for(let v=1;v<y.length;v++){const L=y[E],U=y[v];U.start<=L.start+L.count+1?L.count=Math.max(L.count,U.start+U.count-L.start):(++E,y[E]=U)}y.length=E+1;for(let v=0,L=y.length;v<L;v++){const U=y[v];e.bufferSubData(S,U.start*W.BYTES_PER_ELEMENT,W,U.start,U.count)}N.clearUpdateRanges()}N.onUploadCallback()}function c(_){return _.isInterleavedBufferAttribute&&(_=_.data),n.get(_)}function s(_){_.isInterleavedBufferAttribute&&(_=_.data);const N=n.get(_);N&&(e.deleteBuffer(N.buffer),n.delete(_))}function d(_,N){if(_.isInterleavedBufferAttribute&&(_=_.data),_.isGLBufferAttribute){const W=n.get(_);(!W||W.version<_.version)&&n.set(_,{buffer:_.buffer,type:_.type,bytesPerElement:_.elementSize,version:_.version});return}const S=n.get(_);if(S===void 0)n.set(_,t(_,N));else if(S.version<_.version){if(S.size!==_.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(S.buffer,_,N),S.version=_.version}}return{get:c,remove:s,update:d}}var To=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ao=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Ro=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,bo=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Co=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Po=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Lo=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Do=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,wo=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Uo=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,No=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Io=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,yo=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Oo=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Fo=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Bo=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Go=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ho=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Vo=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Wo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,ko=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,zo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Xo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Ko=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Yo=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,qo=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Zo=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,$o=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Qo=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Jo="gl_FragColor = linearToOutputTexel( gl_FragColor );",jo=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,es=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,ts=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,ns=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,is=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,as=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,rs=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,os=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ss=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ls=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,cs=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,fs=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ds=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,us=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ps=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,hs=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,ms=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,_s=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,gs=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,vs=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ss=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Es=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ms=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,xs=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ts=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,As=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Rs=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,bs=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Cs=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ps=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ls=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ds=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ws=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Us=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ns=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Is=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ys=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Os=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Fs=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Bs=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Gs=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Hs=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Vs=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Ws=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ks=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zs=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Xs=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Ks=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ys=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,qs=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Zs=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,$s=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Qs=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Js=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,js=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,el=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,tl=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,nl=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,il=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,al=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,rl=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,ol=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,sl=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,ll=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,cl=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,fl=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,dl=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,ul=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,pl=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,hl=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ml=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,_l=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,gl=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,vl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Sl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,El=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Ml=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const xl=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Tl=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Al=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Rl=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Cl=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Pl=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Ll=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Dl=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,wl=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Ul=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Nl=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Il=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,yl=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ol=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Fl=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bl=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Gl=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hl=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Vl=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wl=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,kl=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,zl=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Xl=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Kl=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Yl=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ql=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zl=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$l=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Ql=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Jl=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jl=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ec=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,tc=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,we={alphahash_fragment:To,alphahash_pars_fragment:Ao,alphamap_fragment:Ro,alphamap_pars_fragment:bo,alphatest_fragment:Co,alphatest_pars_fragment:Po,aomap_fragment:Lo,aomap_pars_fragment:Do,batching_pars_vertex:wo,batching_vertex:Uo,begin_vertex:No,beginnormal_vertex:Io,bsdfs:yo,iridescence_fragment:Oo,bumpmap_pars_fragment:Fo,clipping_planes_fragment:Bo,clipping_planes_pars_fragment:Go,clipping_planes_pars_vertex:Ho,clipping_planes_vertex:Vo,color_fragment:Wo,color_pars_fragment:ko,color_pars_vertex:zo,color_vertex:Xo,common:Ko,defaultnormal_vertex:Yo,displacementmap_pars_vertex:qo,displacementmap_vertex:Zo,emissivemap_fragment:$o,emissivemap_pars_fragment:Qo,colorspace_fragment:Jo,colorspace_pars_fragment:jo,envmap_fragment:es,envmap_common_pars_fragment:ts,envmap_pars_fragment:ns,envmap_pars_vertex:is,envmap_physical_pars_fragment:hs,envmap_vertex:as,fog_vertex:rs,fog_pars_vertex:os,fog_fragment:ss,fog_pars_fragment:ls,gradientmap_pars_fragment:cs,lightmap_pars_fragment:fs,lights_lambert_fragment:ds,lights_lambert_pars_fragment:us,lights_pars_begin:ps,lights_toon_fragment:ms,lights_toon_pars_fragment:_s,lights_phong_fragment:gs,lights_phong_pars_fragment:vs,lights_physical_fragment:Ss,lights_physical_pars_fragment:Es,lights_fragment_begin:Ms,lights_fragment_maps:xs,lights_fragment_end:Ts,lightprobes_pars_fragment:As,logdepthbuf_fragment:Rs,logdepthbuf_pars_fragment:bs,logdepthbuf_pars_vertex:Cs,logdepthbuf_vertex:Ps,map_fragment:Ls,map_pars_fragment:Ds,map_particle_fragment:ws,map_particle_pars_fragment:Us,metalnessmap_fragment:Ns,metalnessmap_pars_fragment:Is,morphinstance_vertex:ys,morphcolor_vertex:Os,morphnormal_vertex:Fs,morphtarget_pars_vertex:Bs,morphtarget_vertex:Gs,normal_fragment_begin:Hs,normal_fragment_maps:Vs,normal_pars_fragment:Ws,normal_pars_vertex:ks,normal_vertex:zs,normalmap_pars_fragment:Xs,clearcoat_normal_fragment_begin:Ks,clearcoat_normal_fragment_maps:Ys,clearcoat_pars_fragment:qs,iridescence_pars_fragment:Zs,opaque_fragment:$s,packing:Qs,premultiplied_alpha_fragment:Js,project_vertex:js,dithering_fragment:el,dithering_pars_fragment:tl,roughnessmap_fragment:nl,roughnessmap_pars_fragment:il,shadowmap_pars_fragment:al,shadowmap_pars_vertex:rl,shadowmap_vertex:ol,shadowmask_pars_fragment:sl,skinbase_vertex:ll,skinning_pars_vertex:cl,skinning_vertex:fl,skinnormal_vertex:dl,specularmap_fragment:ul,specularmap_pars_fragment:pl,tonemapping_fragment:hl,tonemapping_pars_fragment:ml,transmission_fragment:_l,transmission_pars_fragment:gl,uv_pars_fragment:vl,uv_pars_vertex:Sl,uv_vertex:El,worldpos_vertex:Ml,background_vert:xl,background_frag:Tl,backgroundCube_vert:Al,backgroundCube_frag:Rl,cube_vert:bl,cube_frag:Cl,depth_vert:Pl,depth_frag:Ll,distance_vert:Dl,distance_frag:wl,equirect_vert:Ul,equirect_frag:Nl,linedashed_vert:Il,linedashed_frag:yl,meshbasic_vert:Ol,meshbasic_frag:Fl,meshlambert_vert:Bl,meshlambert_frag:Gl,meshmatcap_vert:Hl,meshmatcap_frag:Vl,meshnormal_vert:Wl,meshnormal_frag:kl,meshphong_vert:zl,meshphong_frag:Xl,meshphysical_vert:Kl,meshphysical_frag:Yl,meshtoon_vert:ql,meshtoon_frag:Zl,points_vert:$l,points_frag:Ql,shadow_vert:Jl,shadow_frag:jl,sprite_vert:ec,sprite_frag:tc},ue={common:{diffuse:{value:new Qe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Fe}},envmap:{envMap:{value:null},envMapRotation:{value:new Fe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Fe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Fe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Fe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Fe},normalScale:{value:new vt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Fe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Fe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Fe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Fe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Qe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Qe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0},uvTransform:{value:new Fe}},sprite:{diffuse:{value:new Qe(16777215)},opacity:{value:1},center:{value:new vt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}}},Lt={basic:{uniforms:_t([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.fog]),vertexShader:we.meshbasic_vert,fragmentShader:we.meshbasic_frag},lambert:{uniforms:_t([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new Qe(0)},envMapIntensity:{value:1}}]),vertexShader:we.meshlambert_vert,fragmentShader:we.meshlambert_frag},phong:{uniforms:_t([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new Qe(0)},specular:{value:new Qe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:we.meshphong_vert,fragmentShader:we.meshphong_frag},standard:{uniforms:_t([ue.common,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.roughnessmap,ue.metalnessmap,ue.fog,ue.lights,{emissive:{value:new Qe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:we.meshphysical_vert,fragmentShader:we.meshphysical_frag},toon:{uniforms:_t([ue.common,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.gradientmap,ue.fog,ue.lights,{emissive:{value:new Qe(0)}}]),vertexShader:we.meshtoon_vert,fragmentShader:we.meshtoon_frag},matcap:{uniforms:_t([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,{matcap:{value:null}}]),vertexShader:we.meshmatcap_vert,fragmentShader:we.meshmatcap_frag},points:{uniforms:_t([ue.points,ue.fog]),vertexShader:we.points_vert,fragmentShader:we.points_frag},dashed:{uniforms:_t([ue.common,ue.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:we.linedashed_vert,fragmentShader:we.linedashed_frag},depth:{uniforms:_t([ue.common,ue.displacementmap]),vertexShader:we.depth_vert,fragmentShader:we.depth_frag},normal:{uniforms:_t([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,{opacity:{value:1}}]),vertexShader:we.meshnormal_vert,fragmentShader:we.meshnormal_frag},sprite:{uniforms:_t([ue.sprite,ue.fog]),vertexShader:we.sprite_vert,fragmentShader:we.sprite_frag},background:{uniforms:{uvTransform:{value:new Fe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:we.background_vert,fragmentShader:we.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Fe}},vertexShader:we.backgroundCube_vert,fragmentShader:we.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:we.cube_vert,fragmentShader:we.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:we.equirect_vert,fragmentShader:we.equirect_frag},distance:{uniforms:_t([ue.common,ue.displacementmap,{referencePosition:{value:new Ge},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:we.distance_vert,fragmentShader:we.distance_frag},shadow:{uniforms:_t([ue.lights,ue.fog,{color:{value:new Qe(0)},opacity:{value:1}}]),vertexShader:we.shadow_vert,fragmentShader:we.shadow_frag}};Lt.physical={uniforms:_t([Lt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Fe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Fe},clearcoatNormalScale:{value:new vt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Fe},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Fe},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Fe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Fe},sheen:{value:0},sheenColor:{value:new Qe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Fe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Fe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Fe},transmissionSamplerSize:{value:new vt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Fe},attenuationDistance:{value:0},attenuationColor:{value:new Qe(0)},specularColor:{value:new Qe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Fe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Fe},anisotropyVector:{value:new vt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Fe}}]),vertexShader:we.meshphysical_vert,fragmentShader:we.meshphysical_frag};const _n={r:0,b:0,g:0},nc=new $t,Ga=new Fe;Ga.set(-1,0,0,0,1,0,0,0,1);function ic(e,n,t,i,c,s){const d=new Qe(0);let _=c===!0?0:1,N,S,W=null,y=0,E=null;function v(m){let D=m.isScene===!0?m.background:null;if(D&&D.isTexture){const x=m.backgroundBlurriness>0;D=n.get(D,x)}return D}function L(m){let D=!1;const x=v(m);x===null?f(d,_):x&&x.isColor&&(f(x,1),D=!0);const C=e.xr.getEnvironmentBlendMode();C==="additive"?t.buffers.color.setClear(0,0,0,1,s):C==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(e.autoClear||D)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function U(m,D){const x=v(D);x&&x.isCubeTexture?(S===void 0&&(S=new Kt(new An(1,1,1),new Qt({name:"BackgroundCubeMaterial",uniforms:Vn(Lt.backgroundCube.uniforms),vertexShader:Lt.backgroundCube.vertexShader,fragmentShader:Lt.backgroundCube.fragmentShader,side:St,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),S.geometry.deleteAttribute("normal"),S.geometry.deleteAttribute("uv"),S.onBeforeRender=function(C,M,o){this.matrixWorld.copyPosition(o.matrixWorld)},Object.defineProperty(S.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(S)),S.material.uniforms.envMap.value=x,S.material.uniforms.backgroundBlurriness.value=D.backgroundBlurriness,S.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,S.material.uniforms.backgroundRotation.value.setFromMatrix4(nc.makeRotationFromEuler(D.backgroundRotation)).transpose(),x.isRenderTargetTexture===!1&&S.material.uniforms.backgroundRotation.value.premultiply(Ga),S.material.toneMapped=et.getTransfer(x.colorSpace)!==Ke,(W!==x||y!==x.version||E!==e.toneMapping)&&(S.material.needsUpdate=!0,W=x,y=x.version,E=e.toneMapping),S.layers.enableAll(),m.unshift(S,S.geometry,S.material,0,0,null)):x&&x.isTexture&&(N===void 0&&(N=new Kt(new Ta(2,2),new Qt({name:"BackgroundMaterial",uniforms:Vn(Lt.background.uniforms),vertexShader:Lt.background.vertexShader,fragmentShader:Lt.background.fragmentShader,side:ln,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),N.geometry.deleteAttribute("normal"),Object.defineProperty(N.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(N)),N.material.uniforms.t2D.value=x,N.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,N.material.toneMapped=et.getTransfer(x.colorSpace)!==Ke,x.matrixAutoUpdate===!0&&x.updateMatrix(),N.material.uniforms.uvTransform.value.copy(x.matrix),(W!==x||y!==x.version||E!==e.toneMapping)&&(N.material.needsUpdate=!0,W=x,y=x.version,E=e.toneMapping),N.layers.enableAll(),m.unshift(N,N.geometry,N.material,0,0,null))}function f(m,D){m.getRGB(_n,Aa(e)),t.buffers.color.setClear(_n.r,_n.g,_n.b,D,s)}function l(){S!==void 0&&(S.geometry.dispose(),S.material.dispose(),S=void 0),N!==void 0&&(N.geometry.dispose(),N.material.dispose(),N=void 0)}return{getClearColor:function(){return d},setClearColor:function(m,D=1){d.set(m),_=D,f(d,_)},getClearAlpha:function(){return _},setClearAlpha:function(m){_=m,f(d,_)},render:L,addToRenderList:U,dispose:l}}function ac(e,n){const t=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},c=E(null);let s=c,d=!1;function _(O,X,Z,A,Q){let q=!1;const H=y(O,A,Z,X);s!==H&&(s=H,S(s.object)),q=v(O,A,Z,Q),q&&L(O,A,Z,Q),Q!==null&&n.update(Q,e.ELEMENT_ARRAY_BUFFER),(q||d)&&(d=!1,x(O,X,Z,A),Q!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,n.get(Q).buffer))}function N(){return e.createVertexArray()}function S(O){return e.bindVertexArray(O)}function W(O){return e.deleteVertexArray(O)}function y(O,X,Z,A){const Q=A.wireframe===!0;let q=i[X.id];q===void 0&&(q={},i[X.id]=q);const H=O.isInstancedMesh===!0?O.id:0;let fe=q[H];fe===void 0&&(fe={},q[H]=fe);let K=fe[Z.id];K===void 0&&(K={},fe[Z.id]=K);let j=K[Q];return j===void 0&&(j=E(N()),K[Q]=j),j}function E(O){const X=[],Z=[],A=[];for(let Q=0;Q<t;Q++)X[Q]=0,Z[Q]=0,A[Q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:X,enabledAttributes:Z,attributeDivisors:A,object:O,attributes:{},index:null}}function v(O,X,Z,A){const Q=s.attributes,q=X.attributes;let H=0;const fe=Z.getAttributes();for(const K in fe)if(fe[K].location>=0){const ie=Q[K];let Ae=q[K];if(Ae===void 0&&(K==="instanceMatrix"&&O.instanceMatrix&&(Ae=O.instanceMatrix),K==="instanceColor"&&O.instanceColor&&(Ae=O.instanceColor)),ie===void 0||ie.attribute!==Ae||Ae&&ie.data!==Ae.data)return!0;H++}return s.attributesNum!==H||s.index!==A}function L(O,X,Z,A){const Q={},q=X.attributes;let H=0;const fe=Z.getAttributes();for(const K in fe)if(fe[K].location>=0){let ie=q[K];ie===void 0&&(K==="instanceMatrix"&&O.instanceMatrix&&(ie=O.instanceMatrix),K==="instanceColor"&&O.instanceColor&&(ie=O.instanceColor));const Ae={};Ae.attribute=ie,ie&&ie.data&&(Ae.data=ie.data),Q[K]=Ae,H++}s.attributes=Q,s.attributesNum=H,s.index=A}function U(){const O=s.newAttributes;for(let X=0,Z=O.length;X<Z;X++)O[X]=0}function f(O){l(O,0)}function l(O,X){const Z=s.newAttributes,A=s.enabledAttributes,Q=s.attributeDivisors;Z[O]=1,A[O]===0&&(e.enableVertexAttribArray(O),A[O]=1),Q[O]!==X&&(e.vertexAttribDivisor(O,X),Q[O]=X)}function m(){const O=s.newAttributes,X=s.enabledAttributes;for(let Z=0,A=X.length;Z<A;Z++)X[Z]!==O[Z]&&(e.disableVertexAttribArray(Z),X[Z]=0)}function D(O,X,Z,A,Q,q,H){H===!0?e.vertexAttribIPointer(O,X,Z,Q,q):e.vertexAttribPointer(O,X,Z,A,Q,q)}function x(O,X,Z,A){U();const Q=A.attributes,q=Z.getAttributes(),H=X.defaultAttributeValues;for(const fe in q){const K=q[fe];if(K.location>=0){let j=Q[fe];if(j===void 0&&(fe==="instanceMatrix"&&O.instanceMatrix&&(j=O.instanceMatrix),fe==="instanceColor"&&O.instanceColor&&(j=O.instanceColor)),j!==void 0){const ie=j.normalized,Ae=j.itemSize,Ne=n.get(j);if(Ne===void 0)continue;const k=Ne.buffer,he=Ne.type,Se=Ne.bytesPerElement,Re=he===e.INT||he===e.UNSIGNED_INT||j.gpuType===Ca;if(j.isInterleavedBufferAttribute){const me=j.data,Ue=me.isInterleavedBuffer===!0?me.stride:me.itemSize,ht=j.offset;if(me.isInstancedInterleavedBuffer||me.isInstancedBufferAttribute){for(let be=0;be<K.locationSize;be++)l(K.location+be,me.meshPerAttribute);O.isInstancedMesh!==!0&&A._maxInstanceCount===void 0&&(A._maxInstanceCount=me.meshPerAttribute*me.count)}else for(let be=0;be<K.locationSize;be++)f(K.location+be);e.bindBuffer(e.ARRAY_BUFFER,k);for(let be=0;be<K.locationSize;be++)D(K.location+be,Ae/K.locationSize,he,ie,Ue*Se,(ht+Ae/K.locationSize*be)*Se,Re)}else{if(j.isInstancedBufferAttribute){for(let me=0;me<K.locationSize;me++)l(K.location+me,j.meshPerAttribute);O.isInstancedMesh!==!0&&A._maxInstanceCount===void 0&&(A._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let me=0;me<K.locationSize;me++)f(K.location+me);e.bindBuffer(e.ARRAY_BUFFER,k);for(let me=0;me<K.locationSize;me++)D(K.location+me,Ae/K.locationSize,he,ie,Ae*Se,Ae/K.locationSize*me*Se,Re)}}else if(H!==void 0){const ie=H[fe];if(ie!==void 0)switch(ie.length){case 2:e.vertexAttrib2fv(K.location,ie);break;case 3:e.vertexAttrib3fv(K.location,ie);break;case 4:e.vertexAttrib4fv(K.location,ie);break;default:e.vertexAttrib1fv(K.location,ie)}}}}m()}function C(){Y();for(const O in i){const X=i[O];for(const Z in X){const A=X[Z];for(const Q in A){const q=A[Q];for(const H in q)W(q[H].object),delete q[H];delete A[Q]}}delete i[O]}}function M(O){if(i[O.id]===void 0)return;const X=i[O.id];for(const Z in X){const A=X[Z];for(const Q in A){const q=A[Q];for(const H in q)W(q[H].object),delete q[H];delete A[Q]}}delete i[O.id]}function o(O){for(const X in i){const Z=i[X];for(const A in Z){const Q=Z[A];if(Q[O.id]===void 0)continue;const q=Q[O.id];for(const H in q)W(q[H].object),delete q[H];delete Q[O.id]}}}function p(O){for(const X in i){const Z=i[X],A=O.isInstancedMesh===!0?O.id:0,Q=Z[A];if(Q!==void 0){for(const q in Q){const H=Q[q];for(const fe in H)W(H[fe].object),delete H[fe];delete Q[q]}delete Z[A],Object.keys(Z).length===0&&delete i[X]}}}function Y(){w(),d=!0,s!==c&&(s=c,S(s.object))}function w(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:_,reset:Y,resetDefaultState:w,dispose:C,releaseStatesOfGeometry:M,releaseStatesOfObject:p,releaseStatesOfProgram:o,initAttributes:U,enableAttribute:f,disableUnusedAttributes:m}}function rc(e,n,t){let i;function c(N){i=N}function s(N,S){e.drawArrays(i,N,S),t.update(S,i,1)}function d(N,S,W){W!==0&&(e.drawArraysInstanced(i,N,S,W),t.update(S,i,W))}function _(N,S,W){if(W===0)return;n.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,N,0,S,0,W);let E=0;for(let v=0;v<W;v++)E+=S[v];t.update(E,i,1)}this.setMode=c,this.render=s,this.renderInstances=d,this.renderMultiDraw=_}function oc(e,n,t,i){let c;function s(){if(c!==void 0)return c;if(n.has("EXT_texture_filter_anisotropic")===!0){const o=n.get("EXT_texture_filter_anisotropic");c=e.getParameter(o.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else c=0;return c}function d(o){return!(o!==Gt&&i.convert(o)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function _(o){const p=o===yt&&(n.has("EXT_color_buffer_half_float")||n.has("EXT_color_buffer_float"));return!(o!==Dt&&o!==Bt&&!p&&i.convert(o)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function N(o){if(o==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";o="mediump"}return o==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let S=t.precision!==void 0?t.precision:"highp";const W=N(S);W!==S&&(We("WebGLRenderer:",S,"not supported, using",W,"instead."),S=W);const y=t.reversedDepthBuffer===!0&&n.has("EXT_clip_control"),E=t.logarithmicDepthBuffer===!0&&y===!1;t.reversedDepthBuffer===!0&&y===!1&&We("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&y===!0&&We("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const v=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),L=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),U=e.getParameter(e.MAX_TEXTURE_SIZE),f=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),l=e.getParameter(e.MAX_VERTEX_ATTRIBS),m=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),D=e.getParameter(e.MAX_VARYING_VECTORS),x=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),C=e.getParameter(e.MAX_SAMPLES),M=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:N,textureFormatReadable:d,textureTypeReadable:_,precision:S,logarithmicDepthBuffer:E,reversedDepthBuffer:y,maxTextures:v,maxVertexTextures:L,maxTextureSize:U,maxCubemapSize:f,maxAttributes:l,maxVertexUniforms:m,maxVaryings:D,maxFragmentUniforms:x,maxSamples:C,samples:M}}function sc(e){const n=this;let t=null,i=0,c=!1,s=!1;const d=new Wr,_=new Fe,N={value:null,needsUpdate:!1};this.uniform=N,this.numPlanes=0,this.numIntersection=0,this.init=function(y,E){const v=y.length!==0||E||i!==0||c;return c=E,i=y.length,v},this.beginShadows=function(){s=!0,W(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(y,E){t=W(y,E,0)},this.setState=function(y,E,v){const L=y.clippingPlanes,U=y.clipIntersection,f=y.clipShadows,l=e.get(y);if(!c||L===null||L.length===0||s&&!f)s?W(null):S();else{const m=s?0:i,D=m*4;let x=l.clippingState||null;N.value=x,x=W(L,E,D,v);for(let C=0;C!==D;++C)x[C]=t[C];l.clippingState=x,this.numIntersection=U?this.numPlanes:0,this.numPlanes+=m}};function S(){N.value!==t&&(N.value=t,N.needsUpdate=i>0),n.numPlanes=i,n.numIntersection=0}function W(y,E,v,L){const U=y!==null?y.length:0;let f=null;if(U!==0){if(f=N.value,L!==!0||f===null){const l=v+U*4,m=E.matrixWorldInverse;_.getNormalMatrix(m),(f===null||f.length<l)&&(f=new Float32Array(l));for(let D=0,x=v;D!==U;++D,x+=4)d.copy(y[D]).applyMatrix4(m,_),d.normal.toArray(f,x),f[x+3]=d.constant}N.value=f,N.needsUpdate=!0}return n.numPlanes=U,n.numIntersection=0,f}}class Kn extends wt{constructor(n=1,t={}){super(n,n,t),this.isWebGLCubeRenderTarget=!0;const i={width:n,height:n,depth:1},c=[i,i,i,i,i,i];this.texture=new Ra(c),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(n,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},c=new An(5,5,5),s=new Qt({name:"CubemapFromEquirect",uniforms:Vn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:St,blending:Zt});s.uniforms.tEquirect.value=t;const d=new Kt(c,s),_=t.minFilter;return t.minFilter===kt&&(t.minFilter=bt),new Wn(1,10,this).update(n,d),t.minFilter=_,d.geometry.dispose(),d.material.dispose(),this}clear(n,t=!0,i=!0,c=!0){const s=n.getRenderTarget();for(let d=0;d<6;d++)n.setRenderTarget(this,d),n.clear(t,i,c);n.setRenderTarget(s)}}const Xi=256,lc=3,cc=20,Ha=256,Va=16,fc=3,dc=new Ge,uc=new Qe;class Tn{constructor(n){this._renderer=n,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Wn(1,10,null),this._boxMesh=new Kt(new An(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(n,t=0,i=.1,c=100,s={}){const{size:d=256,position:_=dc}=s,N=this._renderer;this._setSize(d);const S=this._allocateTarget(),W=this._getSourceTarget(!0);t>0&&(W.texture.mipmapsAutoUpdate=!1);const y=N.autoClear,E=N.autoClearColor,v=N.autoClearDepth,L=N.autoClearStencil,U=n.background;N.autoClear=!0,N.autoClearColor=!0,N.autoClearDepth=!0,N.autoClearStencil=!0,U===null&&(n.background=N.getClearColor(uc));const f=new Wn(i,c,W);return f.position.copy(_),f.update(N,n),N.autoClear=y,N.autoClearColor=E,N.autoClearDepth=v,N.autoClearStencil=L,n.background=U,t>0&&(W.texture.mipmapsAutoUpdate=!0,this._blur(S,t)),this._applyPMREM(S),S}fromEquirectangular(n,t=null){return this._fromTexture(n,t)}fromCubemap(n,t=null){return this._fromTexture(n,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=qi(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Yi(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(n,t){return t>0?1-Math.sqrt(1-n/t):0}_setSize(n){this._cubeSize=Math.max(Xi,uo(n))}_fromTexture(n,t){n.mapping===xn||n.mapping===dn?this._setSize(n.image.length===0?Xi:n.image[0].width||n.image[0].image.width):this._setSize(n.image.width/4);const i=t||this._allocateTarget();return this._textureToCubemap(n),this._applyPMREM(i),i}_allocateTarget(){const n=this._cubeSize,t=Ki(n,!1,!1),i=Math.log2(n)-lc;for(let c=0;c<=i;c++)t.texture.mipmaps.push({width:n>>c,height:n>>c});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(n=!1){const t=this._cubeSize,i=this._sourceTarget;return(i===null||i.width!==t||n&&i.depthBuffer===!1)&&(i!==null&&i.dispose(),this._sourceTarget=Ki(t,!0,n)),this._sourceTarget}_compileMaterial(n){this._boxMesh.material=n,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(n,t,i){const c=this._boxMesh,s=this._cubeCamera;c.material=i,s.renderTarget=n,s.activeMipmapLevel=t;const d=n.width>>t;n.viewport.set(0,0,d,d),s.update(this._renderer,c),n.viewport.set(0,0,n.width,n.height)}_textureToCubemap(n){let t;n.mapping===xn||n.mapping===dn?(this._cubemapMaterial===null&&(this._cubemapMaterial=qi()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=n.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Yi()),t=this._equirectMaterial),t.uniforms.envMap.value=n,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(n){this._ggxMaterial===null&&(this._ggxMaterial=pc(),this._integrationMaterial=hc());const t=this._cubeSize,i=n.texture.mipmaps.length-1,c=this._ggxMaterial.uniforms;c.envMap.value=this._sourceTarget.texture;const s=this._integrationMaterial.uniforms;s.envMap.value=this._sourceTarget.texture,s.sourceLod.value=Math.log2(t/Va);for(let d=0;d<=i;d++){const _=Tn.lodToRoughness(d,i);if(d>i-fc)s.roughness.value=_,this._renderCube(n,d,this._integrationMaterial);else{const N=_>0?Math.log2(t)+.5*Math.log2(6/(Ha*Math.pow(_,4)))+.5:0;c.roughness.value=_,c.lodBias.value=N,this._renderCube(n,d,this._ggxMaterial)}}}_blur(n,t){this._blurMaterial===null&&(this._blurMaterial=mc());const i=this._blurMaterial,c=i.uniforms,s=this._sourceTarget;c.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,c.envMap.value=s.texture,this._renderCube(n,0,i),c.envMap.value=n.texture,this._renderCube(s,0,i)}}function Ki(e,n,t){return new Kn(e,{minFilter:kt,generateMipmaps:n,type:yt,colorSpace:Fa,depthBuffer:t})}function un(e,n,t){return new Qt({name:e,uniforms:n,vertexShader:we.cube_vert,fragmentShader:t,side:St,blending:Zt,depthTest:!1,depthWrite:!1})}function pc(){return un("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Ha}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function hc(){return un("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Va}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function mc(){return un("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${cc}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Yi(){return un("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function qi(){return un("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function _c(e){let n=new WeakMap,t=new WeakMap,i=null;function c(E,v=!1){return E==null?null:v?d(E):s(E)}function s(E){if(E&&E.isTexture){const v=E.mapping;if(v===On||v===Fn)if(n.has(E)){const L=n.get(E).texture;return _(L,E.mapping)}else{const L=E.image;if(L&&L.height>0){const U=new Kn(L.height);return U.fromEquirectangularTexture(e,E),n.set(E,U),E.addEventListener("dispose",S),_(U.texture,E.mapping)}else return null}}return E}function d(E){if(E&&E.isTexture&&E.isPMREMTexture!==!0){const v=E.mapping,L=v===On||v===Fn,U=v===xn||v===dn;if(L||U){let f=t.get(E);const l=f!==void 0?f.texture.pmremVersion:0;if(E.isRenderTargetTexture&&E.pmremVersion!==l)return i===null&&(i=new Tn(e)),f=L?i.fromEquirectangular(E,f):i.fromCubemap(E,f),f.texture.pmremVersion=E.pmremVersion,t.set(E,f),f.texture;if(f!==void 0)return f.texture;{const m=E.image;return L&&m&&m.height>0||U&&m&&N(m)?(i===null&&(i=new Tn(e)),f=L?i.fromEquirectangular(E):i.fromCubemap(E),f.texture.pmremVersion=E.pmremVersion,t.set(E,f),E.addEventListener("dispose",W),f.texture):null}}}return E}function _(E,v){return v===On?E.mapping=xn:v===Fn&&(E.mapping=dn),E}function N(E){let v=0;const L=6;for(let U=0;U<L;U++)E[U]!==void 0&&v++;return v===L}function S(E){const v=E.target;v.removeEventListener("dispose",S);const L=n.get(v);L!==void 0&&(n.delete(v),L.dispose())}function W(E){const v=E.target;v.removeEventListener("dispose",W);const L=t.get(v);L!==void 0&&(t.delete(v),L.dispose())}function y(){n=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:c,dispose:y}}function gc(e){const n={};function t(i){if(n[i]!==void 0)return n[i];const c=e.getExtension(i);return n[i]=c,c}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const c=t(i);return c===null&&Vr("WebGLRenderer: "+i+" extension not supported."),c}}}function vc(e,n,t,i){const c={},s=new WeakMap,d=new FinalizationRegistry(L=>delete c[L]);function _(L){N(L.target)}function N(L){L.index!==null&&n.remove(L.index);for(const f in L.attributes)n.remove(L.attributes[f]);L.removeEventListener("dispose",_),delete c[L.id],d.unregister(L);const U=s.get(L);U&&(n.remove(U),s.delete(L)),i.releaseStatesOfGeometry(L),L.isInstancedBufferGeometry===!0&&delete L._maxInstanceCount,t.memory.geometries--}function S(L,U){return c[U.id]!==void 0||(U.addEventListener("dispose",_),c[U.id]=new WeakRef(U),d.register(U,U.id,U),t.memory.geometries++),U}function W(L){const U=L.attributes;for(const f in U)n.update(U[f],e.ARRAY_BUFFER)}function y(L){const U=L.index,f=L.attributes.position;let l=0;if(f===void 0)return;const m=U!==null?U.array.length:f.array.length/3-1,D=f.count>=65535?lo:co,x=new D(Math.ceil(m/3)*6,1),C=x.array;if(U!==null){const o=U.array;l=U.version;for(let p=0,Y=0;p<m;p+=3){const w=o[p+0],O=o[p+1],X=o[p+2];C[Y++]=w,C[Y++]=O,C[Y++]=O,C[Y++]=X,C[Y++]=X,C[Y++]=w}}else{l=f.version;for(let o=0,p=0;o<m;o+=3){const Y=o+0,w=o+1,O=o+2;C[p++]=Y,C[p++]=w,C[p++]=w,C[p++]=O,C[p++]=O,C[p++]=Y}}x.version=l;const M=s.get(L);M&&n.remove(M),s.set(L,x)}function E(L){const U=s.get(L);if(U){const f=L.index;f!==null&&U.version<f.version&&y(L)}else y(L);return s.get(L)}function v(){for(const L in c){const U=c[L].deref();U!==void 0&&N(U)}}return{get:S,update:W,getWireframeAttribute:E,dispose:v}}function Sc(e,n,t){let i;function c(y){i=y}let s,d;function _(y){s=y.type,d=y.bytesPerElement}function N(y,E){e.drawElements(i,E,s,y*d),t.update(E,i,1)}function S(y,E,v){v!==0&&(e.drawElementsInstanced(i,E,s,y*d,v),t.update(E,i,v))}function W(y,E,v){if(v===0)return;n.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,E,0,s,y,0,v);let U=0;for(let f=0;f<v;f++)U+=E[f];t.update(U,i,1)}this.setMode=c,this.setIndex=_,this.render=N,this.renderInstances=S,this.renderMultiDraw=W}function Ec(e){const n={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,d,_){switch(t.calls++,d){case e.TRIANGLES:t.triangles+=_*(s/3);break;case e.LINES:t.lines+=_*(s/2);break;case e.LINE_STRIP:t.lines+=_*(s-1);break;case e.LINE_LOOP:t.lines+=_*s;break;case e.POINTS:t.points+=_*s;break;default:$e("WebGLInfo: Unknown draw mode:",d);break}}function c(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:n,render:t,programs:null,autoReset:!0,reset:c,update:i}}function Mc(e,n,t){const i=new WeakMap,c=new gt;function s(d,_,N){const S=d.morphTargetInfluences,W=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,y=W!==void 0?W.length:0;let E=i.get(_);if(E===void 0||E.count!==y){let Y=function(){o.dispose(),i.delete(_),_.removeEventListener("dispose",Y)};E!==void 0&&E.texture.dispose();const v=_.morphAttributes.position!==void 0,L=_.morphAttributes.normal!==void 0,U=_.morphAttributes.color!==void 0,f=_.morphAttributes.position||[],l=_.morphAttributes.normal||[],m=_.morphAttributes.color||[];let D=0;v===!0&&(D=1),L===!0&&(D=2),U===!0&&(D=3);let x=_.attributes.position.count*D,C=1;x>n.maxTextureSize&&(C=Math.ceil(x/n.maxTextureSize),x=n.maxTextureSize);const M=new Float32Array(x*C*4*y),o=new Pa(M,x,C,y);o.type=Bt,o.needsUpdate=!0;const p=D*4;for(let w=0;w<y;w++){const O=f[w],X=l[w],Z=m[w],A=x*C*4*w;for(let Q=0;Q<O.count;Q++){const q=Q*p;v===!0&&(c.fromBufferAttribute(O,Q),M[A+q+0]=c.x,M[A+q+1]=c.y,M[A+q+2]=c.z,M[A+q+3]=0),L===!0&&(c.fromBufferAttribute(X,Q),M[A+q+4]=c.x,M[A+q+5]=c.y,M[A+q+6]=c.z,M[A+q+7]=0),U===!0&&(c.fromBufferAttribute(Z,Q),M[A+q+8]=c.x,M[A+q+9]=c.y,M[A+q+10]=c.z,M[A+q+11]=Z.itemSize===4?c.w:1)}}E={count:y,texture:o,size:new vt(x,C)},i.set(_,E),_.addEventListener("dispose",Y)}if(d.isInstancedMesh===!0&&d.morphTexture!==null)N.getUniforms().setValue(e,"morphTexture",d.morphTexture,t);else{let v=0;for(let U=0;U<S.length;U++)v+=S[U];const L=_.morphTargetsRelative?1:1-v;N.getUniforms().setValue(e,"morphTargetBaseInfluence",L),N.getUniforms().setValue(e,"morphTargetInfluences",S)}N.getUniforms().setValue(e,"morphTargetsTexture",E.texture,t),N.getUniforms().setValue(e,"morphTargetsTextureSize",E.size)}return{update:s}}function xc(e,n,t,i,c){let s=new WeakMap;function d(S){const W=c.render.frame,y=S.geometry,E=n.get(S,y);if(s.get(E)!==W&&(n.update(E),s.set(E,W)),S.isInstancedMesh&&(S.hasEventListener("dispose",N)===!1&&S.addEventListener("dispose",N),s.get(S)!==W&&(t.update(S.instanceMatrix,e.ARRAY_BUFFER),S.instanceColor!==null&&t.update(S.instanceColor,e.ARRAY_BUFFER),s.set(S,W))),S.isSkinnedMesh){const v=S.skeleton;s.get(v)!==W&&(v.update(),s.set(v,W))}return E}function _(){s=new WeakMap}function N(S){const W=S.target;W.removeEventListener("dispose",N),i.releaseStatesOfObject(W),t.remove(W.instanceMatrix),W.instanceColor!==null&&t.remove(W.instanceColor)}return{update:d,dispose:_}}const Tc={[Oa]:"LINEAR_TONE_MAPPING",[ya]:"REINHARD_TONE_MAPPING",[Ia]:"CINEON_TONE_MAPPING",[Na]:"ACES_FILMIC_TONE_MAPPING",[Ua]:"AGX_TONE_MAPPING",[wa]:"NEUTRAL_TONE_MAPPING",[Da]:"CUSTOM_TONE_MAPPING"};function Ac(e,n,t,i,c,s){const d=new wt(n,t,{type:e,depthBuffer:c,stencilBuffer:s,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let _=null,N=null,S=null;const W=new _a;W.setAttribute("position",new si([-1,3,0,-1,-1,0,3,-1,0],3)),W.setAttribute("uv",new si([0,2,0,0,2,0],2));const y=new yr({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),E=new Kt(W,y),v=new Or(-1,1,1,-1,0,1);let L=null,U=null,f=!1,l,m=null,D=[],x=!1;this.setSize=function(C,M){d.setSize(C,M),_!==null&&_.setSize(C,M),N!==null&&N.setSize(C,M);for(let o=0;o<D.length;o++){const p=D[o];p.setSize&&p.setSize(C,M)}},this.setEffects=function(C){D=C,x=D.length>0&&D[0].isRenderPass===!0;const M=d.width,o=d.height;D.length>0&&_===null&&(_=new wt(M,o,{type:yt,depthBuffer:!1,stencilBuffer:!1}),N=new wt(M,o,{type:yt,depthBuffer:!1,stencilBuffer:!1}));const p=c===!0&&D.some(Y=>Y.needsDepthTexture===!0);p!==(d.depthTexture!==null)&&(p===!0&&S===null&&(S=new cn(M,o),s===!0&&(S.format=Xt,S.type=jt)),d.dispose(),d.depthTexture=p?S:null,d.resolveDepthBuffer=p,d.storeMultisampledDepthBuffer=p);for(let Y=0;Y<D.length;Y++){const w=D[Y];w.setSize&&w.setSize(M,o),p&&w.needsDepthTexture===!0&&w.setDepthTexture&&w.setDepthTexture(S)}},this.begin=function(C,M){if(f||C.toneMapping===It&&D.length===0)return!1;if(m=M,M!==null){const o=M.width,p=M.height;(d.width!==o||d.height!==p)&&this.setSize(o,p)}return x===!1&&C.setRenderTarget(d),l=C.toneMapping,C.toneMapping=It,!0},this.hasRenderPass=function(){return x},this.end=function(C,M){C.toneMapping=l,f=!0;let o=d,p=_;for(let Y=0;Y<D.length;Y++){const w=D[Y];w.enabled!==!1&&(w.render(C,p,o,M),w.needsSwap!==!1&&(o=p,p=p===_?N:_))}if(L!==C.outputColorSpace||U!==C.toneMapping){L=C.outputColorSpace,U=C.toneMapping,y.defines={},et.getTransfer(L)===Ke&&(y.defines.SRGB_TRANSFER="");const Y=Tc[U];Y&&(y.defines[Y]=""),y.needsUpdate=!0}y.uniforms.tDiffuse.value=o.texture,C.setRenderTarget(m),C.render(E,v),m=null,f=!1},this.isCompositing=function(){return f},this.dispose=function(){d.dispose(),_!==null&&_.dispose(),N!==null&&N.dispose(),W.dispose(),y.dispose()}}const Wa=new vo,ka=new cn(1,1),za=new ga(1),Xa=new Pa,Ka=new go,Ya=new Ra,Zi=[],$i=[],Qi=new Float32Array(16),Ji=new Float32Array(9),ji=new Float32Array(4);function en(e,n,t){const i=e[0];if(i<=0||i>0)return e;const c=n*t;let s=Zi[c];if(s===void 0&&(s=new Float32Array(c),Zi[c]=s),n!==0){i.toArray(s,0);for(let d=1,_=0;d!==n;++d)_+=t,e[d].toArray(s,_)}return s}function at(e,n){if(e.length!==n.length)return!1;for(let t=0,i=e.length;t<i;t++)if(e[t]!==n[t])return!1;return!0}function rt(e,n){for(let t=0,i=n.length;t<i;t++)e[t]=n[t]}function Rn(e,n){let t=$i[n];t===void 0&&(t=new Int32Array(n),$i[n]=t);for(let i=0;i!==n;++i)t[i]=e.allocateTextureUnit();return t}function Rc(e,n){const t=this.cache;t[0]!==n&&(e.uniform1f(this.addr,n),t[0]=n)}function bc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2f(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(at(t,n))return;e.uniform2fv(this.addr,n),rt(t,n)}}function Cc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3f(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else if(n.r!==void 0)(t[0]!==n.r||t[1]!==n.g||t[2]!==n.b)&&(e.uniform3f(this.addr,n.r,n.g,n.b),t[0]=n.r,t[1]=n.g,t[2]=n.b);else{if(at(t,n))return;e.uniform3fv(this.addr,n),rt(t,n)}}function Pc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4f(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(at(t,n))return;e.uniform4fv(this.addr,n),rt(t,n)}}function Lc(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(at(t,n))return;e.uniformMatrix2fv(this.addr,!1,n),rt(t,n)}else{if(at(t,i))return;ji.set(i),e.uniformMatrix2fv(this.addr,!1,ji),rt(t,i)}}function Dc(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(at(t,n))return;e.uniformMatrix3fv(this.addr,!1,n),rt(t,n)}else{if(at(t,i))return;Ji.set(i),e.uniformMatrix3fv(this.addr,!1,Ji),rt(t,i)}}function wc(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(at(t,n))return;e.uniformMatrix4fv(this.addr,!1,n),rt(t,n)}else{if(at(t,i))return;Qi.set(i),e.uniformMatrix4fv(this.addr,!1,Qi),rt(t,i)}}function Uc(e,n){const t=this.cache;t[0]!==n&&(e.uniform1i(this.addr,n),t[0]=n)}function Nc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2i(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(at(t,n))return;e.uniform2iv(this.addr,n),rt(t,n)}}function Ic(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3i(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(at(t,n))return;e.uniform3iv(this.addr,n),rt(t,n)}}function yc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4i(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(at(t,n))return;e.uniform4iv(this.addr,n),rt(t,n)}}function Oc(e,n){const t=this.cache;t[0]!==n&&(e.uniform1ui(this.addr,n),t[0]=n)}function Fc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2ui(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(at(t,n))return;e.uniform2uiv(this.addr,n),rt(t,n)}}function Bc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3ui(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(at(t,n))return;e.uniform3uiv(this.addr,n),rt(t,n)}}function Gc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4ui(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(at(t,n))return;e.uniform4uiv(this.addr,n),rt(t,n)}}function bn(e){return e.version===0&&(e.compareFunction=ma,e.needsUpdate=!0),e}function Hc(e,n,t){const i=this.cache,c=t.allocateTextureUnit();i[0]!==c&&(e.uniform1i(this.addr,c),i[0]=c);let s;this.type===e.SAMPLER_2D_SHADOW?s=bn(ka):s=Wa,t.setTexture2D(n||s,c)}function Vc(e,n,t){const i=this.cache,c=t.allocateTextureUnit();i[0]!==c&&(e.uniform1i(this.addr,c),i[0]=c),t.setTexture3D(n||Ka,c)}function Wc(e,n,t){const i=this.cache,c=t.allocateTextureUnit();i[0]!==c&&(e.uniform1i(this.addr,c),i[0]=c);let s;this.type===e.SAMPLER_CUBE_SHADOW?s=bn(za):s=Ya,t.setTextureCube(n||s,c)}function kc(e,n,t){const i=this.cache,c=t.allocateTextureUnit();i[0]!==c&&(e.uniform1i(this.addr,c),i[0]=c),t.setTexture2DArray(n||Xa,c)}function zc(e){switch(e){case 5126:return Rc;case 35664:return bc;case 35665:return Cc;case 35666:return Pc;case 35674:return Lc;case 35675:return Dc;case 35676:return wc;case 5124:case 35670:return Uc;case 35667:case 35671:return Nc;case 35668:case 35672:return Ic;case 35669:case 35673:return yc;case 5125:return Oc;case 36294:return Fc;case 36295:return Bc;case 36296:return Gc;case 35678:case 36198:case 36298:case 36306:case 35682:return Hc;case 35679:case 36299:case 36307:return Vc;case 35680:case 36300:case 36308:case 36293:return Wc;case 36289:case 36303:case 36311:case 36292:return kc}}function Xc(e,n){e.uniform1fv(this.addr,n)}function Kc(e,n){const t=en(n,this.size,2);e.uniform2fv(this.addr,t)}function Yc(e,n){const t=en(n,this.size,3);e.uniform3fv(this.addr,t)}function qc(e,n){const t=en(n,this.size,4);e.uniform4fv(this.addr,t)}function Zc(e,n){const t=en(n,this.size,4);e.uniformMatrix2fv(this.addr,!1,t)}function $c(e,n){const t=en(n,this.size,9);e.uniformMatrix3fv(this.addr,!1,t)}function Qc(e,n){const t=en(n,this.size,16);e.uniformMatrix4fv(this.addr,!1,t)}function Jc(e,n){e.uniform1iv(this.addr,n)}function jc(e,n){e.uniform2iv(this.addr,n)}function ef(e,n){e.uniform3iv(this.addr,n)}function tf(e,n){e.uniform4iv(this.addr,n)}function nf(e,n){e.uniform1uiv(this.addr,n)}function af(e,n){e.uniform2uiv(this.addr,n)}function rf(e,n){e.uniform3uiv(this.addr,n)}function of(e,n){e.uniform4uiv(this.addr,n)}function sf(e,n,t){const i=this.cache,c=n.length,s=Rn(t,c);at(i,s)||(e.uniform1iv(this.addr,s),rt(i,s));let d;this.type===e.SAMPLER_2D_SHADOW?d=bn(ka):d=Wa;for(let _=0;_!==c;++_)t.setTexture2D(n[_]||d,s[_])}function lf(e,n,t){const i=this.cache,c=n.length,s=Rn(t,c);at(i,s)||(e.uniform1iv(this.addr,s),rt(i,s));for(let d=0;d!==c;++d)t.setTexture3D(n[d]||Ka,s[d])}function cf(e,n,t){const i=this.cache,c=n.length,s=Rn(t,c);at(i,s)||(e.uniform1iv(this.addr,s),rt(i,s));let d;this.type===e.SAMPLER_CUBE_SHADOW?d=bn(za):d=Ya;for(let _=0;_!==c;++_)t.setTextureCube(n[_]||d,s[_])}function ff(e,n,t){const i=this.cache,c=n.length,s=Rn(t,c);at(i,s)||(e.uniform1iv(this.addr,s),rt(i,s));for(let d=0;d!==c;++d)t.setTexture2DArray(n[d]||Xa,s[d])}function df(e){switch(e){case 5126:return Xc;case 35664:return Kc;case 35665:return Yc;case 35666:return qc;case 35674:return Zc;case 35675:return $c;case 35676:return Qc;case 5124:case 35670:return Jc;case 35667:case 35671:return jc;case 35668:case 35672:return ef;case 35669:case 35673:return tf;case 5125:return nf;case 36294:return af;case 36295:return rf;case 36296:return of;case 35678:case 36198:case 36298:case 36306:case 35682:return sf;case 35679:case 36299:case 36307:return lf;case 35680:case 36300:case 36308:case 36293:return cf;case 36289:case 36303:case 36311:case 36292:return ff}}class uf{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.setValue=zc(t.type)}}class pf{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=df(t.type)}}class hf{constructor(n){this.id=n,this.seq=[],this.map={}}setValue(n,t,i){const c=this.seq;for(let s=0,d=c.length;s!==d;++s){const _=c[s];_.setValue(n,t[_.id],i)}}}const Bn=/(\w+)(\])?(\[|\.)?/g;function ea(e,n){e.seq.push(n),e.map[n.id]=n}function mf(e,n,t){const i=e.name,c=i.length;for(Bn.lastIndex=0;;){const s=Bn.exec(i),d=Bn.lastIndex;let _=s[1];const N=s[2]==="]",S=s[3];if(N&&(_=_|0),S===void 0||S==="["&&d+2===c){ea(t,S===void 0?new uf(_,e,n):new pf(_,e,n));break}else{let y=t.map[_];y===void 0&&(y=new hf(_),ea(t,y)),t=y}}}class En{constructor(n,t){this.seq=[],this.map={};const i=n.getProgramParameter(t,n.ACTIVE_UNIFORMS);for(let d=0;d<i;++d){const _=n.getActiveUniform(t,d),N=n.getUniformLocation(t,_.name);mf(_,N,this)}const c=[],s=[];for(const d of this.seq)d.type===n.SAMPLER_2D_SHADOW||d.type===n.SAMPLER_CUBE_SHADOW||d.type===n.SAMPLER_2D_ARRAY_SHADOW?c.push(d):s.push(d);c.length>0&&(this.seq=c.concat(s))}setValue(n,t,i,c){const s=this.map[t];s!==void 0&&s.setValue(n,i,c)}setOptional(n,t,i){const c=t[i];c!==void 0&&this.setValue(n,i,c)}static upload(n,t,i,c){for(let s=0,d=t.length;s!==d;++s){const _=t[s],N=i[_.id];N.needsUpdate!==!1&&_.setValue(n,N.value,c)}}static seqWithValue(n,t){const i=[];for(let c=0,s=n.length;c!==s;++c){const d=n[c];d.id in t&&i.push(d)}return i}}function ta(e,n,t){const i=e.createShader(n);return e.shaderSource(i,t),e.compileShader(i),i}const _f=37297;let gf=0;function vf(e,n){const t=e.split(`
`),i=[],c=Math.max(n-6,0),s=Math.min(n+6,t.length);for(let d=c;d<s;d++){const _=d+1;i.push(`${_===n?">":" "} ${_}: ${t[d]}`)}return i.join(`
`)}const na=new Fe;function Sf(e){et._getMatrix(na,et.workingColorSpace,e);const n=`mat3( ${na.elements.map(t=>t.toFixed(4))} )`;switch(et.getTransfer(e)){case La:return[n,"LinearTransferOETF"];case Ke:return[n,"sRGBTransferOETF"];default:return We("WebGLProgram: Unsupported color space: ",e),[n,"LinearTransferOETF"]}}function ia(e,n,t){const i=e.getShaderParameter(n,e.COMPILE_STATUS),s=(e.getShaderInfoLog(n)||"").trim();if(i&&s==="")return"";const d=/ERROR: 0:(\d+)/.exec(s);if(d){const _=parseInt(d[1]);return t.toUpperCase()+`

`+s+`

`+vf(e.getShaderSource(n),_)}else return s}function Ef(e,n){const t=Sf(n);return[`vec4 ${e}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const Mf={[Oa]:"Linear",[ya]:"Reinhard",[Ia]:"Cineon",[Na]:"ACESFilmic",[Ua]:"AgX",[wa]:"Neutral",[Da]:"Custom"};function xf(e,n){const t=Mf[n];return t===void 0?(We("WebGLProgram: Unsupported toneMapping:",n),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const gn=new Ge;function Tf(){et.getLuminanceCoefficients(gn);const e=gn.x.toFixed(4),n=gn.y.toFixed(4),t=gn.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${n}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Af(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(sn).join(`
`)}function Rf(e){const n=[];for(const t in e){const i=e[t];i!==!1&&n.push("#define "+t+" "+i)}return n.join(`
`)}function bf(e,n){const t={},i=e.getProgramParameter(n,e.ACTIVE_ATTRIBUTES);for(let c=0;c<i;c++){const s=e.getActiveAttrib(n,c),d=s.name;let _=1;s.type===e.FLOAT_MAT2&&(_=2),s.type===e.FLOAT_MAT3&&(_=3),s.type===e.FLOAT_MAT4&&(_=4),t[d]={type:s.type,location:e.getAttribLocation(n,d),locationSize:_}}return t}function sn(e){return e!==""}function aa(e,n){const t=n.numSpotLightShadows+n.numSpotLightMaps-n.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,n.numSunLights).replace(/NUM_DIR_LIGHTS/g,n.numDirLights).replace(/NUM_SPOT_LIGHTS/g,n.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,n.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,n.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,n.numPointLights).replace(/NUM_HEMI_LIGHTS/g,n.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,n.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,n.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,n.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,n.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,n.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,n.numLightProbeGrids)}function ra(e,n){return e.replace(/NUM_CLIPPING_PLANES/g,n.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,n.numClippingPlanes-n.numClipIntersection)}const Cf=/^[ \t]*#include +<([\w\d./]+)>/gm;function Xn(e){return e.replace(Cf,Pf)}function Pf(e,n){const t=we[n];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+n+">");return Xn(t)}const Lf=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function oa(e){return e.replace(Lf,Df)}function Df(e,n,t,i){let c="";for(let s=parseInt(n);s<parseInt(t);s++)c+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return c}function sa(e){let n=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?n+=`
#define HIGH_PRECISION`:e.precision==="mediump"?n+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(n+=`
#define LOW_PRECISION`),n}const wf={[vn]:"SHADOWMAP_TYPE_PCF",[on]:"SHADOWMAP_TYPE_VSM"};function Uf(e){return wf[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Nf={[dn]:"ENVMAP_MODE_REFRACTION"};function If(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":Nf[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}const yf={[_o]:"ENVMAP_BLENDING_MULTIPLY",[mo]:"ENVMAP_BLENDING_MIX",[ho]:"ENVMAP_BLENDING_ADD"};function Of(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":yf[e.combine]||"ENVMAP_BLENDING_NONE"}function Ff(e,n,t,i){const c=e.getContext(),s=t.defines;let d=t.vertexShader,_=t.fragmentShader;const N=Uf(t),S=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",W=If(t),y=Of(t),E=Af(t),v=Rf(s),L=c.createProgram();let U,f,l=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(U=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v].filter(sn).join(`
`),U.length>0&&(U+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v].filter(sn).join(`
`),f.length>0&&(f+=`
`)):(U=[sa(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+W:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+N:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(sn).join(`
`),f=[sa(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+S:"",t.envMap?"#define "+W:"",t.envMap?"#define "+y:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+N:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==It?"#define TONE_MAPPING":"",t.toneMapping!==It?we.tonemapping_pars_fragment:"",t.toneMapping!==It?xf("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",we.colorspace_pars_fragment,Ef("linearToOutputTexel",t.outputColorSpace),Tf(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(sn).join(`
`)),d=Xn(d),d=aa(d,t),d=ra(d,t),_=Xn(_),_=aa(_,t),_=ra(_,t),d=oa(d),_=oa(_),t.isRawShaderMaterial!==!0&&(l=`#version 300 es
`,U=[E,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+U,f=["#define varying in",t.glslVersion===zi?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===zi?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const m=l+U+d,D=l+f+_,x=ta(c,c.VERTEX_SHADER,m),C=ta(c,c.FRAGMENT_SHADER,D);c.attachShader(L,x),c.attachShader(L,C),t.index0AttributeName!==void 0?c.bindAttribLocation(L,0,t.index0AttributeName):t.hasPositionAttribute===!0&&c.bindAttribLocation(L,0,"position"),c.linkProgram(L);function M(w){if(e.debug.checkShaderErrors){const O=c.getProgramInfoLog(L)||"",X=c.getShaderInfoLog(x)||"",Z=c.getShaderInfoLog(C)||"",A=O.trim(),Q=X.trim(),q=Z.trim();let H=!0,fe=!0;if(c.getProgramParameter(L,c.LINK_STATUS)===!1)if(H=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(c,L,x,C);else{const K=ia(c,x,"vertex"),j=ia(c,C,"fragment");$e("WebGLProgram: Shader Error "+c.getError()+" - VALIDATE_STATUS "+c.getProgramParameter(L,c.VALIDATE_STATUS)+`

Material Name: `+w.name+`
Material Type: `+w.type+`

Program Info Log: `+A+`
`+K+`
`+j)}else A!==""?We("WebGLProgram: Program Info Log:",A):(Q===""||q==="")&&(fe=!1);fe&&(w.diagnostics={runnable:H,programLog:A,vertexShader:{log:Q,prefix:U},fragmentShader:{log:q,prefix:f}})}c.deleteShader(x),c.deleteShader(C),o=new En(c,L),p=bf(c,L)}let o;this.getUniforms=function(){return o===void 0&&M(this),o};let p;this.getAttributes=function(){return p===void 0&&M(this),p};let Y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return Y===!1&&(Y=c.getProgramParameter(L,_f)),Y},this.destroy=function(){i.releaseStatesOfProgram(this),c.deleteProgram(L),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=gf++,this.cacheKey=n,this.usedTimes=1,this.program=L,this.vertexShader=x,this.fragmentShader=C,this}let Bf=0;class Gf{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(n,t,i){const c=this._getShaderCacheForMaterial(n);return c.has(t)===!1&&(c.add(t),t.usedTimes++),c.has(i)===!1&&(c.add(i),i.usedTimes++),this}remove(n){const t=this.materialCache.get(n);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(n),this}getVertexShaderStage(n){return this._getShaderStage(n.vertexShader)}getFragmentShaderStage(n){return this._getShaderStage(n.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(n){const t=this.materialCache;let i=t.get(n);return i===void 0&&(i=new Set,t.set(n,i)),i}_getShaderStage(n){const t=this.shaderCache;let i=t.get(n);return i===void 0&&(i=new Hf(n),t.set(n,i)),i}}class Hf{constructor(n){this.id=Bf++,this.code=n,this.usedTimes=0}}function Vf(e){return e===Jt||e===kn||e===zn}function Wf(e,n,t,i,c,s){const d=new fo,_=new Gf,N=new Set,S=[],W=new Map,y=i.logarithmicDepthBuffer,E={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(o){return N.add(o),o===0?"uv":`uv${o}`}function L(o,p,Y,w,O,X){const Z=w.fog,A=O.geometry,Q=o.isMeshStandardMaterial||o.isMeshLambertMaterial||o.isMeshPhongMaterial?w.environment:null,q=o.isMeshStandardMaterial||o.isMeshLambertMaterial&&!o.envMap||o.isMeshPhongMaterial&&!o.envMap,H=n.get(o.envMap||Q,q),fe=E[o.type];let K=i.precision;o.precision!==null&&(K=i.getMaxPrecision(o.precision),K!==o.precision&&We("WebGLProgram.getParameters:",o.precision,"not supported, using",K,"instead."));const j=A.morphAttributes.position||A.morphAttributes.normal||A.morphAttributes.color,ie=j!==void 0?j.length:0;let Ae=0;A.morphAttributes.position!==void 0&&(Ae=1),A.morphAttributes.normal!==void 0&&(Ae=2),A.morphAttributes.color!==void 0&&(Ae=3);let Ne,k,he,Se;if(fe){const de=Lt[fe];Ne=de.vertexShader,k=de.fragmentShader}else{Ne=o.vertexShader,k=o.fragmentShader;const de=_.getVertexShaderStage(o),Ve=_.getFragmentShaderStage(o);_.update(o,de,Ve),he=de.id,Se=Ve.id}const Re=e.getRenderTarget(),me=e.state.buffers.depth.getReversed(),Ue=O.isInstancedMesh===!0,ht=O.isBatchedMesh===!0,be=!!o.map,Ye=!!o.matcap,ke=!!H,Ie=ke&&H.isPMREMTexture===!0,ct=!!o.aoMap,nt=!!o.lightMap,mt=!!o.bumpMap&&o.wireframe===!1,Je=!!o.normalMap,Ct=!!o.displacementMap,ot=!!o.emissiveMap,Et=!!o.metalnessMap,Mt=!!o.roughnessMap,xt=o.anisotropy>0,T=o.clearcoat>0,Tt=o.diffuseRoughness>0,qe=o.dispersion>0,Ze=o.retroreflectivity>0,ce=o.iridescence>0,it=o.sheen>0,Te=o.transmission>0,Ce=xt&&!!o.anisotropyMap,u=T&&!!o.clearcoatMap,a=T&&!!o.clearcoatNormalMap,b=T&&!!o.clearcoatRoughnessMap,$=Tt&&!!o.diffuseRoughnessMap,z=ce&&!!o.iridescenceMap,te=ce&&!!o.iridescenceThicknessMap,se=it&&!!o.sheenColorMap,B=it&&!!o.sheenRoughnessMap,G=!!o.specularMap,ae=!!o.specularColorMap,h=!!o.specularIntensityMap,V=Te&&!!o.transmissionMap,F=Te&&!!o.thicknessMap,re=!!o.gradientMap,ee=!!o.alphaMap,ne=o.alphaTest>0,Me=!!o.alphaHash,De=!!o.extensions;let J=It;o.toneMapped&&(Re===null||Re.isXRRenderTarget===!0)&&(J=e.toneMapping);const xe=Ie?H.isCompressedCubeTexture?H.image[0].mipmaps:H.mipmaps:null,Le={shaderID:fe,shaderType:o.type,shaderName:o.name,vertexShader:Ne,fragmentShader:k,defines:o.defines,customVertexShaderID:he,customFragmentShaderID:Se,isRawShaderMaterial:o.isRawShaderMaterial===!0,glslVersion:o.glslVersion,precision:K,batching:ht,batchingColor:ht&&O._colorsTexture!==null,instancing:Ue,instancingColor:Ue&&O.instanceColor!==null,instancingMorph:Ue&&O.morphTexture!==null,outputColorSpace:Re===null?e.outputColorSpace:Re.isXRRenderTarget===!0?Re.texture.colorSpace:et.workingColorSpace,alphaToCoverage:!!o.alphaToCoverage,map:be,matcap:Ye,envMap:ke,envMapMode:ke&&H.mapping,envMapPMREM:Ie,envMapMaxLod:Ie?xe.length-1:null,envMapSize:Ie?xe[0].width:null,aoMap:ct,lightMap:nt,bumpMap:mt,normalMap:Je,displacementMap:Ct,emissiveMap:ot,normalMapObjectSpace:Je&&o.normalMapType===eo,normalMapTangentSpace:Je&&o.normalMapType===ui,packedNormalMap:Je&&o.normalMapType===ui&&Vf(o.normalMap.format),metalnessMap:Et,roughnessMap:Mt,anisotropy:xt,anisotropyMap:Ce,clearcoat:T,clearcoatMap:u,clearcoatNormalMap:a,clearcoatRoughnessMap:b,diffuseRoughness:Tt,diffuseRoughnessMap:$,dispersion:qe,retroreflection:Ze,iridescence:ce,iridescenceMap:z,iridescenceThicknessMap:te,sheen:it,sheenColorMap:se,sheenRoughnessMap:B,specularMap:G,specularColorMap:ae,specularIntensityMap:h,transmission:Te,transmissionMap:V,thicknessMap:F,gradientMap:re,opaque:o.transparent===!1&&o.blending===Sn&&o.alphaToCoverage===!1,alphaMap:ee,alphaTest:ne,alphaHash:Me,combine:o.combine,mapUv:be&&v(o.map.channel),aoMapUv:ct&&v(o.aoMap.channel),lightMapUv:nt&&v(o.lightMap.channel),bumpMapUv:mt&&v(o.bumpMap.channel),normalMapUv:Je&&v(o.normalMap.channel),displacementMapUv:Ct&&v(o.displacementMap.channel),emissiveMapUv:ot&&v(o.emissiveMap.channel),metalnessMapUv:Et&&v(o.metalnessMap.channel),roughnessMapUv:Mt&&v(o.roughnessMap.channel),anisotropyMapUv:Ce&&v(o.anisotropyMap.channel),clearcoatMapUv:u&&v(o.clearcoatMap.channel),clearcoatNormalMapUv:a&&v(o.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:b&&v(o.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:$&&v(o.diffuseRoughnessMap.channel),iridescenceMapUv:z&&v(o.iridescenceMap.channel),iridescenceThicknessMapUv:te&&v(o.iridescenceThicknessMap.channel),sheenColorMapUv:se&&v(o.sheenColorMap.channel),sheenRoughnessMapUv:B&&v(o.sheenRoughnessMap.channel),specularMapUv:G&&v(o.specularMap.channel),specularColorMapUv:ae&&v(o.specularColorMap.channel),specularIntensityMapUv:h&&v(o.specularIntensityMap.channel),transmissionMapUv:V&&v(o.transmissionMap.channel),thicknessMapUv:F&&v(o.thicknessMap.channel),alphaMapUv:ee&&v(o.alphaMap.channel),vertexTangents:!!A.attributes.tangent&&(Je||xt),vertexNormals:!!A.attributes.normal,vertexColors:o.vertexColors,vertexAlphas:o.vertexColors===!0&&!!A.attributes.color&&A.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!A.attributes.uv&&(be||ee),fog:!!Z,useFog:o.fog===!0,fogExp2:!!Z&&Z.isFogExp2,flatShading:o.wireframe===!1&&(o.flatShading===!0||A.attributes.normal===void 0&&Je===!1&&(o.isMeshLambertMaterial||o.isMeshPhongMaterial||o.isMeshStandardMaterial||o.isMeshPhysicalMaterial)),sizeAttenuation:o.sizeAttenuation===!0,logarithmicDepthBuffer:y,reversedDepthBuffer:me,skinning:O.isSkinnedMesh===!0,hasPositionAttribute:A.attributes.position!==void 0,morphTargets:A.morphAttributes.position!==void 0,morphNormals:A.morphAttributes.normal!==void 0,morphColors:A.morphAttributes.color!==void 0,morphTargetsCount:ie,morphTextureStride:Ae,numSunLights:p.sun.length,numDirLights:p.directional.length,numPointLights:p.point.length,numSpotLights:p.spot.length,numSpotLightMaps:p.spotLightMap.length,numRectAreaLights:p.rectArea.length,numHemiLights:p.hemi.length,numSunLightShadows:p.sunShadowMap.length,numDirLightShadows:p.directionalShadowMap.length,numPointLightShadows:p.pointShadowMap.length,numSpotLightShadows:p.spotShadowMap.length,numSpotLightShadowsWithMaps:p.numSpotLightShadowsWithMaps,numLightProbes:p.numLightProbes,numLightProbeGrids:X.filter(de=>de.texture!==null).length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:o.dithering,shadowMapEnabled:e.shadowMap.enabled&&Y.length>0,shadowMapType:e.shadowMap.type,toneMapping:J,decodeVideoTexture:be&&o.map.isVideoTexture===!0&&et.getTransfer(o.map.colorSpace)===Ke,decodeVideoTextureEmissive:ot&&o.emissiveMap.isVideoTexture===!0&&et.getTransfer(o.emissiveMap.colorSpace)===Ke,premultipliedAlpha:o.premultipliedAlpha,doubleSided:o.side===Nt,flipSided:o.side===St,useDepthPacking:o.depthPacking>=0,depthPacking:o.depthPacking||0,index0AttributeName:o.index0AttributeName,extensionClipCullDistance:De&&o.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(De&&o.extensions.multiDraw===!0||ht)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:o.customProgramCacheKey()};return Le.vertexUv1s=N.has(1),Le.vertexUv2s=N.has(2),Le.vertexUv3s=N.has(3),N.clear(),Le}function U(o){const p=[];if(o.shaderID?p.push(o.shaderID):(p.push(o.customVertexShaderID),p.push(o.customFragmentShaderID)),o.defines!==void 0)for(const Y in o.defines)p.push(Y),p.push(o.defines[Y]);return o.isRawShaderMaterial===!1&&(f(p,o),l(p,o),p.push(e.outputColorSpace)),p.push(o.customProgramCacheKey),p.join()}function f(o,p){o.push(p.precision),o.push(p.outputColorSpace),o.push(p.envMapMode),o.push(p.envMapPMREM),o.push(p.envMapMaxLod),o.push(p.envMapSize),o.push(p.mapUv),o.push(p.alphaMapUv),o.push(p.lightMapUv),o.push(p.aoMapUv),o.push(p.bumpMapUv),o.push(p.normalMapUv),o.push(p.displacementMapUv),o.push(p.emissiveMapUv),o.push(p.metalnessMapUv),o.push(p.roughnessMapUv),o.push(p.anisotropyMapUv),o.push(p.clearcoatMapUv),o.push(p.clearcoatNormalMapUv),o.push(p.clearcoatRoughnessMapUv),o.push(p.diffuseRoughnessMapUv),o.push(p.iridescenceMapUv),o.push(p.iridescenceThicknessMapUv),o.push(p.sheenColorMapUv),o.push(p.sheenRoughnessMapUv),o.push(p.specularMapUv),o.push(p.specularColorMapUv),o.push(p.specularIntensityMapUv),o.push(p.transmissionMapUv),o.push(p.thicknessMapUv),o.push(p.combine),o.push(p.fogExp2),o.push(p.sizeAttenuation),o.push(p.morphTargetsCount),o.push(p.numSunLights),o.push(p.numDirLights),o.push(p.numPointLights),o.push(p.numSpotLights),o.push(p.numSpotLightMaps),o.push(p.numHemiLights),o.push(p.numRectAreaLights),o.push(p.numSunLightShadows),o.push(p.numDirLightShadows),o.push(p.numPointLightShadows),o.push(p.numSpotLightShadows),o.push(p.numSpotLightShadowsWithMaps),o.push(p.numLightProbes),o.push(p.numLightProbeGrids),o.push(p.shadowMapType),o.push(p.toneMapping),o.push(p.numClippingPlanes),o.push(p.numClipIntersection),o.push(p.depthPacking)}function l(o,p){d.disableAll(),p.instancing&&d.enable(0),p.instancingColor&&d.enable(1),p.instancingMorph&&d.enable(2),p.matcap&&d.enable(3),p.envMap&&d.enable(4),p.normalMapObjectSpace&&d.enable(5),p.normalMapTangentSpace&&d.enable(6),p.clearcoat&&d.enable(7),p.iridescence&&d.enable(8),p.alphaTest&&d.enable(9),p.vertexColors&&d.enable(10),p.vertexAlphas&&d.enable(11),p.vertexUv1s&&d.enable(12),p.vertexUv2s&&d.enable(13),p.vertexUv3s&&d.enable(14),p.vertexTangents&&d.enable(15),p.anisotropy&&d.enable(16),p.alphaHash&&d.enable(17),p.batching&&d.enable(18),p.dispersion&&d.enable(19),p.retroreflection&&d.enable(24),p.diffuseRoughness&&d.enable(25),p.batchingColor&&d.enable(20),p.gradientMap&&d.enable(21),p.packedNormalMap&&d.enable(22),p.vertexNormals&&d.enable(23),o.push(d.mask),d.disableAll(),p.fog&&d.enable(0),p.useFog&&d.enable(1),p.flatShading&&d.enable(2),p.logarithmicDepthBuffer&&d.enable(3),p.reversedDepthBuffer&&d.enable(4),p.skinning&&d.enable(5),p.morphTargets&&d.enable(6),p.morphNormals&&d.enable(7),p.morphColors&&d.enable(8),p.premultipliedAlpha&&d.enable(9),p.shadowMapEnabled&&d.enable(10),p.doubleSided&&d.enable(11),p.flipSided&&d.enable(12),p.useDepthPacking&&d.enable(13),p.dithering&&d.enable(14),p.transmission&&d.enable(15),p.sheen&&d.enable(16),p.opaque&&d.enable(17),p.pointsUvs&&d.enable(18),p.decodeVideoTexture&&d.enable(19),p.decodeVideoTextureEmissive&&d.enable(20),p.alphaToCoverage&&d.enable(21),p.numLightProbeGrids>0&&d.enable(22),p.hasPositionAttribute&&d.enable(23),o.push(d.mask)}function m(o){const p=E[o.type];let Y;if(p){const w=Lt[p];Y=jr.clone(w.uniforms)}else Y=o.uniforms;return Y}function D(o,p){let Y=W.get(p);return Y!==void 0?++Y.usedTimes:(Y=new Ff(e,p,o,c),S.push(Y),W.set(p,Y)),Y}function x(o){if(--o.usedTimes===0){const p=S.indexOf(o);S[p]=S[S.length-1],S.pop(),W.delete(o.cacheKey),o.destroy()}}function C(o){_.remove(o)}function M(){_.dispose()}return{getParameters:L,getProgramCacheKey:U,getUniforms:m,acquireProgram:D,releaseProgram:x,releaseShaderCache:C,programs:S,dispose:M}}function kf(){let e=new WeakMap;function n(d){return e.has(d)}function t(d){let _=e.get(d);return _===void 0&&(_={},e.set(d,_)),_}function i(d){e.delete(d)}function c(d,_,N){e.get(d)[_]=N}function s(){e=new WeakMap}return{has:n,get:t,remove:i,update:c,dispose:s}}function zf(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.material.id!==n.material.id?e.material.id-n.material.id:e.materialVariant!==n.materialVariant?e.materialVariant-n.materialVariant:e.z!==n.z?e.z-n.z:e.id-n.id}function la(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.z!==n.z?n.z-e.z:e.id-n.id}function ca(){const e=[];let n=0;const t=[],i=[],c=[];function s(){n=0,t.length=0,i.length=0,c.length=0}function d(E){let v=0;return E.isInstancedMesh&&(v+=2),E.isSkinnedMesh&&(v+=1),v}function _(E,v,L,U,f,l){let m=e[n];return m===void 0?(m={id:E.id,object:E,geometry:v,material:L,materialVariant:d(E),groupOrder:U,renderOrder:E.renderOrder,z:f,group:l},e[n]=m):(m.id=E.id,m.object=E,m.geometry=v,m.material=L,m.materialVariant=d(E),m.groupOrder=U,m.renderOrder=E.renderOrder,m.z=f,m.group=l),n++,m}function N(E,v,L,U,f,l,m){m.reversedDepth===!0&&(f=-f);const D=_(E,v,L,U,f,l);L.transmission>0?i.push(D):L.transparent===!0?c.push(D):t.push(D)}function S(E,v,L,U,f,l){const m=_(E,v,L,U,f,l);L.transmission>0?i.unshift(m):L.transparent===!0?c.unshift(m):t.unshift(m)}function W(E,v){t.length>1&&t.sort(E||zf),i.length>1&&i.sort(v||la),c.length>1&&c.sort(v||la)}function y(){for(let E=n,v=e.length;E<v;E++){const L=e[E];if(L.id===null)break;L.id=null,L.object=null,L.geometry=null,L.material=null,L.group=null}}return{opaque:t,transmissive:i,transparent:c,init:s,push:N,unshift:S,finish:y,sort:W}}function Xf(){let e=new WeakMap;function n(i,c){const s=e.get(i);let d;return s===void 0?(d=new ca,e.set(i,[d])):c>=s.length?(d=new ca,s.push(d)):d=s[c],d}function t(){e=new WeakMap}return{get:n,dispose:t}}function Kf(){const e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"SunLight":case"DirectionalLight":t={direction:new Ge,color:new Qe};break;case"SpotLight":t={position:new Ge,direction:new Ge,color:new Qe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new Ge,color:new Qe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new Ge,skyColor:new Qe,groundColor:new Qe};break;case"RectAreaLight":t={color:new Qe,position:new Ge,halfWidth:new Ge,halfHeight:new Ge};break}return e[n.id]=t,t}}}function Yf(){const e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[n.id]=t,t}}}let qf=0;function Zf(e,n){return(n.castShadow?2:0)-(e.castShadow?2:0)+(n.map?1:0)-(e.map?1:0)}function $f(e){const n=new Kf,t=Yf(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let S=0;S<9;S++)i.probe.push(new Ge);const c=new Ge,s=new $t,d=new $t;function _(S){let W=0,y=0,E=0;for(let X=0;X<9;X++)i.probe[X].set(0,0,0);let v=0,L=0,U=0,f=0,l=0,m=0,D=0,x=0,C=0,M=0,o=0,p=0,Y=0,w=0;S.sort(Zf);for(let X=0,Z=S.length;X<Z;X++){const A=S[X],Q=A.color,q=A.intensity,H=A.distance;let fe=null;if(A.shadow&&A.shadow.map&&(A.shadow.map.texture.format===Jt?fe=A.shadow.map.texture:fe=A.shadow.map.depthTexture||A.shadow.map.texture),A.isAmbientLight)W+=Q.r*q,y+=Q.g*q,E+=Q.b*q;else if(A.isLightProbe){for(let K=0;K<9;K++)i.probe[K].addScaledVector(A.sh.coefficients[K],q);w++}else if(A.isSunLight){const K=n.get(A);if(K.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){const j=A.shadow,ie=t.get(A);ie.shadowIntensity=j.intensity,ie.shadowBias=j.bias,ie.shadowNormalBias=j.normalBias,ie.shadowRadius=j.radius,ie.shadowMapSize.copy(j.mapSize).multiply(j.getFrameExtents()),i.sunShadow[L]=ie,i.sunShadowMap[L]=fe;const Ae=j.getViewportCount();for(let Ne=0;Ne<Ae;Ne++)i.sunShadowMatrix[U+Ne]=j.getMatrix(Ne),i.sunShadowCascade[U+Ne]=j._cascadeData[Ne];U+=Ae,L++}i.sun[v]=K,v++}else if(A.isDirectionalLight){const K=n.get(A);if(K.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){const j=A.shadow,ie=t.get(A);ie.shadowIntensity=j.intensity,ie.shadowBias=j.bias,ie.shadowNormalBias=j.normalBias,ie.shadowRadius=j.radius,ie.shadowMapSize=j.mapSize,i.directionalShadow[f]=ie,i.directionalShadowMap[f]=fe,i.directionalShadowMatrix[f]=A.shadow.matrix,C++}i.directional[f]=K,f++}else if(A.isSpotLight){const K=n.get(A);K.position.setFromMatrixPosition(A.matrixWorld),K.color.copy(Q).multiplyScalar(q),K.distance=H,K.coneCos=Math.cos(A.angle),K.penumbraCos=Math.cos(A.angle*(1-A.penumbra)),K.decay=A.decay,i.spot[m]=K;const j=A.shadow;if(A.map&&(i.spotLightMap[p]=A.map,p++,j.updateMatrices(A),A.castShadow&&Y++),i.spotLightMatrix[m]=j.matrix,A.castShadow){const ie=t.get(A);ie.shadowIntensity=j.intensity,ie.shadowBias=j.bias,ie.shadowNormalBias=j.normalBias,ie.shadowRadius=j.radius,ie.shadowMapSize=j.mapSize,i.spotShadow[m]=ie,i.spotShadowMap[m]=fe,o++}m++}else if(A.isRectAreaLight){const K=n.get(A);K.color.copy(Q).multiplyScalar(q),K.halfWidth.set(A.width*.5,0,0),K.halfHeight.set(0,A.height*.5,0),i.rectArea[D]=K,D++}else if(A.isPointLight){const K=n.get(A);if(K.color.copy(A.color).multiplyScalar(A.intensity),K.distance=A.distance,K.decay=A.decay,A.castShadow){const j=A.shadow,ie=t.get(A);ie.shadowIntensity=j.intensity,ie.shadowBias=j.bias,ie.shadowNormalBias=j.normalBias,ie.shadowRadius=j.radius,ie.shadowMapSize=j.mapSize,ie.shadowCameraNear=j.camera.near,ie.shadowCameraFar=j.camera.far,i.pointShadow[l]=ie,i.pointShadowMap[l]=fe,i.pointShadowMatrix[l]=A.shadow.matrix,M++}i.point[l]=K,l++}else if(A.isHemisphereLight){const K=n.get(A);K.skyColor.copy(A.color).multiplyScalar(q),K.groundColor.copy(A.groundColor).multiplyScalar(q),i.hemi[x]=K,x++}}D>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ue.LTC_FLOAT_1,i.rectAreaLTC2=ue.LTC_FLOAT_2):(i.rectAreaLTC1=ue.LTC_HALF_1,i.rectAreaLTC2=ue.LTC_HALF_2)),i.ambient[0]=W,i.ambient[1]=y,i.ambient[2]=E;const O=i.hash;(O.sunLength!==v||O.directionalLength!==f||O.pointLength!==l||O.spotLength!==m||O.rectAreaLength!==D||O.hemiLength!==x||O.numSunShadows!==L||O.numDirectionalShadows!==C||O.numPointShadows!==M||O.numSpotShadows!==o||O.numSpotMaps!==p||O.numLightProbes!==w)&&(i.sun.length=v,i.directional.length=f,i.spot.length=m,i.rectArea.length=D,i.point.length=l,i.hemi.length=x,i.sunShadow.length=L,i.sunShadowMap.length=L,i.sunShadowMatrix.length=U,i.sunShadowCascade.length=U,i.directionalShadow.length=C,i.directionalShadowMap.length=C,i.directionalShadowMatrix.length=C,i.pointShadow.length=M,i.pointShadowMap.length=M,i.pointShadowMatrix.length=M,i.spotShadow.length=o,i.spotShadowMap.length=o,i.spotLightMatrix.length=o+p-Y,i.spotLightMap.length=p,i.numSpotLightShadowsWithMaps=Y,i.numLightProbes=w,O.sunLength=v,O.directionalLength=f,O.pointLength=l,O.spotLength=m,O.rectAreaLength=D,O.hemiLength=x,O.numSunShadows=L,O.numDirectionalShadows=C,O.numPointShadows=M,O.numSpotShadows=o,O.numSpotMaps=p,O.numLightProbes=w,i.version=qf++)}function N(S,W){let y=0,E=0,v=0,L=0,U=0,f=0;const l=W.matrixWorldInverse;for(let m=0,D=S.length;m<D;m++){const x=S[m];if(x.isSunLight){const C=i.sun[y];C.direction.setFromMatrixPosition(x.matrixWorld),C.direction.transformDirection(l),y++}else if(x.isDirectionalLight){const C=i.directional[E];C.direction.setFromMatrixPosition(x.matrixWorld),c.setFromMatrixPosition(x.target.matrixWorld),C.direction.sub(c),C.direction.transformDirection(l),E++}else if(x.isSpotLight){const C=i.spot[L];C.position.setFromMatrixPosition(x.matrixWorld),C.position.applyMatrix4(l),C.direction.setFromMatrixPosition(x.matrixWorld),c.setFromMatrixPosition(x.target.matrixWorld),C.direction.sub(c),C.direction.transformDirection(l),L++}else if(x.isRectAreaLight){const C=i.rectArea[U];C.position.setFromMatrixPosition(x.matrixWorld),C.position.applyMatrix4(l),d.identity(),s.copy(x.matrixWorld),s.premultiply(l),d.extractRotation(s),C.halfWidth.set(x.width*.5,0,0),C.halfHeight.set(0,x.height*.5,0),C.halfWidth.applyMatrix4(d),C.halfHeight.applyMatrix4(d),U++}else if(x.isPointLight){const C=i.point[v];C.position.setFromMatrixPosition(x.matrixWorld),C.position.applyMatrix4(l),v++}else if(x.isHemisphereLight){const C=i.hemi[f];C.direction.setFromMatrixPosition(x.matrixWorld),C.direction.transformDirection(l),f++}}}return{setup:_,setupView:N,state:i}}function fa(e){const n=new $f(e),t=[],i=[],c=[];function s(y){W.camera=y,t.length=0,i.length=0,c.length=0}function d(y){y.isLightProbeGrid?c.push(y):t.push(y)}function _(y){i.push(y)}function N(){n.setup(t),c.sort((y,E)=>y.priority-E.priority||y.id-E.id)}function S(y){n.setupView(t,y)}const W={lightsArray:t,shadowsArray:i,lightProbeGridArray:c,camera:null,lights:n,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:W,setupLights:N,setupLightsView:S,pushLight:d,pushShadow:_}}function Qf(e){let n=new WeakMap;function t(c,s=0){const d=n.get(c);let _;return d===void 0?(_=new fa(e),n.set(c,[_])):s>=d.length?(_=new fa(e),d.push(_)):_=d[s],_}function i(){n=new WeakMap}return{get:t,dispose:i}}const Jf=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,jf=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,ed=[new Ge(1,0,0),new Ge(-1,0,0),new Ge(0,1,0),new Ge(0,-1,0),new Ge(0,0,1),new Ge(0,0,-1)],td=[new Ge(0,-1,0),new Ge(0,-1,0),new Ge(0,0,1),new Ge(0,0,-1),new Ge(0,-1,0),new Ge(0,-1,0)],da=new $t,an=new Ge,Gn=new Ge;function nd(e,n,t){let i=new ua;const c=new vt,s=new vt,d=new gt,_=new wr,N=new Ur,S={},W=t.maxTextureSize,y={[ln]:St,[St]:ln,[Nt]:Nt},E=new Qt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new vt},radius:{value:4}},vertexShader:Jf,fragmentShader:jf}),v=E.clone();v.defines.HORIZONTAL_PASS=1;const L=new _a;L.setAttribute("position",new Nr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const U=new Kt(L,E),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=vn;let l=this.type;this.render=function(M,o,p){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||M.length===0)return;this.type===Ir&&(We("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=vn);const Y=e.getRenderTarget(),w=e.getActiveCubeFace(),O=e.getActiveMipmapLevel(),X=e.state;X.setBlending(Zt),X.buffers.depth.getReversed()===!0?X.buffers.color.setClear(0,0,0,0):X.buffers.color.setClear(1,1,1,1),X.buffers.depth.setTest(!0),X.setScissorTest(!1);const Z=l!==this.type;Z&&o.traverse(function(A){A.material&&(Array.isArray(A.material)?A.material.forEach(Q=>Q.needsUpdate=!0):A.material.needsUpdate=!0)});for(let A=0,Q=M.length;A<Q;A++){const q=M[A],H=q.shadow;if(H===void 0){We("WebGLShadowMap:",q,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;c.copy(H.mapSize);const fe=H.getFrameExtents();c.multiply(fe),s.copy(H.mapSize),(c.x>W||c.y>W)&&(c.x>W&&(s.x=Math.floor(W/fe.x),c.x=s.x*fe.x,H.mapSize.x=s.x),c.y>W&&(s.y=Math.floor(W/fe.y),c.y=s.y*fe.y,H.mapSize.y=s.y));const K=e.state.buffers.depth.getReversed();if(H.camera._reversedDepth=K,H.map===null||Z===!0){if(H.map!==null&&(H.map.depthTexture!==null&&(H.map.depthTexture.dispose(),H.map.depthTexture=null),H.map.dispose()),this.type===on){if(q.isPointLight){We("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}H.map=new wt(c.x,c.y,{format:Jt,type:yt,minFilter:bt,magFilter:bt,generateMipmaps:!1}),H.map.texture.name=q.name+".shadowMap",H.map.depthTexture=new cn(c.x,c.y,Bt),H.map.depthTexture.name=q.name+".shadowMapDepth",H.map.depthTexture.format=fn,H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=zt,H.map.depthTexture.magFilter=zt}else q.isPointLight?(H.map=new Kn(c.x),H.map.depthTexture=new ga(c.x,Yt)):(H.map=new wt(c.x,c.y),H.map.depthTexture=new cn(c.x,c.y,Yt)),H.map.depthTexture.name=q.name+".shadowMap",H.map.depthTexture.format=fn,this.type===vn?(H.map.depthTexture.compareFunction=K?pa:ha,H.map.depthTexture.minFilter=bt,H.map.depthTexture.magFilter=bt):(H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=zt,H.map.depthTexture.magFilter=zt);H.camera.updateProjectionMatrix()}H.map.isWebGLCubeRenderTarget!==!0&&(H.map.width!==c.x||H.map.height!==c.y)&&H.map.setSize(c.x,c.y);const j=H.map.isWebGLCubeRenderTarget?6:H.getViewportCount();q.isPointLight!==!0&&H.updateMatrices(q,p);const ie=(H.camera.layers.mask&4294967294)!==0?H.camera.layers:p.layers;for(let Ae=0;Ae<j;Ae++){const Ne=H.getCamera(Ae);if(q.isPointLight){const k=H.camera,he=H.matrix,Se=q.distance||k.far;Se!==k.far&&(k.far=Se,k.updateProjectionMatrix()),an.setFromMatrixPosition(q.matrixWorld),k.position.copy(an),Gn.copy(k.position),Gn.add(ed[Ae]),k.up.copy(td[Ae]),k.lookAt(Gn),k.updateMatrixWorld(),he.makeTranslation(-an.x,-an.y,-an.z),da.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),H._frustum.setFromProjectionMatrix(da,k.coordinateSystem,k.reversedDepth)}if(H.map.isWebGLCubeRenderTarget)e.setRenderTarget(H.map,Ae),e.clear();else{Ae===0&&(e.setRenderTarget(H.map),e.clear());const k=H.getViewport(Ae);d.set(s.x*k.x,s.y*k.y,s.x*k.z,s.y*k.w),X.viewport(d)}i=H.getFrustum(Ae),x(o,p,Ne,q,ie,this.type)}H.isPointLightShadow!==!0&&this.type===on&&m(H,p),H.needsUpdate=!1}l=this.type,f.needsUpdate=!1,e.setRenderTarget(Y,w,O)};function m(M,o){const p=n.update(U);E.defines.VSM_SAMPLES!==M.blurSamples&&(E.defines.VSM_SAMPLES=M.blurSamples,v.defines.VSM_SAMPLES=M.blurSamples,E.needsUpdate=!0,v.needsUpdate=!0),M.mapPass===null?M.mapPass=new wt(c.x,c.y,{format:Jt,type:yt}):(M.mapPass.width!==M.map.width||M.mapPass.height!==M.map.height)&&M.mapPass.setSize(M.map.width,M.map.height),E.uniforms.shadow_pass.value=M.map.depthTexture,E.uniforms.resolution.value.set(M.map.width,M.map.height),E.uniforms.radius.value=M.radius,e.setRenderTarget(M.mapPass),e.clear(),e.renderBufferDirect(o,null,p,E,U,null),v.uniforms.shadow_pass.value=M.mapPass.texture,v.uniforms.resolution.value.set(M.map.width,M.map.height),v.uniforms.radius.value=M.radius,e.setRenderTarget(M.map),e.clear(),e.renderBufferDirect(o,null,p,v,U,null)}function D(M,o,p,Y){let w=null;const O=p.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(O!==void 0)w=O;else if(w=p.isPointLight===!0?N:_,e.localClippingEnabled&&o.clipShadows===!0&&Array.isArray(o.clippingPlanes)&&o.clippingPlanes.length!==0||o.displacementMap&&o.displacementScale!==0||o.alphaMap&&o.alphaTest>0||o.map&&o.alphaTest>0||o.alphaToCoverage===!0){const X=w.uuid,Z=o.uuid;let A=S[X];A===void 0&&(A={},S[X]=A);let Q=A[Z];Q===void 0&&(Q=w.clone(),A[Z]=Q,o.addEventListener("dispose",C)),w=Q}if(w.visible=o.visible,w.wireframe=o.wireframe,Y===on?w.side=o.shadowSide!==null?o.shadowSide:o.side:w.side=o.shadowSide!==null?o.shadowSide:y[o.side],w.alphaMap=o.alphaMap,w.alphaTest=o.alphaToCoverage===!0?.5:o.alphaTest,w.map=o.map,w.clipShadows=o.clipShadows,w.clippingPlanes=o.clippingPlanes,w.clipIntersection=o.clipIntersection,w.displacementMap=o.displacementMap,w.displacementScale=o.displacementScale,w.displacementBias=o.displacementBias,w.wireframeLinewidth=o.wireframeLinewidth,w.linewidth=o.linewidth,p.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const X=e.properties.get(w);X.light=p}return w}function x(M,o,p,Y,w,O){if(M.visible===!1)return;if(M.layers.test(w)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&O===on)&&(!M.frustumCulled||M.intersectsFrustum(i))){M.modelViewMatrix.multiplyMatrices(p.matrixWorldInverse,M.matrixWorld);const A=n.update(M),Q=M.material;if(Array.isArray(Q)){const q=A.groups;for(let H=0,fe=q.length;H<fe;H++){const K=q[H],j=Q[K.materialIndex];if(j&&j.visible){const ie=D(M,j,Y,O);M.onBeforeShadow(e,M,o,p,A,ie,K),e.renderBufferDirect(p,null,A,ie,M,K),M.onAfterShadow(e,M,o,p,A,ie,K)}}}else if(Q.visible){const q=D(M,Q,Y,O);M.onBeforeShadow(e,M,o,p,A,q,null),e.renderBufferDirect(p,null,A,q,M,null),M.onAfterShadow(e,M,o,p,A,q,null)}}const Z=M.children;for(let A=0,Q=Z.length;A<Q;A++)x(Z[A],o,p,Y,w,O)}function C(M){M.target.removeEventListener("dispose",C);for(const p in S){const Y=S[p],w=M.target.uuid;w in Y&&(Y[w].dispose(),delete Y[w])}}}function id(e,n){function t(){let h=!1;const V=new gt;let F=null;const re=new gt(0,0,0,0);return{setMask:function(ee){F!==ee&&!h&&(e.colorMask(ee,ee,ee,ee),F=ee)},setLocked:function(ee){h=ee},setClear:function(ee,ne,Me,De,J){J===!0&&(ee*=De,ne*=De,Me*=De),V.set(ee,ne,Me,De),re.equals(V)===!1&&(e.clearColor(ee,ne,Me,De),re.copy(V))},reset:function(){h=!1,F=null,re.set(-1,0,0,0)}}}function i(){let h=!1,V=!1,F=null,re=null,ee=null;return{setReversed:function(ne){if(V!==ne){const Me=n.get("EXT_clip_control");ne?Me.clipControlEXT(Me.LOWER_LEFT_EXT,Me.ZERO_TO_ONE_EXT):Me.clipControlEXT(Me.LOWER_LEFT_EXT,Me.NEGATIVE_ONE_TO_ONE_EXT),V=ne;const De=ee;ee=null,this.setClear(De)}},getReversed:function(){return V},setTest:function(ne){ne?me(e.DEPTH_TEST):Ue(e.DEPTH_TEST)},setMask:function(ne){F!==ne&&!h&&(e.depthMask(ne),F=ne)},setFunc:function(ne){if(V&&(ne=So[ne]),re!==ne){switch(ne){case Zr:e.depthFunc(e.NEVER);break;case qr:e.depthFunc(e.ALWAYS);break;case Yr:e.depthFunc(e.LESS);break;case oi:e.depthFunc(e.LEQUAL);break;case Kr:e.depthFunc(e.EQUAL);break;case Xr:e.depthFunc(e.GEQUAL);break;case zr:e.depthFunc(e.GREATER);break;case kr:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}re=ne}},setLocked:function(ne){h=ne},setClear:function(ne){ee!==ne&&(ee=ne,V&&(ne=1-ne),e.clearDepth(ne))},reset:function(){h=!1,F=null,re=null,ee=null,V=!1}}}function c(){let h=!1,V=null,F=null,re=null,ee=null,ne=null,Me=null,De=null,J=null;return{setTest:function(xe){h||(xe?me(e.STENCIL_TEST):Ue(e.STENCIL_TEST))},setMask:function(xe){V!==xe&&!h&&(e.stencilMask(xe),V=xe)},setFunc:function(xe,Le,de){(F!==xe||re!==Le||ee!==de)&&(e.stencilFunc(xe,Le,de),F=xe,re=Le,ee=de)},setOp:function(xe,Le,de){(ne!==xe||Me!==Le||De!==de)&&(e.stencilOp(xe,Le,de),ne=xe,Me=Le,De=de)},setLocked:function(xe){h=xe},setClear:function(xe){J!==xe&&(e.clearStencil(xe),J=xe)},reset:function(){h=!1,V=null,F=null,re=null,ee=null,ne=null,Me=null,De=null,J=null}}}const s=new t,d=new i,_=new c;let N={};const S=new WeakMap;let W={},y={},E={},v=new WeakMap,L=[],U=null,f=!1,l=null,m=null,D=null,x=null,C=null,M=null,o=null,p=new Qe(0,0,0),Y=0,w=!1,O=null,X=null,Z=null,A=null,Q=null;const q=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,fe=0;const K=e.getParameter(e.VERSION);K.indexOf("WebGL")!==-1?(fe=parseFloat(/^WebGL (\d)/.exec(K)[1]),H=fe>=1):K.indexOf("OpenGL ES")!==-1&&(fe=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),H=fe>=2);let j=null,ie={};const Ae=e.getParameter(e.SCISSOR_BOX),Ne=e.getParameter(e.VIEWPORT),k=new gt().fromArray(Ae),he=new gt().fromArray(Ne);function Se(h,V,F,re){const ee=new Uint8Array(4),ne=e.createTexture();e.bindTexture(h,ne),e.texParameteri(h,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(h,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let Me=0;Me<F;Me++)h===e.TEXTURE_3D||h===e.TEXTURE_2D_ARRAY?e.texImage3D(V,0,e.RGBA,1,1,re,0,e.RGBA,e.UNSIGNED_BYTE,ee):e.texImage2D(V+Me,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,ee);return ne}const Re={};Re[e.TEXTURE_2D]=Se(e.TEXTURE_2D,e.TEXTURE_2D,1),Re[e.TEXTURE_CUBE_MAP]=Se(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),Re[e.TEXTURE_2D_ARRAY]=Se(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),Re[e.TEXTURE_3D]=Se(e.TEXTURE_3D,e.TEXTURE_3D,1,1),s.setClear(0,0,0,1),d.setClear(1),_.setClear(0),me(e.DEPTH_TEST),d.setFunc(oi),mt(!1),Je(li),me(e.CULL_FACE),ct(Zt);function me(h){W[h]!==!0&&(e.enable(h),W[h]=!0)}function Ue(h){W[h]!==!1&&(e.disable(h),W[h]=!1)}function ht(h,V){return E[h]!==V?(e.bindFramebuffer(h,V),E[h]=V,h===e.DRAW_FRAMEBUFFER&&(E[e.FRAMEBUFFER]=V),h===e.FRAMEBUFFER&&(E[e.DRAW_FRAMEBUFFER]=V),!0):!1}function be(h,V){let F=L,re=!1;if(h){F=v.get(V),F===void 0&&(F=[],v.set(V,F));const ee=h.textures;if(F.length!==ee.length||F[0]!==e.COLOR_ATTACHMENT0){for(let ne=0,Me=ee.length;ne<Me;ne++)F[ne]=e.COLOR_ATTACHMENT0+ne;F.length=ee.length,re=!0}}else F[0]!==e.BACK&&(F[0]=e.BACK,re=!0);re&&e.drawBuffers(F)}function Ye(h){return U!==h?(e.useProgram(h),U=h,!0):!1}const ke={[nn]:e.FUNC_ADD,[sr]:e.FUNC_SUBTRACT,[or]:e.FUNC_REVERSE_SUBTRACT};ke[Eo]=e.MIN,ke[Mo]=e.MAX;const Ie={[xr]:e.ZERO,[Mr]:e.ONE,[Er]:e.SRC_COLOR,[Sr]:e.SRC_ALPHA,[vr]:e.SRC_ALPHA_SATURATE,[gr]:e.DST_COLOR,[_r]:e.DST_ALPHA,[mr]:e.ONE_MINUS_SRC_COLOR,[hr]:e.ONE_MINUS_SRC_ALPHA,[pr]:e.ONE_MINUS_DST_COLOR,[ur]:e.ONE_MINUS_DST_ALPHA,[dr]:e.CONSTANT_COLOR,[fr]:e.ONE_MINUS_CONSTANT_COLOR,[cr]:e.CONSTANT_ALPHA,[lr]:e.ONE_MINUS_CONSTANT_ALPHA};function ct(h,V,F,re,ee,ne,Me,De,J,xe){if(h===Zt){f===!0&&(Ue(e.BLEND),f=!1);return}if(f===!1&&(me(e.BLEND),f=!0),h!==Jr){if(h!==l||xe!==w){if((m!==nn||C!==nn)&&(e.blendEquation(e.FUNC_ADD),m=nn,C=nn),xe)switch(h){case Sn:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case di:e.blendFunc(e.ONE,e.ONE);break;case fi:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case ci:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:$e("WebGLState: Invalid blending: ",h);break}else switch(h){case Sn:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case di:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case fi:$e("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ci:$e("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:$e("WebGLState: Invalid blending: ",h);break}D=null,x=null,M=null,o=null,p.set(0,0,0),Y=0,l=h,w=xe}return}ee=ee||V,ne=ne||F,Me=Me||re,(V!==m||ee!==C)&&(e.blendEquationSeparate(ke[V],ke[ee]),m=V,C=ee),(F!==D||re!==x||ne!==M||Me!==o)&&(e.blendFuncSeparate(Ie[F],Ie[re],Ie[ne],Ie[Me]),D=F,x=re,M=ne,o=Me),(De.equals(p)===!1||J!==Y)&&(e.blendColor(De.r,De.g,De.b,J),p.copy(De),Y=J),l=h,w=!1}function nt(h,V){h.side===Nt?Ue(e.CULL_FACE):me(e.CULL_FACE);let F=h.side===St;V&&(F=!F),mt(F),h.blending===Sn&&h.transparent===!1?ct(Zt):ct(h.blending,h.blendEquation,h.blendSrc,h.blendDst,h.blendEquationAlpha,h.blendSrcAlpha,h.blendDstAlpha,h.blendColor,h.blendAlpha,h.premultipliedAlpha),d.setFunc(h.depthFunc),d.setTest(h.depthTest),d.setMask(h.depthWrite),s.setMask(h.colorWrite);const re=h.stencilWrite;_.setTest(re),re&&(_.setMask(h.stencilWriteMask),_.setFunc(h.stencilFunc,h.stencilRef,h.stencilFuncMask),_.setOp(h.stencilFail,h.stencilZFail,h.stencilZPass)),ot(h.polygonOffset,h.polygonOffsetFactor,h.polygonOffsetUnits),h.alphaToCoverage===!0?me(e.SAMPLE_ALPHA_TO_COVERAGE):Ue(e.SAMPLE_ALPHA_TO_COVERAGE)}function mt(h){O!==h&&(h?e.frontFace(e.CW):e.frontFace(e.CCW),O=h)}function Je(h){h!==$r?(me(e.CULL_FACE),h!==X&&(h===li?e.cullFace(e.BACK):h===Qr?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):Ue(e.CULL_FACE),X=h}function Ct(h){h!==Z&&(H&&e.lineWidth(h),Z=h)}function ot(h,V,F){h?(me(e.POLYGON_OFFSET_FILL),(A!==V||Q!==F)&&(A=V,Q=F,d.getReversed()&&(V=-V,F=-F),e.polygonOffset(V,F))):Ue(e.POLYGON_OFFSET_FILL)}function Et(h){h?me(e.SCISSOR_TEST):Ue(e.SCISSOR_TEST)}function Mt(h){h===void 0&&(h=e.TEXTURE0+q-1),j!==h&&(e.activeTexture(h),j=h)}function xt(h,V,F){F===void 0&&(j===null?F=e.TEXTURE0+q-1:F=j);let re=ie[F];re===void 0&&(re={type:void 0,texture:void 0},ie[F]=re),(re.type!==h||re.texture!==V)&&(j!==F&&(e.activeTexture(F),j=F),e.bindTexture(h,V||Re[h]),re.type=h,re.texture=V)}function T(){const h=ie[j];h!==void 0&&h.type!==void 0&&(e.bindTexture(h.type,null),h.type=void 0,h.texture=void 0)}function Tt(){try{e.compressedTexImage2D(...arguments)}catch(h){$e("WebGLState:",h)}}function qe(){try{e.compressedTexImage3D(...arguments)}catch(h){$e("WebGLState:",h)}}function Ze(){try{e.texSubImage2D(...arguments)}catch(h){$e("WebGLState:",h)}}function ce(){try{e.texSubImage3D(...arguments)}catch(h){$e("WebGLState:",h)}}function it(){try{e.compressedTexSubImage2D(...arguments)}catch(h){$e("WebGLState:",h)}}function Te(){try{e.compressedTexSubImage3D(...arguments)}catch(h){$e("WebGLState:",h)}}function Ce(){try{e.texStorage2D(...arguments)}catch(h){$e("WebGLState:",h)}}function u(){try{e.texStorage3D(...arguments)}catch(h){$e("WebGLState:",h)}}function a(){try{e.texImage2D(...arguments)}catch(h){$e("WebGLState:",h)}}function b(){try{e.texImage3D(...arguments)}catch(h){$e("WebGLState:",h)}}function $(h){return y[h]!==void 0?y[h]:e.getParameter(h)}function z(h,V){y[h]!==V&&(e.pixelStorei(h,V),y[h]=V)}function te(h){k.equals(h)===!1&&(e.scissor(h.x,h.y,h.z,h.w),k.copy(h))}function se(h){he.equals(h)===!1&&(e.viewport(h.x,h.y,h.z,h.w),he.copy(h))}function B(h,V){let F=S.get(V);F===void 0&&(F=new WeakMap,S.set(V,F));let re=F.get(h);re===void 0&&(re=e.getUniformBlockIndex(V,h.name),e.uniformBlockBinding(V,re,re),F.set(h,re))}function G(h,V,F){const ee=S.get(V).get(h);N[ee]!==F&&(e.bindBufferBase(e.UNIFORM_BUFFER,ee,F),N[ee]=F)}function ae(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),d.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),W={},y={},j=null,ie={},E={},N={},v=new WeakMap,L=[],U=null,f=!1,l=null,m=null,D=null,x=null,C=null,M=null,o=null,p=new Qe(0,0,0),Y=0,w=!1,O=null,X=null,Z=null,A=null,Q=null,k.set(0,0,e.canvas.width,e.canvas.height),he.set(0,0,e.canvas.width,e.canvas.height),s.reset(),d.reset(),_.reset()}return{buffers:{color:s,depth:d,stencil:_},enable:me,disable:Ue,bindFramebuffer:ht,drawBuffers:be,useProgram:Ye,setBlending:ct,setMaterial:nt,setFlipSided:mt,setCullFace:Je,setLineWidth:Ct,setPolygonOffset:ot,setScissorTest:Et,activeTexture:Mt,bindTexture:xt,unbindTexture:T,compressedTexImage2D:Tt,compressedTexImage3D:qe,texImage2D:a,texImage3D:b,pixelStorei:z,getParameter:$,updateUBOMapping:B,uniformBlockBinding:G,texStorage2D:Ce,texStorage3D:u,texSubImage2D:Ze,texSubImage3D:ce,compressedTexSubImage2D:it,compressedTexSubImage3D:Te,scissor:te,viewport:se,reset:ae}}function ad(e,n,t,i,c,s,d){const _=n.has("WEBGL_multisampled_render_to_texture")?n.get("WEBGL_multisampled_render_to_texture"):null,N=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),S=new vt,W=new WeakMap,y=new Set;let E;const v=new WeakMap,L=new Set,U=new FinalizationRegistry(u=>L.delete(u));let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function l(u,a){return f?new OffscreenCanvas(u,a):po("canvas")}function m(u,a,b){let $=1;const z=Ce(u);if((z.width>b||z.height>b)&&($=b/Math.max(z.width,z.height)),$<1)if(typeof HTMLImageElement<"u"&&u instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&u instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&u instanceof ImageBitmap||typeof VideoFrame<"u"&&u instanceof VideoFrame){const te=Math.floor($*z.width),se=Math.floor($*z.height);E===void 0&&(E=l(te,se));const B=a?l(te,se):E;return B.width=te,B.height=se,B.getContext("2d").drawImage(u,0,0,te,se),We("WebGLRenderer: Texture has been resized from ("+z.width+"x"+z.height+") to ("+te+"x"+se+")."),B}else return"data"in u&&We("WebGLRenderer: Image in DataTexture is too big ("+z.width+"x"+z.height+")."),u;return u}function D(u){return u.generateMipmaps}function x(u){e.generateMipmap(u)}function C(u){return u.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:u.isWebGL3DRenderTarget?e.TEXTURE_3D:u.isWebGLArrayRenderTarget||u.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function M(u,a,b,$,z,te=!1){if(u!==null){if(e[u]!==void 0)return e[u];We("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+u+"'")}let se;$&&(se=n.get("EXT_texture_norm16"),se||We("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let B=a;if(a===e.RED&&(b===e.FLOAT&&(B=e.R32F),b===e.HALF_FLOAT&&(B=e.R16F),b===e.UNSIGNED_BYTE&&(B=e.R8),b===e.UNSIGNED_SHORT&&se&&(B=se.R16_EXT),b===e.SHORT&&se&&(B=se.R16_SNORM_EXT)),a===e.RED_INTEGER&&(b===e.UNSIGNED_BYTE&&(B=e.R8UI),b===e.UNSIGNED_SHORT&&(B=e.R16UI),b===e.UNSIGNED_INT&&(B=e.R32UI),b===e.BYTE&&(B=e.R8I),b===e.SHORT&&(B=e.R16I),b===e.INT&&(B=e.R32I)),a===e.RG&&(b===e.FLOAT&&(B=e.RG32F),b===e.HALF_FLOAT&&(B=e.RG16F),b===e.UNSIGNED_BYTE&&(B=e.RG8),b===e.UNSIGNED_SHORT&&se&&(B=se.RG16_EXT),b===e.SHORT&&se&&(B=se.RG16_SNORM_EXT)),a===e.RG_INTEGER&&(b===e.UNSIGNED_BYTE&&(B=e.RG8UI),b===e.UNSIGNED_SHORT&&(B=e.RG16UI),b===e.UNSIGNED_INT&&(B=e.RG32UI),b===e.BYTE&&(B=e.RG8I),b===e.SHORT&&(B=e.RG16I),b===e.INT&&(B=e.RG32I)),a===e.RGB_INTEGER&&(b===e.UNSIGNED_BYTE&&(B=e.RGB8UI),b===e.UNSIGNED_SHORT&&(B=e.RGB16UI),b===e.UNSIGNED_INT&&(B=e.RGB32UI),b===e.BYTE&&(B=e.RGB8I),b===e.SHORT&&(B=e.RGB16I),b===e.INT&&(B=e.RGB32I)),a===e.RGBA_INTEGER&&(b===e.UNSIGNED_BYTE&&(B=e.RGBA8UI),b===e.UNSIGNED_SHORT&&(B=e.RGBA16UI),b===e.UNSIGNED_INT&&(B=e.RGBA32UI),b===e.BYTE&&(B=e.RGBA8I),b===e.SHORT&&(B=e.RGBA16I),b===e.INT&&(B=e.RGBA32I)),a===e.RGB&&(b===e.UNSIGNED_SHORT&&se&&(B=se.RGB16_EXT),b===e.SHORT&&se&&(B=se.RGB16_SNORM_EXT),b===e.UNSIGNED_INT_5_9_9_9_REV&&(B=e.RGB9_E5),b===e.UNSIGNED_INT_10F_11F_11F_REV&&(B=e.R11F_G11F_B10F)),a===e.RGBA){const G=te?La:et.getTransfer(z);b===e.FLOAT&&(B=e.RGBA32F),b===e.HALF_FLOAT&&(B=e.RGBA16F),b===e.UNSIGNED_BYTE&&(B=G===Ke?e.SRGB8_ALPHA8:e.RGBA8),b===e.UNSIGNED_SHORT&&se&&(B=se.RGBA16_EXT),b===e.SHORT&&se&&(B=se.RGBA16_SNORM_EXT),b===e.UNSIGNED_SHORT_4_4_4_4&&(B=e.RGBA4),b===e.UNSIGNED_SHORT_5_5_5_1&&(B=e.RGB5_A1)}return(B===e.R16F||B===e.R32F||B===e.RG16F||B===e.RG32F||B===e.RGBA16F||B===e.RGBA32F)&&n.get("EXT_color_buffer_float"),B}function o(u,a){let b;return u?a===null||a===Yt||a===jt?b=e.DEPTH24_STENCIL8:a===Bt?b=e.DEPTH32F_STENCIL8:a===Mn&&(b=e.DEPTH24_STENCIL8,We("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):a===null||a===Yt||a===jt?b=e.DEPTH_COMPONENT24:a===Bt?b=e.DEPTH_COMPONENT32F:a===Mn&&(b=e.DEPTH_COMPONENT16),b}function p(u,a){return D(u)===!0||u.isFramebufferTexture&&u.minFilter!==zt&&u.minFilter!==bt?Math.log2(Math.max(a.width,a.height))+1:u.mipmaps.length>0?u.mipmaps.length:u.isCompressedTexture&&Array.isArray(u.image)?a.mipmaps.length:1}function Y(u){const a=new WeakRef(u);i.get(u).__ref=a,L.add(a),U.register(u,a,a)}function w(u){const a=i.get(u).__ref;a!==void 0&&(L.delete(a),U.unregister(a))}function O(u){Z(u.target)}function X(u){A(u.target)}function Z(u){u.removeEventListener("dispose",O),w(u),q(u),u.isVideoTexture&&W.delete(u),u.isHTMLTexture&&y.delete(u)}function A(u){u.removeEventListener("dispose",X),w(u),fe(u)}function Q(){for(const u of L){const a=u.deref();a!==void 0&&(a.isRenderTarget===!0?A(a):Z(a))}L.clear(),y.clear()}function q(u){const a=i.get(u);if(a.__webglInit===void 0)return;const b=u.source,$=v.get(b);if($){const z=$[a.__cacheKey];z.usedTimes--,z.usedTimes===0&&H(u),Object.keys($).length===0&&v.delete(b)}i.remove(u)}function H(u){const a=i.get(u);e.deleteTexture(a.__webglTexture);const b=u.source,$=v.get(b);delete $[a.__cacheKey],d.memory.textures--}function fe(u){const a=i.get(u);a.__depthDisposeCallback&&a.__depthDisposeCallback();const b=u.depthTexture;if(b&&b.renderTarget===u&&Z(b),u.isWebGLCubeRenderTarget)for(let z=0;z<6;z++){if(Array.isArray(a.__webglFramebuffer[z]))for(let te=0;te<a.__webglFramebuffer[z].length;te++)e.deleteFramebuffer(a.__webglFramebuffer[z][te]);else e.deleteFramebuffer(a.__webglFramebuffer[z]);a.__webglDepthbuffer&&e.deleteRenderbuffer(a.__webglDepthbuffer[z])}else{if(Array.isArray(a.__webglFramebuffer))for(let z=0;z<a.__webglFramebuffer.length;z++)e.deleteFramebuffer(a.__webglFramebuffer[z]);else e.deleteFramebuffer(a.__webglFramebuffer);if(a.__webglDepthbuffer&&e.deleteRenderbuffer(a.__webglDepthbuffer),a.__webglMultisampledFramebuffer&&e.deleteFramebuffer(a.__webglMultisampledFramebuffer),a.__webglColorRenderbuffer)for(let z=0;z<a.__webglColorRenderbuffer.length;z++)a.__webglColorRenderbuffer[z]&&e.deleteRenderbuffer(a.__webglColorRenderbuffer[z]);a.__webglDepthRenderbuffer&&e.deleteRenderbuffer(a.__webglDepthRenderbuffer)}const $=u.textures;for(let z=0,te=$.length;z<te;z++){const se=i.get($[z]);se.__webglTexture&&(e.deleteTexture(se.__webglTexture),d.memory.textures--),i.remove($[z])}i.remove(u)}let K=0;function j(){K=0}function ie(){return K}function Ae(u){K=u}function Ne(){const u=K;return u>=c.maxTextures&&We("WebGLTextures: Trying to use "+(u+1)+" texture units while this GPU supports only "+c.maxTextures),K+=1,u}function k(u){const a=[];return a.push(u.wrapS),a.push(u.wrapT),a.push(u.wrapR||0),a.push(u.magFilter),a.push(u.minFilter),a.push(u.anisotropy),a.push(u.internalFormat),a.push(u.format),a.push(u.type),a.push(u.generateMipmaps),a.push(u.mipmapsAutoUpdate),a.push(u.premultiplyAlpha),a.push(u.flipY),a.push(u.unpackAlignment),a.push(u.colorSpace),a.join()}function he(u,a){const b=i.get(u);if(u.isVideoTexture&&it(u),u.isRenderTargetTexture===!1&&u.isExternalTexture!==!0&&u.version>0&&b.__version!==u.version){const $=u.image;if($===null)We("WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)We("WebGLRenderer: Texture marked for update but image is incomplete");else{nt(b,u,a);return}}else u.isExternalTexture&&(b.__webglTexture=u.sourceTexture?u.sourceTexture:null);t.bindTexture(e.TEXTURE_2D,b.__webglTexture,e.TEXTURE0+a)}function Se(u,a){const b=i.get(u);if(u.isRenderTargetTexture===!1&&u.version>0&&b.__version!==u.version){nt(b,u,a);return}else u.isExternalTexture&&(b.__webglTexture=u.sourceTexture?u.sourceTexture:null);t.bindTexture(e.TEXTURE_2D_ARRAY,b.__webglTexture,e.TEXTURE0+a)}function Re(u,a){const b=i.get(u);if(u.isRenderTargetTexture===!1&&u.version>0&&b.__version!==u.version){nt(b,u,a);return}t.bindTexture(e.TEXTURE_3D,b.__webglTexture,e.TEXTURE0+a)}function me(u,a){const b=i.get(u);if(u.version>0&&b.__version!==u.version){mt(b,u,a);return}t.bindTexture(e.TEXTURE_CUBE_MAP,b.__webglTexture,e.TEXTURE0+a)}const Ue={[Ar]:e.REPEAT,[Hn]:e.CLAMP_TO_EDGE,[Tr]:e.MIRRORED_REPEAT},ht={[zt]:e.NEAREST,[Rr]:e.NEAREST_MIPMAP_NEAREST,[mn]:e.NEAREST_MIPMAP_LINEAR,[bt]:e.LINEAR,[Ln]:e.LINEAR_MIPMAP_NEAREST,[kt]:e.LINEAR_MIPMAP_LINEAR},be={[Dr]:e.NEVER,[ma]:e.ALWAYS,[Lr]:e.LESS,[ha]:e.LEQUAL,[Pr]:e.EQUAL,[pa]:e.GEQUAL,[Cr]:e.GREATER,[br]:e.NOTEQUAL};function Ye(u,a){if(a.type===Bt&&n.has("OES_texture_float_linear")===!1&&(a.magFilter===bt||a.magFilter===Ln||a.magFilter===mn||a.magFilter===kt||a.minFilter===bt||a.minFilter===Ln||a.minFilter===mn||a.minFilter===kt)&&We("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(u,e.TEXTURE_WRAP_S,Ue[a.wrapS]),e.texParameteri(u,e.TEXTURE_WRAP_T,Ue[a.wrapT]),(u===e.TEXTURE_3D||u===e.TEXTURE_2D_ARRAY)&&e.texParameteri(u,e.TEXTURE_WRAP_R,Ue[a.wrapR]),e.texParameteri(u,e.TEXTURE_MAG_FILTER,ht[a.magFilter]),e.texParameteri(u,e.TEXTURE_MIN_FILTER,ht[a.minFilter]),a.compareFunction&&(e.texParameteri(u,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(u,e.TEXTURE_COMPARE_FUNC,be[a.compareFunction])),n.has("EXT_texture_filter_anisotropic")===!0){if(a.magFilter===zt||a.minFilter!==mn&&a.minFilter!==kt||a.type===Bt&&n.has("OES_texture_float_linear")===!1)return;if(a.anisotropy>1||i.get(a).__currentAnisotropy){const b=n.get("EXT_texture_filter_anisotropic");e.texParameterf(u,b.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,c.getMaxAnisotropy())),i.get(a).__currentAnisotropy=a.anisotropy}}}function ke(u,a){let b=!1;u.__webglInit===void 0&&(u.__webglInit=!0,a.addEventListener("dispose",O),Y(a));const $=a.source;let z=v.get($);z===void 0&&(z={},v.set($,z));const te=k(a);if(te!==u.__cacheKey){z[te]===void 0&&(z[te]={texture:e.createTexture(),usedTimes:0},d.memory.textures++,b=!0),z[te].usedTimes++;const se=z[u.__cacheKey];se!==void 0&&(z[u.__cacheKey].usedTimes--,se.usedTimes===0&&H(a)),u.__cacheKey=te,u.__webglTexture=z[te].texture}return b}function Ie(u,a,b){return Math.floor(Math.floor(u/b)/a)}function ct(u,a,b,$){const te=u.updateRanges;if(te.length===0)t.texSubImage2D(e.TEXTURE_2D,0,0,0,a.width,a.height,b,$,a.data);else{te.sort((h,V)=>h.start-V.start);let se=0;for(let h=1;h<te.length;h++){const V=te[se],F=te[h],re=V.start+V.count,ee=Ie(F.start,a.width,4),ne=Ie(V.start,a.width,4);F.start<=re+1&&ee===ne&&Ie(F.start+F.count-1,a.width,4)===ee?V.count=Math.max(V.count,F.start+F.count-V.start):(++se,te[se]=F)}te.length=se+1;const B=t.getParameter(e.UNPACK_ROW_LENGTH),G=t.getParameter(e.UNPACK_SKIP_PIXELS),ae=t.getParameter(e.UNPACK_SKIP_ROWS);t.pixelStorei(e.UNPACK_ROW_LENGTH,a.width);for(let h=0,V=te.length;h<V;h++){const F=te[h],re=Math.floor(F.start/4),ee=Math.ceil(F.count/4),ne=re%a.width,Me=Math.floor(re/a.width),De=ee,J=1;t.pixelStorei(e.UNPACK_SKIP_PIXELS,ne),t.pixelStorei(e.UNPACK_SKIP_ROWS,Me),t.texSubImage2D(e.TEXTURE_2D,0,ne,Me,De,J,b,$,a.data)}u.clearUpdateRanges(),t.pixelStorei(e.UNPACK_ROW_LENGTH,B),t.pixelStorei(e.UNPACK_SKIP_PIXELS,G),t.pixelStorei(e.UNPACK_SKIP_ROWS,ae)}}function nt(u,a,b){let $=e.TEXTURE_2D;(a.isDataArrayTexture||a.isCompressedArrayTexture)&&($=e.TEXTURE_2D_ARRAY),a.isData3DTexture&&($=e.TEXTURE_3D);const z=ke(u,a),te=a.source;t.bindTexture($,u.__webglTexture,e.TEXTURE0+b);const se=i.get(te);if(te.version!==se.__version||z===!0){if(t.activeTexture(e.TEXTURE0+b),(typeof ImageBitmap<"u"&&a.image instanceof ImageBitmap)===!1){const J=et.getPrimaries(et.workingColorSpace),xe=a.colorSpace===qt?null:et.getPrimaries(a.colorSpace),Le=a.colorSpace===qt||J===xe?e.NONE:e.BROWSER_DEFAULT_WEBGL;t.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,a.flipY),t.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultiplyAlpha),t.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Le)}t.pixelStorei(e.UNPACK_ALIGNMENT,a.unpackAlignment);let G=m(a.image,!1,c.maxTextureSize);G=Te(a,G);const ae=s.convert(a.format,a.colorSpace),h=s.convert(a.type);let V=M(a.internalFormat,ae,h,a.normalized,a.colorSpace,a.isVideoTexture);Ye($,a);let F;const re=a.mipmaps,ee=a.isVideoTexture!==!0,ne=se.__version===void 0||z===!0,Me=te.dataReady,De=p(a,G);if(a.isDepthTexture)V=o(a.format===Xt,a.type),ne&&(ee?t.texStorage2D(e.TEXTURE_2D,1,V,G.width,G.height):t.texImage2D(e.TEXTURE_2D,0,V,G.width,G.height,0,ae,h,null));else if(a.isDataTexture)if(re.length>0){ee&&ne&&t.texStorage2D(e.TEXTURE_2D,De,V,re[0].width,re[0].height);for(let J=0,xe=re.length;J<xe;J++)F=re[J],ee?Me&&t.texSubImage2D(e.TEXTURE_2D,J,0,0,F.width,F.height,ae,h,F.data):t.texImage2D(e.TEXTURE_2D,J,V,F.width,F.height,0,ae,h,F.data);a.generateMipmaps=!1}else ee?(ne&&t.texStorage2D(e.TEXTURE_2D,De,V,G.width,G.height),Me&&ct(a,G,ae,h)):t.texImage2D(e.TEXTURE_2D,0,V,G.width,G.height,0,ae,h,G.data);else if(a.isCompressedTexture)if(a.isCompressedArrayTexture){ee&&ne&&t.texStorage3D(e.TEXTURE_2D_ARRAY,De,V,re[0].width,re[0].height,G.depth);for(let J=0,xe=re.length;J<xe;J++)if(F=re[J],a.format!==Gt)if(ae!==null)if(ee){if(Me)if(a.layerUpdates.size>0){const Le=ki(F.width,F.height,a.format,a.type);for(const de of a.layerUpdates){const Ve=F.data.subarray(de*Le/F.data.BYTES_PER_ELEMENT,(de+1)*Le/F.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,J,0,0,de,F.width,F.height,1,ae,Ve)}}else t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,J,0,0,0,F.width,F.height,G.depth,ae,F.data)}else t.compressedTexImage3D(e.TEXTURE_2D_ARRAY,J,V,F.width,F.height,G.depth,0,F.data,0,0);else We("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ee?Me&&t.texSubImage3D(e.TEXTURE_2D_ARRAY,J,0,0,0,F.width,F.height,G.depth,ae,h,F.data):t.texImage3D(e.TEXTURE_2D_ARRAY,J,V,F.width,F.height,G.depth,0,ae,h,F.data);a.layerUpdates.size>0&&a.clearLayerUpdates()}else{ee&&ne&&t.texStorage2D(e.TEXTURE_2D,De,V,re[0].width,re[0].height);for(let J=0,xe=re.length;J<xe;J++)F=re[J],a.format!==Gt?ae!==null?ee?Me&&t.compressedTexSubImage2D(e.TEXTURE_2D,J,0,0,F.width,F.height,ae,F.data):t.compressedTexImage2D(e.TEXTURE_2D,J,V,F.width,F.height,0,F.data):We("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ee?Me&&t.texSubImage2D(e.TEXTURE_2D,J,0,0,F.width,F.height,ae,h,F.data):t.texImage2D(e.TEXTURE_2D,J,V,F.width,F.height,0,ae,h,F.data)}else if(a.isDataArrayTexture)if(ee){if(ne&&t.texStorage3D(e.TEXTURE_2D_ARRAY,De,V,G.width,G.height,G.depth),Me)if(a.layerUpdates.size>0){const J=ki(G.width,G.height,a.format,a.type);for(const xe of a.layerUpdates){const Le=G.data.subarray(xe*J/G.data.BYTES_PER_ELEMENT,(xe+1)*J/G.data.BYTES_PER_ELEMENT);t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,xe,G.width,G.height,1,ae,h,Le)}a.clearLayerUpdates()}else t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,G.width,G.height,G.depth,ae,h,G.data)}else t.texImage3D(e.TEXTURE_2D_ARRAY,0,V,G.width,G.height,G.depth,0,ae,h,G.data);else if(a.isData3DTexture)ee?(ne&&t.texStorage3D(e.TEXTURE_3D,De,V,G.width,G.height,G.depth),Me&&t.texSubImage3D(e.TEXTURE_3D,0,0,0,0,G.width,G.height,G.depth,ae,h,G.data)):t.texImage3D(e.TEXTURE_3D,0,V,G.width,G.height,G.depth,0,ae,h,G.data);else if(a.isFramebufferTexture){if(ne)if(ee)t.texStorage2D(e.TEXTURE_2D,De,V,G.width,G.height);else{let J=G.width,xe=G.height;for(let Le=0;Le<De;Le++)t.texImage2D(e.TEXTURE_2D,Le,V,J,xe,0,ae,h,null),J>>=1,xe>>=1}}else if(a.isHTMLTexture){if("texElementImage2D"in e){const J=e.canvas;if(J.hasAttribute("layoutsubtree")||J.setAttribute("layoutsubtree","true"),G.parentNode!==J){J.appendChild(G),y.add(a),J.onpaint=xe=>{const Le=xe.changedElements;for(const de of y)Le.includes(de.image)&&(de.needsUpdate=!0)},J.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,G);else{const Le=e.RGBA,de=e.RGBA,Ve=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,Le,de,Ve,G)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(re.length>0){if(ee&&ne){const J=Ce(re[0]);t.texStorage2D(e.TEXTURE_2D,De,V,J.width,J.height)}for(let J=0,xe=re.length;J<xe;J++)F=re[J],ee?Me&&t.texSubImage2D(e.TEXTURE_2D,J,0,0,ae,h,F):t.texImage2D(e.TEXTURE_2D,J,V,ae,h,F);a.generateMipmaps=!1}else if(ee){if(ne){const J=Ce(G);t.texStorage2D(e.TEXTURE_2D,De,V,J.width,J.height)}Me&&t.texSubImage2D(e.TEXTURE_2D,0,0,0,ae,h,G)}else t.texImage2D(e.TEXTURE_2D,0,V,ae,h,G);D(a)&&a.mipmapsAutoUpdate===!0&&x($),se.__version=te.version,a.onUpdate&&a.onUpdate(a)}u.__version=a.version}function mt(u,a,b){if(a.image.length!==6)return;const $=ke(u,a),z=a.source;t.bindTexture(e.TEXTURE_CUBE_MAP,u.__webglTexture,e.TEXTURE0+b);const te=i.get(z);if(z.version!==te.__version||$===!0){t.activeTexture(e.TEXTURE0+b);const se=et.getPrimaries(et.workingColorSpace),B=a.colorSpace===qt?null:et.getPrimaries(a.colorSpace),G=a.colorSpace===qt||se===B?e.NONE:e.BROWSER_DEFAULT_WEBGL;t.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,a.flipY),t.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultiplyAlpha),t.pixelStorei(e.UNPACK_ALIGNMENT,a.unpackAlignment),t.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,G);const ae=a.isCompressedTexture||a.image[0].isCompressedTexture,h=a.image[0]&&a.image[0].isDataTexture,V=[];for(let de=0;de<6;de++)!ae&&!h?V[de]=m(a.image[de],!0,c.maxCubemapSize):V[de]=h?a.image[de].image:a.image[de],V[de]=Te(a,V[de]);const F=V[0],re=s.convert(a.format,a.colorSpace),ee=s.convert(a.type);let ne=M(a.internalFormat,re,ee,a.normalized,a.colorSpace);const Me=a.isVideoTexture!==!0,De=te.__version===void 0||$===!0,J=z.dataReady;let xe=p(a,F);Ye(e.TEXTURE_CUBE_MAP,a);let Le;if(a.isDepthTexture){if(ne=o(a.format===Xt,a.type),De)if(Me)t.texStorage2D(e.TEXTURE_CUBE_MAP,1,ne,F.width,F.height);else for(let de=0;de<6;de++)t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,ne,F.width,F.height,0,re,ee,null)}else if(ae){Me&&De&&t.texStorage2D(e.TEXTURE_CUBE_MAP,xe,ne,F.width,F.height);for(let de=0;de<6;de++){Le=V[de].mipmaps;for(let Ve=0;Ve<Le.length;Ve++){const st=Le[Ve];a.format!==Gt?re!==null?Me?J&&t.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve,0,0,st.width,st.height,re,st.data):t.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve,ne,st.width,st.height,0,st.data):We("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Me?J&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve,0,0,st.width,st.height,re,ee,st.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve,ne,st.width,st.height,0,re,ee,st.data)}}}else{if(Le=a.mipmaps,Me&&De){Le.length>0&&xe++;const de=Ce(V[0]);t.texStorage2D(e.TEXTURE_CUBE_MAP,xe,ne,de.width,de.height)}for(let de=0;de<6;de++)if(h){Me?J&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,V[de].width,V[de].height,re,ee,V[de].data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,ne,V[de].width,V[de].height,0,re,ee,V[de].data);for(let Ve=0;Ve<Le.length;Ve++){const Ot=Le[Ve].image[de].image;Me?J&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve+1,0,0,Ot.width,Ot.height,re,ee,Ot.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve+1,ne,Ot.width,Ot.height,0,re,ee,Ot.data)}}else{Me?J&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,re,ee,V[de]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,ne,re,ee,V[de]);for(let Ve=0;Ve<Le.length;Ve++){const st=Le[Ve];Me?J&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve+1,0,0,re,ee,st.image[de]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve+1,ne,re,ee,st.image[de])}}}D(a)&&a.mipmapsAutoUpdate===!0&&x(e.TEXTURE_CUBE_MAP),te.__version=z.version,a.onUpdate&&a.onUpdate(a)}u.__version=a.version}function Je(u,a,b,$,z,te){const se=s.convert(b.format,b.colorSpace),B=s.convert(b.type),G=M(b.internalFormat,se,B,b.normalized,b.colorSpace),ae=i.get(a),h=i.get(b);if(h.__renderTarget=a,!ae.__hasExternalTextures){const V=Math.max(1,a.width>>te),F=Math.max(1,a.height>>te);z===e.TEXTURE_3D||z===e.TEXTURE_2D_ARRAY?t.texImage3D(z,te,G,V,F,a.depth,0,se,B,null):t.texImage2D(z,te,G,V,F,0,se,B,null)}t.bindFramebuffer(e.FRAMEBUFFER,u),ce(a)?_.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,$,z,h.__webglTexture,0,Ze(a)):(z===e.TEXTURE_2D||z>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&z<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,$,z,h.__webglTexture,te),t.bindFramebuffer(e.FRAMEBUFFER,null)}function Ct(u,a,b){if(e.bindRenderbuffer(e.RENDERBUFFER,u),a.depthBuffer){const $=a.depthTexture,z=$&&$.isDepthTexture?$.type:null,te=o(a.stencilBuffer,z),se=a.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;ce(a)?_.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ze(a),te,a.width,a.height):b?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ze(a),te,a.width,a.height):e.renderbufferStorage(e.RENDERBUFFER,te,a.width,a.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,se,e.RENDERBUFFER,u)}else{const $=a.textures;for(let z=0;z<$.length;z++){const te=$[z],se=s.convert(te.format,te.colorSpace),B=s.convert(te.type),G=M(te.internalFormat,se,B,te.normalized,te.colorSpace);ce(a)?_.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ze(a),G,a.width,a.height):b?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ze(a),G,a.width,a.height):e.renderbufferStorage(e.RENDERBUFFER,G,a.width,a.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function ot(u,a,b){const $=a.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(e.FRAMEBUFFER,u),!(a.depthTexture&&a.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const z=i.get(a.depthTexture);z.__renderTarget=a;const te=$?a.depthTexture.image[0]:a.depthTexture.image;(!z.__webglTexture||te.width!==a.width||te.height!==a.height)&&(te.width=a.width,te.height=a.height,a.depthTexture.needsUpdate=!0),$?me(a.depthTexture,0):he(a.depthTexture,0);const se=z.__webglTexture,B=Ze(a),G=$?e.TEXTURE_CUBE_MAP_POSITIVE_X+b:e.TEXTURE_2D,ae=a.depthTexture.format===Xt?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(a.depthTexture.format===fn)ce(a)?_.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,ae,G,se,0,B):e.framebufferTexture2D(e.FRAMEBUFFER,ae,G,se,0);else if(a.depthTexture.format===Xt)ce(a)?_.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,ae,G,se,0,B):e.framebufferTexture2D(e.FRAMEBUFFER,ae,G,se,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Et(u){const a=i.get(u),b=u.isWebGLCubeRenderTarget===!0;if(a.__boundDepthTexture!==u.depthTexture){const $=u.depthTexture;if(a.__depthDisposeCallback&&a.__depthDisposeCallback(),$){const z=()=>{delete a.__boundDepthTexture,delete a.__depthDisposeCallback,$.removeEventListener("dispose",z)};$.addEventListener("dispose",z),a.__depthDisposeCallback=z}a.__boundDepthTexture=$}if(u.depthTexture&&!a.__autoAllocateDepthBuffer)if(b)for(let $=0;$<6;$++)ot(a.__webglFramebuffer[$],u,$);else u.texture.mipmaps.length>0?ot(a.__webglFramebuffer[0],u,0):ot(a.__webglFramebuffer,u,0);else if(b){a.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(e.FRAMEBUFFER,a.__webglFramebuffer[$]),a.__webglDepthbuffer[$]===void 0)a.__webglDepthbuffer[$]=e.createRenderbuffer(),Ct(a.__webglDepthbuffer[$],u,!1);else{const z=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,te=a.__webglDepthbuffer[$];e.bindRenderbuffer(e.RENDERBUFFER,te),e.framebufferRenderbuffer(e.FRAMEBUFFER,z,e.RENDERBUFFER,te)}}else if(u.texture.mipmaps.length>0?t.bindFramebuffer(e.FRAMEBUFFER,a.__webglFramebuffer[0]):t.bindFramebuffer(e.FRAMEBUFFER,a.__webglFramebuffer),a.__webglDepthbuffer===void 0)a.__webglDepthbuffer=e.createRenderbuffer(),Ct(a.__webglDepthbuffer,u,!1);else{const z=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,te=a.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,te),e.framebufferRenderbuffer(e.FRAMEBUFFER,z,e.RENDERBUFFER,te)}t.bindFramebuffer(e.FRAMEBUFFER,null)}function Mt(u,a,b){const $=i.get(u);a!==void 0&&Je($.__webglFramebuffer,u,u.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),b!==void 0&&Et(u)}function xt(u){const a=u.texture,b=i.get(u),$=i.get(a);u.addEventListener("dispose",X),Y(u);const z=u.textures,te=u.isWebGLCubeRenderTarget===!0,se=z.length>1;if(se||($.__webglTexture===void 0&&($.__webglTexture=e.createTexture()),$.__version=a.version,d.memory.textures++),te){b.__webglFramebuffer=[];for(let B=0;B<6;B++)if(a.mipmaps.length>0){b.__webglFramebuffer[B]=[];for(let G=0;G<a.mipmaps.length;G++)b.__webglFramebuffer[B][G]=e.createFramebuffer()}else b.__webglFramebuffer[B]=e.createFramebuffer()}else{if(a.mipmaps.length>0){b.__webglFramebuffer=[];for(let B=0;B<a.mipmaps.length;B++)b.__webglFramebuffer[B]=e.createFramebuffer()}else b.__webglFramebuffer=e.createFramebuffer();if(se)for(let B=0,G=z.length;B<G;B++){const ae=i.get(z[B]);ae.__webglTexture===void 0&&(ae.__webglTexture=e.createTexture(),d.memory.textures++)}if(u.samples>0&&ce(u)===!1){b.__webglMultisampledFramebuffer=e.createFramebuffer(),b.__webglColorRenderbuffer=[],t.bindFramebuffer(e.FRAMEBUFFER,b.__webglMultisampledFramebuffer);for(let B=0;B<z.length;B++){const G=z[B];b.__webglColorRenderbuffer[B]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,b.__webglColorRenderbuffer[B]);const ae=s.convert(G.format,G.colorSpace),h=s.convert(G.type),V=M(G.internalFormat,ae,h,G.normalized,G.colorSpace,u.isXRRenderTarget===!0),F=Ze(u);e.renderbufferStorageMultisample(e.RENDERBUFFER,F,V,u.width,u.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+B,e.RENDERBUFFER,b.__webglColorRenderbuffer[B])}e.bindRenderbuffer(e.RENDERBUFFER,null),u.depthBuffer&&(b.__webglDepthRenderbuffer=e.createRenderbuffer(),Ct(b.__webglDepthRenderbuffer,u,!0)),t.bindFramebuffer(e.FRAMEBUFFER,null)}}if(te){t.bindTexture(e.TEXTURE_CUBE_MAP,$.__webglTexture),Ye(e.TEXTURE_CUBE_MAP,a);for(let B=0;B<6;B++)if(a.mipmaps.length>0)for(let G=0;G<a.mipmaps.length;G++)Je(b.__webglFramebuffer[B][G],u,a,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+B,G);else Je(b.__webglFramebuffer[B],u,a,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+B,0);D(a)?x(e.TEXTURE_CUBE_MAP):a.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,a.mipmaps.length-1),t.unbindTexture()}else if(se){for(let B=0,G=z.length;B<G;B++){const ae=z[B],h=i.get(ae);let V=e.TEXTURE_2D;(u.isWebGL3DRenderTarget||u.isWebGLArrayRenderTarget)&&(V=u.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(V,h.__webglTexture),Ye(V,ae),Je(b.__webglFramebuffer,u,ae,e.COLOR_ATTACHMENT0+B,V,0),D(ae)&&x(V)}t.unbindTexture()}else{let B=e.TEXTURE_2D;if((u.isWebGL3DRenderTarget||u.isWebGLArrayRenderTarget)&&(B=u.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(B,$.__webglTexture),Ye(B,a),a.mipmaps.length>0)for(let G=0;G<a.mipmaps.length;G++)Je(b.__webglFramebuffer[G],u,a,e.COLOR_ATTACHMENT0,B,G);else Je(b.__webglFramebuffer,u,a,e.COLOR_ATTACHMENT0,B,0);D(a)?x(B):a.mipmaps.length>0&&e.texParameteri(B,e.TEXTURE_MAX_LEVEL,a.mipmaps.length-1),t.unbindTexture()}u.depthBuffer&&Et(u)}function T(u){const a=u.textures;for(let b=0,$=a.length;b<$;b++){const z=a[b];if(D(z)&&z.mipmapsAutoUpdate===!0){const te=C(u),se=i.get(z).__webglTexture;t.bindTexture(te,se),x(te),t.unbindTexture()}}}const Tt=[];function qe(u){if(u.samples>0){if(ce(u)===!1){const a=u.textures,b=u.width,$=u.height;let z=e.COLOR_BUFFER_BIT;const te=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,se=i.get(u),B=a.length>1;if(B)for(let ae=0;ae<a.length;ae++)t.bindFramebuffer(e.FRAMEBUFFER,se.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ae,e.RENDERBUFFER,null),t.bindFramebuffer(e.FRAMEBUFFER,se.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ae,e.TEXTURE_2D,null,0);t.bindFramebuffer(e.READ_FRAMEBUFFER,se.__webglMultisampledFramebuffer),u.texture.mipmaps.length>0?t.bindFramebuffer(e.DRAW_FRAMEBUFFER,se.__webglFramebuffer[0]):t.bindFramebuffer(e.DRAW_FRAMEBUFFER,se.__webglFramebuffer);for(let ae=0;ae<a.length;ae++){if(u.resolveDepthBuffer&&(u.depthBuffer&&(z|=e.DEPTH_BUFFER_BIT),u.stencilBuffer&&u.resolveStencilBuffer&&(z|=e.STENCIL_BUFFER_BIT)),B){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,se.__webglColorRenderbuffer[ae]);const h=i.get(a[ae]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,h,0)}e.blitFramebuffer(0,0,b,$,0,0,b,$,z,e.NEAREST),N===!0&&(Tt.length=0,Tt.push(e.COLOR_ATTACHMENT0+ae),u.depthBuffer&&u.storeMultisampledDepthBuffer===!1&&Tt.push(te),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Tt))}if(t.bindFramebuffer(e.READ_FRAMEBUFFER,null),t.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),B)for(let ae=0;ae<a.length;ae++){t.bindFramebuffer(e.FRAMEBUFFER,se.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ae,e.RENDERBUFFER,se.__webglColorRenderbuffer[ae]);const h=i.get(a[ae]).__webglTexture;t.bindFramebuffer(e.FRAMEBUFFER,se.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ae,e.TEXTURE_2D,h,0)}t.bindFramebuffer(e.DRAW_FRAMEBUFFER,se.__webglMultisampledFramebuffer)}else if(u.depthBuffer&&u.storeMultisampledDepthBuffer===!1&&N){const a=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[a])}}}function Ze(u){return Math.min(c.maxSamples,u.samples)}function ce(u){const a=i.get(u);return u.samples>0&&n.has("WEBGL_multisampled_render_to_texture")===!0&&a.__useRenderToTexture!==!1}function it(u){const a=d.render.frame;W.get(u)!==a&&(W.set(u,a),u.update())}function Te(u,a){const b=u.colorSpace,$=u.format,z=u.type;return u.isCompressedTexture===!0||u.isVideoTexture===!0||b!==Fa&&b!==qt&&(et.getTransfer(b)===Ke?($!==Gt||z!==Dt)&&We("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):$e("WebGLTextures: Unsupported texture color space:",b)),a}function Ce(u){return typeof HTMLImageElement<"u"&&u instanceof HTMLImageElement?(S.width=u.naturalWidth||u.width,S.height=u.naturalHeight||u.height):typeof VideoFrame<"u"&&u instanceof VideoFrame?(S.width=u.displayWidth,S.height=u.displayHeight):(S.width=u.width,S.height=u.height),S}this.allocateTextureUnit=Ne,this.resetTextureUnits=j,this.getTextureUnits=ie,this.setTextureUnits=Ae,this.setTexture2D=he,this.setTexture2DArray=Se,this.setTexture3D=Re,this.setTextureCube=me,this.rebindTextures=Mt,this.setupRenderTarget=xt,this.updateRenderTargetMipmap=T,this.updateMultisampleRenderTarget=qe,this.setupDepthRenderbuffer=Et,this.setupFrameBufferTexture=Je,this.useMultisampledRTT=ce,this.dispose=Q}function rd(e,n){function t(i,c=qt){let s;const d=et.getTransfer(c);if(i===Dt)return e.UNSIGNED_BYTE;if(i===Ma)return e.UNSIGNED_SHORT_4_4_4_4;if(i===xa)return e.UNSIGNED_SHORT_5_5_5_1;if(i===to)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===no)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===io)return e.BYTE;if(i===ao)return e.SHORT;if(i===Mn)return e.UNSIGNED_SHORT;if(i===Ca)return e.INT;if(i===Yt)return e.UNSIGNED_INT;if(i===Bt)return e.FLOAT;if(i===yt)return e.HALF_FLOAT;if(i===ro)return e.ALPHA;if(i===oo)return e.RGB;if(i===Gt)return e.RGBA;if(i===fn)return e.DEPTH_COMPONENT;if(i===Xt)return e.DEPTH_STENCIL;if(i===so)return e.RED;if(i===Ea)return e.RED_INTEGER;if(i===Jt)return e.RG;if(i===Sa)return e.RG_INTEGER;if(i===va)return e.RGBA_INTEGER;if(i===Un||i===Nn||i===In||i===yn)if(d===Ke)if(s=n.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Un)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Nn)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===In)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===yn)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=n.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Un)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Nn)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===In)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===yn)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===pi||i===hi||i===mi||i===_i)if(s=n.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===pi)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===hi)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===mi)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===_i)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===gi||i===vi||i===Si||i===Ei||i===Mi||i===kn||i===xi)if(s=n.get("WEBGL_compressed_texture_etc"),s!==null){if(i===gi||i===vi)return d===Ke?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Si)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===Ei)return s.COMPRESSED_R11_EAC;if(i===Mi)return s.COMPRESSED_SIGNED_R11_EAC;if(i===kn)return s.COMPRESSED_RG11_EAC;if(i===xi)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Ti||i===Ai||i===Ri||i===bi||i===Ci||i===Pi||i===Li||i===Di||i===wi||i===Ui||i===Ni||i===Ii||i===yi||i===Oi)if(s=n.get("WEBGL_compressed_texture_astc"),s!==null){if(i===Ti)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Ai)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ri)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===bi)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Ci)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Pi)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Li)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Di)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===wi)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Ui)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Ni)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Ii)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===yi)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Oi)return d===Ke?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Fi||i===Bi||i===Gi)if(s=n.get("EXT_texture_compression_bptc"),s!==null){if(i===Fi)return d===Ke?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Bi)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Gi)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Hi||i===Vi||i===zn||i===Wi)if(s=n.get("EXT_texture_compression_rgtc"),s!==null){if(i===Hi)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Vi)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===zn)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Wi)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===jt?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:t}}const od=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,sd=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class ld{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(n,t){if(this.texture===null){const i=new ba(n.texture);(n.depthNear!==t.depthNear||n.depthFar!==t.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=i}}getMesh(n){if(this.texture!==null&&this.mesh===null){const t=n.cameras[0].viewport,i=new Qt({vertexShader:od,fragmentShader:sd,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Kt(new Ta(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class cd extends Fr{constructor(n,t){super();const i=this;let c=null,s=1,d=null,_="local-floor",N=1,S=null,W=null,y=null,E=null,v=null,L=null;const U=typeof XRWebGLBinding<"u",f=new ld,l={},m=t.getContextAttributes();let D=null,x=null;const C=[],M=[],o=new vt;let p=null,Y=null;const w=new Dn;w.viewport=new gt;const O=new Dn;O.viewport=new gt;const X=[w,O],Z=new Br;let A=null,Q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let he=C[k];return he===void 0&&(he=new wn,C[k]=he),he.getTargetRaySpace()},this.getControllerGrip=function(k){let he=C[k];return he===void 0&&(he=new wn,C[k]=he),he.getGripSpace()},this.getHand=function(k){let he=C[k];return he===void 0&&(he=new wn,C[k]=he),he.getHandSpace()};function q(k){const he=M.indexOf(k.inputSource);if(he===-1)return;const Se=C[he];Se!==void 0&&(Se.update(k.inputSource,k.frame,S||d),Se.dispatchEvent({type:k.type,data:k.inputSource}))}function H(){c.removeEventListener("select",q),c.removeEventListener("selectstart",q),c.removeEventListener("selectend",q),c.removeEventListener("squeeze",q),c.removeEventListener("squeezestart",q),c.removeEventListener("squeezeend",q),c.removeEventListener("end",H),c.removeEventListener("inputsourceschange",fe);for(let k=0;k<C.length;k++){const he=M[k];he!==null&&(M[k]=null,C[k].disconnect(he))}A=null,Q=null,f.reset();for(const k in l)delete l[k];if(n.setRenderTarget(D),v=null,E=null,y=null,c=null,x=null,Ne.stop(),i.isPresenting=!1,n.setPixelRatio(p),n.setSize(o.width,o.height,!1),Y!==null){const k=Y.camera;k.fov=Y.fov,k.zoom=Y.zoom,k.updateProjectionMatrix(),Y=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){s=k,i.isPresenting===!0&&We("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){_=k,i.isPresenting===!0&&We("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return S||d},this.setReferenceSpace=function(k){S=k},this.getBaseLayer=function(){return E!==null?E:v},this.getBinding=function(){return y===null&&U&&(y=new XRWebGLBinding(c,t)),y},this.getFrame=function(){return L},this.getSession=function(){return c},this.setSession=async function(k){if(c=k,c!==null){if(D=n.getRenderTarget(),c.addEventListener("select",q),c.addEventListener("selectstart",q),c.addEventListener("selectend",q),c.addEventListener("squeeze",q),c.addEventListener("squeezestart",q),c.addEventListener("squeezeend",q),c.addEventListener("end",H),c.addEventListener("inputsourceschange",fe),m.xrCompatible!==!0&&await t.makeXRCompatible(),p=n.getPixelRatio(),n.getSize(o),U&&"createProjectionLayer"in XRWebGLBinding.prototype){let Se=null,Re=null,me=null;m.depth&&(me=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Se=m.stencil?Xt:fn,Re=m.stencil?jt:Yt);const Ue={colorFormat:t.RGBA8,depthFormat:me,scaleFactor:s};y=this.getBinding(),E=y.createProjectionLayer(Ue),c.updateRenderState({layers:[E]}),n.setPixelRatio(1),n.setSize(E.textureWidth,E.textureHeight,!1),x=new wt(E.textureWidth,E.textureHeight,{format:Gt,type:Dt,depthTexture:new cn(E.textureWidth,E.textureHeight,Re,void 0,void 0,void 0,void 0,void 0,void 0,Se),stencilBuffer:m.stencil,colorSpace:n.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:E.ignoreDepthValues===!1,resolveStencilBuffer:E.ignoreDepthValues===!1,storeMultisampledDepthBuffer:E.ignoreDepthValues===!1,storeMultisampledStencilBuffer:E.ignoreDepthValues===!1})}else{const Se={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};v=new XRWebGLLayer(c,t,Se),c.updateRenderState({baseLayer:v}),n.setPixelRatio(1),n.setSize(v.framebufferWidth,v.framebufferHeight,!1),x=new wt(v.framebufferWidth,v.framebufferHeight,{format:Gt,type:Dt,colorSpace:n.outputColorSpace,stencilBuffer:m.stencil,resolveDepthBuffer:v.ignoreDepthValues===!1,resolveStencilBuffer:v.ignoreDepthValues===!1,storeMultisampledDepthBuffer:v.ignoreDepthValues===!1,storeMultisampledStencilBuffer:v.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(N),S=null,d=await c.requestReferenceSpace(_),Ne.setContext(c),Ne.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(c!==null)return c.environmentBlendMode},this.getDepthTexture=function(){return f.getDepthTexture()};function fe(k){for(let he=0;he<k.removed.length;he++){const Se=k.removed[he],Re=M.indexOf(Se);Re>=0&&(M[Re]=null,C[Re].disconnect(Se))}for(let he=0;he<k.added.length;he++){const Se=k.added[he];let Re=M.indexOf(Se);if(Re===-1){for(let Ue=0;Ue<C.length;Ue++)if(Ue>=M.length){M.push(Se),Re=Ue;break}else if(M[Ue]===null){M[Ue]=Se,Re=Ue;break}if(Re===-1)break}const me=C[Re];me&&me.connect(Se)}}function K(k,he){he===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices(he.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(c===null)return;let he=k.near,Se=k.far;f.texture!==null&&(f.depthNear>0&&(he=f.depthNear),f.depthFar>0&&(Se=f.depthFar)),Z.near=O.near=w.near=he,Z.far=O.far=w.far=Se,(A!==Z.near||Q!==Z.far)&&(c.updateRenderState({depthNear:Z.near,depthFar:Z.far}),A=Z.near,Q=Z.far),Z.layers.mask=k.layers.mask|6,w.layers.mask=Z.layers.mask&-5,O.layers.mask=Z.layers.mask&-3;const Re=k.parent,me=Z.cameras;K(Z,Re);for(let Ue=0;Ue<me.length;Ue++)K(me[Ue],Re);Z.projectionMatrix.copy(w.projectionMatrix),Z.projectionMatrixInverse.copy(w.projectionMatrixInverse),Y===null&&k.isPerspectiveCamera&&(Y={camera:k,fov:k.fov,zoom:k.zoom}),j(k,Z,Re)};function j(k,he,Se){Se===null?k.matrix.copy(he.matrixWorld):(k.matrix.copy(Se.matrixWorld),k.matrix.invert(),k.matrix.multiply(he.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy(he.projectionMatrix),k.projectionMatrixInverse.copy(he.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=Gr*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return Z},this.getFoveation=function(){if(!(E===null&&v===null))return N},this.setFoveation=function(k){N=k,E!==null&&(E.fixedFoveation=k),v!==null&&v.fixedFoveation!==void 0&&(v.fixedFoveation=k)},this.hasDepthSensing=function(){return f.texture!==null},this.getDepthSensingMesh=function(){return f.getMesh(Z)},this.getCameraTexture=function(k){return l[k]};let ie=null;function Ae(k,he){if(W=he.getViewerPose(S||d),L=he,W!==null){const Se=W.views;v!==null&&(n.setRenderTargetFramebuffer(x,v.framebuffer),n.setRenderTarget(x));let Re=!1;Se.length!==Z.cameras.length&&(Z.cameras.length=0,Re=!0);for(let be=0;be<Se.length;be++){const Ye=Se[be];let ke=null;if(v!==null)ke=v.getViewport(Ye);else{const ct=y.getViewSubImage(E,Ye);ke=ct.viewport,be===0&&(n.setRenderTargetTextures(x,ct.colorTexture,ct.depthStencilTexture),n.setRenderTarget(x))}let Ie=X[be];Ie===void 0&&(Ie=new Dn,Ie.layers.enable(be),Ie.viewport=new gt,X[be]=Ie),Ie.matrix.fromArray(Ye.transform.matrix),Ie.matrix.decompose(Ie.position,Ie.quaternion,Ie.scale),Ie.projectionMatrix.fromArray(Ye.projectionMatrix),Ie.projectionMatrixInverse.copy(Ie.projectionMatrix).invert(),Ie.viewport.set(ke.x,ke.y,ke.width,ke.height),be===0&&(Z.matrix.copy(Ie.matrix),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale)),Re===!0&&Z.cameras.push(Ie)}const me=c.enabledFeatures;if(me&&me.includes("depth-sensing")&&c.depthUsage=="gpu-optimized"&&U){y=i.getBinding();const be=y.getDepthInformation(Se[0]);be&&be.isValid&&be.texture&&f.init(be,c.renderState)}if(me&&me.includes("camera-access")&&U){n.state.unbindTexture(),y=i.getBinding();for(let be=0;be<Se.length;be++){const Ye=Se[be].camera;if(Ye){let ke=l[Ye];ke||(ke=new ba,l[Ye]=ke);const Ie=y.getCameraImage(Ye);ke.sourceTexture=Ie}}}}for(let Se=0;Se<C.length;Se++){const Re=M[Se],me=C[Se];Re!==null&&me!==void 0&&me.update(Re,he,S||d)}ie&&ie(k,he),he.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:he}),L=null}const Ne=new Ba;Ne.setAnimationLoop(Ae),this.setAnimationLoop=function(k){ie=k},this.dispose=function(){}}}const fd=new $t,qa=new Fe;qa.set(-1,0,0,0,1,0,0,0,1);function dd(e,n){function t(f,l){f.matrixAutoUpdate===!0&&f.updateMatrix(),l.value.copy(f.matrix)}function i(f,l){l.color.getRGB(f.fogColor.value,Aa(e)),l.isFog?(f.fogNear.value=l.near,f.fogFar.value=l.far):l.isFogExp2&&(f.fogDensity.value=l.density)}function c(f,l,m,D,x){l.isNodeMaterial?l.uniformsNeedUpdate=!1:l.isMeshBasicMaterial?s(f,l):l.isMeshLambertMaterial?(s(f,l),l.envMap&&(f.envMapIntensity.value=l.envMapIntensity)):l.isMeshToonMaterial?(s(f,l),y(f,l)):l.isMeshPhongMaterial?(s(f,l),W(f,l),l.envMap&&(f.envMapIntensity.value=l.envMapIntensity)):l.isMeshStandardMaterial?(s(f,l),E(f,l),l.isMeshPhysicalMaterial&&v(f,l,x)):l.isMeshMatcapMaterial?(s(f,l),L(f,l)):l.isMeshDepthMaterial?s(f,l):l.isMeshDistanceMaterial?(s(f,l),U(f,l)):l.isMeshNormalMaterial?s(f,l):l.isLineBasicMaterial?(d(f,l),l.isLineDashedMaterial&&_(f,l)):l.isPointsMaterial?N(f,l,m,D):l.isSpriteMaterial?S(f,l):l.isShadowMaterial?(f.color.value.copy(l.color),f.opacity.value=l.opacity):l.isShaderMaterial&&(l.uniformsNeedUpdate=!1)}function s(f,l){f.opacity.value=l.opacity,l.color&&f.diffuse.value.copy(l.color),l.emissive&&f.emissive.value.copy(l.emissive).multiplyScalar(l.emissiveIntensity),l.map&&(f.map.value=l.map,t(l.map,f.mapTransform)),l.alphaMap&&(f.alphaMap.value=l.alphaMap,t(l.alphaMap,f.alphaMapTransform)),l.bumpMap&&(f.bumpMap.value=l.bumpMap,t(l.bumpMap,f.bumpMapTransform),f.bumpScale.value=l.bumpScale,l.side===St&&(f.bumpScale.value*=-1)),l.normalMap&&(f.normalMap.value=l.normalMap,t(l.normalMap,f.normalMapTransform),f.normalScale.value.copy(l.normalScale),l.side===St&&f.normalScale.value.negate()),l.displacementMap&&(f.displacementMap.value=l.displacementMap,t(l.displacementMap,f.displacementMapTransform),f.displacementScale.value=l.displacementScale,f.displacementBias.value=l.displacementBias),l.emissiveMap&&(f.emissiveMap.value=l.emissiveMap,t(l.emissiveMap,f.emissiveMapTransform)),l.specularMap&&(f.specularMap.value=l.specularMap,t(l.specularMap,f.specularMapTransform)),l.alphaTest>0&&(f.alphaTest.value=l.alphaTest);const m=n.get(l),D=m.envMap,x=m.envMapRotation;D&&(f.envMap.value=D,f.envMapRotation.value.setFromMatrix4(fd.makeRotationFromEuler(x)).transpose(),D.isCubeTexture&&D.isRenderTargetTexture===!1&&f.envMapRotation.value.premultiply(qa),f.reflectivity.value=l.reflectivity,f.ior.value=l.ior,f.refractionRatio.value=l.refractionRatio),l.lightMap&&(f.lightMap.value=l.lightMap,f.lightMapIntensity.value=l.lightMapIntensity,t(l.lightMap,f.lightMapTransform)),l.aoMap&&(f.aoMap.value=l.aoMap,f.aoMapIntensity.value=l.aoMapIntensity,t(l.aoMap,f.aoMapTransform))}function d(f,l){f.diffuse.value.copy(l.color),f.opacity.value=l.opacity,l.map&&(f.map.value=l.map,t(l.map,f.mapTransform))}function _(f,l){f.dashSize.value=l.dashSize,f.totalSize.value=l.dashSize+l.gapSize,f.scale.value=l.scale}function N(f,l,m,D){f.diffuse.value.copy(l.color),f.opacity.value=l.opacity,f.size.value=l.size*m,f.scale.value=D*.5,l.map&&(f.map.value=l.map,t(l.map,f.uvTransform)),l.alphaMap&&(f.alphaMap.value=l.alphaMap,t(l.alphaMap,f.alphaMapTransform)),l.alphaTest>0&&(f.alphaTest.value=l.alphaTest)}function S(f,l){f.diffuse.value.copy(l.color),f.opacity.value=l.opacity,f.rotation.value=l.rotation,l.map&&(f.map.value=l.map,t(l.map,f.mapTransform)),l.alphaMap&&(f.alphaMap.value=l.alphaMap,t(l.alphaMap,f.alphaMapTransform)),l.alphaTest>0&&(f.alphaTest.value=l.alphaTest)}function W(f,l){f.specular.value.copy(l.specular),f.shininess.value=Math.max(l.shininess,1e-4)}function y(f,l){l.gradientMap&&(f.gradientMap.value=l.gradientMap)}function E(f,l){f.metalness.value=l.metalness,l.metalnessMap&&(f.metalnessMap.value=l.metalnessMap,t(l.metalnessMap,f.metalnessMapTransform)),f.roughness.value=l.roughness,l.roughnessMap&&(f.roughnessMap.value=l.roughnessMap,t(l.roughnessMap,f.roughnessMapTransform)),l.envMap&&(f.envMapIntensity.value=l.envMapIntensity)}function v(f,l,m){f.ior.value=l.ior,l.diffuseRoughness>0&&(f.diffuseRoughness.value=l.diffuseRoughness,l.diffuseRoughnessMap&&(f.diffuseRoughnessMap.value=l.diffuseRoughnessMap,t(l.diffuseRoughnessMap,f.diffuseRoughnessMapTransform))),l.sheen>0&&(f.sheenColor.value.copy(l.sheenColor).multiplyScalar(l.sheen),f.sheenRoughness.value=l.sheenRoughness,l.sheenColorMap&&(f.sheenColorMap.value=l.sheenColorMap,t(l.sheenColorMap,f.sheenColorMapTransform)),l.sheenRoughnessMap&&(f.sheenRoughnessMap.value=l.sheenRoughnessMap,t(l.sheenRoughnessMap,f.sheenRoughnessMapTransform))),l.clearcoat>0&&(f.clearcoat.value=l.clearcoat,f.clearcoatRoughness.value=l.clearcoatRoughness,l.clearcoatMap&&(f.clearcoatMap.value=l.clearcoatMap,t(l.clearcoatMap,f.clearcoatMapTransform)),l.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=l.clearcoatRoughnessMap,t(l.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),l.clearcoatNormalMap&&(f.clearcoatNormalMap.value=l.clearcoatNormalMap,t(l.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(l.clearcoatNormalScale),l.side===St&&f.clearcoatNormalScale.value.negate())),l.dispersion>0&&(f.dispersion.value=l.dispersion),l.retroreflectivity>0&&(f.retroreflectivity.value=l.retroreflectivity),l.iridescence>0&&(f.iridescence.value=l.iridescence,f.iridescenceIOR.value=l.iridescenceIOR,f.iridescenceThicknessMinimum.value=l.iridescenceThicknessMinimum,f.iridescenceThicknessMaximum.value=l.iridescenceThicknessMaximum,l.iridescenceMap&&(f.iridescenceMap.value=l.iridescenceMap,t(l.iridescenceMap,f.iridescenceMapTransform)),l.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=l.iridescenceThicknessMap,t(l.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),l.transmission>0&&(f.transmission.value=l.transmission,f.transmissionSamplerMap.value=m.texture,f.transmissionSamplerSize.value.set(m.width,m.height),l.transmissionMap&&(f.transmissionMap.value=l.transmissionMap,t(l.transmissionMap,f.transmissionMapTransform)),f.thickness.value=l.thickness,l.thicknessMap&&(f.thicknessMap.value=l.thicknessMap,t(l.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=l.attenuationDistance,f.attenuationColor.value.copy(l.attenuationColor)),l.anisotropy>0&&(f.anisotropyVector.value.set(l.anisotropy*Math.cos(l.anisotropyRotation),l.anisotropy*Math.sin(l.anisotropyRotation)),l.anisotropyMap&&(f.anisotropyMap.value=l.anisotropyMap,t(l.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=l.specularIntensity,f.specularColor.value.copy(l.specularColor),l.specularColorMap&&(f.specularColorMap.value=l.specularColorMap,t(l.specularColorMap,f.specularColorMapTransform)),l.specularIntensityMap&&(f.specularIntensityMap.value=l.specularIntensityMap,t(l.specularIntensityMap,f.specularIntensityMapTransform))}function L(f,l){l.matcap&&(f.matcap.value=l.matcap)}function U(f,l){const m=n.get(l).light;f.referencePosition.value.setFromMatrixPosition(m.matrixWorld),f.nearDistance.value=m.shadow.camera.near,f.farDistance.value=m.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:c}}function ud(e,n,t,i){let c={},s={};function d(m,D){const x=D.program;i.uniformBlockBinding(m,x,c[m.id])}function _(m,D){let x=c[m.id];x===void 0&&(L(m),x=N(m),c[m.id]=x,m.addEventListener("dispose",f));const C=D.program;i.updateUBOMapping(m,C);const M=n.render.frame;s[m.id]!==M&&(S(m),s[m.id]=M)}function N(m){const D=e.createBuffer(),x=m.__size,C=m.usage;return e.bindBuffer(e.UNIFORM_BUFFER,D),e.bufferData(e.UNIFORM_BUFFER,x,C),e.bindBuffer(e.UNIFORM_BUFFER,null),D}function S(m){const D=c[m.id],x=m.uniforms,C=m.__cache;e.bindBuffer(e.UNIFORM_BUFFER,D);for(let M=0,o=x.length;M<o;M++){const p=x[M];if(Array.isArray(p))for(let Y=0,w=p.length;Y<w;Y++)W(p[Y],M,Y,C);else W(p,M,0,C)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function W(m,D,x,C){if(E(m,D,x,C)===!0){const M=m.__offset,o=m.value;if(Array.isArray(o)){let p=0;for(let Y=0;Y<o.length;Y++){const w=o[Y],O=U(w,!0);y(w,m.__data,p),p+=O.storage/Float32Array.BYTES_PER_ELEMENT}}else y(o,m.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,M,m.__data)}}function y(m,D,x){typeof m=="number"||typeof m=="boolean"?D[x]=m:m.isMatrix3?(D[x]=m.elements[0],D[x+1]=m.elements[1],D[x+2]=m.elements[2],D[x+3]=0,D[x+4]=m.elements[3],D[x+5]=m.elements[4],D[x+6]=m.elements[5],D[x+7]=0,D[x+8]=m.elements[6],D[x+9]=m.elements[7],D[x+10]=m.elements[8],D[x+11]=0):ArrayBuffer.isView(m)?D.set(m.subarray(0,D.length-x),x):m.toArray(D,x)}function E(m,D,x,C){const M=m.value,o=D+"_"+x;if(Array.isArray(M)){C[o]===void 0&&(C[o]=[]);const p=C[o];let Y=!1;for(let w=0;w<M.length;w++)v(M[w],p,w)===!0&&(Y=!0);return Y}return v(M,C,o)}function v(m,D,x){if(D[x]===void 0)return typeof m=="number"||typeof m=="boolean"?D[x]=m:ArrayBuffer.isView(m)?D[x]=m.slice():D[x]=m.clone(),!0;{const C=D[x];if(typeof m=="number"||typeof m=="boolean"){if(C!==m)return D[x]=m,!0}else{if(ArrayBuffer.isView(m))return!0;if(C.equals(m)===!1)return C.copy(m),!0}}return!1}function L(m){const D=m.uniforms;let x=0;const C=16;for(let o=0,p=D.length;o<p;o++){const Y=Array.isArray(D[o])?D[o]:[D[o]];for(let w=0,O=Y.length;w<O;w++){const X=Y[w],Z=Array.isArray(X.value)?X.value:[X.value],A=Array.isArray(D[o])||Array.isArray(X.value);let Q=x;for(let H=0,fe=Z.length;H<fe;H++){const K=Z[H],j=U(K,A),ie=x%C,Ae=ie%j.boundary,Ne=ie+Ae;x+=Ae,Ne!==0&&C-Ne<j.storage&&(x+=C-Ne),H===0&&(Q=x),x+=j.storage}const q=X.type==="int"?Int32Array:X.type==="uint"?Uint32Array:Float32Array;X.__data=new q((x-Q)/Float32Array.BYTES_PER_ELEMENT),X.__offset=Q}}const M=x%C;return M>0&&(x+=C-M),m.__size=x,m.__cache={},this}function U(m,D){const x={boundary:0,storage:0};return typeof m=="number"||typeof m=="boolean"?(x.boundary=4,x.storage=4):m.isVector2?(x.boundary=8,x.storage=8):m.isVector3||m.isColor?(x.boundary=16,x.storage=12):m.isVector4?(x.boundary=16,x.storage=16):m.isMatrix3?(x.boundary=16,x.storage=48):m.isMatrix4?(x.boundary=16,x.storage=64):m.isTexture?We("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(m)?(x.boundary=16,x.storage=m.byteLength):We("WebGLRenderer: Unsupported uniform value type.",m),D===!0&&(x.boundary=16,x.storage=Math.ceil(x.storage/16)*16),x}function f(m){const D=m.target;D.removeEventListener("dispose",f),e.deleteBuffer(c[D.id]),delete c[D.id],delete s[D.id]}function l(){for(const m in c)e.deleteBuffer(c[m]);c={},s={}}return{bind:d,update:_,dispose:l}}const pd=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Pt=null;function hd(){return Pt===null&&(Pt=new Hr(pd,16,16,Jt,yt),Pt.name="DFG_LUT",Pt.minFilter=bt,Pt.magFilter=bt,Pt.wrapS=Hn,Pt.wrapT=Hn,Pt.generateMipmaps=!1,Pt.needsUpdate=!0),Pt}class _d{constructor(n={}){const{canvas:t=tr(),context:i=null,depth:c=!0,stencil:s=!1,alpha:d=!1,antialias:_=!1,premultipliedAlpha:N=!0,preserveDrawingBuffer:S=!1,powerPreference:W="default",failIfMajorPerformanceCaveat:y=!1,reversedDepthBuffer:E=!1,outputBufferType:v=Dt}=n;this.isWebGLRenderer=!0;let L;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");L=i.getContextAttributes().alpha}else L=d;const U=v,f=new Set([va,Sa,Ea]),l=new Set([Dt,Yt,Mn,jt,Ma,xa]),m=new Uint32Array(4),D=new Int32Array(4),x={textures:[],min:[],max:[],resolution:[]};let C=null,M=null;const o=[],p=[];let Y=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=It,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const w=this;let O=!1,X=null,Z=null,A=null,Q=null;this._outputColorSpace=nr;let q=0,H=0,fe=null,K=-1,j=null;const ie=new gt,Ae=new gt;let Ne=null;const k=new Qe(0);let he=0,Se=t.width,Re=t.height,me=1,Ue=null,ht=null;const be=new gt(0,0,Se,Re),Ye=new gt(0,0,Se,Re);let ke=!1;const Ie=new ua,ct=new ar;let nt=!1,mt=!1;const Je=new $t,Ct=new Ge,ot=new gt,Et={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Mt=!1;function xt(){return fe===null?me:1}let T=i;function Tt(r,g){return t.getContext(r,g)}let qe,Ze,ce,it,Te,Ce,u,a,b,$,z,te,se,B,G,ae,h,V,F,re,ee,ne,Me;try{const r={alpha:!0,depth:c,stencil:s,antialias:_,premultipliedAlpha:N,preserveDrawingBuffer:S,powerPreference:W,failIfMajorPerformanceCaveat:y};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ir}`),t.addEventListener("webglcontextlost",xe,!1),t.addEventListener("webglcontextrestored",Le,!1),t.addEventListener("webglcontextcreationerror",de,!1),T===null){const g="webgl2";if(T=Tt(g,r),T===null)throw Tt(g)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}De()}catch(r){throw t.removeEventListener("webglcontextlost",xe,!1),t.removeEventListener("webglcontextrestored",Le,!1),t.removeEventListener("webglcontextcreationerror",de,!1),$e("WebGLRenderer: "+r.message),r}function De(){qe=new gc(T),qe.init(),ee=new rd(T,qe),Ze=new oc(T,qe,n,ee),ce=new id(T,qe),Ze.reversedDepthBuffer&&E&&ce.buffers.depth.setReversed(!0),Z=T.createFramebuffer(),A=T.createFramebuffer(),Q=T.createFramebuffer(),it=new Ec(T),Te=new kf,Ce=new ad(T,qe,ce,Te,Ze,ee,it),u=new _c(w),a=new xo(T),ne=new ac(T,a),b=new vc(T,a,it,ne),$=new xc(T,b,a,ne,it),V=new Mc(T,Ze,Ce),G=new sc(Te),z=new Wf(w,u,qe,Ze,ne,G),te=new dd(w,Te),se=new Xf,B=new Qf(qe),h=new ic(w,u,ce,$,L,N),ae=new nd(w,$,Ze),Me=new ud(T,it,Ze,ce),F=new rc(T,qe,it),re=new Sc(T,qe,it),it.programs=z.programs,w.capabilities=Ze,w.extensions=qe,w.properties=Te,w.renderLists=se,w.shadowMap=ae,w.state=ce,w.info=it}U!==Dt&&(Y=new Ac(U,t.width,t.height,_,c,s));const J=new cd(w,T);this.xr=J,this.getContext=function(){return T},this.getContextAttributes=function(){return T.getContextAttributes()},this.forceContextLoss=function(){const r=qe.get("WEBGL_lose_context");r&&r.loseContext()},this.forceContextRestore=function(){const r=qe.get("WEBGL_lose_context");r&&r.restoreContext()},this.getPixelRatio=function(){return me},this.setPixelRatio=function(r){r!==void 0&&(me=r,this.setSize(Se,Re,!1))},this.getSize=function(r){return r.set(Se,Re)},this.setSize=function(r,g,I=!0){if(J.isPresenting){We("WebGLRenderer: Can't change size while VR device is presenting.");return}Se=r,Re=g,t.width=Math.floor(r*me),t.height=Math.floor(g*me),I===!0&&(t.style.width=r+"px",t.style.height=g+"px"),Y!==null&&Y.setSize(t.width,t.height),this.setViewport(0,0,r,g)},this.getDrawingBufferSize=function(r){return r.set(Se*me,Re*me).floor()},this.setDrawingBufferSize=function(r,g,I){Se=r,Re=g,me=I,t.width=Math.floor(r*I),t.height=Math.floor(g*I),this.setViewport(0,0,r,g)},this.setEffects=function(r){if(U===Dt){$e("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(r){for(let g=0;g<r.length;g++)if(r[g].isOutputPass===!0){We("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}Y.setEffects(r||[])},this.getCurrentViewport=function(r){return r.copy(ie)},this.getViewport=function(r){return r.copy(be)},this.setViewport=function(r,g,I,R){r.isVector4?be.set(r.x,r.y,r.z,r.w):be.set(r,g,I,R),ce.viewport(ie.copy(be).multiplyScalar(xt()).round())},this.getScissor=function(r){return r.copy(Ye)},this.setScissor=function(r,g,I,R){r.isVector4?Ye.set(r.x,r.y,r.z,r.w):Ye.set(r,g,I,R),ce.scissor(Ae.copy(Ye).multiplyScalar(xt()).round())},this.getScissorTest=function(){return ke},this.setScissorTest=function(r){ce.setScissorTest(ke=r)},this.setOpaqueSort=function(r){Ue=r},this.setTransparentSort=function(r){ht=r},this.getClearColor=function(r){return r.copy(h.getClearColor())},this.setClearColor=function(){h.setClearColor(...arguments)},this.getClearAlpha=function(){return h.getClearAlpha()},this.setClearAlpha=function(){h.setClearAlpha(...arguments)},this.clear=function(r=!0,g=!0,I=!0){let R=0;if(r){let P=!1;if(fe!==null){const le=fe.texture.format;P=f.has(le)}if(P){const le=fe.texture.type,_e=l.has(le),oe=h.getClearColor(),pe=h.getClearAlpha(),Ee=oe.r,Pe=oe.g,ye=oe.b;_e?(m[0]=Ee,m[1]=Pe,m[2]=ye,m[3]=pe,T.clearBufferuiv(T.COLOR,0,m)):(D[0]=Ee,D[1]=Pe,D[2]=ye,D[3]=pe,T.clearBufferiv(T.COLOR,0,D))}else R|=T.COLOR_BUFFER_BIT}g&&(R|=T.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),I&&(R|=T.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R!==0&&T.clear(R)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(r){r.setRenderer(this),X=r},this.dispose=function(){t.removeEventListener("webglcontextlost",xe,!1),t.removeEventListener("webglcontextrestored",Le,!1),t.removeEventListener("webglcontextcreationerror",de,!1),h.dispose(),se.dispose(),B.dispose(),Ce.dispose(),Te.dispose(),u.dispose(),$.dispose(),b.dispose(),ne.dispose(),Me.dispose(),z.dispose(),J.dispose(),J.removeEventListener("sessionstart",qn),J.removeEventListener("sessionend",Zn),Ht.stop()};function xe(r){r.preventDefault(),ai("WebGLRenderer: Context Lost."),O=!0}function Le(){ai("WebGLRenderer: Context Restored."),O=!1;const r=it.autoReset,g=ae.enabled,I=ae.autoUpdate,R=ae.needsUpdate,P=ae.type;De(),it.autoReset=r,ae.enabled=g,ae.autoUpdate=I,ae.needsUpdate=R,ae.type=P}function de(r){$e("WebGLRenderer: A WebGL context could not be created. Reason: ",r.statusMessage)}function Ve(r){const g=r.target;g.removeEventListener("dispose",Ve),st(g)}function st(r){Ot(r),Te.remove(r)}function Ot(r){const g=Te.get(r).programs;g!==void 0&&(g.forEach(function(I){z.releaseProgram(I)}),r.isShaderMaterial&&z.releaseShaderCache(r))}this.renderBufferDirect=function(r,g,I,R,P,le){g===null&&(g=Et);const _e=P.isMesh&&P.matrixWorld.determinantAffine()<0,oe=Ja(r,g,I,R,P);ce.setMaterial(R,_e);let pe=I.index,Ee=1;if(R.wireframe===!0){if(pe=b.getWireframeAttribute(I),pe===void 0)return;Ee=2}const Pe=I.drawRange,ye=I.attributes.position;let ge=Pe.start*Ee,Oe=(Pe.start+Pe.count)*Ee;le!==null&&(ge=Math.max(ge,le.start*Ee),Oe=Math.min(Oe,(le.start+le.count)*Ee)),pe!==null?(ge=Math.max(ge,0),Oe=Math.min(Oe,pe.count)):ye!=null&&(ge=Math.max(ge,0),Oe=Math.min(Oe,ye.count));const tt=Oe-ge;if(tt<0||tt===1/0)return;ne.setup(P,R,oe,I,pe);let Xe,ze=F;if(pe!==null&&(Xe=a.get(pe),ze=re,ze.setIndex(Xe)),P.isMesh)R.wireframe===!0?(ce.setLineWidth(R.wireframeLinewidth*xt()),ze.setMode(T.LINES)):ze.setMode(T.TRIANGLES);else if(P.isLine){let dt=R.linewidth;dt===void 0&&(dt=1),ce.setLineWidth(dt*xt()),P.isLineSegments?ze.setMode(T.LINES):P.isLineLoop?ze.setMode(T.LINE_LOOP):ze.setMode(T.LINE_STRIP)}else P.isPoints?ze.setMode(T.POINTS):P.isSprite&&ze.setMode(T.TRIANGLES);if(P.isBatchedMesh)if(qe.get("WEBGL_multi_draw"))ze.renderMultiDraw(P._multiDrawStarts,P._multiDrawCounts,P._multiDrawCount);else{const dt=P._multiDrawStarts,ve=P._multiDrawCounts,pt=P._multiDrawCount,He=pe?a.get(pe).bytesPerElement:1,Vt=Te.get(R).currentProgram.getUniforms();for(let ut=0;ut<pt;ut++)Vt.setValue(T,"_gl_DrawID",ut),ze.render(dt[ut]/He,ve[ut])}else if(P.isInstancedMesh)ze.renderInstances(ge,tt,P.count);else if(I.isInstancedBufferGeometry){const dt=I._maxInstanceCount!==void 0?I._maxInstanceCount:1/0,ve=Math.min(I.instanceCount,dt);ze.renderInstances(ge,tt,ve)}else ze.render(ge,tt)};function Yn(r,g,I,R){X!==null&&r.isNodeMaterial&&X.setObject(R,r),nt===!0&&G.setState(r,I,!1),r.transparent===!0&&r.side===Nt&&r.forceSinglePass===!1?(r.side=St,r.needsUpdate=!0,tn(r,g,R),r.side=ln,r.needsUpdate=!0,tn(r,g,R),r.side=Nt):tn(r,g,R)}this.compile=function(r,g,I=null){I===null&&(I=r),X!==null&&X.renderStart(r,g,I),M=B.get(I),M.init(g),p.push(M),I.traverseVisible(function(P){P.isLight&&P.layers.test(g.layers)&&(M.pushLight(P),P.castShadow&&M.pushShadow(P))}),r!==I&&r.traverseVisible(function(P){P.isLight&&P.layers.test(g.layers)&&(M.pushLight(P),P.castShadow&&M.pushShadow(P))}),M.setupLights(),X!==null&&X.updateLights(M.state.lightsArray),mt=this.localClippingEnabled,nt=G.init(this.clippingPlanes,mt),nt===!0&&G.setGlobalState(this.clippingPlanes,g),X!==null&&ae.render(M.state.shadowsArray,I,g);const R=new Set;return r.traverse(function(P){if(!(P.isMesh||P.isPoints||P.isLine||P.isSprite))return;const le=P.material;if(le)if(Array.isArray(le))for(let _e=0;_e<le.length;_e++){const oe=le[_e];Yn(oe,I,g,P),R.add(oe)}else Yn(le,I,g,P),R.add(le)}),M=p.pop(),X!==null&&X.renderEnd(),R},this.compileAsync=function(r,g,I=null){const R=this.compile(r,g,I);return new Promise(P=>{function le(){if(R.forEach(function(_e){const pe=Te.get(_e).currentProgram;(pe===void 0||pe.isReady())&&R.delete(_e)}),R.size===0){P(r);return}setTimeout(le,10)}qe.get("KHR_parallel_shader_compile")!==null?le():setTimeout(le,10)})};let Cn=null;function $a(r){Cn&&Cn(r)}function qn(){Ht.stop()}function Zn(){Ht.start()}const Ht=new Ba;Ht.setAnimationLoop($a),typeof self<"u"&&Ht.setContext(self),this.setAnimationLoop=function(r){Cn=r,J.setAnimationLoop(r),r===null?Ht.stop():Ht.start()},J.addEventListener("sessionstart",qn),J.addEventListener("sessionend",Zn),this.render=function(r,g){if(g!==void 0&&g.isCamera!==!0){$e("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(O===!0)return;X!==null&&X.renderStart(r,g);const I=J.enabled===!0&&J.isPresenting===!0,R=Y!==null&&(fe===null||I)&&Y.begin(w,fe);if(r.matrixWorldAutoUpdate===!0&&r.updateMatrixWorld(),g.parent===null&&g.matrixWorldAutoUpdate===!0&&g.updateMatrixWorld(),J.enabled===!0&&J.isPresenting===!0&&(Y===null||Y.isCompositing()===!1)&&(J.cameraAutoUpdate===!0&&J.updateCamera(g),g=J.getCamera()),r.isScene===!0&&r.onBeforeRender(w,r,g,fe),M=B.get(r,p.length),M.init(g),M.state.textureUnits=Ce.getTextureUnits(),p.push(M),Je.multiplyMatrices(g.projectionMatrix,g.matrixWorldInverse),g.isArrayCamera?ct.setFromArrayCamera(g):Ie.setFromProjectionMatrix(Je,ri,g.reversedDepth),mt=this.localClippingEnabled,nt=G.init(this.clippingPlanes,mt),C=se.get(r,o.length),C.init(),o.push(C),this.info.render.frame++,J.enabled===!0&&J.isPresenting===!0){const _e=w.xr.getDepthSensingMesh();_e!==null&&Pn(_e,g,-1/0,w.sortObjects)}Pn(r,g,0,w.sortObjects),C.finish(),X!==null&&X.updateLights(M.state.lightsArray),w.sortObjects===!0&&C.sort(Ue,ht),Mt=J.enabled===!1||J.isPresenting===!1||J.hasDepthSensing()===!1,Mt&&h.addToRenderList(C,r),this.info.autoReset===!0&&this.info.reset(),nt===!0&&G.beginShadows();const P=M.state.shadowsArray;if(ae.render(P,r,g),nt===!0&&G.endShadows(),(R&&Y.hasRenderPass())===!1){const _e=C.opaque,oe=C.transmissive;if(M.setupLights(),g.isArrayCamera){const pe=g.cameras;if(oe.length>0)for(let Ee=0,Pe=pe.length;Ee<Pe;Ee++){const ye=pe[Ee];Qn(_e,oe,r,ye)}Mt&&h.render(r);for(let Ee=0,Pe=pe.length;Ee<Pe;Ee++){const ye=pe[Ee];$n(C,r,ye,ye.viewport)}}else oe.length>0&&Qn(_e,oe,r,g),Mt&&h.render(r),$n(C,r,g)}fe!==null&&H===0&&(Ce.updateMultisampleRenderTarget(fe),Ce.updateRenderTargetMipmap(fe)),R&&Y.end(w),r.isScene===!0&&r.onAfterRender(w,r,g),ne.resetDefaultState(),K=-1,j=null,p.pop(),p.length>0?(M=p[p.length-1],Ce.setTextureUnits(M.state.textureUnits),nt===!0&&G.setGlobalState(w.clippingPlanes,M.state.camera)):M=null,o.pop(),o.length>0?C=o[o.length-1]:C=null,X!==null&&X.renderEnd()};function Pn(r,g,I,R){if(r.visible===!1)return;if(r.layers.test(g.layers)){if(r.isGroup)I=r.renderOrder;else if(r.isLOD)r.autoUpdate===!0&&r.update(g);else if(r.isLight)M.pushLight(r),r.castShadow&&M.pushShadow(r);else if(r.isSprite){const _e=g.isArrayCamera?ct:Ie;if(!r.frustumCulled||r.intersectsFrustum(_e)){R&&ot.setFromMatrixPosition(r.matrixWorld).applyMatrix4(Je);const oe=$.update(r),pe=r.material;pe.visible&&C.push(r,oe,pe,I,ot.z,null,g)}}else if(r.isMesh||r.isLine||r.isPoints){const _e=g.isArrayCamera?ct:Ie;if(!r.frustumCulled||r.intersectsFrustum(_e)){const oe=$.update(r),pe=r.material;if(R&&(r.boundingSphere!==void 0?(r.boundingSphere===null&&r.computeBoundingSphere(),ot.copy(r.boundingSphere.center)):(oe.boundingSphere===null&&oe.computeBoundingSphere(),ot.copy(oe.boundingSphere.center)),ot.applyMatrix4(r.matrixWorld).applyMatrix4(Je)),Array.isArray(pe)){const Ee=oe.groups;for(let Pe=0,ye=Ee.length;Pe<ye;Pe++){const ge=Ee[Pe],Oe=pe[ge.materialIndex];Oe&&Oe.visible&&C.push(r,oe,Oe,I,ot.z,ge,g)}}else pe.visible&&C.push(r,oe,pe,I,ot.z,null,g)}}}const le=r.children;for(let _e=0,oe=le.length;_e<oe;_e++)Pn(le[_e],g,I,R)}function $n(r,g,I,R){const{opaque:P,transmissive:le,transparent:_e}=r;M.setupLightsView(I),nt===!0&&G.setGlobalState(w.clippingPlanes,I),R&&ce.viewport(ie.copy(R)),P.length>0&&pn(P,g,I),le.length>0&&pn(le,g,I),_e.length>0&&pn(_e,g,I),ce.buffers.depth.setTest(!0),ce.buffers.depth.setMask(!0),ce.buffers.color.setMask(!0),ce.setPolygonOffset(!1)}function Qn(r,g,I,R){if((I.isScene===!0?I.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[R.id]===void 0){const ge=qe.has("EXT_color_buffer_half_float")||qe.has("EXT_color_buffer_float");M.state.transmissionRenderTarget[R.id]=new wt(1,1,{generateMipmaps:!0,type:ge?yt:Dt,minFilter:kt,samples:Math.max(4,Ze.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:et.workingColorSpace})}const le=M.state.transmissionRenderTarget[R.id],_e=R.viewport||ie;le.setSize(_e.z*w.transmissionResolutionScale,_e.w*w.transmissionResolutionScale);const oe=w.getRenderTarget(),pe=w.getActiveCubeFace(),Ee=w.getActiveMipmapLevel();w.setRenderTarget(le),w.getClearColor(k),he=w.getClearAlpha(),he<1&&w.setClearColor(16777215,.5),w.clear(),Mt&&h.render(I);const Pe=w.toneMapping;w.toneMapping=It;const ye=R.viewport;if(R.viewport!==void 0&&(R.viewport=void 0),M.setupLightsView(R),nt===!0&&G.setGlobalState(w.clippingPlanes,R),pn(r,I,R),Ce.updateMultisampleRenderTarget(le),Ce.updateRenderTargetMipmap(le),qe.has("WEBGL_multisampled_render_to_texture")===!1){let ge=!1;for(let Oe=0,tt=g.length;Oe<tt;Oe++){const Xe=g[Oe],{object:ze,geometry:dt,material:ve,group:pt}=Xe;if(ve.side===Nt&&ze.layers.test(R.layers)){const He=ve.side;ve.side=St,ve.needsUpdate=!0,Jn(ze,I,R,dt,ve,pt),ve.side=He,ve.needsUpdate=!0,ge=!0}}ge===!0&&(Ce.updateMultisampleRenderTarget(le),Ce.updateRenderTargetMipmap(le))}w.setRenderTarget(oe,pe,Ee),w.setClearColor(k,he),ye!==void 0&&(R.viewport=ye),w.toneMapping=Pe}function pn(r,g,I){const R=g.isScene===!0?g.overrideMaterial:null;for(let P=0,le=r.length;P<le;P++){const _e=r[P],{object:oe,geometry:pe,group:Ee}=_e;let Pe=_e.material;Pe.allowOverride===!0&&R!==null&&(Pe=R),oe.layers.test(I.layers)&&Jn(oe,g,I,pe,Pe,Ee)}}function Jn(r,g,I,R,P,le){X!==null&&P.isNodeMaterial&&X.setObject(r,P),r.onBeforeRender(w,g,I,R,P,le),r.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,r.matrixWorld),r.normalMatrix.getNormalMatrix(r.modelViewMatrix),P.onBeforeRender(w,g,I,R,r,le),P.transparent===!0&&P.side===Nt&&P.forceSinglePass===!1?(P.side=St,P.needsUpdate=!0,w.renderBufferDirect(I,g,R,P,r,le),P.side=ln,P.needsUpdate=!0,w.renderBufferDirect(I,g,R,P,r,le),P.side=Nt):w.renderBufferDirect(I,g,R,P,r,le),r.onAfterRender(w,g,I,R,P,le)}function jn(r){let g=0;for(const I of r)I.texture!==null&&g++;return g}function tn(r,g,I){g.isScene!==!0&&(g=Et);const R=Te.get(r),P=M.state.lights,le=M.state.shadowsArray,_e=P.state.version,oe=z.getParameters(r,P.state,le,g,I,M.state.lightProbeGridArray),pe=z.getProgramCacheKey(oe);let Ee=R.programs;R.environment=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?g.environment:null,R.fog=g.fog;const Pe=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap;R.envMap=u.get(r.envMap||R.environment,Pe),R.envMapRotation=R.environment!==null&&r.envMap===null?g.environmentRotation:r.envMapRotation,Ee===void 0&&(r.addEventListener("dispose",Ve),Ee=new Map,R.programs=Ee,R.programVariants=new Map);let ye=Ee.get(pe);if(ye!==void 0){if(R.currentProgram===ye&&R.lightsStateVersion===_e)return ti(r,oe),ye}else oe.uniforms=z.getUniforms(r),X!==null&&r.isNodeMaterial&&X.build(r,I,oe),r.onBeforeCompile(oe,w),ye=z.acquireProgram(oe,pe),Ee.set(pe,ye),R.uniforms=oe.uniforms;const ge=R.uniforms;return(!r.isShaderMaterial&&!r.isRawShaderMaterial||r.clipping===!0)&&(ge.clippingPlanes=G.uniform),ti(r,oe),R.needsLights=er(r),R.lightsStateVersion=_e,R.needsLights&&(ge.ambientLightColor.value=P.state.ambient,ge.lightProbe.value=P.state.probe,ge.sunLights.value=P.state.sun,ge.sunLightShadows.value=P.state.sunShadow,ge.directionalLights.value=P.state.directional,ge.directionalLightShadows.value=P.state.directionalShadow,ge.spotLights.value=P.state.spot,ge.spotLightShadows.value=P.state.spotShadow,ge.rectAreaLights.value=P.state.rectArea,ge.ltc_1.value=P.state.rectAreaLTC1,ge.ltc_2.value=P.state.rectAreaLTC2,ge.pointLights.value=P.state.point,ge.pointLightShadows.value=P.state.pointShadow,ge.hemisphereLights.value=P.state.hemi,ge.sunShadowMatrix.value=P.state.sunShadowMatrix,ge.sunShadowCascade.value=P.state.sunShadowCascade,ge.directionalShadowMatrix.value=P.state.directionalShadowMatrix,ge.spotLightMatrix.value=P.state.spotLightMatrix,ge.spotLightMap.value=P.state.spotLightMap,ge.pointShadowMatrix.value=P.state.pointShadowMatrix),R.numLightProbeGrids=jn(M.state.lightProbeGridArray),R.currentProgram=ye,R.uniformsList=null,ye}function Qa(r,g,I,R,P){const le=Te.get(r),_e=le.currentProgram.id+","+R+","+P;let oe=le.programVariants.get(_e);return oe===void 0?(oe=tn(r,g,I),le.programVariants.set(_e,oe)):(le.currentProgram=oe,le.uniformsList=null,le.outputColorSpace=R,le.toneMapping=P),oe}function ei(r){if(r.uniformsList===null){const g=r.currentProgram.getUniforms();r.uniformsList=En.seqWithValue(g.seq,r.uniforms)}return r.uniformsList}function ti(r,g){const I=Te.get(r);I.outputColorSpace=g.outputColorSpace,I.batching=g.batching,I.batchingColor=g.batchingColor,I.instancing=g.instancing,I.instancingColor=g.instancingColor,I.instancingMorph=g.instancingMorph,I.skinning=g.skinning,I.morphTargets=g.morphTargets,I.morphNormals=g.morphNormals,I.morphColors=g.morphColors,I.morphTargetsCount=g.morphTargetsCount,I.numClippingPlanes=g.numClippingPlanes,I.numIntersection=g.numClipIntersection,I.vertexAlphas=g.vertexAlphas,I.vertexTangents=g.vertexTangents,I.toneMapping=g.toneMapping}function Ja(r,g,I,R,P){g.isScene!==!0&&(g=Et),Ce.resetTextureUnits();const le=g.fog,_e=R.isMeshStandardMaterial||R.isMeshLambertMaterial||R.isMeshPhongMaterial?g.environment:null,oe=fe===null?w.outputColorSpace:fe.isXRRenderTarget===!0?fe.texture.colorSpace:et.workingColorSpace,pe=R.isMeshStandardMaterial||R.isMeshLambertMaterial&&!R.envMap||R.isMeshPhongMaterial&&!R.envMap,Ee=u.get(R.envMap||_e,pe),Pe=R.vertexColors===!0&&!!I.attributes.color&&I.attributes.color.itemSize===4,ye=!!I.attributes.tangent&&(!!R.normalMap||R.anisotropy>0),ge=!!I.morphAttributes.position,Oe=!!I.morphAttributes.normal,tt=!!I.morphAttributes.color;let Xe=It;R.toneMapped&&(fe===null||fe.isXRRenderTarget===!0)&&(Xe=w.toneMapping);const ze=I.morphAttributes.position||I.morphAttributes.normal||I.morphAttributes.color,dt=ze!==void 0?ze.length:0,ve=Te.get(R),pt=M.state.lights;if(nt===!0&&(mt===!0||r!==j)){const je=r===j&&R.id===K;G.setState(R,r,je)}let He=!1,Vt=!1;R.version===ve.__version?ve.needsLights&&ve.lightsStateVersion!==pt.state.version||P.isBatchedMesh&&ve.batching===!1||!P.isBatchedMesh&&ve.batching===!0||P.isBatchedMesh&&ve.batchingColor===!0&&P._colorsTexture===null||P.isBatchedMesh&&ve.batchingColor===!1&&P._colorsTexture!==null||P.isInstancedMesh&&ve.instancing===!1||!P.isInstancedMesh&&ve.instancing===!0||P.isSkinnedMesh&&ve.skinning===!1||!P.isSkinnedMesh&&ve.skinning===!0||P.isInstancedMesh&&ve.instancingColor===!0&&P.instanceColor===null||P.isInstancedMesh&&ve.instancingColor===!1&&P.instanceColor!==null||P.isInstancedMesh&&ve.instancingMorph===!0&&P.morphTexture===null||P.isInstancedMesh&&ve.instancingMorph===!1&&P.morphTexture!==null||ve.envMap!==Ee||R.fog===!0&&ve.fog!==le||ve.numClippingPlanes!==void 0&&(ve.numClippingPlanes!==G.numPlanes||ve.numIntersection!==G.numIntersection)||ve.vertexAlphas!==Pe||ve.vertexTangents!==ye||ve.morphTargets!==ge||ve.morphNormals!==Oe||ve.morphColors!==tt||ve.morphTargetsCount!==dt||ve.numLightProbeGrids!==jn(M.state.lightProbeGridArray)?He=!0:(ve.outputColorSpace!==oe||ve.toneMapping!==Xe)&&(Vt=!0):(He=!0,ve.__version=R.version);let ut=ve.currentProgram;(He===!0||Vt===!0)&&(ut=Vt===!0?Qa(R,g,P,oe,Xe):tn(R,g,P),X&&R.isNodeMaterial&&X.onUpdateProgram(R,ut,ve));let hn=!1,Ft=!1,Wt=!1;const Be=ut.getUniforms(),ft=ve.uniforms;if(ce.useProgram(ut.program)&&(hn=!0,Ft=!0,Wt=!0),R.id!==K&&(K=R.id,Ft=!0),hn||j!==r){ce.buffers.depth.getReversed()&&r.reversedDepth!==!0&&(r._reversedDepth=!0,r.updateProjectionMatrix()),Be.setValue(T,"projectionMatrix",r.projectionMatrix),Be.setValue(T,"viewMatrix",r.matrixWorldInverse);const lt=Be.map.cameraPosition;lt!==void 0&&lt.setValue(T,Ct.setFromMatrixPosition(r.matrixWorld)),Ze.logarithmicDepthBuffer&&Be.setValue(T,"logDepthBufFC",2/(Math.log(r.far+1)/Math.LN2)),(R.isMeshPhongMaterial||R.isMeshToonMaterial||R.isMeshLambertMaterial||R.isMeshBasicMaterial||R.isMeshStandardMaterial||R.isShaderMaterial)&&Be.setValue(T,"isOrthographic",r.isOrthographicCamera===!0),j!==r&&(j=r,Ft=!0,Wt=!0)}if(ve.needsLights&&(pt.state.sunShadowMap.length>0&&Be.setValue(T,"sunShadowMap",pt.state.sunShadowMap,Ce),pt.state.directionalShadowMap.length>0&&Be.setValue(T,"directionalShadowMap",pt.state.directionalShadowMap,Ce),pt.state.spotShadowMap.length>0&&Be.setValue(T,"spotShadowMap",pt.state.spotShadowMap,Ce),pt.state.pointShadowMap.length>0&&Be.setValue(T,"pointShadowMap",pt.state.pointShadowMap,Ce)),P.isSkinnedMesh){Be.setOptional(T,P,"bindMatrix"),Be.setOptional(T,P,"bindMatrixInverse");const je=P.skeleton;je&&(je.boneTexture===null&&je.computeBoneTexture(),Be.setValue(T,"boneTexture",je.boneTexture,Ce))}P.isBatchedMesh&&(Be.setOptional(T,P,"batchingTexture"),Be.setValue(T,"batchingTexture",P._matricesTexture,Ce),Be.setOptional(T,P,"batchingIdTexture"),Be.setValue(T,"batchingIdTexture",P._indirectTexture,Ce),Be.setOptional(T,P,"batchingColorTexture"),P._colorsTexture!==null&&Be.setValue(T,"batchingColorTexture",P._colorsTexture,Ce));const Rt=I.morphAttributes;if((Rt.position!==void 0||Rt.normal!==void 0||Rt.color!==void 0)&&V.update(P,I,ut),(Ft||ve.receiveShadow!==P.receiveShadow)&&(ve.receiveShadow=P.receiveShadow,Be.setValue(T,"receiveShadow",P.receiveShadow)),(R.isMeshStandardMaterial||R.isMeshLambertMaterial||R.isMeshPhongMaterial)&&R.envMap===null&&g.environment!==null&&(ft.envMapIntensity.value=g.environmentIntensity),ft.dfgLUT!==void 0&&(ft.dfgLUT.value=hd()),Ft){if(Be.setValue(T,"toneMappingExposure",w.toneMappingExposure),ve.needsLights&&ja(ft,Wt),le&&R.fog===!0&&te.refreshFogUniforms(ft,le),te.refreshMaterialUniforms(ft,R,me,Re,M.state.transmissionRenderTarget[r.id]),ve.needsLights&&ve.numLightProbeGrids>0){const je=x;let lt=0;for(const Ut of M.state.lightProbeGridArray)Ut.texture!==null&&(je.textures[lt]=Ut.texture,je.min[lt]=Ut.boundingBox.min,je.max[lt]=Ut.boundingBox.max,je.resolution[lt]=Ut.resolution,lt++);for(const Ut in je)je[Ut].length=lt;ft.probesSH.value=je.textures,ft.probesMin.value=je.min,ft.probesMax.value=je.max,ft.probesResolution.value=je.resolution}En.upload(T,ei(ve),ft,Ce)}if(R.isShaderMaterial&&R.uniformsNeedUpdate===!0&&(En.upload(T,ei(ve),ft,Ce),R.uniformsNeedUpdate=!1),R.isSpriteMaterial&&Be.setValue(T,"center",P.center),Be.setValue(T,"modelViewMatrix",P.modelViewMatrix),Be.setValue(T,"normalMatrix",P.normalMatrix),Be.setValue(T,"modelMatrix",P.matrixWorld),R.uniformsGroups!==void 0){const je=R.uniformsGroups;for(let lt=0,Ut=je.length;lt<Ut;lt++){const ii=je[lt];Me.update(ii,ut),Me.bind(ii,ut)}}return ut}function ja(r,g){r.ambientLightColor.needsUpdate=g,r.lightProbe.needsUpdate=g,r.sunLights.needsUpdate=g,r.sunLightShadows.needsUpdate=g,r.directionalLights.needsUpdate=g,r.directionalLightShadows.needsUpdate=g,r.pointLights.needsUpdate=g,r.pointLightShadows.needsUpdate=g,r.spotLights.needsUpdate=g,r.spotLightShadows.needsUpdate=g,r.rectAreaLights.needsUpdate=g,r.hemisphereLights.needsUpdate=g}function er(r){return r.isMeshLambertMaterial||r.isMeshToonMaterial||r.isMeshPhongMaterial||r.isMeshStandardMaterial||r.isShadowMaterial||r.isShaderMaterial&&r.lights===!0}this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return H},this.getRenderTarget=function(){return fe},this.setRenderTargetTextures=function(r,g,I){const R=Te.get(r);R.__autoAllocateDepthBuffer=r.resolveDepthBuffer===!1,R.__autoAllocateDepthBuffer===!1&&(R.__useRenderToTexture=!1),Te.get(r.texture).__webglTexture=g,Te.get(r.depthTexture).__webglTexture=R.__autoAllocateDepthBuffer?void 0:I,R.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(r,g){const I=Te.get(r);I.__webglFramebuffer=g,I.__useDefaultFramebuffer=g===void 0},this.setRenderTarget=function(r,g=0,I=0){fe=r,q=g,H=I;let R=null,P=!1,le=!1;if(r){const oe=Te.get(r);if(oe.__useDefaultFramebuffer!==void 0){ce.bindFramebuffer(T.FRAMEBUFFER,oe.__webglFramebuffer),ie.copy(r.viewport),Ae.copy(r.scissor),Ne=r.scissorTest,ce.viewport(ie),ce.scissor(Ae),ce.setScissorTest(Ne),K=-1;return}else if(oe.__webglFramebuffer===void 0)Ce.setupRenderTarget(r);else if(oe.__hasExternalTextures)Ce.rebindTextures(r,Te.get(r.texture).__webglTexture,Te.get(r.depthTexture).__webglTexture);else if(r.depthBuffer){const Pe=r.depthTexture;if(oe.__boundDepthTexture!==Pe){if(Pe!==null&&Te.has(Pe)&&(r.width!==Pe.image.width||r.height!==Pe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Ce.setupDepthRenderbuffer(r)}}const pe=r.texture;(pe.isData3DTexture||pe.isDataArrayTexture||pe.isCompressedArrayTexture)&&(le=!0);const Ee=Te.get(r).__webglFramebuffer;r.isWebGLCubeRenderTarget?(Array.isArray(Ee[g])?R=Ee[g][I]:R=Ee[g],P=!0):r.samples>0&&Ce.useMultisampledRTT(r)===!1?R=Te.get(r).__webglMultisampledFramebuffer:Array.isArray(Ee)?R=Ee[I]:R=Ee,ie.copy(r.viewport),Ae.copy(r.scissor),Ne=r.scissorTest}else ie.copy(be).multiplyScalar(me).floor(),Ae.copy(Ye).multiplyScalar(me).floor(),Ne=ke;if(I!==0&&(R=Z),ce.bindFramebuffer(T.FRAMEBUFFER,R)&&ce.drawBuffers(r,R),ce.viewport(ie),ce.scissor(Ae),ce.setScissorTest(Ne),P){const oe=Te.get(r.texture);T.framebufferTexture2D(T.FRAMEBUFFER,T.COLOR_ATTACHMENT0,T.TEXTURE_CUBE_MAP_POSITIVE_X+g,oe.__webglTexture,I)}else if(le){const oe=g;for(let pe=0;pe<r.textures.length;pe++){const Ee=Te.get(r.textures[pe]);T.framebufferTextureLayer(T.FRAMEBUFFER,T.COLOR_ATTACHMENT0+pe,Ee.__webglTexture,I,oe)}}else if(r!==null&&I!==0){const oe=Te.get(r.texture);T.framebufferTexture2D(T.FRAMEBUFFER,T.COLOR_ATTACHMENT0,T.TEXTURE_2D,oe.__webglTexture,I)}K=-1};function ni(r){const g=Te.get(r);return(g.__readFormat!==r.format||g.__readType!==r.type)&&(g.__readFormat=r.format,g.__readType=r.type,g.__formatReadable=Ze.textureFormatReadable(r.format),g.__typeReadable=Ze.textureTypeReadable(r.type)),g}this.readRenderTargetPixels=function(r,g,I,R,P,le,_e,oe=0){if(!(r&&r.isWebGLRenderTarget)){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let pe=Te.get(r).__webglFramebuffer;if(r.isWebGLCubeRenderTarget&&_e!==void 0&&(pe=pe[_e],Array.isArray(pe)&&(pe=pe[0])),pe){ce.bindFramebuffer(T.FRAMEBUFFER,pe);try{const Ee=r.textures[oe],Pe=Ee.format,ye=Ee.type;r.textures.length>1&&T.readBuffer(T.COLOR_ATTACHMENT0+oe);const ge=ni(Ee);if(ge.__formatReadable===!1){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(ge.__typeReadable===!1){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}g>=0&&g<=r.width-R&&I>=0&&I<=r.height-P&&T.readPixels(g,I,R,P,ee.convert(Pe),ee.convert(ye),le)}finally{const Ee=fe!==null?Te.get(fe).__webglFramebuffer:null;ce.bindFramebuffer(T.FRAMEBUFFER,Ee)}}},this.readRenderTargetPixelsAsync=async function(r,g,I,R,P,le,_e,oe=0){if(!(r&&r.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let pe=Te.get(r).__webglFramebuffer;if(r.isWebGLCubeRenderTarget&&_e!==void 0&&(pe=pe[_e],Array.isArray(pe)&&(pe=pe[0])),pe)if(g>=0&&g<=r.width-R&&I>=0&&I<=r.height-P){ce.bindFramebuffer(T.FRAMEBUFFER,pe);const Ee=r.textures[oe],Pe=Ee.format,ye=Ee.type;r.textures.length>1&&T.readBuffer(T.COLOR_ATTACHMENT0+oe);const ge=ni(Ee);if(ge.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(ge.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Oe=T.createBuffer();T.bindBuffer(T.PIXEL_PACK_BUFFER,Oe),T.bufferData(T.PIXEL_PACK_BUFFER,le.byteLength,T.STREAM_READ),T.readPixels(g,I,R,P,ee.convert(Pe),ee.convert(ye),0),T.bindBuffer(T.PIXEL_PACK_BUFFER,null);const tt=fe!==null?Te.get(fe).__webglFramebuffer:null;ce.bindFramebuffer(T.FRAMEBUFFER,tt);const Xe=T.fenceSync(T.SYNC_GPU_COMMANDS_COMPLETE,0);return T.flush(),await rr(T,Xe,4),T.bindBuffer(T.PIXEL_PACK_BUFFER,Oe),T.getBufferSubData(T.PIXEL_PACK_BUFFER,0,le),T.bindBuffer(T.PIXEL_PACK_BUFFER,null),T.deleteBuffer(Oe),T.deleteSync(Xe),le}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(r,g=null,I=0){const R=Math.pow(2,-I),P=Math.floor(r.image.width*R),le=Math.floor(r.image.height*R),_e=g!==null?g.x:0,oe=g!==null?g.y:0;Ce.setTexture2D(r,0),T.copyTexSubImage2D(T.TEXTURE_2D,I,0,0,_e,oe,P,le),ce.unbindTexture()},this.copyTextureToTexture=function(r,g,I=null,R=null,P=0,le=0){let _e,oe,pe,Ee,Pe,ye,ge,Oe,tt;const Xe=r.isCompressedTexture?r.mipmaps[le]:r.image;if(I!==null)_e=I.max.x-I.min.x,oe=I.max.y-I.min.y,pe=I.isBox3?I.max.z-I.min.z:1,Ee=I.min.x,Pe=I.min.y,ye=I.isBox3?I.min.z:0;else{const Be=Math.pow(2,-P);_e=Math.floor(Xe.width*Be),oe=Math.floor(Xe.height*Be),r.isDataArrayTexture?pe=Xe.depth:r.isData3DTexture?pe=Math.floor(Xe.depth*Be):pe=1,Ee=0,Pe=0,ye=0}R!==null?(ge=R.x,Oe=R.y,tt=R.z):(ge=0,Oe=0,tt=0);const ze=ee.convert(g.format),dt=ee.convert(g.type);let ve;g.isData3DTexture?(Ce.setTexture3D(g,0),ve=T.TEXTURE_3D):g.isDataArrayTexture||g.isCompressedArrayTexture?(Ce.setTexture2DArray(g,0),ve=T.TEXTURE_2D_ARRAY):(Ce.setTexture2D(g,0),ve=T.TEXTURE_2D),ce.activeTexture(T.TEXTURE0),ce.pixelStorei(T.UNPACK_FLIP_Y_WEBGL,g.flipY),ce.pixelStorei(T.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),ce.pixelStorei(T.UNPACK_ALIGNMENT,g.unpackAlignment);const pt=ce.getParameter(T.UNPACK_ROW_LENGTH),He=ce.getParameter(T.UNPACK_IMAGE_HEIGHT),Vt=ce.getParameter(T.UNPACK_SKIP_PIXELS),ut=ce.getParameter(T.UNPACK_SKIP_ROWS),hn=ce.getParameter(T.UNPACK_SKIP_IMAGES);ce.pixelStorei(T.UNPACK_ROW_LENGTH,Xe.width),ce.pixelStorei(T.UNPACK_IMAGE_HEIGHT,Xe.height),ce.pixelStorei(T.UNPACK_SKIP_PIXELS,Ee),ce.pixelStorei(T.UNPACK_SKIP_ROWS,Pe),ce.pixelStorei(T.UNPACK_SKIP_IMAGES,ye);const Ft=r.isDataArrayTexture||r.isData3DTexture,Wt=g.isDataArrayTexture||g.isData3DTexture;if(r.isDepthTexture){const Be=Te.get(r),ft=Te.get(g),Rt=Te.get(Be.__renderTarget),je=Te.get(ft.__renderTarget);ce.bindFramebuffer(T.READ_FRAMEBUFFER,Rt.__webglFramebuffer),ce.bindFramebuffer(T.DRAW_FRAMEBUFFER,je.__webglFramebuffer);for(let lt=0;lt<pe;lt++)Ft&&(T.framebufferTextureLayer(T.READ_FRAMEBUFFER,T.COLOR_ATTACHMENT0,Te.get(r).__webglTexture,P,ye+lt),T.framebufferTextureLayer(T.DRAW_FRAMEBUFFER,T.COLOR_ATTACHMENT0,Te.get(g).__webglTexture,le,tt+lt)),T.blitFramebuffer(Ee,Pe,Ee+_e,Pe+oe,ge,Oe,ge+_e,Oe+oe,T.DEPTH_BUFFER_BIT,T.NEAREST);ce.bindFramebuffer(T.READ_FRAMEBUFFER,null),ce.bindFramebuffer(T.DRAW_FRAMEBUFFER,null)}else if(P!==0||r.isRenderTargetTexture||Te.has(r)){const Be=Te.get(r),ft=Te.get(g);ce.bindFramebuffer(T.READ_FRAMEBUFFER,A),ce.bindFramebuffer(T.DRAW_FRAMEBUFFER,Q);for(let Rt=0;Rt<pe;Rt++)Ft?T.framebufferTextureLayer(T.READ_FRAMEBUFFER,T.COLOR_ATTACHMENT0,Be.__webglTexture,P,ye+Rt):T.framebufferTexture2D(T.READ_FRAMEBUFFER,T.COLOR_ATTACHMENT0,T.TEXTURE_2D,Be.__webglTexture,P),Wt?T.framebufferTextureLayer(T.DRAW_FRAMEBUFFER,T.COLOR_ATTACHMENT0,ft.__webglTexture,le,tt+Rt):T.framebufferTexture2D(T.DRAW_FRAMEBUFFER,T.COLOR_ATTACHMENT0,T.TEXTURE_2D,ft.__webglTexture,le),P!==0?T.blitFramebuffer(Ee,Pe,Ee+_e,Pe+oe,ge,Oe,ge+_e,Oe+oe,T.COLOR_BUFFER_BIT,T.NEAREST):Wt?T.copyTexSubImage3D(ve,le,ge,Oe,tt+Rt,Ee,Pe,_e,oe):T.copyTexSubImage2D(ve,le,ge,Oe,Ee,Pe,_e,oe);ce.bindFramebuffer(T.READ_FRAMEBUFFER,null),ce.bindFramebuffer(T.DRAW_FRAMEBUFFER,null)}else Wt?r.isDataTexture||r.isData3DTexture?T.texSubImage3D(ve,le,ge,Oe,tt,_e,oe,pe,ze,dt,Xe.data):g.isCompressedArrayTexture?T.compressedTexSubImage3D(ve,le,ge,Oe,tt,_e,oe,pe,ze,Xe.data):T.texSubImage3D(ve,le,ge,Oe,tt,_e,oe,pe,ze,dt,Xe):r.isDataTexture?T.texSubImage2D(T.TEXTURE_2D,le,ge,Oe,_e,oe,ze,dt,Xe.data):r.isCompressedTexture?T.compressedTexSubImage2D(T.TEXTURE_2D,le,ge,Oe,Xe.width,Xe.height,ze,Xe.data):T.texSubImage2D(T.TEXTURE_2D,le,ge,Oe,_e,oe,ze,dt,Xe);ce.pixelStorei(T.UNPACK_ROW_LENGTH,pt),ce.pixelStorei(T.UNPACK_IMAGE_HEIGHT,He),ce.pixelStorei(T.UNPACK_SKIP_PIXELS,Vt),ce.pixelStorei(T.UNPACK_SKIP_ROWS,ut),ce.pixelStorei(T.UNPACK_SKIP_IMAGES,hn),le===0&&g.generateMipmaps===!0&&g.mipmapsAutoUpdate===!0&&T.generateMipmap(ve),ce.unbindTexture()},this.initRenderTarget=function(r){Te.get(r).__webglFramebuffer===void 0&&Ce.setupRenderTarget(r)},this.initTexture=function(r){r.isCubeTexture?Ce.setTextureCube(r,0):r.isData3DTexture?Ce.setTexture3D(r,0):r.isDataArrayTexture||r.isCompressedArrayTexture?Ce.setTexture2DArray(r,0):Ce.setTexture2D(r,0),ce.unbindTexture()},this.resetState=function(){q=0,H=0,fe=null,ce.reset(),ne.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ri}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(n){this._outputColorSpace=n;const t=this.getContext();t.drawingBufferColorSpace=et._getDrawingBufferColorSpace(n),t.unpackColorSpace=et._getUnpackColorSpace()}}const rn=new Ge;function At(e,n,t,i,c,s){const d=2*Math.PI*c/4,_=Math.max(s-2*c,0),N=Math.PI/4;rn.copy(n),rn[i]=0,rn.normalize();const S=.5*d/(d+_),W=1-rn.angleTo(e)/N;return Math.sign(rn[t])===1?W*S:_/(d+_)+S+S*(1-W)}class Za extends An{constructor(n=1,t=1,i=1,c=2,s=.1){const d=c*2+1;if(s=Math.min(n/2,t/2,i/2,s),super(1,1,1,d,d,d),this.type="RoundedBoxGeometry",this.parameters={width:n,height:t,depth:i,segments:c,radius:s},d===1)return;const _=this.toNonIndexed();this.index=null,this.attributes.position=_.attributes.position,this.attributes.normal=_.attributes.normal,this.attributes.uv=_.attributes.uv;const N=new Ge,S=new Ge,W=new Ge(n,t,i).divideScalar(2).subScalar(s),y=this.attributes.position.array,E=this.attributes.normal.array,v=this.attributes.uv.array,L=y.length/6,U=new Ge,f=.5/d;for(let l=0,m=0;l<y.length;l+=3,m+=2)switch(N.fromArray(y,l),S.copy(N),S.x-=Math.sign(S.x)*f,S.y-=Math.sign(S.y)*f,S.z-=Math.sign(S.z)*f,S.normalize(),y[l+0]=W.x*Math.sign(N.x)+S.x*s,y[l+1]=W.y*Math.sign(N.y)+S.y*s,y[l+2]=W.z*Math.sign(N.z)+S.z*s,E[l+0]=S.x,E[l+1]=S.y,E[l+2]=S.z,Math.floor(l/L)){case 0:U.set(1,0,0),v[m+0]=At(U,S,"z","y",s,i),v[m+1]=1-At(U,S,"y","z",s,t);break;case 1:U.set(-1,0,0),v[m+0]=1-At(U,S,"z","y",s,i),v[m+1]=1-At(U,S,"y","z",s,t);break;case 2:U.set(0,1,0),v[m+0]=1-At(U,S,"x","z",s,n),v[m+1]=At(U,S,"z","x",s,i);break;case 3:U.set(0,-1,0),v[m+0]=1-At(U,S,"x","z",s,n),v[m+1]=1-At(U,S,"z","x",s,i);break;case 4:U.set(0,0,1),v[m+0]=1-At(U,S,"x","y",s,n),v[m+1]=1-At(U,S,"y","x",s,t);break;case 5:U.set(0,0,-1),v[m+0]=At(U,S,"x","y",s,n),v[m+1]=1-At(U,S,"y","x",s,t);break}}static fromJSON(n){return new Za(n.width,n.height,n.depth,n.segments,n.radius)}}export{Za as R,_d as W};
