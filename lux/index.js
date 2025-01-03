import { lux } from './core/lux.js';
import { graphics } from './core/graphics.js';
import { physics } from './core/physics.js';
import { math } from './core/math.js';
import { mouse } from './core/mouse.js';
import { timer } from './core/timer.js';
import { sound } from './core/sound.js';
import { video } from './core/video.js';
import { touch } from './core/touch.js';
import { thread } from './core/thread.js';
import { system } from './core/system.js';
import { joystick } from './core/joystick.js';
import { keyboard } from './core/keyboard.js';
import { image } from './core/image.js';
import { font } from './core/font.js';
import { filesystem } from './core/filesystem.js';
import { data } from './core/data.js';
import { event } from './core/event.js';
import { window } from './core/window.js';
import { audio } from './core/audio.js';

window.lux = lux;
const modules = {
    graphics, physics, math, mouse, timer, sound, 
    video, touch, thread, system, joystick, keyboard, audio,
    image, font, filesystem, data, event, window
};
Object.assign(lux, modules);

setTimeout(() => {
    lux.run();
}, 1);

export { lux };