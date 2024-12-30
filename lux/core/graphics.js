export const graphics = {
    canvas: document.getElementById('canvas'),
    
    init: function() {
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.ctx) {
            console.error('Canvas 2D не поддерживается');
        }
        Object.assign(this, {
            lineWidth: 1,
            fontSize: 16, 
            fontFamily: 'Arial',
            backgroundColor: {r: 0, g: 0, b: 0, a: 1},
            blendMode: 'source-over',
            defaultFilter: 'linear',
            pointSize: 1,
            scissorEnabled: false,
            scissorBox: {x: 0, y: 0, width: 0, height: 0},
            dpiScale: window.devicePixelRatio || 1
        });

        this.setColor(1, 1, 1, 1);
    },
    TWO_PI: Math.PI * 2,

    roundRectPath: function(x, y, width, height, rx, ry, segments) {
        const [x2, y2] = [x + width, y + height];
        const corners = [
            [x + rx, y],
            [x2 - rx, y], 
            [x2, y + ry],
            [x2, y2 - ry],
            [x2 - rx, y2],
            [x + rx, y2],
            [x, y2 - ry],
            [x, y + ry]
        ];

        const {ctx} = this;
        ctx.moveTo(corners[0][0], corners[0][1]);
        
        ctx.lineTo(corners[1][0], corners[1][1]);
        ctx.quadraticCurveTo(x2, y, corners[2][0], corners[2][1]);
        
        ctx.lineTo(corners[3][0], corners[3][1]); 
        ctx.quadraticCurveTo(x2, y2, corners[4][0], corners[4][1]);
        
        ctx.lineTo(corners[5][0], corners[5][1]);
        ctx.quadraticCurveTo(x, y2, corners[6][0], corners[6][1]);
        
        ctx.lineTo(corners[7][0], corners[7][1]);
        ctx.quadraticCurveTo(x, y, corners[0][0], corners[0][1]);
        
        ctx.closePath();
    },

    toPixels: value => value * this.dpiScale,
    fromPixels: value => value / this.dpiScale,

    //
    //
    // Methods
    flushBatch: function() {
        this.ctx.flush();
    },

    setCanvas: function(canvasObj) {
        this.ctx = canvasObj?.ctx || this.canvas.getContext('2d');
    },

    clear: function(r, g, b, a = 1) {
        const {ctx, canvas} = this;
        if (r !== undefined) {
            ctx.fillStyle = `rgba(${r*255},${g*255},${b*255},${a})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        this.ctx.fillStyle = this.ctx.strokeStyle = colorString;
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
        this.lineWidth = this.ctx.lineWidth = width;
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

    setNewFont: async function(filename, size) {
        const font = new FontFace('CustomFont', `url(${filename})`);
        const loadedFont = await font.load();
        document.fonts.add(loadedFont);
        this.setFont('CustomFont', size);
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
            canvas,
            ctx,
            width,
            height,
            clear() {
                this.ctx.clearRect(0, 0, width, height);
            },
            getWidth: () => width,
            getHeight: () => height,
            getDimensions: () => [width, height],
            getPixel(x, y) {
                const data = this.ctx.getImageData(x, y, 1, 1).data;
                return data.map(v => v/255);
            },
            setPixel(x, y, r, g, b, a = 1) {
                const imageData = this.ctx.createImageData(1, 1);
                const data = imageData.data;
                data[0] = r * 255;
                data[1] = g * 255; 
                data[2] = b * 255;
                data[3] = a * 255;
                this.ctx.putImageData(imageData, x, y);
            }
        };
    },

    rectangle: function(mode, x, y, width, height, rx = 0, ry = rx, segments = 10) {
        const {ctx} = this;
        if (rx <= 0 && ry <= 0) {
            ctx[mode === 'fill' ? 'fillRect' : 'strokeRect'](x, y, width, height);
            return;
        }

        ctx.beginPath();
        this.roundRectPath(x, y, width, height, rx, ry, segments);
        ctx[mode === 'fill' ? 'fill' : 'stroke']();
    },

    circle: function(mode, x, y, radius, segments = 100) {
        const {ctx, TWO_PI} = this;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, TWO_PI);
        ctx[mode === 'fill' ? 'fill' : 'stroke']();
    },

    line: function(points) {
        const {ctx} = this;
        if (arguments.length === 4) {
            const [x1, y1, x2, y2] = arguments;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            return;
        }

        if (points.length < 4) return;
        
        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);
        
        for (let i = 2; i < points.length; i += 2) {
            ctx.lineTo(points[i], points[i + 1]);
        }
        
        ctx.stroke();
    },

    printf: function(text, x, y, limit, align = 'left') {
        const {ctx, fontSize, fontFamily} = this;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = align;
        ctx.fillText(text, x, y, limit);
    },

    print: function(text, x, y) {
        const {ctx, fontSize, fontFamily} = this;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillText(text, x, y);
    },

    image: function(img, x, y, width, height, rotation = 0) {
        if (!img) return;
        const {ctx} = this;
        ctx.save();
        ctx.translate(x, y);
        
        if (rotation) {
            ctx.rotate(rotation);
        }
        
        if (width && height) {
            ctx.drawImage(img, -width/2, -height/2, width, height);
        } else {
            ctx.drawImage(img, -img.width/2, -img.height/2);
        }
        ctx.restore();
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
        
        const {ctx} = this;
        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);
        
        for (let i = 2; i < points.length; i += 2) {
            ctx.lineTo(points[i], points[i + 1]);
        }
        
        ctx.closePath();
        ctx[mode === 'fill' ? 'fill' : 'stroke']();
    },

    ellipse: function(mode, x, y, radiusX, radiusY, segments = 100) {
        const {ctx, TWO_PI} = this;
        ctx.beginPath();
        ctx.ellipse(x, y, radiusX, radiusY, 0, 0, TWO_PI);
        ctx[mode === 'fill' ? 'fill' : 'stroke']();
    },

    arc: function(mode, x, y, radius, startAngle, endAngle, segments = 100) {
        const {ctx} = this;
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx[mode === 'fill' ? 'fill' : 'stroke']();
    },

    draw: function(drawable, x, y, r = 0, sx = 1, sy = sx, ox = 0, oy = 0, kx = 0, ky = 0) {
        if (!drawable) return;
        
        const {ctx} = this;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(r);
        ctx.scale(sx, sy);
        ctx.transform(1, ky, kx, 1, 0, 0);

        const target = drawable.canvas || drawable;
        ctx.drawImage(
            target,
            -ox,
            -oy,
            target.width,
            target.height
        );

        ctx.restore();
    },

    newVideo: function(filename) {
        const video = document.createElement('video');
        video.src = filename;
        return Object.assign(video, {
            play: () => video.play(),
            pause: () => video.pause(),
            rewind: () => video.currentTime = 0,
            seek: time => video.currentTime = time
        });
    },

    //
    //
    // Properties
    getDPIScale: function() {
        return this.dpiScale;
    },
    
    getDimensions: function() {
        const {canvas, dpiScale} = this;
        return [
            canvas.width / dpiScale,
            canvas.height / dpiScale
        ];
    },
    
    getPixelDimensions: function() {
        const {canvas} = this;
        return [canvas.width, canvas.height];
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
        const {r, g, b, a} = this.backgroundColor;
        return [r, g, b, a];
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
        const {a, b, c, d, tx, ty} = transform;
        this.ctx.transform(a, b, c, d, tx, ty);
    },

    inverseTransformPoint: function(screenX, screenY) {
        const transform = this.ctx.getTransform();
        const point = transform.inverse().transformPoint(new DOMPoint(screenX, screenY));
        return [point.x, point.y];
    },

    origin: function() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    },

    replaceTransform: function(transform) {
        const {a, b, c, d, tx, ty} = transform;
        this.ctx.setTransform(a, b, c, d, tx, ty);
    },
    
    transformPoint: function(globalX, globalY) {
        const point = this.ctx.getTransform().transformPoint(new DOMPoint(globalX, globalY));
        return [point.x, point.y];
    },

    getPixelWidth: function() {
        return this.canvas.width;
    },

};

graphics.init();