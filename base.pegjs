{
    var types = Numbas.jme.types;
}

StartExpression = Expression;

left associative binary operator "^" precedence 2;
binary operator "*" precedence 3;
binary operator "/" precedence 3;
binary operator "+" precedence 4;
binary operator "-" precedence 4;
binary operator "|" precedence 5;
binary operator ".." precedence 5.5;
binary operator "#" precedence 6;
binary operator "except" precedence 6.5;
binary operator "in" precedence 6.5;
binary operator "<" precedence 7;
binary operator ">" precedence 7;
binary operator "<=" precedence 7;
binary operator ">=" precedence 7;
binary operator "<>" precedence 8;
binary operator "=" precedence 8;
binary operator "isa" precedence 9;
binary operator "and" precedence 11;
binary operator "or" precedence 12;
binary operator "xor" precedence 13;
binary operator "implies" precedence 14;
binary operator "q" precedence 14;
binary operator "@" precedence 14;

AtomExpression
  = atom:Atom trailer:Trailer {return {tok: new types.TFunc('listval'),args:[atom,trailer]}} / Atom

Trailer
  = "[" expr:Expression "]" {return expr}
  
atom BracketedExpression = "(" expr:Expression ")" {return expr} ;
atom List = "[" ws args:ArgsList? ws "]" {return {tok:new types.TList(),args:args}};
atom FunctionApplication = name:Name "(" args:ArgsList? ")" {return {tok: new types.TFunc(name.tok.name,name.tok.annotation), args: args}};
atom before BracketedExpression LazyMultiplication 
  = a:(NumberLiteral / BracketedExpression) ws b:(BracketedExpression)  {return {tok: new types.TOp('*'),args:[a,b]}} 
  / a:(NumberLiteral / Name / BracketedExpression) ws b:(Name / SpecialNumber) {return {tok: new types.TOp('*'),args:[a,b]}};
atom Literal = Bool / Name / Number / String;
 
StrictArgsList = first:Expression rest:(ws "," ws arg:Expression {return arg})* {return [first].concat(rest)}
ArgsList "arguments list" = args:StrictArgsList? (ws "," ws)? {return args||[]}

Bool 
  = v:(("true"i {return true}) / ("false"i {return false})) {return {tok: new types.TBool(v)}}
  
NumberLiteral = n:(int:([0-9]+) rest:("\x2E" decimals:([0-9]+) {return "."+decimals.join('')})? {return parseFloat(int+(rest? rest : ""))}) {return {tok:new types.TNum(n)}}

special number "i" = {Numbas.math.complex(0,1)}
special number "infinity" = {Infinity}
special number "infty" = {Infinity}
special number "e" = {Math.E}
special number "pi" = {Math.PI}

Name = AnnotatedName / BareName
AnnotatedName = annotations:(bit:([a-zA-Z]+)":" {return bit.join('')})* name:BareName {name.tok.annotation = annotations; return name}
BareName = name:ValidName {return {tok:new types.TName(name)}}
RawName = dollar:"$"? chars:(a:[a-zA-Z_] rest:[a-zA-Z0-9_]* {return a+rest.join('')}) primes:"'"* {return (dollar||"")+chars+(primes.join(''))}

prefix operator "+" as "+u";
prefix operator "-" as "-u";
prefix operator "!" as "not";

postfix operator "!" as "fact";

String 
  = 
   s:(  '"' characters:("\\n" {return '\n'} / c:[{}] {return '\\'+c} / "\\" c:. {return c}/[^"])* '"' {return characters.join('')}
    / "'" characters:("\\" c:. {return c}/[^'])* "'" {return characters.join('')}
   ) {return {tok:new types.TString(s)}}
  
ws "whitespace" = [ \t\n]*

