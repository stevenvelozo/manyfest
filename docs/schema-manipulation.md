# Schema Manipulation

Manyfest provides tools for remapping, merging and auto-generating schemas. These are useful when adapting a schema to different object shapes, combining schemas from multiple sources, or bootstrapping a schema from sample data.

## Address Remapping

### resolveAddressMappings

Remap descriptors from one set of addresses to another. This permanently mutates the descriptor object.

```javascript
const descriptors = {
    'Address.Of.a': { Hash: 'a', DataType: 'Number' },
    'Address.Of.b': { Hash: 'b', DataType: 'String' }
};

const mapping = {
    'a': 'New.Address.Of.a',
    'b': 'New.Address.Of.b'
};

manifest.schemaManipulations.resolveAddressMappings(descriptors, mapping);
// descriptors is now:
// {
//   'New.Address.Of.a': { Hash: 'a', DataType: 'Number' },
//   'New.Address.Of.b': { Hash: 'b', DataType: 'String' }
// }
```

The mapping keys can be either addresses or hashes. If a key matches a descriptor's address directly, that descriptor is moved. If a key matches a descriptor's hash, the descriptor at that hash's address is moved.

If a mapping key matches neither an existing address nor a hash, a new descriptor is created with the key as its hash.

### safeResolveAddressMappings

The same operation, but returns a new object instead of mutating the original:

```javascript
const original = {
    'old.path': { Hash: 'value', DataType: 'String' }
};

const remapped = manifest.schemaManipulations.safeResolveAddressMappings(original, {
    'value': 'new.path'
});

// original is unchanged
// remapped is: { 'new.path': { Hash: 'value', DataType: 'String' } }
```

## Merging Schemas

### mergeAddressMappings

Combine two sets of descriptors. The destination (first argument) takes precedence when both contain the same address:

```javascript
const base = {
    'Name': { DataType: 'String' },
    'Email': { DataType: 'String' }
};

const extra = {
    'Email': { DataType: 'String', Required: true },
    'Phone': { DataType: 'String' }
};

const merged = manifest.schemaManipulations.mergeAddressMappings(base, extra);
// {
//   'Name': { DataType: 'String' },
//   'Email': { DataType: 'String' },         <-- base wins (no Required)
//   'Phone': { DataType: 'String' }           <-- added from extra
// }
```

Returns a new object. Neither input is mutated.

## Auto-Generating Schemas

### generateAddressses

Generate a schema from a sample object. This recursively walks the object and produces a descriptor for every reachable address:

```javascript
const sample = {
    name: 'Alice',
    age: 30,
    address: {
        city: 'Portland',
        zip: '97201'
    },
    tags: ['admin', 'user']
};

const generated = manifest.objectAddressGeneration.generateAddressses(sample);
// {
//   'name':        { Address: 'name',        Hash: 'name',        Name: 'name',        DataType: 'String', Default: 'Alice', InSchema: false },
//   'age':         { Address: 'age',         Hash: 'age',         Name: 'age',         DataType: 'Number', Default: 30,      InSchema: false },
//   'address':     { Address: 'address',     Hash: 'address',     Name: 'address',     DataType: 'Object',                   InSchema: false },
//   'address.city':{ Address: 'address.city', Hash: 'address.city', Name: 'address.city', DataType: 'String', Default: 'Portland', InSchema: false },
//   'address.zip': { Address: 'address.zip', Hash: 'address.zip', Name: 'address.zip', DataType: 'String', Default: '97201',    InSchema: false },
//   'tags':        { Address: 'tags',        Hash: 'tags',        Name: 'tags',        DataType: 'Array',                    InSchema: false },
//   'tags[0]':     { Address: 'tags[0]',     Hash: 'tags[0]',     Name: 'tags[0]',     DataType: 'String', Default: 'admin',  InSchema: false },
//   'tags[1]':     { Address: 'tags[1]',     Hash: 'tags[1]',     Name: 'tags[1]',     DataType: 'String', Default: 'user',   InSchema: false }
// }
```

Every generated descriptor has `InSchema: false`, which acts as a flag for tooling to prompt a developer to opt-in before including it in a final schema.

Data types are inferred from JavaScript types:
- `string` becomes `String`
- `number` and `bigint` become `Number`
- Arrays become `Array` (with each element also generated)
- Objects become `Object` (with each property also generated)
- `null` and `undefined` become `Any`
- Functions and Symbols are skipped

## Use Cases

### Adapting a Schema to a Different API Shape

```javascript
const baseSchema = {
    'user.name': { Hash: 'UserName', DataType: 'String' },
    'user.email': { Hash: 'UserEmail', DataType: 'String' },
    'user.role': { Hash: 'UserRole', DataType: 'String' }
};

// API v2 returns data in a flat shape
const v2Mapping = {
    'UserName': 'display_name',
    'UserEmail': 'email_address',
    'UserRole': 'access_level'
};

const v2Schema = manifest.schemaManipulations.safeResolveAddressMappings(baseSchema, v2Mapping);
// v2Schema addresses are now: display_name, email_address, access_level
// Hashes remain: UserName, UserEmail, UserRole
```

### Bootstrapping a Schema from Sample Data

```javascript
// Take a sample API response
const sampleResponse = await fetch('/api/users/1').then(r => r.json());

// Generate all possible addresses
const generated = manifest.objectAddressGeneration.generateAddressses(sampleResponse);

// Pick the ones you need and build a proper schema
const schema = new libManyfest({
    Scope: 'User',
    Descriptors: {
        'data.id': { ...generated['data.id'], InSchema: true, Required: true },
        'data.name': { ...generated['data.name'], InSchema: true, Name: 'Display Name' },
        'data.email': { ...generated['data.email'], InSchema: true, Name: 'Email' }
    }
});
```

### Combining Base and Extension Schemas

```javascript
const coreFields = {
    'ID': { DataType: 'Integer', Required: true },
    'Name': { DataType: 'String', Required: true },
    'Created': { DataType: 'DateTime' }
};

const auditFields = {
    'CreatedBy': { DataType: 'String' },
    'ModifiedBy': { DataType: 'String' },
    'Modified': { DataType: 'DateTime' }
};

const fullSchema = manifest.schemaManipulations.mergeAddressMappings(coreFields, auditFields);
// Contains all six fields
```

## Notes

- `resolveAddressMappings` mutates the input object; use `safeResolveAddressMappings` when you need to preserve the original
- `mergeAddressMappings` gives precedence to the first (destination) argument on address conflicts
- `generateAddressses` produces every reachable address including individual array elements -- the output can be large for complex objects
- Generated schemas use `InSchema: false` as a signal that the descriptor was auto-generated and has not been reviewed
- Symbols and functions in source objects are silently skipped during generation
