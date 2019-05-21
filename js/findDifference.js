function findDifference(img1, img2, imageWidth, imageHeight) {
    function computeGaussians() {
        const kernelSizePre = 5;
        const sigmaPre = 0.5;
        const kernelSizePost_Relative = 25;
        const sigmaPost_Relative = 3;
        const kernelSizePost = 120;
        const sigmaPost = 15;

        const dataType = jsfeat.F32_t | jsfeat.C1_t;
        let diffMatrix = new jsfeat.matrix_t(imageWidth, imageHeight, dataType);

        for (let i = 0; i < 3; i++) {
            let img1Blurred = new jsfeat.matrix_t(imageWidth, imageHeight, dataType);
            let img2Blurred = new jsfeat.matrix_t(imageWidth, imageHeight, dataType);
            jsfeat.imgproc.gaussian_blur(img1[i], img1Blurred, kernelSizePre, sigmaPre);
            jsfeat.imgproc.gaussian_blur(img2[i], img2Blurred, kernelSizePre, sigmaPre);

            //a+ = abs(img1Blurred−img2Blurred);
            let temp = numeric.sub(img1Blurred.data, img2Blurred.data);
            temp = numeric.abs(temp);
            numeric.addeq(diffMatrix.data, temp);
        }
        numeric.diveq(diffMatrix.data, 3);
        let diff_u8 = new jsfeat.matrix_t(imageWidth, imageHeight, dataType);
        let diffGaus_u8 = new jsfeat.matrix_t(imageWidth, imageHeight, dataType);
        let diffGaus_u8_r = new jsfeat.matrix_t(imageWidth, imageHeight, dataType);

        diff_u8.data = numeric.floor(diffMatrix.data);

        // do not consider nonOverlap
        let i = diffGaus_u8.cols * diffGaus_u8.rows;
        while (--i >= 0) {
            if (img2[3].data[i] === 0) {
                diff_u8.data[i] = 0;
            }
        }
        jsfeat.imgproc.gaussian_blur(diff_u8, diffGaus_u8, kernelSizePost, sigmaPost);

        return diffGaus_u8;
    }
    return computeGaussians();
}