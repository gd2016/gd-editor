import { PopBox, Alert } from '@portal/dls-ui'
import SearchBox from '@portal/dls-searchbox'
const template = function () {
  return `<div class="link-search-box search-box">
    <input type="text" class="link-text"  placeholder="输入话题名称"/>
    <ul  class="search-box-suggestions link-search-box-suggestions"></ul>
  </div>`
}
const templateEdit = function (config) {
  return `<div class="dls-editor-lite-edit-link link-edit">
    <a target="_blank" class="link-value" href="${config.href}">${config.href}</a>
    <span class="icon icon-delete-x"></span>
    <span class="icon icon-edit"></span>
  </div>`
}
export default class Link {
  constructor (props) {
    Object.assign(this, {
      editor: '',
      label: '链接',
      host: '',
      url: '',
      frameHost: ''
    }, props)
  }

  init () {
    this._bind()
  }
  initCommand (name, select) {
    let selection = select
    if (!select) selection = window.getSelection().getRangeAt(0)
    if (!name) name = window.getSelection().toString()
    this.$html = $(template())
    this.pop = new PopBox({
      title: '插入链接',
      maskClass: 'topic-pop',
      $content: this.$html,
      onSubmit: () => {
        if (!this.id || !this.name) {
          return new Alert({
            duration: 1000,
            position: 'top-center',
            type: 'error',
            text: '请选择词条后再插入'
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
          range.setStart(node, selection.startOffset)
          range.setEnd(node, selection.endOffset)
          var sel = window.getSelection()
          sel.removeAllRanges()
          sel.addRange(range)
          document.execCommand('insertHTML', false, `<a class="link" item-id="${this.id}">${this.name}</a>`)
        }
        $('a.link').css({ '-webkit-user-modify': 'read-only' })
        this.pop.close()
      }
    })
    this.searchBox = new SearchBox({
      $container: $(this.pop.content).find('.link-search-box'),
      input: 'input',
      autoFocus: true,
      suggestContainer: '.link-search-box-suggestions',
      suggestionUrl: this.url,
      historyName: null,
      absolute: true,
      defaultValue: name,
      domainName: '',
      noResultTip: true,
      emitFocusEvent: () => {
        this.id = ''
        this.name = ''
      },
      onSelect: (entry) => {
        this.id = entry.id
        this.name = entry.name
      },
      parseResp (resp) {
        return resp.data.sugNodes || []
      }
    })
  }
  _bind () {
    this.editor.contentContainer.addEventListener('click', this._onClick.bind(this))
  }
  _onClick (event) {
    if (event.target.nodeName == 'A' && event.target.classList.contains('link')) {
      // if (!event.target.getAttribute('href')) return
      const range = document.createRange()
      range.selectNode(event.target)
      var sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
      this.node = event.target
      this.selection = window.getSelection().getRangeAt(0)
      this._pop()
      this._bindIcon()
    } else {
      this._hide()
    }
  }
  _pop () {
    this._hide()
    let url = this.node.getAttribute('item-id')
    if (url.indexOf('/') === 0 && url.indexOf('//') !== 0) {
      url = frameHost ? this.frameHost + url : url
    }
    this.$pop = $(templateEdit({
      href: url
    }))
    let {
      left,
      top
    } = this.node.getBoundingClientRect()

    $('body').append(this.$pop)
    left = left - this.$pop.width() / 2
    top = top + this.$pop.height()
    if (left < 0) {
      left = 0
    }
    this.$pop.css({
      left,
      top
    })
  }
  _hide () {
    if ($('.dls-editor-lite-edit-link').length > 0) {
      $('.dls-editor-lite-edit-link').remove()
      this.$pop = null
      $(window).off('scroll.lite-link-edit')
    }
  }
  _deleteLink () {
    let text = this.node.innerText
    let parentNode = this.node.parentNode
    let afterDelete = parentNode.innerHTML.replace(this.node.outerHTML, text)
    parentNode.innerHTML = afterDelete
    this._hide()
  }
  _editLink (event) {
    event.originalEvent.preventDefault()
    this.id = this.node.getAttribute('item-id')
    this.name = this.node.innerText
    this.initCommand(this.node.innerText, this.selection)
  }
  _bindIcon () {
    $(window).on('scroll.lite-link-edit', e => {
      this._hide()
    })
    this.$pop.find('.icon-delete-x').click(this._deleteLink.bind(this))
    this.$pop.find('.icon-edit').click(this._editLink.bind(this))
  }
}
