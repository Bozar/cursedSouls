'use strict'

// ----- Version number, development switch, seed & color +++++
var Main = {}
Main._version = '0.0.1-dev'
Main._develop = true
Main.getVersion = function () { return this._version }
Main.getDevelop = function () { return this._develop }
Main.setDevelop = function () { this._develop = !this._develop }

// set seed manually for testing, '#' can be omitted
// there are no hyphens ('-') inside numbered seed
// example:
// Main._devSeed = '#12345'
Main.getDevSeed = function () { return this._devSeed }

Main._color = new Map()
Main._color.set('white', '#ABB2BF')
Main._color.set('black', '#262626')
Main._color.set('grey', '#666666')
Main._color.set('orange', '#FF9900')

Main.getColor = function (color) { return Main._color.get(color) }

// ----- The position & size of screen elements +++++
Main.UI = function (width, height) {
  this._width = width || null
  this._height = height || null

  this._x = null
  this._y = null
}

Main.UI.prototype.getWidth = function () { return this._width }
Main.UI.prototype.getHeight = function () { return this._height }
Main.UI.prototype.getX = function () { return this._x }
Main.UI.prototype.getY = function () { return this._y }

Main.UI.canvas = new Main.UI(70, 26)

Main.display = new ROT.Display({
  width: Main.UI.canvas.getWidth(),
  height: Main.UI.canvas.getHeight(),
  fg: Main.getColor('white'),
  bg: Main.getColor('black'),
  fontSize: 20,
  fontFamily: (function () {
    let family = 'dejavu sans mono'
    family += ', consolas'
    family += ', monospace'

    return family
  }())
})

// ``` The main screen +++
Main.UI.padTopBottom = 0.5
Main.UI.padLeftRight = 1
Main.UI.padModeStatus = 1
Main.UI.padModeMessage = 0
Main.UI.padMessageDungeon = 1

Main.UI.status = new Main.UI(13, null)
Main.UI.status._height = Main.UI.canvas.getHeight() - Main.UI.padTopBottom * 2
Main.UI.status._x = Main.UI.canvas.getWidth() -
  Main.UI.padLeftRight - Main.UI.status.getWidth()
Main.UI.status._y = Main.UI.padTopBottom

Main.UI.modeline = new Main.UI(null, 1)
Main.UI.modeline._width = Main.UI.canvas.getWidth() - Main.UI.padLeftRight * 2 -
  Main.UI.padModeStatus - Main.UI.status.getWidth()
Main.UI.modeline._x = Main.UI.padLeftRight
Main.UI.modeline._y = Main.UI.canvas.getHeight() - Main.UI.padTopBottom -
  Main.UI.modeline.getHeight()

Main.UI.message = new Main.UI(Main.UI.modeline.getWidth(), 5)
Main.UI.message._x = Main.UI.modeline.getX()
Main.UI.message._y = Main.UI.modeline.getY() - Main.UI.padModeMessage -
  Main.UI.message.getHeight()

Main.UI.dungeon = new Main.UI(Main.UI.modeline.getWidth(), null)
Main.UI.dungeon._height = Main.UI.canvas.getHeight() - Main.UI.padTopBottom -
  Main.UI.modeline.getHeight() - Main.UI.padModeMessage -
  Main.UI.message.getHeight() - Main.UI.padMessageDungeon
// the dungeon size should be an integer
Main.UI.dungeon._height = Math.floor(Main.UI.dungeon._height)
Main.UI.dungeon._x = Main.UI.padLeftRight
Main.UI.dungeon._y = Main.UI.padTopBottom

// ``` UI blocks +++

// ----- Screen factory: display content, listen keyboard events +++++
Main.Screen = function (name, mode) {
  this._name = name || 'Unnamed Screen'
  this._mode = mode || 'main'
  this._modeLineText = ''
}

Main.Screen.prototype.getName = function () { return this._name }
Main.Screen.prototype.getMode = function () { return this._mode }
Main.Screen.prototype.getText = function () { return this._modeLineText }

Main.Screen.prototype.setMode = function (mode, text) {
  this._mode = mode || 'main'
  this._modeLineText = Main.text.modeLine(this._mode) + (text || '')
}

Main.Screen.prototype.enter = function () {
  Main.screens._currentName = this.getName()
  Main.screens._currentMode = this.getMode()

  this.initialize(this.getName())
  this.display()
}

Main.Screen.prototype.exit = function () {
  Main.screens._currentName = null
  Main.screens._currentMode = null

  Main.display.clear()
}

Main.Screen.prototype.initialize = function (name) {
  Main.getDevelop() && console.log('Enter screen: ' + name + '.')
}

Main.Screen.prototype.display = function () {
  Main.display.drawText(1, 1, 'Testing screen')
  Main.display.drawText(1, 2, 'Name: ' + Main.screens._currentName)
  Main.display.drawText(1, 3, 'Mode: ' + Main.screens._currentMode)
}

Main.Screen.prototype.keyInput = function (e) {
  Main.getDevelop() && console.log('Key pressed: ' + e.key)
}

// ----- In-game screens & helper functions +++++
Main.screens = {}
Main.screens._currentName = null
Main.screens._currentMode = null

// ``` Helper functions +++
Main.screens.colorfulText = function (text, fgColor, bgColor) {
  return bgColor
    ? '%c{' + Main.getColor(fgColor) + '}%b{' +
    Main.getColor(bgColor) + '}' + text + '%b{}%c{}'
    : '%c{' + Main.getColor(fgColor) + '}' + text + '%c{}'
}

Main.screens.drawAlignRight = function (x, y, width, text, color) {
  Main.display.drawText(x + width - text.length, y,
    color ? Main.screens.colorfulText(text, color) : text)
}

Main.screens.drawBorder = function () {
  let status = Main.UI.status
  let dungeon = Main.UI.dungeon

  for (let i = status.getY(); i < status.getHeight(); i++) {
    Main.display.draw(status.getX() - 1, i, '|')
  }
  for (let i = dungeon.getX(); i < dungeon.getWidth() + 1; i++) {
    Main.display.draw(i, dungeon.getY() + dungeon.getHeight(), '-')
  }
}

Main.screens.drawVersion = function () {
  let version = Main.getVersion()

  Main.getDevelop() && (version = 'Wiz|' + version)
  Main.screens.drawAlignRight(Main.UI.status.getX(), Main.UI.status.getY(),
    Main.UI.status.getWidth(), version, 'grey')
}

Main.screens.drawSeed = function () {
  let seed = Main.getEntity('seed').Seed.getRawSeed()
  seed = seed.replace(/^(#{0,1}\d{5})(\d{5})$/, '$1-$2')

  Main.screens.drawAlignRight(
    Main.UI.status.getX(),
    Main.UI.status.getY() + Main.UI.status.getHeight() - 1,
    Main.UI.status.getWidth(),
    seed, 'grey')
}

Main.screens.drawModeLine = function () {
  Main.display.drawText(Main.UI.modeline.getX(), Main.UI.modeline.getY(),
    Main.getEntity('message').Message.getModeline())
}

// the text cannot be longer than the width of message block
Main.screens.drawMessage = function (text) {
  let msgList = Main.getEntity('message').Message.getMsgList()
  let x = Main.UI.message.getX()
  let y = Main.UI.message.getY()

  text && msgList.push(text)
  while (msgList.length > Main.UI.message.getHeight()) {
    msgList.shift()
  }
  y += Main.UI.message.getHeight() - msgList.length

  for (let i = 0; i < msgList.length; i++) {
    Main.display.drawText(x, y + i, msgList[i])
  }
}

Main.screens.drawDungeon = function () {
  let dungeon = Main.getEntity('dungeon')
  let memory = dungeon.Dungeon.getMemory()
  let pcX = Main.getEntity('pc').Position.getX()
  let pcY = Main.getEntity('pc').Position.getY()
  let sight = Main.getEntity('pc').Position.getSight()

  if (dungeon.Dungeon.getFov()) {
    if (memory.length > 0) {
      for (let i = 0; i < memory.length; i++) {
        drawTerrain(
          memory[i].split(',')[0],
          memory[i].split(',')[1],
          'grey')
      }
    }

    dungeon.fov.compute(pcX, pcY, sight, function (x, y) {
      memory.indexOf(x + ',' + y) < 0 && memory.push(x + ',' + y)
      drawTerrain(x, y, 'white')
    })
  } else {
    for (const keyValue of dungeon.Dungeon.getTerrain()) {
      drawTerrain(
        keyValue[0].split(',')[0],
        keyValue[0].split(',')[1],
        'white')
    }
  }

  function drawTerrain (x, y, color) {
    x = Number.parseInt(x, 10)
    y = Number.parseInt(y, 10)

    Main.display.draw(
      x + Main.UI.dungeon.getX() + dungeon.Dungeon.getPadding(),
      y + Main.UI.dungeon.getY() + dungeon.Dungeon.getPadding(),
      Main.system.isFloor(x, y) ? '.' : '#',
      Main.getColor(color))
  }
}

// ``` In-game screens +++
Main.screens.main = new Main.Screen('main')

// Main.screens.main.initialize = function () {
//   Main.entity.seed()
//   Main.getEntity('seed').Seed.setSeed(Main.getDevSeed())
//   ROT.RNG.setSeed(Main.getEntity('seed').Seed.getSeed())

//   Main.entity.dungeon()
//   Main.entity.message()

//   Main.entity.pc()

//   Main.entity.timer()
//   Main.getEntity('timer').scheduler.add(Main.getEntity('pc'), true)
//   Main.getEntity('timer').engine.start()

//   Main.system.placePC()
//   Main.system.placeItem()

//   Main.getEntity('message').Message.getMsgList().push(
//     Main.text.tutorial('move'))
// }

Main.screens.main.display = function () {
  Main.screens.drawBorder()
  Main.screens.drawVersion()
  // Main.screens.drawStatus()
  // Main.screens.drawSeed()

  // Main.screens.drawDungeon()
  // Main.screens.drawItem()
  // Main.screens.drawActor(Main.getEntity('pc'))

  // Main.screens.drawMessage()
  // Main.screens.drawModeLine()
}

// ----- Initialization +++++
window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert(Main.text.error('browser'))
    return
  }
  document.getElementById('game').appendChild(Main.display.getContainer())

  Main.display.clear()
  Main.screens.main.enter()
}
