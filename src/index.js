import './index.less'
import imagePlugin from './image'
export default class MEditor {
  constructor (props) {
    Object.assign(this, {
      container: null,
      toolbar: ['image'],
      plugins: [],
      basePlugins: [{
        constructor: imagePlugin,
        name: 'image'
      }],
      minHeight: 200,
      maxHeight: 400000,
      content: '',
      imgHost: '//pic.evatlas.com',
      host: '__ALLHISTORY_HOSTNAME__',
      url: '/api/m/image/upload/v1',
      formName: 'userfile',
      onReady (editor) {}
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
    this._newPlugins(this.basePlugins)
    this._newPlugins(this.plugins)
  }
  /**
   * @function  加载插件
   * @param  {array}  [{ constructor: imagePlugin, name: 'image' }]
   */
  _newPlugins (plugins) {
    if (plugins.length) {
      plugins.forEach(plugin => {
        const pluginName = this._toCamelCase(plugin.name)
        if (!this[pluginName]) {
          this[pluginName] = new plugin.constructor({ editor: this, host: this.host, imgHost: this.imgHost, url: this.url, formName: this.formName })
          this.container.querySelector(`.dls-${plugin.name}-icon-container`).onclick = () => {
            this[pluginName].initCommand()
          }
          this[pluginName].init && this[pluginName].init(this.editor)
          if (this[pluginName].label) {
            this.container.querySelector(`.dls-${plugin.name}-icon-container`).setAttribute('title', this[pluginName].label)
          }
        }
      })
    }
  }
  /**
   * @function 主动定位光标
   * @param  {node} node 节点
   */
  _setRange (node) {
    const range = document.createRange()
    range.selectNodeContents(node)
    range.collapse(true)
    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
    this.selection = sel.getRangeAt(0)
  }
  /**
   * @function 插入节点，用于插件
   * @param  {string} domStr    html字符串
   * @param  {boolean} isContain 在当前光标标签内插入，还是新建节点
   */
  insertHtml (domStr, isContain) {
    const objE = document.createElement('div')
    objE.innerHTML = domStr
    if (!this.selection) { // 没有聚焦时进行的插入操作
      this.contentContainer.prepend(objE.childNodes[0])
      return
    }
    if (isContain) {
      this.selection.insertNode(objE.childNodes[0])
    } else {
      const rangeNode = this.selection.endContainer
      if (rangeNode.nodeName === '#text') { // 在文本后进行的插入
        this.contentContainer.insertBefore(objE.childNodes[0], rangeNode.parentNode.nextSibling)
        const empty = document.createElement('p')
        empty.innerHTML = '<br>'
        this.contentContainer.insertBefore(empty, rangeNode.parentNode.nextSibling.nextSibling)
        this._setRange(empty)
      }
      if (rangeNode.nodeName === 'P') { // 在空行进行的插入
        this.contentContainer.insertBefore(objE.childNodes[0], rangeNode)
        this._setRange(rangeNode)
      }
      if (rangeNode === this.contentContainer) { // 空内容按backspace键后的插入
        this.contentContainer.prepend(objE.childNodes[0])
      }
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
      iconStr += `<a class='icon-container dls-${element}-icon-container'><span class='dls-${element}-icon'></span></a>`
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
    this.contentContainer.classList.add('dls-m-editor-content')
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
    if (e.code === 'Backspace') {
      if (this.contentContainer.innerHTML === '<p><br></p>') { // 必须保留一个p标签
        this.contentContainer.innerHTML = '<p><br></p>'
        e.preventDefault()
      }
      if (this.block) { // 删除高亮块
        this.block.parentNode.removeChild(this.block)
        this.block = null
        return e.preventDefault()
      }
      if (this.selection.endContainer.nodeName === 'P' && this.selection.endContainer.innerHTML === '<br>') { // 空内容时，按键后选中一个块
        const preDom = this.selection.endContainer.previousSibling
        if (preDom && preDom.classList.contains('m-editor-block')) {
          this.block = preDom
          this.block.classList.add('active')
          e.preventDefault()
        }
      }
    } else {
      if (this.block) {
        this.block.classList.remove('active')
        if (!this.block.nextSibling) { // 图片后没有空行时，添加一个空行
          const empty = document.createElement('p')
          empty.innerHTML = '<br>'
          this.block.parentNode.insertBefore(empty, this.block.nextSibling)
          this._setRange(empty)
        }
        this.block = null
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
          node.innerText.split('\n').forEach(text => {
            dataArray.push({
              type: 'TEXT',
              text: text
            })
          })
        }
      }
      if (node.classList.contains('m-editor-block')) {
        const img = node.firstChild
        dataArray.push({
          type: 'IMAGE',
          url: img.currentSrc,
          height: img.naturalHeight,
          width: img.naturalWidth
        })
      }
    })

    return dataArray
  }
  innerHTML () {
    return this.contentContainer.innerHTML
  }
  innerText () {
    return this.contentContainer.innerText
  }
  setData (dataArray) {
    let content = ''
    dataArray.forEach(data => {
      if (data.type === 'TEXT') {
        content += `<p>${data.text}</p>`
      }
      if (data.type === 'IMAGE') {
        content += `<div class="m-editor-block"><img src=${data.url} /></div>`
      }
    })
    this.contentContainer.innerHTML = content
  }
}
