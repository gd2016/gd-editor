const template = (config) => {
  return `<div class="m-editor-block"><img src=${config.src} /></div>`
}
export default class img {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      command: 'dls-image2',
      label: '插入图片2'
    }, props)
  }
  initCommand (editor) {
    editor.insertHtml(template({ src: 'https://pic.allhistory.com/T1vRxCBXxT1RCvBVdK.jpeg?ch=244&cw=268&cx=0&cy=4&q=50&w=500&h=500' }))
    // console.log(editor.selection.insertNode(textNode))
  }
}
