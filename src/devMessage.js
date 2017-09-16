export default function (message) {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    console.log(message) // eslint-disable-line no-console
  }
}
