function getChannels(imageData){
    let dptr=0, dptrSingle=0;
    let imgR_f32 = new jsfeat.matrix_t(imageData.width, imageData.height, jsfeat.F32_t | jsfeat.C1_t);
    let imgG_f32 = new jsfeat.matrix_t(imageData.width, imageData.height, jsfeat.F32_t | jsfeat.C1_t);
    let imgB_f32 = new jsfeat.matrix_t(imageData.width, imageData.height, jsfeat.F32_t | jsfeat.C1_t);
    let imgAlpha = new jsfeat.matrix_t(imageData.width, imageData.height, jsfeat.U8_t | jsfeat.C1_t);

    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++, dptr+=4, dptrSingle+=1) {
            imgR_f32.data[dptrSingle] = imageData.data[dptr];
            imgG_f32.data[dptrSingle] = imageData.data[dptr + 1];
            imgB_f32.data[dptrSingle] = imageData.data[dptr + 2];
            imgAlpha.data[dptrSingle] = imageData.data[dptr + 3];
        }
    }
    return [imgR_f32, imgG_f32, imgB_f32, imgAlpha];
};

function matrixToCanvas(matrix, rows, cols, imageData) {
    let pxl = 0;
    for (let i = 0; i < rows*cols; i++) {
        let color = Math.floor(matrix.data[i]) * 5;
        imageData.data[pxl++] = color;
        imageData.data[pxl++] = color;
        imageData.data[pxl++] = color;
        imageData.data[pxl++] = 255;
    }
    return imageData;
}

function getMask(blobsArray, addBlobsSet, imageWidth, imageHeight, imageData) {
    let pxl = 0;
    let greenChannel = 0;
    let redChannel = 0;
    for (let i = 0; i < imageWidth * imageHeight; i++) {
        if(addBlobsSet.has(blobsArray[i])){
            greenChannel = 255;
            redChannel = 0;
        }else if(blobsArray[i] === 0){
            greenChannel = 0;
            redChannel = 0;
        }else {
            greenChannel = 0;
            redChannel = 255;
        }
        imageData.data[pxl++] = redChannel;
        imageData.data[pxl++] = greenChannel;
        imageData.data[pxl++] = 0;
        imageData.data[pxl++] = 255;
    }
    return imageData;
}

