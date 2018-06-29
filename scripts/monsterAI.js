'use strict';

Main.system.dummyAct = function () {
    let pcIsDead = false;
    let approach = false;

    Main.getEntity('timer').engine.lock();

    if (!Main.system.isInSight(this, Main.getEntity('pc'))) {
        // 1-4: Search the nearby PC or wait 1 turn.
        Main.system.npcSearchOrWait(this);
    } else if (Main.system.pcIsInsideAttackRange(this)) {
        // 2-4: Attack the PC.
        pcIsDead = Main.system.pcTakeDamage(this.Damage.getDamage());
        Main.system.npcHitOrKill(this, 'base', pcIsDead);
    } else {
        if (this.CombatRole.getCautious()) {
            // A cautious enemy does not approach the PC easily.
            approach
                = !Main.system.pcIsInsideAttackRange(this)
                && Main.system.npcHasAlliesInSight(this);
        } else {
            approach
                = !Main.system.pcIsInsideAttackRange(this);
        }

        if (approach) {
            // 3-4: Approach the PC in sight.
            Main.system.npcMoveClose(this);
        } else {
            // 4-4: Surround the PC.
            Main.system.npcKeepDistance(
                // '3' is the attack range of the enhanced Lump Orb.
                this, Math.max(3, this.AttackRange.getRange())
            );
        }
    }
};

Main.system.npcMoveClose = function (actor) {
    Main.system.npcDecideNextStep(actor, 'moveClose');
};

Main.system.npcMoveRandomly = function (actor) {
    Main.system.npcDecideNextStep(actor, 'moveRandomly');
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

    currentDistance = Main.system.getDistance(actor, Main.getEntity('pc'));

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
        case 'moveRandomly':
            newDistanceMap.forEach((value, key) => {
                checkFirst.push(key);
            });
            break;
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
            if (currentDistance >= keepDistance) {
                newDistanceMap.forEach((value, key) => {
                    if (value === currentDistance) {
                        checkFirst.push(key);
                    }
                });
            } else {
                newDistanceMap.forEach((value, key) => {
                    if (value > currentDistance) {
                        checkFirst.push(key);
                    }
                });
            }

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

    if (newPosition[0] === centerX && newPosition[1] === centerY) {
        // Wait.
        Main.system.unlockEngine(actor.ActionDuration.getDuration('base'));
    } else {
        // Move.
        Main.system.unlockEngine(
            actor.ActionDuration.getDuration('slowMove')
            || actor.ActionDuration.getDuration('fastMove')
            || actor.ActionDuration.getDuration('base')
        );
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

Main.system.npcSearchOrWait = function (actor) {
    if (Main.system.getDistance(actor, Main.getEntity('pc'))
        <= actor.Position.getRange()) {
        // Search the unseen PC.
        Main.system.npcMoveRandomly(actor);
    } else {
        // Wait 1 turn.
        Main.system.unlockEngine(actor.ActionDuration.getDuration());
    }
};

Main.system.pcIsInsideAttackRange = function (actor) {
    return Main.system.getDistance(actor, Main.getEntity('pc'))
        <= actor.AttackRange.getRange('base');
};

Main.system.npcHasAlliesInSight = function (actor) {
    let count = 0;
    let minimum = 2;

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

Main.system.npcActBeforeDeath = function (actor) {
    switch (actor.getEntityName()) {
        case 'zombie':
            summon('dog');

            Main.getEntity('message').Message.pushMsg(
                Main.text.npcSummon(actor));
            break;
    }

    // Helper functions.
    function summon(who) {
        let newActor
            = Main.entity[who](actor.Position.getX(), actor.Position.getY());

        // Delay 2 turns.
        Main.getEntity('timer').scheduler.add(newActor, true, 2);
    }
};
