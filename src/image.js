import Service from './service'
import { Alert } from '@portal/dls-ui'
const template = (config) => {
  const img = config.src ? `<img src=${config.src} />` : ''
  return `<div class="m-editor-block loading" ondragstart="return false">${img}</div>`
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
  // getImgToBase64 (url, callback) {
  //   var canvas = document.createElement('canvas')
  //   var ctx = canvas.getContext('2d')
  //   var img = new Image()// 通过构造函数来创建的 img 实例，在赋予 src 值后就会立刻下载图片，相比 createElement() 创建 <img> 省去了 append()，也就避免了文档冗余和污染
  //   img.crossOrigin = 'Anonymous'
  //   // 要先确保图片完整获取到，这是个异步事件
  //   img.onload = function () {
  //     canvas.height = img.height// 确保canvas的尺寸和图片一样
  //     canvas.width = img.width
  //     ctx.drawImage(img, 0, 0)// 将图片绘制到canvas中
  //     var dataURL = canvas.toDataURL('image/png')// 转换图片为dataURL,传第二个参数可压缩图片,前提是图片格式jpeg或者webp格式的
  //     callback(dataURL)// 调用回调函数
  //     canvas = null
  //   }
  //   img.onerror = function () {
  //     new Alert({ type: 'error', text: '上传失败', position: 'top-center' })
  //   }
  //   img.src = url
  // }
  // // 将base64转换为文件对象
  // dataURLtoFile (dataurl, filename) {
  //   var arr = dataurl.split(',')
  //   var mime = arr[0].match(/:(.*?);/)[1]
  //   var bstr = atob(arr[1])
  //   var n = bstr.length
  //   var u8arr = new Uint8Array(n)
  //   while (n--) {
  //     u8arr[n] = bstr.charCodeAt(n)
  //   }
  //   // 转换成file对象
  //   return new File([u8arr], filename, { type: mime })
  //   // 转换成成blob对象
  //   // return new Blob([u8arr],{type:mime});
  // }
  initCommand () {
    // return this.getImgToBase64(`https://dss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=291378222,233871465&fm=26&gp=0.jpg`, (data) => {
    //   var myFile = this.dataURLtoFile(data, 'testimgtestimgtestimg')
    //   console.log(myFile)
    //   this._upload([myFile])
    // })
    // return this.editor.insertHtml(template({ src: 'https://pic.allhistory.com/T1vRxCBXxT1RCvBVdK.jpeg?ch=244&cw=268&cx=0&cy=4&q=50&w=500&h=500' }))
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
    Array.from(files).forEach((file, index) => {
      let formData = new FormData()
      formData.append(this.formName, file)
      this['node' + index] = this.editor.insertHtml(template({ src: '' }))
      Service.saveImage(this.host + this.url, formData).then(res => {
        if (res.code === 200) {
          const img = document.createElement('img')
          img.src = res.data.imageUrl
          this['node' + index].appendChild(img)
          img.onload = () => {
            this['node' + index].classList.remove('loading')
          }
          img.onerror = () => {
            this['node' + index].classList.remove('loading')
          }
        } else {
          this['node' + index].classList.remove('loading')
          new Alert({ type: 'error', text: '上传失败', position: 'top-center' })
        }
      })
    })
  }
}
