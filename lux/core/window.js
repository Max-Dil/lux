export const window = {
    canvas: document.getElementById('canvas'),

    close: function() {
        window.close();
    },

    fromPixels: function(value) {
        return value / (window.devicePixelRatio || 1);
    },

    getDPIScale: function() {
        return window.devicePixelRatio || 1;
    },

    getDesktopDimensions: function() {
        return [window.screen.width, window.screen.height];
    },

    getDimensions: function() {
        return [this.canvas.width, this.canvas.height];
    },

    getDisplayCount: function() {
        return 1;
    },

    getDisplayName: function() {
        return "Web Display";
    },

    getDisplayOrientation: function() {
        return screen.orientation.type;
    },

    getFullscreen: function() {
        return document.fullscreenElement !== null;
    },

    getFullscreenModes: function() {
        return [{
            width: window.screen.width,
            height: window.screen.height
        }];
    },

    getIcon: function() {
        const link = document.querySelector("link[rel~='icon']");
        return link ? link.href : null;
    },

    getMode: function() {
        return {
            width: this.canvas.width,
            height: this.canvas.height,
            fullscreen: this.getFullscreen(),
            vsync: true,
            msaa: 0,
            borderless: false,
            resizable: true,
            centered: true,
            display: 1,
            minwidth: 1,
            minheight: 1
        };
    },

    getPosition: function() {
        const rect = this.canvas.getBoundingClientRect();
        return [rect.left, rect.top];
    },

    getSafeArea: function() {
        const rect = this.canvas.getBoundingClientRect();
        return [rect.left, rect.top, rect.width, rect.height];
    },

    getTitle: function() {
        return document.title;
    },

    getVSync: function() {
        return true;
    },

    hasFocus: function() {
        return document.hasFocus();
    },

    hasMouseFocus: function() {
        return document.hasFocus() && document.activeElement === this.canvas;
    },

    isDisplaySleepEnabled: function() {
        return !document.hidden;
    },

    isMaximized: function() {
        return window.outerWidth === window.screen.availWidth && 
               window.outerHeight === window.screen.availHeight;
    },

    isMinimized: function() {
        return document.hidden;
    },

    isOpen: function() {
        return true;
    },

    isVisible: function() {
        return !document.hidden;
    },

    maximize: function() {
        if (!this.isMaximized()) {
            window.moveTo(0, 0);
            window.resizeTo(window.screen.availWidth, window.screen.availHeight);
        }
    },

    minimize: function() {
        window.minimize();
    },

    restore: function() {
        if (this.isMinimized()) {
            window.restore();
        }
    },

    setDisplaySleepEnabled: function(enable) {
        if (!enable) {
            navigator.wakeLock.request('screen').catch(console.error);
        }
    },

    setFullscreen: function(fullscreen) {
        if (fullscreen) {
            this.canvas.requestFullscreen().catch(console.error);
        } else if (document.fullscreenElement) {
            document.exitFullscreen().catch(console.error);
        }
    },

    setIcon: function(imageData) {
        const link = document.querySelector("link[rel~='icon']") || 
                    document.createElement('link');
        link.rel = 'icon';
        link.href = imageData;
        document.head.appendChild(link);
    },

    setMode: function(width, height, settings = {}) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        if (settings.fullscreen) {
            this.setFullscreen(true);
        }
        
        if (settings.title) {
            this.setTitle(settings.title);
        }
    },

    setPosition: function(x, y) {
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = x + 'px';
        this.canvas.style.top = y + 'px';
    },

    setTitle: function(title) {
        document.title = title;
    },

    showMessageBox: function(title, message, type = "info", buttons = ["OK"]) {
        return new Promise((resolve) => {
            const result = window.confirm(message);
            resolve(result ? 1 : 2);
        });
    },

    toPixels: function(value) {
        return value * (window.devicePixelRatio || 1);
    },

    updateMode: function(settings = {}) {
        if (settings.width) this.canvas.width = settings.width;
        if (settings.height) this.canvas.height = settings.height;
        if (settings.fullscreen !== undefined) this.setFullscreen(settings.fullscreen);
        if (settings.title) this.setTitle(settings.title);
    }
};
