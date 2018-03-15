
const OBJECTID_REGEX = /^[0-9a-fA-F]{24}$/;

const FORMATS = {
    "ObjectId": str => OBJECTID_REGEX.test(str)
};

function mergeDefinitions(name, parentDefinition, definition) {
    return Object.assign({
        description: definition.description || null,
        in: parentDefinition.in,
        path: (parentDefinition.path || []).concat([name]),
        pathToDefinition: parentDefinition.pathToDefinition
    }, definition);
}

/**
 * Validate the format of a value.
 * @param {string} name - The name of the value.
 * @param {Object} definition - A `{format, description, in, pathToDefinition}` object.
 * @param {string} value - The value to validate.
 * @returns {Object[]} - Array of errors.
 */
function validateFormat(name, definition, value) {
    const {format} = definition;
    const formatValidator = FORMATS[format];
    if(formatValidator && !formatValidator(value)) {
        return [{
            code: 'INVALID_REQUEST_PARAMETER',
            errors: [{
                code: 'INVALID_FORMAT',
                params: [format, value],
                message: `Object didn't pass validation for format ${format}: ${value}`,
                path: definition.in === 'body' ? (definition.path || []).concat(name) : [],
                description: definition.description
            }],
            in: definition.in, // TODO
            message: `Invalid parameter (${name}): Value failed JSON Schema validation`,
            name: name,
            path: definition.pathToDefinition
        }];
    }

    return [];
}

function validateObject(name, definition, properties, value) {
    return Object.keys(properties)
    .reduce((errors, prop) => {
        errors.push(...validate(
            prop,
            mergeDefinitions(name, definition, properties[prop]),
            value[prop]
        ));
        return errors;
    }, []);
}

function validateArray(name, definition, values) {
    const itemsDefinition = mergeDefinitions(name, definition, definition.items);
    return values.reduce((errors, value, index) => {
        errors.push(...validate(`${index}`, itemsDefinition, value));
    }, []);
}

function validate(name, definition, value) {
    if(definition.type === 'array') {
        return validateArray(name, definition, value);
    } else if(definition.schema) {
        return validateObject(name, definition, definition.schema.properties, value);
    } else if(definition.type === 'object') {
        return validateObject(name, definition, definition.properties, value);
    } else {
        return validateFormat(name, definition, value);
    }
}

module.exports = function custom_validators(fittingDef, bagpipes) { //eslint-disable-line no-unused-vars
    return function myFitting(context, cb) {
        const errors = [];
        const input = context.input;

        for(const param of Object.keys(input)) {
            const {parameterObject} = input[param];
            const definition = parameterObject.definitionFullyResolved || parameterObject.definition;
            const value = input[param].value;
            errors.push(...validate(param, definition, value));
        }

        if(errors.length) {
            const err = new Error('Validation errors');
            err.statusCode = 400;
            err.errors = errors;
            cb(err);
            return;
        }

        cb(null);
    };
};