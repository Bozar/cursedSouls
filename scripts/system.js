'use strict';

Main.system = {};

Main.system.isFloor = function (x, y) {
    return Main.getEntity('dungeon').Dungeon.getTerrain().get(x + ',' + y)
        === 0;
};

Main.system.placeActor = function (actor, notQualified, forbidden, isElite) {
    let x = null;
    let y = null;
    let retry = 0;
    let maxRetry = 999;

    do {
        x = Math.floor(
            Main.getEntity('dungeon').Dungeon.getWidth()
            * ROT.RNG.getUniform());
        y = Math.floor(
            Main.getEntity('dungeon').Dungeon.getHeight()
            * ROT.RNG.getUniform());
        retry++;
    }
    // Some notQualified callback functions require extra arguments:
    // * `forbidden` is a string array [x + ',' + y], so that they do not need to
    // calculate the forbidden zone every time when placing a new entity.
    // * `isElite` is a boolean value that is used to calculate the distance
    // between the PC and the NPC.
    while (notQualified(x, y, forbidden, isElite) && retry < maxRetry);

    if (retry > 10) {
        Main._log.retry.push(actor.getEntityName() + ': ' + retry);
    }

    if (retry >= maxRetry) {
        // Do not place the actor in an invalid place.
        return false;
    }

    actor.Position.setX(x);
    actor.Position.setY(y);

    return true;
};

Main.system.verifyPCPosition = function (x, y) {
    return !Main.system.isFloor(x, y)
        || x < Main.getEntity('pc').Position.getRange()
        || x > Main.getEntity('dungeon').Dungeon.getWidth()
        - Main.getEntity('pc').Position.getRange()
        || y < Main.getEntity('pc').Position.getRange()
        || y > Main.getEntity('dungeon').Dungeon.getHeight()
        - Main.getEntity('pc').Position.getRange();
};

Main.system.verifyOrbPosition = function (x, y) {
    return !Main.system.isFloor(x, y)
        || Main.system.getDistance([x, y], Main.getEntity('pc')) <= 2
        || Main.system.downstairsHere(x, y)
        || Main.system.orbHere(x, y);
};

Main.system.npcIsTooDense = function (x, y) {
    let surround = [];
    let count = 0;

    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            surround.push([x + i, y + j]);
        }
    }

    for (let i = 0; i < surround.length; i++) {
        if (Main.system.npcHere(...surround[i])) {
            count++;
        }
    }

    return count > 0;
};

Main.system.verifyEnemyPosition = function (x, y, pcSight, isElite) {
    return !Main.system.isFloor(x, y)
        || tooClose(x, y)
        || tooMany(x, y)
        || Main.system.npcIsTooDense(x, y)
        || Main.system.npcHere(x, y);

    function tooClose(x, y) {
        let isInsight = pcSight.indexOf(x + ',' + y) > -1;
        let isTooClose = null;
        let distance = null;

        // PC's sight range: 5.
        if (isElite) {
            distance = 8;
        } else {
            distance = 3;
        }

        isTooClose
            = Main.system.getDistance([x, y], Main.getEntity('pc')) <= distance;

        return isInsight && isTooClose;
    }

    function tooMany(x, y) {
        let number = 0;
        // 12 = 5 (PC's sight range) + 7 (NPC's extended sight range)
        let extendRange = 12;
        let countEnemies = null;

        // The new enemy can appear in the PC's sight only if there are no more
        // than 2 enemies who are already in the PC's extended sight.
        if (pcSight.indexOf(x + ',' + y) > -1) {
            countEnemies = Main.system.countEnemiesInSight(extendRange);
            countEnemies.forEach((value) => {
                number += value;
            });
        }

        return number > 2;
    }
};

Main.system.verifyDownstairsPosition = function (x, y) {
    return !Main.system.isFloor(x, y)
        || Main.system.pcHere(x, y)
        || floorInSight(x, y) < 36;

    // Helper functions.
    function floorInSight(x, y) {
        let floor = 0;

        Main.getEntity('dungeon').fov.compute(
            x, y,
            Main.getEntity('downstairs').Position.getRange(),
            (positionX, positionY) => {
                if (Main.system.isFloor(positionX, positionY)) {
                    floor++;
                }
            });

        return floor;
    }
};

Main.system.placeBoss = function (observer, target, distance) {
    // Observer: Calculate the sight base on the observer's position.
    // Target & Distance: Surround the target with a minimum distance.
    let inSight = Main.system.getActorSight(observer, 3);
    let x = null;
    let y = null;
    let newPosition = null;

    inSight = inSight.filter((position) => {
        x = Number.parseInt(position.split(',')[0], 10);
        y = Number.parseInt(position.split(',')[1], 10);

        return Main.system.isFloor(x, y)
            && !Main.system.npcHere(x, y)
            && !Main.system.pcHere(x, y)
            && Main.system.getDistance(target, [x, y]) > distance;
    });

    // This function is called when the PC stand on the downstairs and press
    // 'Space'. If the PC's sight range is 2, he can see at most 5 * 5 = 25
    // grids. However, there must be at least 36 grids around the downstairs, see
    // 'Main.system.verifyDownstairsPosition'. Therefore, pcSight cannot be
    // empty.

    newPosition = inSight[Math.floor(inSight.length * ROT.RNG.getUniform())];
    newPosition = [
        Number.parseInt(newPosition.split(',')[0], 10),
        Number.parseInt(newPosition.split(',')[1], 10)
    ];

    return newPosition;
};

Main.system.createOrbs = function () {
    // TODO: change the loop based on the dungeon level.
    let loop = 3;
    let orbsInherited = Main.system.loadOrbsOnTheGround();

    for (var i = 0; i < loop; i++) {
        Main.entity.orb('fire');
        Main.entity.orb('ice');
        Main.entity.orb('slime');
        Main.entity.orb('lump');
    }

    orbsInherited.forEach((orb) => {
        Main.entity.orb(orb);
    });
};

Main.system.createEnemies = function () {
    let enemyAmount = amount();
    // TODO: change the enemies base on the dungeon level.
    let enemyType = type(1);
    let elite = [];
    let grunt = [];

    // Lump1 & Lump2.
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < enemyAmount[i]; j++) {
            elite.push(Main.entity[enemyType[i]]());
        }
    }

    // Fire, Ice & Slime.
    for (let i = 2; i < enemyAmount.length; i++) {
        for (let j = 0; j < enemyAmount[i]; j++) {
            grunt.push(Main.entity[enemyType[i]]());
        }
    }

    return [elite, grunt];

    // Helper functions.
    function amount() {
        // 25 to 30 enemies on one level.
        let total = 25 + Math.floor(6 * ROT.RNG.getUniform());

        // Lump: 20%.
        let lump = Math.ceil(total * 0.2);
        // Fire & Ice: 50%.
        let fireAndIce = Math.ceil((total - lump) * 0.5);
        // Slime: 30%.
        let slime = total - lump - fireAndIce;

        let lump1 = Math.floor(lump * percent());
        let lump2 = lump - lump1;
        let fire = Math.floor(fireAndIce * percent());
        let ice = fireAndIce - fire;

        Main._log.enemyCount = total;
        Main._log.enemyComposition = [lump1, lump2, fire, ice, slime];

        return Main._log.enemyComposition;
    }

    function percent() {
        // 40% to 60%.
        return Math.floor(4 + 3 * ROT.RNG.getUniform()) / 10;
    }

    function type(dungeonLevel) {
        let lump1 = '';
        let lump2 = '';
        let fire = '';
        let ice = '';
        let slime = '';

        switch (dungeonLevel) {
            case 1:
                lump1 = 'archer';
                lump2 = 'zombie';
                fire = 'dog';
                ice = 'raven';
                slime = 'rat';
                break;
        }

        return [lump1, lump2, fire, ice, slime];
    }
};

Main.system.isPC = function (actor) {
    return actor.getID() === Main.getEntity('pc').getID();
};

Main.system.isMarker = function (checkThis) {
    return checkThis.getID() === Main.getEntity('marker').getID();
};

Main.system.isInSight = function (source, target) {
    let sight = Main.system.getActorSight(source);
    let targetX = null;
    let targetY = null;

    if (Array.isArray(target)) {
        targetX = target[0];
        targetY = target[1];
    } else {
        targetX = target.Position.getX();
        targetY = target.Position.getY();
    }

    return sight.indexOf(targetX + ',' + targetY) > -1;
};

Main.system.pcAct = function () {
    Main.getEntity('timer').engine.lock();

    if (this.FastMove.getStep() > 0) {
        Main.system.pcFastMove(false, this.FastMove.getDirection());
    } else {
        Main.input.listenEvent('add', 'main');
    }

    // Do NOT redraw the screen here. Let every action to decide the moment.
    // Main.display.clear();
    // Main.screens.main.display();
};

Main.system.pcTakeDamage = function (damage) {
    let pcIsDead
        = damage > Main.getEntity('pc').Inventory.getLength();

    Main.getEntity('pc').Inventory.removeItem(damage);
    Main.getEntity('pc').Inventory.setIsDead(pcIsDead);

    return pcIsDead;
};

// The hub function to handle the 'pickOrUse' key.
Main.system.pcPickOrUse = function () {
    if (Main.system.downstairsHere(
        Main.getEntity('pc').Position.getX(),
        Main.getEntity('pc').Position.getY())
        && Main.getEntity('gameProgress').BossFight.getBossFightStatus()
        !== 'active') {
        Main.system.pcUseDownstairs();
    } else if (Main.system.orbHere(
        Main.getEntity('pc').Position.getX(),
        Main.getEntity('pc').Position.getY())
        && Main.getEntity('pc').Inventory.getLength()
        < Main.getEntity('pc').Inventory.getCapacity()) {
        Main.system.pcPickUpOrb();
    } else if (Main.getEntity('pc').Inventory.getLength() > 0
        && Main.getEntity('pc').Inventory.getLastOrb() !== 'armor') {
        // Change mode: main --> aim.
        Main.screens.setCurrentMode(Main.screens.main.getMode(2));

        Main.system.examineMode();
    }
};

Main.system.pcPickUpOrb = function () {
    let orbHere = Main.system.orbHere(
        Main.getEntity('pc').Position.getX(),
        Main.getEntity('pc').Position.getY());

    Main.getEntity('pc').Inventory.addItem(
        orbHere.getEntityName());

    Main.getEntity('message').Message.pushMsg(
        Main.text.pickUp(orbHere.getEntityName()));

    Main.getEntity('orb').delete(orbHere.getID());

    Main.system.unlockEngine(
        Main.getEntity('pc').ActionDuration.getDuration());
};

Main.system.pcUseDownstairs = function () {
    let position = [];
    let newActor = null;

    switch (Main.getEntity('gameProgress').BossFight.getBossFightStatus()) {
        case 'inactive':
            Main.input.listenEvent('remove', 'main');
            Main.screens.main.exit();

            Main.getEntity('gameProgress').BossFight.goToNextBossFightStage();

            position = Main.system.placeBoss(
                Main.getEntity('downstairs'),
                Main.getEntity('pc'),
                2
            );
            newActor = Main.entity.gargoyle(position[0], position[1]);
            Main.getEntity('timer').scheduler.add(newActor, true, 2);

            Main.screens.cutScene.enter();
            Main.input.listenEvent('add', 'cutScene');

            break;
        case 'win':
            Main.input.listenEvent('remove', 'main');

            // TODO: Change these lines when the 2nd level is ready.
            let debug = 0;
            if (debug > 0) {
                Main.getEntity('gameProgress').BossFight.goToNextDungeonLevel();
                Main.system.saveDungeonLevel();
                Main.system.saveSeed();
                Main.system.saveInventory();
                Main.system.saveOrbsOnTheGround();
            }

            Main.system.checkAchNoExamine();

            Main.getEntity('message').Message.pushMsg(
                Main.text.action('save')
            );
            Main.getEntity('message').Message.pushMsg(
                Main.text.action('closeOrReload')
            );

            Main.display.clear();
            Main.screens.main.display();

            break;
    }
};

Main.system.move = function (direction, who) {
    let actor = who || Main.getEntity('pc');
    let x = actor.Position.getX();
    let y = actor.Position.getY();
    let newCoordinates = [];
    // `who` can be the marker, which takes no time to move.
    let duration = getDuration();
    let actorType = getActorType();
    let isMoveable = false;

    // Get new coordinates.
    if (direction !== 'wait') {
        newCoordinates = Main.system.getNewCoordinates([x, y], direction);
        x = newCoordinates[0];
        y = newCoordinates[1];
    }

    // Verify the new position.
    if (direction === 'wait') {
        isMoveable = true;
    } else {
        switch (actorType) {
            case 'pc':
                isMoveable
                    = Main.system.isFloor(x, y)
                    && !Main.system.npcHere(x, y);
                break;
            case 'npc':
                isMoveable
                    = Main.system.isFloor(x, y)
                    && !Main.system.pcHere(x, y)
                    && !Main.system.npcHere(x, y);
                break;
            case 'marker':
                isMoveable
                    = Main.system.isInSight(Main.getEntity('pc'), [x, y]);
                break;
        }
    }

    // Taking actions:
    //      Change the position & unlock the engine;
    //      PC bumps into the nearby target;
    //      Report invalid action.
    if (isMoveable) {
        actor.Position.setX(x);
        actor.Position.setY(y);

        // Press a movement key and results in a valid movement.
        if (actorType === 'pc') {
            Main.input.listenEvent('remove', 'main');
        }
        // End this turn if the actor is PC or NPC.
        if (actorType !== 'marker') {
            Main.system.unlockEngine(duration);
        }
    } else if (actorType === 'pc'
        && Main.system.npcHere(x, y)) {
        Main.system.pcAttack(Main.system.npcHere(x, y), 'base');
    }

    // Helper functions
    function getDuration() {
        return Main.system.isMarker(actor)
            ? null
            : actor.ActionDuration.getDuration('base');
    }

    function getActorType() {
        if (Main.system.isPC(actor)) {
            return 'pc';
        } else if (Main.system.isMarker(actor)) {
            return 'marker';
        }
        return 'npc';
    }
};

Main.system.unlockEngine = function (duration) {
    Main.getEntity('timer').scheduler.setDuration(duration);
    Main.getEntity('timer').engine.unlock();

    Main.display.clear();
    Main.screens.main.display();
};

Main.system.npcHere = function (x, y) {
    if (x >= 0 && y >= 0) {
        for (const keyValue of Main.getEntity('npc')) {
            if (x === keyValue[1].Position.getX()
                && y === keyValue[1].Position.getY()) {
                return keyValue[1];
            }
        }
    }
    return null;
};

Main.system.pcHere = function (x, y) {
    if (x >= 0 && y >= 0
        && x === Main.getEntity('pc').Position.getX()
        && y === Main.getEntity('pc').Position.getY()) {
        return Main.getEntity('pc');
    }
    return null;
};

Main.system.orbHere = function (x, y) {
    if (x >= 0 && y >= 0) {
        for (let keyValue of Main.getEntity('orb')) {
            if (
                x === keyValue[1].Position.getX()
                && y === keyValue[1].Position.getY()) {
                return keyValue[1];
            }
        }
    }
    return null;
};

Main.system.downstairsHere = function (x, y) {
    if (x >= 0 && y >= 0
        && x === Main.getEntity('downstairs').Position.getX()
        && y === Main.getEntity('downstairs').Position.getY()) {
        return Main.getEntity('downstairs');
    }
    return null;
};

Main.system.examineMode = function () {
    Main.input.listenEvent('remove', 'main');
    Main.input.listenEvent('add', examine);

    setOrRemoveMarker(true);

    return true;

    // ----------------
    // Helper functions
    // ----------------

    // The hub function to handle key inputs and call other functions.
    function examine(e) {
        // Exit the examine mode.
        if (Main.input.getAction(e, 'fixed') === 'no') {
            exitExamineOrAimMode(true);
        }
        // Move the marker.
        else if (Main.input.getAction(e, 'move')) {
            Main.system.move(Main.input.getAction(e, 'move'),
                Main.getEntity('marker'));
        }
        // Lock the previous or next target.
        else if (Main.input.getAction(e, 'interact') === 'next'
            || Main.input.getAction(e, 'interact') === 'previous') {
            lockTarget(Main.input.getAction(e, 'interact'));
        }
        // Use an orb.
        else if (Main.input.getAction(e, 'interact') === 'pickOrUse') {
            useOrbInTheInventory();
        }

        setExModeLine();
        Main.display.clear();
        Main.screens.main.display();
    }

    function setOrRemoveMarker(setMarker) {
        if (setMarker) {
            Main.getEntity('marker').Position.setX(
                Main.getEntity('pc').Position.getX());
            Main.getEntity('marker').Position.setY(
                Main.getEntity('pc').Position.getY());

            // Change mode: main --> examine.
            if (Main.screens.getCurrentMode() === 'main') {
                Main.screens.setCurrentMode(Main.screens.main.getMode(1));
            }
        } else {
            Main.getEntity('marker').Position.setX(null);
            Main.getEntity('marker').Position.setY(null);

            // Change mode: examine or aim --> main.
            Main.screens.setCurrentMode(Main.screens.main.getMode(0));
        }

        setExModeLine();
        Main.display.clear();
        Main.screens.main.display();
    }

    function exitExamineOrAimMode(addKey) {
        Main.input.listenEvent('remove', examine);
        if (addKey) {
            Main.input.listenEvent('add', 'main');
        }

        setOrRemoveMarker(false);
    }

    function lockTarget(who) {
        let targets = [];
        let left = [];
        let right = [];
        let lockIndex = null;

        // Store NPCs in sight in the `left` or `right` list.
        Main.getEntity('npc').forEach((value) => {
            if (Main.system.getDistance(Main.getEntity('pc'), value)
                <= Main.getEntity('pc').Position.getRange()
                && Main.system.isInSight(Main.getEntity('pc'), value)) {
                if (value.Position.getX()
                    < Main.getEntity('pc').Position.getX()) {
                    left.push(value);
                } else {
                    right.push(value);
                }
            }
        });

        // Sort targets on the right:
        //      Lesser x comes first.
        //      Lesser y comes first.
        right.sort((a, b) => {
            if (a.Position.getX() !== b.Position.getX()) {
                return a.Position.getX() - b.Position.getX();
            }
            return a.Position.getY() - b.Position.getY();
        });

        // Sort targets on the left:
        //      Greater x comes first.
        //      Lesser y comes first.
        left.sort((a, b) => {
            if (a.Position.getX() !== b.Position.getX()) {
                return -(a.Position.getX() - b.Position.getX());
            }
            return a.Position.getY() - b.Position.getY();
        });

        // Exit `lockTarget` if there are no targets in sight.
        targets = right.concat(left);
        if (targets.length < 1) {
            return false;
        }

        // Get the index of currently locked target.
        for (var i = 0; i < targets.length; i++) {
            if (Main.getEntity('marker').Position.getX()
                === targets[i].Position.getX()
                && Main.getEntity('marker').Position.getY()
                === targets[i].Position.getY()) {
                lockIndex = i;
                break;
            }
        }

        // Update the index. Prepare to lock another target.
        switch (who) {
            case 'next':
                if (lockIndex === null) {
                    lockIndex = 0;
                } else {
                    lockIndex = lockIndex + 1 > targets.length - 1
                        ? 0
                        : lockIndex + 1;
                }
                break;
            case 'previous':
                if (lockIndex === null) {
                    lockIndex = targets.length - 1;
                } else {
                    lockIndex = lockIndex - 1 < 0
                        ? targets.length - 1
                        : lockIndex - 1;
                }
                break;
        }

        // Update the position of marker.
        Main.getEntity('marker').Position.setX(
            targets[lockIndex].Position.getX());
        Main.getEntity('marker').Position.setY(
            targets[lockIndex].Position.getY());

        return true;
    }

    function setExModeLine() {
        if (Main.screens.getCurrentMode() === 'examine') {
            Main.getEntity('message').Message.setModeline(
                Main.text.modeLine('examine'));
        } else if (Main.screens.getCurrentMode() === 'aim') {
            Main.getEntity('message').Message.setModeline(
                Main.text.modeLine('aim'));
        } else if (!Main.getEntity('pc').Inventory.getIsDead()) {
            // Print 'The End' in the modeline if the PC is dead. Otherwise,
            // clear the modeline after exiting the Examine/Aim mode.
            Main.getEntity('message').Message.setModeline('');
        }
    }

    function useOrbInTheInventory() {
        let orb = Main.getEntity('pc').Inventory.getLastOrb();
        let npcHere = Main.system.npcHere(
            Main.getEntity('marker').Position.getX(),
            Main.getEntity('marker').Position.getY());
        let pcHere = Main.system.pcHere(
            Main.getEntity('marker').Position.getX(),
            Main.getEntity('marker').Position.getY());
        let markerPosition = [
            Main.getEntity('marker').Position.getX(),
            Main.getEntity('marker').Position.getY()
        ];

        let takeAction = false;

        if (Main.screens.getCurrentMode() === 'aim'
            && Main.system.insideOrbRange()
        ) {
            switch (orb) {
                case 'fire':
                case 'lump':
                case 'nuke':
                    if (npcHere) {
                        takeAction = true;
                        Main.system.pcAttack(npcHere, orb);
                    }
                    break;
                case 'slime':
                    if (Main.system.isFloor(
                        Main.getEntity('marker').Position.getX(),
                        Main.getEntity('marker').Position.getY())
                        && !npcHere
                        && !pcHere
                    ) {
                        takeAction = true;
                        Main.system.pcUseSlimeOrb(...markerPosition);
                    }
                    break;
                case 'ice':
                    takeAction = true;
                    Main.system.pcUseIceOrb();
                    break;
            }
        }

        if (takeAction) {
            exitExamineOrAimMode(false);
        }
    }
};

Main.system.getDistance = function (source, target) {
    let x = null;
    let y = null;

    let sourceX = null;
    let sourceY = null;

    let targetX = null;
    let targetY = null;

    if (Array.isArray(source)) {
        sourceX = source[0];
        sourceY = source[1];
    } else {
        sourceX = source.Position.getX();
        sourceY = source.Position.getY();
    }

    if (Array.isArray(target)) {
        targetX = target[0];
        targetY = target[1];
    } else {
        targetX = target.Position.getX();
        targetY = target.Position.getY();
    }

    x = Math.abs(sourceX - targetX);
    y = Math.abs(sourceY - targetY);

    return Math.max(x, y);
};

Main.system.insideOrbRange = function () {
    let orb = Main.getEntity('pc').Inventory.getLastOrb();

    return Main.system.getDistance(
        Main.getEntity('pc'), Main.getEntity('marker'))
        <= Main.getEntity('pc').AttackRange.getRange(orb);
};

Main.system.exitCutScene = function () {
    Main.input.listenEvent('remove', 'cutScene');
    Main.screens.cutScene.exit();

    if (Main.getEntity('pc')) {
        Main.screens.main.enter(true);

        Main.system.unlockEngine(
            Main.getEntity('pc').ActionDuration.getDuration());
    } else {
        Main.screens.main.enter(false);
    }

    Main.input.listenEvent('add', 'main');
};

Main.system.exitHelp = function () {
    Main.input.listenEvent('remove', 'help');
    Main.screens.help.exit();

    Main.screens.main.enter(true);
    Main.input.listenEvent('add', 'main');
};

Main.system.pcAttack = function (target, attackType) {
    let dropRate = 0;
    let lastOrb = Main.getEntity('pc').Inventory.getLastOrb();

    // Step 1-4: The enemy loses HP.
    target.HitPoint.takeDamage(
        lastOrb === 'nuke'
            ? Main.getEntity('pc').Damage.getDamage('nuke')
            : Main.getEntity('pc').Damage.getDamage('base')
    );

    // Step 2A-4: The enemy is dead.
    if (target.HitPoint.isDead()) {
        // 1a-5: Drop rate: the boss.
        if (target.CombatRole.getRole('isBoss')) {
            dropRate = Main.getEntity('pc').DropRate.getDropRate('fire');
        }
        // 1b-5: Drop rate: base attack vs. the grunts.
        else if (attackType === 'base') {
            switch (lastOrb) {
                case 'armor':
                    dropRate = Main.getEntity('pc').DropRate.getDropRate('ice');
                    break;
                case 'nuke':
                    dropRate = Main.getEntity('pc').DropRate.getDropRate('nuke');
                    break;
                default:
                    dropRate = Main.getEntity('pc').DropRate.getDropRate('base');
                    break;
            }
        }
        // 1c-5: Drop rate: orb attack vs. the grunts.
        else {
            dropRate
                = Main.getEntity('pc').DropRate.getDropRate(attackType);
        }

        // 2-5: Print the combat log.
        Main.getEntity('message').Message.pushMsg(
            Main.text.killTarget(target));

        // 3-5: Drop the orb. Perform the last action.
        Main.system.npcDropOrb(target, dropRate);
        Main.system.npcActBeforeDeath(target);

        // 4-5: Remove the dead enemy.
        Main.getEntity('timer').scheduler.remove(target);
        Main.getEntity('npc').delete(target.getID());

        // 5a-5: Progress the game if the level boss is dead.
        // 5b-5: Check the boss related normal achievements.
        if (Main.system.bossIsDead(target)) {
            Main.getEntity('gameProgress').BossFight.goToNextBossFightStage();
            Main.system.checkAchBossNormal(target);
        }
    }
    // Step 2B-4: The enemy is still alive.
    else {
        Main.getEntity('message').Message.pushMsg(
            Main.text.hitTarget(target));
    }

    // Step 3-4: Check the boss related special achievements.
    Main.system.checkAchBoss1Special(target, attackType);

    // Step 4-4: Remove the key-binding & unlock the engine.
    // NOTE: Always remember to remove the key-bindings before unlocking. I have
    // encountered a weird bug because of this.
    Main.input.listenEvent('remove', 'main');
    Main.system.unlockEngine(
        Main.getEntity('pc').ActionDuration.getDuration()
    );
};

Main.system.pcUseSlimeOrb = function (x, y) {
    Main.getEntity('pc').Position.setX(x);
    Main.getEntity('pc').Position.setY(y);

    Main.getEntity('message').Message.pushMsg(Main.text.action('teleport'));

    Main.system.unlockEngine(
        Main.getEntity('pc').ActionDuration.getDuration());
};

Main.system.pcUseIceOrb = function () {
    Main.getEntity('pc').Inventory.removeItem(1);
    Main.getEntity('pc').Inventory.addItem('armor');
    Main.getEntity('pc').Inventory.addItem('armor');

    Main.getEntity('message').Message.pushMsg(Main.text.action('armor'));

    Main.system.unlockEngine(
        Main.getEntity('pc').ActionDuration.getDuration());
};

Main.system.npcDropOrb = function (actor, dropRate) {
    let orbID = null;
    let orbHere = Main.system.orbHere(
        actor.Position.getX(), actor.Position.getY());

    if (// Orbs will not drop on the downstairs.
        !Main.system.downstairsHere(
            actor.Position.getX(), actor.Position.getY())
        // Orbs have a chance to drop.
        && ROT.RNG.getPercentage() <= dropRate) {
        // Two orbs cannot appear in the same position.
        if (orbHere) {
            Main.getEntity('orb').delete(orbHere.getID());
        }

        // The NPC drops an orb.
        orbID = Main.entity.orb(actor.Inventory.getInventory(0));

        Main.getEntity('orb').get(orbID).Position.setX(actor.Position.getX());
        Main.getEntity('orb').get(orbID).Position.setY(actor.Position.getY());

        Main.getEntity('message').Message.pushMsg(
            Main.text.targetDropOrb(actor, Main.getEntity('orb').get(orbID)));
    }
};

Main.system.printGenerationLog = function () {
    let labels = ['Lump1: ', 'Lump2: ', 'Fire: ', 'Ice: ', 'Slime: '];

    if (!Main._log.seedPrinted) {
        console.log('Seed: '
            + Main.getEntity('seed').Seed.getSeed());

        Main._log.seedPrinted = true;
    }

    if (Main.getDevelop() && !Main._log.msgPrinted) {
        console.log('Cycle: ' + Main._log.cycle);
        console.log('Floor: ' + Main._log.floor + '%');
        console.log('Enemy: ' + Main._log.enemyCount);

        for (let i = 0; i < 5; i++) {
            console.log(labels[i] + Main._log.enemyComposition[i]);
        }

        if (Main._log.retry.length > 0) {
            console.log('==========');
            console.log('Retry:');
            Main._log.retry.forEach((value) => {
                console.log(value);
            });
        }

        Main._log.msgPrinted = true;
    }
};

Main.system.countEnemiesInSight = function (range) {
    let pcSight = Main.system.getActorSight(
        Main.getEntity('pc'),
        range || Main.getEntity('pc').Position.getRange()
    );
    // Key: the enemy's character; Value: the number of enemies of the same type.
    let count = new Map();

    Main.getEntity('npc').forEach((value) => {
        // The enemy is in the PC's sight.
        if (pcSight.indexOf(
            value.Position.getX() + ',' + value.Position.getY())
            > -1
        ) {
            // This type of enemy already exists.
            if (count.get(value.Display.getCharacter())) {
                count.set(value.Display.getCharacter(),
                    count.get(value.Display.getCharacter()) + 1);
            }
            // This is a new type of enemy.
            else {
                count.set(value.Display.getCharacter(), 1);
            }
        }
    });

    return count;
};

Main.system.getActorSight = function (actor, range) {
    let actorCanSee = [];

    Main.getEntity('dungeon').fov.compute(
        actor.Position.getX(),
        actor.Position.getY(),
        range || actor.Position.getRange(),
        (x, y) => { actorCanSee.push(x + ',' + y); }
    );

    return actorCanSee;
};

Main.system.bossIsDead = function (target) {
    let bossIsDead = true;

    if (target.CombatRole.getRole('isBoss')) {
        switch (target.getEntityName()) {
            case 'gargoyle':
            case 'juvenileGargoyle':
                Main.getEntity('npc').forEach((actor) => {
                    if (actor.getEntityName() === 'gargoyle'
                        || actor.getEntityName() === 'juvenileGargoyle'
                    ) {
                        bossIsDead = false;
                    }
                });
                break;
        }
    } else {
        bossIsDead = false;
    }

    return bossIsDead;
};

Main.system.killAndTeleport = function () {
    Main.getEntity('npc').forEach((actor) => {
        Main.getEntity('timer').scheduler.remove(actor);
        Main.getEntity('npc').delete(actor.getID());
    });

    Main.getEntity('pc').Position.setX(
        Main.getEntity('downstairs').Position.getX()
    );
    Main.getEntity('pc').Position.setY(
        Main.getEntity('downstairs').Position.getY()
    );
};

Main.system.getNewCoordinates = function (currentPosition, direction) {
    let x = currentPosition[0];
    let y = currentPosition[1];

    switch (direction) {
        case 'left':
            x -= 1;
            break;
        case 'right':
            x += 1;
            break;
        case 'up':
            y -= 1;
            break;
        case 'down':
            y += 1;
            break;
    }

    return [x, y];
};

Main.system.pcRememberTerrain = function () {
    let pcSight = Main.system.getActorSight(Main.getEntity('pc'));

    pcSight.forEach((position) => {
        // Remember walls and floors in sight.
        if (Main.getEntity('dungeon').Dungeon.getMemory().indexOf(position)
            < 0
        ) {
            Main.getEntity('dungeon').Dungeon.getMemory().push(position);
        }
        // Remember the orbs in sight.
        Main.getEntity('orb').forEach((orb) => {
            if (!orb.Memory.getHasSeen()
                && position === orb.Position.getX() + ',' + orb.Position.getY()
            ) {
                orb.Memory.setHasSeen(true);
            }
        });
    });
};

Main.system.pcFastMove = function (initialize, direction) {
    let newPosition = Main.system.getNewCoordinates(
        [
            Main.getEntity('pc').Position.getX(),
            Main.getEntity('pc').Position.getY()
        ],
        direction
    );

    if (initialize) {
        Main.getEntity('pc').FastMove.resetStep();
        Main.getEntity('pc').FastMove.setDirection(direction);
    }

    if (Main.system.countEnemiesInSight().size === 0
        && Main.system.isFloor(...newPosition)
        && !Main.system.npcHere(...newPosition)
    ) {
        Main.getEntity('pc').FastMove.reduceStep();
        Main.system.move(direction, Main.getEntity('pc'));
    } else {
        Main.getEntity('pc').FastMove.clearStep();
        Main.input.listenEvent('add', 'main');
    }
};

Main.system.showHelp = function () {
    Main.input.listenEvent('remove', 'main');
    Main.screens.main.exit();

    Main.screens.help.enter();
    Main.input.listenEvent('add', 'help');
};

Main.system.startRNG = function () {
    let newSeed = null;

    Main.getEntity('seed').Seed.setSeed(
        Main.system.loadSeed() || Main.getDevSeed()
    );

    ROT.RNG.setSeed(Main.getEntity('seed').Seed.getSeed());

    // Generate a new seed for deeper dungeon levels.
    if (Main.getEntity('gameProgress').BossFight.getDungeonLevel() > 1) {
        for (let i = 0;
            i < Main.getEntity('gameProgress').BossFight.getDungeonLevel();
            i++
        ) {
            newSeed = ROT.RNG.getUniform();
        }
        ROT.RNG.setSeed(newSeed * Math.pow(10, 8));
    }
};

Main.system.fillInventory = function () {
    if (Main.system.loadDungeonLevel() > 1) {
        Main.system.loadInventory().forEach((orb) => {
            Main.getEntity('pc').Inventory.addItem(orb);
        });
    } else {
        Main.getEntity('pc').Inventory.addItem('slime');
        Main.getEntity('pc').Inventory.addItem('armor');
        Main.getEntity('pc').Inventory.addItem('armor');
        Main.getEntity('pc').Inventory.addItem('fire');
        Main.getEntity('pc').Inventory.addItem('lump');
    }
};
