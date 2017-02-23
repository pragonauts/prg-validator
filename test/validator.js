/*
 * @author David Menger
 */
'use strict';

const Validator = require('../src/Validator');
const assert = require('assert');

describe('Validator', function () {

    it('should be able to make condition based asynchronous validation', function (done) {

        const validator = new Validator();

        validator.add('name')
            .contains('Foo')
            .is(s => typeof s === 'string');

        validator.add('array[].name')
            .isRequired();

        validator.add('array[].number')
            .isRequired()
            .isNumeric()
            .is(() => new Promise(r => setTimeout(() => r(true), 10)))
            .toInt();

        validator.add('array[].far.far.away')
            .default(13);

        validator.add('some')
            .if((val, data) => data.name === 'Foo') // just synchronous
                .isRequired();

        validator.add('nullValue') // numeric, but can be null
            .isNumeric();

        validator.add('undefinedValue') // numeric, but can be undefinedValue
            .isNumeric();

        validator.add('someFile')
            .toFileData();

        const SOMEFILE = {
            data: 'hello'
        };

        const data = {
            name: 'oFoo',
            nullValue: null,
            array: [
                { name: 'haha', number: '345', skip: 'yes' },
                { name: 'other', number: '3452', skip: 'yes', far: { far: { away: 15 } } }
            ],
            skipped: true,
            someFile: SOMEFILE
        };

        validator.validate(data)
            .then((res) => {
                assert.deepStrictEqual(res, {
                    name: 'oFoo',
                    array: [
                        { name: 'haha', number: 345, far: { far: { away: 13 } } },
                        { name: 'other', number: 3452, far: { far: { away: 15 } } }
                    ],
                    nullValue: null,
                    someFile: typeof File === 'undefined' ? SOMEFILE.data : SOMEFILE
                });
                done();
            })
            .catch(done);

    });

    it('should process empty value the same way - independent of count of rules', function (done) {

        const validator1 = new Validator();
        validator1.add('name')
            .if(val => val)
                .is(s => typeof s === 'string')
            .endIf();

        const validator2 = new Validator();
        validator2.add('name')
            .if(val => val)
                .is(s => typeof s === 'string')
            .endIf()
            .if(val => val)
                .is(s => typeof s === 'string')
            .endIf();


        const data = {};

        Promise.all([validator1.validate(data), validator2.validate(data)])
            .then((res) => {
                assert.deepStrictEqual(res[0], res[1]);
                done();
            })
            .catch(done);
    });

    it('should return all errors in nice format', function (done) {

        const validator = new Validator();

        validator.add('name')
            .if('badContext')
                .isNumeric('should not be proceeded')
                .endIf()
            .contains('Foo')
            .is(s => s === 'should fall', 'name should fail');

        validator.add('array[].name')
            .isRequired('array name should fail');

        validator.add('array[].number')
            .isRequired()
            .if('goodContext')
                .isNumeric('number should fail')
                .endIf()
            .is(() => new Promise(r => setTimeout(() => r(true), 10)))
            .toInt();

        validator.add('array[].def')
            .default(13);

        validator.add('some')
            .if((val, data) => data.name === 'Foo') // just synchronous
                .isRequired('should fail once');

        validator.add('nullValue')
            .isNumeric() // should not fall on isNumeric rule
            .isRequired('nullValue is required');

        validator.add('undefinedValue')
            .isNumeric() // should not fall on isNumeric rule
            .isRequired('undefinedValue is required');

        const data = {
            name: 'Foo',
            array: [
                { name: 'haha', number: 'ahoj', skip: 'yes' },
                { number: '3452z', skip: 'yes', def: 15 }
            ],
            skipped: true,
            nullValue: null
        };

        validator.validate(data, 'goodContext', true)
            .then(() => {
                done(new Error('should not proceed'));
            }).catch((e) => {
                assert.deepEqual(e, [
                    {
                        message: 'name should fail',
                        property: 'name',
                        type: 'validator function',
                        status: 400
                    }, {
                        message: 'array name should fail',
                        property: 'array[1].name',
                        type: ':isRequired',
                        status: 400
                    }, {
                        message: 'nullValue is required', // order can be changed
                        property: 'nullValue',
                        type: ':isRequired',
                        status: 400
                    }, {
                        message: 'undefinedValue is required', // order can be changed
                        property: 'undefinedValue',
                        type: ':isRequired',
                        status: 400
                    }, {
                        message: 'should fail once', // order can be changed
                        property: 'some',
                        type: ':isRequired',
                        status: 400
                    }, {
                        message: 'number should fail',
                        property: 'array[0].number',
                        type: 'isNumeric',
                        status: 400
                    }, {
                        message: 'number should fail',
                        property: 'array[1].number',
                        type: 'isNumeric',
                        status: 400
                    }]);
                done();
            }).catch(done);
    });


    it('should accept various attributes', function (done) {

        const validator = new Validator();

        validator.add('name')
            .if(false)
                .isNumeric('should not be proceeded')
                .endIf()
            .contains('Foo')
            .is(s => s === 'should fall', 'name should fail');

        validator.add('array[].name')
            .isRequired('array name should fail');

        validator.add('array[].number')
            .isRequired()
            .if(['goodContext'])
                .isNumeric()
                .endIf()
            .is(() => new Promise(r => setTimeout(() => r(true), 10)))
            .toInt();

        validator.add('array[].def')
            .default(13);

        validator.add('some')
            .if((val, data) => data.name === 'Foo') // just synchronous
                .is(() => false)
                .isRequired();

        validator.add('any')
            .if((val, data) => data.name === 'Foo') // just synchronous
                .is(() => false);

        validator.add('password')
            .is('isLength', 'The password should be at leas 7 characters long.', { min: 7 });

        validator.add('username')
            .is('isLength', 'The username should be at leas 5 characters long.', { min: 5 });

        const data = {
            name: 'Foo',
            any: 'Bar',
            password: '123456798',
            username: 'a1',
            array: [
                { name: 'haha', number: 'ahoj', skip: 'yes' },
                { number: '3452z', skip: 'yes', def: 15 }
            ],
            skipped: true
        };

        validator.validate(data, 'goodContext', true)
            .then(() => {
                done('should not proceed');
            }).catch((e) => {
                assert(typeof e[0].toString() === 'string');
                assert.deepEqual(e, [
                    {
                        message: 'name should fail',
                        property: 'name',
                        type: 'validator function',
                        status: 400
                    }, {
                        message: 'array name should fail',
                        property: 'array[1].name',
                        type: ':isRequired',
                        status: 400
                    }, {
                        message: 'The username should be at leas 5 characters long.',
                        property: 'username',
                        status: 400,
                        type: 'isLength'
                    }, {
                        message: 'Validation failed', // order can be changed
                        property: 'some',
                        type: ':isRequired',
                        status: 400
                    }, {
                        message: 'Validation failed',
                        property: 'any',
                        status: 400,
                        type: 'validator function'
                    }, {
                        message: 'Validation failed',
                        property: 'array[0].number',
                        type: 'isNumeric',
                        status: 400
                    }, {
                        message: 'Validation failed',
                        property: 'array[1].number',
                        type: 'isNumeric',
                        status: 400
                    }]);
                done();
            })
            .catch(done);
    });

    it('should throw an exception, when validator does not exist', function (done) {

        const validator = new Validator();

        validator.add('name')
            .if(['context'])
                .is(':foobar')
            .endIf();

        const data = { name: 1 };

        const res = validator.validate(data, 'context');

        res.then(() => {
            done(new Error('Should not pass'));
        })
        .catch((e) => {
            assert(e.message.match(/:foobar/));
            done();
        });
    });

    it('should skip items without context', function () {

        const validator = new Validator();

        validator.add('name')
            .if(['context'])
                .is(':foobar')
            .endIf();

        const data = { name: 1 };

        return validator.validate(data, 'other');
    });

    it('should skip items with semi-required validation', function (done) {
        const validator = new Validator();

        validator.add('semiRequired')
            .isRequiredIfPresent('RequiredPresent Message');

        validator.add('otherRequired')
            .isRequiredIfPresent('Another Required Message');

        validator.validate({ semiRequired: null }, null, true)
            .then(() => done('Should never been called'))
            .catch((errors) => {
                assert.deepEqual(errors, [{
                    message: 'RequiredPresent Message',
                    property: 'semiRequired',
                    type: ':isRequiredIfPresent',
                    status: 400
                }], 'Validation must be ok');
                done();
            })
            .catch(done);
    });

    it('should pass conditional data', function () {
        const validator = new Validator();

        validator.add('semiRequired')
            .if(['create'])
                .isRequired('Required')
            .endIf()
            .isRequiredIfPresent('RequiredPresent Message');

        return validator.validate({}, 'update', true);
    });


    it('has some working validators', function (done) {

        const validator = new Validator();

        validator.add('goodUrl')
            .isUrl('GOOD URL');

        validator.add('badUrl')
            .isUrl('BAD URL');

        validator.add('goodUrlWithProto')
            .isUrl('GOOD PROTO URL', { require_protocol: true });

        validator.add('badUrlWithProto')
            .isUrl('BAD PROTO URL', { require_protocol: true });

        validator.add('goodEmail')
            .isEmail('GOOD EMAIL');

        validator.add('badEmail')
            .isEmail('BAD EMAIL');

        validator.add('goodFiles[]')
            .isFileMime('Should have good mime', ['image/mime']);

        validator.add('goodFiles2')
            .isFileMime('Should have good mime', [/image/]);

        validator.add('badFiles')
            .isFileMime('Should have bad mime', ['image/mime']);

        validator.add('badFiles2[]')
            .isFileMime(null, [/image/]);

        validator.add('shortFiles1[]')
            .isFileMaxLength('Short', '1.5mb');

        validator.add('shortFiles2')
            .isFileMaxLength('Short', '1.5k');

        validator.add('shortFiles3')
            .isFileMaxLength('Short', 1024);

        validator.add('shortFiles4')
            .isFileMaxLength(null, '1024');

        validator.add('longFiles1[]')
            .isFileMaxLength('LONG 1', '1.5m');

        validator.add('longFiles2')
            .isFileMaxLength('LONG 2', '1.5kb');

        validator.add('longFiles3')
            .isFileMaxLength('LONG 3', 1024);

        validator.add('longFiles4')
            .isFileMaxLength(null, '1024');

        validator.validate({
            goodUrl: 'www.some.cz:304/dkkd?fpoi=1#hash',
            badUrl: 'urlWithoutHttp',
            goodUrlWithProto: 'https://www.some.cz:304/dkkd?fpoi=1#hash',
            badUrlWithProto: 'www.some.cz:304',
            goodEmail: 'mail@some.cz',
            badEmail: 'mail@domain',
            goodFiles: [{ type: 'image/mime' }],
            goodFiles2: { type: 'image/jpeg' },
            badFiles: { type: 'another/image' },
            badFiles2: [{ type: 'some/vide' }],
            shortFiles1: [{ size: 1048576 * 1.5 }],
            shortFiles2: { size: 1024 * 1.5 },
            shortFiles3: { size: 1024 },
            shortFiles4: { size: 1024 },
            longFiles1: [{ size: 1048577 * 1.5 }],
            longFiles2: { size: 1025 * 1.5 },
            longFiles3: { size: 1025 },
            longFiles4: { size: 1025 }
        }, null, true)
            .then(() => done('Should never been called'))
            .catch((errors) => {
                assert.deepEqual(errors, [
                    {
                        message: 'BAD URL',
                        property: 'badUrl',
                        type: 'isURL',
                        status: 400
                    },
                    {
                        message: 'BAD PROTO URL',
                        property: 'badUrlWithProto',
                        type: 'isURL',
                        status: 400
                    },
                    {
                        message: 'BAD EMAIL',
                        property: 'badEmail',
                        type: 'isEmail',
                        status: 400
                    },
                    {
                        message: 'Should have bad mime',
                        property: 'badFiles',
                        type: ':fileMime',
                        status: 400
                    },
                    {
                        message: 'Validation failed',
                        property: 'badFiles2[0]',
                        type: ':fileMime',
                        status: 400
                    },
                    {
                        message: 'LONG 1',
                        property: 'longFiles1[0]',
                        type: ':fileMaxLength',
                        status: 400
                    },
                    {
                        message: 'LONG 2',
                        property: 'longFiles2',
                        type: ':fileMaxLength',
                        status: 400
                    },
                    {
                        message: 'LONG 3',
                        property: 'longFiles3',
                        type: ':fileMaxLength',
                        status: 400
                    },
                    {
                        message: 'Validation failed',
                        property: 'longFiles4',
                        type: ':fileMaxLength',
                        status: 400
                    }
                ], 'Validation must be ok');
                done();
            })
            .catch(done);
    });

    it('should throw an exception, when validator does exists', function (done) {

        const validator = new Validator();

        validator.add('name')
            .if(['context'])
                .is('foobar')
            .endIf();

        validator.validateProp('nonexisting', 1, 'context')
            .then((res) => {
                assert.strictEqual(res, undefined);
            })
            .then(() => validator.validateProp('name', 1, 'context'))
            .then(() => {
                done(new Error('Should not pass'));
            })
            .catch((e) => {
                assert(e.message.match(/foobar/));
                done();
            });
    });

    it('should validate nice arrays', function (done) {

        const validator = new Validator();

        validator.add('name[]')
            .if(['context'])
                .is(v => v === 'bar')
            .endIf();

        validator.validateProp('name[1]', 'foo', 'context')
            .then(() => {
                done(new Error('Should not pass'));
            })
            .catch(() => {
                done();
            });
    });

});
