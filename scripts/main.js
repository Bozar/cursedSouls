'use strict';

// ================================================
// Version number, development switch, seed & color
// ================================================

var Main = {};
Main._version = '0.0.1';
Main._develop = true;
Main.getVersion = function () { return this._version; };
Main.getDevelop = function () { return this._develop; };
Main.setDevelop = function () { this._develop = !this._develop; };

// Set seed manually for testing. '#' can be omitted.
// There are no hyphens ('-') inside numbered seed.
// Example:
// Main._devSeed = '#12345'
Main.getDevSeed = function () { return this._devSeed; };

Main._color = new Map();
Main._color.set('white', '#ABB2BF');
Main._color.set('black', '#262626');
Main._color.set('grey', '#666666');
Main._color.set('orange', '#FF9900');
Main._color.set('green', '#A0D86C');

Main.getColor = function (color) { return Main._color.get(color); };

// ======================================
// The position & size of screen elements
// ======================================

Main.UI = function (width, height) {
    this._width = width || null;
    this._height = height || null;

    this._x = null;
    this._y = null;
};

Main.UI.prototype.getWidth = function () { return this._width; };
Main.UI.prototype.getHeight = function () { return this._height; };
Main.UI.prototype.getX = function () { return this._x; };
Main.UI.prototype.getY = function () { return this._y; };

Main.UI.canvas = new Main.UI(70, 26);

Main.display = new ROT.Display({
    width: Main.UI.canvas.getWidth(),
    height: Main.UI.canvas.getHeight(),

    fg: Main.getColor('white'),
    bg: Main.getColor('black'),

    fontSize: 20,
    fontFamily: (function () {
        let family = 'dejavu sans mono';
        family += ', consolas';
        family += ', monospace';

        return family;
    }())
});

// ---------------
// The main screen
// ---------------
Main.UI.padTopBottom = 0.5;
Main.UI.padLeftRight = 1;
Main.UI.padModeStatus = 1;
Main.UI.padModeMessage = 0;
Main.UI.padMessageDungeon = 1;

Main.UI.status = new Main.UI(13, null);
Main.UI.status._height = Main.UI.canvas.getHeight()
    - Main.UI.padTopBottom * 2;
Main.UI.status._x = Main.UI.canvas.getWidth()
    - Main.UI.padLeftRight
    - Main.UI.status.getWidth();
Main.UI.status._y = Main.UI.padTopBottom;

Main.UI.modeline = new Main.UI(null, 1);
Main.UI.modeline._width = Main.UI.canvas.getWidth()
    - Main.UI.padLeftRight * 2
    - Main.UI.padModeStatus
    - Main.UI.status.getWidth();
Main.UI.modeline._x = Main.UI.padLeftRight;
Main.UI.modeline._y = Main.UI.canvas.getHeight()
    - Main.UI.padTopBottom
    - Main.UI.modeline.getHeight();

Main.UI.message = new Main.UI(Main.UI.modeline.getWidth(), 5);
Main.UI.message._x = Main.UI.modeline.getX();
Main.UI.message._y = Main.UI.modeline.getY()
    - Main.UI.padModeMessage
    - Main.UI.message.getHeight();

Main.UI.dungeon = new Main.UI(Main.UI.modeline.getWidth(), null);
Main.UI.dungeon._height = Main.UI.canvas.getHeight()
    - Main.UI.padTopBottom
    - Main.UI.padMessageDungeon
    - Main.UI.padModeMessage
    - Main.UI.modeline.getHeight()
    - Main.UI.message.getHeight();
// The dungeon size should be an integer.
Main.UI.dungeon._height = Math.floor(Main.UI.dungeon._height);
Main.UI.dungeon._x = Main.UI.padLeftRight;
Main.UI.dungeon._y = Main.UI.padTopBottom;

// ---------
// UI blocks
// ---------
Main.UI.level = new Main.UI(Main.UI.status.getWidth(), 1);
Main.UI.level._x = Main.UI.status.getX();
Main.UI.level._y = Main.UI.status.getY() + 2;

Main.UI.power = new Main.UI(Main.UI.status.getWidth(), 6);
Main.UI.power._x = Main.UI.status.getX();
Main.UI.power._y = Main.UI.level.getY() + 2;

Main.UI.ground = new Main.UI(Main.UI.status.getWidth(), 1);
Main.UI.ground._x = Main.UI.status.getX();
Main.UI.ground._y = Main.UI.power.getY()
    + Main.UI.power.getHeight() + 2;

Main.UI.help = new Main.UI(Main.UI.status.getWidth(), 1);
Main.UI.help._x = Main.UI.status.getX();
Main.UI.help._y = Main.UI.status.getY()
    + Main.UI.status.getHeight() - 2.5;

// ============
// Key-bindings
// ============

Main.input = {};
Main.input.keybind = new Map();
// [mode1: [keybind1], mode2: [keybind2], ...]
// keybind1 -> [action1: [key1_1, key1_2, ...],
//              action2: [key2_1, key2_2, ...], ...]

// Keys that cannot be remapped by player
Main.input.keybind.set('fixed', new Map());
Main.input.keybind.get('fixed').set('space', [' ']);
Main.input.keybind.get('fixed').set('esc', ['Escape']);
Main.input.keybind.get('fixed').set('help', ['?']);
Main.input.keybind.get('fixed').set('seed', ['=']);

// Development
Main.input.keybind.get('fixed').set('develop', ['~']);
Main.input.keybind.get('fixed').set('fov', [']']);
Main.input.keybind.get('fixed').set('turn', ['\\']);
Main.input.keybind.get('fixed').set('dummy', ['d']);

// Movement
Main.input.keybind.set('move', new Map());
Main.input.keybind.get('move').set('left', ['h', 'ArrowLeft']);
Main.input.keybind.get('move').set('down', ['j', 'ArrowDown']);
Main.input.keybind.get('move').set('up', ['k', 'ArrowUp']);
Main.input.keybind.get('move').set('right', ['l', 'ArrowRight']);
Main.input.keybind.get('move').set('wait', ['z', '.']);

// Interaction
Main.input.keybind.set('interact', new Map());
Main.input.keybind.get('interact').set('examine', ['x']);
Main.input.keybind.get('interact').set('lockNext', ['n', 'o', 'PageDown']);
Main.input.keybind.get('interact').set('lockPrevious', ['p', 'i', 'PageUp']);

Main.input.getAction = function (keyInput, mode) {
    if (!mode) {
        Main.getDevelop() && console.log('Undefined mode.');
        return null;
    }

    for (const [key, value] of Main.input.keybind.get(mode)) {
        if (value.indexOf(keyInput.key) > -1) {
            return key;
        }
    }
    return null;
};

Main.input.listenEvent = function (event, handler) {
    handler = Main.screens[String(handler)]
        ? Main.screens[handler].keyInput
        : handler;

    switch (event) {
        case 'add':
            window.addEventListener('keydown', handler);
            break;
        case 'remove':
            window.removeEventListener('keydown', handler);
            break;
    }
};

// =======================================================
// Screen factory: display content, listen keyboard events
// =======================================================

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

// ==================================
// In-game screens & helper functions
// ==================================

Main.screens = {};
Main.screens._currentName = null;
Main.screens._currentMode = null;

// ----------------
// Helper functions
// ----------------
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

    Main.getDevelop() && (version = 'Wiz|' + version);
    Main.screens.drawAlignRight(Main.UI.status.getX(), Main.UI.status.getY(),
        Main.UI.status.getWidth(), version, 'grey');
};

Main.screens.drawSeed = function () {
    let seed = Main.getEntity('seed').Seed.getRawSeed();
    seed = seed.replace(/^(#{0,1}\d{5})(\d{5})$/, '$1-$2');

    Main.screens.drawAlignRight(
        Main.UI.status.getX(),
        Main.UI.status.getY() + Main.UI.status.getHeight() - 1,
        Main.UI.status.getWidth(),
        seed, 'grey');
};

Main.screens.drawModeLine = function () {
    Main.display.drawText(Main.UI.modeline.getX(), Main.UI.modeline.getY(),
        Main.getEntity('message').Message.getModeline());
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
                drawTerrain(
                    memory[i].split(',')[0],
                    memory[i].split(',')[1],
                    'grey');
            }
        }

        dungeon.fov.compute(pcX, pcY, sight, function (x, y) {
            memory.indexOf(x + ',' + y) < 0 && memory.push(x + ',' + y);
            drawTerrain(x, y, 'white');
        });
    } else {
        for (const keyValue of dungeon.Dungeon.getTerrain()) {
            drawTerrain(
                keyValue[0].split(',')[0],
                keyValue[0].split(',')[1],
                'white');
        }
    }

    function drawTerrain(x, y, color) {
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
        dungeon.fov.compute(pc.getX(), pc.getY(), pc.getSight(), function (x, y) {
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
    let helpKey = '?';

    Main.screens.drawAlignRight(
        Main.UI.help.getX(),
        Main.UI.help.getY(),
        Main.UI.help.getWidth(),
        `${Main.text.statusPanel('help')} ${helpKey}`,
        'grey');
};

// ---------------
// In-game screens
// ---------------
Main.screens.main = new Main.Screen('main');

Main.screens.main.initialize = function () {
    Main.text.initialize();

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

// ==============
// Initialization
// ==============

window.onload = function () {
    if (!ROT.isSupported()) {
        window.alert(Main.text.error('browser'));
        return;
    }
    document.getElementById('game').appendChild(Main.display.getContainer());

    Main.display.clear();
    Main.screens.main.enter();

    //window.localStorage.setItem('hello', 'world');
    //let myObj = window.localStorage.getItem('hello');
    //console.log(myObj);
};
