﻿'use strict';

// Set achievements when the game starts.
Main.system.setAchievement = function () {
    let achievements = Main.system.loadAchievements();

    achievements.forEach((value) => {
        Main.getEntity('gameProgress').Achievement.setAchievement(
            value[0], value[1] === 'true' ? true : false
        );
    });
};

Main.system.unlockAchievement = function (id) {
    Main.getEntity('gameProgress').Achievement.setAchievement(id, true);
    Main.system.saveAchievements();

    Main.getEntity('message').Message.pushMsg(
        Main.text.unlockAchievement(
            Main.text.achievementLeft(id)
        )
    );
};

Main.system.showAchievement = function () {
    Main.input.listenEvent('remove', 'main');
    Main.screens.main.exit();

    Main.screens.achievement.enter();
    Main.input.listenEvent('add', 'achievement');
};

Main.system.exitAchievement = function () {
    Main.screens.achievement.setIndex(0);

    Main.input.listenEvent('remove', 'achievement');
    Main.screens.achievement.exit();

    Main.screens.main.enter(true);
    Main.input.listenEvent('add', 'main');
};

Main.system.achievementIsLocked = function (achieveID) {
    if (Main.getEntity('gameProgress').Achievement.getAchievement()
        .has(achieveID)
    ) {
        return !Main.getEntity('gameProgress').Achievement.getAchievement(
            achieveID
        );
    }
    return false;
};

Main.system.moveCursorInAchievement = function (direction) {
    let shift = 0;
    let maxIndex
        = Main.getEntity('gameProgress').Achievement.getAchievement().size - 1;

    switch (direction) {
        case 'up':
            shift = -1;
            break;
        case 'down':
            shift = 1;
            break;
    }

    if (Main.screens.achievement.getIndex() + shift < 0) {
        Main.screens.achievement.setIndex(maxIndex);
    } else if (Main.screens.achievement.getIndex() + shift > maxIndex) {
        Main.screens.achievement.setIndex(0);
    } else {
        Main.screens.achievement.setIndex(
            Main.screens.achievement.getIndex() + shift
        );
    }

    Main.display.clear();
    Main.screens.achievement.display();
};

Main.system.checkAchBoss1Special = function (achieveID, actor, attackType) {
    if (Main.system.achievementIsLocked(achieveID)
        && actor.getEntityName() === 'gargoyle'
        && attackType === 'fire'
    ) {
        if (actor.CombatRole.getRole('hasTail')) {
            actor.CombatRole.setRole('hasTail', false);

            Main.getEntity('message').Message.pushMsg(
                Main.text.action('breakTail')
            );
            Main.system.unlockAchievement(achieveID);
            Main.system.checkAchUnlockAll();
        }
    }
};

// Call this function AFTER the boss is killed.
Main.system.checkAchBossNormal = function (boss) {
    let achieveID = null;

    switch (boss.getEntityName()) {
        case 'gargoyle':
        case 'juvenileGargoyle':
            achieveID = 'boss1Normal';
            break;
        case 'butcher':
            achieveID = 'boss2Normal';
            break;
        case 'ghoul':
            achieveID = 'boss3Normal';
            break;
        case 'giovanni':
            achieveID = 'boss4Normal';
            break;
    }

    if (Main.system.achievementIsLocked(achieveID)) {
        Main.system.unlockAchievement(achieveID);
        Main.system.checkAchUnlockAll();
    }
};

Main.system.checkAchUnlockAll = function () {
    let unlockable = true;

    if (!Main.system.achievementIsLocked('unlockAll')) {
        return;
    }

    for (let [key, value] of
        Main.getEntity('gameProgress').Achievement.getAchievement()
    ) {
        if (value === false && key !== 'unlockAll') {
            unlockable = false;
            break;
        }
    }

    if (unlockable) {
        Main.system.unlockAchievement('unlockAll');
    }
};
