var expect = require('chai').expect
  , babel = require('babel-core')
  , trucks = require('../../../lib');

describe('compiler:', function() {

  it('should generate AST w/ normalize enabled', function(done) {
    const tpl = '<template id="x-foo">'
      + '  <span></span>'
      + '  <em></em>'
      + '</template>';

    const res = trucks.compile(tpl, {normalize: true});

    expect(res).to.be.an('array').to.have.length(1);

    // component id
    expect(res[0].id).to.eql('x-foo');

    // function body AST
    expect(res[0].body).to.be.an('object');

    const result = babel.transformFromAst(res[0].body);
    expect(result.code).to.eql(
      'skate.vdom.element("span");\n' + 
      'skate.vdom.element("em");' 
    );

    done();
  });

  it('should generate AST w/ normalize disabled', function(done) {
    const tpl = '<template id="x-foo">'
      + '  <span></span>'
      + '  <em></em>'
      + '</template>';

    const res = trucks.compile(tpl, {normalize: false});

    expect(res).to.be.an('array').to.have.length(1);

    // component id
    expect(res[0].id).to.eql('x-foo');

    // function body AST
    expect(res[0].body).to.be.an('object');

    const result = babel.transformFromAst(res[0].body);
    expect(result.code).to.eql(
      'skate.vdom.text("  ");\n' + 
      'skate.vdom.element("span");\n' + 
      'skate.vdom.text("  ");\n' + 
      'skate.vdom.element("em");' 
    );

    done();
  });

});