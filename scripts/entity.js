'use strict'

// ----- Store entities +++++
Main.entities = new Map()
Main.entities.set('message', null)
Main.entities.set('seed', null)
Main.entities.set('dungeon', null)

// ----- Create a single entity +++++
Main.entity = {}
Main.getEntity = function (id) { return Main.entities.get(id) }

Main.entity.message = function () {
  let e = new Main.Factory('message')

  e.addComponent(new Main.Component.Message())

  Main.entities.set('message', e)
}

Main.entity.seed = function () {
  let e = new Main.Factory('seed')

  e.addComponent(new Main.Component.Seed())

  Main.entities.set('seed', e)
}

Main.entity.dungeon = function () {
  let e = new Main.Factory('dungeon')
  e.addComponent(new Main.Component.Dungeon())

  cellular()
  e.light = function (x, y) {
    return e.Dungeon.getTerrain().get(x + ',' + y) === 0
  }
  e.fov = new ROT.FOV.PreciseShadowcasting(e.light)

  Main.entities.set('dungeon', e)

  // helper functions
  function cellular () {
    let cell = new ROT.Map.Cellular(e.Dungeon.getWidth(), e.Dungeon.getHeight())

    cell.randomize(0.5)
    for (let i = 0; i < 5; i++) { cell.create() }
    cell.connect(function (x, y, wall) {
      e.Dungeon.getTerrain().set(x + ',' + y, wall)
    })
  }
}

Main.entity.pc = function () {
  let e = new Main.Factory('pc')

  e.addComponent(new Main.Component.Position(5))
  e.addComponent(new Main.Component.Display('@'))

  // e.act = Main.system.pcAct

  Main.entities.set('pc', e)
}
