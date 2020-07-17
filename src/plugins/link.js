import { PopBox, Alert } from '@portal/dls-ui'
import SearchBox from '@portal/dls-searchbox'
const template = function () {
  return `<div class="link-search-box search-box">
    <input type="text" class="link-text"  placeholder="输入词条名称"/>
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
          selection = this.editor.currentSelection
        }
        const node = selection.commonAncestorContainer
        const range = document.createRange()
        range.setStart(node, selection.startOffset)
        range.setEnd(node, selection.endOffset)
        var sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
        document.execCommand('insertHTML', false, `<a href="${this.host}/detail/${this.id}" class="link" item-id="${this.id}">${this.name}</a>`)
        this._hide()
        this.pop.close()
      }
    })
    this.searchBox = new SearchBox({
      $container: $(this.pop.content).find('.link-search-box'),
      input: 'input',
      autoFocus: true,
      suggestContainer: '.link-search-box-suggestions',
      suggestionUrl: this.host + this.url,
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
        this.name = entry.name.trim()
      },
      parseResp (resp) {
        return resp.data || []
      }
    })
  }
  _bind () {
    this.editor.contentContainer.addEventListener('click', this._onClick.bind(this))
    this.editor.contentContainer.addEventListener('keyup', this._onKeyup.bind(this))
  }

  _onKeyup (e) { // 按左右键进入内链的情况
    if (e.keyCode !== 37 && e.keyCode !== 39) return
    const rangeDom = window.getSelection().getRangeAt(0)
    const domA = rangeDom.startContainer.parentNode
    if (domA.nodeName == 'A' && domA.classList.contains('link')) {
      this._selectA(rangeDom.startContainer.parentNode)
    }
  }

  _selectA (node) {
    const range = document.createRange()
    range.selectNode(node)
    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
    this.node = node
    this.selection = window.getSelection().getRangeAt(0)
    this._pop()
    this._bindIcon()
  }

  _onClick (event) {
    if (event.target.nodeName == 'A' && event.target.classList.contains('link')) {
      this._selectA(event.target)
    } else {
      this._hide()
    }
  }
  _pop () {
    this._hide()
    let url = this.node.getAttribute('item-id')
    if (url.indexOf('/') === -1) {
      url = this.frameHost ? this.frameHost + `/detail/${url}` : `/detail/${url}`
    } else {
      url = this.frameHost ? this.frameHost + url : url
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
