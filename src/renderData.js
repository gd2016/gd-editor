import { dealTopic } from './untils/topic'
export default function (data, option = {}) {
  if (!option.handleText) {
    option.handleText = (text) => text
  }
  let html = '<div class="community-box">'
  data.forEach(item => {
    if (item.type === 'TEXT') {
      html += `<p><span index="${item.index}" class="${item.style ? item.style.toLowerCase() : ''}">${dealTopic(option.handleText(item.text), item.postTags)}</span></p>`
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
