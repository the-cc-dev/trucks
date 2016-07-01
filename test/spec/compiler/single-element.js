var expect = require('chai').expect
  , babel = require('babel-core')
  , trucks = require('../../../lib');

describe('compiler:', function() {

  it('should generate AST for single element', function(done) {
    const tpl = '<template id="x-foo"><span></span></template>';
    const res = trucks.compile(tpl);

    expect(res.list).to.be.an('array').to.have.length(1);

    // component id
    expect(res.list[0].id).to.eql('x-foo');

    // function body AST
    expect(res.list[0].body).to.be.an('object');

    const result = babel.transformFromAst(res.list[0].body);
    expect(result.code).to.eql('skate.vdom.element("span");');

    done();
  });

});
