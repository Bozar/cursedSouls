'use strict';

Main.input = {};

// ============
// Key-bindings
// ============

Main.input.keybind = new Map();
// [mode1: [keybind1], mode2: [keybind2], ...]
// keybind1 -> [action1: [key1_1, key1_2, ...],
//              action2: [key2_1, key2_2, ...], ...]

// Keys that cannot be remapped by player
Main.input.keybind.set('fixed', new Map());
Main.input.keybind.get('fixed').set('yes', [' ']);
Main.input.keybind.get('fixed').set('no', ['Escape']);
Main.input.keybind.get('fixed').set('help', ['?']);
Main.input.keybind.get('fixed').set('seed', ['=']);
Main.input.keybind.get('fixed').set('clearStorage', ['D']);

// Development
Main.input.keybind.get('fixed').set('develop', ['~']);
Main.input.keybind.get('fixed').set('fov', [']']);
Main.input.keybind.get('fixed').set('turn', ['\\']);
Main.input.keybind.get('fixed').set('dummy', ['d']);
Main.input.keybind.get('fixed').set('teleport', ['0']);

Main.input.keybind.get('fixed').set('addFire', ['1']);
Main.input.keybind.get('fixed').set('addIce', ['2']);
Main.input.keybind.get('fixed').set('addSlime', ['3']);
Main.input.keybind.get('fixed').set('addLump', ['4']);
Main.input.keybind.get('fixed').set('addArmor', ['5']);
Main.input.keybind.get('fixed').set('addNuke', ['6']);
Main.input.keybind.get('fixed').set('removeOrb', ['-']);

// Movement
Main.input.keybind.set('move', new Map());
Main.input.keybind.get('move').set('left', ['h', 'ArrowLeft']);
Main.input.keybind.get('move').set('down', ['j', 'ArrowDown']);
Main.input.keybind.get('move').set('up', ['k', 'ArrowUp']);
Main.input.keybind.get('move').set('right', ['l', 'ArrowRight']);
Main.input.keybind.get('move').set('wait', ['z', '.']);

// Fast Movement
Main.input.keybind.set('fastMove', new Map());
Main.input.keybind.get('fastMove').set('left', ['H', 'ArrowLeft']);
Main.input.keybind.get('fastMove').set('down', ['J', 'ArrowDown']);
Main.input.keybind.get('fastMove').set('up', ['K', 'ArrowUp']);
Main.input.keybind.get('fastMove').set('right', ['L', 'ArrowRight']);

// Interaction
Main.input.keybind.set('interact', new Map());
Main.input.keybind.get('interact').set('examine', ['x']);
Main.input.keybind.get('interact').set('pickOrUse', [' ']);
Main.input.keybind.get('interact').set('next', ['n', 'o', 'PageDown']);
Main.input.keybind.get('interact').set('previous', ['p', 'i', 'PageUp']);

// ================
// Helper functions
// ================

Main.input.getAction = function (keyInput, mode) {
    if (!mode) {
        if (Main.getDevelop()) {
            console.log('Undefined mode.');
        }
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
