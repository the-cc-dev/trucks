const fs = require('fs')
    , path = require('path')
    , selectors = require('./selectors')
    , Template = require('./component').Template
    , Style = require('./component').Style
    , Script = require('./component').Script
    , Component = require('./component').Component
    , TEMPLATE = 'template'
    , ID = 'id'
    , HREF = 'href'
    , SRC = 'src';

class TraitReader {
  constructor(module) {
    this.parent = module; 

    // type of trait to instantiate
    this.Type = null;

    // selector for the component module
    this.selector = null;

    this.querySelectorAll = module.querySelectorAll;
  }

  getTrait(el) {
    return new this.Type(el, null, this.parent);
  }

  getInlineContents(el, $) {
    $ = $ || this.querySelectorAll;
    return $(el).text();
  }

  isInline(el, $) {
    $ = $ || this.querySelectorAll;
    return $(el).attr(HREF) === undefined && $(el).attr(SRC) === undefined;
  }

  getExternalHref(el, $) {
    $ = $ || this.querySelectorAll;
    return $(el).attr(HREF) 
  }

  getElements(context, selector, $) {
    $ = $ || this.querySelectorAll;
    return $(selector || this.selector, context).toArray()
  }

  readContents(trait, href, cb) {
    const file = trait.parent.parent.file
        , base = path.dirname(file)
        , pth = path.normalize(path.join(base, href));

    fs.readFile(pth, (err, contents) => {
      if(err) {
        return cb(err); 
      } 
      cb(null,
        contents.toString(),
        {file: file, base: base, path: pth, href: href});
    })
  }

  getContents(state, trait, el, cb) {

    function done(contents, result) {
      trait.contents = contents;
      cb(null, [trait], contents, result);
    }

    if(this.isInline(el)) {
      return done(this.getInlineContents(el)); 
    }else{
      this.readContents(
        trait,
        this.getExternalHref(el),
        (err, contents, result) => {
          if(err) {
            return cb(err); 
          }

          trait.href = result.href;
          trait.file = result.path;
          done(contents, result);
        }
      );
    }
  }
}

class TemplateReader extends TraitReader {
  constructor() {
    super(...arguments);
    this.Type = Template;
    this.selector = selectors.templates;
  }

  getInlineContents(el, $) {
    $ = $ || this.querySelectorAll;
    return $.html(el);
  }

  onTrait(state, trait, cb) {
    trait.querySelectorAll = state.parse(trait.contents);
    trait.parent.templates.push(trait);
    state.result.templates.push(trait);
    cb(null, trait);
  }

  getContents(state, trait, el, cb) {
    super.getContents(state, trait, el, (err, traits, contents, result) => {
      if(err) {
        return cb(err); 
      } 

      // separate all template elements into individual template traits
      let templates = [];

      trait.querySelectorAll = state.parse(trait.contents);

      const elements = trait.querySelectorAll(TEMPLATE)
        , mod = trait.parent
        , $ = this.querySelectorAll;

      elements.each((index, elem) => {
        let tpl = this.getTrait(elem);
        tpl.href = trait.href;
        tpl.file = trait.file;

        const el = $(elem); 
        const prefix = /-$/.test(mod.id) ? mod.id : mod.id + '-'
          , id = el.attr(ID);

        // inherit template from module
        if(!id || id === mod.id) {

          if(mod.component) {
            return cb(new Error(
              `duplicate main template for ${mod.id} in ${mod.file}`)); 
          }

          // set id attribute in case it were undefined
          // thereby inherit from the module id
          el.attr(ID, mod.id);

          // assign as primary component template
          mod.component = new Component(tpl, mod);
        // prefix module id to template with existing
        // identifier and treat as a partial template
        }else{
          el.attr(ID, prefix + id); 
        }

        // assign id to trait
        tpl.id = el.attr(ID);

        // update trait contents and query
        // as we have written the dom with id attributes
        tpl.contents = $.html(elem);

        templates.push(tpl);
      })

      cb(null, templates, contents, result);
    })
  }
}

class StyleReader extends TraitReader {
  constructor() {
    super(...arguments);
    this.Type = Style;
    this.selector = selectors.styles;
  }

  onTrait(state, trait, cb) {
    trait.querySelectorAll = state.parse(trait.contents);

    // global scope styles
    trait.parent.styles.push(trait);

    // all styles
    trait.parent.stylesheets.push(trait);

    // flat collection of all styles
    state.result.styles.push(trait);
    cb(null, this);
  }

}

class ScriptReader extends TraitReader {
  constructor() {
    super(...arguments);
    this.Type = Script;
    this.selector = selectors.scripts;
  }

  getExternalHref(el, $) {
    $ = $ || this.querySelectorAll;
    return $(el).attr(SRC);
  }

  onTrait(state, trait, cb) {
    trait.querySelectorAll = state.parse(trait.contents);
    trait.parent.scripts.push(trait);
    state.result.scripts.push(trait);
    cb(null, trait);
  }
}

module.exports = {
  Template: TemplateReader,
  Style: StyleReader,
  Script: ScriptReader
}
