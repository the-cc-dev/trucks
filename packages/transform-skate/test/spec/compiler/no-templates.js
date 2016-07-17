var expect = require('chai').expect
  , babel = require('babel-core')
  , compiler = require('../../../src/compiler');

describe('compiler:', function() {

  it('should generate AST without template elements', function(done) {

    const tpl = '<span></span>';
    const res = compiler.html(tpl);

    // no render functions
    expect(res.list).to.be.an('array').to.have.length(0);

    // empty map
    const result = babel.transformFromAst(res.map);
    expect(result.code).to.eql('const templates = {};');

    // main function will always be the same, no need to assert

    done();
  });

});