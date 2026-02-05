# Hash Translation

Hash translation tables let you reuse the same schema structure while resolving hashes to different addresses. This is useful when the same logical data model maps to objects with different property names -- for instance, when two APIs return the same information in different shapes.

## Core Concept

Normally, a descriptor's `Hash` property maps to its `Address`:

```javascript
// Schema: Hash "Title" maps to address "metadata.title"
manifest.getValueByHash(data, 'Title');  // resolves to data.metadata.title
```

A translation table adds a layer of indirection. It intercepts hash lookups and redirects them before the normal hash-to-address resolution runs:

```
Hash Lookup → Translation Table → Descriptor Hash Table → Address → Value
```

## Access

Translation tables live on the `hashTranslations` property of a manifest instance:

```javascript
const manifest = new libManyfest({
    Scope: 'Media',
    Descriptors: {
        'metadata.title': { Hash: 'Title', DataType: 'String' },
        'metadata.creator': { Hash: 'Creator', DataType: 'String' }
    }
});

// Add translations
manifest.hashTranslations.addTranslation({
    'Title': 'info.name',
    'Creator': 'info.author'
});
```

After adding translations, `getValueByHash(data, 'Title')` resolves to `data.info.name` instead of `data.metadata.title`.

## Adding Translations

### addTranslation

Pass an object where each key is the source hash and each value is the destination hash or address:

```javascript
manifest.hashTranslations.addTranslation({
    'SourceHash': 'DestinationHash',
    'AnotherSource': 'AnotherDestination'
});
```

Multiple calls are additive. Later calls can overwrite earlier translations for the same source hash.

## Removing Translations

### removeTranslation

Remove by passing a string (single hash) or an object (multiple hashes):

```javascript
// Remove a single translation
manifest.hashTranslations.removeTranslation('Title');

// Remove multiple at once
manifest.hashTranslations.removeTranslation({
    'Title': 'info.name',
    'Creator': 'info.author'
});
```

When an object is passed, only the keys matter. The values are ignored.

### clearTranslations

Remove all translations at once:

```javascript
manifest.hashTranslations.clearTranslations();
```

## Checking the Table

### translationCount

```javascript
manifest.hashTranslations.translationCount();  // Number of active translations
```

### translate

Translate a single hash. Returns the original hash if no translation exists:

```javascript
manifest.hashTranslations.translate('Title');    // 'info.name' (if translated)
manifest.hashTranslations.translate('Unknown');  // 'Unknown' (passthrough)
```

## Resolution Order

When `getValueByHash` (or any hash-based method) resolves a hash, the following order is used:

1. **Element hash table only** -- if the hash is in the descriptor table and not in the translation table, resolve normally
2. **Translation table then element hash table** -- if the hash is in the translation table and the translated result is in the element hash table, resolve through both
3. **Translation table only** -- if the hash is in the translation table but the translated result is not in the element hash table, use the translated value as a direct address
4. **Passthrough** -- if the hash is in neither table, treat it as a direct address

This means translations can override built-in descriptor hashes.

## Use Cases

### Multiple API Formats

When two APIs return the same data in different shapes, one schema handles both:

```javascript
const mediaSchema = new libManyfest({
    Scope: 'Media',
    Descriptors: {
        'title': { Hash: 'Title', DataType: 'String' },
        'author': { Hash: 'Author', DataType: 'String' },
        'year': { Hash: 'Year', DataType: 'Integer' }
    }
});

// API A returns: { title: '...', author: '...', year: 2024 }
// Works out of the box:
mediaSchema.getValueByHash(apiAResponse, 'Title');

// API B returns: { metadata: { name: '...', creator: '...' }, info: { published: 2024 } }
// Add translations for API B's shape:
mediaSchema.hashTranslations.addTranslation({
    'Title': 'metadata.name',
    'Author': 'metadata.creator',
    'Year': 'info.published'
});

mediaSchema.getValueByHash(apiBResponse, 'Title');   // reads metadata.name
mediaSchema.getValueByHash(apiBResponse, 'Author');  // reads metadata.creator
```

### Locale-Specific Field Names

```javascript
const formSchema = new libManyfest({
    Scope: 'Form',
    Descriptors: {
        'firstName': { Hash: 'FirstName', DataType: 'String' },
        'lastName': { Hash: 'LastName', DataType: 'String' }
    }
});

// Japanese form data uses different field names
formSchema.hashTranslations.addTranslation({
    'FirstName': 'mei',
    'LastName': 'sei'
});

const jpData = { mei: 'Taro', sei: 'Yamada' };
formSchema.getValueByHash(jpData, 'FirstName');  // 'Taro'
```

### Temporary Overrides

Apply translations for a specific operation, then clear them:

```javascript
manifest.hashTranslations.addTranslation({ 'Name': 'display_name' });

const displayName = manifest.getValueByHash(record, 'Name');

manifest.hashTranslations.clearTranslations();
// Back to normal resolution
```

## Serialization

Hash translations are included when you serialize a manifest:

```javascript
const state = manifest.getManifest();
// { Scope: '...', Descriptors: {...}, HashTranslations: {...} }

const json = manifest.serialize();
// HashTranslations included in the JSON string
```

And restored when you clone:

```javascript
const copy = manifest.clone();
// copy.hashTranslations contains the same translations
```

## Notes

- Translations are checked before the built-in hash table, so they can override descriptor hashes
- If a translation points to a hash that also has a translation, only one level of indirection is resolved
- Translations work with all hash-based methods: `getValueByHash`, `setValueByHash`, `deleteValueByHash`, `checkAddressExistsByHash`, `getDescriptorByHash`
- The translation table is a simple `{ source: destination }` object -- no nesting or chaining
