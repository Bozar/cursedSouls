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

Main.Screen.prototype.enter = function () {
    Main.screens.setCurrentName(this.getName());
    Main.screens.setCurrentMode(this.getMode(0));

    this.initialize(this.getName());
    this.display();
};

Main.Screen.prototype.exit = function () {
    Main.screens.setCurrentName(null);
    Main.screens.setCurrentMode(null);

    Main.display.clear();
};

Main.Screen.prototype.keyInput = function (e) {
    if (Main.getDevelop()) {
        console.log('Key pressed: ' + e.key);
    }
};

Main.Screen.prototype.initialize = function (name) {
    if (Main.getDevelop()) {
        console.log('Enter screen: ' + name + '.');
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

        // In the main screen (main mode), draw the modeline text only once.
        // Otherwise, draw the text every turn.
        if (Main.screens.getCurrentName() === 'main'
            && Main.screens.getCurrentMode() === 'main') {
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
    let orbHere = Main.system.orbHere(
        Main.getEntity('marker').Position.getX(),
        Main.getEntity('marker').Position.getY());

    if (npcHere) {
        drawTextBlock(
            // Top line
            Main.text.info(npcHere.getEntityName()),
            // Bottom line
            '[' + Main.text.name(npcHere.getEntityName())
            + '][' + Main.text.dungeon(npcHere.Inventory.getInventory(0))
            + '][' + npcHere.HitPoint.getHitPoint() + ']'
            + (orbHere
                ? '[@ ' + Main.screens.colorfulText(
                    Main.text.dungeon(orbHere.getEntityName()),
                    orbHere.Display.getColor()) + ']'
                : ''));
    } else if (orbHere) {
        drawTextBlock(
            '[' + Main.text.dungeon(orbHere.getEntityName()) + '] '
            + Main.text.info(orbHere.getEntityName()),
            '');
    } else {
        Main.screens.drawMessage();
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

        Main.getEntity('dungeon').fov.compute(
            Main.getEntity('pc').Position.getX(),
            Main.getEntity('pc').Position.getY(),
            Main.getEntity('pc').Position.getRange(),
            function (x, y) {
                // Remember walls and floors in sight.
                if (Main.getEntity('dungeon').Dungeon
                    .getMemory().indexOf(x + ',' + y) < 0) {
                    Main.getEntity('dungeon').Dungeon
                        .getMemory().push(x + ',' + y);
                }
                // Draw walls and floors in sight.
                drawWallAndFloor(x, y, 'white');
            });
    }
    // Wizard mode: the fog of war if off. Draw all walls and floors.
    else {
        for (const keyValue of Main.getEntity('dungeon').Dungeon.getTerrain()) {
            drawWallAndFloor(
                keyValue[0].split(',')[0],
                keyValue[0].split(',')[1],
                'white');
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
    let drawThis = false;
    let color = null;

    if (// Force to draw this actor.
        noFov
        // Switch the fog of war in wizard mode.
        || !Main.getEntity('dungeon').Dungeon.getFov()
        // Always draw the PC.
        || Main.system.isPC(actor)) {
        drawThis = true;
    } else {
        // Draw the actor if he is in PC's sight.
        Main.getEntity('dungeon').fov.compute(
            Main.getEntity('pc').Position.getX(),
            Main.getEntity('pc').Position.getY(),
            Main.getEntity('pc').Position.getRange(),
            function (x, y) {
                if (x === Number.parseInt(actor.Position.getX(), 10)
                    && y === Number.parseInt(actor.Position.getY(), 10)) {
                    drawThis = true;
                }
            });
    }

    if (drawThis) {
        if (!Main.system.isMarker(actor)
            && Main.system.orbHere(
                actor.Position.getX(), actor.Position.getY())) {
            color = actor.Display.getAltColor();
        } else {
            color = actor.Display.getColor();
        }

        Main.display.draw(
            // X
            Main.UI.dungeon.getX()
            + Main.getEntity('dungeon').Dungeon.getPadding()
            + Number.parseInt(actor.Position.getX(), 10),
            // Y
            Main.UI.dungeon.getY()
            + Main.getEntity('dungeon').Dungeon.getPadding()
            + Number.parseInt(actor.Position.getY(), 10),
            // Character
            actor.Display.getCharacter(),
            // Color
            color);
    }
};

Main.screens.drawLevelName = function () {
    let levelName = Main.text.dungeon('grave');

    Main.display.drawText(
        Main.UI.level.getX(),
        Main.UI.level.getY(),
        `${Main.text.dungeon('stairs')} ${levelName}`);
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
            Main.UI.power.getX() + 9,
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

Main.screens.drawOrbUnderYourFoot = function () {
    let orbName = '';
    let orbColor = null;

    for (let keyValue of Main.getEntity('orb')) {
        if (
            // The first two conditions are necessary to avoid a bug.
            keyValue[1].Position.getX() >= 0
            && keyValue[1].Position.getY() >= 0
            && keyValue[1].Position.getX()
            === Main.getEntity('pc').Position.getX()
            && keyValue[1].Position.getY()
            === Main.getEntity('pc').Position.getY()) {
            // Update the orbName.
            orbName = keyValue[1].getEntityName();
            orbColor = keyValue[1].Display.getColor();
            break;
        }
    }

    Main.display.drawText(
        Main.UI.ground.getX(),
        Main.UI.ground.getY(),
        orbName
            ? Main.text.ui('ground') + ' '
            + Main.screens.colorfulText(Main.text.dungeon(orbName),
                orbColor)
            : Main.text.ui('ground'));
};

Main.screens.drawHelp = function () {
    let helpKey = Main.input.keybind.get('fixed').get('help')[0];

    Main.screens.drawAlignRight(
        Main.UI.help.getX(),
        Main.UI.help.getY(),
        `${Main.text.ui('help')} ${helpKey}`,
        Main.UI.help.getWidth(), 'grey');
};

Main.screens.drawBlankCutScene = function () {
    Main.getEntity('message').Message.setModeline(Main.text.action('continue'));

    Main.screens.drawModeLine();
    Main.screens.drawBottomRight(Main.text.ui('studio'));
};
