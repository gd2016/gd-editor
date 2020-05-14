export const dealTopic = (text, postTags, option) => {
  if (!postTags || !postTags.length) return text
  let arr = []
  let start = 0
  let processedArr = []
  let finalStr = ''
  postTags.map(item => {
    arr.push(text.substring(start, item.paramOffset))
    arr.push({ ...item, text: text.substring(item.paramOffset, item.paramOffset + item.wordLength) })
    start = item.paramOffset + item.wordLength
  })
  arr.push(text.substring(start, text.length))
  arr.map((node, index) => {
    if (index % 2 !== 0) {
      if (option) {
        node = option(node)
      } else {
        node = `<a class="topic" topic-id="${node.topicId}">${node.text}</a>`
      }
    }
    processedArr.push(node)
  })
  finalStr = processedArr.join('')
  return finalStr
}
