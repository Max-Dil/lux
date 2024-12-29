export const joystick = {
    joysticks: new Map(),
    gamepadMappings: new Map(),
    
    init: function() {
        window.addEventListener('gamepadconnected', (e) => {
            this.joysticks.set(e.gamepad.index, e.gamepad);
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            this.joysticks.delete(e.gamepad.index);
        });

        const savedMappings = localStorage.getItem('gamepadMappings');
        if (savedMappings) {
            this.loadGamepadMappings(savedMappings);
        }
    },

    update: function() {
        const gamepads = navigator.getGamepads();
        for (let gamepad of gamepads) {
            if (gamepad) {
                this.joysticks.set(gamepad.index, gamepad);
            }
        }
    },

    getJoystickCount: function() {
        return this.joysticks.size;
    },

    getJoysticks: function() {
        return Array.from(this.joysticks.values());
    },

    getGamepadMappingString: function(guid) {
        return this.gamepadMappings.get(guid) || null;
    },

    loadGamepadMappings: function(mappingsString) {
        try {
            const mappings = JSON.parse(mappingsString);
            for (const [guid, mapping] of Object.entries(mappings)) {
                this.gamepadMappings.set(guid, mapping);
            }
            return true;
        } catch (err) {
            console.warn('Ошибка загрузки маппингов геймпада:', err);
            return false;
        }
    },

    saveGamepadMappings: function() {
        try {
            const mappings = Object.fromEntries(this.gamepadMappings);
            localStorage.setItem('gamepadMappings', JSON.stringify(mappings));
            return true;
        } catch (err) {
            console.warn('Ошибка сохранения маппингов геймпада:', err);
            return false;
        }
    },

    setGamepadMapping: function(guid, inputType, inputIndex, mappedType, mappedValue) {
        let mapping = this.gamepadMappings.get(guid) || {
            buttons: {},
            axes: {},
            hats: {}
        };

        switch (inputType) {
            case 'button':
                mapping.buttons[inputIndex] = { type: mappedType, value: mappedValue };
                break;
            case 'axis':
                mapping.axes[inputIndex] = { type: mappedType, value: mappedValue };
                break;
            case 'hat':
                mapping.hats[inputIndex] = { type: mappedType, value: mappedValue };
                break;
            default:
                return false;
        }

        this.gamepadMappings.set(guid, mapping);
        return true;
    },

    isGamepad: function(joystick) {
        return joystick && joystick.mapping === 'standard';
    },

    getAxis: function(joystick, axis) {
        if (!joystick || axis >= joystick.axes.length) return 0;
        return joystick.axes[axis];
    },

    isDown: function(joystick, button) {
        if (!joystick || button >= joystick.buttons.length) return false;
        return joystick.buttons[button].pressed;
    },

    getHat: function(joystick, hat) {
        if (!joystick || !this.isGamepad(joystick)) return 'centered';
        
        const up = joystick.buttons[12]?.pressed;
        const right = joystick.buttons[15]?.pressed;
        const down = joystick.buttons[13]?.pressed;
        const left = joystick.buttons[14]?.pressed;

        if (up && right) return 'rightup';
        if (up && left) return 'leftup';
        if (down && right) return 'rightdown';
        if (down && left) return 'leftdown';
        if (up) return 'up';
        if (right) return 'right';
        if (down) return 'down';
        if (left) return 'left';
        return 'centered';
    }
};

joystick.init();