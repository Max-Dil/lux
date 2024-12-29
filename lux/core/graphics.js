export const graphics = {
    canvas: document.getElementById('canvas'),
    
    init: function() {
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.ctx) {
            console.error('Canvas 2D не поддерживается');
        }

        this.lineWidth = 1;
        this.fontSize = 16;
        this.fontFamily = 'Arial';
        this.backgroundColor = {r: 0, g: 0, b: 0, a: 1};
        this.blendMode = 'source-over';
        this.defaultFilter = 'linear';
        this.pointSize = 1;
        this.scissorEnabled = false;
        this.scissorBox = {x: 0, y: 0, width: 0, height: 0};

        this.dpiScale = window.devicePixelRatio || 1;
    },

    roundRectPath: function(x, y, width, height, rx, ry, segments) {
        const corners = [
            [x + rx, y],
            [x + width - rx, y],
            [x + width, y + ry],
            [x + width, y + height - ry],
            [x + width - rx, y + height],
            [x + rx, y + height],
            [x, y + height - ry],
            [x, y + ry]
        ];

        this.ctx.moveTo(corners[0][0], corners[0][1]);
        
        this.ctx.lineTo(corners[1][0], corners[1][1]);
        this.ctx.quadraticCurveTo(x + width, y, corners[2][0], corners[2][1]);
        
        this.ctx.lineTo(corners[3][0], corners[3][1]);
        this.ctx.quadraticCurveTo(x + width, y + height, corners[4][0], corners[4][1]);
        
        this.ctx.lineTo(corners[5][0], corners[5][1]);
        this.ctx.quadraticCurveTo(x, y + height, corners[6][0], corners[6][1]);
        
        this.ctx.lineTo(corners[7][0], corners[7][1]);
        this.ctx.quadraticCurveTo(x, y, corners[0][0], corners[0][1]);
        
        this.ctx.closePath();
    },

    toPixels: function(value) {
        return value * this.dpiScale;
    },
    
    fromPixels: function(value) {
        return value / this.dpiScale;
    },

    //
    //
    // Methods
    flushBatch: function() {
        this.ctx.flush();
    },

    setCanvas: function(canvasObj) {
        if (!canvasObj) {
            this.ctx = this.canvas.getContext('2d');
            return;
        }
        this.ctx = canvasObj.ctx;
    },

    clear: function(r, g, b, a = 1) {
        if (r !== undefined) {
            this.ctx.fillStyle = `rgba(${r*255},${g*255},${b*255},${a})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    push: function() {
        this.ctx.save();
    },

    pop: function() {
        this.ctx.restore();
    },

    shear: function(kx, ky) {
        this.ctx.transform(1, ky, kx, 1, 0, 0);
    },

    setBlendMode: function(mode) {
        this.blendMode = mode;
        this.ctx.globalCompositeOperation = mode;
    },

    setColor: function(r, g, b, a = 1) {
        const colorString = `rgba(${r*255},${g*255},${b*255},${a})`;
        this.ctx.fillStyle = colorString;
        this.ctx.strokeStyle = colorString;
    },

    setFont: function(font, size) {
        this.fontFamily = font;
        this.fontSize = size;
    },

    setScissor: function(x, y, width, height) {
        if (x === undefined) {
            this.scissorEnabled = false;
            this.ctx.restore();
            return;
        }
        this.scissorEnabled = true;
        this.scissorBox = {x, y, width, height};
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);
        this.ctx.clip();
    },

    setPointSize: function(size) {
        this.pointSize = size;
    },

    setLineWidth: function(width) {
        this.lineWidth = width;
        this.ctx.lineWidth = width;
    },

    setLineStyle: function(style) {
        this.ctx.lineCap = style === 'rough' ? 'butt' : 'round';
    },

    setLineJoin: function(join) {
        this.ctx.lineJoin = join;
    },

    captureScreenshot: function(x, y, width, height) {
        if (!x) {
            return this.canvas.toDataURL();
        }
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.canvas, x, y, width, height, 0, 0, width, height);
        return tempCanvas.toDataURL();
    },

    setNewFont: function(filename, size) {
        const font = new FontFace('CustomFont', `url(${filename})`);
        return font.load().then(loadedFont => {
            document.fonts.add(loadedFont);
            this.setFont('CustomFont', size);
        });
    },

    setDefaultFilter: function(min, mag = min) {
        this.ctx.imageSmoothingEnabled = (min !== 'nearest' && mag !== 'nearest');
    },

    //
    //
    // Objects
    newCanvas: function(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        return {
            canvas: canvas,
            ctx: ctx,
            width: width,
            height: height,
            clear: function() {
                this.ctx.clearRect(0, 0, this.width, this.height);
            },
            getWidth: function() {
                return this.width;
            },
            getHeight: function() {
                return this.height;
            },
            getDimensions: function() {
                return [this.width, this.height];
            },
            getPixel: function(x, y) {
                const data = this.ctx.getImageData(x, y, 1, 1).data;
                return [data[0]/255, data[1]/255, data[2]/255, data[3]/255];
            },
            setPixel: function(x, y, r, g, b, a = 1) {
                const imageData = this.ctx.createImageData(1, 1);
                imageData.data[0] = r * 255;
                imageData.data[1] = g * 255;
                imageData.data[2] = b * 255;
                imageData.data[3] = a * 255;
                this.ctx.putImageData(imageData, x, y);
            }
        };
    },

    rectangle: function(mode, x, y, width, height, rx = 0, ry = rx, segments = 10) {
        if (rx <= 0 && ry <= 0) {
            if (mode === 'fill') {
                this.ctx.fillRect(x, y, width, height);
            } else {
                this.ctx.strokeRect(x, y, width, height);
            }
            return;
        }

        this.ctx.beginPath();
        this.roundRectPath(x, y, width, height, rx, ry, segments);
        if (mode === 'fill') {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    },

    circle: function(mode, x, y, radius, segments = 100) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (mode === 'fill') {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    },

    line: function(points) {
        if (arguments.length === 4) {
            const [x1, y1, x2, y2] = arguments;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            return;
        }

        if (points.length < 4) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0], points[1]);
        
        for (let i = 2; i < points.length; i += 2) {
            this.ctx.lineTo(points[i], points[i + 1]);
        }
        
        this.ctx.stroke();
    },

    printf: function(text, x, y, limit, align = 'left') {
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y, limit);
    },

    print: function(text, x, y) {
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.fillText(text, x, y);
    },

    image: function(img, x, y, width, height, rotation = 0) {
        this.ctx.save();
        this.ctx.translate(x, y);
        if (rotation !== 0) {
            this.ctx.rotate(rotation);
        }
        
        if (width && height) {
            this.ctx.drawImage(img, -width/2, -height/2, width, height);
        } else {
            this.ctx.drawImage(img, -img.width/2, -img.height/2);
        }
        this.ctx.restore();
    },

    newImage: function(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    },

    polygon: function(mode, points) {
        if (points.length < 4) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0], points[1]);
        
        for (let i = 2; i < points.length; i += 2) {
            this.ctx.lineTo(points[i], points[i + 1]);
        }
        
        this.ctx.closePath();
        
        if (mode === 'fill') {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    },

    ellipse: function(mode, x, y, radiusX, radiusY, segments = 100) {
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
        if (mode === 'fill') {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    },

    arc: function(mode, x, y, radius, startAngle, endAngle, segments = 100) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, startAngle, endAngle);
        if (mode === 'fill') {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    },

    draw: function(drawable, x, y, r = 0, sx = 1, sy = sx, ox = 0, oy = 0, kx = 0, ky = 0) {
        if (!drawable) return;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(r);
        this.ctx.scale(sx, sy);
        this.ctx.transform(1, ky, kx, 1, 0, 0);

        if (drawable.canvas) {
            this.ctx.drawImage(
                drawable.canvas, 
                -ox, 
                -oy, 
                drawable.width, 
                drawable.height
            );
        } else if (drawable instanceof Image) {
            this.ctx.drawImage(
                drawable, 
                -ox, 
                -oy, 
                drawable.width, 
                drawable.height
            );
        }

        this.ctx.restore();
    },

    newVideo: function(filename) {
        const video = document.createElement('video');
        video.src = filename;
        video.play = function() {
            return video.play();
        };
        video.pause = function() {
            video.pause();
        };
        video.rewind = function() {
            video.currentTime = 0;
        };
        video.seek = function(time) {
            video.currentTime = time;
        };
        return video;
    },

    //
    //
    // Properties
    getDPIScale: function() {
        return this.dpiScale;
    },
    
    getDimensions: function() {
        return [
            this.canvas.width / this.dpiScale,
            this.canvas.height / this.dpiScale
        ];
    },
    
    getPixelDimensions: function() {
        return [this.canvas.width, this.canvas.height];
    },
    
    getWidth: function() {
        return this.canvas.width / this.dpiScale;
    },
    
    getHeight: function() {
        return this.canvas.height / this.dpiScale;
    },
    
    getPixelWidth: function() {
        return this.canvas.width;
    },
    
    getPixelHeight: function() {
        return this.canvas.height;
    },

    getBlendMode: function() {
        return this.blendMode;
    },

    setBackgroundColor: function(r, g, b, a = 1) {
        this.backgroundColor = {r, g, b, a};
    },

    getBackgroundColor: function() {
        return [
            this.backgroundColor.r,
            this.backgroundColor.g,
            this.backgroundColor.b,
            this.backgroundColor.a
        ];
    },

    scale: function(sx, sy = sx) {
        this.ctx.scale(sx, sy);
    },

    translate: function(x, y) {
        this.ctx.translate(x, y);
    },

    rotate: function(angle) {
        this.ctx.rotate(angle);
    },

    applyTransform: function(transform) {
        this.ctx.transform(
            transform.a, transform.b,
            transform.c, transform.d,
            transform.tx, transform.ty
        );
    },

    inverseTransformPoint: function(screenX, screenY) {
        const transform = this.ctx.getTransform();
        const inverse = transform.inverse();
        const point = inverse.transformPoint(new DOMPoint(screenX, screenY));
        return [point.x, point.y];
    },

    origin: function() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    },

    replaceTransform: function(transform) {
        this.ctx.setTransform(
            transform.a, transform.b,
            transform.c, transform.d,
            transform.tx, transform.ty
        );
    },
    
    transformPoint: function(globalX, globalY) {
        const transform = this.ctx.getTransform();
        const point = transform.transformPoint(new DOMPoint(globalX, globalY));
        return [point.x, point.y];
    },

    getPixelWidth: function() {
        return this.canvas.width;
    },

};

graphics.init();