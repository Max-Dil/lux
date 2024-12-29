import { graphics } from './graphics.js';
import { timer } from './timer.js';
import { event } from './event.js';

export let lux = {
    loaded: false,
    graphics: graphics,
    timer: timer,
    event: event,

    run: function() {
        if (this.load && !this.loaded) {
            this.load();
            this.loaded = true;
        }

        let lastTime = 0;
        const gameLoop = (timestamp) => {
            this.event.pump();
            
            for (const e of this.event.poll()) {
                if (e.name === 'quit') {
                    return;
                }

                switch (e.name) {
                    case 'keypressed':
                        if (this.keypressed) {
                            this.keypressed(e.args[0], e.args[1], e.args[2]);
                        }
                        break;
                    case 'keyreleased':
                        if (this.keyreleased) {
                            this.keyreleased(e.args[0], e.args[1]);
                        }
                        break;
                    case 'textinput':
                        if (this.textinput) {
                            this.textinput(e.args[0]);
                        }
                        break;
                    case 'mousepressed':
                        if (this.mousepressed) {
                            this.mousepressed(e.args[0], e.args[1], e.args[2], e.args[3]);
                        }
                        break;
                    case 'mousereleased':
                        if (this.mousereleased) {
                            this.mousereleased(e.args[0], e.args[1], e.args[2], e.args[3]);
                        }
                        break;
                    case 'mousemoved':
                        if (this.mousemoved) {
                            this.mousemoved(e.args[0], e.args[1], e.args[2], e.args[3]);
                        }
                        break;
                    case 'wheelmoved':
                        if (this.wheelmoved) {
                            this.wheelmoved(e.args[0], e.args[1]);
                        }
                        break;
                    case 'touchpressed':
                        if (this.touchpressed) {
                            this.touchpressed(e.args[0], e.args[1], e.args[2]);
                        }
                        break;
                    case 'touchreleased':
                        if (this.touchreleased) {
                            this.touchreleased(e.args[0], e.args[1], e.args[2]);
                        }
                        break;
                    case 'touchmoved':
                        if (this.touchmoved) {
                            this.touchmoved(e.args[0], e.args[1], e.args[2]);
                        }
                        break;
                    case 'joystickadded':
                        if (this.joystickadded) {
                            this.joystickadded(e.args[0]);
                        }
                        break;
                    case 'joystickremoved':
                        if (this.joystickremoved) {
                            this.joystickremoved(e.args[0]);
                        }
                        break;
                    case 'gamepadpressed':
                        if (this.gamepadpressed) {
                            this.gamepadpressed(e.args[0], e.args[1]);
                        }
                        break;
                    case 'gamepadreleased':
                        if (this.gamepadreleased) {
                            this.gamepadreleased(e.args[0], e.args[1]);
                        }
                        break;
                    case 'gamepadaxis':
                        if (this.gamepadaxis) {
                            this.gamepadaxis(e.args[0], e.args[1], e.args[2]);
                        }
                        break;
                    case 'windowfocus':
                        if (this.windowfocus) {
                            this.windowfocus(e.args[0]);
                        }
                        break;
                    case 'windowvisible':
                        if (this.windowvisible) {
                            this.windowvisible(e.args[0]);
                        }
                        break;
                    case 'windowresize':
                        if (this.windowresize) {
                            this.windowresize(e.args[0], e.args[1]);
                        }
                        break;
                }
            }

            timer.step();
            const dt = (timestamp - lastTime) / 1000;
            lastTime = timestamp;

            if (this.update) {
                this.update(dt);
            }

            if (this.draw) {
                this.graphics.push();
                const [r, g, b, a] = this.graphics.getBackgroundColor();
                this.graphics.clear(r || 1, g || 1, b || 1, a || 1);
                this.graphics.pop();

                this.graphics.push();
                this.draw();
                this.graphics.pop();
            }

            this.event.clear();

            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    },
    
    quit: function() {
        this.event.quit();
    }
};