uniform float time;
uniform float uProgress;
uniform sampler2D uTexture;
varying vec2 vUv;

void main()	{
	vec4 img = texture2D(uTexture, vUv);

	gl_FragColor = vec4(uProgress,0.,0.,1.);
	gl_FragColor = img;
}