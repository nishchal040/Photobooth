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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        camera.srcObject = stream;
    } catch (err) {
        console.error("Camera error:", err);
    }
}

startCamera();

// 📸 Capture Photo (FIXED)
function capturePhoto() {
    const context = canvas.getContext("2d");

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    // ✅ Apply filter during capture
    context.filter = currentFilter;

    context.drawImage(camera, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/png");
}

// 📸 Snap Button
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

// 🎨 Filter Buttons
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        // UI active state
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentFilter = btn.dataset.filter;
    });
});

// ⬇️ Download (FIXED + CLEAN)
downloadBtn.addEventListener("click", () => {
    const images = document.querySelectorAll("#photos img");

    if (images.length === 0) {
        alert("No photos to download!");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const imgWidth = 300;
    const imgHeight = 200;
    const padding = 20;

    canvas.width = imgWidth + padding * 2;
    canvas.height = images.length * (imgHeight + padding * 2);

    let y = 0;

    images.forEach((img, index) => {
        // Polaroid background
        ctx.fillStyle = "white";
        ctx.fillRect(0, y, canvas.width, imgHeight + padding * 2);

        // Draw image
        ctx.drawImage(
            img,
            padding,
            y + padding,
            imgWidth,
            imgHeight
        );

        // Optional: caption (🔥 makes it look pro)
        ctx.fillStyle = "#555";
        ctx.font = "14px Poppins";
        ctx.fillText(`Photo ${index + 1}`, 10, y + imgHeight + 30);

        y += imgHeight + padding * 2;
    });

    // Download image
    const link = document.createElement("a");
    link.download = "photobooth.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});