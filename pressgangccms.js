/*!
 * pressgang-rest
 * Copyright(c) 2012 Red Hat <jwulf@redhat.com>
 * BSD Licensed
 */
 
// node-pressgang-rest is a node module for communicating with a PressGang CCMS server
// via its REST interface

var rest = require('restler');
var eventEmitter = require('events').EventEmitter;
var util = require('util');

const   CONTENT_SPEC_TAG_ID = 268, // PressGang tag ID for Content Spec tag
        REST_API_PATH = '/seam/resource/rest/'; 
        DEFAULT_REST_VER = 1,
        DEFAULT_URL = 'http://127.0.0.1:8080/TopicIndex';
        DEFAULT_LOG_LEVEL = 0;
        DEFAULT_AUTH_METHOD = ''; // xx AUTH not implemented yet
        

module.exports.PressGangCCMS = PressGangCCMS;

// Object constructor
// optionally takes string or configuration object as argument

function PressGangCCMS(settings){

// Properties:
// url - instance url | defaults to DEFAULT_URL
// restver - REST API version | default to DEFAULT_REST_VER
// loglevel - logging level | defaults to DEFAULT_LOG_LEVEL
// username - username for authentication | Not set by default
// authmethod - authentication method to use | Not set by default
// authtoken - authentication token to use | Not set by default

    // Set default URL
    this.url = DEFAULT_URL;

    this._settings = {};
    
    // String argument to constructor, we interpret it as a URL
	if ('string' == typeof settings)
		this.url = settings;
        
    // Otherwise, if we got an options object, look for a URL     
    if ('object' == typeof settings && settings.url)
        this.url = settings.url;
    
    // Authentication is not implemented in PressGang yet 
    this.restver = 1;
	this.loglevel = 0;

    if ('object' == typeof settings){
        for (var i in settings) {
            this[i] = settings[i];
        }
    }
    
}

util.inherits(PressGangCCMS, eventEmitter);

PressGangCCMS.prototype.log = function( msg, lvl ) {
    if ( this.loglevel > lvl ) console.log( msg );
}


PressGangCCMS.prototype.isContentSpec = function(topic_id, cb)
{
    this.getTopicData('topic-tags', topic_id, function isContentSpecGetTagsCallback(err, result){ 
        if (!err)
        {
            var is_spec = false;
            if (result && result.length > 0){
                for (var i = 0; i < result.length; i ++){
                    if (result[i].item.id == CONTENT_SPEC_TAG_ID) is_spec = true;
                }
            }
        }
        return cb(err, is_spec);
    });
}

PressGangCCMS.prototype.getTopicXML = function(topic_id, rev, cb)
{    
    this.getTopicData( 'xml', topic_id, rev, cb );
}

// Function signature: 
// data_request: string - type of data required
// topic_id: number - ID of topic
// [rev]: number - optional revision number of topic
// cb: callback function

// Callback function signature:
// cb( err, result )
// Result is 
PressGangCCMS.prototype.getTopicData = function( data_request, topic_id, rev, cb )
{
    var requestPath, _rev, _restver, _result;
    
    // The revision argument is optional, so if it was elided
    // and a callback function was specified, assign the callback 
    // argument to cb
    if ( 'function' == typeof rev )
        cb = rev;
        
    if ( this.url )
    {    
        // If an optional revision number was specified, assign it to the 
        // internal revision property
        if ( 'number' == typeof rev )
            _rev = rev;

        // assemble the request path from the url, data_request, topic id
        // and (optionally) the revision number
        
        // Start with the base REST API path from the constants
        requestPath = REST_API_PATH;
        
        // Currently only v 1 of the API exists, and the path is constructed
        // by adding the version number. In future revisions the API calls themselves 
        // might change, so we will switch on the restver
        // For now we can just add the restver to the path
        _restver = this.restver || '1';
        requestPath += _restver;
        
        // Here is the switch statement to support different versions of the REST
        // API in the future
        /* switch (this._settings.restver){
            case 1: // REST API v.1
            */
                switch(data_request){ // These are the different data requests we support
                
                    // 'xml': Return the topic xml (plain text in the case of a Content Spec
                    // 'json-topic': Return the json representation of a topic
                    case 'xml':
                    case 'json':
                        requestPath += '/topic/get/json/' + topic_id;
                        if ( _rev ) request += '/r/' + _rev;
                        break;
                
                    // 'topic-tags': Return an expanded collection of tags
                    case 'topic-tags':
                        requestPath += '/topic/get/json/' + topic_id + '?expand='
                        requestPath += encodeURIComponent('{"branches":[{"trunk":{"name":"tags"}}]}'); 
                        break;
            }
           
            
// Close switch for the REST API version
// Not implemented while there is only v.1
 //         break;
//        }
        
        this.log(this.url + requestPath, 2);
        
        rest.get(this.url + requestPath).on('complete', function(result){
            if (result instanceof Error)
            {
                if ('function' == typeof cb) return cb(result);
            }
            else
            {
                if (!result) return cb('Unable to contact server');
            }
            
            // By default we return the entire result
            _result = result;
            
            // Will need to be switched on REST ver in the future also, 
            // or perhaps a single switch that encompasses the entire pathway
            // including the REST call
            switch(data_request){
                case 'topic-tags':
                    if (!result.tags) { 
                        _result =[]; 
                    } else { 
                        _result = result.tags.items; 
                    }
                    break;
                    
                case 'xml':
                    _result = result.xml;
                    break;
            }
        
            return cb(null, _result);
        });
    }
    else
    {
        if (cb) return cb(new Error('No server URL specified'));
    }
}


