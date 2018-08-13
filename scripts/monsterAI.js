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

    if (Main.system.npcCannotSeePC(this)) {
        // 1-4: Search the nearby PC or wait 1 turn.
        Main.system.npcSearchOrWait(this, moveDuration);
    } else if (Main.system.pcIsInsideAttackRange(this)) {
        // 2a-4: Curse the PC.
        if (this.CombatRole.getRole('curse')
            && Main.getEntity('pc').Inventory.canBeCursed()
        ) {
            Main.system.npcCursePC(this, true, attackDuration);
        }
        // 2b-4: Attack the PC.
        else {
            Main.system.pcTakeDamage(this.Damage.getDamage('base'));
            Main.system.npcHitOrKill(this, attackDuration);
        }
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
    if (Main.system.npcCannotSeePC(this)) {
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

        Main.system.npcHitOrKill(this, getAttackDuration(this));
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

        Main.system.npcHitOrKill(this, getAttackDuration(this));
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

Main.system.npcHitOrKill = function (actor, duration) {
    if (!actor.CombatRole.getRole('isBoss')) {
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
    if (actor.AttackRange.getRange('extend') > 0
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
            break;
        case 'wisp':
        case 'twinWisp':
        case 'cursedRat':
            if (Main.system.getDistance(actor, Main.getEntity('pc')) === 1
                && Main.getEntity('pc').Inventory.canBeCursed()
            ) {
                Main.system.npcCursePC(actor, false);
            }
            break;
    }

    // Helper functions.
    function summon(who) {
        let newActor
            = Main.entity[who](actor.Position.getX(), actor.Position.getY());

        // Delay 2 turns.
        Main.getEntity('timer').scheduler.add(newActor, true, 2);

        Main.getEntity('message').Message.pushMsg(Main.text.npcSummon(actor));
    }
};

Main.system.npcCannotSeePC = function (actor) {
    return Main.system.getDistance(actor, Main.getEntity('pc'))
        > actor.Position.getRange()
        || !Main.system.isInSight(actor, Main.getEntity('pc'));
};

Main.system.npcCursePC = function (actor, unlockEngine, duration) {
    Main.getEntity('pc').Inventory.setCurse(actor.Damage.getCurse());
    Main.getEntity('message').Message.pushMsg(Main.text.npcCurse(actor));

    if (unlockEngine) {
        Main.system.unlockEngine(duration);
    }
};

Main.system.butcherAct = function () {
    let moveDuration = this.ActionDuration.getDuration('slowMove');
    let attackDuration = this.ActionDuration.getDuration('slowAttack');
    let pullHere
        = Main.system.canPullPC(this, this.AttackRange.getRange('pull'));

    Main.getEntity('timer').engine.lock();

    // 1-3: Search the nearby PC or wait 1 turn.
    if (Main.system.npcCannotSeePC(this)) {
        Main.system.npcSearchOrWait(this, moveDuration);
    } else {
        // 2A-3: Wait 1 turn. Play the cut-scene in the PC's turn.
        if (Main.getEntity('gameProgress').BossFight.getMiniBossAppear() < 1) {
            Main.getEntity('gameProgress').BossFight.setMiniBossAppear();
            Main.system.unlockEngine(1);
        }
        // 2B-3: Cleave the PC.
        else if (Main.system.getDistance(this, Main.getEntity('pc')) === 1) {
            Main.getEntity('message').Message.pushMsg(
                Main.text.action('butcherCleave')
            );

            Main.system.pcTakeDamage(this.Damage.getDamage('cleave'));
            Main.system.npcHitOrKill(this, attackDuration);
        }
        // 2C-3: Pull the PC.
        else if (pullHere.length > 0) {
            Main.getEntity('pc').Position.setX(pullHere[0]);
            Main.getEntity('pc').Position.setY(pullHere[1]);

            Main.getEntity('message').Message.pushMsg(
                Main.text.action('butcherPull')
            );
            Main.system.pcTakeDamage(this.Damage.getDamage('base'));
            Main.system.npcHitOrKill(this, attackDuration);
        }
        // 3-3: Approach the PC in sight.
        else {
            Main.system.npcMoveClose(this, moveDuration);
        }
    }
};

Main.system.canPullPC = function (actor, pullRange) {
    let range = pullRange;
    let relativeX
        = Main.getEntity('pc').Position.getX() - actor.Position.getX();
    let relativeY
        = Main.getEntity('pc').Position.getY() - actor.Position.getY();
    let deltaX = relativeX > 0
        ? 1
        : relativeX < 0
            ? -1
            : 0;
    let deltaY = relativeY > 0
        ? 1
        : relativeY < 0
            ? -1
            : 0;
    let position = [];

    if (Main.system.getDistance(actor, Main.getEntity('pc')) > range
        || Math.abs(relativeX) > 1
        && Math.abs(relativeY) > 1
    ) {
        return [];
    }

    position.push(
        actor.Position.getX() + deltaX, actor.Position.getY() + deltaY
    );

    if (Main.system.isFloor(...position) && !Main.system.npcHere(...position)) {
        return position;
    }

    return [];
};

Main.system.ghoulAct = function () {
    let move = this.ActionDuration.getDuration('base');
    let setBomb = this.ActionDuration.getDuration('base');
    let melee = this.ActionDuration.getDuration('fastAttack');

    Main.getEntity('timer').engine.lock();

    // 1-3: Search the nearby PC or wait 1 turn.
    if (Main.system.npcCannotSeePC(this)) {
        Main.system.npcSearchOrWait(this, move);
    }
    // 2A-3: Attack the PC.
    else if (Main.system.pcIsInsideAttackRange(this)) {
        Main.getEntity('message').Message.pushMsg(
            Main.text.action('ghoulPunch')
        );
        Main.system.pcTakeDamage(this.Damage.getDamage('base'));
        Main.system.npcHitOrKill(this, melee);
    }
    // 2B-3: Set bombs.
    else if (Main.system.getDistance(this, Main.getEntity('pc'))
        <= this.AttackRange.getRange('bomb')
        && !Main.getEntity('pc').CombatRole.getRole('isFrozen')
    ) {
        Main.system.npcSetBomb(this, 'timeBomb', setBomb);
    }
    // 3-3: Approach the PC in sight.
    else {
        Main.system.npcMoveClose(this, move);
    }
};

Main.system.bombAct = function () {
    Main.getEntity('timer').engine.lock();

    if (Main.system.pcHere(this.Position.getX(), this.Position.getY())) {
        switch (this.getEntityName()) {
            case 'timeBomb':
                Main.getEntity('pc').CombatRole.setRole('isFrozen', true);
                Main.getEntity('message').Message.pushMsg(
                    Main.text.action('freezeTime')
                );
                break;
            case 'hpBomb':
                Main.system.pcTakeDamage(this.Damage.getDamage('base'));
                Main.system.npcHitOrKill(this, 1);
                break;
        }
    }
    // else if (Main.system.isInSight(this, Main.getEntity('pc'))) {
    //     Main.getEntity('message').Message.pushMsg(Main.text.bombExplode(this));
    // }

    Main.getEntity('timer').scheduler.remove(this);
    Main.getEntity('npc').delete(this.getID());

    if (!Main.getEntity('pc').Inventory.getIsDead()) {
        Main.system.unlockEngine(1);
    }
};

Main.system.npcSetBomb = function (actor, bomb, duration) {
    let pcX = Main.getEntity('pc').Position.getX();
    let pcY = Main.getEntity('pc').Position.getY();
    let surroundPC = Main.system.getSurroundPosition(pcX, pcY, 1)
        .filter((position) => {
            return Main.system.isFloor(...position)
                && !Main.system.npcHere(...position);
        });
    let maxBomb = actor.Damage.getDamage('maxBomb');

    let setHere = [];
    let candidate = [];
    let newActor = null;

    if (!Main.system.npcHere(pcX, pcY)) {
        setHere.push([pcX, pcY]);
    }

    if (setHere.length + surroundPC.length > maxBomb) {
        while (setHere.length < maxBomb) {
            candidate = surroundPC[
                Math.floor(ROT.RNG.getUniform() * surroundPC.length)
            ];
            setHere.push(candidate);
            surroundPC.splice(surroundPC.indexOf(candidate), 1);
        }
    } else {
        setHere.push(surroundPC);
    }

    setHere.forEach((here) => {
        newActor = Main.entity[bomb](here[0], here[1]);
        Main.getEntity('timer').scheduler.add(newActor, true);
    });

    Main.getEntity('message').Message.pushMsg(Main.text.setBomb(actor));

    Main.system.unlockEngine(duration);
};

Main.system.giovanniAct = function () {
    let move = this.ActionDuration.getDuration('base');
    let setBomb = this.ActionDuration.getDuration('base');

    Main.getEntity('timer').engine.lock();

    // 1-3: Search the nearby PC or wait 1 turn.
    if (Main.system.npcCannotSeePC(this)
        || this.CombatRole.getRole('justRevived')
    ) {
        Main.system.npcSearchOrWait(this, move);
        this.CombatRole.setRole('justRevived', false);
    }
    // 2A-3: Keep distance.
    else if (Main.getEntity('pc').CombatRole.getRole('isFrozen')) {
        Main.system.npcKeepDistance(
            this, move, this.AttackRange.getRange('bomb')
        );
    }
    // 2B-3: Set the Remote Bomb.
    else if (Main.system.getDistance(this, Main.getEntity('pc')) === 1) {
        Main.system.npcSetBomb(this, 'hpBomb', setBomb);
    }
    // 2C-3: Set bombs.
    else if (Main.system.getDistance(this, Main.getEntity('pc'))
        <= this.AttackRange.getRange('bomb')
    ) {
        switch (Math.floor(ROT.RNG.getUniform() * 2)) {
            case 0:
                Main.system.npcSetBomb(this, 'timeBomb', setBomb);
                break;
            case 1:
                Main.system.npcSetBomb(this, 'hpBomb', setBomb);
                break;
        }
    }
    // 3-3: Approach the PC in sight.
    else {
        Main.system.npcMoveClose(this, move);
    }
};

Main.system.reviveGiovanni = function (target) {
    let newPosition = [];
    let addOrb = [];

    // Move the PC to the downstairs.
    Main.getEntity('pc').Position.setX(
        Main.getEntity('downstairs').Position.getX()
    );
    Main.getEntity('pc').Position.setY(
        Main.getEntity('downstairs').Position.getY()
    );

    // Move Giovanni & raise HP.
    newPosition = Main.system.placeBoss(
        Main.getEntity('downstairs'),
        Main.getEntity('pc'),
        2
    );

    target.Position.setX(newPosition[0]);
    target.Position.setY(newPosition[1]);
    target.HitPoint.takeDamage(-1);
    target.CombatRole.setRole('justRevived', true);

    // Add orbs if necessary.
    if (!hasIceOrb()) {
        if (Main.getEntity('orb').size > 20) {
            Main.entities.set('orb', new Map());
        }

        addOrb = [
            Main.entity.orb('fire'),
            Main.entity.orb('ice'),
            Main.entity.orb('slime'),
            Main.entity.orb('lump')
        ];

        addOrb.forEach((orbID) => {
            Main.system.placeActor(
                Main.getEntity('orb').get(orbID),
                Main.system.verifyOrbPosition);
        });
    }

    // Forbid unlocking Giovanni's special achievement.
    Main.getEntity('gameProgress').Achievement.clearBoss4Special();

    // Print cut-scene text.
    Main.text.action('reviveGiovanni').forEach((text) => {
        Main.getEntity('message').Message.pushMsg(text);
    });

    // Helper function
    function hasIceOrb() {
        let orbName = [];

        Main.getEntity('orb').forEach((orbEntity) => {
            orbName.push(orbEntity.getEntityName());
        });

        return orbName.some((name) => { return name === 'ice'; });
    }
};
