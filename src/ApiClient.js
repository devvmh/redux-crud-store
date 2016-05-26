// This class is a reference implementation. If you desire additional
// functionality, you can work with the config options here, or copy this code
// into your project and customize the ApiClient to your needs.

class ApiClient {
  constructor(passedConfig) {
    const defaultConfig = {
      methods: ['get', 'post', 'put', 'patch', 'delete'],
      credentials: 'same-origin',
      defaultHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      format: 'json' // json, blob, text, arrayBuffer, ...
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
      this[method] = (path, { params, data, otherConfig } = {}) => {
        const queryString = this.queryString(params)
        const { basePath, defaultHeaders, format, ...fetchConfig } = config
        const headers = {
          this.getHeaders(defaultHeaders, data),
          ...fetchConfig.headers
        }

        return new Promise((resolve, reject) => {
          fetch(basePath + path + this.queryString(), {
            ...fetchConfig,
            ...otherConfig,
            method,
            headers
          }).then(response => {
            return response[format]()
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
