'use strict';

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

// ===============
// The main screen
// ===============

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

// =========
// UI blocks
// =========

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
