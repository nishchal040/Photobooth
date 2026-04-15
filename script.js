const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const snapBtn = document.getElementById("snap");
const photosDiv = document.getElementById("photos");
const filterButtons = document.querySelectorAll("#filters button");

let currentFilter = "none";
let count = 0;
const maxPhotos = 3;

const rawImageDataURLs = [];

const CAPTURE_W = 400;
const CAPTURE_H = 300;

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

        // Once metadata loads, resize video element to match actual camera aspect ratio
        camera.addEventListener("loadedmetadata", () => {
            const vw = camera.videoWidth;
            const vh = camera.videoHeight;
            const aspect = vw / vh;

            // Keep width fixed at CSS value, adjust height to match real aspect ratio
            const displayW = camera.offsetWidth || 300;
            camera.style.height = Math.round(displayW / aspect) + "px";
        });

    } catch (err) {
        console.error("Camera error:", err);
    }
}

startCamera();

function capturePhoto() {
    const context = canvas.getContext("2d");

    canvas.width = CAPTURE_W;
    canvas.height = CAPTURE_H;

    const vw = camera.videoWidth;
    const vh = camera.videoHeight;

    const targetAspect = CAPTURE_W / CAPTURE_H;
    const sourceAspect = vw / vh;

    let sx, sy, sw, sh;

    if (sourceAspect > targetAspect) {
        sh = vh;
        sw = Math.round(vh * targetAspect);
        sx = Math.round((vw - sw) / 2);
        sy = 0;
    } else {
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

    const photoW = 220;
    const photoH = Math.round(photoW * (CAPTURE_H / CAPTURE_W));

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
