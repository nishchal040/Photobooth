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

    // Scale down to max 400px wide while preserving full aspect ratio — no crop, no stretch
    const maxW = 400;
    const scale = Math.min(maxW / vw, 1);
    canvas.width = Math.round(vw * scale);
    canvas.height = Math.round(vh * scale);

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

    // Load first image to get its natural dimensions (already scaled at capture)
    const firstLoader = new Image();
    firstLoader.onload = () => {
        const photoW = firstLoader.naturalWidth;
        const photoH = firstLoader.naturalHeight;

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
    };
    firstLoader.src = rawImageDataURLs[0];
});
