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
    text.get('dungeon').set('downstairsIcon', '>');
    text.get('dungeon').set('downstairs', 'Downstairs');
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
    text.get('ui').set('examine', 'Ex');
    text.get('ui').set('aim', 'Aim');
    text.get('ui').set('range', 'Range: %%');

    // Prompt the player to do something. Report the reaction to PC or NPC's
    // action.
    text.set('action', new Map());
    text.get('action').set('continue', 'Press Space to continue.');
    text.get('action').set('end', '=====The End=====');
    text.get('action').set('pick', 'You pick up the %% Orb.');

    text.get('action').set('deathGeneral', 'Rest in peace, ashen one.');
    text.get('action').set('deathBoss1',
        'Ashen one, hearest thou my voice, still?');

    // NPC's names
    text.set('name', new Map());
    text.get('name').set('dummy', 'Dummy');

    // Describe the NPC, item or building under the marker.
    text.set('info', new Map());
    text.get('info').set('dummy', 'This is a dummy.'
        + ' It has 1 hit point.'
        + ' It drops 1 Slime Orb when killed.');

    text.get('info').set('fire', 'Melee. 100% drop rate.');
    text.get('info').set('ice', 'Range 2, freeze for 2 turns. 60% drop rate.');
    text.get('info').set('slime', 'Range 2, teleport yourself.');
    text.get('info').set('lump', 'Range 2. 60% drop rate.');

    text.get('info').set('downstairs1',
        'In the center of the dusty round pool, there stands a grotesque figure.'
        + ' His eyes fixed on the ground,'
        + ' and he carries an empty jar on the right shoulder.');
    text.get('info').set('downstairs2', 'Level 2 downstairs.');
    text.get('info').set('downstairs3', 'Level 3 downstairs.');
    text.get('info').set('downstairs4', 'Level 4 downstairs.');

    // Cut-scenes.
    text.set('scene', new Map());
    text.get('scene').set('enterLevel1',
        'You find yourself lying on the ground,'
        + ' like a nameless body in the morgue,'
        + ' who is unknown to death, nor known to life.'
        + ' Weeping and whispers echo in your mind.'
        + ' One of the voices is calling to you: come here, ashen one.');
    text.get('scene').set('beforeBossFight1',
        'A Shakespearean monologue by the boss.'
        + '\n\n Thou shalt not press Space to skip this screen.');
    text.get('scene').set('afterBossFight1', 'You win.');

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

Main.text.cutScene = function (id) {
    return Main.text.libraryMap.get('scene').get(id);
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

Main.text.pickUp = function (orb) {
    let text = Main.text.action('pick');

    text = text.replace('%%', Main.text.dungeon(orb));

    return text;
};

Main.text.downstairs = function () {
    // TODO: get the current level from the dungeon object.
    let dungeonLevel = 1;

    return Main.text.info('downstairs' + dungeonLevel);
};
