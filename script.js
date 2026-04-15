const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const snapBtn = document.getElementById("snap");
const photosDiv = document.getElementById("photos");
const filterButtons = document.querySelectorAll("#filters button");
const downloadBtn = document.getElementById("download");

let currentFilter = "none";
let count = 0;
const maxPhotos = 3;

// 🎥 Start Camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 1080 },
                height: { ideal: 1080 }
            }
        });
        camera.srcObject = stream;
    } catch (err) {
        console.error("Camera error:", err);
    }
}
startCamera();

// 📸 Capture Photo (filter applied)
function capturePhoto() {
    const context = canvas.getContext("2d");

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    context.filter = currentFilter;
    context.drawImage(camera, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/png");
}

// 📸 Snap
snapBtn.addEventListener("click", () => {
    if (count >= maxPhotos) {
        alert("You already took 3 photos!");
        return;
    }

    const imgData = capturePhoto();

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

// 🎨 Filters
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentFilter = btn.dataset.filter;
    });
});

// ⬇️ Download (FINAL PERFECT VERSION)
downloadBtn.addEventListener("click", () => {
    const images = document.querySelectorAll("#photos img");

    if (images.length === 0) {
        alert("No photos to download!");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const isMobile = window.innerWidth < 600;

    // 🔥 Image box size (only image changes, padding stays same)
    const boxWidth = isMobile ? 220 : 300;
    const boxHeight = isMobile ? 180 : 220;

    const padding = 10; // matches UI    // space between photos

    canvas.width = boxWidth + padding * 2;
    canvas.height = images.length * (boxHeight + padding * 2 );

    let y = 0;

    images.forEach((img) => {
        // White background (polaroid)
        ctx.fillStyle = "white";
        ctx.fillRect(0, y, canvas.width, boxHeight + padding * 2);

        // 🔥 SCALE (no crop, no distortion)
        const scale = Math.min(
            boxWidth / img.naturalWidth,
            boxHeight / img.naturalHeight
        );

        const drawWidth = img.naturalWidth * scale;
        const drawHeight = img.naturalHeight * scale;

        const x = padding + (boxWidth - drawWidth) / 2;
        const yPos = y + padding + (boxHeight - drawHeight) / 2;

        ctx.drawImage(img, x, yPos, drawWidth, drawHeight);

        y += boxHeight + padding * 2;
    });

    // Download
    const link = document.createElement("a");
    link.download = "photobooth.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});