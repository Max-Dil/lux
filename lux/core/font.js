export const font = {
    HintingMode: {
        NORMAL: 'normal',
        LIGHT: 'light',
        MONO: 'mono',
        NONE: 'none'
    },

    PixelFormat: {
        RGBA8: 'rgba8',
        RGBA16: 'rgba16',
        RGB8: 'rgb8',
        RGB16: 'rgb16',
        R8: 'r8',
        RG8: 'rg8',
        SRGBA8: 'srgba8'
    },

    newRasterizer: async function(filename, size = 12, hinting = this.HintingMode.NORMAL) {
        if (typeof filename === 'string') {
            return await this.newTrueTypeRasterizer(filename, size, hinting);
        } else if (filename instanceof FontData) {
            return this.newFontDataRasterizer(filename, size);
        }
        throw new Error('Неподдерживаемый тип шрифта');
    },

    newTrueTypeRasterizer: async function(filename, size = 12, hinting = this.HintingMode.NORMAL) {
        const font = new FontFace('CustomFont', `url(${filename})`);
        await font.load();
        document.fonts.add(font);

        return {
            type: 'truetype',
            font: font,
            size: size,
            hinting: hinting,

            getHeight: function() {
                return this.size;
            },

            getLineHeight: function() {
                return this.size * 1.2;
            },

            getGlyphData: function(codepoint) {
                return this.createGlyphData(codepoint);
            },

            hasGlyphs: function(...codepoints) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                ctx.font = `${this.size}px CustomFont`;
                return codepoints.every(cp => {
                    const char = String.fromCodePoint(cp);
                    const metrics = ctx.measureText(char);
                    return metrics.width > 0;
                });
            },

            createGlyphData: function(codepoint) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const char = String.fromCodePoint(codepoint);
                
                ctx.font = `${this.size}px CustomFont`;
                const metrics = ctx.measureText(char);
                
                canvas.width = Math.ceil(metrics.width);
                canvas.height = this.size;
                
                ctx.font = `${this.size}px CustomFont`;
                ctx.textBaseline = 'top';
                ctx.fillStyle = 'white';
                ctx.fillText(char, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                return {
                    width: canvas.width,
                    height: canvas.height,
                    data: imageData.data,
                    getWidth: function() { return this.width; },
                    getHeight: function() { return this.height; },
                    getDimensions: function() { return [this.width, this.height]; },
                    getPixel: function(x, y) {
                        const i = (y * this.width + x) * 4;
                        return [
                            this.data[i] / 255,
                            this.data[i + 1] / 255,
                            this.data[i + 2] / 255,
                            this.data[i + 3] / 255
                        ];
                    }
                };
            }
        };
    },

    newBMFontRasterizer: async function(imageFilename, dataFilename) {
        const image = new Image();
        image.src = imageFilename;
        await new Promise(resolve => image.onload = resolve);

        const response = await fetch(dataFilename);
        const fontData = await response.json();

        return {
            type: 'bmfont',
            image: image,
            data: fontData,

            getHeight: function() {
                return this.data.info.size;
            },

            getLineHeight: function() {
                return this.data.common.lineHeight;
            },

            getGlyphData: function(codepoint) {
                const char = this.data.chars.find(c => c.id === codepoint);
                if (!char) return null;

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = char.width;
                canvas.height = char.height;
                
                ctx.drawImage(
                    this.image,
                    char.x, char.y,
                    char.width, char.height,
                    0, 0,
                    char.width, char.height
                );

                const imageData = ctx.getImageData(0, 0, char.width, char.height);
                
                return {
                    width: char.width,
                    height: char.height,
                    data: imageData.data,
                    getWidth: function() { return this.width; },
                    getHeight: function() { return this.height; },
                    getDimensions: function() { return [this.width, this.height]; },
                    getPixel: function(x, y) {
                        const i = (y * this.width + x) * 4;
                        return [
                            this.data[i] / 255,
                            this.data[i + 1] / 255,
                            this.data[i + 2] / 255,
                            this.data[i + 3] / 255
                        ];
                    }
                };
            }
        };
    }
};