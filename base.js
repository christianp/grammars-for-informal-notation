var baseSource="\n\
{\n\
    var types = Numbas.jme.types;\n\
}\n\
\n\
StartExpression = Expression;\n\
\n\
left associative binary operator \"^\" precedence 2;\n\
binary operator \"*\" precedence 3;\n\
binary operator \"/\" precedence 3;\n\
binary operator \"+\" precedence 4;\n\
binary operator \"-\" precedence 4;\n\
binary operator \"|\" precedence 5;\n\
binary operator \"..\" precedence 5.5;\n\
binary operator \"#\" precedence 6;\n\
binary operator \"except\" precedence 6.5;\n\
binary operator \"in\" precedence 6.5;\n\
binary operator \"<\" precedence 7;\n\
binary operator \">\" precedence 7;\n\
binary operator \"<=\" precedence 7;\n\
binary operator \">=\" precedence 7;\n\
binary operator \"<>\" precedence 8;\n\
binary operator \"=\" precedence 8;\n\
binary operator \"isa\" precedence 9;\n\
binary operator \"and\" precedence 11;\n\
binary operator \"or\" precedence 12;\n\
binary operator \"xor\" precedence 13;\n\
binary operator \"implies\" precedence 14;\n\
binary operator \"q\" precedence 14;\n\
binary operator \"@\" precedence 14;\n\
\n\
AtomExpression\n\
  = atom:Atom trailer:Trailer {return {tok: new types.TFunc('listval'),args:[atom,trailer]}} / Atom\n\
\n\
Trailer\n\
  = \"[\" expr:Expression \"]\" {return expr}\n\
  \n\
atom BracketedExpression = \"(\" expr:Expression \")\" {return expr} ;\n\
atom List = \"[\" ws args:ArgsList? ws \"]\" {return {tok:new types.TList(),args:args}};\n\
atom FunctionApplication = name:Name \"(\" args:ArgsList? \")\" {return {tok: new types.TFunc(name.tok.name,name.tok.annotation), args: args}};\n\
atom before BracketedExpression LazyMultiplication \n\
  = a:(NumberLiteral / BracketedExpression) ws b:(BracketedExpression)  {return {tok: new types.TOp('*'),args:[a,b]}} \n\
  / a:(NumberLiteral / Name / BracketedExpression) ws b:(Name / SpecialNumber) {return {tok: new types.TOp('*'),args:[a,b]}};\n\
atom Literal = Bool / Name / Number / String;\n\
 \n\
StrictArgsList = first:Expression rest:(ws \",\" ws arg:Expression {return arg})* {return [first].concat(rest)}\n\
ArgsList \"arguments list\" = args:StrictArgsList? (ws \",\" ws)? {return args||[]}\n\
\n\
Bool \n\
  = v:((\"true\"i {return true}) / (\"false\"i {return false})) {return {tok: new types.TBool(v)}}\n\
  \n\
NumberLiteral = n:(int:([0-9]+) rest:(\"\\x2E\" decimals:([0-9]+) {return \".\"+decimals.join('')})? {return parseFloat(int+(rest? rest : \"\"))}) {return {tok:new types.TNum(n)}}\n\
\n\
special number \"i\" = {Numbas.math.complex(0,1)}\n\
special number \"infinity\" = {Infinity}\n\
special number \"infty\" = {Infinity}\n\
special number \"e\" = {Math.E}\n\
special number \"pi\" = {Math.PI}\n\
\n\
Name = AnnotatedName / BareName\n\
AnnotatedName = annotations:(bit:([a-zA-Z]+)\":\" {return bit.join('')})* name:BareName {name.tok.annotation = annotations; return name}\n\
BareName = name:ValidName {return {tok:new types.TName(name)}}\n\
RawName = dollar:\"$\"? chars:(a:[a-zA-Z_] rest:[a-zA-Z0-9_]* {return a+rest.join('')}) primes:\"'\"* {return (dollar||\"\")+chars+(primes.join(''))}\n\
\n\
prefix operator \"+\" as \"+u\";\n\
prefix operator \"-\" as \"-u\";\n\
prefix operator \"!\" as \"not\";\n\
\n\
postfix operator \"!\" as \"fact\";\n\
\n\
String \n\
  = \n\
   s:(  '\"' characters:(\"\\\\n\" {return '\\n'} / c:[{}] {return '\\\\'+c} / \"\\\\\" c:. {return c}/[^\"])* '\"' {return characters.join('')}\n\
    / \"'\" characters:(\"\\\\\" c:. {return c}/[^'])* \"'\" {return characters.join('')}\n\
   ) {return {tok:new types.TString(s)}}\n\
  \n\
ws \"whitespace\" = [ \\t\\n]*\n\
\n\
"
