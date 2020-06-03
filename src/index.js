import './index.less'
import imagePlugin from './plugins/image'
import videoPlugin from './plugins/video'
import stylePlugin from './plugins/style'
import topicPlugin from './plugins/topic'
import ulPlugin from './plugins/list'
import xss from 'xss'
import linkPlugin from './plugins/link'
import {
  handleA,
  topicFn
} from './renderData'
import {
  dealTopic
} from './untils/topic'
import {
  setRange,
  getParents,
  getlastImg,
  toCamelCase,
  getOffset,
  dataMap
} from './untils/fn'
export default class MEditor {
  constructor (props) {
    Object.assign(this, {
      container: null,
      toolbar: ['image', 'video', 'h1', 'h2', 'refer', 'ol', 'ul', 'topic', 'link'],
      plugins: [],
      id: 0, // 粘贴图片时的id标识
      maxlength: 0, // 字数限制，前端只做提示，没有限制提交
      basePlugins: [{
        constructor: imagePlugin,
        name: 'image',
        params: {
          url: '/api/image/upload/v1',
          formName: 'userfile'
        }
      }, {
        constructor: videoPlugin,
        name: 'video',
        params: {
          url: '/api/video/upload/v1',
          formName: 'userfile'
        }
      }, {
        constructor: stylePlugin,
        name: 'h1',
        params: {
          type: 'h1',
          label: '1级标题'
        }
      }, {
        constructor: stylePlugin,
        name: 'h2',
        params: {
          type: 'h2',
          label: '2级标题'
        }
      }, {
        constructor: ulPlugin,
        name: 'ol',
        params: {
          label: '有序列表'
        }

      }, {
        constructor: ulPlugin,
        name: 'ul',
        params: {
          label: '无序列表'
        }
      }, {
        constructor: stylePlugin,
        name: 'refer',
        params: {
          type: 'refer',
          label: '插入引用'
        }
      }, {
        constructor: topicPlugin,
        name: 'topic',
        params: {
          url: '/api/toppost/tag/search',
          label: '插入话题'
        }
      }, {
        constructor: linkPlugin,
        name: 'link',
        params: {
          url: '/api/search/getSuggestion',
          label: '插入链接'
        }
      }],
      minHeight: 200,
      maxHeight: 400000,
      content: '',
      innerLinks: [],
      frameHost: '',
      replaceFn: (link) => {
        return `<a class="link" item-id="${link.itemId}">${link.word}</a>`
      },
      topicFn,
      handleText: (text) => text,
      host: '__ALLHISTORY_HOSTNAME__',
      onReady (editor) {}
    }, props)
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
    if (this.content) this.setData(this.content, innerLinks)
  }

  _initPlugins () {
    this._newPlugins(this.basePlugins)
    this._newPlugins(this.plugins)
  }
  /**
   * @function  加载插件
   * @param  {array}  [{ constructor: imagePlugin, name: 'image',output(node){} }]
   */
  _newPlugins (plugins) {
    if (plugins.length) {
      plugins.forEach(plugin => {
        const pluginName = toCamelCase(plugin.name)
        if (!this[pluginName] && this.toolbar.indexOf(plugin.name) !== -1) {
          this[pluginName] = new plugin.constructor({ frameHost: this.frameHost, name: plugin.name, editor: this, host: this.host, ...plugin.params })
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
  _setRange (node) {
    this.selection = setRange(node)
  }
  /**
   * @function 插入节点，用于插件
   * @param  {string} domStr    html字符串
   */
  insertHtml (domStr) {
    let objE, node
    if (typeof domStr === 'string') {
      objE = document.createElement('div')
      objE.innerHTML = domStr
      node = objE.childNodes[0]
    } else {
      node = domStr
    }

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
    this.contentContainer.style.minHeight = this.minHeight + 'px'
    this.contentContainer.style.maxHeight = this.maxHeight + 'px'
    this.box.appendChild(this.contentContainer)
  }
  _bind () {
    this.contentContainer.addEventListener('paste', this._bindPaste.bind(this))
    this.contentContainer.addEventListener('keydown', this._keydown.bind(this))
    this.contentContainer.addEventListener('keyup', this._keyup.bind(this))
    this.contentContainer.addEventListener('click', this._click.bind(this))
  }

  /**
   * @function 更新toolbar状态
   * @param  {string} 特定的tool类型
   * @return {bool} 状态是否激活
   */
  updateToolbarStatus (type) {
    const selectNode = this.selection && this.selection.endContainer
    if (getParents(selectNode, 'dls-image-capture') || getParents(selectNode, 'dls-video-capture')) {
      return this.toolbarDom.classList.add('disable')
    }
    this.toolbarDom.classList.remove('disable')

    if (!selectNode) return

    let className; let isContain; let node = selectNode

    if (selectNode.nodeName === '#text') {
      className = selectNode.parentNode.className
      isContain = selectNode.parentNode.classList.contains(type)
      node = selectNode.parentNode
      if (selectNode.parentNode.nodeName === 'LI') {
        className = 'li'
        node = selectNode.parentNode.parentNode
      }
    } else if (selectNode.nodeName === 'P') {
      className = selectNode.className
      isContain = selectNode.classList.contains(type)
    } else if (selectNode.nodeName === 'LI') {
      className = 'li'
      node = selectNode.parentNode
    }

    // 下面更新toolbar状态，并返回，返回值用于其他插件判断是否处于激活状态
    if (!type) {
      if (className) {
        return this.updateTool(true, node)
      } else {
        return this.updateTool(false, node)
      }
    } else {
      if (isContain) {
        return this.updateTool(true, node)
      } else {
        return this.updateTool(false, node)
      }
    }
  }
  /**
   * @function 将toolbar置为bool状态
   * @param  {Boolean}  是否激活
   * @param  {Node} 当前光标所在节点，只用到了节点的className属性, 所以也可能为 {className: '}
   * @return {bool} 状态是否激活
   */
  updateTool (bool, node) {
    const icons = this.toolbarDom.querySelectorAll('.icon-container')
    let className = node.className

    if (node.nodeName === 'OL' || node.nodeName === 'UL') {
      className = node.nodeName.toLowerCase()
    }
    Array.from(icons).forEach(icon => {
      icon.classList.remove('active')
    })
    if (!this.toolbarDom.querySelector(`.dls-${className}-icon-container`)) return bool
    bool && this.toolbarDom.querySelector(`.dls-${className}-icon-container`).classList.add('active')
    !bool && this.toolbarDom.querySelector(`.dls-${className}-icon-container`).classList.remove('active')
    return bool
  }
  /**
   * @function 主要针对backspace做的处理，用于删除图片块的数据
   */
  _keydown (e) {
    if (e.code === 'Backspace') {
      // console.log(this.selection)
      // return e.preventDefault()
      if (this.block) { // 删除高亮块(没有使用removeChild是因为在文本中间插入图片再删除，文本节点会中断)
        let parentNode = this.block.parentNode
        this.block.previousSibling && this._setRange(this.block.previousSibling)
        let afterDelete = parentNode.innerHTML.replace(this.block.outerHTML, '')
        parentNode.innerHTML = afterDelete

        this.block = null
        return e.preventDefault()
      }

      if (this.selection.endContainer.nodeName !== '#text') { // 不是文本的时候选中块
        this._selectBlock(e)
      } else {
        if (this.selection.endOffset === 0) { // 在文本首位
          this._selectBlock(e)
        }
      }
    } else {
      if (e && e.code === 'Enter') { // 按回车键的处理
        const node = this.selection.endContainer
        // 当前行没有任何文字且当前是H1,h2等状态时，自动清除当前状态（h1,h2,reder等）
        if (node.innerHTML === '<br>' && node.className && node.nodeName === 'P') {
          node.classList.remove(node.className)
          e.preventDefault()
        }
      }
      if (this.block) {
        this.block.classList.remove('active')
        if (!this.block.nextElementSibling) { // 图片后没有空行时，添加一个空行
          const empty = document.createElement('br')
          this.block.parentNode.appendChild(empty)
          this._setRange(empty)
        }
        this.block = null
      }
    }
  }
  /**
   * @function 获取selection
   */
  _getSelection (e) {
    const selection = window.getSelection()
    if (selection.type !== 'None') {
      this.selection = selection.getRangeAt(0)
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
      if (span) {
        const parentNode = span.parentNode
        let afterDelete = parentNode.innerHTML.replace(span.outerHTML, span.innerHTML)
        parentNode.innerHTML = afterDelete
      }
    }

    const node = this.selection.endContainer
    if (node.nodeName === 'DIV' && node !== this.contentContainer) {
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
  _selectBlock (e) {
    const node = this.selection.endContainer
    const preDom = this.selection.endContainer.previousSibling
    if (preDom && preDom.classList && preDom.classList.contains('m-editor-block')) {
      this.block = preDom
      this.block.classList.add('active')
      if (node.nodeName === 'BR') node.parentNode.removeChild(node)
      e.preventDefault()
    } else if (this.selection.endContainer.children && this.selection.endContainer.children.length > 1) {
      const node = this.selection.endContainer.children
      const br = node[node.length - 1]
      if (br.nodeName === 'BR') {
        br.parentNode.removeChild(br)
        if (node[node.length - 1].classList.contains('m-editor-block')) {
          this.block = node[node.length - 1]
          this.block.classList.add('active')
        }
        this._setRange(node[node.length - 1])
        e.preventDefault()
      }
    } else if (node.innerHTML === '<br>' && getlastImg(preDom)) {
      node.parentNode.removeChild(node)
      const block = getlastImg(preDom)
      if (block && block.classList && block.classList.contains('m-editor-block')) {
        this.block = block
        block.classList.add('active')
      }

      e.preventDefault()
    } else {
    }
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
        if (getlastImg(this.contentContainer)) {
          const p = document.createElement('p')
          p.innerHTML = '<br>'
          this.contentContainer.appendChild(p)
          this._setRange(p)
        }
        return
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
    if (getParents(this.selection.endContainer, 'dls-image-capture') || getParents(this.selection.endContainer, 'dls-video-capture')) {
      let txt = e.clipboardData.getData('text')
      let textNode = document.createTextNode(txt)
      return this.selection.insertNode(textNode)
    }
    const html = e.clipboardData.getData('text/html')
    const selection = window.getSelection()
    let P
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
            return `<div class="m-editor-block" ondragstart="return false"><img src=${src} /><p class="dls-image-capture" contenteditable="true"></p></div>`
          } else {
            imgArr.push(src)
            return `<div class="m-editor-block loading" ondragstart="return false"><img class="img${self.id}" src='' /><p class="dls-image-capture" contenteditable="true"></p></div>`
          }
        } else {
          const blockTag = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dt', 'dd']
          if (blockTag.indexOf(tag) !== -1) {
            return '\n'
          }
        }
      }
    })

    if (imgStr.indexOf('<img') !== -1) {
      P = document.createElement('p')
      P.innerHTML = imgStr.trim()
      selection.getRangeAt(0).insertNode(P)
      this._setRange(P)
      if (P.nextSibling && P.nextSibling.nodeName === 'BR') { // 直接粘贴 会多出br标签
        P.nextSibling.parentNode.removeChild(P.nextSibling)
      }
      this.image.replaceImg(imgArr, this.id)
      this.id++
    } else {
      let paste = (e.clipboardData || window.clipboardData).getData('text')
      // Cancel the paste operation if the cursor or highlighted area isn't found
      if (!selection.rangeCount) return false
      selection.getRangeAt(0).deleteContents()

      let textNode = document.createTextNode(paste)
      textNode.data = textNode.data.trim()
      P = document.createElement('p')
      P.appendChild(textNode)
      selection.getRangeAt(0).insertNode(P)
      if (textNode.nextSibling && textNode.nextSibling.nodeName === 'BR') { // 直接粘贴 会多出br标签
        textNode.nextSibling.parentNode.removeChild(textNode.nextSibling)
      }
      this._setRange(textNode)
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
        this._handleBlock(node)
      } else if (node.nodeName === '#text') {
        this._handleText(node)
      } else if (node.nodeName == 'BR') {
        this._handleBr(node)
      } else if (node.nodeName == 'P' && node.innerHTML === '') {
        this.dataOutput.push({
          type: 'TEXT',
          text: '',
          style: 'CONTENT'
        })
      } else if (node.nodeName === 'A') {
        this._handleTagA(node)
        if (!node.nextSibling) {
          this._handleText(node, true)
        } else {
          this.topicContent = this.topicContent + node.text
        }
      } else {
        this._getData(node.childNodes)
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
        text: txt.innerText
      })
    } else {
      const img = node.querySelector('img')
      const txt = node.querySelector('.dls-image-capture')
      this.dataOutput.push({
        type: 'IMAGE',
        url: img.getAttribute('data-src'),
        height: img.naturalHeight,
        width: img.naturalWidth,
        text: txt.innerText
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
    if (node.nextSibling && node.nextSibling.tagName === 'A') { // 如果后面有a标签，只加内容但是不添加到content
      this.topicContent = this.topicContent + (isA ? node.text : node.data)
      return
    }
    if (node.parentNode.nodeName === 'A') return // 如果是A标签就跳过，因为已经对a标签做了处理
    if (node.parentNode.nodeName === 'P') {
      name = node.parentNode.className
      map = {
        h1: 'H1',
        h2: 'H2',
        refer: 'REFER'
      }
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
      txt && this.dataOutput.push({
        style,
        text,
        postTags,
        index: Array.from(li).findIndex(li => li === node.parentNode) + 1,
        type: 'TEXT'
      })
    } else {
      txt && this.dataOutput.push({
        type: 'TEXT',
        text,
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
      this.topicArr.push({
        id: node.getAttribute('topic-id'),
        name: node.text,
        paramOffset: this.topicContent.length
      })
    } else if (node.className == 'link') { // 内链的情况
      this.linkArr.push({
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
    let nodeName = node.parentNode.parentNode.nodeName
    if (nodeName === 'UL' || nodeName === 'OL') {
      const ul = node.parentNode.parentNode
      const li = ul.querySelectorAll('li')
      this.dataOutput.push({
        style: nodeName,
        text: '',
        index: (nodeName === 'OL' || nodeName === 'UL') && Array.from(li).findIndex(li => li === node.parentNode) + 1,
        type: 'TEXT'
      })
    } else if (node.previousSibling && node.previousSibling.nodeName === '#text') {
      // br混在文本节点前面的情况
    } else if (node.nextSibling && node.nextSibling.nodeName === '#text') {
      // br混在文本节点后面的情况
    } else if (node.nextSibling && node.nextSibling.nodeName === 'A') {
      // 添加内链的时候会混一个br节点
    } else {
      this.dataOutput.push({
        type: 'TEXT',
        text: '',
        style: 'CONTENT'
      })
    }
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
    this.contentContainer.querySelectorAll('a').forEach(node => {
      node.style['-webkit-user-modify'] = 'read-only'
    })
  }
}
