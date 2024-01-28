uniform float time;
uniform float progress;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;
varying float pulse;
float PI = 3.141592653589793238;
void main()	{
	vec4 img = texture2D(uTexture, vUv );
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	//gl_FragColor = vec4(vUv, pulse, 1.);

	gl_FragColor = vec4(img - pulse * 0.1);
}