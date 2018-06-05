'use strict';

Main.text = {};

Main.text.levelName = function (id) {
    let text = new Map();

    text.set('grave', 'Graveyard');

    return text.get(id);
};

Main.text.orb = function (id) {
    let text = new Map();

    text.set('fire', 'Fire');
    text.set('ice', 'Ice');
    text.set('slime', 'Slime');
    // text.set('candy', 'Candy')
    // LSP: Yay, it's me, babe.
    text.set('lump', 'Lump');

    return text.get(id);
};

Main.text.statusPanel = function (id) {
    let text = new Map();

    text.set('level', '>');
    text.set('enhance', '*');
    text.set('ground', '@');
    text.set('help', 'Help:');

    return text.get(id);
};
