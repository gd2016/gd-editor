import { dealTopic } from './untils/topic'
import xss from 'xss'
export {
  renderText,
  handleA
}
export default function (data, option) {
  option = Object.assign({
    replaceFn,
    topicFn,
    handleText: (text) => xss(text),
    innerLinks: []
  }, option)
  const newData = handleA(data, option.innerLinks)

  let html = '<div class="community-box">'
  newData.forEach(item => {
    if (item.postTags && item.postTags.length) {
      item.text = dealTopic(option.handleText(item.text), item.postTags, option)
    } else {
      item.text = option.handleText(item.text)
    }
    if (item.type === 'TEXT') {
      const index = item.index && `index="${item.index}"`
      html += `<p><span ${index || ''} class="${item.style ? item.style.toLowerCase() : ''}">${item.text}</span></p>`
    }
    if (item.type === 'IMAGE') {
      html += `<div class="img-box"><img src="${item.url}" />`
      if (item.text) {
        html += `<p class="dls-image-capture">${item.text}</p></div>`
      } else {
        html += '</div>'
      }
    }
    if (item.type === 'VIDEO') {
      html += `<div class="video-box"><video src="${item.url}"  class="video" controls ></video>`
      if (item.text) {
        html += `<p class="dls-image-capture">${item.text}</p></div>`
      } else {
        html += '</div>'
      }
    }
  })
  html += '</div>'
  return html
}

/**
 * @function 把内链的数据塞到postTags字段，与话题进行统一替换
 * @param  {Array} data       源数据
 * @param  {Array} innerLinks 内链
 * @return {Array} 新数据
 */
function handleA (data, innerLinks) {
  const newData = Array.from(data)
  if (innerLinks && innerLinks.length) {
    let contentOffset = -1
    let replaceArr = []
    innerLinks = innerLinks.sort((a, b) => a.contentOffset - b.contentOffset)
    innerLinks.forEach(link => {
      if (link.contentOffset != contentOffset && contentOffset != -1) {
        if (!newData[contentOffset]) return
        const postTags = newData[contentOffset].postTags || []
        newData[contentOffset].postTags = postTags.concat(replaceArr)
        replaceArr = [link]
      } else {
        replaceArr.push(link)
      }
      contentOffset = link.contentOffset
    })
    if (contentOffset !== -1 && newData[contentOffset]) {
      const postTags = newData[contentOffset].postTags || []
      newData[contentOffset].postTags = postTags.concat(replaceArr)
    }
  }
  return newData
}
/**
 * @function renderText
 * @param  {Array} data   数据
 * @param  {Object} option 其他配置，目前只有处理文本的方法
 * @return {html}
 */
function renderText (data, option = {}) {
  if (!option.handleText) {
    option.handleText = (text) => text
  }
  let html = ''
  const f = ['。', '，', '.', ',']
  data.forEach(item => {
    if (item.type === 'TEXT' && item.style === 'CONTENT' && item.text) {
      const last = html.charAt(html.length - 1)
      if (f.indexOf(last) !== -1) {
        html += `${option.handleText(item.text)}`
      } else {
        html += `${option.handleText(item.text)}，`
      }
    }
  })
  html = html.substring(0, html.length - 1)
  return html
}

export const replaceFn = (link) => {
  if (link.itemId.indexOf('/') !== -1) {
    return `<a href="${link.itemId}" target="_blank">${link.word}</a>`
  } else {
    return `<a href="/detail/${link.itemId}" target="_blank" data-id="${link.itemId}">${link.word}</a>`
  }
}

export const topicFn = (topicNode) => {
  return `<a href="#" class="topic" topic-id="${topicNode.topicId}">${topicNode.text}</a>`
}
