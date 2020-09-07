import {
  activeTool
} from '../untils/fn'

export default class List {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '无序列表',
      name: 'ul'
    }, props)
  }
  initCommand () {
    const selection = document.getSelection().getRangeAt(0)
    const selectNode = selection && selection.endContainer
    const style = ['H1', 'H2', 'BLOCKQUOTE']
    let isStyle
    if (selectNode.nodeName === '#text') {
      isStyle = selectNode.parentNode.nodeName
    } else {
      isStyle = selectNode.nodeName
    }
    if (!selectNode || (isStyle && style.indexOf(isStyle) !== -1)) return // 禁止和style不能互相切换
    const icon = this.editor.toolbarDom.querySelector(`.dls-${this.name}-icon-container`)
    const onoff = icon.classList.contains('active')
    if (this.name === 'ul') {
      document.execCommand('insertUnorderedList')
    } else {
      document.execCommand('insertOrderedList')
    }
    activeTool(this.name, !onoff)
    this.editor._getSelection()
    onoff && icon.classList.remove('active')
    !onoff && icon.classList.add('active')
  }
}
