/*
 * @author David Menger
 */
'use strict';

function bytesFromString (maxLength) {
    if (typeof maxLength === 'number') {
        return maxLength;
    } else if (!maxLength) {
        return Number.MAX_VALUE;
    }

    if (maxLength.match(/^[1-9][0-9]*$/)) {
        return parseInt(maxLength, 10);
    }
    const match = maxLength.match(/^([0-9+]\.?[0-9]*)([mk])b?$/i);

    if (!match) {
        throw new Error('Invalid maxLength specification');
    }

    const k = match[2] === 'm' ? 1048576 : 1024;

    return k * parseFloat(match[1]);
}

module.exports = bytesFromString;
