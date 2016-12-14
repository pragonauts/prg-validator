# Pragonauts Isomorphic Validator

Node.js/Browser validation utility, which allows us to use single validator across multiple endpoints. Uses (npm/validator)[https://www.npmjs.com/package/validator] rules.

```javascript
const Validator = require('prg-validator');


class UserValidator extends Validator {

    constructor () {

        super();

        this.CONTEXT_REGISTER_WITH_PASSWORD = 'registerWithPassword';

        this.CONTEXT_CREATE = 'create';

        this.CONTEXT_UPDATE = 'update';

        this.add('email')
            .if([this.CONTEXT_REGISTER_WITH_PASSWORD, this.CONTEXT_CREATE])
                .isRequired('Email is required')
            .endIf()
            .isEmail('The email has to be valid');

        this.add('username')
            .if([this.CONTEXT_CREATE])
                .isRequired('The username is required')
            .endIf()
            .is('isLength', 'The username has to be at least 1 character long.', {
                min: 1
            });

        this.add('password')
            .if([
                this.CONTEXT_REGISTER_WITH_PASSWORD,
                this.CONTEXT_SET_PASSWORD,
                this.CONTEXT_CREATE
            ])
                .isRequired('Password is required')
            .endIf()
            .if(val => val)
                .is('isLength', 'The password has to be at least 7 characters long.', { min: 7 })
            .endIf();
    }

}

const catchAllErrors = false;
const validator = new UserValidator();

validator.validate({ email: 'ab' }, validator.CONTEXT_UPDATE, catchAllErrors)
    .then((validData) => {
        // successful validation, data are filtered
    })
    .catch((e) => {
        // e instanceof ValidationError, or ValidationError[] when catchAllErrors is true
    });
```

-----------------

# API
## Classes

<dl>
<dt><a href="#ValidationError">ValidationError</a></dt>
<dd></dd>
<dt><a href="#Validator">Validator</a></dt>
<dd></dd>
<dt><a href="#Rule">Rule</a></dt>
<dd></dd>
<dt><a href="#Rule">Rule</a></dt>
<dd></dd>
</dl>

<a name="ValidationError"></a>

## ValidationError
**Kind**: global class  

* [ValidationError](#ValidationError)
    * [.message](#ValidationError+message)
    * [.property](#ValidationError+property)
    * [.type](#ValidationError+type)

<a name="ValidationError+message"></a>

### validationError.message
**Kind**: instance property of <code>[ValidationError](#ValidationError)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | validator message |

<a name="ValidationError+property"></a>

### validationError.property
**Kind**: instance property of <code>[ValidationError](#ValidationError)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| property | <code>string</code> | name of the property |

<a name="ValidationError+type"></a>

### validationError.type
**Kind**: instance property of <code>[ValidationError](#ValidationError)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | validator name (or function) |

<a name="Validator"></a>

## Validator
**Kind**: global class  

* [Validator](#Validator)
    * [new Validator()](#new_Validator_new)
    * [.add(property)](#Validator+add) ⇒ <code>[Rule](#Rule)</code>
    * [.validateProp(property, value, [catchAllErrors], [data])](#Validator+validateProp) ⇒ <code>Promise</code>
    * [.validate(data, [context], [catchAllErrors])](#Validator+validate) ⇒ <code>Promise.&lt;object&gt;</code>

<a name="new_Validator_new"></a>

### new Validator()
Single entity validator. Just extend this class

<a name="Validator+add"></a>

### validator.add(property) ⇒ <code>[Rule](#Rule)</code>
Add another property to validate

**Kind**: instance method of <code>[Validator](#Validator)</code>  

| Param | Type | Description |
| --- | --- | --- |
| property | <code>string</code> | name of the property |

<a name="Validator+validateProp"></a>

### validator.validateProp(property, value, [catchAllErrors], [data]) ⇒ <code>Promise</code>
Validate single property

**Kind**: instance method of <code>[Validator](#Validator)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| property | <code>string</code> |  | name of property |
| value | <code>any</code> |  |  |
| [catchAllErrors] | <code>boolean</code> | <code>false</code> | stop on first error or return all found errors |
| [data] | <code>object</code> | <code>{}</code> | other data to use for conditions |

<a name="Validator+validate"></a>

### validator.validate(data, [context], [catchAllErrors]) ⇒ <code>Promise.&lt;object&gt;</code>
**Kind**: instance method of <code>[Validator](#Validator)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>object</code> |  |  |
| [context] | <code>string</code> | <code>null</code> | name of validation context, which limits validaton |
| [catchAllErrors] | <code>boolean</code> | <code>false</code> | stop on first error or return all found errors |

<a name="Rule"></a>

## Rule
**Kind**: global class  

* [Rule](#Rule)
    * [new Rule()](#new_Rule_new)
    * [new Rule(rules)](#new_Rule_new)
    * [.is(action, [message], [...args])](#Rule+is) ⇒ <code>this</code>
    * [.to(action, [...args])](#Rule+to) ⇒ <code>this</code>
    * [.if(action)](#Rule+if) ⇒ <code>this</code>
    * [.endIf()](#Rule+endIf) ⇒ <code>this</code>
    * [.default(value)](#Rule+default) ⇒ <code>this</code>
    * [.contains(string, [message])](#Rule+contains) ⇒ <code>this</code>
    * [.isNumeric([message])](#Rule+isNumeric) ⇒ <code>this</code>
    * [.isEmail([message])](#Rule+isEmail) ⇒ <code>this</code>
    * [.isRequired([message])](#Rule+isRequired) ⇒ <code>this</code>
    * [.toInt([message])](#Rule+toInt) ⇒ <code>this</code>
    * [.toBoolean([message])](#Rule+toBoolean) ⇒ <code>this</code>

<a name="new_Rule_new"></a>

### new Rule()
Single attribute rule contructor

<a name="new_Rule_new"></a>

### new Rule(rules)
Creates an instance of Rule.


| Param | Type |
| --- | --- |
| rules | <code>Array.&lt;object&gt;</code> | 

<a name="Rule+is"></a>

### rule.is(action, [message], [...args]) ⇒ <code>this</code>
Add any validator to rule

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| action | <code>string</code> &#124; <code>function</code> |  | name of the validator |
| [message] | <code>any</code> | <code></code> | error message |
| [...args] | <code>any</code> |  | arguments to pass to the validator |

**Example**  
```javascript
validator.add('property')
    .is(value => value.match(/xy/))
```
<a name="Rule+to"></a>

### rule.to(action, [...args]) ⇒ <code>this</code>
Adds sanitizer (filter) which converts value to different type

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> &#124; <code>function</code> |  |
| [...args] | <code>any</code> | arguments to pass to the validator |

**Example**  
```javascript
validator.add('property')
    .to(value => parseInt(value, 10));
```
<a name="Rule+if"></a>

### rule.if(action) ⇒ <code>this</code>
Adds confition. It can filter validators by context or with custom function

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> &#124; <code>array</code> &#124; <code>function</code> | context name, array of context names or function |

**Example**  
```javascript
validator.add('property')
    .if((value, data, context) => data.otherProperty)
        .isRequire('Should be filled')
    .endIf();
```
<a name="Rule+endIf"></a>

### rule.endIf() ⇒ <code>this</code>
Ends condition

**Kind**: instance method of <code>[Rule](#Rule)</code>  
<a name="Rule+default"></a>

### rule.default(value) ⇒ <code>this</code>
Sets default value, when item is not filled. Empty string is considered as a value.

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type |
| --- | --- |
| value | <code>any</code> | 

<a name="Rule+contains"></a>

### rule.contains(string, [message]) ⇒ <code>this</code>
Searches for occourence of the string

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| string | <code>string</code> |  | 
| [message] | <code>string</code> | <code>null</code> | 

<a name="Rule+isNumeric"></a>

### rule.isNumeric([message]) ⇒ <code>this</code>
Input shoud be numeric

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [message] | <code>string</code> | <code>null</code> | 

<a name="Rule+isEmail"></a>

### rule.isEmail([message]) ⇒ <code>this</code>
Input should be the email

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [message] | <code>string</code> | <code>null</code> | 

<a name="Rule+isRequired"></a>

### rule.isRequired([message]) ⇒ <code>this</code>
Input is required

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [message] | <code>string</code> | <code>null</code> | 

<a name="Rule+toInt"></a>

### rule.toInt([message]) ⇒ <code>this</code>
Makes the integer from an input

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [message] | <code>string</code> | <code>null</code> | 

<a name="Rule+toBoolean"></a>

### rule.toBoolean([message]) ⇒ <code>this</code>
Makes the boolean from an input

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [message] | <code>string</code> | <code>null</code> | 

<a name="Rule"></a>

## Rule
**Kind**: global class  

* [Rule](#Rule)
    * [new Rule()](#new_Rule_new)
    * [new Rule(rules)](#new_Rule_new)
    * [.is(action, [message], [...args])](#Rule+is) ⇒ <code>this</code>
    * [.to(action, [...args])](#Rule+to) ⇒ <code>this</code>
    * [.if(action)](#Rule+if) ⇒ <code>this</code>
    * [.endIf()](#Rule+endIf) ⇒ <code>this</code>
    * [.default(value)](#Rule+default) ⇒ <code>this</code>
    * [.contains(string, [message])](#Rule+contains) ⇒ <code>this</code>
    * [.isNumeric([message])](#Rule+isNumeric) ⇒ <code>this</code>
    * [.isEmail([message])](#Rule+isEmail) ⇒ <code>this</code>
    * [.isRequired([message])](#Rule+isRequired) ⇒ <code>this</code>
    * [.toInt([message])](#Rule+toInt) ⇒ <code>this</code>
    * [.toBoolean([message])](#Rule+toBoolean) ⇒ <code>this</code>

<a name="new_Rule_new"></a>

### new Rule()
Single attribute rule contructor

<a name="new_Rule_new"></a>

### new Rule(rules)
Creates an instance of Rule.


| Param | Type |
| --- | --- |
| rules | <code>Array.&lt;object&gt;</code> | 

<a name="Rule+is"></a>

### rule.is(action, [message], [...args]) ⇒ <code>this</code>
Add any validator to rule

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| action | <code>string</code> &#124; <code>function</code> |  | name of the validator |
| [message] | <code>any</code> | <code></code> | error message |
| [...args] | <code>any</code> |  | arguments to pass to the validator |

**Example**  
```javascript
validator.add('property')
    .is(value => value.match(/xy/))
```
<a name="Rule+to"></a>

### rule.to(action, [...args]) ⇒ <code>this</code>
Adds sanitizer (filter) which converts value to different type

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> &#124; <code>function</code> |  |
| [...args] | <code>any</code> | arguments to pass to the validator |

**Example**  
```javascript
validator.add('property')
    .to(value => parseInt(value, 10));
```
<a name="Rule+if"></a>

### rule.if(action) ⇒ <code>this</code>
Adds confition. It can filter validators by context or with custom function

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> &#124; <code>array</code> &#124; <code>function</code> | context name, array of context names or function |

**Example**  
```javascript
validator.add('property')
    .if((value, data, context) => data.otherProperty)
        .isRequire('Should be filled')
    .endIf();
```
<a name="Rule+endIf"></a>

### rule.endIf() ⇒ <code>this</code>
Ends condition

**Kind**: instance method of <code>[Rule](#Rule)</code>  
<a name="Rule+default"></a>

### rule.default(value) ⇒ <code>this</code>
Sets default value, when item is not filled. Empty string is considered as a value.

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type |
| --- | --- |
| value | <code>any</code> | 

<a name="Rule+contains"></a>

### rule.contains(string, [message]) ⇒ <code>this</code>
Searches for occourence of the string

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| string | <code>string</code> |  | 
| [message] | <code>string</code> | <code>null</code> | 

<a name="Rule+isNumeric"></a>

### rule.isNumeric([message]) ⇒ <code>this</code>
Input shoud be numeric

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [message] | <code>string</code> | <code>null</code> | 

<a name="Rule+isEmail"></a>

### rule.isEmail([message]) ⇒ <code>this</code>
Input should be the email

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [message] | <code>string</code> | <code>null</code> | 

<a name="Rule+isRequired"></a>

### rule.isRequired([message]) ⇒ <code>this</code>
Input is required

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [message] | <code>string</code> | <code>null</code> | 

<a name="Rule+toInt"></a>

### rule.toInt([message]) ⇒ <code>this</code>
Makes the integer from an input

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [message] | <code>string</code> | <code>null</code> | 

<a name="Rule+toBoolean"></a>

### rule.toBoolean([message]) ⇒ <code>this</code>
Makes the boolean from an input

**Kind**: instance method of <code>[Rule](#Rule)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [message] | <code>string</code> | <code>null</code> | 

