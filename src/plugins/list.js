export default class List {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '无序列表',
      name: 'ul'
    }, props)
  }
  initCommand () {
    const selectNode = this.editor.selection && this.editor.selection.endContainer
    const style = ['h1', 'h2', 'refer']
    let isStyle
    if (selectNode.nodeName === '#text') {
      isStyle = selectNode.parentNode.className
    } else {
      isStyle = selectNode.className
    }
    if (!selectNode || (isStyle && style.indexOf(isStyle) !== -1)) return
    const icon = this.editor.toolbarDom.querySelector(`.dls-${this.name}-icon-container`)
    const onoff = icon.classList.contains('active')
    if (this.name === 'ul') {
      document.execCommand('insertUnorderedList')
    } else {
      document.execCommand('insertOrderedList')
    }
    this.editor._getSelection()
    onoff && icon.classList.remove('active')
    !onoff && icon.classList.add('active')
  }
}
