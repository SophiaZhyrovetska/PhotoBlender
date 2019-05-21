function findBlobs(diffMatrix, width, height, thresholdLevel){
    let x, y;
    let pos = 1;
    let returnValues = {numberOfUnique:0, data:new Array(width * height)};

    const blobMap = [];
    let label = 1;
    let labelsContainer = [0];


    for(y=0; y<height; y++){
        blobMap.push([]);
        for(x=0; x<width; x++){
            blobMap[y].push(0);
        }
    }

    // variables for 8-connectivity
    let nn, nw, ne, ww, ee, sw, ss, se, minIndex;
    let aboveThreshold = 0;

    let iterationsNumber = 2;
    while( iterationsNumber-- ){
        for( y=1; y<height-1; y++){
            for( x=1; x<width-1; x++){
                pos = (y*width+x);
                aboveThreshold = (diffMatrix[pos] >= thresholdLevel);


                if( aboveThreshold ){
                    nw = blobMap[y-1][x-1] || 0;
                    nn = blobMap[y-1][x] || 0;
                    ne = blobMap[y-1][x+1] || 0;
                    ww = blobMap[y][x-1] || 0;
                    ee = blobMap[y][x+1] || 0;
                    sw = blobMap[y+1][x-1] || 0;
                    ss = blobMap[y+1][x] || 0;
                    se = blobMap[y+1][x+1] || 0;
                    minIndex = ww;
                    if( 0 < ww && ww < minIndex ){ minIndex = ww; }
                    if( 0 < ee && ee < minIndex ){ minIndex = ee; }
                    if( 0 < nn && nn < minIndex ){ minIndex = nn; }
                    if( 0 < ne && ne < minIndex ){ minIndex = ne; }
                    if( 0 < nw && nw < minIndex ){ minIndex = nw; }
                    if( 0 < ss && ss < minIndex ){ minIndex = ss; }
                    if( 0 < se && se < minIndex ){ minIndex = se; }
                    if( 0 < sw && sw < minIndex ){ minIndex = sw; }

                    // new blob
                    if( minIndex === 0 ){
                        blobMap[y][x] = label;
                        labelsContainer.push(label);
                        label += 1;

                        // old blob
                    }else{
                        if( minIndex < labelsContainer[nw] ){ labelsContainer[nw] = minIndex; }
                        if( minIndex < labelsContainer[nn] ){ labelsContainer[nn] = minIndex; }
                        if( minIndex < labelsContainer[ne] ){ labelsContainer[ne] = minIndex; }
                        if( minIndex < labelsContainer[ww] ){ labelsContainer[ww] = minIndex; }
                        if( minIndex < labelsContainer[ee] ){ labelsContainer[ee] = minIndex; }
                        if( minIndex < labelsContainer[sw] ){ labelsContainer[sw] = minIndex; }
                        if( minIndex < labelsContainer[ss] ){ labelsContainer[ss] = minIndex; }
                        if( minIndex < labelsContainer[se] ){ labelsContainer[se] = minIndex; }

                        blobMap[y][x] = minIndex;
                    }

                }

            }
        }

        let i = labelsContainer.length;
        while( i-- ){
            label = labelsContainer[i];
            while( label !== labelsContainer[label] ){
                label = labelsContainer[label];
            }
            labelsContainer[i] = label;
        }

        // Merge blobs with multiple labels
        for(y=0; y<height; y++){
            for(x=0; x<width; x++){
                label = blobMap[y][x];
                if( label === 0 ){ continue; }
                while( label !== labelsContainer[label] ){
                    label = labelsContainer[label];
                }
                blobMap[y][x] = label;
            }
        }
        pos = 1;
        label = 1;
    }

    // normalizing numbers of labels

    let uniqueLabels = unique(labelsContainer);
    let i = 0;
    for( label in uniqueLabels ){
        returnValues.numberOfUnique = i;
        labelsContainer[label] = i++;
    }

    pos = 0;
    for(y=0; y<height; y++){
        for(x=0; x<width; x++, pos++){
            label = blobMap[y][x];
            blobMap[y][x] = labelsContainer[label];
            returnValues.data[pos] = labelsContainer[label];
        }
    }
    return returnValues;

}


function unique(arr){
    let value, counts = {};
    let i, l = arr.length;
    for( i=0; i<l; i+=1) {
        value = arr[i];
        if( counts[value] ){
            counts[value] += 1;
        }else{
            counts[value] = 1;
        }
    }

    return counts;
}