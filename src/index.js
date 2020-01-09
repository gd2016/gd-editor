import './index.less'
import imagePlugin from './image'
import stylePlugin from './style'
// import ulPlugin from './ul'
import ulPlugin from './list'
import xss from 'xss'
export default class MEditor {
  constructor (props) {
    Object.assign(this, {
      container: null,
      toolbar: ['image', 'h1', 'h2', 'refer', 'ol', 'ul'],
      plugins: [],
      id: 0, // 粘贴图片时的id标识
      maxlength: 0, // 字数限制，前端只做提示，没有限制提交
      basePlugins: [{
        constructor: imagePlugin,
        name: 'image'
      }, {
        constructor: stylePlugin,
        name: 'h1',
        config: {
          type: 'h1',
          label: '1级标题'
        }
      }, {
        constructor: stylePlugin,
        name: 'h2',
        config: {
          type: 'h2',
          label: '2级标题'
        }
      }, {
        constructor: ulPlugin,
        name: 'ol',
        config: {
          label: '有序列表'
        }

      }, {
        constructor: ulPlugin,
        name: 'ul',
        config: {
          label: '无序列表'
        }
      }, {
        constructor: stylePlugin,
        name: 'refer',
        config: {
          type: 'refer',
          label: '插入引用'
        }
      }],
      minHeight: 200,
      maxHeight: 400000,
      content: '',
      host: '__ALLHISTORY_HOSTNAME__',
      url: '/api/image/upload/v1',
      formName: 'userfile',
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
          this[pluginName] = new plugin.constructor({ name: plugin.name, editor: this, host: this.host, url: this.url, formName: this.formName, ...plugin.config })
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
    const objE = document.createElement('div')
    objE.innerHTML = domStr
    const node = objE.childNodes[0]
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
  getNode (node) {
    if (node.nodeName === '#text') return node.parentNode
    return node
  }
  getParents (node, className) {
    while (!this.getNode(node).classList.contains('dls-m-editor-content')) {
      if (this.getNode(node).classList.contains(className)) {
        return true
      }
      node = node.parentNode
    }
    return false
  }
  updateToolbarStatus (type) {
    const selectNode = this.selection && this.selection.endContainer
    if (this.getParents(selectNode, 'dls-image-capture')) {
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
   * @function 点击块的时候高亮显示
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
   * @function 判断最后一个节点是否为图片
   */
  _getlastImg (node) {
    if (!node) return false
    if (node.classList && node.classList.contains('dls-image-capture')) {
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
    if (this.selection.endContainer.parentNode.classList.contains('dls-image-capture')) {
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
        const img = node.querySelector('img')
        const txt = node.querySelector('.dls-image-capture')
        this.dataOutput.push({
          type: 'IMAGE',
          url: img.currentSrc,
          height: img.naturalHeight,
          width: img.naturalWidth,
          text: txt.innerText
        })
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
        if (style === 'OL') {
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
            style: nodeName.toLowerCase(),
            text: '',
            index: nodeName === 'OL' && Array.from(li).findIndex(li => li === node.parentNode) + 1,
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
  setData (dataArray) {
    let content = ''
    dataArray.forEach(data => {
      if (data.type === 'TEXT') {
        content += `<p>${data.text}</p>`
      }
      if (data.type === 'IMAGE') {
        content += `<div class="m-editor-block" ondragstart="return false"><img src=${data.url} /></div>`
      }
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
