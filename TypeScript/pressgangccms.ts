///<reference path='node.d.ts' />

// TypeScript source
// To compile to JavaScript

// sudo npm install -g typescript
// tsc -c --declarations pressgangccms.ts 

/*!
 * pressgang-rest
 * Copyright(c) 2012 Red Hat <jwulf@redhat.com>
 * BSD Licensed
 */
 
// node-pressgang-rest is a node module for communicating with a PressGang CCMS server
// via its REST interface

//declare var rest; 

import restler = module("restler");

interface IPressGang {
        url?: string;
        username?: string;   
        authtoken?: string;
        authmethod?: string;
        restver?: number;
        loglevel?: number;
}

export var DEFAULT_URL = 'http://127.0.0.1:8080/TopicIndex';
export var CONTENT_SPEC_TAG_ID = 268; // PressGang tag ID for Content Spec tag
export var REST_API_PATH = '/seam/resource/rest/'; 
export var DEFAULT_REST_VER = 1;
export var DEFAULT_LOG_LEVEL = 0;
export var DEFAULT_AUTH_METHOD = ''; // xx AUTH not implemented yet

// Supported operations for getTopicData
export var DATA_REQ = {
                'xml' :'xml',
                'topic_tags' : 'topic_tags',
                'json' : 'json' 
                };

export class PressGangCCMS implements IPressGang{
    public url: string;
    public username: string;   
    public authtoken: string;
    public authmethod: string;
    public restver: number;
    public loglevel: number;               

// Object constructor
// optionally takes string or configuration object as argument

    constructor ( settings: string );
    constructor ( settings: IPressGang );
    constructor ( settings: any)
    {
        // Set default URL
        this.url = DEFAULT_URL;
            
        // String argument to constructor, we interpret it as a URL
    	if ('string' == typeof settings)
    		this.url = settings;
            
        // Otherwise, if we got an options object, look for a URL     
        if ('object' == typeof settings && settings.url)
            this.url = settings.url;
        
        // Authentication is not implemented in PressGang yet 
        this.restver = DEFAULT_REST_VER;
    	this.loglevel = DEFAULT_LOG_LEVEL;
    
        if ('object' == typeof settings){
            for (var i in settings) {
                this[i] = settings[i];
            }
        }
    }

    public supportedDataRequests ():any { return DATA_REQ }

    private log (msg:string, msglevel: number): void
    {
        if ( this.loglevel > msglevel ) console.log( msg );
    }


    public isContentSpec (topic_id: number, cb: (err: string, result:bool) => bool): any
    {
        
        if ( typeof cb !== 'function' ) return;
        
        if ( typeof topic_id !== 'number' ) 
            return cb ( 'Need numeric Topic ID as first argument', false );
        
        this.getTopicData('topic_tags', topic_id, function isContentSpecGetTagsCallback(err, result){ 
            if ( !err )
            {
                var is_spec = false;
                if (result && result.length > 0){
                    for (var i = 0; i < result.length; i ++){
                        if (result[i].item.id === CONTENT_SPEC_TAG_ID) is_spec = true;
                    }
                }
            }
            cb( err, is_spec );
            return;
        });
    }

    public getTopicXML( topic_id: number, rev: number, cb: (err: string, result: any) => any ): void
    {    
        this.getTopicData( 'xml', topic_id, rev, cb );
    }


    public getTopicData( data_request: string, topic_id: number, 
                cb: (err: string, result: any) => any ) : any;
    public getTopicData( data_request: string, topic_id : number, rev: number, 
                cb: (err: string, result: any) => any ) : any;
    public getTopicData( data_request: string, topic_id :number, revORcb: any, 
                cb?: (err: string, result: any) => any) : any
    {
                
        var requestPath :string,
            _rev: number, 
            _restver: number,
            _result: any;
    
        if ( 'function' == typeof cb ) 
            if ( 'number' !== typeof revORcb )
                if ( cb ) return cb ('Need numerical topic revision as third argument', null);
                    // If there is no callback we'll return shortly anyway...
            
        // The revision argument is optional, so if it was elided
        // and a callback function was specified, assign the callback 
        // argument to cb
        if ( 'function' == typeof revORcb )
            cb = revORcb;
        
        // No callback, no way to return the data - not doing anything!
        if ( ! cb ) return;
        
        if ( ! DATA_REQ[data_request] ) 
            return cb(
                'Unsupported operation ' + data_request + 
                ' passed as first argument', null
            );
        
        if ( 'number' !== typeof topic_id ) 
            return cb(
                'Need numerical Topic ID as second argument', null
            );
        
        // Error out if no URL set
        if ( 'undefined' == typeof this.url || 
                'null' == typeof this.url || 
                '' === this.url )
            return cb('No server URL specified', null);


        // If an optional revision number was specified, assign it to the 
        // internal revision property
        // This means that a non-number passed as a revision is silently ignored
        if ( 'number' == typeof revORcb )
            _rev = revORcb;

        // assemble the request path from the url, data_request, topic id
        // and (optionally) the revision number
        
        // Start with the base REST API path from the constants
        requestPath = REST_API_PATH;
        
        // Currently only v 1 of the API exists, and the path is constructed
        // by adding the version number. In future revisions the API calls themselves 
        // might change, so we will switch on the restver
        // For now we can just add the restver to the path
        _restver = this.restver || DEFAULT_REST_VER;
        requestPath += _restver;
        
        switch(data_request){ // These are the different data requests we support
        
            // 'xml': Return the topic xml (plain text in the case of a Content Spec
            // 'json-topic': Return the json representation of a topic
            case DATA_REQ.xml:
            case DATA_REQ.json:
                requestPath += '/topic/get/json/' + topic_id;
                if ( _rev ) requestPath += '/r/' + _rev;
                break;
        
            // 'topic-tags': Return an expanded collection of tags
            case DATA_REQ.topic_tags:
                requestPath += '/topic/get/json/' + topic_id;
                if ( _rev ) requestPath += '/r/' + _rev;
                requestPath += '?expand='
                requestPath += encodeURIComponent('{"branches":[{"trunk":{"name":"tags"}}]}'); 
                break;
        }
                        
        this.log(this.url + requestPath, 2);
        
        restler.get(this.url + requestPath).on('complete', function(result){
            if ( result instanceof Error )
            {
                if ( 'function' == typeof cb ) return cb( result, null );
            }
            else
            {
                if ( ! result ) return cb( 'Unable to contact server', null );
            }
            
            // By default we return the entire result
            _result = result;
            
            switch(data_request){
                case DATA_REQ.topic_tags:
                    if (!result.tags) { 
                        _result =[]; 
                    } else { 
                        _result = result.tags.items; 
                    }
                    break;
                    
                case DATA_REQ.xml:
                    _result = result.xml;
                    break;
            }
        
            if ( cb ) return cb( null, _result );
        });
    }
    
}