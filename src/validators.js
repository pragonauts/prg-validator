/*
 * @author David Menger
 */
'use strict';

function isRequired (val) {
    return val !== null && val !== undefined && `${val}`.trim().length !== 0;
}

function isRequiredIfPresent (val) {
    return typeof val === 'undefined' || (val !== null && `${val}`.trim().length !== 0);
}

function fileMaxLength (file, maxLength) {
    return typeof file === 'object' && file.size <= maxLength;
}

function fileMime (file, allowedMimeTypes) {
    return allowedMimeTypes
        .some(type => typeof file.type === 'string' && file.type.match(type));
}

function fileData (input) {
    // pass on browser
    if (typeof File !== 'undefined') {
        return input;
    }
    // extract data on server
    if (typeof input === 'object' && typeof input.data !== 'undefined') {
        return input.data;
    }
    return null;
}

module.exports = {
    isRequired,
    isRequiredIfPresent,
    fileMaxLength,
    fileMime,
    fileData
};
