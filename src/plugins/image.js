import Service from '../service'
import { Alert } from '@portal/dls-ui'
const template = (config) => {
  const img = config.src ? `<img data-src="${config.src}" src=${config.src} />` : ''
  return `<div class="m-editor-block loading" ondragstart="return false">${img}<p class="dls-image-capture" contenteditable="true"></p></div>`
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
  init () {
    this.editor.contentContainer.addEventListener('keydown', this._handleKeyDown.bind(this))
    this.editor.contentContainer.addEventListener('keyup', this._handleKeyUp.bind(this))
  }
  _getImgToBase64 (url, callback) {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    var img = new Image()// 通过构造函数来创建的 img 实例，在赋予 src 值后就会立刻下载图片，相比 createElement() 创建 <img> 省去了 append()，也就避免了文档冗余和污染
    img.crossOrigin = 'Anonymous'
    // 要先确保图片完整获取到，这是个异步事件
    img.onload = function () {
      canvas.height = img.height// 确保canvas的尺寸和图片一样
      canvas.width = img.width
      ctx.drawImage(img, 0, 0)// 将图片绘制到canvas中
      var dataURL = canvas.toDataURL('image/png')// 转换图片为dataURL,传第二个参数可压缩图片,前提是图片格式jpeg或者webp格式的
      callback(dataURL)// 调用回调函数
      canvas = null
    }
    img.onerror = function () {
      callback(null)
      new Alert({ type: 'error', text: '加载失败，该图不支持浏览', position: 'top-center' })
    }
    img.src = url
  }
  // 将base64转换为文件对象
  _dataURLtoFile (dataurl, filename) {
    var arr = dataurl.split(',')
    var mime = arr[0].match(/:(.*?);/)[1]
    var bstr = atob(arr[1])
    var n = bstr.length
    var u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    // 转换成file对象
    return new File([u8arr], filename, { type: mime })
    // 转换成成blob对象
    // return new Blob([u8arr],{type:mime});
  }
  initCommand () {
    const selection = this.editor.selection
    if (selection.commonAncestorContainer.classList && selection.commonAncestorContainer.classList.contains('m-editor-block')) {
      return new Alert({ type: 'error', text: '请聚焦文本位置再上传', position: 'top-center' })
    }
    // return console.log(this.editor.insertHtml(template({ src: 'https://pic.allhistory.com/T1vRxCBXxT1RCvBVdK.jpeg?ch=244&cw=268&cx=0&cy=4&q=50&w=500&h=500' }), true))
    if (!this.file) {
      const self = this
      this.file = document.createElement('input')
      this.file.name = this.name
      this.file.type = 'file'
      this.file.multiple = true
      this.file.accept = '.jpg,.jpeg,.png,.gif'
      this.file.click()
      this.file.onchange = function (e) {
        self.upload(this.files)
      }
    } else {
      this.file.click()
    }
  }
  upload (files) {
    Array.from(files).forEach((file, index) => {
      if (this[file.name + index]) return
      let formData = new FormData()
      formData.append(this.formName, file)
      this[file.name + index] = this.editor.insertHtml(template({ src: '' }), true)
      Service.saveImage(this.host + this.url, formData).then(res => {
        if (res.code === 200) {
          const img = document.createElement('img')
          img.src = res.data.imageUrl
          img.setAttribute('data-src', res.data.imageUrl)
          this[file.name + index].prepend(img)
          img.onload = () => {
            this[file.name + index].classList.remove('loading')
            this[file.name + index] = ''
          }
          img.onerror = () => {
            this[file.name + index].classList.remove('loading')
            this[file.name + index] = ''
          }
        } else {
          this[file.name + index].parentNode.removeChild(this[file.name + index])
          new Alert({ type: 'error', text: '上传失败', position: 'top-center' })
          this[file.name + index] = ''
        }
      }).catch(err => {
        new Alert({ type: 'error', text: `上传失败${err.status}`, position: 'top-center' })
        this[file.name + index].parentNode.removeChild(this[file.name + index])
        this[file.name + index] = ''
      }).finally(() => {
        if (this.file) this.file.value = ''
      })
    })
  }

  replaceImg (urlArr, id) {
    const imgArr = document.querySelectorAll(`.img${id}`)
    const imgBlock = imgArr[0] && imgArr[0].parentNode
    const url = urlArr[0]
    if (!url) return
    this._getImgToBase64(url, (data) => {
      if (!data) {
        imgBlock.parentNode.removeChild(imgBlock)
        urlArr.shift()
        return this.replaceImg(urlArr, id)
      }
      var file = this._dataURLtoFile(data, 'all')
      let formData = new FormData()

      formData.append(this.formName, file)
      Service.saveImage(this.host + this.url, formData).then(res => {
        if (res.code === 200) {
          imgArr[0].src = res.data.imageUrl
          imgArr[0].setAttribute('data-src', res.data.imageUrl)
          imgArr[0].onload = () => {
            imgArr[0].parentNode.classList.remove('loading')
          }
          imgArr[0].onerror = () => {
            imgBlock.parentNode.removeChild(imgBlock)
          }
        } else {
          imgArr[0].parentNode.classList.remove('loading')
          new Alert({ type: 'error', text: '上传失败', position: 'top-center' })
        }
      }).catch(err => {
        new Alert({ type: 'error', text: `上传失败${err.status}`, position: 'top-center' })
        imgBlock.parentNode.removeChild(imgBlock)
      }).finally(res => {
        imgArr[0].classList.remove(`img${id}`)
        urlArr.shift()
        this.replaceImg(urlArr, id)
      })
    })
  }

  _handleKeyDown (e) {
    if (e.code === 'Enter' && e.target.className === 'dls-image-capture') {
      e.preventDefault()
    }
  }
  _handleKeyUp (e) {
    if (e.code !== 'Backspace' && e.target.className === 'dls-image-capture' && e.target.innerText.length >= 60) {
      new Alert({ type: 'error', text: `图片描述最多输入60个字`, position: 'top-center' })
      e.target.innerText = e.target.innerText.substring(0, 60)
      e.preventDefault()
    }
  }
}
