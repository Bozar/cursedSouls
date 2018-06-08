'use strict';

Main.text = {};

// ==========================
// Store all text in one map.
// ==========================

Main.text.libraryMap = null;

Main.text.initialize = function () {
    let text = new Map();

    // Buildings or items in the dungeon
    text.set('dungeon', new Map());
    text.get('dungeon').set('stairs', '>');
    text.get('dungeon').set('grave', 'Graveyard');

    text.get('dungeon').set('fire', 'Fire');
    text.get('dungeon').set('ice', 'Ice');
    text.get('dungeon').set('slime', 'Slime');
    // text.get('dungeon').set('candy', 'Candy');
    // LSP: Yay, it's me, babe.
    text.get('dungeon').set('lump', 'Lump');

    // UI elements outside the dungeon section
    text.set('ui', new Map());
    text.get('ui').set('enhance', '*');
    text.get('ui').set('ground', '@');
    text.get('ui').set('help', 'Help:');
    text.get('ui').set('wizard', 'Wiz|');
    text.get('ui').set('studio', 'Red Tabby Studio');
    text.get('ui').set('examine', 'Exm');
    text.get('ui').set('aim', 'Aim');
    text.get('ui').set('range', 'Range: %%');

    // Prompt the player to do something. Report the reaction to PC or NPC's
    // action.
    text.set('action', new Map());
    text.get('action').set('continue', 'Press Space to continue.');

    // NPC's names
    text.set('name', new Map());
    text.get('name').set('dummy', 'Dummy');

    // Describe the NPC, item or building under the marker.
    text.set('info', new Map());
    text.get('info').set('dummy', 'This is a dummy.'
        + ' It has 1 hit point.'
        + ' It drops 1 Slime Orb when killed.');

    Main.text.libraryMap = text;
};

// =================================
// Get static text from the library.
// =================================

Main.text.dungeon = function (id) {
    return Main.text.libraryMap.get('dungeon').get(id);
};

Main.text.ui = function (id) {
    return Main.text.libraryMap.get('ui').get(id);
};

Main.text.action = function (id) {
    return Main.text.libraryMap.get('action').get(id);
};

Main.text.name = function (id) {
    return Main.text.libraryMap.get('name').get(id);
};

Main.text.info = function (id) {
    return Main.text.libraryMap.get('info').get(id);
};

// ==========================
// Combine fragments of text.
// ==========================

Main.text.modeLine = function (mode) {
    let check = ['examine', 'aim'];
    let text = '';

    if (check.indexOf(mode) < 0) {
        mode = check[0];
    }

    text = `[${Main.text.ui(mode)}][${Main.text.ui('range')}]`;
    text = text.replace('%%', Main.system.getDistance(
        Main.getEntity('pc'), Main.getEntity('marker')));

    return text;
};
