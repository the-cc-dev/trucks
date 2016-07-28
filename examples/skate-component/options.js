module.exports = {
  files: [__dirname + '/components.html'],
  transforms: ['trim', 'csp', 'skate', 'bundle'],
  out: 'build',
  force: true,
  conf: {
    transforms: {
      csp: {
        sha: 'sha256',
        statics: true 
      },
      bundle: {
        js: ['../../node_modules/skatejs/dist/index-with-deps.js']
      }
    }
  }
}
