const options = {
  // array list of component source files
  files: null,
  // options to pass to babel
  babel: {},
  // output directory
  out: undefined,
  // name of output files (does not include a file extension)
  name: 'components',
  // set or override the file path for the HTML output
  html: undefined,
  // set or override the file path for the CSS output
  css: undefined,
  // set or override the file path for the Javascript output
  js: undefined,
  // force overwrite files if they already exist
  force: false,
  // override the default operating system EOL for file concatenation
  eol: undefined,
  // options to pass to the compiler
  compiler: {}
}

module.exports = options;
