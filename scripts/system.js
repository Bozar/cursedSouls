'use strict';

Main.system = {};

Main.system.isFloor = function (x, y) {
    return Main.getEntity('dungeon').Dungeon.getTerrain().get(x + ',' + y)
        === 0;
};

Main.system.placePC = function () {
    let x = null;
    let y = null;
    let width = Main.getEntity('dungeon').Dungeon.getWidth();
    let height = Main.getEntity('dungeon').Dungeon.getHeight();
    let border = Main.getEntity('pc').Position.getSight();

    do {
        x = Math.floor(width * ROT.RNG.getUniform());
        y = Math.floor(height * ROT.RNG.getUniform());
    } while (!Main.system.isFloor(x, y)
    || x < border || x > width - border
    || y < border || y > height - border);

    Main.getEntity('pc').Position.setX(x);
    Main.getEntity('pc').Position.setY(y);
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
        source.Position.getSight(),
        (x, y) => {
            sight.push(x + ',' + y);
        }
    );

    return sight.indexOf(targetX + ',' + targetY) > -1;
};

Main.system.pcAct = function () {
    Main.getEntity('timer').engine.lock();

    Main.input.listenEvent('add', 'main');

    Main.display.clear();
    Main.screens.main.display();
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
            return true;
        }
    }
    return false;
};

Main.system.pcHere = function (x, y) {
    return x === Main.getEntity('pc').Position.getX()
        && y === Main.getEntity('pc').Position.getY();
};

Main.system.examineMode = function () {
    Main.input.listenEvent('remove', 'main');
    Main.input.listenEvent('add', examine);

    setOrRemoveMarker(true);

    // Helper functions
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
        }
        else {
            // TODO: change or delete the `else` block.
            // Invalid keys.
            Main.getEntity('message').Message.setModeline(
                'invalid key: ' + e.key);
        }

        Main.display.clear();
        Main.screens.main.display();
    }

    function setOrRemoveMarker(setMarker) {
        if (setMarker) {
            Main.getEntity('marker').Position.setX(
                Main.getEntity('pc').Position.getX());
            Main.getEntity('marker').Position.setY(
                Main.getEntity('pc').Position.getY());
        } else {
            Main.getEntity('marker').Position.setX(null);
            Main.getEntity('marker').Position.setY(null);
        }
    }
};
