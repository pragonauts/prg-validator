/*
 * @author David Menger
 */
'use strict';

function isPromise (res) {
    return res && typeof res.then === 'function';
}

function iterate (then, iterator, value, stopOn = null) {
    if (stopOn !== null && value === stopOn) {
        return value;
    }

    if (iterator.array.length === 0) {
        return value;
    }

    const res = then(iterator.array[iterator.i], iterator.i, value);

    /* eslint no-param-reassign: 0 */
    iterator.i++;
    if (iterator.i >= iterator.array.length) {
        return res;
    }

    if (isPromise(res)) {
        return res.then(prev => iterate(then, iterator, prev));
    }

    return iterate(then, iterator, res);
}

function waitingIterator (array) {
    return {
        forEach (callback, previous) {
            return new Promise((resolve) => {
                const iterator = { i: 0, array };
                resolve(iterate(callback, iterator, previous));
            });
        },
        some (callback, stopOn) {
            return new Promise((resolve) => {
                const iterator = { i: 0, array };
                resolve(iterate(callback, iterator, !stopOn, stopOn));
            });
        }
    };
}

module.exports = waitingIterator;