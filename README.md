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
| imgHost |   '//pic.evatlas.com'   |  图片host地址  |
| host |   '__ALLHISTORY_HOSTNAME__'   |  图片上传接口host  |
| url |   '/api/image/upload'   |  图片上传地址  |
| formName |   'userfile'   |   图片上传字段 |
| onReady |  (editor){}   | 编辑器初始化回调   |


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