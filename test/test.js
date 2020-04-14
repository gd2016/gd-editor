import test from '../src/index'
const editor = new test({
  maxHeight: 350,
  container: document.querySelector('#editor-area'),
  maxlength: 10,
  // content: [{
  //   type: 'TEXT',
  //   text: '12312'
  // }, {
  //   type: 'TEXT',
  //   text: '12312cx xc asd     as d'
  // }],
  // toolbar: ['video'],
  host: 'http://10.4.40.168',
  onReady: (editor) => {
    // editor.setData([{
    //   type: 'TEXT',
    //   text: '12312'
    // }, {
    //   type: 'TEXT',
    //   text: '12312'
    // }, {
    //   type: 'TEXT',
    //   text: '12312cx xc asd     as d'
    // }])
  }
})

document.querySelector('#getData').addEventListener('click', () => {
  let str = ''
  editor.getData().forEach(item => {
    if (item.type === 'TEXT') {
      if (item.style === 'HEADER' || item.style === 'H1') {
        str += `<h1>${item.text}</h1><hr/>`
      } else if (item.style === 'H2') {
        str += `<h2>${item.text}</h2><hr/>`
      } else if (item.style === 'OL') {
        str += `<p>${item.index}:${item.text}</p><hr/>`
      } else if (item.style === 'UL') {
        str += `<p>~${item.text}</p><hr/>`
      } else if (item.style === 'REFER') {
        str += `<p>refer：${item.text}</p><hr/>`
      } else {
        str += `<p>${item.text}</p><hr/>`
      }
    } else if (item.type === 'IMAGE') {
      str += item.url + '<br/>capture:' + item.text + '<hr/>'
    } else {
      str += `${item.url}<br/>capture: ${item.text} <br/><hr/>`
    }
  })
  console.log(editor.getData())

  document.querySelector('.content').innerHTML = str
})

document.querySelector('#setData').addEventListener('click', () => {
  editor.setData([
    { type: 'TEXT', text: 'asd', style: 'CONTENT' },
    { type: 'IMAGE', url: 'http://img.allhistory.com/5e8c2adf9b11d2028b89c006.jpg', height: 600, width: 960, text: null },
    { type: 'TEXT', text: 'asd', style: 'CONTENT' },
    { type: 'VIDEO', url: 'https://video.allhistory.com/5e8c2ae79b11d2028b89c007.mp4', text: null },
    { type: 'TEXT', text: null, style: 'H1' },
    { type: 'TEXT', text: '121', style: 'H2' },
    { type: 'TEXT', text: '12', style: 'REFER' },
    { type: 'TEXT', text: '1212', style: 'REFER' },
    { style: 'OL', text: '1212', index: 1, type: 'TEXT' },
    { style: 'OL', text: '12123', index: 2, type: 'TEXT' },
    { style: 'UL', text: '', index: 1, type: 'TEXT' },
    { type: 'TEXT', text: '121121', index: 2, style: 'UL' },
    { type: 'TEXT', text: '2', index: 3, style: 'UL' },
    { type: 'TEXT', text: '12', style: 'REFER' }
  ])
})

// document.onclick = () => {
//   console.log(window.getSelection(), window.getSelection().getRangeAt(0))
// }
// setTimeout(() => {
//   const selection = window.getSelection().getRangeAt(0)
//   var textNode = document.createTextNode('123')
//   selection.insertNode(textNode)
// }, 5000)
