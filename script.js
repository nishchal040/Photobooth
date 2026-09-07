/**
 * Photobooth Studio - Main Interactive Application Logic
 */

// DOM Elements
const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const snapBtn = document.getElementById("snap");
const photosDiv = document.getElementById("photos");
const filterButtons = document.querySelectorAll(".filter-btn");
const downloadBtn = document.getElementById("download");
const flipBtn = document.getElementById("flip-btn");
const resetBtn = document.getElementById("reset-btn");
const timerToggleBtn = document.getElementById("timer-toggle");
const timerLabel = document.getElementById("timer-label");
const photoCountBadge = document.getElementById("photo-count-badge");
const flashOverlay = document.getElementById("flash-overlay");
const countdownOverlay = document.getElementById("countdown-overlay");
const cameraStatus = document.getElementById("camera-status");
const cameraErrorMsg = document.getElementById("camera-error-msg");
const retryCameraBtn = document.getElementById("retry-camera-btn");

// App State
let currentFilter = "none";
let count = 0;
const maxPhotos = 3;
const capturedPhotos = []; // Stores { dataURL, filter }
let facingMode = "user"; // "user" (front camera) or "environment" (back camera)
let isTimerActive = false;
let currentStream = null;
let audioCtx = null;

// Target capture dimensions
const CAPTURE_W = 600;
const CAPTURE_H = 450;

// Programmatic SEO Configuration Hydration
const config = window.PHOTOBOOTH_CONFIG || {};
const urlParams = new URLSearchParams(window.location.search);
const initialFilter = urlParams.get("filter") || config.defaultFilter || "none";
const stripStampText = urlParams.get("stamp") || config.stripStamp || "PHOTOBOOTH STUDIO";

if (config.themeColor) {
    document.documentElement.style.setProperty("--primary-color", config.themeColor);
}

/**
 * Initialize / Start Webcam Feed
 */
async function startCamera() {
    // Stop any existing camera stream tracks
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    cameraStatus.classList.add("hidden");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: facingMode,
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });

        currentStream = stream;
        camera.srcObject = stream;

        // Apply mirroring class if front camera
        if (facingMode === "user") {
            camera.classList.remove("unmirrored");
        } else {
            camera.classList.add("unmirrored");
        }

    } catch (err) {
        console.error("Camera access error:", err);
        cameraStatus.classList.remove("hidden");
        cameraErrorMsg.textContent = "Camera access denied or unavailable. Please enable camera permissions.";
    }
}

// Flip Camera / Mirror Toggle
flipBtn.addEventListener("click", () => {
    facingMode = (facingMode === "user") ? "environment" : "user";
    startCamera();
});

// Retry Camera Button
retryCameraBtn.addEventListener("click", startCamera);

// Timer Toggle Button
timerToggleBtn.addEventListener("click", () => {
    isTimerActive = !isTimerActive;
    timerLabel.textContent = isTimerActive ? "3s ON" : "Off";
    timerToggleBtn.style.borderColor = isTimerActive ? "var(--primary-color)" : "#E2E8F0";
});

/**
 * Synthesizer for Retro Shutter Click Sound (Web Audio API)
 */
function playShutterSound() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        
        // Click sound (Oscillator)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    } catch (e) {
        // Fallback silently if audio context blocked
    }
}

/**
 * Visual Flash Effect
 */
function triggerFlash() {
    flashOverlay.classList.add("active");
    setTimeout(() => {
        flashOverlay.classList.remove("active");
    }, 400);
}

/**
 * Capture raw video frame onto offscreen canvas
 */
function capturePhotoFrame() {
    const context = canvas.getContext("2d");
    canvas.width = CAPTURE_W;
    canvas.height = CAPTURE_H;

    const vw = camera.videoWidth || CAPTURE_W;
    const vh = camera.videoHeight || CAPTURE_H;

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

    context.save();

    // Mirror image on canvas if front-facing camera active
    if (facingMode === "user") {
        context.translate(CAPTURE_W, 0);
        context.scale(-1, 1);
    }

    context.drawImage(camera, sx, sy, sw, sh, 0, 0, CAPTURE_W, CAPTURE_H);
    context.restore();

    return canvas.toDataURL("image/png");
}

/**
 * Process Snap Photo Event with optional countdown
 */
function handleSnap() {
    if (count >= maxPhotos) return;

    if (isTimerActive) {
        runCountdown(3, () => {
            executePhotoCapture();
        });
    } else {
        executePhotoCapture();
    }
}

function runCountdown(seconds, onComplete) {
    snapBtn.disabled = true;
    countdownOverlay.classList.remove("hidden");
    let currentSecond = seconds;
    countdownOverlay.textContent = currentSecond;

    const interval = setInterval(() => {
        currentSecond--;
        if (currentSecond > 0) {
            countdownOverlay.textContent = currentSecond;
        } else {
            clearInterval(interval);
            countdownOverlay.classList.add("hidden");
            onComplete();
        }
    }, 1000);
}

function executePhotoCapture() {
    playShutterSound();
    triggerFlash();

    const imgData = capturePhotoFrame();
    capturedPhotos.push({
        dataURL: imgData,
        filter: currentFilter
    });

    // Remove empty placeholder if first photo
    if (count === 0) {
        photosDiv.innerHTML = "";
    }

    // Append photo thumbnail to strip
    const img = document.createElement("img");
    img.src = imgData;
    img.classList.add("photo");
    img.style.filter = currentFilter;
    photosDiv.appendChild(img);

    count++;
    photoCountBadge.textContent = `${count}/${maxPhotos}`;

    if (count >= maxPhotos) {
        snapBtn.disabled = true;
        snapBtn.textContent = "Done!";
    } else {
        snapBtn.disabled = false;
        snapBtn.textContent = "Cheese!";
    }
}

snapBtn.addEventListener("click", handleSnap);

/**
 * Filter Selection Handler
 */
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;

        // Apply filter live to video feed & existing thumbnails
        camera.style.filter = currentFilter;

        const thumbnails = document.querySelectorAll("#photos .photo");
        thumbnails.forEach(img => {
            img.style.filter = currentFilter;
        });
    });
});

/**
 * Reset / Retake Photostrip
 */
function resetPhotostrip() {
    count = 0;
    capturedPhotos.length = 0;

    snapBtn.disabled = false;
    snapBtn.textContent = "Cheese!";
    photoCountBadge.textContent = `0/${maxPhotos}`;

    photosDiv.innerHTML = `
        <div class="empty-placeholder">
            <span>Press "Cheese!" to take your 1st photo</span>
        </div>
    `;
}

resetBtn.addEventListener("click", resetPhotostrip);

/**
 * High-Resolution Photostrip Download Handler
 */
downloadBtn.addEventListener("click", () => {
    if (capturedPhotos.length === 0) {
        alert("Please take at least one photo before downloading!");
        return;
    }

    const stripW = 500;
    const photoW = 440;
    const photoH = 330;
    const padTop = 90;
    const padSide = 30;
    const gap = 20;
    const padBottom = 80;

    const totalH = padTop + (capturedPhotos.length * photoH) + ((capturedPhotos.length - 1) * gap) + padBottom;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = stripW;
    exportCanvas.height = totalH;
    const ctx = exportCanvas.getContext("2d");

    // Clean white card background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, stripW, totalH);

    // Header branding
    const themeBrandColor = config.themeColor || "#D4537E";
    ctx.fillStyle = themeBrandColor;
    ctx.font = "bold 26px 'Chewy', cursive, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`📷 ${stripStampText}`, stripW / 2, 50);

    // Date stamp
    ctx.fillStyle = "#A0AEC0";
    ctx.font = "14px 'Outfit', sans-serif";
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    ctx.fillText(dateStr, stripW / 2, 72);

    let loadedCount = 0;

    capturedPhotos.forEach((item, index) => {
        const img = new Image();
        img.onload = () => {
            const x = padSide;
            const y = padTop + index * (photoH + gap);

            // Draw subtle border around photo slot
            ctx.fillStyle = "#F7FAFC";
            ctx.fillRect(x - 4, y - 4, photoW + 8, photoH + 8);

            ctx.save();
            ctx.filter = (currentFilter && currentFilter !== "none") ? currentFilter : "none";
            ctx.drawImage(img, x, y, photoW, photoH);
            ctx.restore();

            loadedCount++;

            if (loadedCount === capturedPhotos.length) {
                // Footer credit
                ctx.fillStyle = "#CBD5E0";
                ctx.font = "13px 'Outfit', sans-serif";
                ctx.fillText("photobooth.app • retro photo strip", stripW / 2, totalH - 30);

                // Download link trigger
                const link = document.createElement("a");
                const safeSlug = (config.slug || "photobooth").replace(/[^a-z0-9]/gi, "-").toLowerCase();
                link.download = `${safeSlug}-strip-${Date.now()}.png`;
                link.href = exportCanvas.toDataURL("image/png");
                link.click();
            }
        };
        img.src = item.dataURL;
    });
});

/**
 * Initialize Preset Filters & UI Configuration
 */
function initializeConfigPreset() {
    // Update strip brand text label if present in DOM
    const stripBrandEl = document.querySelector(".strip-brand");
    if (stripBrandEl && stripStampText) {
        stripBrandEl.textContent = `📷 ${stripStampText}`;
    }

    // Apply preset filter if specified
    if (initialFilter && initialFilter !== "none") {
        currentFilter = initialFilter;
        camera.style.filter = currentFilter;

        // Update active button
        let matched = false;
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === initialFilter) {
                filterButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                matched = true;
            }
        });

        if (!matched && initialFilter) {
            // If custom filter string, keep camera filtered
            camera.style.filter = initialFilter;
        }
    }

    // Interactive FAQ Accordion setup
    const faqQuestions = document.querySelectorAll(".faq-item-question");
    faqQuestions.forEach(q => {
        q.addEventListener("click", () => {
            const parent = q.closest(".faq-item");
            if (parent) {
                const isOpen = parent.classList.contains("active");
                document.querySelectorAll(".faq-item").forEach(item => item.classList.remove("active"));
                if (!isOpen) {
                    parent.classList.add("active");
                }
            }
        });
    });
}

// Run configuration initialization
initializeConfigPreset();

// Initialize Camera on Load
startCamera();

