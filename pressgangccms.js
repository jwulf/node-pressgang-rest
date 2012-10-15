/*!
 * pressgang-ccms-rest-node
 * Copyright(c) 2012 Red Hat <jwulf@learnboost.com>
 * BSD Licensed
 */
 
// pressgang-ccms-rest-node is a module for communicating with a PressGang CCMS server
// via its REST interface

var rest = require('restler');
var eventEmitter = require('events').EventEmitter;
var util = require('util');

exports = module.exports = PressGangCCMS;

function PressGangCCMS(url, options){
    this.url = url || '';   
    this.settings = {
        username: '',
        authmethod: '',
        authtoken: '',
	restver: 1
    }
 
    if (options && options.key){
        for (var i in options) {
            if (options.hasOwnProperty(i)) {
                this.settings[i] = options[i];
            }
        }
    }
}

util.inherits(PressGangCCMS, eventEmitter);

PressGangCCMS.prototype.get = function (key) {
  return this.settings[key];
}

PressGangCCMS.prototype.set = function (key, value) {
  if (arguments.length == 1) return this.get(key);
  this.settings[key] = value;
  this.emit('set:' + key, this.settings[key], key);
  return this;
};


PressGangCCMS.prototype.getTopicData = function(topic, data_request, cb)
{
    if (this.settings.url && (this.settings.url !== ''))
    {
        var requestpath;

        // assemble the request path from the url, data_request, and topic id
        switch(data_request){
         
         case 'xml':
           requestpath = '/seam/resource/rest/1/topic/get/xml/' + topic.id +'/xml';
           break;
           
        }

        rest.get(this.url + requestpath).on('complete', function(result){
            if (result instanceof Error)
            {
                if ('function' == typeof cb) cb(result);
            }
            else
            {
                cb(null, result);
            }
        });
    }
    else
    {
        cb(new Error('No server URL specified'));
    }
}
