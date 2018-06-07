'use strict';

// ====================
// The screen prototype
// ====================

Main.Screen = function (name, mode) {
    this._name = name || 'Unnamed Screen';
    this._mode = mode || 'main';
    this._modeLineText = '';
};

Main.Screen.prototype.getName = function () { return this._name; };
Main.Screen.prototype.getMode = function () { return this._mode; };
Main.Screen.prototype.getText = function () { return this._modeLineText; };

Main.Screen.prototype.setMode = function (mode, text) {
    this._mode = mode || 'main';
    this._modeLineText = Main.text.modeLine(this._mode) + (text || '');
};

Main.Screen.prototype.enter = function () {
    Main.screens._currentName = this.getName();
    Main.screens._currentMode = this.getMode();

    this.initialize(this.getName());
    this.display();
};

Main.Screen.prototype.exit = function () {
    Main.screens._currentName = null;
    Main.screens._currentMode = null;

    Main.display.clear();
};

Main.Screen.prototype.initialize = function (name) {
    Main.getDevelop() && console.log('Enter screen: ' + name + '.');
};

Main.Screen.prototype.display = function () {
    Main.display.drawText(1, 1, 'Testing screen');
    Main.display.drawText(1, 2, 'Name: ' + Main.screens._currentName);
    Main.display.drawText(1, 3, 'Mode: ' + Main.screens._currentMode);
};

Main.Screen.prototype.keyInput = function (e) {
    Main.getDevelop() && console.log('Key pressed: ' + e.key);
};

Main.screens = {};
Main.screens._currentName = null;
Main.screens._currentMode = null;

// ===========================
// Draw elements on the screen
// ===========================

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

    Main.getDevelop() && (version = Main.text.statusPanel('wizard') + version);
    Main.screens.drawAlignRight(Main.UI.status.getX(), Main.UI.status.getY(),
        Main.UI.status.getWidth(), version, 'grey');
};

Main.screens.drawSeed = function () {
    let seed = Main.getEntity('seed').Seed.getRawSeed();
    seed = seed.replace(/^(#{0,1}\d{5})(\d{5})$/, '$1-$2');

    Main.screens.drawBottomRight(seed);
};

Main.screens.drawModeLine = function () {
    Main.screens.drawBottomLeft(
        Main.getEntity('message').Message.getModeline());
};

Main.screens.drawBottomRight = function (text) {
    Main.screens.drawAlignRight(
        Main.UI.status.getX(),
        Main.UI.status.getY() + Main.UI.status.getHeight() - 1,
        Main.UI.status.getWidth(),
        text, 'grey');
};

Main.screens.drawBottomLeft = function (text) {
    Main.display.drawText(
        Main.UI.modeline.getX(),
        Main.UI.modeline.getY(),
        text);
};

// The text cannot be longer than the width of message block.
Main.screens.drawMessage = function (text) {
    let msgList = Main.getEntity('message').Message.getMsgList();
    let x = Main.UI.message.getX();
    let y = Main.UI.message.getY();

    text && msgList.push(text);
    while (msgList.length > Main.UI.message.getHeight()) {
        msgList.shift();
    }
    y += Main.UI.message.getHeight() - msgList.length;

    for (let i = 0; i < msgList.length; i++) {
        Main.display.drawText(x, y + i, msgList[i]);
    }
};

Main.screens.drawDungeon = function () {
    let dungeon = Main.getEntity('dungeon');
    let memory = dungeon.Dungeon.getMemory();
    let pcX = Main.getEntity('pc').Position.getX();
    let pcY = Main.getEntity('pc').Position.getY();
    let sight = Main.getEntity('pc').Position.getSight();

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
            memory.indexOf(x + ',' + y) < 0 && memory.push(x + ',' + y);
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
        dungeon.fov.compute(pc.getX(), pc.getY(), pc.getSight(),
            function (x, y) {
                if (x === actorX && y === actorY) {
                    drawThis = true;
                }
            });
    } else {
        drawThis = true;
    }

    drawThis && Main.display.draw(
        actorX + Main.UI.dungeon.getX() + dungeon.Dungeon.getPadding(),
        actorY + Main.UI.dungeon.getY() + dungeon.Dungeon.getPadding(),
        actor.Display.getCharacter(), actor.Display.getColor());
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
    enhance && Main.display.drawText(
        Main.UI.power.getX(),
        Main.UI.power.getY(),
        Main.text.statusPanel('enhance'));
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
    Main.screens.drawBottomLeft(Main.text.hint('continue'));
    Main.screens.drawBottomRight(Main.text.statusPanel('studio'));
};
