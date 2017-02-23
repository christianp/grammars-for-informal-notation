We're working on a system which can parse student's ambiguous mathematical notation.

1. Offer suggestions or decided what is meant based on context.
2. Flexible parsing rules based on commonly used mathematical contexts. 
3. Output the resulting parse-trees in a variety of languages, e.g. LaTeX, Maxima.

The longer term goal of this work is to use the resulting parser in an online assessment system with students.

## Parsing libraries

* [PEGjs](https://pegjs.org/) - creates simple, unambiguous parsers.
* [Nearley](http://nearley.js.org/) - creates very versatile parsers, and returns multiple results for ambiguous grammars. 
