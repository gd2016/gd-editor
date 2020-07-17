import { PopBox, Alert } from '@portal/dls-ui'
import SearchBox from '@portal/dls-searchbox'
const template = function () {
  return `<div class="topic-search-box search-box">
    <input type="text" class="link-text"  placeholder="输入话题名称"/>
    <ul  class="search-box-suggestions topic-search-box-suggestions"></ul>
  </div>`
}
export default class Topic {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '话题',
      host: '',
      url: ''
    }, props)
  }

  init () {
    this.editor.contentContainer.addEventListener('click', this._onClick.bind(this))
    this.editor.contentContainer.addEventListener('keyup', this._onKeyup.bind(this))
  }

  _selectA (node) {
    const range = document.createRange()
    range.selectNode(node)
    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }

  _onClick (event) {
    if (event.target.nodeName == 'A' && event.target.classList.contains('topic')) {
      this._selectA(event.target)
    }
  }

  _onKeyup (e) { // 按左右键进入内链的情况
    if (e.keyCode !== 37 && e.keyCode !== 39) return
    const rangeDom = window.getSelection().getRangeAt(0)
    const domA = rangeDom.startContainer.parentNode
    if (domA.nodeName == 'A' && domA.classList.contains('topic')) {
      this._selectA(rangeDom.startContainer.parentNode)
    }
  }

  initCommand () {
    const selection = window.getSelection().getRangeAt(0)
    this.$html = $(template())
    this.pop = new PopBox({
      title: '插入话题',
      maskClass: 'topic-pop',
      $content: this.$html,
      onSubmit: () => {
        if (!this.topicId || !this.name) {
          return new Alert({
            duration: 1000,
            position: 'top-center',
            type: 'error',
            text: '请选择话题后再插入'
          })
        }
        if ($(selection.endContainer).parents('.dls-m-editor-content').length < 1) {
          return new Alert({
            duration: 2000,
            position: 'top-center',
            type: 'error',
            text: '请聚焦编辑器后再插入'
          })
        } else {
          const node = selection.commonAncestorContainer
          const range = document.createRange()
          if (node.innerHTML === '<br>') node.innerHTML = ''
          range.setStart(node, selection.startOffset)
          range.setEnd(node, selection.endOffset)
          var sel = window.getSelection()
          sel.removeAllRanges()
          sel.addRange(range)
          document.execCommand('insertHTML', false, `<a href="#" class="topic" topic-id="${this.topicId}">${this.name}</a>`)
        }
        this.pop.close()
      }
    })
    this.searchBox = new SearchBox({
      $container: $(this.pop.content).find('.topic-search-box'),
      input: 'input',
      defaultValue: '',
      autoFocus: true,
      suggestContainer: '.topic-search-box-suggestions',
      suggestionUrl: this.url,
      historyName: null,
      absolute: true,
      key: 'tag',
      method: 'get',
      params: {
        page: '1',
        size: '10'
      },
      domainName: '',
      emitFocusEvent: () => {
        this.topicId = ''
        this.name = ''
      },
      noResultTip: true,
      onSelect: (entry) => {
        this.topicId = entry.id
        this.name = entry.name
      },
      parseResp (resp) {
        if (!resp.data) { return };
        let rs = resp.data.list.map((item, index) => {
          return {
            id: item.topicId,
            name: item.topicName
          }
        })
        return rs
      }
    })
  }
}
