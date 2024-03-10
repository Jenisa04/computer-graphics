#version 300 es

// Fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision".
precision mediump float;

// uniforms
uniform int filter_mode;
uniform float depth_scaling;
uniform float near;
uniform float far;

// color and depth texture uniforms
uniform sampler2D color_texture;
uniform sampler2D depth_texture;

// input from vertex shader
in vec2 o_texture_coord;

// output color
out vec4 o_fragColor;


float linearize_depth(float depth) 
{
    float z = depth * 2.0 - 1.0; // back to normalized device coordinate (NDC) 
    return depth_scaling * (2.0 * near * far) / (far + near - z * (far - near));	
}

float sobel(sampler2D tex, vec2 uv) 
{
	mat3 sx = mat3( 
		1.0,  2.0,  1.0, 
		0.0,  0.0,  0.0, 
	   -1.0, -2.0, -1.0 
	);

	mat3 sy = mat3( 
		1.0, 0.0, -1.0, 
		2.0, 0.0, -2.0, 
		1.0, 0.0, -1.0
	);

	float x = 0.0;
	float y = 0.0;
	for (int i = 0; i < 3; i++) 
	{
		for (int j = 0; j < 3; j++) 
		{
			x += sx[i][j] * texture(tex, uv + vec2(i - 1, j - 1) / 512.0).x;
			y += sy[i][j] * texture(tex, uv + vec2(i - 1, j - 1) / 512.0).x;
		}
	}

	return sqrt(x * x + y * y);
}

const vec4 crimson  = vec4(0.71875,  0.05859375, 0.0390625,  1);
const vec4 cornsilk = vec4(0.984375, 0.94140625, 0.86328125, 1);
const vec4 yellow = vec4(1.0, 0.76171875, 0.0, 1);
const vec4 white = vec4(1.0, 1.0, 1.0, 1);

void main() {

	// Identity Filter
	if (filter_mode == 0)
	{
		vec4 inputColor = texture(color_texture, o_texture_coord);
		o_fragColor = mix(inputColor, white, 0.5);
	}

	// Depth Filter
	else if (filter_mode == 1)
    {
		float depth = texture(depth_texture, o_texture_coord).r;
		o_fragColor = vec4(vec3(linearize_depth(depth)), 1);
	}

	// Sobel Filter
	else if (filter_mode == 2)
	{
		vec4 edgeColor = yellow;
		vec4 inputColor = texture(color_texture, o_texture_coord); 
		float g = sobel(color_texture, o_texture_coord);
    	o_fragColor = mix(inputColor, edgeColor, g);

		gl_FragDepth = texture(depth_texture, o_texture_coord).x;
	}

	else
	{
		o_fragColor = vec4(0,1,0,1); // debug color
	}
}
