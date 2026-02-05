# Validating Objects

Manyfest validates objects against their schema definitions, checking for required elements, data type conformance, and missing properties. Validation never throws exceptions; results come back as well-formed JSON.

## Access

```javascript
const libManyfest = require('manyfest');

// Validation requires a schema with descriptors
const manifest = new libManyfest({
    Scope: 'Animal',
    Descriptors: {
        'IDAnimal': { Name: 'Database ID', DataType: 'Integer', Default: 0 },
        'Name': { Description: 'The animal species name.' },
        'Type': { Description: 'Whether the animal is wild, domesticated, etc.' }
    }
});
```

## Core Concepts

### Validation Results

The `validate` method returns a result object with three properties:

```javascript
{
    Error: null,        // null when valid, true when errors exist
    Errors: [],         // Array of human-readable error message strings
    MissingElements: [] // Array of addresses for elements not found in the object
}
```

A clean validation looks like this:

```javascript
const result = manifest.validate({ IDAnimal: 42, Name: 'Rabbit', Type: 'Wild' });
// { Error: null, Errors: [], MissingElements: [] }
```

## Validating an Object

### validate

Pass an object to check it against the schema:

```javascript
const manifest = new libManyfest({
    Scope: 'Animal',
    Descriptors: {
        'IDAnimal': { DataType: 'Integer', Required: true },
        'Name': { DataType: 'String' },
        'Weight': { DataType: 'Float' }
    }
});

const animal = { IDAnimal: 8675309, Name: 'BatBrains', Weight: 2.5 };
const result = manifest.validate(animal);
// { Error: null, Errors: [], MissingElements: [] }
```

### Non-Object Input

Passing a non-object produces an immediate error:

```javascript
const result = manifest.validate('not an object');
// { Error: true, Errors: ['Expected passed in object to be type object but was passed in string'], MissingElements: [] }
```

## Required Elements

Mark a descriptor as `Required: true` to produce an error when that property is missing:

```javascript
const manifest = new libManyfest({
    Scope: 'User',
    Descriptors: {
        'Email': { DataType: 'String', Required: true },
        'Name': { DataType: 'String', Required: true },
        'Bio': { DataType: 'String' }
    }
});

const user = { Email: 'alice@example.com' };
const result = manifest.validate(user);
// {
//   Error: true,
//   Errors: ['Element at address "Name" is flagged REQUIRED but is not set in the object.'],
//   MissingElements: ['Name', 'Bio']
// }
```

Note that `Bio` appears in `MissingElements` but not in `Errors` because it is not required.

## Strict Mode

When `strict` is enabled, every described element that is missing from the object becomes an error, regardless of the `Required` flag:

```javascript
const manifest = new libManyfest({
    Scope: 'Config',
    strict: true,
    Descriptors: {
        'Host': { DataType: 'String' },
        'Port': { DataType: 'Integer' },
        'Debug': { DataType: 'Boolean' }
    }
});

const config = { Host: 'localhost' };
const result = manifest.validate(config);
// {
//   Error: true,
//   Errors: [
//     'Element at address "Port" is flagged REQUIRED but is not set in the object.',
//     'Element at address "Debug" is flagged REQUIRED but is not set in the object.'
//   ],
//   MissingElements: ['Port', 'Debug']
// }
```

## Data Type Checking

When a descriptor specifies a `DataType`, the value is checked for type conformance.

### Supported Types

| DataType | Expected JavaScript Type | Notes |
|----------|------------------------|-------|
| String | `string` | |
| Number | `number` | Any numeric value |
| Integer | `number` | Must not contain a decimal point |
| Float | `number` | Any numeric value |
| PreciseNumber | `string` | A string that parses as a valid number |
| DateTime | any | Must be parsable by `new Date()` |

### Type Validation Examples

```javascript
const manifest = new libManyfest({
    Scope: 'Record',
    Descriptors: {
        'Name': { DataType: 'String' },
        'Count': { DataType: 'Integer' },
        'Price': { DataType: 'Float' },
        'Precision': { DataType: 'PreciseNumber' },
        'Created': { DataType: 'DateTime' }
    }
});
```

**Valid object:**

```javascript
manifest.validate({
    Name: 'Widget',
    Count: 10,
    Price: 19.99,
    Precision: '19.9900',
    Created: '2024-01-15T10:30:00Z'
});
// { Error: null, Errors: [], MissingElements: [] }
```

**Type mismatches:**

```javascript
manifest.validate({
    Name: 42,
    Count: 10.5,
    Price: 'free',
    Precision: 19.99,
    Created: 'not a date'
});
// Errors include:
//   'Element at address "Name" has a DataType String but is of the type number.'
//   'Element at address "Count" has a DataType Integer but has a decimal point in the number.'
//   'Element at address "Price" has a DataType Float but is of the type string.'
//   'Element at address "Precision" has a DataType PreciseNumber but is of the type number.'
//   'Element at address "Created" has a DataType DateTime but is not parsable as a Date by Javascript.'
```

### Integer vs Float

Both `Integer` and `Float` require a JavaScript `number` type. The distinction is that `Integer` additionally checks that the value does not contain a decimal point:

```javascript
const manifest = new libManyfest({
    Scope: 'Test',
    Descriptors: {
        'WholeNumber': { DataType: 'Integer' },
        'Decimal': { DataType: 'Float' }
    }
});

manifest.validate({ WholeNumber: 10, Decimal: 3.14 });
// No errors

manifest.validate({ WholeNumber: 10.5, Decimal: 3.14 });
// Error: 'Element at address "WholeNumber" has a DataType Integer but has a decimal point in the number.'
```

### PreciseNumber

The `PreciseNumber` type is for numeric values stored as strings to preserve precision (useful for financial calculations). Validation checks that the value is a `string` that matches a valid number pattern:

```javascript
const manifest = new libManyfest({
    Scope: 'Financial',
    Descriptors: {
        'Balance': { DataType: 'PreciseNumber' }
    }
});

manifest.validate({ Balance: '1234567890.12' });  // Valid
manifest.validate({ Balance: 'not a number' });   // Error: not a valid number
manifest.validate({ Balance: 1234.56 });           // Error: expects string type
```

### Unrecognized Data Types

If a `DataType` is specified but not recognized, it defaults to `String` checking:

```javascript
const manifest = new libManyfest({
    Scope: 'Test',
    Descriptors: {
        'Value': { DataType: 'CustomType' }
    }
});

manifest.validate({ Value: 'hello' });  // Valid (treated as String)
manifest.validate({ Value: 42 });       // Error (expected string)
```

## Nested Object Validation

Descriptors with dot-notation addresses validate nested properties:

```javascript
const manifest = new libManyfest({
    Scope: 'User',
    Descriptors: {
        'Profile.Name': { DataType: 'String', Required: true },
        'Profile.Age': { DataType: 'Integer' },
        'Contact.Email': { DataType: 'String', Required: true }
    }
});

const user = {
    Profile: { Name: 'Alice', Age: 30 },
    Contact: { Email: 'alice@example.com' }
};

manifest.validate(user);
// { Error: null, Errors: [], MissingElements: [] }
```

## Use Cases

### API Input Validation

```javascript
const requestManifest = new libManyfest({
    Scope: 'CreateUser',
    Descriptors: {
        'email': { DataType: 'String', Required: true },
        'password': { DataType: 'String', Required: true },
        'profile.displayName': { DataType: 'String', Required: true },
        'profile.age': { DataType: 'Integer' }
    }
});

function validateCreateUserRequest(requestBody) {
    let result = requestManifest.validate(requestBody);
    if (result.Error) {
        return { valid: false, errors: result.Errors };
    }
    return { valid: true };
}
```

### Configuration Verification

```javascript
const configManifest = new libManyfest({
    Scope: 'AppConfig',
    strict: true,
    Descriptors: {
        'Database.Host': { DataType: 'String' },
        'Database.Port': { DataType: 'Integer' },
        'Database.Name': { DataType: 'String' },
        'Server.Port': { DataType: 'Integer' },
        'Server.LogLevel': { DataType: 'String' }
    }
});

function verifyConfig(config) {
    let result = configManifest.validate(config);
    if (result.Error) {
        console.error('Configuration errors:', result.Errors);
        process.exit(1);
    }
    if (result.MissingElements.length > 0) {
        console.warn('Optional config missing:', result.MissingElements);
    }
}
```

### Schema Completeness Checks

Use `MissingElements` to identify which properties are absent, even when validation passes:

```javascript
const manifest = new libManyfest({
    Scope: 'Profile',
    Descriptors: {
        'Name': { DataType: 'String', Required: true },
        'Bio': { DataType: 'String' },
        'Avatar': { DataType: 'String' },
        'Website': { DataType: 'String' }
    }
});

const profile = { Name: 'Alice', Bio: 'Developer' };
const result = manifest.validate(profile);
// result.Error is null (no errors)
// result.MissingElements is ['Avatar', 'Website']

const completeness = 1 - (result.MissingElements.length / 4);
// 50% complete
```

## Notes

- Validation never throws exceptions; errors are returned as structured data
- `Error` is `null` when no errors exist, `true` when errors are present
- `MissingElements` tracks all absent schema elements, not just required ones
- In strict mode, every missing element is treated as an error
- Data type checking is case-insensitive (`"String"`, `"string"`, `"STRING"` all work)
- `undefined` values and non-existent properties are both treated as missing
- Unrecognized `DataType` values default to `String` validation
