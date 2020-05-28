import test from '../src/index'
import './pop-box.less'
import './search-box.less'
import show from '../src/renderData'
const editor = new test({
  maxHeight: 350,
  container: document.querySelector('#editor-area'),
  maxlength: 10,
  host: '',
  onReady: (editor) => {
  }
})

document.querySelector('#getData').addEventListener('click', () => {
  let html = show(editor.getData(), {
    innerLinks: editor.linkArr
  })
  $('.content').html(html)
})

document.querySelector('#getLink').addEventListener('click', () => {
  console.log(editor.getLink())
})

document.querySelector('#setData').addEventListener('click', () => {
  const innerLinks = [{
    word: 'asd',
    itemId: '/family/subIndex?id=58018f240bd1beda25d7c186',
    contentOffset: 0,
    paramOffset: 3,
    wordLength: 3
  }]
  editor.setData([
    { style: 'UL', text: '1212', index: '1', type: 'TEXT' },
    { type: 'TEXT', text: '121121', index: '1', style: 'OL' },
    { type: 'TEXT', text: '2', index: 3, style: 'OL' },
    { type: 'TEXT', text: '12', style: 'REFER' }
  ], innerLinks)
})
