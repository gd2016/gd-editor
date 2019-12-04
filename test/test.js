import test from '../src/index'
const editor = new test({
  maxHeight: 350,
  container: document.querySelector('#editor-area'),
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
  // plugins: [{
  //   constructor: imgPlugin2,
  //   name: 'image2'
  // }]
})

document.querySelector('#getData').addEventListener('click', () => {
  let str = ''
  editor.getData().forEach(item => {
    if (item.type === 'TEXT') {
      if (item.style === 'HEADER') {
        str += `<b>${item.text}</b><hr/>`
      } else {
        str += `${item.text}<hr/>`
      }
    } else {
      str += item.url + '<hr/>'
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
