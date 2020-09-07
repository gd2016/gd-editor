import {
  insertAfter,
  getStatus,
  activeTool
} from '../untils/fn'
export default class Style {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '引用',
      onoff: false,
      type: ''
    }, props)
  }

  _replaceSelection () { // 针对选中文字做的处理
    const selecter = window.getSelection()
    let selectStr = selecter.toString()

    if (selectStr.trim == '') return

    var rang = selecter.getRangeAt(0)
    if (rang.endContainer.parentNode.nodeName === 'LI') return // 列表不允许添加样式

    const p = document.createElement('p')
    p.innerText = selectStr
    if (rang.endContainer.nodeName === '#text') {
      if (rang.endContainer.parentNode.classList.contains(this.type)) {
        rang.endContainer.parentNode.classList.remove(this.type)
        this.editor.updateTool(false, { className: this.type })
      } else {
        this._setClass(p, this.type)

        if (rang.endContainer.parentNode.className) {
          rang.deleteContents()
          insertAfter(p, rang.endContainer.parentNode)
        } else {
          p.innerText = rang.toString()
          rang.deleteContents()
          this.editor.insertNode(p)
        }

        this.editor._setRange(p)
        this.editor.updateTool(true, { className: this.type })
      }
    }
  }
  initCommand () {
    const selectNode = this.editor.selection && this.editor.selection.endContainer
    if (!selectNode) return
    this.onoff = getStatus(this.type)
    if (this.onoff) {
      document.execCommand('formatBlock', false, 'p')
    } else {
      if (selectNode.nodeName === '#text' && selectNode.parentNode.nodeName === 'LI' ||
          selectNode.nodeName === 'LI') {
        return
      }
      if (this.type === 'refer') document.execCommand('formatBlock', false, 'BLOCKQUOTE')
      else document.execCommand('formatBlock', false, this.type)
    }
    activeTool(this.type, !this.onoff)
  }
  _setClass (dom, className) {
    const classList = dom.classList
    dom.classList.remove(...classList)
    dom.classList.add(className)
  }
}
