'use strict'

import { RenderTexture } from './js/utils/texture.js'

class FrameBufferObject
{
    constructor( gl )
    {
        // Create and bind the framebuffer
        this.fb = gl.createFramebuffer()
        this.color_tex = new RenderTexture(gl)
        this.depth_tex = new RenderTexture(gl, gl.DEPTH_COMPONENT32F, gl.DEPTH_COMPONENT, gl.FLOAT)
    }

    resize( gl, width, height )
    {
        this.width = width
        this.height = height

        this.bindFramebuffer( gl )

        // "Bind" the newly created texture : all future texture functions will modify this texture
        {
            this.color_tex.resize( gl, width, height )
            // Set our color attachement #0
            const texture = this.color_tex.getGlTexture()
            const attachment_point = gl.COLOR_ATTACHMENT0
            const level = 0
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment_point, gl.TEXTURE_2D, texture, level)
        }

        // The depth buffer
        {
            this.depth_tex.resize( gl, width, height )
            // Set our depth attachement
            const texture = this.depth_tex.getGlTexture()
            const attachment_point = gl.DEPTH_ATTACHMENT
            const level = 0
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment_point, gl.TEXTURE_2D, texture, level)
        }

        // Set the list of draw buffers.
        const draw_buffers = [ gl.COLOR_ATTACHMENT0 ]
        gl.drawBuffers(draw_buffers)

        // Always check that our framebuffer is ok
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
        if (status != gl.FRAMEBUFFER_COMPLETE) {
            // throw new Error("framebuffer object incomplete")
            if (status == gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT) {
                throw new Error("framebuffer object incomplete, FRAMEBUFFER_INCOMPLETE_ATTACHMENT")
            }
            if (status == gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT) {
                throw new Error("framebuffer object incomplete, FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT")
            }
            if (status == gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS) {
                throw new Error("framebuffer object incomplete, FRAMEBUFFER_INCOMPLETE_DIMENSIONS")
            }
            if (status == gl.FRAMEBUFFER_UNSUPPORTED) {
                throw new Error("framebuffer object incomplete, FRAMEBUFFER_UNSUPPORTED")
            }
            if (status == gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE) {
                throw new Error("framebuffer object incomplete, FRAMEBUFFER_INCOMPLETE_MULTISAMPLE")
            }
        }

        // Switch back to the default framebuffer
        this.unbindFramebuffer( gl )
    }

    bindFramebuffer( gl ) // Switch to our framebuffer for rendering
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb)
    }

    unbindFramebuffer( gl ) // Switch back to the default framebuffer
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    getColorTexture( )
    {
        return this.color_tex.getGlTexture()
    }

    getDepthTexture( )
    {
        return this.depth_tex.getGlTexture()
    }

    clear( gl )
    {
        gl.deleteFramebuffer(this.fb)
        gl.deleteTexture(this.color_tex.getGlTexture())
        gl.deleteTexture(this.depth_tex.getGlTexture())
    }

    toHTMLImage(gl, preview) 
    {
        if (this.width  === undefined) return
        if (this.height === undefined) return

        // Copy data from OpenGL to an Array
        this.bindFramebuffer(gl)
        
        // Read the contents of the framebuffer
        let data = new Uint8Array(this.width * this.height * 4)
        gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, data)

        this.unbindFramebuffer(gl)

        // Create a 2D canvas to store the result 
        let canvas = document.createElement('canvas')
        canvas.width  = this.width
        canvas.height = this.height
        let context = canvas.getContext('2d')

        // Copy the pixels to a 2D canvas
        let image_data = context.createImageData(this.width, this.height)
        image_data.data.set(data)
        context.translate(0, this.height)
        context.scale(1, -1)
        context.putImageData(image_data, 0, 0)
        context.drawImage(canvas, 0, 0)

        var img = preview.getElementsByTagName("img")[0]
        img.src = canvas.toDataURL()
    }
}

export default FrameBufferObject
