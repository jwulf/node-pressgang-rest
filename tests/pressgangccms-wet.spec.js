// Jasmine unit tests

//    "jasmine-node": "~1.0.26"

// These are the wet tests - they rely on a specifically configured PressGang instance
// See https://bugzilla.redhat.com/show_bug.cgi?id=869500

// to execute test:
// sudo npm install -g jasmine-node
// then run
// PG_TEST_URL=<server url> jasmine-node pressgangccms-wet.spec.js --verbose

var PG = require('./../pressgangccms.js');

const   TEST_URL = process.env.PG_TEST_URL;
        TEST_TOPIC_ID = 33;
        TEST_TOPIC_REV = 140306;
        TEST_SPEC_ID = 8844;
        TEST_SPEC_REV = 10;
        
    if (!TEST_URL) {
        console.log('No server specified. Please set PG_TEST_URL and re-run');
        return;
    }
    
describe( 'isContentSpec', function () {
    var testPG, flag;
    
    beforeEach( function() {
        testPG = new PG.PressGangCCMS(TEST_URL);
    });
    
    it('should return true for an existing Content Spec', 
        function (done) { 
            testPG.isContentSpec(TEST_SPEC_ID, function (err, result) { 
                expect(result).toBe(true); 
                done (); 
            })
        }
    );
    
    it('should return false for an non-existing Content Spec',
        function (done) {
            testPG.isContentSpec( 0, function (err, result) {
                expect(result).toBe(false);
                done ();
            });
        }
    );
    
    it('should return an error for a bogus URL',
        function (done) {
                testPG.url = 'httX://+_a-non-existent-domain.com:777';
                testPG.isContentSpec( 0, function (err, result) {
                    expect( err ).not.toBe(null);
                    done ();
                });
        }
    );
                
});


describe( 'getTopicData', function () {
    
    beforeEach( function() {
        testPG = new PG.PressGangCCMS(TEST_URL);
        nullPG = new PG.PressGangCCMS('/dev/null');
    });
    
    it('should return an error with no URL', function (done) {
        delete nullPG.url;
        nullPG.getTopicData('json', TEST_TOPIC_ID, function (err, result) {
            expect( err ).not.toBe(null);    
            done();
        });
        
    });
    
    it('should return an object for a JSON request', function (done) {
        testPG.getTopicData('json', TEST_TOPIC_ID, function ( err, result ) {
            expect( result ).toEqual( jasmine.any( Object ) );
            done();
            });
    });

    it('should return an object with an XML property for a JSON request', function (done) {
        testPG.getTopicData('json', TEST_TOPIC_ID, function ( err, result ) {
            expect( result.xml ).toBeDefined;
            done();
            });
    });

    it('should return an object with an XML property of Type String for a JSON request', function (done) {
        testPG.getTopicData('json', TEST_TOPIC_ID, function ( err, result ) {
            expect( result.xml ).toEqual( jasmine.any( String ) );
            done();
            });
    });

    it('should return a string for an XML request', function (done) {
        testPG.getTopicData('xml', TEST_TOPIC_ID, function ( err, result ) {
            expect( result ).toEqual( jasmine.any( String ) );
            done();
            });
    });

});
