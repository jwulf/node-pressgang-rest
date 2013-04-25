var restler = require('restler'),
    fs = require('fs');

/* This library defines an object PressGangCCMS, which can be used to do 
    various operations, and also a library of quick and dirty topic functions 
*/
    
exports.getTopic = getTopic;
exports.getContentSpec = getContentSpec;
exports.checkoutSpec = checkoutSpec;
    
var DEFAULT_URL = 'http://127.0.0.1:8080/TopicIndex',
    CONTENT_SPEC_TAG_ID = 268,
    REST_API_PATH = '/seam/resource/rest/',
    REST_UPDATE_TOPIC_PATH = 'topic/update/json',
    REST_GET_TOPIC_PATH = '/topic/get/json/',
    DEFAULT_REST_VER = 1,
    REST_V1_PATH = REST_API_PATH + '1',
    REST_V1_UPDATE = REST_V1_PATH + REST_UPDATE_TOPIC_PATH,
    REST_V1_GET = REST_V1_PATH + REST_GET_TOPIC_PATH,
    DEFAULT_LOG_LEVEL = 0,
    DEFAULT_AUTH_METHOD = '',

    ContentSpecMetadataSchema = [
        { attr: 'specrevision', rule: /^SPECREVISION[ ]*((=.*)|$)/i }, 
        { attr: 'product',      rule: /^PRODUCT[ ]*((=.*)|$)/i }, 
        { attr: 'checksum',     rule: /^CHECKSUM[ ]*((=.*)|$)/i }, 
        { attr: 'subtitle',     rule: /^SUBTITLE[ ]*((=.*)|$)/i }, 
        { attr: 'title',        rule: /^TITLE[ ]*((=.*)|$)/i }, 
        { attr: 'edition',      rule: /^EDITION[ ]*((=.*)|$)/i }, 
        { attr: 'bookversion',  rule: /^BOOK VERSION[ ]*((=.*)|$)/i }, 
        { attr: 'pubsnumber',   rule: /^PUBSNUMBER[ ]*((=.*)|$)/i }, 
        { attr: 'description',  rule: /^(DESCRIPTION|ABSTRACT)[ ]*((=.*)|$)/i }, 
        { attr: 'copyright',    rule: /^COPYRIGHT HOLDER[ ]*((=.*)|$)/i }, 
        { attr: 'debug',        rule: /^DEBUG[ ]*((=.*)|$)/i }, 
        { attr: 'version',      rule: /^VERSION[ ]*((=.*)|$)/i }, 
        { attr: 'brand',        rule: /^BRAND[ ]*((=.*)|$)/i }, 
        { attr: 'buglinks',     rule: /^BUG[ ]*LINKS[ ]*((=.*)|$)/i }, 
        { attr: 'bzproduct',    rule: /^BZPRODUCT[ ]*((=.*)|$)/i }, 
        { attr: 'bzcomponent',  rule: /^BZCOMPONENT[ ]*((=.*)|$)/i }, 
        { attr: 'bzversion',    rule: /^BZVERSION[ ]*((=.*)|$)/i }, 
        { attr: 'surveylinks',  rule: /^SURVEY[ ]*LINKS[ ]*((=.*)|$)/i }, 
        { attr: 'translocale',  rule: /^TRANSLATION LOCALE[ ]*((=.*)|$)/i }, 
        { attr: 'type',         rule: /^TYPE[ ]*((=.*)|$)/i }, 
        { attr: 'outputstyle',  rule: /^OUTPUT STYLE[ ]*((=.*)|$)/i }, 
        { attr: 'publican.cfg', rule: /^PUBLICAN\\.CFG[ ]*((=.*)|$)/i }, 
        { attr: 'inlineinject', rule: /^INLINE INJECTION[ ]*((=.*)|$)/i }, 
        { attr: 'space',        rule: /^spaces[ ]*((=.*)|$)/i }, 
        { attr: 'dtd',          rule: /^DTD[ ]*((=.*)|$)/i }, 
        { attr: 'id',           rule: /^ID[ ]*((=.*)|$)/i },
        // begin Death Star Processor Directives
        {attr : 'revhistory',   rule : /^#_DSD:REVHISTORY[ ]*((=.*)|$)/i}
    ];

/* 
    getTopic
    
    Return the entire Topic record, optionally a specific revision, and optionally
    expand tags.
    
    Example usage: 
    getTopic('http://127.0.0.1:8080', 4324, {revision: 2343, expand: tags}, myCallback);    
    
    Gets revision 2343 of topic 4324 with the tags expanded.

*/
function getTopic (url, id, optsORcb, cb){

    var _cb, _rev, _req, _expand, _opts;

 
    // Deal with the optional revision parameter
    if (typeof optsORcb == 'function') _cb = optsORcb;
    if (typeof cb == 'function') {
        _cb = cb;
    }
    
    if (typeof optsORcb == 'object') {
        _opts = optsORcb;
        _rev = (_opts.revision) ? _opts.revision : null;
        _expand = (_opts.expand) ? _opts.expand: null;
    }
    
    _req = url + REST_V1_GET + id;
    if (_rev) 
        _req += '/r/' + _rev;
    
    if (_expand) _req += '?expand=' + 
        encodeURIComponent('{"branches":[{"trunk":{"name":"' + _expand + '"}}]}');
    
    restler.get(_req).on('complete', function getTopicCallback (topic){
         if (topic instanceof Error && _cb) { 
             _cb(topic);
        } else {
            if (_cb) return _cb (null, topic);
        }
    });
}

/* 
    getContentSpec
    
    Retrieves a content spec topic and returns an object with spec and metadata
    attributes

*/
function getContentSpec (url, id, revORcb, cb) {
    var _cb, _rev, _opts,
        _is_spec = false;
    
    _cb = (typeof cb == 'function') ? cb: null;
    _cb = (typeof revORcb == 'function') ? revORcb : _cb;
    _rev = (typeof revORcb == 'string' || typeof revORcb == 'number') ? revORcb : null;
    
    _opts = {expand: 'tags'};
    if (_rev) _opts.revision = _rev;
    
    getTopic(url, id, _opts, function (err, topic){
        if (err && _cb) return _cb(err);
        if (!topic && _cb) return _cb('Error: No topic data returned from REST call');
        // Check if content spec
        var _tags = topic.tags;
        if (_tags && _tags.items && _tags.items.length > 0) {
            for(var tag = 0; tag < _tags.items.length; tag++) {
                if(_tags.items[tag].item.id && _tags.items[tag].item.id === CONTENT_SPEC_TAG_ID) { // 268
                    _is_spec = true;
                }
            }
        }
        
        if (!_is_spec) return _cb('Topic ' + id + ' is not a Content Specification');
        
        stripMetadata(url, topic, _cb);
    });
}

function stripMetadata (url, topic, cb) {
    var err,
        _result,
        array,
        spec;
        
    if('function' !== typeof cb) {
        return;  // don't waste mah time!
    }
    
    spec = topic.xml;
    
    if('string' !== typeof spec || '' === spec) {
        return cb('Cannot parse spec - expected string value', null);
    }
    
    _result = {
        serverurl: url,
        url: url,
        revision: topic.revision,
        id: topic.id,
        content: topic.xml,
        metadata: {}
    };
    

    array = spec.split("\n");
    for(var i = 0; i < array.length; i++) {
        for(var j = 0; j < ContentSpecMetadataSchema.length; j++) {
            if(array[i].match(ContentSpecMetadataSchema[j].rule)) {
                _result.metadata[ContentSpecMetadataSchema[j].attr] = array[i].split('=')[1].replace(/^\s+|\s+$/g, '');
            }
        }
    }
    cb(err, _result);
}

// Not finished - should probably rip the code from lib/topicdriver.js
function saveTopic (topic, log_msg, change_impact, cb) {
    var CHANGE = {MINOR: 1,
        MAJOR: 2};
    this.getBaseRESTPath(function (requestPath) {
        requestPath += exports.REST_UPDATE_TOPIC_PATH;
        requestPath += '?message=';
        requestPath += encodeURIComponent(log_msg);
        requestPath += '&flag=';
        requestPath += '' + change_impact;
    });
}

function checkoutSpec (url, id, basedir, cb) {
    
    getContentSpec(url, id, function (err, spec){
        if (err) return cb(err); // Covers "topic is not a content spec"
        
        fs.exists(basedir, function(exists) {
            if (!exists) 
                return cb('The specified checkout working directory does not exist');
            
            var productdir = basedir + '/' + spec.metadata.product.replace(/ /g, "_");
            spec.metadata.bookdir = productdir + '/' + spec.id + '-' + spec.metadata.title.replace(/ /g, "_") + '-' + spec.metadata.version;
                createDir(productdir, function(err) {
                    if (err) return cb(err, spec);
                    
                    createDir(spec.metadata.bookdir, function(err) {
                        if (err) return cb(err, spec);
                        var conffile = spec.metadata.bookdir + '/csprocessor.cfg';

                        var conf = [
                            '#SPEC_TITLE=' + spec.metadata.title.replace(/ /g, "_"),
                            'SPEC_ID=' + id, 
                            'SERVER_URL=' + url,
                            ''
                        ].join('\n');

                        fs.writeFile(conffile, conf, function(err) {
                            cb(err, spec);
                        });
                       
                    });
                });
        });    
        
    });
}

function createDir(dir, cb)
{
    fs.exists(dir, function(exists){
        if (exists) {cb();} else
        {
            fs.mkdir(dir, cb);
        }
    });
}
