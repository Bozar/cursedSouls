'use strict';

// ================================================
// Version number, development switch, seed & color
// ================================================

var Main = {};
Main._version = '0.1.0';
Main._develop = true;

Main.getVersion = function () { return this._version; };
Main.getDevelop = function () { return this._develop; };

Main.setDevelop = function () { this._develop = !this._develop; };

// Set seed manually for testing. '#' can be omitted.
// There are no hyphens ('-') inside numbered seed.
// Example:
// Main._devSeed = '#12345';
Main.getDevSeed = function () { return this._devSeed; };

Main._color = new Map();
Main._color.set('white', '#ABB2BF');
Main._color.set('black', '#262626');
Main._color.set('grey', '#666666');
Main._color.set('orange', '#FF9900');
Main._color.set('green', '#A0D86C');

Main.getColor = function (color) {
    if (Main._color.get(color)) {
        return Main._color.get(color);
    }
    return color;
};

Main._log = {};
Main._log.seedPrinted = false;
Main._log.msgPrinted = false;
Main._log.floor = null;
Main._log.cycle = null;
Main._log.retry = [];
Main._log.enemyCount = null;
Main._log.enemyComposition = [];

// ==============
// Initialization
// ==============

window.onload = function () {
    let errorText = null;

    Main.text.initialize();
    Main.entity.message();
    document.getElementById('game').appendChild(Main.display.getContainer());

    if (!ROT.isSupported()) {
        errorText = Main.text.error('browser')
    }

    if (errorText) {
        Main.display.drawText(
            Main.UI.cutScene.getX(),
            Main.UI.cutScene.getY(),
            errorText,
            Main.UI.cutScene.getWidth()
        );
        return;
    }

    Main.display.clear();

    if (Main.getDevelop()) {
        Main.screens.main.enter();
        Main.input.listenEvent('add', 'main');
    } else {
        Main.screens.cutScene.enter();
        Main.input.listenEvent('add', 'cutScene');
    }
};
