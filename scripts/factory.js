'use strict';

// Entity factory
// http://vasir.net/blog/game-development/how-to-build-entity-component-system-in-javascript
Main.Factory = function (name) {
    this._entityName = name;
    this._id = createID();

    function createID() {
        // 12345678-{repeat}-{repeat}-{repeat}
        let randomNumber = '';

        while (randomNumber.length < 32) {
            randomNumber += (Math.random() * Math.pow(10, 8) | 0).toString(16);
        }
        return randomNumber.replace(/.{8}/g, '$&' + '-').slice(0, 35);
    }
};

Main.Factory.prototype.getID = function () { return this._id; };
Main.Factory.prototype.getEntityName = function () { return this._entityName; };

Main.Factory.prototype.addComponent = function (component, newName) {
    if (newName) {
        this[newName] = component;
    } else {
        this[component._name] = component;
    }
};
Main.Factory.prototype.removeComponent = function (name) {
    delete this[name];
};

Main.Factory.prototype.print = function () {
    console.log(JSON.stringify(this, null, 2));
};
