export default class Style {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '引用',
      onoff: false,
      type: ''
    }, props)
  }

  init () {
    // this.editor.contentContainer.addEventListener('click', this._updateToolStatus.bind(this))
    // this.editor.contentContainer.addEventListener('keydown', this._updateToolStatus.bind(this))
  }
  _replaceSelection () {
    var selecter = window.getSelection()
    var selectStr = selecter.toString()
    if (selectStr.trim != '') {
      var rang = selecter.getRangeAt(0)
      // return console.dir(rang.endContainer)
      if (rang.endContainer.parentNode.nodeName === 'LI') return // 列表不允许添加样式

      const p = document.createElement('p')
      p.innerText = selectStr
      if (rang.endContainer.nodeName === '#text') {
        if (rang.endContainer.parentNode.classList.contains(this.type)) {
          rang.endContainer.parentNode.classList.remove(this.type)
          // rang.surroundContents(p)
          // this.editor._setRange(p)
          this.editor.updateTool(false, { className: this.type })
        } else {
          this._setClass(p, this.type)

          if (rang.endContainer.parentNode.className) {
            rang.deleteContents()
            console.log(this.editor)

            this.editor.insertAfter(p, rang.endContainer.parentNode)
            // rang.endContainer.parentNode.parentNode.insertBefore(p, rang.endContainer.parentNode.nextSibling) // 在选中文档的节点后加入新节点
          } else {
            p.innerText = rang.toString()
            rang.deleteContents()
            this.editor.insertHtml(p)
          }

          this.editor._setRange(p)
          this.editor.updateTool(true, { className: this.type })
        }
      }
    }
  }
  initCommand () {
    if (!window.getSelection().isCollapsed) {
      return this._replaceSelection()
    }
    const selectNode = this.editor.selection && this.editor.selection.endContainer
    if (!selectNode) return
    this.onoff = !this.editor.updateToolbarStatus(this.type)
    if (this.onoff) {
      if (selectNode.nodeName === '#text' && selectNode.parentNode.nodeName === 'P') { // 父节点添加type
        this._setClass(selectNode.parentNode, this.type)
        this.editor.updateTool(true, { className: this.type })
      } else if (selectNode.nodeName === 'P') { // 只针对p标签，li标签return
        this._setClass(selectNode, this.type)
        this.editor.updateTool(true, { className: this.type })
      }
    } else {
      if (selectNode.nodeName === '#text') {
        selectNode.parentNode.classList.remove(this.type)
      } else if (selectNode.nodeName === 'P') {
        selectNode.classList.remove(this.type)
      }
      this.editor.updateTool(false, { className: this.type })
    }
  }
  _setClass (dom, className) {
    const classList = dom.classList
    dom.classList.remove(...classList)
    dom.classList.add(className)
  }
}
