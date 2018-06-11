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
Main.getOrbColor = function () { return 'orange'; };

// ==============
// Initialization
// ==============

window.onload = function () {
    if (!ROT.isSupported()) {
        window.alert(Main.text.error('browser'));
        return;
    }
    document.getElementById('game').appendChild(Main.display.getContainer());
    Main.text.initialize();
    Main.entity.message();

    Main.display.clear();
    Main.screens.main.enter();
    //Main.screens.drawBlankCutScene();

    //window.localStorage.setItem('hello', 'world');
    //let myObj = window.localStorage.getItem('hello');
    //console.log(myObj);
};
