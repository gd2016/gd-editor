export default class Bold {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '小标题',
      onoff: false
    }, props)
  }
  init () {
    this.editor.contentContainer.addEventListener('click', this._updateToolStatus.bind(this))
    this.editor.contentContainer.addEventListener('keydown', this._updateToolStatus.bind(this))
    this.editor.contentContainer.addEventListener('keyup', this._handleKeyUp.bind(this))
  }
  initCommand () {
    const selectNode = this.editor.selection && this.editor.selection.endContainer
    if (!selectNode) return
    this.onoff = !this._updateToolStatus()
    if (this.onoff) {
      if (selectNode.nodeName === '#text') {
        const txt = selectNode.data
        const p = document.createElement('p')
        p.innerHTML = txt
        p.classList.add('bold')
        selectNode.parentNode.replaceChild(p, selectNode)
        this.editor._setRange(p)
      } else if (selectNode.nodeName === 'P') {
        selectNode.classList.add('bold')
      }
      this._updateTool(true)
    } else {
      if (selectNode.nodeName === '#text') {
        selectNode.parentNode.classList.remove('bold')
      } else if (selectNode.nodeName === 'P') {
        selectNode.classList.remove('bold')
      }
      this._updateTool(false)
    }
  }

  _updateToolStatus () {
    const selectNode = this.editor.selection && this.editor.selection.endContainer
    if (!selectNode) return
    if (selectNode.nodeName === '#text') {
      if (selectNode.parentNode.classList.contains('bold')) {
        return this._updateTool(true)
      } else {
        return this._updateTool(false)
      }
    } else if (selectNode.nodeName === 'P') {
      if (selectNode.classList.contains('bold')) {
        return this._updateTool(true)
      } else {
        return this._updateTool(false)
      }
    }
  }

  _updateTool (bool) {
    bool && this.editor.toolbarDom.querySelector('.dls-bold-icon-container').classList.add('active')
    !bool && this.editor.toolbarDom.querySelector('.dls-bold-icon-container').classList.remove('active')
    return bool
  }
  _handleKeyUp (e) {
    if (e.code === 'Backspace') {
      const span = this.editor.contentContainer.querySelector('span')
      if (!span) return
      const parentNode = span.parentNode
      let afterDelete = parentNode.innerHTML.replace(span.outerHTML, span.innerHTML)
      parentNode.innerHTML = afterDelete
    }
  }
}
