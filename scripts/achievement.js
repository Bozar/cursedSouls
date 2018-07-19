'use strict';

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

Main.system.achievementBreakTail = function (actor, attackType) {
    if (actor.getEntityName() === 'gargoyle'
        && attackType === 'fire') {
        if (actor.CombatRole.getRole('hasTail')) {
            actor.CombatRole.setRole('hasTail', false);

            Main.getEntity('message').Message.pushMsg(
                Main.text.action('breakTail')
            );
            // TODO: unlock the related achievement.
        }
    }
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
