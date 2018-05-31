'use strict'

// ----- Store entities +++++
Main.entities = new Map()
Main.entities.set('message', null)

// ----- Create a single entity +++++
Main.entity = {}
Main.getEntity = function (id) { return Main.entities.get(id) }

Main.entity.message = function () {
  let e = new Main.Factory('message')

  e.addComponent(new Main.Component.Message())

  Main.entities.set('message', e)
}
