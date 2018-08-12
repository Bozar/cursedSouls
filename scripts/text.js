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
    text.get('dungeon').set('level1', 'Churchyard');
    text.get('dungeon').set('level2', 'Cellar');
    text.get('dungeon').set('level3', 'Sanctum');

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
    text.get('ui').set('curse', 'x');
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
    text.get('action').set('exit', 'Press Esc to exit.');
    text.get('action').set('range', 'Out of range!');

    text.get('action').set('pick', 'You pick up the %% Orb.');
    text.get('action').set('teleport', 'You teleport yourself.');
    text.get('action').set('armor', 'You are protected with the Icy Armor.');

    text.get('action').set('hit', 'You hit the %%.');
    text.get('action').set('kill', 'You kill the %%.');
    text.get('action').set('removeCurse', 'You are purged.');

    text.get('action').set('unlockAchievement', 'Unlock: %%.');
    text.get('action').set('breakTail',
        'You chop off the Tower Gargoyle\'s tail!');

    text.get('action').set('drop', 'The %1% drops %2% %3% Orb.');
    text.get('action').set('npcHit', 'The %% hits you.');
    text.get('action').set('npcCurse', 'The %% curses you.');
    text.get('action').set('npcSummon', 'The %% summons its companion.');

    text.get('action').set('gargoyleThrust',
        'The Tower Gargoyle thrusts you with the halberd.');
    text.get('action').set('gargoyleBreathe', 'The %% breathes fire.');

    text.get('action').set('butcherPull', 'The Ravenous Butcher pulls you.');
    text.get('action').set('butcherCleave',
        'The Ravenous Butcher cleaves you.'
    );

    text.get('action').set('ghoulPunch', 'The Olympian Ghoul punches you.');

    text.get('action').set('setBomb', 'The %% set bombs around you.');
    text.get('action').set('bombExplode', 'The %% explodes.');
    text.get('action').set('freezeTime', 'You are frozen in time.');

    text.get('action').set('reviveGiovanni',
        [
            'You see sinners buried in the frozen lake.',
            'The vision quickly fades away...',
            'and it is time to begin the fight with Giovanni.'
        ]
    );

    text.get('action').set('save', 'Game saved.');
    text.get('action').set('closeOrReload',
        'Close the tab or press F5 to continue.'
    );
    text.get('action').set('useDownstairs',
        Main.screens.colorfulText(
            '[Interact with the donwstairs to proceed.]', 'green'
        )
    );

    text.get('action').set('die', 'You die.');
    text.get('action').set('end', '===The End===');
    text.get('action').set('deathGeneral', 'Rest in peace, ashen one.');

    text.get('action').set('deathBoss1',
        'Ashen one, hearest thou my voice, still?'
    );
    text.get('action').set('deathBoss2', 'You eventually stop thinking.');
    // The Divine Comedy, Purgatorio, V, Vintage classics
    // '...and there saw you a pool growing on the ground from your veins.'
    text.get('action').set('deathBoss3',
        '...a pool growing on the ground from your veins.'
    );

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

    text.get('name').set('wisp', 'Wisp');
    text.get('name').set('ratMan', 'Rat Man');
    text.get('name').set('cultist', 'Cultist');

    text.get('name').set('butcher', 'Ravenous Butcher');
    text.get('name').set('ghoul', 'Olympian Ghoul');

    text.get('name').set('timeBomb', 'Time Bomb');
    text.get('name').set('hpBomb', 'Remote Bomb');

    text.get('name').set('cursedRat', 'Cursed Rat');
    text.get('name').set('twinWisp', 'Twin Wisp');
    text.get('name').set('giovanni', 'Wise Giovanni');

    // Describe the NPC, item or building under the marker.
    text.set('info', new Map());

    // NPCs.
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
        + ' It breathes fire in which few can survive heads on.'
        + ' %%'
    );
    text.get('info').set('juvenileGargoyle',
        'The Juvenile Tower Gargoyle breathes fire'
        + ' in which few can survive head on.'
    );
    text.get('info').set('gargoyleHasTail', 'Its tail is a stone axe.');
    text.get('info').set('gargoyleLoseTail', 'Its tail is chopped off.');

    text.get('info').set('wisp',
        'You can hear these pale white wisps mumble in your head.'
        + ' They are eager to approach any living creature'
        + ' and spread their last bless.'
    );
    text.get('info').set('ratMan',
        'The Rat Man has not been accustomed to stand on two legs,'
        + ' but it has already leant to whip the rats around itself'
        + ' and farther away targets in the front.'
    );
    text.get('info').set('cultist',
        'The Cultist is a skinny man with a bone wand in his hand'
        + ' to shoot necro bolts which can curse or hurt the intruders.'
    );

    text.get('info').set('butcher',
        'The fatty\'s left hand is a hook'
        + ' which can be used to pull meat in a line.'
        + ' He helds the razor sharp cleaver in the right hand.'
        + ' Sometimes he needs to rest.'
    );
    text.get('info').set('ghoul',
        'The Olympian Ghoul wears nothing but a loincloth.'
        + ' His body seems perfect to mortal eyes,'
        + ' but still is a pathetic faker of Dio.'
        + ' He punches at lightning speed.'
    );

    text.get('info').set('cursedRat',
        'These cursed little bastards eat whatever they can find.'
        + ' But they are not a real threat unless you get yourself cornered.'
    );
    text.get('info').set('twinWisp',
        'You can hear two voices mumble in your head.'
        + ' These pale white wisps are eager to approach any living creature'
        + ' and spread their last bless.'
    );

    text.get('info').set('giovanni',
        'Wise Giovanni wears a purple robe and lives like a hermit.'
        + ' He clenches his left fist and raises the thumb.'
        + ' It seems he is about to press a button.'
    );

    text.get('info').set('timeBomb',
        'The second form of the Bomb.'
        + ' It can affect the world in a bizarre way.'
    );
    text.get('info').set('hpBomb', 'The first form of the Bomb.');

    // Orbs.
    text.get('info').set('fire', 'Range 1, damage 1. 100% drop rate.');
    text.get('info').set('ice',
        'Protect yourself with at most 2 layers of the Icy Armor.'
        + ' 60% drop rate.');
    text.get('info').set('slime', 'Range 2. Teleport yourself.');
    text.get('info').set('lump', 'Range 2, damage 1. 60% drop rate.');

    // Downstairs.
    text.get('info').set('downstairs1',
        'In the center of the dusty round pool, there stands a grotesque figure.'
        + ' His eyes fix on the ground,'
        + ' %%'
    );
    text.get('info').set('downstairs2',
        'This is an opened coffin on the ground,'
        + ' which is covered by spider webs.'
        + ' %%'
    );

    text.get('info').set('downstairs1Inactive',
        'and he carries an empty jar on the right shoulder.');
    text.get('info').set('downstairs1Active',
        'and blood is pouring out of the jar on his right shoulder.');
    text.get('info').set('downstairs1Win',
        'and the jar on his right shoulder is dripping blood.');

    text.get('info').set('downstairs2Inactive',
        'A dead body lies inside it.');
    text.get('info').set('downstairs2Active',
        'The coffin is empty and the web is intact.');
    text.get('info').set('downstairs2Win',
        'There are scratches around the coffin.');

    text.get('info').set('downstairs3',
        'Behind the ornate door there seems to be a study room.'
        + ' %%'
    );
    text.get('info').set('downstairs3Inactive',
        'You can hear someone talking inside.'
    );
    text.get('info').set('downstairs3Active', '');
    text.get('info').set('downstairs3Win', '');

    // The help screen.
    text.set('help', new Map());
    text.get('help').set('keyBindings',
        'Normal Mode:\n\n'
        + '* Move: '
        + Main.screens.colorfulText('Arrow keys', 'green') + ', '
        + Main.screens.colorfulText('hjkl', 'green') + '.\n'
        + '* Fast move: '
        + Main.screens.colorfulText('Shift + Movement keys', 'green') + '.\n'
        + '* Pick up an orb or interact with the downstairs: '
        + Main.screens.colorfulText('Space', 'green') + '.\n'
        + '* Wait 1 turn: '
        + Main.screens.colorfulText('z', 'green') + ', '
        + Main.screens.colorfulText('.(period)', 'green') + '.\n'
        + '* View achievements: '
        + Main.screens.colorfulText('a', 'green') + '.\n'
        + '* Help: '
        + Main.screens.colorfulText('?', 'green') + '.\n\n'
        + 'Examine Mode, Aim Mode:\n\n'
        + '* Enter the Examine Mode: '
        + Main.screens.colorfulText('x', 'green') + '.\n'
        + '* Enter the Aim Mode: '
        + Main.screens.colorfulText('Space', 'green') + '.\n'
        + '* Use the last orb (Aim Mode only): '
        + Main.screens.colorfulText('Space', 'green') + '.\n'
        + '* Lock the next target: '
        + Main.screens.colorfulText('PgDn', 'green') + ', '
        + Main.screens.colorfulText('n', 'green') + ', '
        + Main.screens.colorfulText('o', 'green') + '.\n'
        + '* Lock the previous target: '
        + Main.screens.colorfulText('PgUp', 'green') + ', '
        + Main.screens.colorfulText('p', 'green') + ', '
        + Main.screens.colorfulText('i', 'green') + '.\n'
        + '* Move the cursor: '
        + Main.screens.colorfulText('Arrow keys', 'green') + ', '
        + Main.screens.colorfulText('hjkl', 'green') + '.\n'
        + '* Exit to the Normal Mode: '
        + Main.screens.colorfulText('Esc', 'green') + '.\n\n\n'
        + 'Please read the '
        + Main.screens.colorfulText('README.md', 'green')
        + ' for more information.'
    );

    // The achievement screen.
    text.set('achievementLeft', new Map());
    text.get('achievementLeft').set('boss1Normal', 'Bounty: Tower Gargoyle');
    text.get('achievementLeft').set('boss1Special', 'Gargoyle Tail Axe');
    text.get('achievementLeft').set('boss2Normal', 'Bounty: Ravenous Butcher');
    text.get('achievementLeft').set('boss3Normal', 'Bounty: Olympian Ghoul');
    text.get('achievementLeft').set('boss3Special', 'Muda Muda Muda!');
    text.get('achievementLeft').set('boss4Normal', 'Bounty: Wise Giovanni');
    text.get('achievementLeft').set('boss4Special', 'Trinity');
    text.get('achievementLeft').set('noExamine', 'Readme Is For Noobs');
    text.get('achievementLeft').set('unlockAll', 'One Punch Man');

    text.set('achievementRight', new Map());
    text.get('achievementRight').set('locked', '[Locked]');
    text.get('achievementRight').set('unlocked', '[Unlocked]');

    text.get('achievementRight').set('boss1Normal', 'Beat Tower Gargoyle.');
    text.get('achievementRight').set('boss1Special',
        'Keep calm and don\'t roll back.'
    );
    text.get('achievementRight').set('boss2Normal', 'Beat Ravenous Butcher.');
    text.get('achievementRight').set('boss3Normal', 'Beat Olympian Ghoul.');
    text.get('achievementRight').set('boss3Special',
        'Beat Olympian Ghoul with three bump attacks.'
    );
    text.get('achievementRight').set('boss4Normal', 'Beat Wise Giovanni.');
    text.get('achievementRight').set('boss4Special',
        'Perform the Symbol SHattering Nuke against Wise Giovanni, that is,'
        + ' three consecutive attacks with three different orbs:'
        + ' Icy Armor, Fire and Lump.'
    );

    // Hats off, gentlemen. Here before you stands a TRUE player.
    // https://www.reddit.com/r/roguelikes/comments/3drjoz/rroguelikes_developer_ama_uunormal_and/ct8116x/
    text.get('achievementRight').set('noExamine',
        'You can beat Faster Than Light without pausing?'
        + ' Then surely you can pass one dungeon level'
        + ' without entering the Examine Mode.'
    );
    text.get('achievementRight').set('unlockAll', 'Unlock everything, Genos.');

    // Cut-scenes.
    text.set('cutScene', new Map());

    text.get('cutScene').set('enterLevel1',
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
    text.get('cutScene').set('beforeBossFight1',
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

    text.get('cutScene').set('enterLevel2',
        'You follow the source of the voices and push open the church door.'
        + ' There is a swirling downstairs on the side,'
        + ' leading to the bottom which seems to be deeper than sea.'
        + ' Sharper than blade is the chilling wind cutting through your face.'
        + '\n\n'
        + 'Ghostly pale flames dance on the torches.'
        + ' Rats with lash scars run away from you without a sound.'
        + ' Judging from the stew pot in the kitchen,'
        + ' someone still lives in the cellar.'
    );
    text.get('cutScene').set('beforeBossFight2',
        'The dungeon citizens are reluctant to get close to this place -'
        + ' an opened coffin covered with spider webs.'
        + ' Inside the coffin, there lies a dead man,'
        + ' who is tall, strong and handsome.'
        + ' You blink your eyes. At the next moment,'
        + ' the coffin is empty and the web remains unbroken.'
        + '\n\n'
        + 'Someone says behind you: "Even the evil needs an evil savior,'
        + ' so you are not allowed to bother our master."'
        + '\n\n'
        + 'You turn around and get bunched and fall on the ground.'
        + ' All these things happen at the exact same moment.'
    );

    text.get('cutScene').set('enterLevel3',
        'You pull the lever in the coffin.'
        + ' It slides aside and reveals a stone downstairs.'
        + ' The bottom level of the church is, or rather, used to be a sanctum.'
        + '\n\n'
        + 'Specimens are kept in transparent jars along the wall -'
        + ' small mammals, organs, humans, inhumans,'
        + ' and some other THINGS you cannot describe.'
        + ' If you stay here for too long,'
        + ' you will certainly be dronwed in the cursed sea'
        + ' and become one of them.'
    );
    text.get('cutScene').set('beforeBossFight3',
        'You hear a voice from behind the door.'
        + '\n\n'
        + '"Tutte quelle grida dolorose, che un\'orchestra meravigliosa."'
        + '\n'
        + '("All those painful cries, what a wonderful orchestra.")'
        + '\n\n'
        + '"Sii paziente, bellezza mia.'
        + ' Ecco che arriva il nostro ospite."'
        + '\n'
        + '("Be patient, my beauty. Here comes our guest.")'
        + '\n\n'
        + 'A man in purple robe walks out of the study.'
        + '\n\n'
        + ' "I just want to be a hermit. Is this too much to ask?"'
        + ' He stares at you and sighs. "Fear not, amico. It ends soon."'
    );

    text.get('cutScene').set('miniBoss1',
        [
            'You hear the sound of chopping from the corner.',
            'There is a fatty who raises the cleaver into the air.',
            'He pushes over the table upon seeing you.',
            '"Nosferatu rats! You won\'t escape this time!"',
            Main.screens.colorfulText('[Press Space to continue.]', 'green')
        ]
    );
    text.get('cutScene').set('miniBoss2',
        'The Ravenous Butcher charges at you.'
    );

    text.get('cutScene').set('youWin',
        'The study room is small and cozy.'
        + ' The walls were hung with blankets and candles burn bright.'
        + ' In addition to books, there is also a crystal skull on the shelf.'
        + ' Is it the other one that Giovanni was talking to?'
        + ' You cannot tell why but you feel that it is watching you.'
        + '\n\n'
        + ' On the desk there is an unfolded scroll,'
        + ' on which someone draws with black ink the two underground levels'
        + ' and a trap door leading to an even deeper tunnel system.'
        + '\n\n'
        + ' The dungeon is vast and infinite.'
        + '\n\n'
        + '\n\n'
        + '[You win. Thanks for playing the game.]'
    );

    // Error messages.
    text.set('error', new Map());
    text.get('error').set('browser',
        'Your browser dose not support the Rot.js.'
        + '\n\n'
        + 'Please use the lastest Chrome or Firefox.'
    );
    text.get('error').set('storage',
        'Please change your browser setting to save the game data locally.'
    );

    Main.text.libraryMap = text;
};

// =================================
// Get static text from the library.
// =================================

Main.text.staticTextList = [
    'dungeon',
    'ui',
    'action',
    'name',
    'info',
    'help',
    'achievementLeft',
    'achievementRight',
    'cutScene',
    'error'
];

Main.text.staticTextList.forEach((key) => {
    Main.text[key] = function (id) {
        return Main.text.libraryMap.get(key).get(id);
    };
});

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
            outOfRange = `[${
                Main.screens.colorfulText(
                    Main.text.action('range'), 'orange')
                }]`;
        }
    } else {
        colorfulMode = Main.text.ui(mode);
    }

    text = `[${colorfulMode}][${Main.text.ui('range')}]${outOfRange} `;
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
    let dungeonLevel = Main.getEntity('gameProgress').BossFight.getDungeonLevel();
    // Progress: inactive, active, win.
    let progress = Main.getEntity('gameProgress').BossFight.getBossFightStatus();
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

Main.text.npcCurse = function (attacker) {
    let text = Main.text.action('npcCurse');

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

    if (Main.getEntity('gameProgress').BossFight.getBossFightStatus()
        !== 'inactive') {
        text = Main.text.action('deathBoss'
            + Main.getEntity('gameProgress').BossFight.getDungeonLevel());
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

Main.text.unlockAchievement = function (achievement) {
    let text = Main.text.action('unlockAchievement');

    text = text.replace('%%', Main.screens.colorfulText(achievement, 'green'));

    return text;
};

Main.text.bombExplode = function (actor) {
    let text = Main.text.action('bombExplode');

    text = text.replace('%%', Main.text.name(actor.getEntityName()));

    return text;
};

Main.text.setBomb = function (actor) {
    let text = Main.text.action('setBomb');

    text = text.replace('%%', Main.text.name(actor.getEntityName()));

    return text;
};
