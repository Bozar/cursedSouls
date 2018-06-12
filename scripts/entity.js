'use strict';

// ===============
// Store entities.
// ===============

Main.entities = new Map();
Main.entities.set('message', null);
Main.entities.set('seed', null);
Main.entities.set('dungeon', null);
Main.entities.set('pc', null);
Main.entities.set('marker', null);

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

    e.Dungeon.setPercent(floorArea());
    e.Dungeon.setCycle(cycle);

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

Main.entity.pc = function () {
    let e = new Main.Factory('pc');

    e.addComponent(new Main.Component.Position(5));
    e.addComponent(new Main.Component.Display('@'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory());

    e.act = Main.system.pcAct;

    Main.entities.set('pc', e);
};

Main.entity.dummy = function (x, y) {
    let e = new Main.Factory('dummy');

    e.addComponent(new Main.Component.Position(5, x, y));
    e.addComponent(new Main.Component.Display('d'));
    e.addComponent(new Main.Component.ActionDuration());
    e.addComponent(new Main.Component.Inventory('slime'));
    e.addComponent(new Main.Component.HitPoint(1));

    e.act = Main.system.dummyAct;

    Main.entities.get('npc').set(e.getID(), e);
};

Main.entity.marker = function () {
    let e = new Main.Factory('marker');

    e.addComponent(new Main.Component.Position());
    e.addComponent(new Main.Component.Display('X', 'orange'));

    Main.entities.set('marker', e);
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
    e.addComponent(new Main.Component.Display(orbChar, Main.getOrbColor()));

    Main.entities.get('orb').set(e.getID(), e);
};
