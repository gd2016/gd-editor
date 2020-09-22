<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-07-01 19:52:05
 * @LastEditTime: 2019-08-15 15:16:31
 * @LastEditors: Please set LastEditors
 -->
# dls-m-editor  M编辑器

---

**如果要禁用编辑功能， 直接在容器加入disabled-m-editor类名**

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
| pluginParams| {} |  各个插件的额外参数 | 

## Method

| name     | params | return | description        |
| -------- | ------ | ------ | ------------------ |
| getLength |  是否是包括纯文本，不包含图片、视频等(Boolean)   | 长度     | 获取 editor 的内容长度 |
| setData |   dataArray，innerLinks  |       | 设置editor 的内容（数据，内链） |
| getData |     |    | 获取editor的内容  |    
| getLink |     |    | 获取editor内链            |    
| insertHtml |  html字符串  |  该节点  | 插入editor节点 | 
| execcommand | toolbar |    toolbar名称   |   根据toolbar名称主动调用一个插件功能      |

## renderData  renderText

```javascript
import renderData from '@portal/dls-m-editor/src/renderData' //渲染数据
import { renderText } from '@portal/dls-m-editor/src/renderData' //渲染纯文本，逗号隔开。不渲染H1,H2,图片等非文本

const data = [
  { type: 'TEXT', text: 'asdasd ##测试###⬇️阿萨德# ', style: 'CONTENT' },
  { type: 'IMAGE', url: 'http://img.allhistory.com/5e8c2adf9b11d2028b89c006.jpg', height: 600, width: 960, text: '123' },
  { type: 'TEXT', text: 'asd', style: 'CONTENT' },
  { style: 'OL', text: '1212', index: 1, type: 'TEXT' },
  { type: 'TEXT', text: '121121', index: 2, style: 'UL' },
  { type: 'TEXT', text: '2', index: 3, style: 'UL' },
  { type: 'TEXT', text: '12', style: 'REFER' }
]
const innerLinks = [{ //内链字段
  word: 'asd',
  itemId: 'asdadasde234231k', //一般是 词条的id，或者一个url链接到其他
  contentOffset: 0, //data偏移量，一般是data的第几段
  paramOffset: 3, //在data某一段的偏移量
  wordLength: 3 //word长度
}]

let html = renderData(data, {
  innerLinks,
  replaceFn: (link: innerLinks) => { //内链替换规则
      return `<a href="/detail/${link.itemId}" class="link" item-id="${link.itemId}">${link.word}</a>`
    },
  handleText: (text: data[].text) => text //对data每段text的额外处理，加xss等可以在这里进行
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
  pluginParams: { //修改插件参数，，例如修改话题的sug接口地址
    topic: { //键值 与toolbar对应  具体源代码查看/pugins/index.js
      url: '/api/toppost/tag/search',
      label: '插入话题'
    }
  },
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