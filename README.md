We're working on coming up with a system which can parse student's ambiguous notation and either offer suggestions or decided what is meant based on context.

## To run the tests

* Install [npm](https://www.npmjs.com/)
* Install nearley: `npm install nearley`
* Compile the grammar to JavaScript: `make jme-nearley.js`
* Now [test.html](test.html) should work.

## Parsing libraries

* [PEGjs](https://pegjs.org/) - creates simple, unambiguous parsers.
* [Nearley](http://nearley.js.org/) - creates very versatile parsers, and returns multiple results for ambiguous grammars. 
