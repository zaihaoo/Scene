#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform sampler2D texture;
uniform vec2 u_size;
varying vec3 vNormals;

void main() {
    gl_FragColor = vec4(1.0);
}