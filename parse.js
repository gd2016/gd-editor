const jsdom = require('jsdom')
const newData = []
// const data = require('./test1')
// console.log(serialize(data))
function serialize (data) {
  const { JSDOM } = jsdom
  const dom = JSDOM.fragment(`<div>${data}</div>`)
  Array.from(dom.firstChild.childNodes).forEach(node => {
    console.log(node.nodeName)
    switch (node.nodeName) {
      case '#text':
        return handleText(node)
      case 'BR':
        return newData.push({
          type: 'TEXT',
          text: '',
          style: 'CONTENT'
        })
      case 'OL':
      case 'UL':
        return handleLi(node)
      case 'P':
        return handleP(node)
      case 'A':
        return handleA(node)
      case 'FIGURE':
        return handleFigure(node)
      case 'H2':
      case 'BLOCKQUOTE':
        return handleTag(node)
    }
  })
  return newData
}

function handleText (node) {
  node.data && node.data !== '\n' && newData.push({
    type: 'TEXT',
    text: node.data,
    style: 'CONTENT'
  })
}

function handleLi (node) {
  Array.from(node.querySelectorAll('li')).forEach((li, index) => {
    newData.push({
      type: 'TEXT',
      text: li.textContent,
      index: index + 1,
      style: node.nodeName
    })
  })
}
function handleP (node) {
  newData.push({
    type: 'TEXT',
    text: node.textContent,
    style: 'CONTENT'
  })
}
function handleA (node) {
  if (node.href.indexOf('www.zhihu.com/zvideo') > 0 ||
  node.href.indexOf('www.zhihu.com/video') > 0 ||
  node.href.indexOf('video.zhihu.com/video') > 0) {
    if (node.classList.contains('video-box')) {
      const thumb = node.querySelector('.thumbnail').src
      const title = node.querySelector('.title').textContent
      newData.push({
        type: 'VIDEO',
        text: '',
        url: node.href,
        thumb,
        title
      })
    } else {
      newData.push({
        type: 'VIDEO',
        text: '',
        url: node.href
      })
    }
  }
}
function handleFigure (node) {
  const url = node.querySelector('img').getAttribute('data-actualsrc')
  const text = (node.querySelector('figcaption') || '') && node.querySelector('figcaption').textContent
  newData.push({
    type: 'IMAGE',
    text,
    url
  })
}
function handleTag (node) {
  if (node.nodeName === 'H2') {
    return newData.push({
      style: 'H2',
      text: node.textContent,
      type: 'TEXT'
    })
  }
  if (node.nodeName === 'BLOCKQUOTE') {
    return newData.push({
      style: 'REFER',
      text: node.textContent,
      type: 'TEXT'
    })
  }
}
