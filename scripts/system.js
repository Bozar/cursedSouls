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
    while (notQualified(x, y, forbidden) && retry < 99);

    if (Main.getDevelop() && retry > 10) {
        console.log('Retry, ' + actor.getEntityName() + ': ' + retry);
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

Main.system.verifyPositionOrb = function (x, y, forbidden) {
    return !Main.system.isFloor(x, y)
        || pcCanSee()
        || Main.system.downstairsHere(x, y)
        || Main.system.orbHere(x, y);

    function pcCanSee() {
        return forbidden.indexOf(x + ',' + y) > -1;
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

Main.system.isPC = function (actor) {
    return actor.getID() === Main.getEntity('pc').getID();
};

Main.system.isMarker = function (checkThis) {
    return checkThis.getID() === Main.getEntity('marker').getID();
};

Main.system.isInSight = function (source, targetX, targetY) {
    let sight = [];

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
    } else {
        // TODO: add more actions.
        console.log('press space');
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
                    = Main.system.isInSight(Main.getEntity('pc'), x, y);
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
                && Main.system.isInSight(
                    Main.getEntity('pc'),
                    value.Position.getX(),
                    value.Position.getY())) {
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
            if ((orb === 'fire' || orb === 'lump')
                && npcHere) {
                takeAction = true;

                switch (orb) {
                    case 'fire':
                        Main.system.pcAttack(npcHere, 'fire');
                        break;
                    case 'lump':
                        Main.system.pcAttack(npcHere, 'lump');
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

    if (Array.isArray(source)) {
        x = Math.abs(source[0] - target.Position.getX());
        y = Math.abs(source[1] - target.Position.getY());
    } else {
        x = Math.abs(source.Position.getX() - target.Position.getX());
        y = Math.abs(source.Position.getY() - target.Position.getY());
    }

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

    target.HitPoint.takeDamage(Main.getEntity('pc').Damage.getDamage());

    if (target.HitPoint.isDead()) {
        if (attackType === 'base') {
            if (Main.getEntity('pc').Inventory.getLastOrb() === 'armor') {
                dropRate = Main.getEntity('pc').DropRate.getDropRate('ice');
            } else {
                dropRate = Main.getEntity('pc').DropRate.getDropRate('base');
            }
        } else {
            switch (attackType) {
                case 'fire':
                    dropRate
                        = Main.getEntity('pc').DropRate.getDropRate('fire');
                    break;
                case 'lump':
                    dropRate
                        = Main.getEntity('pc').DropRate.getDropRate('lump');
                    break;
            }
        }

        Main.getEntity('message').Message.pushMsg(
            Main.text.killTarget(target));

        // Main.system.npcDropOrb(target, 100);
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
