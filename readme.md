![](https://raw.github.com/sinclairzx81/appex/master/assets/logo.jpg)

### develop nodejs web services with [typescript](http://www.typescriptlang.org/)

## install

```javascript
npm install appex
```

* [overview](#overview)
* [getting started](#getting_started)
* [getting started on express](#getting_started_on_express)
* [developing with appex](#development_mode)
* [functions](#functions)
	* [http handler function](#http_handler_function)
	* [json handler function](#json_handler_function)
	* [public and private functions](#public_private_functions)
	* [the index function](#the_index_function)	
	* [routing with modules and functions](#function_routing)
* [structuring projects](#structuring_projects)
* [typescript resources](#resources)

<a name="overview" />
## overview

Appex is a nodejs web application and service framework built on top of the TypeScript programming language. Appex 
enables nodejs developers to expose typescript functions as http endpoints as well as generate meaningful service
meta data for clients to consume.

Appex also provides a dynamic compilation environment for typescript to aid in development. Appex will effeciently 
manage compilation in the background without the need to restart the web server, or use addition modules.

<a name="getting_started" />
## getting started
```javascript
//----------------------------------------------
// file: program.ts
//----------------------------------------------
export module services {
	
	// url: http://localhost:3000/services/message
	export function message (context) { 
		
		context.response.write('hello typescript');

		context.response.end(); 
	}
}
//----------------------------------------------
// file: app.js
//----------------------------------------------

var appex   = require('appex');

var runtime = appex.runtime ({ source : './program.ts', devmode : true });

require('http').createServer( runtime ).listen(3000);
```
<a name="getting_started_on_express" />
## getting started on express
```javascript
//----------------------------------------------
// file: program.ts
//----------------------------------------------

export module services {
	
	// url: http://localhost:3000/services/message
	export function message (context) { 
		
		context.response.write('hello typescript');

		context.response.end(); 
	}
}

//----------------------------------------------
// file: app.js
//----------------------------------------------

var express = require('express');

var appex   = require('appex');

var app = express();

app.use( appex.runtime( { source:'./program.ts', devmode:true } ) );

app.get('/', function(req, res){

  res.send('Hello World');
  
});

app.listen(3000);
```

<a name="development_mode" />
## developing with appex

To enable development mode, set the devmode option to true on the runtime option parameter.

```javascript 
// enable dynamic compilations with the devmode option.
var runtime = appex.runtime ({ source : './program.ts', devmode : true }); 
```

Appex is built directly on top of the Microsoft TypeScript 0.9 compiler and leverages it for tight
integration with the nodejs platform. By enabling the 'devmode' option will have the compiler
effiecently rebuild typescript source code on each request made to the server. 

Appex achieves performance in this regard by leveraging features introduced in
TS 0.9 which allows incremental building / caching of typescript compilation units.

In addition to this, compilations are run in a background worker process to ensure they do interupt
requests being served on the web process.

![](https://raw.github.com/sinclairzx81/appex/master/assets/devmode.jpg)

The benefit to this is that updates can be made to source files without needing to restart the web process. Additionally, 
syntactic errors made in typescript source code do not bring the web process. Everything stays running (excluding runtime 
errors).

Appex will output detailed syntax and type errors on the main process stdout stream, as well as a http response.

<a name="functions" />
## functions

Appex supports two types of functions, http handler functions, and json handler functions. 

Appex will only create http handlers for functions a specific signature, these are outlined below.

<a name="http_handler_function" />
### http handler function

A http handler method can be created with the following function signature.

* arg0 - the http context which contains the  http request and response.

The return type is optional. http handler functions should complete the http request.

```javascript
export function method(context:any) : void {

	context.response.write('hello world');
	
	context.response.end();

}
```
<a name="json_handler_function" />
### json handler function

A json handler is a function which will accept HTTP POST'ed json strings and 
pass it to the function as a object. A json handler has three distinct arguments: 

* arg0 - the http context which contains the  http request and response.
* arg1 - the json request object 
* arg2 - a typescript callback with a single argument for the object response. 

The return type is optional. json handler functions "must" call the callback to
complete the request.

```javascript
export function method(context:any, request:any, callback:(response:any) => void) : void {

	callback(request); // echo the object back.

}
```

<a name="public_private_functions" />
### public and private functions

Appex extends TypeScripts concept of visibility to include visibility over http. From this
developers and control which functions are exported as http handlers.  

Appex will create routes only for functions marked with export and for functions that reside
withing modules with export.

Consider the following example:

```javascript

module private_module {

	export function public_method () {
	
		// this function is exported, but as this module is 
		
		// not exported, neither is this method.
	}
}

function private_function() {

	// this method is private
}

export function public_function   (context:any) { 

	private_function(); // ok
	
	private_module.public_method(); // ok
}
```

which will result in a single route.

```javascript
http://[host]:[port]/public_function
```
<a name="the_index_function" />
### the index function

Appex denotes that functions named 'index' route to the current module scope. As demonstrated below. 

```javascript
export function index(context) {}
export module blogs {
	export function index (context) { }
	export function get   (context) { }
}

// results in the following routes
// http://[host]:[port]/
// http://[host]:[port]/blogs
// http://[host]:[port]/blogs/get
```

<a name="function_routing" />
### routing with modules and functions

Appex creates url routing tables based on function name and module scope. For example consider the following...

```javascript
export function index   (context:any) { }
export function about   (context:any) { }
export function contact (context:any) { }
export module services.customers {
	export function insert(context:any) : void { }
	export function update(context:any) : void { }
	export function delete(context:any) : void { }
}

// results in the following routes
// http://[host]:[port]/
// http://[host]:[port]/about
// http://[host]:[port]/contact
// http://[host]:[port]/services/customers/insert
// http://[host]:[port]/services/customers/update
// http://[host]:[port]/services/customers/delete
```

<a name="structuring_projects" />
## structuring projects

Appex leverages TypeScript's ability to reference source files with the <reference> element. Appex 
will traverse each source files references and include it as part of the compilation.

Developers can use this functionality to logically split source files into reusable components of
functionality, as demonstrated below. 

```javascript
//---------------------------------------------------	
// file: app.js
//---------------------------------------------------

var appex = require('appex');

require('http').createServer(  appex.runtime ({ source : './index.ts', devmode : true }) ).listen(3000);

//---------------------------------------------------	
// file: index.ts
//---------------------------------------------------

/// <reference path="pages.ts" />
/// <reference path="users.ts" />

//---------------------------------------------------	
// file: pages.ts
//---------------------------------------------------

export function index   (context) { /* handle request */ }
export function about   (context) { /* handle request */ }
export function contact (context) { /* handle request */ }

//---------------------------------------------------	
// file: users.ts
//---------------------------------------------------

export module users {

	export function login  (context) { /* handle request */ }
	export function logout (context) { /* handle request */ }
}

```

<a name="resources" />
## typescript resources

* [typescript homepage](http://www.typescriptlang.org/)
* [typescript language specification](http://www.typescriptlang.org/Content/TypeScript%20Language%20Specification.pdf)
* [typescript declarations repository](https://github.com/borisyankov/DefinitelyTyped)
