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
        ? '%c{' + Main.getColor(fgColor) + '}%b{'
        + Main.getColor(bgColor) + '}' + text + '%b{}%c{}'
        : '%c{' + Main.getColor(fgColor) + '}' + text + '%c{}';
};

Main.screens.drawAlignRight = function (x, y, width, text, color) {
    Main.display.drawText(
        x + width - text.length,
        y,
        color
            ? Main.screens.colorfulText(text, color)
            : text);
};

Main.screens.drawBorder = function () {
    let status = Main.UI.status;
    let dungeon = Main.UI.dungeon;

    for (let i = status.getY(); i < status.getHeight(); i++) {
        Main.display.draw(status.getX() - 1, i, '|');
    }
    for (let i = dungeon.getX(); i < dungeon.getWidth() + 1; i++) {
        Main.display.draw(i, dungeon.getY() + dungeon.getHeight(), '-');
    }
};

Main.screens.drawVersion = function () {
    let version = Main.getVersion();

    if (Main.getDevelop()) {
        version = Main.text.statusPanel('wizard') + version;
    }

    Main.screens.drawAlignRight(Main.UI.status.getX(), Main.UI.status.getY(),
        Main.UI.status.getWidth(), version, 'grey');
};

Main.screens.drawModeLine = function () {
    if (Main.getEntity('message').Message.getModeline()) {
        Main.display.drawText(
            Main.UI.modeline.getX(),
            Main.UI.modeline.getY(),
            Main.getEntity('message').Message.getModeline());
    }
};

Main.screens.drawBottomRight = function (text) {
    Main.screens.drawAlignRight(
        Main.UI.status.getX(),
        Main.UI.status.getY() + Main.UI.status.getHeight() - 1,
        Main.UI.status.getWidth(),
        text, 'grey');
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

Main.screens.drawDescription = function (top, bottom) {
    // The top text cannot be longer than 4 lines. The recommended length is 2 to
    // 3 lines.
    Main.display.drawText(
        Main.UI.message.getX(),
        Main.UI.message.getY(),
        top,
        Main.UI.message.getWidth());

    Main.display.drawText(
        Main.UI.message.getX(),
        Main.UI.message.getY() + Main.UI.message.getHeight() - 1,
        bottom);
};

Main.screens.drawDungeon = function () {
    let dungeon = Main.getEntity('dungeon');
    let memory = dungeon.Dungeon.getMemory();
    let pcX = Main.getEntity('pc').Position.getX();
    let pcY = Main.getEntity('pc').Position.getY();
    let sight = Main.getEntity('pc').Position.getRange();

    if (dungeon.Dungeon.getFov()) {
        if (memory.length > 0) {
            for (let i = 0; i < memory.length; i++) {
                drawWallAndFloor(
                    memory[i].split(',')[0],
                    memory[i].split(',')[1],
                    'grey');
            }
        }

        dungeon.fov.compute(pcX, pcY, sight, function (x, y) {
            if (memory.indexOf(x + ',' + y) < 0) {
                memory.push(x + ',' + y);
            }
            drawWallAndFloor(x, y, 'white');
        });
    } else {
        for (const keyValue of dungeon.Dungeon.getTerrain()) {
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
            x + Main.UI.dungeon.getX() + dungeon.Dungeon.getPadding(),
            y + Main.UI.dungeon.getY() + dungeon.Dungeon.getPadding(),
            Main.system.isFloor(x, y) ? '.' : '#',
            Main.getColor(color));
    }
};

Main.screens.drawActor = function (actor, noFov) {
    let drawThis = false;

    let dungeon = Main.getEntity('dungeon');
    let pc = Main.getEntity('pc').Position;
    let actorX = Number.parseInt(actor.Position.getX(), 10);
    let actorY = Number.parseInt(actor.Position.getY(), 10);

    if (!noFov && dungeon.Dungeon.getFov() && !Main.system.isPC(actor)) {
        dungeon.fov.compute(pc.getX(), pc.getY(), pc.getRange(),
            function (x, y) {
                if (x === actorX && y === actorY) {
                    drawThis = true;
                }
            });
    } else {
        drawThis = true;
    }

    if (drawThis) {
        Main.display.draw(
            actorX + Main.UI.dungeon.getX() + dungeon.Dungeon.getPadding(),
            actorY + Main.UI.dungeon.getY() + dungeon.Dungeon.getPadding(),
            actor.Display.getCharacter(),
            actor.Display.getColor());
    }
};

Main.screens.drawLevelName = function () {
    let levelName = Main.text.levelName('grave');

    Main.display.drawText(
        Main.UI.level.getX(),
        Main.UI.level.getY(),
        `${Main.text.statusPanel('stairs')} ${levelName}`);
};

Main.screens.drawPower = function () {
    let powers = [
        Main.text.orbName('fire'),
        Main.text.orbName('fire'),
        Main.text.orbName('ice'),
        Main.text.orbName('slime'),
        Main.text.orbName('ice'),
        Main.text.orbName('lump')
    ];
    let enhance = false;

    // Power orbs
    for (let i = 0; i < powers.length; i++) {
        Main.display.drawText(
            Main.UI.power.getX() + 2,
            Main.UI.power.getY() + i * 1.1,
            powers[i]);
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
            Main.text.statusPanel('enhance'));
    }
};

Main.screens.drawOrbOnTheGround = function () {
    let orb = 'slime';

    Main.display.drawText(
        Main.UI.ground.getX(),
        Main.UI.ground.getY(),
        orb
            ? Main.text.statusPanel('ground') + ' '
            + Main.screens.colorfulText(Main.text.orbName(orb), 'green')
            : Main.text.statusPanel('ground'));
};

Main.screens.drawHelp = function () {
    let helpKey = Main.input.keybind.get('fixed').get('help')[0];

    Main.screens.drawAlignRight(
        Main.UI.help.getX(),
        Main.UI.help.getY(),
        Main.UI.help.getWidth(),
        `${Main.text.statusPanel('help')} ${helpKey}`,
        'grey');
};

Main.screens.drawBlankCutScene = function () {
    Main.getEntity('message').Message.setModeline(Main.text.hint('continue'));

    Main.screens.drawModeLine();
    Main.screens.drawBottomRight(Main.text.statusPanel('studio'));
};
