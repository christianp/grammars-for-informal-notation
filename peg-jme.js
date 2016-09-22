var expander;
var baseSource;

var rightAssocBinaryOpAction = "let out = a; ops.forEach(function(o){ out = {tok:o.op,args:[out,o.b]}}); return out";
var leftAssocBinaryOpAction = 'return {tok: (new types.TOp(op)),args:[a,b]}';

function makeGrammar(grammar) {
    console.clear();
    var baseGrammar = expander.parse(baseSource);
    var newGrammar = expander.parse(grammar);
    var atoms = [];
    var binaryOps = [];
    var prefixOps = [];
    var postfixOps = [];
    var baseRules = [];
    var extraRules = [];
    var specialNumbers = [];

    /* run through the source, picking out op and atom definitions */
    function expandRules(grammar,outList) {
        grammar.rules.forEach(function(rule) {
            switch(rule.type) {
            case 'operator':
                switch(rule.kind) {
                case 'binary':
                    binaryOps.push(rule);
                    break;
                case 'prefix':
                    prefixOps.push(rule);
                    break;
                case 'postfix':
                    postfixOps.push(rule);
                }
                break;
            case 'atom':
                atoms.push(rule.rule.name);
                outList.push(rule.rule);
                break;
            case 'special number':
                specialNumbers.push(rule);
                break;
            case 'rule':
                outList.push(rule);
                break;
            }
        });
    }
    expandRules(baseGrammar,baseRules);
    expandRules(newGrammar,extraRules);

    /* Now we'll write a load of extra rules for the ops and atoms */
    var opRules = [];

    /* list atoms */
    opRules.push('Atom = '+atoms.join(" / "));

    /* make binary ops, in order of precedence */
    binaryOps.sort(function(a,b){return a.precedence > b.precedence ? 1 : a.precedence<b.precedence ? -1 : 0});
    var i = 0;
    var nextRule = "PrefixExpression";
    var level = 0;
    function wrapOpName(r) {
        return '"'+r.name+'"i'+(r.realName ? ' {return "'+r.realName+'"}' : '');
    }
    function sortByNameLength(a,b){a=a.name.length; b=b.name.length; return a>b ? -1 : a<b ? 1 : 0}
    while(i<binaryOps.length) {
        level += 1;
        var g = [];
        var op = binaryOps[i].precedence;
        var j = i;
        while(i<binaryOps.length && binaryOps[i].precedence===op) {
            i += 1;
        }
        var ops = binaryOps.slice(j,i).sort(sortByNameLength);
        var rightOps = ops.filter(function(r){return !r.leftAssoc}).map(wrapOpName).join(" / ");
        var leftOps = ops.filter(function(r){return r.leftAssoc}).map(wrapOpName).join(" / ");
        var name = "BinaryOpLevel"+level;
        var rightRule = "a:"+nextRule+" ops:(ws op:("+rightOps+") ws b:"+nextRule+" {return {op: (new types.TOp(op)),b:b}})* {"+rightAssocBinaryOpAction+"}";
        var leftRule = "a:"+nextRule+" ws op:("+leftOps+") ws b:"+name+"Left {"+leftAssocBinaryOpAction+"} / "+nextRule;
        var rule;
        if(leftOps.length) {
            opRules.splice(0,0,name+"Left = "+leftRule);
        }
        if(rightOps.length) {
            if(leftOps.length) {
                rule = rightRule+ " / "+name+"Left";
            } else {
                rule = rightRule;
            }
        } else {
            rule = name+"Left";
        }
        rule = name+' = '+rule;
        opRules.splice(0,0,rule);
        nextRule = name;
    }

    var allOps = binaryOps.concat(prefixOps,postfixOps,specialNumbers).map(function(r){ return r.name });
    opRules.splice(0,0,'ValidName = name:RawName !{return '+JSON.stringify(allOps)+'.indexOf(name)>=0} {return name}');

    opRules.splice(0,0,'PrefixExpression = op:('+prefixOps.map(wrapOpName).join(' / ')+') ws arg:PostfixExpression {return {tok: new types.TOp(op,false,true),args:[arg]}} / PostfixExpression');

    opRules.splice(0,0,'PostfixExpression = arg:AtomExpression ws op:('+postfixOps.map(wrapOpName).join(' / ')+') {return {tok: new types.TOp(op,true,false),args:[arg]}} / AtomExpression');

    /* the top Expression rule */
    opRules.splice(0,0,'Expression "expression" = '+nextRule);

    if(specialNumbers.length) {
        specialNumbers = specialNumbers.sort(sortByNameLength);
        opRules.push('Number = NumberLiteral / SpecialNumber');
        opRules.push('SpecialNumber = '+specialNumbers.map(function(r){
            return '"'+r.name+'"i {return {tok: new types.TNum('+r.code+')}}';
        }).join(' / '));
    } else {
        opRules.push('Number = NumberLiteral');
    }

    /* compile the op/atom rules and add them to the base grammar */
    var opSource = opRules.join('\n');
    console.log(opSource);
    var opGrammar = peg.parser.parse(opSource);
    baseRules = baseRules.concat(opGrammar.rules);

    /* remove duplicate rules */
    var seenRules = {};
    extraRules.forEach(function(r) {
        seenRules[r.name] = true;
    });
    baseRules.forEach(function(rule) {
        if(!(seenRules[rule.name])) {
            seenRules[rule.name] = true;
            extraRules.push(rule);
        }
    });

    function convertPasses(passes) {
        var converted = {}, stage, p, name;

        for (stage in passes) {
            if (passes.hasOwnProperty(stage)) {
                p = [];
                for(name in passes[stage]) {
                    p.push(passes[stage][name]);
                }
                converted[stage] = p;
            }
        }

        return converted;
    }

    newGrammar.rules = extraRules;
    if(newGrammar.initializer) {
        newGrammar.initializer.code = baseGrammar.initializer.code + newGrammar.initializer.code;
    } else {
        newGrammar.initializer = baseGrammar.initializer;
    }

    var options = {
        allowedStartRules: ['StartExpression']
    };

    var parser = peg.compiler.compile(newGrammar,convertPasses(peg.compiler.passes),options);
    return parser;
}

Numbas.queueScript('base',['jquery'],function() {});
Numbas.queueScript('go',['jme'],function() {
window.onload = function() {
    var expanderSource = document.getElementById('peg-expander').textContent;
    expander = peg.generate(expanderSource);
    baseSource = document.getElementById('base-jme').textContent;

    var grammarArea = document.getElementById('extra-grammar');
    var exprArea = document.getElementById('expression');
    var resultArea = document.getElementById('result');
    var jmeArea = document.getElementById('jme');

    function go() {
        var source = grammarArea.value;
        var expression = exprArea.value;
        try {
            var g = window.g = makeGrammar(source);
            var res = g.parse(expression);
            console.log(res);
            resultArea.textContent = JSON.stringify(res);
            var jme = Numbas.jme.display.treeToJME(res);
            jmeArea.textContent = jme;
        } catch(e) {
            resultArea.textContent = 'Error: '+ e.message+'\n'+JSON.stringify(e.location);
        }
        debounce = null;
    }
    var debounce = null;
    function debounce_go() {
        if(debounce) {
            clearTimeout(debounce);
        }
        debounce = setTimeout(go,100);
    }
    grammarArea.oninput = debounce_go;
    exprArea.oninput = debounce_go;
    go();
}
});

