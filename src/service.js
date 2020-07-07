/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-09 10:01:40
 * @LastEditTime: 2019-08-15 10:22:38
 * @LastEditors: Please set LastEditors
 */
import Superfetch from '@ah/super-fetch'
function sendRequest (type, url, params = '', config) {
  // 默认配置
  config = Object.assign({
    encrypt: false,
    fingerprint: false,
    withCredentials: true,
    onProgress () {}
  }, config)
  const __superfetch__ = new Superfetch(config)

  // check if exist, be sure not duplication request
  return __superfetch__.ajax({
    url,
    type: type,
    data: params || null,
    headers: config.headers
  }).then(res => { return res })
}
export default {
  // 获取词条基本信息
  /** **********多媒体***************/
  // 图片上传接口
  saveImage (url, params, config) {
    config = Object.assign({
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }, config)
    return sendRequest('post', url, params, config)
  },
  saveVideo (url, params, config) {
    return sendRequest('post', url, params, config)
  },
  getTopic (url, params) {
    return sendRequest('get', url, params)
  }
}
