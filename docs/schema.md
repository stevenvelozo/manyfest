# Schema Definition

A manyfest schema describes the structure, types and metadata for the elements of an object. Schemas power validation, default population and hash-based lookups.

## Access

```javascript
const libManyfest = require('manyfest');

// From a definition object
const manifest = new libManyfest({
    Scope: 'Animal',
    Descriptors: {
        'IDAnimal': { Name: 'Database ID', DataType: 'Integer', Default: 0 },
        'Name': { Description: 'The species name.' }
    }
});

// Or build one programmatically
const manifest = new libManyfest();
manifest.scope = 'Animal';
manifest.addDescriptor('IDAnimal', { Name: 'Database ID', DataType: 'Integer', Default: 0 });
manifest.addDescriptor('Name', { Description: 'The species name.' });
```

## Scope

The scope is a label that identifies what kind of data this manifest describes. It is used in log messages and has no functional effect on address resolution.

```javascript
const manifest = new libManyfest({
    Scope: 'Invoice',
    Descriptors: { /* ... */ }
});

manifest.scope;  // 'Invoice'
```

If no scope is provided, it defaults to `'DEFAULT'`.

## Descriptors

Each key in the `Descriptors` object is an address. The value is a descriptor object with metadata about that element.

```javascript
{
    Scope: 'User',
    Descriptors: {
        'Email': {
            Hash: 'email',
            Name: 'Email Address',
            NameShort: 'Email',
            Description: 'The primary contact email for this user.',
            DataType: 'String',
            Required: true,
            Default: ''
        }
    }
}
```

### Descriptor Properties

| Property | Type | Description |
|----------|------|-------------|
| **Hash** | `string` | Short identifier for hash-based lookups. Defaults to the address if not set. |
| **Name** | `string` | Human-readable name for the element. |
| **NameShort** | `string` | Abbreviated name for compact displays (tables, charts, logs). |
| **Description** | `string` | Longer description of what this element represents. |
| **DataType** | `string` | The expected data type. Used for validation and default values. |
| **Required** | `boolean` | When `true`, validation reports an error if this element is missing. |
| **Default** | `any` | The value returned when the element is not present in an object. |
| **Address** | `string` | Auto-populated with the descriptor's key if not explicitly set. |

All properties are optional. A descriptor can be as minimal as an empty object:

```javascript
{
    Descriptors: {
        'Name': {}  // Valid -- address is 'Name', hash defaults to 'Name'
    }
}
```

## Data Types

| DataType | JavaScript Type | Default Value | Description |
|----------|----------------|---------------|-------------|
| `String` | `string` | `""` | A text value |
| `Integer` | `number` | `0` | A whole number (no decimal point) |
| `Float` | `number` | `0.0` | A floating point number |
| `Number` | `number` | `0` | Any numeric value |
| `PreciseNumber` | `string` | `"0.0"` | Arbitrary precision number stored as a string |
| `Boolean` | `boolean` | `false` | `true` or `false` |
| `Binary` | `number` | `0` | A boolean represented as `1` or `0` |
| `YesNo` | `string` | - | A boolean represented as `"Y"` or `"N"` |
| `DateTime` | varies | `0` | A value parsable by JavaScript's `Date` constructor |
| `Key` | varies | - | A two-part key with ID and GUID (see below) |
| `Array` | `array` | `[]` | A JavaScript array |
| `Object` | `object` | `{}` | A JavaScript object |
| `Null` | `null` | `null` | An explicit null value |

### The Key Data Type

Keys represent a paired identifier: an integer ID and a string GUID. This is useful for database records that have both a local numeric identifier and a globally unique string identifier.

```javascript
{
    Descriptors: {
        'IDBook': {
            Hash: 'IDBook',
            Name: 'Book Identifier',
            DataType: 'Key',
            KeyRepresentation: 'ID',
            GUIDAddress: 'GUIDBook',
            IDAddress: 'IDBook'
        },
        'GUIDBook': {
            Hash: 'GUIDBook',
            Name: 'Book GUID',
            DataType: 'Key',
            KeyRepresentation: 'GUID',
            GUIDAddress: 'GUIDBook',
            IDAddress: 'IDBook'
        }
    }
}
```

The `KeyRepresentation` indicates which half of the pair this descriptor points to. The `GUIDAddress` and `IDAddress` properties link the two together.

## Adding Descriptors

### addDescriptor

Add a single descriptor to an existing manifest:

```javascript
manifest.addDescriptor('Profile.Phone', {
    Name: 'Phone Number',
    DataType: 'String',
    Required: false
});
```

If a descriptor already exists at that address, it is replaced. The `Address` property is auto-set if not provided. The `Hash` property defaults to the address if not provided.

Returns `true` on success, `false` if the descriptor is not a valid object.

## Retrieving Descriptors

### getDescriptor

Get a descriptor by its address:

```javascript
const desc = manifest.getDescriptor('Profile.Phone');
// { Name: 'Phone Number', DataType: 'String', Required: false, Address: 'Profile.Phone', Hash: 'Profile.Phone' }
```

### getDescriptorByHash

Get a descriptor by its hash:

```javascript
const manifest = new libManyfest({
    Scope: 'Config',
    Descriptors: {
        'Database.Connection.Host': { Hash: 'DBHost', DataType: 'String' }
    }
});

manifest.getDescriptorByHash('DBHost');
// { Hash: 'DBHost', DataType: 'String', Address: 'Database.Connection.Host' }
```

### eachDescriptor

Iterate over all descriptors:

```javascript
manifest.eachDescriptor((pDescriptor) => {
    console.log(`${pDescriptor.Address}: ${pDescriptor.Name || '(unnamed)'}`);
});
```

## Serialization

### serialize

Convert the manifest to a JSON string for storage or transmission:

```javascript
const json = manifest.serialize();
// '{"Scope":"User","Descriptors":{...},"HashTranslations":{...}}'
```

### deserialize

Load a manifest from a JSON string:

```javascript
const manifest = new libManyfest();
manifest.deserialize(json);
```

### getManifest

Get the manifest state as a plain object:

```javascript
const state = manifest.getManifest();
// { Scope: 'User', Descriptors: {...}, HashTranslations: {...} }
```

### clone

Create a deep copy of the manifest:

```javascript
const copy = manifest.clone();
// Independent copy -- changes to one don't affect the other
```

## Default Values

When a descriptor defines a `Default`, that value is returned by `getValueAtAddress` and `getValueByHash` if the element is missing from the object.

When no explicit `Default` is set but a `DataType` is defined, the type's built-in default is used (see the table above).

### Overriding Type Defaults

The built-in defaults for each type can be overridden at construction time:

```javascript
const manifest = new libManyfest({
    Scope: 'Custom',
    defaultValues: {
        String: '(empty)',
        Integer: -1,
        Boolean: true
    },
    Descriptors: {
        'Name': { DataType: 'String' },
        'Count': { DataType: 'Integer' }
    }
});

manifest.getValueAtAddress({}, 'Name');   // '(empty)'
manifest.getValueAtAddress({}, 'Count');  // -1
```

## Strict Mode

When `strict` is set to `true`, every described element that is missing from an object is treated as an error during validation, regardless of the `Required` flag:

```javascript
const manifest = new libManyfest({
    Scope: 'Config',
    strict: true,
    Descriptors: {
        'Host': { DataType: 'String' },
        'Port': { DataType: 'Integer' }
    }
});

manifest.validate({});
// Both Host and Port are reported as errors
```

Without strict mode, only elements with `Required: true` generate errors when missing.

## Use Cases

### API Response Schema

```javascript
const apiSchema = new libManyfest({
    Scope: 'WeatherAPI',
    Descriptors: {
        'data.temperature': { Hash: 'Temp', Name: 'Temperature', DataType: 'Float' },
        'data.humidity': { Hash: 'Humidity', Name: 'Humidity', DataType: 'Float' },
        'data.wind.speed': { Hash: 'WindSpeed', Name: 'Wind Speed', DataType: 'Float' },
        'metadata.station': { Hash: 'Station', Name: 'Station ID', DataType: 'String' }
    }
});

// Different API, same hashes
const response = fetchWeatherData();
const temp = apiSchema.getValueByHash(response, 'Temp');
```

### Form Field Definitions

```javascript
const formSchema = new libManyfest({
    Scope: 'ContactForm',
    Descriptors: {
        'FirstName': { Name: 'First Name', DataType: 'String', Required: true },
        'LastName': { Name: 'Last Name', DataType: 'String', Required: true },
        'Email': { Name: 'Email Address', DataType: 'String', Required: true },
        'Phone': { Name: 'Phone Number', DataType: 'String' },
        'Message': { Name: 'Message', DataType: 'String', Default: '' }
    }
});

// Use descriptors to generate form labels
formSchema.eachDescriptor((desc) => {
    console.log(`<label>${desc.Name}${desc.Required ? ' *' : ''}</label>`);
});
```

## Notes

- The address (the key in `Descriptors`) is the canonical identifier for an element
- Hashes provide an alias; if no hash is set, the address is used as the hash
- Multiple descriptors can share the same hash, but the last one wins
- Descriptors are stored by address, so two descriptors at the same address will overwrite
- `reset()` clears all descriptors, hashes and the scope
