'use strict'

Main.system = {}

Main.system.isFloor = function (x, y) {
  return Main.getEntity('dungeon').Dungeon.getTerrain().get(x + ',' + y) === 0
}

Main.system.placePC = function () {
  let x = null
  let y = null
  let width = Main.getEntity('dungeon').Dungeon.getWidth()
  let height = Main.getEntity('dungeon').Dungeon.getHeight()
  let border = Main.getEntity('pc').Position.getSight()

  do {
    x = Math.floor(width * ROT.RNG.getUniform())
    y = Math.floor(height * ROT.RNG.getUniform())
  } while (!Main.system.isFloor(x, y) ||
  x < border || x > width - border ||
  y < border || y > height - border)

  Main.getEntity('pc').Position.setX(x)
  Main.getEntity('pc').Position.setY(y)
}

Main.system.isPC = function (actor) {
  return actor.getID() === Main.getEntity('pc').getID()
}
