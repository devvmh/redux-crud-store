export default function (message) {
  if (process.env.NODE_ENV === 'development') {
    console.log(message) // eslint-disable-line no-console
  }
}
