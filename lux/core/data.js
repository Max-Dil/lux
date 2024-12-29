export const data = {
    formats: {
        lz4: 'lz4',
        zlib: 'zlib',
        gzip: 'gzip',
        deflate: 'deflate'
    },

    encodeFormats: {
        base64: 'base64',
        hex: 'hex',
        binary: 'binary'
    },

    hashFunctions: {
        md5: 'md5',
        sha1: 'sha1',
        sha256: 'sha256',
        sha512: 'sha512'
    },

    newByteData: function(arg) {
        if (typeof arg === 'number') {
            return new Uint8Array(arg);
        } else if (typeof arg === 'string') {
            return new TextEncoder().encode(arg);
        } else if (arg instanceof Uint8Array) {
            return arg;
        }
        throw new Error('Неверный аргумент для newByteData');
    },

    newDataView: function(data, offset, size) {
        if (!(data instanceof Uint8Array)) {
            throw new Error('Data должен быть Uint8Array');
        }
        return new DataView(data.buffer, offset, size);
    },

    compress: async function(format, input) {
        if (format === this.formats.gzip || format === this.formats.deflate) {
            const blob = new Blob([input]);
            const stream = blob.stream().pipeThrough(new CompressionStream(format));
            return new Uint8Array(await new Response(stream).arrayBuffer());
        }
        throw new Error('Формат сжатия не поддерживается');
    },

    decompress: async function(format, input) {
        if (format === this.formats.gzip || format === this.formats.deflate) {
            const blob = new Blob([input]);
            const stream = blob.stream().pipeThrough(new DecompressionStream(format));
            return new Uint8Array(await new Response(stream).arrayBuffer());
        }
        throw new Error('Формат распаковки не поддерживается');
    },

    encode: function(format, input) {
        if (!(input instanceof Uint8Array) && typeof input !== 'string') {
            throw new Error('Input должен быть строкой или Uint8Array');
        }

        const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;

        switch (format) {
            case this.encodeFormats.base64:
                return btoa(String.fromCharCode.apply(null, data));
            case this.encodeFormats.hex:
                return Array.from(data)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            case this.encodeFormats.binary:
                return Array.from(data)
                    .map(b => b.toString(2).padStart(8, '0'))
                    .join('');
            default:
                throw new Error('Неподдерживаемый формат кодирования');
        }
    },

    decode: function(format, input) {
        if (typeof input !== 'string') {
            throw new Error('Input должен быть строкой');
        }

        switch (format) {
            case this.encodeFormats.base64:
                return new Uint8Array(
                    atob(input)
                        .split('')
                        .map(c => c.charCodeAt(0))
                );
            case this.encodeFormats.hex:
                return new Uint8Array(
                    input.match(/.{1,2}/g)
                        .map(byte => parseInt(byte, 16))
                );
            case this.encodeFormats.binary:
                return new Uint8Array(
                    input.match(/.{1,8}/g)
                        .map(byte => parseInt(byte, 2))
                );
            default:
                throw new Error('Неподдерживаемый формат декодирования');
        }
    },

    hash: async function(algorithm, input) {
        const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        return new Uint8Array(hashBuffer);
    },

    pack: function(format, ...values) {
        const view = new DataView(new ArrayBuffer(this.getPackedSize(format)));
        let offset = 0;

        for (let i = 0; i < format.length; i++) {
            const value = values[i];
            switch (format[i]) {
                case 'b': view.setInt8(offset, value); offset += 1; break;
                case 'B': view.setUint8(offset, value); offset += 1; break;
                case 'h': view.setInt16(offset, value, true); offset += 2; break;
                case 'H': view.setUint16(offset, value, true); offset += 2; break;
                case 'l': view.setInt32(offset, value, true); offset += 4; break;
                case 'L': view.setUint32(offset, value, true); offset += 4; break;
                case 'f': view.setFloat32(offset, value, true); offset += 4; break;
                case 'd': view.setFloat64(offset, value, true); offset += 8; break;
            }
        }

        return new Uint8Array(view.buffer);
    },

    unpack: function(format, data) {
        const view = new DataView(data.buffer);
        let offset = 0;
        const result = [];

        for (const f of format) {
            switch (f) {
                case 'b': result.push(view.getInt8(offset)); offset += 1; break;
                case 'B': result.push(view.getUint8(offset)); offset += 1; break;
                case 'h': result.push(view.getInt16(offset, true)); offset += 2; break;
                case 'H': result.push(view.getUint16(offset, true)); offset += 2; break;
                case 'l': result.push(view.getInt32(offset, true)); offset += 4; break;
                case 'L': result.push(view.getUint32(offset, true)); offset += 4; break;
                case 'f': result.push(view.getFloat32(offset, true)); offset += 4; break;
                case 'd': result.push(view.getFloat64(offset, true)); offset += 8; break;
            }
        }

        return result;
    },

    getPackedSize: function(format) {
        const sizes = {
            'b': 1, 'B': 1,
            'h': 2, 'H': 2,
            'l': 4, 'L': 4,
            'f': 4, 'd': 8
        };
        return format.split('').reduce((size, f) => size + (sizes[f] || 0), 0);
    }
};