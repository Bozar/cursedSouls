'use strict';

Main.Component = {};

Main.Component.Message = function () {
    this._name = 'Message';

    this._message = [];
    this._modeline = '';

    this.getMessage = function () { return this._message; };
    this.getModeline = function () { return this._modeline; };

    this.setModeline = function (text) { this._modeline = text; };
    this.pushMsg = function (text) { this._message.push(text); };
};

Main.Component.Seed = function () {
    this._name = 'Seed';
    // Use `_seed` to start the RNG engine.
    this._seed = null;
    // Print `_printSeed` on the screen.
    this._printSeed = null;

    this.getSeed = function () { return this._seed; };
    this.getPrintSeed = function () { return this._printSeed; };

    this.setSeed = function (seed) {
        if (!seed) {
            this._seed = (Math.random() * 9 + 1) * Math.pow(10, 9);
            this._seed = Math.floor(this._seed);
            this._seed = this._seed.toString();

            this._printSeed = this._seed;
        } else {
            // Remove the beginning `#` if the seed is set manually.
            this._seed = seed.toString().replace(/^#{0,1}(.+)$/, '$1');
            this._printSeed = seed;
        }
        // Insert hyphen to the seed string.
        this._printSeed
            = this._printSeed.replace(/^(#{0,1}\d{5})(\d{5})$/, '$1-$2');
    };
};

// Generate walls and floors in the dungeon.
Main.Component.Dungeon = function () {
    this._name = 'Dungeon';

    // The dungeon size
    this._width = Main.UI.dungeon.getWidth() - 2;
    this._height = Main.UI.dungeon.getHeight() - 2;
    // Do not draw along the UI border.
    this._padding = 1;
    // The switch to turn on/off the fog of war.
    this._hasFov = true;

    // Terrain: 'x,y' => wall (1) or floor (0)
    this._terrain = new Map();
    // Explored dungeon
    this._memory = [];

    // The percentage of the floor area
    this._floorArea = [55, 65];

    this.getWidth = function () { return this._width; };
    this.getHeight = function () { return this._height; };
    this.getPadding = function () { return this._padding; };
    this.getFov = function () { return this._hasFov; };

    this.getTerrain = function () { return this._terrain; };
    this.getMemory = function () { return this._memory; };

    this.getFloorArea = function () { return this._floorArea; };

    this.setFov = function () { this._hasFov = !this._hasFov; };
    this.setMemory = function (memory) { this._memory = memory; };
};

// Record the game progress.
Main.Component.BossFight = function () {
    this._name = 'BossFight';

    this._progress = ['inactive', 'active', 'win'];
    this._bossFight = this._progress[0];
    this._dungeonLevel = 1;
    this._maxDungeonLevel = 4;

    this.getBossFightStatus = function () { return this._bossFight; };
    this.getDungeonLevel = function () { return this._dungeonLevel; };

    this.goToNextBossFightStage = function () {
        let nextIndex = Math.min(
            this._progress.indexOf(this._bossFight) + 1,
            this._progress.length - 1);

        this._bossFight = this._progress[nextIndex];
    };

    this.goToNextDungeonLevel = function () {
        let nextLevel = Math.min(
            this._dungeonLevel + 1,
            this._maxDungeonLevel);

        this._dungeonLevel = nextLevel;
    };
};

Main.Component.Display = function (char, color, onlyOneColor) {
    this._name = 'Display';

    this._character = char;

    this._color = new Map();
    this._color.set('default', color || 'white');

    if (onlyOneColor) {
        this._color.set('orb', this._color.get('default'));
        this._color.set('downstairs', this._color.get('default'));
    } else {
        this._color.set('orb', 'green');
        this._color.set('downstairs', 'orange');
    }

    this.getCharacter = function () { return this._character; };
    this.getColor = function (color) {
        return this._color.get(color || 'default');
    };
    this.getOrbColor = function () { return this._color.get('orb'); };
    this.getDownstairsColor = function () {
        return this._color.get('downstairs');
    };

    this.setColor = function (key, value) {
        this._color.set(key, value);
    };
};

Main.Component.Position = function (range, x, y) {
    this._name = 'Position';

    this._x = x;
    this._y = y;
    // How far one can see?
    this._range = range || 0;

    this.getX = function () { return this._x; };
    this.getY = function () { return this._y; };
    this.getRange = function () { return this._range; };

    this.setX = function (pos) { this._x = pos; };
    this.setY = function (pos) { this._y = pos; };
};

Main.Component.ActionDuration = function () {
    this._name = 'ActionDuration';

    this._duration = new Map();

    // Most actions take 1 turn.
    this._duration.set('base', 1);

    this.getDuration = function (action) {
        return this._duration.get(action || 'base');
    };

    this.setDuration = function (key, value) {
        this._duration.set(key, value);
    };
};

Main.Component.Inventory = function (capacity, firstItem) {
    this._name = 'Inventory';

    this._inventory = [];
    this._capacity = capacity || 1;
    this._isDead = false;

    // Enemies have only one of the four orbs: fire, ice, slime & lump.
    // Give the PC four orbs at the beginning of the game.
    if (firstItem) {
        this._inventory.push(firstItem);
    }

    this.getCapacity = function () { return this._capacity; };
    this.getLength = function () { return this._inventory.length; };
    this.getLastOrb = function () {
        return this._inventory[this._inventory.length - 1];
    };
    this.getIsDead = function () { return this._isDead; };
    this.isEnhanced = function () {
        if (this._inventory.length > 1) {
            return this._inventory[this._inventory.length - 1]
                === this._inventory[this._inventory.length - 2];
        }
        return false;
    };

    this.getInventory = function (index) {
        if (this._inventory[index]) {
            return this._inventory[index];
        }
        return this._inventory;
    };

    this.addItem = function (item) {
        if (item && this._inventory.length < this._capacity) {
            this._inventory.push(item);
        }
    };

    this.removeItem = function (amount) {
        amount = Math.min(amount, this._inventory.length);

        for (var i = 0; i < amount - 1; i++) {
            this._inventory.pop();
        }

        return this._inventory.pop();
    };

    this.setIsDead = function (status) { this._isDead = status; };
};

Main.Component.HitPoint = function (hp) {
    this._name = 'HitPoint';

    this._hitPoint = hp;

    this.getHitPoint = function () { return this._hitPoint; };
    this.takeDamage = function (damage) { this._hitPoint -= damage; };
    this.isDead = function () { return this._hitPoint <= 0; };
};

Main.Component.Damage = function (baseDamage) {
    this._name = 'Damage';

    this._damage = new Map([['base', baseDamage || 1]]);

    this.getDamage = function (attackType) {
        return this._damage.get(attackType || 'base');
    };

    this.setDamage = function (attackType, damage) {
        this._damage.set(attackType, damage);
    };
};

Main.Component.AttackRange = function (baseRange) {
    this._name = 'AttackRange';

    this._range = new Map();

    if (baseRange) {
        this._range.set('base', baseRange);
    }

    this.getRange = function (rangeKey) {
        return this._range.get(rangeKey || 'base');
    };

    this.setRange = function (rangeKey, rangeValue) {
        this._range.set(rangeKey, rangeValue);
    };
};

Main.Component.DropRate = function () {
    this._name = 'DropRate';

    this._dropRate = new Map(
        [
            ['base', 20],
            ['fire', 100],
            ['ice', 60],
            ['lump', 60],
            ['nuke', 100]
        ]);

    this.getDropRate = function (attackType) {
        return this._dropRate.get(attackType);
    };
};

// The switch to change the NPC's AI.
Main.Component.CombatRole = function (isCautious, hasExtendRange) {
    this._name = 'CombatRole';

    this._combatRoles = new Map();

    this._combatRoles.set('cautious', isCautious || false);
    this._combatRoles.set('extendRange', hasExtendRange || false);

    this.getCautious = function () {
        return this._combatRoles.get('cautious');
    };
    this.getExtendRange = function () {
        return this._combatRoles.get('extendRange');
    };

    this.getRole = function (role) {
        return this._combatRoles.get(role);
    };

    this.setRole = function (role) {
        this._combatRoles.set('_' + role, true);
    };
};
