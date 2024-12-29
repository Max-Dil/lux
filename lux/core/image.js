export const image = {
    CompressedImageFormat: {
        DXT1: 'dxt1',
        DXT3: 'dxt3', 
        DXT5: 'dxt5',
        BC4: 'bc4',
        BC5: 'bc5',
        BC6H: 'bc6h',
        BC7: 'bc7',
        ETC1: 'etc1',
        ETC2RGB: 'etc2-rgb',
        ETC2RGBA: 'etc2-rgba',
        PVRTC1_RGB: 'pvrtc1-rgb',
        PVRTC1_RGBA: 'pvrtc1-rgba',
        ASTC_4x4: 'astc-4x4',
        ASTC_5x5: 'astc-5x5',
        ASTC_6x6: 'astc-6x6',
        ASTC_8x8: 'astc-8x8'
    },

    ImageEncodeFormat: {
        PNG: 'image/png',
        JPG: 'image/jpeg',
        WEBP: 'image/webp'
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

    isCompressed: function(filepath) {
        const ext = filepath.split('.').pop().toLowerCase();
        const compressedFormats = ['dds', 'ktx', 'astc', 'pkm', 'pvr'];
        return compressedFormats.includes(ext);
    },

    newCompressedData: async function(filepath) {
        if (!this.isCompressed(filepath)) {
            throw new Error('Формат файла не поддерживает сжатие');
        }

        const response = await fetch(filepath);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        let width = 0;
        let height = 0;
        let format = 'unknown';

        const ext = filepath.split('.').pop().toLowerCase();
        
        if (ext === 'dds') {
            width = data[16] | (data[17] << 8) | (data[18] << 16) | (data[19] << 24);
            height = data[12] | (data[13] << 8) | (data[14] << 16) | (data[15] << 24);
            
            const fourCC = String.fromCharCode(data[84], data[85], data[86], data[87]);
            switch(fourCC) {
                case 'DXT1': format = this.CompressedImageFormat.DXT1; break;
                case 'DXT3': format = this.CompressedImageFormat.DXT3; break;
                case 'DXT5': format = this.CompressedImageFormat.DXT5; break;
                case 'BC4U': format = this.CompressedImageFormat.BC4; break;
                case 'BC5U': format = this.CompressedImageFormat.BC5; break;
                case 'BC6H': format = this.CompressedImageFormat.BC6H; break;
                case 'BC7L': format = this.CompressedImageFormat.BC7; break;
            }
        } else if (ext === 'ktx') {
            width = data[36] | (data[37] << 8) | (data[38] << 16) | (data[39] << 24);
            height = data[40] | (data[41] << 8) | (data[42] << 16) | (data[43] << 24);
            
            const glInternalFormat = data[28] | (data[29] << 8) | (data[30] << 16) | (data[31] << 24);
            switch(glInternalFormat) {
                case 0x83F1: format = this.CompressedImageFormat.ETC1; break;
                case 0x9274: format = this.CompressedImageFormat.ETC2RGB; break;
                case 0x9278: format = this.CompressedImageFormat.ETC2RGBA; break;
                case 0x8C00: format = this.CompressedImageFormat.PVRTC1_RGB; break;
                case 0x8C02: format = this.CompressedImageFormat.PVRTC1_RGBA; break;
                case 0x93B0: format = this.CompressedImageFormat.ASTC_4x4; break;
                case 0x93B1: format = this.CompressedImageFormat.ASTC_5x5; break;
                case 0x93B2: format = this.CompressedImageFormat.ASTC_6x6; break;
                case 0x93B3: format = this.CompressedImageFormat.ASTC_8x8; break;
            }
        }

        return {
            getWidth: function() {
                return width;
            },
            getHeight: function() {
                return height;
            },
            getFormat: function() {
                return format;
            },
            getData: function() {
                return data;
            }
        };
    },

    newImageData: function(width, height, data = null) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);

        if (data) {
            imageData.data.set(data);
        }

        return {
            width: width,
            height: height,
            data: imageData.data,

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
                const i = (y * this.width + x) * 4;
                return [
                    this.data[i] / 255,
                    this.data[i + 1] / 255,
                    this.data[i + 2] / 255,
                    this.data[i + 3] / 255
                ];
            },

            setPixel: function(x, y, r, g, b, a = 1) {
                const i = (y * this.width + x) * 4;
                this.data[i] = r * 255;
                this.data[i + 1] = g * 255;
                this.data[i + 2] = b * 255;
                this.data[i + 3] = a * 255;
            },

            encode: function(format = 'image/png', quality = 0.92) {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                const ctx = canvas.getContext('2d');
                const newImageData = new ImageData(this.data, this.width, this.height);
                ctx.putImageData(newImageData, 0, 0);
                return canvas.toDataURL(format, quality);
            },

            paste: function(sourceData, dx = 0, dy = 0) {
                for (let y = 0; y < sourceData.height; y++) {
                    for (let x = 0; x < sourceData.width; x++) {
                        const sx = x + dx;
                        const sy = y + dy;
                        if (sx >= 0 && sx < this.width && sy >= 0 && sy < this.height) {
                            const sourcePixel = sourceData.getPixel(x, y);
                            this.setPixel(sx, sy, ...sourcePixel);
                        }
                    }
                }
            }
        };
    }
};