import './index.less'
import plugins from './plugins/index'
import xss from 'xss'
import { dealTopic } from './untils/topic'
import Float from './plugins/float'
import {
  handleA,
  topicFn
} from './renderData'
import {
  setRange,
  xssfilter,
  setSelection,
  getParents,
  insertAfter,
  getlastImg,
  getOffset,
  dataMap,
  toCamelCase,
  getNode,
  activeTool,
  updateStatus
} from './untils/fn'
export default class MEditor {
  constructor (props) {
    Object.assign(this, {
      container: null,
      toolbar: ['image', 'video', 'h1', 'h2', 'refer', 'ol', 'ul', 'topic', 'link'],
      float: ['link'],
      plugins: [],
      pluginParams: {},
      id: 0, // 粘贴图片时的id标识
      maxlength: 0, // 字数限制，前端只做提示，没有限制提交
      minHeight: 200,
      maxHeight: 400000,
      content: '',
      innerLinks: [],
      frameHost: '__ALLHISTORY_HOSTNAME__',
      replaceFn: (link) => {
        return `<a href="${this.host}/detail/${link.itemId}" class="link" item-id="${link.itemId}">${link.word}</a>`
      },
      topicFn,
      handleText: (text) => xssfilter(text),
      host: '__ALLHISTORY_HOSTNAME__',
      onReady (editor) {}
    }, props)
    this.currentSelection = ''
    this.dataOutput = [] // 存储输出数据
    this.topicContent = '' // 存储话题内容
    this.linkArr = [] // 外链偏移量
    this.topicArr = [] // 同 postTags 存储当前一行内容的话题偏移量
    this._init()
  }

  _init () {
    this._initDom()
    this._initContent()
    this._bind()
    this._initPlugins()
    this.onReady(this)
  }

  _initContent () {
    if (this.content) this.setData(this.content, this.innerLinks)
  }

  _initPlugins () {
    this._newPlugins()
    this.float.length && this._initFloat()
  }
  /**
   * @function  加载插件
   * @param  {array}  [{ constructor: imagePlugin, name: 'image',output(node){} }]
   */
  _newPlugins () {
    this.toolbar.forEach(menu => {
      const plugin = plugins[menu]
      plugin.params = {
        ...plugin.params,
        ...this.pluginParams[menu]
      }
      const pluginName = toCamelCase(plugin.name)
      if (!this[pluginName] && this.toolbar.indexOf(plugin.name) !== -1) {
        this[pluginName] = new plugin.constructor({
          frameHost: this.frameHost,
          name: plugin.name,
          editor: this,
          host: this.host,
          ...plugin.params
        })
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

  execcommand (tool) {
    const pluginName = toCamelCase(tool)
    this[pluginName].initCommand()
  }

  _initFloat () {
    new Float({
      editor: this,
      tools: this.float
    })
  }

  _setRange (node) {
    this.selection = setRange(node)
  }
  /**
   * @function 插入节点，用于插件
   * @param  {string} domStr    html字符串
   * @param  {boolean} isBr     是否需要添加一个空行
   */
  insertHtml (domStr, isBr) {
    if (document.activeElement !== this.contentContainer) setSelection(this.currentSelection)

    const objE = document.createElement('div')
    const code = Math.random().toString(36).substr(5)

    domStr = isBr ? domStr + '<p><br/></p>' : domStr
    objE.innerHTML = domStr
    objE.childNodes[0].setAttribute('data-m', `m${code}`)
    document.execCommand('insertHTML', false, objE.innerHTML)

    const node = this.contentContainer.querySelector(`.m-editor-block[data-m=m${code}]`)

    node.removeAttribute('data-m')
    const snode = node.nextElementSibling || node.previousElementSibling

    snode && setRange(snode)

    this._getSelection()

    updateStatus('undo', true)
    return node
  }

  insertNode (node) {
    if (!this.selection) { // 没有聚焦时进行的插入操作
      this.contentContainer.appendChild(node)
      return node
    }
    if (this.selection.endContainer.nodeName === 'BR') {
      const selection = this.selection.endContainer
      selection.parentNode.replaceChild(node, selection)
    } else {
      this.selection.insertNode(node)
      this._setRange(node.nextSibling || this.contentContainer)
    }
    return node
  }

  _initDom () {
    this._initContainer()
    this._initToolbar()
    this._initContentDom()
    this._initLength()
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
      iconStr += `<a onmousedown="event.preventDefault();" class='icon-container dls-${element}-icon-container'><span class='dls-${element}-icon'></span></a>`
    })
    this.toolbarDom.innerHTML = iconStr
  }
  _initLength () {
    if (this.maxlength) {
      const p = document.createElement('p')
      p.innerHTML = `字数限制：${this.maxlength}`
      this.box.appendChild(p)
    }
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
    this.contentContainer.setAttribute('spellcheck', false)
    this.contentContainer.style.minHeight = this.minHeight + 'px'
    this.contentContainer.style.maxHeight = this.maxHeight + 'px'
    this.box.appendChild(this.contentContainer)
  }
  _bind () {
    this.contentContainer.addEventListener('paste', this._bindPaste.bind(this))
    this.contentContainer.addEventListener('keydown', this._keydown.bind(this))
    this.contentContainer.addEventListener('keyup', this._keyup.bind(this))
    this.contentContainer.addEventListener('click', this._click.bind(this))
    this.contentContainer.addEventListener('blur', this._blur.bind(this))
  }

  /**
   * @function 更新toolbar状态
   * @param  {string} 特定的tool类型
   * @return {bool} 状态是否激活
   */
  updateToolbarStatus () {
    const selectNode = this.selection && this.selection.endContainer
    if (getParents(selectNode, 'm-editor-block')) {
      return this.toolbarDom.classList.add('disable')
    }
    this.toolbarDom.classList.remove('disable')

    if (!selectNode) return

    let node = getNode(selectNode)
    switch (node.nodeName) {
      case 'LI':
        node = node.parentNode
        activeTool(node.localName, true)
        break
      case 'A': break
      case 'P':
      case 'DIV':
        activeTool(null, true)
        break
      case 'BLOCKQUOTE':
        activeTool('refer', true)
        break
      default:
        activeTool(node.localName, true)
        break
    }
  }
  /**
   * @function 记住selection
   */
  _blur () {
    this.currentSelection = window.getSelection().getRangeAt(0)
  }
  /**
   * @function 主要针对backspace做的处理，用于删除图片块的数据
   */
  _keydown (e) {
    const dom = this.selection.startContainer
    switch (e.code) {
      case 'Backspace':
        if (this._isCapture() && this.selection.startOffset == 0) return e.preventDefault()
        if (this.block) {
          let parentNode = this.block.parentNode
          parentNode.removeChild(this.block)
          this.block = null
          return e.preventDefault()
        }
        // e.preventDefault()
        // return console.log(this.selection)
        if (this.selection.endContainer.nodeName !== '#text') { // 不是文本的时候选中块
          this._selectBlock(e)
        } else {
          if (this.selection.endOffset === 0) { // 在文本首位
            this._selectBlock(e, 'text')
          }
        }
        break
      case 'Enter':
        if (this._isCapture()) return e.preventDefault()
        // 当前行没有任何文字且当前是H1,h2等状态时，自动清除当前状态（h1,h2,reder等）
        if (dom.innerHTML === '<br>' && dom.nodeName !== 'P' && dom.nodeName !== 'LI') {
          document.execCommand('formatBlock', false, 'p')
          return e.preventDefault()
        }
        if (this.block) { // 选中块的时候，按回车会在后面增加一行
          this.block.classList.remove('active')
          const p = document.createElement('p')
          p.innerHTML = '<br>'
          insertAfter(p, this.block)
          this._setRange(p)
          document.execCommand('insertParagraph') // 为了能够撤销
          p.parentNode.removeChild(p)
          e.preventDefault()
          this.block = null
        }
        break
      default:
        break
    }
  }

  _isCapture () {
    const dom = this.selection.startContainer
    if (getParents(dom, 'dls-image-capture') || getParents(dom, 'dls-video-capture')) return true
    return false
  }

  /**
   * @function 获取selection
   */
  _getSelection (e) {
    const selection = window.getSelection()
    if (selection.type !== 'None') {
      this.selection = selection.getRangeAt(0)
    }
    const dom = this.selection.startContainer
    if (dom && dom.classList && dom.classList.contains('m-editor-block')) {
      setRange(dom.querySelector('p'))
    }
  }
  /**
   * @function 实时获取selcetion
   */
  _keyup (e) {
    this._getSelection()
    if (e && e.code === 'Backspace') {
      if (this.contentContainer.innerHTML === '<p><br></p>' || this.contentContainer.innerHTML === '') { // 必须保留一个p标签
        this.contentContainer.innerHTML = '<p><br></p>'
        return e.preventDefault()
      }
      const span = this.contentContainer.querySelector('span')
      if (span) { // 按删除键 h1标签和p标签混合时会有span标签，需替换掉
        const parentNode = span.parentNode
        let afterDelete = parentNode.innerHTML.replace(span.outerHTML, span.innerHTML)
        parentNode.innerHTML = afterDelete
      }
    }

    const node = this.selection.endContainer

    if (this._isCapture() && this.block) {
      this.block.classList.remove('active')
      this.block = null
    }

    if (node.nodeName === 'DIV' && node !== this.contentContainer && !node.classList.contains('m-editor-block')) {
      const p = document.createElement('p')
      p.innerHTML = '<br>'
      node.parentNode.replaceChild(p, node)
      this._setRange(p)
    }
    this.updateToolbarStatus()
  }
  /**
   * @function 按退格键时，视情况选中block块
   * @param  {type} 事件对象
   */
  _selectBlock (e, type) {
    const node = this.selection.endContainer
    let preDom = this.selection.endContainer.previousSibling
    if (type === 'text') {
      preDom = this.selection.endContainer.parentNode.previousSibling
    }
    if (preDom && preDom.classList && preDom.classList.contains('m-editor-block')) { // 前面节点是块的情况
      this.block = preDom
      this.block.classList.add('active')
      if (node.nodeName === 'BR' || node.innerHTML === '<br>' || node.innerHTML === '') {
        document.execCommand('delete')
        //  node.parentNode.removeChild(node)
      }
      e.preventDefault()
    }
  }

  _addP () {
    const p = document.createElement('p')
    p.innerHTML = '<br>'
    this.contentContainer.appendChild(p)
    this._setRange(p)
    document.execCommand('insertParagraph')
    p.parentNode.removeChild(p)
  }

  /**
   * @function 点击块的时候高亮显示，如果最后一个节点是块，则添加一个空行
   */
  _click (e) {
    this._getSelection()
    this.updateToolbarStatus()
    if (this.block) {
      this.block.classList.remove('active')
      this.block = null
    }
    let target = e.target
    while (target) {
      if (target === this.contentContainer) {
        // 如果最后一个节点是图片，增加一个空行
        if (getlastImg(this.contentContainer)) return this._addP()
      }
      if (target.classList.contains('m-editor-block')) {
        this.block = target
        this.block.classList.add('active')
        this._setRange(this.block)
        return
      }
      if (target.nodeName === 'IMG') {
        target = target.parentNode
      } else {
        return
      }
    }
  }
  /**
   * @function 只允许粘贴纯文本及图片，其他域图片会上传到allhistory
   */
  _bindPaste (e) {
    e.preventDefault()
    let files = e.clipboardData && e.clipboardData.files
    if (files.length) {
      return this.image.upload(files)
    }

    if (this._isCapture()) {
      let txt = e.clipboardData.getData('text')
      let textNode = document.createTextNode(txt)
      return this.selection.insertNode(textNode)
    }
    const html = e.clipboardData.getData('text/html')
    const imgArr = []
    const self = this
    let imgStr = xss(html, {
      whiteList: {
        img: ['src']
      }, // 白名单为空，表示过滤所有标签
      stripIgnoreTag: true, // 过滤所有非白名单标签的HTML
      stripIgnoreTagBody: ['script'], // script标签较特殊，需要过滤标签中间的内容
      onTag (tag, html, options) {
        if (tag === 'img') {
          const objE = document.createElement('div')
          objE.innerHTML = html
          const src = objE.childNodes[0].src
          if (src.indexOf('img.allhistory.com') !== -1) {
            const dataSrc = src.replace(/https:|http:/, '')
            return `<div class="m-editor-block" ondragstart="return false"><img data-src=${dataSrc} src=${dataSrc} /><p class="dls-image-capture" contenteditable="true"></p></div>`
          } else {
            imgArr.push(src)
            return `<div class="m-editor-block loading" ondragstart="return false"><img class="img${self.id}" src='' /><p class="dls-image-capture" contenteditable="true"></p></div>`
          }
        } else {
          const blockTag = [
            'header', 'section', 'footer', 'aside', 'main', 'article', 'blockquote', 'figure',
            'figcaption', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dt', 'dd'
          ]
          if (html.indexOf('<div class="para"') !== -1 || blockTag.indexOf(tag) !== -1) {
            if (options.isClosing) return '</p>'
            return '<p>'
          }
        }
      }
    })
    // return console.log(imgStr)
    imgStr = imgStr.replace(/<p><\/p>/g, '').trim()
    imgStr = imgStr.replace(/\n/g, '<p>')
    if (imgStr.indexOf('<img') !== -1) {
      document.execCommand('insertHTML', false, imgStr)
      this.image.replaceImg(imgArr, this.id)
      this.id++
    } else {
      if (!imgStr) {
        imgStr = e.clipboardData.getData('text')
        imgStr = imgStr.replace(/\n/g, '<p>')
      }
      document.execCommand('insertHTML', false, imgStr)
    }
  }

  /**
   * FIXME： 待优化，图片节点需可配置
   * 私有方法，勿外部调用
   * 递归调用，仅push text 节点、图片节点、和br节点
   * @param {*} nodes
   */
  _getData (nodes) {
    if (!nodes || Array.from(nodes).length <= 0) {
      return []
    }
    Array.from(nodes).forEach(node => {
      if (node.classList && node.classList.contains('m-editor-block')) {
        return this._handleBlock(node)
      }
      switch (node.nodeName) {
        case '#text':
          this._handleText(node)
          break
        case 'BR':
          this._handleBr(node)
          break
        case 'A':
          this._handleTagA(node)
          if (!node.nextSibling || node.nextSibling.nodeName == 'BR') {
            this._handleText(node, true)
          } else {
            this.topicContent = this.topicContent + node.text
          }
          break
        case 'P':
        default:
          if (node.innerHTML === '') {
            this.dataOutput.push({
              type: 'TEXT',
              text: '',
              style: 'CONTENT'
            })
          } else this._getData(node.childNodes)
          break
      }
    })

    return this.dataOutput
  }
  /**
   * @function 处理块（图片，视频）
   * @param 节点
   */
  _handleBlock (node) {
    if (node.classList.contains('dls-video-box')) {
      let video = node.querySelector('video')
      let src = video.src
      const txt = node.querySelector('.dls-video-capture')
      if (src.indexOf('http:') === 0) {
        src = src.replace('http:', 'https:')
      }

      this.dataOutput.push({
        type: 'VIDEO',
        url: src,
        text: xssfilter(txt.innerText)
      })
    } else {
      const img = node.querySelector('img')
      const txt = node.querySelector('.dls-image-capture')
      this.dataOutput.push({
        type: 'IMAGE',
        url: img.getAttribute('data-src'),
        height: img.naturalHeight,
        width: img.naturalWidth,
        text: xssfilter(txt.innerText)
      })
    }
    const textNode = node.querySelector('.dls-image-capture') || node.querySelector('.dls-video-capture')
    Array.from(textNode.children).forEach(link => {
      link.classList.contains('link') && this.linkArr.push({
        word: link.text,
        itemId: link.getAttribute('item-id'),
        contentOffset: this.dataOutput.length - 1,
        paramOffset: getOffset(link),
        wordLength: link.text.length
      })
    })
  }

  /**
   * @function 处理文本
   * @param  {node} 节点
   * @param  {boolean} 节点是否为A,获取a的文本用node.text,文本节点获取用node.data
   */
  _handleText (node, isA) {
    let name, style
    let map = {}
    if (node.nextSibling && (node.nextSibling.tagName === 'A' || node.nextSibling.nodeName === '#text')) { // 如果后面有a标签，只加内容但是不添加到content
      this.topicContent = this.topicContent + (isA ? node.text : node.data)
      return
    }

    if (node.parentNode.nodeName === 'A') return // 如果是A标签就跳过，因为已经对a标签做了处理

    name = node.parentNode.nodeName
    map = {
      H1: 'H1',
      H2: 'H2',
      BLOCKQUOTE: 'REFER'
    }

    if (node.parentNode.nodeName === 'LI') {
      name = node.parentNode.parentNode.nodeName.toLowerCase()
      map = {
        ul: 'UL',
        ol: 'OL'
      }
    }
    style = map[name] || 'CONTENT'
    const postTags = [] // 话题标签
    const txt = isA ? node.text : node.data
    const text = this.topicContent + txt

    this.topicArr.length && this.topicArr.forEach(element => {
      postTags.push({
        topicId: element.id,
        topicName: element.name.replace(/^#|#$/g, ''),
        wordLength: element.name.length,
        paramOffset: element.paramOffset
      })
    })
    if (style === 'OL' || style === 'UL') {
      const ul = node.parentNode.parentNode
      const li = ul.querySelectorAll('li')
      text && this.dataOutput.push({
        style,
        text: xssfilter(text),
        postTags,
        index: Array.from(li).findIndex(li => li === node.parentNode) + 1,
        type: 'TEXT'
      })
    } else {
      text && this.dataOutput.push({
        type: 'TEXT',
        text: xssfilter(text),
        postTags,
        style
      })
    }
    this.topicContent = ''
    this.topicArr = []
  }
  /**
   * @function 处理a标签
   * @param  {node} 节点
   */
  _handleTagA (node) {
    if (node.className == 'topic') { // 话题a标签
      return this.topicArr.push({
        id: node.getAttribute('topic-id'),
        name: node.text,
        paramOffset: this.topicContent.length
      })
    }

    if (node.className == 'link') { // 内链的情况
      return this.linkArr.push({
        word: node.text,
        itemId: node.getAttribute('item-id'),
        contentOffset: this.dataOutput.length,
        paramOffset: this.topicContent.length,
        wordLength: node.text.length
      })
    }
  }

  /**
   * @function 处理br标签
   * @param  {node} 节点
   */
  _handleBr (node) {
    const nodeName = node.parentNode.parentNode.nodeName
    const prev = node.previousSibling && node.previousSibling.nodeName
    const next = node.nextSibling && node.nextSibling.nodeName
    if (nodeName === 'UL' || nodeName === 'OL') {
      const ul = node.parentNode.parentNode
      const li = ul.querySelectorAll('li')
      this.dataOutput.push({
        style: nodeName,
        text: '',
        index: (nodeName === 'OL' || nodeName === 'UL') && Array.from(li).findIndex(li => li === node.parentNode) + 1,
        type: 'TEXT'
      })
    } else if (prev === '#text' || prev === 'A') {
      // br混在文本节点前面的情况
    } else if (next === '#text' || next === 'A') {
      // br混在文本节点后面的情况
    } else {
      this.dataOutput.push({
        type: 'TEXT',
        text: '',
        style: 'CONTENT'
      })
    }
  }

  getData () {
    this.dataOutput = []
    this.linkArr = []
    return this._getData(this.contentContainer.childNodes)
  }

  getLink () {
    this.dataOutput = []
    this.linkArr = []
    this._getData(this.contentContainer.childNodes)
    return this.linkArr
  }

  getLength (onlyText) {
    let length = 0
    this.getData()
    this.dataOutput.forEach((data) => {
      if (data.type === 'TEXT') {
        length += data.text.length
      }
      if (data.type === 'IMAGE' && !onlyText) {
        length += 1
      }
    })
    return length
  }

  innerHTML () {
    return this.contentContainer.innerHTML
  }

  innerText () {
    return this.contentContainer.innerText
  }

  setData (dataArray, innerLinks) {
    let content = ''
    dataArray = handleA(dataArray, innerLinks)
    dataArray.forEach((data, index) => {
      data.text = dealTopic(this.handleText(data.text), data.postTags, {
        topicFn: this.topicFn,
        replaceFn: this.replaceFn
      })
      content += dataMap(data, index, dataArray)
    })
    this.contentContainer.innerHTML = content
  }
}
