import chai from 'chai';
import {LSArray} from '../src/ls-array';

let should = chai.should();

describe('# LSArray', () => {

    let arr;

    beforeEach(() => {
        localStorage.clear();
        arr = new LSArray('tmp');
    });

    it('len and prefix', () => {
        arr.push(42);
        arr.push('test');
        arr.len().should.equal(2);
        should.exist(localStorage.getItem('tmp|0'));
        should.exist(localStorage.getItem('tmp|1'));
        should.exist(localStorage.getItem('tmp|l'));
    });

    it('push and pop', () => {
        arr.push(42);
        arr.push('test');
        arr.pop().should.equal('test');
        arr.pop().should.equal('42');
        arr.len().should.equal(0);
    });

    it('get and set', () => {
        arr.push(1);
        arr.push(2);
        arr.getAt(0).should.equal('1');
        arr.getAt(1).should.equal('2');
        arr.setAt(0, 42);
        arr.getAt(0).should.equal('42');
        arr.len().should.equal(2);
    });

    it('len and clear', () => {
        for (let i = 0; i < 42; ++i) {
            arr.push(42);
            should.exist(localStorage.getItem('tmp|' + i));
        }
        arr.len().should.equal(42);
        arr.clear();
        arr.len().should.equal(0);
        for (let i = 0; i < 42; ++i) {
            should.not.exist(localStorage.getItem('tmp|' + i));
        }
    });

    it('out of range', () => {
        arr.push(42);
        arr.push('test');
        chai.expect(function () {
            arr.getAt(42);
        }).to.throw(RangeError);
        chai.expect(function () {
            arr.setAt(42, 42);
        }).to.throw(RangeError);
    });
});
