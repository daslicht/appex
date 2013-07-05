![](https://raw.github.com/sinclairzx81/appex/master/assets/logo.jpg)

## install

```javascript
npm install appex
```

## overview

Appex is a nodejs web application and service framework built on top of the TypeScript programming language. Appex 
enables nodejs developers to easily develop restful json services with typescript and generate meaningful service
descriptions for clients consuming them. 

## quick start

### javascript

The following illustrates setting up a appex runtime, and handling requests. 

```javascript
// app.js

var appex   = require('appex');

var runtime = appex.runtime ({ source : './program.ts', devmode : true });

require('http').createServer( function(request, response) {
    
    runtime(request, response);
    
}).listen(5444);
```

### typescript

The following demonstrates creating http accessible endpoints. appex will generate routing tables based on the module
scope of a given method. Functions named 'index' resolve to the current module scope.

```javascript
// program.ts

declare var require; 

// url: http://localhost:1337/
export function index (context:any): void { 
  
    context.response.write('home');

    context.response.end(); 
}

// url: http://localhost:1337/about
export function about (context:any): void { 
	
    context.response.write('about');

    context.response.end();
}

export module services {
    
    // url: http://localhost:1337/services/
    export function index(context:any) : void {
        
        context.response.write('services index');

        context.response.end(); 
    }

    // url: http://localhost:1337/services/dir
    export function dir(context:any, path:string, callback:(contents:string[]) => void) {
        
        require('fs').readdir(path || './', (error, contents) => {
            
            callback(contents);

        });
    }
}

```

## creating http endpoints

Appex supports two types of http endpoints, http handlers and json service methods. 

### http handler methods

A standard request response handler method can be created with the following method signature. the context
contains the standard node http request and response objects.

A http handler method can be created with the following method signature.

```javascript
export function method(context:any) : void {

	context.response.write('hello world');
	
	context.response.end();

}
```

### json service methods

Json service methods are http endpoints whose request and responses are POST'ed to them. Json service
methods automatically parse incoming json requests as well as stringify-ing the response. the context
contains the standard node http request and response objects.

A json service method can be created with the following method signature.

```javascript
export function method(context:any, request:string, callback:(response:any) => void) {

	callback(request); // echo

}
```

## routing

Appex creates url routing tables based on a functions name and its modules scope. For example consider the following...

```javascript
export function index   (context:any) { }

export function about   (context:any) { }

export function contact (context:any) { }

export module services.customers {

	export function insert(context:any) : void { }
	
	export function update(context:any) : void { }
	
	export function delete(context:any) : void { }
}
```

Will create the following routes:

```javascript
http://[host]:[port]/

http://[host]:[port]/about

http://[host]:[port]/contact

http://[host]:[port]/services/customers/insert

http://[host]:[port]/services/customers/update

http://[host]:[port]/services/customers/delete
```

note: at this time, there is not mechanism for wildcard routing.




