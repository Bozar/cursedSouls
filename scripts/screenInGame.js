'use strict';

// ===============
// The main screen
// ===============

Main.screens.main = new Main.Screen('main', ['main', 'examine', 'aim']);

// * Create & place entities (if necessacry) in this order:
//   Seed, Timer, Dungeon, Marker, (PC, NPCs, Downstairs, Orbs), Achievements.
// * The PC cannot stick to the wall.
// * No more than 5 NPCs can appear in the PC's sight.
// * Orbs cannot be generated on the downstairs.
Main.screens.main.initialize = function () {
    let pcCanSee = [];
    let eliteAndGrunt = [];

    // Seed.
    Main.entity.seed();
    Main.system.startRNG();

    // Timer.
    Main.entity.timer();
    Main.getEntity('timer').engine.start();

    // Dungeon & marker.
    Main.entity.dungeon();
    Main.entity.marker();

    // PC.
    Main.entity.pc();
    Main.system.fillInventory();

    Main.system.placeActor(
        Main.getEntity('pc'),
        Main.system.verifyPCPosition);

    pcCanSee = Main.system.getActorSight(Main.getEntity('pc'));

    Main.getEntity('timer').scheduler.add(Main.getEntity('pc'), true);

    // NPCs.
    eliteAndGrunt = Main.system.createEnemies();

    // Place elites.
    for (let i = 0; i < eliteAndGrunt[0].length; i++) {
        Main.system.placeActor(
            eliteAndGrunt[0][i],
            Main.system.verifyEnemyPosition,
            pcCanSee,
            true);

        Main.getEntity('timer').scheduler.add(eliteAndGrunt[0][i], true);
    }

    // Place grunts.
    for (let i = 0; i < eliteAndGrunt[1].length; i++) {
        Main.system.placeActor(
            eliteAndGrunt[1][i],
            Main.system.verifyEnemyPosition,
            pcCanSee,
            false);

        Main.getEntity('timer').scheduler.add(eliteAndGrunt[1][i], true);
    }

    // Downstairs.
    Main.entity.downstairs();

    Main.system.placeActor(
        Main.getEntity('downstairs'),
        Main.system.verifyDownstairsPosition);

    // Orbs.
    Main.system.createOrbs();

    for (let keyValue of Main.getEntity('orb')) {
        Main.system.placeActor(
            keyValue[1],
            Main.system.verifyOrbPosition);
    }

    // Achievements.
    Main.system.setAchievement();

    // Output the dungeon generation details.
    Main.system.printGenerationLog();
    // Delete the save.
    Main.system.deleteSave();
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
    // Update the terrain in the PC's sight.
    Main.system.pcRememberTerrain();

    Main.screens.drawBorder();
    Main.screens.drawVersion();
    Main.screens.drawHelp();
    Main.screens.drawBottomRight(Main.getEntity('seed').Seed.getPrintSeed());

    Main.screens.drawLevelName();
    Main.screens.drawPCHitPoint();
    Main.screens.drawPower();
    Main.screens.drawItemUnderYourFoot();
    Main.screens.drawEnemyList();
    Main.screens.drawDungeon();

    Main.getEntity('orb').forEach(
        (orb) => {
            Main.screens.drawActor(
                orb,
                Main.getEntity('gameProgress').BossFight.getBossFightStatus()
                !== 'inactive'
                || orb.Memory.getHasSeen()
            );
        }
    );

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
            Main.system.saveWizardMode();
            Main.system.printGenerationLog();

            Main.display.clear();
            Main.screens.main.display();
        } else if (keyAction(e, 'fastMove')) {
            Main.system.pcFastMove(true, keyAction(e, 'fastMove'));
        } else if (keyAction(e, 'fixed') === 'help') {
            Main.system.showHelp();
        } else if (Main.getDevelop()) {
            switch (keyAction(e, 'fixed')) {
                case 'clearStorage':
                    Main.system.clearStorage();
                    break;
            }
        }
    } else if (keyAction(e, 'move')) {
        Main.system.move(keyAction(e, 'move'));
    } else if (keyAction(e, 'interact') === 'examine') {
        Main.system.examineMode();
    } else if (keyAction(e, 'interact') === 'pickOrUse') {
        Main.system.pcPickOrUse();
    } else if (keyAction(e, 'fixed') === 'seed') {
        console.log(Main.getEntity('seed').Seed.getSeed());
    } else if (keyAction(e, 'fixed') === 'achievement') {
        Main.system.showAchievement();
    } else if (Main.getDevelop()) {
        switch (keyAction(e, 'fixed')) {
            case 'fov':
                Main.getEntity('dungeon').Dungeon.setFov();
                break;
            case 'turn':
                console.log(Main.getEntity('timer').scheduler.getTime());
                break;
            case 'teleport':
                Main.system.killAndTeleport();
                break;
            case 'dummy':
                Main.getEntity('timer').scheduler.add(
                    Main.entity.dummy(
                        Main.getEntity('pc').Position.getX() - 1,
                        Main.getEntity('pc').Position.getY()),
                    true
                );
                break;
            case 'addFire':
                Main.getEntity('pc').Inventory.addItem('fire');
                break;
            case 'addIce':
                Main.getEntity('pc').Inventory.addItem('ice');
                break;
            case 'addSlime':
                Main.getEntity('pc').Inventory.addItem('slime');
                break;
            case 'addLump':
                Main.getEntity('pc').Inventory.addItem('lump');
                break;
            case 'addArmor':
                Main.getEntity('pc').Inventory.addItem('armor');
                break;
            case 'addNuke':
                Main.getEntity('pc').Inventory.addItem('nuke');
                break;
            case 'removeOrb':
                Main.getEntity('pc').Inventory.removeItem(1);
                break;
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
    Main.getEntity('message').Message.setModeline(Main.text.action('continue'));

    Main.screens.drawCutScene();
    Main.screens.drawModeLine();
    Main.screens.drawBottomRight(Main.text.ui('studio'));
};

Main.screens.cutScene.keyInput = function (e) {
    if (Main.input.getAction(e, 'fixed') === 'yes') {
        Main.system.exitCutScene();
    }
};

// ====================
// The help screen
// ====================

Main.screens.help = new Main.Screen('help', ['main']);

Main.screens.help.display = function () {
    Main.getEntity('message').Message.setModeline(Main.text.action('exit'));

    Main.screens.drawKeyBindings();
    Main.screens.drawModeLine();
    Main.screens.drawBottomRight(Main.text.ui('studio'));
};

Main.screens.help.keyInput = function (e) {
    if (Main.input.getAction(e, 'fixed') === 'no') {
        Main.system.exitHelp();
    }
};

// ======================
// The achievement screen
// ======================

Main.screens.achievement = new Main.Screen('achievement', ['main']);

Main.screens.achievement.display = function () {
    Main.getEntity('message').Message.setModeline(Main.text.action('exit'));

    for (let i = 0; i < Main.UI.achievementLeft.getHeight(); i++) {
        Main.display.drawText(
            Main.UI.achievementLeft.getX(),
            Main.UI.achievementLeft.getY() + i,
            i > 0
                ? i.toString()
                : Main.screens.drawHighlightText('Bounty: Tower Gargoyle')
            //i.toString()
        );
    }

    Main.display.drawText(
        Main.UI.achievementLeft.getX() + Main.UI.achievementLeft.getWidth(),
        Main.UI.achievementLeft.getY(),
        '+'
    );

    for (let i = 1; i < Main.UI.achievementMiddle.getHeight(); i++) {
        Main.display.drawText(
            Main.UI.achievementMiddle.getX(),
            Main.UI.achievementMiddle.getY() + i,
            '|'
        );
    }
    for (let i = 0; i < Main.UI.achievementRight.getHeight(); i++) {
        Main.display.drawText(
            Main.UI.achievementRight.getX(),
            Main.UI.achievementRight.getY() + i,
            i.toString()
        );
    }

    Main.display.drawText(
        Main.UI.achievementRight.getX() + Main.UI.achievementRight.getWidth(),
        Main.UI.achievementRight.getY() + Main.UI.achievementRight.getHeight(),
        '+'
    );

    Main.screens.drawModeLine();
    Main.screens.drawBottomRight(Main.text.ui('studio'));
};

Main.screens.achievement.keyInput = function (e) {
    if (Main.input.getAction(e, 'fixed') === 'no') {
        Main.system.exitAchievement();
    }
};
