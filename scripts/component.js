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
