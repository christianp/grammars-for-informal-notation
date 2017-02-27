@{%
function nth(n){return function(d){return d[n]}}
function lift(d){return d[0]}
function unbracket(d){return d[0][0]}

function bracket(tree) {
	switch(tree.tok.type) {
		case 'op':
		case 'function':
			return '('+display(tree)+')';
		default:
			return display(tree);
	}
}

function has_lazy(tree) {
    return tree.tok.lazy==true;
}

function display(tree) {
	try {
	var tok = tree.tok;
	switch(tok.type) {
		case 'op':
			if(tok.prefix) {
				return tok.name+bracket(tree.args[0]);
			} else if(tok.postfix) {
				return bracket(tree.args[0])+tok.name;
			} else {
				return bracket(tree.args[0])+tok.name+bracket(tree.args[1])
			}
		case 'function':
			return tok.name+'('+tree.args.map(display).join(',')+')';
		case 'name':
			return tok.name;
		case 'list':
			return '['+tree.args.map(display).join(',')+']';
		default:
			return tok.value;
	}
	} catch(e) {
		return '';
	}
}

var allReservedWords = [];

%}
String[nd] -> StringChar[$nd {% function(d){return d[0][0]} %}]:* {% function(d){return d[0].join('') } %}
	
StringChar[nd] ->
	  "\\n" {% function(d){return '\n' } %}
	| [{}] {% function(d){return '\\'+d[0]} %}
	| "\\" [^n] {% nth(1) %}
	| $nd {% function(d,l,r){if('{}\\'.indexOf(d[0])!=-1){return r}; return d[0][0]} %}
	
QuotedString[d,nd] -> $d String[$nd] $d {% function(d){return {tok:{type:'string',value:d[1]}}} %}

main -> Assignment | Expression {% function(d){ return {tree:d[0],str:display(d[0])} } %}

Assignment -> 
	Name ws "=" ws Expression (null | ws "or" ws Expression {% nth(3) %}) {% function(d) {
		var name = d[0];
		var a1 = d[2];
		var a2 = d[3];
		var arg;
		if(a2) {
			arg = {tok:{type:"op",name:"or"},args:[a1,a2]};
		} else {
			arg = a1;
		}
		return {tok:{type:"op",name:"="},args:[name,arg]}
	} %}
	| Name ws "=" Expression ws "or" ws Name ws "=" ws Expression {% function(d,l,r){return  } %}

Expression ->
	OpLevel13 {% lift %}

LeftBinaryOp[ops,this,next] ->
	  $next ws $ops ws $this {% function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} } %}
	| $next {% unbracket %}

RightBinaryOp[ops,this,next] ->
	  $this ws $ops ws $next {% function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} } %}
	| $next {% unbracket %}

OpLevel13 -> RightBinaryOp[("xor"),OpLevel13,OpLevel12] {% lift %}
OpLevel12 -> RightBinaryOp[("or"|"||"),OpLevel12,OpLevel11] {% lift %}
OpLevel11 -> RightBinaryOp[("and"|"&&"),OpLevel11,OpLevel9] {% lift %}
OpLevel9 -> RightBinaryOp[("isa"),OpLevel9,OpLevel8] {% lift %}
OpLevel8 -> RightBinaryOp[("<>"|"="),OpLevel8,OpLevel7] {% lift %}
OpLevel7 -> RightBinaryOp[(">="|"<="|">"|"<"),OpLevel7,OpLevel6_5] {% lift %}
OpLevel6_5 -> RightBinaryOp[("in"|"except"),OpLevel6_5,OpLevel6] {% lift %}
OpLevel6 -> RightBinaryOp[("#"),OpLevel6,OpLevel5_5] {% lift %}
OpLevel5_5 -> RightBinaryOp[(".."),OpLevel5_5,OpLevel5] {% lift %}
OpLevel5 -> RightBinaryOp[("|"),OpLevel5,OpLevel4] {% lift %}
OpLevel4 -> RightBinaryOp[("+"|"-"),OpLevel4,OpLevel3] {% lift %}
OpLevel3 -> RightBinaryOp[("*"|"/"),OpLevel3,OpLevel2] {% lift %}
OpLevel2 -> LeftBinaryOp[("^"),OpLevel2,AtomExpression] {% lift %}

AtomExpression ->
	  Atom Trailer {% function(d){ return {tok:{type:"function",name:"listval"},args:d} } %}
	| Atom {% lift %}
	| PrefixExpression {% lift %}
	| Atom PostfixOp {% function(d) { return {tok:d[1].tok,args:[d[0]]} } %}
	
PrefixExpression ->
	(PrefixOp ws {% nth(0) %}):+ Atom {% function(d) { var tree = {tok:d[0][0]}; var current = tree; d[0].slice(1).forEach(function(b) { var btree = {tok:b}; current.args = [btree]; current = btree; }); current.args = [d[1]]; return tree;} %}
	
PrefixOp -> ("+"|"-") {% function(d) {return {type:'op',name:d[0][0],prefix:true} } %}
PostfixOp -> ("!") {% function(d) {return {tok:{type:'op',name:d[0][0],postfix:true}} } %}
	
Trailer -> "[" Expression "]" {% nth(1) %}

Atom -> (BracketedExpression | List | FunctionApplication | LazyMultiplication | Literal) {% unbracket %}

List -> "[" ArgsList "]" {% function(d){ return {tok:{type:'list'},args:d[1]} } %}

ArgsList -> 
	  null {% function(d){return []} %}
	| StrictArgsList {% lift %}
	
StrictArgsList -> Expression ("," Expression {% nth(1) %}):* {% function(d) { return [d[0]].concat(d[1]) } %}

BracketedExpression -> "(" Expression ")" {% nth(1) %}
	
FunctionApplication -> FunctionName "(" ArgsList ")" {% function(d){ return {tok:{type:"function",name:d[0].tok.name},args:d[2]} } %}

FunctionName -> Name {% lift %}
FunctionName -> "log_" Number {% function(d) { return {tok:{type:"name",name:"log",base:d[1]}} } %}

LazyMultiplication -> 
	AtomExpression (ws) AtomExpression {% function(d,l,r){if(has_lazy(d[0]) || has_lazy(d[2])) {return r;} return {tok:{type:"op",name:"*",lazy:true},args:[d[0],d[2]]} } %}

Literal -> (Boolean | Name | Number | String) {% function(d){ return d[0][0] } %}

String -> 
	  QuotedString["'",[^']] {% lift %}
	| QuotedString["\"",[^"]] {% lift %}

Name -> (AnnotatedName | BareName ) {% unbracket %}

AnnotatedName -> 
    (Annotation ":" {% nth(0) %}):+ BareName 
        {% function(d){ var tok = d[1]; tok.annotations = d[0]; return tok } %}

Annotation -> [a-zA-Z]:+ {% function(d){return d[0].join('')} %}

BareName -> 
    ValidName {% function(d){ return {tok:{type:'name',name:d[0]}} } %}

ValidName ->
    RawName {% function(d,l,r) {
        var name = d[0];
        if(allReservedWords.indexOf(name)!=-1) {
            return r;
        } else {
            return name
        }
    } %}

RawName ->
    (null|"$") [a-zA-Z] [a-zA-Z0-9_]:* "'":* 
        {% function(d) {return (d[0]||'')+d[1]+d[2].join('')+d[3].join('') } %}

Number -> 
	  NumberLiteral {% function(d){ return {tok:{type:"number",value:parseFloat(d[0]),original:d[0]}} } %}
	| SpecialNumber {% lift %}
	
SpecialNumber ->
	  "e" {% function(d){return {tok:{type:"number",value:Math.E}}} %}
	| "pi" {% function(d){return {tok:{type:"number",value:Math.PI}}} %}

NumberLiteral -> 
      [0-9]:+ {% function(d){return d[0].join('')} %}
    | [0-9]:+ "." [0-9]:+ {% function(d){return d[0].join('')+d[1]+d[2].join('')} %}

Boolean ->
	(
		  "true" {% function(d){return true} %}
		| "false" {% function(d){return false} %}
	) {% function(d){return {tok:{type:"boolean",value:d[0]}} } %}

ws -> [\s]:* {% function(d){ return null } %}

