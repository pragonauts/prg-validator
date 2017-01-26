/*
 * @author David Menger
 */
'use strict';

/**
 * Single attribute rule contructor
 *
 * @class Rule
 */
class Rule {

    /**
     * Creates an instance of Rule.
     *
     * @param {object[]} rules
     */
    constructor (rules) {
        this.rules = rules;
        this.stack = [];
    }

    /**
     * Add any validator to rule
     *
     * @param {string|function} action name of the validator
     * @param {any} [message=null] error message
     * @param {any} [args] arguments to pass to the validator
     * @returns {this}
     * @example
     * validator.add('property')
     *     .is(value => value.match(/xy/))
     *
     * @memberOf Rule
     */
    is (action, message) {
        this.rules.push({
            type: 'validator',
            action,
            message: message || null,
            args: Array.from(arguments).slice(2) // eslint-disable-line prefer-rest-params
        });
        return this;
    }

    /**
     * Adds sanitizer (filter) which converts value to different type
     *
     * @param {string|function} action
     * @param {any} [args] arguments to pass to the validator
     * @returns {this}
     * @example
     * validator.add('property')
     *     .to(value => parseInt(value, 10));
     *
     * @memberOf Rule
     */
    to (action) {
        this.rules.push({
            type: 'sanitizer',
            action,
            args: Array.from(arguments).slice(1) // eslint-disable-line prefer-rest-params
        });
        return this;
    }

    /**
     * Adds confition. It can filter validators by context or with custom function
     *
     * @param {string|array|function} action context name, array of context names or function
     * @returns {this}
     * @example
     * validator.add('property')
     *     .if((value, data, context) => data.otherProperty)
     *         .isRequire('Should be filled')
     *     .endIf();
     *
     * @memberOf Rule
     */
    if (action) {
        this.stack.push(this.rules);
        const rule = {
            type: 'condition',
            action,
            rules: []
        };
        this.rules.push(rule);
        this.rules = rule.rules;
        return this;
    }

    /**
     * Ends condition
     *
     * @returns {this}
     *
     * @memberOf Rule
     */
    endIf () {
        this.rules = this.stack.pop();
        return this;
    }

    /**
     * Sets default value, when item is not filled. Empty string is considered as a value.
     *
     * @param {any} value
     * @returns {this}
     *
     * @memberOf Rule
     */
    default (value) {
        this.rules.push({
            type: 'default',
            value
        });
        return this;
    }

    /**
     * Searches for occourence of the string
     *
     * @param {string} string
     * @param {string} [message=null]
     * @returns {this}
     *
     * @memberOf Rule
     */
    contains (string, message) {
        this.is('contains', message || null, string);
        return this;
    }

    /**
     * Input shoud be numeric
     *
     * @param {string} [message=null]
     * @returns {this}
     *
     * @memberOf Rule
     */
    isNumeric (message) {
        this.is('isNumeric', message || null);
        return this;
    }

    /**
     * Input should be the email
     *
     * @param {string} [message=null]
     * @returns {this}
     *
     * @memberOf Rule
     */
    isEmail (message) {
        this.is('isEmail', message || null);
        return this;
    }

    /**
     * Input is required
     *
     * @param {string} [message=null]
     * @returns {this}
     *
     * @memberOf Rule
     */
    isRequired (message) {
        this.is(':isRequired', message || null);
        return this;
    }

    /**
     * Input is required, only when atributte is not missing (not undefined)
     *
     * @param {string} [message=null]
     * @returns {this}
     *
     * @memberOf Rule
     */
    isRequiredIfPresent (message) {
        this.is(':isRequiredIfPresent', message || null);
        return this;
    }

    /**
     * Makes the integer from an input
     *
     * @param {string} [message=null]
     * @returns {this}
     *
     * @memberOf Rule
     */
    toInt (radix) {
        this.to('toInt', radix || 10);
        return this;
    }

    /**
     * Makes the boolean from an input
     *
     * @param {string} [message=null]
     * @returns {this}
     *
     * @memberOf Rule
     */
    toBoolean (strict) {
        this.to('toBoolean', !!strict);
        return this;
    }
}

module.exports = Rule;
