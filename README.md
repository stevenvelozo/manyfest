# Manyfest

## JSON Object Manifest for Data Description and Parsing

We focus so much on documentation and description for the mechanics of data at rest, in software development.  Schema for databases.  Well-named variables in code, with comments.  Expressive languages for writing software or querying graphs of information.

As data crosses these boundaries, though, context is lost.  We reinvent the wheel at each layer!  The front-end code has its own mechanism for putting a label before a value to the user.  It is rare that there are less than three representations of an important piece of data across:

* The Data Persistence Engine _(e.g. a SQL server table, or schemaless storage)_
* Middle Tier Source Code _(e.g. an API service)_
* Front End Source Code _(e.g. the code behind for a single page app)_
* The User Interface _(e.g. a label on a web form)_

Manyfest's purpose is to solve this problem by creating a simple pattern to describe, validate, manipulate and interpret data.

![Official Mascot](https://github.com/stevenvelozo/manyfest/raw/main/diagrams/Mascot.jpg)

_Man-E-Faces approves of Manyfest!_

## Quick Example

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

// Read safely from nested objects (no exceptions on missing paths)
const user = { Name: 'Alice', Profile: { Age: 30 } };
manifest.getValueAtAddress(user, 'Profile.Age');     // 30
manifest.getValueAtAddress(user, 'Profile.Phone');   // undefined

// Write to any depth (intermediate objects are created automatically)
const newUser = {};
manifest.setValueAtAddress(newUser, 'Name', 'Bob');
manifest.setValueAtAddress(newUser, 'Profile.Age', 25);
// newUser is now: { Name: 'Bob', Profile: { Age: 25 } }

// Validate against the schema
const result = manifest.validate({ Name: 'Carol' });
// result.Errors: ['Element at address "Email" is flagged REQUIRED but is not set in the object.']
```

## Documentation

| Guide | Description |
| ----- | ----------- |
| [Quickstart](docs/quickstart.md) | Installation, first schema, and basic operations in under five minutes. |
| [Reading Values](docs/reading.md) | `getValueAtAddress`, `getValueByHash`, array access, boxed properties, back-navigation, function resolution and defaults. |
| [Writing Values](docs/writing.md) | `setValueAtAddress`, `setValueByHash`, auto-creation of nested structures, populating defaults and deleting values. |
| [Validating Objects](docs/validating.md) | Required fields, strict mode, data type checking and the validation result structure. |
| [Schema Definition](docs/schema.md) | Descriptors, data types, scope, serialization, cloning and programmatic schema building. |
| [Address Notation](docs/address-notation.md) | The complete address syntax: dot notation, arrays, boxed properties, object sets, back-navigation and function calls. |
| [Hash Translation](docs/hash-translation.md) | Reusing schemas with different hash mappings for multiple API shapes. |
| [Schema Manipulation](docs/schema-manipulation.md) | Remapping addresses, merging schemas and auto-generating schemas from sample data. |

## Where Does this Run

Either as a stand-alone library in node.js software, or, a dependency-free browser library.

### Compatibility

This library is tested for node.js versions 8 through 16, and will likely work in future versions.  It is implemented as a simple set of es6 classes.

The browser version has been packaged into a minified as well as an expanded debuggable library.  Sourcemaps are included.

## Installation

For use within node.js, run the following in the folder with your `package.json` file:

```
npm install --save manyfest
```

Then, you can include it in your source code as follows:

```javascript
const libManyfest = require('manyfest');

// Construct a Manyfest with a few defined columns
let animalManyfest = new libManyfest(
	{
		"Scope": "Animal",
		"Descriptors":
			{
				"IDAnimal": { "Name":"Database ID", "Description":"The unique integer-based database identifier for an Animal record.", "DataType":"Integer", "Default":0 },
				"Name": { "Description":"The animal's colloquial species name (e.g. Rabbit, Dog, Bear, Mongoose)." },
				"Type": { "Description":"Whether or not the animal is wild, domesticated, agricultural, in a research lab or a part of a zoo.." }
			}
	});

// Make up a cute and furry test creature
let testAnimal = {IDAnimal:8675309, Name:'BatBrains', Type:'Lab', Color:'Brown'};

// Validate an Object Against the Manyfest
let validateResults = animalManyfest.validate(testAnimal);

console.log(JSON.stringify(validateResults,null,4));
```

The code above sets up a Manyfest, and runs a validation on the testAnimal.  The validation will come back all good telling us which properties aren't in the object but are described.  If the `strict` option has been set, missing described elements of an object without data are treated as errors.  If there are any `Required` columns, they are always errors if they are missing.

Error does not mean the software throws an exception.  It comes back as well-formed JSON.

## Lexicon

Below is a lexicon of terms used throughout this documentation.  If you see anything missing, want more elaboration or just dislike a particular term, please file an issue in github!

| Term | Description |
| ---- | ----------- |
| Scope | The scope of this representation; generally the clustered or parent record name (e.g. Animal, User, Transaction, etc.) -- does not have functional purpose; only for information and logging. |
| Schema | The stateful representation of an object's structural definition. |
| Element | A defined element of data in an object. |
| Address | The address where that data lies in the object. |
| Hash | A unique within this scope string-based key for this element.  Used for easy access of data. |
| Descriptor | A description of an element including data such as Name, NameShort, Hash, Description, and other important properties. |
| Name | The name of the element.  Meant to be the most succinct human readable name possible. |
| NameShort | A shorter name for the element.  Meant to be useful enough to identify the property in log lines, tabular views, graphs and anywhere where we don't always want to see the full name. |
| Description | A description for the element.  Very useful when consuming other APIs with their own terse naming standards (or no naming standards)! |
| Required | Set to true if this element is required. |

Okay so these are a lot of crazy words.  The important two are *Address* and *Hash*.  Every element in a schema must have an address.  Having a hash just multiplies the usefulness of these addresses.

## A More Advanced Schema Example

Addresses are meant to be kinda magic.  They describe locations in nested JSON just as well as simple objects.  Further, they can allow us to manipulate and read JSON values at specific addresses.


Let's use our Animal schema and extend it a little bit.  In this case, a new JSON sub object needs to be included carrying important medical information about this animal.

```javascript
let animalManyfest = new libManyfest(
	{
		"Scope": "Animal",
		"Descriptors":
			{
				"IDAnimal": { "Name":"Database ID", "Description":"The unique integer-based database identifier for an Animal record.", "DataType":"Integer" },
				"Name": { "Description":"The animal's colloquial species name (e.g. Rabbit, Dog, Bear, Mongoose)." },
				"Type": { "Description":"Whether or not the animal is wild, domesticated, agricultural, in a research lab or a part of a zoo.." },
				"MedicalStats":
					{
						"Name":"Medical Statistics", "Description":"Basic medical statistics for this animal"
					},
				"MedicalStats.Temps.MinET": { "Name":"Minimum Environmental Temperature", "NameShort":"MinET", "Description":"Safest minimum temperature for this animal to survive in."},
				"MedicalStats.Temps.MaxET": { "Name":"Maximum Environmental Temperature", "NameShort":"MaxET", "Description":"Safest maximum temperature for this animal to survive in."},
				"MedicalStats.Temps.CET":
					{
						"Name":"Comfortable Environmental Temperature",
						"NameShort":"Comf Env Temp",
						"Hash":"ComfET",
						"DataType":"Float",
						"Description":"The most comfortable temperature for this animal to survive in."
					}
			}
	});
```

Notice in this example, the addresses are more complex.  They have a dot syntax.  This notifies Manyfest that they are nested values.  Further, there is both a Name and a NameShort descriptor setup.  This gives us a framework for consistently referring to the data element both internally and to the user.  It is no longer a mystery what someAnimal.MedicalStats.Temps.CET means.  Developers, user interface designers, database engineers, product managers and other folks who work on the software side don't have to maintain a third body of documentation about what the data means.

To aid in this discovery, reference and such, we've given it a NameShort (for use in things like tabular views and graphs/charts), a longer Name and a Hash (to enable easy reading and writing using the object element read/write functions described later in this documentation).

### Data Types

| Type | Description |
| ---- | ----------- |
| String | A pretty basic string |
| Integer | An integer number |
| Float | A floating point number; does not require a decimal point |
| Number | A number of any type |
| PreciseNumber | An arbitrary precision number, stored in a string |
| Boolean | A boolean value represented by the JSON true or false |
| Binary | A boolean value represented as 1 or 0 |
| YesNo | A boolean value represented as Y or N |
| DateTime | A javascript date |
| Key | A two-part Key with an Identifier and Globally Unique Identifier (ID and GUID) |
| Array | A plain old javascript array |
| Object | A plain old javascript object |
| Null | A null value |

#### Keys

Keys are a slightly more complex value type, in that they have configuration that defines cardinality.  The address is meant to point to one of two of the values (either the GUID or the ID).  There is a secondary parameter for the other.

## Reading and Writing Element Properties

Lastly, when working with objects, Manyfest provides a set of functions to read and write from/to these element addresses.  This can be useful for consistently accessing objects across boundaries as well as filling out element defaults without requiring a crazy amount of boilerplate code.

### An Example and the Why of Reading and Writing Element Properties

For instance, if you have an element with the address of "MedicalStats.HeartRate.RestingHeartRate.OverallAverage" (which is very verbose; most JSON object structures are not so descriptive) it would take a significant amount of code to write that to an empty object.

#### The Typical Javascript Way of Reading

In the example below, the read and write code throws an error.  You could work around it with:

* a bunch of sequential guards
* use fancy new es6 syntax with the `someObject.?SomeContainer.?OtherContainer.Property` _(although that isn't compatible with older services and browsers that run older versions of javascript)_
* write some kind of complex handler for it
* something else clever?

```javascript
// Write Code
let newAnimal = {};

// This is going to make a terrible error happen
newAnimal.MedicalStats.HeartReat.RestingHeartRate.OverallAverage = 61;
```

```javascript
// Read Code
let newAnimal = {};

// This is going to make a terrible error happen
console.log(newAnimal.MedicalStats.HeartReat.RestingHeartRate.OverallAverage);

// My javascript interpreter said this when I tried this code:
// > Uncaught TypeError: Cannot read properties of undefined (reading 'HeartReat')
```

#### The Manyfest Way

However with the Manyfest reading and writing methods you can do this (all in one example since it doesn't blow up):

```javascript
let newAnimal = {};

// You can now try to access the value on a "clean" object...
console.log(animalManyfest.getValueAtAddress(newAnimal, "MedicalStats.HeartRate.RestingHeartRate.OverallAverage"));

// The output prints out "undefined" ... because it is!

// This will be helpful and create the necessary structure inbetween
animalManyfest.setValueAtAddress(newAnimal, "MedicalStats.HeartRate.RestingHeartRate.OverallAverage", 61);

// You can now access the value as well...
console.log(animalManyfest.getValueAtAddress(newAnimal, "MedicalStats.HeartRate.RestingHeartRate.OverallAverage"));

// The output prints out "61"
```

#### That's Not All!

Because we have mappings to and from more human readable names to the addresses, we can happily use either the Name or Hash for these lookups.  For instance, from the example above, if we have our Comfortable Environmental Temperature for an animal which was in the address `someAnimal.MedicalStats.Temps.CET` and had a hash of `ComfET`, a developer could easily access it by hash (assuming the `favoriteAnimalAPI` function returns a JSON representation of my favorite animal):

```javascript
let favAnimal = favoriteAnimalAPI();

console.log(animalManyfest.getValueByHash(favAnimal,'ComfET'));
```

For any elements that haven't defined a Hash, the Address is used.  This allows code to gracefully fall back.

## Hash Translation Tables

Sometimes we want to reuse the structure of a schema, but look up values by hash using translations.  See the [Hash Translation](docs/hash-translation.md) documentation for the full guide.

## Programmatically Defining a Schema

Sometimes we don't have schemas, and want to define object element structure on the fly.  This can be done programmatically.  As a refresher, here is how we loaded our simplest schema manifest above:

```javascript
const libManyfest = require('manyfest');

// Construct a Manyfest with a few defined columns
let animalManyfest = new libManyfest(
	{
		"Scope": "Animal",
		"Descriptors":
			{
				"IDAnimal": { "Name":"Database ID", "Description":"The unique integer-based database identifier for an Animal record.", "DataType":"Integer" },
				"Name": { "Description":"The animal's colloquial species name (e.g. Rabbit, Dog, Bear, Mongoose)." },
				"Type": { "Description":"Whether or not the animal is wild, domesticated, agricultural, in a research lab or a part of a zoo.." }
			}
	});
```

The programmatic equivalent is the following code:

```javascript
const libManyfest = require('manyfest');

// Construct a Manyfest with a few defined columns
let animalManyfest = new libManyfest();

// Set the Scope
animalManyfest.scope = "Animal";

// Add descriptors
animalManyfest.addDescriptor("IDAnimal", { "Name":"Database ID", "Description":"The unique integer-based database identifier for an Animal record.", "DataType":"Integer" });
animalManyfest.addDescriptor("Name", { "Description":"The animal's colloquial species name (e.g. Rabbit, Dog, Bear, Mongoose)." });
animalManyfest.addDescriptor("Type", { "Description":"Whether or not the animal is wild, domesticated, agricultural, in a research lab or a part of a zoo.." });

// Now you can work with the animalManyfest just as we did in the other method.
```

Programmatic definition is interesting because you can start with a pre-defined manifest and add on elements later if you like.  This can be useful if you, say, have an endpoint which generally returns a record, but, sometimes decorates it with connected records for developer convenience.

## Other Uses

Have you ever tried to code against a weather API?  They use *so many* different structures of data.  And once you've used their structure, you are kindof stuck with it.

With manyfest, you can easily create a description for each API and code against getting values by hash.  This abstracts the complexity of multiple API services without requiring you to marshal it into your own persistence format.

## Archive dot Org

Modern APIs are super complicated.  And worse, they change.  Let's take a real example. [Archive.org](https://archive.org/) is a wonderful resource for downloading awesome content gathered from the web and such.

There is an API to access their data.  It's ... really messy, the data you get back.  Below is the JSON for a single video (a rad Count Chocula commercial from 1971) -- it takes quite a bit of scroll to get down to the bottom.

![Count Chocula will Rise Again](http://ia800202.us.archive.org/7/items/FrankenberryCountChoculaTevevisionCommercial1971/frankerberry_countchockula_1971.0001.gif)

<details>
<summary>Archive.org JSON response (click to expand)</summary>

```JSON
{
	"created": 1664830085,
	"d1": "ia600202.us.archive.org",
	"d2": "ia800202.us.archive.org",
	"dir": "/7/items/FrankenberryCountChoculaTevevisionCommercial1971",
	"files": [
		{
			"name": "FrankenberryCountChoculaTevevisionCommercial1971.thumbs/frankerberry_countchockula_1971.0001_000001.jpg",
			"source": "derivative",
			"format": "Thumbnail",
			"original": "frankerberry_countchockula_1971.0001.mpg",
			"mtime": "1296336956",
			"size": "838",
			"md5": "e47269cd5a82db9594f265a65785ec12",
			"crc32": "165c668b",
			"sha1": "383303d9546c381267569ad4e33aff691f0bb8c7"
		},
		{
			"name": "frankerberry_countchockula_1971.0001.mpg",
			"source": "original",
			"format": "MPEG2",
			"mtime": "1296335803",
			"size": "31625216",
			"md5": "762ba18b026b85b3f074523e7fcb4db0",
			"crc32": "42347f78",
			"sha1": "41162dc2d1a91b618124c84628d0c231544a02be",
			"length": "31.14",
			"height": "480",
			"width": "640"
		}
	],
	"files_count": 17,
	"item_last_updated": 1542761794,
	"item_size": 36431778,
	"metadata": {
		"identifier": "FrankenberryCountChoculaTevevisionCommercial1971",
		"title": "Franken Berry / Count Chocula : Tevevision Commercial 1971",
		"creator": "General Mills",
		"mediatype": "movies",
		"collection": ["classic_tv_commercials", "television"],
		"description": "Count Chocula and Franken Berry were both introduced in 1971. Boo Berry Cereal appeared in 1973 followed by Fruit Brute in 1974. Yummy Mummy appeared more than a decade later in 1988 - completing the the group known as the General Mills Monster Cereals."
	},
	"reviews": [
		{
			"reviewbody": "Sugar cereal cartoon Karloff and Lugosi argue self-importance pre Lorre ghost.  Interesting how kids still know the voices without any idea of the origins.",
			"reviewtitle": "pre booberry",
			"reviewer": "outofthebox",
			"reviewdate": "2016-06-25 23:51:36",
			"stars": "4"
		}
	],
	"server": "ia800202.us.archive.org"
}
```

</details>

### A Manyfest Schema for Count Chocula to Thrive In

With just a small number of element descriptors, we can make this huge blob of JSON very usable for a developer.

```JSON
{
	"Scope": "Archive.org",
	"Descriptors": {
		"d1": {
			"Hash": "Server",
			"Name": "Server",
			"Description": "The primary server to download these files from.",
			"DataType": "String"
		},
		"d2": {
			"Hash": "ServerAlternate",
			"Name": "Alternate Server",
			"Description": "The alternate server to download these files from.",
			"DataType": "String"
		},
		"dir": {
			"Hash": "Path",
			"Name": "Server URL Path",
			"NameShort": "Path",
			"Description": "The path on the server where these files are located."
		},
		"metadata.identifier": {
			"Hash": "GUID",
			"Name": "Globally Unique Identifier",
			"NameShort": "GUID",
			"Description": "Archive.org unique identifier string."
		},
		"metadata.title": {
			"Hash": "Title",
			"Name": "Title",
			"NameShort": "Title",
			"Description": "The title of the media item."
		},
		"metadata.creator": {
			"Hash": "Creator",
			"Name": "Creator",
			"NameShort": "Creator",
			"Description": "The creator of the media item."
		},
		"metadata.mediatype": {
			"Hash": "Type",
			"Name": "Media Type",
			"NameShort": "Type",
			"Description": "The type of media item."
		}
	}
}
```

These two JSON files are in the [examples/chocula](https://github.com/stevenvelozo/manyfest/tree/main/examples/chocula) folder along with a javascript file `Chocula.js` you can try out yourself and hack on.

```javascript
let libManyfest = require('../../source/Manyfest.js');

let dataArchiveOrg = require(`./Data-Archive-org-Frankenberry.json`);
let schemaArchiveOrg = require(`./Schema-Archive-org-Item.json`);

let _Schema = new libManyfest(schemaArchiveOrg);

console.log(`The URL for "${_Schema.getValueByHash(dataArchiveOrg,'Title')}" is: ${_Schema.getValueByHash(dataArchiveOrg,'Server')}${_Schema.getValueByHash(dataArchiveOrg,'Path')}`);
```

### A Manyfest Schema for Book Records

This shows a book record with an Author Key as well.

```JSON
{
	"Scope": "Book",
	"Descriptors": {
		"GUIDBook": {
			"Hash": "GUIDBook",
			"Name": "Book GUID",
			"DataType": "Key",
			"KeyRepresentation": "GUID",
			"GUIDAddress": "GUIDBook",
			"IDAddress": "IDBook"
		},
		"IDBook": {
			"Hash": "IDBook",
			"Name": "Book Identifier",
			"DataType": "Key",
			"KeyRepresentation": "ID",
			"GUIDAddress": "GUIDBook",
			"IDAddress": "IDBook"
		},
		"Title": {
			"Hash": "Title",
			"Name": "Book Title",
			"DataType": "String"
		},
		"IDAuthor": {
			"Hash": "Book_IDAuthor",
			"Name": "Book Primary Author",
			"DataType": "Key",
			"KeyRepresentation": "ID",
			"GUIDAddress": "GUIDAuthor",
			"IDAddress": "IDAuthor"
		}
	}
}
```

Because we expect only one scope to be the controlling scope for a particular key pair, we can use the key pair presence as a mechanism for resolution of IDs to GUIDs when they aren't natural.

What does this mean in practice?

If we have the following Book record:

```JSON
{
	"GUIDBook": "SCIFI-000-Dune",
	"Title": "Dune",
	"GUIDAuthor": "AUTHOR-FRANK-HERBERT"
}
```

And the following Author record:

```JSON
{
	"GUIDAuthor": "AUTHOR-FRANK-HERBERT",
	"IDAuthor": 1001,
	"Name": "Frank Herbert"
}
```

#### This gives rise to the need for a "Key" data type which is a tuple

The tuple will be a GUID or ID, but will represent both.  As long as only one entity in the controlling scope (the Book table for instance) to have *both* the ID and the GUID, this can be used to make that the source of record for the Key.  This allows lookups back and forth between GUID and ID.

1. Author is the canonical source for finding the GUIDAuthor->IDAuthor connection, and vice versa.  Because it is the only record shape in the model space that contains both.
2. GUIDAuthor is not in the Descriptors as a secondary address, but IDAuthor is.  GUIDAuthor is, though, resolvable from the IDAuthor GUIDAddress property.
3. This means we want to treat the "GUIDAuthor"/"IDAuthor" pairing as a single entry in a manyfest, which is a departure from how the rest of them operate.

## Related Packages

- [fable](https://github.com/stevenvelozo/fable) - Application services framework

## License

MIT

## Contributing

Pull requests are welcome. For details on our code of conduct, contribution process, and testing requirements, see the [Retold Contributing Guide](https://github.com/stevenvelozo/retold/blob/main/docs/contributing.md).
