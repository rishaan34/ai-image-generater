// ==== GLOBAL STATE ====
let selectedTags = [];
let currentImage = null; // Image object
let importedImage = null; // For compositing
let isErasing = false;
let eraseRadius = 28;

// ==== DOM ELEMENTS ====
const tagButtons = document.querySelectorAll('.tag');
const generateBtn = document.getElementById('generateBtn');
const promptInput = document.getElementById('prompt');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
const loadingElem = document.getElementById('loading');
const importImageInput = document.getElementById('importImage');
const importInstructionInput = document.getElementById('importInstruction');
const importBtn = document.getElementById('importBtn');
const magicEraserBtn = document.getElementById('magicEraserBtn');
const downloadBtn = document.getElementById('downloadBtn');

// ==== TAG LOGIC ====
tagButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('selected');
    const tag = btn.dataset.tag;
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter(t => t !== tag);
    } else {
      selectedTags.push(tag);
    }
  });
});

// ==== IMAGE GENERATION ====
generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert("Please enter a prompt to describe the image.");
    return;
  }
  loadingElem.classList.remove('hidden');
  generateBtn.disabled = true;
  try {
    // Compose prompt with selected tags
    const stylePrompt = selectedTags.length > 0 ? `${prompt}, ${selectedTags.join(', ')}` : prompt;

    // --- PLACEHOLDER: Replace with your AI image generation API call ---
    // Example: Use Stable Diffusion, Replicate, or your backend endpoint
    // For demo, we'll use a placeholder image
    // const imageUrl = await generateAIImage(stylePrompt);
    // await loadImageOnCanvas(imageUrl);

    await loadImageOnCanvas('https://placehold.co/512x512?text=AI+Image');
    // ^ replace this with the result of your AI API call

  } catch (err) {
    alert("Failed to generate image: " + err.message);
  }
  generateBtn.disabled = false;
  loadingElem.classList.add('hidden');
});

// ==== CANVAS IMAGE LOAD ====
async function loadImageOnCanvas(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
      ctx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
      currentImage = img;
      resolve();
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

// ==== MAGIC ERASER ====
let eraserActive = false;

magicEraserBtn.addEventListener('click', () => {
  eraserActive = !eraserActive;
  magicEraserBtn.classList.toggle('active', eraserActive);
  imageCanvas.style.cursor = eraserActive ? 'crosshair' : 'default';
});

// Erasing logic
imageCanvas.addEventListener('mousedown', e => {
  if (!eraserActive) return;
  eraseAtEvent(e);
  imageCanvas.addEventListener('mousemove', eraseAtEvent);
});
window.addEventListener('mouseup', () => {
  imageCanvas.removeEventListener('mousemove', eraseAtEvent);
});
function eraseAtEvent(e) {
  const rect = imageCanvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * imageCanvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * imageCanvas.height;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, eraseRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

// ==== IMAGE IMPORT & COMPOSITING ====
importImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new window.Image();
    img.onload = function() {
      importedImage = img;
      alert("Image loaded! Now describe where to add it and click 'Add to Picture'.");
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

importBtn.addEventListener('click', async () => {
  if (!importedImage) {
    alert("Please import an image first.");
    return;
  }
  const instruction = importInstructionInput.value.trim();
  if (!instruction) {
    alert("Describe how to add the image (e.g., 'Put this waterfall in the background').");
    return;
  }
  loadingElem.textContent = "Compositing Image with AI...";
  loadingElem.classList.remove('hidden');
  importBtn.disabled = true;

  try {
    // --- PLACEHOLDER: Compose images with AI ---
    // You would call your backend API here, e.g. using Stable Diffusion Inpainting or ControlNet
    // with the main image, the imported image, and the instruction.

    // For demo, we'll just overlay the imported image at the bottom right.
    ctx.drawImage(importedImage, imageCanvas.width - 180, imageCanvas.height - 180, 170, 170);

    // To fully implement this: send both images + instruction to your backend AI for smart compositing.
    // Example API: POST {mainImage, importedImage, instruction} -> returns new composited image.
  } catch (err) {
    alert("Failed to add image: " + err.message);
  }
  importBtn.disabled = false;
  loadingElem.classList.add('hidden');
  loadingElem.textContent = "Generating Image...";
  importedImage = null;
  importImageInput.value = "";
  importInstructionInput.value = "";
});

// ==== DOWNLOAD BUTTON ====
downloadBtn.addEventListener('click', () => {
  const url = imageCanvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "ai-image.png";
  a.click();
});

// ==== HELPER: Example AI Image Generation API Call ====
// async function generateAIImage(prompt) {
//   // Example: Use fetch to call your backend AI API with {prompt}
//   // const response = await fetch('YOUR_AI_ENDPOINT', {
//   //   method: 'POST',
//   //   headers: { 'Content-Type': 'application/json' },
//   //   body: JSON.stringify({ prompt })
//   // });
//   // const data = await response.json();
//   // return data.image_url;
//   // For demo, just return placeholder
//   return 'https://placehold.co/512x512?text=AI+Image';
// }