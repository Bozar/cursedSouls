'use strict'

Main.Component = {}

Main.Component.Message = function () {
  this._name = 'Message'

  this._message = []
  this._modeline = ''

  this.getMsgList = function () { return this._message }
  this.getModeline = function () {
    let text = this._modeline
    this._modeline = ''
    return text
  }

  this.setModeline = function (text) { this._modeline = text }
  this.pushMsg = function (text) { this._message.push(text) }
}

Main.Component.Seed = function () {
  this._name = 'Seed'

  this._seed = null       // to start the RNG engine
  this._rawSeed = null    // player's input

  this.getSeed = function () { return this._seed }
  this.getRawSeed = function () { return this._rawSeed }
  this.setSeed = function (seed) {
    if (!seed) {
      this._seed =
        Math.floor((Math.random() * 9 + 1) * Math.pow(10, 9)).toString()
      this._rawSeed = this._seed
    } else {
      this._seed = seed.toString().replace(/^#{0,1}(.+)$/, '$1')
      this._rawSeed = seed
    }
  }
}

Main.Component.Dungeon = function () {
  this._name = 'Dungeon'

  this._width = Main.UI.dungeon.getWidth() - 2
  this._height = Main.UI.dungeon.getHeight() - 2
  this._padding = 1           // do not draw along the UI border
  this._terrain = new Map()   // z,x,y: 0(floor) or 1(wall)
  this._memory = []           // explored dungeon
  this._hasFov = true         // only draw whatever the PC can see
  this._floorArea = 55            // the floor-to-wall ratio

  this.getWidth = function () { return this._width }
  this.getHeight = function () { return this._height }
  this.getPadding = function () { return this._padding }
  this.getTerrain = function () { return this._terrain }
  this.getMemory = function () { return this._memory }
  this.getFov = function () { return this._hasFov }
  this.getFloorArea = function () { return this._floorArea }

  this.setFov = function () { this._hasFov = !this._hasFov }
  this.setMemory = function (memory) { this._memory = memory }
}

Main.Component.Display = function (char, color) {
  this._name = 'Display'

  this._character = char
  this._color = Main.getColor(color || 'white')

  this.getCharacter = function () { return this._character }
  this.getColor = function () { return this._color }
}

Main.Component.Position = function (range, x, y) {
  this._name = 'Position'

  this._x = x
  this._y = y
  this._sight = range || 0   // how far one can see

  this.getX = function () { return this._x }
  this.getY = function () { return this._y }
  this.getSight = function () { return this._sight }

  this.setX = function (pos) { this._x = pos }
  this.setY = function (pos) { this._y = pos }
}

Main.Component.ActionDuration = function (move) {
  this._name = 'ActionDuration'

  this._move = move || 1
  this._useOrb = 1
  this._pickUpOrb = 1
  this._wait = 1

  this.getMove = function () { return this._move }
  this.getUseOrb = function () { return this._useOrb }
  this.getPickUpOrb = function () { return this._pickUpOrb }
  this.getWait = function () { return this._wait }
}
