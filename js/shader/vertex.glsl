uniform float time;
uniform float uPulseAmount;
uniform float uWaveAmount;
varying vec2 vUv;
varying float pulse;


float PI = 3.141592653589793238;
void main() {
  vUv = uv;
  vec3 newPosition = position;
  newPosition.z += 0.1*sin(newPosition.x*PI*2.0 + time) * uWaveAmount;
  pulse = 10. * newPosition.z * uPulseAmount;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
