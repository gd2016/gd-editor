<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-07-01 19:52:05
 * @LastEditTime: 2019-08-15 15:16:31
 * @LastEditors: Please set LastEditors
 -->
# dls-m-editor  M编辑器

---

## Config

| Key                | Default            | Description                                                           |
| ------------------ | ------------------ | --------------------------------------------------------------------- |
| container |   null   |  容器节点  |
| toolbar |   ['image']   | 工具栏    |
| plugins |   []   |  额外插件  |
| minHeight |   200   |  最小高度  |
| maxHeight |   400000   |  最大高度  |
| content |   ''   |  默认内容  |
| host |   '__ALLHISTORY_HOSTNAME__'   |  图片上传接口host  |
| onReady |  (editor){}   | 编辑器初始化回调   |
| maxlength | 0 | 字数限制，前端只做提示，没有限制提交 |


## renderData  renderText

```javascript
import renderData from '@portal/dls-m-editor/src/renderData'
import { renderText } from '@portal/dls-m-editor/src/renderData'

const data = [
  { type: 'TEXT', text: 'asdasd ##测试###⬇️阿萨德# ', style: 'CONTENT' },
  { type: 'IMAGE', url: 'http://img.allhistory.com/5e8c2adf9b11d2028b89c006.jpg', height: 600, width: 960, text: '123' },
  { type: 'TEXT', text: 'asd', style: 'CONTENT' },
  { style: 'OL', text: '1212', index: 1, type: 'TEXT' },
  { type: 'TEXT', text: '121121', index: 2, style: 'UL' },
  { type: 'TEXT', text: '2', index: 3, style: 'UL' },
  { type: 'TEXT', text: '12', style: 'REFER' }
]
const innerLinks = [{
  word: 'asd',
  itemId: 'asdadasde234231k',
  contentOffset: 0,
  paramOffset: 3,
  wordLength: 3
}]

let html = renderData(data, {
  innerLinks,
  replaceFn: (link: innerLinks) => {
      return `<a href="/detail/${link.itemId}" class="link" item-id="${link.itemId}">${link.word}</a>`
    },
  handleText: (text: data[].text) => text
})
document.querySelector('.content').innerHTML = html

let text = renderText(data,{
  handleText: (text: data[].text) => text
})
document.querySelector('.content').innerText = text

```


### Usage

```javascript
import test from '@portal/dls-m-editor'
const editor = new test({
  container: document.querySelector('#editor-area'),
  content: [{
    type: 'TEXT',
    text: '12312'
  }, {
    type: 'TEXT',
    text: '12312cx xc asd     as d'
  }, {
    type: 'IMAGE',
    url: '//pic.evatlas.com/test-image942/7e45dc8d854f4bc0b3b18e72f441b57c'
  }],
  onReady: (editor) => {
  },
  toolbar: ['image']
})
```