
let refImage={};
let otherImage={};
let maskCanvas = document.getElementById("maskCanvas");
let resultCanvas = document.getElementById("resultCanvas");
let img1 = new Image();
let img2 = new Image();

document.getElementById("File-upload-button__to-hide").onchange = function(e) {

  img1.canvas = document.getElementById("img1Canvas");
  img2.canvas = document.getElementById("img2Canvas");
  img1.onload = drawImage;
  img2.onload = drawImage;
  img1.src = URL.createObjectURL(this.files[0]);
  img2.src = URL.createObjectURL(this.files[1]);
  let button = document.createElement("button");
  button.innerHTML = "Find difference";
  button.className = "Difference-button";
  document.body.insertBefore(button, maskCanvas);
};

function drawImage() {
  let canvas = this.canvas;
  canvas.width = this.width;
  canvas.height = this.height;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(this, 0, 0);
}

let removeImg1Select = delegateEvent(document, "#img1Canvas", "click", () => {
  let img1Canvas = document.getElementById("img1Canvas");
  img1Canvas.classList.add("canvas--selected");
  let img2Canvas = document.getElementById("img2Canvas");
  img2Canvas.classList.remove("canvas--selected");
  refImage.canvas = img1Canvas;
  otherImage.canvas = img2Canvas;
    refImage.img = img1;
    otherImage.img = img2;
});
let removeImg2Select = delegateEvent(document, "#img2Canvas", "click", () => {
  let img1Canvas = document.getElementById("img1Canvas");
  img1Canvas.classList.remove("canvas--selected");
  let img2Canvas = document.getElementById("img2Canvas");
  img2Canvas.classList.add("canvas--selected");
  refImage.canvas = img2Canvas;
  otherImage.canvas = img1Canvas;
    refImage.img = img2;
    otherImage.img = img1;
});

let removeButtonSelect = delegateEvent(
  document,
  ".Difference-button",
  "click",
  () => {
    removeImg1Select();
    removeImg2Select();
    let width = refImage.canvas.width;
    let height = refImage.canvas.height;
    let threshold = 23;
    let ctx = maskCanvas.getContext("2d");
    let diffMatrix = findDifference(
      getChannels(
        refImage.canvas.getContext("2d").getImageData(0, 0, width, height)
      ),
      getChannels(
        otherImage.canvas.getContext("2d").getImageData(0, 0, width, height)
      ),
      width,
      height
    );
    console.log(diffMatrix.data);
    console.log(diffMatrix.rows, diffMatrix.cols);
    //   let c = document.getElementById("myCanvas").getContext("2d");
    // c.putImageData(matrixToCanvas(diffMatrix, diffMatrix.rows, diffMatrix.cols, c.getImageData(0,0, diffMatrix.cols, diffMatrix.rows)),0,0);
    let blobs = findBlobs(diffMatrix.data, width, height, threshold);
    let blobsToAdd = new Set();
    maskCanvas.width = width;
    maskCanvas.height = height;
    maskCanvas.blobs = blobs.data;
    console.log(blobs);
    maskCanvas.blobsToAdd = blobsToAdd;
    ctx.putImageData(
      getMask(
        blobs,
        blobsToAdd,
        width,
        height,
        ctx.getImageData(0, 0, width, height)
      ),
      0,
      0
    );
      let button = document.createElement("button");
      button.innerHTML = "Blend";
      button.className = "Blend-button";
      document.body.insertBefore(button, resultCanvas);
  }
);

maskCanvas.addEventListener(
  "click",
  function(e) {
    let eventLocation = getEventLocation(this, e);
    let blobs = this.blobs;
    const width = this.width;
    const height = this.height;
    let context = this.getContext("2d");
    let imageData = context.getImageData(0, 0, width, height);

    // Get the data of the pixel according to the location generate by the getEventLocation function
    let pixelData = context.getImageData(eventLocation.x, eventLocation.y, 1, 1)
      .data;

    if (pixelData[0] === 255) {
      this.blobsToAdd.add(
        blobs[width * (eventLocation.y - 1) + eventLocation.x]
      );
      context.putImageData(
        getMask(blobs, this.blobsToAdd, width, height, imageData),
        0,
        0
      );
    } else if (pixelData[1] === 255) {
      this.blobsToAdd.delete(
        blobs[width * (eventLocation.y - 1) + eventLocation.x]
      );
      context.putImageData(
        getMask(blobs, this.blobsToAdd, width, height, imageData),
        0,
        0
      );
    }
  },
  false
);

delegateEvent(document, ".Blend-button", "click", () => {
    resultCanvas.width = maskCanvas.width;
    resultCanvas.height = maskCanvas.height;
    let base_size = {width:resultCanvas.width, height:resultCanvas.height};
  poissonBlendImages(refImage.canvas,otherImage.canvas, maskCanvas, resultCanvas, refImage.img, base_size);
});
