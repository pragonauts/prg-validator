/*
 * @author David Menger
 */
'use strict';


function appendInObject (obj, key, res, nextPath) {

    let finalObj;
    let finalKey;

    if (nextPath) {
        const chain = nextPath.split('.');
        chain.unshift(key);
        finalKey = chain.pop();

        finalObj = chain.reduce((o, attr) => {
            if (typeof o[attr] === 'undefined') {
                Object.assign(o, { [attr]: {} });
            }
            return o[attr];
        }, obj);
    } else {
        finalKey = key;
        finalObj = obj;
    }

    finalObj[finalKey] = res;
}


function recursive (
        promiseCollector,
        path,
        fn,
        dataObject = {},
        obj = {},
        stackPath = '',
        setVal = undefined) {

    const [, key, isArray, nextPath] = path.match(/^([^.[\]]+)(\[])?\.?(.*)$/);

    if (isArray) {
        if (Array.isArray(dataObject[key])) {
            if (typeof obj[key] === 'undefined') {
                Object.assign(obj, { [key]: [] });
            }
            dataObject[key].forEach((val, i) => {
                if (typeof obj[key][i] === 'undefined') {
                    Object.assign(obj[key], { [i]: {} });
                }
                if (nextPath && typeof val === 'object') {
                    const currentPath = `${stackPath}${key}[${i}].`;
                    recursive(promiseCollector, nextPath, fn, val, obj[key][i], currentPath);
                } else if (!nextPath) {
                    const p = Promise.resolve(fn(val, `${stackPath}${key}[${i}]`))
                        .then(res => Object.assign(obj[key], { [i]: res }));

                    promiseCollector.push(p);
                }
            });
        }
        return;
    } else if (typeof dataObject[key] !== 'object' || !nextPath) {
        if (nextPath && nextPath.match(/\[]/)) {
            return;
        }
        const p = Promise.resolve(fn(dataObject[key], `${stackPath}${key}`))
            .then((res) => {
                if (res === undefined) {
                    return;
                }

                appendInObject(obj, key, res, nextPath);
            });
        promiseCollector.push(p);
        return;
    }
    if (typeof obj[key] === 'undefined') {
        Object.assign(obj, { [key]: {} });
    }
    const currentPath = `${stackPath}${key}.`;
    recursive(promiseCollector, nextPath, fn, dataObject[key], obj[key], currentPath, setVal);
}

class DotNotation {

    constructor (data, catchAll = false, output = {}) {
        this.output = output;
        this.data = data;
        this._promise = catchAll ? null : Promise.resolve();
        this._collector = [];
        this.errors = [];
    }

    map (property, func) {
        if (this._promise) {
            this._promise = this._promise.then(() => {
                const collector = [];
                recursive(collector, property, func, this.data, this.output);
                return Promise.all(collector);
            });
        } else {
            const collector = [];
            recursive(collector, property, func, this.data, this.output);
            const catched = collector.map(promise => promise.catch(e => this.errors.push(e)));
            this._collector.push(Promise.all(catched));
        }
        return this;
    }
    promise () {
        return (this._promise || Promise.all(this._collector))
            .catch(e => this.errors.push(e))
            .then(() => {
                if (this.errors.length !== 0) {
                    throw this._promise ? this.errors[0] : this.errors;
                }
                return this.output;
            });
    }
    then (fn) {
        return this.promise()
            .then(fn);
    }
}

function dotNotation (dataObject, catchAll = false, createObject = {}) {
    return new DotNotation(dataObject, catchAll, createObject);
}

module.exports = dotNotation;
