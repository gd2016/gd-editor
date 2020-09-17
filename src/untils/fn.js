import xss from 'xss'
/**
   * @function 主动定位光标
   * @param  {node} node 节点
   */
export const setRange = (node) => {
  const range = document.createRange()
  range.selectNodeContents(node)
  range.collapse(false)
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
  return sel.getRangeAt(0)
}

export const setSelection = (selection) => {
  const node = selection.commonAncestorContainer
  const range = document.createRange()
  if (node.innerHTML === '<br>') node.innerHTML = ''
  range.setStart(node, selection.startOffset)
  range.setEnd(node, selection.endOffset)
  var sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}

/**
   * @function 将文本节点、元素节点转换为元素节点
   * @param  {node} node 文本节点、元素节点
   * @return {type} 元素节点
   */
export const getNode = (node) => {
  if (node.nodeName === '#text') return node.parentNode
  return node
}

/**
* @function 判断节点是否在类名为className的父节点下
* @param  {type} node      文本节点、元素节点
* @param  {type} className class类名
*/
export const getParents = (node, className) => {
  while (!getNode(node).classList.contains('dls-m-editor-content')) {
    if (getNode(node).classList.contains(className)) {
      return true
    }
    node = node.parentNode
  }
  return false
}

/**
 * @function 判断最后一个节点是否为图片或者block块
 */
export const getlastImg = (node) => {
  if (!node) return false
  if (node.classList && (node.classList.contains('dls-image-capture') || node.classList.contains('dls-video-capture'))) {
    return node
  }
  if (node.nodeName === '#text' && node.nodeValue === '') {
    if (node.previousSibling && node.previousSibling.lastChild) {
      return getlastImg(node.previousSibling.lastChild)
    }
    return true
  }
  if (node.nodeName === 'IMG') {
    return node.parentNode
  }
  return getlastImg(node.lastChild)
}

export const toCamelCase = (str) => {
  str = str.toLowerCase()
  let arr = str.split('-')
  for (let i = 1; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1)
  }
  return arr.join('')
}

/**
 * @function 获取当前节点的偏移量
 */
export const getOffset = (node) => {
  let offset = 0
  if (node.previousSibling) {
    offset += getLength(node.previousSibling)
  }
  return offset
}

export const getLength = (node) => {
  let length = node.nodeName == '#text' ? node.length : node.textContent.length
  if (node.previousSibling) {
    length += getLength(node.previousSibling)
  }
  return length
}

/**
 * @function 设置dataArray的时候按相应的map展示到编辑器上
 * @param  {Object} data      当前某一行的data
 * @param  {Number} index     当前行data的index
 * @param  {Array} dataArray data总数据
 * @return {string} 按数据转化成html的字符串
 */
export const dataMap = (data, index, dataArray) => {
  let text = data.text
  const dataMap = {
    IMAGE: `<div class="m-editor-block" ondragstart="return false"><img data-src=${data.url} src=${data.url} /><p class="dls-image-capture" contenteditable="true">${text || ''}</p></div>`,
    VIDEO: `<div class="m-editor-block dls-video-box" ondragstart="return false"><video data-src=${data.url} controls src=${data.url} /></video><p class="dls-video-capture" contenteditable="true">${text || ''}</p></div>`,
    TEXT: {
      CONTENT: `<p>${text}</p>`,
      H1: `<h1>${text}</h1>`,
      H2: `<h2>${text}</h2>`,
      REFER: `<blockquote>${text}</blockquote>`
    }
  }
  if (data.type === 'TEXT') {
    if (data.style === 'OL' || data.style === 'UL') {
      const next = dataArray[index + 1]
      if (data.index == 1) {
        if (!next || data.style != next.style || next.index == 1) { // 只有一行ul或者ol的时候
          return `<${data.style.toLowerCase()}><li>${data.text}</li></${data.style.toLowerCase()}>`
        }
        return `<${data.style.toLowerCase()}><li>${data.text}</li>`
      } else if (!next || data.style != next.style || next.index == 1) {
        return `<li>${data.text}</li></${data.style.toLowerCase()}>`
      } else {
        return `<li>${data.text}</li>`
      }
    } else {
      return dataMap[data.type][data.style || 'CONTENT']
    }
  } else {
    return dataMap[data.type]
  }
}

export const insertAfter = (newElement, targetElement) => {
  let parent = targetElement.parentNode
  if (parent.lastChild == targetElement) {
    parent.appendChild(newElement)
  } else {
    parent.insertBefore(newElement, targetElement.nextSibling)
  }
}

/**
 * @function updateStaus
 * @param  {string} 插件名称
 * @param  {boolean} 是否启用
 */
export const updateStatus = (pluginName, status) => {
  const toolbar = document.querySelector('.toolbar')
  const icon = toolbar.querySelector(`.dls-${pluginName}-icon-container`)
  if (status) {
    icon && icon.classList.remove('disabled')
  } else {
    icon && icon.classList.add('disabled')
  }
}

export const activeTool = (pluginName, active) => {
  const toolbar = document.querySelector('.toolbar')
  const icon = toolbar.querySelector(`.dls-${pluginName}-icon-container`)
  const icons = toolbar.querySelectorAll('.icon-container')
  Array.from(icons).forEach(icon => {
    icon.classList.remove('active')
  })
  if (!pluginName) return
  active && icon.classList.add('active')
  !active && icon.classList.remove('active')
}

/**
 * @function 查看toolbar某个功能是否激活
 * @return {boolean} true代表激活
 */
export const getStatus = (pluginName) => {
  const toolbar = document.querySelector('.toolbar')
  const icon = toolbar.querySelector(`.dls-${pluginName}-icon-container`)
  if (icon.classList.contains('active')) return true
  return false
}

export const xssfilter = (text) => {
  return xss(text).replace(/\ufffc/g, '')
}
