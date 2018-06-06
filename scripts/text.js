'use strict';

Main.text = {};

// Store all text in one map.
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

    // Prompt the player to do something. Report the reaction to PC or NPC's
    // action.
    text.set('action', new Map());
    text.get('action').set('continue', 'Press Space to continue.');

    Main.text.libraryMap = text;
};

// Get text from the library.
Main.text.levelName = function (id) {
    return Main.text.libraryMap.get('dungeon').get(id);
};

Main.text.orbName = function (id) {
    return Main.text.libraryMap.get('dungeon').get(id);
};

// UI elements that remain unchanged.
Main.text.statusPanel = function (id) {
    if (id === 'stairs') {
        return Main.text.libraryMap.get('dungeon').get(id);
    }
    return Main.text.libraryMap.get('ui').get(id);
};

Main.text.hint = function (id) {
    switch (id) {
        case 'continue':
            return Main.text.libraryMap.get('action').get(id);
    }
};
