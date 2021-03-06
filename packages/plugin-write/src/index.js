/**
 *  Write output files to disc.
 *
 *  For each file in the `output` of the compiler state write the file to disc 
 *  creating parent directories as needed unless the `mkdirs` option is 
 *  disabled.
 *
 *  When `exclude` is given it should be a regular expression or array or 
 *  patterns to compare against the absolute file path for each file to be 
 *  written, if a pattern matches the file is not written to disc.
 *
 *  If the `manifest` option is enabled a `manifest` object is created on the 
 *  compiler state which maps file paths to checksums for each file written. 
 *  Each manifest entry contains `size` and `checksum` fields.
 *
 *  The `force` option is inherited from the computed options when not defined 
 *  on the plugin configuration.
 *
 *  @public {function} write
 *  @param {Object} state compiler state.
 *  @param {Object} conf plugin configuration.
 *  @option {Boolean=false} [force] force overwrite existing files.
 *  @option {Array} [exclude] list of regexp patterns to exclude.
 *  @option {Boolean=true} [mkdirs] create parent directories.
 *  @option {Boolean=true} [manifest] generate manifest checksums.
 *  @option {String=sha256} [hash] checksum hash algorithm.
 *
 *  @returns plugin closure.
 */
function write(state, conf) {
  const fs = require('fs')
      , path = require('path')
      , crypto = require('crypto');

  conf = state.options.write || conf;

  conf.exclude = (conf.exclude instanceof RegExp)
    ? [conf.exclude]
    : Array.isArray(conf.exclude) ? conf.exclude : [];

  conf.mkdirs = conf.mkdirs !== undefined ? conf.mkdirs : true;

  let force = conf.force;

  if(force === undefined && state.options.force !== undefined) {
    force = state.options.force; 
  }

  let manifest = conf.manifest !== undefined ? conf.manifest : true;
  let algorithm = conf.hash || 'sha256';
  let digest = 'hex';
  
  if(manifest) {
    manifest = state.manifest = {};
  }

  let mkdir;

  // NOTE: noop when `mkdirs` is disabled
  if(!conf.mkdirs) {
    mkdir = (path, cb) => cb();
  }else{
    mkdir = require('mkdirp')
  }

  function excluded(file) {
    let i
      , ptn;
    for(i = 0;i < conf.exclude.length;i++) {
      ptn = conf.exclude[i];
      if((ptn instanceof RegExp) && ptn.test(file)) {
        return true; 
      }
    }
    return false;
  }

  return function write(state, cb) {
    function writer(file, output) {
      const contents = output.getFileContents();

      return function write(cb) {
        if(excluded(file)) {
          return cb(); 
        }
        fs.stat(file, (err, stat) => {
          // NOTE: if file is a directory we'll let if fall through to 
          // NOTE: an EISDIR error on attempt to write
          if(stat && stat.isFile() && !force) {
            return cb(new Error(`cannot overwrite ${file}`)); 
          }

          const owner = path.dirname(file);
          mkdir(owner, (err) => {
            /* istanbul ignore next: tough to mock this error */
            if(err) {
              return cb(err); 
            } 
            fs.writeFile(file, contents, (err) => {
              if(err) {
                return cb(err); 
              } 

              if(manifest) {
                const hash = crypto.createHash(algorithm);
                hash.update(contents);

                let item = {
                  size: Buffer.byteLength(contents),
                  checksum: hash.digest(digest)
                }

                manifest[file] = item;
              }

              cb();
            });

          });
        });
      } 
    }

    const output = state.output;
    const files = Object.keys(output)
        , writers = [];

    // map output files to writer functions
    files.forEach((file) => {
      writers.push(writer(file, output[file])); 
    })

    state.each(
      writers,
      (fn, next) => {
        fn(next); 
      }, cb);
  }

}

module.exports = write;
