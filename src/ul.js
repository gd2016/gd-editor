export default class List {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '无序列表',
      onoff: false,
      name: 'ul'
    }, props)
  }
  _updateStatus () {
    const selectNode = this.editor.selection && this.editor.selection.endContainer
    if (!selectNode) return
    let nodeName
    if (selectNode.nodeName === '#text') {
      nodeName = selectNode.parentNode.nodeName
    }
    if (selectNode.nodeName === 'P') {
      nodeName = selectNode.nodeName
    }
    if (nodeName === 'P') {
      this.editor.toolbarDom.querySelector(`.dls-${this.name}-icon-container`).classList.add('active')
      return true
    } else {
      this.editor.toolbarDom.querySelector(`.dls-${this.name}-icon-container`).classList.remove('active')
      return false
    }
  }
  initCommand () {
    const selectNode = this.editor.selection && this.editor.selection.endContainer

    let isStyle
    if (selectNode.nodeName === '#text') {
      isStyle = selectNode.parentNode.className
    } else {
      isStyle = selectNode.className
    }
    if (selectNode.nodeName.toLocaleLowerCase() === 'ol' && this.name !== 'ol') return
    if (selectNode.nodeName.toLocaleLowerCase() === 'ul' && this.name !== 'ul') return
    if (!selectNode || (isStyle && isStyle !== this.name)) return
    this.onoff = !this._updateStatus()
    if (this.onoff) {
      let p = document.createElement('p')
      p.innerText = selectNode.data || selectNode.innerText
      if (selectNode.nodeName.toLocaleLowerCase() === this.name) {
        this.editor.insertAfter(p, selectNode)
      }
      if (selectNode.nodeName === 'LI') {
        this.editor.insertAfter(p, selectNode.parentNode)
      }
      if (selectNode.nodeName === '#text') {
        this.editor.insertAfter(p, selectNode.parentNode.parentNode)
        selectNode.parentNode.parentNode.removeChild(selectNode.parentNode)
      }
      selectNode.parentNode.removeChild(selectNode)
      this.editor._setRange(p)
    } else {
      let ul = document.createElement(this.name)
      let selectStr
      if (selectNode.nodeName === '#text') {
        selectStr = selectNode.data
      }
      if (selectNode.nodeName === 'P' && selectNode.children.length > 1) return // 列表内容为空时点击回车 再点击列表bug
      if (selectNode.nodeName === 'P') {
        selectStr = selectNode.innerText
      }
      selectNode.parentNode.replaceChild(ul, selectNode)
      ul.innerHTML = `<li class=${this.name}>${selectStr}</li>`
      this.editor._setRange(ul)
    }
  }
}
