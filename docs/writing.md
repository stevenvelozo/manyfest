# Writing Values to Objects

Manyfest provides safe, address-based value assignment that automatically creates intermediate objects and arrays as needed. Write to any depth in an object without manually building the path.

## Access

```javascript
const libManyfest = require('manyfest');

// Create a manifest (schema optional for write operations)
const manifest = new libManyfest();

// Or with a schema definition
const manifest = new libManyfest({
    Scope: 'User',
    Descriptors: {
        'Name': { Hash: 'name', DataType: 'String' },
        'Profile.Email': { Hash: 'email', DataType: 'String' }
    }
});
```

## Core Concepts

### Automatic Structure Creation

When setting a value at a nested address, manyfest creates any intermediate objects that do not yet exist:

```javascript
const data = {};

manifest.setValueAtAddress(data, 'user.profile.name', 'Alice');
// data is now: { user: { profile: { name: 'Alice' } } }
```

No need to manually initialize `data.user` or `data.user.profile` first.

## Setting Values

### setValueAtAddress

Set a value at any depth using a dot-notation address:

```javascript
const data = {};

manifest.setValueAtAddress(data, 'name', 'Alice');
// { name: 'Alice' }

manifest.setValueAtAddress(data, 'profile.age', 30);
// { name: 'Alice', profile: { age: 30 } }

manifest.setValueAtAddress(data, 'profile.address.city', 'Portland');
// { name: 'Alice', profile: { age: 30, address: { city: 'Portland' } } }
```

Returns `true` if the value was set successfully, `false` otherwise.

### setValueByHash

Set a value using a hash rather than a direct address. When descriptors define hash-to-address mappings, this lets you use friendly short names:

```javascript
const manifest = new libManyfest({
    Scope: 'Animal',
    Descriptors: {
        'MedicalStats.Temps.CET': { Hash: 'ComfET', DataType: 'Float' },
        'MedicalStats.Temps.MaxET': { Hash: 'MaxET', DataType: 'Float' }
    }
});

const animal = {};

manifest.setValueByHash(animal, 'ComfET', 98.6);
manifest.setValueByHash(animal, 'MaxET', 104.2);
// animal is now: { MedicalStats: { Temps: { CET: 98.6, MaxET: 104.2 } } }
```

If the hash is not found in the descriptor table, manyfest treats it as a direct address and sets the value that way.

### Overwriting Existing Values

Setting a value at an address that already contains data replaces it:

```javascript
const data = { color: 'blue' };

manifest.setValueAtAddress(data, 'color', 'red');
// { color: 'red' }
```

Nested values work the same way:

```javascript
const data = { user: { name: 'Alice' } };

manifest.setValueAtAddress(data, 'user.name', 'Bob');
// { user: { name: 'Bob' } }
```

## Array Assignment

Set values at specific array indices using bracket notation:

```javascript
const data = { items: [] };

manifest.setValueAtAddress(data, 'items[0]', 'first');
manifest.setValueAtAddress(data, 'items[1]', 'second');
manifest.setValueAtAddress(data, 'items[2]', 'third');
// data.items is ['first', 'second', 'third']
```

Nested array elements work as expected:

```javascript
const data = { users: [{ name: 'Alice' }, { name: 'Bob' }] };

manifest.setValueAtAddress(data, 'users[0].score', 95);
manifest.setValueAtAddress(data, 'users[1].score', 88);
// data.users is [{ name: 'Alice', score: 95 }, { name: 'Bob', score: 88 }]
```

## Boxed Properties

Write to properties with special characters in their keys using bracket notation with quotes:

```javascript
const data = {};

manifest.setValueAtAddress(data, '["my-special-key"]', 'value1');
manifest.setValueAtAddress(data, 'nested["some.dotted.key"]', 'value2');
// data is: { 'my-special-key': 'value1', nested: { 'some.dotted.key': 'value2' } }
```

## Populating Defaults

### populateDefaults

Fill in default values for any descriptor that defines a `Default` property, without overwriting existing data:

```javascript
const manifest = new libManyfest({
    Scope: 'Settings',
    Descriptors: {
        'Theme': { DataType: 'String', Default: 'dark' },
        'FontSize': { DataType: 'Integer', Default: 14 },
        'Language': { DataType: 'String', Default: 'en' }
    }
});

const settings = { Theme: 'light' };

manifest.populateDefaults(settings);
// settings is now: { Theme: 'light', FontSize: 14, Language: 'en' }
// Theme was not overwritten because it already existed
```

Pass `true` as the second argument to overwrite existing properties:

```javascript
manifest.populateDefaults(settings, true);
// settings is now: { Theme: 'dark', FontSize: 14, Language: 'en' }
// Theme was overwritten to its default
```

### populateObject

Populate all values based on the schema, using type defaults even when no explicit `Default` is defined:

```javascript
const manifest = new libManyfest({
    Scope: 'Record',
    Descriptors: {
        'Name': { DataType: 'String' },
        'Count': { DataType: 'Integer' },
        'Active': { DataType: 'Boolean' },
        'Tags': { DataType: 'Array' }
    }
});

const record = manifest.populateObject({});
// record is: { Name: '', Count: 0, Active: false, Tags: [] }
```

A filter function can be passed to selectively populate:

```javascript
const record = manifest.populateObject({}, false,
    (pDescriptor) => { return pDescriptor.DataType === 'String'; }
);
// Only String-typed descriptors are populated
```

## Deleting Values

### deleteValueAtAddress

Remove a value at an address:

```javascript
const data = { user: { name: 'Alice', age: 30 } };

manifest.deleteValueAtAddress(data, 'user.age');
// data is now: { user: { name: 'Alice' } }
```

### deleteValueByHash

The hash-based equivalent:

```javascript
manifest.deleteValueByHash(data, 'email');
```

## Use Cases

### Building Objects from Flat Data

```javascript
function buildUserFromForm(formFields) {
    const manifest = new libManyfest();
    const user = {};

    for (let tmpField of formFields) {
        manifest.setValueAtAddress(user, tmpField.path, tmpField.value);
    }

    return user;
}

const fields = [
    { path: 'name.first', value: 'Alice' },
    { path: 'name.last', value: 'Smith' },
    { path: 'contact.email', value: 'alice@example.com' },
    { path: 'contact.phone', value: '555-1234' }
];

buildUserFromForm(fields);
// { name: { first: 'Alice', last: 'Smith' }, contact: { email: 'alice@example.com', phone: '555-1234' } }
```

### Data Transformation

```javascript
function transformData(source, mappings) {
    const manifest = new libManyfest();
    const result = {};

    for (let [targetPath, sourcePath] of Object.entries(mappings)) {
        let value = manifest.getValueAtAddress(source, sourcePath);
        if (value !== undefined) {
            manifest.setValueAtAddress(result, targetPath, value);
        }
    }

    return result;
}

const apiData = {
    data: { user: { display_name: 'Alice', contact: { primary_email: 'alice@example.com' } } }
};

transformData(apiData, {
    'userName': 'data.user.display_name',
    'userEmail': 'data.user.contact.primary_email'
});
// { userName: 'Alice', userEmail: 'alice@example.com' }
```

### Initializing Records with Schema Defaults

```javascript
const invoiceManifest = new libManyfest({
    Scope: 'Invoice',
    Descriptors: {
        'InvoiceNumber': { DataType: 'String', Default: '' },
        'Status': { DataType: 'String', Default: 'draft' },
        'LineItems': { DataType: 'Array', Default: [] },
        'Total': { DataType: 'Float', Default: 0.0 },
        'Metadata.CreatedBy': { DataType: 'String', Default: 'system' }
    }
});

function createNewInvoice() {
    return invoiceManifest.populateDefaults({});
}

createNewInvoice();
// { InvoiceNumber: '', Status: 'draft', LineItems: [], Total: 0, Metadata: { CreatedBy: 'system' } }
```

## Notes

- Non-existent intermediate objects are created automatically during write operations
- Setting a value at an address where an intermediate path resolves to a non-object (e.g. a string) will not overwrite that value
- Array indices use bracket notation: `items[0]`
- `populateDefaults` does not overwrite existing properties unless the second argument is `true`
- `populateObject` without a filter populates every descriptor in the schema
- Paths are case-sensitive
