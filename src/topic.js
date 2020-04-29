import { PopBox } from '@portal/dls-ui'
import SearchBox from '@portal/dls-searchbox'
const template = function () {
  return `<div class="topic-search-box search-box">
    <input type="text" class="link-text"  placeholder="输入话题名称"/>
    <ul  class="topic-search-box-suggestions"></ul>
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
  }
  initCommand () {
    const selection = window.getSelection().getRangeAt(0)
    this.$html = $(template())
    this.pop = new PopBox({
      title: '插入话题',
      maskClass: 'topic-pop',
      $content: this.$html,
      onSubmit: () => {
        const A = document.createElement('a')
        A.innerHTML = ` ${this.name} `
        if ($(selection.endContainer).parents('.dls-m-editor-content').length < 1) {
          this.editor.appendChild(A)
        } else {
          const node = selection.commonAncestorContainer
          const range = document.createRange()
          range.setStart(node, selection.startOffset)
          range.setEnd(node, selection.endOffset)
          var sel = window.getSelection()
          sel.removeAllRanges()
          sel.addRange(range)
          document.execCommand('insertHTML', false, ` <a class="topic" topic-id="${this.topicId}">${this.name}</a> `)
          $('a.topic').css({ '-webkit-user-modify': 'read-only' })
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
      domainName: '',
      params: {
        page: '1',
        size: '10'
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
