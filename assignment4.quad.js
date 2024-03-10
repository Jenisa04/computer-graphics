'use strict'

import { ObjectStatic } from './js/utils/object3d.js'
import { RenderTexture } from './js/utils/texture.js'

class Quad extends ObjectStatic {

    /**
     * Creates a 3D box from 8 vertices and draws it as a line mesh
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Shader} shader The shader to be used to draw the object
     */
    constructor( gl, shader ) 
    {
        let vertices = [
            -1.000000, -1.000000, 0.000000,
             1.000000, -1.000000, 0.000000,
             1.000000,  1.000000, 0.000000,
            -1.000000,  1.000000, 0.000000
        ]

        let indices = [
            0, 1, 2,
            0, 2, 3
        ]

        super( gl, vertices, indices, gl.TRIANGLES )
        super.setShader( gl, shader )
    }

    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {*} color_texture 
     * @param {*} depth_texture 
     */
    render( gl, filter_mode = 0, color_texture = null, depth_texture = null )
    {
        this.shader.use( )

        // 0 = pass through mode, 1 = sobel filter, 2 = depth
        this.shader.setUniform1i('filter_mode', filter_mode)

        // Other parameters
        this.shader.setUniform1f('depth_scaling', 0.2)
        this.shader.setUniform1f('near', 0.01)
        this.shader.setUniform1f('far',  100.0)

        // Set up texture units
        this.shader.setUniform1i('color_texture', 0)
        this.shader.setUniform1i('depth_texture', 1)

        // Activate and pass texture units if textures are present in the material
        if (color_texture) 
        {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, color_texture)
        }

        if (depth_texture) {
            gl.activeTexture(gl.TEXTURE1)
            gl.bindTexture(gl.TEXTURE_2D, depth_texture)
        }

        this.shader.unuse( )

        super.render( gl )

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, null)
    }
}

export default Quad
