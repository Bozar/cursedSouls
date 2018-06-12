'use strict';

Main.system = {};

Main.system.isFloor = function (x, y) {
    return Main.getEntity('dungeon').Dungeon.getTerrain().get(x + ',' + y)
        === 0;
};

Main.system.placeActor = function (actor, notQualified) {
    let x = null;
    let y = null;

    do {
        x = Math.floor(
            Main.getEntity('dungeon').Dungeon.getWidth()
            * ROT.RNG.getUniform());
        y = Math.floor(
            Main.getEntity('dungeon').Dungeon.getHeight()
            * ROT.RNG.getUniform());
    } while (notQualified(x, y));

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
        || Main.system.isInSight(Main.getEntity('pc'), x, y)
        || Main.system.downstairsHere(x, y)
        || Main.system.orbHere(x, y);
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

    Main.display.clear();
    Main.screens.main.display();
};

Main.system.pcTakeDamage = function (damage) {
    let pcIsDead
        = damage > Main.getEntity('pc').Inventory.getInventory().length;

    Main.getEntity('pc').Inventory.removeItem(damage);

    return pcIsDead;
};

// The hub function to handle the 'pickOrUse' key.
Main.system.pcPickOrUse = function () {
    if (Main.system.orbHere(
        Main.getEntity('pc').Position.getX(),
        Main.getEntity('pc').Position.getY())
        && Main.getEntity('pc').Inventory.getInventory().length
        < Main.getEntity('pc').Inventory.getCapacity()) {
        Main.system.pickUpOrb();
    } else {
        console.log('press space');
    }
};

Main.system.pickUpOrb = function () {
    let orbHere = Main.system.orbHere(
        Main.getEntity('pc').Position.getX(),
        Main.getEntity('pc').Position.getY());

    Main.getEntity('pc').Inventory.addItem(
        orbHere.getEntityName());

    Main.getEntity('message').Message.pushMsg(
        Main.text.pickUp(orbHere.getEntityName()));

    Main.getEntity('orb').delete(orbHere.getID());

    Main.system.unlockEngine(
        Main.getEntity('pc').ActionDuration.getPickUpOrb());
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
    switch (actorType) {
        case 'pc':
            isMoveable
                = Main.system.isFloor(x, y) && !Main.system.npcHere(x, y);
            break;
        case 'npc':
            isMoveable
                = Main.system.isFloor(x, y) && !Main.system.pcHere(x, y);
            break;
        case 'marker':
            isMoveable
                = Main.system.isInSight(Main.getEntity('pc'), x, y);
            break;
    }

    // Taking actions:
    //      Change the position & unlock the engine;
    //      Bump into the nearby target;
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
    }
    // TODO: add more available actions.
    else {
        Main.getEntity('message').Message.setModeline('invalid move');
        // message.setModeline(Main.text.interact('forbidMove'))
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
    for (const keyValue of Main.getEntity('npc')) {
        if (x === keyValue[1].Position.getX()
            && y === keyValue[1].Position.getY()) {
            return keyValue[1];
        }
    }
    return null;
};

Main.system.pcHere = function (x, y) {
    return x === Main.getEntity('pc').Position.getX()
        && y === Main.getEntity('pc').Position.getY();
};

Main.system.orbHere = function (x, y) {
    for (let keyValue of Main.getEntity('orb')) {
        if (x === keyValue[1].Position.getX()
            && y === keyValue[1].Position.getY()) {
            return keyValue[1];
        }
    }
    return null;
};

// TODO: check the downstairs position.
Main.system.downstairsHere = function () {
    return false;
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
        if (Main.input.getAction(e, 'fixed') === 'no') {
            // Exit the examine mode.
            Main.input.listenEvent('remove', examine);
            Main.input.listenEvent('add', 'main');

            setOrRemoveMarker(false);
        } else if (Main.input.getAction(e, 'move')) {
            // Move the marker.
            Main.system.move(Main.input.getAction(e, 'move'),
                Main.getEntity('marker'));
        } else if (Main.input.getAction(e, 'interact') === 'next'
            || Main.input.getAction(e, 'interact') === 'previous') {
            // Lock the previous or next target.
            lockTarget(Main.input.getAction(e, 'interact'));
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
            Main.screens.setCurrentMode(Main.screens.main.getMode(1));
        } else {
            Main.getEntity('marker').Position.setX(null);
            Main.getEntity('marker').Position.setY(null);

            // Change mode: examine --> main.
            Main.screens.setCurrentMode(Main.screens.main.getMode(0));
        }

        setExModeLine();
        Main.display.clear();
        Main.screens.main.display();
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
        } else {
            Main.getEntity('message').Message.setModeline('');
        }
    }
};

Main.system.getDistance = function (source, target) {
    let x = Math.abs(source.Position.getX() - target.Position.getX());
    let y = Math.abs(source.Position.getY() - target.Position.getY());

    return Math.max(x, y);
};
