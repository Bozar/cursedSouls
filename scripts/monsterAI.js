'use strict';

Main.system.dummyAct = function () {
    let pcIsDead = false;

    Main.getEntity('timer').engine.lock();

    if (!Main.system.isInSight(this, Main.getEntity('pc'))) {
        if (Main.system.getDistance(this, Main.getEntity('pc'))
            <= this.Position.getRange()) {
            // Search the unseen PC.
            Main.system.npcMoveClose(this);
        } else {
            // Wait 1 turn.
            Main.system.unlockEngine(this.ActionDuration.getDuration());
        }
    } else if (Main.system.pcIsInsideAttackRange(this)) {
        pcIsDead = Main.system.pcTakeDamage(this.Damage.getDamage());

        // Attack the PC.
        Main.system.npcHitOrKill(this, 'base', pcIsDead);
    } else {
        if (!Main.system.pcIsInsideAttackRange(this)) {
            // Approach the PC in sight.
            Main.system.npcMoveClose(this);
        } else {
            // Surround the PC.
            Main.system.npcKeepDistance(this, this.AttackRange.getRange());
        }
    }
};

Main.system.ravenAct = function () {
    let pcIsDead = false;

    Main.getEntity('timer').engine.lock();

    if (!Main.system.isInSight(this, Main.getEntity('pc'))) {
        // Wait 1 turn.
        Main.system.unlockEngine(this.ActionDuration.getDuration());
    } else if (Main.system.pcIsInsideAttackRange(this)) {
        pcIsDead = Main.system.pcTakeDamage(this.Damage.getDamage());

        // Attack the PC.
        Main.system.npcHitOrKill(this, 'base', pcIsDead);
    } else {
        if (!Main.system.pcIsInsideAttackRange(this)
            && Main.system.npcHasAlliesInSight(this, 3)) {
            // Approach the PC in sight.
            Main.system.npcMoveClose(this);
        } else {
            // Surround the PC.
            Main.system.npcKeepDistance(this, 3);
        }
    }
};

Main.system.npcMoveClose = function (actor) {
    Main.system.npcDecideNextStep(actor, 'moveClose');
};

Main.system.npcMoveAway = function (actor) {
    Main.system.npcDecideNextStep(actor, 'moveAway');
};

Main.system.npcKeepDistance = function (actor, keepDistance) {
    Main.system.npcDecideNextStep(actor, 'keepDistance', keepDistance);
};

Main.system.npcDecideNextStep = function (actor, nextStep, keepDistance) {
    // 1-6: Get the eight blocks around the actor.
    // The actor can move to his current position, a.k.a. wait.
    let centerX = actor.Position.getX();
    let centerY = actor.Position.getY();
    let surround = [];

    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            surround.push([centerX + i, centerY + j]);
        }
    }

    let currentDistance = 0;
    let newDistanceMap = new Map();
    let newPosition = [];
    let checkFirst = [];
    let checkNext = [];

    if (keepDistance > 0) {
        currentDistance
            = Math.max(
                keepDistance,
                Main.system.getDistance(actor, Main.getEntity('pc'))
            );
    } else {
        currentDistance = Main.system.getDistance(actor, Main.getEntity('pc'));
    }

    // 2-6: Remove invalid blocks.
    surround = surround.filter((position) => {
        return Main.system.isFloor(...position)
            && !Main.system.npcHere(...position)
            && !Main.system.pcHere(...position);
    });
    surround.push([centerX, centerY]);

    // 3-6: Calculate the distance between each block and the PC.
    surround.forEach((position) => {
        newDistanceMap.set(position[0] + ',' + position[1],
            Main.system.getDistance(position, Main.getEntity('pc')));
    });

    // 4-6: Select potential blocks with priority.
    switch (nextStep) {
        case 'moveClose':
            newDistanceMap.forEach((value, key) => {
                if (value < currentDistance) {
                    checkFirst.push(key);
                } else if (value === currentDistance) {
                    checkNext.push(key);
                }
            });
            break;
        case 'moveAway':
            newDistanceMap.forEach((value, key) => {
                if (value > currentDistance) {
                    checkFirst.push(key);
                } else if (value === currentDistance) {
                    checkNext.push(key);
                }
            });
            break;
        case 'keepDistance':
            newDistanceMap.forEach((value, key) => {
                if (value === currentDistance) {
                    checkFirst.push(key);
                } else if (value > currentDistance) {
                    checkNext.push(key);
                }
            });

            // If the NPC is cornered by the PC, it moves randomly.
            if (checkFirst.length === 0 && checkNext.length === 0) {
                surround.forEach((position) => {
                    checkNext.push(position[0] + ',' + position[1]);
                });
            }
            break;
    }

    // 5-6: Decide where to go.
    if (checkFirst.length > 0) {
        newPosition
            = checkFirst[Math.floor(checkFirst.length * ROT.RNG.getUniform())]
                .split(',');
    } else if (checkNext.length > 0) {
        newPosition
            = checkNext[Math.floor(checkNext.length * ROT.RNG.getUniform())]
                .split(',');
    } else {
        // This should not happen.
        if (Main.getDevelop()) {
            console.log(actor.getEntityName() + ' cannot decide where to go.');
        }
        newPosition = [centerX, centerY];
    }

    newPosition = [
        Number.parseInt(newPosition[0], 10),
        Number.parseInt(newPosition[1], 10)
    ];

    // 6-6: Change the actor's position and unlock the engine.
    actor.Position.setX(newPosition[0]);
    actor.Position.setY(newPosition[1]);

    if (actor.ActionDuration.getDuration('fastMove')) {
        Main.system.unlockEngine(actor.ActionDuration.getDuration('fastMove'));
    } else {
        Main.system.unlockEngine(actor.ActionDuration.getDuration('base'));
    }
};

Main.system.npcHitOrKill = function (actor, duration, pcIsDead) {
    Main.getEntity('message').Message.pushMsg(Main.text.npcHit(actor));

    if (pcIsDead) {
        Main.getEntity('message').Message.pushMsg(Main.text.action('die'));
        Main.getEntity('message').Message.pushMsg(Main.text.lastWords());
        Main.getEntity('message').Message.pushMsg(Main.text.action('end'));
    } else {
        Main.system.unlockEngine(actor.ActionDuration.getDuration(duration));
    }
};

Main.system.pcIsInsideAttackRange = function (actor) {
    return Main.system.getDistance(actor, Main.getEntity('pc'))
        <= actor.AttackRange.getRange('base');
};

Main.system.npcHasAlliesInSight = function (actor, minimum) {
    let count = 0;

    Main.getEntity('dungeon').fov.compute(
        actor.Position.getX(),
        actor.Position.getY(),
        actor.Position.getRange(),
        (x, y) => {
            if (Main.system.npcHere(x, y)) {
                count++;
            }
        });

    return count >= minimum;
};
