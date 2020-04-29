<template>
  <div>
    <div v-for="(item,index) in content" :key="index">
      <p v-if="item.type==='TEXT'">
        <span :index="item.index" :class="item.style?item.style.toLowerCase():''" v-html="contentForText(item)"></span>
      </p><template v-if="item.type==='IMAGE'"><component 
        v-if="useElImage"
        :is="useElImage ? 'el-image' : ''"
        :src="item.url"
        :preview-src-list="getimgList(index)">
      </component><img v-else :src="item.url" /></template><p class="dls-image-capture" v-if="item.type==='IMAGE' && item.text" v-html="contentForText(item)"></p><video v-if="item.type==='VIDEO'" class="video" controls :src="item.url"></video><p class="dls-image-capture" v-if="item.type==='VIDEO' && item.text" v-html="contentForText(item)"></p>
    </div>
  </div>
</template>
<script>
import { dealTopic } from './untils/topic'
export default {
  props: {
    content: {
      type: Array,
      default: []
    },
    useElImage: {
      type: Boolean,
      default: false
    },
    handleText: {
      type: Function,
      default: (text) => text
    }
  },
  methods: {
    getimgList(index){
      const list = this.content.slice(index).concat(this.content.slice(0,index))
      return list.map(item=>{
        return item.type==="IMAGE" && item.url
      }).filter(Boolean)
    },
    contentForText(item){
      return dealTopic(this.handleText(item.text), item.postTags)
    }
  },
}
</script>