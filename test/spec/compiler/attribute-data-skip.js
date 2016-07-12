var expect = require('chai').expect
  , babel = require('babel-core')
  , trucks = require('../../../lib');

describe('compiler:', function() {

  it('should generate AST for element with empty data-skip attribute',
    function(done) {
      const tpl = '<template id="x-foo">'
        + '<span data-skip></span></template>';

      const res = trucks.compile(tpl);

      expect(res.list).to.be.an('array').to.have.length(1);

      // component id
      expect(res.list[0].id).to.eql('x-foo');

      // function body AST
      expect(res.list[0].body).to.be.an('object');

      const result = babel.transformFromAst(res.list[0].body);
      expect(result.code).to.eql('skate.vdom.element("span", {\n'
        + '  "skip": true\n'
        + '});');

      done();
    }
  );

  it('should generate AST for element with data-skip attribute w/ value',
    function(done) {
      const tpl = '<template id="x-foo">'
        + '<span data-skip="skip"></span></template>';

      const res = trucks.compile(tpl);

      expect(res.list).to.be.an('array').to.have.length(1);

      // component id
      expect(res.list[0].id).to.eql('x-foo');

      // function body AST
      expect(res.list[0].body).to.be.an('object');

      const result = babel.transformFromAst(res.list[0].body);
      expect(result.code).to.eql('skate.vdom.element("span", {\n'
        + '  "skip": true\n'
        + '});');

      done();
    }
  );

});