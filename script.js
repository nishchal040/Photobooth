const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const snapBtn = document.getElementById("snap");
const photosDiv = document.getElementById("photos");
const filterButtons = document.querySelectorAll("#filters button");

let currentFilter = "none";
let count = 0;
const maxPhotos = 3;

const rawImageDataURLs = [];

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        camera.srcObject = stream;
    } catch (err) {
        console.error("Camera error:", err);
    }
}

startCamera();

function capturePhoto() {
    const context = canvas.getContext("2d");
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    context.filter = "none";
    context.drawImage(camera, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
}

snapBtn.addEventListener("click", () => {
    if (count >= maxPhotos) {
        alert("You already took 3 photos!");
        return;
    }

    const imgData = capturePhoto();
    rawImageDataURLs.push(imgData);

    const img = document.createElement("img");
    img.src = imgData;
    img.classList.add("photo");
    photosDiv.appendChild(img);

    count++;

    if (count === maxPhotos) {
        snapBtn.disabled = true;
        snapBtn.textContent = "Done";
    }
});

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;

        const images = document.querySelectorAll("#photos img");
        images.forEach(img => {
            img.style.filter = currentFilter;
        });
    });
});

const downloadBtn = document.getElementById("download");

downloadBtn.addEventListener("click", () => {
    if (rawImageDataURLs.length === 0) {
        alert("No photos to download!");
        return;
    }

    // Replicate exactly what the UI shows:
    // #photos div: white bg, padding-top:50px, padding-bottom:10px
    // .photo: width:200px, margin:5px on all sides
    // Image height is naturally proportional — we use the actual rendered img size

    const photoImgs = document.querySelectorAll("#photos img");

    // Use actual rendered dimensions from the DOM
    const firstImg = photoImgs[0];
    const renderedW = firstImg.offsetWidth;   // should be 200
    const renderedH = firstImg.offsetHeight;  // natural proportional height

    const margin = 5;
    const padTop = 50;
    const padBottom = 10;
    const padSide = 15; // slight side padding to match visual

    const cardW = padSide + renderedW + padSide;
    const totalH = padTop
        + rawImageDataURLs.length * (renderedH + margin * 2)
        + padBottom;

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = cardW;
    outputCanvas.height = totalH;
    const ctx = outputCanvas.getContext("2d");

    // Full white card background — this is what makes it look like the UI
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, cardW, totalH);

    let loadedCount = 0;

    rawImageDataURLs.forEach((dataURL, index) => {
        const img = new Image();
        img.onload = () => {
            const x = padSide + margin;
            const y = padTop + index * (renderedH + margin * 2) + margin;

            // Apply the currently selected filter when drawing
            ctx.filter = (currentFilter && currentFilter !== "none") ? currentFilter : "none";
            ctx.drawImage(img, x, y, renderedW - margin, renderedH);
            ctx.filter = "none";

            loadedCount++;
            if (loadedCount === rawImageDataURLs.length) {
                const link = document.createElement("a");
                link.download = "photobooth.png";
                link.href = outputCanvas.toDataURL("image/png");
                link.click();
            }
        };
        img.src = dataURL;
    });
});
