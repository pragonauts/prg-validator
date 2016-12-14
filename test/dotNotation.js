/*
 * @author David Menger
 */
'use strict';

const dotNotation = require('../src/dotNotation');
const assert = require('assert');
// this test is included also in karma, so there is sinon implicitly included
const sin = typeof sinon === 'undefined' ? require('sinon') : sinon; // eslint-disable-line

describe('dotNotation()', function () {

    describe('map()', function () {

        it('should replace the attribute', function () {
            const mapFn = sin.spy(() => 2);
            const input = { attribute: 1 };

            const ret = dotNotation(input)
                .map('attribute', mapFn);

            return ret.then((out) => {

                assert(ret.output !== input, 'should return new object');
                assert(mapFn.calledOnce, 'should call first object');
                assert.deepEqual(mapFn.firstCall.args, [1, 'attribute'], 'should be called with one');

                assert.deepEqual(out, { attribute: 2 });
            });
        });

        it('should replace the attribute in array', function () {
            const mapFn = sin.spy(() => 2);
            const input = { array: ['value', 'foo'] };

            const ret = dotNotation(input)
                .map('array[]', mapFn);

            return ret.then((out) => {

                assert(ret.output !== input, 'should return new object');
                assert(mapFn.calledTwice, 'should call first object');
                assert.deepEqual(mapFn.firstCall.args, ['value', 'array[0]'], 'should be called with one');
                assert.deepEqual(mapFn.secondCall.args, ['foo', 'array[1]'], 'should be called with one');

                assert.deepEqual(out, { array: [2, 2] });
            });
        });

        it('should replace objects in array', function () {
            const mapFn = sin.spy(() => 2);
            const input = { array: [{ value: 1 }, { value: 8 }] };

            const ret = dotNotation(input)
                .map('array[].value', mapFn);
            return ret.then((out) => {

                assert(ret.output !== input, 'should return new object');
                assert(mapFn.calledTwice, 'should call first object');
                assert.deepEqual(mapFn.firstCall.args, [1, 'array[0].value'], 'should be called with one');
                assert.deepEqual(mapFn.secondCall.args, [8, 'array[1].value'], 'should be called with one');

                assert.deepEqual(out, { array: [{ value: 2 }, { value: 2 }] });
            });
        });

        it('should clean unprovided attributes', function () {
            const mapFn = sin.spy(() => 2);
            const input = {
                array: [
                    { value: 1, missing: 2 },
                    { value: 8 }
                ],
                missing: 7
            };

            const ret = dotNotation(input)
                .map('attribute', mapFn);

            return ret.then((out) => {

                assert(ret.output !== input, 'should return new object');
                assert(mapFn.calledOnce, 'should call first object');
                assert.deepEqual(mapFn.firstCall.args, [undefined, 'attribute'], 'should be called with one');

                assert.deepEqual(out, { attribute: 2 });
            });
        });

        it('should clean unprovided attributes in array', function () {
            const mapFn = sin.spy(() => 2);
            const input = {
                array: [
                    { value: 1, missing: 2 },
                    { value: 8 }
                ],
                missing: 7
            };

            const ret = dotNotation(input)
                .map('array[].value', mapFn);

            return ret.then((out) => {
                assert(ret.output !== input, 'should return new object');
                assert(mapFn.calledTwice, 'should call first object');
                assert.deepEqual(mapFn.firstCall.args, [1, 'array[0].value'], 'should be called with one');
                assert.deepEqual(mapFn.secondCall.args, [8, 'array[1].value'], 'should be called with one');

                assert.deepEqual(out, { array: [{ value: 2 }, { value: 2 }] });
            });
        });

        it('should clean unprovided attributes in array', function () {
            const mapFn = sin.spy(() => 2);
            const mapFn2 = sin.spy(() => 1);

            const input = {
                array: [
                    { value: 1, missing: 2 },
                    { value: 8, bar: 2, foo: 1 }
                ],
                missing: 7
            };

            const ret = dotNotation(input)
                .map('array[].value', mapFn)
                .map('array[].foo', mapFn2);

            return ret.then((out) => {

                assert(ret.output !== input, 'should return new object');

                assert(mapFn.calledTwice, 'should call first object');
                assert.deepEqual(mapFn.firstCall.args, [1, 'array[0].value'], 'should be called with one');
                assert.deepEqual(mapFn.secondCall.args, [8, 'array[1].value'], 'should be called with one');

                assert(mapFn2.calledTwice, 'should call first object');
                assert.deepEqual(mapFn2.firstCall.args, [undefined, 'array[0].foo'], 'should be called with one');
                assert.deepEqual(mapFn2.secondCall.args, [1, 'array[1].foo'], 'should be called with one');

                assert.deepEqual(out, { array: [{ value: 2, foo: 1 }, { value: 2, foo: 1 }] });
            });
        });

    });

});
