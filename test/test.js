import test from '../src/index'
import './pop-box.less'
import './search-box.less'
import show from '../src/renderData'
const editor = new test({
  maxHeight: 350,
  container: document.querySelector('#editor-area'),
  maxlength: 10,
  host: '',
  // toolbar: ['image', 'video', 'h1', 'h2', 'refer', 'ol', 'ul', 'topic', 'link', 'justifyLeft', 'justifyCenter', 'justifyRight', 'undo', 'redo'],
  frameHost: '//10.4.40.168',
  onReady: (editor) => {
  }
})

document.querySelector('#getData').addEventListener('click', () => {
  let html = show(editor.getData(), {
    innerLinks: editor.getLink()
  })
  console.log(editor.getData(), editor.getLink())

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
  if ($('.dls-m-editor-content').text()) {
    return editor.setData(editor.getData(), editor.getLink())
  }
  const innerLinks = [{
    word: 'asd',
    itemId: '/family/subIndex?id=58018f240bd1beda25d7c186',
    contentOffset: 0,
    paramOffset: 3,
    wordLength: 3
  }]
  editor.setData([
    { type: 'IMAGE', text: '123', url: '//img.allhistory.com/5ed0f1ea28b210674be63c81.png' },
    { type: 'TEXT', text: '1233', style: 'H1' },
    { type: 'TEXT', text: '这是👌h2标题', style: 'H2' },
    { type: 'TEXT', text: '这是引用😆', style: 'REFER' },
    { style: 'UL',
      text: '1212#2#212122,4,5-三氯苯氧乙酸',
      index: '1',
      type: 'TEXT',
      postTags: [{
        paramOffset: 4,
        topicId: 'c81e728d9d4c2f636f067f89cc14862c',
        topicName: '2',
        wordLength: 3
      }] },
    { type: 'TEXT', text: '<script>alert(1)</script>', index: '1', style: 'OL' },
    { type: 'TEXT', text: 'jkbkb21\nkjbkj21\n', index: 3, style: 'OL' },
    { type: 'TEXT', text: '12', style: 'REFER' }
  ], innerLinks)
})

document.getElementById('exec').addEventListener('click', () => {
  editor.execcommand('link')
})
