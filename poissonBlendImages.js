"use strict";


let canv = document.getElementById("img1Canvas");

function initializeResultCtx(img, result_ctx, base_size) {
    let result_pixels = result_ctx.getImageData(0, 0, base_size.width, base_size.height);
    for(let i=0; i<result_pixels.data.length; i++) {
        result_pixels.data[i] = 255;
    }
    result_ctx.putImageData(result_pixels, 0, 0);
    result_ctx.drawImage(img, 0, 0, base_size.width, base_size.height);
}

let blend_position_offset = {x:0, y:0};
function adjustBlendPosition(src_ctx, mask_ctx, result_ctx, base_size) {
    let src_pixels = src_ctx.getImageData(0, 0, base_size.width, base_size.height);
    let mask_pixels = mask_ctx.getImageData(0, 0, base_size.width, base_size.height);
    let result_pixels = result_ctx.getImageData(0, 0, base_size.width, base_size.height);

    for(let y=1; y<base_size.height-1; y++) {
        for(let x=1; x<base_size.width-1; x++) {
            let p = (y*base_size.width+x)*4;
            if(mask_pixels.data[p+0]==0 && mask_pixels.data[p+1]==255 &&
                mask_pixels.data[p+2]==0 && mask_pixels.data[p+3]==255) {

                let p_offseted = p + 4*((blend_position_offset.y)*base_size.width+blend_position_offset.x);
                for(let rgb=0; rgb<3; rgb++) {
                    result_pixels.data[p_offseted+rgb] = src_pixels.data[p+rgb];
                }
            }
        }
    }
    result_ctx.putImageData(result_pixels, 0, 0);
}

function poissonBlendImages(newcanvas, srccanvas, mask_data, finalcanvas, refImage, base_size){
    base_size.width  =  srccanvas.width;
    base_size.height = 	srccanvas.height;
    initializeResultCtx(refImage, finalcanvas.getContext("2d"), base_size);
    let base_ctx 	= newcanvas.getContext("2d");
    let src_ctx  	= srccanvas.getContext("2d");
    let mask_ctx 	= mask_data.getContext("2d");
    let result_ctx 	= finalcanvas.getContext("2d");


    adjustBlendPosition(src_ctx, mask_ctx,result_ctx, base_size);

    let base_pixels = base_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);
    let src_pixels = src_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);
    let mask_pixels = mask_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);

    let result_pixels = result_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);

    let is_mixing_gradients = false;

    let dx, absx, previous_epsilon=1.0;
    let cnt=0, cntMask = 0, cntNeigbour = 0;

    do {
        dx=0; absx=0;
        for(let y=1; y<base_size.height-1; y++) {
            for(let x=1; x<base_size.width-1; x++) {

                let p = (y*base_size.width+x)*4;

                if(mask_pixels.data[p+0]==0 && mask_pixels.data[p+1]==255 &&
                    mask_pixels.data[p+2]==0 && mask_pixels.data[p+3]==255) {

                    let p_offseted = p + 4*(blend_position_offset.y*base_size.width+blend_position_offset.x);

                    let q = [((y-1)*base_size.width+x)*4, ((y+1)*base_size.width+x)*4,
                        (y*base_size.width+(x-1))*4, (y*base_size.width+(x+1))*4];
                    let num_neighbors = q.length;

                    for(let rgb=0; rgb<3; rgb++) {
                        let sum_fq = 0;
                        let sum_vpq = 0;
                        let sum_boundary = 0;

                        for(let i=0; i<num_neighbors; i++) {
                            let q_offseted = q[i] + 4*(blend_position_offset.y*base_size.width+blend_position_offset.x);

                            if(mask_pixels.data[q[i]+0]==0 && mask_pixels.data[q[i]+1]==255 &&
                                mask_pixels.data[q[i]+2]==0 && mask_pixels.data[q[i]+3]==255) {
                                sum_fq += result_pixels.data[q_offseted+rgb];
                            } else {
                                sum_boundary += base_pixels.data[q_offseted+rgb];
                            }

                            if(is_mixing_gradients && Math.abs(base_pixels.data[p_offseted+rgb]-base_pixels.data[q_offseted+rgb]) >
                                Math.abs(src_pixels.data[p+rgb]-src_pixels.data[q[i]+rgb])) {
                                sum_vpq += base_pixels.data[p_offseted+rgb]-base_pixels.data[q_offseted+rgb];
                            } else {
                                sum_vpq += src_pixels.data[p+rgb]-src_pixels.data[q[i]+rgb];
                            }
                        }
                        let new_value = (sum_fq+sum_vpq+sum_boundary)/num_neighbors;
                        dx += Math.abs(new_value-result_pixels.data[p_offseted+rgb]);
                        absx += Math.abs(new_value);
                        result_pixels.data[p_offseted+rgb] = new_value;
                    }
                }
            }
        }
        cnt++;
        let epsilon = dx/absx;
        if(!epsilon || previous_epsilon-epsilon === 0) break; // convergence

        else previous_epsilon = epsilon;
    } while(true);

    result_ctx.putImageData(result_pixels, 0, 0);
    console.log("xz"+cnt);


    return finalcanvas;
}

function blend(newcanvas, srccanvas, mask_data, finalcanvas, refImage, base_size){
    base_size.width  =  srccanvas.width;
    base_size.height = 	srccanvas.height;
    initializeResultCtx(refImage, finalcanvas.getContext("2d"), base_size);
    let base_ctx 	= newcanvas.getContext("2d");
    let src_ctx  	= srccanvas.getContext("2d");
    let mask_ctx 	= mask_data.getContext("2d");
    let result_ctx 	= finalcanvas.getContext("2d");
let base_pixels = base_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);
let src_pixels = src_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);
let mask_pixels = mask_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);
    let result_pixels = result_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);
    for (let i = 0; i <base_size.width*base_size.height*4-4 ; i++) {
        if(mask_pixels.data[i+0]==0 && mask_pixels.data[i+1]==255 &&
            mask_pixels.data[i+2]==0 && mask_pixels.data[i+3]==255) {
            result_pixels.data[i+0] = src_pixels.data[i+0];
            result_pixels.data[i+1] = src_pixels.data[i+1];
            result_pixels.data[i+2] = src_pixels.data[i+2];
            result_pixels.data[i+3] = src_pixels.data[i+3];
        }
    }
      result_ctx.putImageData(result_pixels, 0, 0);
    return finalcanvas;

}