// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

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

var grammar = {
    ParserRules: [
    {"name": "main", "symbols": ["Assignment"]},
    {"name": "main", "symbols": ["Expression"], "postprocess": function(d){ return {tree:d[0],str:display(d[0])} }},
    {"name": "Assignment$subexpression$1", "symbols": []},
    {"name": "Assignment$subexpression$1$string$1", "symbols": [{"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Assignment$subexpression$1", "symbols": ["ws", "Assignment$subexpression$1$string$1", "ws", "Expression"], "postprocess": nth(3)},
    {"name": "Assignment", "symbols": ["Name", "ws", {"literal":"="}, "ws", "Expression", "Assignment$subexpression$1"], "postprocess":  function(d) {
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
        } },
    {"name": "Assignment$string$1", "symbols": [{"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Assignment", "symbols": ["Name", "ws", {"literal":"="}, "Expression", "ws", "Assignment$string$1", "ws", "Name", "ws", {"literal":"="}, "ws", "Expression"], "postprocess": function(d,l,r){return  }},
    {"name": "Expression", "symbols": ["OpLevel13"], "postprocess": lift},
    {"name": "OpLevel13$macrocall$2$subexpression$1$string$1", "symbols": [{"literal":"x"}, {"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel13$macrocall$2$subexpression$1", "symbols": ["OpLevel13$macrocall$2$subexpression$1$string$1"]},
    {"name": "OpLevel13$macrocall$2", "symbols": ["OpLevel13$macrocall$2$subexpression$1"]},
    {"name": "OpLevel13$macrocall$3", "symbols": ["OpLevel13"]},
    {"name": "OpLevel13$macrocall$4", "symbols": ["OpLevel12"]},
    {"name": "OpLevel13$macrocall$1", "symbols": ["OpLevel13$macrocall$3", "ws", "OpLevel13$macrocall$2", "ws", "OpLevel13$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel13$macrocall$1", "symbols": ["OpLevel13$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel13", "symbols": ["OpLevel13$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel12$macrocall$2$subexpression$1$string$1", "symbols": [{"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel12$macrocall$2$subexpression$1", "symbols": ["OpLevel12$macrocall$2$subexpression$1$string$1"]},
    {"name": "OpLevel12$macrocall$2$subexpression$1$string$2", "symbols": [{"literal":"|"}, {"literal":"|"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel12$macrocall$2$subexpression$1", "symbols": ["OpLevel12$macrocall$2$subexpression$1$string$2"]},
    {"name": "OpLevel12$macrocall$2", "symbols": ["OpLevel12$macrocall$2$subexpression$1"]},
    {"name": "OpLevel12$macrocall$3", "symbols": ["OpLevel12"]},
    {"name": "OpLevel12$macrocall$4", "symbols": ["OpLevel11"]},
    {"name": "OpLevel12$macrocall$1", "symbols": ["OpLevel12$macrocall$3", "ws", "OpLevel12$macrocall$2", "ws", "OpLevel12$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel12$macrocall$1", "symbols": ["OpLevel12$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel12", "symbols": ["OpLevel12$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel11$macrocall$2$subexpression$1$string$1", "symbols": [{"literal":"a"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel11$macrocall$2$subexpression$1", "symbols": ["OpLevel11$macrocall$2$subexpression$1$string$1"]},
    {"name": "OpLevel11$macrocall$2$subexpression$1$string$2", "symbols": [{"literal":"&"}, {"literal":"&"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel11$macrocall$2$subexpression$1", "symbols": ["OpLevel11$macrocall$2$subexpression$1$string$2"]},
    {"name": "OpLevel11$macrocall$2", "symbols": ["OpLevel11$macrocall$2$subexpression$1"]},
    {"name": "OpLevel11$macrocall$3", "symbols": ["OpLevel11"]},
    {"name": "OpLevel11$macrocall$4", "symbols": ["OpLevel9"]},
    {"name": "OpLevel11$macrocall$1", "symbols": ["OpLevel11$macrocall$3", "ws", "OpLevel11$macrocall$2", "ws", "OpLevel11$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel11$macrocall$1", "symbols": ["OpLevel11$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel11", "symbols": ["OpLevel11$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel9$macrocall$2$subexpression$1$string$1", "symbols": [{"literal":"i"}, {"literal":"s"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel9$macrocall$2$subexpression$1", "symbols": ["OpLevel9$macrocall$2$subexpression$1$string$1"]},
    {"name": "OpLevel9$macrocall$2", "symbols": ["OpLevel9$macrocall$2$subexpression$1"]},
    {"name": "OpLevel9$macrocall$3", "symbols": ["OpLevel9"]},
    {"name": "OpLevel9$macrocall$4", "symbols": ["OpLevel8"]},
    {"name": "OpLevel9$macrocall$1", "symbols": ["OpLevel9$macrocall$3", "ws", "OpLevel9$macrocall$2", "ws", "OpLevel9$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel9$macrocall$1", "symbols": ["OpLevel9$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel9", "symbols": ["OpLevel9$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel8$macrocall$2$subexpression$1$string$1", "symbols": [{"literal":"<"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel8$macrocall$2$subexpression$1", "symbols": ["OpLevel8$macrocall$2$subexpression$1$string$1"]},
    {"name": "OpLevel8$macrocall$2$subexpression$1", "symbols": [{"literal":"="}]},
    {"name": "OpLevel8$macrocall$2", "symbols": ["OpLevel8$macrocall$2$subexpression$1"]},
    {"name": "OpLevel8$macrocall$3", "symbols": ["OpLevel8"]},
    {"name": "OpLevel8$macrocall$4", "symbols": ["OpLevel7"]},
    {"name": "OpLevel8$macrocall$1", "symbols": ["OpLevel8$macrocall$3", "ws", "OpLevel8$macrocall$2", "ws", "OpLevel8$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel8$macrocall$1", "symbols": ["OpLevel8$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel8", "symbols": ["OpLevel8$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel7$macrocall$2$subexpression$1$string$1", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel7$macrocall$2$subexpression$1", "symbols": ["OpLevel7$macrocall$2$subexpression$1$string$1"]},
    {"name": "OpLevel7$macrocall$2$subexpression$1$string$2", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel7$macrocall$2$subexpression$1", "symbols": ["OpLevel7$macrocall$2$subexpression$1$string$2"]},
    {"name": "OpLevel7$macrocall$2$subexpression$1", "symbols": [{"literal":">"}]},
    {"name": "OpLevel7$macrocall$2$subexpression$1", "symbols": [{"literal":"<"}]},
    {"name": "OpLevel7$macrocall$2", "symbols": ["OpLevel7$macrocall$2$subexpression$1"]},
    {"name": "OpLevel7$macrocall$3", "symbols": ["OpLevel7"]},
    {"name": "OpLevel7$macrocall$4", "symbols": ["OpLevel6_5"]},
    {"name": "OpLevel7$macrocall$1", "symbols": ["OpLevel7$macrocall$3", "ws", "OpLevel7$macrocall$2", "ws", "OpLevel7$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel7$macrocall$1", "symbols": ["OpLevel7$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel7", "symbols": ["OpLevel7$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel6_5$macrocall$2$subexpression$1$string$1", "symbols": [{"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel6_5$macrocall$2$subexpression$1", "symbols": ["OpLevel6_5$macrocall$2$subexpression$1$string$1"]},
    {"name": "OpLevel6_5$macrocall$2$subexpression$1$string$2", "symbols": [{"literal":"e"}, {"literal":"x"}, {"literal":"c"}, {"literal":"e"}, {"literal":"p"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel6_5$macrocall$2$subexpression$1", "symbols": ["OpLevel6_5$macrocall$2$subexpression$1$string$2"]},
    {"name": "OpLevel6_5$macrocall$2", "symbols": ["OpLevel6_5$macrocall$2$subexpression$1"]},
    {"name": "OpLevel6_5$macrocall$3", "symbols": ["OpLevel6_5"]},
    {"name": "OpLevel6_5$macrocall$4", "symbols": ["OpLevel6"]},
    {"name": "OpLevel6_5$macrocall$1", "symbols": ["OpLevel6_5$macrocall$3", "ws", "OpLevel6_5$macrocall$2", "ws", "OpLevel6_5$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel6_5$macrocall$1", "symbols": ["OpLevel6_5$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel6_5", "symbols": ["OpLevel6_5$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel6$macrocall$2$subexpression$1", "symbols": [{"literal":"#"}]},
    {"name": "OpLevel6$macrocall$2", "symbols": ["OpLevel6$macrocall$2$subexpression$1"]},
    {"name": "OpLevel6$macrocall$3", "symbols": ["OpLevel6"]},
    {"name": "OpLevel6$macrocall$4", "symbols": ["OpLevel5_5"]},
    {"name": "OpLevel6$macrocall$1", "symbols": ["OpLevel6$macrocall$3", "ws", "OpLevel6$macrocall$2", "ws", "OpLevel6$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel6$macrocall$1", "symbols": ["OpLevel6$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel6", "symbols": ["OpLevel6$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel5_5$macrocall$2$subexpression$1$string$1", "symbols": [{"literal":"."}, {"literal":"."}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OpLevel5_5$macrocall$2$subexpression$1", "symbols": ["OpLevel5_5$macrocall$2$subexpression$1$string$1"]},
    {"name": "OpLevel5_5$macrocall$2", "symbols": ["OpLevel5_5$macrocall$2$subexpression$1"]},
    {"name": "OpLevel5_5$macrocall$3", "symbols": ["OpLevel5_5"]},
    {"name": "OpLevel5_5$macrocall$4", "symbols": ["OpLevel5"]},
    {"name": "OpLevel5_5$macrocall$1", "symbols": ["OpLevel5_5$macrocall$3", "ws", "OpLevel5_5$macrocall$2", "ws", "OpLevel5_5$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel5_5$macrocall$1", "symbols": ["OpLevel5_5$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel5_5", "symbols": ["OpLevel5_5$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel5$macrocall$2$subexpression$1", "symbols": [{"literal":"|"}]},
    {"name": "OpLevel5$macrocall$2", "symbols": ["OpLevel5$macrocall$2$subexpression$1"]},
    {"name": "OpLevel5$macrocall$3", "symbols": ["OpLevel5"]},
    {"name": "OpLevel5$macrocall$4", "symbols": ["OpLevel4"]},
    {"name": "OpLevel5$macrocall$1", "symbols": ["OpLevel5$macrocall$3", "ws", "OpLevel5$macrocall$2", "ws", "OpLevel5$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel5$macrocall$1", "symbols": ["OpLevel5$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel5", "symbols": ["OpLevel5$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel4$macrocall$2$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "OpLevel4$macrocall$2$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "OpLevel4$macrocall$2", "symbols": ["OpLevel4$macrocall$2$subexpression$1"]},
    {"name": "OpLevel4$macrocall$3", "symbols": ["OpLevel4"]},
    {"name": "OpLevel4$macrocall$4", "symbols": ["OpLevel3"]},
    {"name": "OpLevel4$macrocall$1", "symbols": ["OpLevel4$macrocall$3", "ws", "OpLevel4$macrocall$2", "ws", "OpLevel4$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel4$macrocall$1", "symbols": ["OpLevel4$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel4", "symbols": ["OpLevel4$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel3$macrocall$2$subexpression$1", "symbols": [{"literal":"*"}]},
    {"name": "OpLevel3$macrocall$2$subexpression$1", "symbols": [{"literal":"/"}]},
    {"name": "OpLevel3$macrocall$2", "symbols": ["OpLevel3$macrocall$2$subexpression$1"]},
    {"name": "OpLevel3$macrocall$3", "symbols": ["OpLevel3"]},
    {"name": "OpLevel3$macrocall$4", "symbols": ["OpLevel2"]},
    {"name": "OpLevel3$macrocall$1", "symbols": ["OpLevel3$macrocall$3", "ws", "OpLevel3$macrocall$2", "ws", "OpLevel3$macrocall$4"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel3$macrocall$1", "symbols": ["OpLevel3$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel3", "symbols": ["OpLevel3$macrocall$1"], "postprocess": lift},
    {"name": "OpLevel2$macrocall$2$subexpression$1", "symbols": [{"literal":"^"}]},
    {"name": "OpLevel2$macrocall$2", "symbols": ["OpLevel2$macrocall$2$subexpression$1"]},
    {"name": "OpLevel2$macrocall$3", "symbols": ["OpLevel2"]},
    {"name": "OpLevel2$macrocall$4", "symbols": ["AtomExpression"]},
    {"name": "OpLevel2$macrocall$1", "symbols": ["OpLevel2$macrocall$4", "ws", "OpLevel2$macrocall$2", "ws", "OpLevel2$macrocall$3"], "postprocess": function(d){ return {tok:{type:'op',name:d[2][0][0]},args:[d[0][0],d[4][0]]} }},
    {"name": "OpLevel2$macrocall$1", "symbols": ["OpLevel2$macrocall$4"], "postprocess": unbracket},
    {"name": "OpLevel2", "symbols": ["OpLevel2$macrocall$1"], "postprocess": lift},
    {"name": "AtomExpression", "symbols": ["Atom", "Trailer"], "postprocess": function(d){ return {tok:{type:"function",name:"listval"},args:d} }},
    {"name": "AtomExpression", "symbols": ["Atom"], "postprocess": lift},
    {"name": "AtomExpression", "symbols": ["PrefixExpression"], "postprocess": lift},
    {"name": "AtomExpression", "symbols": ["Atom", "PostfixOp"], "postprocess": function(d) { return {tok:d[1].tok,args:[d[0]]} }},
    {"name": "PrefixExpression$ebnf$1$subexpression$1", "symbols": ["PrefixOp", "ws"], "postprocess": nth(0)},
    {"name": "PrefixExpression$ebnf$1", "symbols": ["PrefixExpression$ebnf$1$subexpression$1"]},
    {"name": "PrefixExpression$ebnf$1$subexpression$2", "symbols": ["PrefixOp", "ws"], "postprocess": nth(0)},
    {"name": "PrefixExpression$ebnf$1", "symbols": ["PrefixExpression$ebnf$1$subexpression$2", "PrefixExpression$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "PrefixExpression", "symbols": ["PrefixExpression$ebnf$1", "Atom"], "postprocess": function(d) { var tree = {tok:d[0][0]}; var current = tree; d[0].slice(1).forEach(function(b) { var btree = {tok:b}; current.args = [btree]; current = btree; }); current.args = [d[1]]; return tree;}},
    {"name": "PrefixOp$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "PrefixOp$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "PrefixOp", "symbols": ["PrefixOp$subexpression$1"], "postprocess": function(d) {return {type:'op',name:d[0][0],prefix:true} }},
    {"name": "PostfixOp$subexpression$1", "symbols": [{"literal":"!"}]},
    {"name": "PostfixOp", "symbols": ["PostfixOp$subexpression$1"], "postprocess": function(d) {return {tok:{type:'op',name:d[0][0],postfix:true}} }},
    {"name": "Trailer", "symbols": [{"literal":"["}, "Expression", {"literal":"]"}], "postprocess": nth(1)},
    {"name": "Atom$subexpression$1", "symbols": ["BracketedExpression"]},
    {"name": "Atom$subexpression$1", "symbols": ["List"]},
    {"name": "Atom$subexpression$1", "symbols": ["FunctionApplication"]},
    {"name": "Atom$subexpression$1", "symbols": ["LazyMultiplication"]},
    {"name": "Atom$subexpression$1", "symbols": ["Literal"]},
    {"name": "Atom", "symbols": ["Atom$subexpression$1"], "postprocess": unbracket},
    {"name": "List", "symbols": [{"literal":"["}, "ArgsList", {"literal":"]"}], "postprocess": function(d){ return {tok:{type:'list'},args:d[1]} }},
    {"name": "ArgsList", "symbols": [], "postprocess": function(d){return []}},
    {"name": "ArgsList", "symbols": ["StrictArgsList"], "postprocess": lift},
    {"name": "StrictArgsList$ebnf$1", "symbols": []},
    {"name": "StrictArgsList$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "Expression"], "postprocess": nth(1)},
    {"name": "StrictArgsList$ebnf$1", "symbols": ["StrictArgsList$ebnf$1$subexpression$1", "StrictArgsList$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "StrictArgsList", "symbols": ["Expression", "StrictArgsList$ebnf$1"], "postprocess": function(d) { return [d[0]].concat(d[1]) }},
    {"name": "BracketedExpression", "symbols": [{"literal":"("}, "Expression", {"literal":")"}], "postprocess": nth(1)},
    {"name": "FunctionApplication", "symbols": ["FunctionName", {"literal":"("}, "ArgsList", {"literal":")"}], "postprocess": function(d){ return {tok:{type:"function",name:d[0].tok.name},args:d[2]} }},
    {"name": "FunctionName", "symbols": ["Name"], "postprocess": lift},
    {"name": "FunctionName$string$1", "symbols": [{"literal":"l"}, {"literal":"o"}, {"literal":"g"}, {"literal":"_"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "FunctionName", "symbols": ["FunctionName$string$1", "Number"], "postprocess": function(d) { return {tok:{type:"name",name:"log",base:d[1]}} }},
    {"name": "LazyMultiplication$subexpression$1", "symbols": ["ws"]},
    {"name": "LazyMultiplication", "symbols": ["AtomExpression", "LazyMultiplication$subexpression$1", "AtomExpression"], "postprocess": function(d,l,r){if(has_lazy(d[0]) || has_lazy(d[2])) {return r;} return {tok:{type:"op",name:"*",lazy:true},args:[d[0],d[2]]} }},
    {"name": "Literal$subexpression$1", "symbols": ["Boolean"]},
    {"name": "Literal$subexpression$1", "symbols": ["Name"]},
    {"name": "Literal$subexpression$1", "symbols": ["Number"]},
    {"name": "Literal$subexpression$1", "symbols": ["String"]},
    {"name": "Literal", "symbols": ["Literal$subexpression$1"], "postprocess": function(d){ return d[0][0] }},
    {"name": "String$macrocall$2", "symbols": [{"literal":"'"}]},
    {"name": "String$macrocall$3", "symbols": [/[^']/]},
    {"name": "String$macrocall$1$macrocall$2", "symbols": ["String$macrocall$3"]},
    {"name": "String$macrocall$1$macrocall$1$ebnf$1", "symbols": []},
    {"name": "String$macrocall$1$macrocall$1$ebnf$1$macrocall$2", "symbols": ["String$macrocall$1$macrocall$2"], "postprocess": function(d){return d[0][0]}},
    {"name": "String$macrocall$1$macrocall$1$ebnf$1$macrocall$1$string$1", "symbols": [{"literal":"\\"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "String$macrocall$1$macrocall$1$ebnf$1$macrocall$1", "symbols": ["String$macrocall$1$macrocall$1$ebnf$1$macrocall$1$string$1"], "postprocess": function(d){return '\n' }},
    {"name": "String$macrocall$1$macrocall$1$ebnf$1$macrocall$1", "symbols": [/[{}]/], "postprocess": function(d){return '\\'+d[0]}},
    {"name": "String$macrocall$1$macrocall$1$ebnf$1$macrocall$1", "symbols": [{"literal":"\\"}, /[^n]/], "postprocess": nth(1)},
    {"name": "String$macrocall$1$macrocall$1$ebnf$1$macrocall$1", "symbols": ["String$macrocall$1$macrocall$1$ebnf$1$macrocall$2"], "postprocess": function(d,l,r){if('{}\\'.indexOf(d[0])!=-1){return r}; return d[0][0]}},
    {"name": "String$macrocall$1$macrocall$1$ebnf$1", "symbols": ["String$macrocall$1$macrocall$1$ebnf$1$macrocall$1", "String$macrocall$1$macrocall$1$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "String$macrocall$1$macrocall$1", "symbols": ["String$macrocall$1$macrocall$1$ebnf$1"], "postprocess": function(d){return d[0].join('') }},
    {"name": "String$macrocall$1", "symbols": ["String$macrocall$2", "String$macrocall$1$macrocall$1", "String$macrocall$2"], "postprocess": function(d){return {tok:{type:'string',value:d[1]}}}},
    {"name": "String", "symbols": ["String$macrocall$1"], "postprocess": lift},
    {"name": "String$macrocall$5", "symbols": [{"literal":"\""}]},
    {"name": "String$macrocall$6", "symbols": [/[^"]/]},
    {"name": "String$macrocall$4$macrocall$2", "symbols": ["String$macrocall$6"]},
    {"name": "String$macrocall$4$macrocall$1$ebnf$1", "symbols": []},
    {"name": "String$macrocall$4$macrocall$1$ebnf$1$macrocall$2", "symbols": ["String$macrocall$4$macrocall$2"], "postprocess": function(d){return d[0][0]}},
    {"name": "String$macrocall$4$macrocall$1$ebnf$1$macrocall$1$string$1", "symbols": [{"literal":"\\"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "String$macrocall$4$macrocall$1$ebnf$1$macrocall$1", "symbols": ["String$macrocall$4$macrocall$1$ebnf$1$macrocall$1$string$1"], "postprocess": function(d){return '\n' }},
    {"name": "String$macrocall$4$macrocall$1$ebnf$1$macrocall$1", "symbols": [/[{}]/], "postprocess": function(d){return '\\'+d[0]}},
    {"name": "String$macrocall$4$macrocall$1$ebnf$1$macrocall$1", "symbols": [{"literal":"\\"}, /[^n]/], "postprocess": nth(1)},
    {"name": "String$macrocall$4$macrocall$1$ebnf$1$macrocall$1", "symbols": ["String$macrocall$4$macrocall$1$ebnf$1$macrocall$2"], "postprocess": function(d,l,r){if('{}\\'.indexOf(d[0])!=-1){return r}; return d[0][0]}},
    {"name": "String$macrocall$4$macrocall$1$ebnf$1", "symbols": ["String$macrocall$4$macrocall$1$ebnf$1$macrocall$1", "String$macrocall$4$macrocall$1$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "String$macrocall$4$macrocall$1", "symbols": ["String$macrocall$4$macrocall$1$ebnf$1"], "postprocess": function(d){return d[0].join('') }},
    {"name": "String$macrocall$4", "symbols": ["String$macrocall$5", "String$macrocall$4$macrocall$1", "String$macrocall$5"], "postprocess": function(d){return {tok:{type:'string',value:d[1]}}}},
    {"name": "String", "symbols": ["String$macrocall$4"], "postprocess": lift},
    {"name": "Name$subexpression$1", "symbols": ["AnnotatedName"]},
    {"name": "Name$subexpression$1", "symbols": ["BareName"]},
    {"name": "Name", "symbols": ["Name$subexpression$1"], "postprocess": unbracket},
    {"name": "AnnotatedName$ebnf$1$subexpression$1", "symbols": ["Annotation", {"literal":":"}], "postprocess": nth(0)},
    {"name": "AnnotatedName$ebnf$1", "symbols": ["AnnotatedName$ebnf$1$subexpression$1"]},
    {"name": "AnnotatedName$ebnf$1$subexpression$2", "symbols": ["Annotation", {"literal":":"}], "postprocess": nth(0)},
    {"name": "AnnotatedName$ebnf$1", "symbols": ["AnnotatedName$ebnf$1$subexpression$2", "AnnotatedName$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "AnnotatedName", "symbols": ["AnnotatedName$ebnf$1", "BareName"], "postprocess": function(d){ var tok = d[1]; tok.annotations = d[0]; return tok }},
    {"name": "Annotation$ebnf$1", "symbols": [/[a-zA-Z]/]},
    {"name": "Annotation$ebnf$1", "symbols": [/[a-zA-Z]/, "Annotation$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "Annotation", "symbols": ["Annotation$ebnf$1"], "postprocess": function(d){return d[0].join('')}},
    {"name": "BareName", "symbols": ["ValidName"], "postprocess": function(d){ return {tok:{type:'name',name:d[0]}} }},
    {"name": "ValidName", "symbols": ["RawName"], "postprocess":  function(d,l,r) {
            var name = d[0];
            if(allReservedWords.indexOf(name)!=-1) {
                return r;
            } else {
                return name
            }
        } },
    {"name": "RawName$subexpression$1", "symbols": []},
    {"name": "RawName$subexpression$1", "symbols": [{"literal":"$"}]},
    {"name": "RawName$ebnf$1", "symbols": []},
    {"name": "RawName$ebnf$1", "symbols": [/[a-zA-Z0-9_]/, "RawName$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "RawName$ebnf$2", "symbols": []},
    {"name": "RawName$ebnf$2", "symbols": [{"literal":"'"}, "RawName$ebnf$2"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "RawName", "symbols": ["RawName$subexpression$1", /[a-zA-Z]/, "RawName$ebnf$1", "RawName$ebnf$2"], "postprocess": function(d) {return (d[0]||'')+d[1]+d[2].join('')+d[3].join('') }},
    {"name": "Number", "symbols": ["NumberLiteral"], "postprocess": function(d){ return {tok:{type:"number",value:parseFloat(d[0]),original:d[0]}} }},
    {"name": "Number", "symbols": ["SpecialNumber"], "postprocess": lift},
    {"name": "SpecialNumber", "symbols": [{"literal":"e"}], "postprocess": function(d){return {tok:{type:"number",value:Math.E}}}},
    {"name": "SpecialNumber$string$1", "symbols": [{"literal":"p"}, {"literal":"i"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "SpecialNumber", "symbols": ["SpecialNumber$string$1"], "postprocess": function(d){return {tok:{type:"number",value:Math.PI}}}},
    {"name": "NumberLiteral$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "NumberLiteral$ebnf$1", "symbols": [/[0-9]/, "NumberLiteral$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "NumberLiteral", "symbols": ["NumberLiteral$ebnf$1"], "postprocess": function(d){return d[0].join('')}},
    {"name": "NumberLiteral$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "NumberLiteral$ebnf$2", "symbols": [/[0-9]/, "NumberLiteral$ebnf$2"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "NumberLiteral$ebnf$3", "symbols": [/[0-9]/]},
    {"name": "NumberLiteral$ebnf$3", "symbols": [/[0-9]/, "NumberLiteral$ebnf$3"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "NumberLiteral", "symbols": ["NumberLiteral$ebnf$2", {"literal":"."}, "NumberLiteral$ebnf$3"], "postprocess": function(d){return d[0].join('')+d[1]+d[2].join('')}},
    {"name": "Boolean$subexpression$1$string$1", "symbols": [{"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Boolean$subexpression$1", "symbols": ["Boolean$subexpression$1$string$1"], "postprocess": function(d){return true}},
    {"name": "Boolean$subexpression$1$string$2", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Boolean$subexpression$1", "symbols": ["Boolean$subexpression$1$string$2"], "postprocess": function(d){return false}},
    {"name": "Boolean", "symbols": ["Boolean$subexpression$1"], "postprocess": function(d){return {tok:{type:"boolean",value:d[0]}} }},
    {"name": "ws$ebnf$1", "symbols": []},
    {"name": "ws$ebnf$1", "symbols": [/[\s]/, "ws$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "ws", "symbols": ["ws$ebnf$1"], "postprocess": function(d){ return null }}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.jme_grammar = grammar;
}
})();
