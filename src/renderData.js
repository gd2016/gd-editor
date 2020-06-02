import { dealTopic } from './untils/topic'
export {
  renderText
}
export default function (data, option) {
  option = Object.assign({
    replaceFn: (link) => {
      if (link.itemId.indexOf('/') !== -1) {
        return `<a href="${link.itemId}" target="_blank">${link.word}</a>`
      } else {
        return `<a href="/detail/${link.itemId}" target="_blank" data-id="${link.itemId}">${link.word}</a>`
      }
    },
    handleText: (text) => text,
    innerLinks: []
  }, option)
  const newData = handleA(data, option.innerLinks, option.replaceFn)
  let html = '<div class="community-box">'
  newData.forEach(item => {
    if (item.type === 'TEXT') {
      const index = item.index && `index="${item.index}"`
      html += `<p><span ${index || ''} class="${item.style ? item.style.toLowerCase() : ''}">${dealTopic(option.handleText(item.text), item.postTags)}</span></p>`
    }
    if (item.type === 'IMAGE') {
      html += `<div class="img-box"><img src=${item.url} />`
      if (item.text) {
        html += `<p class="dls-image-capture">${option.handleText(item.text)}</p></div>`
      } else {
        html += '</div>'
      }
    }
    if (item.type === 'VIDEO') {
      html += `<div class="video-box"><video src=${item.url}  class="video" controls/>`
      if (item.text) {
        html += `<p class="dls-image-capture">${option.handleText(item.text)}</p></div>`
      } else {
        html += '</div>'
      }
    }
  })
  html += '</div>'
  return html
}

function handleA (data, innerLinks, replaceFn) {
  const newData = Array.from(data)
  if (innerLinks && innerLinks.length) {
    let contentOffset = -1
    let replaceArr = []
    innerLinks = innerLinks.sort((a, b) => a.contentOffset - b.contentOffset)
    innerLinks.forEach(link => {
      if (link.contentOffset != contentOffset && contentOffset != -1) {
        newData[contentOffset].text = dealTopic(newData[contentOffset].text, replaceArr, replaceFn)
        replaceArr = [link]
      } else {
        replaceArr.push(link)
      }
      contentOffset = link.contentOffset
    })
    if (contentOffset !== -1) {
      newData[contentOffset].text = dealTopic(newData[contentOffset].text, replaceArr, replaceFn)
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
