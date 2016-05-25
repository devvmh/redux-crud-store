// This class is a reference implementation. If you desire additional
// functionality, you can work with the config options here, or copy this code
// into your project and customize the ApiClient to your needs.

class ApiClient {
  constructor(passedConfig) {
    const defaultConfig = {
      methods: ['get', 'post', 'put', 'patch', 'delete'],
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }

    const config = {
      ...defaultConfig,
      ...passedConfig
    }

    if (!config.basePath) {
      // e.g. 'https://example.com/api/v3'
      throw new Error('You must pass a base path to the ApiClient')
    }

    config.methods.forEach(method => {
      this[method] = (path, { params, data } = {}) => {
        const queryString = this.queryString(params)
        const headers = this.getHeaders(config.headers, data)
        const { basePath, credentials } = config

        return new Promise((resolve, reject) => {
          fetch(basePath + path + this.queryString(), {
            method,
            credentials,
            headers
          }).then(response => {
            return response.json()
          }).then(payload => {
            resolve(payload)
          }).catch(error => {
            reject(error)
          })
        })
      }
    })
  }

  queryString(params) {
    if (!params) return ''
    if (Object.keys(params).length === 0) return ''
    const queryParams = Object.keys(params).map(key => {
      const value = params[key]
      return `${key}=${value}`
    })
    return '?' + queryParams.join('&')
  }

  getHeaders(defaultHeaders, data) {
    if (!data) return defaultHeaders
    if (Object.keys(data).length === 0) return defaultHeaders
    return { ...defaultHeaders, data }
  }
}

export default ApiClient
