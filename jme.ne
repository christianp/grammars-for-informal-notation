@{%
function nth(n){return function(d){return d[n]}}
function lift(d){return d[0]}
function unbracket(d){return d[0][0]}

var allReservedWords = ["true","false"];

%}
String[nd] -> StringChar[$nd {% function(d){return d[0][0]} %}]:* {% function(d){return d[0].join('') } %}
	
StringChar[nd] ->
	  "\\n" {% function(d){return '\n' } %}
	| [{}] {% function(d){return '\\'+d[0]} %}
	| "\\" [^n] {% nth(1) %}
	| $nd {% function(d,l,r){if('{}\\'.indexOf(d[0])!=-1){return r}; return d[0][0]} %}
	
QuotedString[d,nd] -> $d String[$nd] $d {% function(d){return d[1]} %}

main -> Expression {% lift %}

Expression ->
	OpLevel4 {% lift %}

LeftBinaryOp[ops,this,next] ->
	  $this $ops $next {% function(d){ return {tok:{type:'op',name:d[1][0][0]},args:[d[0],d[1]]} } %}
	| $next {% unbracket %}

RightBinaryOp[ops,this,next] ->
	  $next $ops $this {% function(d){ return {tok:{type:'op',name:d[1][0][0]},args:[d[0],d[1]]} } %}
	| $next {% unbracket %}

OpLevel4 -> RightBinaryOp[("+"|"-"),OpLevel4,AtomExpression] {% lift %}

AtomExpression ->
	  Atom Trailer {% function(d){ return {tok:{type:"function",name:"listval"},args:d} } %}
	| Atom {% lift %}
	
Trailer -> "[" Expression "]" {% nth(1) %}
	
Atom -> (Boolean | Name | Number | String) {% function(d){ return d[0][0] } %}

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

Number -> NumberLiteral {% function(d){ return {tok:{type:"number",value:parseFloat(d[0]),original:d[0]}} } %}

NumberLiteral -> 
      [0-9]:+ {% function(d){return d[0].join('')} %}
    | [0-9]:+ "." [0-9]:+ {% function(d){return d[0].join('')+d[1]+d[2].join('')} %}

Boolean ->
	(
		  "true" {% function(d){return true} %}
		| "false" {% function(d){return false} %}
	) {% function(d){return {tok:{type:"boolean",value:d[0]}} } %}
