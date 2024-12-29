export const event = {
    queue: [],
    handlers: new Map(),

    events: {
        QUIT: 'quit',
        FOCUS: 'focus',
        VISIBLE: 'visible',
        RESIZE: 'resize',
        MOUSEPRESSED: 'mousepressed',
        MOUSERELEASED: 'mousereleased',
        MOUSEMOVED: 'mousemoved',
        WHEELMOVED: 'wheelmoved',
        KEYPRESSED: 'keypressed',
        KEYRELEASED: 'keyreleased',
        TEXTINPUT: 'textinput',
        TOUCHPRESSED: 'touchpressed',
        TOUCHRELEASED: 'touchreleased',
        TOUCHMOVED: 'touchmoved',
        JOYSTICKADDED: 'joystickadded',
        JOYSTICKREMOVED: 'joystickremoved',
        GAMEPADPRESSED: 'gamepadpressed',
        GAMEPADRELEASED: 'gamepadreleased',
        GAMEPADAXIS: 'gamepadaxis',
        WINDOWFOCUS: 'windowfocus',
        WINDOWVISIBLE: 'windowvisible',
        WINDOWRESIZE: 'windowresize',
    },

    init: function() {
        this.handlers.set(this.events.QUIT, () => {
            window.close();
        });

        window.addEventListener('focus', () => this.push(this.events.WINDOWFOCUS, true));
        window.addEventListener('blur', () => this.push(this.events.WINDOWFOCUS, false));
        window.addEventListener('resize', () => {
            const canvas = document.getElementById('canvas');
            this.push(this.events.WINDOWRESIZE, canvas.clientWidth, canvas.clientHeight);
        });

        const canvas = document.getElementById('canvas');
        canvas.addEventListener('mousedown', (e) => {
            this.push(this.events.MOUSEPRESSED, e.clientX, e.clientY, e.button, false);
        });
        canvas.addEventListener('mouseup', (e) => {
            this.push(this.events.MOUSERELEASED, e.clientX, e.clientY, e.button, false);
        });
        canvas.addEventListener('mousemove', (e) => {
            this.push(this.events.MOUSEMOVED, e.clientX, e.clientY, e.movementX, e.movementY);
        });
        canvas.addEventListener('wheel', (e) => {
            this.push(this.events.WHEELMOVED, e.deltaX, e.deltaY);
        });

        window.addEventListener('keydown', (e) => {
            if (!e.repeat) {
                this.push(this.events.KEYPRESSED, e.code, e.key, e.repeat);
            }
        });
        window.addEventListener('keyup', (e) => {
            this.push(this.events.KEYRELEASED, e.code, e.key);
        });
        window.addEventListener('input', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                this.push(this.events.TEXTINPUT, e.data);
            }
        });

        canvas.addEventListener('touchstart', (e) => {
            for (const touch of e.changedTouches) {
                this.push(this.events.TOUCHPRESSED, touch.identifier, touch.clientX, touch.clientY);
            }
        });
        canvas.addEventListener('touchend', (e) => {
            for (const touch of e.changedTouches) {
                this.push(this.events.TOUCHRELEASED, touch.identifier, touch.clientX, touch.clientY);
            }
        });
        canvas.addEventListener('touchmove', (e) => {
            for (const touch of e.changedTouches) {
                this.push(this.events.TOUCHMOVED, touch.identifier, touch.clientX, touch.clientY);
            }
        });

        window.addEventListener('gamepadconnected', (e) => {
            this.push(this.events.JOYSTICKADDED, e.gamepad.index);
        });
        window.addEventListener('gamepaddisconnected', (e) => {
            this.push(this.events.JOYSTICKREMOVED, e.gamepad.index);
        });
    },

    clear: function() {
        this.queue = [];
    },

    *poll() {
        while (this.queue.length > 0) {
            yield this.queue.shift();
        }
    },

    pump: function() {
        const gamepads = navigator.getGamepads();
        for (const gamepad of gamepads) {
            if (gamepad) {
                for (let i = 0; i < gamepad.buttons.length; i++) {
                    const button = gamepad.buttons[i];
                    if (button.pressed) {
                        this.push(this.events.GAMEPADPRESSED, gamepad.index, i);
                    }
                }
                for (let i = 0; i < gamepad.axes.length; i++) {
                    this.push(this.events.GAMEPADAXIS, gamepad.index, i, gamepad.axes[i]);
                }
            }
        }
    },

    push: function(eventName, ...args) {
        this.queue.push({
            name: eventName,
            args: args
        });
    },

    quit: function(exitstatus = 0, restart = false) {
        if (restart) {
            window.location.reload();
        } else {
            this.push(this.events.QUIT, exitstatus);
        }
    },

    wait: async function() {
        if (this.queue.length > 0) {
            return this.queue.shift();
        }

        return new Promise(resolve => {
            const checkQueue = () => {
                if (this.queue.length > 0) {
                    resolve(this.queue.shift());
                } else {
                    requestAnimationFrame(checkQueue);
                }
            };
            checkQueue();
        });
    }
};

event.init();