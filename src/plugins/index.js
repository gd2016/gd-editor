import imagePlugin from './image'
import videoPlugin from './video'
import stylePlugin from './style'
import topicPlugin from './topic'
import ulPlugin from './list'
import linkPlugin from './link'

const plugins = {
  image: {
    constructor: imagePlugin,
    name: 'image',
    params: {
      url: '/api/image/upload/v1',
      formName: 'userfile'
    }
  },
  video: {
    constructor: videoPlugin,
    name: 'video',
    params: {
      url: '/api/video/upload/v1',
      formName: 'userfile'
    }
  },
  h1: {
    constructor: stylePlugin,
    name: 'h1',
    params: {
      type: 'h1',
      label: '1级标题'
    }
  },
  h2: {
    constructor: stylePlugin,
    name: 'h2',
    params: {
      type: 'h2',
      label: '2级标题'
    }
  },
  ol: {
    constructor: ulPlugin,
    name: 'ol',
    params: {
      label: '有序列表'
    }

  },
  ul: {
    constructor: ulPlugin,
    name: 'ul',
    params: {
      label: '无序列表'
    }
  },
  refer: {
    constructor: stylePlugin,
    name: 'refer',
    params: {
      type: 'refer',
      label: '插入引用'
    }
  },
  topic: {
    constructor: topicPlugin,
    name: 'topic',
    params: {
      url: '/api/toppost/tag/search',
      label: '插入话题'
    }
  },
  link: {
    constructor: linkPlugin,
    name: 'link',
    params: {
      url: '/api/search/getSuggestionV3',
      label: '插入链接'
    }
  }
}

export default plugins
