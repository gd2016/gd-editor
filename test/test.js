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
      str += `${item.url}<br/>capture: ${item.text} <br/>duration: ${item.duration}<br/>thumb: ${item.thumb}<hr/>`
    }
  })
  console.log(editor.getData())

  document.querySelector('.content').innerHTML = str
})

document.querySelector('#setData').addEventListener('click', () => {
  editor.setData([{
    type: 'TEXT',
    text: '12312'
  }, {
    type: 'TEXT',
    text: '12312'
  }, {
    type: 'TEXT',
    text: '12312cx xc asd     as d'
  }])
})

// document.onclick = () => {
//   console.log(window.getSelection(), window.getSelection().getRangeAt(0))
// }
// setTimeout(() => {
//   const selection = window.getSelection().getRangeAt(0)
//   var textNode = document.createTextNode('123')
//   selection.insertNode(textNode)
// }, 5000)
