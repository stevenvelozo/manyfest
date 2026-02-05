# Manyfest

> JSON Object Manifest for Data Description and Parsing

Manyfest provides a simple pattern to describe, validate, manipulate and interpret data using address-based object navigation. It solves the problem of maintaining context as data crosses boundaries between persistence engines, APIs, and user interfaces.

## Features

- **Safe Object Navigation** - Read and write deeply nested properties without exceptions
- **Schema Definitions** - Describe data elements with types, defaults, names and descriptions
- **Hash-Based Lookups** - Access complex paths through short, friendly hash identifiers
- **Validation** - Check objects against schemas for required fields and type conformance
- **Default Population** - Fill in missing values based on schema definitions
- **Auto-Structure Creation** - Writing to a nested path automatically creates intermediate objects
- **Browser & Node.js** - Works seamlessly in both environments

## Quick Start

```javascript
const libManyfest = require('manyfest');

// Define a schema
const manifest = new libManyfest({
    Scope: 'User',
    Descriptors: {
        'Name': { DataType: 'String', Required: true },
        'Email': { DataType: 'String', Required: true },
        'Profile.Age': { DataType: 'Integer' },
        'Profile.Bio': { DataType: 'String', Default: '' }
    }
});

// Read safely from nested objects
const user = { Name: 'Alice', Profile: { Age: 30 } };
manifest.getValueAtAddress(user, 'Profile.Age');     // 30
manifest.getValueAtAddress(user, 'Profile.Phone');   // undefined (no error)

// Write to any depth -- intermediate objects are created for you
const newUser = {};
manifest.setValueAtAddress(newUser, 'Name', 'Bob');
manifest.setValueAtAddress(newUser, 'Profile.Age', 25);
// newUser is now: { Name: 'Bob', Profile: { Age: 25 } }

// Validate against the schema
const result = manifest.validate({ Name: 'Carol' });
// result.Error: true
// result.Errors: ['Element at address "Email" is flagged REQUIRED but is not set in the object.']
// result.MissingElements: ['Email', 'Profile.Age', 'Profile.Bio']
```

## Installation

```bash
npm install manyfest
```

## How It Works

Manyfest uses **addresses** -- dot-notation paths -- to navigate objects:

```javascript
manifest.getValueAtAddress(data, 'user.profile.name');      // Nested properties
manifest.getValueAtAddress(data, 'items[0].title');          // Array elements
manifest.getValueAtAddress(data, '["special-key"]');         // Boxed properties
manifest.getValueAtAddress(data, 'departments{}.budget');    // Object sets
```

A **schema** maps these addresses to human-readable metadata:

```javascript
const manifest = new libManyfest({
    Scope: 'Archive.org',
    Descriptors: {
        'd1': { Hash: 'Server', Name: 'Server', DataType: 'String' },
        'metadata.title': { Hash: 'Title', Name: 'Title', DataType: 'String' },
        'metadata.creator': { Hash: 'Creator', Name: 'Creator', DataType: 'String' }
    }
});

// Now use friendly hashes instead of raw paths
manifest.getValueByHash(archiveData, 'Title');    // reads metadata.title
manifest.getValueByHash(archiveData, 'Creator');  // reads metadata.creator
```

No schema required for basic usage -- manyfest works as a standalone safe-access utility:

```javascript
const manifest = new libManyfest();
manifest.getValueAtAddress(anyObject, 'any.nested.path');  // Safe, returns undefined if missing
manifest.setValueAtAddress(anyObject, 'any.new.path', 42); // Creates structure automatically
```

## Documentation

- [Quickstart](quickstart.md) - Up and running in five minutes
- [Reading Values](reading.md) - Full guide to address-based reading
- [Writing Values](writing.md) - Setting, populating and deleting values
- [Validating Objects](validating.md) - Schema validation and type checking
- [Schema Definition](schema.md) - Descriptors, data types and serialization
- [Address Notation](address-notation.md) - The complete address syntax reference
- [Hash Translation](hash-translation.md) - Reusing schemas with different mappings
- [Schema Manipulation](schema-manipulation.md) - Remapping, merging and generating schemas

## Related Packages

- [fable](https://github.com/stevenvelozo/fable) - Service dependency injection framework
- [pict](https://github.com/stevenvelozo/pict) - UI application framework
- [pict-view](https://github.com/stevenvelozo/pict-view) - View base class for Pict
