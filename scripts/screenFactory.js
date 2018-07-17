'use strict';

// ====================
// The screen prototype
// ====================

Main.Screen = function (name, mode) {
    // Every screen has a specific name.
    this._name = name || 'Unnamed Screen';

    // Every screen has at least one `main` mode. There might be more modes like
    // `aim` or `examine`. The `main` mode should be the first element in the
    // list. Player's input --> change the mode --> draw different elements on
    // the screen.
    this._mode = mode || ['main'];
};

Main.Screen.prototype.getName = function () { return this._name; };
Main.Screen.prototype.getMode = function (index) { return this._mode[index]; };

Main.Screen.prototype.enter = function (doNotInitialize) {
    Main.screens.setCurrentName(this.getName());
    Main.screens.setCurrentMode(this.getMode(0));

    if (!doNotInitialize) {
        this.initialize(this.getName());
    }
    this.display();
};

Main.Screen.prototype.exit = function () {
    Main.screens.setCurrentName(null);
    Main.screens.setCurrentMode(null);

    Main.getEntity('message').Message.setModeline('');
    Main.display.clear();
};

Main.Screen.prototype.keyInput = function (e) {
    if (Main.getDevelop()) {
        console.log('Key pressed: ' + e.key);
    }
};

Main.Screen.prototype.initialize = function () {
    if (Main.getDevelop()) {
        console.log('Enter screen: ' + this._name + '.');
    }
};

Main.Screen.prototype.display = function () {
    Main.display.drawText(1, 1, 'Testing screen');
    Main.display.drawText(1, 2, 'Name: ' + Main.screens.getCurrentName());
    Main.display.drawText(1, 3, 'Mode: ' + Main.screens.getCurrentMode());
};

// =======================================
// The name and mode of the current screen
// =======================================

Main.screens = {};
Main.screens._currentName = null;
Main.screens._currentMode = null;

Main.screens.getCurrentName = function () { return this._currentName; };
Main.screens.getCurrentMode = function () { return this._currentMode; };

Main.screens.setCurrentName = function (name) {
    this._currentName = name;
};
Main.screens.setCurrentMode = function (mode) {
    this._currentMode = mode;
};

// ===============================================
// Helper functions to draw elements on the screen
// ===============================================

Main.screens.colorfulText = function (text, fgColor, bgColor) {
    return bgColor
        ? '%c{' + Main.getColor(fgColor) + '}'
        + '%b{' + Main.getColor(bgColor) + '}'
        + text + '%b{}%c{}'
        : '%c{' + Main.getColor(fgColor) + '}'
        + text + '%c{}';
};

Main.screens.drawAlignRight = function (x, y, text, width, color) {
    Main.display.drawText(
        x + width - text.length,
        y,
        color
            ? Main.screens.colorfulText(text, color)
            : text);
};

Main.screens.drawHighlightText = function (text) {
    // You can customize these data by passing arguments. I hardcode them for
    // convenience.
    let headLength = 1;
    let fullLength = 26;
    let fgColor = 'black';
    let bgColor = 'white';

    let tailLength = 0;
    let headString = '';
    let tailString = '';
    let fullString = '';

    tailLength = fullLength - headLength - text.length;

    headString = '#'.repeat(headLength);
    tailString = '#'.repeat(tailLength);

    fullString
        = Main.screens.colorfulText(headString, bgColor, bgColor)
        + Main.screens.colorfulText(text, fgColor, bgColor)
        + Main.screens.colorfulText(tailString, bgColor, bgColor)
        ;

    return fullString;
};

Main.screens.drawBorder = function () {
    // Dungeon | Status
    // ------- | Status
    // Message | Status

    for (let i = Main.UI.status.getY();
        i < Main.UI.status.getHeight();
        i++) {
        Main.display.draw(
            Main.UI.status.getX() - 1, i, '|');
    }

    for (let i = Main.UI.dungeon.getX();
        i < Main.UI.dungeon.getWidth() + 1;
        i++) {
        Main.display.draw(
            i, Main.UI.dungeon.getY() + Main.UI.dungeon.getHeight(), '-');
    }
};

Main.screens.drawVersion = function () {
    let version = '';

    if (Main.getDevelop()) {
        version = Main.text.ui('wizard') + Main.getVersion();
    } else {
        version = Main.getVersion();
    }

    Main.screens.drawAlignRight(
        Main.UI.status.getX(), Main.UI.status.getY(),
        version,
        Main.UI.status.getWidth(), 'grey');
};

Main.screens.drawModeLine = function () {
    if (Main.getEntity('message').Message.getModeline()) {
        Main.display.drawText(
            Main.UI.modeline.getX(), Main.UI.modeline.getY(),
            Main.getEntity('message').Message.getModeline());

        // If in the main screen, main mode, and the PC is alive, draw the
        // modeline text only once. Otherwise, draw the text every turn.
        if (Main.screens.getCurrentName() === 'main'
            && Main.screens.getCurrentMode() === 'main'
            && !Main.getEntity('pc').Inventory.getIsDead()
        ) {
            Main.getEntity('message').Message.setModeline('');
        }
    }
};

Main.screens.drawBottomRight = function (text) {
    Main.screens.drawAlignRight(
        Main.UI.status.getX(),
        Main.UI.status.getY() + Main.UI.status.getHeight() - 1,
        text,
        Main.UI.status.getWidth(), 'grey');
};

// The text cannot be longer than the width of message block.
Main.screens.drawMessage = function (text) {
    if (text) {
        Main.getEntity('message').Message.getMessage().push(text);
    }
    while (Main.getEntity('message').Message.getMessage().length
        > Main.UI.message.getHeight()) {
        Main.getEntity('message').Message.getMessage().shift();
    }

    for (let i = 0;
        i < Main.getEntity('message').Message.getMessage().length;
        i++) {
        Main.display.drawText(
            Main.UI.message.getX(),
            Main.UI.message.getY()
            + Main.UI.message.getHeight()
            - Main.getEntity('message').Message.getMessage().length
            + i,
            Main.getEntity('message').Message.getMessage()[i]);
    }
};

Main.screens.drawDescription = function () {
    let npcHere = Main.system.npcHere(
        Main.getEntity('marker').Position.getX(),
        Main.getEntity('marker').Position.getY());
    let downstairsHere = Main.system.downstairsHere(
        Main.getEntity('marker').Position.getX(),
        Main.getEntity('marker').Position.getY());
    let orbHere = Main.system.orbHere(
        Main.getEntity('marker').Position.getX(),
        Main.getEntity('marker').Position.getY());

    if (npcHere) {
        drawTextBlock(
            // Top line
            getTopLine(npcHere),
            // Bottom line
            Main.text.npcBottomDescription(downstairsHere, npcHere, orbHere));
    } else if (downstairsHere) {
        drawTextBlock(Main.text.downstairs(), '');
    } else if (orbHere) {
        drawTextBlock(Main.text.orbTopDescription(orbHere), '');
    } else {
        Main.screens.drawMessage();
    }

    // Helper functions.
    function getTopLine(actor) {
        let text = null;

        switch (actor.getEntityName()) {
            case 'gargoyle':
                text = Main.text.gargoyleDescription(actor);
                break;
            default:
                text = Main.text.info(npcHere.getEntityName());
        }

        return text;
    }

    function drawTextBlock(top, bottom) {
        Main.display.drawText(
            Main.UI.message.getX(),
            Main.UI.message.getY(),
            top,
            Main.UI.message.getWidth());

        Main.display.drawText(
            Main.UI.message.getX(),
            Main.UI.message.getY() + Main.UI.message.getHeight() - 1,
            bottom);
    }
};

Main.screens.drawDungeon = function () {
    let pcSight = Main.system.getActorSight(Main.getEntity('pc'));

    // Default: the fog of war is on.
    if (Main.getEntity('dungeon').Dungeon.getFov()) {
        // Draw walls and floors that the PC has seen before.
        if (Main.getEntity('dungeon').Dungeon.getMemory().length > 0) {
            for (let i = 0;
                i < Main.getEntity('dungeon').Dungeon.getMemory().length;
                i++) {
                drawWallAndFloor(
                    Main.getEntity('dungeon').Dungeon
                        .getMemory()[i].split(',')[0],
                    Main.getEntity('dungeon').Dungeon
                        .getMemory()[i].split(',')[1],
                    'grey');
            }
        }

        // Draw walls and floors in sight.
        pcSight.forEach((position) => {
            if (Main.getEntity('dungeon').Dungeon.getMemory().indexOf(position)
                > -1
            ) {
                drawWallAndFloor(
                    Number.parseInt(position.split(',')[0], 10),
                    Number.parseInt(position.split(',')[1], 10),
                    'white'
                );
            }
        });
    }
    // Wizard mode: the fog of war if off. Draw all walls and floors.
    else {
        for (const keyValue of Main.getEntity('dungeon').Dungeon.getTerrain()) {
            drawWallAndFloor(
                keyValue[0].split(',')[0],
                keyValue[0].split(',')[1],
                'white'
            );
        }
    }

    function drawWallAndFloor(x, y, color) {
        x = Number.parseInt(x, 10);
        y = Number.parseInt(y, 10);

        Main.display.draw(
            x + Main.UI.dungeon.getX()
            + Main.getEntity('dungeon').Dungeon.getPadding(),
            y + Main.UI.dungeon.getY()
            + Main.getEntity('dungeon').Dungeon.getPadding(),
            Main.system.isFloor(x, y) ? '.' : '#',
            Main.getColor(color));
    }
};

Main.screens.drawActor = function (actor, noFov) {
    let pcSight = Main.system.getActorSight(Main.getEntity('pc'));
    let drawThis = false;
    let color = null;

    // 1-3: Decide whether or not to draw the actor.
    if (// 1A: Force to draw this actor.
        noFov
        // 1B: Draw everything when the fog of war is off. But do not draw the
        // marker in the main mode.
        || !Main.getEntity('dungeon').Dungeon.getFov()
        && typeof actor.Position.getX() === 'number'
        && typeof actor.Position.getY() === 'number'
        // 1C: Always draw the PC.
        || Main.system.isPC(actor)
    ) {
        drawThis = true;
    } else {
        // 1D: Draw the actor if he is in PC's sight.
        if (pcSight.indexOf(
            actor.Position.getX() + ',' + actor.Position.getY())
            > -1
        ) {
            drawThis = true;
        }
    }

    if (drawThis) {
        // 2-3: Choose the color.
        if (Main.system.isPC(actor) && actor.Inventory.getIsDead()) {
            color = actor.Display.getColor('die');
        } else if (Main.system.downstairsHere(
            actor.Position.getX(), actor.Position.getY())
        ) {
            color = actor.Display.getDownstairsColor();
        } else if (Main.system.orbHere(
            actor.Position.getX(), actor.Position.getY())
        ) {
            color = actor.Display.getOrbColor();
        } else {
            color = actor.Display.getColor();
        }

        // 3-3: Draw the actor.
        Main.display.draw(
            // X
            Main.UI.dungeon.getX()
            + Main.getEntity('dungeon').Dungeon.getPadding()
            + actor.Position.getX(),
            // Y
            Main.UI.dungeon.getY()
            + Main.getEntity('dungeon').Dungeon.getPadding()
            + actor.Position.getY(),
            // Character
            actor.Display.getCharacter(),
            // Color
            Main.getColor(color)
        );
    }
};

Main.screens.drawDownstairs = function () {
    if (Main.getEntity('dungeon').Dungeon.getMemory()
        .indexOf(Main.getEntity('downstairs').Position.getX()
            + ',' + Main.getEntity('downstairs').Position.getY())
        > -1) {
        Main.screens.drawActor(Main.getEntity('downstairs'), true);
    } else {
        Main.screens.drawActor(Main.getEntity('downstairs'), false);
    }
};

Main.screens.drawLevelName = function () {
    let levelName = Main.text.dungeon('grave');

    Main.display.drawText(
        Main.UI.level.getX(),
        Main.UI.level.getY(),
        `${Main.text.dungeon('downstairsIcon')} ${levelName}`);
};

Main.screens.drawPCHitPoint = function () {
    Main.display.drawText(
        Main.UI.hitpoint.getX() + 2,
        Main.UI.hitpoint.getY(),
        Main.text.uiHitPoint());
};

Main.screens.drawPower = function () {
    let powers = Main.getEntity('pc').Inventory.getInventory();
    let enhance = false;

    // Power orbs
    for (let i = 0; i < powers.length; i++) {
        Main.display.drawText(
            Main.UI.power.getX() + 2,
            Main.UI.power.getY() + i * 1.1,
            Main.text.dungeon(powers[i]));
    }

    // HP bar
    for (let i = 0; i < 6; i++) {
        Main.display.drawText(
            Main.UI.power.getX() + Main.UI.power.getWidth() - 1,
            Main.UI.power.getY() + i * 1.1,
            (i + 1).toString(10));
    }

    // Star indicator
    if (enhance) {
        Main.display.drawText(
            Main.UI.power.getX(),
            Main.UI.power.getY(),
            Main.text.ui('enhance'));
    }
};

Main.screens.drawItemUnderYourFoot = function () {
    let itemFound = null;

    itemFound
        = Main.system.downstairsHere(
            Main.getEntity('pc').Position.getX(),
            Main.getEntity('pc').Position.getY())
        || Main.system.orbHere(
            Main.getEntity('pc').Position.getX(),
            Main.getEntity('pc').Position.getY());

    Main.display.drawText(
        Main.UI.ground.getX(),
        Main.UI.ground.getY(),
        itemFound
            ? Main.text.ui('ground') + ' '
            + Main.screens.colorfulText(Main.text.dungeon(
                itemFound.getEntityName()),
                itemFound.Display.getColor())
            : Main.text.ui('ground'));
};

Main.screens.drawEnemyList = function () {
    let enemyList = Main.system.countEnemiesInSight();
    let i = 0;

    for (let [key, value] of enemyList) {
        Main.display.drawText(
            Main.UI.enemy.getX() + 2,
            Main.UI.enemy.getY() + i,
            Main.screens.colorfulText(key + ': ' + value, 'orange')
        );
        i++;
    }
};

Main.screens.drawHelp = function () {
    let helpKey = Main.input.keybind.get('fixed').get('help')[0];

    Main.screens.drawAlignRight(
        Main.UI.help.getX(),
        Main.UI.help.getY(),
        `${Main.text.ui('help')} ${helpKey}`,
        Main.UI.help.getWidth(), 'grey');
};

Main.screens.drawCutScene = function () {
    let level = Main.getEntity('gameProgress').BossFight.getDungeonLevel();
    let bossFight = Main.getEntity('gameProgress').BossFight.getBossFightStatus();
    let text = '';

    switch (bossFight) {
        case 'inactive':
            text = Main.text.cutScene('enterLevel' + level);
            break;
        case 'active':
            text = Main.text.cutScene('beforeBossFight' + level);
            break;
    }

    Main.display.drawText(
        Main.UI.cutScene.getX(),
        Main.UI.cutScene.getY(),
        text,
        Main.UI.cutScene.getWidth()
    );
};

Main.screens.drawKeyBindings = function () {
    Main.display.drawText(
        Main.UI.cutScene.getX(),
        Main.UI.cutScene.getY() - 1.5,
        Main.text.help('keyBindings'),
        Main.UI.cutScene.getWidth()
    );
};
