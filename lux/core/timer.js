export const timer = {
    lastTime: 0,
    deltaTime: 0,
    fps: 0,
    fpsUpdateTime: 0,
    frameCount: 0,
    deltaSamples: [],

    init: function() {
        this.lastTime = performance.now();
        this.fpsUpdateTime = this.lastTime;
    },

    getAverageDelta: function() {
        if (this.deltaSamples.length === 0) return 0;
        const sum = this.deltaSamples.reduce((a, b) => a + b, 0);
        return sum / this.deltaSamples.length;
    },

    getDelta: function() {
        return this.deltaTime / 1000;
    },

    getFPS: function() {
        return this.fps;
    },

    getTime: function() {
        return performance.now() / 1000;
    },

    sleep: function(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    },

    step: function() {
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.deltaSamples.push(this.deltaTime / 1000);
        if (this.deltaSamples.length > 60) {
            this.deltaSamples.shift();
        }

        this.frameCount++;
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsUpdateTime));
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    }
};

timer.init();