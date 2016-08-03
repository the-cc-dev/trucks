var expect = require('chai').expect
  , trucks = require('trucks-compiler');

describe('generate:', function() {

  it('should use default generate options', function(done) {
    const src = '../../test/fixtures/simple-inline/components.html';
    trucks(
      {
        files: [src],
        out: 'target',
        name: 'generate',
        plugins: [trucks.SOURCES, trucks.TRANSFORM, require('../../src')]
      }, (err, state) => {
        expect(err).to.eql(null);
        expect(state).to.be.an('object');
        done();
      }
    );
  });

});
