'use strict';

Main.system.dummyAct = function () {
    let approach = false;
    let moveDuration
        = this.ActionDuration.getDuration('slowMove')
        || this.ActionDuration.getDuration('fastMove')
        || this.ActionDuration.getDuration('base');
    let attackDuration
        = this.ActionDuration.getDuration('slowAttack')
        || this.ActionDuration.getDuration('fastAttack')
        || this.ActionDuration.getDuration('base');

    Main.getEntity('timer').engine.lock();

    if (!Main.system.isInSight(this, Main.getEntity('pc'))) {
        // 1-4: Search the nearby PC or wait 1 turn.
        Main.system.npcSearchOrWait(this, moveDuration);
    } else if (Main.system.pcIsInsideAttackRange(this)) {
        // 2-4: Attack the PC.
        Main.system.pcTakeDamage(this.Damage.getDamage('base'));
        Main.system.npcHitOrKill(this, attackDuration, false);
    } else {
        if (this.CombatRole.getCautious()) {
            // A cautious enemy does not approach the PC easily.
            approach
                = !Main.system.pcIsInsideAttackRange(this)
                && Main.system.npcHasAlliesInCloseRange(this);
        } else {
            approach
                = !Main.system.pcIsInsideAttackRange(this);
        }

        if (approach) {
            // 3-4: Approach the PC in sight.
            Main.system.npcMoveClose(this, moveDuration);
        } else {
            // 4-4: Surround the PC.
            Main.system.npcKeepDistance(
                this,
                moveDuration,
                // '3' is just beyond the attack range of the Lump Orb.
                Math.max(3, this.AttackRange.getRange())
            );
        }
    }
};

Main.system.gargoyleAct = function () {
    let newActor = null;
    let newPosition = null;

    Main.getEntity('timer').engine.lock();

    // 1-3: Search the nearby PC or wait 1 turn.
    if (!Main.system.isInSight(this, Main.getEntity('pc'))) {
        Main.system.npcSearchOrWait(this, getMoveDuration(this));
    }
    // 2A-3: Summon the ally.
    else if (this.getEntityName() === 'gargoyle'
        && !this.CombatRole.getRole('hasSummoned')
        && this.HitPoint.getHitPoint() < 3
    ) {
        newPosition = Main.system.placeBoss(this, this, 0);
        newActor = Main.entity.juvenileGargoyle(newPosition[0], newPosition[1]);
        Main.getEntity('timer').scheduler.add(newActor, true, 1);

        Main.getEntity('message').Message.pushMsg(Main.text.npcSummon(this));

        this.CombatRole.setRole('hasSummoned', true);
        Main.system.unlockEngine(this.ActionDuration.getDuration(
            getAttackDuration(this)
        ));
    }
    // 2B-3: Thrust the PC with the halberd.
    else if (
        this.CombatRole.getRole('extendRange')
        && Main.system.getDistance(this, Main.getEntity('pc'))
        <= this.AttackRange.getRange('extend')
        && Main.system.getDistance(this, Main.getEntity('pc'))
        > this.AttackRange.getRange('base')
    ) {
        Main.system.pcTakeDamage(this.Damage.getDamage('base'));

        Main.getEntity('message').Message.pushMsg(
            Main.text.action('gargoyleThrust'));

        Main.system.npcHitOrKill(this, getAttackDuration(this), true);
    }
    // 2C-3: Breathe fire.
    else if (
        Main.system.getDistance(this, Main.getEntity('pc'))
        === this.AttackRange.getRange('base')
    ) {
        Main.system.pcTakeDamage(
            Main.system.pcIsInStraightLine(this)
                ? this.Damage.getDamage('high')
                : this.Damage.getDamage('base')
        );

        Main.getEntity('message').Message.pushMsg(
            Main.text.gargoyleBreathe(this));

        Main.system.npcHitOrKill(this, getAttackDuration(this), true);
    }
    // 3-3: Approach the PC in sight.
    else {
        Main.system.npcMoveClose(this, getMoveDuration(this));
    }

    // Helper functions.
    function getMoveDuration(actor) {
        return actor.getEntityName() === 'gargoyle'
            ? actor.ActionDuration.getDuration('slowMove')
            : actor.ActionDuration.getDuration('base');
    }

    function getAttackDuration(actor) {
        return actor.CombatRole.getRole('hasTail')
            ? actor.ActionDuration.getDuration('base')
            : actor.ActionDuration.getDuration('slowAttack');
    }
};

Main.system.npcMoveClose = function (actor, duration) {
    Main.system.npcDecideNextStep(actor, 'moveClose', duration);
};

Main.system.npcMoveRandomly = function (actor, duration) {
    Main.system.npcDecideNextStep(actor, 'moveRandomly', duration);
};

Main.system.npcMoveAway = function (actor, duration) {
    Main.system.npcDecideNextStep(actor, 'moveAway', duration);
};

Main.system.npcKeepDistance = function (actor, duration, distance) {
    Main.system.npcDecideNextStep(actor, 'keepDistance', duration, distance);
};

Main.system.npcDecideNextStep = function (actor, nextStep, duration, distance) {
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
            if (currentDistance >= distance) {
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
        Main.system.unlockEngine(duration);
    }
};

Main.system.npcHitOrKill = function (actor, duration, isBoss) {
    if (!isBoss) {
        // Bosses have special hit messages.
        Main.getEntity('message').Message.pushMsg(Main.text.npcHit(actor));
    }

    if (Main.getEntity('pc').Inventory.getIsDead()) {
        Main.getEntity('message').Message.pushMsg(Main.text.action('die'));
        Main.getEntity('message').Message.pushMsg(Main.text.lastWords());
        // Print 'The End' in the modeline.
        Main.getEntity('message').Message.setModeline(Main.text.action('end'));
    } else {
        Main.system.unlockEngine(duration);
    }
};

Main.system.npcSearchOrWait = function (actor, duration) {
    if (Main.system.getDistance(actor, Main.getEntity('pc'))
        <= actor.Position.getRange()) {
        // Search the unseen PC.
        Main.system.npcMoveRandomly(actor, duration);
    } else {
        // Wait 1 turn.
        Main.system.unlockEngine(actor.ActionDuration.getDuration('base'));
    }
};

Main.system.pcIsInsideAttackRange = function (actor) {
    // Some enemies can hit the PC in a straight line with an extend range.
    if (actor.CombatRole.getExtendRange()
        && Main.system.pcIsInStraightLine(actor)
    ) {
        return Main.system.getDistance(actor, Main.getEntity('pc'))
            <= actor.AttackRange.getRange('extend');
    }

    return Main.system.getDistance(actor, Main.getEntity('pc'))
        <= actor.AttackRange.getRange('base');
};

Main.system.pcIsInStraightLine = function (actor) {
    let isInStraightLine
        = actor.Position.getX() === Main.getEntity('pc').Position.getX()
        || actor.Position.getY() === Main.getEntity('pc').Position.getY();

    return isInStraightLine;
};

Main.system.npcHasAlliesInCloseRange = function (actor) {
    let count = 0;
    let minimum = 2;

    Main.getEntity('dungeon').fov.compute(
        actor.Position.getX(),
        actor.Position.getY(),
        3,
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
