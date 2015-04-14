import chai from 'chai';
import {Cache} from '../src/cache';

let should = chai.should();

describe('#Cache', () => {

    let c;

    beforeEach(() => {
        localStorage.clear();
        c = new Cache('tmp', 10);
    });

    it('key from url', () => {
        let k1 = c.keyFromUrl('http://www.example.com/sample', {a: 1, b: 'zzz', c: 'aaa'});
        let k2 = c.keyFromUrl('http://www.example.com/sample', {b: 'zzz', a: 1, c: 'aaa'});
        let k3 = c.keyFromUrl('http://www.example.com/sample', {b: 'xxx', a: 1, c: 'aaa'});
        let k4 = c.keyFromUrl('http://www.example.com/simple', {b: 'zzz', a: 1, c: 'aaa'});
	k1.should.equal(k2);
	k1.should.not.equal(k3);
	k1.should.not.equal(k4);
    });

    it('len and prefix', () => {
        c.addItem(42, 42, 1);
        c.addItem(50, {}, 2);
        c.addItem('xxx', { a: 42 }, 3);
        c.addItem(70, { b: { c: 'xxx' } }, 4);
        should.exist(localStorage.getItem('tmp|i|0'));
        should.exist(localStorage.getItem('tmp|i|1'));
        should.exist(localStorage.getItem('tmp|i|2'));
        should.exist(localStorage.getItem('tmp|i|3'));
        should.exist(localStorage.getItem('tmp|i|l'));
        should.exist(localStorage.getItem('tmp|d|42'));
        should.exist(localStorage.getItem('tmp|d|50'));
        should.exist(localStorage.getItem('tmp|d|70'));
        should.exist(localStorage.getItem('tmp|d|xxx'));
        localStorage.getItem('tmp|i|l').should.equal('4');
    });

    it('get and update', () => {
        c.addItem(42, 42, 1);
        c.addItem(50, {}, 2);
        c.addItem('xxx', { a: 42 }, 3);
        c.addItem(70, { b: { c: 'xxx' } }, 4);
	c.getItem('xxx').should.deep.equal({ a: 42 });
	c.getItem(70).should.deep.equal({ b: { c: 'xxx' } });
	c.updateItem(50, {ddd:'zzz'}, 15);
	c.getItem(50).should.deep.equal({ddd:'zzz'});
    });

    it('remove and clear', () => {
        c.addItem(42, 42, 1);
        c.addItem(50, {}, 2);
        c.addItem('xxx', { a: 42 }, 3);
        c.addItem(70, { b: { c: 'xxx' } }, 4);
	c.removeItem('xxx');
        should.exist(localStorage.getItem('tmp|i|0'));
        should.exist(localStorage.getItem('tmp|i|1'));
        should.exist(localStorage.getItem('tmp|i|2'));
        should.not.exist(localStorage.getItem('tmp|i|3'));
        should.exist(localStorage.getItem('tmp|i|l'));
        should.exist(localStorage.getItem('tmp|d|42'));
        should.exist(localStorage.getItem('tmp|d|50'));
        should.exist(localStorage.getItem('tmp|d|70'));
        should.not.exist(localStorage.getItem('tmp|d|xxx'));
        localStorage.getItem('tmp|i|l').should.equal('3');
	c.clear();
        should.not.exist(localStorage.getItem('tmp|i|0'));
        should.not.exist(localStorage.getItem('tmp|i|1'));
        should.not.exist(localStorage.getItem('tmp|i|2'));
        should.not.exist(localStorage.getItem('tmp|i|3'));
        should.exist(localStorage.getItem('tmp|i|l'));
        should.not.exist(localStorage.getItem('tmp|d|42'));
        should.not.exist(localStorage.getItem('tmp|d|50'));
        should.not.exist(localStorage.getItem('tmp|d|70'));
        should.not.exist(localStorage.getItem('tmp|d|xxx'));
        localStorage.getItem('tmp|i|l').should.equal('0');
    });

    it('eviction', () => {
        c.addItem(42, 42, 100);
        c.addItem(50, {}, 32);
        for (let i = 0; i < 20; ++i) {
            c.addItem('key' + i, {
                data: i
            }, Math.trunc(Math.random() * 20));
        }
        localStorage.getItem('tmp|i|l').should.equal('10');
        should.exist(localStorage.getItem('tmp|d|42'));
        should.exist(localStorage.getItem('tmp|d|50'));
        for (let i = 20; i < 40; ++i) {
            c.addItem('key' + i, {
                data: i
            }, Math.trunc(Math.random() * 20 + 110));
        }
        localStorage.getItem('tmp|i|l').should.equal('10');
        should.not.exist(localStorage.getItem('tmp|d|42'));
        should.not.exist(localStorage.getItem('tmp|d|50'));
        for (let i = 40; i < 60; ++i) {
            c.addItem('key' + i, {
                data: i
            }, Math.trunc(Math.random() * 20));
        }
        localStorage.getItem('tmp|i|l').should.equal('10');
	let n = 0;
        for (let i = 0; i < 10; ++i) {
            if (JSON.parse(localStorage.getItem('tmp|i|' + i)).p < 100) {
                ++n;
            }
        }
	n.should.equal(1);
    });

    it('same elements', () => {
        chai.expect(function () {
            c.addItem(42, 42, 100);
            c.addItem(42, 42, 100);
        }).to.throw('Attempt to push duplicate item');
    });

    it('performance (long test, see console)', function(done) {
        this.timeout(600000);
        let measure = (iterations, f) => {
            let start = new Date().getTime();
            for (let i = 0; i < iterations; ++i) {
                f();
            }
            return new Date().getTime() - start;
        };

	let putThenGet = (data) => {
	    let key = Math.random().toString(36).slice(2);
	    c.addItem(key, data, 0);
	    let d = c.getItem(key);
	    d.slice(0, 5).should.equal(data.slice(0, 5));
	};

	let generateData = (len) => {
	    let data = '';
	    while (data.length < len) {
	        data += Math.random().toString(36).slice(2);
	    }
	    return data.slice(0, len);
	};

	let exec = (len, iterations) => {
	    let data = generateData(len);
	    let dt = measure(iterations, () => {
	        putThenGet(data);
	    });
	    console.log(iterations + ' iterations with string of length ' +
			    len + ' took: ' + dt.toFixed(2) + 'ms (' +
				    (dt/iterations).toFixed(2) + 'ms per iteration)');
	};

	console.log('=========================');
	console.log('This test is quite long, please wait...');
	console.log('Cache of size 10:');
	exec(100, 1000);
	exec(1000, 1000);
	exec(10000, 1000);
	console.log('Cache of size 100:');
	localStorage.clear();
        c = new Cache('tmp', 100);
	exec(100, 1000);
	exec(1000, 1000);
	exec(10000, 1000);
	console.log('Cache of size 1000:');
	localStorage.clear();
        c = new Cache('tmp', 1000);
	exec(100, 1000);
	exec(1000, 1000);
	exec(10000, 1000);
	console.log('Creating new cache on top of existing data in storage...');
	localStorage.clear();
        c = new Cache('tmp', 1000);
	console.log('Cache of size 1000:');
	exec(1000, 1000);
	console.log('Data generated, creating new cache...');
	let dt = measure(1000, () => {
	    c = new Cache('tmp', 1000);
	});
	console.log('Cache created in ' + (dt/1000).toFixed(2) + 'ms');
	console.log('=========================');

        done();
    });
});
