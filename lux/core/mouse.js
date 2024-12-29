export const mouse = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    buttons: {},
    wheeldx: 0,
    wheeldy: 0,
    isDown: false,
    isGrabbed: false,
    isVisible: true,
    relativeModeEnabled: false,

    init: function() {
        const canvas = document.getElementById('canvas');

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const prevX = this.x;
            const prevY = this.y;

            this.x = (e.clientX - rect.left) * scaleX;
            this.y = (e.clientY - rect.top) * scaleY;

            this.dx = this.x - prevX;
            this.dy = this.y - prevY;
        });

        canvas.addEventListener('mousedown', (e) => {
            this.buttons[e.button] = true;
            this.isDown = true;
        });

        canvas.addEventListener('mouseup', (e) => {
            this.buttons[e.button] = false;
            this.isDown = false;
        });

        canvas.addEventListener('wheel', (e) => {
            this.wheeldx = e.deltaX;
            this.wheeldy = e.deltaY;
        });

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    },

    getX: function() {
        return this.x;
    },

    getY: function() {
        return this.y;
    },

    getPosition: function() {
        return [this.x, this.y];
    },

    getDX: function() {
        return this.dx;
    },

    getDY: function() {
        return this.dy;
    },

    isButtonDown: function(button) {
        return this.buttons[button] || false;
    },

    getWheelDX: function() {
        return this.wheeldx;
    },

    getWheelDY: function() {
        return this.wheeldy;
    },

    setPosition: function(x, y) {
        this.x = x;
        this.y = y;
    },

    setVisible: function(visible) {
        this.isVisible = visible;
        document.getElementById('canvas').style.cursor = visible ? 'default' : 'none';
    },

    isVisible: function() {
        return this.isVisible;
    },

    setGrabbed: function(grabbed) {
        this.isGrabbed = grabbed;
        const canvas = document.getElementById('canvas');
        if (grabbed) {
            canvas.requestPointerLock();
        } else {
            document.exitPointerLock();
        }
    },

    isGrabbed: function() {
        return this.isGrabbed;
    },

    setRelativeMode: function(enable) {
        this.relativeModeEnabled = enable;
        if (enable) {
            this.setGrabbed(true);
        } else {
            this.setGrabbed(false);
        }
    },

    getRelativeMode: function() {
        return this.relativeModeEnabled;
    },

    isCursorSupported: function() {
        return true;
    },

    newCursor: function(imageData, hotX = 0, hotY = 0) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
        const dataURL = canvas.toDataURL();
        return `url(${dataURL}) ${hotX} ${hotY}, auto`;
    },

    setCursor: function(cursor) {
        document.getElementById('canvas').style.cursor = cursor;
    },

    getCursor: function() {
        return document.getElementById('canvas').style.cursor;
    }
};

mouse.init();
