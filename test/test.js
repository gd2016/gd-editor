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

document.querySelector('#showData').addEventListener('click', () => {
  const innerLinks = [{
    word: 'asd',
    itemId: 'asdadasde234231k',
    contentOffset: 1,
    paramOffset: 3,
    wordLength: 3
  }, {
    word: 'asd',
    itemId: 'asdadasde234231k',
    contentOffset: 4,
    paramOffset: 3,
    wordLength: 3
  }]
  const detail = [
    { style: 'UL', text: '1212', index: '1', type: 'TEXT' },
    { type: 'TEXT', text: '121asd121', index: '1', style: 'OL' },
    { type: 'TEXT', text: '2', index: '2', style: 'OL' },
    { type: 'TEXT', text: '12', style: 'REFER' }
  ]
  let content = show(detail, {
    innerLinks
  })
  $('.show-content').html(content)
})

document.querySelector('#getLink').addEventListener('click', () => {
  console.log(editor.getLink())
})

document.querySelector('#setData').addEventListener('click', () => {
  const innerLinks = [{
    word: 'asd',
    itemId: 'asdadasde234231k',
    contentOffset: 4,
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
