import chai from 'chai';
import {IndexedMap} from '../src/indexed-map';

let should = chai.should();

describe('# IndexedMap', () => {

    let map;

    beforeEach(() => {
        localStorage.clear();
        map = new IndexedMap('tmp');
    });

    it('len and prefix', () => {
        map.push({ d: 42, k: 777, p: 55 });
        map.push({ d: 'test', k: 'xxx', p: 77 });
        map.len().should.equal(2);
        should.exist(localStorage.getItem('tmp|i|0'));
        should.exist(localStorage.getItem('tmp|i|1'));
        should.exist(localStorage.getItem('tmp|i|l'));
        should.exist(localStorage.getItem('tmp|d|777'));
        should.exist(localStorage.getItem('tmp|d|xxx'));
    });

    it('push and pop', () => {
        map.push({ d: 42, k: 777, p: 55 });
        map.push({ d: 'test', k: 'xxx', p: 77 });
        map.pop().should.deep.equal({ d: 'test', k: 'xxx', p: 77 });
        map.pop().should.deep.equal({ d: 42, k: 777, p: 55 });
        map.len().should.equal(0);
        should.not.exist(localStorage.getItem('tmp|i|0'));
        should.not.exist(localStorage.getItem('tmp|i|1'));
        should.not.exist(localStorage.getItem('tmp|d|777'));
        should.not.exist(localStorage.getItem('tmp|d|xxx'));
    });

    it('get and set', (done) => {
        map.push({ d: 42, k: 555, p: 55 });
        map.push({ d: 42, k: 777, p: 55 });
        map.push({ d: 'test', k: 'xxx', p: 77 });
        map.getItem(777).should.deep.equal({ d: 42, k: 777, p: 55 });
        map.getItem('xxx').should.deep.equal({ d: 'test', k: 'xxx', p: 77 });
        map.updateItem({ d: 'don\'t panic', k: 777, p: 42 }, (h, i) => {
            map.should.equal(h);
            i.should.equal(1);
            map.getItem(777).should.deep.equal({ d: 'don\'t panic', k: 777, p: 42 });
            map.len().should.equal(3);
            done();
        });
    });

    it('len and clear', () => {
        for (let i = 0; i < 42; ++i) {
            map.push({ d: 42, k: i, p: 55 });
            should.exist(localStorage.getItem('tmp|d|' + i));
        }
        map.len().should.equal(42);
        map.clear();
        map.len().should.equal(0);
        for (let i = 0; i < 42; ++i) {
            should.not.exist(localStorage.getItem('tmp|d|' + i));
        }
    });

    it('absent key', () => {
        map.push({ d: 42, k: 5, p: 55 });
        should.not.exist(map.getItem(42));
        chai.expect(function () {
            map.updateItem({ d: 'don\'t panic', k: 777, p: 42 }, (h, i) => {});
        }).to.throw(Error, 'Attempt to change unexisting item');
    });

    it('less', () => {
        map.push({ d: 42, k: 777, p: 88 });
        map.push({ d: 'test', k: 'xxx', p: 77 });
        map.less(0, 1).should.equal(false);
        map.less(1, 0).should.equal(true);
    });

    it('swap', () => {
        map.push({ d: 42, k: 777, p: 55 });
        map.push({ d: 'test', k: 'xxx', p: 77 });
        map.swap(0, 1);
        map.getItem(777).should.deep.equal({ d: 42, k: 777, p: 55 });
        map.getItem('xxx').should.deep.equal({ d: 'test', k: 'xxx', p: 77 });
        map.pop().should.deep.equal({ d: 42, k: 777, p: 55 });
        map.pop().should.deep.equal({ d: 'test', k: 'xxx', p: 77 });
    });

    it('same elements', () => {
        chai.expect(function () {
            map.push({ d: 'test', k: 'xxx', p: 77 });
            map.push({ d: 'test', k: 'xxx', p: 77 });
        }).to.throw(Error, 'Attempt to push duplicate item');
    });

    it('remove', (done) => {
        map.push({ d: 42, k: 555, p: 55 });
        map.push({ d: 42, k: 777, p: 55 });
        map.push({ d: 'test', k: 'xxx', p: 77 });
        map.removeItem(777, (h, i) => {
            map.should.equal(h);
            i.should.equal(1);
            map.getItem(777).should.deep.equal({ d: 42, k: 777, p: 55 });
            map.len().should.equal(3);
            done();
        });
    });

    it('existing data', () => {
        map.push({ d: 42, k: 555, p: 55 });
        map.push({ d: 42, k: 777, p: 55 });
        map.push({ d: 'test', k: 'xxx', p: 77 });
        let map1 = new IndexedMap('tmp');
        map.getItem(777).should.deep.equal({ d: 42, k: 777, p: 55 });
        map.getItem('xxx').should.deep.equal({ d: 'test', k: 'xxx', p: 77 });
    });
    
});

