/*
 * @author David Menger
 */
'use strict';

const Rule = require('./Rule');
const validator = require('validator');
const validators = require('./validators');
const waitingIterator = require('./waitingIterator');
const dotNotation = require('./dotNotation');

/**
 *
 *
 * @class ValidationError
 */
class ValidationError {
    constructor (def, property) {
        /**
         * @prop {string} message validator message
         */
        this.message = def.message || 'Validation failed';

        /**
         * @prop {string} property name of the property
         */
        this.property = property || null;

        /**
         * @prop {string} type validator name (or function)
         */
        this.type = typeof def.action === 'function' ? `${def.type} function` : def.action;
        this.status = 400;
    }

    toString () {
        return `${this.message}: ${this.property || ''} [${this.type}]`;
    }
}

function processPreviousValue (rules, i, returned, current, property) {
    // process previous value
    const prevDef = i > 0 ? rules[i - 1] : {};
    const isEmpty = returned === null || returned === undefined;
    switch (prevDef.type) {
        case 'validator':
            if ((isEmpty && prevDef.action === ':isRequired') || (!isEmpty && !returned)) {
                throw new ValidationError(prevDef, property);
            }
            return current;
        case 'sanitizer':
        case 'condition':
        case 'default':
            return returned;
        default:
            return current;
    }
}

function processCondition (def, val, data, context, nextFn) {
    switch (typeof def.action) {
        case 'function':
            if (!def.action(val, data, context)) {
                return val;
            }
            break;
        case 'string':
            if (def.action !== context) {
                return val;
            }
            break;
        case 'object': // array probably
            if (def.action.indexOf(context) === -1) {
                return val;
            }
            break;
        default:
            return val;
    }
    return nextFn();
}


function validateRules (rules, property, value, context, data, realPath) {
    let val = value;
    return waitingIterator(rules).forEach((def, i, previous) => {
        val = processPreviousValue(rules, i, previous, val, realPath || property);

        // process condition
        if (def.type === 'condition') {
            return processCondition(def, val, data, context,
                () => validateRules(def.rules, property, val, context, data, realPath));

        } else if (def.type === 'default') {
            if (val === undefined) {
                return def.value;
            }
            return val;

        } else if ((val === null || val === undefined) && def.action !== ':isRequired') {
            return val;
        }

        // resolve action
        let action;
        if (typeof def.action === 'string') {
            if (def.action.match(/^:/)) {
                const method = def.action.substring(1);
                if (typeof validators[method] !== 'function') {
                    throw new Error(`Validator ${def.action} not exists`);
                }

                action = validators[method].bind(validator);
            } else {
                if (typeof validator[def.action] !== 'function') {
                    throw new Error(`Validator ${def.action} not exists`);
                }

                action = validator[def.action].bind(validator);
            }

        } else {
            action = def.action.bind(def.action);
        }

        const args = def.args.slice();
        args.unshift(val);

        return action.apply(action, args);
    }).then(previous =>
        processPreviousValue(rules, rules.length, previous, val, realPath || property));
}

/**
 * Single entity validator. Just extend this class
 *
 * @class Validator
 */
class Validator {

    constructor () {
        this.rules = new Map();
    }

    /**
     * Add another property to validate
     *
     * @param {string} property name of the property
     * @returns {Rule}
     *
     * @memberOf Validator
     */
    add (property) {
        let rule = this.rules.get(property);

        if (!rule) {
            rule = [];
            this.rules.set(property, rule);
        }

        return new Rule(rule);
    }

    /**
     * Validate single property
     *
     * @param {string} property name of property
     * @param {any} value
     * @param {boolean} [catchAllErrors=false] stop on first error or return all found errors
     * @param {object} [data={}] other data to use for conditions
     * @returns {Promise}
     *
     * @memberOf Validator
     */
    validateProp (property, value, context, data) {
        const rules = this.rules.get(property);
        if (!rules) {
            return Promise.resolve(undefined);
        }

        return validateRules(rules, property, value, context || null, data || {});
    }

    /**
     *
     *
     * @param {object} data
     * @param {string} [context=null] name of validation context, which limits validaton
     * @param {boolean} [catchAllErrors=false] stop on first error or return all found errors
     * @returns {Promise.<object>}
     *
     * @memberOf Validator
     */
    validate (data, context, catchAllErrors) {
        const builder = dotNotation(data, catchAllErrors);
        const ctx = context || null;

        this.rules.forEach((rules, property) => builder.map(
            property,
            (value, realPath) => validateRules(rules, property, value, ctx, data, realPath)
        ));

        return builder.promise();
    }

}

module.exports = Validator;
