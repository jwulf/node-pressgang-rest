#node-pressgang-rest

A node module that provides a REST client library for the PressGang CCMS. It provides a more semantic interface for application development than the raw PressGang REST interface. Uses restler for the REST interface.

##Installation

```bash
npm install pressgang-rest
```

## Basic Usage v.0.1.0 and up

```js
var pressgang = require('pressgang-rest);
```

Get a topic:

```js
pressgang.getTopic('http://127.0.0.1:8080', 4324, {revision: 2343, expand: tags}, 
    function (err, topic) {
        if (err) return console.log(err);
        console.log('Got Topic %s at revision %s', topic.id, topic.revision);
        console.log('XML is %s', topic.xml);
    });
```

`revision` and `expand` are optional. `expand` can take any of the root expandable entities, which include:

```js
tags
incomingRelationships
outgoingRelationships
sourceUrls_OTM
bugzillaBugs_OTM
properties
logDetails
revisions
```

Get a Content Spec:

```js
pressgang.getSpec('http://127.0.0.1:8080', 7069, function (err, spec) {
    if (err) return console.log(err);
    console.log('Got Spec ID %s at revision %s', spec.id, spec.revision);
    console.log('The spec contents: %s', spec.content);
    console.log('The spec metadata: %s', JSON.stringify(spec.metadata));
});
```


## Basic Usage v.0.0.13 and below

First, require `pressgang-rest`:

```js
var PressGangCCMS = require('pressgang-rest').PressGangCCMS;
```
Next, create a new PressGangCCMS object:

```js
var pressgang = new PressGangCCMS('http://127.0.0.1:8080/TopicIndex');
```

Now, you can get the XML of a topic:

```js
pressgang.getTopicData('xml', 8445, 
	function(err, result){
		console.log('The topic xml content is:' + result);
	});
```

To get the JSON representation of a topic:

```js
pressgang.getTopicData('json', 8445, 
	function(err, result){
		console.log('The JSON representation of the topic is:' 
		+ JSON.stringify(result);
	});
```

To get a specific revision of a topic:

```js
pressgang.getTopicData('json', 8445, 10405, 
    function(err, result){
		console.log('The XML of revision 10405 is:' 
		+ result.xml;
	});
```

`isContentSpec` will return true if an ID is a Content Specification:

```js
pressgang.isContentSpec(456, 
	function(err, is){
		if (is) console.log('Topic 456 is a Content Specification')
	});    
```

`getContentSpec` returns a Content Spec object, which has the plain text content of the Content Spec, and a metadata record.
```js
pressgang.getContentSpec(456, 
    function(err, result){
		console.log(result.spec); // Plain-text of the spec
        console.log(result.metadata); // All the spec metadata in an object
	});    
```

You can change the logging level of the PressGangCCMS Object to get details for debugging. The `loglevel` defaults to 0. Higher levels produce more trace output on the console:

```js
pressgang.loglevel = 2;
```

You can also do quick and dirty topic operations, like this:

`getTopic` returns a JSON representation of a topic. 

```js
PressGangCCMS.getTopic('http://localhost:8080', 3445, function(topic) { console.log(topic); });
```

`getTopic` takes an optional revision parameter between the topic ID and the callback. Here 3445 is the topic id, and 23433 is the revision:

```js
PressGangCCMS.getTopic('http://localhost:8080', 3445, 23433, function(topic) { console.log(topic); });
```

##Source Code
The source is hosted on github at https://github.com/jwulf/node-pressgang-rest.

Up to 0.0.13 it was written using Microsoft TypeScript, and compiled to JavaScript using the node typescript module. There is a TypeScript declaration file in the module.

From 0.1.0 I made it straight-forward JavaScript. Tests have not been updated yet.