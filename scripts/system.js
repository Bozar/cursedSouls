'use strict';

Main.system = {};

Main.system.isFloor = function (x, y) {
    return Main.getEntity('dungeon').Dungeon.getTerrain().get(x + ',' + y) === 0;
};

Main.system.placePC = function () {
    let x = null;
    let y = null;
    let width = Main.getEntity('dungeon').Dungeon.getWidth();
    let height = Main.getEntity('dungeon').Dungeon.getHeight();
    let border = Main.getEntity('pc').Position.getSight();

    do {
        x = Math.floor(width * ROT.RNG.getUniform());
        y = Math.floor(height * ROT.RNG.getUniform());
    } while (!Main.system.isFloor(x, y) ||
    x < border || x > width - border ||
    y < border || y > height - border);

    Main.getEntity('pc').Position.setX(x);
    Main.getEntity('pc').Position.setY(y);
};

Main.system.isPC = function (actor) {
    return actor.getID() === Main.getEntity('pc').getID();
};

Main.system.pcAct = function () {
    Main.getEntity('timer').engine.lock();

    Main.input.listenEvent('add', 'main');

    Main.display.clear();
    Main.screens.main.display();
};

Main.system.move = function (direction) {
    let actor = Main.getEntity('pc');
    let duration = actor.ActionDuration.getMove();
    let x = actor.Position.getX();
    let y = actor.Position.getY();
    let message = Main.getEntity('message').Message;

    switch (direction) {
        case 'left':
            x -= 1;
            break;
        case 'right':
            x += 1;
            break;
        case 'up':
            y -= 1;
            break;
        case 'down':
            y += 1;
            break;
        case 'wait':
            duration = actor.ActionDuration.getWait();
    }

    if (Main.system.isFloor(x, y) && !Main.system.npcHere(x, y)) {
        // Main.system.isItem(x, y) &&
        //   message.pushMsg(Main.text.interact('find',
        //     Main.system.isItem(x, y).getEntityName()))

        actor.Position.setX(x);
        actor.Position.setY(y);

        Main.input.listenEvent('remove', 'main');
        Main.system.unlockEngine(duration);
    } else {
        message.setModeline('invalid move');
        // message.setModeline(Main.text.interact('forbidMove'))
    }
};

Main.system.unlockEngine = function (duration) {
    Main.getEntity('timer').scheduler.setDuration(duration);
    Main.getEntity('timer').engine.unlock();

    Main.display.clear();
    Main.screens.main.display();
};

Main.system.npcHere = function (x, y) {
    for (const keyValue of Main.getEntity('npc')) {
        if (x === keyValue[1].Position.getX() &&
            y === keyValue[1].Position.getY()) {
            return true;
        }
    }
    return false;
};

Main.system.examineMode = function () {
    Main.getEntity('marker').Position.setX(Main.getEntity('pc').Position.getX());
    Main.getEntity('marker').Position.setY(Main.getEntity('pc').Position.getY());
};
