var expect = require('chai').expect
  , trucks = require('../../../src');

describe('trucks:', function() {

  it('should error on bad eol option', function(done) {
    trucks(
      {
        eol: null,
        files: ['../../test/fixtures/simple-inline/components.html']
      },
      (err) => {
        function fn() {
          throw err;
        }
        expect(fn).throws(/eol option/);
        done();
      }
    );
  });

});
