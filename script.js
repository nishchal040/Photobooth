const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const snapBtn = document.getElementById("snap");
const photosDiv = document.getElementById("photos");
const filterButtons = document.querySelectorAll("#filters button");

let currentFilter = "none";
let count = 0;
const maxPhotos = 3;

const rawImageDataURLs = [];

// Fixed capture box — same on all devices, matches desktop .photo display size
const CAPTURE_W = 200;
const CAPTURE_H = 150;

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        camera.srcObject = stream;
    } catch (err) {
        console.error("Camera error:", err);
    }
}

startCamera();

function capturePhoto() {
    const context = canvas.getContext("2d");

    const vw = camera.videoWidth;
    const vh = camera.videoHeight;

    // Scale video to fit inside CAPTURE_W x CAPTURE_H, preserving aspect ratio (no crop)
    const scale = Math.min(CAPTURE_W / vw, CAPTURE_H / vh);
    const drawW = Math.round(vw * scale);
    const drawH = Math.round(vh * scale);

    // Center it inside the fixed box
    const offsetX = Math.round((CAPTURE_W - drawW) / 2);
    const offsetY = Math.round((CAPTURE_H - drawH) / 2);

    canvas.width = CAPTURE_W;
    canvas.height = CAPTURE_H;

    // White background so letterbox areas are white (matches polaroid look)
    context.fillStyle = "white";
    context.fillRect(0, 0, CAPTURE_W, CAPTURE_H);

    context.filter = "none";
    context.drawImage(camera, 0, 0, vw, vh, offsetX, offsetY, drawW, drawH);

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

    const photoW = CAPTURE_W;  // 200px
    const photoH = CAPTURE_H;  // 150px

    const margin = 5;
    const padTop = 50;
    const padBottom = 10;
    const padSide = 15;

    const cardW = padSide + photoW + padSide;
    const totalH = padTop
        + rawImageDataURLs.length * (photoH + margin * 2)
        + padBottom;

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = cardW;
    outputCanvas.height = totalH;
    const ctx = outputCanvas.getContext("2d");

    // White polaroid card background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, cardW, totalH);

    let loadedCount = 0;

    rawImageDataURLs.forEach((dataURL, index) => {
        const img = new Image();
        img.onload = () => {
            const x = padSide;
            const y = padTop + index * (photoH + margin * 2) + margin;

            ctx.filter = (currentFilter && currentFilter !== "none") ? currentFilter : "none";
            ctx.drawImage(img, x, y, photoW, photoH);
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
