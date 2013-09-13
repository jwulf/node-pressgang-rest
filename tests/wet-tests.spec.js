// Jasmine unit tests

//    "jasmine-node": "~1.0.26"

// These are the wet tests - they rely on a specifically configured PressGang instance
// See https://bugzilla.redhat.com/show_bug.cgi?id=869500

// to execute test:
// sudo npm install -g jasmine-node
// then run
// PG_TEST_URL=<server url> jasmine-node pressgangccms-wet.spec.js --verbose

// Tests the compiled js at the top level by default
var src = process.env.SRCDIR || './../pressgangccms.js';

var PG = require(src);

const   TEST_URL = process.env.PG_TEST_URL,

        TEST_TOPIC_ID = 12095,
        TEST_TOPIC_TEXT = 'Test Topic Second Revision',
        TEST_TOPIC_REV = 326032,
        TEST_TOPIC_REV_TEXT = 'Test Topic First Revision',

        BOGUS_REVISION = 0;
        
        TEST_SPEC_ID = 12339,
        TEST_SPEC_ID_STRING = '' + TEST_SPEC_ID;
        TEST_SPEC_VER = '2.0',
        TEST_SPEC_REV = 507760,
        TEST_SPEC_REV_VER = '1.0';
        
    if (!TEST_URL) {
        console.log('No server specified. Please set PG_TEST_URL and re-run');
        return;
    }
    
describe( 'getTopic', function () {
        
    it('should return an error with no URL', function (done) {
        PG.getTopic(null, TEST_TOPIC_ID, function (err, result) {
            expect(err).not.toBe (null);    
            done();
        });
        
    });
    
    it('should return an error for a bogus URL',
        function (done) {
                var bogusURL = 'httX://+_a-non-existent-domain.com:777';
                PG.getTopic(bogusURL, TEST_TOPIC_ID, function (err, result) {
                    expect(err).not.toBe( null );
                    done ();
                });
        }
    );
   
    it('should return an error when called with a non-numeric Topic ID', 
        function (done) {      
        	console.log('Starting');  
        PG.getTopic(TEST_URL, 'something' , function ( err, result ) {
            expect( err ).not.toBe(null);
            done();
            });
    });

    it('should return an object for a JSON request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, function ( err, result ) {
            expect( result ).toEqual( jasmine.any( Object ) );
            expect( err ).toEqual( null );
            done();
            });
    });

    it('should return the right object for a JSON request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, function ( err, result ) {
            expect( result.id ).toEqual( TEST_TOPIC_ID );
            expect( err ).toEqual( null );
            done();
            });
    });

    it('should return an object with an XML property for a JSON request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, function ( err, result ) {
            expect( result.xml ).toBeDefined;
            expect( err ).toEqual( null );
            done();
            });
    });

    it('should return an object with an XML property of Type String for a JSON request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, function ( err, result ) {
            expect( result.xml ).toEqual( jasmine.any( String ) );
            expect( err ).toEqual( null );
            done();
            });
    });

    it('should return the right string for a JSON request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, function ( err, result ) {
        expect( result.xml ).toEqual( TEST_TOPIC_TEXT );
        expect( err ).toEqual( null );
        done();
            });
    });

    it('should return the right string for an XML request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, function ( err, result ) {
        expect( result.xml ).toEqual( TEST_TOPIC_TEXT );
        expect( err ).toEqual( null );
        done();
            });
    });
    
});


describe( 'getTopic with revision', function () {
	
    it('should return an error with no URL', function (done) {
        PG.getTopic('', TEST_TOPIC_ID, TEST_TOPIC_REV, function (err, result) {
            expect( err ).not.toBe(null);    
            done();
        });
        
    });
   
    it('should return an error for a bogus URL',
        function (done) {
                var url = 'httX://+_a-non-existent-domain.com:777';
                PG.getTopic( url, TEST_TOPIC_ID, TEST_TOPIC_REV, function (err, result) {
                    expect( err ).not.toBe(null);
                    done ();
                });
        }
    );

    it('should return an error when called with a non-numeric Topic ID', 
        function (done) {        
        PG.getTopic(TEST_URL, 'something' , {revision: TEST_TOPIC_REV}, function ( err, result ) {
            expect( err ).toEqual( jasmine.any( String ) );
            done();
            });
    });

    it('should return an error when called with a non-numeric Topic Revision', 
        function (done) {        
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, {revision: 'something'}, function ( err, result ) {
            expect( err ).not.toEqual( null );
            done();
            });
    });
    
    it('should return an object for a JSON request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, {revision: TEST_TOPIC_REV}, function ( err, result ) {
            expect( result ).toEqual( jasmine.any( Object ) );
            expect( err ).toEqual( null );
            done();
            });
    });

    it('should return the right object for a JSON request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, {revision: TEST_TOPIC_REV}, function ( err, result ) {
            expect( result.id ).toBeDefined;
            expect( result.id ).toEqual( TEST_TOPIC_ID );
            expect( err ).toEqual( null );
            done();
            });
    });

    it('should return an object with an XML property for a JSON request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, {revision: TEST_TOPIC_REV}, function ( err, result ) {
            expect( result.xml ).toBeDefined;
            expect( err ).toEqual( null );
            done();
            });
    });

    it('should return an object with an XML property of Type String for a JSON request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, {revision: TEST_TOPIC_REV}, function ( err, result ) {
            expect( result.xml ).toEqual( jasmine.any( String ) );
            expect( err ).toEqual( null );
            done();
           });
    });

    it('should return the right string for a JSON request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, {revision: TEST_TOPIC_REV}, function ( err, result ) {
        expect( result.xml ).toEqual( TEST_TOPIC_REV_TEXT );
        expect( err ).toEqual( null );
        done();
            });
    });

 /*   it('should return a string for an XML request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, {revision: TEST_TOPIC_REV}, function ( err, result ) {
            expect( result ).toEqual( jasmine.any( String ) );
            expect( err ).toEqual( null );
            done();
            });
    });
    
    it('should return the right string for an XML request', function (done) {
        PG.getTopic(TEST_URL, TEST_TOPIC_ID, {revision: TEST_TOPIC_REV}, function ( err, result ) {
        expect( result ).toEqual( TEST_TOPIC_REV_TEXT );
        expect( err ).toEqual( null );
        done();
            });
    });
    */
});

describe( 'getTopicTags', function () {
    
    it('should return an error if given a bogus URL', function (done) {
        var BOGUS_URL = 'httX://+_a-non-existent-domain.com:777';
        PG.getTopicTags(BOGUS_URL, TEST_TOPIC_ID, function (err, result) {
            expect( err ).not.toBe(null);
            done ();
        });
    });
        
    it('should return an array for a valid topic', function (done) {
        PG.getTopicTags(TEST_URL, TEST_TOPIC_ID, function (err, result) {
            expect( result ).toEqual( jasmine.any( Array ) );
            expect( err ).toBe(null);
            done ();
        });
    });
        
  

    
// TODO: Further testing of getTopicData for topic_tags
});


describe( 'getContentSpec with no revision', function(){
   
   it('should return an error when passed a non-Spec ID', function ( done ) {
   	var BOGUS_SPEC_ID = 0;
        PG.getContentSpec( TEST_URL, BOGUS_SPEC_ID, function ( err, result ) {
            expect( err ).not.toBe( null );
            done ();
        });
   });
   
   it('should not return an error when passed a valid Spec ID', function ( done ) {
        PG.getContentSpec( TEST_URL, TEST_SPEC_ID, function ( err, result ) {
            expect( err ).toEqual( null );
            done ();
        });
   });

   it('should return a result when passed a valid Spec ID', function ( done ) {
        PG.getContentSpec( TEST_URL, TEST_SPEC_ID, function ( err, result ) {
            expect( result ).not.toBe( null );
            done ();
        });
   });
      
      it('should return a Metadata record when passed a valid Spec ID', function ( done ) {
        PG.getContentSpec( TEST_URL, TEST_SPEC_ID, function ( err, result ) {
            expect( result.metadata ).toBeDefined;
            done ();
        });
   });
   
      it('should return a Spec when passed a valid Spec ID', function ( done ) {
        PG.getContentSpec( TEST_URL, TEST_SPEC_ID, function ( err, result ) {
            expect( result.spec ).toBeDefined;
            done ();
        });
   });

    it('should return the correct ID when passed a valid Spec ID', function ( done ) {
        PG.getContentSpec( TEST_URL, TEST_SPEC_ID, function ( err, result ) {
            expect( result.metadata.id ).toEqual( TEST_SPEC_ID_STRING );
            done ();
        });
   });
   
   it('should return the latest version when passed no revision', function (done) {
        PG.getContentSpec( TEST_URL, TEST_SPEC_ID, function ( err, result ) {
            expect( result.metadata.version ).toEqual( TEST_SPEC_VER );
            done ();
        });
   });         
});

describe( 'getContentSpec with revision', function(){
   
   it('should return an error when passed an invalid revision', function ( done ) {
        PG.getContentSpec(TEST_URL, TEST_SPEC_ID, BOGUS_REVISION, function ( err, result ) {
            expect( err ).not.toBe( null );
            done ();
        });
   });
   
   it('should not return an error when passed a valid revision', function ( done ) {
        PG.getContentSpec(TEST_URL, TEST_SPEC_ID, TEST_SPEC_REV, function ( err, result ) {
            expect( err ).toEqual( null );
            done ();
        });
   });

   it('should return a result when passed a valid Spec ID', function ( done ) {
        PG.getContentSpec(TEST_URL, TEST_SPEC_ID, TEST_SPEC_REV, function ( err, result ) {
            expect( result ).not.toBe( null );
            done ();
        });
   });
      
      it('should return a Metadata record when passed a valid revision', function ( done ) {
        PG.getContentSpec(TEST_URL, TEST_SPEC_ID, TEST_SPEC_REV, function ( err, result ) {
            expect( result.metadata ).toBeDefined;
            done ();
        });
   });
   
      it('should return a Spec when passed a valid Spec ID', function ( done ) {
        PG.getContentSpec(TEST_URL, TEST_SPEC_ID, TEST_SPEC_REV, function ( err, result ) {
            expect( result.spec ).toBeDefined;
            done ();
        });
   });

    it('should return the correct ID when passed a valid revision', function ( done ) {
        PG.getContentSpec(TEST_URL, TEST_SPEC_ID, TEST_SPEC_REV,function ( err, result ) {
            expect( result.metadata.id ).toEqual( ''+ TEST_SPEC_ID );
            done ();
        });
   });
   
   it('should return the correct version when passed a revision', function (done) {
        PG.getContentSpec(TEST_URL, TEST_SPEC_ID, TEST_SPEC_REV, function ( err, result ) {
            expect( result.metadata.version ).toEqual( TEST_SPEC_REV_VER );
            done ();
        });
   });         
});
