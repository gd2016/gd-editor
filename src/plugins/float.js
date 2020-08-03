import {
  toCamelCase
} from '../untils/fn.js'

const template = function (tools) {
  let strTemplate = ''
  tools.forEach(tool => {
    strTemplate += `<div class="m_float_icon_wrapper">
      <span onmousedown="event.preventDefault();" data-type="${tool}" class="m_float_icon icon dls-${tool}-icon">&nbsp;</span>
    </div>`
  })
  return `<div class="dls-m-floating-tools">${strTemplate}</div>`
}

export default class FloatTools {
  constructor (props) {
    Object.assign(this, {
      editor: {},
      tools: [],
      floatFilter: null
    }, props)
    this._bind()
  }

  _bind () {
    this.editor.contentContainer.addEventListener('mouseup', this._onMouseup.bind(this))
    this.editor.contentContainer.addEventListener('keyup', this._onMouseup.bind(this))
    $(document).on('click.float', (e) => {
      if ($(e.target).parents('.dls-m-floating-tools').length < 1) {
        this.$pop && this.$pop.hide()
      }
    })
    $(window).on('scroll.m_float', e => {
      this.$pop && this.$pop.hide()
    })
  }

  _onMouseup (e) {
    setTimeout(() => {
      let selection = window.getSelection().getRangeAt(0)
      if (!selection.toString() || $('.dls-editor-lite-edit-link').length > 0) {
        return this.$pop && this.$pop.hide()
      }
      this._show(selection)
    })
  }

  _show (selection) {
    if (this.$pop) {
      this.$pop.show()
    } else {
      this.$pop = $(template(this.tools))
      $('body').append(this.$pop)
      this._bindIcon()
    }

    let {
      height
    } = this.$pop[0].getBoundingClientRect()

    this.$pop.css({
      left: selection.getBoundingClientRect().x + selection.getBoundingClientRect().width / 2 - 15,
      top: selection.getBoundingClientRect().y - height - 10
    })
  }

  _bindIcon () {
    this.$pop.find('.m_float_icon_wrapper').on('click', (e) => {
      e.preventDefault()
      this.$pop.hide()
      const name = $(e.target).data('type') || $(e.target).find('.icon').data('type')
      const pluginName = toCamelCase(name)
      this.editor[pluginName].initCommand()
    })
  }
}
