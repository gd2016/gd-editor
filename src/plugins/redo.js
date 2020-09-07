import {
  updateStatus
} from '../untils/fn'
export default class Redo {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '重做',
      name: 'redo',
      first: true
    }, props)
    updateStatus(this.name, false)
  }

  initCommand () {
    updateStatus('undo', true)
    document.execCommand('redo')
    if (!document.execCommand('redo')) updateStatus(this.name, false)
    else {
      document.execCommand('undo')
    }
  }
}
