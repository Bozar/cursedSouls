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

// ----- Initialization +++++
window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert(Main.text.error('browser'))
    return
  }
  document.getElementById('game').appendChild(Main.display.getContainer())

  // Main.display.clear()
  // Main.screens.main.enter()
}
