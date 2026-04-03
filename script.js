// ========================================
// AI BACKGROUND REMOVER - JavaScript
// Using remove.bg API (Free Tier)
// ========================================

// API Configuration
// Get your FREE API key from: https://www.remove.bg/api
// Free tier: 50 API calls/month
const API_CONFIG = {
    endpoint: 'https://api.remove.bg/v1.0/removebg',
    apiKey: 'eQGv1mCTXbgW6wjvNPxBa56w' // Your remove.bg API key
};

// Global State
let uploadedFile = null;
let originalImageData = null;
let processedImageData = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const actionSection = document.getElementById('actionSection');
const originalImage = document.getElementById('originalImage');
const processedImage = document.getElementById('processedImage');
const removeBtn = document.getElementById('removeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const loader = document.getElementById('loader');
const statusMessage = document.getElementById('statusMessage');

// ========================================
// EVENT LISTENERS
// ========================================

// File Input Click
uploadArea.addEventListener('click', () => fileInput.click());

// File Input Change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadImage(file);
    }
});

// Drag & Drop Events
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            uploadImage(file);
        } else {
            showError('Please upload a valid image file');
        }
    }
});

// Button Events
removeBtn.addEventListener('click', processImage);
downloadBtn.addEventListener('click', downloadImage);
resetBtn.addEventListener('click', resetForm);

// ========================================
// MAIN FUNCTIONS
// ========================================

/**
 * Upload and display original image
 * @param {File} file - The image file
 */
function uploadImage(file) {
    // Validate file
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showError('Image size must be less than 10MB');
        return;
    }

    uploadedFile = file;
    
    // Read and display original image
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImageData = e.target.result;
        showPreview();
    };
    reader.readAsDataURL(file);
}

/**
 * Show preview section and display original image
 */
function showPreview() {
    originalImage.src = originalImageData;
    previewSection.style.display = 'block';
    actionSection.style.display = 'flex';
    downloadBtn.style.display = 'none';
    showMessage('Image loaded successfully! Click "Remove Background" to process.', 'success');
}

/**
 * Process image with remove.bg API
 * ⚠️ REQUIRES API KEY: https://www.remove.bg/api
 */
async function processImage() {
    if (!uploadedFile) {
        showError('Please upload an image first');
        return;
    }

    // Check if API key is configured
    if (API_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
        showError(
            '🔑 API Key Required!\n\n' +
            '1. Visit: https://www.remove.bg/api\n' +
            '2. Sign up FREE (50 calls/month)\n' +
            '3. Copy your API key\n' +
            '4. Open script.js line 12 and replace "YOUR_API_KEY_HERE"\n' +
            '5. Save and reload'
        );
        return;
    }

    try {
        // Disable button and show loader
        removeBtn.disabled = true;
        loader.style.display = 'flex';
        statusMessage.innerHTML = '';
        downloadBtn.style.display = 'none';

        // Prepare form data
        const formData = new FormData();
        formData.append('image_file', uploadedFile);
        formData.append('size', 'auto');

        // Call remove.bg API
        const response = await fetch(API_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'X-Api-Key': API_CONFIG.apiKey
            },
            body: formData
        });

        // Handle API response
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (response.status === 403) {
                throw new Error(
                    '❌ Invalid API Key!\n\n' +
                    'Your API key is incorrect or expired.\n' +
                    'Check: https://www.remove.bg/api'
                );
            } else if (response.status === 402) {
                throw new Error(
                    '⚠️ API Quota Exceeded!\n\n' +
                    'Free tier: 50 calls/month\n' +
                    'Upgrade at: https://www.remove.bg/api'
                );
            } else if (response.status === 400) {
                throw new Error(
                    '❌ Invalid Image Format!\n\n' +
                    'Supported: JPG, PNG, WebP\n' +
                    'Max size: 10MB'
                );
            } else {
                throw new Error(
                    `API Error ${response.status}: ` + 
                    (errorData.errors?.[0]?.title || 'Unknown error')
                );
            }
        }

        // Convert response to blob
        const blob = await response.blob();
        
        if (blob.type !== 'image/png') {
            throw new Error('Unexpected response format from API');
        }

        // Store processed image
        const reader = new FileReader();
        reader.onload = (e) => {
            processedImageData = e.target.result;
            processedImage.src = processedImageData;
            downloadBtn.style.display = 'flex';
            showMessage('✅ Background removed successfully with remove.bg API!', 'success');
        };
        reader.readAsDataURL(blob);

    } catch (error) {
        showError(error.message);
    } finally {
        removeBtn.disabled = false;
        loader.style.display = 'none';
    }
}

/**
 * Download processed image as PNG
 */
function downloadImage() {
    const img = document.getElementById('processedImage');
    const a = document.createElement('a');
    a.href = img.src;
    a.download = 'removed-bg.png';
    a.click();
}

/**
 * Reset form and clear all data
 */
function resetForm() {
    uploadedFile = null;
    originalImageData = null;
    processedImageData = null;
    
    fileInput.value = '';
    previewSection.style.display = 'none';
    actionSection.style.display = 'none';
    loader.style.display = 'none';
    statusMessage.innerHTML = '';
    
    originalImage.src = '';
    processedImage.src = '';
    removeBtn.disabled = false;
    downloadBtn.style.display = 'none';
    
    showMessage('Ready for new image', 'info');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Show success message
 * @param {string} message - The message to display
 * @param {string} type - Message type: success, error, info
 */
function showMessage(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    // Auto-hide info messages after 5 seconds
    if (type === 'info') {
        setTimeout(() => {
            if (statusMessage.classList.contains('info')) {
                statusMessage.innerHTML = '';
                statusMessage.className = 'status-message';
            }
        }, 5000);
    }
}

/**
 * Show error message
 * @param {string} error - The error message
 */
function showError(error) {
    console.error('Error:', error);
    showMessage(error, 'error');
}

/**
 * Show result - display before/after images
 * @param {string} originalUrl - Original image URL
 * @param {string} processedUrl - Processed image URL
 */
function showResult(originalUrl, processedUrl) {
    originalImage.src = originalUrl;
    processedImage.src = processedUrl;
    previewSection.style.display = 'block';
    downloadBtn.style.display = 'flex';
}

// ========================================
// INITIALIZATION
// ========================================

// Show info message on load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (API_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
            showMessage(
                '🔑 Get Your API Key:\n' +
                '1. Visit: https://www.remove.bg/api\n' +
                '2. Sign up FREE (50 calls/month)\n' +
                '3. Copy API key\n' +
                '4. Open script.js line 12 and paste',
                'info'
            );
        } else {
            showMessage('✨ API Ready! Upload an image and click "Remove Background"', 'success');
        }
    }, 500);
});

// ========================================
// API KEY SETUP INSTRUCTIONS
// ========================================
// 
// ⚠️ REQUIRED: remove.bg API Key
// This tool requires a valid remove.bg API key to work
//
// STEPS:
// 1. Visit: https://www.remove.bg/api
// 2. Sign up for FREE account (takes 1 minute)
// 3. Get API key from dashboard
// 4. Edit this file (script.js), line 12:
//    - Find: apiKey: 'YOUR_API_KEY_HERE'
//    - Replace: apiKey: 'your_actual_key_here'
// 5. Save file and reload browser
//
// FREE TIER:
// ✓ 50 API calls per month
// ✓ Unlimited image size
// ✓ Transparent PNG output
// ✓ Commercial use allowed
//
// That's it! The tool will work immediately!
//
// ========================================
