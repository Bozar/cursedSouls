'use strict';

Main.text = {};

// Store all text in one map.
Main.text.libraryMap = null;

Main.text.initialize = function () {
    let text = new Map();

    text.set('dungeon', new Map());
    text.get('dungeon').set('stairs', '>');
    text.get('dungeon').set('grave', 'Graveyard');

    text.set('item', new Map());
    text.get('item').set('fire', 'Fire');
    text.get('item').set('ice', 'Ice');
    text.get('item').set('slime', 'Slime');
    // text.set('candy', 'Candy')
    // LSP: Yay, it's me, babe.
    text.get('item').set('lump', 'Lump');

    text.set('ui', new Map());
    text.get('ui').set('enhance', '*');
    text.get('ui').set('ground', '@');
    text.get('ui').set('help', 'Help:');

    Main.text.libraryMap = text;
};

// Get text from the library.
Main.text.levelName = function (id) {
    return Main.text.libraryMap.get('dungeon').get(id);
};

Main.text.orbName = function (id) {
    return Main.text.libraryMap.get('item').get(id);
};

Main.text.statusPanel = function (id) {
    if (id === 'stairs') {
        return Main.text.libraryMap.get('dungeon').get(id);
    }
    return Main.text.libraryMap.get('ui').get(id);
};
