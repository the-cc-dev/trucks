# Transform

> Transforms the component tree

Runs plugin functions that visit the component tree nodes and perform transformations.

When transform plugins are defined as strings and do not resolve to an absolute path they are deemed to be modules to require and are prefixed with `trucks-transform-` such that `csp` will require the `trucks-transform-csp` package.

## Install

```
npm i trucks-plugin-transform --save-dev
```

---

- [Install](#install)
- [Usage](#usage)
- [Transforms](#transforms)
  - [Lifecycle](#lifecycle)
  - [Visitors](#visitors)
  - [Configuration](#configuration)
- [API](#api)
  - [transform](#transform)
- [License](#license)

---

## Usage

This plugin is bundled with the core [trucks-compiler][] library.

If a `transforms` array is declared on the options it is used:

```javascript
const options = {
  transforms: ['csp']
}
```

Configure this plugin using the `transform` field:

```javascript
const options {
  conf: {
    plugins: {
      transform: {
        /* plugin configuration */
      }
    }
  }
}
```

Or as a convenient shortcut use the top-level `transform` field:

```javascript
const options {
  transform: {
    /* plugin configuration */
  }
}
```

## Transforms

Transforms are plugins executed by the [transform][] plugin when the entire component tree is available.

A transform plugin returns a map of visitor functions and/or lifecycle callbacks:

```javascript
function plugin(state, conf) {
  return {
    '*': (node, cb) => {
      cb(); 
    }
  }
}
```

### Lifecycle

Lifecycle callbacks are functions that hook into events when iterating the component tree:

* `begin` Called before the tree is walked.
* `enter` Called when entering a node before visitor functions are invoked.
* `leave` Called when leaving a node after visitor functions have been invoked.
* `end` Called when the tree walk is complete.

The `begin` and `end` functions are passed the component tree so the signature is always:

```javascript
function(node, cb);
```

For example you may want to collect all nodes of a type and operate once the walk is completed:

```javascript
function plugin(state, conf) {
  const styles = [];
  return {
    end: (node, cb) => {
      // operate on the list of styles 
      cb();
    },
    Style: (node, cb) => {
      styles.push(node);
      cb(); 
    }
  }
}
```

### Visitors

Each key in the returned map is evaluated to determine whether the visitor function wants to see a particular node, the wildcard `*` matches all nodes. Available node types are:

* `Tree` Visit tree nodes.
* `File` Visit file nodes.
* `Module` Visit module nodes.
* `Component` Visit component nodes.
* `Template` Visit template nodes.
* `Style` Visit style nodes.
* `Script` Visit script nodes.

### Configuration

To configure a transform plugin you can set a configuration object:

```javascript
const options = {
  files: ['components.html'],
  transforms: ['skate'],
  conf: {
    transforms: {
      skate: {/* plugin configuration goes here */}
    }
  }
};
```

## API

### transform

```javascript
public transform(state, conf)
```

Runs transform plugins on the component tree.

Returns plugin closure.

* `state` Object compiler state.
* `conf` Object plugin configuration.

#### Options

* `transforms` Array list of transform plugins.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on August 5, 2016

[skatejs]: https://github.com/skatejs/skatejs
[webcomponents]: https://github.com/w3c/webcomponents
[shadow-dom]: https://w3c.github.io/webcomponents/spec/shadow/
[custom-elements]: https://www.w3.org/TR/custom-elements/
[html-imports]: https://w3c.github.io/webcomponents/spec/imports/
[html-templates]: https://html.spec.whatwg.org/multipage/scripting.html#the-template-element
[polymer]: https://www.polymer-project.org/1.0/
[react]: https://facebook.github.io/react/
[react-webcomponents]: https://github.com/facebook/react/issues/5052
[react-integration]: https://github.com/skatejs/react-integration
[mozilla-webcomponents]: https://hacks.mozilla.org/2014/12/mozilla-and-web-components/
[csp]: http://content-security-policy.com/
[npm]: https://www.npmjs.com/
[postcss]: https://github.com/postcss/postcss
[mkdoc]: https://github.com/mkdoc/mkdoc
[mkapi]: https://github.com/mkdoc/mkapi
[mkparse]: https://github.com/mkdoc/mkparse
[jshint]: http://jshint.com
[jscs]: http://jscs.info
[manual]: https://github.com/tmpfs/trucks/blob/master/manual
[examples]: https://github.com/tmpfs/trucks/blob/master/examples
[trucks]: https://github.com/tmpfs/trucks
[trucks-cli]: https://github.com/tmpfs/trucks/blob/master/packages/trucks-cli
[trucks-compiler]: https://github.com/tmpfs/trucks/blob/master/packages/trucks-compiler
[sources]: https://github.com/tmpfs/trucks/blob/master/packages/plugin-sources
[load]: https://github.com/tmpfs/trucks/blob/master/packages/plugin-load
[parse]: https://github.com/tmpfs/trucks/blob/master/packages/plugin-parse
[transform]: https://github.com/tmpfs/trucks/blob/master/packages/plugin-transform
[generate]: https://github.com/tmpfs/trucks/blob/master/packages/plugin-generate
[write]: https://github.com/tmpfs/trucks/blob/master/packages/plugin-write
[transform-csp]: https://github.com/tmpfs/trucks/blob/master/packages/transform-csp
[bundle]: https://github.com/tmpfs/trucks/blob/master/packages/transform-bundle
[copy]: https://github.com/tmpfs/trucks/blob/master/packages/transform-copy
[skate]: https://github.com/tmpfs/trucks/blob/master/packages/transform-skate
[stylus]: https://github.com/tmpfs/trucks/blob/master/packages/transform-stylus
[less]: https://github.com/tmpfs/trucks/blob/master/packages/transform-less
[sass]: https://github.com/tmpfs/trucks/blob/master/packages/transform-sass
[trim]: https://github.com/tmpfs/trucks/blob/master/packages/transform-trim
[tree]: https://github.com/tmpfs/trucks/blob/master/packages/transform-tree
[usage]: https://github.com/tmpfs/trucks/blob/master/packages/transform-usage
[style-extract]: https://github.com/tmpfs/trucks/blob/master/packages/transform-style-extract
[style-inject]: https://github.com/tmpfs/trucks/blob/master/packages/transform-style-inject
[resolver-core]: https://github.com/tmpfs/trucks/blob/master/packages/resolver-core
[resolver-file]: https://github.com/tmpfs/trucks/blob/master/packages/resolver-file
[resolver-http]: https://github.com/tmpfs/trucks/blob/master/packages/resolver-http
[resolver-npm]: https://github.com/tmpfs/trucks/blob/master/packages/resolver-npm
[generator-page]: https://github.com/tmpfs/trucks/blob/master/packages/generator-page
[less-css]: http://lesscss.org/
[sass-css]: http://sass-lang.com/
[stylus-css]: http://stylus-lang.com/
[node-sass]: https://github.com/sass/node-sass
[archy]: https://github.com/substack/node-archy

