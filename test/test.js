import test from '../src/index'
import imgPlugin from './imgPlugin'
import imgPlugin2 from './plugin2'
const editor = new test({
  container: document.querySelector('#editor-area'),
  content: [{
    type: 'TEXT',
    text: '12312'
  }, {
    type: 'TEXT',
    text: '12312cx xc asd     as d'
  }],
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
  toolbar: ['image', 'image2'],
  plugins: [{
    constructor: imgPlugin,
    name: 'image'
  }, {
    constructor: imgPlugin2,
    name: 'image2'
  }]
})

document.querySelector('#getData').addEventListener('click', () => {
  console.log(editor.getData())
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
