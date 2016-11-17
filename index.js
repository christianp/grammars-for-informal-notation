ready().then(function() {
        document.getElementById('show-base-jme').textContent = baseSource;

        var grammarArea = document.getElementById('extra-grammar');
        var exprArea = document.getElementById('expression');
        var resultArea = document.getElementById('result');
        var jmeArea = document.getElementById('jme');

        function go() {
            var source = grammarArea.value;
            try {
                var parser = makeGrammar(source);
                Numbas.jme.compile = parser.parse;
                parse_jme();
            } catch(e) {
                resultArea.textContent = 'Error: '+ e.message+'\n'+JSON.stringify(e.location);
                jmeArea.textContent = '';
            }
        }
        function parse_jme() {
            var expression = exprArea.value.trim();
            if(!expression) {
                jmeArea.textContent = '';
                resultArea.textContent = '';
                return;
            }
            try {
                var res = Numbas.jme.compile(expression);
                resultArea.textContent = JSON.stringify(res,null,'  ');
            } catch(e) {
                resultArea.textContent = 'Error: '+ e.message+'\n'+JSON.stringify(e.location);
                jmeArea.textContent = '';
                throw(e);
            }
            try {
                var jme = Numbas.jme.display.treeToJME(res);
                jmeArea.textContent = jme;
            } catch(e) {
                jmeArea.textContent = 'Error: '+e.message;
            }
            debounce = null;
        }
        function debounce(fn,delay) {
            delay = delay || 100;
            var t = null;
            return function() {
                if(t) {
                    clearTimeout(t);
                }
                t = setTimeout(fn,delay);
            }
        }
        grammarArea.oninput = debounce(go,100);
        exprArea.oninput = debounce(parse_jme,20);
        go();

        function elem(name,attrs,children) {
            var e = document.createElement(name);
            if(attrs) {
                for(var x in attrs) {
                    e.setAttribute(x,attrs[x]);
                }
            }
            if(children) {
                children.forEach(function(c){ e.appendChild(c) });
            }
            return e;
        }
        presets.forEach(function(p) {
            var radio = elem('input',{type:'radio',name:'preset'});
            var l = elem('li',{class:'preset'},[
                elem('label',{},[radio,document.createTextNode(p.name)])
            ]);
            radio.onchange = function() {
                grammarArea.value = p.code;
                exprArea.value = p.jme;
                go();
            }
            document.getElementById('presets').appendChild(l);
        });
});

var presets = [
    {
        name: "list comprehension",
        code: "reserved word \"for\";\natom ListComprehension = \"[\" ws expr:Expression ws \"for\" ws name:Name ws \"in\" ws list:Expression ws \"]\"  {return {tok: new types.TFunc('map'),args:[expr,name,list]}};",
        jme: "[x^2 for x in [1,2,3]]"
    },
    {
        name: "set literal",
        code: "atom Set = \"{\" ws args:ArgsList ws \"}\" {return {tok:new types.TFunc('set'),args:args}};",
        jme: "{1,2,3}"
    },
    {
        name: "vector literal",
        code: "atom Vector \"vector\" = \"(\" args:ArgsList \")\" {return {tok: new types.TFunc('vector'),args:args}};",
        jme: "(1,2,3)+(-2,3,1/2)"
    },
    {
        name: "interval",
        code: "atom Interval \"interval\" = start:( \"[\" / \"(\" ) a:Expression \",\" b:Expression end:( \"]\" / \")\" ) {return {tok: new types.TFunc('interval'), args: [{tok:new types.TBool(start=='[')},a,{tok:new types.TBool(end==']')},b]}};\nList = Interval // override usual list atom",
        jme: "[x,y) + (x,y) + (x,y] + [x,y]"
    },
    {
        name: "operators",
        code: "left associative binary operator \"%\" precedence 2;\nbinary operator \"mash\" precedence 11;\nprefix operator \"@\";\npostfix operator \"£\";",
        jme: "(x%3) + (x mash y) + @x + x£"
    },
    {
        name: "dictionary literal",
        code: "KeyPair = name:Name ws \":\" ws expr:Expression {return {tok: new types.TList(),args:[name,expr]}};\nKeyPairList = first:KeyPair rest:(ws \",\" ws pair:KeyPair {return pair})* {return [first].concat(rest)};\natom Dictionary = \"{\" ws keypairs:KeyPairList ws \"}\" {return {tok: new types.TFunc('dict'),args:keypairs}}",
        jme: "{a: 1, b: 2}"
    },
    {
        name: 'lisp!',
        code: "Expression = LispExpression / Atom\nLispExpression = \"(\" ws op:Name args:(ws atom:Expression ws {return atom})* \")\" {return {tok:new types.TFunc(op.tok.name),args:args}}",
        jme: '(plus (minus x 1) 2)'
    },
    {
        name: 'Leibniz derivatives',
        code: "atom before Literal Derivative = \"d\" ny:(\"^\" ny:NumberLiteral {return ny})? y:BareName ws \"/\" ws \"d\" x:BareName (\"^\" nx:NumberLiteral)? {ny=ny||{tok:new types.TNum(1)}; return {tok: new types.TFunc(\"diff\"),args: [y,x,ny]}}",
        jme: 'd^2y/dx^2 = dy/dx*x + y'
    }
];



