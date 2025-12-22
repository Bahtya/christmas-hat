class ChristmasHatApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.imageUpload = document.getElementById('imageUpload');
        this.previewImage = document.getElementById('previewImage');
        this.loading = document.getElementById('loading');
        this.controls = document.getElementById('controls');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.hatSizeSlider = document.getElementById('hatSize');
        this.hatOffsetSlider = document.getElementById('hatOffset');
        this.hatHorizontalSlider = document.getElementById('hatHorizontal');
        this.hatRotationSlider = document.getElementById('hatRotation');
        this.sizeValue = document.getElementById('sizeValue');
        this.offsetValue = document.getElementById('offsetValue');
        this.horizontalValue = document.getElementById('horizontalValue');
        this.rotationValue = document.getElementById('rotationValue');
        
        this.uploadedImage = null;
        this.hatImages = {};
        this.currentHat = 'christmas-hat.svg';
        this.faceLandmarks = null;
        this.faceMesh = null;
        
        this.hatScale = 2.2;
        this.hatOffsetRatio = 0.2;
        this.hatHorizontalOffset = 0;
        this.hatRotationAngle = 0;
        
        this.init();
    }
    
    async init() {
        await this.loadHatImages();
        await this.initFaceMesh();
        this.setupEventListeners();
    }
    
    async loadHatImages() {
        const hatFiles = ['christmas-hat.svg', 'hat.png', 'hat1.png'];
        const loadPromises = hatFiles.map(hatFile => {
            return new Promise((resolve) => {
                const img = new Image();
                // 移除 crossOrigin 以避免 CORS 问题
                // 注意：这样加载的图片无法用于 toDataURL()，但可以正常绘制到 canvas
                img.onload = () => {
                    this.hatImages[hatFile] = img;
                    console.log(`✅ ${hatFile} 加载成功`);
                    resolve();
                };
                img.onerror = () => {
                    console.error(`❌ ${hatFile} 加载失败，使用备用帽子`);
                    this.createFallbackHat(hatFile);
                    resolve();
                };
                // 使用相对路径，让浏览器自然处理
                img.src = hatFile;
            });
        });
        await Promise.all(loadPromises);
    }
    
    createFallbackHat(hatFile) {
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 400;
        fallbackCanvas.height = 400;
        const fallbackCtx = fallbackCanvas.getContext('2d');
        
        fallbackCtx.fillStyle = '#DC143C';
        fallbackCtx.beginPath();
        fallbackCtx.moveTo(200, 50);
        fallbackCtx.lineTo(100, 300);
        fallbackCtx.lineTo(300, 300);
        fallbackCtx.closePath();
        fallbackCtx.fill();
        
        fallbackCtx.fillStyle = '#FFFFFF';
        fallbackCtx.fillRect(100, 280, 200, 30);
        
        fallbackCtx.beginPath();
        fallbackCtx.arc(200, 50, 25, 0, Math.PI * 2);
        fallbackCtx.fill();
        
        const img = new Image();
        img.src = fallbackCanvas.toDataURL();
        this.hatImages[hatFile] = img;
    }
    
    async initFaceMesh() {
        try {
            if (typeof FaceMesh === 'undefined') {
                throw new Error('MediaPipe库加载失败，请检查网络连接或刷新页面重试');
            }
            
            this.faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://unpkg.com/@mediapipe/face_mesh@0.4.1633559619/${file}`;
                }
            });
            
            this.faceMesh.setOptions({
                maxNumFaces: 5,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            this.faceMesh.onResults((results) => this.onFaceMeshResults(results));
        } catch (error) {
            console.error('FaceMesh初始化失败:', error);
            alert('人脸检测库加载失败，请检查网络连接后刷新页面重试。\n\n如果问题持续存在，可能是CDN访问受限。');
        }
    }
    
    setupEventListeners() {
        this.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        
        document.querySelectorAll('.hat-style-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.hat-style-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentHat = btn.dataset.hat;
                this.redrawCanvas();
            });
        });
        
        this.hatSizeSlider.addEventListener('input', (e) => {
            this.hatScale = parseFloat(e.target.value);
            this.sizeValue.textContent = this.hatScale.toFixed(1);
            this.redrawCanvas();
        });
        
        this.hatOffsetSlider.addEventListener('input', (e) => {
            this.hatOffsetRatio = parseFloat(e.target.value);
            this.offsetValue.textContent = this.hatOffsetRatio.toFixed(2);
            this.redrawCanvas();
        });
        
        this.hatHorizontalSlider.addEventListener('input', (e) => {
            this.hatHorizontalOffset = parseInt(e.target.value);
            this.horizontalValue.textContent = this.hatHorizontalOffset;
            this.redrawCanvas();
        });
        
        this.hatRotationSlider.addEventListener('input', (e) => {
            this.hatRotationAngle = parseInt(e.target.value);
            this.rotationValue.textContent = this.hatRotationAngle;
            this.redrawCanvas();
        });
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.uploadedImage = img;
                this.processImage();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    async processImage() {
        this.previewImage.style.display = 'none';
        this.canvas.style.display = 'block';
        this.loading.style.display = 'flex';
        this.controls.style.display = 'none';
        
        this.canvas.width = this.uploadedImage.width;
        this.canvas.height = this.uploadedImage.height;
        
        this.ctx.drawImage(this.uploadedImage, 0, 0);
        
        await this.faceMesh.send({ image: this.uploadedImage });
    }
    
    onFaceMeshResults(results) {
        this.loading.style.display = 'none';
        
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            alert('未检测到人脸，请上传包含清晰人脸的照片');
            this.previewImage.style.display = 'block';
            this.canvas.style.display = 'none';
            return;
        }
        
        this.faceLandmarks = results.multiFaceLandmarks;
        this.redrawCanvas();
        this.controls.style.display = 'block';
    }
    
    redrawCanvas() {
        if (!this.uploadedImage || !this.faceLandmarks) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.uploadedImage, 0, 0);
        
        this.faceLandmarks.forEach(landmarks => {
            this.drawChristmasHat(landmarks);
        });
    }
    
    drawChristmasHat(landmarks) {
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const noseTip = landmarks[1];
        const foreheadTop = landmarks[10];
        const leftForehead = landmarks[21];
        const rightForehead = landmarks[251];
        
        const eyeCenterX = (leftEye.x + rightEye.x) / 2 * this.canvas.width;
        const eyeCenterY = (leftEye.y + rightEye.y) / 2 * this.canvas.height;
        
        const foreheadCenterX = (leftForehead.x + rightForehead.x) / 2 * this.canvas.width;
        const foreheadCenterY = (leftForehead.y + rightForehead.y) / 2 * this.canvas.height;
        
        const faceWidth = Math.abs(rightEye.x - leftEye.x) * this.canvas.width;
        
        const angle = Math.atan2(
            (rightEye.y - leftEye.y) * this.canvas.height,
            (rightEye.x - leftEye.x) * this.canvas.width
        );
        
        const hatImage = this.hatImages[this.currentHat];
        if (!hatImage) return;
        
        const hatWidth = faceWidth * this.hatScale;
        const hatHeight = (hatWidth / hatImage.width) * hatImage.height;
        
        const faceHeight = Math.abs(noseTip.y - foreheadTop.y) * this.canvas.height;
        
        const hatX = foreheadCenterX + this.hatHorizontalOffset;
        const hatY = foreheadCenterY - faceHeight * this.hatOffsetRatio;
        
        const totalRotation = angle + (this.hatRotationAngle * Math.PI / 180);
        
        this.ctx.save();
        
        this.ctx.translate(hatX, hatY);
        this.ctx.rotate(totalRotation);
        
        this.ctx.drawImage(
            hatImage,
            -hatWidth / 2,
            -hatHeight,
            hatWidth,
            hatHeight
        );
        
        this.ctx.restore();
    }
    
    downloadImage() {
        const link = document.createElement('a');
        link.download = 'christmas-avatar.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChristmasHatApp();
});
