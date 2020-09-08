import Service from '../service'
import { Alert } from '@portal/dls-ui'
const template = () => {
  const video = `<div class="progress">
    <div class="progress-bar">
      <div class="progress-bar__outer">
        <div class="progress-bar__inner" style="width:0%"></div>
      </div>
    </div>
    <div class="progress__text">0%</div>
  </div>`
  return `<div class="m-editor-block dls-video-box" ondragstart="return false">${video}<p class="dls-video-capture" contenteditable="true"></p></div>`
}
export default class img {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '插入视频',
      name: 'userfile',
      url: '',
      host: '',
      formName: 'userfile'
    }, props)
  }
  init () {
    this.editor.contentContainer.addEventListener('keydown', this._handleKeyDown.bind(this))
    this.editor.contentContainer.addEventListener('keyup', this._handleKeyUp.bind(this))
  }
  initCommand () {
    // return this.editor.insertHtml(template({ src: '//video.allhistory.com/5e1bde079b11d23010573833.mp4' }))
    if (!this.file) {
      const self = this
      this.file = document.createElement('input')
      this.file.name = this.name
      this.file.type = 'file'
      this.file.multiple = true
      this.file.accept = '.mp4'
      this.file.click()
      this.file.onchange = function (e) {
        self._upload(this.files)
      }
    } else {
      this.file.click()
    }
  }
  _upload (files) {
    Array.from(files).forEach((file, index) => {
      if (this[file.name + index]) return
      let formData = new FormData()
      formData.append(this.formName, file)
      this[file.name + index] = this.editor.insertHtml(template(), true)
      Service.saveVideo(this.host + this.url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onProgress: (e) => {
          if (e.total == 0) {
            new Alert({ text: '请重试', type: 'error', position: 'top-center' })
          } else {
            this[file.name + index].querySelector('.progress__text').innerText = `${Math.floor(e.loaded / e.total * 100)}%`
            this[file.name + index].querySelector('.progress-bar__inner').style.width = `${Math.floor(e.loaded / e.total * 100)}%`
          }
        }
      }).then(res => {
        if (res.code === 200) {
          const video = document.createElement('video')
          const progress = this[file.name + index].querySelector('.progress')
          video.controls = true
          video.src = res.data.videoUrl
          // video.setAttribute('thumb', res.data.videoUrl.replace('.mp4', '.jpg'))
          progress.parentNode.removeChild(progress)
          this[file.name + index].prepend(video)
        } else {
          this[file.name + index].parentNode.removeChild(this[file.name + index])
          new Alert({ type: 'error', text: '上传失败', position: 'top-center' })
        }
        this[file.name + index] = ''
      }).catch(err => {
        new Alert({ type: 'error', text: `上传失败${err.status}`, position: 'top-center' })
        this[file.name + index].parentNode.removeChild(this[file.name + index])
        this[file.name + index] = ''
      }).finally(() => {
        this.file.value = ''
      })
    })
  }

  _handleKeyDown (e) {
    if (e.code === 'Enter' && e.target.className === 'dls-video-capture') {
      e.preventDefault()
    }
  }
  _handleKeyUp (e) {
    if (e.code !== 'Backspace' && e.target.className === 'dls-video-capture' && e.target.innerText.length >= 60) {
      new Alert({ type: 'error', text: `视频描述最多输入60个字`, position: 'top-center' })
      e.target.innerText = e.target.innerText.substring(0, 60)
      e.preventDefault()
    }
  }
}
