import './index.less'

export default class MEditor {
  constructor (props) {
    Object.assign(this, {
      container: null,
      toolbar: [],
      plugins: [],
      minHeight: 200,
      maxHeight: 400000,
      content: '',
      onReady (editor) {},
      setFormat (content) { return content },
      getFormat (rs) { return rs }
    }, props)
    this._init()
  }

  _init () {
    this._initDom()
    this._initContent()
    this._initPlugins()
    this._bind()
    this.onReady(this)
  }
  _initContent () {
    if (this.content) this.setData(this.content)
  }

  _initPlugins () {
    if (this.plugins.length) {
      this.plugins.forEach(plugin => {
        const pluginName = this._toCamelCase(plugin.name)
        if (!this[pluginName]) {
          this[pluginName] = new plugin.constructor({ $editor: this })
          document.querySelector(`.dls-${plugin.name}-icon`).onclick = () => {
            this[pluginName].initCommand(this)
          }
          this[pluginName].init && this[pluginName].init(this.editor)
          // this[pluginName].command && this.editor.addCommand(this[pluginName].command, command)
          if (this[pluginName].label) {
            document.querySelector(`.dls-${plugin.name}-icon`).setAttribute('title', this[pluginName].label)
          }
        }
      })
    }
  }
  insertHtml (domStr, isContain) {
    if (!this.selection) return
    const objE = document.createElement('div')
    let empty
    objE.innerHTML = domStr
    if (isContain) {
      this.selection.insertNode(objE.childNodes[0])
    } else {
      const rangeNode = this.selection.endContainer
      const range = document.createRange()
      if (rangeNode.nodeName === '#text') {
        this.contentContainer.insertBefore(objE.childNodes[0], rangeNode.parentNode.nextSibling)
        empty = document.createElement('p')
        empty.innerHTML = '<br>'
        this.contentContainer.insertBefore(empty, rangeNode.parentNode.nextSibling.nextSibling)
        range.selectNodeContents(empty)
      }
      if (rangeNode.nodeName === 'P') {
        this.contentContainer.insertBefore(objE.childNodes[0], rangeNode)
        range.selectNodeContents(rangeNode)
      }
      range.collapse(true)
      var sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
      this.selection = sel.getRangeAt(0)
    }
  }
  _initDom () {
    this._initContainer()
    this._initToolbar()
    this._initContentDom()
  }
  /**
   * @function 初始化toolbar
   */
  _initToolbar () {
    this.toolbarDom = document.createElement('div')
    this.toolbarDom.classList.add('toolbar')
    this.box.appendChild(this.toolbarDom)
    let iconStr = ''
    this.toolbar.forEach(element => {
      iconStr += `<a class='icon-container'><span class='dls-${element}-icon'></span></a>`
    })
    this.toolbarDom.innerHTML = iconStr
  }

  _initContainer () {
    this.box = document.createElement('div')
    this.box.classList.add('dls-m-editor')
    this.container.appendChild(this.box)
  }
  _initContentDom () {
    this.contentContainer = document.createElement('div')
    this.contentContainer.innerHTML = '<p><br></p>'
    this.contentContainer.classList.add('content')
    this.contentContainer.setAttribute('contenteditable', true)
    this.contentContainer.style.minHeight = this.minHeight + 'px'
    this.contentContainer.style.maxHeight = this.maxHeight + 'px'
    this.box.appendChild(this.contentContainer)
  }
  _bind () {
    this.contentContainer.addEventListener('paste', this._bindPaste.bind(this))
    this.contentContainer.addEventListener('keydown', this._keydown.bind(this))
    this.contentContainer.addEventListener('keyup', this._getSelection.bind(this))
    this.contentContainer.addEventListener('click', this._click.bind(this))
  }
  /**
   * @function 主要针对backspace做的处理，用于删除图片块的数据
   */
  _keydown (e) {
    if (this.contentContainer.innerHTML === '') {
      this.contentContainer.innerHTML = '<p><br></p>'
    }
    if (e.code === 'Backspace') {
      if (this.contentContainer.innerHTML === '<p><br></p>') {
        e.preventDefault()
      }
      if (this.block) {
        this.block.parentNode.removeChild(this.block)
        this.block = null
        return e.preventDefault()
      }
      if (this.selection.endContainer.nodeName === 'P' && this.selection.endContainer.innerHTML === '<br>') {
        const preDom = this.selection.endContainer.previousSibling
        if (preDom && preDom.classList.contains('m-editor-block')) {
          this.block = preDom
          this.block.classList.add('active')
          e.preventDefault()
        }
      }
    }
  }
  /**
   * @function 获取selection
   */
  _getSelection () {
    const selection = window.getSelection()
    if (selection.type !== 'None') {
      this.selection = selection.getRangeAt(0)
    }
  }
  /**
   * @function 点击块的时候高亮显示
   */
  _click (e) {
    this._getSelection()
    if (this.block) {
      this.block.classList.remove('active')
      this.block = null
    }
    let target = e.target
    while (target) {
      if (target === this.contentContainer) return
      if (target.classList.contains('m-editor-block')) {
        this.block = target
        this.block.classList.add('active')
        return
      }
      target = target.parentNode
    }
  }
  /**
   * @function 只允许粘贴纯文本
   */
  _bindPaste (e) {
    // Prevent the default pasting event and stop bubbling
    e.preventDefault()
    e.stopPropagation()
    // Get the clipboard data
    let paste = (e.clipboardData || window.clipboardData).getData('text')
    // Do something with paste like remove non-UTF-8 characters
    paste = paste.replace(/style/gi, '')
    // Find the cursor location or highlighted area
    const selection = window.getSelection()
    // Cancel the paste operation if the cursor or highlighted area isn't found
    if (!selection.rangeCount) return false
    var textNode = document.createTextNode(paste)
    selection.getRangeAt(0).insertNode(textNode)
  }
  _toCamelCase (str) {
    str = str.toLowerCase()
    var arr = str.split('-')
    for (var i = 1; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1)
    }
    return arr.join('')
  }
  getData () {
    const nodes = this.contentContainer.childNodes
    const dataArray = []
    Array.from(nodes).forEach(node => {
      if (node.nodeName === '#text' || node.nodeName === 'P') { // 文本
        if (node.innerHTML === '<br>') {
          dataArray.push({
            type: 'TEXT',
            text: ''
          })
        } else {
          dataArray.push({
            type: 'TEXT',
            text: node.innerText
          })
        }
      }
    })

    return dataArray
  }

  setData (dataArray) {
    let content = ''
    dataArray.forEach(data => {
      if (data.type === 'TEXT') {
        content += `<p>${data.text}</p>`
      }
    })
    this.contentContainer.innerHTML = content
  }
}
