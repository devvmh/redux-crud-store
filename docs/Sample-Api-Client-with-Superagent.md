The ApiClient class is fully customizable. You can write your own and drop it in as a replacement. You just need to ensure you provide get, post, put, and delete requests at a minimum (plus any other methods your code uses). Here is an alternative implementation using the [superagent](https://github.com/visionmedia/superagent) library.

    import superagent from 'superagent'

    # note since you are writing this code, you can specify the base_path here
    const base_path = 'https://example.com/api/v3'

    const methods = ['get', 'post', 'put', 'patch', 'delete']

    class ApiClient {
      constructor(req) {
        methods.forEach((method) =>
          this[method] = (path, { params, data } = {}) => new Promise((resolve, reject) => {
            // superagent uses 'del' instead of 'delete'
            const saMethod = method === 'delete' ? 'del' : method

            const request = superagent[saMethod](base_path + path)

            if (params) {
              request.query(params)
            }

            if (data) {
              request.send(data)
            }

            request.withCredentials().end((err, { body } = {}) => err ? reject(body || err) : resolve(body))
          }))
      }
    }

See [src/sagas.js](https://github.com/devvmh/redux-crud-store/blob/master/src/sagas.js) for how this client is called.
