uniform float time;
uniform float uProgress;
uniform vec2 uFullscreen;
uniform vec2 uOriginal;
varying vec2 vUv;

void main() {
  vUv = uv;
// Animte between initial size and fullscreen size
  vec4 defaultState = modelMatrix * vec4( position, 1.0 );
  vec4 fullScreenState = vec4( position, 1.0 );

// Scale the fullscreen state to match the aspect ratio of the viewport
  fullScreenState.x *= uFullscreen.x / uOriginal.x;
  fullScreenState.y *= uFullscreen.y / uOriginal.y;



  vec4 finalState = mix(defaultState, fullScreenState, uProgress);

  gl_Position = projectionMatrix * viewMatrix * finalState;
}
