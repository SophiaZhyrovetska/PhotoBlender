
let refImage={};
let otherImage={};
let maskCanvas = document.getElementById("maskCanvas");
let resultCanvas = document.getElementById("resultCanvas");
let img1 = new Image();
let img2 = new Image();
const canvasDefaultWidth = 654;

document.getElementById("File-upload-button__to-hide").onchange = function(e) {
    img1.canvas = document.getElementById("img1Canvas");
    img2.canvas = document.getElementById("img2Canvas");
    img1.canvas.style.display = "block";
    img2.canvas.style.display = "block";
    img1.onload = drawImage;
    img2.onload = drawImage;
    img1.src = URL.createObjectURL(this.files[0]);
    img2.src = URL.createObjectURL(this.files[1]);
    document.querySelector(".Layout__text--hidden").classList.remove("Layout__text--hidden");
    let button = document.createElement("button");
    button.innerHTML = "Find difference";
    button.className = "Button Button--difference Layout__button Grid__cell_2 Grid__cell_push-7";
    document.querySelector(".Layout__find-difference").appendChild(button);
};

function drawImage() {
  let canvas = this.canvas;
  canvas.width = this.width;
  canvas.height = this.height;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(this, 0, 0);
}

let removeImg1Select = delegateEvent(document, "#img1Canvas", "click", () => {
    console.log(1);
  let img1Canvas = document.getElementById("img1Canvas");
  img1Canvas.classList.add("Canvas--selected");
  let img2Canvas = document.getElementById("img2Canvas");
  img2Canvas.classList.remove("Canvas--selected");
  refImage.canvas = img1Canvas;
  otherImage.canvas = img2Canvas;
    refImage.img = img1;
    otherImage.img = img2;
});
let removeImg2Select = delegateEvent(document, "#img2Canvas", "click", () => {
  let img1Canvas = document.getElementById("img1Canvas");
  img1Canvas.classList.remove("Canvas--selected");
  let img2Canvas = document.getElementById("img2Canvas");
  img2Canvas.classList.add("Canvas--selected");
  refImage.canvas = img2Canvas;
  otherImage.canvas = img1Canvas;
    refImage.img = img2;
    otherImage.img = img1;
});

let removeButtonDifference = delegateEvent(
  document,
  ".Button--difference",
  "click",
  () => {
      maskCanvas.style.display = "block";
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
    let blobs = findBlobs(diffMatrix.data, width, height, threshold);
    let blobsToAdd = new Set();
    maskCanvas.width = width;
    maskCanvas.height = height;
    maskCanvas.blobs = blobs.data;
    maskCanvas.blobsToAdd = blobsToAdd;
    ctx.putImageData(
      getMask(
        blobs.data,
        blobsToAdd,
        width,
        height,
        ctx.getImageData(0, 0, width, height)
      ),
      0,
      0
    );

      document.querySelector(".Button--blend").classList.remove("Button--hidden");
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

delegateEvent(document, ".Button--blend", "click", () => {
    resultCanvas.style.display = "block";
    resultCanvas.width = maskCanvas.width;
    resultCanvas.height = maskCanvas.height;
    let base_size = {width:resultCanvas.width, height:resultCanvas.height};
  poissonBlendImages(refImage.canvas,otherImage.canvas, maskCanvas, resultCanvas, refImage.img, base_size);
});
