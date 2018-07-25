'use strict';

// ===============
// Store entities.
// ===============

Main.entities = new Map();

// Key: ID, value: object.
Main.entities.set('npc', new Map());
Main.entities.set('orb', new Map());

// =======================
// Create a single entity.
// =======================

Main.entity = {};
Main.getEntity = function (id) { return Main.entities.get(id); };

Main.entity.message = function () {
    let e = new Main.Factory('message');

    e.addComponent(new Main.Component.Message());

    Main.entities.set('message', e);
};

Main.entity.seed = function () {
    let e = new Main.Factory('seed');

    e.addComponent(new Main.Component.Seed());

    Main.entities.set('seed', e);
};

Main.entity.dungeon = function () {
    let e = new Main.Factory('dungeon');
    e.addComponent(new Main.Component.Dungeon());

    let cycle = 0;

    do {
        cellular();
        cycle++;
    } while (floorArea() < e.Dungeon.getFloorArea()[0]
        || floorArea() > e.Dungeon.getFloorArea()[1]);

    Main._log.floor = floorArea();
    Main._log.cycle = cycle;

    e.light = function (x, y) {
        return e.Dungeon.getTerrain().get(x + ',' + y) === 0;
    };
    e.fov = new ROT.FOV.PreciseShadowcasting(e.light);

    Main.entities.set('dungeon', e);

    // Helper functions
    function cellular() {
        let cell = new ROT.Map.Cellular(
            e.Dungeon.getWidth(), e.Dungeon.getHeight());

        cell.randomize(0.5);
        for (let i = 0; i < 5; i++) { cell.create(); }
        cell.connect(function (x, y, wall) {
            e.Dungeon.getTerrain().set(x + ',' + y, wall);
        });
    }

    function floorArea() {
        let floor = 0;

        for (const keyValue of e.Dungeon.getTerrain()) {
            if (keyValue[1] === 0) {
                floor++;
            }
        }

        return Math.floor(
            floor / (e.Dungeon.getWidth() * e.Dungeon.getHeight()) * 100);
    }
};

Main.entity.gameProgress = function () {
    let e = new Main.Factory('gameProgress');

    e.addComponent(new Main.Component.BossFight());
    e.addComponent(new Main.Component.Achievement());

    Main.entities.set('gameProgress', e);
};

Main.entity.pc = function () {
    let e = new Main.Factory('pc');

    e.addComponent(new Main.Component.Position(5));
    e.addComponent(new Main.Component.Display('@'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(6));
    e.addComponent(new Main.Component.Damage(1));
    e.addComponent(new Main.Component.DropRate());
    e.addComponent(new Main.Component.AttackRange());
    e.addComponent(new Main.Component.FastMove());

    e.Display.setColor('die', 'grey');
    e.Damage.setDamage('nuke', 9);

    e.AttackRange.setRange('fire', 1);
    e.AttackRange.setRange('ice', 0);
    e.AttackRange.setRange('slime', 2);
    e.AttackRange.setRange('lump', 2);
    e.AttackRange.setRange('nuke', 5);

    e.act = Main.system.pcAct;

    Main.entities.set('pc', e);
};

Main.entity.dummy = function (x, y) {
    let e = new Main.Factory('dummy');

    e.addComponent(new Main.Component.Position(5, x, y));
    e.addComponent(new Main.Component.Display('d'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(1, 'slime'));
    e.addComponent(new Main.Component.HitPoint(1));
    e.addComponent(new Main.Component.Damage(1));
    e.addComponent(new Main.Component.AttackRange(1));
    e.addComponent(new Main.Component.CombatRole(false, false));

    e.act = Main.system.dummyAct;

    Main.entities.get('npc').set(e.getID(), e);

    return e;
};

Main.entity.rat = function (x, y) {
    let e = new Main.Factory('rat');

    e.addComponent(new Main.Component.Position(5, x, y));
    e.addComponent(new Main.Component.Display('r'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(1, 'slime'));
    e.addComponent(new Main.Component.HitPoint(1));
    e.addComponent(new Main.Component.Damage(1));
    e.addComponent(new Main.Component.AttackRange(1));
    e.addComponent(new Main.Component.CombatRole(false, false));

    e.act = Main.system.dummyAct;

    Main.entities.get('npc').set(e.getID(), e);

    return e;
};

Main.entity.dog = function (x, y) {
    let e = new Main.Factory('dog');

    e.addComponent(new Main.Component.Position(7, x, y));
    e.addComponent(new Main.Component.Display('d'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(1, 'fire'));
    e.addComponent(new Main.Component.HitPoint(2));
    e.addComponent(new Main.Component.Damage(1));
    e.addComponent(new Main.Component.AttackRange(1));
    e.addComponent(new Main.Component.CombatRole(false, false));

    e.act = Main.system.dummyAct;

    Main.entities.get('npc').set(e.getID(), e);

    return e;
};

Main.entity.raven = function (x, y) {
    let e = new Main.Factory('raven');

    e.addComponent(new Main.Component.Position(5, x, y));
    e.addComponent(new Main.Component.Display('v'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(1, 'ice'));
    e.addComponent(new Main.Component.HitPoint(1));
    e.addComponent(new Main.Component.Damage(1));
    e.addComponent(new Main.Component.AttackRange(1));
    e.addComponent(new Main.Component.CombatRole(true, false));

    e.ActionDuration.setDuration('fastMove', 0.5);

    e.act = Main.system.dummyAct;

    Main.entities.get('npc').set(e.getID(), e);

    return e;
};

Main.entity.zombie = function (x, y) {
    let e = new Main.Factory('zombie');

    e.addComponent(new Main.Component.Position(5, x, y));
    e.addComponent(new Main.Component.Display('z'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(1, 'lump'));
    e.addComponent(new Main.Component.HitPoint(3));
    e.addComponent(new Main.Component.Damage(1));
    e.addComponent(new Main.Component.AttackRange(1));
    e.addComponent(new Main.Component.CombatRole(false, false));

    e.ActionDuration.setDuration('slowMove', 1.5);

    e.act = Main.system.dummyAct;

    Main.entities.get('npc').set(e.getID(), e);

    return e;
};

Main.entity.archer = function (x, y) {
    let e = new Main.Factory('archer');

    e.addComponent(new Main.Component.Position(5, x, y));
    e.addComponent(new Main.Component.Display('a'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(1, 'lump'));
    e.addComponent(new Main.Component.HitPoint(1));
    e.addComponent(new Main.Component.Damage(2));
    e.addComponent(new Main.Component.AttackRange(2));
    e.addComponent(new Main.Component.CombatRole(true, true));

    e.AttackRange.setRange('extend', 3);

    e.act = Main.system.dummyAct;

    Main.entities.get('npc').set(e.getID(), e);

    return e;
};

Main.entity.gargoyle = function (x, y) {
    let e = new Main.Factory('gargoyle');

    e.addComponent(new Main.Component.Position(9, x, y));
    e.addComponent(new Main.Component.Display('G'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(1, 'lump'));
    e.addComponent(new Main.Component.HitPoint(5));
    e.addComponent(new Main.Component.Damage(1));
    e.addComponent(new Main.Component.AttackRange(1));
    e.addComponent(new Main.Component.CombatRole(false, true));

    e.ActionDuration.setDuration('slowMove', 1.2);
    e.ActionDuration.setDuration('slowAttack', 1.2);
    e.Damage.setDamage('high', 2);
    e.AttackRange.setRange('extend', 2);
    e.CombatRole.setRole('isBoss', true);
    e.CombatRole.setRole('hasTail', true);
    e.CombatRole.setRole('hasSummoned', false);

    e.act = Main.system.gargoyleAct;

    Main.entities.get('npc').set(e.getID(), e);

    return e;
};

Main.entity.juvenileGargoyle = function (x, y) {
    let e = new Main.Factory('juvenileGargoyle');

    e.addComponent(new Main.Component.Position(9, x, y));
    e.addComponent(new Main.Component.Display('g'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(1, 'lump'));
    e.addComponent(new Main.Component.HitPoint(2));
    e.addComponent(new Main.Component.Damage(1));
    e.addComponent(new Main.Component.AttackRange(1));
    e.addComponent(new Main.Component.CombatRole(false, false));

    e.Damage.setDamage('high', 2);
    e.CombatRole.setRole('isBoss', true);
    e.CombatRole.setRole('hasTail', true);

    e.act = Main.system.gargoyleAct;

    Main.entities.get('npc').set(e.getID(), e);

    return e;
};

Main.entity.marker = function () {
    let e = new Main.Factory('marker');

    e.addComponent(new Main.Component.Position());
    e.addComponent(new Main.Component.Display('X', 'orange', true));

    Main.entities.set('marker', e);
};

Main.entity.downstairs = function () {
    let e = new Main.Factory('downstairs');

    e.addComponent(new Main.Component.Position(5));
    e.addComponent(new Main.Component.Display('>', 'orange', true));

    Main.entities.set('downstairs', e);
};

Main.entity.timer = function () {
    let e = new Main.Factory('timer');

    e.scheduler = new ROT.Scheduler.Action();
    e.engine = new ROT.Engine(e.scheduler);

    Main.entities.set('timer', e);
};

Main.entity.orb = function (orbName) {
    let e = new Main.Factory(orbName);
    let orbChar = '';

    switch (orbName) {
        case 'fire':
            orbChar = 'F';
            break;
        case 'ice':
            orbChar = 'I';
            break;
        case 'slime':
            orbChar = 'S';
            break;
        case 'lump':
            orbChar = 'L';
            break;
    }

    e.addComponent(new Main.Component.Position(0));
    e.addComponent(new Main.Component.Display(orbChar, 'green', true));
    e.addComponent(new Main.Component.Memory());

    Main.entities.get('orb').set(e.getID(), e);

    return e.getID();
};

Main.entity.wisp = function (x, y) {
    let e = new Main.Factory('wisp');

    e.addComponent(new Main.Component.Position(5, x, y));
    e.addComponent(new Main.Component.Display('w'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(1, 'ice'));
    e.addComponent(new Main.Component.HitPoint(1));
    e.addComponent(new Main.Component.Damage(1, 2));
    e.addComponent(new Main.Component.AttackRange(1));
    e.addComponent(new Main.Component.CombatRole(false, false));

    e.ActionDuration.setDuration('fastMove', 0.6);

    e.act = Main.system.dummyAct;

    Main.entities.get('npc').set(e.getID(), e);

    return e;
};

Main.entity.ratMan = function (x, y) {
    let e = new Main.Factory('ratMan');

    e.addComponent(new Main.Component.Position(7, x, y));
    e.addComponent(new Main.Component.Display('m'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(1, 'fire'));
    e.addComponent(new Main.Component.HitPoint(2));
    e.addComponent(new Main.Component.Damage(2));
    e.addComponent(new Main.Component.AttackRange(1));
    e.addComponent(new Main.Component.CombatRole(false, false));

    e.ActionDuration.setDuration('slowMove', 1.5);

    e.act = Main.system.dummyAct;

    Main.entities.get('npc').set(e.getID(), e);

    return e;
};

Main.entity.cultist = function (x, y) {
    let e = new Main.Factory('cultist');

    e.addComponent(new Main.Component.Position(5, x, y));
    e.addComponent(new Main.Component.Display('c'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory(1, 'lump'));
    e.addComponent(new Main.Component.HitPoint(2));
    e.addComponent(new Main.Component.Damage(1, 2));
    e.addComponent(new Main.Component.AttackRange(2));
    e.addComponent(new Main.Component.CombatRole(false, false));

    e.ActionDuration.setDuration('slowAttack', 1.2);
    e.CombatRole.setRole('curse', true);

    e.act = Main.system.dummyAct;

    Main.entities.get('npc').set(e.getID(), e);

    return e;
};
