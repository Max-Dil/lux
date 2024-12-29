export const math = {
    colorFromBytes: function(r, g, b, a = 255) {
        return [r / 255, g / 255, b / 255, a / 255];
    },

    colorToBytes: function(r, g, b, a = 1) {
        return [
            Math.round(r * 255),
            Math.round(g * 255), 
            Math.round(b * 255),
            Math.round(a * 255)
        ];
    },

    gammaToLinear: function(r, g, b) {
        const convert = (c) => {
            if (c <= 0.04045) {
                return c / 12.92;
            }
            return Math.pow((c + 0.055) / 1.055, 2.4);
        };
        return [convert(r), convert(g), convert(b)];
    },

    linearToGamma: function(r, g, b) {
        const convert = (c) => {
            if (c <= 0.0031308) {
                return c * 12.92;
            }
            return 1.055 * Math.pow(c, 1/2.4) - 0.055;
        };
        return [convert(r), convert(g), convert(b)];
    },

    randomSeed: 1234,
    randomState: null,

    setRandomSeed: function(seed) {
        this.randomSeed = seed;
        this.randomState = seed;
    },

    getRandomSeed: function() {
        return this.randomSeed;
    },

    setRandomState: function(state) {
        this.randomState = state;
    },

    getRandomState: function() {
        return this.randomState;
    },

    random: function(min, max) {
        if (min === undefined) {
            return Math.random();
        }
        if (max === undefined) {
            return Math.random() * min;
        }
        return min + Math.random() * (max - min);
    },

    randomNormal: function(mean = 0, stddev = 1) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return num * stddev + mean;
    },

    isConvex: function(vertices) {
        if (vertices.length < 3) return false;
        
        const n = vertices.length;
        let sign = 0;
        
        for (let i = 0; i < n; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % n];
            const v3 = vertices[(i + 2) % n];
            
            const cross = (v2[0] - v1[0]) * (v3[1] - v1[1]) - 
                         (v2[1] - v1[1]) * (v3[0] - v1[0]);
            
            if (sign === 0) {
                sign = Math.sign(cross);
            } else if (sign * cross < 0) {
                return false;
            }
        }
        return true;
    },

    triangulate: function(vertices) {
        const triangles = [];
        const points = vertices.slice();
        
        while (points.length > 3) {
            for (let i = 0; i < points.length; i++) {
                const a = points[i];
                const b = points[(i + 1) % points.length];
                const c = points[(i + 2) % points.length];
                
                const isEar = this.isConvex([a, b, c]);
                if (isEar) {
                    triangles.push([a, b, c]);
                    points.splice((i + 1) % points.length, 1);
                    break;
                }
            }
        }
        
        triangles.push(points);
        return triangles;
    },

    noise: function(x, y = 0, z = 0, w = 0) {
        const p = new Array(512);
        const permutation = [151,160,137,91,90,15];
        
        for(let i = 0; i < 256; i++) {
            p[i] = permutation[i % permutation.length];
            p[256 + i] = p[i];
        }
        
        const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
        const lerp = (t, a, b) => a + t * (b - a);
        const grad = (hash, x) => (hash & 1) === 0 ? x : -x;
        
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = fade(x);
        const v = fade(y);
        
        const A = p[X] + Y;
        const B = p[X + 1] + Y;
        
        return lerp(v,
            lerp(u, grad(p[A], x), grad(p[B], x - 1)),
            lerp(u, grad(p[A + 1], x), grad(p[B + 1], x - 1))
        );
    }
};
