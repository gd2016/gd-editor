export const dealTopic = (text, postTags) => {
  if (!postTags || !postTags.length) return text
  let arr = []
  let start = 0
  let processedArr = []
  let finalStr = ''
  postTags.map(item => {
    arr.push(text.substring(start, item.paramOffset))
    arr.push({ text: text.substring(item.paramOffset, item.paramOffset + item.wordLength), id: item.topicId })
    start = item.paramOffset + item.wordLength
  })
  arr.push(text.substring(start, text.length))
  arr.map((node, index) => {
    if (index % 2 !== 0) {
      node = `<a class="topic" topic-id="${node.id}">${node.text}</a>`
    }
    processedArr.push(node)
  })
  finalStr = processedArr.join('')
  return finalStr
}
