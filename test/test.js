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
    innerLinks: editor.linkArr,
    replaceFn: (link) => {
      return `<a target="_blank" href="//10.4.40.168:3000/detail/${link.itemId}" class="link" item-id="${link.itemId}">${link.word}</a>`
    }
  })
  $('.content').html(html)
})

document.querySelector('#getLink').addEventListener('click', () => {
  console.log(editor.getLink())
})

document.querySelector('#setData').addEventListener('click', () => {
  const innerLinks = [{
    word: 'asd',
    itemId: 'asdadasde234231k',
    contentOffset: 0,
    paramOffset: 3,
    wordLength: 3
  }]
  editor.setData([
    { type: 'TEXT', text: 'asdasd ##测试###⬇️阿萨德# ', style: 'CONTENT' },
    { type: 'IMAGE', url: 'http://img.allhistory.com/5e8c2adf9b11d2028b89c006.jpg', height: 600, width: 960, text: '123' },
    { type: 'TEXT', text: 'asd', style: 'CONTENT' },
    { style: 'OL', text: '1212', index: 1, type: 'TEXT' },
    { type: 'TEXT', text: '121121', index: 2, style: 'UL' },
    { type: 'TEXT', text: '2', index: 3, style: 'UL' },
    { type: 'TEXT', text: '12', style: 'REFER' }
  ], innerLinks)
})
