const path = require('path')
    , fs = require('fs');

/**
 *  Copy input files to the output directory.
 *
 *  If an input file is a folder all files within the folder are copied 
 *  recursively.
 *
 *  Files are defined using an input mapping:
 *
 *  ```javascript
 *  {
 *    copy: {
 *      files: {
 *        'src/index.html': 'index.html',
 *        'src/assets'    : 'assets'
 *      }
 *    }
 *  }
 *  ```
 *
 *  Input files are the keys and are resolved relative to the `base` option. 
 *  The values are output paths relative to the compiler output directory.
 *
 *  @public {function} copy
 *  @param {Object} state compiler state.
 *  @param {Object} conf transform plugin configuration.
 *  @option {Object} [files] map of files to copy.
 *  @option {String} [base] base path for relative input files.
 *
 *  @returns map of visitor functions.
 */
function copy(state, conf) {
  const options = state.options
      , opts = options.copy || conf
      , files = opts.files || {}
      , keys = Object.keys(files);

  function readFile(input, output, cb) {

    fs.stat(input, (err, stat) => {
      if(err) {
        return cb(err); 
      }

      if(stat.isFile()) {
        // create output file
        const file = state.getFile(output, options.out);

        fs.readFile(input, (err, contents) => {
          /* istanbul ignore next: tough to mock as stat already called */
          if(err) {
            return cb(err); 
          } 
          file.contents = [contents.toString()];
          cb();
        })
      }else{
        readDir(input, output, cb);
      }
    });
  }

  function readDir(input, output, cb) {
    fs.readdir(input, (err, files) => {
      /* istanbul ignore next: tough to mock as stat already called */
      if(err) {
        return cb(err); 
      } 

      state.each(
        files,
        (file, next) => {
          let source = path.join(input, file)
            , dest = path.join(output, file);
          readFile(source, dest, next);
        },
        cb
      )
    })
  }

  function end(node, cb) {
    state.each(
      keys,
      (key, next) => {
        let output = files[key];
        let input = state.absolute(key, opts.base || options.base);

        // noop: source and destination are the same
        if(input === state.absolute(output, state.absolute(options.out))) {
          return next(); 
        }

        if(path.isAbsolute(output)) {
          output = path.basename(output); 
        }

        readFile(input, output, next)
      },
      cb
    );
  }

  return {end: end};
}

module.exports = copy;
