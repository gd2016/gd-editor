const template = (config) => {
  return `<div class="m-editor-block"><img src=${config.src} /></div>`
}
export default class img {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      command: 'dls-image',
      label: '插入图片'
    }, props)
  }
  initCommand (editor) {
    editor.insertHtml(template({ src: '//pic.evatlas.com/test-image726/5aa61e9c84454ec7aa4d28501dccb9b3.png?w=640&h=640' }))
    // console.log(editor.selection.insertNode(textNode))
  }
}
