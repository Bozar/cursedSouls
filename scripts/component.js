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
    this._percent = 0;
    this._cycle = 0;

    this.getWidth = function () { return this._width; };
    this.getHeight = function () { return this._height; };
    this.getPadding = function () { return this._padding; };
    this.getFov = function () { return this._hasFov; };

    this.getTerrain = function () { return this._terrain; };
    this.getMemory = function () { return this._memory; };

    this.getFloorArea = function () { return this._floorArea; };
    this.getPercent = function () { return this._percent; };
    this.getCycle = function () { return this._cycle; };

    this.setFov = function () { this._hasFov = !this._hasFov; };
    this.setMemory = function (memory) { this._memory = memory; };
    this.setPercent = function (percent) { this._percent = percent; };
    this.setCycle = function (cycle) { this._cycle = cycle; };
};

Main.Component.Display = function (char, color, altColor) {
    this._name = 'Display';

    this._character = char;
    // [The default color,
    // the color when standing on an orb,
    // the color when standing on the downstairs]
    this._color = [
        Main.getColor(color || 'white'),
        Main.getColor(altColor || 'green'),
        Main.getColor(altColor || 'orange')];

    this.getCharacter = function () { return this._character; };
    this.getColor = function () { return this._color[0]; };
    this.getOrbColor = function () { return this._color[1]; };
    this.getDownstairsColor = function () { return this._color[2]; };
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

Main.Component.ActionDuration = function (move) {
    this._name = 'ActionDuration';

    this._move = move || 1;
    this._useOrb = 1;
    this._pickUpOrb = 1;
    this._wait = 1;

    this.getMove = function () { return this._move; };
    this.getUseOrb = function () { return this._useOrb; };
    this.getPickUpOrb = function () { return this._pickUpOrb; };
    this.getWait = function () { return this._wait; };
};

Main.Component.Inventory = function (capacity, firstItem) {
    this._name = 'Inventory';

    this._inventory = [];
    this._capacity = capacity || 1;

    // Enemies have only one of the four orbs: fire, ice, slime & lump.
    // Give the PC four orbs at the beginning of the game.
    if (firstItem) {
        this._inventory.push(firstItem);
    }

    this.getCapacity = function () { return this._capacity; };

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
};

Main.Component.HitPoint = function (hp) {
    this._name = 'HitPoint';

    this._hitPoint = hp;

    this.getHitPoint = function () { return this._hitPoint; };
    this.takeDamage = function (damage) { this._hitPoint -= damage; };
    this.isDead = function () { return this._hitPoint > 0; };
};
