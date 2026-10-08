/**
 * Photobooth Studio - Main Interactive Application Logic
 * Supports 10 Viral Studio Modes & Templates:
 * 1. Retro Newspaper
 * 2. Y2K / 2000s Digicam
 * 3. Movie Poster
 * 4. 90s School Yearbook
 * 5. Vintage Photo Strip (4-Cut)
 * 6. Album Cover
 * 7. Character / Trading Card
 * 8. Breaking News
 * 9. Polaroid Love / Besties
 * 10. Game Character Select
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
const outputModeLabel = document.getElementById("output-mode-label");
const modeCustomizerBar = document.getElementById("mode-customizer-bar");
const viewfinderHud = document.getElementById("viewfinder-hud");
const modeTabs = document.querySelectorAll(".mode-tab");
const toggleDemoBtn = document.getElementById("toggle-demo-btn");
const demoBadgeText = document.getElementById("demo-badge-text");
const uploadPhotoInput = document.getElementById("upload-photo-input");

// Authentic high-fidelity demo assets extracted from reference templates
const DEMO_IMAGES = {
    newspaper: "assets/demo-newspaper.jpg",
    y2k: "assets/demo-y2k.jpg",
    movie: "assets/demo-movie.jpg",
    yearbook: "assets/demo-portrait.jpg",
    album: "assets/demo-album.jpg",
    strip: [
        "assets/demo-strip-1.jpg",
        "assets/demo-strip-2.jpg",
        "assets/demo-strip-3.jpg",
        "assets/demo-strip-4.jpg"
    ],
    breakingnews: "assets/demo-news.jpg",
    tradingcard: "assets/demo-tradingcard.jpg",
    comic: "assets/demo-comic.jpg",
    polaroid: "assets/demo-polaroid.jpg"
};

// 10 Viral Studio Modes Configuration
const MODES = {
    newspaper: {
        id: "newspaper",
        name: "Retro Newspaper",
        maxPhotos: 1,
        desc: "Make them the front-page story with vintage headline, date, and news columns.",
        snapLabel: "Make Front Page!",
        defaults: {
            masthead: "The Daily Times",
            headline: "LOCAL ICON MAKES HEADLINES",
            subhead: "CREATIVITY TAKES HYDERABAD BY STORM",
            name: "NISHCHAL",
            date: "OCT 6, 2026",
            colTitle: "Young Creator Inspires A New Generation",
            colStory: "With her unique ideas and positive energy, she is proving that creativity knows no limits. From online platforms to real-world impact, her journey is just getting started.",
            banner: "BIG DREAMS, BRIGHTER DAYS AHEAD."
        }
    },
    y2k: {
        id: "y2k",
        name: "Y2K Digicam",
        maxPhotos: 1,
        desc: "Harsh flash, digital timestamp, grain, and chrome 2004 aesthetic.",
        snapLabel: "Take me back to 2004 →",
        defaults: {
            name: "NISHCHAL",
            dateStamp: "OCT 06 2004",
            osd: "[+] 2004",
            camInfo: "DIGITAL CAMERA F1.8 1/60 ISO 200"
        }
    },
    movie: {
        id: "movie",
        name: "Movie Poster",
        maxPhotos: 1,
        desc: "Transform into the star of a blockbuster film with cinema billing credits.",
        snapLabel: "Star in Movie!",
        genres: ["Blockbuster", "Bollywood", "Romance", "Action", "Horror", "Hollywood"],
        defaults: {
            starName: "NISHCHAL",
            movieTitle: "MAIN CHARACTER",
            genre: "Blockbuster",
            studio: "VEBNOX PICTURES PRESENTS",
            taglineLeft: "SHE CREATES HER OWN WORLD",
            taglineRight: "A STORY OF PASSION, IDEAS AND BIGGER DREAMS",
            subCredit: "A NISHCHAL FILM",
            status: "COMING SOON"
        }
    },
    yearbook: {
        id: "yearbook",
        name: "90s Yearbook",
        maxPhotos: 1,
        desc: "Classic high school portrait with witty, shareable superlative titles.",
        snapLabel: "Snap Senior Photo!",
        superlatives: [
            "Best Smile",
            "Most Likely To Go Viral ★",
            "Most Creative",
            "Most Likely To Change The World",
            "Most Likely To Become A Millionaire",
            "Best Dressed"
        ],
        defaults: {
            schoolName: "Riverside High School",
            classYear: "CLASS OF 1996",
            studentName: "NISHCHAL",
            sup1: "Best Smile",
            sup2: "Most Likely To Go Viral ★",
            sup3: "Most Creative",
            sup4: "Most Likely To Change The World"
        }
    },
    album: {
        id: "album",
        name: "Album Cover",
        maxPhotos: 1,
        desc: "CD jewel case cover with tracklist, parental advisory, and holographic disc.",
        snapLabel: "Drop Album!",
        defaults: {
            artist: "NISHCHAL",
            title: "MIDNIGHT",
            discLabel: "Midnight Nishchal"
        }
    },
    strip: {
        id: "strip",
        name: "Vintage Strip",
        maxPhotos: 4,
        desc: "Four sequential poses with authentic 35mm film perforations and date stamp.",
        snapLabel: "Cheese! (Pose 1/4)",
        posePrompts: ["1. POSE", "2. SMILE", "3. CRAZY", "4. RANDOM"],
        defaults: {
            stamp: "OCT 6, 2026"
        }
    },
    breakingnews: {
        id: "breakingnews",
        name: "Breaking News",
        maxPhotos: 1,
        desc: "Live TV broadcast chyron with breaking news ticker and on-screen graphics.",
        snapLabel: "Broadcast Live!",
        defaults: {
            badge: "BREAKING NEWS",
            headline: "LOCAL LEGEND SPOTTED ONLINE",
            subhead: "HER CREATIVITY IS WINNING HEARTS EVERYWHERE",
            ticker: "10:24 PM | HYDERABAD • CREATORS • TECH • LIFESTYLE • MORE",
            channel: "VBN NEWS",
            name: "NISHCHAL"
        }
    },
    tradingcard: {
        id: "tradingcard",
        name: "Trading Card",
        maxPhotos: 1,
        desc: "Holographic collectible card with randomized aura and power stats.",
        snapLabel: "Forge Card!",
        defaults: {
            cardName: "NISHCHAL",
            level: "Lv. 99",
            rarity: "LEGENDARY",
            creativity: 97,
            charisma: 94,
            luck: 82,
            aura: 100
        }
    },
    comic: {
        id: "comic",
        name: "Comic Book",
        maxPhotos: 1,
        desc: "Vintage comic book cover with 3D title, halftone bursts, issue badge, and action callouts.",
        snapLabel: "Make Hero Shot!",
        defaults: {
            comicTitle: "THE AMAZING NISHCHAL",
            issue: "No. 1 OCT 2026",
            bubble: "GOOD VIBES ONLY!",
            burst: "MAIN CHARACTER!",
            heroName: "NISHCHAL"
        }
    },
    polaroid: {
        id: "polaroid",
        name: "Polaroid Love",
        maxPhotos: 1,
        desc: "Classic Polaroid frame with washi tape, doodle hearts, and handwritten note.",
        snapLabel: "Snap Polaroid!",
        defaults: {
            quote: "Good People Better Memories",
            date: "Oct 6, 2026 ♡"
        }
    },
    characterselect: {
        id: "comic",
        name: "Comic Book",
        maxPhotos: 1,
        desc: "Vintage comic book cover with 3D title, halftone bursts, issue badge, and action callouts.",
        snapLabel: "Make Hero Shot!",
        defaults: {
            comicTitle: "THE AMAZING NISHCHAL",
            issue: "No. 1 OCT 2026",
            bubble: "GOOD VIBES ONLY!",
            burst: "MAIN CHARACTER!",
            heroName: "NISHCHAL"
        }
    }
};

// App State
let currentMode = "newspaper";
let modeOptions = { ...MODES.newspaper.defaults };
let currentFilter = "none";
let count = 0;
const capturedPhotos = []; // Stores { dataURL, filter }
let isDemoMode = true; // True loads authentic reference sample photo by default
let facingMode = "user"; // "user" or "environment"
let isTimerActive = false;
let currentStream = null;
let audioCtx = null;

// Target capture dimensions
const CAPTURE_W = 640;
const CAPTURE_H = 480;

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
        // Fallback silently
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
    if (facingMode === "user") {
        context.translate(CAPTURE_W, 0);
        context.scale(-1, 1);
    }
    context.drawImage(camera, sx, sy, sw, sh, 0, 0, CAPTURE_W, CAPTURE_H);
    context.restore();

    return canvas.toDataURL("image/png");
}

/**
 * Update UI for the Active Studio Mode
 */
function switchMode(newModeKey) {
    if (!MODES[newModeKey]) return;
    currentMode = newModeKey;
    const mode = MODES[currentMode];
    modeOptions = { ...mode.defaults };

    // Update active tab buttons
    modeTabs.forEach(tab => {
        const isActive = tab.dataset.mode === currentMode;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", isActive);
    });


    if (outputModeLabel) {
        outputModeLabel.textContent = mode.name.toUpperCase();
    }

    // Render Mode Customizer Controls
    renderCustomizerBar();

    // Render Live Viewfinder Overlays
    renderViewfinderHud();

    // Reset captured photos and thumbnails
    resetPhotostrip();
}

/**
 * Render the Customizer Controls Toolbar
 */
function renderCustomizerBar() {
    if (!modeCustomizerBar) return;
    const mode = MODES[currentMode];

    let inputsHtml = "";

    if (currentMode === "newspaper") {
        inputsHtml = `
            <div class="config-field">
                <label>Name:</label>
                <input type="text" class="config-input" id="cfg-name" value="${modeOptions.name || 'NISHCHAL'}" placeholder="Your Name">
            </div>
            <div class="config-field">
                <label>Headline:</label>
                <input type="text" class="config-input" id="cfg-headline" value="${modeOptions.headline || 'LOCAL ICON MAKES HEADLINES'}" placeholder="Headline">
            </div>
            <div class="config-field">
                <label>Subheading:</label>
                <input type="text" class="config-input" id="cfg-subhead" value="${modeOptions.subhead || 'CREATIVITY TAKES HYDERABAD BY STORM'}">
            </div>
        `;
    } else if (currentMode === "y2k") {
        inputsHtml = `
            <div class="config-field">
                <label>Name:</label>
                <input type="text" class="config-input" id="cfg-name" value="${modeOptions.name || 'NISHCHAL'}" placeholder="Name">
            </div>
            <div class="config-field">
                <label>Date Stamp:</label>
                <input type="text" class="config-input" id="cfg-dateStamp" value="${modeOptions.dateStamp || 'OCT 06 2004'}" placeholder="OCT 06 2004">
            </div>
        `;
    } else if (currentMode === "movie") {
        inputsHtml = `
            <div class="config-field">
                <label>Star Name:</label>
                <input type="text" class="config-input" id="cfg-starName" value="${modeOptions.starName || 'NISHCHAL'}" placeholder="Star Name">
            </div>
            <div class="config-field">
                <label>Movie Title:</label>
                <input type="text" class="config-input" id="cfg-movieTitle" value="${modeOptions.movieTitle || 'MAIN CHARACTER'}" placeholder="Movie Title">
            </div>
        `;
    } else if (currentMode === "yearbook") {
        inputsHtml = `
            <div class="config-field">
                <label>Student Name:</label>
                <input type="text" class="config-input" id="cfg-studentName" value="${modeOptions.studentName || 'NISHCHAL'}">
            </div>
            <div class="config-field">
                <label>School Name:</label>
                <input type="text" class="config-input" id="cfg-schoolName" value="${modeOptions.schoolName || 'Riverside High School'}">
            </div>
            <button class="config-btn-dice" id="btn-reroll-superlative" type="button">
                <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/></svg>
                Randomize Superlative
            </button>
        `;
    } else if (currentMode === "album") {
        inputsHtml = `
            <div class="config-field">
                <label>Artist:</label>
                <input type="text" class="config-input" id="cfg-artist" value="${modeOptions.artist || 'NISHCHAL'}">
            </div>
            <div class="config-field">
                <label>Album Title:</label>
                <input type="text" class="config-input" id="cfg-title" value="${modeOptions.title || 'MIDNIGHT'}">
            </div>
        `;
    } else if (currentMode === "strip") {
        inputsHtml = `
            <div class="config-field">
                <label>Date Stamp:</label>
                <input type="text" class="config-input" id="cfg-stamp" value="${modeOptions.stamp || 'OCT 6, 2026'}">
            </div>
            <span class="customizer-desc">Guides: 1. Pose → 2. Smile → 3. Crazy → 4. Random</span>
        `;
    } else if (currentMode === "breakingnews") {
        inputsHtml = `
            <div class="config-field">
                <label>Person Name:</label>
                <input type="text" class="config-input" id="cfg-name" value="${modeOptions.name || 'NISHCHAL'}">
            </div>
            <div class="config-field">
                <label>Headline:</label>
                <input type="text" class="config-input" id="cfg-headline" value="${modeOptions.headline || 'LOCAL LEGEND SPOTTED ONLINE'}">
            </div>
            <div class="config-field">
                <label>News Ticker:</label>
                <input type="text" class="config-input" id="cfg-ticker" value="${modeOptions.ticker || '10:24 PM | HYDERABAD • CREATORS • TECH • LIFESTYLE • MORE'}">
            </div>
        `;
    } else if (currentMode === "tradingcard") {
        inputsHtml = `
            <div class="config-field">
                <label>Card Name:</label>
                <input type="text" class="config-input" id="cfg-cardName" value="${modeOptions.cardName || 'NISHCHAL'}">
            </div>
            <div class="config-field">
                <span class="customizer-desc">Aura: ${modeOptions.aura} • Charisma: ${modeOptions.charisma}</span>
            </div>
            <button class="config-btn-dice" id="btn-reroll-stats" type="button">
                <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Reroll Stats
            </button>
        `;
    } else if (currentMode === "comic" || currentMode === "characterselect") {
        inputsHtml = `
            <div class="config-field">
                <label>Hero Title:</label>
                <input type="text" class="config-input" id="cfg-comicTitle" value="${modeOptions.comicTitle || 'THE AMAZING NISHCHAL'}">
            </div>
            <div class="config-field">
                <label>Speech Bubble:</label>
                <input type="text" class="config-input" id="cfg-bubble" value="${modeOptions.bubble || 'GOOD VIBES ONLY!'}">
            </div>
            <div class="config-field">
                <label>Action Burst:</label>
                <input type="text" class="config-input" id="cfg-burst" value="${modeOptions.burst || 'MAIN CHARACTER!'}">
            </div>
        `;
    } else if (currentMode === "polaroid") {
        inputsHtml = `
            <div class="config-field">
                <label>Note / Caption:</label>
                <input type="text" class="config-input" id="cfg-quote" value="${modeOptions.quote || 'Good People Better Memories'}">
            </div>
            <div class="config-field">
                <label>Date Stamp:</label>
                <input type="text" class="config-input" id="cfg-date" value="${modeOptions.date || 'Oct 6, 2026 ♡'}">
            </div>
        `;
    }

    modeCustomizerBar.innerHTML = `
        <div class="customizer-header">
            <span class="customizer-title">
                <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                ${mode.name} Settings
            </span>
            <span class="customizer-desc">${mode.desc}</span>
        </div>
        <div class="customizer-inputs-grid">
            ${inputsHtml}
        </div>
    `;

    // Attach dynamic input listeners
    attachCustomizerListeners();
}

/**
 * Handle inputs from dynamic customizer
 */
function attachCustomizerListeners() {
    const inputs = modeCustomizerBar.querySelectorAll("input, select");
    inputs.forEach(input => {
        input.addEventListener("input", (e) => {
            const key = e.target.id.replace("cfg-", "");
            modeOptions[key] = e.target.value;
            renderViewfinderHud();
            renderPreviewOutput();
        });
    });

    const rerollSuperlativeBtn = document.getElementById("btn-reroll-superlative");
    if (rerollSuperlativeBtn) {
        rerollSuperlativeBtn.addEventListener("click", () => {
            const list = MODES.yearbook.superlatives;
            const random = list[Math.floor(Math.random() * list.length)];
            modeOptions.superlative = random;
            const select = document.getElementById("cfg-superlative");
            if (select) select.value = random;
            renderPreviewOutput();
        });
    }

    const rerollStatsBtn = document.getElementById("btn-reroll-stats");
    if (rerollStatsBtn) {
        rerollStatsBtn.addEventListener("click", () => {
            modeOptions.charisma = Math.floor(Math.random() * 15) + 85;
            modeOptions.creativity = Math.floor(Math.random() * 15) + 85;
            modeOptions.luck = Math.floor(Math.random() * 20) + 80;
            modeOptions.aura = Math.floor(Math.random() * 10) + 90;
            renderCustomizerBar();
            renderPreviewOutput();
        });
    }
}

/**
 * Render Live Viewfinder Overlays
 */
function renderViewfinderHud() {
    if (!viewfinderHud) return;

    if (currentMode === "breakingnews") {
        viewfinderHud.innerHTML = `
            <div class="hud-news-top">
                <span class="hud-live-tag"><span class="hud-live-dot"></span> LIVE</span>
                <span class="hud-news-channel">NNN 24/7 NEWS</span>
            </div>
            <div class="hud-news-chyron">
                <div class="hud-news-chyron-title">BREAKING NEWS</div>
                <div class="hud-news-chyron-sub">${(modeOptions.name || 'LOCAL LEGEND').toUpperCase()}: SPOTTED ONLINE</div>
            </div>
        `;
    } else if (currentMode === "y2k") {
        viewfinderHud.innerHTML = `
            <div class="hud-y2k-top">
                <span>[● REC] 00:04:24</span>
                <span>[■■■] SD 512MB</span>
            </div>
            <div class="hud-y2k-timestamp">${modeOptions.year || "'04  10  08"}</div>
        `;
    } else if (currentMode === "strip") {
        const nextPrompt = MODES.strip.posePrompts[count] || "DONE!";
        viewfinderHud.innerHTML = `
            <div class="hud-pose-banner">
                <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/></svg>
                CURRENT POSE: ${nextPrompt}
            </div>
            <div></div>
        `;
    } else if (currentMode === "newspaper") {
        viewfinderHud.innerHTML = `
            <div class="hud-watermark-tag">THE RETRO CHRONICLE • FRONT PAGE</div>
            <div></div>
        `;
    } else if (currentMode === "polaroid") {
        viewfinderHud.innerHTML = `
            <div class="hud-watermark-tag">POLAROID MOMENT</div>
            <div></div>
        `;
    } else {
        viewfinderHud.innerHTML = `
            <div class="hud-watermark-tag">${MODES[currentMode].name.toUpperCase()}</div>
            <div></div>
        `;
    }
}

/**
 * Handle Tab & Showcase Switching Event Listeners
 */
modeTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        switchMode(tab.dataset.mode);
    });
});


/**
 * Demo Mode & User Upload Handlers
 */
function updateDemoBadgeState() {
    if (!toggleDemoBtn || !demoBadgeText) return;
    if (isDemoMode) {
        toggleDemoBtn.classList.remove("user-active");
        demoBadgeText.textContent = "Sample Demo";
    } else {
        toggleDemoBtn.classList.add("user-active");
        demoBadgeText.textContent = capturedPhotos.length > 0 ? "My Photo" : "Empty Slot";
    }
}

if (toggleDemoBtn) {
    toggleDemoBtn.addEventListener("click", () => {
        isDemoMode = !isDemoMode;
        updateDemoBadgeState();
        renderPreviewOutput();
    });
}

if (uploadPhotoInput) {
    uploadPhotoInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const dataUrl = evt.target.result;
            const maxPhotos = MODES[currentMode].maxPhotos;
            if (currentMode === "strip" && count < maxPhotos && capturedPhotos.length > 0) {
                capturedPhotos.push({ dataURL: dataUrl, filter: currentFilter });
                count = capturedPhotos.length;
            } else {
                capturedPhotos.length = 0;
                capturedPhotos.push({ dataURL: dataUrl, filter: currentFilter });
                count = 1;
            }
            isDemoMode = false;
            photoCountBadge.textContent = `${count}/${maxPhotos}`;
            if (count >= maxPhotos) {
                snapBtn.disabled = true;
                snapBtn.textContent = "Done!";
            } else {
                snapBtn.textContent = `Cheese! (Pose ${count + 1}/${maxPhotos})`;
            }
            updateDemoBadgeState();
            renderPreviewOutput();
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Filter Selection Handler
 */
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;

        camera.style.filter = currentFilter;
        const thumbnails = document.querySelectorAll("#photos .photo, #photos img");
        thumbnails.forEach(img => {
            img.style.filter = currentFilter;
        });
    });
});

/**
 * Reset / Retake Photostrip & Mode
 */
function resetPhotostrip() {
    count = 0;
    capturedPhotos.length = 0;
    isDemoMode = true;
    updateDemoBadgeState();

    const maxPhotos = MODES[currentMode].maxPhotos;
    snapBtn.disabled = false;
    snapBtn.textContent = MODES[currentMode].snapLabel || "Cheese!";
    photoCountBadge.textContent = `0/${maxPhotos}`;

    // Render the beautiful template preview card immediately
    renderPreviewOutput();
    renderViewfinderHud();
}

resetBtn.addEventListener("click", resetPhotostrip);

/**
 * Handle Snap Photo Event
 */
function handleSnap() {
    const maxPhotos = MODES[currentMode].maxPhotos;
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

    const maxPhotos = MODES[currentMode].maxPhotos;
    const imgData = capturePhotoFrame();
    capturedPhotos.push({
        dataURL: imgData,
        filter: currentFilter
    });

    isDemoMode = false;
    updateDemoBadgeState();

    count++;
    photoCountBadge.textContent = `${count}/${maxPhotos}`;

    // Update snap button label
    if (currentMode === "strip") {
        if (count < maxPhotos) {
            snapBtn.textContent = `Cheese! (Pose ${count + 1}/4)`;
            renderViewfinderHud();
        } else {
            snapBtn.disabled = true;
            snapBtn.textContent = "Done!";
        }
    } else {
        snapBtn.disabled = true;
        snapBtn.textContent = "Done!";
    }

    renderPreviewOutput();
}

snapBtn.addEventListener("click", handleSnap);

/**
 * Render the Cap/**
 * Render the Captured Output in `#photos` Preview Frame
 */
function renderPreviewOutput() {
    photosDiv.innerHTML = "";

    const hasUserPhoto = capturedPhotos.length > 0 && !isDemoMode;
    const firstPhoto = capturedPhotos.length > 0 ? capturedPhotos[0].dataURL : "";
    const photoFilter = currentFilter && currentFilter !== "none" ? `filter: ${currentFilter};` : "";

    function getPhotoSlot(altText, customClass = "", poseIndex = 0) {
        let imgSrc = "";
        if (hasUserPhoto) {
            const pic = capturedPhotos[Math.min(poseIndex, capturedPhotos.length - 1)];
            imgSrc = pic ? pic.dataURL : "";
        } else if (isDemoMode) {
            if (currentMode === "strip") {
                imgSrc = DEMO_IMAGES.strip[poseIndex] || "assets/demo-strip-1.jpg";
            } else if (currentMode === "yearbook") {
                const ybDemo = [
                    "assets/demo-strip-1.jpg",
                    "assets/demo-strip-2.jpg",
                    "assets/demo-polaroid.jpg",
                    "assets/demo-strip-4.jpg"
                ];
                imgSrc = ybDemo[poseIndex] || "assets/demo-portrait.jpg";
            } else if (currentMode === "y2k") {
                imgSrc = "assets/demo-y2k.jpg";
            } else {
                imgSrc = DEMO_IMAGES[currentMode] || "assets/demo-portrait.jpg";
            }
        }

        if (imgSrc) {
            return `<img src="${imgSrc}" class="template-photo ${customClass}" style="${photoFilter}" alt="${altText}">`;
        } else {
            return `
                <div class="photo-slot-placeholder ${customClass}">
                    <div class="ph-icon-circle">
                        <svg class="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                            <circle cx="12" cy="13" r="3"/>
                        </svg>
                    </div>
                    <span>${snapBtn.textContent || 'Click "Cheese!" to Pose'}</span>
                    <span class="ph-hint">Ready for your shot</span>
                </div>
            `;
        }
    }

    if (currentMode === "newspaper") {
        photosDiv.innerHTML = `
            <div class="preview-template-frame">
                <div class="preview-card-styled preview-newspaper">
                    <div class="np-masthead-box">
                        <div class="np-title">${modeOptions.masthead || "The Daily Times"}</div>
                    </div>
                    <div class="np-meta">Vol. 107, No. 48 • ${modeOptions.name || 'HYDERABAD'}, ${modeOptions.date || 'OCT 6, 2026'} • Rs. 10</div>
                    <div class="np-headline">${modeOptions.headline || "LOCAL ICON MAKES HEADLINES"}</div>
                    <div class="np-subhead">${modeOptions.subhead || "CREATIVITY TAKES HYDERABAD BY STORM"}</div>
                    <div class="np-body-grid">
                        <div class="np-photo-wrap">
                            ${getPhotoSlot("Front Page Lead Photo")}
                            <div class="np-caption">FIG 1: ${(modeOptions.name || 'NISHCHAL').toUpperCase()} CAUGHT IN HIGH RESOLUTION.</div>
                        </div>
                        <div class="np-story-col">
                            <div class="np-col-heading">${modeOptions.colTitle || "Young Creator Inspires A New Generation"}</div>
                            <div class="np-col-text">${modeOptions.colStory || "With her unique ideas and positive energy, she is proving that creativity knows no limits. From online platforms to real-world impact, her journey is just getting started."}</div>
                        </div>
                    </div>
                    <div class="np-bottom-banner">
                        <div class="np-banner-text">${modeOptions.banner || "BIG DREAMS, BRIGHTER DAYS AHEAD."}</div>
                        <svg class="np-skyline-etching" viewBox="0 0 300 24" preserveAspectRatio="none">
                            <path d="M0,24 L10,14 L15,14 L15,10 L25,10 L25,24 L35,24 L35,6 L45,6 L45,16 L55,16 L55,24 L75,24 L75,12 L85,4 L95,12 L95,24 L120,24 L120,8 L130,8 L130,24 L150,24 L150,2 L155,2 L155,24 L175,24 L175,14 L185,14 L185,24 L210,24 L210,10 L225,10 L225,24 L250,24 L250,5 L260,5 L260,24 L300,24" />
                        </svg>
                    </div>
                </div>
            </div>
        `;
    } else if (currentMode === "y2k") {
        const mini1 = hasUserPhoto ? firstPhoto : "assets/demo-strip-2.jpg";
        const mini2 = hasUserPhoto ? firstPhoto : "assets/demo-strip-1.jpg";
        const mini3 = hasUserPhoto ? firstPhoto : "assets/demo-strip-3.jpg";
        photosDiv.innerHTML = `
            <div class="preview-template-frame">
                <div class="preview-card-styled preview-y2k">
                    <div class="y2k-osd">
                        <span class="y2k-osd-left">${modeOptions.osd || "[+] 2004"}</span>
                        <span class="y2k-osd-right">${modeOptions.camInfo || "DIGITAL CAMERA F1.8 1/60 ISO 200"}</span>
                    </div>
                    <div class="y2k-main-frame">
                        <div class="y2k-flash-overlay"></div>
                        <svg class="y2k-butterfly" viewBox="0 0 24 24"><path d="M12 12c-2-4-7-5-9-3s-1 7 2 8c2 1 5-1 7-5Zm0 0c2-4 7-5 9-3s1 7-2 8c-2 1-5-1-7-5Z"/><path d="M12 7v10"/></svg>
                        <svg class="y2k-heart-neon" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        <div class="y2k-good-times">Good Times!</div>
                        <div class="y2k-datestamp">${modeOptions.dateStamp || "OCT 06 2004"}</div>
                        ${getPhotoSlot("Y2K Digicam Main Photo")}
                    </div>
                    <div class="y2k-bottom-row">
                        <div class="y2k-mini-snap">
                            <img src="${mini1}" style="${photoFilter}" alt="Mini Print 1">
                            <svg class="y2k-sticker" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                        <div class="y2k-mini-snap">
                            <img src="${mini2}" style="${photoFilter}" alt="Mini Print 2">
                            <svg class="y2k-sticker" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </div>
                        <div class="y2k-mini-snap">
                            <img src="${mini3}" style="${photoFilter}" alt="Mini Print 3">
                            <svg class="y2k-sticker" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (currentMode === "movie") {
        photosDiv.innerHTML = `
            <div class="preview-template-frame">
                <div class="preview-card-styled preview-movie">
                    <div class="mv-studio">${modeOptions.studio || "VEBNOX PICTURES PRESENTS"}</div>
                    <div class="mv-side-layout">
                        <div class="mv-quote-left">${modeOptions.taglineLeft || "SHE CREATES HER OWN WORLD"}</div>
                        <div class="mv-center-frame">
                            ${getPhotoSlot("Movie Star Photo")}
                            <div class="mv-fade-bottom"></div>
                        </div>
                        <div class="mv-quote-right">${modeOptions.taglineRight || "A STORY OF PASSION, IDEAS AND BIGGER DREAMS"}</div>
                    </div>
                    <div class="mv-main-title">${modeOptions.movieTitle || "MAIN CHARACTER"}</div>
                    <div class="mv-star-credit">A ${(modeOptions.starName || 'NISHCHAL').toUpperCase()} FILM</div>
                    <div class="mv-billing">
                        VEBNOX PICTURES PRESENTS A ${(modeOptions.starName || 'NISHCHAL').toUpperCase()} FILM "${modeOptions.movieTitle || 'MAIN CHARACTER'}"<br>
                        MUSIC BY VEBNOX • PRODUCED BY CREATORS • WRITTEN AND DIRECTED BY ${(modeOptions.starName || 'NISHCHAL').toUpperCase()}
                    </div>
                    <div class="mv-coming-soon">${modeOptions.status || "COMING SOON"}</div>
                </div>
            </div>
        `;
    } else if (currentMode === "yearbook") {
        photosDiv.innerHTML = `
            <div class="preview-template-frame">
                <div class="preview-card-styled preview-yearbook">
                    <div class="yb-school">${modeOptions.schoolName || "Riverside High School"}</div>
                    <div class="yb-class">${modeOptions.classYear || "CLASS OF 1996"}</div>
                    <div class="yb-grid">
                        <div class="yb-item">
                            <div class="yb-photo-box">
                                ${getPhotoSlot("Senior 1 - Best Smile", "", 0)}
                            </div>
                            <div class="yb-label">${modeOptions.sup1 || "Best Smile"}</div>
                        </div>
                        <div class="yb-item">
                            <div class="yb-photo-box">
                                ${getPhotoSlot("Senior 2 - Most Likely To Go Viral", "", 1)}
                            </div>
                            <div class="yb-label">${modeOptions.sup2 || "Most Likely To Go Viral ★"}</div>
                        </div>
                        <div class="yb-item">
                            <div class="yb-photo-box">
                                ${getPhotoSlot("Senior 3 - Most Creative", "", 2)}
                            </div>
                            <div class="yb-label">
                                <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
                                ${modeOptions.sup3 || "Most Creative"}
                            </div>
                        </div>
                        <div class="yb-item">
                            <div class="yb-photo-box">
                                ${getPhotoSlot("Senior 4 - Most Likely To Change The World", "", 3)}
                            </div>
                            <div class="yb-label">${modeOptions.sup4 || "Most Likely To Change The World"}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (currentMode === "album") {
        photosDiv.innerHTML = `
            <div class="preview-template-frame">
                <div class="preview-card-styled preview-album">
                    <div class="album-spine-overlay"></div>
                    <div class="album-art-wrap">
                        <div class="album-header">
                            <div class="album-artist-name">${(modeOptions.artist || "NISHCHAL").toUpperCase()}</div>
                            <div class="album-title-sub">${(modeOptions.title || "MIDNIGHT").toUpperCase()}</div>
                        </div>
                        <div class="album-photo-frame">
                            ${getPhotoSlot("Album Cover Art")}
                        </div>
                    </div>
                    <div class="album-bottom-info">
                        <div class="album-tracklist">
                            1. DREAMER<br>
                            2. GOOD DAYS<br>
                            3. MAIN CHARACTER<br>
                            4. NO LIMITS<br>
                            5. JUST ME
                        </div>
                        <div class="album-pa-box">
                            PARENTAL<br>ADVISORY<br>EXPLICIT CONTENT
                        </div>
                    </div>
                    <div class="album-cd-preview">
                        <div class="cd-center-hole">
                            <div class="cd-inner-ring"></div>
                        </div>
                        <div class="cd-handwritten">${modeOptions.discLabel || (modeOptions.title + " " + modeOptions.artist)}</div>
                    </div>
                </div>
            </div>
        `;
    } else if (currentMode === "strip") {
        photosDiv.innerHTML = `
            <div class="preview-template-frame">
                <div class="preview-card-styled preview-strip-grid">
                    <div class="strip-sprockets-wrapper">
                        <div class="strip-sprocket-col">
                            <div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div>
                        </div>
                        <div class="strip-frames-col">
                            ${[0, 1, 2, 3].map(i => `
                                <div class="strip-single-frame">
                                    ${getPhotoSlot(`Strip Pose ${i + 1}`, "", i)}
                                </div>
                            `).join("")}
                        </div>
                        <div class="strip-sprocket-col">
                            <div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div><div class="sprocket-hole"></div>
                        </div>
                    </div>
                    <div class="strip-bottom-stamp">${modeOptions.stamp || "OCT 6, 2026"}</div>
                </div>
            </div>
        `;
    } else if (currentMode === "breakingnews") {
        photosDiv.innerHTML = `
            <div class="preview-template-frame">
                <div class="preview-card-styled preview-breakingnews">
                    <div class="bn-top-overlay">
                        <div class="bn-live-pill"><span class="bn-live-dot"></span> LIVE</div>
                        <div class="bn-channel-bug">${modeOptions.channel || "VBN NEWS"}</div>
                    </div>
                    ${getPhotoSlot("Broadcast Video Feed", "bn-video-feed")}
                    <div class="bn-lower-third">
                        <div class="bn-tab">${modeOptions.badge || "BREAKING NEWS"}</div>
                        <div class="bn-headline-bar">${modeOptions.headline || "LOCAL LEGEND SPOTTED ONLINE"}</div>
                        <div class="bn-sub-bar">${modeOptions.subhead || "HER CREATIVITY IS WINNING HEARTS EVERYWHERE"}</div>
                        <div class="bn-ticker-bar">${modeOptions.ticker || "10:24 PM | HYDERABAD • CREATORS • TECH • LIFESTYLE • MORE"}</div>
                    </div>
                </div>
            </div>
        `;
    } else if (currentMode === "tradingcard") {
        photosDiv.innerHTML = `
            <div class="preview-template-frame">
                <div class="preview-card-styled preview-tradingcard">
                    <div class="tc-inner-card">
                        <div class="tc-top-banner">
                            <span class="tc-legendary-tag">
                                <svg class="icon icon-xs" viewBox="0 0 24 24" fill="currentColor"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z"/></svg>
                                ${modeOptions.rarity || "LEGENDARY"}
                            </span>
                            <span class="tc-level-tag">${modeOptions.level || "Lv. 99"}</span>
                        </div>
                        <div class="tc-photo-border">
                            ${getPhotoSlot("Trading Card Portrait")}
                        </div>
                        <div class="tc-nameplate">${(modeOptions.cardName || modeOptions.name || "NISHCHAL").toUpperCase()}</div>
                        <div class="tc-stats-grid">
                            <div class="tc-stat-row">
                                <span class="tc-stat-name">CREATIVITY</span>
                                <div class="tc-bar-bg"><div class="tc-bar-fill" style="width: ${modeOptions.creativity || 97}%;"></div></div>
                                <span class="tc-stat-val">${modeOptions.creativity || 97}</span>
                            </div>
                            <div class="tc-stat-row">
                                <span class="tc-stat-name">CHARISMA</span>
                                <div class="tc-bar-bg"><div class="tc-bar-fill" style="width: ${modeOptions.charisma || 94}%;"></div></div>
                                <span class="tc-stat-val">${modeOptions.charisma || 94}</span>
                            </div>
                            <div class="tc-stat-row">
                                <span class="tc-stat-name">LUCK</span>
                                <div class="tc-bar-bg"><div class="tc-bar-fill" style="width: ${modeOptions.luck || 82}%;"></div></div>
                                <span class="tc-stat-val">${modeOptions.luck || 82}</span>
                            </div>
                            <div class="tc-stat-row">
                                <span class="tc-stat-name">AURA</span>
                                <div class="tc-bar-bg"><div class="tc-bar-fill" style="width: ${modeOptions.aura || 100}%;"></div></div>
                                <span class="tc-stat-val">${modeOptions.aura || 100}</span>
                            </div>
                        </div>
                        <div class="tc-footer">
                            <span>ULTRA RARE</span>
                            <span>★★★★★</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (currentMode === "comic" || currentMode === "characterselect") {
        photosDiv.innerHTML = `
            <div class="preview-template-frame">
                <div class="preview-card-styled preview-comic">
                    <div class="comic-corner-box">
                        <div class="comic-corner-no">No. 1</div>
                        <div class="comic-corner-date">OCT 2026</div>
                    </div>
                    <div class="comic-header">
                        <div class="comic-title">${modeOptions.comicTitle || "THE AMAZING NISHCHAL"}</div>
                    </div>
                    <div class="comic-photo-frame">
                        <div class="comic-speech-bubble">${modeOptions.bubble || "GOOD VIBES ONLY!"}</div>
                        <div class="comic-burst-tag">${modeOptions.burst || "MAIN CHARACTER!"}</div>
                        <div class="comic-barcode">
                            <svg viewBox="0 0 40 20" style="width: 100%; height: 100%;"><rect x="2" y="2" width="2" height="16"/><rect x="6" y="2" width="3" height="16"/><rect x="11" y="2" width="1" height="16"/><rect x="14" y="2" width="4" height="16"/><rect x="20" y="2" width="2" height="16"/><rect x="24" y="2" width="3" height="16"/><rect x="29" y="2" width="1" height="16"/><rect x="32" y="2" width="4" height="16"/></svg>
                        </div>
                        ${getPhotoSlot("Comic Book Cover Hero")}
                    </div>
                </div>
            </div>
        `;
    } else if (currentMode === "polaroid") {
        photosDiv.innerHTML = `
            <div class="preview-template-frame">
                <div class="preview-card-styled preview-polaroid">
                    <div class="pol-washi-tape"></div>
                    <div class="pol-photo-box">
                        <svg class="pol-doodle-heart-tl" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        <svg class="pol-doodle-heart-br" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        ${getPhotoSlot("Polaroid Instant Photo")}
                    </div>
                    <div class="pol-side-note">
                        ${modeOptions.quote || "Good People Better Memories"}
                        <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="display: inline-block; vertical-align: middle; margin-left: 2px;"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y2="9" y2="9"/></svg>
                    </div>
                    <div class="pol-date-script">${modeOptions.date || "Oct 6, 2026 ♡"}</div>
                </div>
            </div>
        `;
    }
}

/**
 * =========================================================================
 * 10 Dedicated High-Resolution Canvas Rendering Engines
 * =========================================================================
 */

downloadBtn.addEventListener("click", () => {
    const exportCanvas = document.createElement("canvas");
    const ctx = exportCanvas.getContext("2d");

    if (currentMode === "strip") {
        let sources = [];
        if (capturedPhotos.length > 0 && !isDemoMode) {
            sources = capturedPhotos.map(p => p.dataURL);
            while (sources.length < 4) sources.push(sources[sources.length - 1]);
        } else {
            sources = DEMO_IMAGES.strip;
        }

        loadImagesList(sources).then(images => {
            renderStripCanvas(exportCanvas, ctx, images);
            triggerCanvasDownload(exportCanvas);
        });
        return;
    }

    if (currentMode === "yearbook") {
        let sources = [];
        if (capturedPhotos.length > 0 && !isDemoMode) {
            sources = [
                capturedPhotos[0].dataURL,
                capturedPhotos[1] ? capturedPhotos[1].dataURL : capturedPhotos[0].dataURL,
                capturedPhotos[2] ? capturedPhotos[2].dataURL : capturedPhotos[0].dataURL,
                capturedPhotos[3] ? capturedPhotos[3].dataURL : capturedPhotos[0].dataURL
            ];
        } else {
            sources = [
                "assets/demo-strip-1.jpg",
                "assets/demo-strip-2.jpg",
                "assets/demo-polaroid.jpg",
                "assets/demo-strip-4.jpg"
            ];
        }

        loadImagesList(sources).then(images => {
            renderYearbookCanvas(exportCanvas, ctx, images);
            triggerCanvasDownload(exportCanvas);
        });
        return;
    }

    const demoSrc = DEMO_IMAGES[currentMode] || "assets/demo-portrait.jpg";
    const photoSrc = (capturedPhotos.length > 0 && !isDemoMode) ? capturedPhotos[0].dataURL : demoSrc;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        if (currentMode === "newspaper") {
            renderNewspaperCanvas(exportCanvas, ctx, img);
        } else if (currentMode === "y2k") {
            renderY2KCanvas(exportCanvas, ctx, img);
        } else if (currentMode === "movie") {
            renderMovieCanvas(exportCanvas, ctx, img);
        } else if (currentMode === "album") {
            renderAlbumCanvas(exportCanvas, ctx, img);
        } else if (currentMode === "tradingcard") {
            renderTradingCardCanvas(exportCanvas, ctx, img);
        } else if (currentMode === "breakingnews") {
            renderBreakingNewsCanvas(exportCanvas, ctx, img);
        } else if (currentMode === "comic" || currentMode === "characterselect") {
            renderComicCanvas(exportCanvas, ctx, img);
        } else if (currentMode === "polaroid") {
            renderPolaroidCanvas(exportCanvas, ctx, img);
        }

        triggerCanvasDownload(exportCanvas);
    };
    img.src = photoSrc;
});

function loadImagesList(urls) {
    return Promise.all(urls.map(url => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = url;
        });
    }));
}

function triggerCanvasDownload(expCanvas) {
    const link = document.createElement("a");
    const safeName = (modeOptions.name || modeOptions.starName || modeOptions.studentName || modeOptions.cardName || "photobooth")
        .replace(/[^a-z0-9]/gi, "-").toLowerCase();
    link.download = `${currentMode}-${safeName}-${Date.now()}.png`;
    link.href = expCanvas.toDataURL("image/png");
    link.click();
}

/**
 * 1. Retro Newspaper Canvas Renderer
 */
function renderNewspaperCanvas(canvas, ctx, img) {
    canvas.width = 800;
    canvas.height = 1150;

    // Aged Newsprint Background
    ctx.fillStyle = "#F4EEDB";
    ctx.fillRect(0, 0, 800, 1150);

    // Weathered Border
    ctx.strokeStyle = "#2D2D2D";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 760, 1110);
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, 752, 1102);

    // Masthead
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, 50);
    ctx.lineTo(770, 50);
    ctx.stroke();

    ctx.fillStyle = "#111111";
    ctx.font = "bold 52px 'Playfair Display', Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("THE RETRO CHRONICLE", 400, 105);

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 120);
    ctx.lineTo(770, 120);
    ctx.stroke();

    // Date and Metadata Bar
    ctx.font = "bold 13px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = "#333333";
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    ctx.fillText(`VOL. LXXVI NO. 14  •  SPECIAL EDITION  •  ${dateStr.toUpperCase()}  •  10 CENTS`, 400, 140);

    ctx.beginPath();
    ctx.moveTo(30, 150);
    ctx.lineTo(770, 150);
    ctx.stroke();

    // Giant Headline
    ctx.font = "bold 46px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = "#111111";
    ctx.fillText(modeOptions.headline || "YOU MADE THE FRONT PAGE!", 400, 205);

    // Subhead
    ctx.font = "italic 19px Georgia, serif";
    ctx.fillStyle = "#444444";
    ctx.fillText(`Exclusive Report: ${(modeOptions.name || 'Local hero')} causes historic viral sensation.`, 400, 240);

    // Main Lead Photo with Border
    const photoX = 50, photoY = 265, photoW = 700, photoH = 470;
    ctx.fillStyle = "#EAE3CD";
    ctx.fillRect(photoX - 4, photoY - 4, photoW + 8, photoH + 8);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    ctx.save();
    if (currentFilter && currentFilter !== "none") ctx.filter = currentFilter;
    ctx.drawImage(img, photoX, photoY, photoW, photoH);
    ctx.restore();

    // Caption
    ctx.font = "italic 14px Georgia, serif";
    ctx.fillStyle = "#222222";
    ctx.fillText(`FIG 1.0 — ${(modeOptions.name || 'NISHCHAL').toUpperCase()} SPOTTED CAUGHT BEING TOO ICONIC.`, 400, 760);

    // 3 Column Mock Newspaper Text Articles
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#C4B998";

    // Column rules
    ctx.beginPath();
    ctx.moveTo(280, 785);
    ctx.lineTo(280, 1100);
    ctx.moveTo(520, 785);
    ctx.lineTo(520, 1100);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "bold 15px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = "#111111";
    ctx.fillText("HISTORIC DISPATCH", 50, 805);
    ctx.fillText("WITNESS REPORTS", 295, 805);
    ctx.fillText("EDITORIAL NOTES", 535, 805);

    ctx.font = "12px Georgia, serif";
    ctx.fillStyle = "#333333";
    const p1 = `WORLD EXCLUSIVE — In an unprecedented turn of events, local icon ${modeOptions.name || 'Nishchal'} captured global attention today. Experts state that historic charisma levels were recorded at the scene.`;
    const p2 = `Eyewitnesses report that the camera flash could be seen across town. 'We knew history was being made the moment they struck that pose,' noted an onlooker.`;
    const p3 = `Printed directly from the Photobooth Studio press. Keep this authentic newsprint edition safe for future generations. All rights reserved.`;

    wrapText(ctx, p1, 50, 825, 215, 17);
    wrapText(ctx, p2, 295, 825, 215, 17);
    wrapText(ctx, p3, 535, 825, 215, 17);
}

/**
 * 2. Y2K 2000s Digicam Canvas Renderer
 */
function renderY2KCanvas(canvas, ctx, img) {
    canvas.width = 800;
    canvas.height = 600;

    // Fill photo
    ctx.save();
    if (currentFilter && currentFilter !== "none") ctx.filter = currentFilter;
    ctx.drawImage(img, 0, 0, 800, 600);
    ctx.restore();

    // Digicam harsh flash center wash & slight vignette
    const flashGrad = ctx.createRadialGradient(400, 300, 50, 400, 300, 480);
    flashGrad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
    flashGrad.addColorStop(1, "rgba(0, 0, 0, 0.45)");
    ctx.fillStyle = flashGrad;
    ctx.fillRect(0, 0, 800, 600);

    // Green OSD Top Header
    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "#2ED573";
    ctx.textAlign = "left";
    ctx.fillText("[● REC]  00:04:24", 25, 35);
    ctx.textAlign = "right";
    ctx.fillText("[■■■] BATTERY  •  SD: 512MB", 775, 35);

    // Glowing Orange LED Date Timestamp in bottom right
    ctx.textAlign = "right";
    ctx.font = "bold 34px 'Courier New', monospace";
    ctx.fillStyle = "#FF7A00";
    ctx.shadowColor = "#FF7A00";
    ctx.shadowBlur = 10;
    ctx.fillText(`${modeOptions.year || "'04  10  08"}  ${modeOptions.time || "14:24"}`, 765, 560);
    ctx.shadowBlur = 0;

    // Corner Y2K Sparks
    drawSparkle(ctx, 60, 540, 20, "#FFFFFF");
    drawSparkle(ctx, 120, 520, 12, "#FF6B81");
    drawSparkle(ctx, 720, 100, 18, "#FFFFFF");

    // Y2K Bottom Branding
    ctx.textAlign = "left";
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText("CYBERSHOT 3.2 MEGAPIXELS • 2004 NOSTALGIA", 25, 565);
}

/**
 * 3. Movie Poster Canvas Renderer
 */
function renderMovieCanvas(canvas, ctx, img) {
    canvas.width = 750;
    canvas.height = 1100;

    ctx.fillStyle = "#0A0A12";
    ctx.fillRect(0, 0, 750, 1100);

    // Photo at top
    ctx.save();
    if (currentFilter && currentFilter !== "none") ctx.filter = currentFilter;
    ctx.drawImage(img, 0, 40, 750, 700);
    ctx.restore();

    // Cinema dark gradient fade
    const fadeGrad = ctx.createLinearGradient(0, 480, 0, 780);
    fadeGrad.addColorStop(0, "rgba(10, 10, 18, 0)");
    fadeGrad.addColorStop(1, "rgba(10, 10, 18, 1)");
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, 480, 750, 300);

    // Studio Header
    ctx.textAlign = "center";
    ctx.fillStyle = "#A0AEC0";
    ctx.font = "600 13px 'Outfit', sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("A PHOTOBOOTH STUDIOS ORIGINAL PRODUCTION", 375, 40);

    // Genre Tag
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "bold 15px 'Outfit', sans-serif";
    ctx.fillText(`[ ${(modeOptions.genre || "BOLLYWOOD").toUpperCase()} ]`, 375, 740);

    // Movie Hero Title
    ctx.font = "bold 78px 'Bebas Neue', Impact, sans-serif";
    ctx.fillStyle = "#ECC94B";
    ctx.fillText((modeOptions.starName || "NISHCHAL").toUpperCase(), 375, 830);

    // Tagline
    ctx.font = "bold 22px 'Bebas Neue', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(modeOptions.tagline || "COMING SOON TO THEATERS EVERYWHERE", 375, 875);

    // Billing Block
    ctx.fillStyle = "#718096";
    ctx.font = "11px 'Outfit', sans-serif";
    ctx.fillText("PRODUCED BY PHOTOBOOTH STUDIO • MUSIC BY DIGITAL NOSTALGIA • SOUNDTRACK AVAILABLE ON VINYL", 375, 960);
    ctx.fillText("DIRECTED BY DESTINY • CINEMATOGRAPHY: WEBCAM 4K • EDITED BY INSTANT STRIP", 375, 985);
    ctx.fillText(`STARRING ${(modeOptions.starName || 'NISHCHAL').toUpperCase()} • ALL RIGHTS RESERVED`, 375, 1010);
    ctx.fillText("DOLBY DIGITAL • PG-13 • IN SELECT CINEMAS", 375, 1045);
}

/**
 * 4. 90s School Yearbook Canvas Renderer (Riverside High School 2x2 Grid)
 */
function renderYearbookCanvas(canvas, ctx, images) {
    canvas.width = 750;
    canvas.height = 1050;

    // Vintage Aged Paper Texture Background
    ctx.fillStyle = "#EFE6D5";
    ctx.fillRect(0, 0, 750, 1050);

    // Weathered Outer Frame
    ctx.strokeStyle = "#382F24";
    ctx.lineWidth = 3;
    ctx.strokeRect(28, 28, 694, 994);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#BAAA91";
    ctx.strokeRect(34, 34, 682, 982);

    // School Title Banner
    ctx.textAlign = "center";
    ctx.font = "bold 38px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = "#261E16";
    ctx.fillText(modeOptions.school || "Riverside High School", 375, 82);

    // Subheader Class Year
    ctx.font = "bold 17px 'Outfit', sans-serif";
    ctx.fillStyle = "#524434";
    ctx.letterSpacing = "3px";
    ctx.fillText((modeOptions.classYear || "CLASS OF 1996").toUpperCase(), 375, 114);
    ctx.letterSpacing = "0px";

    // 2x2 Portrait Grid
    const grid = [
        { x: 65, y: 145, w: 285, h: 295, label: modeOptions.sup1 || "Best Smile" },
        { x: 400, y: 145, w: 285, h: 295, label: modeOptions.sup2 || "Most Likely To Go Viral ★" },
        { x: 65, y: 550, w: 285, h: 295, label: modeOptions.sup3 || "Most Creative" },
        { x: 400, y: 550, w: 285, h: 295, label: modeOptions.sup4 || "Most Likely To Change The World" }
    ];

    grid.forEach((item, idx) => {
        // Inner shadow and frame
        ctx.fillStyle = "#1E1812";
        ctx.fillRect(item.x - 2, item.y - 2, item.w + 4, item.h + 4);

        const img = images[idx] || images[0];
        if (img) {
            ctx.save();
            ctx.drawImage(img, item.x, item.y, item.w, item.h);
            ctx.restore();
        }

        // Caption label below photo
        ctx.font = "italic 16px Georgia, serif";
        ctx.fillStyle = "#2D241A";
        ctx.textAlign = "center";
        ctx.fillText(item.label, item.x + item.w / 2, item.y + item.h + 38);
    });
}

/**
 * 5. Vintage Photo Strip (4-Cut 35mm Filmstrip) Canvas Renderer
 */
function renderStripCanvas(canvas, ctx, images) {
    const stripW = 440;
    const totalH = 1460;
    canvas.width = stripW;
    canvas.height = totalH;

    // Authentic 35mm Negative Film Black
    ctx.fillStyle = "#0A0A0F";
    ctx.fillRect(0, 0, stripW, totalH);

    // Perforated Sprocket Holes along left and right edges
    const sprocketW = 14, sprocketH = 22, sprocketR = 4;
    ctx.fillStyle = "#F8FAFC";
    for (let sy = 24; sy < totalH - 24; sy += 36) {
        drawRoundRect(ctx, 14, sy, sprocketW, sprocketH, sprocketR);
        drawRoundRect(ctx, stripW - 14 - sprocketW, sy, sprocketW, sprocketH, sprocketR);
    }

    // 4 Photo Frames Stacked Vertically
    const photoW = 344;
    const photoH = 260;
    const photoX = 48;
    const startY = 50;
    const gap = 34;

    images.slice(0, 4).forEach((img, idx) => {
        const py = startY + idx * (photoH + gap);

        // Frame border
        ctx.fillStyle = "#181822";
        ctx.fillRect(photoX - 2, py - 2, photoW + 4, photoH + 4);

        if (img) {
            ctx.save();
            ctx.drawImage(img, photoX, py, photoW, photoH);
            ctx.restore();
        }
    });

    // Bottom Vintage Date Stamp in Retro Font
    ctx.textAlign = "center";
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillStyle = "#E2E8F0";
    ctx.fillText(modeOptions.stamp || "OCT 6, 2026", stripW / 2, totalH - 65);
}

function drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
}

/**
 * 6. Music Album Cover (Jewel Case + CD) Canvas Renderer
 */
function renderAlbumCanvas(canvas, ctx, img) {
    canvas.width = 800;
    canvas.height = 1150;

    // Dark Studio Background
    ctx.fillStyle = "#0B0C14";
    ctx.fillRect(0, 0, 800, 1150);

    // Jewel Case Frame
    ctx.fillStyle = "#121422";
    ctx.fillRect(40, 30, 720, 680);
    ctx.strokeStyle = "#2D334D";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 30, 720, 680);

    // Acrylic Jewel Case spine on left
    const spineGrad = ctx.createLinearGradient(40, 0, 72, 0);
    spineGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    spineGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
    spineGrad.addColorStop(1, "rgba(0, 0, 0, 0.5)");
    ctx.fillStyle = spineGrad;
    ctx.fillRect(40, 30, 32, 680);

    // Header info inside jewel case
    ctx.textAlign = "left";
    ctx.font = "bold 38px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText((modeOptions.artist || "NISHCHAL").toUpperCase(), 90, 85);

    ctx.font = "bold 16px 'Outfit', sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.letterSpacing = "4px";
    ctx.fillText((modeOptions.title || "MIDNIGHT").toUpperCase(), 90, 112);
    ctx.letterSpacing = "0px";

    // Main Cover Photo
    const photoX = 90, photoY = 130, photoW = 620, photoH = 430;
    ctx.save();
    if (currentFilter && currentFilter !== "none") ctx.filter = currentFilter;
    ctx.drawImage(img, photoX, photoY, photoW, photoH);
    ctx.restore();

    // Tracklist (bottom left of jewel case)
    ctx.font = "14px monospace";
    ctx.fillStyle = "#CBD5E1";
    const tracks = ["1. DREAMER", "2. GOOD DAYS", "3. MAIN CHARACTER", "4. NO LIMITS", "5. JUST ME"];
    tracks.forEach((t, i) => {
        ctx.fillText(t, 90, 595 + (i * 20));
    });

    // Authentic Parental Advisory Box (bottom right of jewel case)
    const paX = 570, paY = 590, paW = 140, paH = 80;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(paX, paY, paW, paH);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(paX + 2, paY + 2, paW - 4, paH - 4);
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("PARENTAL", paX + paW / 2, paY + 28);
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("ADVISORY", paX + paW / 2, paY + 50);
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("EXPLICIT CONTENT", paX + paW / 2, paY + 68);

    // Physical CD Disc below jewel case
    const cdCenterX = 400, cdCenterY = 920, cdRadius = 180;

    // CD Outer Disc with rainbow sheen
    const cdGrad = ctx.createConicGradient ? ctx.createConicGradient(Math.PI / 4, cdCenterX, cdCenterY) : null;
    if (cdGrad) {
        cdGrad.addColorStop(0, "#FF0080");
        cdGrad.addColorStop(0.2, "#7928CA");
        cdGrad.addColorStop(0.4, "#0070F3");
        cdGrad.addColorStop(0.6, "#00DFD8");
        cdGrad.addColorStop(0.8, "#FFD700");
        cdGrad.addColorStop(1, "#FF0080");
        ctx.fillStyle = cdGrad;
    } else {
        ctx.fillStyle = "#B0B7C3";
    }
    ctx.beginPath();
    ctx.arc(cdCenterX, cdCenterY, cdRadius, 0, Math.PI * 2);
    ctx.fill();

    // CD Center Hole and Hub
    ctx.fillStyle = "#0B0C14";
    ctx.beginPath();
    ctx.arc(cdCenterX, cdCenterY, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#1E2235";
    ctx.beginPath();
    ctx.arc(cdCenterX, cdCenterY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Handwritten Disc Label
    ctx.save();
    ctx.translate(cdCenterX + 35, cdCenterY + 75);
    ctx.rotate(-0.15);
    ctx.font = "bold 26px 'Chewy', cursive, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 6;
    ctx.textAlign = "center";
    ctx.fillText(modeOptions.discLabel || `${modeOptions.title || "Midnight"} ${modeOptions.artist || "Nishchal"}`, 0, 0);
    ctx.restore();
}

/**
 * 7. Character / Trading Card Canvas Renderer
 */
function renderTradingCardCanvas(canvas, ctx, img) {
    canvas.width = 650;
    canvas.height = 950;

    // Rainbow Holographic Foil Border
    const holoGrad = ctx.createLinearGradient(0, 0, 650, 950);
    holoGrad.addColorStop(0, "#FF0080");
    holoGrad.addColorStop(0.25, "#7928CA");
    holoGrad.addColorStop(0.5, "#0070F3");
    holoGrad.addColorStop(0.75, "#00DFD8");
    holoGrad.addColorStop(1, "#FFD700");

    ctx.fillStyle = holoGrad;
    ctx.fillRect(0, 0, 650, 950);

    // Inner Card Face
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(20, 20, 610, 910);

    // Card Header
    ctx.textAlign = "left";
    ctx.font = "bold 28px 'Outfit', sans-serif";
    ctx.fillStyle = "#FFD700";
    ctx.fillText((modeOptions.cardName || "NISHCHAL").toUpperCase(), 50, 65);

    ctx.textAlign = "right";
    ctx.font = "bold 22px 'Outfit', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("LVL 99", 600, 65);

    // Center Framed Photo
    const photoX = 50, photoY = 85, photoW = 550, photoH = 430;
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 3;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    ctx.save();
    if (currentFilter && currentFilter !== "none") ctx.filter = currentFilter;
    ctx.drawImage(img, photoX, photoY, photoW, photoH);
    ctx.restore();

    // Rarity Ribbon
    ctx.textAlign = "center";
    ctx.font = "bold 18px 'Outfit', sans-serif";
    ctx.fillStyle = "#FFD700";
    ctx.fillText("★ ★ ★ ★ ★ ULTRA RARE ★ ★ ★ ★ ★", 325, 555);

    // Stats Grid
    const stats = [
        { label: "Aura", val: modeOptions.aura || 100 },
        { label: "Charisma", val: modeOptions.charisma || 97 },
        { label: "Creativity", val: modeOptions.creativity || 94 },
        { label: "Luck", val: modeOptions.luck || 82 }
    ];

    let statY = 600;
    stats.forEach(st => {
        ctx.textAlign = "left";
        ctx.font = "bold 18px 'Outfit', sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(st.label, 60, statY);

        ctx.textAlign = "right";
        ctx.fillStyle = "#FFD700";
        ctx.fillText(`${st.val}%`, 590, statY);

        // Progress Bar
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillRect(60, statY + 8, 530, 10);
        ctx.fillStyle = "#00DFD8";
        ctx.fillRect(60, statY + 8, (530 * (st.val / 100)), 10);

        statY += 55;
    });

    ctx.textAlign = "center";
    ctx.font = "12px monospace";
    ctx.fillStyle = "#64748B";
    ctx.fillText("1ST EDITION • FOIL • COLLECTOR ID #007 • MYTHIC", 325, 905);
}

/**
 * 8. Breaking News Canvas Renderer
 */
function renderBreakingNewsCanvas(canvas, ctx, img) {
    canvas.width = 880;
    canvas.height = 550;

    // Draw Photo
    ctx.save();
    if (currentFilter && currentFilter !== "none") ctx.filter = currentFilter;
    ctx.drawImage(img, 0, 0, 880, 550);
    ctx.restore();

    // Top Right LIVE badge
    ctx.fillStyle = "#E53E3E";
    ctx.fillRect(740, 25, 115, 36);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(760, 43, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("LIVE", 776, 49);

    // Top Left Channel Bug
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(25, 25, 140, 36);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("NNN 24/7 NEWS", 38, 49);

    // Bottom News Lower-Third Chyron
    const chyronY = 410;
    ctx.fillStyle = "#E53E3E";
    ctx.fillRect(0, chyronY, 880, 42);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px 'Bebas Neue', Impact, sans-serif";
    ctx.fillText("BREAKING NEWS SPECIAL REPORT", 30, chyronY + 30);

    // Main Headline Banner
    ctx.fillStyle = "#1A202C";
    ctx.fillRect(0, chyronY + 42, 880, 56);
    ctx.fillStyle = "#ECC94B";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(`${(modeOptions.name || 'NISHCHAL').toUpperCase()}: LOCAL LEGEND SPOTTED ONLINE`, 30, chyronY + 80);

    // Lower Crawl Ticker
    ctx.fillStyle = "#ECC94B";
    ctx.fillRect(0, chyronY + 98, 880, 32);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`LATEST: ${(modeOptions.ticker || 'AURA LEVELS SURPASS CRITICAL THRESHOLDS • DEVELOPING STORY')}`, 30, chyronY + 120);
}

/**
 * 9. Polaroid Love / Besties Canvas Renderer
 */
function renderPolaroidCanvas(canvas, ctx, img) {
    canvas.width = 700;
    canvas.height = 850;

    // Polaroid White Paper with slight warm tint
    ctx.fillStyle = "#FBFBFB";
    ctx.fillRect(0, 0, 700, 850);
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 700, 850);

    // Square photo frame
    const photoX = 50, photoY = 60, photoW = 600, photoH = 600;
    ctx.save();
    if (currentFilter && currentFilter !== "none") ctx.filter = currentFilter;
    ctx.drawImage(img, photoX, photoY, photoW, photoH);
    ctx.restore();

    // Washi Tape at top center
    ctx.save();
    ctx.translate(350, 30);
    ctx.rotate(-0.04);
    ctx.fillStyle = "rgba(212, 83, 126, 0.6)";
    ctx.fillRect(-60, -14, 120, 28);
    ctx.restore();

    // Handwritten Script Note
    ctx.textAlign = "center";
    ctx.font = "bold 32px 'Chewy', cursive, sans-serif";
    ctx.fillStyle = "#2D3748";
    ctx.fillText(modeOptions.quote || "Besties & Core Memories Forever", 350, 740);

    // Date
    ctx.font = "16px 'Outfit', sans-serif";
    ctx.fillStyle = "#A0AEC0";
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    ctx.fillText(dateStr, 350, 785);
}

/**
 * 9. Comic Book Cover Canvas Renderer
 */
function renderComicCanvas(canvas, ctx, img) {
    canvas.width = 800;
    canvas.height = 1150;

    // Vintage Comic Yellow Background
    ctx.fillStyle = "#FFDD00";
    ctx.fillRect(0, 0, 800, 1150);

    // Thick Comic Ink Border
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 768, 1118);

    // Corner Issue Box
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(30, 30, 90, 70);
    ctx.strokeRect(30, 30, 90, 70);
    ctx.textAlign = "center";
    ctx.fillStyle = "#E50914";
    ctx.font = "bold 26px 'Bebas Neue', Impact, sans-serif";
    ctx.fillText("No. 1", 75, 62);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 15px 'Bebas Neue', Impact, sans-serif";
    ctx.fillText("OCT 2026", 75, 88);

    // Comic Giant 3D Title
    ctx.save();
    ctx.translate(420, 90);
    ctx.rotate(-0.02);
    ctx.textAlign = "center";
    ctx.font = "bold 68px 'Bebas Neue', Impact, sans-serif";
    ctx.fillStyle = "#000000";
    ctx.fillText(modeOptions.comicTitle || "THE AMAZING NISHCHAL", 4, 4);
    ctx.fillStyle = "#FFDD00";
    ctx.fillText(modeOptions.comicTitle || "THE AMAZING NISHCHAL", 2, 2);
    ctx.fillStyle = "#E50914";
    ctx.fillText(modeOptions.comicTitle || "THE AMAZING NISHCHAL", 0, 0);
    ctx.restore();

    // Central Hero Photo Frame
    const photoX = 50, photoY = 135, photoW = 700, photoH = 750;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    ctx.save();
    if (currentFilter && currentFilter !== "none") ctx.filter = currentFilter;
    ctx.drawImage(img, photoX, photoY, photoW, photoH);
    ctx.restore();

    // Comic Speech Bubble
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(480, 180, 240, 60, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000000";
    ctx.font = "bold 24px 'Chewy', cursive, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(modeOptions.bubble || "GOOD VIBES ONLY!", 600, 218);

    // Action Starburst / Banner
    ctx.fillStyle = "#FF3366";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(470, 780, 260, 64, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 38px 'Bebas Neue', Impact, sans-serif";
    ctx.fillText(modeOptions.burst || "MAIN CHARACTER!", 600, 825);

    // Barcode at bottom left
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(70, 800, 140, 70);
    ctx.strokeRect(70, 800, 140, 70);
    ctx.fillStyle = "#000000";
    for (let x = 80; x < 195; x += 6) {
        const w = (x % 12 === 0) ? 4 : 2;
        ctx.fillRect(x, 810, w, 50);
    }

    // Bottom Editorial Stamp
    ctx.fillStyle = "#000000";
    ctx.font = "bold 22px 'Bebas Neue', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PHOTOBOOTH COMICS GROUP • CERTIFIED COLLECTOR EDITION", 400, 940);
}

/**
 * Utility: Helper to draw Y2K 4-point sparkle star
 */
function drawSparkle(ctx, cx, cy, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx, cy, cx + size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + size);
    ctx.quadraticCurveTo(cx, cy, cx - size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - size);
    ctx.fill();
    ctx.restore();
}

/**
 * Utility: Canvas text wrapping
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

/**
 * Initialize Preset Filters & UI Configuration
 */
function initializeConfigPreset() {
    switchMode("newspaper");

    // Apply preset filter if specified
    if (initialFilter && initialFilter !== "none") {
        currentFilter = initialFilter;
        camera.style.filter = currentFilter;

        filterButtons.forEach(btn => {
            if (btn.dataset.filter === initialFilter) {
                filterButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            }
        });
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
