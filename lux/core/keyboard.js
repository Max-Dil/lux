export const keyboard = {
    pressedKeys: new Set(),
    pressedScancodes: new Set(),
    keyRepeatEnabled: true,
    textInputEnabled: false,
    lastKeyRepeat: 0,
    keyRepeatDelay: 400,
    keyRepeatInterval: 50,

    init: function() {
        document.addEventListener('keydown', (e) => {
            this.pressedKeys.add(e.key.toLowerCase());
            this.pressedScancodes.add(e.code);

            if (this.textInputEnabled && e.key.length === 1) {
                const event = new CustomEvent('textinput', { 
                    detail: { text: e.key } 
                });
                document.dispatchEvent(event);
            }

            if (!this.keyRepeatEnabled) {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.pressedKeys.delete(e.key.toLowerCase());
            this.pressedScancodes.delete(e.code);
        });
    },

    getKeyFromScancode: function(scancode) {
        const element = document.createElement('div');
        const event = new KeyboardEvent('keydown', { code: scancode });
        element.addEventListener('keydown', (e) => e.key);
        element.dispatchEvent(event);
        return element.textContent.toLowerCase();
    },

    getScancodeFromKey: function(key) {
        const keyToScancode = {
            'a': 'KeyA',
            'b': 'KeyB',
            'c': 'KeyC', 
            'd': 'KeyD',
            'e': 'KeyE',
            'f': 'KeyF',
            'g': 'KeyG',
            'h': 'KeyH',
            'i': 'KeyI',
            'j': 'KeyJ',
            'k': 'KeyK',
            'l': 'KeyL',
            'm': 'KeyM',
            'n': 'KeyN',
            'o': 'KeyO',
            'p': 'KeyP',
            'q': 'KeyQ',
            'r': 'KeyR',
            's': 'KeyS',
            't': 'KeyT',
            'u': 'KeyU',
            'v': 'KeyV',
            'w': 'KeyW',
            'x': 'KeyX',
            'y': 'KeyY',
            'z': 'KeyZ',
            '0': 'Digit0',
            '1': 'Digit1', 
            '2': 'Digit2',
            '3': 'Digit3',
            '4': 'Digit4',
            '5': 'Digit5',
            '6': 'Digit6',
            '7': 'Digit7',
            '8': 'Digit8',
            '9': 'Digit9',
            ' ': 'Space',
            'enter': 'Enter',
            'tab': 'Tab',
            'escape': 'Escape',
            'backspace': 'Backspace',
            'delete': 'Delete',
            'shift': 'ShiftLeft',
            'control': 'ControlLeft',
            'alt': 'AltLeft',
            'meta': 'MetaLeft',
            'arrowup': 'ArrowUp',
            'arrowdown': 'ArrowDown',
            'arrowleft': 'ArrowLeft', 
            'arrowright': 'ArrowRight'
        };
        return keyToScancode[key.toLowerCase()] || '';
    },

    hasKeyRepeat: function() {
        return this.keyRepeatEnabled;
    },

    hasScreenKeyboard: function() {
        return ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0) ||
               (navigator.msMaxTouchPoints > 0);
    },

    hasTextInput: function() {
        return this.textInputEnabled;
    },

    isDown: function(...keys) {
        return keys.some(key => this.pressedKeys.has(key.toLowerCase()));
    },

    isScancodeDown: function(...scancodes) {
        return scancodes.some(code => this.pressedScancodes.has(code));
    },

    setKeyRepeat: function(enable) {
        this.keyRepeatEnabled = enable;
    },

    setTextInput: function(enable, x, y, w, h) {
        this.textInputEnabled = enable;
        
        if (enable && this.hasScreenKeyboard()) {
            let input = document.getElementById('virtualKeyboardInput');
            if (!input) {
                input = document.createElement('input');
                input.id = 'virtualKeyboardInput';
                input.style.position = 'absolute';
                input.style.opacity = '0';
                input.style.pointerEvents = 'none';
                document.body.appendChild(input);
            }

            if (x !== undefined && y !== undefined) {
                input.style.left = x + 'px';
                input.style.top = y + 'px';
                input.style.width = (w || 1) + 'px';
                input.style.height = (h || 1) + 'px';
            }

            input.focus();
        }
    }
};

keyboard.init();