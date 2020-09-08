import {
  updateStatus
} from '../untils/fn'
export default class Justify {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '左对齐',
      name: 'justifyLeft'
    }, props)
  }

  init () {
    // this._bind()
  }

  _bind () {
  }

  initCommand () {
    console.log(this.name)
    document.execCommand(this.name, false)
  }
}
