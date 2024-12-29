import { lux } from './lux/index.js';

let Player = {
    x: 100,
    y: 100,
    width: 50,
    height: 50
}

let image
lux.load = async function() {
    image = await lux.graphics.newImage('blocks.png');
};

lux.update = function(dt) {
    Player.x = lux.mouse.x - Player.width / 2;
    Player.y = lux.mouse.y - Player.height / 2;
    lux.graphics.setDefaultFilter('nearest', 'nearest');
};

lux.draw = function() {
    lux.graphics.setBackgroundColor(0.5, 0.5, 0.5, 1);

    // lux.graphics.setColor(1, 0, 0, 1);
    lux.graphics.rectangle('fill', Player.x, Player.y, Player.width, Player.height);

    
    lux.graphics.ellipse('line', 300, 300, 100, 50);

    lux.graphics.arc('fill', 400, 400, 50, 0, Math.PI);

    lux.graphics.push();
    lux.graphics.translate(100, 100);
    lux.graphics.rotate(Math.PI / 4);
    lux.graphics.scale(2);
    lux.graphics.rectangle('line', 0, 0, 50, 50);
    lux.graphics.pop();

    lux.graphics.setScissor(200, 200, 100, 100);
    lux.graphics.circle('fill', 250, 250, 100);
    lux.graphics.setScissor();

    lux.graphics.setLineWidth(5);
    lux.graphics.setLineStyle('smooth');
    lux.graphics.setLineJoin('round');
    lux.graphics.rectangle('line', 500, 500, 100, 100);

    lux.graphics.setFont('Arial', 20);
    lux.graphics.print('Hello, World!', 500, 500);

    lux.graphics.scale(3);
    lux.graphics.draw(image, 100, 100);
};

lux.keypressed = function(code, key, repeat) {
    console.log(`Клавиша нажата: ${key}`);
};

lux.mousepressed = function(x, y, button, isTouch) {
    console.log(`Клик мыши в ${x}, ${y}`);
};

lux.mousereleased = function(x, y, button, isTouch) {
    console.log(`Отжата кнопка мыши: ${button}`);
};
