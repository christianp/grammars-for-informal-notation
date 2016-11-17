function makeGrammar(grammar) {
    var rightAssocBinaryOpAction = "let out = a; ops.forEach(function(o){ out = {tok:o.op,args:[out,o.b]}}); return out";
    var leftAssocBinaryOpAction = 'return {tok: (new types.TOp(op)),args:[a,b]}';

    var baseGrammar = expander.parse(baseSource);
    var newGrammar;
    var atoms = [];
    var binaryOps = [];
    var prefixOps = [];
    var postfixOps = [];
    var baseRules = [];
    var extraRules = [];
    var specialNumbers = [];
    var reservedWords = [];
    var removeOps = [];

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
            case 'remove-op':
                removeOps.push(rule.name);
                break;
            case 'atom':
                atoms.push({name:rule.rule.name,before:rule.before});
                outList.push(rule.rule);
                break;
            case 'special number':
                specialNumbers.push(rule);
                break;
            case 'reserved word':
                reservedWords.push(rule);
                break;
            case 'rule':
                outList.push(rule);
                break;
            }
        });
    }
    expandRules(baseGrammar,baseRules);
    grammar = grammar.trim();
    if(grammar) {
        var newGrammar = expander.parse(grammar);
        expandRules(newGrammar,extraRules);
    } else {
        newGrammar = baseGrammar;
    }

    /* Filter out removed op names */
    binaryOps = binaryOps.filter(function(rule){return removeOps.indexOf(rule.name)==-1});
    prefixOps = prefixOps.filter(function(rule){return removeOps.indexOf(rule.name)==-1});
    postfixOps = postfixOps.filter(function(rule){return removeOps.indexOf(rule.name)==-1});

    /* Now we'll write a load of extra rules for the ops and atoms */
    var opRules = [];

    /* list atoms */
    var ordered_atoms = [];
    atoms.forEach(function(a) {
        if(a.before) {
            var i = ordered_atoms.indexOf(a.before);
            if(i>=0) {
                ordered_atoms.splice(i,0,a.name);
            } else {
                ordered_atoms.push(a.name);
            }
        } else {
            ordered_atoms.push(a.name);
        }
    });
    console.log(ordered_atoms);
    opRules.push('Atom = '+ordered_atoms.join(" / "));

    /* make binary ops, in order of precedence */
    binaryOps.sort(function(a,b){return a.precedence > b.precedence ? 1 : a.precedence<b.precedence ? -1 : 0});
    var i = 0;
    var nextRule = "AtomExpression";
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

    var allReservedWords = reservedWords.concat(binaryOps,prefixOps,postfixOps,specialNumbers).map(function(r){ return r.name });
    opRules.splice(0,0,'ValidName = name:RawName !{return '+JSON.stringify(allReservedWords)+'.indexOf(name)>=0} {return name}');

    opRules.splice(0,0,'PrefixExpression = op:('+prefixOps.map(wrapOpName).join(' / ')+') ws arg:PrefixExpression {return {tok: new types.TOp(op,false,true),args:[arg]}} / PostfixExpression');

    opRules.splice(0,0,'PostfixExpression = arg:BinaryExpression ws ops:('+postfixOps.map(wrapOpName).join(' / ')+')* {for(var i=0;i<ops.length;i++){arg = {tok:new types.TOp(ops[i],true,false),args:[arg]}}; return arg}');
    opRules.splice(0,0,'BinaryExpression = '+nextRule);

    /* the top Expression rule */
    opRules.splice(0,0,'Expression "expression" = PrefixExpression');

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
