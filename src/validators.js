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

module.exports = {
    isRequired,
    isRequiredIfPresent
};
