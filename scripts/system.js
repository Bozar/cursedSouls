'use strict';

Main.system = {};

Main.system.isFloor = function (x, y) {
    return Main.getEntity('dungeon').Dungeon.getTerrain().get(x + ',' + y)
        === 0;
};

Main.system.placeActor = function (actor, notQualified, forbidden) {
    let x = null;
    let y = null;
    let retry = 0;

    do {
        x = Math.floor(
            Main.getEntity('dungeon').Dungeon.getWidth()
            * ROT.RNG.getUniform());
        y = Math.floor(
            Main.getEntity('dungeon').Dungeon.getHeight()
            * ROT.RNG.getUniform());
        retry++;
    }
    // Some notQualified callback functions require an extra argument, forbidden,
    // which is a string array [x + ',' + y], so that they do not need to
    // calculate the forbidden zone every time when placing a new entity.
    while (notQualified(x, y, forbidden) && retry < 999);

    if (retry > 10) {
        Main._log.retry.push(actor.getEntityName() + ': ' + retry);
    }

    actor.Position.setX(x);
    actor.Position.setY(y);
};

Main.system.verifyPositionPC = function (x, y) {
    return !Main.system.isFloor(x, y)
        || x < Main.getEntity('pc').Position.getRange()
        || x > Main.getEntity('dungeon').Dungeon.getWidth()
        - Main.getEntity('pc').Position.getRange()
        || y < Main.getEntity('pc').Position.getRange()
        || y > Main.getEntity('dungeon').Dungeon.getHeight()
        - Main.getEntity('pc').Position.getRange();
};

Main.system.verifyPositionOrb = function (x, y) {
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

Main.system.verifyPositionGrunt = function (x, y, pcSight) {
    return !Main.system.isFloor(x, y)
        || tooClose(x, y)
        || tooMany(x, y)
        || Main.system.npcIsTooDense(x, y)
        || Main.system.npcHere(x, y);

    function tooClose(x, y) {
        return pcSight.indexOf(x + ',' + y) > -1
            && Main.system.getDistance([x, y], Main.getEntity('pc')) <= 3;
    }

    function tooMany(x, y) {
        let number = 0;

        Main.getEntity('npc').forEach((value) => {
            if (pcSight.indexOf(x + ',' + y) > -1
                && Main.system.getDistance(value, Main.getEntity('pc')) <= 5) {
                number++;
            }
        });

        return number > 4;
    }
};

Main.system.verifyPositionDownstairs = function (x, y) {
    return !Main.system.isFloor(x, y)
        || Main.system.pcHere(x, y)
        || floorInSight() < 36;

    // Helper function.
    function floorInSight() {
        let floor = 0;

        Main.getEntity('dungeon').fov.compute(
            x, y,
            Main.getEntity('downstairs').Position.getRange(),
            (x, y) => {
                if (Main.system.isFloor(x, y)) {
                    floor++;
                }
            });

        return floor;
    }
};

Main.system.createOrbs = function () {
    // TODO: change the loop based on the dungeon level.
    let loop = 3;

    for (var i = 0; i < loop; i++) {
        Main.entity.orb('fire');
        Main.entity.orb('ice');
        Main.entity.orb('slime');
        Main.entity.orb('lump');
    }
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
                lump1 = 'dummy';
                lump2 = 'dummy';
                fire = 'dummy';
                ice = 'dummy';
                slime = 'dummy';
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
    let sight = [];
    let targetX = null;
    let targetY = null;

    if (Array.isArray(target)) {
        targetX = target[0];
        targetY = target[1];
    } else {
        targetX = target.Position.getX();
        targetY = target.Position.getY();
    }

    // Store positions in sight to the list.
    Main.getEntity('dungeon').fov.compute(
        source.Position.getX(),
        source.Position.getY(),
        source.Position.getRange(),
        (x, y) => { sight.push(x + ',' + y); });

    return sight.indexOf(targetX + ',' + targetY) > -1;
};

Main.system.pcAct = function () {
    Main.getEntity('timer').engine.lock();

    Main.input.listenEvent('add', 'main');

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
        && Main.getEntity('dungeon').BossFight.getBossFightStatus()
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
        Main.getEntity('pc').ActionDuration.getUseOrb());
};

Main.system.pcUseDownstairs = function () {
    switch (Main.getEntity('dungeon').BossFight.getBossFightStatus()) {
        case 'inactive':
            Main.input.listenEvent('remove', 'main');
            Main.screens.main.exit();

            Main.getEntity('dungeon').BossFight.goToNextBossFightStage();

            // TODO: delete this line and call the boss-summoning function.
            console.log('start the boss fight');

            Main.screens.cutScene.enter();
            Main.input.listenEvent('add', 'cutScene');
            break;
        case 'win':
            Main.input.listenEvent('remove', 'main');
            Main.screens.main.exit();

            // TODO: delete this line and call the save function.
            console.log('you win');

            // Enter the save screen.
            break;
    }
};

Main.system.move = function (direction, who) {
    let actor = who || Main.getEntity('pc');
    let x = actor.Position.getX();
    let y = actor.Position.getY();
    // `who` can be the marker, which takes no time to move.
    let duration = getDuration(false);
    let actorType = getActorType();
    let isMoveable = false;

    // Get new coordinates.
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
        case 'wait':
            // No matter how long 1-step-movement takes, waiting always costs
            // exactly 1 turn, or `null` if the actor is marker.
            duration = getDuration(true);
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
    function getDuration(isWait) {
        return Main.system.isMarker(actor)
            ? null
            : isWait
                ? actor.ActionDuration.getWait()
                : actor.ActionDuration.getMove();
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
            exitExamineOrAimMode();
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

    function exitExamineOrAimMode() {
        Main.input.listenEvent('remove', examine);
        Main.input.listenEvent('add', 'main');

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
        } else {
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

        let takeAction = false;

        if (Main.screens.getCurrentMode() === 'aim'
            && Main.system.insideOrbRange()) {
            if ((orb === 'fire' || orb === 'lump' || orb === 'nuke')
                && npcHere) {
                takeAction = true;

                switch (orb) {
                    case 'fire':
                    case 'lump':
                    case 'nuke':
                        Main.system.pcAttack(npcHere, orb);
                        break;
                }
            } else if (orb === 'slime'
                && Main.system.isFloor(
                    Main.getEntity('marker').Position.getX(),
                    Main.getEntity('marker').Position.getY())
                && !npcHere
                && !pcHere) {
                takeAction = true;

                Main.system.pcUseSlimeOrb();
            } else if (orb === 'ice') {
                takeAction = true;

                Main.system.pcUseIceOrb();
            }
        }

        if (takeAction) {
            exitExamineOrAimMode();
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
            Main.getEntity('pc').ActionDuration.getMove());
    } else {
        Main.screens.main.enter(false);
    }

    Main.input.listenEvent('add', 'main');
};

Main.system.pcAttack = function (target, attackType) {
    let dropRate = 0;
    let lastOrb = Main.getEntity('pc').Inventory.getLastOrb();

    target.HitPoint.takeDamage(
        lastOrb === 'nuke'
            ? Main.getEntity('pc').Damage.getDamage('nuke')
            : Main.getEntity('pc').Damage.getDamage('base')
    );

    if (target.HitPoint.isDead()) {
        if (attackType === 'base') {
            if (lastOrb === 'armor') {
                dropRate = Main.getEntity('pc').DropRate.getDropRate('ice');
            } else if (lastOrb === 'nuke') {
                dropRate = Main.getEntity('pc').DropRate.getDropRate('nuke');
            } else {
                dropRate = Main.getEntity('pc').DropRate.getDropRate('base');
            }
        } else {
            dropRate
                = Main.getEntity('pc').DropRate.getDropRate(attackType);
        }

        Main.getEntity('message').Message.pushMsg(
            Main.text.killTarget(target));

        Main.system.npcDropOrb(target, dropRate);

        Main.getEntity('timer').scheduler.remove(target);
        Main.getEntity('npc').delete(target.getID());
    } else {
        Main.getEntity('message').Message.pushMsg(
            Main.text.hitTarget(target));
    }

    Main.system.unlockEngine(Main.getEntity('pc').ActionDuration.getAttack());
};

Main.system.pcUseSlimeOrb = function () {
    Main.getEntity('pc').Position.setX(
        Main.getEntity('marker').Position.getX());
    Main.getEntity('pc').Position.setY(
        Main.getEntity('marker').Position.getY());

    Main.getEntity('message').Message.pushMsg(Main.text.action('teleport'));

    Main.system.unlockEngine(
        Main.getEntity('pc').ActionDuration.getUseOrb());
};

Main.system.pcUseIceOrb = function () {
    Main.getEntity('pc').Inventory.removeItem(1);
    Main.getEntity('pc').Inventory.addItem('armor');
    Main.getEntity('pc').Inventory.addItem('armor');

    Main.getEntity('message').Message.pushMsg(Main.text.action('armor'));

    Main.system.unlockEngine(
        Main.getEntity('pc').ActionDuration.getUseOrb());
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
