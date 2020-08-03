/**
 * @function 把内容加上a标签等富文本(处理话题和内链)
 * @param  {String} text     源数据的属性，字符串纯文本
 * @param  {Array} postTags 当前一行数据中包含的a标签偏移量的数组
 * @param  {Object} option  其他处理，目前只有针对a标签的替换规则
 * @return {String} 替换后带a链接的富文本
 */
export const dealTopic = (text, postTags, option) => {
  if (!postTags || !postTags.length) return text
  let arr = []
  let start = 0
  let processedArr = []
  let finalStr = ''
  postTags = postTags.sort((a, b) => a.paramOffset - b.paramOffset)
  postTags.map(item => {
    arr.push(text.substring(start, item.paramOffset))
    arr.push({ ...item, text: text.substring(item.paramOffset, item.paramOffset + item.wordLength) })
    start = item.paramOffset + item.wordLength
  })
  arr.push(text.substring(start, text.length))
  arr.map((node, index) => {
    if (index % 2 !== 0) {
      if (option) {
        if (node.topicId) {
          node = option.topicFn(node)
        } else {
          node = option.replaceFn(node)
        }
      } else {
        node = `<a href="#" class="topic" topic-id="${node.topicId}">${node.text}</a>`
      }
    }
    processedArr.push(node)
  })
  finalStr = processedArr.join('')
  return finalStr
}
