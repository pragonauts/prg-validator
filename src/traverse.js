/**
 * @author David Menger
 */
'use strict';

function traverse (obj, callback, path = '') {
    // property[].item
    if (Array.isArray(obj)) {
        // array is returned, when value is found
        return Promise.all(obj.map(val => traverse(val, callback, `${path}[]`)))
            .then(results => results.filter(val => typeof val !== 'undefined'));
    } else if (typeof obj === 'object') {
        // only defined keys are returned
        const keys = Object.keys(obj);
        return Promise.all(keys
            .map(key => traverse(obj[key], callback, `${path}.${key}`)))
            .then((results) => {
                const ret = {};
                let empty = true;
                keys.forEach((key, i) => {
                    const val = results[i];
                    if (typeof val !== 'undefined') {
                        ret[key] = val;
                        empty = false;
                    }
                });
                return empty && path !== '' ? undefined : ret;
            });
    }

    return callback(path, obj);
}

module.exports = traverse;
