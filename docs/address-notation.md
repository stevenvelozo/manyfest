# Address Notation

Addresses are the core of manyfest. They describe locations inside nested JavaScript objects using a compact string syntax. Every read, write, existence check and validation operation resolves through the address system.

## Basic Dot Notation

Dots separate levels of nesting:

```javascript
const manifest = new libManyfest();

const data = {
    user: {
        profile: {
            name: 'Alice'
        }
    }
};

manifest.getValueAtAddress(data, 'user');                  // { profile: { name: 'Alice' } }
manifest.getValueAtAddress(data, 'user.profile');          // { name: 'Alice' }
manifest.getValueAtAddress(data, 'user.profile.name');     // 'Alice'
```

Paths are case-sensitive. `user.Profile` and `user.profile` resolve to different locations.

## Array Access

Square brackets with a numeric index access array elements:

```javascript
const data = {
    items: ['first', 'second', 'third'],
    users: [
        { name: 'Alice', scores: [95, 88] },
        { name: 'Bob', scores: [72, 91] }
    ]
};

manifest.getValueAtAddress(data, 'items[0]');             // 'first'
manifest.getValueAtAddress(data, 'items[2]');             // 'third'
manifest.getValueAtAddress(data, 'users[0].name');        // 'Alice'
manifest.getValueAtAddress(data, 'users[1].scores[0]');   // 72
```

Indices are zero-based. Accessing an out-of-bounds index returns `undefined`.

### Set Access

Empty brackets access the full array:

```javascript
manifest.getValueAtAddress(data, 'users[]');
// Returns all user objects
```

When combined with further path resolution, this produces an object keyed by each element's full address:

```javascript
manifest.getValueAtAddress(data, 'users[].name');
// { 'users[0].name': 'Alice', 'users[1].name': 'Bob' }
```

## Boxed Properties

Properties with special characters in their keys (dots, spaces, dashes) cannot use dot notation. Wrap them in brackets with quotes instead:

```javascript
const data = {
    'my-key': 'value1',
    'another key': 'value2',
    nested: {
        'some.dotted.key': 'value3'
    }
};

manifest.getValueAtAddress(data, '["my-key"]');                 // 'value1'
manifest.getValueAtAddress(data, "['another key']");            // 'value2'
manifest.getValueAtAddress(data, 'nested["some.dotted.key"]');  // 'value3'
```

Single quotes, double quotes and backticks all work as the wrapping character.

## Object Set Access

The `{}` marker enumerates all keys of an object, resolving a sub-path on each:

```javascript
const data = {
    departments: {
        engineering: { budget: 50000, headcount: 12 },
        marketing: { budget: 30000, headcount: 8 },
        sales: { budget: 40000, headcount: 15 }
    }
};

manifest.getValueAtAddress(data, 'departments{}.budget');
// {
//   'departments.engineering.budget': 50000,
//   'departments.marketing.budget': 30000,
//   'departments.sales.budget': 40000
// }
```

This is useful for extracting a single field across all entries of an object-based collection.

## Back-Navigation

Double dots (`..`) navigate upward through the object hierarchy. Each dot beyond the first separator moves one level up from the current position:

```javascript
const data = {
    Bundle: {
        Contract: {
            IDContract: 500
        },
        Project: {
            IDProject: 42
        }
    }
};

// From IDContract, navigate back up to Bundle, then down into Project
manifest.getValueAtAddress(data, 'Bundle.Contract.IDContract...Project.IDProject');
// 42
```

The address resolves as:
1. Navigate to `Bundle.Contract.IDContract`
2. `..` means go up -- one dot goes back to `Contract`, the second goes back to `Bundle`
3. Continue forward into `Project.IDProject`

Back-navigation always resolves relative to the root object.

## Function Calls

If a property in the path is a function, it can be called using parentheses:

```javascript
const data = {
    items: [10, 20, 30],
    getTotal: function() {
        return this.items.reduce((a, b) => a + b, 0);
    }
};

manifest.getValueAtAddress(data, 'getTotal()');  // 60
```

### With Arguments

Arguments inside the parentheses are resolved as addresses on the root object:

```javascript
const data = {
    basePrice: 100,
    taxRate: 0.08,
    calculate: function(price, rate) {
        return price + (price * rate);
    }
};

manifest.getValueAtAddress(data, 'calculate(basePrice,taxRate)');  // 108
```

String literals can be passed by wrapping them in quotes:

```javascript
const data = {
    greet: function(name) { return 'Hello, ' + name; }
};

manifest.getValueAtAddress(data, 'greet("World")');  // 'Hello, World'
```

Functions are called with `apply`, bound to their containing object so `this` works as expected.

### Chained Function Calls

A function's return value can be navigated further:

```javascript
const data = {
    getUser: function() {
        return { name: 'Alice', role: 'admin' };
    }
};

manifest.getValueAtAddress(data, 'getUser().name');  // 'Alice'
```

## Address Linting

Manyfest automatically cleans up common address issues before resolution:

- Leading and trailing whitespace is trimmed
- A trailing single `.` is removed (but `..` for back-navigation is preserved)

```javascript
manifest.getValueAtAddress(data, '  user.name  ');  // Works
manifest.getValueAtAddress(data, 'user.name.');     // Trailing dot removed
```

## Writing with Addresses

All of the notation above works for write operations too. Manyfest creates intermediate objects as needed:

```javascript
const data = {};

manifest.setValueAtAddress(data, 'user.profile.name', 'Alice');
// { user: { profile: { name: 'Alice' } } }

manifest.setValueAtAddress(data, 'items[0]', 'first');
// Also creates the items array if needed

manifest.setValueAtAddress(data, '["special-key"]', 'value');
// { 'special-key': 'value', user: { ... }, items: [...] }
```

## Address Syntax Summary

| Syntax | Example | Description |
|--------|---------|-------------|
| `property` | `Name` | Direct property access |
| `a.b.c` | `user.profile.name` | Nested property access |
| `a[0]` | `items[0]` | Array element by index |
| `a[].b` | `users[].name` | Property across all array elements |
| `a["b"]` | `data["my-key"]` | Boxed property (special characters) |
| `a{}.b` | `depts{}.budget` | Property across all object keys |
| `a..b` | `x.y..z` | Back-navigation (up one level) |
| `a()` | `getTotal()` | Function call |
| `a(b)` | `calc(price)` | Function call with address argument |
| `a("b")` | `greet("World")` | Function call with string literal |

## Notes

- Addresses are case-sensitive
- Non-existent paths return `undefined` on read (no exceptions)
- Non-existent intermediate objects are created on write
- Array indices are zero-based
- Function calls require the function to exist on the object at that path
- Back-navigation resolves from the root object
- The address system is shared by all operations: get, set, check, delete and validate
