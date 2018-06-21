'use strict';

// ===============
// The main screen
// ===============

Main.screens.main = new Main.Screen('main', ['main', 'examine', 'aim']);

// Create & place entities (if necessacry) in this order:
// Seed, Dungeon, (PC, NPCs, Downstairs, Orbs), Marker.
// The PC cannot stick to the wall.
// NPCs cannot appear in the PC's sight.
// The downstairs has to be at least 1/4 screen away from the PC.
// Orbs cannot be generated on the downstairs.
Main.screens.main.initialize = function () {
    let pcCanSee = [];

    Main.entity.seed();
    Main.getEntity('seed').Seed.setSeed(Main.getDevSeed());
    ROT.RNG.setSeed(Main.getEntity('seed').Seed.getSeed());

    Main.entity.dungeon();

    // Output the dungeon generation details.
    if (Main.getDevelop()) {
        console.log('Seed: '
            + Main.getEntity('seed').Seed.getSeed());
        console.log('Floor: '
            + Main.getEntity('dungeon').Dungeon.getPercent()
            + '%');
        console.log('Cycle: '
            + Main.getEntity('dungeon').Dungeon.getCycle());
    }

    Main.entity.pc();
    Main.getEntity('pc').Inventory.addItem('slime');
    Main.getEntity('pc').Inventory.addItem('fire');
    Main.getEntity('pc').Inventory.addItem('fire');
    Main.getEntity('pc').Inventory.addItem('lump');

    Main.entity.downstairs();

    Main.system.createOrbs();
    Main.entity.marker();

    Main.entity.timer();
    Main.getEntity('timer').scheduler.add(Main.getEntity('pc'), true);
    Main.getEntity('timer').engine.start();

    Main.system.placeActor(
        Main.getEntity('pc'),
        Main.system.verifyPositionPC);

    Main.getEntity('dungeon').fov.compute(
        Main.getEntity('pc').Position.getX(),
        Main.getEntity('pc').Position.getY(),
        Main.getEntity('pc').Position.getRange(),
        (x, y) => { pcCanSee.push(x + ',' + y); });

    Main.system.placeActor(
        Main.getEntity('downstairs'),
        Main.system.verifyPositionDownstairs);

    for (let keyValue of Main.getEntity('orb')) {
        Main.system.placeActor(
            keyValue[1],
            Main.system.verifyPositionOrb);
    }

    // TODO: Change the number and type of enemies.
    let newGrunt = null;

    for (var i = 0; i < 30; i++) {
        newGrunt = Main.entity.dummy();

        Main.system.placeActor(
            newGrunt,
            Main.system.verifyPositionGrunt,
            pcCanSee);

        Main.getEntity('timer').scheduler.add(newGrunt, true);
    }
};

// Draw entities in this order:
//      Static UI elements, Dungeon, (Orbs, Downstairs, NPCs, PC), Marker.
//      NPCs & the PC can stand on the orb.
//      The marker is on the top layer.

// The moment to redraw the main screen is kinda messy. Please note these
// conditions are exclusive. Do not redraw the screen multiple times.
//      Press a development key with or without Shift.
//      Unlock the engine.
//      Enter or exit the examine mode.
//      Press any key in the examine mode.
//      Perform an invalid movement.
Main.screens.main.display = function () {
    Main.screens.drawBorder();
    Main.screens.drawVersion();
    Main.screens.drawHelp();
    Main.screens.drawBottomRight(Main.getEntity('seed').Seed.getPrintSeed());

    Main.screens.drawLevelName();
    Main.screens.drawPower();
    Main.screens.drawItemUnderYourFoot();

    Main.screens.drawDungeon();

    for (const keyValue of Main.getEntity('orb')) {
        Main.screens.drawActor(keyValue[1]);
    }

    Main.screens.drawDownstairs();

    for (const keyValue of Main.getEntity('npc')) {
        Main.screens.drawActor(keyValue[1]);
    }

    Main.screens.drawActor(Main.getEntity('pc'));
    Main.screens.drawActor(Main.getEntity('marker'));

    if (Main.screens.getCurrentMode() !== 'main') {
        Main.screens.drawDescription();
    } else {
        Main.screens.drawMessage();
    }

    Main.screens.drawModeLine();
};

Main.screens.main.keyInput = function (e) {
    let keyAction = Main.input.getAction;

    if (e.shiftKey) {
        if (keyAction(e, 'fixed') === 'develop') {
            Main.setDevelop();

            Main.display.clear();
            Main.screens.main.display();
        }
    } else if (keyAction(e, 'move')) {
        Main.system.move(keyAction(e, 'move'));
    } else if (keyAction(e, 'interact') === 'examine') {
        Main.system.examineMode();
    } else if (keyAction(e, 'interact') === 'pickOrUse') {
        Main.system.pcPickOrUse();
    } else if (keyAction(e, 'fixed') === 'seed') {
        console.log(Main.getEntity('seed').Seed.getSeed());
    } else if (Main.getDevelop()) {
        if (keyAction(e, 'fixed') === 'fov') {
            Main.getEntity('dungeon').Dungeon.setFov();
        } else if (keyAction(e, 'fixed') === 'turn') {
            console.log(Main.getEntity('timer').scheduler.getTime());
        } else if (keyAction(e, 'fixed') === 'dummy') {
            Main.getEntity('timer').scheduler.add(
                Main.entity.dummy(
                    Main.getEntity('pc').Position.getX() - 1,
                    Main.getEntity('pc').Position.getY()),
                true);
        } else if (keyAction(e, 'fixed') === 'addFire') {
            Main.getEntity('pc').Inventory.addItem('fire');
        } else if (keyAction(e, 'fixed') === 'addIce') {
            Main.getEntity('pc').Inventory.addItem('ice');
        } else if (keyAction(e, 'fixed') === 'addSlime') {
            Main.getEntity('pc').Inventory.addItem('slime');
        } else if (keyAction(e, 'fixed') === 'addLump') {
            Main.getEntity('pc').Inventory.addItem('lump');
        } else if (keyAction(e, 'fixed') === 'addArmor') {
            Main.getEntity('pc').Inventory.addItem('armor');
        } else if (keyAction(e, 'fixed') === 'addNuke') {
            Main.getEntity('pc').Inventory.addItem('nuke');
        } else if (keyAction(e, 'fixed') === 'removeOrb') {
            Main.getEntity('pc').Inventory.removeItem(1);
        }
        // Redraw the screen after pressing a development key.
        Main.display.clear();
        Main.screens.main.display();
    }

    // DO NOT redraw the screen here. Let action functions to decide themselves
    // when to redraw the screen.
    // Main.display.clear();
    // Main.screens.main.display();
};

// ====================
// The cut-scene screen
// ====================

Main.screens.cutScene = new Main.Screen('cutScene', ['main']);

Main.screens.cutScene.display = function () {
    Main.getEntity('message').Message.setModeline(
        Main.text.action('continue'));

    Main.screens.drawCutScene();
    Main.screens.drawModeLine();
    Main.screens.drawBottomRight(Main.text.ui('studio'));
};

Main.screens.cutScene.keyInput = function (e) {
    if (Main.input.getAction(e, 'fixed') === 'yes') {
        Main.system.exitCutScene();
    }
};
