const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const snapBtn = document.getElementById("snap");
const photosDiv = document.getElementById("photos");
const filterButtons = document.querySelectorAll("#filters button");

let currentFilter = "none";
let count = 0;
const maxPhotos = 3;

const rawImageDataURLs = [];

// Fixed output size for every captured photo — same on all devices
const CAPTURE_W = 400;
const CAPTURE_H = 300; // 4:3 aspect ratio, consistent everywhere

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",      // front camera on mobile
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

    // Always output at fixed CAPTURE_W x CAPTURE_H regardless of device camera resolution
    canvas.width = CAPTURE_W;
    canvas.height = CAPTURE_H;

    const vw = camera.videoWidth;
    const vh = camera.videoHeight;

    // Center-crop the video feed to fill CAPTURE_W x CAPTURE_H (no stretching)
    const targetAspect = CAPTURE_W / CAPTURE_H;
    const sourceAspect = vw / vh;

    let sx, sy, sw, sh;

    if (sourceAspect > targetAspect) {
        // Video is wider than target — crop sides
        sh = vh;
        sw = Math.round(vh * targetAspect);
        sx = Math.round((vw - sw) / 2);
        sy = 0;
    } else {
        // Video is taller than target — crop top/bottom
        sw = vw;
        sh = Math.round(vw / targetAspect);
        sx = 0;
        sy = Math.round((vh - sh) / 2);
    }

    context.filter = "none";
    context.drawImage(camera, sx, sy, sw, sh, 0, 0, CAPTURE_W, CAPTURE_H);

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

    // All captured images are CAPTURE_W x CAPTURE_H (400x300)
    // Scale them down for the polaroid strip — same ratio on all devices
    const photoW = 220;
    const photoH = Math.round(photoW * (CAPTURE_H / CAPTURE_W)); // keeps 4:3 = 165px

    const margin = 6;
    const padTop = 50;
    const padBottom = 15;
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

            // Bake the selected filter into the downloaded image
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
