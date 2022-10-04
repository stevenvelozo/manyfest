# Manyfest

## JSON Object Manifest for Data Description and Parsing

We focus so much on documentation and description for the mechanics of data at rest, in software development.  Schema for databases.  Well-named variables in code, with comments.  Expressive languages for writing software or querying graphs of information.

As data crosses these boundaries, though, context is lost.  We reinvent the wheel at each layer!  The front-end code has its own mechanism for putting a label before a value to the user.  It is rare that there are less than three representations of an important piece of data across:

* The Data Persistence Engine _(e.g. a SQL server table, or schemaless storage)_
* Middle Tier Source Code _(e.g. an API service)_
* Front End Source Code _(e.g. the code behind for a single page app)_
* The User Interface _(e.g. a label on a web form)_

Manyfest's purpose is to solve this problem by creating a simple pattern to describe, validate, manipulate and interpret data.

![Official Mascot](https://github.com/stevenvelozo/Manyfest/raw/master/diagrams/Mascot.png)

_Man-E-Faces approves of Manyfest!_

## Where Does this Run

Either of a stand-alone library in node.js software, or, a dependency-free browser library.

### Compatiblity

This library is tested for node.js versions 8 through 16, and will likely work in future versions.  It is implemented as a simple set of es6 classes.

The browser version has been packaged into a minified as well as an expanded debuggable library.  Sourcemaps are included.

## Installation

For use within node.js, run the following in the folder with your `package.json` file:

```
npm install --save Manyfest
```

Then, you can include it in your source code as follows:

```
const libManyfest = require('Manyfest');

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
| Scope | The scope of this representation; generally the clustered or parent record name (e.g. Animal, User, Transaction, etc.) -- does not have functional purpose; only for information and logging. |
| Schema | The stateful representation of an object's structural definition. |
| Element | A defined element of data in an object. |
| Address | The address where that data lies in the object. |
| Descriptor | A description of an element including data such as Name, NameShort, Hash, Description, and other important properties. |
| Name | The name of the element.  Meant to be the most succinct human readable name possible. |
| NameShort | A shorter name for the element.  Meant to be useful enough to identify the property in log lines, tabular views, graphs and anywhere where we don't always want to see the full name. |
| Description | A description for the element.  Very useful when consuming other APIs with their own terse naming standards (or no naming standards)! |
| Hash | A unique within this scope string-based key for this element.  Used for easy access of data. |
| Constraint | A validation constraint for an element such as MaxLength, MinLength, Required, Default and such. |

## A More Advanced Schema Example

Addresses are meant to be kinda magic.  They describe locations in nested JSON just as well as simple objects.  Further, they can allow us to manipulate and read JSON values at specific addresses.


Let's use our Animal schema and extend it a little bit.  In this case, a new JSON sub object needs to be included carrying important medical information about this animal.

```
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
                        "Description":"The most comfortable temperature for this animal to survive in."}
            }
    });
```

Notice in this example, the addresses are more complex.  They have a dot syntax.  This notifies Manyfest that they are nested values.  Further, there is both a Name and a NameShort descriptor setup.  This gives us a framework for consistently referring to the data element both internally and to the user.  It is no longer a mystery what someAnimal.MedicalStats.Temps.CET means.  Developers, user interface designers, database engineers, product managers and other folks who work on the software side don't have to maintain a third body of documentation about what the data means.

To aid in this discovery, reference and such, we've given it a NameShort (for use in things like tabular views and graphs/charts), a longer Name and a Hash (to enable easy reading and writing using the object element read/write functions described later in this documentation).

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

```
// Write Code
let newAnimal = {};

// This is going to make a terrible error happen
newAnimal.MedicalStats.HeartReat.RestingHeartRate.OverallAverage = 61;
```

```
// Read Code
let newAnimal = {};

// This is going to make a terrible error happen
console.log(newAnimal.MedicalStats.HeartReat.RestingHeartRate.OverallAverage);

// My javascript interpreter said this when I tried this code:
// > Uncaught TypeError: Cannot read properties of undefined (reading 'HeartReat')
```

#### The Manyfest Way

However with the Manyfest reading and writing methods you can do this (all in one example since it doesn't blow up):

```
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

```
let favAnimal = favoriteAnimalAPI();

console.log(animalManyfest.getValueByHash(favAnimal,'ComfET'));
```

For any elements that haven't defined a Hash, the Address is used.  This allows code to gracefully fall back.

## Programmatically Defining a Schema

Sometimes we don't have schemas, and want to define object element structure on the fly.  This can be done programmatically.  As a refresher, here is how we loaded our simplest schema manifest above:

```
const libManyfest = require('Manyfest');

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

```
const libManyfest = require('Manyfest');

// Construct a Manyfest with a few defined columns
let animalManyfest = new libManyfest();

// Set the Scope
animalManyfest.Scope = "Animal";

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