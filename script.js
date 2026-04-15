const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const snapBtn = document.getElementById("snap");
const photosDiv = document.getElementById("photos");
const filterButtons = document.querySelectorAll("#filters button");


let currentFilter = "none";
let count = 0;
const maxPhotos = 3;

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

// 📸 Manual click
snapBtn.addEventListener("click", () => {
    if (count >= maxPhotos) {
        alert("You already took 3 photos!");
        return;
    }

    const imgData = capturePhoto();

    const img = document.createElement("img");
    img.src = imgData;
    img.classList.add("photo"); // 👈 important

    photosDiv.appendChild(img);

    count++;

    // Optional: disable button after 3 photos
    if (count === maxPhotos) {
        snapBtn.disabled = true;
        snapBtn.textContent = "Done";
    }
});

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        // UI active state
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentFilter = btn.dataset.filter;

        // 🚀 Apply filter ONLY to captured images
        const images = document.querySelectorAll("#photos img");

        images.forEach(img => {
            img.style.filter = currentFilter;
        });
    });
});


const downloadBtn = document.getElementById("download");

downloadBtn.addEventListener("click", () => {
    const images = document.querySelectorAll("#photos img");

    if (images.length === 0) {
        alert("No photos to download!");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = 300;
    const height = images.length * 220;

    canvas.width = width;
    canvas.height = height;

    let y = 0;

    images.forEach((img) => {
        // ✅ Apply selected filter while drawing
        ctx.filter = currentFilter;

        // Polaroid background
        ctx.fillStyle = "white";
        ctx.fillRect(0, y, width, 220);

        // Draw image
        ctx.drawImage(img, 20, y + 10, 260, 180);

        y += 220;
    });

    // ⬇️ Download
    const link = document.createElement("a");
    link.download = "photobooth.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});