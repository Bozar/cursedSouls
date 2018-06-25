'use strict';

Main.system.dummyAct = function () {
    let pcIsDead = false;

    Main.getEntity('timer').engine.lock();

    if (!Main.system.isInSight(this, Main.getEntity('pc'))) {
        if (Main.system.getDistance(this, Main.getEntity('pc'))
            <= this.Position.getRange()) {
            Main.system.npcMoveClose(this);
        } else {
            Main.system.unlockEngine(this.ActionDuration.getWait());
        }
    } else if (Main.system.getDistance(this, Main.getEntity('pc'))
        <= this.AttackRange.getRange('base')) {
        pcIsDead = Main.system.pcTakeDamage(this.Damage.getDamage());

        Main.getEntity('message').Message.pushMsg(Main.text.npcHit(this));

        if (pcIsDead) {
            Main.getEntity('message').Message.pushMsg(Main.text.action('die'));
            Main.getEntity('message').Message.pushMsg(Main.text.lastWords());
            Main.getEntity('message').Message.pushMsg(Main.text.action('end'));
        } else {
            Main.system.unlockEngine(this.ActionDuration.getAttack());
        }
    } else {
        if (Main.system.getDistance(this, Main.getEntity('pc'))
            > this.AttackRange.getRange('base')) {
            Main.system.npcMoveClose(this);
        } else {
            Main.system.npcKeepDistance(this);
        }
    }
};

Main.system.npcMoveClose = function (actor) {
    Main.system.npcDecideNextStep(actor, 'moveClose');
};

Main.system.npcMoveAway = function (actor) {
    Main.system.npcDecideNextStep(actor, 'moveAway');
};

Main.system.npcKeepDistance = function (actor) {
    Main.system.npcDecideNextStep(actor, 'keepDistance');
};

Main.system.npcDecideNextStep = function (actor, nextStep) {
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

    let currentDistance = Main.system.getDistance(actor, Main.getEntity('pc'));
    let newDistanceMap = new Map();
    let newPosition = [];
    let checkFirst = [];
    let checkNext = [];

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
                }
            });
            break;
    }

    // 5-6: Decide where to go.
    if (checkFirst.length > 0) {
        newPosition
            = checkFirst[Math.floor(checkFirst.length * ROT.RNG.getUniform())]
                .split(',');
    } else {
        newPosition
            = checkNext[Math.floor(checkNext.length * ROT.RNG.getUniform())]
                .split(',');
    }

    newPosition = [
        Number.parseInt(newPosition[0], 10),
        Number.parseInt(newPosition[1], 10)
    ];

    // 6-6: Change the actor's position and unlock the engine.
    actor.Position.setX(newPosition[0]);
    actor.Position.setY(newPosition[1]);
    Main.system.unlockEngine(actor.ActionDuration.getMove());
};
