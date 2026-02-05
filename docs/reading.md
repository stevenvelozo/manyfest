# Reading Values from Objects

Manyfest provides safe, flexible access to values within complex object structures using dot-notation address paths. No more chaining `&&` checks or catching exceptions from deeply nested property access.

## Access

```javascript
const libManyfest = require('manyfest');

// Create a manifest (schema optional for read operations)
const manifest = new libManyfest();

// Or with a schema definition
const manifest = new libManyfest({
    Scope: 'User',
    Descriptors: {
        'Name': { Hash: 'name', DataType: 'String' },
        'Profile.Email': { Hash: 'email', DataType: 'String', Default: 'none' }
    }
});
```

## Core Concepts

### Address Notation

Addresses use dot-separated paths to navigate nested objects:

```javascript
const data = {
    user: {
        profile: {
            name: 'Alice',
            scores: [95, 88, 72]
        }
    }
};

manifest.getValueAtAddress(data, 'user.profile.name');       // 'Alice'
manifest.getValueAtAddress(data, 'user.profile.scores');     // [95, 88, 72]
manifest.getValueAtAddress(data, 'user.profile.scores[1]');  // 88
```

Paths are case-sensitive and follow the exact structure of the object.

## Getting Values

### getValueAtAddress

Resolve a value at any depth using a dot-notation address:

```javascript
const data = { a: { b: { c: 'deep value' } } };

manifest.getValueAtAddress(data, 'a.b.c');     // 'deep value'
manifest.getValueAtAddress(data, 'a.b');        // { c: 'deep value' }
manifest.getValueAtAddress(data, 'a');           // { b: { c: 'deep value' } }
manifest.getValueAtAddress(data, 'x.y.z');      // undefined
```

When a descriptor exists for the address and defines a `Default` value, the default is returned instead of `undefined`:

```javascript
const manifest = new libManyfest({
    Scope: 'Config',
    Descriptors: {
        'Theme': { DataType: 'String', Default: 'light' }
    }
});

manifest.getValueAtAddress({}, 'Theme');  // 'light'
```

### getValueByHash

Retrieve a value using a hash rather than a direct address. When descriptors define hash-to-address mappings, this lets you use friendly short names:

```javascript
const manifest = new libManyfest({
    Scope: 'Animal',
    Descriptors: {
        'MedicalStats.Temps.CET': { Hash: 'ComfET', DataType: 'Float' },
        'MedicalStats.Temps.MaxET': { Hash: 'MaxET', DataType: 'Float' }
    }
});

const animal = {
    MedicalStats: {
        Temps: { CET: 98.6, MaxET: 104.2 }
    }
};

manifest.getValueByHash(animal, 'ComfET');  // 98.6
manifest.getValueByHash(animal, 'MaxET');   // 104.2
```

If the hash is not found in the descriptor table, manyfest treats it as a direct address and attempts resolution that way. This means `getValueByHash` works even without a schema defined.

### checkAddressExists

Check whether a value exists at an address without retrieving it:

```javascript
const data = { a: { b: 'value' } };

manifest.checkAddressExists(data, 'a.b');      // true
manifest.checkAddressExists(data, 'a.c');      // false
manifest.checkAddressExists(data, 'x.y.z');    // false
```

### checkAddressExistsByHash

The hash-based equivalent:

```javascript
manifest.checkAddressExistsByHash(data, 'ComfET');  // true or false
```

## Array Access

Access array elements with bracket notation:

```javascript
const data = {
    students: [
        { name: 'Alice', grade: 95 },
        { name: 'Bob', grade: 88 },
        { name: 'Carol', grade: 72 }
    ]
};

manifest.getValueAtAddress(data, 'students[0]');        // { name: 'Alice', grade: 95 }
manifest.getValueAtAddress(data, 'students[1].name');   // 'Bob'
manifest.getValueAtAddress(data, 'students[2].grade');  // 72
```

### Set Access

Empty brackets return the full array, optionally filtered:

```javascript
manifest.getValueAtAddress(data, 'students[]');
// Returns all student objects
```

## Boxed Properties

Properties with special characters in their keys (dots, spaces, dashes) can be accessed using bracket notation with quotes:

```javascript
const data = {
    'my-special-key': 'value1',
    'another key': 'value2',
    nested: {
        'some.dotted.key': 'value3'
    }
};

manifest.getValueAtAddress(data, '["my-special-key"]');            // 'value1'
manifest.getValueAtAddress(data, "['another key']");               // 'value2'
manifest.getValueAtAddress(data, 'nested["some.dotted.key"]');     // 'value3'
```

Single quotes, double quotes and backticks are all supported inside brackets.

## Back-Navigation

Navigate backward through the object hierarchy using `..` sequences:

```javascript
const data = {
    Bundle: {
        Contract: {
            IDContract: 500,
            Project: {
                IDProject: 42
            }
        }
    }
};

// From IDContract, go back up and into Project
manifest.getValueAtAddress(data, 'Bundle.Contract.IDContract...Project.IDProject');
// Navigates: IDContract -> back to Contract -> back to Bundle -> Project.IDProject
```

Each `.` in the `..` sequence navigates one level up from the current position.

## Object Set Access

Access properties across all keys of an object using `{}`:

```javascript
const data = {
    departments: {
        engineering: { budget: 50000 },
        marketing: { budget: 30000 },
        sales: { budget: 40000 }
    }
};

manifest.getValueAtAddress(data, 'departments{}.budget');
// Returns: { 'departments.engineering.budget': 50000, 'departments.marketing.budget': 30000, 'departments.sales.budget': 40000 }
```

## Function Resolution

Address paths can include function calls on the object:

```javascript
const data = {
    items: [3, 1, 4, 1, 5],
    getTotal: function() { return this.items.reduce((a, b) => a + b, 0); }
};

manifest.getValueAtAddress(data, 'getTotal()');  // 14
```

Functions can also receive arguments resolved from addresses:

```javascript
const data = {
    multiplier: 10,
    scale: function(value) { return value * this.multiplier; },
    baseValue: 5
};

manifest.getValueAtAddress(data, 'scale(baseValue)');  // 50
```

## Default Values

When a descriptor includes a `Default` property, that value is returned if the address resolves to `undefined`:

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

manifest.getValueAtAddress(settings, 'Theme');     // 'light' (exists in object)
manifest.getValueAtAddress(settings, 'FontSize');  // 14 (default)
manifest.getValueAtAddress(settings, 'Language');  // 'en' (default)
```

When no explicit `Default` is defined but a `DataType` is set, the type's built-in default is used:

| DataType | Default Value |
|----------|--------------|
| String | `""` |
| Number | `0` |
| Integer | `0` |
| Float | `0.0` |
| PreciseNumber | `"0.0"` |
| Boolean | `false` |
| Binary | `0` |
| DateTime | `0` |
| Array | `[]` |
| Object | `{}` |
| Null | `null` |

## Use Cases

### Safe Deep Property Access

```javascript
function getUserCity(userData) {
    const manifest = new libManyfest();
    return manifest.getValueAtAddress(userData, 'profile.address.city');
}

// No error even if profile or address is missing
getUserCity({});                                    // undefined
getUserCity({ profile: { address: { city: 'Portland' } } });  // 'Portland'
```

### Configuration with Fallbacks

```javascript
const configManifest = new libManyfest({
    Scope: 'AppConfig',
    Descriptors: {
        'Server.Port': { DataType: 'Integer', Default: 8080 },
        'Server.Host': { DataType: 'String', Default: 'localhost' },
        'Database.ConnectionString': { DataType: 'String', Default: 'mongodb://localhost/app' }
    }
});

function getConfig(config, key) {
    return configManifest.getValueByHash(config, key);
}

const config = { Server: { Port: 3000 } };
getConfig(config, 'Server.Port');                 // 3000
getConfig(config, 'Server.Host');                 // 'localhost'
getConfig(config, 'Database.ConnectionString');   // 'mongodb://localhost/app'
```

### Data Extraction with Hash Mapping

```javascript
const apiManifest = new libManyfest({
    Scope: 'APIResponse',
    Descriptors: {
        'data.user.display_name': { Hash: 'UserName', DataType: 'String' },
        'data.user.contact.primary_email': { Hash: 'Email', DataType: 'String' },
        'data.metadata.created_at': { Hash: 'Created', DataType: 'DateTime' }
    }
});

const response = {
    data: {
        user: {
            display_name: 'Alice',
            contact: { primary_email: 'alice@example.com' }
        },
        metadata: { created_at: '2024-01-15' }
    }
};

apiManifest.getValueByHash(response, 'UserName');  // 'Alice'
apiManifest.getValueByHash(response, 'Email');     // 'alice@example.com'
apiManifest.getValueByHash(response, 'Created');   // '2024-01-15'
```

## Notes

- Address paths are case-sensitive
- Accessing a non-existent path returns `undefined` (no exceptions thrown)
- Array indices are zero-based
- `getValueByHash` falls back to treating the hash as a direct address if no mapping is found
- Back-navigation (`..`) resolves relative to the root object
- Functions in address paths are called with `apply`, bound to their containing object
