#!/usr/bin/env node

var copy = require('recursive-copy')

copy('src', 'lib', {
  overwrite: true,
  filter: '*.js',
  rename: function(path) { return path + '.flow' }
})
.then(function(results) {
  results.forEach(function(result) {
    console.error(result.src + ' -> ' + result.dest)
  })
  process.exit(0)
})
.catch(function(err) {
  console.error(err)
  process.exit(1)
})
