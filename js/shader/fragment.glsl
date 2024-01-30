uniform float time;
uniform float uProgress;
uniform sampler2D uTexture;
uniform vec2 uTextureSize;
uniform vec2 uOriginal;
varying vec2 vUv;
varying vec2 vSize;

	// calculate aspect ratio of original image and apply
vec2 getUV(vec2 uv, vec2 textureSize, vec2 quadSize)	{
	// set uv to middle
	vec2 tempUV = uv - vec2(0.5) + vec2(0.5);

    // get aspect ratios
	float quadAspect = quadSize.x / quadSize.y;
	float textureAspect = textureSize.x / textureSize.y;

	if (quadAspect > textureAspect) {
		// quad is wider than texture
		tempUV.y *= quadAspect / textureAspect;
	} else {
		// quad is taller than texture
		tempUV.x *= textureAspect / quadAspect;
	}

	return tempUV;
}

void main()	{


	vec2 correctUV = getUV(vUv, uTextureSize, uOriginal);

	vec4 img = texture2D(uTexture, correctUV);

	gl_FragColor = vec4(uProgress,0.,0.,1.);
	gl_FragColor = img;
}