function findBlobs(diffMatrix, xSize, ySize, threshBlob) {
    let x, y;
    let pos = 1;
    let returnValues = {numberOfUnique: 0, data: new Array(xSize * ySize)};


    const blobMap = [];
    let label = 1;

    let labelTable = [0];

    for (y = 0; y < ySize; y++) {
        blobMap.push([]);
        for (x = 0; x < xSize; x++) {
            blobMap[y].push(0);
        }
    }

    let nn, nw, ne, ww, ee, sw, ss, se, minIndex;
    let isVisible = 0;

    let nIter = 2;
    while (nIter--) {

        for (y = 1; y < ySize - 1; y++) {
            for (x = 1; x < xSize - 1; x++) {

                pos = (y * xSize + x);


                isVisible = (diffMatrix[pos] >= threshBlob);


                if (isVisible) {


                    nw = blobMap[y - 1][x - 1] || 0;
                    nn = blobMap[y - 1][x - 0] || 0;
                    ne = blobMap[y - 1][x + 1] || 0;
                    ww = blobMap[y - 0][x - 1] || 0;
                    ee = blobMap[y - 0][x + 1] || 0;
                    sw = blobMap[y + 1][x - 1] || 0;
                    ss = blobMap[y + 1][x - 0] || 0;
                    se = blobMap[y + 1][x + 1] || 0;
                    minIndex = ww;
                    if (0 < ww && ww < minIndex) {
                        minIndex = ww;
                    }
                    if (0 < ee && ee < minIndex) {
                        minIndex = ee;
                    }
                    if (0 < nn && nn < minIndex) {
                        minIndex = nn;
                    }
                    if (0 < ne && ne < minIndex) {
                        minIndex = ne;
                    }
                    if (0 < nw && nw < minIndex) {
                        minIndex = nw;
                    }
                    if (0 < ss && ss < minIndex) {
                        minIndex = ss;
                    }
                    if (0 < se && se < minIndex) {
                        minIndex = se;
                    }
                    if (0 < sw && sw < minIndex) {
                        minIndex = sw;
                    }

                    if (minIndex === 0) {
                        blobMap[y][x] = label;
                        labelTable.push(label);
                        label += 1;

                    } else {
                        if (minIndex < labelTable[nw]) {
                            labelTable[nw] = minIndex;
                        }
                        if (minIndex < labelTable[nn]) {
                            labelTable[nn] = minIndex;
                        }
                        if (minIndex < labelTable[ne]) {
                            labelTable[ne] = minIndex;
                        }
                        if (minIndex < labelTable[ww]) {
                            labelTable[ww] = minIndex;
                        }
                        if (minIndex < labelTable[ee]) {
                            labelTable[ee] = minIndex;
                        }
                        if (minIndex < labelTable[sw]) {
                            labelTable[sw] = minIndex;
                        }
                        if (minIndex < labelTable[ss]) {
                            labelTable[ss] = minIndex;
                        }
                        if (minIndex < labelTable[se]) {
                            labelTable[se] = minIndex;
                        }

                        blobMap[y][x] = minIndex;
                    }
                }
            }


            let i = labelTable.length;
            while (i--) {
                label = labelTable[i];
                while (label !== labelTable[label]) {
                    label = labelTable[label];
                }
                labelTable[i] = label;
            }

            for (y = 0; y < ySize; y++) {
                for (x = 0; x < xSize; x++) {
                    label = blobMap[y][x];
                    if (label === 0) {
                        continue;
                    }
                    while (label !== labelTable[label]) {
                        label = labelTable[label];
                    }
                    blobMap[y][x] = label;
                }
            }
            pos = 1;
            label = 1;
        }


        let uniqueLabels = unique(labelTable);
        let i = 0;
        for (label in uniqueLabels) {
            returnValues.numberOfUnique = i;
            labelTable[label] = i++;
        }

        pos = 0;
        for (y = 0; y < ySize; y++) {
            for (x = 0; x < xSize; x++, pos++) {
                label = blobMap[y][x];
                blobMap[y][x] = labelTable[label];
                returnValues.data[pos] = labelTable[label];
            }
        }

        return returnValues;

    }
    ;


    function unique(arr) {

        let value, counts = {};
        let i, l = arr.length;
        for (i = 0; i < l; i += 1) {
            value = arr[i];
            if (counts[value]) {
                counts[value] += 1;
            } else {
                counts[value] = 1;
            }
        }

        return counts;
    }
}