#pressgang-ccms-rest-node

A node module that provides a REST client library for the PressGang CCMS. It provides a more semantic interface for application development than the raw PressGang REST interface. Uses restler for the REST interface.

##Installation

```bash
npm install pressgang-ccms-rest-node
```
## Basic Usage

First, require `pressgang-ccms-rest-node`:

```js
var PressGangCCMS = require('pressgang-ccms-rest-node').PressGangCCMS;
```
Next, create a new PressGangCCMS object:

```js
var pressgang = new PressGangCCMS('http://127.0.0.1:8080/TopicIndex');
```

Now, you can get the xml of a topic:

```js
pressgang.getTopicData('xml', 8445, 
	function(err, xml){
		console.log('The topic xml content is:' + xml);
	});
```

To get the json representation of a topic:

```js
pressgang.getTopicData('json', 8445, 
	function(err, xml){
		console.log('The JSON representation of the topic is:' 
		+ JSON.Stringify(json);
	});
```

`isContentSpec` is an example of the PressGangCCMS module's semantic interface to PressGang:

```js
pressgang.isContentSpec(456, 
	function(err, is){
		if (is) console.log('Topic 456 is a Content Specification')
	});
```

