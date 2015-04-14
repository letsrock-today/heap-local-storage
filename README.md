# heap-local-storage

Cache in the HTML5 localStorage based on a heap (priority queue).

This is a simple cache implementation above localStorage. It leverages heap
(priority queue) algorithm ([implementation](https://github.com/letsrock-today/heapjs)) to evict elements when its size exceeds maximum allowed number of elements.
With every item it saves priority. When cache size grows more than maximum
allowed number of elements it starts to remove items with the lowest priority
before every attempt to insert new item into cache.

As heap can be rebalanced more effectively after changing element's priority
then performing removing and than inserting element into it, this cache
implementation restricts that existing element should be update with different
method then used to add new element into cache. Attempt to insert element with
existing key will throw error.

Code was developed and tested with integer priority, but should work
with other types for which < (less than) operator works. I think it can be
easily changed to support comparator function as argument, but currently we
don't need this.

Cache  works with JSON objects, it stringifies and compresses them with
[lz-string](http://pieroxy.net/blog/pages/lz-string/index.html) algorithm
before store them in the localStorage. It also provides a method to get more
compact key from, for example, an URL.

Complexity of access item operations should be O(log(n)) (where n is a number
of elements in the cache).

## Motivation

We need a simple cache above HTML5 localStorage to cache XMLHTTPRequest's 
responses with a custom eviction algorithm (we use a priority, based on a
value of 'Expires' HTTP header, so that responses with further expiraton time
stay in cache longer). We'd prefere obsolete items to stay in cache if there is
space for them, so we could use them in case of connection errors. We'd like
to compress keys and values to better use limited space of localStorage.

## Installation

    npm i -g heap-local-storage

## Usage

	var cache = require('heap-local-storage'),
	    size = 1000,
	    c = new cache.Cache('key-prefix', size),
		// actually it's not necessary be an URL, just any string and JSON object
		k = c.keyFromUrl('http://www.example.com/', {queryParam1: 42, queryParam2: 'zzz'});

	c.addItem('xxx', 42, 0);
	c.addItem(k, { a: 42 }, 3);
	c.addItem(70, { b: { c: 'xxx' } }, 4);
	
	c.getItem(k).should.deep.equal({ a: 42 });
	c.getItem(70).should.deep.equal({ b: { c: 'xxx' } });
	
	c.updateItem(k, { ddd: 'zzz' }, 15);
	c.getItem(k).should.deep.equal({ ddd: 'zzz' });
	
	c.removeItem(k);
	c.clear();
	


## Tests

    npm install
    npm test

## License

[MIT](https://github.com/letsrock-today/heap-local-storage/blob/master/LICENSE)
