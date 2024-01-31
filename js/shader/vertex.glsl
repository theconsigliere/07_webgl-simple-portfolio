uniform float time;
uniform float uProgress;
uniform vec4 uCorners;
uniform vec2 uFullscreen;
uniform vec2 uOriginal;
varying vec2 vUv;
varying vec2 vSize;
float PI = 3.141592653589793238;

void main() {
  vUv = uv;
  // when sin is 0 the uProgress is 0, when uProgress is 1 the sin is 0
  float sine = sin(PI * uProgress);
  // so sine normalizes the wave animaton so at begining 0 and end 1 no waves, and in the middle 0.5 the waves are at max
  float waves = sine * 0.1 * sin(5.*length(uv) + uProgress * 10.);
// Animte between initial size and fullscreen size
  vec4 defaultState = modelMatrix * vec4( position, 1.0 );
  vec4 fullScreenState = vec4( position, 1.0 );

// Scale the fullscreen state to match the aspect ratio of the viewport
// mesh set 300, 300
  // fullScreenState.x *= uFullscreen.x / uOriginal.x;
  // fullScreenState.y *= uFullscreen.y / uOriginal.y;
// for this we have set the mesh size to 1,1 so we no longer need to divide by uOriginal
  fullScreenState.x *= uFullscreen.x;
  fullScreenState.y *= uFullscreen.y;

  // using gsap and the progress value, animate the corners seperately
  // VEC2
    // this works by between 0 - 0.5 of the progress the left side of the screen is scaled up
  // and between 0.5 - 1 the right side of the screen is scaled up
  // uCorners.x & uCorners.y is a dynamic value while uv.x is static
  //float cornerProgress = mix(uCorners.x, uCorners.y, uv.x);
  // VEC4

// animates all corners depending on progress
  float cornersProgress = mix(
    mix(uCorners.z, uCorners.w, uv.x),
    mix(uCorners.x, uCorners.y, uv.x),
    uv.y
  );

  // animate between the default state and the fullscreen state based on the corner progress
 // vec4 finalState = mix(defaultState, fullScreenState, cornerProgress);



// animate between the default state and the fullscreen state based on the corner progress
  vec4 finalState = mix(defaultState, fullScreenState, uProgress + waves);

// init and send vSize to the fragment shader as varying
 // vSize = mix(uOriginal, uFullscreen, uProgress);
  vSize = mix(uOriginal, uFullscreen, cornersProgress);

  gl_Position = projectionMatrix * viewMatrix * finalState;
}