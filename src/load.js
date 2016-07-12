const fs = require('fs')
    , path = require('path')
    , File = require('./component').File;

function abs(file, base) {
  if(!path.isAbsolute(file)) {
    base = base || process.cwd();
    return path.normalize(path.join(base, file)); 
  }
  return file;
}

/**
 *  Encapsulates the load state information.
 *
 *  @private {constructor} LoadState
 *  @param {Object} input compiler state input object.
 *  @param {Array} output list for the output result objects.
 *  @param {Object} opts processing options.
 */
function LoadState(input, output) {
  
  this.input = input;
  this.output = output;

  // TODO: prefer `output` property
  this.out = output;

  this.parser = input.parser;
  this.opts = input.options;
  // source input files passed to be loaded
  this.files = input.files;

  // list of parent file hierarchies used to detect circular imports
  this.hierarchy = [];

  // list of component files that have been processed used to prevent
  // duplication compilation when multiple components share the same
  // dependency
  this.seen  = {
    sources: [],
    imports: []
  }
}

/**
 *  Helper to test for cyclic depenendeices.
 *
 *  @private {function} cyclic
 *  @param {String} file path to the file to load.
 *  @param {Array} list of paths in the hierarchy.
 *  @param {String} name the name of the declaring file.
 *
 *  @throws Error if a circular dependency is detected.
 */
function cyclic(file, hierarchy, name) {

  let i
    , source = abs(file)
    , dest;

  for(i = 0;i < hierarchy.length;i++) {
    dest = abs(hierarchy[i]);
    if(source === dest) {
      throw new Error(
        `cyclic dependency detected in ${name} (${source} <> ${dest})`);
    }
  }
}

/**
 *  Read file contents.
 *
 *  @private {function} read
 */
function read(group, parent, state, cb) {
  const opts = state.opts;
  const file = group.file;

  // cyclic dependency: must be tested before the logic to ignore 
  // duplicate components as we want to notify users on circular dependency
  try {
    cyclic(file, state.hierarchy, parent ? parent.file : null);
  }catch(e) {
    return cb(e); 
  }

  // duplicate component: do no not re-read components that have already 
  // been loaded
  let pth = abs(file);
  if(~state.seen.imports.indexOf(pth)) {
    return cb();
  }
  state.seen.imports.push(pth);

  fs.readFile(pth, (err, contents) => {
    if(err) {
      return cb(err); 
    }

    group.parent = parent;
    group.contents = contents.toString();

    // empty component file
    if(!group.contents) {
      return cb(new Error(`empty group file ${file}`));
    }

    // prepend the loaded group information so that
    // dependencies appear before the declaring group
    state.out.unshift(group);

    if(parent) {
      parent.imports.unshift(group); 
    }

    const $ = state.parser.parse(group.contents)
      , dependencies = $(opts.selectors.imports);

    // component has dependencies we need to load
    if(dependencies.length) {

      // track hierarchy
      state.hierarchy.push(group.file);

      // map of dependencies
      let deps = [];

      dependencies.each((index, elem) => {
        const href = $(elem).attr('href'); 
        deps.push(href);
      })

      // resolve relative to the parent file: `group`
      sources(deps, state.input, state.output, state, group, cb);

    // no dependencies move on to the next item in the list
    }else{
      cb();
    }
  })
}

/** 
 *  Loads and parses the input source files.
 *
 *  Produces a map of file names to file contents.
 *
 *  @private {function} sources
 *
 *  @param {Object} state processing state.
 *  @param {Function} cb callback function.
 */
function sources(files, input, output, state, parent, cb) {
  if(parent instanceof Function) {
    cb = parent;
    parent = null;
  }

  let out = [];

  function next(err) {
    if(err) {
      return cb(err); 
    }
    const file = files.shift();
    if(!file) {
      return cb(null, out); 
    }

    if(!parent) {
      state = new LoadState(input, output);     
      // pass reference to component tree into load state
      state.tree = input.tree;
    }

    let base
      , pth;

    if(parent && parent.file) {
      base = path.dirname(parent.file); 
    }

    pth = abs(file, base);

    if(~state.seen.sources.indexOf(pth)) {
      // this could just ignore and move on to the next
      // file to process but prefer to be strict and error
      return cb(new Error(`duplicate component source file ${file}`));
    }

    state.seen.sources.push(pth);

    const group = new File(pth);
    group.href = file;
    if(!parent) {
      state.tree.imports.push(group);
    }

    read(group, parent, state, next);
  }

  next();
}

/**
 *  @private
 */
function load(input, cb) {
  if(!input.files || !input.files.length) {
    return cb(new Error('no input files specified'));
  }

  // array list of components
  const output = input.result.load.files;

  // run processing for the input sources
  sources(input.files, input, output, null, (err) => {
    if(err) {
      return cb(err); 
    } 
    cb(null, input);
  });
}

module.exports = load;
