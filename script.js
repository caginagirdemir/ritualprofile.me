// Example pattern images (replace with your own PNGs in the 'patterns' folder)
const patternImages = [
    'patterns/pattern1.png',
    'patterns/pattern2.png',
    'patterns/pattern3.png',
    'patterns/pattern-black.png',
    'patterns/pattern-white.png',
    'patterns/pattern-orange.png',
    'patterns/pattern-pink.png',
    'patterns/pattern-yellow.png'
];

const patternsList = document.getElementById('patterns-list');
const profileUpload = document.getElementById('profile-upload');
const profileCanvas = document.getElementById('profile-canvas');
const downloadBtn = document.getElementById('download-btn');
const ctx = profileCanvas.getContext('2d');

let uploadedImage = null;
let selectedPattern = null;
let patternImgObj = null;

// Pattern transform state
let patternState = {
    x: 128,
    y: 128,
    scale: 1,
    dragging: false,
    offsetX: 0,
    offsetY: 0
};

// Load pattern options
patternImages.forEach((src, idx) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'pattern-option';
    img.title = `Pattern ${idx + 1}`;
    img.addEventListener('click', () => {
        document.querySelectorAll('.pattern-option').forEach(el => el.classList.remove('selected'));
        img.classList.add('selected');
        selectedPattern = src;
        patternImgObj = new Image();
        patternImgObj.onload = () => {
            // Reset pattern state to center and default scale
            patternState.x = 128;
            patternState.y = 128;
            patternState.scale = 1;
            drawCanvas();
        };
        patternImgObj.src = src;
    });
    patternsList.appendChild(img);
});

profileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
            uploadedImage = img;
            drawCanvas();
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'discord-profile.png';
    link.href = profileCanvas.toDataURL('image/png');
    link.click();
});

// Drag and resize logic
profileCanvas.addEventListener('mousedown', (e) => {
    if (!patternImgObj) return;
    const rect = profileCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    // Check if mouse is inside the pattern image
    const size = 256 * patternState.scale;
    const left = patternState.x - size / 2;
    const top = patternState.y - size / 2;
    if (
        mouseX >= left && mouseX <= left + size &&
        mouseY >= top && mouseY <= top + size
    ) {
        patternState.dragging = true;
        patternState.offsetX = mouseX - patternState.x;
        patternState.offsetY = mouseY - patternState.y;
    }
});

document.addEventListener('mousemove', (e) => {
    if (!patternState.dragging) return;
    const rect = profileCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    patternState.x = mouseX - patternState.offsetX;
    patternState.y = mouseY - patternState.offsetY;
    drawCanvas();
});

document.addEventListener('mouseup', () => {
    patternState.dragging = false;
});

profileCanvas.addEventListener('wheel', (e) => {
    if (!patternImgObj) return;
    e.preventDefault();
    // Zoom in/out with mouse wheel
    const scaleAmount = 0.08;
    if (e.deltaY < 0) {
        patternState.scale *= (1 + scaleAmount);
    } else {
        patternState.scale *= (1 - scaleAmount);
    }
    // Clamp scale
    patternState.scale = Math.max(0.2, Math.min(3, patternState.scale));
    drawCanvas();
}, { passive: false });

function drawCanvas() {
    // Clear canvas
    ctx.clearRect(0, 0, profileCanvas.width, profileCanvas.height);
    // Draw uploaded image as a circle
    if (uploadedImage) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(128, 128, 128, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(uploadedImage, 0, 0, 256, 256);
        ctx.restore();
    }
    // Draw selected pattern
    if (patternImgObj && patternImgObj.complete && patternImgObj.naturalWidth > 0) {
        const size = 256 * patternState.scale;
        ctx.drawImage(
            patternImgObj,
            patternState.x - size / 2,
            patternState.y - size / 2,
            size,
            size
        );
    }
} 