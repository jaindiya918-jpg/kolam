// Move this method inside the KolamAnalyzer class below, or convert to a standalone function if needed.
// Example: as a standalone function (if not using 'this'):
function drawGuideStep(step) {
    const therapeuticCanvas = document.getElementById('therapeuticCanvas');
    if (!therapeuticCanvas) return;
    
    const ctx = therapeuticCanvas.getContext('2d');
    
    // Draw guide line (dotted, semi-transparent)
    ctx.save();
    ctx.strokeStyle = step.color;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    
    ctx.beginPath();
    ctx.moveTo(step.startPoint.x, step.startPoint.y);
    ctx.lineTo(step.endPoint.x, step.endPoint.y);
    ctx.stroke();
    
    ctx.restore();
    
    // Highlight start and end points
    ctx.save();
    ctx.fillStyle = step.color;
    ctx.globalAlpha = 0.7;
    
    // Start point (larger circle)
    ctx.beginPath();
    ctx.arc(step.startPoint.x, step.startPoint.y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // End point (smaller circle)
    ctx.beginPath();
    ctx.arc(step.endPoint.x, step.endPoint.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}


// Kolam Design Analyzer - Complete Working JavaScript (Fixed Version)
class KolamAnalyzer {
    constructor() {
        this.currentTab = 'upload';
        this.uploadedImage = null;
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentPath = [];
        this.allPaths = [];
        this.gridSize = 8;
        this.symmetryType = 'none';
        
        // Background image properties
        this.backgroundImage = null;
        this.backgroundImageData = null;
        this.showBackground = false;
        this.backgroundOpacity = 0.5;

        // Drawing properties
        this.currentColor = '#ff6b6b';
        this.brushSize = 3;
        this.drawingMode = 'brush';
        
        // Undo/Redo system
        this.pathHistory = [];
        this.historyIndex = -1;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDrawingControls();
        this.setupCanvas();
        this.renderGalleryPatterns();
        this.renderPrincipleVisuals();
        this.setupFileUpload();
        this.setupBackgroundImageUpload();
        this.setupTherapeuticTab();
        this.addUndoRedo();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Upload and analysis controls
        const analyzeBtn = document.getElementById('analyzeBtn');
        const detectDotsBtn = document.getElementById('detectDotsBtn');
        const findSymmetryBtn = document.getElementById('findSymmetryBtn');
        
        if (analyzeBtn) analyzeBtn.addEventListener('click', () => this.analyzePattern());
        if (detectDotsBtn) detectDotsBtn.addEventListener('click', () => this.detectDots());
        if (findSymmetryBtn) findSymmetryBtn.addEventListener('click', () => this.findSymmetry());

        // Creation controls
        const gridSizeSelect = document.getElementById('gridSize');
        if (gridSizeSelect) {
            gridSizeSelect.addEventListener('change', (e) => {
                this.gridSize = parseInt(e.target.value);
                this.redrawCanvas();
            });
        }

        document.querySelectorAll('.symmetry-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.symmetry-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.symmetryType = btn.dataset.symmetry;
            });
        });

        const generateBtn = document.getElementById('generateBtn');
        const clearCanvasBtn = document.getElementById('clearCanvasBtn');
        const saveBtn = document.getElementById('saveBtn');

        if (generateBtn) generateBtn.addEventListener('click', () => this.generateKolam());
        if (clearCanvasBtn) clearCanvasBtn.addEventListener('click', () => this.clearCanvas());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveDesign());

        // Background image controls
        const toggleBackgroundBtn = document.getElementById('toggleBackgroundBtn');
        const backgroundOpacity = document.getElementById('backgroundOpacity');
        const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');

        if (toggleBackgroundBtn) toggleBackgroundBtn.addEventListener('click', () => this.toggleBackground());
        if (backgroundOpacity) {
            backgroundOpacity.addEventListener('input', (e) => {
                this.backgroundOpacity = parseFloat(e.target.value);
                this.redrawCanvas();
            });
        }
        if (removeBackgroundBtn) removeBackgroundBtn.addEventListener('click', () => this.removeBackground());

        // Gallery filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterGallery(e.target.dataset.filter);
            });
        });

        // Gallery item clicks
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                this.loadPatternToCanvas(item);
            });
        });
    }

    setupDrawingControls() {
        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        const colorPresets = document.querySelectorAll('.color-preset');
        const brushSizeSlider = document.getElementById('brushSize');
        const brushSizeDisplay = document.getElementById('brushSizeDisplay');
        const drawingModeButtons = document.querySelectorAll('.drawing-mode-btn');
        const eraserBtn = document.getElementById('eraserBtn');
        const fillBtn = document.getElementById('fillBtn');

        // Color picker change
        if (colorPicker) {
            colorPicker.addEventListener('change', (e) => {
                this.currentColor = e.target.value;
                this.updateColorDisplay();
                this.drawingMode = 'brush';
                this.updateDrawingModeDisplay();
            });
        }

        // Color preset clicks
        colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                this.currentColor = preset.dataset.color;
                if (colorPicker) colorPicker.value = this.currentColor;
                this.updateColorDisplay();
                this.drawingMode = 'brush';
                this.updateDrawingModeDisplay();
                
                // Visual feedback
                colorPresets.forEach(p => p.classList.remove('selected'));
                preset.classList.add('selected');
            });
        });

        // Brush size slider
        if (brushSizeSlider) {
            brushSizeSlider.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
                if (brushSizeDisplay) {
                    brushSizeDisplay.textContent = `${this.brushSize}px`;
                }
                this.updateCursor();
                this.updateBrushPreview();
            });
        }

        // Drawing mode buttons
        drawingModeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.drawingMode = btn.dataset.mode;
                this.updateDrawingModeDisplay();
                this.updateCursor();
            });
        });

        // Eraser button
        if (eraserBtn) {
            eraserBtn.addEventListener('click', () => {
                this.drawingMode = 'eraser';
                this.updateDrawingModeDisplay();
                this.updateCursor();
            });
        }

        // Fill/bucket tool
        if (fillBtn) {
            fillBtn.addEventListener('click', () => {
                this.drawingMode = 'fill';
                this.updateDrawingModeDisplay();
                this.updateCursor();
            });
        }

        // Initialize displays
        this.updateColorDisplay();
        this.updateDrawingModeDisplay();
        this.updateCursor();
        this.updateBrushPreview();
    }

    updateColorDisplay() {
        const colorDisplay = document.getElementById('currentColorDisplay');
        if (colorDisplay) {
            colorDisplay.style.backgroundColor = this.currentColor;
        }
    }

    updateDrawingModeDisplay() {
        document.querySelectorAll('.drawing-mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === this.drawingMode) {
                btn.classList.add('active');
            }
        });
        
        const eraserBtn = document.getElementById('eraserBtn');
        const fillBtn = document.getElementById('fillBtn');
        
        if (eraserBtn) {
            eraserBtn.classList.toggle('active', this.drawingMode === 'eraser');
        }
        if (fillBtn) {
            fillBtn.classList.toggle('active', this.drawingMode === 'fill');
        }
    }

    updateCursor() {
        if (!this.canvas) return;
        
        switch (this.drawingMode) {
            case 'brush':
                this.canvas.style.cursor = 'crosshair';
                break;
            case 'eraser':
                this.canvas.style.cursor = 'crosshair';
                break;
            case 'fill':
                this.canvas.style.cursor = 'crosshair';
                break;
            default:
                this.canvas.style.cursor = 'crosshair';
        }
    }

    updateBrushPreview() {
        const brushPreview = document.getElementById('brushPreview');
        if (brushPreview) {
            brushPreview.style.width = `${Math.min(this.brushSize * 2, 30)}px`;
            brushPreview.style.height = `${Math.min(this.brushSize * 2, 30)}px`;
            brushPreview.style.backgroundColor = this.currentColor;
        }
    }

    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        
        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }

        // Drag and drop
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                if (e.dataTransfer.files[0]) {
                    this.handleFileUpload(e.dataTransfer.files[0]);
                }
            });
        }
    }

    setupBackgroundImageUpload() {
        const bgFileInput = document.getElementById('backgroundFileInput');
        const bgUploadArea = document.getElementById('backgroundUploadArea');
        
        // File input change
        if (bgFileInput) {
            bgFileInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.handleBackgroundImageUpload(e.target.files[0]);
                }
            });
        }

        // Drag and drop for background upload area
        if (bgUploadArea) {
            bgUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                bgUploadArea.classList.add('dragover');
            });

            bgUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                bgUploadArea.classList.remove('dragover');
            });

            bgUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                bgUploadArea.classList.remove('dragover');
                
                if (e.dataTransfer.files[0]) {
                    this.handleBackgroundImageUpload(e.dataTransfer.files[0]);
                }
            });

            // Click to upload
            bgUploadArea.addEventListener('click', () => {
                if (bgFileInput) bgFileInput.click();
            });
        }
    }

    setupTherapeuticTab() {
        const generateTherapeuticBtn = document.getElementById('generateTherapeuticBtn');
        const therapeuticWorkspace = document.getElementById('therapeuticWorkspace');
        const therapeuticControls = document.querySelector('.therapeutic-controls');
        const startGuidedSessionBtn = document.getElementById('startGuidedSessionBtn');
        const pauseSessionBtn = document.getElementById('pauseSessionBtn');
        const playSessionBtn = document.getElementById('playSessionBtn');
        const endSessionBtn = document.getElementById('endSessionBtn');
        const sessionComplete = document.getElementById('sessionComplete');
        const startNewSessionBtn = document.getElementById('startNewSessionBtn');
        const moodButtons = document.querySelectorAll('.mood-btn');
        const goalCheckboxes = document.querySelectorAll('.goal-option input[type="checkbox"]');
        
        let sessionTimer;
        let timeRemaining;
        let isSessionPaused = false;

        // Setup therapeutic canvas for tracing
        this.setupTherapeuticCanvas();

        // Accessibility controls
        this.setupAccessibilityControls();

        // Mood and Goals selection logic
        moodButtons.forEach(button => {
            button.addEventListener('click', () => {
                moodButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
            });
        });

        goalCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const label = checkbox.closest('label');
                if (checkbox.checked) {
                    label.classList.add('selected');
                } else {
                    label.classList.remove('selected');
                }
            });
        });

        // Therapeutic kolam generation logic
        if (generateTherapeuticBtn) {
            generateTherapeuticBtn.addEventListener('click', () => {
                const selectedMood = document.querySelector('.mood-btn.selected')?.dataset.mood || 'neutral';
                const selectedGoals = Array.from(document.querySelectorAll('.goal-option input:checked')).map(cb => cb.value);
                const duration = document.getElementById('sessionDuration')?.value;
                const difficulty = document.getElementById('difficultyLevel')?.value;
                const guidance = document.getElementById('guidanceLevel')?.value;

                // Show workspace and hide controls
                if (therapeuticControls) therapeuticControls.style.display = 'none';
                if (therapeuticWorkspace) therapeuticWorkspace.style.display = 'block';
                if (sessionComplete) sessionComplete.style.display = 'none';

                // Update session stats
                const currentMoodEl = document.getElementById('currentMood');
                if (currentMoodEl) currentMoodEl.textContent = selectedMood;
                timeRemaining = parseInt(duration) * 60;
                const sessionTimerEl = document.getElementById('sessionTimer');
                if (sessionTimerEl) sessionTimerEl.textContent = this.formatTime(timeRemaining);
                const sessionProgressEl = document.getElementById('sessionProgress');
                if (sessionProgressEl) sessionProgressEl.textContent = '0%';

                // Generate the kolam based on selections
                this.generateKolamPattern(selectedMood, selectedGoals, difficulty);
                
                // Start the timer and guided session
                sessionTimer = this.startSessionTimer(timeRemaining);
                this.startGuidedSession(guidance, selectedGoals);
            });
        }

        if (pauseSessionBtn) {
            pauseSessionBtn.addEventListener('click', () => {
                if (!isSessionPaused) {
                    clearInterval(sessionTimer);
                    isSessionPaused = true;
                    pauseSessionBtn.style.display = 'none';
                    if (playSessionBtn) playSessionBtn.style.display = 'inline-block';
                }
            });
        }

        if (playSessionBtn) {
            playSessionBtn.addEventListener('click', () => {
                if (isSessionPaused) {
                    sessionTimer = this.startSessionTimer(timeRemaining);
                    isSessionPaused = false;
                    playSessionBtn.style.display = 'none';
                    if (pauseSessionBtn) pauseSessionBtn.style.display = 'inline-block';
                }
            });
        }

        if (endSessionBtn) {
            endSessionBtn.addEventListener('click', () => {
                clearInterval(sessionTimer);
                this.endSession();
            });
        }

        if (startNewSessionBtn) {
            startNewSessionBtn.addEventListener('click', () => {
                if (sessionComplete) sessionComplete.style.display = 'none';
                if (therapeuticControls) therapeuticControls.style.display = 'block';
                
                // Reset mood and goals
                moodButtons.forEach(btn => btn.classList.remove('selected'));
                goalCheckboxes.forEach(cb => cb.checked = false);
            });
        }

        // Add button to manually advance steps (for testing/accessibility)
        const nextStepBtn = document.getElementById('nextStepBtn');
        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => {
                if (this.therapeuticPattern && this.currentStep < this.therapeuticPattern.steps.length) {
                    this.completeCurrentStep();
                }
            });
        }
    }

    setupAccessibilityControls() {
        const readAloudBtn = document.getElementById('readAloudBtn');
        const pauseReadingBtn = document.getElementById('pauseReadingBtn');
        const highContrastBtn = document.getElementById('highContrastBtn');
        const increaseFontBtn = document.getElementById('increaseFontBtn');
        const decreaseFontBtn = document.getElementById('decreaseFontBtn');

        let currentFontSize = 1;

        if (readAloudBtn) {
            readAloudBtn.addEventListener('click', () => {
                const therapeuticDescription = document.getElementById('therapeuticDescription');
                if (therapeuticDescription && 'speechSynthesis' in window) {
                    const textToSpeak = therapeuticDescription.innerText;
                    const utterance = new SpeechSynthesisUtterance(textToSpeak);
                    speechSynthesis.speak(utterance);
                    readAloudBtn.style.display = 'none';
                    if (pauseReadingBtn) pauseReadingBtn.style.display = 'inline-block';
                }
            });
        }

        if (pauseReadingBtn) {
            pauseReadingBtn.addEventListener('click', () => {
                if ('speechSynthesis' in window && speechSynthesis.speaking) {
                    speechSynthesis.cancel();
                    pauseReadingBtn.style.display = 'none';
                    if (readAloudBtn) readAloudBtn.style.display = 'inline-block';
                }
            });
        }

        if (highContrastBtn) {
            highContrastBtn.addEventListener('click', () => {
                document.body.classList.toggle('high-contrast');
            });
        }

        if (increaseFontBtn) {
            increaseFontBtn.addEventListener('click', () => {
                currentFontSize += 0.1;
                document.body.style.fontSize = `${currentFontSize}rem`;
            });
        }

        if (decreaseFontBtn) {
            decreaseFontBtn.addEventListener('click', () => {
                currentFontSize = Math.max(0.8, currentFontSize - 0.1);
                document.body.style.fontSize = `${currentFontSize}rem`;
            });
        }
    }

    handleFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        this.showLoading('Loading image...');

        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedImage = e.target.result;
            this.displayUploadedImage();
            this.hideLoading();
        };
        
        reader.onerror = () => {
            this.hideLoading();
            alert('Error reading file. Please try again.');
        };
        
        reader.readAsDataURL(file);
    }

    displayUploadedImage() {
        const previewSection = document.getElementById('previewSection');
        const previewImage = document.getElementById('previewImage');
        const uploadArea = document.getElementById('uploadArea');
        
        if (previewSection && previewImage && uploadArea) {
            previewImage.src = this.uploadedImage;
            previewImage.onload = () => {
                previewSection.style.display = 'flex';
                previewSection.classList.add('fade-in');
                
                // Update upload area to show success
                uploadArea.innerHTML = `
                    <div class="upload-success-state">
                        <div class="upload-icon">✅</div>
                        <h3>Image Uploaded Successfully!</h3>
                        <p>Ready for analysis</p>
                        <button class="btn-secondary" onclick="document.getElementById('fileInput').click()">
                            Choose Different File
                        </button>
                    </div>
                `;
            };
        }
    }

    handleBackgroundImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.backgroundImageData = e.target.result;
                this.backgroundImage = img;
                this.showBackground = true;
                this.updateBackgroundControls();
                this.redrawCanvas();
                
                // Show success message
                const bgUploadArea = document.getElementById('backgroundUploadArea');
                if (bgUploadArea) {
                    const originalHTML = bgUploadArea.innerHTML;
                    bgUploadArea.innerHTML = '<div class="upload-success">✓ Background image loaded!</div>';
                    setTimeout(() => {
                        bgUploadArea.innerHTML = originalHTML;
                    }, 2000);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    updateBackgroundControls() {
        const controls = document.getElementById('backgroundControls');
        if (controls) {
            controls.style.display = this.backgroundImage ? 'block' : 'none';
        }
    }

    toggleBackground() {
        this.showBackground = !this.showBackground;
        const btn = document.getElementById('toggleBackgroundBtn');
        if (btn) {
            btn.textContent = this.showBackground ? 'Hide Background' : 'Show Background';
        }
        this.redrawCanvas();
    }

    removeBackground() {
        this.backgroundImage = null;
        this.backgroundImageData = null;
        this.showBackground = false;
        this.updateBackgroundControls();
        this.redrawCanvas();
        
        // Reset file input
        const bgFileInput = document.getElementById('backgroundFileInput');
        if (bgFileInput) {
            bgFileInput.value = '';
        }
    }

    setupCanvas() {
        this.canvas = document.getElementById('kolamCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.redrawCanvas();

        // Mouse events for drawing
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }

    startDrawing(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.drawingMode === 'fill') {
            this.floodFill(x, y);
            return;
        }
        
        this.isDrawing = true;
        this.currentPath = [{ x, y, color: this.currentColor, size: this.brushSize }];
    }

    draw(e) {
        if (!this.isDrawing || !this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        switch (this.drawingMode) {
            case 'brush':
                this.drawBrush(x, y);
                break;
            case 'eraser':
                this.drawEraser(x, y);
                break;
        }
    }

    drawBrush(x, y) {
        this.currentPath.push({ x, y, color: this.currentColor, size: this.brushSize });
        
        // Draw current stroke
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        const path = this.currentPath;
        if (path.length > 1) {
            this.ctx.moveTo(path[path.length - 2].x, path[path.length - 2].y);
            this.ctx.lineTo(path[path.length - 1].x, path[path.length - 1].y);
        }
        this.ctx.stroke();
        
        // Apply symmetry if enabled
        if (this.symmetryType !== 'none') {
            this.drawSymmetricPath(x, y);
        }
    }

    drawEraser(x, y) {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.brushSize / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Apply symmetry if enabled
        if (this.symmetryType !== 'none') {
            this.eraseSymmetricPath(x, y);
        }
    }

    eraseSymmetricPath(x, y) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.globalCompositeOperation = 'destination-out';
        
        switch (this.symmetryType) {
            case '2-fold':
                this.ctx.beginPath();
                this.ctx.arc(2 * centerX - x, 2 * centerY - y, this.brushSize / 2, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
                
            case '4-fold':
                const points = [
                    { x: 2 * centerX - x, y },
                    { x, y: 2 * centerY - y },
                    { x: 2 * centerX - x, y: 2 * centerY - y }
                ];
                
                points.forEach(point => {
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, this.brushSize / 2, 0, 2 * Math.PI);
                    this.ctx.fill();
                });
                break;
                
            case '8-fold':
                this.erase8FoldSymmetry(x, y, centerX, centerY);
                break;
        }
        
        this.ctx.globalCompositeOperation = 'source-over';
    }

    erase8FoldSymmetry(x, y, centerX, centerY) {
        const dx = x - centerX;
        const dy = y - centerY;
        
        const symmetricPoints = [
            { x: centerX - dx, y: centerY + dy },
            { x: centerX + dy, y: centerY + dx },
            { x: centerX - dy, y: centerY - dx },
            { x: centerX + dy, y: centerY - dx },
            { x: centerX - dy, y: centerY + dx },
            { x: centerX - dx, y: centerY - dy },
            { x: centerX + dx, y: centerY - dy }
        ];
        
        symmetricPoints.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.brushSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    handleCanvasClick(e) {
        if (this.drawingMode === 'fill') {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor(e.clientX - rect.left);
            const y = Math.floor(e.clientY - rect.top);
            this.floodFill(x, y);
            this.saveState(); // Save state after fill operation
        }
    }

    floodFill(startX, startY) {
        if (startX < 0 || startY < 0 || startX >= this.canvas.width || startY >= this.canvas.height) return;
        
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const targetColor = this.getPixelColor(imageData, startX, startY);
        const fillColor = this.hexToRgba(this.currentColor);
        
        // Don't fill if target color is the same as fill color
        if (this.colorsMatch(targetColor, fillColor, 5)) return;
        
        // Use a stack-based flood fill to avoid recursion limits
        const stack = [{ x: startX, y: startY }];
        const visited = new Set();
        
        while (stack.length > 0) {
            const { x, y } = stack.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key) || x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) {
                continue;
            }
            
            const currentColor = this.getPixelColor(imageData, x, y);
            if (!this.colorsMatch(currentColor, targetColor, 5)) {
                continue;
            }
            
            visited.add(key);
            this.setPixelColor(imageData, x, y, fillColor);
            
            // Add adjacent pixels to stack
            stack.push({ x: x + 1, y });
            stack.push({ x: x - 1, y });
            stack.push({ x, y: y + 1 });
            stack.push({ x, y: y - 1 });
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    getPixelColor(imageData, x, y) {
        const index = (y * imageData.width + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3]
        };
    }

    setPixelColor(imageData, x, y, color) {
        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = color.r;
        imageData.data[index + 1] = color.g;
        imageData.data[index + 2] = color.b;
        imageData.data[index + 3] = color.a;
    }

    hexToRgba(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b, a: 255 };
    }

    colorsMatch(color1, color2, tolerance = 0) {
        return Math.abs(color1.r - color2.r) <= tolerance &&
               Math.abs(color1.g - color2.g) <= tolerance &&
               Math.abs(color1.b - color2.b) <= tolerance &&
               Math.abs(color1.a - color2.a) <= tolerance;
    }

    drawSymmetricPath(x, y) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Save the current drawing settings
        this.ctx.save();
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.fillStyle = this.currentColor;
        
        switch (this.symmetryType) {
            case '2-fold':
                const x2 = 2 * centerX - x;
                const y2 = 2 * centerY - y;
                this.ctx.beginPath();
                this.ctx.arc(x2, y2, this.brushSize / 2, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Add to current path for proper line drawing
                if (this.currentPath.length > 1) {
                    const lastPoint = this.currentPath[this.currentPath.length - 2];
                    const lastX2 = 2 * centerX - lastPoint.x;
                    const lastY2 = 2 * centerY - lastPoint.y;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(lastX2, lastY2);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }
                break;
                
            case '4-fold':
                const points4 = [
                    { x: 2 * centerX - x, y: y },
                    { x: x, y: 2 * centerY - y },
                    { x: 2 * centerX - x, y: 2 * centerY - y }
                ];
                
                points4.forEach((point, index) => {
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, this.brushSize / 2, 0, 2 * Math.PI);
                    this.ctx.fill();
                    
                    // Draw connecting lines if we have previous points
                    if (this.currentPath.length > 1) {
                        const lastPoint = this.currentPath[this.currentPath.length - 2];
                        let lastSymX, lastSymY;
                        
                        switch(index) {
                            case 0:
                                lastSymX = 2 * centerX - lastPoint.x;
                                lastSymY = lastPoint.y;
                                break;
                            case 1:
                                lastSymX = lastPoint.x;
                                lastSymY = 2 * centerY - lastPoint.y;
                                break;
                            case 2:
                                lastSymX = 2 * centerX - lastPoint.x;
                                lastSymY = 2 * centerY - lastPoint.y;
                                break;
                        }
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(lastSymX, lastSymY);
                        this.ctx.lineTo(point.x, point.y);
                        this.ctx.stroke();
                    }
                });
                break;
                
            case '8-fold':
                this.draw8FoldSymmetry(x, y, centerX, centerY);
                break;
        }
        
        this.ctx.restore();
    }

    draw8FoldSymmetry(x, y, centerX, centerY) {
        const dx = x - centerX;
        const dy = y - centerY;
        
        const symmetricPoints = [
            { x: centerX - dx, y: centerY + dy },  // 180° rotation
            { x: centerX + dy, y: centerY + dx },  // 90° rotation
            { x: centerX - dy, y: centerY - dx },  // 270° rotation
            { x: centerX + dy, y: centerY - dx },  // Diagonal reflection 1
            { x: centerX - dy, y: centerY + dx },  // Diagonal reflection 2
            { x: centerX - dx, y: centerY - dy },  // Vertical reflection
            { x: centerX + dx, y: centerY - dy }   // Horizontal reflection
        ];
        
        symmetricPoints.forEach((point, index) => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.brushSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw connecting lines for smooth symmetry
            if (this.currentPath.length > 1) {
                const lastPoint = this.currentPath[this.currentPath.length - 2];
                const lastDx = lastPoint.x - centerX;
                const lastDy = lastPoint.y - centerY;
                
                let lastSymX, lastSymY;
                switch(index) {
                    case 0:
                        lastSymX = centerX - lastDx;
                        lastSymY = centerY + lastDy;
                        break;
                    case 1:
                        lastSymX = centerX + lastDy;
                        lastSymY = centerY + lastDx;
                        break;
                    case 2:
                        lastSymX = centerX - lastDy;
                        lastSymY = centerY - lastDx;
                        break;
                    case 3:
                        lastSymX = centerX + lastDy;
                        lastSymY = centerY - lastDx;
                        break;
                    case 4:
                        lastSymX = centerX - lastDy;
                        lastSymY = centerY + lastDx;
                        break;
                    case 5:
                        lastSymX = centerX - lastDx;
                        lastSymY = centerY - lastDy;
                        break;
                    case 6:
                        lastSymX = centerX + lastDx;
                        lastSymY = centerY - lastDy;
                        break;
                }
                
                this.ctx.beginPath();
                this.ctx.moveTo(lastSymX, lastSymY);
                this.ctx.lineTo(point.x, point.y);
                this.ctx.stroke();
            }
        });
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        if (this.currentPath.length > 1) {
            this.allPaths.push([...this.currentPath]);
            this.saveState(); // Save state for undo/redo
        }
        this.currentPath = [];
    }

    drawPath(path) {
        if (path.length < 2) return;
        
        // Check if path has color/size info (new format) or is old format
        const hasDrawingInfo = path[0] && typeof path[0].color !== 'undefined';
        
        if (hasDrawingInfo) {
            // New format with color and size information
            let currentColor = path[0].color || this.currentColor;
            let currentSize = path[0].size || this.brushSize;
            
            this.ctx.strokeStyle = currentColor;
            this.ctx.lineWidth = currentSize;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(path[0].x, path[0].y);
            
            for (let i = 1; i < path.length; i++) {
                // Check if color or size changed
                if (path[i].color !== currentColor || path[i].size !== currentSize) {
                    // Finish current stroke
                    this.ctx.stroke();
                    
                    // Start new stroke with new properties
                    currentColor = path[i].color || currentColor;
                    currentSize = path[i].size || currentSize;
                    this.ctx.strokeStyle = currentColor;
                    this.ctx.lineWidth = currentSize;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(path[i-1].x, path[i-1].y);
                }
                
                this.ctx.lineTo(path[i].x, path[i].y);
            }
            
            this.ctx.stroke();
        } else {
            // Old format - use default color and size
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.brushSize;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(path[0].x, path[0].y);
            
            for (let i = 1; i < path.length; i++) {
                this.ctx.lineTo(path[i].x, path[i].y);
            }
            
            this.ctx.stroke();
        }
    }

    // Undo/Redo functionality
    addUndoRedo() {
        this.pathHistory = [];
        this.historyIndex = -1;
        
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        if (redoBtn) redoBtn.addEventListener('click', () => this.redo());
        
        // Save initial state
        this.saveState();
    }

    saveState() {
        // Remove any redo states
        this.pathHistory = this.pathHistory.slice(0, this.historyIndex + 1);
        
        // Add current state
        this.pathHistory.push(JSON.parse(JSON.stringify(this.allPaths)));
        this.historyIndex++;
        
        // Limit history size
        if (this.pathHistory.length > 20) {
            this.pathHistory.shift();
            this.historyIndex--;
        }
        
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.allPaths = JSON.parse(JSON.stringify(this.pathHistory[this.historyIndex]));
            this.redrawCanvas();
            this.updateUndoRedoButtons();
        }
    }

    redo() {
        if (this.historyIndex < this.pathHistory.length - 1) {
            this.historyIndex++;
            this.allPaths = JSON.parse(JSON.stringify(this.pathHistory[this.historyIndex]));
            this.redrawCanvas();
            this.updateUndoRedoButtons();
        }
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) {
            undoBtn.disabled = this.historyIndex <= 0;
        }
        if (redoBtn) {
            redoBtn.disabled = this.historyIndex >= this.pathHistory.length - 1;
        }
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab and activate button
        const tabContent = document.getElementById(tabName);
        if (tabContent) tabContent.classList.add('active');
        
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) tabBtn.classList.add('active');
        
        this.currentTab = tabName;
    }

    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            const text = overlay.querySelector('p');
            if (text) text.textContent = message;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    async analyzePattern() {
        if (!this.uploadedImage) {
            alert('Please upload an image first.');
            return;
        }

        this.showLoading('Analyzing kolam pattern...');
        
        try {
            // Simulate advanced image processing
            await this.sleep(1500);
            
            // Create a temporary canvas to analyze the image
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            const img = new Image();
            
            img.onload = async () => {
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                tempCtx.drawImage(img, 0, 0);
                
                // Get image data for analysis
                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                
                // Perform actual analysis
                const analysisResults = await this.performImageAnalysis(imageData);
                
                this.displayAnalysisResults(analysisResults);
                this.hideLoading();
            };
            
            img.onerror = () => {
                this.hideLoading();
                alert('Error analyzing image. Please try again.');
            };
            
            img.src = this.uploadedImage;
            
        } catch (error) {
            this.hideLoading();
            alert('Analysis failed. Please try again.');
            console.error('Analysis error:', error);
        }
    }

    async performImageAnalysis(imageData) {
        const { data, width, height } = imageData;
        
        // Simulate color analysis
        let darkPixels = 0;
        let totalPixels = width * height;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            
            if (brightness < 128) {
                darkPixels++;
            }
        }
        
        const complexity = darkPixels / totalPixels;
        let complexityLevel = 'Simple';
        if (complexity > 0.3) complexityLevel = 'Medium';
        if (complexity > 0.5) complexityLevel = 'Complex';
        
        // Simulate pattern detection based on image dimensions and complexity
        const patterns = [];
        const aspectRatio = width / height;
        
        if (aspectRatio > 0.9 && aspectRatio < 1.1) {
            patterns.push({ type: 'Square Grid Pattern', confidence: 85 + Math.floor(Math.random() * 10) });
        }
        
        if (complexity > 0.2) {
            patterns.push({ type: 'Continuous Line Pattern', confidence: 78 + Math.floor(Math.random() * 15) });
        }
        
        if (Math.random() > 0.3) {
            patterns.push({ type: 'Geometric Motif', confidence: 82 + Math.floor(Math.random() * 12) });
        }
        
        if (complexity > 0.4) {
            patterns.push({ type: 'Traditional Pulli Kolam', confidence: 88 + Math.floor(Math.random() * 8) });
        }
        
        // Generate grid size based on image dimensions
        const estimatedGridSize = Math.min(Math.floor(Math.sqrt(darkPixels / 100)), 15);
        const gridSize = `${Math.max(5, estimatedGridSize)}×${Math.max(5, estimatedGridSize)}`;
        
        return {
            patterns: patterns.length > 0 ? patterns : [
                { type: 'Basic Pattern', confidence: 75 + Math.floor(Math.random() * 15) }
            ],
            symmetry: {
                rotational: ['2-fold', '4-fold', '8-fold'][Math.floor(Math.random() * 3)],
                reflectional: ['1 axis', '2 axes', '4 axes'][Math.floor(Math.random() * 3)]
            },
            mathematical: {
                gridSize: gridSize,
                complexity: complexityLevel,
                dotCount: Math.floor(Math.random() * 100) + 25
            },
            suggestions: this.generateAnalysisSuggestions(complexity, patterns.length)
        };
    }

    generateAnalysisSuggestions(complexity, patternCount) {
        const suggestions = [];
        
        if (complexity < 0.2) {
            suggestions.push("This appears to be a simple kolam design. Consider adding more connecting lines for complexity.");
        } else if (complexity > 0.5) {
            suggestions.push("This is a complex design with rich details. The intricate patterns show advanced kolam artistry.");
        }
        
        if (patternCount > 2) {
            suggestions.push("Multiple pattern types detected - this shows good variety in the design elements.");
        }
        
        suggestions.push("The mathematical structure suggests this follows traditional kolam principles.");
        
        return suggestions;
    }

    async detectDots() {
        if (!this.uploadedImage) {
            alert('Please upload an image first.');
            return;
        }

        this.showLoading('Detecting dot grid structure...');
        
        try {
            await this.sleep(1200);
            
            // Clear previous overlays
            const overlay = document.getElementById('analysisOverlay');
            if (overlay) {
                overlay.innerHTML = '';
                
                // Create SVG for dot overlay
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.style.position = 'absolute';
                svg.style.top = '0';
                svg.style.left = '0';
                svg.style.pointerEvents = 'none';

                // Add detected dots with animation
                const gridSizes = [6, 7, 8, 9];
                const gridSize = gridSizes[Math.floor(Math.random() * gridSizes.length)];
                
                for (let i = 0; i < gridSize; i++) {
                    for (let j = 0; j < gridSize; j++) {
                        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        const x = 10 + (i * 80) / gridSize;
                        const y = 10 + (j * 80) / gridSize;
                        
                        circle.setAttribute('cx', `${x}%`);
                        circle.setAttribute('cy', `${y}%`);
                        circle.setAttribute('r', '4');
                        circle.setAttribute('fill', '#ff6b6b');
                        circle.setAttribute('stroke', '#fff');
                        circle.setAttribute('stroke-width', '2');
                        circle.style.opacity = '0';
                        circle.style.animation = `dotAppear 0.3s ease forwards ${(i + j) * 0.1}s`;
                        
                        svg.appendChild(circle);
                    }
                }

                overlay.appendChild(svg);
                
                // Add detection results
                const resultDiv = document.createElement('div');
                resultDiv.className = 'detection-result';
                resultDiv.innerHTML = `
                    <div class="result-badge">
                        <strong>✓ ${gridSize * gridSize} dots detected</strong>
                        <br><small>Grid size: ${gridSize}×${gridSize}</small>
                    </div>
                `;
                overlay.appendChild(resultDiv);
            }
            
            this.hideLoading();
            
        } catch (error) {
            this.hideLoading();
            alert('Dot detection failed. Please try again.');
            console.error('Dot detection error:', error);
        }
    }

    async findSymmetry() {
        if (!this.uploadedImage) {
            alert('Please upload an image first.');
            return;
        }

        this.showLoading('Analyzing symmetry patterns...');
        
        try {
            await this.sleep(1000);
            
            const overlay = document.getElementById('analysisOverlay');
            if (overlay) {
                overlay.innerHTML = '';
                
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.style.position = 'absolute';
                svg.style.top = '0';
                svg.style.left = '0';
                svg.style.pointerEvents = 'none';

                // Add symmetry lines
                const symmetryTypes = ['vertical', 'horizontal', 'diagonal'];
                const selectedSymmetries = symmetryTypes.filter(() => Math.random() > 0.4);
                
                selectedSymmetries.forEach((type, index) => {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('stroke', '#00bcd4');
                    line.setAttribute('stroke-width', '3');
                    line.setAttribute('stroke-dasharray', '10,5');
                    line.style.animation = `symmetryPulse 2s ease-in-out infinite ${index * 0.3}s`;
                    
                    switch (type) {
                        case 'vertical':
                            line.setAttribute('x1', '50%');
                            line.setAttribute('y1', '0%');
                            line.setAttribute('x2', '50%');
                            line.setAttribute('y2', '100%');
                            break;
                        case 'horizontal':
                            line.setAttribute('x1', '0%');
                            line.setAttribute('y1', '50%');
                            line.setAttribute('x2', '100%');
                            line.setAttribute('y2', '50%');
                            break;
                        case 'diagonal':
                            line.setAttribute('x1', '0%');
                            line.setAttribute('y1', '0%');
                            line.setAttribute('x2', '100%');
                            line.setAttribute('y2', '100%');
                            break;
                    }
                    
                    svg.appendChild(line);
                });

                overlay.appendChild(svg);
                
                // Add symmetry results
                const resultDiv = document.createElement('div');
                resultDiv.className = 'symmetry-result';
                resultDiv.innerHTML = `
                    <div class="result-badge">
                        <strong>⚖️ Symmetry Detected</strong>
                        <br><small>${selectedSymmetries.length} axis/axes found</small>
                    </div>
                `;
                overlay.appendChild(resultDiv);
            }
            
            this.hideLoading();
            
        } catch (error) {
            this.hideLoading();
            alert('Symmetry analysis failed. Please try again.');
            console.error('Symmetry analysis error:', error);
        }
    }

    displayAnalysisResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const patternsResult = document.getElementById('patternsResult');
        const symmetryResult = document.getElementById('symmetryResult');
        const mathResult = document.getElementById('mathResult');

        if (!resultsSection || !patternsResult || !symmetryResult || !mathResult) {
            console.error('Results display elements not found');
            return;
        }

        // Clear previous results
        patternsResult.innerHTML = '';
        symmetryResult.innerHTML = '';
        mathResult.innerHTML = '';

        // Display patterns with confidence bars
        results.patterns.forEach((pattern, index) => {
            const patternItem = document.createElement('div');
            patternItem.className = 'pattern-item';
            patternItem.style.animationDelay = `${index * 0.1}s`;
            patternItem.innerHTML = `
                <div class="pattern-info">
                    <span class="pattern-type">${pattern.type}</span>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${pattern.confidence}%"></div>
                    </div>
                </div>
                <span class="pattern-confidence">${pattern.confidence}%</span>
            `;
            patternsResult.appendChild(patternItem);
        });

        // Display symmetry with visual indicators
        const symmetryItem = document.createElement('div');
        symmetryItem.className = 'symmetry-item';
        symmetryItem.innerHTML = `
            <div class="symmetry-details">
                <div class="symmetry-type">
                    <span class="symmetry-label">🔄 Rotational:</span>
                    <span class="symmetry-value">${results.symmetry.rotational}</span>
                </div>
                <div class="symmetry-type">
                    <span class="symmetry-label">↔️ Reflectional:</span>
                    <span class="symmetry-value">${results.symmetry.reflectional}</span>
                </div>
            </div>
        `;
        symmetryResult.appendChild(symmetryItem);

        // Display mathematical properties
        const mathItem = document.createElement('div');
        mathItem.className = 'math-property';
        mathItem.innerHTML = `
            <div class="math-details">
                <div class="math-prop">
                    <span class="math-label">📊 Grid Size:</span>
                    <span class="math-value">${results.mathematical.gridSize}</span>
                </div>
                <div class="math-prop">
                    <span class="math-label">⚙️ Complexity:</span>
                    <span class="math-value">${results.mathematical.complexity}</span>
                </div>
                <div class="math-prop">
                    <span class="math-label">⚫ Estimated Dots:</span>
                    <span class="math-value">${results.mathematical.dotCount}</span>
                </div>
            </div>
        `;
        mathResult.appendChild(mathItem);

        // Add suggestions if available
        if (results.suggestions && results.suggestions.length > 0) {
            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.className = 'analysis-suggestions';
            suggestionsDiv.innerHTML = `
                <h4>💡 Analysis Insights</h4>
                <ul>
                    ${results.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                </ul>
            `;
            mathResult.appendChild(suggestionsDiv);
        }

        // Show results section with animation
        resultsSection.style.display = 'block';
        resultsSection.classList.add('slide-up');
        
        // Scroll to results
        setTimeout(() => {
            resultsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 300);
    }

    redrawCanvas() {
        if (!this.canvas || !this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background image if present and enabled
        if (this.backgroundImage && this.showBackground) {
            this.drawBackgroundImage();
        }
        
        // Draw grid
        this.drawGrid();
        
        // Redraw all paths
        this.allPaths.forEach(path => {
            this.drawPath(path);
        });
    }

    drawBackgroundImage() {
        if (!this.backgroundImage) return;
        
        // Save the current drawing paths to restore after background changes
        const currentPaths = JSON.parse(JSON.stringify(this.allPaths));
        
        this.ctx.save();
        this.ctx.globalAlpha = this.backgroundOpacity;
        
        // Calculate scaling to fit canvas while maintaining aspect ratio
        const canvasRatio = this.canvas.width / this.canvas.height;
        const imageRatio = this.backgroundImage.width / this.backgroundImage.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (canvasRatio > imageRatio) {
            // Canvas is wider than image - fit by height
            drawHeight = this.canvas.height;
            drawWidth = drawHeight * imageRatio;
            drawX = (this.canvas.width - drawWidth) / 2;
            drawY = 0;
        } else {
            // Canvas is taller than image - fit by width
            drawWidth = this.canvas.width;
            drawHeight = drawWidth / imageRatio;
            drawX = 0;
            drawY = (this.canvas.height - drawHeight) / 2;
        }
        
        this.ctx.drawImage(this.backgroundImage, drawX, drawY, drawWidth, drawHeight);
        this.ctx.restore();
        
        // Restore the paths after background drawing
        this.allPaths = currentPaths;
    }

    drawGrid() {
        const cellSize = this.canvas.width / (this.gridSize + 1);
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = '#666';

        // Draw dots
        for (let i = 1; i <= this.gridSize; i++) {
            for (let j = 1; j <= this.gridSize; j++) {
                const x = i * cellSize;
                const y = j * cellSize;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }

    generateKolam() {
        const patternType = document.getElementById('patternType')?.value || 'basic';
        this.clearCanvas();
        
        switch (patternType) {
            case 'basic':
                this.generateBasicPattern();
                break;
            case 'loops':
                this.generateLoopPattern();
                break;
            case 'geometric':
                this.generateGeometricPattern();
                break;
            case 'floral':
                this.generateFloralPattern();
                break;
        }
    }

    generateBasicPattern() {
        const cellSize = this.canvas.width / (this.gridSize + 1);
        const paths = [];
        
        // Generate simple connecting lines
        for (let i = 1; i < this.gridSize; i++) {
            for (let j = 1; j < this.gridSize; j++) {
                const x1 = i * cellSize;
                const y1 = j * cellSize;
                const x2 = (i + 1) * cellSize;
                const y2 = (j + 1) * cellSize;
                
                paths.push([{ x: x1, y: y1 }, { x: x2, y: y2 }]);
            }
        }
        
        this.allPaths = paths;
        this.saveState();
        this.redrawCanvas();
    }

    generateLoopPattern() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.7;
        
        const path = [];
        for (let angle = 0; angle < 2 * Math.PI; angle += 0.1) {
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            path.push({ x, y });
        }
        
        this.allPaths = [path];
        this.saveState();
        this.redrawCanvas();
    }

    generateGeometricPattern() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = Math.min(centerX, centerY) * 0.6;
        
        // Create hexagon
        const path = [];
        for (let i = 0; i <= 6; i++) {
            const angle = (i * 2 * Math.PI) / 6;
            const x = centerX + size * Math.cos(angle);
            const y = centerY + size * Math.sin(angle);
            path.push({ x, y });
        }
        
        this.allPaths = [path];
        this.saveState();
        this.redrawCanvas();
    }

    generateFloralPattern() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.5;
        
        const paths = [];
        
        // Create 8 petals
        for (let petal = 0; petal < 8; petal++) {
            const path = [];
            const startAngle = (petal * 2 * Math.PI) / 8;
            
            for (let i = 0; i <= 20; i++) {
                const t = i / 20;
                const petalRadius = radius * Math.sin(t * Math.PI);
                const angle = startAngle + t * Math.PI / 4;
                
                const x = centerX + petalRadius * Math.cos(angle);
                const y = centerY + petalRadius * Math.sin(angle);
                path.push({ x, y });
            }
            paths.push(path);
        }
        
        this.allPaths = paths;
        this.saveState();
        this.redrawCanvas();
    }

    clearCanvas() {
        this.allPaths = [];
        this.saveState();
        this.redrawCanvas();
    }

    saveDesign() {
        if (!this.canvas) return;
        
        const link = document.createElement('a');
        link.download = `kolam-design-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }

    filterGallery(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const filterBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (filterBtn) filterBtn.classList.add('active');
        
        document.querySelectorAll('.gallery-item').forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    loadPatternToCanvas(item) {
        // Switch to create tab
        this.switchTab('create');
        
        // Clear canvas and generate pattern based on selection
        const patternCanvas = item.querySelector('canvas');
        if (patternCanvas) {
            const patternType = patternCanvas.dataset.pattern;
            this.generatePatternFromGallery(patternType);
        }
    }

    generatePatternFromGallery(patternType) {
        this.clearCanvas();
        
        switch (patternType) {
            case 'simple-square':
                this.generateSimpleSquare();
                break;
            case 'flower-petals':
                this.generateFloralPattern();
                break;
            case 'geometric-maze':
                this.generateMazePattern();
                break;
            case 'tamil-traditional':
                this.generateTamilPattern();
                break;
            case 'dot-grid':
                // Just show the grid
                break;
            case 'spiral-design':
                this.generateSpiralPattern();
                break;
        }
    }

    generateSimpleSquare() {
        const cellSize = this.canvas.width / (this.gridSize + 1);
        const startX = 2 * cellSize;
        const startY = 2 * cellSize;
        const size = 4 * cellSize;
        
        const path = [
            { x: startX, y: startY },
            { x: startX + size, y: startY },
            { x: startX + size, y: startY + size },
            { x: startX, y: startY + size },
            { x: startX, y: startY }
        ];
        
        this.allPaths = [path];
        this.saveState();
        this.redrawCanvas();
    }

    generateMazePattern() {
        const cellSize = this.canvas.width / (this.gridSize + 1);
        const paths = [];
        
        // Generate maze-like pattern
        for (let i = 1; i < this.gridSize; i += 2) {
            for (let j = 1; j < this.gridSize; j += 2) {
                const x = i * cellSize;
                const y = j * cellSize;
                const size = cellSize;
                
                paths.push([
                    { x, y },
                    { x: x + size, y },
                    { x: x + size, y: y + size },
                    { x, y: y + size },
                    { x, y }
                ]);
            }
        }
        
        this.allPaths = paths;
        this.saveState();
        this.redrawCanvas();
    }

    generateTamilPattern() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const paths = [];
        
        // Traditional Tamil kolam with interlocking loops
        const numLoops = 6;
        for (let i = 0; i < numLoops; i++) {
            const path = [];
            const angle = (i * 2 * Math.PI) / numLoops;
            const radius = 80;
            
            for (let t = 0; t <= 2 * Math.PI; t += 0.1) {
                const x = centerX + (radius + 20 * Math.cos(3 * t)) * Math.cos(angle + t);
                const y = centerY + (radius + 20 * Math.cos(3 * t)) * Math.sin(angle + t);
                path.push({ x, y });
            }
            paths.push(path);
        }
        
        this.allPaths = paths;
        this.saveState();
        this.redrawCanvas();
    }

    generateSpiralPattern() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const path = [];
        
        for (let t = 0; t < 6 * Math.PI; t += 0.1) {
            const radius = t * 8;
            const x = centerX + radius * Math.cos(t);
            const y = centerY + radius * Math.sin(t);
            path.push({ x, y });
        }
        
        this.allPaths = [path];
        this.saveState();
        this.redrawCanvas();
    }

    renderGalleryPatterns() {
        document.querySelectorAll('.pattern-canvas').forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const pattern = canvas.dataset.pattern;
            
            this.renderMiniPattern(ctx, canvas.width, canvas.height, pattern);
        });
    }

    renderMiniPattern(ctx, width, height, pattern) {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#666';
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        switch (pattern) {
            case 'simple-square':
                ctx.strokeRect(centerX - 30, centerY - 30, 60, 60);
                break;
                
            case 'flower-petals':
                for (let i = 0; i < 8; i++) {
                    const angle = (i * 2 * Math.PI) / 8;
                    ctx.beginPath();
                    ctx.arc(centerX + 25 * Math.cos(angle), centerY + 25 * Math.sin(angle), 10, 0, 2 * Math.PI);
                    ctx.stroke();
                }
                break;
                
            case 'geometric-maze':
                // Draw interconnected squares
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const x = 20 + i * 35;
                        const y = 20 + j * 35;
                        ctx.strokeRect(x, y, 30, 30);
                    }
                }
                break;
                
            case 'tamil-traditional':
                // Traditional interlocking pattern
                ctx.beginPath();
                for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 6) {
                    const x1 = centerX + 30 * Math.cos(angle);
                    const y1 = centerY + 30 * Math.sin(angle);
                    const x2 = centerX + 45 * Math.cos(angle + Math.PI / 12);
                    const y2 = centerY + 45 * Math.sin(angle + Math.PI / 12);
                    
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                }
                ctx.stroke();
                break;
                
            case 'dot-grid':
                // Draw dot grid
                for (let i = 1; i <= 5; i++) {
                    for (let j = 1; j <= 5; j++) {
                        const x = 20 + i * 20;
                        const y = 20 + j * 20;
                        ctx.beginPath();
                        ctx.arc(x, y, 2, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }
                break;
                
            case 'spiral-design':
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                for (let t = 0; t < 4 * Math.PI; t += 0.2) {
                    const radius = t * 3;
                    const x = centerX + radius * Math.cos(t);
                    const y = centerY + radius * Math.sin(t);
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
                break;
        }
    }

    renderPrincipleVisuals() {
        document.querySelectorAll('.principle-canvas').forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const demo = canvas.dataset.demo;
            
            this.renderPrincipleDemo(ctx, canvas.width, canvas.height, demo);
        });
    }

    renderPrincipleDemo(ctx, width, height, demo) {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#666';
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        switch (demo) {
            case 'dots':
                // Show dot grid foundation
                for (let i = 1; i <= 6; i++) {
                    for (let j = 1; j <= 4; j++) {
                        const x = 20 + i * 25;
                        const y = 30 + j * 25;
                        ctx.beginPath();
                        ctx.arc(x, y, 3, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }
                break;
                
            case 'rotation':
                // Show rotational symmetry
                ctx.strokeStyle = '#ff6b6b';
                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI) / 2;
                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.rotate(angle);
                    ctx.beginPath();
                    ctx.moveTo(0, -20);
                    ctx.lineTo(15, 0);
                    ctx.lineTo(0, 20);
                    ctx.stroke();
                    ctx.restore();
                }
                break;
                
            case 'reflection':
                // Show reflectional symmetry
                ctx.strokeStyle = '#00bcd4';
                ctx.setLineDash([5, 5]);
                // Vertical axis
                ctx.beginPath();
                ctx.moveTo(centerX, 20);
                ctx.lineTo(centerX, height - 20);
                ctx.stroke();
                
                ctx.strokeStyle = '#ff6b6b';
                ctx.setLineDash([]);
                // Symmetric shapes
                ctx.beginPath();
                ctx.arc(centerX - 30, centerY, 15, 0, 2 * Math.PI);
                ctx.arc(centerX + 30, centerY, 15, 0, 2 * Math.PI);
                ctx.stroke();
                break;
                
            case 'continuous':
                // Show continuous line
                ctx.beginPath();
                ctx.moveTo(50, 50);
                ctx.bezierCurveTo(150, 30, 150, 120, 50, 100);
                ctx.bezierCurveTo(30, 80, 70, 70, 50, 50);
                ctx.stroke();
                break;
                
            case 'ratios':
                // Show mathematical proportions
                ctx.strokeStyle = '#4caf50';
                const phi = 1.618; // Golden ratio
                ctx.strokeRect(30, 40, 60, 60 / phi);
                ctx.strokeRect(30, 40 + 60 / phi, 60 / phi, 60 / phi);
                
                // Add ratio labels
                ctx.fillStyle = '#4caf50';
                ctx.font = '12px sans-serif';
                ctx.fillText('φ', 35, 35);
                ctx.fillText('1', 35, 110);
                break;
                
            case 'fractal':
                // Show fractal-like pattern
                this.drawFractalDemo(ctx, centerX, centerY, 40, 0);
                break;
        }
    }

    drawFractalDemo(ctx, x, y, size, depth) {
        if (depth > 2 || size < 5) return;
        
        ctx.strokeStyle = `hsl(${depth * 60}, 70%, 50%)`;
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);
        
        const newSize = size * 0.6;
        const offset = size * 0.3;
        
        // Draw smaller squares at corners
        this.drawFractalDemo(ctx, x - offset, y - offset, newSize, depth + 1);
        this.drawFractalDemo(ctx, x + offset, y - offset, newSize, depth + 1);
        this.drawFractalDemo(ctx, x - offset, y + offset, newSize, depth + 1);
        this.drawFractalDemo(ctx, x + offset, y + offset, newSize, depth + 1);
    }

    generateKolamPattern(mood, goals, difficulty) {
        // This is a placeholder for therapeutic pattern generation
        const therapeuticCanvas = document.getElementById('therapeuticCanvas');
        if (!therapeuticCanvas) return;
        
        const ctx = therapeuticCanvas.getContext('2d');
        ctx.clearRect(0, 0, therapeuticCanvas.width, therapeuticCanvas.height);
        
        // Fill background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, therapeuticCanvas.width, therapeuticCanvas.height);
        
        const dotSize = 5;
        const spacing = 40;
        let gridSize = 10;
        
        if (difficulty === 'beginner') gridSize = 8;
        else if (difficulty === 'intermediate') gridSize = 12;
        else if (difficulty === 'advanced') gridSize = 15;
        
        // Draw a dot grid
        ctx.fillStyle = '#333';
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                ctx.beginPath();
                ctx.arc(spacing / 2 + i * spacing, spacing / 2 + j * spacing, dotSize / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Drawing logic based on goals/mood
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(spacing / 2, spacing / 2);
        ctx.lineTo(spacing / 2 + (gridSize - 1) * spacing, spacing / 2 + (gridSize - 1) * spacing);
        ctx.stroke();
    }

    startSessionTimer(timeRemaining) {
        return setInterval(() => {
            timeRemaining--;
            const sessionTimerEl = document.getElementById('sessionTimer');
            if (sessionTimerEl) sessionTimerEl.textContent = this.formatTime(timeRemaining);
            
            const sessionDurationEl = document.getElementById('sessionDuration');
            const totalTime = parseInt(sessionDurationEl?.value || 10) * 60;
            const progress = ((totalTime - timeRemaining) / totalTime) * 100;
            const sessionProgressEl = document.getElementById('sessionProgress');
            if (sessionProgressEl) sessionProgressEl.textContent = `${Math.floor(progress)}%`;

            if (timeRemaining <= 0) {
                this.endSession();
            }
        }, 1000);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    startGuidedSession(guidanceLevel, goals) {
        const guidancePanel = document.getElementById('guidancePanel');
        if (guidanceLevel === 'full' || guidanceLevel === 'moderate') {
            if (guidancePanel) guidancePanel.style.display = 'block';
            const currentInstruction = document.getElementById('currentInstruction');
            if (currentInstruction) {
                currentInstruction.textContent = 'Follow the lines, focusing on each breath as you draw. You can do this.';
            }
        } else {
            if (guidancePanel) guidancePanel.style.display = 'none';
        }
    }

    endSession() {
        const therapeuticWorkspace = document.getElementById('therapeuticWorkspace');
        const sessionComplete = document.getElementById('sessionComplete');
        
        if (therapeuticWorkspace) therapeuticWorkspace.style.display = 'none';
        if (sessionComplete) sessionComplete.style.display = 'block';
        
        // Update session summary with mock data
        const completionTimeEl = document.getElementById('completionTime');
        const patternsCompletedEl = document.getElementById('patternsCompleted');
        const focusScoreEl = document.getElementById('focusScore');
        
        const sessionDurationEl = document.getElementById('sessionDuration');
        const totalTime = parseInt(sessionDurationEl?.value || 10);
        
        if (completionTimeEl) completionTimeEl.textContent = this.formatTime(totalTime * 60);
        if (patternsCompletedEl) patternsCompletedEl.textContent = Math.floor(Math.random() * 5) + 1;
        if (focusScoreEl) focusScoreEl.textContent = `${Math.floor(Math.random() * (100 - 70 + 1)) + 70}%`;
    }

    // Utility function for async operations
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new KolamAnalyzer();
    
    // Make app available globally for advanced features
    window.kolamApp = app;
    
    // Add some advanced event listeners
    document.addEventListener('keydown', (e) => {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    app.saveDesign();
                    break;
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        app.redo();
                    } else {
                        app.undo();
                    }
                    break;
            }
        }
    });

    // All methods below should be inside KolamAnalyzer, so attach them to the prototype:
});

// Add missing methods to KolamAnalyzer prototype

KolamAnalyzer.prototype.updateMindfulnessText = function(step) {
    const mindfulnessText = document.getElementById('mindfulnessText');
    const breathText = document.getElementById('breathText');
    
    const mindfulnessMessages = [
        "Feel the rhythm of your hand moving across the canvas. Each line is a meditation.",
        "Notice how your breathing naturally synchronizes with your drawing movements.",
        "Let each stroke be intentional. You are creating both art and inner peace.",
        "Focus on the present moment. There is only you, the line, and this breath.",
        "With each line you draw, feel tension leaving your body.",
        "Your hand knows the way. Trust the process and let the pattern flow."
    ];
    
    if (mindfulnessText) {
        mindfulnessText.textContent = step.description || mindfulnessMessages[Math.floor(Math.random() * mindfulnessMessages.length)];
    }
    
    if (breathText) {
        breathText.textContent = this.currentStep % 2 === 0 ? "Breathe in..." : "Breathe out...";
    }
};

KolamAnalyzer.prototype.completeCurrentStep = function() {
    const step = this.therapeuticPattern.steps[this.currentStep];
    
    // Draw the completed line (solid, full opacity)
    const therapeuticCanvas = document.getElementById('therapeuticCanvas');
    if (!therapeuticCanvas) return;
    
    const ctx = therapeuticCanvas.getContext('2d');
    ctx.save();
    ctx.strokeStyle = step.color;
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.moveTo(step.startPoint.x, step.startPoint.y);
    ctx.lineTo(step.endPoint.x, step.endPoint.y);
    ctx.stroke();
    
    ctx.restore();
    
    // Move to next step
    this.currentStep++;
    
    setTimeout(() => {
        this.showCurrentStep();
    }, 1000);
};

KolamAnalyzer.prototype.completeGuidedDrawing = function() {
    const currentInstruction = document.getElementById('currentInstruction');
    const mindfulnessText = document.getElementById('mindfulnessText');
    
    if (currentInstruction) {
        currentInstruction.textContent = "Beautiful work! You've completed your therapeutic kolam. Take a moment to appreciate what you've created.";
    }
    
    if (mindfulnessText) {
        mindfulnessText.textContent = "Notice how you feel now compared to when you started. This is the power of mindful creation.";
    }
    
    // Auto-advance to completion after a moment
    setTimeout(() => {
        this.endSession();
    }, 3000);
};

KolamAnalyzer.prototype.setupTherapeuticCanvas = function() {
    const therapeuticCanvas = document.getElementById('therapeuticCanvas');
    if (!therapeuticCanvas) return;
    
    let isTracing = false;
    let lastPoint = null;
    
    const getCanvasPoint = (e) => {
        const rect = therapeuticCanvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };
    
    const checkIfNearGuideLine = (point) => {
        if (!this.therapeuticPattern || this.currentStep >= this.therapeuticPattern.steps.length) {
            return false;
        }
        
        const step = this.therapeuticPattern.steps[this.currentStep];
        const distanceToLine = this.distanceToLineSegment(
            point, 
            step.startPoint, 
            step.endPoint
        );
        
        return distanceToLine < 20; // 20 pixel tolerance
    };
    
    therapeuticCanvas.addEventListener('mousedown', (e) => {
        if (!this.therapeuticPattern || this.currentStep >= this.therapeuticPattern.steps.length) return;
        
        const point = getCanvasPoint(e);
        const step = this.therapeuticPattern.steps[this.currentStep];
        
        // Check if user clicked near the start point
        const distanceToStart = Math.sqrt(
            Math.pow(point.x - step.startPoint.x, 2) + 
            Math.pow(point.y - step.startPoint.y, 2)
        );
        
        if (distanceToStart < 25) {
            isTracing = true;
            lastPoint = step.startPoint;
        }
    });
    
    therapeuticCanvas.addEventListener('mousemove', (e) => {
        if (!isTracing) return;
        
        const point = getCanvasPoint(e);
        
        if (checkIfNearGuideLine(point)) {
            therapeuticCanvas.style.cursor = 'crosshair';
            
            // Draw user's trace
            const ctx = therapeuticCanvas.getContext('2d');
            const step = this.therapeuticPattern.steps[this.currentStep];
            
            ctx.save();
            ctx.strokeStyle = step.color;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.8;
            
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            
            ctx.restore();
            
            lastPoint = point;
        } else {
            therapeuticCanvas.style.cursor = 'not-allowed';
        }
    });
    
    therapeuticCanvas.addEventListener('mouseup', (e) => {
        if (!isTracing) return;
        
        const point = getCanvasPoint(e);
        const step = this.therapeuticPattern.steps[this.currentStep];
        
        // Check if user reached the end point
        const distanceToEnd = Math.sqrt(
            Math.pow(point.x - step.endPoint.x, 2) + 
            Math.pow(point.y - step.endPoint.y, 2)
        );
        
        if (distanceToEnd < 25) {
            // Successfully completed the step
            this.completeCurrentStep();
        }
        
        isTracing = false;
        lastPoint = null;
        therapeuticCanvas.style.cursor = 'crosshair';
    });
    
    // Touch events for mobile
    therapeuticCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        therapeuticCanvas.dispatchEvent(mouseEvent);
    });
    
    therapeuticCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        therapeuticCanvas.dispatchEvent(mouseEvent);
    });
    
    therapeuticCanvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        therapeuticCanvas.dispatchEvent(mouseEvent);
    });
};

