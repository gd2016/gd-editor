import Service from './service'
import { Alert } from '@portal/dls-ui'
const template = (config) => {
  return `<div class="m-editor-block" ondragstart="return false"><img src=${config.src} /></div>`
}
export default class img {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '插入图片',
      name: 'userfile',
      url: '',
      host: '',
      formName: 'userfile'
    }, props)
  }
  initCommand () {
    // this.editor.insertHtml(template({ src: 'https://pic.allhistory.com/T1vRxCBXxT1RCvBVdK.jpeg?ch=244&cw=268&cx=0&cy=4&q=50&w=500&h=500' }))
    // return;
    const file = document.createElement('input')
    const self = this
    file.name = this.name
    file.type = 'file'
    file.multiple = true
    file.accept = '.jpg,.jpeg,.png,.gif'
    file.click()
    file.onchange = function (e) {
      self._upload(this.files)
    }
  }
  _upload (files) {
    Array.from(files).forEach(file => {
      let formData = new FormData()
      formData.append(this.formName, file)
      Service.saveImage(this.host + this.url, formData).then(res => {
        if (res.code === 200) {
          this.editor.insertHtml(template({ src: `${res.data.imageUrl}` }))
        } else {
          new Alert({ type: 'error', text: '上传失败', position: 'top-center' })
        }
      })
    })
  }
}
