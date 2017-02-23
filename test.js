ready().then(function() {
    Numbas.jme.compile = function(src) {
        var parser = new nearley.Parser(jme_grammar.ParserRules,'main');
        parser.feed(src);
        return parser.finish()[0];
    };

    var jme = Numbas.jme;
    var math = Numbas.math;
    var types = jme.types;
    var tokenise = jme.tokenise;

    var compile = function(s){ return jme.compile(s,jme.builtinScope) };
    var evaluate = function(t,scope) { return jme.evaluate(t,scope || Numbas.jme.builtinScope) };
    function getValue(e){ return e.value; }	//mapped on lists to just get the javascript primitives of their elements

    function raisesNumbasError(fn,error,description) {
        raises(fn,function(e){return e.originalMessage == error},description);
    }

    function closeEquals(value,expect,message) {
        if(typeof(expect)=='number' || expect.complex)
        {
            value = Numbas.math.precround(value,10);
            expect = Numbas.math.precround(expect,10);
        }
        return equals(value,expect,message);
    }

    function deepCloseEqual(value,expect,message) {
        if(typeof(expect)=='number' || expect.complex)
        {
            value = Numbas.math.precround(value,10);
            expect = Numbas.math.precround(expect,10);
        }
        return deepEqual(value,expect,message);
    }

            test('Implicit multiplication',function() {
                deepCloseEqual(compile('5x'),compile('5*x'),'5x');
                deepCloseEqual(compile('5(x+1)'),compile('5*(x+1)'),'5(x+1)');
                deepCloseEqual(compile('(x+1)(x+2)'),compile('(x+1)*(x+2)'),'(x+1)(x+2)');
            });

            test('Literals',function() {
                closeEquals(evaluate('1').value,1,'1');
                closeEquals(evaluate('true').value,true,'true');
                deepCloseEqual(evaluate('1..3').value,[1,3,1,1,2,3],'1..3');
                deepCloseEqual(evaluate('[1,2]').value.map(getValue),[1,2],'[1,2]');
                deepCloseEqual(evaluate('[1,"hi",true]').value.map(getValue),[1,"hi",true],'[1,"hi",true]');
                closeEquals(evaluate('"hi"').value,'hi','"hi"');
                closeEquals(evaluate("'hi'").value,'hi',"'hi'");
                closeEquals(evaluate('x').type,'name','x');
            });

            test('Operator precedence',function() {
                closeEquals(evaluate('2*3!').value,12,'factorial highest: 2*3! = 2*(3!)');
                closeEquals(evaluate('(2*3)!').value,6*5*4*3*2,'brackets work: (2*3)! = 6!');
                closeEquals(evaluate('2^1^2').value,2,'exponentiation is right-associative: 2^1^2 = 2^(1^2)');
                closeEquals(evaluate('2*3^2').value,18,'exponentation before multiplication: 2*3^2 = 2*(3^2)');
                closeEquals(evaluate('5*4+3*2').value,26,'multiplication before addition: 5*4+3*2 = (5*4)+(3*2)');
                closeEquals(evaluate('5/4+3/2').value,2.75,'division before addition: 5/4+3/2 = (5/4)+(3/2)');
                closeEquals(evaluate('5*4/3-5/3*4').value,0,'multiplication and division equal precedence: 5*4/3 = 5/3*4');
                closeEquals(evaluate('1/2/3').value,1/6,'division is left-associative: 1/2/3 = (1/2)/3');
                closeEquals(evaluate('5-+2').value,3,'unary addition: 5-+2 = 5-2');
                closeEquals(evaluate('5--2').value,7,'unary minus: 5--2 = 5+2');
                closeEquals(evaluate('3*2^-1').value,1.5,'unary minus with power');
                closeEquals(evaluate('3+--2').value,5,'lots of unary minus in a chain');
                closeEquals(evaluate('-2^2').value,-4,'unary minus before a power');
                closeEquals(evaluate('-2+3').value,1,'unary minus before addition');
                closeEquals(evaluate('-2/-3').value,1,'unary minus in dividend');
                deepCloseEqual(evaluate('-vector(1,2,-3.3)').value,[-1,-2,3.3],'unary minus: -vector(1,2,-3.3)==vector(-1,-2,3.3)');
                deepCloseEqual(evaluate('-matrix([1,0],[2,3])').value,[[-1,0],[-2,-3]],'unary minus: -matrix([1,0],[2,3])==matrix([-1,0],[-2,-3]))');
                ok(evaluate('1+2*3|7^2'),'"divides" after arithmetic');
                closeEquals(evaluate('1+2..5').value[0],3,'arithmetic before range .. operator: 1+2..5 = (1+2)..5');
                closeEquals(evaluate('1..5#2').value[2],2,'range step operator');
                ok(evaluate('1..2 except 3'),'except operator');
                ok(evaluate('1+2<2+3'),'comparison operator lower than arithmetic: 1+2<2+3 = (1+2)<(2+3)');
                ok(evaluate('1<2=2<3'),'equality after inequality');
                ok(evaluate('1<2 && 3<4'),'AND after comparisons');
                closeEquals(evaluate('true or false and false').value,true,'OR after AND');
                closeEquals(evaluate('true xor true or true').value,false,'XOR after OR');
                ok(evaluate('1/-7'),'unary operation straight after a binary operation');
                closeEquals(evaluate('3!+4!').value,30,'3!+4!=30; postfix operators interact with binary operators properly');
            });

            test('Synonyms',function() {
                closeEquals(evaluate('5!=fact(5)').value,true,'x! == fact(x)');
                closeEquals(evaluate('true and true = true & true = true && true').value,true,'true == & == &&');
                closeEquals(evaluate('1|5 = divides(1,5)').value,true,'x|y == divides(x,y)');
                closeEquals(evaluate('true||false = true or false').value,true,'x||y == x or y');
                closeEquals(evaluate('sqr(2) = sqrt(2)').value,true,'sqr == sqrt');
                closeEquals(evaluate('gcf(2,3) = gcd(2,3)').value,true,'gcf == gcd');
                closeEquals(evaluate('sgn(4) = sign(4)').value,true,'sgn == sign');
                closeEquals(evaluate('len(32) = abs(32) and length(32) = abs(32)').value,true,'len == length == abs');
                closeEquals(jme.compile('verb(2)',jme.builtinScope,{notypecheck:true}).tok.name,'verbatim','verb == verbatim');
            });

            test('Types (isa)',function() {
                closeEquals(evaluate('1 isa "number"').value,true,'1 isa "number"');
                closeEquals(evaluate('1 isa "complex"').value,false,'1 isa "complex"');
                closeEquals(evaluate('i isa "complex"').value,true,'i isa "complex"');
                closeEquals(evaluate('1+i isa "complex"').value,false,'1+i isa "complex"');
                closeEquals(evaluate('"1" isa "number"').value,false,'"1" isa "number"');
                closeEquals(evaluate('"1" isa "string"').value,true,'"1" isa "string"');
                closeEquals(evaluate('[] isa "list"').value,true,'[] isa "list"');
                closeEquals(evaluate('xy isa "name"').value,true,'xy isa "name"');
            });

            test('Arithmetic',function() {
                closeEquals(evaluate('+2').value,2,'+2');
                closeEquals(evaluate('-2').value,-2,'-2');
                closeEquals(evaluate('1+2').value,3,'1+2');
                deepCloseEqual(evaluate('i+1').value,math.complex(1,1),'i+1');
                deepCloseEqual(evaluate('[1,2]+[3,4]').value.map(getValue),[1,2,3,4],'[1,2]+[3,4]');
                deepCloseEqual(evaluate('[1,2]+3').value.map(getValue),[1,2,3],'[1,2]+3');
                deepCloseEqual(evaluate('["x","y"]+"z"').value.map(getValue),['x','y','z'],'["x","y"]+"z"');
                closeEquals(evaluate('"hi "+"there"').value,'hi there','"hi"+" there"');
                closeEquals(evaluate('"n: "+1').value,'n: 1','"n: "+1');
                closeEquals(evaluate('2+" things"').value,'2 things','2+" things"');
                deepCloseEqual(evaluate('vector(1,2)+vector(2,3)').value,[3,5],'vector(1,2)+vector(2,3)');
                deepCloseEqual(evaluate('matrix([1,0],[0,1])+matrix([0,1],[1,0])').value,[[1,1],[1,1]],'matrix([1,0],[0,1])+matrix([0,1],[1,0])');
                closeEquals(evaluate('3-13').value,-10,'3-13');
                deepCloseEqual(evaluate('vector(1,2)-vector(5,5)').value,[-4,-3],'vector(1,2)-vector(5,5)');
                deepCloseEqual(evaluate('matrix([1,0],[0,1])-matrix([2,1],[2,1])').value,[[-1,-1],[-2,0]],'matrix([1,0],[0,1])-matrix([2,1],[2,1])');
                closeEquals(evaluate('5*4').value,20,'5*4');
                closeEquals(evaluate('i*i').value,-1,'i*i');
                deepCloseEqual(evaluate('5*vector(1,2)').value,[5,10],'5*vector(1,2)');
                deepCloseEqual(evaluate('vector(1,2)*5').value,[5,10],'vector(1,2)*5');
                deepCloseEqual(evaluate('matrix([1,1],[3,2])*vector(1,2)').value,[3,7],'matrix([1,1],[3,2])*vector(1,2)');
                deepCloseEqual(evaluate('5*matrix([1,0],[0,1])').value,[[5,0],[0,5]],'5*matrix([1,0],[0,1])');
                deepCloseEqual(evaluate('matrix([1,0],[0,1])*5').value,[[5,0],[0,5]],'matrix([1,0],[0,1])*5');
                deepCloseEqual(evaluate('matrix([1,2],[1,1])*matrix([2,3],[4,5])').value,[[10,13],[6,8]],'matrix([1,2],[1,1])*matrix([2,3],[4,5])');
                closeEquals(evaluate('5/2').value,2.5,'5/2');
                deepCloseEqual(evaluate('5/(1+i)').value,math.complex(2.5,-2.5),'5/(1+i)');
                deepCloseEqual(evaluate('(1+i)/5').value,math.complex(0.2,0.2),'(1+i)/5');
                deepCloseEqual(evaluate('(1+i)/(2-i)').value,math.complex(0.2,0.6),'(1+i)/(2+i)');
                closeEquals(evaluate('2^4').value,16,'2^4');
                closeEquals(evaluate('(-6)^2').value,36,'(-6)^2 - see https://github.com/numbas/examples/issues/4');
                deepCloseEqual(evaluate('(1+i)^0').value,1,'(1+i)^0');
                deepCloseEqual(evaluate('(1+i)^5').value,math.complex(-4,-4),'(1+i)^5');
                deepCloseEqual(evaluate('(1+i)^6').value,math.complex(0,-8),'(1+i)^6');
                deepCloseEqual(evaluate('(1+i)^(-2)').value,math.complex(0,-0.5),'(1+i)^(-2)');
                deepCloseEqual(evaluate('(1+i)^(-3)').value,math.complex(-0.25,-0.25),'(1+i)^(-3)');
                deepCloseEqual(evaluate('2^i').value,math.complex(0.7692389013639721,0.6389612763136348),'2^i');
            });

            test('Logic',function() {
                closeEquals(evaluate('0<2').value,true,'0<2');
                closeEquals(evaluate('2<0').value,false,'2<0');
                closeEquals(evaluate('0<-0').value,false,'0<0');
                closeEquals(evaluate('0>2').value,false,'0>2');
                closeEquals(evaluate('2>0').value,true,'2>0');
                closeEquals(evaluate('0>-0').value,false,'0>0');

                raisesNumbasError(function(){ evaluate('1<i') },'math.order complex numbers',"can't order complex numbers");
                raisesNumbasError(function(){ evaluate('i>1') },'math.order complex numbers',"can't order complex numbers");
                raisesNumbasError(function(){ evaluate('i<=1') },'math.order complex numbers',"can't order complex numbers");
                raisesNumbasError(function(){ evaluate('1>=i') },'math.order complex numbers',"can't order complex numbers");

                closeEquals(evaluate('1=1').value,true,'1=1');
                closeEquals(evaluate('1/5=0.2').value,true,'1/5=0.2');
                closeEquals(evaluate('"abcdef"=\'abcdef\'').value,true,'"abcdef"=\'abcdef\'');
                closeEquals(evaluate('"abcdef"=" abcdef "').value,false,'"abcdef"=" abcdef "');
                closeEquals(evaluate('"abcdef"="ABCDEF"').value,false,'"abcdef"="ABCDEF"');
                closeEquals(evaluate('"<b>abcdef</b>"="*abcdef*"').value,false,'"<b>abcdef</b>="*abcdef*"');
                closeEquals(evaluate('true=true').value,true,'true=true');
                closeEquals(evaluate('false=false').value,true,'false=false');
                closeEquals(evaluate('true=false').value,false,'true=false');
                closeEquals(evaluate('[0,1,2]=[0,1,2]').value,true,'[0,1,2]=[0,1,2]');
                closeEquals(evaluate('[0,4,2]=[0,1,2]').value,false,'[0,4,2]=[0,1,2]');
                closeEquals(evaluate('[0,1,2]=[0,1,2,3]').value,false,'[0,1,2]=[0,1,2,3]');
                closeEquals(evaluate('0..4=0..4#1').value,true,'0..4=0..4#1');
                closeEquals(evaluate('0..4=0..4#2').value,false,'0..4=0..4#2');
                closeEquals(evaluate('0="0"').value,false,'0="0"');
                closeEquals(evaluate('a=a').value,true,'a=a');
                closeEquals(evaluate('0<>1').value,true,'0<>1');
                closeEquals(evaluate('1<>1').value,false,'0<>1');

                closeEquals(evaluate('not true').value,false,'not true');
                closeEquals(evaluate('not false').value,true,'not false');

                closeEquals(evaluate('true and false').value,false,'true and false');
                closeEquals(evaluate('false and true').value,false,'false and true');
                closeEquals(evaluate('true and true').value,true,'true and true');
                closeEquals(evaluate('false and false').value,false,'false and false');

                closeEquals(evaluate('true or false').value,true,'true or false');
                closeEquals(evaluate('false or true').value,true,'false or true');
                closeEquals(evaluate('true or true').value,true,'true or true');
                closeEquals(evaluate('false or false').value,false,'false or false');

                closeEquals(evaluate('true xor false').value,true,'true xor false');
                closeEquals(evaluate('false xor true').value,true,'false xor true');
                closeEquals(evaluate('true xor true').value,false,'true xor true');
                closeEquals(evaluate('false xor false').value,false,'false xor false');
            });

            test('Number functions',function() {
                closeEquals(evaluate('abs(-5.4)').value,5.4,'abs(-5.4)');
                closeEquals(evaluate('abs(1+i)').value,Math.sqrt(2),'abs(1+i)');
                closeEquals(evaluate('abs([1,2,3,4])').value,4,'abs([1,2,3,4])');
                closeEquals(evaluate('abs(1..5)').value,5,'abs(1..5)');
                closeEquals(evaluate('abs(1..5#1.2)').value,4,'abs(1..5#1.2)');
                closeEquals(evaluate('abs(1..4#0)').value,3,'abs(1..4#0)');
                closeEquals(evaluate('abs(vector(3,4))').value,5,'abs(vector(3,4))');
                closeEquals(evaluate('abs(vector(3,4,5,5,5))').value,10,'abs(vector(3,4,5,5,5))');
                closeEquals(evaluate('arg(1+i)').value,Math.PI/4,'arg(1+i)');
                closeEquals(evaluate('arg(-1-i)').value,-3*Math.PI/4,'arg(1+i)');
                closeEquals(evaluate('arg(0)').value,0,'arg(0)');
                closeEquals(evaluate('arg(1)').value,0,'arg(1)');

                closeEquals(evaluate('re(1)').value,1,'re(1)');
                closeEquals(evaluate('re(i)').value,0,'re(i)');
                closeEquals(evaluate('re(5+6i)').value,5,'re(5+6i)');
                closeEquals(evaluate('im(1)').value,0,'im(1)');
                closeEquals(evaluate('im(i)').value,1,'im(i)');
                closeEquals(evaluate('im(5+6i)').value,6,'im(5+6i)');
                closeEquals(evaluate('conj(1)').value,1,'conj(1)');
                deepCloseEqual(evaluate('conj(i)').value,math.complex(0,-1),'conj(i)');
                deepCloseEqual(evaluate('conj(5+6i)').value,math.complex(5,-6),'conj(5+6i)');

                closeEquals(evaluate('isint(0)').value,true,'isint(0)');
                closeEquals(evaluate('isint(542)').value,true,'isint(542)');
                closeEquals(evaluate('isint(-431)').value,true,'isint(-431)');
                closeEquals(evaluate('isint(4/3)').value,false,'isint(4/3)');
                closeEquals(evaluate('isint(-43.1)').value,false,'isint(-43.1)');
                closeEquals(evaluate('isint(5i)').value,false,'isint(5i)');

                closeEquals(evaluate('degrees(0)').value,0,'degrees(0)');
                closeEquals(evaluate('degrees(pi)').value,180,'degrees(pi)');
                closeEquals(evaluate('degrees(1)').value,57.29577951308232,'degrees(1)');
                closeEquals(evaluate('degrees(5.5*pi)').value,990,'degrees(5.5*pi)');
                deepCloseEqual(evaluate('degrees(pi*i)').value,math.complex(0,180),'degrees(pi*i)');

                closeEquals(evaluate('sign(54)').value,1,'sign(54)');
                closeEquals(evaluate('sign(0.5)').value,1,'sign(0.5)');
                closeEquals(evaluate('sign(0)').value,0,'sign(0)');
                closeEquals(evaluate('sign(-43)').value,-1,'sign(-43)');
                deepCloseEqual(evaluate('sign(4-i)').value,math.complex(1,-1),'sign(4-i)');

                closeEquals(evaluate('award(5,true)').value,5,'award(5,true)');
                closeEquals(evaluate('award(5,false)').value,0,'award(5,true)');
            });

            test('Number theory/combinatorics',function() {
                deepCloseEqual(evaluate('mod(0,0)').value,NaN,'mod(0,0)');
                deepCloseEqual(evaluate('mod(5,0)').value,NaN,'mod(5,0)');
                closeEquals(evaluate('mod(13,2)').value,1,'mod(13,2)');
                closeEquals(evaluate('mod(4.765,3)').value,1.765,'mod(4.765,3)');
                closeEquals(evaluate('mod(-13,6)').value,5,'mod(-13,6)');
                closeEquals(evaluate('mod(2.4,1.1)').value,0.2,'mod(2.4,1.1)');

                closeEquals(evaluate('max(3,5)').value,5,'max(3,5)');
                closeEquals(evaluate('max(54,1.5654)').value,54,'max(54,1.5654)');
                closeEquals(evaluate('max(-32,4)').value,4,'max(-32,4)');
                raisesNumbasError(function(){ evaluate('max(i,1+i)') },'math.order complex numbers',"can't order complex numbers: max(i,1+i)");

                closeEquals(evaluate('min(3,5)').value,3,'min(3,5)');
                closeEquals(evaluate('min(54,1.5654)').value,1.5654,'min(54,1.5654)');
                closeEquals(evaluate('min(-32,4)').value,-32,'min(-32,4)');
                raisesNumbasError(function(){ evaluate('min(i,1+i)') },'math.order complex numbers',"can't order complex numbers: min(i,1+i)");

                closeEquals(evaluate('perm(5,4)').value,5,'perm(5,4)');
                closeEquals(evaluate('perm(6,1)').value,720,'perm(6,1)');
                closeEquals(evaluate('perm(2,3)').value,1,'perm(2,3)');
                closeEquals(evaluate('perm(-2,1)').value,1,'perm(-2,1)');
                raisesNumbasError(function() {evaluate('perm(i,1)')},'math.permutations.complex',"error: can't compute permutations of complex numbers: perm(i,1)");
                raisesNumbasError(function() {evaluate('perm(1,i)')},'math.permutations.complex',"error: can't compute permutations of complex numbers: perm(1,i)");

                closeEquals(evaluate('comb(5,4)').value,5,'comb(5,4)');
                closeEquals(evaluate('comb(6,1)').value,6,'comb(6,1)');
                closeEquals(evaluate('comb(7,3)').value,35,'comb(6,1)');
                closeEquals(evaluate('comb(2,3)').value,1,'comb(2,3)');
                closeEquals(evaluate('comb(-2,1)').value,1,'comb(-2,1)');
                raisesNumbasError(function() {evaluate('comb(i,1)')},'math.combinations.complex',"error: can't compute combinations of complex numbers: comb(i,1)");
                raisesNumbasError(function() {evaluate('comb(1,i)')},'math.combinations.complex',"error: can't compute combinations of complex numbers: comb(1,i)");

                closeEquals(evaluate('gcd(36,15)').value,3,'gcd(36,15)');
                closeEquals(evaluate('gcd(1.1,15)').value,1,'gcd(1.1,15)');
                closeEquals(evaluate('gcd(-60,18)').value,6,'gcd(-60,18)');
                closeEquals(evaluate('gcd(60,-18)').value,6,'gcd(60,-18)');
                raisesNumbasError(function(){ evaluate('gcd(2i,4)') },'math.gcf.complex',"can't take gcf of complex numbers: gcf(2i,4)");

                closeEquals(evaluate('lcm(3,7)').value,21,'lcm(3,7)');
                closeEquals(evaluate('lcm(4,6)').value,12,'lcm(4,12)');
                closeEquals(evaluate('lcm(-10,35)').value,70,'lcm(-10,35)');
                raisesNumbasError(function(){ evaluate('lcm(2,i)') },'math.lcm.complex',"can't find lcm of complex numbers: lcm(2,i)");

                closeEquals(evaluate('5|25').value,true,'5|25');
                closeEquals(evaluate('6|42').value,true,'6|42');
                closeEquals(evaluate('4|42').value,false,'4|42');
                closeEquals(evaluate('-4|40').value,true,'-4|40');
                closeEquals(evaluate('4|-40').value,true,'4|-40');
                closeEquals(evaluate('i|2i').value,false,'i|2i');
            });

            test('Rounding',function() {
                closeEquals(evaluate('radians(0)').value,0,'radians(0)');
                closeEquals(evaluate('radians(180)').value,Math.PI,'radians(180)');
                closeEquals(evaluate('radians(1080)').value,6*Math.PI,'radians(1080)');
                deepCloseEqual(evaluate('radians(90+360i)').value,math.complex(Math.PI/2,2*Math.PI),'radians(90+360i)');

                closeEquals(evaluate('ceil(0.1)').value,1,'ceil(0.1)');
                closeEquals(evaluate('ceil(532.9)').value,533,'cei(532.9)');
                closeEquals(evaluate('ceil(0)').value,0,'ceil(0)');
                closeEquals(evaluate('ceil(-14.6)').value,-14,'ceil(-14.6)');
                deepCloseEqual(evaluate('ceil(1.7-2.3i)').value,math.complex(2,-2),'ceil(1.7-2.3i)');

                closeEquals(evaluate('floor(0.1)').value,0,'floor(0.1)');
                closeEquals(evaluate('floor(532.9)').value,532,'cei(532.9)');
                closeEquals(evaluate('floor(0)').value,0,'floor(0)');
                closeEquals(evaluate('floor(-14.6)').value,-15,'floor(-14.6)');
                deepCloseEqual(evaluate('floor(1.2i)').value,math.complex(0,1),'floor(1.2i)');

                closeEquals(evaluate('trunc(0)').value,0,'trunc(0)');
                closeEquals(evaluate('trunc(5)').value,5,'trunc(5)');
                closeEquals(evaluate('trunc(14.3)').value,14,'trunc(14.3)');
                closeEquals(evaluate('trunc(-4.76)').value,-4,'trunc(-4.76)');
                deepCloseEqual(evaluate('trunc(0.5+4.75i)').value,math.complex(0,4),'trunc(0.5+4.75i)');

                closeEquals(evaluate('fract(0)').value,0,'fract(0)');
                closeEquals(evaluate('fract(5)').value,0,'fract(5)');
                closeEquals(evaluate('fract(14.3)').value,0.3,'fract(14.3)');
                closeEquals(evaluate('fract(-4.76)').value,-0.76,'fract(-4.76)');
                deepCloseEqual(evaluate('fract(0.5+4.75i)').value,math.complex(0.5,0.75),'fract(0.5+4.75i)');

                closeEquals(evaluate('round(0)').value,0,'round(0)');
                closeEquals(evaluate('round(12321)').value,12321,'round(12321)');
                closeEquals(evaluate('round(1.4)').value,1,'round(1.4)');
                closeEquals(evaluate('round(4.9)').value,5,'round(4.5)');
                closeEquals(evaluate('round(11.5)').value,12,'round(11.5)');
                closeEquals(evaluate('round(-3.2)').value,-3,'round(-3.2)');
                closeEquals(evaluate('round(-3.5)').value,-3,'round(-3.5)');
                closeEquals(evaluate('round(-50)').value,-50,'round(-50)');
                deepCloseEqual(evaluate('round(1.4-6.7i)').value,math.complex(1,-7),'round(1.4-6.7i)');

                equals(evaluate('precround(1.1234567891011121314151617181920,0)').value,1,'precround(1.1234567891011121314151617181920,0) - round to integer');
                equals(evaluate('precround(1.1234567891011121314151617181920,1)').value,1.1,'precround(1.1234567891011121314151617181920,1) - round to 1 d.p.');
                equals(evaluate('precround(1.1234567891011121314151617181920,5)').value,1.12346,'precround(1.1234567891011121314151617181920,5) - round to 5 d.p. - should round up');
                equals(evaluate('precround(1.1234567891011121314151617181920,20)').value,1.12345678910111213142,'precround(1.1234567891011121314151617181920,20)');
                equals(evaluate('precround(1.9999,3)').value,2,'precround(1.9999,3) - round to 3 dp results in integer');
                equals(evaluate('precround(-132.6545,3)').value,-132.654,'precround(-132.6545,3) - round on 5 in negative number rounds up');
                equals(evaluate('precround(123456789012,8)').value,123456789012,'precround(123456789012,8) - only multiply fractional part, to get better precision');
                equals(evaluate('precround(4+488/1000,3)').value,4.488,'precround(4+488/1000,3) - try not to add floating point error in the middle of precround');
                equals(evaluate('precround(0.05,2)').value,0.05,'precround(0.05,2)');
                equals(evaluate('precround(-0.05,2)').value,-0.05,'precround(-0.05,2)');
                equals(evaluate('precround(-2.51,0)').value,-3,'precround(-2.51,0)');

                equals(evaluate('precround(237.55749999999998,3)').value,237.558,'precround(237.55749999999998,3)==237.558');
                equals(evaluate('precround(237.55748999999998,3)').value,237.557,'precround(237.55748999999998,3)==237.557');
                equals(evaluate('precround(-237.55750000000001,3)').value,-237.557,'precround(-237.55750000000001,3)==-237.557');
                equals(evaluate('precround(-237.55751000000001,3)').value,-237.558,'precround(-237.55751000000001,3)==-237.558');

                equals(evaluate('siground(0.123,2)').value,0.12,'siground(0.123,2)');
                equals(evaluate('siground(123456.123456,3)').value,123000,'siground(123456.123456,3)');
                equals(evaluate('siground(-32.45,3)').value,-32.4,'siground(-32.45,3)');
                equals(evaluate('siground(-32452,2)').value,-32000,'siground(-32452,2)');
                equals(evaluate('siground(-2.51,1)').value,-3,'siground(-2.51,1)');
            });

});
