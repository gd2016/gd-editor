import test from '../src/index'
const editor = new test({
  container: document.querySelector('#editor-area'),
  content: [{
    type: 'TEXT',
    text: '12312'
  }, {
    type: 'TEXT',
    text: '12312cx xc asd     as d'
  }, {
    type: 'IMAGE',
    url: '//pic.evatlas.com/test-image942/7e45dc8d854f4bc0b3b18e72f441b57c'
  }],
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
  },
  toolbar: ['image']
  // plugins: [{
  //   constructor: imgPlugin,
  //   name: 'image'
  // }, {
  //   constructor: imgPlugin2,
  //   name: 'image2'
  // }]
})

document.querySelector('#getData').addEventListener('click', () => {
  console.log(editor.contentContainer)
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
