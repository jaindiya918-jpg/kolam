// Tab Navigation
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Canvas Drawing Functionality
    const kolamCanvas = document.getElementById('kolamCanvas');
    const therapeuticCanvas = document.getElementById('therapeuticCanvas');
    
    if (kolamCanvas) {
        setupCanvas(kolamCanvas);
    }
    
    if (therapeuticCanvas) {
        setupCanvas(therapeuticCanvas);
    }
    
    function setupCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let currentColor = '#000000';
        let currentBrushSize = 3;
        let showGrid = false;
        
        // Set canvas size
        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            if (showGrid) {
                drawGrid();
            }
        }
        
        window.addEventListener('load', resizeCanvas);
        window.addEventListener('resize', resizeCanvas);
        
        // Drawing functions
        function startDrawing(e) {
            isDrawing = true;
            draw(e);
        }
        
        function draw(e) {
            if (!isDrawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ctx.lineWidth = currentBrushSize;
            ctx.lineCap = 'round';
            ctx.strokeStyle = currentColor;
            
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
        
        function stopDrawing() {
            if (isDrawing) {
                isDrawing = false;
                ctx.beginPath();
            }
        }
        
        // Mouse events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        });
        
        // Grid functionality
        function drawGrid() {
            const gridSize = 20;
            ctx.save();
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            
            // Vertical lines
            for (let x = 0; x <= canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            // Horizontal lines
            for (let y = 0; y <= canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            ctx.restore();
        }
        
        // Color selection
        const colorOptions = document.querySelectorAll('.color-option');
        const colorPicker = document.getElementById('colorPicker');
        
        if (colorOptions) {
            colorOptions.forEach(option => {
                option.addEventListener('click', () => {
                    colorOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    currentColor = option.dataset.color;
                    if (colorPicker) colorPicker.value = currentColor;
                });
            });
        }
        
        if (colorPicker) {
            colorPicker.addEventListener('change', (e) => {
                currentColor = e.target.value;
                if (colorOptions) {
                    colorOptions.forEach(opt => opt.classList.remove('active'));
                }
            });
        }
        
        // Brush size
        const brushSizeSlider = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        
        if (brushSizeSlider && brushSizeValue) {
            brushSizeSlider.addEventListener('input', (e) => {
                currentBrushSize = e.target.value;
                brushSizeValue.textContent = currentBrushSize + "px";
            });
        }
        
        // Grid toggle
        const toggleGridBtn = document.getElementById('toggleGrid');
        
        if (toggleGridBtn) {
            toggleGridBtn.addEventListener('click', () => {
                showGrid = !showGrid;
                
                if (showGrid) {
                    drawGrid();
                    toggleGridBtn.textContent = 'Hide Guide';
                } else {
                    // Clear and redraw without grid
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.putImageData(imageData, 0, 0);
                    toggleGridBtn.textContent = 'Show Guide';
                }
            });
        }
        
        // Clear canvas
        const clearCanvasBtn = document.getElementById('clearCanvas');
        
        if (clearCanvasBtn) {
            clearCanvasBtn.addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (showGrid) {
                    drawGrid();
                }
            });
        }
        
        // Save design
        const saveDesignBtn = document.getElementById('saveDesign');
        
        if (saveDesignBtn) {
            saveDesignBtn.addEventListener('click', () => {
                const dataURL = canvas.toDataURL('image/png');
                localStorage.setItem('savedKolam', dataURL);
                alert('Your design has been saved locally!');
            });
        }
        
        // Download design
        const downloadDesignBtn = document.getElementById('downloadDesign');
        
        if (downloadDesignBtn) {
            downloadDesignBtn.addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = 'kolam-design.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    }

    // Gallery Pattern Generation
    const patternCanvases = document.querySelectorAll('.pattern-canvas');
    
    patternCanvases.forEach(canvas => {
        const patternType = canvas.getAttribute('data-pattern');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 150;
        canvas.height = 150;
        
        // Draw pattern based on type
        switch(patternType) {
            case 'simple-square':
                drawSimpleSquare(ctx);
                break;
            case 'flower-petals':
                drawFlowerPetals(ctx);
                break;
            case 'geometric-maze':
                drawGeometricMaze(ctx);
                break;
            case 'tamil-traditional':
                drawTamilTraditional(ctx);
                break;
            case 'dot-grid':
                drawDotGrid(ctx);
                break;
            case 'spiral-design':
                drawSpiralDesign(ctx);
                break;
        }
    });
    
    // Pattern drawing functions
    function drawSimpleSquare(ctx) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Draw a simple square pattern
        ctx.beginPath();
        ctx.rect(20, 20, 110, 110);
        ctx.stroke();
        
        // Inner square
        ctx.beginPath();
        ctx.rect(40, 40, 70, 70);
        ctx.stroke();
        
        // Center dot
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(75, 75, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function drawFlowerPetals(ctx) {
        ctx.fillStyle = '#ff6b6b';
        const centerX = 75;
        const centerY = 75;
        const petalCount = 8;
        const petalLength = 40;
        
        for (let i = 0; i < petalCount; i++) {
            const angle = (i * Math.PI * 2) / petalCount;
            const x = centerX + petalLength * Math.cos(angle);
            const y = centerY + petalLength * Math.sin(angle);
            
            ctx.beginPath();
            ctx.ellipse(x, y, 15, 8, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Center
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function drawGeometricMaze(ctx) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Outer square
        ctx.beginPath();
        ctx.rect(20, 20, 110, 110);
        ctx.stroke();
        
        // Inner geometric pattern
        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.translate(75, 75);
            ctx.rotate((i * Math.PI) / 2);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(50, 0);
            ctx.lineTo(40, 40);
            ctx.lineTo(0, 50);
            ctx.closePath();
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    function drawTamilTraditional(ctx) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Draw a traditional Tamil kolam pattern
        ctx.beginPath();
        ctx.moveTo(75, 20);
        ctx.lineTo(130, 75);
        ctx.lineTo(75, 130);
        ctx.lineTo(20, 75);
        ctx.closePath();
        ctx.stroke();
        
        // Inner diamond
        ctx.beginPath();
        ctx.moveTo(75, 40);
        ctx.lineTo(110, 75);
        ctx.lineTo(75, 110);
        ctx.lineTo(40, 75);
        ctx.closePath();
        ctx.stroke();
        
        // Center dot
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(75, 75, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function drawDotGrid(ctx) {
        ctx.fillStyle = '#333';
        const spacing = 15;
        
        for (let x = 15; x <= 135; x += spacing) {
            for (let y = 15; y <= 135; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    function drawSpiralDesign(ctx) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        const centerX = 75;
        const centerY = 75;
        let radius = 5;
        let angle = 0;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        
        while (radius < 60) {
            angle += 0.2;
            radius += 0.3;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }

    // Principle Canvas Demos
    const principleCanvases = document.querySelectorAll('.principle-canvas');
    
    principleCanvases.forEach(canvas => {
        const demoType = canvas.getAttribute('data-demo');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 200;
        canvas.height = 150;
        
        // Draw demo based on type
        switch(demoType) {
            case 'dots':
                drawDotGridDemo(ctx);
                break;
            case 'rotation':
                drawRotationDemo(ctx);
                break;
            case 'reflection':
                drawReflectionDemo(ctx);
                break;
            case 'continuous':
                drawContinuousDemo(ctx);
                break;
            case 'ratios':
                drawRatiosDemo(ctx);
                break;
            case 'fractal':
                drawFractalDemo(ctx);
                break;
        }
    });
    
    // Demo drawing functions
    function drawDotGridDemo(ctx) {
        ctx.fillStyle = '#333';
        const spacing = 20;
        
        for (let x = 20; x <= 180; x += spacing) {
            for (let y = 20; y <= 130; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    function drawRotationDemo(ctx) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        const centerX = 100;
        const centerY = 75;
        const shapes = 4;
        
        for (let i = 0; i < shapes; i++) {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate((i * Math.PI * 2) / shapes);
            
            ctx.beginPath();
            ctx.rect(-20, -10, 40, 20);
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    function drawReflectionDemo(ctx) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Draw a shape
        ctx.beginPath();
        ctx.moveTo(60, 40);
        ctx.lineTo(80, 70);
        ctx.lineTo(60, 100);
        ctx.stroke();
        
        // Draw its reflection
        ctx.beginPath();
        ctx.moveTo(140, 40);
        ctx.lineTo(120, 70);
        ctx.lineTo(140, 100);
        ctx.stroke();
        
        // Mirror line
        ctx.strokeStyle = '#ff6b6b';
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(100, 20);
        ctx.lineTo(100, 120);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    function drawContinuousDemo(ctx) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(100, 30);
        
        // Draw a continuous path
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const radius = 40;
            const x = 100 + radius * Math.cos(angle);
            const y = 75 + radius * Math.sin(angle);
            ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.stroke();
    }
    
    function drawRatiosDemo(ctx) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Golden ratio demonstration
        const centerX = 100;
        const centerY = 75;
        const a = 60;
        const b = a / 1.618; // Golden ratio
        
        // Draw rectangle with golden ratio proportions
        ctx.strokeRect(centerX - a/2, centerY - b/2, a, b);
        
        // Draw dividing line
        ctx.beginPath();
        ctx.moveTo(centerX - a/2 + b, centerY - b/2);
        ctx.lineTo(centerX - a/2 + b, centerY + b/2);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('a', centerX + a/2 - 10, centerY);
        ctx.fillText('b', centerX - a/2 + b/2 - 5, centerY - b/2 - 5);
    }
    
    function drawFractalDemo(ctx) {
        function drawBranch(x, y, length, angle, depth) {
            if (depth === 0) return;
            
            const endX = x + length * Math.cos(angle);
            const endY = y + length * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Recursive branches
            drawBranch(endX, endY, length * 0.7, angle - Math.PI/4, depth - 1);
            drawBranch(endX, endY, length * 0.7, angle + Math.PI/4, depth - 1);
        }
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        drawBranch(100, 130, 30, -Math.PI/2, 5);
    }

    // Upload and Analyze functionality
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const previewImage = document.getElementById('previewImage');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsSection = document.getElementById('resultsSection');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '#f0f7ff';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.backgroundColor = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '';
            
            if (e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
            }
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFile(e.target.files[0]);
            }
        });
    }
    
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewSection.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            // Simulate analysis
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
            }
            
            setTimeout(() => {
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                }
                resultsSection.style.display = 'block';
            }, 2000);
        });
    }

    // Therapeutic Kolam functionality
    const moodBtns = document.querySelectorAll('.mood-btn');
    const generateTherapeuticBtn = document.getElementById('generateTherapeuticBtn');
    const therapeuticWorkspace = document.getElementById('therapeuticWorkspace');
    const startGuidedSessionBtn = document.getElementById('startGuidedSessionBtn');
    const sessionComplete = document.getElementById('sessionComplete');
    
    if (moodBtns) {
        moodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                moodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    if (generateTherapeuticBtn) {
        generateTherapeuticBtn.addEventListener('click', () => {
            generateTherapeuticBtn.style.display = 'none';
            if (startGuidedSessionBtn) {
                startGuidedSessionBtn.style.display = 'block';
            }
        });
    }
    
    if (startGuidedSessionBtn) {
        startGuidedSessionBtn.addEventListener('click', () => {
            therapeuticWorkspace.style.display = 'block';
            
            // Start session timer
            let timeLeft = 600; // 10 minutes in seconds
            const sessionTimer = document.getElementById('sessionTimer');
            
            const timerInterval = setInterval(() => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                sessionTimer.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
                
                timeLeft--;
                
                if (timeLeft < 0) {
                    clearInterval(timerInterval);
                    therapeuticWorkspace.style.display = 'none';
                    sessionComplete.style.display = 'block';
                }
            }, 1000);
        });
    }

    // Create Kolam functionality
    const generateBtn = document.getElementById('generateBtn');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            // Generate a simple kolam pattern
            const canvas = document.getElementById('kolamCanvas');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const gridSize = parseInt(document.getElementById('gridSize').value);
            const patternType = document.getElementById('patternType').value;
            const symmetry = document.querySelector('.symmetry-btn.active').getAttribute('data-symmetry');
            
            // Draw dots grid
            ctx.fillStyle = '#333';
            const spacing = Math.min(canvas.width, canvas.height) / (gridSize + 1);
            
            for (let x = 1; x <= gridSize; x++) {
                for (let y = 1; y <= gridSize; y++) {
                    const dotX = x * spacing;
                    const dotY = y * spacing;
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Draw pattern based on type
            ctx.strokeStyle = '#2575fc';
            ctx.lineWidth = 2;
            
            if (patternType === 'basic') {
                drawBasicPattern(ctx, gridSize, spacing, symmetry);
            } else if (patternType === 'loops') {
                drawLoopsPattern(ctx, gridSize, spacing, symmetry);
            } else if (patternType === 'geometric') {
                drawGeometricPattern(ctx, gridSize, spacing, symmetry);
            } else if (patternType === 'floral') {
                drawFloralPattern(ctx, gridSize, spacing, symmetry);
            }
        });
    }
    
    function drawBasicPattern(ctx, gridSize, spacing, symmetry) {
        const centerX = (gridSize + 1) * spacing / 2;
        const centerY = (gridSize + 1) * spacing / 2;
        
        ctx.beginPath();
        
        if (symmetry === 'none') {
            // Simple square
            ctx.rect(spacing, spacing, gridSize * spacing, gridSize * spacing);
        } else if (symmetry === '2-fold') {
            // Draw a line and its reflection
            ctx.moveTo(spacing, spacing);
            ctx.lineTo(gridSize * spacing, gridSize * spacing);
            
            ctx.moveTo(gridSize * spacing, spacing);
            ctx.lineTo(spacing, gridSize * spacing);
        } else if (symmetry === '4-fold') {
            // Draw a line and its rotations
            for (let i = 0; i < 4; i++) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate((i * Math.PI) / 2);
                ctx.moveTo(0, 0);
                ctx.lineTo(centerX, 0);
                ctx.restore();
            }
        } else if (symmetry === '8-fold') {
            // Draw a line and its rotations
            for (let i = 0; i < 8; i++) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate((i * Math.PI) / 4);
                ctx.moveTo(0, 0);
                ctx.lineTo(centerX, 0);
                ctx.restore();
            }
        }
        
        ctx.stroke();
    }
    
    function drawLoopsPattern(ctx, gridSize, spacing, symmetry) {
        const centerX = (gridSize + 1) * spacing / 2;
        const centerY = (gridSize + 1) * spacing / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        
        ctx.beginPath();
        
        if (symmetry === 'none') {
            // Simple loop
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        } else if (symmetry === '2-fold') {
            // Two loops
            ctx.arc(centerX - radius/2, centerY, radius/2, 0, Math.PI * 2);
            ctx.arc(centerX + radius/2, centerY, radius/2, 0, Math.PI * 2);
        } else if (symmetry === '4-fold') {
            // Four loops
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                const x = centerX + radius/2 * Math.cos(angle);
                const y = centerY + radius/2 * Math.sin(angle);
                ctx.arc(x, y, radius/3, 0, Math.PI * 2);
            }
        } else if (symmetry === '8-fold') {
            // Eight loops
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const x = centerX + radius/2 * Math.cos(angle);
                const y = centerY + radius/2 * Math.sin(angle);
                ctx.arc(x, y, radius/4, 0, Math.PI * 2);
            }
        }
        
        ctx.stroke();
    }
    
    function drawGeometricPattern(ctx, gridSize, spacing, symmetry) {
        const centerX = (gridSize + 1) * spacing / 2;
        const centerY = (gridSize + 1) * spacing / 2;
        const size = Math.min(centerX, centerY) * 0.8;
        
        ctx.beginPath();
        
        if (symmetry === 'none') {
            // Simple triangle
            ctx.moveTo(centerX, centerY - size);
            ctx.lineTo(centerX + size, centerY + size);
            ctx.lineTo(centerX - size, centerY + size);
            ctx.closePath();
        } else if (symmetry === '2-fold') {
            // Two triangles
            ctx.moveTo(centerX, centerY - size);
            ctx.lineTo(centerX + size, centerY + size);
            ctx.lineTo(centerX - size, centerY + size);
            ctx.closePath();
            
            ctx.moveTo(centerX, centerY + size);
            ctx.lineTo(centerX + size, centerY - size);
            ctx.lineTo(centerX - size, centerY - size);
            ctx.closePath();
        } else if (symmetry === '4-fold') {
            // Four triangles
            for (let i = 0; i < 4; i++) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate((i * Math.PI) / 2);
                ctx.moveTo(0, -size);
                ctx.lineTo(size, size);
                ctx.lineTo(-size, size);
                ctx.closePath();
                ctx.restore();
            }
        } else if (symmetry === '8-fold') {
            // Eight triangles
            for (let i = 0; i < 8; i++) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate((i * Math.PI) / 4);
                ctx.moveTo(0, -size);
                ctx.lineTo(size/2, size/2);
                ctx.lineTo(-size/2, size/2);
                ctx.closePath();
                ctx.restore();
            }
        }
        
        ctx.stroke();
    }
    
    function drawFloralPattern(ctx, gridSize, spacing, symmetry) {
        const centerX = (gridSize + 1) * spacing / 2;
        const centerY = (gridSize + 1) * spacing / 2;
        const petalLength = Math.min(centerX, centerY) * 0.6;
        
        ctx.beginPath();
        
        if (symmetry === 'none') {
            // Simple flower
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const x = centerX + petalLength * Math.cos(angle);
                const y = centerY + petalLength * Math.sin(angle);
                
                ctx.ellipse(x, y, petalLength/3, petalLength/6, angle, 0, Math.PI * 2);
            }
        } else if (symmetry === '2-fold') {
            // Two petals
            for (let i = 0; i < 2; i++) {
                const angle = (i * Math.PI);
                const x = centerX + petalLength * Math.cos(angle);
                const y = centerY + petalLength * Math.sin(angle);
                
                ctx.ellipse(x, y, petalLength/2, petalLength/4, angle, 0, Math.PI * 2);
            }
        } else if (symmetry === '4-fold') {
            // Four petals
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                const x = centerX + petalLength * Math.cos(angle);
                const y = centerY + petalLength * Math.sin(angle);
                
                ctx.ellipse(x, y, petalLength/2, petalLength/4, angle, 0, Math.PI * 2);
            }
        } else if (symmetry === '8-fold') {
            // Eight petals
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const x = centerX + petalLength * Math.cos(angle);
                const y = centerY + petalLength * Math.sin(angle);
                
                ctx.ellipse(x, y, petalLength/3, petalLength/6, angle, 0, Math.PI * 2);
            }
        }
        
        ctx.stroke();
        
        // Flower center
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(centerX, centerY, petalLength/4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Symmetry buttons
    const symmetryBtns = document.querySelectorAll('.symmetry-btn');
    
    if (symmetryBtns) {
        symmetryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                symmetryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    if (clearCanvasBtn) {
        clearCanvasBtn.addEventListener('click', () => {
            const canvas = document.getElementById('kolamCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const canvas = document.getElementById('kolamCanvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = 'kolam-design.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        });
    }

    // Filter buttons for gallery
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                galleryItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // Accessibility features for therapeutic section
    const readAloudBtn = document.getElementById('readAloudBtn');
    const pauseReadingBtn = document.getElementById('pauseReadingBtn');
    const therapeuticDescription = document.getElementById('therapeuticDescription');
    let speechSynthesis = window.speechSynthesis;
    let currentUtterance = null;
    
    if (readAloudBtn) {
        readAloudBtn.addEventListener('click', () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
            
            const text = therapeuticDescription.innerText;
            currentUtterance = new SpeechSynthesisUtterance(text);
            
            currentUtterance.onend = () => {
                readAloudBtn.style.display = 'inline-block';
                pauseReadingBtn.style.display = 'none';
            };
            
            speechSynthesis.speak(currentUtterance);
            readAloudBtn.style.display = 'none';
            pauseReadingBtn.style.display = 'inline-block';
        });
    }
    
    if (pauseReadingBtn) {
        pauseReadingBtn.addEventListener('click', () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
                readAloudBtn.style.display = 'inline-block';
                pauseReadingBtn.style.display = 'none';
            }
        });
    }
    
    // Font size adjustment
    const increaseFontBtn = document.getElementById('increaseFontBtn');
    const decreaseFontBtn = document.getElementById('decreaseFontBtn');
    
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => {
            const currentSize = parseFloat(window.getComputedStyle(therapeuticDescription).fontSize);
            therapeuticDescription.style.fontSize = (currentSize + 2) + "px";
        });
    }
    
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => {
            const currentSize = parseFloat(window.getComputedStyle(therapeuticDescription).fontSize);
            if (currentSize > 12) {
                therapeuticDescription.style.fontSize = (currentSize - 2) + "px";
            }
        });
    }
    
    // High contrast mode
    const highContrastBtn = document.getElementById('highContrastBtn');
    let highContrastMode = false;
    
    if (highContrastBtn) {
        highContrastBtn.addEventListener('click', () => {
            highContrastMode = !highContrastMode;
            
            if (highContrastMode) {
                document.body.classList.add('high-contrast');
                highContrastBtn.textContent = '⚫⚪ Normal Contrast';
            } else {
                document.body.classList.remove('high-contrast');
                highContrastBtn.textContent = '⚫⚪ High Contrast';
            }
        });
    }
});
const levelVideos = {
    'basic': {
        src: 'kolam ui/videos/basic.mp4',
        title: '▶ Introduction to Kolam Basics',
        description: 'Learn the fundamental concepts and tools needed for Kolam creation.'
    },
    // ... other levels
};
levels.forEach(level => {
    level.addEventListener('click', () => {
        // Update active level
        levels.forEach(l => l.classList.remove('active'));
        level.classList.add('active');
        
        // Get the level data
        const levelType = level.dataset.level;
        const videoData = levelVideos[levelType];
        
        // Update video source
        lessonVideo.src = videoData.src;
        
        // Update lesson title and description
        lessonTitle.textContent = videoData.title;
        lessonDescription.textContent = videoData.description;
        
        // Load and play the new video
        lessonVideo.load();
        lessonVideo.play().catch(error => {
            console.log('Video play failed:', error);
        });
    });
});
