#version 300 es

// Input vertex data, different for all executions of this shader.
layout(location = 0) in vec3 a_position;

// Output data ; will be interpolated for each fragment.
out vec2 o_texture_coord;

void main() {

	o_texture_coord = (a_position.xy + vec2(1, 1)) * 0.5;

	gl_Position =  vec4(a_position,1);

}
