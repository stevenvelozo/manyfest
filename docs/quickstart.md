# Quickstart

Get up and running with manyfest in under five minutes. This guide covers installation, basic schema definition, and the most common operations.

## Installation

```bash
npm install manyfest
```

## Your First Manifest

A manifest describes the shape of your data. Create one by passing a scope and a set of descriptors:

```javascript
const libManyfest = require('manyfest');

const userManifest = new libManyfest({
    Scope: 'User',
    Descriptors: {
        'Name': { DataType: 'String', Required: true },
        'Email': { DataType: 'String', Required: true },
        'Profile.Age': { DataType: 'Integer' },
        'Profile.Bio': { DataType: 'String', Default: '' }
    }
});
```

The `Scope` is just a label for logging. Each key in `Descriptors` is an address -- a dot-notation path into your objects.

## Reading Values

Read from nested objects safely, without worrying about missing intermediate properties:

```javascript
const user = {
    Name: 'Alice',
    Email: 'alice@example.com',
    Profile: { Age: 30, Bio: 'Engineer' }
};

userManifest.getValueAtAddress(user, 'Profile.Age');   // 30
userManifest.getValueAtAddress(user, 'Profile.Bio');   // 'Engineer'
userManifest.getValueAtAddress(user, 'Profile.Phone'); // undefined (no error!)

// Read from an empty object -- returns the default if one is defined
userManifest.getValueAtAddress({}, 'Profile.Bio');     // '' (the Default)
```

## Writing Values

Write to any depth and manyfest creates the structure for you:

```javascript
const newUser = {};

userManifest.setValueAtAddress(newUser, 'Name', 'Bob');
userManifest.setValueAtAddress(newUser, 'Email', 'bob@example.com');
userManifest.setValueAtAddress(newUser, 'Profile.Age', 25);
userManifest.setValueAtAddress(newUser, 'Profile.Bio', 'Designer');

console.log(newUser);
// {
//   Name: 'Bob',
//   Email: 'bob@example.com',
//   Profile: { Age: 25, Bio: 'Designer' }
// }
```

No need to manually create `newUser.Profile = {}` first.

## Validating Objects

Check an object against its schema:

```javascript
const result = userManifest.validate({ Name: 'Carol' });

console.log(result);
// {
//   Error: true,
//   Errors: [
//     'Element at address "Email" is flagged REQUIRED but is not set in the object.'
//   ],
//   MissingElements: ['Email', 'Profile.Age', 'Profile.Bio']
// }
```

Validation never throws. Missing required elements produce entries in `Errors`. All missing elements (required or not) appear in `MissingElements`.

## Hash Shortcuts

Give an element a short hash to avoid typing long addresses:

```javascript
const manifest = new libManyfest({
    Scope: 'Config',
    Descriptors: {
        'Database.Connection.Host': { Hash: 'DBHost', DataType: 'String', Default: 'localhost' },
        'Database.Connection.Port': { Hash: 'DBPort', DataType: 'Integer', Default: 5432 }
    }
});

const config = {
    Database: { Connection: { Host: 'db.example.com', Port: 3306 } }
};

manifest.getValueByHash(config, 'DBHost');  // 'db.example.com'
manifest.getValueByHash(config, 'DBPort');  // 3306
```

## Populating Defaults

Fill in missing values from your schema:

```javascript
const record = { Name: 'Alice', Email: 'alice@example.com' };

userManifest.populateDefaults(record);
// record is now:
// {
//   Name: 'Alice',
//   Email: 'alice@example.com',
//   Profile: { Bio: '' }
// }
// Only 'Profile.Bio' was added because it has a Default defined.
// Existing values were not overwritten.
```

## Without a Schema

Manyfest works perfectly well without a pre-defined schema. Create an empty instance and use it purely for safe object navigation:

```javascript
const manifest = new libManyfest();

const data = { deeply: { nested: { value: 42 } } };

manifest.getValueAtAddress(data, 'deeply.nested.value');     // 42
manifest.getValueAtAddress(data, 'deeply.missing.value');    // undefined

manifest.setValueAtAddress(data, 'deeply.new.path', 'hello');
// data.deeply.new.path is now 'hello'
```

## Array Access

Access array elements with bracket notation:

```javascript
const manifest = new libManyfest();

const data = {
    users: [
        { name: 'Alice', role: 'admin' },
        { name: 'Bob', role: 'user' }
    ]
};

manifest.getValueAtAddress(data, 'users[0].name');   // 'Alice'
manifest.getValueAtAddress(data, 'users[1].role');   // 'user'
```

## Building Schemas Programmatically

Add descriptors one at a time if you don't have the full schema up front:

```javascript
const manifest = new libManyfest();
manifest.scope = 'Order';

manifest.addDescriptor('OrderID', { DataType: 'Integer', Required: true });
manifest.addDescriptor('Customer.Name', { DataType: 'String', Required: true });
manifest.addDescriptor('Customer.Email', { DataType: 'String' });
manifest.addDescriptor('Total', { DataType: 'Float', Default: 0.0 });

// Now use it just like a pre-defined manifest
const order = manifest.populateDefaults({});
// { Total: 0 }
```

## Serialization

Save and restore manifests:

```javascript
// Serialize to JSON string
const saved = userManifest.serialize();

// Deserialize later
const restored = new libManyfest();
restored.deserialize(saved);
```

## Next Steps

- [Reading Values](reading.md) -- full guide to address notation, defaults, array access, boxed properties, back-navigation and more
- [Writing Values](writing.md) -- setting values, populating defaults, deleting values
- [Validating Objects](validating.md) -- required fields, strict mode, data type checking
- [Schema Definition](schema.md) -- descriptors, data types, scope, and the full descriptor object
- [Address Notation](address-notation.md) -- the complete address syntax reference
- [Hash Translation](hash-translation.md) -- reusing schemas with different hash mappings
- [Schema Manipulation](schema-manipulation.md) -- remapping and merging schemas
