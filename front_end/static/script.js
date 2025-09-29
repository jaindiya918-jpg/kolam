// Kolam Design Analyzer - JavaScript (Enhanced with Background Image Feature)
fetch('/api/test/')
  .then(response => response.json())
  .then(data => console.log('API Response:', data))
  .catch(err => console.error('API Error:', err));


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
        
        // NEW: Background image properties
        this.backgroundImage = null;
        this.backgroundImageData = null;
        this.showBackground = false;
        this.backgroundOpacity = 0.5;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.renderGalleryPatterns();
        this.renderPrincipleVisuals();
        this.setupFileUpload();
        this.setupBackgroundImageUpload(); // NEW: Setup background image upload
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Upload and analysis controls
        document.getElementById('analyzeBtn')?.addEventListener('click', () => this.analyzePattern());
        document.getElementById('detectDotsBtn')?.addEventListener('click', () => this.detectDots());
        document.getElementById('findSymmetryBtn')?.addEventListener('click', () => this.findSymmetry());

        // Creation controls
        document.getElementById('gridSize')?.addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value);
            this.redrawCanvas();
        });

        document.querySelectorAll('.symmetry-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.symmetry-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.symmetryType = btn.dataset.symmetry;
            });
        });

        document.getElementById('generateBtn')?.addEventListener('click', () => this.generateKolam());
        document.getElementById('clearCanvasBtn')?.addEventListener('click', () => this.clearCanvas());
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveDesign());

        // NEW: Background image controls
        document.getElementById('toggleBackgroundBtn')?.addEventListener('click', () => this.toggleBackground());
        document.getElementById('backgroundOpacity')?.addEventListener('input', (e) => {
            this.backgroundOpacity = parseFloat(e.target.value);
            this.redrawCanvas();
        });
        document.getElementById('removeBackgroundBtn')?.addEventListener('click', () => this.removeBackground());

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

    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        
        // File input change
        fileInput?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Drag and drop
        uploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea?.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files[0]) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }

    // NEW: Setup background image upload for Create section
    setupBackgroundImageUpload() {
        const bgFileInput = document.getElementById('backgroundFileInput');
        const bgUploadArea = document.getElementById('backgroundUploadArea');
        
        // File input change
        bgFileInput?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.handleBackgroundImageUpload(e.target.files[0]);
            }
        });

        // Drag and drop for background upload area
        bgUploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            bgUploadArea.classList.add('dragover');
        });

        bgUploadArea?.addEventListener('dragleave', (e) => {
            e.preventDefault();
            bgUploadArea.classList.remove('dragover');
        });

        bgUploadArea?.addEventListener('drop', (e) => {
            e.preventDefault();
            bgUploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files[0]) {
                this.handleBackgroundImageUpload(e.dataTransfer.files[0]);
            }
        });

        // Click to upload
        bgUploadArea?.addEventListener('click', () => {
            bgFileInput?.click();
        });
    }

    // NEW: Handle background image upload
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
                    const originalText = bgUploadArea.innerHTML;
                    bgUploadArea.innerHTML = '<div class="upload-success">✓ Background image loaded!</div>';
                    setTimeout(() => {
                        bgUploadArea.innerHTML = originalText;
                    }, 2000);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // NEW: Update background control visibility
    updateBackgroundControls() {
        const controls = document.getElementById('backgroundControls');
        if (controls) {
            controls.style.display = this.backgroundImage ? 'block' : 'none';
        }
    }

    // NEW: Toggle background visibility
    toggleBackground() {
        this.showBackground = !this.showBackground;
        const btn = document.getElementById('toggleBackgroundBtn');
        if (btn) {
            btn.textContent = this.showBackground ? 'Hide Background' : 'Show Background';
        }
        this.redrawCanvas();
    }

    // NEW: Remove background image
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
        document.getElementById(tabName)?.classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        this.currentTab = tabName;
    }

    handleFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedImage = e.target.result;
            this.displayUploadedImage();
        };
        reader.readAsDataURL(file);
    }

    displayUploadedImage() {
        const previewSection = document.getElementById('previewSection');
        const previewImage = document.getElementById('previewImage');
        
        if (previewSection && previewImage) {
            previewImage.src = this.uploadedImage;
            previewSection.style.display = 'flex';
            previewSection.classList.add('fade-in');
        }
    }

    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = overlay.querySelector('p');
        if (text) text.textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    async analyzePattern() {
        if (!this.uploadedImage) {
            alert('Please upload an image first.');
            return;
        }

        this.showLoading('Analyzing kolam pattern...');
        
        // Simulate analysis process
        await this.sleep(2000);
        
        // Mock analysis results
        const results = {
            patterns: [
                { type: 'Grid Pattern', confidence: 92 },
                { type: 'Circular Motif', confidence: 87 },
                { type: 'Continuous Line', confidence: 94 }
            ],
            symmetry: {
                rotational: '4-fold',
                reflectional: '2 axes'
            },
            mathematical: {
                gridSize: '8×8',
                complexity: 'Medium'
            }
        };

        this.displayAnalysisResults(results);
        this.hideLoading();
    }

    async detectDots() {
        if (!this.uploadedImage) {
            alert('Please upload an image first.');
            return;
        }

        this.showLoading('Detecting dot grid...');
        await this.sleep(1500);
        
        // Simulate dot detection visualization
        this.overlayDotDetection();
        this.hideLoading();
    }

    async findSymmetry() {
        if (!this.uploadedImage) {
            alert('Please upload an image first.');
            return;
        }

        this.showLoading('Analyzing symmetry...');
        await this.sleep(1500);
        
        // Simulate symmetry line visualization
        this.overlaySymmetryLines();
        this.hideLoading();
    }

    displayAnalysisResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const patternsResult = document.getElementById('patternsResult');
        const symmetryResult = document.getElementById('symmetryResult');
        const mathResult = document.getElementById('mathResult');

        // Clear previous results
        patternsResult.innerHTML = '';
        symmetryResult.innerHTML = '';
        mathResult.innerHTML = '';

        // Display patterns
        results.patterns.forEach(pattern => {
            const patternItem = document.createElement('div');
            patternItem.className = 'pattern-item';
            patternItem.innerHTML = `
                <span class="pattern-type">${pattern.type}</span>
                <span class="pattern-confidence">${pattern.confidence}%</span>
            `;
            patternsResult.appendChild(patternItem);
        });

        // Display symmetry
        const symmetryItem = document.createElement('div');
        symmetryItem.className = 'symmetry-item';
        symmetryItem.innerHTML = `
            <span>Rotational: ${results.symmetry.rotational}</span>
            <span>Reflectional: ${results.symmetry.reflectional}</span>
        `;
        symmetryResult.appendChild(symmetryItem);

        // Display mathematical properties
        const mathItem = document.createElement('div');
        mathItem.className = 'math-property';
        mathItem.innerHTML = `
            <span>Dot Grid: ${results.mathematical.gridSize}</span>
            <span>Complexity: ${results.mathematical.complexity}</span>
        `;
        mathResult.appendChild(mathItem);

        resultsSection.style.display = 'block';
        resultsSection.classList.add('slide-up');
    }

    overlayDotDetection() {
        const overlay = document.getElementById('analysisOverlay');
        if (!overlay) return;

        overlay.innerHTML = '';
        
        // Create SVG for dot overlay
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';

        // Add mock detected dots
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', `${15 + i * 35}%`);
                circle.setAttribute('cy', `${15 + j * 35}%`);
                circle.setAttribute('r', '3');
                circle.classList.add('dot-highlight');
                svg.appendChild(circle);
            }
        }

        overlay.appendChild(svg);
    }

    overlaySymmetryLines() {
        const overlay = document.getElementById('analysisOverlay');
        if (!overlay) return;

        overlay.innerHTML = '';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';

        // Vertical symmetry line
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', '50%');
        vLine.setAttribute('y1', '0%');
        vLine.setAttribute('x2', '50%');
        vLine.setAttribute('y2', '100%');
        vLine.classList.add('symmetry-line');
        svg.appendChild(vLine);

        // Horizontal symmetry line
        const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', '0%');
        hLine.setAttribute('y1', '50%');
        hLine.setAttribute('x2', '100%');
        hLine.setAttribute('y2', '50%');
        hLine.classList.add('symmetry-line');
        svg.appendChild(hLine);

        overlay.appendChild(svg);
    }

    // MODIFIED: Enhanced redrawCanvas method with background image support
    redrawCanvas() {
        if (!this.canvas || !this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // NEW: Draw background image if present and enabled
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

    // NEW: Draw background image on canvas
    drawBackgroundImage() {
        if (!this.backgroundImage) return;
        
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

    startDrawing(e) {
        if (!this.canvas) return;
        
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.currentPath = [{ x, y }];
    }

    draw(e) {
        if (!this.isDrawing || !this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.currentPath.push({ x, y });
        
        // Draw current stroke
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 2;
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

    drawSymmetricPath(x, y) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 2;
        
        switch (this.symmetryType) {
            case '2-fold':
                // Draw mirrored point
                this.ctx.beginPath();
                this.ctx.arc(2 * centerX - x, 2 * centerY - y, 1, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
                
            case '4-fold':
                // Draw 3 additional symmetric points
                const points = [
                    { x: 2 * centerX - x, y },
                    { x, y: 2 * centerY - y },
                    { x: 2 * centerX - x, y: 2 * centerY - y }
                ];
                
                points.forEach(point => {
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
                    this.ctx.stroke();
                });
                break;
                
            case '8-fold':
                // More complex 8-fold symmetry
                this.draw8FoldSymmetry(x, y, centerX, centerY);
                break;
        }
    }

    draw8FoldSymmetry(x, y, centerX, centerY) {
        const dx = x - centerX;
        const dy = y - centerY;
        
        // Generate 7 additional symmetric points
        const symmetricPoints = [
            { x: centerX - dx, y: centerY + dy },  // 180°
            { x: centerX + dy, y: centerY + dx },  // 90° + reflection
            { x: centerX - dy, y: centerY - dx },  // 270° + reflection
            { x: centerX + dy, y: centerY - dx },  // Diagonal reflection
            { x: centerX - dy, y: centerY + dx },  // Diagonal reflection
            { x: centerX - dx, y: centerY - dy },  // Vertical reflection
            { x: centerX + dx, y: centerY - dy }   // Horizontal reflection
        ];
        
        symmetricPoints.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
            this.ctx.stroke();
        });
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        if (this.currentPath.length > 1) {
            this.allPaths.push([...this.currentPath]);
        }
        this.currentPath = [];
    }

    drawPath(path) {
        if (path.length < 2) return;
        
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        
        this.ctx.stroke();
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
        this.redrawCanvas();
    }

    // MODIFIED: Clear canvas now preserves background image
    clearCanvas() {
        this.allPaths = [];
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
        document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
        
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
        const patternType = item.querySelector('canvas').dataset.pattern;
        this.generatePatternFromGallery(patternType);
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

    // Utility function for async operations
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Enhanced Kolam Generator with Mathematical Algorithms
class KolamMathEngine {
    constructor() {
        this.patterns = {
            traditional: [
                'pulli_kolam',
                'kambi_kolam', 
                'sikku_kolam',
                'padi_kolam'
            ],
            geometric: [
                'mandala_basic',
                'fibonacci_spiral',
                'golden_ratio',
                'tessellation'
            ]
        };
    }

    // Generate pattern based on mathematical rules
    generateMathematicalPattern(type, gridSize, parameters = {}) {
        switch (type) {
            case 'fibonacci_spiral':
                return this.generateFibonacciSpiral(gridSize, parameters);
            case 'golden_ratio':
                return this.generateGoldenRatioPattern(gridSize, parameters);
            case 'mandala_basic':
                return this.generateMandalaPattern(gridSize, parameters);
            case 'tessellation':
                return this.generateTessellationPattern(gridSize, parameters);
            default:
                return this.generateBasicGrid(gridSize);
        }
    }

    generateFibonacciSpiral(gridSize, params) {
        const points = [];
        const centerX = 250;
        const centerY = 250;
        const fib = [1, 1];
        
        // Generate fibonacci sequence
        for (let i = 2; i < 15; i++) {
            fib[i] = fib[i-1] + fib[i-2];
        }
        
        let angle = 0;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
        
        for (let i = 0; i < 200; i++) {
            const radius = Math.sqrt(i) * 5;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            points.push({ x, y });
            angle += goldenAngle;
        }
        
        return [points];
    }

    generateGoldenRatioPattern(gridSize, params) {
        const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
        const paths = [];
        const centerX = 250;
        const centerY = 250;
        
        // Create nested golden rectangles
        let width = 200;
        let height = width / phi;
        let x = centerX - width / 2;
        let y = centerY - height / 2;
        
        for (let i = 0; i < 8; i++) {
            const rect = [
                { x, y },
                { x: x + width, y },
                { x: x + width, y: y + height },
                { x, y: y + height },
                { x, y }
            ];
            paths.push(rect);
            
            // Next rectangle
            const newWidth = height;
            const newHeight = width - height;
            
            if (i % 4 === 0) { x += width - newWidth; }
            else if (i % 4 === 1) { y += height - newHeight; }
            else if (i % 4 === 2) { x -= newWidth; y -= newHeight; }
            
            width = newWidth;
            height = newHeight;
        }
        
        return paths;
    }

    generateMandalaPattern(gridSize, params) {
        const paths = [];
        const centerX = 250;
        const centerY = 250;
        const layers = params.layers || 5;
        
        for (let layer = 1; layer <= layers; layer++) {
            const radius = layer * 30;
            const petals = layer * 6;
            
            for (let petal = 0; petal < petals; petal++) {
                const angle = (petal * 2 * Math.PI) / petals;
                const path = [];
                
                for (let t = 0; t <= Math.PI; t += 0.1) {
                    const petalRadius = radius * Math.sin(t);
                    const x = centerX + petalRadius * Math.cos(angle + t * 0.5);
                    const y = centerY + petalRadius * Math.sin(angle + t * 0.5);
                    path.push({ x, y });
                }
                
                paths.push(path);
            }
        }
        
        return paths;
    }

    generateTessellationPattern(gridSize, params) {
        const paths = [];
        const cellSize = 500 / gridSize;
        const shape = params.shape || 'hexagon';
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const centerX = (i + 0.5) * cellSize;
                const centerY = (j + 0.5) * cellSize;
                
                if (shape === 'hexagon') {
                    const path = [];
                    for (let k = 0; k <= 6; k++) {
                        const angle = (k * 2 * Math.PI) / 6;
                        const x = centerX + (cellSize * 0.4) * Math.cos(angle);
                        const y = centerY + (cellSize * 0.4) * Math.sin(angle);
                        path.push({ x, y });
                    }
                    paths.push(path);
                }
            }
        }
        
        return paths;
    }

    generateBasicGrid(gridSize) {
        const paths = [];
        const cellSize = 500 / (gridSize + 1);
        
        // Generate connecting lines between dots
        for (let i = 1; i < gridSize; i++) {
            for (let j = 1; j < gridSize; j++) {
                const x1 = i * cellSize;
                const y1 = j * cellSize;
                const x2 = (i + 1) * cellSize;
                const y2 = j * cellSize;
                const x3 = i * cellSize;
                const y3 = (j + 1) * cellSize;
                
                paths.push([{ x: x1, y: y1 }, { x: x2, y: y2 }]);
                paths.push([{ x: x1, y: y1 }, { x: x3, y: y3 }]);
            }
        }
        
        return paths;
    }

    // Analyze symmetry in a given pattern
    analyzeSymmetry(paths) {
        const analysis = {
            rotational: this.detectRotationalSymmetry(paths),
            reflectional: this.detectReflectionalSymmetry(paths),
            translational: this.detectTranslationalSymmetry(paths)
        };
        
        return analysis;
    }

    detectRotationalSymmetry(paths) {
        // Simplified rotational symmetry detection
        // In a real implementation, this would involve complex geometric analysis
        const angles = [90, 180, 270];
        const symmetries = [];
        
        angles.forEach(angle => {
            if (this.testRotationalSymmetry(paths, angle)) {
                symmetries.push(angle);
            }
        });
        
        return symmetries;
    }

    detectReflectionalSymmetry(paths) {
        // Test for common reflection axes
        const axes = ['vertical', 'horizontal', 'diagonal1', 'diagonal2'];
        const symmetries = [];
        
        axes.forEach(axis => {
            if (this.testReflectionalSymmetry(paths, axis)) {
                symmetries.push(axis);
            }
        });
        
        return symmetries;
    }

    detectTranslationalSymmetry(paths) {
        // Detect repeating patterns
        // This is a simplified version
        return this.findRepeatingUnits(paths);
    }

    testRotationalSymmetry(paths, angle) {
        // Placeholder for actual geometric testing
        // In reality, this would rotate points and check for matches
        return Math.random() > 0.5; // Simplified random result for demo
    }

    testReflectionalSymmetry(paths, axis) {
        // Placeholder for actual reflection testing
        return Math.random() > 0.5; // Simplified random result for demo
    }

    findRepeatingUnits(paths) {
        // Placeholder for pattern repetition analysis
        return {
            hasRepetition: Math.random() > 0.5,
            unitSize: Math.floor(Math.random() * 5) + 1,
            direction: Math.random() > 0.5 ? 'horizontal' : 'vertical'
        };
    }
}

// Pattern Recognition Engine
class KolamPatternRecognition {
    constructor() {
        this.knownPatterns = [
            { name: 'Pulli Kolam', dots: [5, 5], complexity: 'basic' },
            { name: 'Kambi Kolam', dots: [7, 7], complexity: 'intermediate' },
            { name: 'Sikku Kolam', dots: [9, 9], complexity: 'advanced' },
            { name: 'Padi Kolam', dots: [11, 11], complexity: 'expert' }
        ];
    }

    // Analyze uploaded image (simulated)
    async analyzeImage(imageData) {
        // In a real implementation, this would use computer vision
        // For now, we'll simulate the analysis
        
        const results = {
            gridSize: this.detectGridSize(imageData),
            patterns: this.identifyPatterns(imageData),
            symmetry: this.analyzeSymmetryFromImage(imageData),
            confidence: Math.random() * 30 + 70, // 70-100%
            suggestions: this.generateSuggestions()
        };
        
        return results;
    }

    detectGridSize(imageData) {
        // Simulated grid size detection
        const sizes = ['5×5', '7×7', '8×8', '9×9', '10×10', '12×12'];
        return sizes[Math.floor(Math.random() * sizes.length)];
    }

    identifyPatterns(imageData) {
        // Simulated pattern identification
        const patterns = [
            { type: 'Grid Pattern', confidence: 92 },
            { type: 'Circular Motif', confidence: 87 },
            { type: 'Continuous Line', confidence: 94 },
            { type: 'Symmetric Design', confidence: 89 }
        ];
        
        return patterns.slice(0, Math.floor(Math.random() * 3) + 1);
    }

    analyzeSymmetryFromImage(imageData) {
        const types = [
            { rotational: '4-fold', reflectional: '2 axes' },
            { rotational: '8-fold', reflectional: '4 axes' },
            { rotational: '2-fold', reflectional: '1 axis' },
            { rotational: 'none', reflectional: '2 axes' }
        ];
        
        return types[Math.floor(Math.random() * types.length)];
    }

    generateSuggestions() {
        const suggestions = [
            'This pattern shows strong mathematical symmetry',
            'The dot grid appears to follow traditional Tamil kolam rules',
            'Consider exploring variations with different loop patterns',
            'The continuous line principle is well maintained',
            'This design could be enhanced with additional geometric elements'
        ];
        
        return suggestions.slice(0, Math.floor(Math.random() * 3) + 1);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new KolamAnalyzer();
    const mathEngine = new KolamMathEngine();
    const patternRecognition = new KolamPatternRecognition();
    
    // Make engines available globally for advanced features
    window.kolamApp = app;
    window.kolamMath = mathEngine;
    window.kolamRecognition = patternRecognition;
    
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
                    // Undo functionality (can be implemented)
                    break;
            }
        }
    });

    // Therapeutic Kolam functionality
    const therapeuticTab = document.getElementById('therapeutic');
    if (therapeuticTab) {
        const generateTherapeuticBtn = document.getElementById('generateTherapeuticBtn');
        const therapeuticWorkspace = document.getElementById('therapeuticWorkspace');
        const therapeuticControls = document.querySelector('.therapeutic-controls');
        const therapeuticCanvas = document.getElementById('therapeuticCanvas');
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

        // Accessibility controls
        const readAloudBtn = document.getElementById('readAloudBtn');
        const pauseReadingBtn = document.getElementById('pauseReadingBtn');
        const highContrastBtn = document.getElementById('highContrastBtn');
        const increaseFontBtn = document.getElementById('increaseFontBtn');
        const decreaseFontBtn = document.getElementById('decreaseFontBtn');
        let textToSpeak = '';
        let speechSynthesisUtterance = null;

        readAloudBtn?.addEventListener('click', () => {
            if (speechSynthesisUtterance && speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
            const therapeuticDescription = document.getElementById('therapeuticDescription');
            textToSpeak = therapeuticDescription.innerText;
            speechSynthesisUtterance = new SpeechSynthesisUtterance(textToSpeak);
            speechSynthesis.speak(speechSynthesisUtterance);
            readAloudBtn.style.display = 'none';
            pauseReadingBtn.style.display = 'inline-block';
        });

        pauseReadingBtn?.addEventListener('click', () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.pause();
                pauseReadingBtn.style.display = 'none';
                playSessionBtn.style.display = 'inline-block';
            }
        });

        playSessionBtn?.addEventListener('click', () => {
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
                playSessionBtn.style.display = 'none';
                pauseReadingBtn.style.display = 'inline-block';
            }
        });

        highContrastBtn?.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
        });

        let currentFontSize = 1;
        increaseFontBtn?.addEventListener('click', () => {
            currentFontSize += 0.1;
            document.body.style.fontSize = `${currentFontSize}rem`;
        });

        decreaseFontBtn?.addEventListener('click', () => {
            currentFontSize = Math.max(0.8, currentFontSize - 0.1);
            document.body.style.fontSize = `${currentFontSize}rem`;
        });

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
        generateTherapeuticBtn?.addEventListener('click', () => {
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
            if (sessionTimerEl) sessionTimerEl.textContent = formatTime(timeRemaining);
            const sessionProgressEl = document.getElementById('sessionProgress');
            if (sessionProgressEl) sessionProgressEl.textContent = '0%';

            // Generate the kolam based on selections
            generateKolamPattern(selectedMood, selectedGoals, difficulty, therapeuticCanvas);
            
            // Start the timer and guided session
            startSessionTimer();
            startGuidedSession(guidance, selectedGoals);
        });

        function generateKolamPattern(mood, goals, difficulty, canvas) {
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Placeholder for pattern generation
            // This is where the complex logic for therapeutic patterns would go
            // For now, it will draw a simple pattern
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const dotSize = 5;
            const spacing = 40;
            let gridSize = 10;
            
            if (difficulty === 'beginner') gridSize = 8;
            else if (difficulty === 'intermediate') gridSize = 12;
            else if (difficulty === 'advanced') gridSize = 15;
            
            // Draw a dot grid
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    ctx.beginPath();
                    ctx.arc(spacing / 2 + i * spacing, spacing / 2 + j * spacing, dotSize / 2, 0, Math.PI * 2);
                    ctx.fillStyle = '#333';
                    ctx.fill();
                }
            }
            
            // Drawing logic based on goals/mood could go here, e.g., drawing lines and curves
            // Example: simple line pattern
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(spacing / 2, spacing / 2);
            ctx.lineTo(spacing / 2 + (gridSize - 1) * spacing, spacing / 2 + (gridSize - 1) * spacing);
            ctx.stroke();
        }

        function startSessionTimer() {
            sessionTimer = setInterval(() => {
                timeRemaining--;
                const sessionTimerEl = document.getElementById('sessionTimer');
                if (sessionTimerEl) sessionTimerEl.textContent = formatTime(timeRemaining);
                const sessionDurationEl = document.getElementById('sessionDuration');
                const progress = ((parseInt(sessionDurationEl?.value || 0) * 60 - timeRemaining) / (parseInt(sessionDurationEl?.value || 0) * 60)) * 100;
                const sessionProgressEl = document.getElementById('sessionProgress');
                if (sessionProgressEl) sessionProgressEl.textContent = `${Math.floor(progress)}%`;

                if (timeRemaining <= 0) {
                    endSession();
                }
            }, 1000);
        }

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        function startGuidedSession(guidanceLevel, goals) {
            const guidancePanel = document.getElementById('guidancePanel');
            if (guidanceLevel === 'full' || guidanceLevel === 'moderate') {
                guidancePanel.style.display = 'block';
                // Placeholder for guidance instructions
                document.getElementById('currentInstruction').textContent = 'Follow the lines, focusing on each breath as you draw. You can do this.';
            } else {
                guidancePanel.style.display = 'none';
            }
        }

        pauseSessionBtn.addEventListener('click', () => {
            if (!isSessionPaused) {
                clearInterval(sessionTimer);
                isSessionPaused = true;
                pauseSessionBtn.style.display = 'none';
                playSessionBtn.style.display = 'inline-block';
            }
        });

        playSessionBtn.addEventListener('click', () => {
            if (isSessionPaused) {
                startSessionTimer();
                isSessionPaused = false;
                playSessionBtn.style.display = 'none';
                pauseSessionBtn.style.display = 'inline-block';
            }
        });

        endSessionBtn.addEventListener('click', endSession);

        function endSession() {
            clearInterval(sessionTimer);
            therapeuticWorkspace.style.display = 'none';
            sessionComplete.style.display = 'block';
            
            // Update session summary with mock data
            document.getElementById('completionTime').textContent = formatTime(parseInt(document.getElementById('sessionDuration').value) * 60 - timeRemaining);
            document.getElementById('patternsCompleted').textContent = Math.floor(Math.random() * 5) + 1;
            document.getElementById('focusScore').textContent = `${Math.floor(Math.random() * (100 - 70 + 1)) + 70}%`;
        }

        startNewSessionBtn.addEventListener('click', () => {
            sessionComplete.style.display = 'none';
            therapeuticControls.style.display = 'block';
            
            // Reset mood and goals
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            goalCheckboxes.forEach(cb => cb.checked = false);
        });
    }
    
    console.log('🕉️ Kolam Design Analyzer initialized successfully!');
    console.log('Available components:', { app, mathEngine, patternRecognition });

    
})