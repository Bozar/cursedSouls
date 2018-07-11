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
    text.get('dungeon').set('grave', 'Churchyard');

    text.get('dungeon').set('fire', 'Fire');
    text.get('dungeon').set('ice', 'Ice');
    text.get('dungeon').set('slime', 'Slime');
    // text.get('dungeon').set('candy', 'Candy');
    // LSP: Yay, it's me, babe.
    text.get('dungeon').set('lump', 'Lump');
    text.get('dungeon').set('armor', 'Icy Armor');
    text.get('dungeon').set('nuke', 'Nuke');

    // UI elements outside the dungeon section
    text.set('ui', new Map());
    text.get('ui').set('wizard', 'Wiz|');
    text.get('ui').set('help', 'Help:');
    text.get('ui').set('studio', 'Red Tabby Studio');

    text.get('ui').set('enhance', '*');
    text.get('ui').set('hp', 'HP: %%');
    text.get('ui').set('dead', 'Dead');
    text.get('ui').set('ground', '@');

    text.get('ui').set('examine', 'Ex');
    text.get('ui').set('aim', 'Aim');
    text.get('ui').set('range', 'Range: %%');

    // Prompt the player to do something. Report the reaction to PC or NPC's
    // action.
    text.set('action', new Map());
    text.get('action').set('continue', 'Press Space to continue.');
    text.get('action').set('range', 'Out of range!');

    text.get('action').set('pick', 'You pick up the %% Orb.');
    text.get('action').set('teleport', 'You teleport yourself.');
    text.get('action').set('armor', 'You are protected with the Icy Armor.');

    text.get('action').set('hit', 'You hit the %%.');
    text.get('action').set('kill', 'You kill the %%.');

    text.get('action').set('breakTail',
        'You chop off the Tower Gargoyle\'s tail!');

    text.get('action').set('drop', 'The %1% drops %2% %3% Orb.');
    text.get('action').set('npcHit', 'The %% hits you.');
    text.get('action').set('npcSummon', 'The %% summons its companion.');

    text.get('action').set('gargoyleThrust',
        'The Tower Gargoyle thrusts you with the halberd.');
    text.get('action').set('gargoyleBreathe', 'The %% breathes fire.');

    text.get('action').set('die', 'You die.');
    text.get('action').set('end', '===The End===');
    text.get('action').set('deathGeneral', 'Rest in peace, ashen one.');
    text.get('action').set('deathBoss1',
        'Ashen one, hearest thou my voice, still?');

    // NPC's names
    text.set('name', new Map());
    text.get('name').set('dummy', 'Dummy');

    text.get('name').set('rat', 'Rat');
    text.get('name').set('dog', 'Zombie Dog');
    text.get('name').set('raven', 'Raven');
    text.get('name').set('zombie', 'Zombie');
    text.get('name').set('archer', 'Skeleton Archer');

    text.get('name').set('gargoyle', 'Tower Gargoyle');
    text.get('name').set('juvenileGargoyle', 'Juvenile Tower Gargoyle');

    // Describe the NPC, item or building under the marker.
    text.set('info', new Map());
    text.get('info').set('dummy', 'This is a dummy.'
        + ' It has 1 hit point.'
        + ' It drops 1 Slime Orb when killed.');

    text.get('info').set('rat',
        'These filthy little bastards eat whatever they can find.'
        + ' But they are not a real threat unless you get yourself cornered.');
    text.get('info').set('dog',
        'Zombie dogs are zombie\'s best friends.'
        + ' They are good at shadowing far away preys'
        + ' and they know nothing about pain.');
    text.get('info').set('raven',
        'Ravens are cunning and mischievous.'
        + ' They fly quickly.'
        + ' They like hiding among the allies and pecking the victim.');
    text.get('info').set('zombie',
        'Zombies are zombie dog\'s best friends.'
        + ' Their skin is extraordinarily tough.'
        + ' You can easily outrun a zombie,'
        + ' but be ware of their loyal companions.');
    text.get('info').set('archer',
        'The restless guard and merciless killer,'
        + ' who is summoned from his long death,'
        + ' eliminates far away intruders in a straight line with one shot.');

    text.get('info').set('gargoyle',
        'The Tower Gargoyle moves slowly,'
        + ' but it can reach the enemy with the halberd.'
        + ' It breathes fire in which few can survive head on.'
        + ' %%'
    );
    text.get('info').set('juvenileGargoyle',
        'The Juvenile Tower Gargoyle breathes fire'
        + ' in which few can survive head on.'
    );
    text.get('info').set('gargoyleHasTail', 'Its tail is a stone axe.');
    text.get('info').set('gargoyleLoseTail', 'Its tail is chopped off.');

    text.get('info').set('fire', 'Range 1, damage 1. 100% drop rate.');
    text.get('info').set('ice',
        'Protect yourself with at most 2 layers of the Icy Armor.'
        + ' 60% drop rate.');
    text.get('info').set('slime', 'Range 2. Teleport yourself.');
    text.get('info').set('lump', 'Range 2, damage 1. 60% drop rate.');

    text.get('info').set('downstairs1',
        'In the center of the dusty round pool, there stands a grotesque figure.'
        + ' His eyes fix on the ground,'
        + ' %%'
    );

    text.get('info').set('downstairs1Inactive',
        'and he carries an empty jar on the right shoulder.');
    text.get('info').set('downstairs1Active',
        'and the blood is pouring out of the jar on his right shoulder.');
    text.get('info').set('downstairs1Win',
        'and the jar on his right shoulder is dripping blood.');

    text.get('info').set('downstairs2', 'Level 2 downstairs.');
    text.get('info').set('downstairs3', 'Level 3 downstairs.');
    text.get('info').set('downstairs4', 'Level 4 downstairs.');

    // Cut-scenes.
    text.set('scene', new Map());

    text.get('scene').set('enterLevel1',
        'You wake up in an open grave,'
        + ' like a nameless body in the morgue,'
        + ' who is unknown to death, nor known to life.'
        + ' Rats scatter as you climb out of the moist muddy bed.'
        + ' A raven that rests on the tombstone flies into the cloudy sky'
        + ' and circles around the bell tower.'
        + '\n\n'
        + 'Your skin withers and your throat burns like fire.'
        + ' You are certainly cursed. But by whom?'
        + ' Although you are alone in the churchyard,'
        + ' you can hear weeping and whisper in your mind.'
        + ' One of the voices is calling you: come down to me, ashen one.'
    );
    text.get('scene').set('beforeBossFight1',
        'At first, you think it is the trick of the light'
        + ' -- how can a statue change his position?'
        + ' Then you take another look and confirm that'
        + ' the grotesque stone figure is looking at you, with mouth wide open,'
        + ' as if crying in slience.'
        + ' Blood starts pouring out of the jar on his shoulder'
        + ' when the bell strikes.'
        + '\n\n'
        + 'You step back fearfully and raise your head'
        + ' to notice a giant beast swooping down from the bell tower.'
        + ' The Tower Gargoyle, holding the halberd in its right hand,'
        + ' lands heavily and lets out a thundering roar.'
        + ' Its skin has burnt scars and its tail,'
        + ' the end of which has the shape of an axe,'
        + ' nearly cuts you in half with a single whip.'
    );
    text.get('scene').set('afterBossFight1',
        'You follow the source of the voices and push open the church door.'
        + ' There is a hole on the ground, revealing a downward ramp,'
        + ' the bottom of which seems to be deeper than sea.'
        + ' Sharper than blade is the chilling wind cutting through your face.'
        + '\n\n\n'
        + '[WIP]You win. Press F5 to reload the page.[/WIP]'
    );

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
    let colorfulMode = '';
    let outOfRange = '';

    if (check.indexOf(mode) < 0) {
        mode = check[0];
    }

    if (mode === 'aim') {
        colorfulMode = Main.screens.colorfulText(Main.text.ui(mode), 'orange');

        if (!Main.system.insideOrbRange()) {
            outOfRange = `[${Main.screens.colorfulText(
                Main.text.action('range'), 'orange')}]`;
        }
    } else {
        colorfulMode = Main.text.ui(mode);
    }

    text = `[${colorfulMode}][${Main.text.ui('range')}]${outOfRange}`;
    text = text.replace('%%', Main.system.getDistance(
        Main.getEntity('pc'), Main.getEntity('marker')));

    return text;
};

Main.text.npcBottomDescription = function (downstairs, npc, orb) {
    let text = '';

    text += '[' + Main.text.name(npc.getEntityName()) + ']';
    text += '[' + Main.screens.colorfulText(
        Main.text.dungeon(npc.Inventory.getInventory(0)), 'white')
        //Main.text.dungeon(npcHere.Inventory.getInventory(0)), 'green')
        + ']';
    text += '[' + Main.screens.colorfulText(
        npc.HitPoint.getHitPoint(), 'white')
        //npcHere.HitPoint.getHitPoint(), 'orange')
        + ']' + itemUnderTheFoot();

    return text;

    function itemUnderTheFoot() {
        let entityHere = downstairs || orb || null;

        if (entityHere) {
            return '[@ ' + Main.screens.colorfulText(
                Main.text.dungeon(entityHere.getEntityName()),
                entityHere.Display.getColor()) + ']';
        }
        return '';
    }
};

Main.text.orbTopDescription = function (orb) {
    let text = '';

    text += '[' + Main.text.dungeon(orb.getEntityName()) + '] '
        + Main.text.info(orb.getEntityName());

    return text;
};

Main.text.pickUp = function (orb) {
    let text = Main.text.action('pick');

    text = text.replace('%%', Main.text.dungeon(orb));

    return text;
};

Main.text.hitTarget = function (target) {
    let text = Main.text.action('hit');

    text = text.replace('%%', Main.text.name(target.getEntityName()));

    return text;
};

Main.text.killTarget = function (target) {
    let text = Main.text.action('kill');

    text = text.replace('%%', Main.text.name(target.getEntityName()));

    return text;
};

Main.text.targetDropOrb = function (target, orb) {
    let text = Main.text.action('drop');

    text = text.replace('%1%', Main.text.name(target.getEntityName()));
    text = text.replace('%3%', Main.text.dungeon(orb.getEntityName()));

    if (orb.getEntityName() === 'ice') {
        text = text.replace('%2%', 'an');
    } else {
        text = text.replace('%2%', 'a');
    }

    return text;
};

Main.text.downstairs = function () {
    // Dungeon level: 1 to 4.
    let dungeonLevel = Main.getEntity('dungeon').BossFight.getDungeonLevel();
    // Progress: inactive, active, win.
    let progress = Main.getEntity('dungeon').BossFight.getBossFightStatus();
    // Text: the string with the placeholder '%%'.
    let text = Main.text.info('downstairs' + dungeonLevel);

    progress = progress.charAt(0).toUpperCase() + progress.slice(1);
    text = text.replace('%%', Main.text.info(
        'downstairs' + dungeonLevel + progress
    ));

    return text;
};

Main.text.npcHit = function (attacker) {
    let text = Main.text.action('npcHit');

    text = text.replace('%%', Main.text.name(attacker.getEntityName()));

    return text;
};

Main.text.npcSummon = function (actor) {
    let text = Main.text.action('npcSummon');

    text = text.replace('%%', Main.text.name(actor.getEntityName()));

    return text;
};

Main.text.lastWords = function () {
    let text = '';

    if (Main.getEntity('dungeon').BossFight.getBossFightStatus()
        === 'active') {
        text = Main.text.action('deathBoss'
            + Main.getEntity('dungeon').BossFight.getDungeonLevel());
    } else {
        text = Main.text.action('deathGeneral');
    }

    return text;
};

Main.text.uiHitPoint = function () {
    let hp = Main.getEntity('pc').Inventory.getLength();
    let text = Main.text.ui('hp');
    let dead = Main.screens.colorfulText(Main.text.ui('dead'), 'grey');

    if (hp < 4) {
        hp = Main.screens.colorfulText(hp, 'orange');
    }

    if (Main.getEntity('pc').Inventory.getIsDead()) {
        text = text.replace('%%', dead);
    } else {
        text = text.replace('%%', hp);
    }

    return text;
};

Main.text.gargoyleBreathe = function (actor) {
    let text = Main.text.action('gargoyleBreathe');

    text = text.replace('%%', Main.text.name(actor.getEntityName()));

    return text;
};

Main.text.gargoyleDescription = function (actor) {
    let text = Main.text.info('gargoyle');

    if (actor.CombatRole.getRole('hasTail')) {
        text = text.replace('%%', Main.text.info('gargoyleHasTail'));
    } else {
        text = text.replace('%%', Main.text.info('gargoyleLoseTail'));
    }

    return text;
};
