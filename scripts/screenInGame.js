'use strict';

// ===============
// The main screen
// ===============

Main.screens.main = new Main.Screen('main', ['main', 'examine', 'aim']);

Main.screens.main.initialize = function () {
    Main.entity.seed();
    Main.getEntity('seed').Seed.setSeed(Main.getDevSeed());
    ROT.RNG.setSeed(Main.getEntity('seed').Seed.getSeed());

    Main.entity.dungeon();
    Main.entity.message();

    Main.entity.pc();
    Main.entity.marker();

    Main.entity.timer();
    Main.getEntity('timer').scheduler.add(Main.getEntity('pc'), true);
    Main.getEntity('timer').engine.start();

    Main.system.placePC();
    //   Main.system.placeItem()

    Main.getEntity('message').Message.setModeline('this is the modeline');
    for (let i = 0; i < 10; i++) {
        Main.getEntity('message').Message.pushMsg(`Message: ${i}`);
    }
};

Main.screens.main.display = function () {
    Main.screens.drawBorder();
    Main.screens.drawVersion();
    Main.screens.drawHelp();
    Main.screens.drawSeed();

    Main.screens.drawLevelName();
    Main.screens.drawPower();
    Main.screens.drawOrbOnTheGround();

    Main.screens.drawDungeon();
    // Main.screens.drawItem()
    Main.screens.drawActor(Main.getEntity('pc'));
    for (const keyValue of Main.getEntity('npc')) {
        Main.screens.drawActor(keyValue[1]);
    }
    Main.screens.drawActor(Main.getEntity('marker'));

    Main.screens.drawMessage();
    Main.screens.drawModeLine();
};

Main.screens.main.keyInput = function (e) {
    let keyAction = Main.input.getAction;

    if (e.shiftKey) {
        if (keyAction(e, 'fixed') === 'develop') {
            Main.setDevelop();
        }
    } else if (keyAction(e, 'move')) {
        Main.system.move(keyAction(e, 'move'));
    } else if (keyAction(e, 'interact') === 'examine') {
        Main.system.examineMode();
    } else if (keyAction(e, 'fixed') === 'seed') {
        console.log(Main.getEntity('seed').Seed.getSeed());
    } else if (Main.getDevelop()) {
        if (keyAction(e, 'fixed') === 'fov') {
            Main.getEntity('dungeon').Dungeon.setFov();
        } else if (keyAction(e, 'fixed') === 'turn') {
            console.log(Main.getEntity('timer').scheduler.getTime());
        } else if (keyAction(e, 'fixed') === 'dummy') {
            Main.entity.dummy(
                Main.getEntity('pc').Position.getX() - 1,
                Main.getEntity('pc').Position.getY());
        }
    }

    Main.display.clear();
    Main.screens.main.display();
};
