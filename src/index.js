import './index.less'
import imagePlugin from './image'
import videoPlugin from './video'
import stylePlugin from './style'
// import ulPlugin from './ul'
import ulPlugin from './list'
import xss from 'xss'
export default class MEditor {
  constructor (props) {
    Object.assign(this, {
      container: null,
      toolbar: ['image', 'video', 'h1', 'h2', 'refer', 'ol', 'ul'],
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
      }],
      minHeight: 200,
      maxHeight: 400000,
      content: '',
      host: '__ALLHISTORY_HOSTNAME__',
      dataOutput: [],
      onReady (editor) {}
    }, props)
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
    if (this.content) this.setData(this.content)
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
        const pluginName = this._toCamelCase(plugin.name)
        if (!this[pluginName] && this.toolbar.indexOf(plugin.name) !== -1) {
          // plugin.type && plugin.constructor.setType(plugin.type)
          this[pluginName] = new plugin.constructor({ name: plugin.name, editor: this, host: this.host, ...plugin.params })
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
    range.collapse(false)
    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
    this.selection = sel.getRangeAt(0)
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
    console.log(node)
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
   * @function 将文本节点、元素节点转换为元素节点
   * @param  {node} node 文本节点、元素节点
   * @return {type} 元素节点
   */
  getNode (node) {
    if (node.nodeName === '#text') return node.parentNode
    return node
  }
  /**
   * @function 判断节点是否在类名为className的父节点下
   * @param  {type} node      文本节点、元素节点
   * @param  {type} className class类名
   */
  getParents (node, className) {
    while (!this.getNode(node).classList.contains('dls-m-editor-content')) {
      if (this.getNode(node).classList.contains(className)) {
        return true
      }
      node = node.parentNode
    }
    return false
  }
  /**
   * @function 更新toolbar状态
   * @param  {string} 特定的tool类型
   * @return {bool} 状态是否激活
   */
  updateToolbarStatus (type) {
    const selectNode = this.selection && this.selection.endContainer
    if (this.getParents(selectNode, 'dls-image-capture') || this.getParents(selectNode, 'dls-video-capture')) {
      return this.toolbarDom.classList.add('disable')
    } else {
      this.toolbarDom.classList.remove('disable')
    }
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
   * @param  {type} 节当前光标所在节点
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

      if (this.selection.endContainer.nodeName !== '#text') {
        this._selectBlock(e)
      } else {
        if (this.selection.endOffset === 0) { // 在文本首位
          this._selectBlock(e)
        }
      }
    } else {
      if (e && e.code === 'Enter') {
        const node = this.selection.endContainer
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
    } else if (node.innerHTML === '<br>' && this._getlastImg(preDom)) {
      node.parentNode.removeChild(node)
      const block = this._getlastImg(preDom)
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
        if (this._getlastImg(this.contentContainer)) {
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
   * @function 判断最后一个节点是否为图片或者block块
   */
  _getlastImg (node) {
    if (!node) return false
    if (node.classList && (node.classList.contains('dls-image-capture') || node.classList.contains('dls-video-capture'))) {
      return node
    }
    if (node.nodeName === '#text' && node.nodeValue === '') {
      if (node.previousSibling && node.previousSibling.lastChild) {
        return this._getlastImg(node.previousSibling.lastChild)
      }
      return true
    }
    if (node.nodeName === 'IMG') {
      return node.parentNode
    }
    return this._getlastImg(node.lastChild)
  }
  /**
   * @function 只允许粘贴纯文本及图片，其他域图片会上传到allhistory
   */
  _bindPaste (e) {
    e.preventDefault()
    if (this.getParents(this.selection.endContainer, 'dls-image-capture') || this.getParents(this.selection.endContainer, 'dls-video-capture')) {
      let txt = e.clipboardData.getData('text')
      let textNode = document.createTextNode(txt)
      return this.selection.insertNode(textNode)
    }
    const html = e.clipboardData.getData('text/html')
    const selection = window.getSelection()
    let P
    const imgArr = []
    const self = this
    var imgStr = xss(html, {
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
  _toCamelCase (str) {
    str = str.toLowerCase()
    var arr = str.split('-')
    for (var i = 1; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1)
    }
    return arr.join('')
  }

  getData () {
    this.dataOutput = []
    return this._getData(this.contentContainer.childNodes)
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
      // if (node.nodeName === '#text') {
      //   node.data && this.dataOutput.push({
      //     type: 'TEXT',
      //     text: node.data,
      //     style: 'CONTENT'
      //   })
      // } else if (node.nodeName == 'BR' || (node.nodeName == 'P' && node.innerHTML === '')) {
      //   this.dataOutput.push({
      //     type: 'TEXT',
      //     text: ''
      //   })
      // } else {
      //   let flag = false
      //   this.basePlugins.forEach(plugin => {
      //     if (plugin.output(node)) {
      //       flag = true
      //       this.dataOutput.push(plugin.output(node))
      //     }
      //   })
      //   if (!flag) {
      //     this._getData(node.childNodes)
      //   }
      // }

      if (node.classList && node.classList.contains('m-editor-block')) {
        if (node.classList.contains('dls-video-box')) {
          let video = node.querySelector('video')
          let src = video.src
          // let thumb = 'https:' + video.getAttribute('thumb')
          const txt = node.querySelector('.dls-video-capture')
          if (src.indexOf('http:') === 0) {
            src = src.replace('http:', 'https:')
          }

          this.dataOutput.push({
            type: 'VIDEO',
            url: src,
            text: txt.innerText
            // duration: video.duration,
            // thumb
          })
        } else {
          const img = node.querySelector('img')
          const txt = node.querySelector('.dls-image-capture')
          this.dataOutput.push({
            type: 'IMAGE',
            url: img.currentSrc,
            height: img.naturalHeight,
            width: img.naturalWidth,
            text: txt.innerText
          })
        }
      } else if (node.nodeName === '#text') {
        let name, style, map
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
        if (style === 'OL' || style === 'UL') {
          const ul = node.parentNode.parentNode
          const li = ul.querySelectorAll('li')
          node.data && this.dataOutput.push({
            style,
            text: node.data,
            index: Array.from(li).findIndex(li => li === node.parentNode) + 1,
            type: 'TEXT'
          })
        } else {
          node.data && this.dataOutput.push({
            type: 'TEXT',
            text: node.data,
            style
          })
        }
      } else if (node.nodeName == 'BR') {
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

        } else if (node.nextSibling && node.nextSibling.nodeName === '#text') {

        } else {
          this.dataOutput.push({
            type: 'TEXT',
            text: '',
            style: 'CONTENT'
          })
        }
      } else if (node.nodeName == 'P' && node.innerHTML === '') {
        this.dataOutput.push({
          type: 'TEXT',
          text: '',
          style: 'CONTENT'
        })
      } else {
        this._getData(node.childNodes)
      }
    })

    return this.dataOutput
  }
  getLength (onlyText) {
    let length = 0
    this.getData()
    this.dataOutput.forEach((data) => {
      if (data.type === 'TEXT') {
        length += data.text.length
      }
      if (data.type === 'IMAGE' && onlyText) {
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
  _dataMap (data, dataArray, index) {
    const dataMap = {
      IMAGE: `<div class="m-editor-block" ondragstart="return false"><img src=${data.url} /><p class="dls-image-capture" contenteditable="true">${data.text ? data.text : ''}</p></div>`,
      VIDEO: `<div class="m-editor-block dls-video-box" ondragstart="return false"><video controls src=${data.url} /></video><p class="dls-video-capture" contenteditable="true">${data.text ? data.text : ''}</p></div>`,
      TEXT: {
        CONTENT: `<p>${data.text}</p>`,
        H1: `<p class="h1">${data.text}</p>`,
        H2: `<p class="h2">${data.text}</p>`,
        REFER: `<p class="refer">${data.text}</p>`
      }
    }
    if (data.type === 'TEXT') {
      if (data.style === 'OL' || data.style === 'UL') {
        const next = dataArray[index + 1]
        if (data.index === 1) {
          return `<${data.style.toLowerCase()}><li>${data.text}</li>`
        } else if ((next.style != 'OL' && next.style != 'UL') || next.index == 1) {
          return `<li>${data.text}</li></${data.style.toLowerCase()}>`
        } else {
          return `<li>${data.text}</li>`
        }
      } else {
        return dataMap[data.type][data.style]
      }
    } else {
      return dataMap[data.type]
    }
  }
  setData (dataArray) {
    let content = ''

    dataArray.forEach((data, index) => {
      content += this._dataMap(data, dataArray, index)
    })
    this.contentContainer.innerHTML = content
  }
  insertAfter (newElement, targetElement) {
    var parent = targetElement.parentNode
    if (parent.lastChild == targetElement) {
      parent.appendChild(newElement)
    } else {
      parent.insertBefore(newElement, targetElement.nextSibling)
    }
  }
}
