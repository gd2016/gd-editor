import {
  updateStatus
} from '../untils/fn'
export default class Undo {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '撤销',
      name: 'undo'
    }, props)
    updateStatus(this.name, false)
  }

  init () {
    this._bind()
  }

  _bind () {
    this.keyup = this._onKeyup.bind(this)
    this.editor.contentContainer.addEventListener('keyup', this.keyup)
  }

  _onKeyup () {
    updateStatus(this.name, true)
    updateStatus('redo', false)
    this.editor.contentContainer.removeEventListener('keyup', this.keyup)
  }

  initCommand () {
    updateStatus('redo', true)
    document.execCommand('undo')
    if (!document.execCommand('undo')) {
      updateStatus(this.name, false)
      this._bind()
    } else {
      document.execCommand('redo')
    }
  }
}
