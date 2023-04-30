(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f();}else if(typeof define==="function"&&define.amd){define([],f);}else{var g;if(typeof window!=="undefined"){g=window;}else if(typeof global!=="undefined"){g=global;}else if(typeof self!=="undefined"){g=self;}else{g=this;}g.Manyfest=f();}})(function(){var define,module,exports;return function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a;}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r);},p,p.exports,r,e,n,t);}return n[i].exports;}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o;}return r;}()({1:[function(require,module,exports){;(function(globalScope){'use strict';/*!
   *  decimal.js v10.4.3
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2022 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   */ // -----------------------------------  EDITABLE DEFAULTS  ------------------------------------ //
// The maximum exponent magnitude.
// The limit on the value of `toExpNeg`, `toExpPos`, `minE` and `maxE`.
var EXP_LIMIT=9e15,// 0 to 9e15
// The limit on the value of `precision`, and on the value of the first argument to
// `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`.
MAX_DIGITS=1e9,// 0 to 1e9
// Base conversion alphabet.
NUMERALS='0123456789abcdef',// The natural logarithm of 10 (1025 digits).
LN10='2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058',// Pi (1025 digits).
PI='3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789',// The initial configuration properties of the Decimal constructor.
DEFAULTS={// These values must be integers within the stated ranges (inclusive).
// Most of these values can be changed at run-time using the `Decimal.config` method.
// The maximum number of significant digits of the result of a calculation or base conversion.
// E.g. `Decimal.config({ precision: 20 });`
precision:20,// 1 to MAX_DIGITS
// The rounding mode used when rounding to `precision`.
//
// ROUND_UP         0 Away from zero.
// ROUND_DOWN       1 Towards zero.
// ROUND_CEIL       2 Towards +Infinity.
// ROUND_FLOOR      3 Towards -Infinity.
// ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
// ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
// ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
// ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
// ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
//
// E.g.
// `Decimal.rounding = 4;`
// `Decimal.rounding = Decimal.ROUND_HALF_UP;`
rounding:4,// 0 to 8
// The modulo mode used when calculating the modulus: a mod n.
// The quotient (q = a / n) is calculated according to the corresponding rounding mode.
// The remainder (r) is calculated as: r = a - n * q.
//
// UP         0 The remainder is positive if the dividend is negative, else is negative.
// DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
// FLOOR      3 The remainder has the same sign as the divisor (Python %).
// HALF_EVEN  6 The IEEE 754 remainder function.
// EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
//
// Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
// division (9) are commonly used for the modulus operation. The other rounding modes can also
// be used, but they may not give useful results.
modulo:1,// 0 to 9
// The exponent value at and beneath which `toString` returns exponential notation.
// JavaScript numbers: -7
toExpNeg:-7,// 0 to -EXP_LIMIT
// The exponent value at and above which `toString` returns exponential notation.
// JavaScript numbers: 21
toExpPos:21,// 0 to EXP_LIMIT
// The minimum exponent value, beneath which underflow to zero occurs.
// JavaScript numbers: -324  (5e-324)
minE:-EXP_LIMIT,// -1 to -EXP_LIMIT
// The maximum exponent value, above which overflow to Infinity occurs.
// JavaScript numbers: 308  (1.7976931348623157e+308)
maxE:EXP_LIMIT,// 1 to EXP_LIMIT
// Whether to use cryptographically-secure random number generation, if available.
crypto:false// true/false
},// ----------------------------------- END OF EDITABLE DEFAULTS ------------------------------- //
Decimal,inexact,noConflict,quadrant,external=true,decimalError='[DecimalError] ',invalidArgument=decimalError+'Invalid argument: ',precisionLimitExceeded=decimalError+'Precision limit exceeded',cryptoUnavailable=decimalError+'crypto unavailable',tag='[object Decimal]',mathfloor=Math.floor,mathpow=Math.pow,isBinary=/^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,isHex=/^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,isOctal=/^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,isDecimal=/^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,BASE=1e7,LOG_BASE=7,MAX_SAFE_INTEGER=9007199254740991,LN10_PRECISION=LN10.length-1,PI_PRECISION=PI.length-1,// Decimal.prototype object
P={toStringTag:tag};// Decimal prototype methods
/*
   *  absoluteValue             abs
   *  ceil
   *  clampedTo                 clamp
   *  comparedTo                cmp
   *  cosine                    cos
   *  cubeRoot                  cbrt
   *  decimalPlaces             dp
   *  dividedBy                 div
   *  dividedToIntegerBy        divToInt
   *  equals                    eq
   *  floor
   *  greaterThan               gt
   *  greaterThanOrEqualTo      gte
   *  hyperbolicCosine          cosh
   *  hyperbolicSine            sinh
   *  hyperbolicTangent         tanh
   *  inverseCosine             acos
   *  inverseHyperbolicCosine   acosh
   *  inverseHyperbolicSine     asinh
   *  inverseHyperbolicTangent  atanh
   *  inverseSine               asin
   *  inverseTangent            atan
   *  isFinite
   *  isInteger                 isInt
   *  isNaN
   *  isNegative                isNeg
   *  isPositive                isPos
   *  isZero
   *  lessThan                  lt
   *  lessThanOrEqualTo         lte
   *  logarithm                 log
   *  [maximum]                 [max]
   *  [minimum]                 [min]
   *  minus                     sub
   *  modulo                    mod
   *  naturalExponential        exp
   *  naturalLogarithm          ln
   *  negated                   neg
   *  plus                      add
   *  precision                 sd
   *  round
   *  sine                      sin
   *  squareRoot                sqrt
   *  tangent                   tan
   *  times                     mul
   *  toBinary
   *  toDecimalPlaces           toDP
   *  toExponential
   *  toFixed
   *  toFraction
   *  toHexadecimal             toHex
   *  toNearest
   *  toNumber
   *  toOctal
   *  toPower                   pow
   *  toPrecision
   *  toSignificantDigits       toSD
   *  toString
   *  truncated                 trunc
   *  valueOf                   toJSON
   */ /*
   * Return a new Decimal whose value is the absolute value of this Decimal.
   *
   */P.absoluteValue=P.abs=function(){var x=new this.constructor(this);if(x.s<0)x.s=1;return finalise(x);};/*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of positive Infinity.
   *
   */P.ceil=function(){return finalise(new this.constructor(this),this.e+1,2);};/*
   * Return a new Decimal whose value is the value of this Decimal clamped to the range
   * delineated by `min` and `max`.
   *
   * min {number|string|Decimal}
   * max {number|string|Decimal}
   *
   */P.clampedTo=P.clamp=function(min,max){var k,x=this,Ctor=x.constructor;min=new Ctor(min);max=new Ctor(max);if(!min.s||!max.s)return new Ctor(NaN);if(min.gt(max))throw Error(invalidArgument+max);k=x.cmp(min);return k<0?min:x.cmp(max)>0?max:new Ctor(x);};/*
   * Return
   *   1    if the value of this Decimal is greater than the value of `y`,
   *  -1    if the value of this Decimal is less than the value of `y`,
   *   0    if they have the same value,
   *   NaN  if the value of either Decimal is NaN.
   *
   */P.comparedTo=P.cmp=function(y){var i,j,xdL,ydL,x=this,xd=x.d,yd=(y=new x.constructor(y)).d,xs=x.s,ys=y.s;// Either NaN or ±Infinity?
if(!xd||!yd){return!xs||!ys?NaN:xs!==ys?xs:xd===yd?0:!xd^xs<0?1:-1;}// Either zero?
if(!xd[0]||!yd[0])return xd[0]?xs:yd[0]?-ys:0;// Signs differ?
if(xs!==ys)return xs;// Compare exponents.
if(x.e!==y.e)return x.e>y.e^xs<0?1:-1;xdL=xd.length;ydL=yd.length;// Compare digit by digit.
for(i=0,j=xdL<ydL?xdL:ydL;i<j;++i){if(xd[i]!==yd[i])return xd[i]>yd[i]^xs<0?1:-1;}// Compare lengths.
return xdL===ydL?0:xdL>ydL^xs<0?1:-1;};/*
   * Return a new Decimal whose value is the cosine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * cos(0)         = 1
   * cos(-0)        = 1
   * cos(Infinity)  = NaN
   * cos(-Infinity) = NaN
   * cos(NaN)       = NaN
   *
   */P.cosine=P.cos=function(){var pr,rm,x=this,Ctor=x.constructor;if(!x.d)return new Ctor(NaN);// cos(0) = cos(-0) = 1
if(!x.d[0])return new Ctor(1);pr=Ctor.precision;rm=Ctor.rounding;Ctor.precision=pr+Math.max(x.e,x.sd())+LOG_BASE;Ctor.rounding=1;x=cosine(Ctor,toLessThanHalfPi(Ctor,x));Ctor.precision=pr;Ctor.rounding=rm;return finalise(quadrant==2||quadrant==3?x.neg():x,pr,rm,true);};/*
   *
   * Return a new Decimal whose value is the cube root of the value of this Decimal, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   *  cbrt(0)  =  0
   *  cbrt(-0) = -0
   *  cbrt(1)  =  1
   *  cbrt(-1) = -1
   *  cbrt(N)  =  N
   *  cbrt(-I) = -I
   *  cbrt(I)  =  I
   *
   * Math.cbrt(x) = (x < 0 ? -Math.pow(-x, 1/3) : Math.pow(x, 1/3))
   *
   */P.cubeRoot=P.cbrt=function(){var e,m,n,r,rep,s,sd,t,t3,t3plusx,x=this,Ctor=x.constructor;if(!x.isFinite()||x.isZero())return new Ctor(x);external=false;// Initial estimate.
s=x.s*mathpow(x.s*x,1/3);// Math.cbrt underflow/overflow?
// Pass x to Math.pow as integer, then adjust the exponent of the result.
if(!s||Math.abs(s)==1/0){n=digitsToString(x.d);e=x.e;// Adjust n exponent so it is a multiple of 3 away from x exponent.
if(s=(e-n.length+1)%3)n+=s==1||s==-2?'0':'00';s=mathpow(n,1/3);// Rarely, e may be one less than the result exponent value.
e=mathfloor((e+1)/3)-(e%3==(e<0?-1:2));if(s==1/0){n='5e'+e;}else{n=s.toExponential();n=n.slice(0,n.indexOf('e')+1)+e;}r=new Ctor(n);r.s=x.s;}else{r=new Ctor(s.toString());}sd=(e=Ctor.precision)+3;// Halley's method.
// TODO? Compare Newton's method.
for(;;){t=r;t3=t.times(t).times(t);t3plusx=t3.plus(x);r=divide(t3plusx.plus(x).times(t),t3plusx.plus(t3),sd+2,1);// TODO? Replace with for-loop and checkRoundingDigits.
if(digitsToString(t.d).slice(0,sd)===(n=digitsToString(r.d)).slice(0,sd)){n=n.slice(sd-3,sd+1);// The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or 4999
// , i.e. approaching a rounding boundary, continue the iteration.
if(n=='9999'||!rep&&n=='4999'){// On the first iteration only, check to see if rounding up gives the exact result as the
// nines may infinitely repeat.
if(!rep){finalise(t,e+1,0);if(t.times(t).times(t).eq(x)){r=t;break;}}sd+=4;rep=1;}else{// If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
// If not, then there are further digits and m will be truthy.
if(!+n||!+n.slice(1)&&n.charAt(0)=='5'){// Truncate to the first rounding digit.
finalise(r,e+1,1);m=!r.times(r).times(r).eq(x);}break;}}}external=true;return finalise(r,e,Ctor.rounding,m);};/*
   * Return the number of decimal places of the value of this Decimal.
   *
   */P.decimalPlaces=P.dp=function(){var w,d=this.d,n=NaN;if(d){w=d.length-1;n=(w-mathfloor(this.e/LOG_BASE))*LOG_BASE;// Subtract the number of trailing zeros of the last word.
w=d[w];if(w)for(;w%10==0;w/=10)n--;if(n<0)n=0;}return n;};/*
   *  n / 0 = I
   *  n / N = N
   *  n / I = 0
   *  0 / n = 0
   *  0 / 0 = N
   *  0 / N = N
   *  0 / I = 0
   *  N / n = N
   *  N / 0 = N
   *  N / N = N
   *  N / I = N
   *  I / n = I
   *  I / 0 = I
   *  I / N = N
   *  I / I = N
   *
   * Return a new Decimal whose value is the value of this Decimal divided by `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   */P.dividedBy=P.div=function(y){return divide(this,new this.constructor(y));};/*
   * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
   * by the value of `y`, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */P.dividedToIntegerBy=P.divToInt=function(y){var x=this,Ctor=x.constructor;return finalise(divide(x,new Ctor(y),0,1,1),Ctor.precision,Ctor.rounding);};/*
   * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
   *
   */P.equals=P.eq=function(y){return this.cmp(y)===0;};/*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of negative Infinity.
   *
   */P.floor=function(){return finalise(new this.constructor(this),this.e+1,3);};/*
   * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
   * false.
   *
   */P.greaterThan=P.gt=function(y){return this.cmp(y)>0;};/*
   * Return true if the value of this Decimal is greater than or equal to the value of `y`,
   * otherwise return false.
   *
   */P.greaterThanOrEqualTo=P.gte=function(y){var k=this.cmp(y);return k==1||k===0;};/*
   * Return a new Decimal whose value is the hyperbolic cosine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [1, Infinity]
   *
   * cosh(x) = 1 + x^2/2! + x^4/4! + x^6/6! + ...
   *
   * cosh(0)         = 1
   * cosh(-0)        = 1
   * cosh(Infinity)  = Infinity
   * cosh(-Infinity) = Infinity
   * cosh(NaN)       = NaN
   *
   *  x        time taken (ms)   result
   * 1000      9                 9.8503555700852349694e+433
   * 10000     25                4.4034091128314607936e+4342
   * 100000    171               1.4033316802130615897e+43429
   * 1000000   3817              1.5166076984010437725e+434294
   * 10000000  abandoned after 2 minute wait
   *
   * TODO? Compare performance of cosh(x) = 0.5 * (exp(x) + exp(-x))
   *
   */P.hyperbolicCosine=P.cosh=function(){var k,n,pr,rm,len,x=this,Ctor=x.constructor,one=new Ctor(1);if(!x.isFinite())return new Ctor(x.s?1/0:NaN);if(x.isZero())return one;pr=Ctor.precision;rm=Ctor.rounding;Ctor.precision=pr+Math.max(x.e,x.sd())+4;Ctor.rounding=1;len=x.d.length;// Argument reduction: cos(4x) = 1 - 8cos^2(x) + 8cos^4(x) + 1
// i.e. cos(x) = 1 - cos^2(x/4)(8 - 8cos^2(x/4))
// Estimate the optimum number of times to use the argument reduction.
// TODO? Estimation reused from cosine() and may not be optimal here.
if(len<32){k=Math.ceil(len/3);n=(1/tinyPow(4,k)).toString();}else{k=16;n='2.3283064365386962890625e-10';}x=taylorSeries(Ctor,1,x.times(n),new Ctor(1),true);// Reverse argument reduction
var cosh2_x,i=k,d8=new Ctor(8);for(;i--;){cosh2_x=x.times(x);x=one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));}return finalise(x,Ctor.precision=pr,Ctor.rounding=rm,true);};/*
   * Return a new Decimal whose value is the hyperbolic sine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * sinh(x) = x + x^3/3! + x^5/5! + x^7/7! + ...
   *
   * sinh(0)         = 0
   * sinh(-0)        = -0
   * sinh(Infinity)  = Infinity
   * sinh(-Infinity) = -Infinity
   * sinh(NaN)       = NaN
   *
   * x        time taken (ms)
   * 10       2 ms
   * 100      5 ms
   * 1000     14 ms
   * 10000    82 ms
   * 100000   886 ms            1.4033316802130615897e+43429
   * 200000   2613 ms
   * 300000   5407 ms
   * 400000   8824 ms
   * 500000   13026 ms          8.7080643612718084129e+217146
   * 1000000  48543 ms
   *
   * TODO? Compare performance of sinh(x) = 0.5 * (exp(x) - exp(-x))
   *
   */P.hyperbolicSine=P.sinh=function(){var k,pr,rm,len,x=this,Ctor=x.constructor;if(!x.isFinite()||x.isZero())return new Ctor(x);pr=Ctor.precision;rm=Ctor.rounding;Ctor.precision=pr+Math.max(x.e,x.sd())+4;Ctor.rounding=1;len=x.d.length;if(len<3){x=taylorSeries(Ctor,2,x,x,true);}else{// Alternative argument reduction: sinh(3x) = sinh(x)(3 + 4sinh^2(x))
// i.e. sinh(x) = sinh(x/3)(3 + 4sinh^2(x/3))
// 3 multiplications and 1 addition
// Argument reduction: sinh(5x) = sinh(x)(5 + sinh^2(x)(20 + 16sinh^2(x)))
// i.e. sinh(x) = sinh(x/5)(5 + sinh^2(x/5)(20 + 16sinh^2(x/5)))
// 4 multiplications and 2 additions
// Estimate the optimum number of times to use the argument reduction.
k=1.4*Math.sqrt(len);k=k>16?16:k|0;x=x.times(1/tinyPow(5,k));x=taylorSeries(Ctor,2,x,x,true);// Reverse argument reduction
var sinh2_x,d5=new Ctor(5),d16=new Ctor(16),d20=new Ctor(20);for(;k--;){sinh2_x=x.times(x);x=x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));}}Ctor.precision=pr;Ctor.rounding=rm;return finalise(x,pr,rm,true);};/*
   * Return a new Decimal whose value is the hyperbolic tangent of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * tanh(x) = sinh(x) / cosh(x)
   *
   * tanh(0)         = 0
   * tanh(-0)        = -0
   * tanh(Infinity)  = 1
   * tanh(-Infinity) = -1
   * tanh(NaN)       = NaN
   *
   */P.hyperbolicTangent=P.tanh=function(){var pr,rm,x=this,Ctor=x.constructor;if(!x.isFinite())return new Ctor(x.s);if(x.isZero())return new Ctor(x);pr=Ctor.precision;rm=Ctor.rounding;Ctor.precision=pr+7;Ctor.rounding=1;return divide(x.sinh(),x.cosh(),Ctor.precision=pr,Ctor.rounding=rm);};/*
   * Return a new Decimal whose value is the arccosine (inverse cosine) in radians of the value of
   * this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [0, pi]
   *
   * acos(x) = pi/2 - asin(x)
   *
   * acos(0)       = pi/2
   * acos(-0)      = pi/2
   * acos(1)       = 0
   * acos(-1)      = pi
   * acos(1/2)     = pi/3
   * acos(-1/2)    = 2*pi/3
   * acos(|x| > 1) = NaN
   * acos(NaN)     = NaN
   *
   */P.inverseCosine=P.acos=function(){var halfPi,x=this,Ctor=x.constructor,k=x.abs().cmp(1),pr=Ctor.precision,rm=Ctor.rounding;if(k!==-1){return k===0// |x| is 1
?x.isNeg()?getPi(Ctor,pr,rm):new Ctor(0)// |x| > 1 or x is NaN
:new Ctor(NaN);}if(x.isZero())return getPi(Ctor,pr+4,rm).times(0.5);// TODO? Special case acos(0.5) = pi/3 and acos(-0.5) = 2*pi/3
Ctor.precision=pr+6;Ctor.rounding=1;x=x.asin();halfPi=getPi(Ctor,pr+4,rm).times(0.5);Ctor.precision=pr;Ctor.rounding=rm;return halfPi.minus(x);};/*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine in radians of the
   * value of this Decimal.
   *
   * Domain: [1, Infinity]
   * Range: [0, Infinity]
   *
   * acosh(x) = ln(x + sqrt(x^2 - 1))
   *
   * acosh(x < 1)     = NaN
   * acosh(NaN)       = NaN
   * acosh(Infinity)  = Infinity
   * acosh(-Infinity) = NaN
   * acosh(0)         = NaN
   * acosh(-0)        = NaN
   * acosh(1)         = 0
   * acosh(-1)        = NaN
   *
   */P.inverseHyperbolicCosine=P.acosh=function(){var pr,rm,x=this,Ctor=x.constructor;if(x.lte(1))return new Ctor(x.eq(1)?0:NaN);if(!x.isFinite())return new Ctor(x);pr=Ctor.precision;rm=Ctor.rounding;Ctor.precision=pr+Math.max(Math.abs(x.e),x.sd())+4;Ctor.rounding=1;external=false;x=x.times(x).minus(1).sqrt().plus(x);external=true;Ctor.precision=pr;Ctor.rounding=rm;return x.ln();};/*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * asinh(x) = ln(x + sqrt(x^2 + 1))
   *
   * asinh(NaN)       = NaN
   * asinh(Infinity)  = Infinity
   * asinh(-Infinity) = -Infinity
   * asinh(0)         = 0
   * asinh(-0)        = -0
   *
   */P.inverseHyperbolicSine=P.asinh=function(){var pr,rm,x=this,Ctor=x.constructor;if(!x.isFinite()||x.isZero())return new Ctor(x);pr=Ctor.precision;rm=Ctor.rounding;Ctor.precision=pr+2*Math.max(Math.abs(x.e),x.sd())+6;Ctor.rounding=1;external=false;x=x.times(x).plus(1).sqrt().plus(x);external=true;Ctor.precision=pr;Ctor.rounding=rm;return x.ln();};/*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent in radians of the
   * value of this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [-Infinity, Infinity]
   *
   * atanh(x) = 0.5 * ln((1 + x) / (1 - x))
   *
   * atanh(|x| > 1)   = NaN
   * atanh(NaN)       = NaN
   * atanh(Infinity)  = NaN
   * atanh(-Infinity) = NaN
   * atanh(0)         = 0
   * atanh(-0)        = -0
   * atanh(1)         = Infinity
   * atanh(-1)        = -Infinity
   *
   */P.inverseHyperbolicTangent=P.atanh=function(){var pr,rm,wpr,xsd,x=this,Ctor=x.constructor;if(!x.isFinite())return new Ctor(NaN);if(x.e>=0)return new Ctor(x.abs().eq(1)?x.s/0:x.isZero()?x:NaN);pr=Ctor.precision;rm=Ctor.rounding;xsd=x.sd();if(Math.max(xsd,pr)<2*-x.e-1)return finalise(new Ctor(x),pr,rm,true);Ctor.precision=wpr=xsd-x.e;x=divide(x.plus(1),new Ctor(1).minus(x),wpr+pr,1);Ctor.precision=pr+4;Ctor.rounding=1;x=x.ln();Ctor.precision=pr;Ctor.rounding=rm;return x.times(0.5);};/*
   * Return a new Decimal whose value is the arcsine (inverse sine) in radians of the value of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * asin(x) = 2*atan(x/(1 + sqrt(1 - x^2)))
   *
   * asin(0)       = 0
   * asin(-0)      = -0
   * asin(1/2)     = pi/6
   * asin(-1/2)    = -pi/6
   * asin(1)       = pi/2
   * asin(-1)      = -pi/2
   * asin(|x| > 1) = NaN
   * asin(NaN)     = NaN
   *
   * TODO? Compare performance of Taylor series.
   *
   */P.inverseSine=P.asin=function(){var halfPi,k,pr,rm,x=this,Ctor=x.constructor;if(x.isZero())return new Ctor(x);k=x.abs().cmp(1);pr=Ctor.precision;rm=Ctor.rounding;if(k!==-1){// |x| is 1
if(k===0){halfPi=getPi(Ctor,pr+4,rm).times(0.5);halfPi.s=x.s;return halfPi;}// |x| > 1 or x is NaN
return new Ctor(NaN);}// TODO? Special case asin(1/2) = pi/6 and asin(-1/2) = -pi/6
Ctor.precision=pr+6;Ctor.rounding=1;x=x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();Ctor.precision=pr;Ctor.rounding=rm;return x.times(2);};/*
   * Return a new Decimal whose value is the arctangent (inverse tangent) in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
   *
   * atan(0)         = 0
   * atan(-0)        = -0
   * atan(1)         = pi/4
   * atan(-1)        = -pi/4
   * atan(Infinity)  = pi/2
   * atan(-Infinity) = -pi/2
   * atan(NaN)       = NaN
   *
   */P.inverseTangent=P.atan=function(){var i,j,k,n,px,t,r,wpr,x2,x=this,Ctor=x.constructor,pr=Ctor.precision,rm=Ctor.rounding;if(!x.isFinite()){if(!x.s)return new Ctor(NaN);if(pr+4<=PI_PRECISION){r=getPi(Ctor,pr+4,rm).times(0.5);r.s=x.s;return r;}}else if(x.isZero()){return new Ctor(x);}else if(x.abs().eq(1)&&pr+4<=PI_PRECISION){r=getPi(Ctor,pr+4,rm).times(0.25);r.s=x.s;return r;}Ctor.precision=wpr=pr+10;Ctor.rounding=1;// TODO? if (x >= 1 && pr <= PI_PRECISION) atan(x) = halfPi * x.s - atan(1 / x);
// Argument reduction
// Ensure |x| < 0.42
// atan(x) = 2 * atan(x / (1 + sqrt(1 + x^2)))
k=Math.min(28,wpr/LOG_BASE+2|0);for(i=k;i;--i)x=x.div(x.times(x).plus(1).sqrt().plus(1));external=false;j=Math.ceil(wpr/LOG_BASE);n=1;x2=x.times(x);r=new Ctor(x);px=x;// atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
for(;i!==-1;){px=px.times(x2);t=r.minus(px.div(n+=2));px=px.times(x2);r=t.plus(px.div(n+=2));if(r.d[j]!==void 0)for(i=j;r.d[i]===t.d[i]&&i--;);}if(k)r=r.times(2<<k-1);external=true;return finalise(r,Ctor.precision=pr,Ctor.rounding=rm,true);};/*
   * Return true if the value of this Decimal is a finite number, otherwise return false.
   *
   */P.isFinite=function(){return!!this.d;};/*
   * Return true if the value of this Decimal is an integer, otherwise return false.
   *
   */P.isInteger=P.isInt=function(){return!!this.d&&mathfloor(this.e/LOG_BASE)>this.d.length-2;};/*
   * Return true if the value of this Decimal is NaN, otherwise return false.
   *
   */P.isNaN=function(){return!this.s;};/*
   * Return true if the value of this Decimal is negative, otherwise return false.
   *
   */P.isNegative=P.isNeg=function(){return this.s<0;};/*
   * Return true if the value of this Decimal is positive, otherwise return false.
   *
   */P.isPositive=P.isPos=function(){return this.s>0;};/*
   * Return true if the value of this Decimal is 0 or -0, otherwise return false.
   *
   */P.isZero=function(){return!!this.d&&this.d[0]===0;};/*
   * Return true if the value of this Decimal is less than `y`, otherwise return false.
   *
   */P.lessThan=P.lt=function(y){return this.cmp(y)<0;};/*
   * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
   *
   */P.lessThanOrEqualTo=P.lte=function(y){return this.cmp(y)<1;};/*
   * Return the logarithm of the value of this Decimal to the specified base, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * If no base is specified, return log[10](arg).
   *
   * log[base](arg) = ln(arg) / ln(base)
   *
   * The result will always be correctly rounded if the base of the log is 10, and 'almost always'
   * otherwise:
   *
   * Depending on the rounding mode, the result may be incorrectly rounded if the first fifteen
   * rounding digits are [49]99999999999999 or [50]00000000000000. In that case, the maximum error
   * between the result and the correctly rounded result will be one ulp (unit in the last place).
   *
   * log[-b](a)       = NaN
   * log[0](a)        = NaN
   * log[1](a)        = NaN
   * log[NaN](a)      = NaN
   * log[Infinity](a) = NaN
   * log[b](0)        = -Infinity
   * log[b](-0)       = -Infinity
   * log[b](-a)       = NaN
   * log[b](1)        = 0
   * log[b](Infinity) = Infinity
   * log[b](NaN)      = NaN
   *
   * [base] {number|string|Decimal} The base of the logarithm.
   *
   */P.logarithm=P.log=function(base){var isBase10,d,denominator,k,inf,num,sd,r,arg=this,Ctor=arg.constructor,pr=Ctor.precision,rm=Ctor.rounding,guard=5;// Default base is 10.
if(base==null){base=new Ctor(10);isBase10=true;}else{base=new Ctor(base);d=base.d;// Return NaN if base is negative, or non-finite, or is 0 or 1.
if(base.s<0||!d||!d[0]||base.eq(1))return new Ctor(NaN);isBase10=base.eq(10);}d=arg.d;// Is arg negative, non-finite, 0 or 1?
if(arg.s<0||!d||!d[0]||arg.eq(1)){return new Ctor(d&&!d[0]?-1/0:arg.s!=1?NaN:d?0:1/0);}// The result will have a non-terminating decimal expansion if base is 10 and arg is not an
// integer power of 10.
if(isBase10){if(d.length>1){inf=true;}else{for(k=d[0];k%10===0;)k/=10;inf=k!==1;}}external=false;sd=pr+guard;num=naturalLogarithm(arg,sd);denominator=isBase10?getLn10(Ctor,sd+10):naturalLogarithm(base,sd);// The result will have 5 rounding digits.
r=divide(num,denominator,sd,1);// If at a rounding boundary, i.e. the result's rounding digits are [49]9999 or [50]0000,
// calculate 10 further digits.
//
// If the result is known to have an infinite decimal expansion, repeat this until it is clear
// that the result is above or below the boundary. Otherwise, if after calculating the 10
// further digits, the last 14 are nines, round up and assume the result is exact.
// Also assume the result is exact if the last 14 are zero.
//
// Example of a result that will be incorrectly rounded:
// log[1048576](4503599627370502) = 2.60000000000000009610279511444746...
// The above result correctly rounded using ROUND_CEIL to 1 decimal place should be 2.7, but it
// will be given as 2.6 as there are 15 zeros immediately after the requested decimal place, so
// the exact result would be assumed to be 2.6, which rounded using ROUND_CEIL to 1 decimal
// place is still 2.6.
if(checkRoundingDigits(r.d,k=pr,rm)){do{sd+=10;num=naturalLogarithm(arg,sd);denominator=isBase10?getLn10(Ctor,sd+10):naturalLogarithm(base,sd);r=divide(num,denominator,sd,1);if(!inf){// Check for 14 nines from the 2nd rounding digit, as the first may be 4.
if(+digitsToString(r.d).slice(k+1,k+15)+1==1e14){r=finalise(r,pr+1,0);}break;}}while(checkRoundingDigits(r.d,k+=10,rm));}external=true;return finalise(r,pr,rm);};/*
   * Return a new Decimal whose value is the maximum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.max = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'lt');
  };
   */ /*
   * Return a new Decimal whose value is the minimum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.min = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'gt');
  };
   */ /*
   *  n - 0 = n
   *  n - N = N
   *  n - I = -I
   *  0 - n = -n
   *  0 - 0 = 0
   *  0 - N = N
   *  0 - I = -I
   *  N - n = N
   *  N - 0 = N
   *  N - N = N
   *  N - I = N
   *  I - n = I
   *  I - 0 = I
   *  I - N = N
   *  I - I = N
   *
   * Return a new Decimal whose value is the value of this Decimal minus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */P.minus=P.sub=function(y){var d,e,i,j,k,len,pr,rm,xd,xe,xLTy,yd,x=this,Ctor=x.constructor;y=new Ctor(y);// If either is not finite...
if(!x.d||!y.d){// Return NaN if either is NaN.
if(!x.s||!y.s)y=new Ctor(NaN);// Return y negated if x is finite and y is ±Infinity.
else if(x.d)y.s=-y.s;// Return x if y is finite and x is ±Infinity.
// Return x if both are ±Infinity with different signs.
// Return NaN if both are ±Infinity with the same sign.
else y=new Ctor(y.d||x.s!==y.s?x:NaN);return y;}// If signs differ...
if(x.s!=y.s){y.s=-y.s;return x.plus(y);}xd=x.d;yd=y.d;pr=Ctor.precision;rm=Ctor.rounding;// If either is zero...
if(!xd[0]||!yd[0]){// Return y negated if x is zero and y is non-zero.
if(yd[0])y.s=-y.s;// Return x if y is zero and x is non-zero.
else if(xd[0])y=new Ctor(x);// Return zero if both are zero.
// From IEEE 754 (2008) 6.3: 0 - 0 = -0 - -0 = -0 when rounding to -Infinity.
else return new Ctor(rm===3?-0:0);return external?finalise(y,pr,rm):y;}// x and y are finite, non-zero numbers with the same sign.
// Calculate base 1e7 exponents.
e=mathfloor(y.e/LOG_BASE);xe=mathfloor(x.e/LOG_BASE);xd=xd.slice();k=xe-e;// If base 1e7 exponents differ...
if(k){xLTy=k<0;if(xLTy){d=xd;k=-k;len=yd.length;}else{d=yd;e=xe;len=xd.length;}// Numbers with massively different exponents would result in a very high number of
// zeros needing to be prepended, but this can be avoided while still ensuring correct
// rounding by limiting the number of zeros to `Math.ceil(pr / LOG_BASE) + 2`.
i=Math.max(Math.ceil(pr/LOG_BASE),len)+2;if(k>i){k=i;d.length=1;}// Prepend zeros to equalise exponents.
d.reverse();for(i=k;i--;)d.push(0);d.reverse();// Base 1e7 exponents equal.
}else{// Check digits to determine which is the bigger number.
i=xd.length;len=yd.length;xLTy=i<len;if(xLTy)len=i;for(i=0;i<len;i++){if(xd[i]!=yd[i]){xLTy=xd[i]<yd[i];break;}}k=0;}if(xLTy){d=xd;xd=yd;yd=d;y.s=-y.s;}len=xd.length;// Append zeros to `xd` if shorter.
// Don't add zeros to `yd` if shorter as subtraction only needs to start at `yd` length.
for(i=yd.length-len;i>0;--i)xd[len++]=0;// Subtract yd from xd.
for(i=yd.length;i>k;){if(xd[--i]<yd[i]){for(j=i;j&&xd[--j]===0;)xd[j]=BASE-1;--xd[j];xd[i]+=BASE;}xd[i]-=yd[i];}// Remove trailing zeros.
for(;xd[--len]===0;)xd.pop();// Remove leading zeros and adjust exponent accordingly.
for(;xd[0]===0;xd.shift())--e;// Zero?
if(!xd[0])return new Ctor(rm===3?-0:0);y.d=xd;y.e=getBase10Exponent(xd,e);return external?finalise(y,pr,rm):y;};/*
   *   n % 0 =  N
   *   n % N =  N
   *   n % I =  n
   *   0 % n =  0
   *  -0 % n = -0
   *   0 % 0 =  N
   *   0 % N =  N
   *   0 % I =  0
   *   N % n =  N
   *   N % 0 =  N
   *   N % N =  N
   *   N % I =  N
   *   I % n =  N
   *   I % 0 =  N
   *   I % N =  N
   *   I % I =  N
   *
   * Return a new Decimal whose value is the value of this Decimal modulo `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * The result depends on the modulo mode.
   *
   */P.modulo=P.mod=function(y){var q,x=this,Ctor=x.constructor;y=new Ctor(y);// Return NaN if x is ±Infinity or NaN, or y is NaN or ±0.
if(!x.d||!y.s||y.d&&!y.d[0])return new Ctor(NaN);// Return x if y is ±Infinity or x is ±0.
if(!y.d||x.d&&!x.d[0]){return finalise(new Ctor(x),Ctor.precision,Ctor.rounding);}// Prevent rounding of intermediate calculations.
external=false;if(Ctor.modulo==9){// Euclidian division: q = sign(y) * floor(x / abs(y))
// result = x - q * y    where  0 <= result < abs(y)
q=divide(x,y.abs(),0,3,1);q.s*=y.s;}else{q=divide(x,y,0,Ctor.modulo,1);}q=q.times(y);external=true;return x.minus(q);};/*
   * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
   * i.e. the base e raised to the power the value of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */P.naturalExponential=P.exp=function(){return naturalExponential(this);};/*
   * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */P.naturalLogarithm=P.ln=function(){return naturalLogarithm(this);};/*
   * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
   * -1.
   *
   */P.negated=P.neg=function(){var x=new this.constructor(this);x.s=-x.s;return finalise(x);};/*
   *  n + 0 = n
   *  n + N = N
   *  n + I = I
   *  0 + n = n
   *  0 + 0 = 0
   *  0 + N = N
   *  0 + I = I
   *  N + n = N
   *  N + 0 = N
   *  N + N = N
   *  N + I = N
   *  I + n = I
   *  I + 0 = I
   *  I + N = N
   *  I + I = I
   *
   * Return a new Decimal whose value is the value of this Decimal plus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */P.plus=P.add=function(y){var carry,d,e,i,k,len,pr,rm,xd,yd,x=this,Ctor=x.constructor;y=new Ctor(y);// If either is not finite...
if(!x.d||!y.d){// Return NaN if either is NaN.
if(!x.s||!y.s)y=new Ctor(NaN);// Return x if y is finite and x is ±Infinity.
// Return x if both are ±Infinity with the same sign.
// Return NaN if both are ±Infinity with different signs.
// Return y if x is finite and y is ±Infinity.
else if(!x.d)y=new Ctor(y.d||x.s===y.s?x:NaN);return y;}// If signs differ...
if(x.s!=y.s){y.s=-y.s;return x.minus(y);}xd=x.d;yd=y.d;pr=Ctor.precision;rm=Ctor.rounding;// If either is zero...
if(!xd[0]||!yd[0]){// Return x if y is zero.
// Return y if y is non-zero.
if(!yd[0])y=new Ctor(x);return external?finalise(y,pr,rm):y;}// x and y are finite, non-zero numbers with the same sign.
// Calculate base 1e7 exponents.
k=mathfloor(x.e/LOG_BASE);e=mathfloor(y.e/LOG_BASE);xd=xd.slice();i=k-e;// If base 1e7 exponents differ...
if(i){if(i<0){d=xd;i=-i;len=yd.length;}else{d=yd;e=k;len=xd.length;}// Limit number of zeros prepended to max(ceil(pr / LOG_BASE), len) + 1.
k=Math.ceil(pr/LOG_BASE);len=k>len?k+1:len+1;if(i>len){i=len;d.length=1;}// Prepend zeros to equalise exponents. Note: Faster to use reverse then do unshifts.
d.reverse();for(;i--;)d.push(0);d.reverse();}len=xd.length;i=yd.length;// If yd is longer than xd, swap xd and yd so xd points to the longer array.
if(len-i<0){i=len;d=yd;yd=xd;xd=d;}// Only start adding at yd.length - 1 as the further digits of xd can be left as they are.
for(carry=0;i;){carry=(xd[--i]=xd[i]+yd[i]+carry)/BASE|0;xd[i]%=BASE;}if(carry){xd.unshift(carry);++e;}// Remove trailing zeros.
// No need to check for zero, as +x + +y != 0 && -x + -y != 0
for(len=xd.length;xd[--len]==0;)xd.pop();y.d=xd;y.e=getBase10Exponent(xd,e);return external?finalise(y,pr,rm):y;};/*
   * Return the number of significant digits of the value of this Decimal.
   *
   * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
   *
   */P.precision=P.sd=function(z){var k,x=this;if(z!==void 0&&z!==!!z&&z!==1&&z!==0)throw Error(invalidArgument+z);if(x.d){k=getPrecision(x.d);if(z&&x.e+1>k)k=x.e+1;}else{k=NaN;}return k;};/*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
   * rounding mode `rounding`.
   *
   */P.round=function(){var x=this,Ctor=x.constructor;return finalise(new Ctor(x),x.e+1,Ctor.rounding);};/*
   * Return a new Decimal whose value is the sine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * sin(x) = x - x^3/3! + x^5/5! - ...
   *
   * sin(0)         = 0
   * sin(-0)        = -0
   * sin(Infinity)  = NaN
   * sin(-Infinity) = NaN
   * sin(NaN)       = NaN
   *
   */P.sine=P.sin=function(){var pr,rm,x=this,Ctor=x.constructor;if(!x.isFinite())return new Ctor(NaN);if(x.isZero())return new Ctor(x);pr=Ctor.precision;rm=Ctor.rounding;Ctor.precision=pr+Math.max(x.e,x.sd())+LOG_BASE;Ctor.rounding=1;x=sine(Ctor,toLessThanHalfPi(Ctor,x));Ctor.precision=pr;Ctor.rounding=rm;return finalise(quadrant>2?x.neg():x,pr,rm,true);};/*
   * Return a new Decimal whose value is the square root of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   *  sqrt(-n) =  N
   *  sqrt(N)  =  N
   *  sqrt(-I) =  N
   *  sqrt(I)  =  I
   *  sqrt(0)  =  0
   *  sqrt(-0) = -0
   *
   */P.squareRoot=P.sqrt=function(){var m,n,sd,r,rep,t,x=this,d=x.d,e=x.e,s=x.s,Ctor=x.constructor;// Negative/NaN/Infinity/zero?
if(s!==1||!d||!d[0]){return new Ctor(!s||s<0&&(!d||d[0])?NaN:d?x:1/0);}external=false;// Initial estimate.
s=Math.sqrt(+x);// Math.sqrt underflow/overflow?
// Pass x to Math.sqrt as integer, then adjust the exponent of the result.
if(s==0||s==1/0){n=digitsToString(d);if((n.length+e)%2==0)n+='0';s=Math.sqrt(n);e=mathfloor((e+1)/2)-(e<0||e%2);if(s==1/0){n='5e'+e;}else{n=s.toExponential();n=n.slice(0,n.indexOf('e')+1)+e;}r=new Ctor(n);}else{r=new Ctor(s.toString());}sd=(e=Ctor.precision)+3;// Newton-Raphson iteration.
for(;;){t=r;r=t.plus(divide(x,t,sd+2,1)).times(0.5);// TODO? Replace with for-loop and checkRoundingDigits.
if(digitsToString(t.d).slice(0,sd)===(n=digitsToString(r.d)).slice(0,sd)){n=n.slice(sd-3,sd+1);// The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or
// 4999, i.e. approaching a rounding boundary, continue the iteration.
if(n=='9999'||!rep&&n=='4999'){// On the first iteration only, check to see if rounding up gives the exact result as the
// nines may infinitely repeat.
if(!rep){finalise(t,e+1,0);if(t.times(t).eq(x)){r=t;break;}}sd+=4;rep=1;}else{// If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
// If not, then there are further digits and m will be truthy.
if(!+n||!+n.slice(1)&&n.charAt(0)=='5'){// Truncate to the first rounding digit.
finalise(r,e+1,1);m=!r.times(r).eq(x);}break;}}}external=true;return finalise(r,e,Ctor.rounding,m);};/*
   * Return a new Decimal whose value is the tangent of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * tan(0)         = 0
   * tan(-0)        = -0
   * tan(Infinity)  = NaN
   * tan(-Infinity) = NaN
   * tan(NaN)       = NaN
   *
   */P.tangent=P.tan=function(){var pr,rm,x=this,Ctor=x.constructor;if(!x.isFinite())return new Ctor(NaN);if(x.isZero())return new Ctor(x);pr=Ctor.precision;rm=Ctor.rounding;Ctor.precision=pr+10;Ctor.rounding=1;x=x.sin();x.s=1;x=divide(x,new Ctor(1).minus(x.times(x)).sqrt(),pr+10,0);Ctor.precision=pr;Ctor.rounding=rm;return finalise(quadrant==2||quadrant==4?x.neg():x,pr,rm,true);};/*
   *  n * 0 = 0
   *  n * N = N
   *  n * I = I
   *  0 * n = 0
   *  0 * 0 = 0
   *  0 * N = N
   *  0 * I = N
   *  N * n = N
   *  N * 0 = N
   *  N * N = N
   *  N * I = N
   *  I * n = I
   *  I * 0 = N
   *  I * N = N
   *  I * I = I
   *
   * Return a new Decimal whose value is this Decimal times `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   */P.times=P.mul=function(y){var carry,e,i,k,r,rL,t,xdL,ydL,x=this,Ctor=x.constructor,xd=x.d,yd=(y=new Ctor(y)).d;y.s*=x.s;// If either is NaN, ±Infinity or ±0...
if(!xd||!xd[0]||!yd||!yd[0]){return new Ctor(!y.s||xd&&!xd[0]&&!yd||yd&&!yd[0]&&!xd// Return NaN if either is NaN.
// Return NaN if x is ±0 and y is ±Infinity, or y is ±0 and x is ±Infinity.
?NaN// Return ±Infinity if either is ±Infinity.
// Return ±0 if either is ±0.
:!xd||!yd?y.s/0:y.s*0);}e=mathfloor(x.e/LOG_BASE)+mathfloor(y.e/LOG_BASE);xdL=xd.length;ydL=yd.length;// Ensure xd points to the longer array.
if(xdL<ydL){r=xd;xd=yd;yd=r;rL=xdL;xdL=ydL;ydL=rL;}// Initialise the result array with zeros.
r=[];rL=xdL+ydL;for(i=rL;i--;)r.push(0);// Multiply!
for(i=ydL;--i>=0;){carry=0;for(k=xdL+i;k>i;){t=r[k]+yd[i]*xd[k-i-1]+carry;r[k--]=t%BASE|0;carry=t/BASE|0;}r[k]=(r[k]+carry)%BASE|0;}// Remove trailing zeros.
for(;!r[--rL];)r.pop();if(carry)++e;else r.shift();y.d=r;y.e=getBase10Exponent(r,e);return external?finalise(y,Ctor.precision,Ctor.rounding):y;};/*
   * Return a string representing the value of this Decimal in base 2, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */P.toBinary=function(sd,rm){return toStringBinary(this,2,sd,rm);};/*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
   * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
   *
   * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */P.toDecimalPlaces=P.toDP=function(dp,rm){var x=this,Ctor=x.constructor;x=new Ctor(x);if(dp===void 0)return x;checkInt32(dp,0,MAX_DIGITS);if(rm===void 0)rm=Ctor.rounding;else checkInt32(rm,0,8);return finalise(x,dp+x.e+1,rm);};/*
   * Return a string representing the value of this Decimal in exponential notation rounded to
   * `dp` fixed decimal places using rounding mode `rounding`.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */P.toExponential=function(dp,rm){var str,x=this,Ctor=x.constructor;if(dp===void 0){str=finiteToString(x,true);}else{checkInt32(dp,0,MAX_DIGITS);if(rm===void 0)rm=Ctor.rounding;else checkInt32(rm,0,8);x=finalise(new Ctor(x),dp+1,rm);str=finiteToString(x,true,dp+1);}return x.isNeg()&&!x.isZero()?'-'+str:str;};/*
   * Return a string representing the value of this Decimal in normal (fixed-point) notation to
   * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
   * omitted.
   *
   * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
   * (-0).toFixed(3) is '0.000'.
   * (-0.5).toFixed(0) is '-0'.
   *
   */P.toFixed=function(dp,rm){var str,y,x=this,Ctor=x.constructor;if(dp===void 0){str=finiteToString(x);}else{checkInt32(dp,0,MAX_DIGITS);if(rm===void 0)rm=Ctor.rounding;else checkInt32(rm,0,8);y=finalise(new Ctor(x),dp+x.e+1,rm);str=finiteToString(y,false,dp+y.e+1);}// To determine whether to add the minus sign look at the value before it was rounded,
// i.e. look at `x` rather than `y`.
return x.isNeg()&&!x.isZero()?'-'+str:str;};/*
   * Return an array representing the value of this Decimal as a simple fraction with an integer
   * numerator and an integer denominator.
   *
   * The denominator will be a positive non-zero value less than or equal to the specified maximum
   * denominator. If a maximum denominator is not specified, the denominator will be the lowest
   * value necessary to represent the number exactly.
   *
   * [maxD] {number|string|Decimal} Maximum denominator. Integer >= 1 and < Infinity.
   *
   */P.toFraction=function(maxD){var d,d0,d1,d2,e,k,n,n0,n1,pr,q,r,x=this,xd=x.d,Ctor=x.constructor;if(!xd)return new Ctor(x);n1=d0=new Ctor(1);d1=n0=new Ctor(0);d=new Ctor(d1);e=d.e=getPrecision(xd)-x.e-1;k=e%LOG_BASE;d.d[0]=mathpow(10,k<0?LOG_BASE+k:k);if(maxD==null){// d is 10**e, the minimum max-denominator needed.
maxD=e>0?d:n1;}else{n=new Ctor(maxD);if(!n.isInt()||n.lt(n1))throw Error(invalidArgument+n);maxD=n.gt(d)?e>0?d:n1:n;}external=false;n=new Ctor(digitsToString(xd));pr=Ctor.precision;Ctor.precision=e=xd.length*LOG_BASE*2;for(;;){q=divide(n,d,0,1,1);d2=d0.plus(q.times(d1));if(d2.cmp(maxD)==1)break;d0=d1;d1=d2;d2=n1;n1=n0.plus(q.times(d2));n0=d2;d2=d;d=n.minus(q.times(d2));n=d2;}d2=divide(maxD.minus(d0),d1,0,1,1);n0=n0.plus(d2.times(n1));d0=d0.plus(d2.times(d1));n0.s=n1.s=x.s;// Determine which fraction is closer to x, n0/d0 or n1/d1?
r=divide(n1,d1,e,1).minus(x).abs().cmp(divide(n0,d0,e,1).minus(x).abs())<1?[n1,d1]:[n0,d0];Ctor.precision=pr;external=true;return r;};/*
   * Return a string representing the value of this Decimal in base 16, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */P.toHexadecimal=P.toHex=function(sd,rm){return toStringBinary(this,16,sd,rm);};/*
   * Returns a new Decimal whose value is the nearest multiple of `y` in the direction of rounding
   * mode `rm`, or `Decimal.rounding` if `rm` is omitted, to the value of this Decimal.
   *
   * The return value will always have the same sign as this Decimal, unless either this Decimal
   * or `y` is NaN, in which case the return value will be also be NaN.
   *
   * The return value is not affected by the value of `precision`.
   *
   * y {number|string|Decimal} The magnitude to round to a multiple of.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toNearest() rounding mode not an integer: {rm}'
   * 'toNearest() rounding mode out of range: {rm}'
   *
   */P.toNearest=function(y,rm){var x=this,Ctor=x.constructor;x=new Ctor(x);if(y==null){// If x is not finite, return x.
if(!x.d)return x;y=new Ctor(1);rm=Ctor.rounding;}else{y=new Ctor(y);if(rm===void 0){rm=Ctor.rounding;}else{checkInt32(rm,0,8);}// If x is not finite, return x if y is not NaN, else NaN.
if(!x.d)return y.s?x:y;// If y is not finite, return Infinity with the sign of x if y is Infinity, else NaN.
if(!y.d){if(y.s)y.s=x.s;return y;}}// If y is not zero, calculate the nearest multiple of y to x.
if(y.d[0]){external=false;x=divide(x,y,0,rm,1).times(y);external=true;finalise(x);// If y is zero, return zero with the sign of x.
}else{y.s=x.s;x=y;}return x;};/*
   * Return the value of this Decimal converted to a number primitive.
   * Zero keeps its sign.
   *
   */P.toNumber=function(){return+this;};/*
   * Return a string representing the value of this Decimal in base 8, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */P.toOctal=function(sd,rm){return toStringBinary(this,8,sd,rm);};/*
   * Return a new Decimal whose value is the value of this Decimal raised to the power `y`, rounded
   * to `precision` significant digits using rounding mode `rounding`.
   *
   * ECMAScript compliant.
   *
   *   pow(x, NaN)                           = NaN
   *   pow(x, ±0)                            = 1

   *   pow(NaN, non-zero)                    = NaN
   *   pow(abs(x) > 1, +Infinity)            = +Infinity
   *   pow(abs(x) > 1, -Infinity)            = +0
   *   pow(abs(x) == 1, ±Infinity)           = NaN
   *   pow(abs(x) < 1, +Infinity)            = +0
   *   pow(abs(x) < 1, -Infinity)            = +Infinity
   *   pow(+Infinity, y > 0)                 = +Infinity
   *   pow(+Infinity, y < 0)                 = +0
   *   pow(-Infinity, odd integer > 0)       = -Infinity
   *   pow(-Infinity, even integer > 0)      = +Infinity
   *   pow(-Infinity, odd integer < 0)       = -0
   *   pow(-Infinity, even integer < 0)      = +0
   *   pow(+0, y > 0)                        = +0
   *   pow(+0, y < 0)                        = +Infinity
   *   pow(-0, odd integer > 0)              = -0
   *   pow(-0, even integer > 0)             = +0
   *   pow(-0, odd integer < 0)              = -Infinity
   *   pow(-0, even integer < 0)             = +Infinity
   *   pow(finite x < 0, finite non-integer) = NaN
   *
   * For non-integer or very large exponents pow(x, y) is calculated using
   *
   *   x^y = exp(y*ln(x))
   *
   * Assuming the first 15 rounding digits are each equally likely to be any digit 0-9, the
   * probability of an incorrectly rounded result
   * P([49]9{14} | [50]0{14}) = 2 * 0.2 * 10^-14 = 4e-15 = 1/2.5e+14
   * i.e. 1 in 250,000,000,000,000
   *
   * If a result is incorrectly rounded the maximum error will be 1 ulp (unit in last place).
   *
   * y {number|string|Decimal} The power to which to raise this Decimal.
   *
   */P.toPower=P.pow=function(y){var e,k,pr,r,rm,s,x=this,Ctor=x.constructor,yn=+(y=new Ctor(y));// Either ±Infinity, NaN or ±0?
if(!x.d||!y.d||!x.d[0]||!y.d[0])return new Ctor(mathpow(+x,yn));x=new Ctor(x);if(x.eq(1))return x;pr=Ctor.precision;rm=Ctor.rounding;if(y.eq(1))return finalise(x,pr,rm);// y exponent
e=mathfloor(y.e/LOG_BASE);// If y is a small integer use the 'exponentiation by squaring' algorithm.
if(e>=y.d.length-1&&(k=yn<0?-yn:yn)<=MAX_SAFE_INTEGER){r=intPow(Ctor,x,k,pr);return y.s<0?new Ctor(1).div(r):finalise(r,pr,rm);}s=x.s;// if x is negative
if(s<0){// if y is not an integer
if(e<y.d.length-1)return new Ctor(NaN);// Result is positive if x is negative and the last digit of integer y is even.
if((y.d[e]&1)==0)s=1;// if x.eq(-1)
if(x.e==0&&x.d[0]==1&&x.d.length==1){x.s=s;return x;}}// Estimate result exponent.
// x^y = 10^e,  where e = y * log10(x)
// log10(x) = log10(x_significand) + x_exponent
// log10(x_significand) = ln(x_significand) / ln(10)
k=mathpow(+x,yn);e=k==0||!isFinite(k)?mathfloor(yn*(Math.log('0.'+digitsToString(x.d))/Math.LN10+x.e+1)):new Ctor(k+'').e;// Exponent estimate may be incorrect e.g. x: 0.999999999999999999, y: 2.29, e: 0, r.e: -1.
// Overflow/underflow?
if(e>Ctor.maxE+1||e<Ctor.minE-1)return new Ctor(e>0?s/0:0);external=false;Ctor.rounding=x.s=1;// Estimate the extra guard digits needed to ensure five correct rounding digits from
// naturalLogarithm(x). Example of failure without these extra digits (precision: 10):
// new Decimal(2.32456).pow('2087987436534566.46411')
// should be 1.162377823e+764914905173815, but is 1.162355823e+764914905173815
k=Math.min(12,(e+'').length);// r = x^y = exp(y*ln(x))
r=naturalExponential(y.times(naturalLogarithm(x,pr+k)),pr);// r may be Infinity, e.g. (0.9999999999999999).pow(-1e+40)
if(r.d){// Truncate to the required precision plus five rounding digits.
r=finalise(r,pr+5,1);// If the rounding digits are [49]9999 or [50]0000 increase the precision by 10 and recalculate
// the result.
if(checkRoundingDigits(r.d,pr,rm)){e=pr+10;// Truncate to the increased precision plus five rounding digits.
r=finalise(naturalExponential(y.times(naturalLogarithm(x,e+k)),e),e+5,1);// Check for 14 nines from the 2nd rounding digit (the first rounding digit may be 4 or 9).
if(+digitsToString(r.d).slice(pr+1,pr+15)+1==1e14){r=finalise(r,pr+1,0);}}}r.s=s;external=true;Ctor.rounding=rm;return finalise(r,pr,rm);};/*
   * Return a string representing the value of this Decimal rounded to `sd` significant digits
   * using rounding mode `rounding`.
   *
   * Return exponential notation if `sd` is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */P.toPrecision=function(sd,rm){var str,x=this,Ctor=x.constructor;if(sd===void 0){str=finiteToString(x,x.e<=Ctor.toExpNeg||x.e>=Ctor.toExpPos);}else{checkInt32(sd,1,MAX_DIGITS);if(rm===void 0)rm=Ctor.rounding;else checkInt32(rm,0,8);x=finalise(new Ctor(x),sd,rm);str=finiteToString(x,sd<=x.e||x.e<=Ctor.toExpNeg,sd);}return x.isNeg()&&!x.isZero()?'-'+str:str;};/*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
   * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
   * omitted.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toSD() digits out of range: {sd}'
   * 'toSD() digits not an integer: {sd}'
   * 'toSD() rounding mode not an integer: {rm}'
   * 'toSD() rounding mode out of range: {rm}'
   *
   */P.toSignificantDigits=P.toSD=function(sd,rm){var x=this,Ctor=x.constructor;if(sd===void 0){sd=Ctor.precision;rm=Ctor.rounding;}else{checkInt32(sd,1,MAX_DIGITS);if(rm===void 0)rm=Ctor.rounding;else checkInt32(rm,0,8);}return finalise(new Ctor(x),sd,rm);};/*
   * Return a string representing the value of this Decimal.
   *
   * Return exponential notation if this Decimal has a positive exponent equal to or greater than
   * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
   *
   */P.toString=function(){var x=this,Ctor=x.constructor,str=finiteToString(x,x.e<=Ctor.toExpNeg||x.e>=Ctor.toExpPos);return x.isNeg()&&!x.isZero()?'-'+str:str;};/*
   * Return a new Decimal whose value is the value of this Decimal truncated to a whole number.
   *
   */P.truncated=P.trunc=function(){return finalise(new this.constructor(this),this.e+1,1);};/*
   * Return a string representing the value of this Decimal.
   * Unlike `toString`, negative zero will include the minus sign.
   *
   */P.valueOf=P.toJSON=function(){var x=this,Ctor=x.constructor,str=finiteToString(x,x.e<=Ctor.toExpNeg||x.e>=Ctor.toExpPos);return x.isNeg()?'-'+str:str;};// Helper functions for Decimal.prototype (P) and/or Decimal methods, and their callers.
/*
   *  digitsToString           P.cubeRoot, P.logarithm, P.squareRoot, P.toFraction, P.toPower,
   *                           finiteToString, naturalExponential, naturalLogarithm
   *  checkInt32               P.toDecimalPlaces, P.toExponential, P.toFixed, P.toNearest,
   *                           P.toPrecision, P.toSignificantDigits, toStringBinary, random
   *  checkRoundingDigits      P.logarithm, P.toPower, naturalExponential, naturalLogarithm
   *  convertBase              toStringBinary, parseOther
   *  cos                      P.cos
   *  divide                   P.atanh, P.cubeRoot, P.dividedBy, P.dividedToIntegerBy,
   *                           P.logarithm, P.modulo, P.squareRoot, P.tan, P.tanh, P.toFraction,
   *                           P.toNearest, toStringBinary, naturalExponential, naturalLogarithm,
   *                           taylorSeries, atan2, parseOther
   *  finalise                 P.absoluteValue, P.atan, P.atanh, P.ceil, P.cos, P.cosh,
   *                           P.cubeRoot, P.dividedToIntegerBy, P.floor, P.logarithm, P.minus,
   *                           P.modulo, P.negated, P.plus, P.round, P.sin, P.sinh, P.squareRoot,
   *                           P.tan, P.times, P.toDecimalPlaces, P.toExponential, P.toFixed,
   *                           P.toNearest, P.toPower, P.toPrecision, P.toSignificantDigits,
   *                           P.truncated, divide, getLn10, getPi, naturalExponential,
   *                           naturalLogarithm, ceil, floor, round, trunc
   *  finiteToString           P.toExponential, P.toFixed, P.toPrecision, P.toString, P.valueOf,
   *                           toStringBinary
   *  getBase10Exponent        P.minus, P.plus, P.times, parseOther
   *  getLn10                  P.logarithm, naturalLogarithm
   *  getPi                    P.acos, P.asin, P.atan, toLessThanHalfPi, atan2
   *  getPrecision             P.precision, P.toFraction
   *  getZeroString            digitsToString, finiteToString
   *  intPow                   P.toPower, parseOther
   *  isOdd                    toLessThanHalfPi
   *  maxOrMin                 max, min
   *  naturalExponential       P.naturalExponential, P.toPower
   *  naturalLogarithm         P.acosh, P.asinh, P.atanh, P.logarithm, P.naturalLogarithm,
   *                           P.toPower, naturalExponential
   *  nonFiniteToString        finiteToString, toStringBinary
   *  parseDecimal             Decimal
   *  parseOther               Decimal
   *  sin                      P.sin
   *  taylorSeries             P.cosh, P.sinh, cos, sin
   *  toLessThanHalfPi         P.cos, P.sin
   *  toStringBinary           P.toBinary, P.toHexadecimal, P.toOctal
   *  truncate                 intPow
   *
   *  Throws:                  P.logarithm, P.precision, P.toFraction, checkInt32, getLn10, getPi,
   *                           naturalLogarithm, config, parseOther, random, Decimal
   */function digitsToString(d){var i,k,ws,indexOfLastWord=d.length-1,str='',w=d[0];if(indexOfLastWord>0){str+=w;for(i=1;i<indexOfLastWord;i++){ws=d[i]+'';k=LOG_BASE-ws.length;if(k)str+=getZeroString(k);str+=ws;}w=d[i];ws=w+'';k=LOG_BASE-ws.length;if(k)str+=getZeroString(k);}else if(w===0){return'0';}// Remove trailing zeros of last w.
for(;w%10===0;)w/=10;return str+w;}function checkInt32(i,min,max){if(i!==~~i||i<min||i>max){throw Error(invalidArgument+i);}}/*
   * Check 5 rounding digits if `repeating` is null, 4 otherwise.
   * `repeating == null` if caller is `log` or `pow`,
   * `repeating != null` if caller is `naturalLogarithm` or `naturalExponential`.
   */function checkRoundingDigits(d,i,rm,repeating){var di,k,r,rd;// Get the length of the first word of the array d.
for(k=d[0];k>=10;k/=10)--i;// Is the rounding digit in the first word of d?
if(--i<0){i+=LOG_BASE;di=0;}else{di=Math.ceil((i+1)/LOG_BASE);i%=LOG_BASE;}// i is the index (0 - 6) of the rounding digit.
// E.g. if within the word 3487563 the first rounding digit is 5,
// then i = 4, k = 1000, rd = 3487563 % 1000 = 563
k=mathpow(10,LOG_BASE-i);rd=d[di]%k|0;if(repeating==null){if(i<3){if(i==0)rd=rd/100|0;else if(i==1)rd=rd/10|0;r=rm<4&&rd==99999||rm>3&&rd==49999||rd==50000||rd==0;}else{r=(rm<4&&rd+1==k||rm>3&&rd+1==k/2)&&(d[di+1]/k/100|0)==mathpow(10,i-2)-1||(rd==k/2||rd==0)&&(d[di+1]/k/100|0)==0;}}else{if(i<4){if(i==0)rd=rd/1000|0;else if(i==1)rd=rd/100|0;else if(i==2)rd=rd/10|0;r=(repeating||rm<4)&&rd==9999||!repeating&&rm>3&&rd==4999;}else{r=((repeating||rm<4)&&rd+1==k||!repeating&&rm>3&&rd+1==k/2)&&(d[di+1]/k/1000|0)==mathpow(10,i-3)-1;}}return r;}// Convert string of `baseIn` to an array of numbers of `baseOut`.
// Eg. convertBase('255', 10, 16) returns [15, 15].
// Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
function convertBase(str,baseIn,baseOut){var j,arr=[0],arrL,i=0,strL=str.length;for(;i<strL;){for(arrL=arr.length;arrL--;)arr[arrL]*=baseIn;arr[0]+=NUMERALS.indexOf(str.charAt(i++));for(j=0;j<arr.length;j++){if(arr[j]>baseOut-1){if(arr[j+1]===void 0)arr[j+1]=0;arr[j+1]+=arr[j]/baseOut|0;arr[j]%=baseOut;}}}return arr.reverse();}/*
   * cos(x) = 1 - x^2/2! + x^4/4! - ...
   * |x| < pi/2
   *
   */function cosine(Ctor,x){var k,len,y;if(x.isZero())return x;// Argument reduction: cos(4x) = 8*(cos^4(x) - cos^2(x)) + 1
// i.e. cos(x) = 8*(cos^4(x/4) - cos^2(x/4)) + 1
// Estimate the optimum number of times to use the argument reduction.
len=x.d.length;if(len<32){k=Math.ceil(len/3);y=(1/tinyPow(4,k)).toString();}else{k=16;y='2.3283064365386962890625e-10';}Ctor.precision+=k;x=taylorSeries(Ctor,1,x.times(y),new Ctor(1));// Reverse argument reduction
for(var i=k;i--;){var cos2x=x.times(x);x=cos2x.times(cos2x).minus(cos2x).times(8).plus(1);}Ctor.precision-=k;return x;}/*
   * Perform division in the specified base.
   */var divide=function(){// Assumes non-zero x and k, and hence non-zero result.
function multiplyInteger(x,k,base){var temp,carry=0,i=x.length;for(x=x.slice();i--;){temp=x[i]*k+carry;x[i]=temp%base|0;carry=temp/base|0;}if(carry)x.unshift(carry);return x;}function compare(a,b,aL,bL){var i,r;if(aL!=bL){r=aL>bL?1:-1;}else{for(i=r=0;i<aL;i++){if(a[i]!=b[i]){r=a[i]>b[i]?1:-1;break;}}}return r;}function subtract(a,b,aL,base){var i=0;// Subtract b from a.
for(;aL--;){a[aL]-=i;i=a[aL]<b[aL]?1:0;a[aL]=i*base+a[aL]-b[aL];}// Remove leading zeros.
for(;!a[0]&&a.length>1;)a.shift();}return function(x,y,pr,rm,dp,base){var cmp,e,i,k,logBase,more,prod,prodL,q,qd,rem,remL,rem0,sd,t,xi,xL,yd0,yL,yz,Ctor=x.constructor,sign=x.s==y.s?1:-1,xd=x.d,yd=y.d;// Either NaN, Infinity or 0?
if(!xd||!xd[0]||!yd||!yd[0]){return new Ctor(// Return NaN if either NaN, or both Infinity or 0.
!x.s||!y.s||(xd?yd&&xd[0]==yd[0]:!yd)?NaN:// Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
xd&&xd[0]==0||!yd?sign*0:sign/0);}if(base){logBase=1;e=x.e-y.e;}else{base=BASE;logBase=LOG_BASE;e=mathfloor(x.e/logBase)-mathfloor(y.e/logBase);}yL=yd.length;xL=xd.length;q=new Ctor(sign);qd=q.d=[];// Result exponent may be one less than e.
// The digit array of a Decimal from toStringBinary may have trailing zeros.
for(i=0;yd[i]==(xd[i]||0);i++);if(yd[i]>(xd[i]||0))e--;if(pr==null){sd=pr=Ctor.precision;rm=Ctor.rounding;}else if(dp){sd=pr+(x.e-y.e)+1;}else{sd=pr;}if(sd<0){qd.push(1);more=true;}else{// Convert precision in number of base 10 digits to base 1e7 digits.
sd=sd/logBase+2|0;i=0;// divisor < 1e7
if(yL==1){k=0;yd=yd[0];sd++;// k is the carry.
for(;(i<xL||k)&&sd--;i++){t=k*base+(xd[i]||0);qd[i]=t/yd|0;k=t%yd|0;}more=k||i<xL;// divisor >= 1e7
}else{// Normalise xd and yd so highest order digit of yd is >= base/2
k=base/(yd[0]+1)|0;if(k>1){yd=multiplyInteger(yd,k,base);xd=multiplyInteger(xd,k,base);yL=yd.length;xL=xd.length;}xi=yL;rem=xd.slice(0,yL);remL=rem.length;// Add zeros to make remainder as long as divisor.
for(;remL<yL;)rem[remL++]=0;yz=yd.slice();yz.unshift(0);yd0=yd[0];if(yd[1]>=base/2)++yd0;do{k=0;// Compare divisor and remainder.
cmp=compare(yd,rem,yL,remL);// If divisor < remainder.
if(cmp<0){// Calculate trial digit, k.
rem0=rem[0];if(yL!=remL)rem0=rem0*base+(rem[1]||0);// k will be how many times the divisor goes into the current remainder.
k=rem0/yd0|0;//  Algorithm:
//  1. product = divisor * trial digit (k)
//  2. if product > remainder: product -= divisor, k--
//  3. remainder -= product
//  4. if product was < remainder at 2:
//    5. compare new remainder and divisor
//    6. If remainder > divisor: remainder -= divisor, k++
if(k>1){if(k>=base)k=base-1;// product = divisor * trial digit.
prod=multiplyInteger(yd,k,base);prodL=prod.length;remL=rem.length;// Compare product and remainder.
cmp=compare(prod,rem,prodL,remL);// product > remainder.
if(cmp==1){k--;// Subtract divisor from product.
subtract(prod,yL<prodL?yz:yd,prodL,base);}}else{// cmp is -1.
// If k is 0, there is no need to compare yd and rem again below, so change cmp to 1
// to avoid it. If k is 1 there is a need to compare yd and rem again below.
if(k==0)cmp=k=1;prod=yd.slice();}prodL=prod.length;if(prodL<remL)prod.unshift(0);// Subtract product from remainder.
subtract(rem,prod,remL,base);// If product was < previous remainder.
if(cmp==-1){remL=rem.length;// Compare divisor and new remainder.
cmp=compare(yd,rem,yL,remL);// If divisor < new remainder, subtract divisor from remainder.
if(cmp<1){k++;// Subtract divisor from remainder.
subtract(rem,yL<remL?yz:yd,remL,base);}}remL=rem.length;}else if(cmp===0){k++;rem=[0];}// if cmp === 1, k will be 0
// Add the next digit, k, to the result array.
qd[i++]=k;// Update the remainder.
if(cmp&&rem[0]){rem[remL++]=xd[xi]||0;}else{rem=[xd[xi]];remL=1;}}while((xi++<xL||rem[0]!==void 0)&&sd--);more=rem[0]!==void 0;}// Leading zero?
if(!qd[0])qd.shift();}// logBase is 1 when divide is being used for base conversion.
if(logBase==1){q.e=e;inexact=more;}else{// To calculate q.e, first get the number of digits of qd[0].
for(i=1,k=qd[0];k>=10;k/=10)i++;q.e=i+e*logBase-1;finalise(q,dp?pr+q.e+1:pr,rm,more);}return q;};}();/*
   * Round `x` to `sd` significant digits using rounding mode `rm`.
   * Check for over/under-flow.
   */function finalise(x,sd,rm,isTruncated){var digits,i,j,k,rd,roundUp,w,xd,xdi,Ctor=x.constructor;// Don't round if sd is null or undefined.
out:if(sd!=null){xd=x.d;// Infinity/NaN.
if(!xd)return x;// rd: the rounding digit, i.e. the digit after the digit that may be rounded up.
// w: the word of xd containing rd, a base 1e7 number.
// xdi: the index of w within xd.
// digits: the number of digits of w.
// i: what would be the index of rd within w if all the numbers were 7 digits long (i.e. if
// they had leading zeros)
// j: if > 0, the actual index of rd within w (if < 0, rd is a leading zero).
// Get the length of the first word of the digits array xd.
for(digits=1,k=xd[0];k>=10;k/=10)digits++;i=sd-digits;// Is the rounding digit in the first word of xd?
if(i<0){i+=LOG_BASE;j=sd;w=xd[xdi=0];// Get the rounding digit at index j of w.
rd=w/mathpow(10,digits-j-1)%10|0;}else{xdi=Math.ceil((i+1)/LOG_BASE);k=xd.length;if(xdi>=k){if(isTruncated){// Needed by `naturalExponential`, `naturalLogarithm` and `squareRoot`.
for(;k++<=xdi;)xd.push(0);w=rd=0;digits=1;i%=LOG_BASE;j=i-LOG_BASE+1;}else{break out;}}else{w=k=xd[xdi];// Get the number of digits of w.
for(digits=1;k>=10;k/=10)digits++;// Get the index of rd within w.
i%=LOG_BASE;// Get the index of rd within w, adjusted for leading zeros.
// The number of leading zeros of w is given by LOG_BASE - digits.
j=i-LOG_BASE+digits;// Get the rounding digit at index j of w.
rd=j<0?0:w/mathpow(10,digits-j-1)%10|0;}}// Are there any non-zero digits after the rounding digit?
isTruncated=isTruncated||sd<0||xd[xdi+1]!==void 0||(j<0?w:w%mathpow(10,digits-j-1));// The expression `w % mathpow(10, digits - j - 1)` returns all the digits of w to the right
// of the digit at (left-to-right) index j, e.g. if w is 908714 and j is 2, the expression
// will give 714.
roundUp=rm<4?(rd||isTruncated)&&(rm==0||rm==(x.s<0?3:2)):rd>5||rd==5&&(rm==4||isTruncated||rm==6&&// Check whether the digit to the left of the rounding digit is odd.
(i>0?j>0?w/mathpow(10,digits-j):0:xd[xdi-1])%10&1||rm==(x.s<0?8:7));if(sd<1||!xd[0]){xd.length=0;if(roundUp){// Convert sd to decimal places.
sd-=x.e+1;// 1, 0.1, 0.01, 0.001, 0.0001 etc.
xd[0]=mathpow(10,(LOG_BASE-sd%LOG_BASE)%LOG_BASE);x.e=-sd||0;}else{// Zero.
xd[0]=x.e=0;}return x;}// Remove excess digits.
if(i==0){xd.length=xdi;k=1;xdi--;}else{xd.length=xdi+1;k=mathpow(10,LOG_BASE-i);// E.g. 56700 becomes 56000 if 7 is the rounding digit.
// j > 0 means i > number of leading zeros of w.
xd[xdi]=j>0?(w/mathpow(10,digits-j)%mathpow(10,j)|0)*k:0;}if(roundUp){for(;;){// Is the digit to be rounded up in the first word of xd?
if(xdi==0){// i will be the length of xd[0] before k is added.
for(i=1,j=xd[0];j>=10;j/=10)i++;j=xd[0]+=k;for(k=1;j>=10;j/=10)k++;// if i != k the length has increased.
if(i!=k){x.e++;if(xd[0]==BASE)xd[0]=1;}break;}else{xd[xdi]+=k;if(xd[xdi]!=BASE)break;xd[xdi--]=0;k=1;}}}// Remove trailing zeros.
for(i=xd.length;xd[--i]===0;)xd.pop();}if(external){// Overflow?
if(x.e>Ctor.maxE){// Infinity.
x.d=null;x.e=NaN;// Underflow?
}else if(x.e<Ctor.minE){// Zero.
x.e=0;x.d=[0];// Ctor.underflow = true;
}// else Ctor.underflow = false;
}return x;}function finiteToString(x,isExp,sd){if(!x.isFinite())return nonFiniteToString(x);var k,e=x.e,str=digitsToString(x.d),len=str.length;if(isExp){if(sd&&(k=sd-len)>0){str=str.charAt(0)+'.'+str.slice(1)+getZeroString(k);}else if(len>1){str=str.charAt(0)+'.'+str.slice(1);}str=str+(x.e<0?'e':'e+')+x.e;}else if(e<0){str='0.'+getZeroString(-e-1)+str;if(sd&&(k=sd-len)>0)str+=getZeroString(k);}else if(e>=len){str+=getZeroString(e+1-len);if(sd&&(k=sd-e-1)>0)str=str+'.'+getZeroString(k);}else{if((k=e+1)<len)str=str.slice(0,k)+'.'+str.slice(k);if(sd&&(k=sd-len)>0){if(e+1===len)str+='.';str+=getZeroString(k);}}return str;}// Calculate the base 10 exponent from the base 1e7 exponent.
function getBase10Exponent(digits,e){var w=digits[0];// Add the number of digits of the first word of the digits array.
for(e*=LOG_BASE;w>=10;w/=10)e++;return e;}function getLn10(Ctor,sd,pr){if(sd>LN10_PRECISION){// Reset global state in case the exception is caught.
external=true;if(pr)Ctor.precision=pr;throw Error(precisionLimitExceeded);}return finalise(new Ctor(LN10),sd,1,true);}function getPi(Ctor,sd,rm){if(sd>PI_PRECISION)throw Error(precisionLimitExceeded);return finalise(new Ctor(PI),sd,rm,true);}function getPrecision(digits){var w=digits.length-1,len=w*LOG_BASE+1;w=digits[w];// If non-zero...
if(w){// Subtract the number of trailing zeros of the last word.
for(;w%10==0;w/=10)len--;// Add the number of digits of the first word.
for(w=digits[0];w>=10;w/=10)len++;}return len;}function getZeroString(k){var zs='';for(;k--;)zs+='0';return zs;}/*
   * Return a new Decimal whose value is the value of Decimal `x` to the power `n`, where `n` is an
   * integer of type number.
   *
   * Implements 'exponentiation by squaring'. Called by `pow` and `parseOther`.
   *
   */function intPow(Ctor,x,n,pr){var isTruncated,r=new Ctor(1),// Max n of 9007199254740991 takes 53 loop iterations.
// Maximum digits array length; leaves [28, 34] guard digits.
k=Math.ceil(pr/LOG_BASE+4);external=false;for(;;){if(n%2){r=r.times(x);if(truncate(r.d,k))isTruncated=true;}n=mathfloor(n/2);if(n===0){// To ensure correct rounding when r.d is truncated, increment the last word if it is zero.
n=r.d.length-1;if(isTruncated&&r.d[n]===0)++r.d[n];break;}x=x.times(x);truncate(x.d,k);}external=true;return r;}function isOdd(n){return n.d[n.d.length-1]&1;}/*
   * Handle `max` and `min`. `ltgt` is 'lt' or 'gt'.
   */function maxOrMin(Ctor,args,ltgt){var y,x=new Ctor(args[0]),i=0;for(;++i<args.length;){y=new Ctor(args[i]);if(!y.s){x=y;break;}else if(x[ltgt](y)){x=y;}}return x;}/*
   * Return a new Decimal whose value is the natural exponential of `x` rounded to `sd` significant
   * digits.
   *
   * Taylor/Maclaurin series.
   *
   * exp(x) = x^0/0! + x^1/1! + x^2/2! + x^3/3! + ...
   *
   * Argument reduction:
   *   Repeat x = x / 32, k += 5, until |x| < 0.1
   *   exp(x) = exp(x / 2^k)^(2^k)
   *
   * Previously, the argument was initially reduced by
   * exp(x) = exp(r) * 10^k  where r = x - k * ln10, k = floor(x / ln10)
   * to first put r in the range [0, ln10], before dividing by 32 until |x| < 0.1, but this was
   * found to be slower than just dividing repeatedly by 32 as above.
   *
   * Max integer argument: exp('20723265836946413') = 6.3e+9000000000000000
   * Min integer argument: exp('-20723265836946411') = 1.2e-9000000000000000
   * (Math object integer min/max: Math.exp(709) = 8.2e+307, Math.exp(-745) = 5e-324)
   *
   *  exp(Infinity)  = Infinity
   *  exp(-Infinity) = 0
   *  exp(NaN)       = NaN
   *  exp(±0)        = 1
   *
   *  exp(x) is non-terminating for any finite, non-zero x.
   *
   *  The result will always be correctly rounded.
   *
   */function naturalExponential(x,sd){var denominator,guard,j,pow,sum,t,wpr,rep=0,i=0,k=0,Ctor=x.constructor,rm=Ctor.rounding,pr=Ctor.precision;// 0/NaN/Infinity?
if(!x.d||!x.d[0]||x.e>17){return new Ctor(x.d?!x.d[0]?1:x.s<0?0:1/0:x.s?x.s<0?0:x:0/0);}if(sd==null){external=false;wpr=pr;}else{wpr=sd;}t=new Ctor(0.03125);// while abs(x) >= 0.1
while(x.e>-2){// x = x / 2^5
x=x.times(t);k+=5;}// Use 2 * log10(2^k) + 5 (empirically derived) to estimate the increase in precision
// necessary to ensure the first 4 rounding digits are correct.
guard=Math.log(mathpow(2,k))/Math.LN10*2+5|0;wpr+=guard;denominator=pow=sum=new Ctor(1);Ctor.precision=wpr;for(;;){pow=finalise(pow.times(x),wpr,1);denominator=denominator.times(++i);t=sum.plus(divide(pow,denominator,wpr,1));if(digitsToString(t.d).slice(0,wpr)===digitsToString(sum.d).slice(0,wpr)){j=k;while(j--)sum=finalise(sum.times(sum),wpr,1);// Check to see if the first 4 rounding digits are [49]999.
// If so, repeat the summation with a higher precision, otherwise
// e.g. with precision: 18, rounding: 1
// exp(18.404272462595034083567793919843761) = 98372560.1229999999 (should be 98372560.123)
// `wpr - guard` is the index of first rounding digit.
if(sd==null){if(rep<3&&checkRoundingDigits(sum.d,wpr-guard,rm,rep)){Ctor.precision=wpr+=10;denominator=pow=t=new Ctor(1);i=0;rep++;}else{return finalise(sum,Ctor.precision=pr,rm,external=true);}}else{Ctor.precision=pr;return sum;}}sum=t;}}/*
   * Return a new Decimal whose value is the natural logarithm of `x` rounded to `sd` significant
   * digits.
   *
   *  ln(-n)        = NaN
   *  ln(0)         = -Infinity
   *  ln(-0)        = -Infinity
   *  ln(1)         = 0
   *  ln(Infinity)  = Infinity
   *  ln(-Infinity) = NaN
   *  ln(NaN)       = NaN
   *
   *  ln(n) (n != 1) is non-terminating.
   *
   */function naturalLogarithm(y,sd){var c,c0,denominator,e,numerator,rep,sum,t,wpr,x1,x2,n=1,guard=10,x=y,xd=x.d,Ctor=x.constructor,rm=Ctor.rounding,pr=Ctor.precision;// Is x negative or Infinity, NaN, 0 or 1?
if(x.s<0||!xd||!xd[0]||!x.e&&xd[0]==1&&xd.length==1){return new Ctor(xd&&!xd[0]?-1/0:x.s!=1?NaN:xd?0:x);}if(sd==null){external=false;wpr=pr;}else{wpr=sd;}Ctor.precision=wpr+=guard;c=digitsToString(xd);c0=c.charAt(0);if(Math.abs(e=x.e)<1.5e15){// Argument reduction.
// The series converges faster the closer the argument is to 1, so using
// ln(a^b) = b * ln(a),   ln(a) = ln(a^b) / b
// multiply the argument by itself until the leading digits of the significand are 7, 8, 9,
// 10, 11, 12 or 13, recording the number of multiplications so the sum of the series can
// later be divided by this number, then separate out the power of 10 using
// ln(a*10^b) = ln(a) + b*ln(10).
// max n is 21 (gives 0.9, 1.0 or 1.1) (9e15 / 21 = 4.2e14).
//while (c0 < 9 && c0 != 1 || c0 == 1 && c.charAt(1) > 1) {
// max n is 6 (gives 0.7 - 1.3)
while(c0<7&&c0!=1||c0==1&&c.charAt(1)>3){x=x.times(y);c=digitsToString(x.d);c0=c.charAt(0);n++;}e=x.e;if(c0>1){x=new Ctor('0.'+c);e++;}else{x=new Ctor(c0+'.'+c.slice(1));}}else{// The argument reduction method above may result in overflow if the argument y is a massive
// number with exponent >= 1500000000000000 (9e15 / 6 = 1.5e15), so instead recall this
// function using ln(x*10^e) = ln(x) + e*ln(10).
t=getLn10(Ctor,wpr+2,pr).times(e+'');x=naturalLogarithm(new Ctor(c0+'.'+c.slice(1)),wpr-guard).plus(t);Ctor.precision=pr;return sd==null?finalise(x,pr,rm,external=true):x;}// x1 is x reduced to a value near 1.
x1=x;// Taylor series.
// ln(y) = ln((1 + x)/(1 - x)) = 2(x + x^3/3 + x^5/5 + x^7/7 + ...)
// where x = (y - 1)/(y + 1)    (|x| < 1)
sum=numerator=x=divide(x.minus(1),x.plus(1),wpr,1);x2=finalise(x.times(x),wpr,1);denominator=3;for(;;){numerator=finalise(numerator.times(x2),wpr,1);t=sum.plus(divide(numerator,new Ctor(denominator),wpr,1));if(digitsToString(t.d).slice(0,wpr)===digitsToString(sum.d).slice(0,wpr)){sum=sum.times(2);// Reverse the argument reduction. Check that e is not 0 because, besides preventing an
// unnecessary calculation, -0 + 0 = +0 and to ensure correct rounding -0 needs to stay -0.
if(e!==0)sum=sum.plus(getLn10(Ctor,wpr+2,pr).times(e+''));sum=divide(sum,new Ctor(n),wpr,1);// Is rm > 3 and the first 4 rounding digits 4999, or rm < 4 (or the summation has
// been repeated previously) and the first 4 rounding digits 9999?
// If so, restart the summation with a higher precision, otherwise
// e.g. with precision: 12, rounding: 1
// ln(135520028.6126091714265381533) = 18.7246299999 when it should be 18.72463.
// `wpr - guard` is the index of first rounding digit.
if(sd==null){if(checkRoundingDigits(sum.d,wpr-guard,rm,rep)){Ctor.precision=wpr+=guard;t=numerator=x=divide(x1.minus(1),x1.plus(1),wpr,1);x2=finalise(x.times(x),wpr,1);denominator=rep=1;}else{return finalise(sum,Ctor.precision=pr,rm,external=true);}}else{Ctor.precision=pr;return sum;}}sum=t;denominator+=2;}}// ±Infinity, NaN.
function nonFiniteToString(x){// Unsigned.
return String(x.s*x.s/0);}/*
   * Parse the value of a new Decimal `x` from string `str`.
   */function parseDecimal(x,str){var e,i,len;// Decimal point?
if((e=str.indexOf('.'))>-1)str=str.replace('.','');// Exponential form?
if((i=str.search(/e/i))>0){// Determine exponent.
if(e<0)e=i;e+=+str.slice(i+1);str=str.substring(0,i);}else if(e<0){// Integer.
e=str.length;}// Determine leading zeros.
for(i=0;str.charCodeAt(i)===48;i++);// Determine trailing zeros.
for(len=str.length;str.charCodeAt(len-1)===48;--len);str=str.slice(i,len);if(str){len-=i;x.e=e=e-i-1;x.d=[];// Transform base
// e is the base 10 exponent.
// i is where to slice str to get the first word of the digits array.
i=(e+1)%LOG_BASE;if(e<0)i+=LOG_BASE;if(i<len){if(i)x.d.push(+str.slice(0,i));for(len-=LOG_BASE;i<len;)x.d.push(+str.slice(i,i+=LOG_BASE));str=str.slice(i);i=LOG_BASE-str.length;}else{i-=len;}for(;i--;)str+='0';x.d.push(+str);if(external){// Overflow?
if(x.e>x.constructor.maxE){// Infinity.
x.d=null;x.e=NaN;// Underflow?
}else if(x.e<x.constructor.minE){// Zero.
x.e=0;x.d=[0];// x.constructor.underflow = true;
}// else x.constructor.underflow = false;
}}else{// Zero.
x.e=0;x.d=[0];}return x;}/*
   * Parse the value of a new Decimal `x` from a string `str`, which is not a decimal value.
   */function parseOther(x,str){var base,Ctor,divisor,i,isFloat,len,p,xd,xe;if(str.indexOf('_')>-1){str=str.replace(/(\d)_(?=\d)/g,'$1');if(isDecimal.test(str))return parseDecimal(x,str);}else if(str==='Infinity'||str==='NaN'){if(!+str)x.s=NaN;x.e=NaN;x.d=null;return x;}if(isHex.test(str)){base=16;str=str.toLowerCase();}else if(isBinary.test(str)){base=2;}else if(isOctal.test(str)){base=8;}else{throw Error(invalidArgument+str);}// Is there a binary exponent part?
i=str.search(/p/i);if(i>0){p=+str.slice(i+1);str=str.substring(2,i);}else{str=str.slice(2);}// Convert `str` as an integer then divide the result by `base` raised to a power such that the
// fraction part will be restored.
i=str.indexOf('.');isFloat=i>=0;Ctor=x.constructor;if(isFloat){str=str.replace('.','');len=str.length;i=len-i;// log[10](16) = 1.2041... , log[10](88) = 1.9444....
divisor=intPow(Ctor,new Ctor(base),i,i*2);}xd=convertBase(str,base,BASE);xe=xd.length-1;// Remove trailing zeros.
for(i=xe;xd[i]===0;--i)xd.pop();if(i<0)return new Ctor(x.s*0);x.e=getBase10Exponent(xd,xe);x.d=xd;external=false;// At what precision to perform the division to ensure exact conversion?
// maxDecimalIntegerPartDigitCount = ceil(log[10](b) * otherBaseIntegerPartDigitCount)
// log[10](2) = 0.30103, log[10](8) = 0.90309, log[10](16) = 1.20412
// E.g. ceil(1.2 * 3) = 4, so up to 4 decimal digits are needed to represent 3 hex int digits.
// maxDecimalFractionPartDigitCount = {Hex:4|Oct:3|Bin:1} * otherBaseFractionPartDigitCount
// Therefore using 4 * the number of digits of str will always be enough.
if(isFloat)x=divide(x,divisor,len*4);// Multiply by the binary exponent part if present.
if(p)x=x.times(Math.abs(p)<54?mathpow(2,p):Decimal.pow(2,p));external=true;return x;}/*
   * sin(x) = x - x^3/3! + x^5/5! - ...
   * |x| < pi/2
   *
   */function sine(Ctor,x){var k,len=x.d.length;if(len<3){return x.isZero()?x:taylorSeries(Ctor,2,x,x);}// Argument reduction: sin(5x) = 16*sin^5(x) - 20*sin^3(x) + 5*sin(x)
// i.e. sin(x) = 16*sin^5(x/5) - 20*sin^3(x/5) + 5*sin(x/5)
// and  sin(x) = sin(x/5)(5 + sin^2(x/5)(16sin^2(x/5) - 20))
// Estimate the optimum number of times to use the argument reduction.
k=1.4*Math.sqrt(len);k=k>16?16:k|0;x=x.times(1/tinyPow(5,k));x=taylorSeries(Ctor,2,x,x);// Reverse argument reduction
var sin2_x,d5=new Ctor(5),d16=new Ctor(16),d20=new Ctor(20);for(;k--;){sin2_x=x.times(x);x=x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));}return x;}// Calculate Taylor series for `cos`, `cosh`, `sin` and `sinh`.
function taylorSeries(Ctor,n,x,y,isHyperbolic){var j,t,u,x2,i=1,pr=Ctor.precision,k=Math.ceil(pr/LOG_BASE);external=false;x2=x.times(x);u=new Ctor(y);for(;;){t=divide(u.times(x2),new Ctor(n++*n++),pr,1);u=isHyperbolic?y.plus(t):y.minus(t);y=divide(t.times(x2),new Ctor(n++*n++),pr,1);t=u.plus(y);if(t.d[k]!==void 0){for(j=k;t.d[j]===u.d[j]&&j--;);if(j==-1)break;}j=u;u=y;y=t;t=j;i++;}external=true;t.d.length=k+1;return t;}// Exponent e must be positive and non-zero.
function tinyPow(b,e){var n=b;while(--e)n*=b;return n;}// Return the absolute value of `x` reduced to less than or equal to half pi.
function toLessThanHalfPi(Ctor,x){var t,isNeg=x.s<0,pi=getPi(Ctor,Ctor.precision,1),halfPi=pi.times(0.5);x=x.abs();if(x.lte(halfPi)){quadrant=isNeg?4:1;return x;}t=x.divToInt(pi);if(t.isZero()){quadrant=isNeg?3:2;}else{x=x.minus(t.times(pi));// 0 <= x < pi
if(x.lte(halfPi)){quadrant=isOdd(t)?isNeg?2:3:isNeg?4:1;return x;}quadrant=isOdd(t)?isNeg?1:4:isNeg?3:2;}return x.minus(pi).abs();}/*
   * Return the value of Decimal `x` as a string in base `baseOut`.
   *
   * If the optional `sd` argument is present include a binary exponent suffix.
   */function toStringBinary(x,baseOut,sd,rm){var base,e,i,k,len,roundUp,str,xd,y,Ctor=x.constructor,isExp=sd!==void 0;if(isExp){checkInt32(sd,1,MAX_DIGITS);if(rm===void 0)rm=Ctor.rounding;else checkInt32(rm,0,8);}else{sd=Ctor.precision;rm=Ctor.rounding;}if(!x.isFinite()){str=nonFiniteToString(x);}else{str=finiteToString(x);i=str.indexOf('.');// Use exponential notation according to `toExpPos` and `toExpNeg`? No, but if required:
// maxBinaryExponent = floor((decimalExponent + 1) * log[2](10))
// minBinaryExponent = floor(decimalExponent * log[2](10))
// log[2](10) = 3.321928094887362347870319429489390175864
if(isExp){base=2;if(baseOut==16){sd=sd*4-3;}else if(baseOut==8){sd=sd*3-2;}}else{base=baseOut;}// Convert the number as an integer then divide the result by its base raised to a power such
// that the fraction part will be restored.
// Non-integer.
if(i>=0){str=str.replace('.','');y=new Ctor(1);y.e=str.length-i;y.d=convertBase(finiteToString(y),10,base);y.e=y.d.length;}xd=convertBase(str,10,base);e=len=xd.length;// Remove trailing zeros.
for(;xd[--len]==0;)xd.pop();if(!xd[0]){str=isExp?'0p+0':'0';}else{if(i<0){e--;}else{x=new Ctor(x);x.d=xd;x.e=e;x=divide(x,y,sd,rm,0,base);xd=x.d;e=x.e;roundUp=inexact;}// The rounding digit, i.e. the digit after the digit that may be rounded up.
i=xd[sd];k=base/2;roundUp=roundUp||xd[sd+1]!==void 0;roundUp=rm<4?(i!==void 0||roundUp)&&(rm===0||rm===(x.s<0?3:2)):i>k||i===k&&(rm===4||roundUp||rm===6&&xd[sd-1]&1||rm===(x.s<0?8:7));xd.length=sd;if(roundUp){// Rounding up may mean the previous digit has to be rounded up and so on.
for(;++xd[--sd]>base-1;){xd[sd]=0;if(!sd){++e;xd.unshift(1);}}}// Determine trailing zeros.
for(len=xd.length;!xd[len-1];--len);// E.g. [4, 11, 15] becomes 4bf.
for(i=0,str='';i<len;i++)str+=NUMERALS.charAt(xd[i]);// Add binary exponent suffix?
if(isExp){if(len>1){if(baseOut==16||baseOut==8){i=baseOut==16?4:3;for(--len;len%i;len++)str+='0';xd=convertBase(str,base,baseOut);for(len=xd.length;!xd[len-1];--len);// xd[0] will always be be 1
for(i=1,str='1.';i<len;i++)str+=NUMERALS.charAt(xd[i]);}else{str=str.charAt(0)+'.'+str.slice(1);}}str=str+(e<0?'p':'p+')+e;}else if(e<0){for(;++e;)str='0'+str;str='0.'+str;}else{if(++e>len)for(e-=len;e--;)str+='0';else if(e<len)str=str.slice(0,e)+'.'+str.slice(e);}}str=(baseOut==16?'0x':baseOut==2?'0b':baseOut==8?'0o':'')+str;}return x.s<0?'-'+str:str;}// Does not strip trailing zeros.
function truncate(arr,len){if(arr.length>len){arr.length=len;return true;}}// Decimal methods
/*
   *  abs
   *  acos
   *  acosh
   *  add
   *  asin
   *  asinh
   *  atan
   *  atanh
   *  atan2
   *  cbrt
   *  ceil
   *  clamp
   *  clone
   *  config
   *  cos
   *  cosh
   *  div
   *  exp
   *  floor
   *  hypot
   *  ln
   *  log
   *  log2
   *  log10
   *  max
   *  min
   *  mod
   *  mul
   *  pow
   *  random
   *  round
   *  set
   *  sign
   *  sin
   *  sinh
   *  sqrt
   *  sub
   *  sum
   *  tan
   *  tanh
   *  trunc
   */ /*
   * Return a new Decimal whose value is the absolute value of `x`.
   *
   * x {number|string|Decimal}
   *
   */function abs(x){return new this(x).abs();}/*
   * Return a new Decimal whose value is the arccosine in radians of `x`.
   *
   * x {number|string|Decimal}
   *
   */function acos(x){return new this(x).acos();}/*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */function acosh(x){return new this(x).acosh();}/*
   * Return a new Decimal whose value is the sum of `x` and `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */function add(x,y){return new this(x).plus(y);}/*
   * Return a new Decimal whose value is the arcsine in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */function asin(x){return new this(x).asin();}/*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */function asinh(x){return new this(x).asinh();}/*
   * Return a new Decimal whose value is the arctangent in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */function atan(x){return new this(x).atan();}/*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */function atanh(x){return new this(x).atanh();}/*
   * Return a new Decimal whose value is the arctangent in radians of `y/x` in the range -pi to pi
   * (inclusive), rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi, pi]
   *
   * y {number|string|Decimal} The y-coordinate.
   * x {number|string|Decimal} The x-coordinate.
   *
   * atan2(±0, -0)               = ±pi
   * atan2(±0, +0)               = ±0
   * atan2(±0, -x)               = ±pi for x > 0
   * atan2(±0, x)                = ±0 for x > 0
   * atan2(-y, ±0)               = -pi/2 for y > 0
   * atan2(y, ±0)                = pi/2 for y > 0
   * atan2(±y, -Infinity)        = ±pi for finite y > 0
   * atan2(±y, +Infinity)        = ±0 for finite y > 0
   * atan2(±Infinity, x)         = ±pi/2 for finite x
   * atan2(±Infinity, -Infinity) = ±3*pi/4
   * atan2(±Infinity, +Infinity) = ±pi/4
   * atan2(NaN, x) = NaN
   * atan2(y, NaN) = NaN
   *
   */function atan2(y,x){y=new this(y);x=new this(x);var r,pr=this.precision,rm=this.rounding,wpr=pr+4;// Either NaN
if(!y.s||!x.s){r=new this(NaN);// Both ±Infinity
}else if(!y.d&&!x.d){r=getPi(this,wpr,1).times(x.s>0?0.25:0.75);r.s=y.s;// x is ±Infinity or y is ±0
}else if(!x.d||y.isZero()){r=x.s<0?getPi(this,pr,rm):new this(0);r.s=y.s;// y is ±Infinity or x is ±0
}else if(!y.d||x.isZero()){r=getPi(this,wpr,1).times(0.5);r.s=y.s;// Both non-zero and finite
}else if(x.s<0){this.precision=wpr;this.rounding=1;r=this.atan(divide(y,x,wpr,1));x=getPi(this,wpr,1);this.precision=pr;this.rounding=rm;r=y.s<0?r.minus(x):r.plus(x);}else{r=this.atan(divide(y,x,wpr,1));}return r;}/*
   * Return a new Decimal whose value is the cube root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */function cbrt(x){return new this(x).cbrt();}/*
   * Return a new Decimal whose value is `x` rounded to an integer using `ROUND_CEIL`.
   *
   * x {number|string|Decimal}
   *
   */function ceil(x){return finalise(x=new this(x),x.e+1,2);}/*
   * Return a new Decimal whose value is `x` clamped to the range delineated by `min` and `max`.
   *
   * x {number|string|Decimal}
   * min {number|string|Decimal}
   * max {number|string|Decimal}
   *
   */function clamp(x,min,max){return new this(x).clamp(min,max);}/*
   * Configure global settings for a Decimal constructor.
   *
   * `obj` is an object with one or more of the following properties,
   *
   *   precision  {number}
   *   rounding   {number}
   *   toExpNeg   {number}
   *   toExpPos   {number}
   *   maxE       {number}
   *   minE       {number}
   *   modulo     {number}
   *   crypto     {boolean|number}
   *   defaults   {true}
   *
   * E.g. Decimal.config({ precision: 20, rounding: 4 })
   *
   */function config(obj){if(!obj||typeof obj!=='object')throw Error(decimalError+'Object expected');var i,p,v,useDefaults=obj.defaults===true,ps=['precision',1,MAX_DIGITS,'rounding',0,8,'toExpNeg',-EXP_LIMIT,0,'toExpPos',0,EXP_LIMIT,'maxE',0,EXP_LIMIT,'minE',-EXP_LIMIT,0,'modulo',0,9];for(i=0;i<ps.length;i+=3){if(p=ps[i],useDefaults)this[p]=DEFAULTS[p];if((v=obj[p])!==void 0){if(mathfloor(v)===v&&v>=ps[i+1]&&v<=ps[i+2])this[p]=v;else throw Error(invalidArgument+p+': '+v);}}if(p='crypto',useDefaults)this[p]=DEFAULTS[p];if((v=obj[p])!==void 0){if(v===true||v===false||v===0||v===1){if(v){if(typeof crypto!='undefined'&&crypto&&(crypto.getRandomValues||crypto.randomBytes)){this[p]=true;}else{throw Error(cryptoUnavailable);}}else{this[p]=false;}}else{throw Error(invalidArgument+p+': '+v);}}return this;}/*
   * Return a new Decimal whose value is the cosine of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */function cos(x){return new this(x).cos();}/*
   * Return a new Decimal whose value is the hyperbolic cosine of `x`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */function cosh(x){return new this(x).cosh();}/*
   * Create and return a Decimal constructor with the same configuration properties as this Decimal
   * constructor.
   *
   */function clone(obj){var i,p,ps;/*
     * The Decimal constructor and exported function.
     * Return a new Decimal instance.
     *
     * v {number|string|Decimal} A numeric value.
     *
     */function Decimal(v){var e,i,t,x=this;// Decimal called without new.
if(!(x instanceof Decimal))return new Decimal(v);// Retain a reference to this Decimal constructor, and shadow Decimal.prototype.constructor
// which points to Object.
x.constructor=Decimal;// Duplicate.
if(isDecimalInstance(v)){x.s=v.s;if(external){if(!v.d||v.e>Decimal.maxE){// Infinity.
x.e=NaN;x.d=null;}else if(v.e<Decimal.minE){// Zero.
x.e=0;x.d=[0];}else{x.e=v.e;x.d=v.d.slice();}}else{x.e=v.e;x.d=v.d?v.d.slice():v.d;}return;}t=typeof v;if(t==='number'){if(v===0){x.s=1/v<0?-1:1;x.e=0;x.d=[0];return;}if(v<0){v=-v;x.s=-1;}else{x.s=1;}// Fast path for small integers.
if(v===~~v&&v<1e7){for(e=0,i=v;i>=10;i/=10)e++;if(external){if(e>Decimal.maxE){x.e=NaN;x.d=null;}else if(e<Decimal.minE){x.e=0;x.d=[0];}else{x.e=e;x.d=[v];}}else{x.e=e;x.d=[v];}return;// Infinity, NaN.
}else if(v*0!==0){if(!v)x.s=NaN;x.e=NaN;x.d=null;return;}return parseDecimal(x,v.toString());}else if(t!=='string'){throw Error(invalidArgument+v);}// Minus sign?
if((i=v.charCodeAt(0))===45){v=v.slice(1);x.s=-1;}else{// Plus sign?
if(i===43)v=v.slice(1);x.s=1;}return isDecimal.test(v)?parseDecimal(x,v):parseOther(x,v);}Decimal.prototype=P;Decimal.ROUND_UP=0;Decimal.ROUND_DOWN=1;Decimal.ROUND_CEIL=2;Decimal.ROUND_FLOOR=3;Decimal.ROUND_HALF_UP=4;Decimal.ROUND_HALF_DOWN=5;Decimal.ROUND_HALF_EVEN=6;Decimal.ROUND_HALF_CEIL=7;Decimal.ROUND_HALF_FLOOR=8;Decimal.EUCLID=9;Decimal.config=Decimal.set=config;Decimal.clone=clone;Decimal.isDecimal=isDecimalInstance;Decimal.abs=abs;Decimal.acos=acos;Decimal.acosh=acosh;// ES6
Decimal.add=add;Decimal.asin=asin;Decimal.asinh=asinh;// ES6
Decimal.atan=atan;Decimal.atanh=atanh;// ES6
Decimal.atan2=atan2;Decimal.cbrt=cbrt;// ES6
Decimal.ceil=ceil;Decimal.clamp=clamp;Decimal.cos=cos;Decimal.cosh=cosh;// ES6
Decimal.div=div;Decimal.exp=exp;Decimal.floor=floor;Decimal.hypot=hypot;// ES6
Decimal.ln=ln;Decimal.log=log;Decimal.log10=log10;// ES6
Decimal.log2=log2;// ES6
Decimal.max=max;Decimal.min=min;Decimal.mod=mod;Decimal.mul=mul;Decimal.pow=pow;Decimal.random=random;Decimal.round=round;Decimal.sign=sign;// ES6
Decimal.sin=sin;Decimal.sinh=sinh;// ES6
Decimal.sqrt=sqrt;Decimal.sub=sub;Decimal.sum=sum;Decimal.tan=tan;Decimal.tanh=tanh;// ES6
Decimal.trunc=trunc;// ES6
if(obj===void 0)obj={};if(obj){if(obj.defaults!==true){ps=['precision','rounding','toExpNeg','toExpPos','maxE','minE','modulo','crypto'];for(i=0;i<ps.length;)if(!obj.hasOwnProperty(p=ps[i++]))obj[p]=this[p];}}Decimal.config(obj);return Decimal;}/*
   * Return a new Decimal whose value is `x` divided by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */function div(x,y){return new this(x).div(y);}/*
   * Return a new Decimal whose value is the natural exponential of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The power to which to raise the base of the natural log.
   *
   */function exp(x){return new this(x).exp();}/*
   * Return a new Decimal whose value is `x` round to an integer using `ROUND_FLOOR`.
   *
   * x {number|string|Decimal}
   *
   */function floor(x){return finalise(x=new this(x),x.e+1,3);}/*
   * Return a new Decimal whose value is the square root of the sum of the squares of the arguments,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * hypot(a, b, ...) = sqrt(a^2 + b^2 + ...)
   *
   * arguments {number|string|Decimal}
   *
   */function hypot(){var i,n,t=new this(0);external=false;for(i=0;i<arguments.length;){n=new this(arguments[i++]);if(!n.d){if(n.s){external=true;return new this(1/0);}t=n;}else if(t.d){t=t.plus(n.times(n));}}external=true;return t.sqrt();}/*
   * Return true if object is a Decimal instance (where Decimal is any Decimal constructor),
   * otherwise return false.
   *
   */function isDecimalInstance(obj){return obj instanceof Decimal||obj&&obj.toStringTag===tag||false;}/*
   * Return a new Decimal whose value is the natural logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */function ln(x){return new this(x).ln();}/*
   * Return a new Decimal whose value is the log of `x` to the base `y`, or to base 10 if no base
   * is specified, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * log[y](x)
   *
   * x {number|string|Decimal} The argument of the logarithm.
   * y {number|string|Decimal} The base of the logarithm.
   *
   */function log(x,y){return new this(x).log(y);}/*
   * Return a new Decimal whose value is the base 2 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */function log2(x){return new this(x).log(2);}/*
   * Return a new Decimal whose value is the base 10 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */function log10(x){return new this(x).log(10);}/*
   * Return a new Decimal whose value is the maximum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */function max(){return maxOrMin(this,arguments,'lt');}/*
   * Return a new Decimal whose value is the minimum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */function min(){return maxOrMin(this,arguments,'gt');}/*
   * Return a new Decimal whose value is `x` modulo `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */function mod(x,y){return new this(x).mod(y);}/*
   * Return a new Decimal whose value is `x` multiplied by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */function mul(x,y){return new this(x).mul(y);}/*
   * Return a new Decimal whose value is `x` raised to the power `y`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The base.
   * y {number|string|Decimal} The exponent.
   *
   */function pow(x,y){return new this(x).pow(y);}/*
   * Returns a new Decimal with a random value equal to or greater than 0 and less than 1, and with
   * `sd`, or `Decimal.precision` if `sd` is omitted, significant digits (or less if trailing zeros
   * are produced).
   *
   * [sd] {number} Significant digits. Integer, 0 to MAX_DIGITS inclusive.
   *
   */function random(sd){var d,e,k,n,i=0,r=new this(1),rd=[];if(sd===void 0)sd=this.precision;else checkInt32(sd,1,MAX_DIGITS);k=Math.ceil(sd/LOG_BASE);if(!this.crypto){for(;i<k;)rd[i++]=Math.random()*1e7|0;// Browsers supporting crypto.getRandomValues.
}else if(crypto.getRandomValues){d=crypto.getRandomValues(new Uint32Array(k));for(;i<k;){n=d[i];// 0 <= n < 4294967296
// Probability n >= 4.29e9, is 4967296 / 4294967296 = 0.00116 (1 in 865).
if(n>=4.29e9){d[i]=crypto.getRandomValues(new Uint32Array(1))[0];}else{// 0 <= n <= 4289999999
// 0 <= (n % 1e7) <= 9999999
rd[i++]=n%1e7;}}// Node.js supporting crypto.randomBytes.
}else if(crypto.randomBytes){// buffer
d=crypto.randomBytes(k*=4);for(;i<k;){// 0 <= n < 2147483648
n=d[i]+(d[i+1]<<8)+(d[i+2]<<16)+((d[i+3]&0x7f)<<24);// Probability n >= 2.14e9, is 7483648 / 2147483648 = 0.0035 (1 in 286).
if(n>=2.14e9){crypto.randomBytes(4).copy(d,i);}else{// 0 <= n <= 2139999999
// 0 <= (n % 1e7) <= 9999999
rd.push(n%1e7);i+=4;}}i=k/4;}else{throw Error(cryptoUnavailable);}k=rd[--i];sd%=LOG_BASE;// Convert trailing digits to zeros according to sd.
if(k&&sd){n=mathpow(10,LOG_BASE-sd);rd[i]=(k/n|0)*n;}// Remove trailing words which are zero.
for(;rd[i]===0;i--)rd.pop();// Zero?
if(i<0){e=0;rd=[0];}else{e=-1;// Remove leading words which are zero and adjust exponent accordingly.
for(;rd[0]===0;e-=LOG_BASE)rd.shift();// Count the digits of the first word of rd to determine leading zeros.
for(k=1,n=rd[0];n>=10;n/=10)k++;// Adjust the exponent for leading zeros of the first word of rd.
if(k<LOG_BASE)e-=LOG_BASE-k;}r.e=e;r.d=rd;return r;}/*
   * Return a new Decimal whose value is `x` rounded to an integer using rounding mode `rounding`.
   *
   * To emulate `Math.round`, set rounding to 7 (ROUND_HALF_CEIL).
   *
   * x {number|string|Decimal}
   *
   */function round(x){return finalise(x=new this(x),x.e+1,this.rounding);}/*
   * Return
   *   1    if x > 0,
   *  -1    if x < 0,
   *   0    if x is 0,
   *  -0    if x is -0,
   *   NaN  otherwise
   *
   * x {number|string|Decimal}
   *
   */function sign(x){x=new this(x);return x.d?x.d[0]?x.s:0*x.s:x.s||NaN;}/*
   * Return a new Decimal whose value is the sine of `x`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */function sin(x){return new this(x).sin();}/*
   * Return a new Decimal whose value is the hyperbolic sine of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */function sinh(x){return new this(x).sinh();}/*
   * Return a new Decimal whose value is the square root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */function sqrt(x){return new this(x).sqrt();}/*
   * Return a new Decimal whose value is `x` minus `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */function sub(x,y){return new this(x).sub(y);}/*
   * Return a new Decimal whose value is the sum of the arguments, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * Only the result is rounded, not the intermediate calculations.
   *
   * arguments {number|string|Decimal}
   *
   */function sum(){var i=0,args=arguments,x=new this(args[i]);external=false;for(;x.s&&++i<args.length;)x=x.plus(args[i]);external=true;return finalise(x,this.precision,this.rounding);}/*
   * Return a new Decimal whose value is the tangent of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */function tan(x){return new this(x).tan();}/*
   * Return a new Decimal whose value is the hyperbolic tangent of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */function tanh(x){return new this(x).tanh();}/*
   * Return a new Decimal whose value is `x` truncated to an integer.
   *
   * x {number|string|Decimal}
   *
   */function trunc(x){return finalise(x=new this(x),x.e+1,1);}// Create and configure initial Decimal constructor.
Decimal=clone(DEFAULTS);Decimal.prototype.constructor=Decimal;Decimal['default']=Decimal.Decimal=Decimal;// Create the internal constants from their string values.
LN10=new Decimal(LN10);PI=new Decimal(PI);// Export.
// AMD.
if(typeof define=='function'&&define.amd){define(function(){return Decimal;});// Node and other environments that support module.exports.
}else if(typeof module!='undefined'&&module.exports){if(typeof Symbol=='function'&&typeof Symbol.iterator=='symbol'){P[Symbol['for']('nodejs.util.inspect.custom')]=P.toString;P[Symbol.toStringTag]='Decimal';}module.exports=Decimal;// Browser.
}else{if(!globalScope){globalScope=typeof self!='undefined'&&self&&self.self==self?self:window;}noConflict=globalScope.Decimal;Decimal.noConflict=function(){globalScope.Decimal=noConflict;return Decimal;};globalScope.Decimal=Decimal;}})(this);},{}],2:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/ /**
* Instruction Set Bace Class.
*
* @class ElucidatorInstructionSet
*/class ElucidatorInstructionSet{constructor(pElucidator){this.elucidator=pElucidator;this.namespace='default';}// Create an empty namespace for instructions and operations if either one doesn't exist
initializeNamespace(pNamespace){if(typeof pNamespace=='string'){this.namespace=pNamespace;}if(!this.elucidator.instructionSets.hasOwnProperty(this.namespace)){this.elucidator.instructionSets[this.namespace.toLowerCase()]={};}if(!this.elucidator.operationSets.hasOwnProperty(this.namespace)){this.elucidator.operationSets[this.namespace.toLowerCase()]={};}}// Add an instruction to the set
addInstruction(pInstructionHash,fInstructionFunction){if(typeof pInstructionHash!='string'){this.elucidator.logError(`Attempted to add an instruction with an invalid hash; expected a string but the instruction hash type was ${typeof pInstructionHash}`);return false;}if(typeof fInstructionFunction!='function'){this.elucidator.logError(`Attempted to add an instruction with an invalid function; expected a function but type was ${typeof fInstructionFunction}`);return false;}this.elucidator.instructionSets[this.namespace.toLowerCase()][pInstructionHash]=fInstructionFunction;return true;}initializeInstructions(){// This is where we map in the instructions.
// If the extending class calls super it will inject a harmless noop into the scope.
// It isn't recommended to do these inline as lambdas, but this code is generally not expected to be called.
// Unless the developer wants a noop in their instruction set...........
this.addInstruction('noop',pOperation=>{pOperation.logInfo('Executing a no-operation operation.');return true;});return true;}// Add an operation to the set
addOperation(pOperationHash,pOperation){if(typeof pOperationHash!='string'){this.elucidator.logError(`Attempted to add an operation with an invalid hash; expected a string but the operation hash type was ${typeof pOperationHash}`,pOperation);return false;}if(typeof pOperation!='object'){this.elucidator.logError(`Attempted to add an invalid operation; expected an object data type but the type was ${typeof pOperation}`,pOperation);return false;}// Validate the Description subobject, which is key to functioning.
if(!pOperation.hasOwnProperty("Description")){this.elucidator.logError(`Attempted to add an operation with an invalid description; no Description subobject set.`,pOperation);return false;}if(typeof pOperation.Description!='object'){this.elucidator.logError(`Attempted to add an operation with an invalid description; Description subobject was not an object.  The type was ${typeof pOperation.Description}.`,pOperation);return false;}if(typeof pOperation.Description.Hash!='string'){if(typeof pOperation.Description.Operation=='string'){// Use the "Operation" as the "Hash"
pOperation.Description.Hash=pOperation.Description.Operation;}else{this.elucidator.logError(`Attempted to add an operation with an invalid description; Description subobject did not contain a valid Hash which is required to call the operation.`,pOperation);return false;}}// Now auto create data if it is missing or wrong in the Description
if(typeof pOperation.Description.Namespace!='string'||pOperation.Description.Namespace!=this.namespace){pOperation.Description.Namespace=this.namespace;}if(typeof pOperation.Description.Summary!='string'){pOperation.Description.Summary=`[${pOperation.Description.Namespace}] [${pOperation.Description.Hash}] operation.`;}// If there are no inputs, or outputs, or steps, add them.
if(!pOperation.hasOwnProperty('Inputs')){pOperation.Inputs={};}if(!pOperation.hasOwnProperty('Outputs')){pOperation.Outputs={};}if(!pOperation.hasOwnProperty('Steps')){pOperation.Steps=[];}// If there are no inputs, or outputs, or steps, add them.
// TODO: Add a step where we try to load this into Manyfest and see that it's valid.
if(typeof pOperation.Inputs!=='object'){this.elucidator.logError(`Attempted to add an operation with an invalid Inputs object.`,pOperation);return false;}// If there are no inputs, or outputs, or steps, add them.
// TODO: Add a step where we try to load this into Manyfest and see that it's valid.
if(typeof pOperation.Outputs!=='object'){this.elucidator.logError(`Attempted to add an operation with an invalid Outputs object.`,pOperation);return false;}if(!Array.isArray(pOperation.Steps)){this.elucidator.logError(`Attempted to add an operation with an invalid Steps array.`,pOperation);return false;}this.elucidator.operationSets[this.namespace.toLowerCase()][pOperationHash.toLowerCase()]=pOperation;return true;}initializeOperations(){this.addOperation('noop',{"Description":{"Operation":"noop","Description":"No operation - no affect on any data."}});return true;}};module.exports=ElucidatorInstructionSet;},{}],3:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/ /**
* Elucidator simple logging shim (for browser and dependency-free running)
*/const logToConsole=(pLogLine,pLogObject,pLogLevel)=>{let tmpLogLine=typeof pLogLine==='string'?pLogLine:'';let tmpLogLevel=typeof pLogLevel==='string'?pLogLevel:'INFO';console.log(`[Elucidator:${tmpLogLevel}] ${tmpLogLine}`);if(pLogObject)console.log(JSON.stringify(pLogObject,null,4)+"\n");};const logInfo=(pLogLine,pLogObject)=>{logToConsole(pLogLine,pLogObject,'Info');};const logWarning=(pLogLine,pLogObject)=>{logToConsole(pLogLine,pLogObject,'Warning');};const logError=(pLogLine,pLogObject)=>{logToConsole(pLogLine,pLogObject,'Error');};module.exports={logToConsole:logToConsole,info:logInfo,warning:logWarning,error:logError};},{}],4:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/const libSimpleLog=require('./Elucidator-LogToConsole.js');const libManyfest=require('manyfest');const libPrecedent=require('precedent');const libElucidatorInstructionSet=require('./Elucidator-InstructionSet.js');/**
* Elucidator object address-based descriptions and manipulations.
*
* @class Elucidator
*/class Elucidator{constructor(pOperations,fInfoLog,fErrorLog){// Wire in logging
this.logInfo=typeof fInfoLog==='function'?fInfoLog:libSimpleLog.info;this.logWarning=typeof fWarningLog==='function'?fWarningLog:libSimpleLog.warning;this.logError=typeof fErrorLog==='function'?fErrorLog:libSimpleLog.error;// Instructions are the basic building blocks for operations
this.instructionSets={};// Operations are the solvers that can be called (instructions can't be called directly)
// These can be added at run-time as well
this.operationSets={};// Decide later how to make this truly unique.
this.UUID=0;this.loadDefaultInstructionSets();if(pOperations){let tmpSolverHashes=Object.keys(pOperations);for(let i=0;i<tmpSolverHashes.length;i++){this.addOperation('Custom',tmpSolverHashes[i],pOperations[tmpSolverHashes[i]]);}}}// Load an instruction set
loadInstructionSet(cInstructionSet){let tmpInstructionSet=new cInstructionSet(this);// Setup the namespace
tmpInstructionSet.initializeNamespace();tmpInstructionSet.initializeInstructions();tmpInstructionSet.initializeOperations();}loadDefaultInstructionSets(){// The javascript math instructions and operations
// These provide the "Math" namespace
this.loadInstructionSet(require(`./InstructionSets/Math-Javascript.js`));// A precision javascript math library that is consistent across browsers, stable and without mantissa issues
// Uses Decimal.js
// These provide the "PreciseMath" namespace
this.loadInstructionSet(require(`./InstructionSets/PreciseMath-Decimal.js`));// The abstract geometry instructions and operations (rectangle area, circle area, etc.)
// These provide the "Geometry" namespace
this.loadInstructionSet(require(`./InstructionSets/Geometry.js`));// The logic operations (if, execution of instructions, etc.)
// These provide the "Logic" namespace
this.loadInstructionSet(require(`./InstructionSets/Logic.js`));// Basic string manipulation instructions and operations
// These provide the "String" namespace
this.loadInstructionSet(require(`./InstructionSets/String.js`));// Basic set manipulation instructions and operations
// These provide the "Set" namespace
this.loadInstructionSet(require(`./InstructionSets/Set.js`));}operationExists(pNamespace,pOperationHash){if(typeof pNamespace!='string'||typeof pOperationHash!='string'){return false;}let tmpNamespace=pNamespace.toLowerCase();return this.operationSets.hasOwnProperty(tmpNamespace)&&this.operationSets[tmpNamespace].hasOwnProperty(pOperationHash.toLowerCase());}addOperation(pNamespace,pOperationHash,pOperation){if(typeof pNamespace!='string'){this.logError(`Attempted to add an operation at runtime via Elucidator.addOperation with an invalid namespace; expected a string but the type was ${typeof pNamespace}`,pOperation);return false;}let tmpOperationInjector=new libElucidatorInstructionSet(this);tmpOperationInjector.initializeNamespace(pNamespace);return tmpOperationInjector.addOperation(pOperationHash,pOperation);}solveInternalOperation(pNamespace,pOperationHash,pInputObject,pOutputObject,pDescriptionManyfest,pInputAddressMapping,pOutputAddressMapping,pSolutionContext){if(!this.operationExists(pNamespace,pOperationHash)){this.logError(`Attempted to solveInternalOperation for namespace ${pNamespace} operationHash ${pOperationHash} but the operation was not found.`);// TODO: Should this return something with an error log populated?
return false;}let tmpOperation=this.operationSets[pNamespace.toLowerCase()][pOperationHash.toLowerCase()];return this.solveOperation(tmpOperation,pInputObject,pOutputObject,pDescriptionManyfest,pInputAddressMapping,pOutputAddressMapping,pSolutionContext);}solveOperation(pOperationObject,pInputObject,pOutputObject,pDescriptionManyfest,pInputAddressMapping,pOutputAddressMapping,pSolutionContext){let tmpOperation=JSON.parse(JSON.stringify(pOperationObject));if(typeof pInputObject!='object'){this.logError(`Attempted to run a solve but the passed in Input was not an object.  The type was ${typeof pInputObject}.`);return false;}let tmpInputObject=pInputObject;// Default to reusing the input object as the output object.
let tmpOutputObject=tmpInputObject;// This is how recursive solutions bind their context together.
let tmpSolutionContext=pSolutionContext;if(typeof tmpSolutionContext==='undefined'){tmpSolutionContext={"SolutionGUID":`Solution-${this.UUID++}`,"SolutionBaseNamespace":pOperationObject.Description.Namespace,"SolutionBaseOperation":pOperationObject.Description.Operation,"SolutionLog":[]};// This is the root operation, see if there are Inputs and Outputs created ... if not, create them.
if(!tmpOperation.hasOwnProperty('Inputs')){tmpOperation.Inputs={};}if(!tmpOperation.hasOwnProperty('Outputs')){tmpOperation.Outputs={};}// This is the root Operation, see if there is a hash translation available for either side (input or output)
if(tmpOperation.hasOwnProperty('InputHashTranslationTable')){tmpSolutionContext.InputHashMapping=JSON.parse(JSON.stringify(tmpOperation.InputHashTranslationTable));}else{tmpSolutionContext.InputHashMapping={};}if(tmpOperation.hasOwnProperty('OutputHashTranslationTable')){tmpSolutionContext.OutputHashMapping=JSON.parse(JSON.stringify(tmpOperation.OutputHashTranslationTable));}if(typeof pOutputObject!='object'&&typeof tmpOutputHashMapping=='undefined'&&typeof tmpInputHashMapping!='undefined'){// Reuse the input hash mapping if:
//   1) we auto-mapped the input hash mapping to the output because only an input object was supplied
//   2) there *was not* an output hash mapping supplied
//   3) there *was* an input hash mapping supplied
//
// This seems simple at first but exposes some really interesting behaviors in terms of
// reusing the same object and schema for input and output, but having different hash
// mappings for each of them.
tmpSolutionContext.OutputHashMapping=tmpSolutionContext.InputHashMapping;}}if(typeof pOutputObject=='object'){// If the call defined an explicit, different output object from the input object use that instead.
tmpOutputObject=pOutputObject;}let tmpDescriptionManyfest=false;if(typeof pDescriptionManyfest==='undefined'){// We are going to use this for some clever schema manipulations, then recreate the object
tmpDescriptionManyfest=new libManyfest();// Synthesize a manyfest from the Input and Output properties
let tmpManyfestSchema={Scope:'Solver Data Part Descriptions',Descriptors:tmpDescriptionManyfest.schemaManipulations.mergeAddressMappings(tmpOperation.Inputs,tmpOperation.Outputs)};}else{// Clone the passed-in manyfest, so mutations do not alter the upstream version
tmpDescriptionManyfest=pDescriptionManyfest.clone();}// Now that the operation object has been created uniquely, apply any passed-in address-hash and hash-hash remappings
if(pInputAddressMapping){tmpDescriptionManyfest.schemaManipulations.resolveAddressMappings(tmpOperation.Inputs,pInputAddressMapping);}if(pOutputAddressMapping){tmpDescriptionManyfest.schemaManipulations.resolveAddressMappings(tmpOperation.Inputs,pOutputAddressMapping);}if(tmpSolutionContext.InputHashMapping){tmpDescriptionManyfest.hashTranslations.addTranslation(tmpSolutionContext.InputHashMapping);}if(tmpSolutionContext.OutputHashMapping){tmpDescriptionManyfest.hashTranslations.addTranslation(tmpSolutionContext.OutputHashMapping);}// Set some kind of unique identifier for the operation
tmpOperation.UUID=this.UUID++;tmpOperation.SolutionContext=tmpSolutionContext;if(tmpOperation.Description.Synopsys){tmpSolutionContext.SolutionLog.push(`[${tmpOperation.UUID}]: Solver running operation ${tmpOperation.Description.Synopsys}`);}let tmpPrecedent=new libPrecedent();tmpPrecedent.addPattern('{{Name:','}}',pHash=>{let tmpHash=pHash.trim();let tmpDescriptor=tmpDescriptionManyfest.getDescriptorByHash(tmpHash);// Return a human readable value
if(typeof tmpDescriptor=='object'&&tmpDescriptor.hasOwnProperty('Name')){return tmpDescriptor.Name;}else{return tmpHash;}});tmpPrecedent.addPattern('{{InputValue:','}}',pHash=>{let tmpHash=pHash.trim();return tmpDescriptionManyfest.getValueByHash(tmpInputObject,tmpHash);});tmpPrecedent.addPattern('{{OutputValue:','}}',pHash=>{let tmpHash=pHash.trim();return tmpDescriptionManyfest.getValueByHash(tmpOutputObject,tmpHash);});if(tmpOperation.hasOwnProperty('Log')&&tmpOperation.Log.hasOwnProperty('PreOperation')){if(typeof tmpOperation.Log.PreOperation=='string'){tmpOperation.SolutionContext.SolutionLog.push(tmpPrecedent.parseString(tmpOperation.Log.PreOperation));}else if(Array.isArray(tmpOperation.Log.PreOperation)){for(let i=0;i<tmpOperation.Log.PreOperation.length;i++){if(typeof tmpOperation.Log.PreOperation[i]=='string'){tmpOperation.SolutionContext.SolutionLog.push(tmpPrecedent.parseString(tmpOperation.Log.PreOperation[i]));}}}}// Now step through each operation and solve
for(let i=0;i<tmpOperation.Steps.length;i++){let tmpStep=tmpOperation.Steps[i];// Instructions are always endpoints -- they *do not* recurse.
if(tmpStep.hasOwnProperty('Instruction')){let tmpInputSchema={"Scope":"InputObject","Descriptors":JSON.parse(JSON.stringify(tmpOperation.Inputs))};// Perform step-specific address mappings.
tmpDescriptionManyfest.schemaManipulations.resolveAddressMappings(tmpInputSchema.Descriptors,tmpStep.InputHashAddressMap);let tmpInputManyfest=new libManyfest(tmpInputSchema);if(tmpSolutionContext.InputHashMapping){tmpInputManyfest.hashTranslations.addTranslation(tmpSolutionContext.InputHashMapping);}let tmpOutputSchema={"Scope":"OutputObject","Descriptors":JSON.parse(JSON.stringify(tmpOperation.Outputs))};tmpDescriptionManyfest.schemaManipulations.resolveAddressMappings(tmpOutputSchema.Descriptors,tmpStep.OutputHashAddressMap);let tmpOutputManyfest=new libManyfest(tmpOutputSchema);if(tmpSolutionContext.OutputHashMapping){tmpOutputManyfest.hashTranslations.addTranslation(tmpSolutionContext.OutputHashMapping);}// Construct the instruction state object
let tmpInstructionState={Elucidator:this,Namespace:tmpStep.Namespace.toLowerCase(),Instruction:tmpStep.Instruction.toLowerCase(),Operation:tmpOperation,SolutionContext:tmpSolutionContext,DescriptionManyfest:tmpDescriptionManyfest,InputObject:tmpInputObject,InputManyfest:tmpInputManyfest,OutputObject:tmpOutputObject,OutputManyfest:tmpOutputManyfest};tmpInstructionState.logError=pMessage=>{tmpSolutionContext.SolutionLog.push(`[ERROR][Operation ${tmpInstructionState.Operation.Description.Namespace}:${tmpInstructionState.Operation.Description.Hash} - Step #${i}:${tmpStep.Namespace}:${tmpStep.Instruction}] ${pMessage}`);};tmpInstructionState.logInfo=pMessage=>{tmpSolutionContext.SolutionLog.push(`[INFO][Operation ${tmpInstructionState.Operation.Description.Namespace}:${tmpInstructionState.Operation.Description.Hash} - Step #${i}:${tmpStep.Namespace}:${tmpStep.Instruction}] ${pMessage}`);};if(this.instructionSets[tmpInstructionState.Namespace].hasOwnProperty(tmpInstructionState.Instruction)){let fInstruction=this.instructionSets[tmpInstructionState.Namespace][tmpInstructionState.Instruction];fInstruction(tmpInstructionState);}}// Operations recurse.
if(tmpStep.hasOwnProperty('Operation')){if(typeof tmpStep.Operation=='string'){this.solveInternalOperation(tmpStep.Namespace,tmpStep.Operation,tmpInputObject,tmpOutputObject,tmpDescriptionManyfest,tmpStep.InputHashAddressMap,tmpStep.OutputHashAddressMap,tmpSolutionContext);}else if(typeof tmpStep.Operation=='object'){// You can even define an inline object operation!  This gets crazy fast
this.solveOperation(tmpStep.Operation,tmpInputObject,tmpOutputObject,tmpDescriptionManyfest,tmpStep.InputHashAddressMap,tmpStep.OutputHashAddressMap,tmpSolutionContext);}}}if(tmpOperation.hasOwnProperty('Log')&&tmpOperation.Log.hasOwnProperty('PostOperation')){if(typeof tmpOperation.Log.PostOperation=='string'){tmpOperation.SolutionContext.SolutionLog.push(tmpPrecedent.parseString(tmpOperation.Log.PostOperation));}else if(Array.isArray(tmpOperation.Log.PreOperation)){for(let i=0;i<tmpOperation.Log.PostOperation.length;i++){if(typeof tmpOperation.Log.PostOperation[i]=='string'){tmpOperation.SolutionContext.SolutionLog.push(tmpPrecedent.parseString(tmpOperation.Log.PostOperation[i]));}}}}return tmpSolutionContext;}};module.exports=Elucidator;},{"./Elucidator-InstructionSet.js":2,"./Elucidator-LogToConsole.js":3,"./InstructionSets/Geometry.js":5,"./InstructionSets/Logic.js":6,"./InstructionSets/Math-Javascript.js":7,"./InstructionSets/PreciseMath-Decimal.js":31,"./InstructionSets/Set.js":32,"./InstructionSets/String.js":33,"manyfest":43,"precedent":44}],5:[function(require,module,exports){// Solution providers are meant to be stateless, and not classes.
// These solution providers are akin to drivers, connecting code libraries or 
// other types of behavior to mapping operations.
let libElucidatorInstructionSet=require('../Elucidator-InstructionSet.js');class Geometry extends libElucidatorInstructionSet{constructor(pElucidator){super(pElucidator);this.namespace='Geometry';}// Geometry provides no instructions
initializeInstructions(){return true;}initializeOperations(){this.addOperation('rectanglearea',require(`./Operations/Geometry-RectangleArea.json`));return true;}}module.exports=Geometry;},{"../Elucidator-InstructionSet.js":2,"./Operations/Geometry-RectangleArea.json":8}],6:[function(require,module,exports){// Solution providers are meant to be stateless, and not classes.
// These solution providers are akin to drivers, connecting code libraries or 
// other types of behavior to mapping operations.
let libElucidatorInstructionSet=require('../Elucidator-InstructionSet.js');const ifInstruction=pOperation=>{let tmpLeftValue=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'leftValue');let tmpRightValue=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'rightValue');let tmpComparator=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'comparator').toString().toLowerCase();let tmpComparisonOperator='equal';// This may eventually come from configuration; for now just leave it here.
let tmpComparisonOperatorMapping={'==':'equal','eq':'equal','equal':'equal','!=':'notequal','noteq':'notequal','notequal':'notequal','===':'identity','id':'identity','identity':'identity','>':'greaterthan','gt':'greaterthan','greaterthan':'greaterthan','>=':'greaterthanorequal','gte':'greaterthanorequal','greaterthanorequal':'greaterthanorequal','<':'lessthan','lt':'lessthan','lessthan':'lessthan','<=':'lessthanorequal','lte':'lessthanorequal','lessthanorequal':'lessthanorequal'};if(tmpComparisonOperatorMapping.hasOwnProperty(tmpComparator)){tmpComparisonOperator=tmpComparisonOperatorMapping[tmpComparator];}let tmpTrueNamespace=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'trueNamespace');let tmpTrueOperation=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'trueOperation');let tmpFalseNamespace=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'falseNamespace');let tmpFalseOperation=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'falseOperation');let tmpTruthiness=null;switch(tmpComparisonOperator){case'equal':tmpTruthiness=tmpLeftValue==tmpRightValue;break;case'identity':tmpTruthiness=tmpLeftValue===tmpRightValue;break;case'notequal':tmpTruthiness=tmpLeftValue!=tmpRightValue;break;case'greaterthan':tmpTruthiness=tmpLeftValue>tmpRightValue;break;case'greaterthanorequal':tmpTruthiness=tmpLeftValue>=tmpRightValue;break;case'lessthan':tmpTruthiness=tmpLeftValue<tmpRightValue;break;case'lessthanorequal':tmpTruthiness=tmpLeftValue<=tmpRightValue;break;}pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'truthinessResult',tmpTruthiness);// Now execute the operations (unless it is a noop or a bunk operation)
// This is, frankly, kindof a mind-blowing amount of recursion possibility.
// Both of these are falling back on the base solution hash mapping.
// --> Not certain if this is the correct approach and the only way to tell will be through exercise of this
if(tmpTruthiness&&typeof tmpTrueNamespace=='string'&&typeof tmpTrueOperation=='string'&&tmpTrueOperation!='noop'){pOperation.Elucidator.solveInternalOperation(tmpTrueNamespace,tmpTrueOperation,pOperation.InputObject,pOperation.OutputObject,pOperation.DescriptionManyfest,pOperation.SolutionContext.InputHashMapping,pOperation.SolutionContext.OutputHashMapping,pOperation.SolutionContext);}else if(typeof tmpFalseNamespace=='string'&&typeof tmpFalseOperation=='string'&&tmpFalseOperation!='noop'){pOperation.Elucidator.solveInternalOperation(tmpFalseNamespace,tmpFalseOperation,pOperation.InputObject,pOperation.OutputObject,pOperation.DescriptionManyfest,pOperation.SolutionContext.InputHashMapping,pOperation.SolutionContext.OutputHashMapping,pOperation.SolutionContext);}return true;};const executeOperation=pOperation=>{let tmpNamespace=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'namespace');let tmpOperation=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'operation');pOperation.Elucidator.solveInternalOperation(tmpNamespace,tmpOperation,pOperation.InputObject,pOperation.OutputObject,pOperation.DescriptionManyfest,pOperation.SolutionContext.InputHashMapping,pOperation.SolutionContext.OutputHashMapping,pOperation.SolutionContext);return true;};class Logic extends libElucidatorInstructionSet{constructor(pElucidator){super(pElucidator);this.namespace='Logic';}initializeInstructions(){// Logic actually wants a noop instruction!
super.initializeInstructions();this.addInstruction('if',ifInstruction);this.addInstruction('execute',executeOperation);return true;}initializeOperations(){this.addOperation('if',require(`./Operations/Logic-If.json`));this.addOperation('execute',require(`./Operations/Logic-Execute.json`));return true;}}module.exports=Logic;},{"../Elucidator-InstructionSet.js":2,"./Operations/Logic-Execute.json":9,"./Operations/Logic-If.json":10}],7:[function(require,module,exports){// Solution providers are meant to be stateless, and not classes.
// These solution providers are akin to drivers, connecting code libraries or 
// other types of behavior to mapping operations.
let libElucidatorInstructionSet=require('../Elucidator-InstructionSet.js');let add=pOperation=>{// This could be done in one line, but, would be more difficult to comprehend.
let tmpA=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a');let tmpB=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'b');pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpA+tmpB);return true;};let subtract=pOperation=>{// This could be done in one line, but, would be more difficult to comprehend.
let tmpA=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a');let tmpB=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'b');pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpA-tmpB);return true;};let multiply=pOperation=>{// This could be done in one line, but, would be more difficult to comprehend.
let tmpA=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a');let tmpB=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'b');pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpA*tmpB);return true;};let divide=pOperation=>{// This could be done in one line, but, would be more difficult to comprehend.
let tmpA=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a');let tmpB=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'b');pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpA/tmpB);return true;};let aggregate=pOperation=>{let tmpA=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a');let tmpObjectType=typeof tmpA;let tmpAggregationValue=0;if(tmpObjectType=='object'){if(Array.isArray(tmpA)){for(let i=0;i<tmpA.length;i++){// If this is an array, enumerate it and try to aggregate each number
let tmpValue=parseInt(tmpA[i]);if(isNaN(tmpValue)){pOperation.logError(`Array element index [${i}] could not be parsed as a number; skipping.  (${tmpA[i]})`);}else{tmpAggregationValue+=tmpValue;pOperation.logInfo(`Adding element [${i}] value ${tmpValue} totaling: ${tmpAggregationValue}`);}}}else{let tmpObjectKeys=Object.keys(tmpA);for(let i=0;i<tmpObjectKeys.length;i++){let tmpValue=parseInt(tmpA[tmpObjectKeys[i]]);if(isNaN(tmpValue)){pOperation.logError(`Object property [${tmpObjectKeys[i]}] could not be parsed as a number; skipping.  (${tmpA[tmpObjectKeys[i]]})`);}else{tmpAggregationValue+=tmpValue;pOperation.logInfo(`Adding object property [${tmpObjectKeys[i]}] value ${tmpValue} totaling: ${tmpAggregationValue}`);}}}}else{let tmpValue=parseInt(tmpA);if(isNaN(tmpValue)){pOperation.logError(`Direct value could not be parsed as a number; skipping.  (${tmpA})`);}else{tmpAggregationValue+=tmpValue;}}pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpAggregationValue);return true;};class MathJavascript extends libElucidatorInstructionSet{constructor(pElucidator){super(pElucidator);this.namespace='Math';}initializeInstructions(){this.addInstruction('add',add);this.addInstruction('subtract',subtract);this.addInstruction('sub',subtract);this.addInstruction('multiply',multiply);this.addInstruction('mul',multiply);this.addInstruction('divide',divide);this.addInstruction('div',divide);this.addInstruction('aggregate',aggregate);return true;}initializeOperations(){this.addOperation('add',require(`./Operations/Math-Add.json`));this.addOperation('subtract',require(`./Operations/Math-Subtract.json`));this.addOperation('multiply',require(`./Operations/Math-Multiply.json`));this.addOperation('divide',require(`./Operations/Math-Divide.json`));this.addOperation('aggregate',require(`./Operations/Math-Aggregate.json`));return true;}}module.exports=MathJavascript;},{"../Elucidator-InstructionSet.js":2,"./Operations/Math-Add.json":11,"./Operations/Math-Aggregate.json":12,"./Operations/Math-Divide.json":13,"./Operations/Math-Multiply.json":14,"./Operations/Math-Subtract.json":15}],8:[function(require,module,exports){module.exports={"Description":{"Namespace":"Geometry","Operation":"RectangleArea","Synopsis":"Solve for the area of a rectangle:  Area = Width * Height"},"Inputs":{"Width":{"Hash":"Width","Type":"Number"},"Height":{"Hash":"Height","Type":"Number"}},"Outputs":{"Area":{"Hash":"Area","Name":"Area of the Rectangle"},"Ratio":{"Hash":"Ratio","Name":"The Ratio between the Width and the Height"}},"Log":{"PreOperation":"Solve for [ {{Name:Area}} ] based on [ {{Name:Width}} ] and [ {{Name:Height}} ].","PostOperation":"Operation complete; [ {{Name:Area}} ] = {{InputValue:Width}} * {{InputValue:Height}} = {{OutputValue:Area}}"},"Steps":[{"Namespace":"PreciseMath","Instruction":"multiply","InputHashAddressMap":{"a":"Width","b":"Height"},"OutputHashAddressMap":{"x":"Area"}},{"Namespace":"PreciseMath","Instruction":"divide","InputHashAddressMap":{"a":"Width","b":"Height"},"OutputHashAddressMap":{"x":"Ratio"}}]};},{}],9:[function(require,module,exports){module.exports={"Description":{"Namespace":"Logic","Operation":"Execute","Synopsis":"Execute an operation based on namespace and operation."},"Inputs":{"namespace":{"Hash":"namespace","Type":"string","Default":"logic"},"operation":{"Hash":"operation","Type":"string","Default":"noop"}},"Outputs":{},"Log":{"PreOperation":"Execute the {{InputValue:operation}} operation in namespace {{InputValue:namespace}}.","PostOperation":"Operation [{{InputValue:namespace}}:{{InputValue:operation}}] execution complete."},"Steps":[{"Namespace":"Logic","Instruction":"execute"}]};},{}],10:[function(require,module,exports){module.exports={"Description":{"Namespace":"Logic","Operation":"If","Synopsis":"Comparison-based if of leftValue and RightValue based on comparator.  Executes trueNamespace:trueOperation or falseNamespace:falseOperation based on truthiness of result.  Also outputs a true or false to truthinessResult."},"Inputs":{"leftValue":{"Hash":"leftValue","Type":"Any"},"rightValue":{"Hash":"rightValue","Type":"Any","Default":true},"comparator":{"Hash":"comparator","Type":"String","Default":"=="},"trueNamespace":{"Hash":"trueNamespace","Type":"String","Default":"logic"},"trueOperation":{"Hash":"trueOperation","Type":"String","Default":"noop"},"falseNamespace":{"Hash":"falseNamespace","Type":"String","Default":"logic"},"falseOperation":{"Hash":"falseOperation","Type":"String","Default":"noop"}},"Outputs":{"truthinessResult":{"Hash":"truthinessResult","Type":"Boolean"}},"Log":{"PreOperation":"Compare {{Name:leftValue}} and {{Name:rightValue}} with the {{InputValue:comparator}} operator, storing the truthiness in {{Name:truthinessResult}}.","PostOperation":"Operation complete: {{InputValue:leftValue}} {{InputValue:comparator}} {{InputValue:rightValue}} evaluated to {{OutputValue:truthinessResult}}"},"Steps":[{"Namespace":"Logic","Instruction":"If"}]};},{}],11:[function(require,module,exports){module.exports={"Description":{"Namespace":"Math","Operation":"Add","Synopsis":"Add two numbers:  x = a + b"},"Inputs":{"a":{"Hash":"a","Type":"Number"},"b":{"Hash":"b","Type":"Number"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Add {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = {{InputValue:a}} + {{InputValue:b}} = {{OutputValue:x}}"},"Steps":[{"Namespace":"Math","Instruction":"add"}]};},{}],12:[function(require,module,exports){module.exports={"Description":{"Namespace":"Math","Operation":"Aggregate","Synopsis":"Aggregate a set of numbers (from array or object address):  x = a + b + ... + z"},"Inputs":{"a":{"Hash":"a","Type":"Set"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Aggregate all numeric values in {{Name:a}}, storing the resultant in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = {{OutputValue:x}}"},"Steps":[{"Namespace":"Math","Instruction":"aggregate"}]};},{}],13:[function(require,module,exports){module.exports={"Description":{"Namespace":"Math","Operation":"Divide","Synopsis":"Divide two numbers:  x = a / b"},"Inputs":{"a":{"Hash":"a","Type":"Number"},"b":{"Hash":"b","Type":"Number"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Divide {{Name:a}} over {{Name:b}}, storing the value in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = {{InputValue:a}} / {{InputValue:b}} = {{OutputValue:x}}"},"Steps":[{"Namespace":"Math","Instruction":"divide"}]};},{}],14:[function(require,module,exports){module.exports={"Description":{"Namespace":"Math","Operation":"Multiply","Synopsis":"Multiply two numbers:  x = a * b"},"Inputs":{"a":{"Hash":"a","Type":"Number"},"b":{"Hash":"b","Type":"Number"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Multiply {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = {{InputValue:a}} * {{InputValue:b}} = {{OutputValue:x}}"},"Steps":[{"Namespace":"Math","Instruction":"multiply"}]};},{}],15:[function(require,module,exports){module.exports={"Description":{"Namespace":"Math","Operation":"Subtract","Synopsis":"Subtract two numbers:  x = a - b"},"Inputs":{"a":{"Hash":"a","Type":"Number"},"b":{"Hash":"b","Type":"Number"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Subtract {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = {{InputValue:a}} - {{InputValue:b}} = {{OutputValue:x}}"},"Steps":[{"Namespace":"Math","Instruction":"subtract"}]};},{}],16:[function(require,module,exports){module.exports={"Description":{"Namespace":"PreciseMath","Operation":"Add","Synopsis":"Precisely add two numbers:  x = a + b"},"Inputs":{"a":{"Hash":"a","Type":"Number"},"b":{"Hash":"b","Type":"Number"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Add {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = {{InputValue:a}} + {{InputValue:b}} = {{OutputValue:x}}"},"Steps":[{"Namespace":"PreciseMath","Instruction":"add"}]};},{}],17:[function(require,module,exports){module.exports={"Description":{"Namespace":"PreciseMath","Operation":"Aggregate","Synopsis":"Precisely aggregate a set of numbers (from array or object address):  x = a + b + ... + z"},"Inputs":{"a":{"Hash":"a","Type":"Set"},"ValueNames":{"Hash":"ValueNames","Type":"Set"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Aggregate all numeric values in {{Name:a}}, storing the resultant in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = {{OutputValue:x}}"},"Steps":[{"Namespace":"PreciseMath","Instruction":"aggregate"}]};},{}],18:[function(require,module,exports){module.exports={"Description":{"Namespace":"PreciseMath","Operation":"Divide","Synopsis":"Precisely divide two numbers:  x = a / b"},"Inputs":{"a":{"Hash":"a","Type":"Number"},"b":{"Hash":"b","Type":"Number"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Divide {{Name:a}} over {{Name:b}}, storing the value in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = {{InputValue:a}} / {{InputValue:b}} = {{OutputValue:x}}"},"Steps":[{"Namespace":"PreciseMath","Instruction":"divide"}]};},{}],19:[function(require,module,exports){module.exports={"Description":{"Namespace":"PreciseMath","Operation":"GroupValuesAndAggregate","Synopsis":"Group values in a set and aggregate the set of numbers (from array or object addresses)"},"Inputs":{"inputDataSet":{"Hash":"inputDataSet","Type":"Set"},"groupByProperty":{"Hash":"groupByProperty","Type":"Any"},"groupValueProperty":{"Hash":"groupValueProperty","Type":"Any"},"recordIndicatorProperty":{"Hash":"recordIndicatorProperty","Type":"String","Default":false}},"Outputs":{"outputDataSet":{"Hash":"outputDataSet","Type":"Set"}},"Log":{"PreOperation":"Group {{Name:inputDataSet}} by {{Name:groupByProperty}} and create a map, storing the resultant in {{Name:outputDataSet}}.","PostOperation":"Operation complete: Grouping {{Name:inputDataSet}} by {{Name:groupByProperty}} into aggregated values in {{Name:outputDataSet}}"},"Steps":[{"Namespace":"PreciseMath","Instruction":"groupvaluesandaggregate"}]};},{}],20:[function(require,module,exports){module.exports={"Description":{"Namespace":"PreciseMath","Operation":"Multiply","Synopsis":"Precisely multiply two numbers:  x = a * b"},"Inputs":{"a":{"Hash":"a","Type":"Number"},"b":{"Hash":"b","Type":"Number"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Multiply {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = {{InputValue:a}} * {{InputValue:b}} = {{OutputValue:x}}"},"Steps":[{"Namespace":"PreciseMath","Instruction":"multiply"}]};},{}],21:[function(require,module,exports){module.exports={"Description":{"Namespace":"PreciseMath","Operation":"Round","Synopsis":"Precisely round a number."},"Inputs":{"a":{"Hash":"a","Type":"Number"},"precision":{"Hash":"precision","Type":"Number"},"roundingmode":{"Hash":"roundingmode","Type":"String"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Round {{Name:a}}, storing the value in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = Round({{InputValue:a}}) = {{OutputValue:x}}"},"Steps":[{"Namespace":"PreciseMath","Instruction":"round"}]};},{}],22:[function(require,module,exports){module.exports={"Description":{"Namespace":"PreciseMath","Operation":"SetPrecision","Synopsis":"Set the precision."},"Inputs":{"precision":{"Hash":"precision","Type":"Number","Default":2}},"Outputs":{},"Log":{"PreOperation":"Set precision to {{InputValue:precision}}.","PostOperation":"Operation complete: Default precision set to {{InputValue:precision}}."},"Steps":[{"Namespace":"PreciseMath","Instruction":"setprecision"}]};},{}],23:[function(require,module,exports){module.exports={"Description":{"Namespace":"PreciseMath","Operation":"SetRoundingMode","Synopsis":"Set the rounding mode."},"Inputs":{"roundingmode":{"Hash":"roundingmode","Type":"String","Default":"ROUND_HALF_UP"}},"Outputs":{},"Log":{"PreOperation":"Set rounding mode to {{InputValue:roundingmode}}.","PostOperation":"Operation complete: Default rounding mode set to {{InputValue:roundingmode}}."},"Steps":[{"Namespace":"PreciseMath","Instruction":"setroundingmode"}]};},{}],24:[function(require,module,exports){module.exports={"Description":{"Namespace":"PreciseMath","Operation":"Subtract","Synopsis":"Precisely subtract two numbers:  x = a - b"},"Inputs":{"a":{"Hash":"a","Type":"Number"},"b":{"Hash":"b","Type":"Number"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Subtract {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = {{InputValue:a}} - {{InputValue:b}} = {{OutputValue:x}}"},"Steps":[{"Namespace":"PreciseMath","Instruction":"subtract"}]};},{}],25:[function(require,module,exports){module.exports={"Description":{"Namespace":"PreciseMath","Operation":"ToDecimalPlaces","Synopsis":"Precisely round a number to a certain number of decimal places."},"Inputs":{"a":{"Hash":"a","Type":"Number"},"decimalplaces":{"Hash":"decimalplaces","Type":"Number","Default":2},"roundingmode":{"Hash":"roundingmode","Type":"String"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Round {{Name:a}} to {{Value:decimalplaces}} decimal places, storing the value in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = Round({{InputValue:a}} TO {{Value:decimalplaces}} decimal places) = {{OutputValue:x}}"},"Steps":[{"Namespace":"PreciseMath","Instruction":"todecimalplaces"}]};},{}],26:[function(require,module,exports){module.exports={"Description":{"Namespace":"PreciseMath","Operation":"ToSignificantDigits","Synopsis":"Precisely round a number to a specific number of significant digits."},"Inputs":{"a":{"Hash":"a","Type":"Number"},"digits":{"Hash":"digits","Type":"Number","Default":12},"roundingmode":{"Hash":"roundingmode","Type":"String"}},"Outputs":{"x":{"Hash":"x","Type":"Number"}},"Log":{"PreOperation":"Round {{Name:a}} to {{InputValue:digits}}, storing the value in {{Name:x}}.","PostOperation":"Operation complete: {{Name:x}} = Round({{InputValue:a}} TO {{InputValue:digits}}) = {{OutputValue:x}}"},"Steps":[{"Namespace":"PreciseMath","Instruction":"tosignificantdigits"}]};},{}],27:[function(require,module,exports){module.exports={"Description":{"Namespace":"Set","Operation":"GroupValuesBy","Synopsis":"Group set of Sub object values by another property in the objects."},"Inputs":{"inputDataSet":{"Hash":"inputDataSet","Type":"Set"},"groupByProperty":{"Hash":"groupByProperty","Type":"Any"},"groupValueProperty":{"Hash":"groupValueProperty","Type":"Any"}},"Outputs":{"outputDataSet":{"Hash":"outputDataSet","Type":"Set"}},"Log":{"PreOperation":"Group {{Name:inputDataSet}} by {{Name:groupByProperty}} and create a mapped result set into {{Name:outputDataSet}}.","PostOperation":"Operation complete: Grouping {{Name:inputDataSet}} by {{Name:groupByProperty}} into {{Name:outputDataSet}}"},"Steps":[{"Namespace":"Set","Instruction":"GroupValuesBy"}]};},{}],28:[function(require,module,exports){module.exports={"Description":{"Namespace":"String","Operation":"Replace","Synopsis":"Replace all instances of searchFor with replaceWith in inputString"},"Inputs":{"inputString":{"Hash":"inputString","Type":"String"},"searchFor":{"Hash":"searchFor","Type":"String"},"replaceWith":{"Hash":"replaceWith","Type":"String"}},"Outputs":{"outputString":{"Hash":"outputString","Type":"String"}},"Log":{"PreOperation":"Search for [{{InputValue:searchFor}}] and replace it with [{{InputValue:replaceWith}}] in [{{InputValue:inputString}}].","PostOperation":"Operation complete: {{Name:outputString}} = [{{OutputValue:outputString}}] from [{{InputValue:inputString}}] replacing [{{InputValue:searchFor}}] with [{{InputValue:replaceWith}}]."},"Steps":[{"Namespace":"String","Instruction":"replace"}]};},{}],29:[function(require,module,exports){module.exports={"Description":{"Namespace":"String","Operation":"Substring","Synopsis":"Get all characters between indexStart and indexEnd (optional) for a given inputString."},"Inputs":{"inputString":{"Hash":"inputString","Type":"String"},"indexStart":{"Hash":"indexStart","Type":"Number","Default":0},"indexEnd":{"Hash":"indexEnd","Type":"String","Default":null}},"Outputs":{"outputString":{"Hash":"outputString","Type":"String"}},"Log":{"PreOperation":"Get all characters between {{InputValue:indexStart}} and {{InputValue:indexEnd}} in [{{InputValue:inputString}}].","PostOperation":"Operation complete: {{Name:outputString}} = [{{OutputValue:outputString}}] from [{{InputValue:inputString}}] between {{InputValue:indexStart}} and {{InputValue:indexEnd}}."},"Steps":[{"Namespace":"String","Instruction":"substring"}]};},{}],30:[function(require,module,exports){module.exports={"Description":{"Namespace":"String","Operation":"Trim","Synopsis":"Trim whitespace off the end of string in inputString, putting the result in outputString"},"Inputs":{"inputString":{"Hash":"inputString","Type":"String"}},"Outputs":{"outputString":{"Hash":"outputString","Type":"String"}},"Log":{"PreOperation":"Trim the whitespace from value [{{InputValue:inputString}}].","PostOperation":"Operation complete: {{Name:outputString}} = [{{OutputValue:outputString}}] from [{{InputValue:inputString}}]"},"Steps":[{"Namespace":"String","Instruction":"trim"}]};},{}],31:[function(require,module,exports){let libElucidatorInstructionSet=require('../Elucidator-InstructionSet.js');const libDecimal=require('decimal.js');let add=pOperation=>{// This could be done in one line, but, would be more difficult to comprehend.
let tmpA=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a'));let tmpB=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'b'));pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpA.plus(tmpB).toString());return true;};let subtract=pOperation=>{// This could be done in one line, but, would be more difficult to comprehend.
let tmpA=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a'));let tmpB=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'b'));pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpA.sub(tmpB).toString());return true;};let multiply=pOperation=>{// This could be done in one line, but, would be more difficult to comprehend.
let tmpA=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a'));let tmpB=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'b'));pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpA.mul(tmpB).toString());return true;};let divide=pOperation=>{// This could be done in one line, but, would be more difficult to comprehend.
let tmpA=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a'));let tmpB=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'b'));pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpA.div(tmpB).toString());return true;};let round=pOperation=>{let tmpA=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a'));let tmpPrecision=parseInt(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'precision'));let tmpRoundingMode=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'roundingmode');// Eventually don't set this every time...
if(tmpRoundingMode){switch(tmpRoundingMode.toString().toLowerCase()){case'round_up':libDecimal.set({rounding:libDecimal.ROUND_UP});break;case'round_down':libDecimal.set({rounding:libDecimal.ROUND_DOWN});break;case'round_ceil':libDecimal.set({rounding:libDecimal.ROUND_CEIL});break;case'round_floor':libDecimal.set({rounding:libDecimal.ROUND_FLOOR});break;default:case'round_half_up':libDecimal.set({rounding:libDecimal.ROUND_HALF_UP});break;case'round_half_down':libDecimal.set({rounding:libDecimal.ROUND_HALF_DOWN});break;case'round_half_even':libDecimal.set({rounding:libDecimal.ROUND_HALF_EVEN});break;case'round_half_ceil':libDecimal.set({rounding:libDecimal.ROUND_HALF_CEIL});break;case'round_half_floor':libDecimal.set({rounding:libDecimal.ROUND_HALF_FLOOR});break;case'euclid':libDecimal.set({rounding:libDecimal.EUCLID});break;}}if(!isNaN(tmpPrecision)){libDecimal.set({precision:tmpPrecision});}pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',libDecimal.round(tmpA).toString());};let tosignificantdigits=pOperation=>{let tmpA=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a'));let tmpDigits=parseInt(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'digits'));let tmpRoundingMode=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'roundingmode');// Eventually don't set this every time...
if(tmpRoundingMode){switch(tmpRoundingMode.toString().toLowerCase()){case'round_up':libDecimal.set({rounding:libDecimal.ROUND_UP});break;case'round_down':libDecimal.set({rounding:libDecimal.ROUND_DOWN});break;case'round_ceil':libDecimal.set({rounding:libDecimal.ROUND_CEIL});break;case'round_floor':libDecimal.set({rounding:libDecimal.ROUND_FLOOR});break;default:case'round_half_up':libDecimal.set({rounding:libDecimal.ROUND_HALF_UP});break;case'round_half_down':libDecimal.set({rounding:libDecimal.ROUND_HALF_DOWN});break;case'round_half_even':libDecimal.set({rounding:libDecimal.ROUND_HALF_EVEN});break;case'round_half_ceil':libDecimal.set({rounding:libDecimal.ROUND_HALF_CEIL});break;case'round_half_floor':libDecimal.set({rounding:libDecimal.ROUND_HALF_FLOOR});break;case'euclid':libDecimal.set({rounding:libDecimal.EUCLID});break;}}if(isNaN(tmpDigits)){tmpDigits=12;}pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpA.toSignificantDigits(tmpDigits).toString());};let todecimalplaces=pOperation=>{let tmpA=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a'));let tmpDecimalPlaces=parseInt(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'decimalplaces'));let tmpRoundingMode=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'roundingmode');// Eventually don't set this every time...
if(tmpRoundingMode){switch(tmpRoundingMode.toString().toLowerCase()){case'round_up':libDecimal.set({rounding:libDecimal.ROUND_UP});break;case'round_down':libDecimal.set({rounding:libDecimal.ROUND_DOWN});break;case'round_ceil':libDecimal.set({rounding:libDecimal.ROUND_CEIL});break;case'round_floor':libDecimal.set({rounding:libDecimal.ROUND_FLOOR});break;default:case'round_half_up':libDecimal.set({rounding:libDecimal.ROUND_HALF_UP});break;case'round_half_down':libDecimal.set({rounding:libDecimal.ROUND_HALF_DOWN});break;case'round_half_even':libDecimal.set({rounding:libDecimal.ROUND_HALF_EVEN});break;case'round_half_ceil':libDecimal.set({rounding:libDecimal.ROUND_HALF_CEIL});break;case'round_half_floor':libDecimal.set({rounding:libDecimal.ROUND_HALF_FLOOR});break;case'euclid':libDecimal.set({rounding:libDecimal.EUCLID});break;}}if(isNaN(tmpDecimalPlaces)){tmpDecimalPlaces=2;}pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpA.toDecimalPlaces(tmpDecimalPlaces).toString());};let setprecision=pOperation=>{let tmpPrecision=parseInt(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'precision'));console.log(tmpPrecision);if(!isNaN(tmpPrecision)){libDecimal.set({precision:tmpPrecision});}};let setroundingmode=pOperation=>{let tmpRoundingMode=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'roundingmode');// Eventually don't set this every time...
if(tmpRoundingMode){switch(tmpRoundingMode.toString().toLowerCase()){case'round_up':libDecimal.set({rounding:libDecimal.ROUND_UP});break;case'round_down':libDecimal.set({rounding:libDecimal.ROUND_DOWN});break;case'round_ceil':libDecimal.set({rounding:libDecimal.ROUND_CEIL});break;case'round_floor':libDecimal.set({rounding:libDecimal.ROUND_FLOOR});break;default:case'round_half_up':libDecimal.set({rounding:libDecimal.ROUND_HALF_UP});break;case'round_half_down':libDecimal.set({rounding:libDecimal.ROUND_HALF_DOWN});break;case'round_half_even':libDecimal.set({rounding:libDecimal.ROUND_HALF_EVEN});break;case'round_half_ceil':libDecimal.set({rounding:libDecimal.ROUND_HALF_CEIL});break;case'round_half_floor':libDecimal.set({rounding:libDecimal.ROUND_HALF_FLOOR});break;case'euclid':libDecimal.set({rounding:libDecimal.EUCLID});break;}}};let aggregate=pOperation=>{let tmpA=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a');let tmpObjectType=typeof tmpA;let tmpAggregationValue=new libDecimal(0);if(tmpObjectType=='object'){if(Array.isArray(tmpA)){for(let i=0;i<tmpA.length;i++){// If this is an array, enumerate it and try to aggregate each number
let tmpValue=new libDecimal(tmpA[i]);if(isNaN(tmpValue)){pOperation.logError(`Array element index [${i}] could not be parsed as a number by Decimal.js; skipping.  (${tmpA[i]})`);}else{tmpAggregationValue=tmpAggregationValue.plus(tmpValue);pOperation.logInfo(`Adding element [${i}] value ${tmpValue} totaling: ${tmpAggregationValue}`);}}}else{let tmpObjectKeys=Object.keys(tmpA);for(let i=0;i<tmpObjectKeys.length;i++){let tmpValue=new libDecimal(tmpA[tmpObjectKeys[i]]);if(isNaN(tmpValue)){pOperation.logError(`Object property [${tmpObjectKeys[i]}] could not be parsed as a number; skipping.  (${tmpA[tmpObjectKeys[i]]})`);}else{tmpAggregationValue=tmpAggregationValue.plus(tmpValue);pOperation.logInfo(`Adding object property [${tmpObjectKeys[i]}] value ${tmpValue} totaling: ${tmpAggregationValue}`);}}}}else{let tmpValue=new libDecimal(tmpA);if(isNaN(tmpValue)){pOperation.logError(`Direct value could not be parsed as a number; skipping.  (${tmpA})`);}else{tmpAggregationValue=tmpValue;}}pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpAggregationValue.toString());return true;};const groupValuesAndAggregate=pOperation=>{let tmpInputDataSet=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'inputDataSet');let tmpGroupByProperty=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'groupByProperty');let tmpGroupValueProperty=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'groupValueProperty');let tmpOutputDataSet={};let tmpProcessedOutputDataSet={};let tmpObjectType=typeof tmpInputDataSet;if(tmpObjectType=='object'){if(Array.isArray(tmpInputDataSet)){for(let i=0;i<tmpInputDataSet.length;i++){if(typeof tmpInputDataSet[i]!=='object'){pOperation.logInfo(`Element [${i}] was not an object; skipping group operation.`);}else{let tmpValue=tmpInputDataSet[i];let tmpGroupByValue=tmpValue[tmpGroupByProperty];if(!tmpValue.hasOwnProperty(tmpGroupByProperty)){pOperation.logInfo(`Element [${i}] doesn't have the group by property [${tmpGroupByProperty}]; setting group to [__NO_GROUP].`);tmpGroupByValue='__NO_GROUP';}if(!tmpValue.hasOwnProperty(tmpGroupValueProperty)){pOperation.logInfo(`Element [${i}] doesn't have the group value property [${tmpGroupValueProperty}]; skipping group operation.`);}else{let tmpDecimalValue=new libDecimal(tmpValue[tmpGroupValueProperty]);if(isNaN(tmpDecimalValue)){pOperation.logError(`Object property [${i}] could not be parsed as a number; skipping.  (${tmpValue[tmpGroupValueProperty]})`);}else{if(!tmpOutputDataSet.hasOwnProperty(tmpGroupByValue)){tmpOutputDataSet[tmpGroupByValue]=tmpDecimalValue;}else{tmpOutputDataSet[tmpGroupByValue]=tmpOutputDataSet[tmpGroupByValue].plus(tmpDecimalValue);}pOperation.logInfo(`Adding object property [${i}] value ${tmpDecimalValue} totaling: ${tmpOutputDataSet[tmpGroupByValue]}`);}}}}}else{let tmpObjectKeys=Object.keys(tmpInputDataSet);for(let i=0;i<tmpObjectKeys.length;i++){if(typeof tmpInputDataSet[tmpObjectKeys[i]]!=='object'){pOperation.logInfo(`Element [${i}] was not an object; skipping group operation.`);}else{let tmpValue=tmpInputDataSet[tmpObjectKeys[i]];let tmpGroupByValue=tmpValue[tmpGroupByProperty];if(!tmpValue.hasOwnProperty(tmpGroupByProperty)){pOperation.logInfo(`Element [${tmpObjectKeys[i]}][${i}] doesn't have the group by property [${tmpGroupByProperty}]; setting group to [__NO_GROUP].`);tmpGroupByValue='__NO_GROUP';}if(!tmpValue.hasOwnProperty(tmpGroupValueProperty)){pOperation.logInfo(`Element [${tmpObjectKeys[i]}][${i}] doesn't have the group value property [${tmpGroupValueProperty}]; skipping group operation.`);}else{let tmpDecimalValue=new libDecimal(tmpValue[tmpGroupValueProperty]);if(isNaN(tmpDecimalValue)){pOperation.logError(`Object property [${tmpObjectKeys[i]}][${i}] to group ${tmpGroupByValue} could not be parsed as a number; skipping.  (${tmpValue[tmpGroupValueProperty]})`);}else{if(!tmpOutputDataSet.hasOwnProperty(tmpGroupByValue)){tmpOutputDataSet[tmpGroupByValue]=tmpDecimalValue;}else{tmpOutputDataSet[tmpGroupByValue]=tmpOutputDataSet[tmpGroupByValue].plus(tmpDecimalValue);}pOperation.logInfo(`Adding object property [${tmpObjectKeys[i]}][${i}] to group ${tmpGroupByValue} value ${tmpDecimalValue} totaling: ${tmpOutputDataSet[tmpGroupByValue]}`);}}}}}// Now marshal the aggregated values
let tmpOutputGroups=Object.keys(tmpOutputDataSet);for(let j=0;j<tmpOutputGroups.length;j++){tmpProcessedOutputDataSet[tmpOutputGroups[j]]=tmpOutputDataSet[tmpOutputGroups[j]].toString();}}else{pOperation.logError(`Input set is neither an Array nor an Object`);}pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'outputDataSet',tmpProcessedOutputDataSet);return true;};let toFraction=pOperation=>{// This could be done in one line, but, would be more difficult to comprehend.
let tmpA=new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'a'));pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'x',tmpA.toFraction().toString());return true;};class PreciseMath extends libElucidatorInstructionSet{constructor(pElucidator){super(pElucidator);this.namespace='PreciseMath';}initializeInstructions(){this.addInstruction('add',add);this.addInstruction('subtract',subtract);this.addInstruction('sub',subtract);this.addInstruction('multiply',multiply);this.addInstruction('mul',multiply);this.addInstruction('divide',divide);this.addInstruction('div',divide);this.addInstruction('aggregate',aggregate);this.addInstruction('groupvaluesandaggregate',groupValuesAndAggregate);this.addInstruction('setprecision',setprecision);this.addInstruction('setroundingmode',setroundingmode);this.addInstruction('todecimalplaces',todecimalplaces);this.addInstruction('tosignificantdigits',tosignificantdigits);this.addInstruction('round',round);this.addInstruction('tofraction',toFraction);return true;}initializeOperations(){this.addOperation('add',require(`./Operations/PreciseMath-Add.json`));this.addOperation('subtract',require(`./Operations/PreciseMath-Subtract.json`));this.addOperation('multiply',require(`./Operations/PreciseMath-Multiply.json`));this.addOperation('divide',require(`./Operations/PreciseMath-Divide.json`));this.addOperation('aggregate',require('./Operations/PreciseMath-Aggregate.json'));this.addOperation('groupvaluesandaggregate',require('./Operations/PreciseMath-GroupValuesAndAggregate.json'));this.addOperation('setprecision',require('./Operations/PreciseMath-SetPrecision.json'));this.addOperation('setroundingmode',require('./Operations/PreciseMath-SetRoundingMode.json'));this.addOperation('tosignificantdigits',require('./Operations/PreciseMath-ToSignificantDigits.json'));this.addOperation('todecimalplaces',require('./Operations/PreciseMath-ToDecimalPlaces.json'));this.addOperation('round',require('./Operations/PreciseMath-Round.json'));return true;}}module.exports=PreciseMath;},{"../Elucidator-InstructionSet.js":2,"./Operations/PreciseMath-Add.json":16,"./Operations/PreciseMath-Aggregate.json":17,"./Operations/PreciseMath-Divide.json":18,"./Operations/PreciseMath-GroupValuesAndAggregate.json":19,"./Operations/PreciseMath-Multiply.json":20,"./Operations/PreciseMath-Round.json":21,"./Operations/PreciseMath-SetPrecision.json":22,"./Operations/PreciseMath-SetRoundingMode.json":23,"./Operations/PreciseMath-Subtract.json":24,"./Operations/PreciseMath-ToDecimalPlaces.json":25,"./Operations/PreciseMath-ToSignificantDigits.json":26,"decimal.js":1}],32:[function(require,module,exports){// Solution providers are meant to be stateless, and not classes.
// These solution providers are akin to drivers, connecting code libraries or 
// other types of behavior to mapping operations.
let libElucidatorInstructionSet=require('../Elucidator-InstructionSet.js');const groupValuesBy=pOperation=>{let tmpInputDataSet=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'inputDataSet');let tmpGroupByProperty=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'groupByProperty');let tmpGroupValueProperty=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'groupValueProperty');let tmpOutputDataSet={};let tmpObjectType=typeof tmpInputDataSet;if(tmpObjectType=='object'){if(Array.isArray(tmpInputDataSet)){for(let i=0;i<tmpInputDataSet.length;i++){if(typeof tmpInputDataSet[i]!=='object'){pOperation.logInfo(`Element [${i}] was not an object; skipping group operation.`);}else{let tmpValue=tmpInputDataSet[i];let tmpGroupByValue=tmpValue[tmpGroupByProperty];if(!tmpValue.hasOwnProperty(tmpGroupByProperty)){pOperation.logInfo(`Element [${i}] doesn't have the group by property [${tmpGroupByProperty}]; setting group to [__NO_GROUP].`);tmpGroupByValue='__NO_GROUP';}if(!tmpValue.hasOwnProperty(tmpGroupValueProperty)){pOperation.logInfo(`Element [${i}] doesn't have the group value property [${tmpGroupValueProperty}]; skipping group operation.`);}else{if(!tmpOutputDataSet.hasOwnProperty(tmpGroupByValue)){// Create a new grouped value
pOperation.logInfo(`Creating a new group [${tmpGroupByValue}] for element [${i}].`);tmpOutputDataSet[tmpGroupByValue]=[];}tmpOutputDataSet[tmpGroupByValue].push(tmpValue[tmpGroupValueProperty]);}}}}else{let tmpObjectKeys=Object.keys(tmpInputDataSet);for(let i=0;i<tmpObjectKeys.length;i++){if(typeof tmpInputDataSet[tmpObjectKeys[i]]!=='object'){pOperation.logInfo(`Element [${i}] was not an object; skipping group operation.`);}else{let tmpValue=tmpInputDataSet[tmpObjectKeys[i]];let tmpGroupByValue=tmpValue[tmpGroupByProperty];if(!tmpValue.hasOwnProperty(tmpGroupByProperty)){pOperation.logInfo(`Element [${tmpObjectKeys[i]}][${i}] doesn't have the group by property [${tmpGroupByProperty}]; setting group to [__NO_GROUP].`);tmpGroupByValue='__NO_GROUP';}if(!tmpValue.hasOwnProperty(tmpGroupValueProperty)){pOperation.logInfo(`Element [${tmpObjectKeys[i]}][${i}] doesn't have the group value property [${tmpGroupValueProperty}]; skipping group operation.`);}else{if(!tmpOutputDataSet.hasOwnProperty(tmpGroupByValue)){// Create a new grouped value
pOperation.logInfo(`Creating a new group [${tmpGroupByValue}] for element [${tmpObjectKeys[i]}][${i}].`);tmpOutputDataSet[tmpGroupByValue]=[];}tmpOutputDataSet[tmpGroupByValue].push(tmpValue[tmpGroupValueProperty]);}}}}}else{pOperation.logError(`Input set is neither an Array nor an Object`);}pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'outputDataSet',tmpOutputDataSet);return true;};class Set extends libElucidatorInstructionSet{constructor(pElucidator){super(pElucidator);this.namespace='Set';}initializeInstructions(){// Logic actually wants a noop instruction!
super.initializeInstructions();this.addInstruction('groupvaluesby',groupValuesBy);return true;}initializeOperations(){this.addOperation('groupvaluesby',require(`./Operations/Set-GroupValuesBy.json`));return true;}}module.exports=Set;},{"../Elucidator-InstructionSet.js":2,"./Operations/Set-GroupValuesBy.json":27}],33:[function(require,module,exports){// Solution providers are meant to be stateless, and not classes.
// These solution providers are akin to drivers, connecting code libraries or 
// other types of behavior to mapping operations.
let libElucidatorInstructionSet=require('../Elucidator-InstructionSet.js');let trim=pOperation=>{let tmpInputString=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'inputString');pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'outputString',tmpInputString.trim());return true;};let replace=pOperation=>{let tmpInputString=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'inputString');let tmpSearchFor=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'searchFor');let tmpReplaceWith=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'replaceWith');pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'outputString',tmpInputString.replace(tmpSearchFor,tmpReplaceWith));return true;};let substring=pOperation=>{let tmpInputString=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'inputString');let indexStart=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'indexStart');let indexEnd=pOperation.InputManyfest.getValueByHash(pOperation.InputObject,'indexEnd');if(indexEnd!=null){pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'outputString',tmpInputString.substring(indexStart,indexEnd));}else{pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject,'outputString',tmpInputString.substring(indexStart));}return true;};class StringOperations extends libElucidatorInstructionSet{constructor(pElucidator){super(pElucidator);this.namespace='String';}initializeInstructions(){this.addInstruction('trim',trim);this.addInstruction('replace',replace);this.addInstruction('substring',substring);return true;}initializeOperations(){this.addOperation('trim',require(`./Operations/String-Trim.json`));this.addOperation('replace',require(`./Operations/String-Replace.json`));this.addOperation('substring',require(`./Operations/String-Substring.json`));return true;}}module.exports=StringOperations;},{"../Elucidator-InstructionSet.js":2,"./Operations/String-Replace.json":28,"./Operations/String-Substring.json":29,"./Operations/String-Trim.json":30}],34:[function(require,module,exports){// When a boxed property is passed in, it should have quotes of some
// kind around it.
//
// For instance:
// 		MyValues['Name']
// 		MyValues["Age"]
// 		MyValues[`Cost`]
//
// This function removes the wrapping quotes.
//
// Please note it *DOES NOT PARSE* template literals, so backticks just
// end up doing the same thing as other quote types.
//
// TODO: Should template literals be processed?  If so what state do they have access to?  That should happen here if so.
// TODO: Make a simple class include library with these
let cleanWrapCharacters=(pCharacter,pString)=>{if(pString.startsWith(pCharacter)&&pString.endsWith(pCharacter)){return pString.substring(1,pString.length-1);}else{return pString;}};module.exports=cleanWrapCharacters;},{}],35:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/let libSimpleLog=require('./Manyfest-LogToConsole.js');/**
* Hash Translation
*
* This is a very simple translation table for hashes, which allows the same schema to resolve
* differently based on a loaded translation table.
*
* This is to prevent the requirement for mutating schemas over and over again when we want to
* reuse the structure but look up data elements by different addresses.
*
* One side-effect of this is that a translation table can "override" the built-in hashes, since
* this is always used to resolve hashes before any of the functionCallByHash(pHash, ...) perform
* their lookups by hash.
*
* @class ManyfestHashTranslation
*/class ManyfestHashTranslation{constructor(pInfoLog,pErrorLog){// Wire in logging
this.logInfo=typeof pInfoLog==='function'?pInfoLog:libSimpleLog;this.logError=typeof pErrorLog==='function'?pErrorLog:libSimpleLog;this.translationTable={};}translationCount(){return Object.keys(this.translationTable).length;}addTranslation(pTranslation){// This adds a translation in the form of:
// { "SourceHash": "DestinationHash", "SecondSourceHash":"SecondDestinationHash" }
if(typeof pTranslation!='object'){this.logError(`Hash translation addTranslation expected a translation be type object but was passed in ${typeof pTranslation}`);return false;}let tmpTranslationSources=Object.keys(pTranslation);tmpTranslationSources.forEach(pTranslationSource=>{if(typeof pTranslation[pTranslationSource]!='string'){this.logError(`Hash translation addTranslation expected a translation destination hash for [${pTranslationSource}] to be a string but the referrant was a ${typeof pTranslation[pTranslationSource]}`);}else{this.translationTable[pTranslationSource]=pTranslation[pTranslationSource];}});}removeTranslationHash(pTranslationHash){if(this.translationTable.hasOwnProperty(pTranslationHash)){delete this.translationTable[pTranslationHash];}}// This removes translations.
// If passed a string, just removes the single one.
// If passed an object, it does all the source keys.
removeTranslation(pTranslation){if(typeof pTranslation=='string'){this.removeTranslationHash(pTranslation);return true;}else if(typeof pTranslation=='object'){let tmpTranslationSources=Object.keys(pTranslation);tmpTranslationSources.forEach(pTranslationSource=>{this.removeTranslation(pTranslationSource);});return true;}else{this.logError(`Hash translation removeTranslation expected either a string or an object but the passed-in translation was type ${typeof pTranslation}`);return false;}}clearTranslations(){this.translationTable={};}translate(pTranslation){if(this.translationTable.hasOwnProperty(pTranslation)){return this.translationTable[pTranslation];}else{return pTranslation;}}}module.exports=ManyfestHashTranslation;},{"./Manyfest-LogToConsole.js":36}],36:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/ /**
* Manyfest simple logging shim (for browser and dependency-free running)
*/const logToConsole=(pLogLine,pLogObject)=>{let tmpLogLine=typeof pLogLine==='string'?pLogLine:'';console.log(`[Manyfest] ${tmpLogLine}`);if(pLogObject)console.log(JSON.stringify(pLogObject));};module.exports=logToConsole;},{}],37:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/let libSimpleLog=require('./Manyfest-LogToConsole.js');/**
* Object Address Resolver
*
* IMPORTANT NOTE: This code is intentionally more verbose than necessary, to
*                 be extremely clear what is going on in the recursion for
*                 each of the three address resolution functions.
*
*                 Although there is some opportunity to repeat ourselves a
*                 bit less in this codebase (e.g. with detection of arrays
*                 versus objects versus direct properties), it can make
*                 debugging.. challenging.  The minified version of the code
*                 optimizes out almost anything repeated in here.  So please
*                 be kind and rewind... meaning please keep the codebase less
*                 terse and more verbose so humans can comprehend it.
*
*
* @class ManyfestObjectAddressResolverCheckAddressExists
*/class ManyfestObjectAddressResolverCheckAddressExists{constructor(pInfoLog,pErrorLog){// Wire in logging
this.logInfo=typeof pInfoLog=='function'?pInfoLog:libSimpleLog;this.logError=typeof pErrorLog=='function'?pErrorLog:libSimpleLog;this.elucidatorSolver=false;this.elucidatorSolverState={};}// Check if an address exists.
//
// This is necessary because the getValueAtAddress function is ambiguous on
// whether the element/property is actually there or not (it returns
// undefined whether the property exists or not).  This function checks for
// existance and returns true or false dependent.
checkAddressExists(pObject,pAddress){// TODO: Should these throw an error?
// Make sure pObject is an object
if(typeof pObject!='object')return false;// Make sure pAddress is a string
if(typeof pAddress!='string')return false;// TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
let tmpSeparatorIndex=pAddress.indexOf('.');// This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
if(tmpSeparatorIndex==-1){// Check if the address refers to a boxed property
let tmpBracketStartIndex=pAddress.indexOf('[');let tmpBracketStopIndex=pAddress.indexOf(']');// Boxed elements look like this:
// 		MyValues[10]
// 		MyValues['Name']
// 		MyValues["Age"]
// 		MyValues[`Cost`]
//
// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
// The requirements to detect a boxed element are:
//    1) The start bracket is after character 0
if(tmpBracketStartIndex>0//    2) The end bracket has something between them
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is data
&&tmpBracketStopIndex-tmpBracketStartIndex>1){// The "Name" of the Object contained too the left of the bracket
let tmpBoxedPropertyName=pAddress.substring(0,tmpBracketStartIndex).trim();// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
// This is a rare case where Arrays testing as Objects is useful
if(typeof pObject[tmpBoxedPropertyName]!=='object'){return false;}// The "Reference" to the property within it, either an array element or object property
let tmpBoxedPropertyReference=pAddress.substring(tmpBracketStartIndex+1,tmpBracketStopIndex).trim();// Attempt to parse the reference as a number, which will be used as an array element
let tmpBoxedPropertyNumber=parseInt(tmpBoxedPropertyReference,10);// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
//        This seems confusing to me at first read, so explaination:
//        Is the Boxed Object an Array?  TRUE
//        And is the Reference inside the boxed Object not a number? TRUE
//        -->  So when these are in agreement, it's an impossible access state
if(Array.isArray(pObject[tmpBoxedPropertyName])==isNaN(tmpBoxedPropertyNumber)){return false;}//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
//       otherwise we will try to treat it as a dynamic object property.
if(isNaN(tmpBoxedPropertyNumber)){// This isn't a number ... let's treat it as a dynamic object property.
// We would expect the property to be wrapped in some kind of quotes so strip them
tmpBoxedPropertyReference=this.cleanWrapCharacters('"',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters('`',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters("'",tmpBoxedPropertyReference);// Check if the property exists.
return pObject[tmpBoxedPropertyName].hasOwnProperty(tmpBoxedPropertyReference);}else{// Use the new in operator to see if the element is in the array
return tmpBoxedPropertyNumber in pObject[tmpBoxedPropertyName];}}else{// Check if the property exists
return pObject.hasOwnProperty(pAddress);}}else{let tmpSubObjectName=pAddress.substring(0,tmpSeparatorIndex);let tmpNewAddress=pAddress.substring(tmpSeparatorIndex+1);// Test if the tmpNewAddress is an array or object
// Check if it's a boxed property
let tmpBracketStartIndex=tmpSubObjectName.indexOf('[');let tmpBracketStopIndex=tmpSubObjectName.indexOf(']');// Boxed elements look like this:
// 		MyValues[42]
// 		MyValues['Color']
// 		MyValues["Weight"]
// 		MyValues[`Diameter`]
//
// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
// The requirements to detect a boxed element are:
//    1) The start bracket is after character 0
if(tmpBracketStartIndex>0//    2) The end bracket has something between them
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is data
&&tmpBracketStopIndex-tmpBracketStartIndex>1){let tmpBoxedPropertyName=tmpSubObjectName.substring(0,tmpBracketStartIndex).trim();let tmpBoxedPropertyReference=tmpSubObjectName.substring(tmpBracketStartIndex+1,tmpBracketStopIndex).trim();let tmpBoxedPropertyNumber=parseInt(tmpBoxedPropertyReference,10);// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
//        This seems confusing to me at first read, so explaination:
//        Is the Boxed Object an Array?  TRUE
//        And is the Reference inside the boxed Object not a number? TRUE
//        -->  So when these are in agreement, it's an impossible access state
// This could be a failure in the recursion chain because they passed something like this in:
//    StudentData.Sections.Algebra.Students[1].Tardy
//       BUT
//         StudentData.Sections.Algebra.Students is an object, so the [1].Tardy is not possible to access
// This could be a failure in the recursion chain because they passed something like this in:
//    StudentData.Sections.Algebra.Students["JaneDoe"].Grade
//       BUT
//         StudentData.Sections.Algebra.Students is an array, so the ["JaneDoe"].Grade is not possible to access
// TODO: Should this be an error or something?  Should we keep a log of failures like this?
if(Array.isArray(pObject[tmpBoxedPropertyName])==isNaN(tmpBoxedPropertyNumber)){// Because this is an impossible address, the property doesn't exist
// TODO: Should we throw an error in this condition?
return false;}//This is a bracketed value
//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
//       otherwise we will try to reat it as a dynamic object property.
if(isNaN(tmpBoxedPropertyNumber)){// This isn't a number ... let's treat it as a dynanmic object property.
tmpBoxedPropertyReference=this.cleanWrapCharacters('"',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters('`',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters("'",tmpBoxedPropertyReference);// Recurse directly into the subobject
return this.checkAddressExists(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference],tmpNewAddress);}else{// We parsed a valid number out of the boxed property name, so recurse into the array
return this.checkAddressExists(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber],tmpNewAddress);}}// If there is an object property already named for the sub object, but it isn't an object
// then the system can't set the value in there.  Error and abort!
if(pObject.hasOwnProperty(tmpSubObjectName)&&typeof pObject[tmpSubObjectName]!=='object'){return false;}else if(pObject.hasOwnProperty(tmpSubObjectName)){// If there is already a subobject pass that to the recursive thingy
return this.checkAddressExists(pObject[tmpSubObjectName],tmpNewAddress);}else{// Create a subobject and then pass that
pObject[tmpSubObjectName]={};return this.checkAddressExists(pObject[tmpSubObjectName],tmpNewAddress);}}}};module.exports=ManyfestObjectAddressResolverCheckAddressExists;},{"./Manyfest-LogToConsole.js":36}],38:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/let libSimpleLog=require('./Manyfest-LogToConsole.js');let libPrecedent=require('precedent');let fCleanWrapCharacters=require('./Manyfest-CleanWrapCharacters.js');/**
* Object Address Resolver - DeleteValue
*
* IMPORTANT NOTE: This code is intentionally more verbose than necessary, to
*                 be extremely clear what is going on in the recursion for
*                 each of the three address resolution functions.
*
*                 Although there is some opportunity to repeat ourselves a
*                 bit less in this codebase (e.g. with detection of arrays
*                 versus objects versus direct properties), it can make
*                 debugging.. challenging.  The minified version of the code
*                 optimizes out almost anything repeated in here.  So please
*                 be kind and rewind... meaning please keep the codebase less
*                 terse and more verbose so humans can comprehend it.
*
* TODO: Once we validate this pattern is good to go, break these out into
*       three separate modules.
*
* @class ManyfestObjectAddressResolverDeleteValue
*/class ManyfestObjectAddressResolverDeleteValue{constructor(pInfoLog,pErrorLog){// Wire in logging
this.logInfo=typeof pInfoLog=='function'?pInfoLog:libSimpleLog;this.logError=typeof pErrorLog=='function'?pErrorLog:libSimpleLog;this.elucidatorSolver=false;this.elucidatorSolverState={};this.cleanWrapCharacters=fCleanWrapCharacters;}checkFilters(pAddress,pRecord){let tmpPrecedent=new libPrecedent();// If we don't copy the string, precedent takes it out for good.
// TODO: Consider adding a "don't replace" option for precedent
let tmpAddress=pAddress;if(!this.elucidatorSolver){// Again, manage against circular dependencies
let libElucidator=require('elucidator');this.elucidatorSolver=new libElucidator({},this.logInfo,this.logError);}if(this.elucidatorSolver){// This allows the magic filtration with elucidator configuration
// TODO: We could pass more state in (e.g. parent address, object, etc.)
// TODO: Discuss this metaprogramming AT LENGTH
let tmpFilterState={Record:pRecord,keepRecord:true};// This is about as complex as it gets.
// TODO: Optimize this so it is only initialized once.
// TODO: That means figuring out a healthy pattern for passing in state to this
tmpPrecedent.addPattern('<<~~','~~>>',pInstructionHash=>{// This is for internal config on the solution steps.  Right now config is not shared across steps.
if(this.elucidatorSolverState.hasOwnProperty(pInstructionHash)){tmpFilterState.SolutionState=this.elucidatorSolverState[pInstructionHash];}this.elucidatorSolver.solveInternalOperation('Custom',pInstructionHash,tmpFilterState);});tmpPrecedent.addPattern('<<~?','?~>>',pMagicSearchExpression=>{if(typeof pMagicSearchExpression!=='string'){return false;}// This expects a comma separated expression:
//     Some.Address.In.The.Object,==,Search Term to Match
let tmpMagicComparisonPatternSet=pMagicSearchExpression.split(',');let tmpSearchAddress=tmpMagicComparisonPatternSet[0];let tmpSearchComparator=tmpMagicComparisonPatternSet[1];let tmpSearchValue=tmpMagicComparisonPatternSet[2];tmpFilterState.ComparisonState={SearchAddress:tmpSearchAddress,Comparator:tmpSearchComparator,SearchTerm:tmpSearchValue};this.elucidatorSolver.solveOperation({"Description":{"Operation":"Simple_If","Synopsis":"Test for "},"Steps":[{"Namespace":"Logic","Instruction":"if","InputHashAddressMap":{// This is ... dynamically assigning the address in the instruction
// The complexity is astounding.
"leftValue":`Record.${tmpSearchAddress}`,"rightValue":"ComparisonState.SearchTerm","comparator":"ComparisonState.Comparator"},"OutputHashAddressMap":{"truthinessResult":"keepRecord"}}]},tmpFilterState);});tmpPrecedent.parseString(tmpAddress);// It is expected that the operation will mutate this to some truthy value
return tmpFilterState.keepRecord;}else{return true;}}// Delete the value of an element at an address
deleteValueAtAddress(pObject,pAddress,pParentAddress){// Make sure pObject (the object we are meant to be recursing) is an object (which could be an array or object)
if(typeof pObject!='object')return undefined;// Make sure pAddress (the address we are resolving) is a string
if(typeof pAddress!='string')return undefined;// Stash the parent address for later resolution
let tmpParentAddress="";if(typeof pParentAddress=='string'){tmpParentAddress=pParentAddress;}// TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
let tmpSeparatorIndex=pAddress.indexOf('.');// This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
if(tmpSeparatorIndex==-1){// Check if the address refers to a boxed property
let tmpBracketStartIndex=pAddress.indexOf('[');let tmpBracketStopIndex=pAddress.indexOf(']');// Check for the Object Set Type marker.
// Note this will not work with a bracket in the same address box set
let tmpObjectTypeMarkerIndex=pAddress.indexOf('{}');// Boxed elements look like this:
// 		MyValues[10]
// 		MyValues['Name']
// 		MyValues["Age"]
// 		MyValues[`Cost`]
//
// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
// The requirements to detect a boxed element are:
//    1) The start bracket is after character 0
if(tmpBracketStartIndex>0//    2) The end bracket has something between them
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is data
&&tmpBracketStopIndex-tmpBracketStartIndex>1){// The "Name" of the Object contained too the left of the bracket
let tmpBoxedPropertyName=pAddress.substring(0,tmpBracketStartIndex).trim();// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
// This is a rare case where Arrays testing as Objects is useful
if(typeof pObject[tmpBoxedPropertyName]!=='object'){return false;}// The "Reference" to the property within it, either an array element or object property
let tmpBoxedPropertyReference=pAddress.substring(tmpBracketStartIndex+1,tmpBracketStopIndex).trim();// Attempt to parse the reference as a number, which will be used as an array element
let tmpBoxedPropertyNumber=parseInt(tmpBoxedPropertyReference,10);// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
//        This seems confusing to me at first read, so explaination:
//        Is the Boxed Object an Array?  TRUE
//        And is the Reference inside the boxed Object not a number? TRUE
//        -->  So when these are in agreement, it's an impossible access state
if(Array.isArray(pObject[tmpBoxedPropertyName])==isNaN(tmpBoxedPropertyNumber)){return false;}//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
//       otherwise we will try to treat it as a dynamic object property.
if(isNaN(tmpBoxedPropertyNumber)){// This isn't a number ... let's treat it as a dynamic object property.
// We would expect the property to be wrapped in some kind of quotes so strip them
tmpBoxedPropertyReference=this.cleanWrapCharacters('"',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters('`',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters("'",tmpBoxedPropertyReference);// Return the value in the property
delete pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference];return true;}else{delete pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber];return true;}}// The requirements to detect a boxed set element are:
//    1) The start bracket is after character 0
else if(tmpBracketStartIndex>0//    2) The end bracket is after the start bracket
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is nothing in the brackets
&&tmpBracketStopIndex-tmpBracketStartIndex==1){let tmpBoxedPropertyName=pAddress.substring(0,tmpBracketStartIndex).trim();if(!Array.isArray(pObject[tmpBoxedPropertyName])){// We asked for a set from an array but it isnt' an array.
return false;}let tmpInputArray=pObject[tmpBoxedPropertyName];// Count from the end to the beginning so splice doesn't %&%#$ up the array
for(let i=tmpInputArray.length-1;i>=0;i--){// The filtering is complex but allows config-based metaprogramming directly from schema
let tmpKeepRecord=this.checkFilters(pAddress,tmpInputArray[i]);if(tmpKeepRecord){// Delete elements end to beginning
tmpInputArray.splice(i,1);}}return true;}// The object has been flagged as an object set, so treat it as such
else if(tmpObjectTypeMarkerIndex>0){let tmpObjectPropertyName=pAddress.substring(0,tmpObjectTypeMarkerIndex).trim();if(typeof pObject[tmpObjectPropertyName]!='object'){// We asked for a set from an array but it isnt' an array.
return false;}delete pObject[tmpObjectPropertyName];return true;}else{// Now is the point in recursion to return the value in the address
delete pObject[pAddress];return true;}}else{let tmpSubObjectName=pAddress.substring(0,tmpSeparatorIndex);let tmpNewAddress=pAddress.substring(tmpSeparatorIndex+1);// BOXED ELEMENTS
// Test if the tmpNewAddress is an array or object
// Check if it's a boxed property
let tmpBracketStartIndex=tmpSubObjectName.indexOf('[');let tmpBracketStopIndex=tmpSubObjectName.indexOf(']');// Boxed elements look like this:
// 		MyValues[42]
// 		MyValues['Color']
// 		MyValues["Weight"]
// 		MyValues[`Diameter`]
//
// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
// The requirements to detect a boxed element are:
//    1) The start bracket is after character 0
if(tmpBracketStartIndex>0//    2) The end bracket has something between them
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is data
&&tmpBracketStopIndex-tmpBracketStartIndex>1){let tmpBoxedPropertyName=tmpSubObjectName.substring(0,tmpBracketStartIndex).trim();let tmpBoxedPropertyReference=tmpSubObjectName.substring(tmpBracketStartIndex+1,tmpBracketStopIndex).trim();let tmpBoxedPropertyNumber=parseInt(tmpBoxedPropertyReference,10);// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
//        This seems confusing to me at first read, so explaination:
//        Is the Boxed Object an Array?  TRUE
//        And is the Reference inside the boxed Object not a number? TRUE
//        -->  So when these are in agreement, it's an impossible access state
// This could be a failure in the recursion chain because they passed something like this in:
//    StudentData.Sections.Algebra.Students[1].Tardy
//       BUT
//         StudentData.Sections.Algebra.Students is an object, so the [1].Tardy is not possible to access
// This could be a failure in the recursion chain because they passed something like this in:
//    StudentData.Sections.Algebra.Students["JaneDoe"].Grade
//       BUT
//         StudentData.Sections.Algebra.Students is an array, so the ["JaneDoe"].Grade is not possible to access
// TODO: Should this be an error or something?  Should we keep a log of failures like this?
if(Array.isArray(pObject[tmpBoxedPropertyName])==isNaN(tmpBoxedPropertyNumber)){return false;}// Check if the boxed property is an object.
if(typeof pObject[tmpBoxedPropertyName]!='object'){return false;}//This is a bracketed value
//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
//       otherwise we will try to reat it as a dynamic object property.
if(isNaN(tmpBoxedPropertyNumber)){// This isn't a number ... let's treat it as a dynanmic object property.
tmpBoxedPropertyReference=this.cleanWrapCharacters('"',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters('`',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters("'",tmpBoxedPropertyReference);// Continue to manage the parent address for recursion
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpSubObjectName}`;// Recurse directly into the subobject
return this.deleteValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference],tmpNewAddress,tmpParentAddress);}else{// Continue to manage the parent address for recursion
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpSubObjectName}`;// We parsed a valid number out of the boxed property name, so recurse into the array
return this.deleteValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber],tmpNewAddress,tmpParentAddress);}}// The requirements to detect a boxed set element are:
//    1) The start bracket is after character 0
else if(tmpBracketStartIndex>0//    2) The end bracket is after the start bracket
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is nothing in the brackets
&&tmpBracketStopIndex-tmpBracketStartIndex==1){let tmpBoxedPropertyName=pAddress.substring(0,tmpBracketStartIndex).trim();if(!Array.isArray(pObject[tmpBoxedPropertyName])){// We asked for a set from an array but it isnt' an array.
return false;}// We need to enumerate the array and grab the addresses from there.
let tmpArrayProperty=pObject[tmpBoxedPropertyName];// Managing the parent address is a bit more complex here -- the box will be added for each element.
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpBoxedPropertyName}`;// The container object is where we have the "Address":SOMEVALUE pairs
let tmpContainerObject={};for(let i=0;i<tmpArrayProperty.length;i++){let tmpPropertyParentAddress=`${tmpParentAddress}[${i}]`;let tmpValue=this.deleteValueAtAddress(pObject[tmpBoxedPropertyName][i],tmpNewAddress,tmpPropertyParentAddress);tmpContainerObject[`${tmpPropertyParentAddress}.${tmpNewAddress}`]=tmpValue;}return tmpContainerObject;}// OBJECT SET
// Note this will not work with a bracket in the same address box set
let tmpObjectTypeMarkerIndex=pAddress.indexOf('{}');if(tmpObjectTypeMarkerIndex>0){let tmpObjectPropertyName=pAddress.substring(0,tmpObjectTypeMarkerIndex).trim();if(typeof pObject[tmpObjectPropertyName]!='object'){// We asked for a set from an array but it isnt' an array.
return false;}// We need to enumerate the Object and grab the addresses from there.
let tmpObjectProperty=pObject[tmpObjectPropertyName];let tmpObjectPropertyKeys=Object.keys(tmpObjectProperty);// Managing the parent address is a bit more complex here -- the box will be added for each element.
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpObjectPropertyName}`;// The container object is where we have the "Address":SOMEVALUE pairs
let tmpContainerObject={};for(let i=0;i<tmpObjectPropertyKeys.length;i++){let tmpPropertyParentAddress=`${tmpParentAddress}.${tmpObjectPropertyKeys[i]}`;let tmpValue=this.deleteValueAtAddress(pObject[tmpObjectPropertyName][tmpObjectPropertyKeys[i]],tmpNewAddress,tmpPropertyParentAddress);// The filtering is complex but allows config-based metaprogramming directly from schema
let tmpKeepRecord=this.checkFilters(pAddress,tmpValue);if(tmpKeepRecord){tmpContainerObject[`${tmpPropertyParentAddress}.${tmpNewAddress}`]=tmpValue;}}return tmpContainerObject;}// If there is an object property already named for the sub object, but it isn't an object
// then the system can't set the value in there.  Error and abort!
if(pObject.hasOwnProperty(tmpSubObjectName)&&typeof pObject[tmpSubObjectName]!=='object'){return undefined;}else if(pObject.hasOwnProperty(tmpSubObjectName)){// If there is already a subobject pass that to the recursive thingy
// Continue to manage the parent address for recursion
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpSubObjectName}`;return this.deleteValueAtAddress(pObject[tmpSubObjectName],tmpNewAddress,tmpParentAddress);}else{// Create a subobject and then pass that
// Continue to manage the parent address for recursion
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpSubObjectName}`;pObject[tmpSubObjectName]={};return this.deleteValueAtAddress(pObject[tmpSubObjectName],tmpNewAddress,tmpParentAddress);}}}};module.exports=ManyfestObjectAddressResolverDeleteValue;},{"./Manyfest-CleanWrapCharacters.js":34,"./Manyfest-LogToConsole.js":36,"elucidator":4,"precedent":44}],39:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/let libSimpleLog=require('./Manyfest-LogToConsole.js');let libPrecedent=require('precedent');let fCleanWrapCharacters=require('./Manyfest-CleanWrapCharacters.js');/**
* Object Address Resolver - GetValue
*
* IMPORTANT NOTE: This code is intentionally more verbose than necessary, to
*                 be extremely clear what is going on in the recursion for
*                 each of the three address resolution functions.
*
*                 Although there is some opportunity to repeat ourselves a
*                 bit less in this codebase (e.g. with detection of arrays
*                 versus objects versus direct properties), it can make
*                 debugging.. challenging.  The minified version of the code
*                 optimizes out almost anything repeated in here.  So please
*                 be kind and rewind... meaning please keep the codebase less
*                 terse and more verbose so humans can comprehend it.
*
* TODO: Once we validate this pattern is good to go, break these out into
*       three separate modules.
*
* @class ManyfestObjectAddressResolverGetValue
*/class ManyfestObjectAddressResolverGetValue{constructor(pInfoLog,pErrorLog){// Wire in logging
this.logInfo=typeof pInfoLog=='function'?pInfoLog:libSimpleLog;this.logError=typeof pErrorLog=='function'?pErrorLog:libSimpleLog;this.elucidatorSolver=false;this.elucidatorSolverState={};this.cleanWrapCharacters=fCleanWrapCharacters;}checkFilters(pAddress,pRecord){let tmpPrecedent=new libPrecedent();// If we don't copy the string, precedent takes it out for good.
// TODO: Consider adding a "don't replace" option for precedent
let tmpAddress=pAddress;if(!this.elucidatorSolver){// Again, manage against circular dependencies
let libElucidator=require('elucidator');this.elucidatorSolver=new libElucidator({},this.logInfo,this.logError);}if(this.elucidatorSolver){// This allows the magic filtration with elucidator configuration
// TODO: We could pass more state in (e.g. parent address, object, etc.)
// TODO: Discuss this metaprogramming AT LENGTH
let tmpFilterState={Record:pRecord,keepRecord:true};// This is about as complex as it gets.
// TODO: Optimize this so it is only initialized once.
// TODO: That means figuring out a healthy pattern for passing in state to this
tmpPrecedent.addPattern('<<~~','~~>>',pInstructionHash=>{// This is for internal config on the solution steps.  Right now config is not shared across steps.
if(this.elucidatorSolverState.hasOwnProperty(pInstructionHash)){tmpFilterState.SolutionState=this.elucidatorSolverState[pInstructionHash];}this.elucidatorSolver.solveInternalOperation('Custom',pInstructionHash,tmpFilterState);});tmpPrecedent.addPattern('<<~?','?~>>',pMagicSearchExpression=>{if(typeof pMagicSearchExpression!=='string'){return false;}// This expects a comma separated expression:
//     Some.Address.In.The.Object,==,Search Term to Match
let tmpMagicComparisonPatternSet=pMagicSearchExpression.split(',');let tmpSearchAddress=tmpMagicComparisonPatternSet[0];let tmpSearchComparator=tmpMagicComparisonPatternSet[1];let tmpSearchValue=tmpMagicComparisonPatternSet[2];tmpFilterState.ComparisonState={SearchAddress:tmpSearchAddress,Comparator:tmpSearchComparator,SearchTerm:tmpSearchValue};this.elucidatorSolver.solveOperation({"Description":{"Operation":"Simple_If","Synopsis":"Test for "},"Steps":[{"Namespace":"Logic","Instruction":"if","InputHashAddressMap":{// This is ... dynamically assigning the address in the instruction
// The complexity is astounding.
"leftValue":`Record.${tmpSearchAddress}`,"rightValue":"ComparisonState.SearchTerm","comparator":"ComparisonState.Comparator"},"OutputHashAddressMap":{"truthinessResult":"keepRecord"}}]},tmpFilterState);});tmpPrecedent.parseString(tmpAddress);// It is expected that the operation will mutate this to some truthy value
return tmpFilterState.keepRecord;}else{return true;}}// Get the value of an element at an address
getValueAtAddress(pObject,pAddress,pParentAddress){// Make sure pObject (the object we are meant to be recursing) is an object (which could be an array or object)
if(typeof pObject!='object')return undefined;// Make sure pAddress (the address we are resolving) is a string
if(typeof pAddress!='string')return undefined;// Stash the parent address for later resolution
let tmpParentAddress="";if(typeof pParentAddress=='string'){tmpParentAddress=pParentAddress;}// TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
let tmpSeparatorIndex=pAddress.indexOf('.');// This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
if(tmpSeparatorIndex==-1){// Check if the address refers to a boxed property
let tmpBracketStartIndex=pAddress.indexOf('[');let tmpBracketStopIndex=pAddress.indexOf(']');// Check for the Object Set Type marker.
// Note this will not work with a bracket in the same address box set
let tmpObjectTypeMarkerIndex=pAddress.indexOf('{}');// Boxed elements look like this:
// 		MyValues[10]
// 		MyValues['Name']
// 		MyValues["Age"]
// 		MyValues[`Cost`]
//
// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
// The requirements to detect a boxed element are:
//    1) The start bracket is after character 0
if(tmpBracketStartIndex>0//    2) The end bracket has something between them
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is data
&&tmpBracketStopIndex-tmpBracketStartIndex>1){// The "Name" of the Object contained too the left of the bracket
let tmpBoxedPropertyName=pAddress.substring(0,tmpBracketStartIndex).trim();// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
// This is a rare case where Arrays testing as Objects is useful
if(typeof pObject[tmpBoxedPropertyName]!=='object'){return undefined;}// The "Reference" to the property within it, either an array element or object property
let tmpBoxedPropertyReference=pAddress.substring(tmpBracketStartIndex+1,tmpBracketStopIndex).trim();// Attempt to parse the reference as a number, which will be used as an array element
let tmpBoxedPropertyNumber=parseInt(tmpBoxedPropertyReference,10);// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
//        This seems confusing to me at first read, so explaination:
//        Is the Boxed Object an Array?  TRUE
//        And is the Reference inside the boxed Object not a number? TRUE
//        -->  So when these are in agreement, it's an impossible access state
if(Array.isArray(pObject[tmpBoxedPropertyName])==isNaN(tmpBoxedPropertyNumber)){return undefined;}//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
//       otherwise we will try to treat it as a dynamic object property.
if(isNaN(tmpBoxedPropertyNumber)){// This isn't a number ... let's treat it as a dynamic object property.
// We would expect the property to be wrapped in some kind of quotes so strip them
tmpBoxedPropertyReference=this.cleanWrapCharacters('"',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters('`',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters("'",tmpBoxedPropertyReference);// Return the value in the property
return pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference];}else{return pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber];}}// The requirements to detect a boxed set element are:
//    1) The start bracket is after character 0
else if(tmpBracketStartIndex>0//    2) The end bracket is after the start bracket
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is nothing in the brackets
&&tmpBracketStopIndex-tmpBracketStartIndex==1){let tmpBoxedPropertyName=pAddress.substring(0,tmpBracketStartIndex).trim();if(!Array.isArray(pObject[tmpBoxedPropertyName])){// We asked for a set from an array but it isnt' an array.
return false;}let tmpInputArray=pObject[tmpBoxedPropertyName];let tmpOutputArray=[];for(let i=0;i<tmpInputArray.length;i++){// The filtering is complex but allows config-based metaprogramming directly from schema
let tmpKeepRecord=this.checkFilters(pAddress,tmpInputArray[i]);if(tmpKeepRecord){tmpOutputArray.push(tmpInputArray[i]);}}return tmpOutputArray;}// The object has been flagged as an object set, so treat it as such
else if(tmpObjectTypeMarkerIndex>0){let tmpObjectPropertyName=pAddress.substring(0,tmpObjectTypeMarkerIndex).trim();if(typeof pObject[tmpObjectPropertyName]!='object'){// We asked for a set from an array but it isnt' an array.
return false;}return pObject[tmpObjectPropertyName];}else{// Now is the point in recursion to return the value in the address
return pObject[pAddress];}}else{let tmpSubObjectName=pAddress.substring(0,tmpSeparatorIndex);let tmpNewAddress=pAddress.substring(tmpSeparatorIndex+1);// BOXED ELEMENTS
// Test if the tmpNewAddress is an array or object
// Check if it's a boxed property
let tmpBracketStartIndex=tmpSubObjectName.indexOf('[');let tmpBracketStopIndex=tmpSubObjectName.indexOf(']');// Boxed elements look like this:
// 		MyValues[42]
// 		MyValues['Color']
// 		MyValues["Weight"]
// 		MyValues[`Diameter`]
//
// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
// The requirements to detect a boxed element are:
//    1) The start bracket is after character 0
if(tmpBracketStartIndex>0//    2) The end bracket has something between them
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is data
&&tmpBracketStopIndex-tmpBracketStartIndex>1){let tmpBoxedPropertyName=tmpSubObjectName.substring(0,tmpBracketStartIndex).trim();let tmpBoxedPropertyReference=tmpSubObjectName.substring(tmpBracketStartIndex+1,tmpBracketStopIndex).trim();let tmpBoxedPropertyNumber=parseInt(tmpBoxedPropertyReference,10);// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
//        This seems confusing to me at first read, so explaination:
//        Is the Boxed Object an Array?  TRUE
//        And is the Reference inside the boxed Object not a number? TRUE
//        -->  So when these are in agreement, it's an impossible access state
// This could be a failure in the recursion chain because they passed something like this in:
//    StudentData.Sections.Algebra.Students[1].Tardy
//       BUT
//         StudentData.Sections.Algebra.Students is an object, so the [1].Tardy is not possible to access
// This could be a failure in the recursion chain because they passed something like this in:
//    StudentData.Sections.Algebra.Students["JaneDoe"].Grade
//       BUT
//         StudentData.Sections.Algebra.Students is an array, so the ["JaneDoe"].Grade is not possible to access
// TODO: Should this be an error or something?  Should we keep a log of failures like this?
if(Array.isArray(pObject[tmpBoxedPropertyName])==isNaN(tmpBoxedPropertyNumber)){return undefined;}// Check if the boxed property is an object.
if(typeof pObject[tmpBoxedPropertyName]!='object'){return undefined;}//This is a bracketed value
//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
//       otherwise we will try to reat it as a dynamic object property.
if(isNaN(tmpBoxedPropertyNumber)){// This isn't a number ... let's treat it as a dynanmic object property.
tmpBoxedPropertyReference=this.cleanWrapCharacters('"',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters('`',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters("'",tmpBoxedPropertyReference);// Continue to manage the parent address for recursion
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpSubObjectName}`;// Recurse directly into the subobject
return this.getValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference],tmpNewAddress,tmpParentAddress);}else{// Continue to manage the parent address for recursion
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpSubObjectName}`;// We parsed a valid number out of the boxed property name, so recurse into the array
return this.getValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber],tmpNewAddress,tmpParentAddress);}}// The requirements to detect a boxed set element are:
//    1) The start bracket is after character 0
else if(tmpBracketStartIndex>0//    2) The end bracket is after the start bracket
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is nothing in the brackets
&&tmpBracketStopIndex-tmpBracketStartIndex==1){let tmpBoxedPropertyName=pAddress.substring(0,tmpBracketStartIndex).trim();if(!Array.isArray(pObject[tmpBoxedPropertyName])){// We asked for a set from an array but it isnt' an array.
return false;}// We need to enumerate the array and grab the addresses from there.
let tmpArrayProperty=pObject[tmpBoxedPropertyName];// Managing the parent address is a bit more complex here -- the box will be added for each element.
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpBoxedPropertyName}`;// The container object is where we have the "Address":SOMEVALUE pairs
let tmpContainerObject={};for(let i=0;i<tmpArrayProperty.length;i++){let tmpPropertyParentAddress=`${tmpParentAddress}[${i}]`;let tmpValue=this.getValueAtAddress(pObject[tmpBoxedPropertyName][i],tmpNewAddress,tmpPropertyParentAddress);tmpContainerObject[`${tmpPropertyParentAddress}.${tmpNewAddress}`]=tmpValue;}return tmpContainerObject;}// OBJECT SET
// Note this will not work with a bracket in the same address box set
let tmpObjectTypeMarkerIndex=pAddress.indexOf('{}');if(tmpObjectTypeMarkerIndex>0){let tmpObjectPropertyName=pAddress.substring(0,tmpObjectTypeMarkerIndex).trim();if(typeof pObject[tmpObjectPropertyName]!='object'){// We asked for a set from an array but it isnt' an array.
return false;}// We need to enumerate the Object and grab the addresses from there.
let tmpObjectProperty=pObject[tmpObjectPropertyName];let tmpObjectPropertyKeys=Object.keys(tmpObjectProperty);// Managing the parent address is a bit more complex here -- the box will be added for each element.
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpObjectPropertyName}`;// The container object is where we have the "Address":SOMEVALUE pairs
let tmpContainerObject={};for(let i=0;i<tmpObjectPropertyKeys.length;i++){let tmpPropertyParentAddress=`${tmpParentAddress}.${tmpObjectPropertyKeys[i]}`;let tmpValue=this.getValueAtAddress(pObject[tmpObjectPropertyName][tmpObjectPropertyKeys[i]],tmpNewAddress,tmpPropertyParentAddress);// The filtering is complex but allows config-based metaprogramming directly from schema
let tmpKeepRecord=this.checkFilters(pAddress,tmpValue);if(tmpKeepRecord){tmpContainerObject[`${tmpPropertyParentAddress}.${tmpNewAddress}`]=tmpValue;}}return tmpContainerObject;}// If there is an object property already named for the sub object, but it isn't an object
// then the system can't set the value in there.  Error and abort!
if(pObject.hasOwnProperty(tmpSubObjectName)&&typeof pObject[tmpSubObjectName]!=='object'){return undefined;}else if(pObject.hasOwnProperty(tmpSubObjectName)){// If there is already a subobject pass that to the recursive thingy
// Continue to manage the parent address for recursion
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpSubObjectName}`;return this.getValueAtAddress(pObject[tmpSubObjectName],tmpNewAddress,tmpParentAddress);}else{// Create a subobject and then pass that
// Continue to manage the parent address for recursion
tmpParentAddress=`${tmpParentAddress}${tmpParentAddress.length>0?'.':''}${tmpSubObjectName}`;pObject[tmpSubObjectName]={};return this.getValueAtAddress(pObject[tmpSubObjectName],tmpNewAddress,tmpParentAddress);}}}};module.exports=ManyfestObjectAddressResolverGetValue;},{"./Manyfest-CleanWrapCharacters.js":34,"./Manyfest-LogToConsole.js":36,"elucidator":4,"precedent":44}],40:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/let libSimpleLog=require('./Manyfest-LogToConsole.js');let libPrecedent=require('precedent');let fCleanWrapCharacters=require('./Manyfest-CleanWrapCharacters.js');/**
* Object Address Resolver - SetValue
*
* IMPORTANT NOTE: This code is intentionally more verbose than necessary, to
*                 be extremely clear what is going on in the recursion for
*                 each of the three address resolution functions.
*
*                 Although there is some opportunity to repeat ourselves a
*                 bit less in this codebase (e.g. with detection of arrays
*                 versus objects versus direct properties), it can make
*                 debugging.. challenging.  The minified version of the code
*                 optimizes out almost anything repeated in here.  So please
*                 be kind and rewind... meaning please keep the codebase less
*                 terse and more verbose so humans can comprehend it.
*
*
* @class ManyfestObjectAddressSetValue
*/class ManyfestObjectAddressSetValue{constructor(pInfoLog,pErrorLog){// Wire in logging
this.logInfo=typeof pInfoLog=='function'?pInfoLog:libSimpleLog;this.logError=typeof pErrorLog=='function'?pErrorLog:libSimpleLog;this.elucidatorSolver=false;this.elucidatorSolverState={};this.cleanWrapCharacters=fCleanWrapCharacters;}// Set the value of an element at an address
setValueAtAddress(pObject,pAddress,pValue){// Make sure pObject is an object
if(typeof pObject!='object')return false;// Make sure pAddress is a string
if(typeof pAddress!='string')return false;let tmpSeparatorIndex=pAddress.indexOf('.');if(tmpSeparatorIndex==-1){// Check if it's a boxed property
let tmpBracketStartIndex=pAddress.indexOf('[');let tmpBracketStopIndex=pAddress.indexOf(']');// Boxed elements look like this:
// 		MyValues[10]
// 		MyValues['Name']
// 		MyValues["Age"]
// 		MyValues[`Cost`]
//
// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
// The requirements to detect a boxed element are:
//    1) The start bracket is after character 0
if(tmpBracketStartIndex>0//    2) The end bracket has something between them
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is data
&&tmpBracketStopIndex-tmpBracketStartIndex>1){// The "Name" of the Object contained too the left of the bracket
let tmpBoxedPropertyName=pAddress.substring(0,tmpBracketStartIndex).trim();// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
// This is a rare case where Arrays testing as Objects is useful
if(typeof pObject[tmpBoxedPropertyName]!=='object'){return false;}// The "Reference" to the property within it, either an array element or object property
let tmpBoxedPropertyReference=pAddress.substring(tmpBracketStartIndex+1,tmpBracketStopIndex).trim();// Attempt to parse the reference as a number, which will be used as an array element
let tmpBoxedPropertyNumber=parseInt(tmpBoxedPropertyReference,10);// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
//        This seems confusing to me at first read, so explaination:
//        Is the Boxed Object an Array?  TRUE
//        And is the Reference inside the boxed Object not a number? TRUE
//        -->  So when these are in agreement, it's an impossible access state
if(Array.isArray(pObject[tmpBoxedPropertyName])==isNaN(tmpBoxedPropertyNumber)){return false;}//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
//       otherwise we will try to treat it as a dynamic object property.
if(isNaN(tmpBoxedPropertyNumber)){// This isn't a number ... let's treat it as a dynamic object property.
// We would expect the property to be wrapped in some kind of quotes so strip them
tmpBoxedPropertyReference=this.cleanWrapCharacters('"',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters('`',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters("'",tmpBoxedPropertyReference);// Return the value in the property
pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference]=pValue;return true;}else{pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber]=pValue;return true;}}else{// Now is the time in recursion to set the value in the object
pObject[pAddress]=pValue;return true;}}else{let tmpSubObjectName=pAddress.substring(0,tmpSeparatorIndex);let tmpNewAddress=pAddress.substring(tmpSeparatorIndex+1);// Test if the tmpNewAddress is an array or object
// Check if it's a boxed property
let tmpBracketStartIndex=tmpSubObjectName.indexOf('[');let tmpBracketStopIndex=tmpSubObjectName.indexOf(']');// Boxed elements look like this:
// 		MyValues[42]
// 		MyValues['Color']
// 		MyValues["Weight"]
// 		MyValues[`Diameter`]
//
// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
// The requirements to detect a boxed element are:
//    1) The start bracket is after character 0
if(tmpBracketStartIndex>0//    2) The end bracket has something between them
&&tmpBracketStopIndex>tmpBracketStartIndex//    3) There is data
&&tmpBracketStopIndex-tmpBracketStartIndex>1){let tmpBoxedPropertyName=tmpSubObjectName.substring(0,tmpBracketStartIndex).trim();let tmpBoxedPropertyReference=tmpSubObjectName.substring(tmpBracketStartIndex+1,tmpBracketStopIndex).trim();let tmpBoxedPropertyNumber=parseInt(tmpBoxedPropertyReference,10);// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
//        This seems confusing to me at first read, so explaination:
//        Is the Boxed Object an Array?  TRUE
//        And is the Reference inside the boxed Object not a number? TRUE
//        -->  So when these are in agreement, it's an impossible access state
// This could be a failure in the recursion chain because they passed something like this in:
//    StudentData.Sections.Algebra.Students[1].Tardy
//       BUT
//         StudentData.Sections.Algebra.Students is an object, so the [1].Tardy is not possible to access
// This could be a failure in the recursion chain because they passed something like this in:
//    StudentData.Sections.Algebra.Students["JaneDoe"].Grade
//       BUT
//         StudentData.Sections.Algebra.Students is an array, so the ["JaneDoe"].Grade is not possible to access
// TODO: Should this be an error or something?  Should we keep a log of failures like this?
if(Array.isArray(pObject[tmpBoxedPropertyName])==isNaN(tmpBoxedPropertyNumber)){return false;}//This is a bracketed value
//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
//       otherwise we will try to reat it as a dynamic object property.
if(isNaN(tmpBoxedPropertyNumber)){// This isn't a number ... let's treat it as a dynanmic object property.
tmpBoxedPropertyReference=this.cleanWrapCharacters('"',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters('`',tmpBoxedPropertyReference);tmpBoxedPropertyReference=this.cleanWrapCharacters("'",tmpBoxedPropertyReference);// Recurse directly into the subobject
return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference],tmpNewAddress,pValue);}else{// We parsed a valid number out of the boxed property name, so recurse into the array
return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber],tmpNewAddress,pValue);}}// If there is an object property already named for the sub object, but it isn't an object
// then the system can't set the value in there.  Error and abort!
if(pObject.hasOwnProperty(tmpSubObjectName)&&typeof pObject[tmpSubObjectName]!=='object'){if(!pObject.hasOwnProperty('__ERROR'))pObject['__ERROR']={};// Put it in an error object so data isn't lost
pObject['__ERROR'][pAddress]=pValue;return false;}else if(pObject.hasOwnProperty(tmpSubObjectName)){// If there is already a subobject pass that to the recursive thingy
return this.setValueAtAddress(pObject[tmpSubObjectName],tmpNewAddress,pValue);}else{// Create a subobject and then pass that
pObject[tmpSubObjectName]={};return this.setValueAtAddress(pObject[tmpSubObjectName],tmpNewAddress,pValue);}}}};module.exports=ManyfestObjectAddressSetValue;},{"./Manyfest-CleanWrapCharacters.js":34,"./Manyfest-LogToConsole.js":36,"precedent":44}],41:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/let libSimpleLog=require('./Manyfest-LogToConsole.js');/**
* Object Address Generation
*
* Automagically generate addresses and properties based on a passed-in object,
* to be used for easy creation of schemas.  Meant to simplify the lives of
* developers wanting to create schemas without typing a bunch of stuff.
*
* IMPORTANT NOTE: This code is intentionally more verbose than necessary, to
*                 be extremely clear what is going on in the recursion for
*                 each of the three address resolution functions.
*
*                 Although there is some opportunity to repeat ourselves a
*                 bit less in this codebase (e.g. with detection of arrays
*                 versus objects versus direct properties), it can make
*                 debugging.. challenging.  The minified version of the code
*                 optimizes out almost anything repeated in here.  So please
*                 be kind and rewind... meaning please keep the codebase less
*                 terse and more verbose so humans can comprehend it.
*
*
* @class ManyfestObjectAddressGeneration
*/class ManyfestObjectAddressGeneration{constructor(pInfoLog,pErrorLog){// Wire in logging
this.logInfo=typeof pInfoLog=='function'?pInfoLog:libSimpleLog;this.logError=typeof pErrorLog=='function'?pErrorLog:libSimpleLog;}// generateAddressses
//
// This flattens an object into a set of key:value pairs for *EVERY SINGLE
// POSSIBLE ADDRESS* in the object.  It can get ... really insane really
// quickly.  This is not meant to be used directly to generate schemas, but
// instead as a starting point for scripts or UIs.
//
// This will return a mega set of key:value pairs with all possible schema
// permutations and default values (when not an object) and everything else.
generateAddressses(pObject,pBaseAddress,pSchema){let tmpBaseAddress=typeof pBaseAddress=='string'?pBaseAddress:'';let tmpSchema=typeof pSchema=='object'?pSchema:{};let tmpObjectType=typeof pObject;let tmpSchemaObjectEntry={Address:tmpBaseAddress,Hash:tmpBaseAddress,Name:tmpBaseAddress,// This is so scripts and UI controls can force a developer to opt-in.
InSchema:false};if(tmpObjectType=='object'&&pObject==null){tmpObjectType='null';}switch(tmpObjectType){case'string':tmpSchemaObjectEntry.DataType='String';tmpSchemaObjectEntry.Default=pObject;tmpSchema[tmpBaseAddress]=tmpSchemaObjectEntry;break;case'number':case'bigint':tmpSchemaObjectEntry.DataType='Number';tmpSchemaObjectEntry.Default=pObject;tmpSchema[tmpBaseAddress]=tmpSchemaObjectEntry;break;case'undefined':case'null':tmpSchemaObjectEntry.DataType='Any';tmpSchemaObjectEntry.Default=pObject;tmpSchema[tmpBaseAddress]=tmpSchemaObjectEntry;break;case'object':if(Array.isArray(pObject)){tmpSchemaObjectEntry.DataType='Array';if(tmpBaseAddress!=''){tmpSchema[tmpBaseAddress]=tmpSchemaObjectEntry;}for(let i=0;i<pObject.length;i++){this.generateAddressses(pObject[i],`${tmpBaseAddress}[${i}]`,tmpSchema);}}else{tmpSchemaObjectEntry.DataType='Object';if(tmpBaseAddress!=''){tmpSchema[tmpBaseAddress]=tmpSchemaObjectEntry;tmpBaseAddress+='.';}let tmpObjectProperties=Object.keys(pObject);for(let i=0;i<tmpObjectProperties.length;i++){this.generateAddressses(pObject[tmpObjectProperties[i]],`${tmpBaseAddress}${tmpObjectProperties[i]}`,tmpSchema);}}break;case'symbol':case'function':// Symbols and functions neither recurse nor get added to the schema
break;}return tmpSchema;}};module.exports=ManyfestObjectAddressGeneration;},{"./Manyfest-LogToConsole.js":36}],42:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/let libSimpleLog=require('./Manyfest-LogToConsole.js');/**
* Schema Manipulation Functions
*
* @class ManyfestSchemaManipulation
*/class ManyfestSchemaManipulation{constructor(pInfoLog,pErrorLog){// Wire in logging
this.logInfo=typeof pInfoLog==='function'?pInfoLog:libSimpleLog;this.logError=typeof pErrorLog==='function'?pErrorLog:libSimpleLog;}// This translates the default address mappings to something different.
//
// For instance you can pass in manyfest schema descriptor object:
// 	{
//	  "Address.Of.a": { "Hash": "a", "Type": "Number" },
//	  "Address.Of.b": { "Hash": "b", "Type": "Number" }
//  }
//
//
// And then an address mapping (basically a Hash->Address map)
//  {
//    "a": "New.Address.Of.a",
//    "b": "New.Address.Of.b"
//  }
//
// NOTE: This mutates the schema object permanently, altering the base hash.
//       If there is a collision with an existing address, it can lead to overwrites.
// TODO: Discuss what should happen on collisions.
resolveAddressMappings(pManyfestSchemaDescriptors,pAddressMapping){if(typeof pManyfestSchemaDescriptors!='object'){this.logError(`Attempted to resolve address mapping but the descriptor was not an object.`);return false;}if(typeof pAddressMapping!='object'){// No mappings were passed in
return true;}// Get the arrays of both the schema definition and the hash mapping
let tmpManyfestAddresses=Object.keys(pManyfestSchemaDescriptors);let tmpHashMapping={};tmpManyfestAddresses.forEach(pAddress=>{if(pManyfestSchemaDescriptors[pAddress].hasOwnProperty('Hash')){tmpHashMapping[pManyfestSchemaDescriptors[pAddress].Hash]=pAddress;}});let tmpAddressMappingSet=Object.keys(pAddressMapping);tmpAddressMappingSet.forEach(pInputAddress=>{let tmpNewDescriptorAddress=pAddressMapping[pInputAddress];let tmpOldDescriptorAddress=false;let tmpDescriptor=false;// See if there is a matching descriptor either by Address directly or Hash
if(pManyfestSchemaDescriptors.hasOwnProperty(pInputAddress)){tmpOldDescriptorAddress=pInputAddress;}else if(tmpHashMapping.hasOwnProperty(pInputAddress)){tmpOldDescriptorAddress=tmpHashMapping[pInputAddress];}// If there was a matching descriptor in the manifest, store it in the temporary descriptor
if(tmpOldDescriptorAddress){tmpDescriptor=pManyfestSchemaDescriptors[tmpOldDescriptorAddress];delete pManyfestSchemaDescriptors[tmpOldDescriptorAddress];}else{// Create a new descriptor!  Map it to the input address.
tmpDescriptor={Hash:pInputAddress};}// Now re-add the descriptor to the manyfest schema
pManyfestSchemaDescriptors[tmpNewDescriptorAddress]=tmpDescriptor;});return true;}safeResolveAddressMappings(pManyfestSchemaDescriptors,pAddressMapping){// This returns the descriptors as a new object, safely remapping without mutating the original schema Descriptors
let tmpManyfestSchemaDescriptors=JSON.parse(JSON.stringify(pManyfestSchemaDescriptors));this.resolveAddressMappings(tmpManyfestSchemaDescriptors,pAddressMapping);return tmpManyfestSchemaDescriptors;}mergeAddressMappings(pManyfestSchemaDescriptorsDestination,pManyfestSchemaDescriptorsSource){if(typeof pManyfestSchemaDescriptorsSource!='object'||typeof pManyfestSchemaDescriptorsDestination!='object'){this.logError(`Attempted to merge two schema descriptors but both were not objects.`);return false;}let tmpSource=JSON.parse(JSON.stringify(pManyfestSchemaDescriptorsSource));let tmpNewManyfestSchemaDescriptors=JSON.parse(JSON.stringify(pManyfestSchemaDescriptorsDestination));// The first passed-in set of descriptors takes precedence.
let tmpDescriptorAddresses=Object.keys(tmpSource);tmpDescriptorAddresses.forEach(pDescriptorAddress=>{if(!tmpNewManyfestSchemaDescriptors.hasOwnProperty(pDescriptorAddress)){tmpNewManyfestSchemaDescriptors[pDescriptorAddress]=tmpSource[pDescriptorAddress];}});return tmpNewManyfestSchemaDescriptors;}}module.exports=ManyfestSchemaManipulation;},{"./Manyfest-LogToConsole.js":36}],43:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/let libSimpleLog=require('./Manyfest-LogToConsole.js');let libPrecedent=require('precedent');let libHashTranslation=require('./Manyfest-HashTranslation.js');let libObjectAddressCheckAddressExists=require('./Manyfest-ObjectAddress-CheckAddressExists.js');let libObjectAddressGetValue=require('./Manyfest-ObjectAddress-GetValue.js');let libObjectAddressSetValue=require('./Manyfest-ObjectAddress-SetValue.js');let libObjectAddressDeleteValue=require('./Manyfest-ObjectAddress-DeleteValue.js');let libObjectAddressGeneration=require('./Manyfest-ObjectAddressGeneration.js');let libSchemaManipulation=require('./Manyfest-SchemaManipulation.js');/**
* Manyfest object address-based descriptions and manipulations.
*
* @class Manyfest
*/class Manyfest{constructor(pManifest,pInfoLog,pErrorLog,pOptions){// Wire in logging
this.logInfo=typeof pInfoLog==='function'?pInfoLog:libSimpleLog;this.logError=typeof pErrorLog==='function'?pErrorLog:libSimpleLog;// Create an object address resolver and map in the functions
this.objectAddressCheckAddressExists=new libObjectAddressCheckAddressExists(this.logInfo,this.logError);this.objectAddressGetValue=new libObjectAddressGetValue(this.logInfo,this.logError);this.objectAddressSetValue=new libObjectAddressSetValue(this.logInfo,this.logError);this.objectAddressDeleteValue=new libObjectAddressDeleteValue(this.logInfo,this.logError);this.options={strict:false,defaultValues:{"String":"","Number":0,"Float":0.0,"Integer":0,"Boolean":false,"Binary":0,"DateTime":0,"Array":[],"Object":{},"Null":null}};this.scope=undefined;this.elementAddresses=undefined;this.elementHashes=undefined;this.elementDescriptors=undefined;// This can cause a circular dependency chain, so it only gets initialized if the schema specifically calls for it.
this.dataSolvers=undefined;// So solvers can use their own state
this.dataSolverState=undefined;this.reset();if(typeof pManifest==='object'){this.loadManifest(pManifest);}this.schemaManipulations=new libSchemaManipulation(this.logInfo,this.logError);this.objectAddressGeneration=new libObjectAddressGeneration(this.logInfo,this.logError);this.hashTranslations=new libHashTranslation(this.logInfo,this.logError);}/*************************************************************************
	 * Schema Manifest Loading, Reading, Manipulation and Serialization Functions
	 */ // Reset critical manifest properties
reset(){this.scope='DEFAULT';this.elementAddresses=[];this.elementHashes={};this.elementDescriptors={};this.dataSolvers=undefined;this.dataSolverState={};this.libElucidator=undefined;}setElucidatorSolvers(pElucidatorSolver,pElucidatorSolverState){this.objectAddressCheckAddressExists.elucidatorSolver=pElucidatorSolver;this.objectAddressGetValue.elucidatorSolver=pElucidatorSolver;this.objectAddressSetValue.elucidatorSolver=pElucidatorSolver;this.objectAddressDeleteValue.elucidatorSolver=pElucidatorSolver;this.objectAddressCheckAddressExists.elucidatorSolverState=pElucidatorSolverState;this.objectAddressGetValue.elucidatorSolverState=pElucidatorSolverState;this.objectAddressSetValue.elucidatorSolverState=pElucidatorSolverState;this.objectAddressDeleteValue.elucidatorSolverState=pElucidatorSolverState;}clone(){// Make a copy of the options in-place
let tmpNewOptions=JSON.parse(JSON.stringify(this.options));let tmpNewManyfest=new Manyfest(this.getManifest(),this.logInfo,this.logError,tmpNewOptions);// Import the hash translations
tmpNewManyfest.hashTranslations.addTranslation(this.hashTranslations.translationTable);return tmpNewManyfest;}// Deserialize a Manifest from a string
deserialize(pManifestString){// TODO: Add guards for bad manifest string
return this.loadManifest(JSON.parse(pManifestString));}// Load a manifest from an object
loadManifest(pManifest){if(typeof pManifest!=='object'){this.logError(`(${this.scope}) Error loading manifest; expecting an object but parameter was type ${typeof pManifest}.`);return false;}if(pManifest.hasOwnProperty('Scope')){if(typeof pManifest.Scope==='string'){this.scope=pManifest.Scope;}else{this.logError(`(${this.scope}) Error loading scope from manifest; expecting a string but property was type ${typeof pManifest.Scope}.`,pManifest);}}else{this.logError(`(${this.scope}) Error loading scope from manifest object.  Property "Scope" does not exist in the root of the object.`,pManifest);}if(pManifest.hasOwnProperty('Descriptors')){if(typeof pManifest.Descriptors==='object'){let tmpDescriptionAddresses=Object.keys(pManifest.Descriptors);for(let i=0;i<tmpDescriptionAddresses.length;i++){this.addDescriptor(tmpDescriptionAddresses[i],pManifest.Descriptors[tmpDescriptionAddresses[i]]);}}else{this.logError(`(${this.scope}) Error loading description object from manifest object.  Expecting an object in 'Manifest.Descriptors' but the property was type ${typeof pManifest.Descriptors}.`,pManifest);}}else{this.logError(`(${this.scope}) Error loading object description from manifest object.  Property "Descriptors" does not exist in the root of the Manifest object.`,pManifest);}// This seems like it would create a circular dependency issue but it only goes as deep as the schema defines Solvers
if(pManifest.hasOwnProperty('Solvers')&&typeof pManifest.Solvers=='object'){// There are elucidator solvers passed-in, so we will create one to filter data.
let libElucidator=require('elucidator');// WARNING THESE CAN MUTATE THE DATA
// The pattern for the solver is: {<~~SolverName~~>} anywhere in a property.
//   Yes, this means your Javascript elements can't have my self-styled jellyfish brackets in them.
//   This does, though, mean we can filter at multiple layers safely.
//   Because these can be put at any address
// The solver themselves:
//   They are passed-in an object, and the current record is in the Record subobject.
//   Basic operations can just write to the root object but...
//   IF YOU PERMUTE THE Record SUBOBJECT YOU CAN AFFECT RECURSION
// This is mostly meant for if statements to filter.
//   Basically on aggregation, if a filter is set it will set "keep record" to true and let the solver decide differently.
this.dataSolvers=new libElucidator(pManifest.Solvers,this.logInfo,this.logError);// Load the solver state in so each instruction can have internal config
// TODO: Should this just be a part of the lower layer pattern?
let tmpSolverKeys=Object.keys(pManifest.Solvers);for(let i=0;i<tmpSolverKeys.length;i++){this.dataSolverState[tmpSolverKeys]=pManifest.Solvers[tmpSolverKeys[i]];}this.setElucidatorSolvers(this.dataSolvers,this.dataSolverState);}}// Serialize the Manifest to a string
// TODO: Should this also serialize the translation table?
serialize(){return JSON.stringify(this.getManifest());}getManifest(){return{Scope:this.scope,Descriptors:JSON.parse(JSON.stringify(this.elementDescriptors))};}// Add a descriptor to the manifest
addDescriptor(pAddress,pDescriptor){if(typeof pDescriptor==='object'){// Add the Address into the Descriptor if it doesn't exist:
if(!pDescriptor.hasOwnProperty('Address')){pDescriptor.Address=pAddress;}if(!this.elementDescriptors.hasOwnProperty(pAddress)){this.elementAddresses.push(pAddress);}// Add the element descriptor to the schema
this.elementDescriptors[pAddress]=pDescriptor;// Always add the address as a hash
this.elementHashes[pAddress]=pAddress;if(pDescriptor.hasOwnProperty('Hash')){// TODO: Check if this is a good idea or not..
//       Collisions are bound to happen with both representations of the address/hash in here and developers being able to create their own hashes.
this.elementHashes[pDescriptor.Hash]=pAddress;}else{pDescriptor.Hash=pAddress;}return true;}else{this.logError(`(${this.scope}) Error loading object descriptor for address '${pAddress}' from manifest object.  Expecting an object but property was type ${typeof pDescriptor}.`);return false;}}getDescriptorByHash(pHash){return this.getDescriptor(this.resolveHashAddress(pHash));}getDescriptor(pAddress){return this.elementDescriptors[pAddress];}// execute an action function for each descriptor
eachDescriptor(fAction){let tmpDescriptorAddresses=Object.keys(this.elementDescriptors);for(let i=0;i<tmpDescriptorAddresses.length;i++){fAction(this.elementDescriptors[tmpDescriptorAddresses[i]]);}}/*************************************************************************
	 * Beginning of Object Manipulation (read & write) Functions
	 */ // Check if an element exists by its hash
checkAddressExistsByHash(pObject,pHash){return this.checkAddressExists(pObject,this.resolveHashAddress(pHash));}// Check if an element exists at an address
checkAddressExists(pObject,pAddress){return this.objectAddressCheckAddressExists.checkAddressExists(pObject,pAddress);}// Turn a hash into an address, factoring in the translation table.
resolveHashAddress(pHash){let tmpAddress=undefined;let tmpInElementHashTable=this.elementHashes.hasOwnProperty(pHash);let tmpInTranslationTable=this.hashTranslations.translationTable.hasOwnProperty(pHash);// The most straightforward: the hash exists, no translations.
if(tmpInElementHashTable&&!tmpInTranslationTable){tmpAddress=this.elementHashes[pHash];}// There is a translation from one hash to another, and, the elementHashes contains the pointer end
else if(tmpInTranslationTable&&this.elementHashes.hasOwnProperty(this.hashTranslations.translate(pHash))){tmpAddress=this.elementHashes[this.hashTranslations.translate(pHash)];}// Use the level of indirection only in the Translation Table
else if(tmpInTranslationTable){tmpAddress=this.hashTranslations.translate(pHash);}// Just treat the hash as an address.
// TODO: Discuss this ... it is magic but controversial
else{tmpAddress=pHash;}return tmpAddress;}// Get the value of an element by its hash
getValueByHash(pObject,pHash){let tmpValue=this.getValueAtAddress(pObject,this.resolveHashAddress(pHash));if(typeof tmpValue=='undefined'){// Try to get a default if it exists
tmpValue=this.getDefaultValue(this.getDescriptorByHash(pHash));}return tmpValue;}// Get the value of an element at an address
getValueAtAddress(pObject,pAddress){let tmpValue=this.objectAddressGetValue.getValueAtAddress(pObject,pAddress);if(typeof tmpValue=='undefined'){// Try to get a default if it exists
tmpValue=this.getDefaultValue(this.getDescriptor(pAddress));}return tmpValue;}// Set the value of an element by its hash
setValueByHash(pObject,pHash,pValue){return this.setValueAtAddress(pObject,this.resolveHashAddress(pHash),pValue);}// Set the value of an element at an address
setValueAtAddress(pObject,pAddress,pValue){return this.objectAddressSetValue.setValueAtAddress(pObject,pAddress,pValue);}// Delete the value of an element by its hash
deleteValueByHash(pObject,pHash,pValue){return this.deleteValueAtAddress(pObject,this.resolveHashAddress(pHash),pValue);}// Delete the value of an element at an address
deleteValueAtAddress(pObject,pAddress,pValue){return this.objectAddressDeleteValue.deleteValueAtAddress(pObject,pAddress,pValue);}// Validate the consistency of an object against the schema
validate(pObject){let tmpValidationData={Error:null,Errors:[],MissingElements:[]};if(typeof pObject!=='object'){tmpValidationData.Error=true;tmpValidationData.Errors.push(`Expected passed in object to be type object but was passed in ${typeof pObject}`);}let addValidationError=(pAddress,pErrorMessage)=>{tmpValidationData.Error=true;tmpValidationData.Errors.push(`Element at address "${pAddress}" ${pErrorMessage}.`);};// Now enumerate through the values and check for anomalies based on the schema
for(let i=0;i<this.elementAddresses.length;i++){let tmpDescriptor=this.getDescriptor(this.elementAddresses[i]);let tmpValueExists=this.checkAddressExists(pObject,tmpDescriptor.Address);let tmpValue=this.getValueAtAddress(pObject,tmpDescriptor.Address);if(typeof tmpValue=='undefined'||!tmpValueExists){// This will technically mean that `Object.Some.Value = undefined` will end up showing as "missing"
// TODO: Do we want to do a different message based on if the property exists but is undefined?
tmpValidationData.MissingElements.push(tmpDescriptor.Address);if(tmpDescriptor.Required||this.options.strict){addValidationError(tmpDescriptor.Address,'is flagged REQUIRED but is not set in the object');}}// Now see if there is a data type specified for this element
if(tmpDescriptor.DataType){let tmpElementType=typeof tmpValue;switch(tmpDescriptor.DataType.toString().trim().toLowerCase()){case'string':if(tmpElementType!='string'){addValidationError(tmpDescriptor.Address,`has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);}break;case'number':if(tmpElementType!='number'){addValidationError(tmpDescriptor.Address,`has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);}break;case'integer':if(tmpElementType!='number'){addValidationError(tmpDescriptor.Address,`has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);}else{let tmpValueString=tmpValue.toString();if(tmpValueString.indexOf('.')>-1){// TODO: Is this an error?
addValidationError(tmpDescriptor.Address,`has a DataType ${tmpDescriptor.DataType} but has a decimal point in the number.`);}}break;case'float':if(tmpElementType!='number'){addValidationError(tmpDescriptor.Address,`has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);}break;case'DateTime':let tmpValueDate=new Date(tmpValue);if(tmpValueDate.toString()=='Invalid Date'){addValidationError(tmpDescriptor.Address,`has a DataType ${tmpDescriptor.DataType} but is not parsable as a Date by Javascript`);}default:// Check if this is a string, in the default case
// Note this is only when a DataType is specified and it is an unrecognized data type.
if(tmpElementType!='string'){addValidationError(tmpDescriptor.Address,`has a DataType ${tmpDescriptor.DataType} (which auto-converted to String because it was unrecognized) but is of the type ${tmpElementType}`);}break;}}}return tmpValidationData;}// Returns a default value, or, the default value for the data type (which is overridable with configuration)
getDefaultValue(pDescriptor){if(typeof pDescriptor!='object'){return undefined;}if(pDescriptor.hasOwnProperty('Default')){return pDescriptor.Default;}else{// Default to a null if it doesn't have a type specified.
// This will ensure a placeholder is created but isn't misinterpreted.
let tmpDataType=pDescriptor.hasOwnProperty('DataType')?pDescriptor.DataType:'String';if(this.options.defaultValues.hasOwnProperty(tmpDataType)){return this.options.defaultValues[tmpDataType];}else{// give up and return null
return null;}}}// Enumerate through the schema and populate default values if they don't exist.
populateDefaults(pObject,pOverwriteProperties){return this.populateObject(pObject,pOverwriteProperties,// This just sets up a simple filter to see if there is a default set.
pDescriptor=>{return pDescriptor.hasOwnProperty('Default');});}// Forcefully populate all values even if they don't have defaults.
// Based on type, this can do unexpected things.
populateObject(pObject,pOverwriteProperties,fFilter){// Automatically create an object if one isn't passed in.
let tmpObject=typeof pObject==='object'?pObject:{};// Default to *NOT OVERWRITING* properties
let tmpOverwriteProperties=typeof pOverwriteProperties=='undefined'?false:pOverwriteProperties;// This is a filter function, which is passed the schema and allows complex filtering of population
// The default filter function just returns true, populating everything.
let tmpFilterFunction=typeof fFilter=='function'?fFilter:pDescriptor=>{return true;};this.elementAddresses.forEach(pAddress=>{let tmpDescriptor=this.getDescriptor(pAddress);// Check the filter function to see if this is an address we want to set the value for.
if(tmpFilterFunction(tmpDescriptor)){// If we are overwriting properties OR the property does not exist
if(tmpOverwriteProperties||!this.checkAddressExists(tmpObject,pAddress)){this.setValueAtAddress(tmpObject,pAddress,this.getDefaultValue(tmpDescriptor));}}});return tmpObject;}};module.exports=Manyfest;},{"./Manyfest-HashTranslation.js":35,"./Manyfest-LogToConsole.js":36,"./Manyfest-ObjectAddress-CheckAddressExists.js":37,"./Manyfest-ObjectAddress-DeleteValue.js":38,"./Manyfest-ObjectAddress-GetValue.js":39,"./Manyfest-ObjectAddress-SetValue.js":40,"./Manyfest-ObjectAddressGeneration.js":41,"./Manyfest-SchemaManipulation.js":42,"elucidator":4,"precedent":44}],44:[function(require,module,exports){/**
* Precedent Meta-Templating
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Process text streams, parsing out meta-template expressions.
*/var libWordTree=require(`./WordTree.js`);var libStringParser=require(`./StringParser.js`);class Precedent{/**
	 * Precedent Constructor
	 */constructor(){this.WordTree=new libWordTree();this.StringParser=new libStringParser();this.ParseTree=this.WordTree.ParseTree;}/**
	 * Add a Pattern to the Parse Tree
	 * @method addPattern
	 * @param {Object} pTree - A node on the parse tree to push the characters into
	 * @param {string} pPattern - The string to add to the tree
	 * @param {number} pIndex - callback function
	 * @return {bool} True if adding the pattern was successful
	 */addPattern(pPatternStart,pPatternEnd,pParser){return this.WordTree.addPattern(pPatternStart,pPatternEnd,pParser);}/**
	 * Parse a string with the existing parse tree
	 * @method parseString
	 * @param {string} pString - The string to parse
	 * @return {string} The result from the parser
	 */parseString(pString){return this.StringParser.parseString(pString,this.ParseTree);}}module.exports=Precedent;},{"./StringParser.js":45,"./WordTree.js":46}],45:[function(require,module,exports){/**
* String Parser
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Parse a string, properly processing each matched token in the word tree.
*/class StringParser{/**
	 * StringParser Constructor
	 */constructor(){}/**
	 * Create a fresh parsing state object to work with.
	 * @method newParserState
	 * @param {Object} pParseTree - A node on the parse tree to begin parsing from (usually root)
	 * @return {Object} A new parser state object for running a character parser on
	 * @private
	 */newParserState(pParseTree){return{ParseTree:pParseTree,Output:'',OutputBuffer:'',Pattern:false,PatternMatch:false,PatternMatchOutputBuffer:''};}/**
	 * Assign a node of the parser tree to be the next potential match.
	 * If the node has a PatternEnd property, it is a valid match and supercedes the last valid match (or becomes the initial match).
	 * @method assignNode
	 * @param {Object} pNode - A node on the parse tree to assign
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */assignNode(pNode,pParserState){pParserState.PatternMatch=pNode;// If the pattern has a END we can assume it has a parse function...
if(pParserState.PatternMatch.hasOwnProperty('PatternEnd')){// ... this is the legitimate start of a pattern.
pParserState.Pattern=pParserState.PatternMatch;}}/**
	 * Append a character to the output buffer in the parser state.
	 * This output buffer is used when a potential match is being explored, or a match is being explored.
	 * @method appendOutputBuffer
	 * @param {string} pCharacter - The character to append
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */appendOutputBuffer(pCharacter,pParserState){pParserState.OutputBuffer+=pCharacter;}/**
	 * Flush the output buffer to the output and clear it.
	 * @method flushOutputBuffer
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */flushOutputBuffer(pParserState){pParserState.Output+=pParserState.OutputBuffer;pParserState.OutputBuffer='';}/**
	 * Check if the pattern has ended.  If it has, properly flush the buffer and start looking for new patterns.
	 * @method checkPatternEnd
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */checkPatternEnd(pParserState){if(pParserState.OutputBuffer.length>=pParserState.Pattern.PatternEnd.length+pParserState.Pattern.PatternStart.length&&pParserState.OutputBuffer.substr(-pParserState.Pattern.PatternEnd.length)===pParserState.Pattern.PatternEnd){// ... this is the end of a pattern, cut off the end tag and parse it.
// Trim the start and end tags off the output buffer now
pParserState.OutputBuffer=pParserState.Pattern.Parse(pParserState.OutputBuffer.substr(pParserState.Pattern.PatternStart.length,pParserState.OutputBuffer.length-(pParserState.Pattern.PatternStart.length+pParserState.Pattern.PatternEnd.length)));// Flush the output buffer.
this.flushOutputBuffer(pParserState);// End pattern mode
pParserState.Pattern=false;pParserState.PatternMatch=false;}}/**
	 * Parse a character in the buffer.
	 * @method parseCharacter
	 * @param {string} pCharacter - The character to append
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */parseCharacter(pCharacter,pParserState){// (1) If we aren't in a pattern match, and we aren't potentially matching, and this may be the start of a new pattern....
if(!pParserState.PatternMatch&&pParserState.ParseTree.hasOwnProperty(pCharacter)){// ... assign the node as the matched node.
this.assignNode(pParserState.ParseTree[pCharacter],pParserState);this.appendOutputBuffer(pCharacter,pParserState);}// (2) If we are in a pattern match (actively seeing if this is part of a new pattern token)
else if(pParserState.PatternMatch){// If the pattern has a subpattern with this key
if(pParserState.PatternMatch.hasOwnProperty(pCharacter)){// Continue matching patterns.
this.assignNode(pParserState.PatternMatch[pCharacter],pParserState);}this.appendOutputBuffer(pCharacter,pParserState);if(pParserState.Pattern){// ... Check if this is the end of the pattern (if we are matching a valid pattern)...
this.checkPatternEnd(pParserState);}}// (3) If we aren't in a pattern match or pattern, and this isn't the start of a new pattern (RAW mode)....
else{pParserState.Output+=pCharacter;}}/**
	 * Parse a string for matches, and process any template segments that occur.
	 * @method parseString
	 * @param {string} pString - The string to parse.
	 * @param {Object} pParseTree - The parse tree to begin parsing from (usually root)
	 */parseString(pString,pParseTree){let tmpParserState=this.newParserState(pParseTree);for(var i=0;i<pString.length;i++){// TODO: This is not fast.
this.parseCharacter(pString[i],tmpParserState);}this.flushOutputBuffer(tmpParserState);return tmpParserState.Output;}}module.exports=StringParser;},{}],46:[function(require,module,exports){/**
* Word Tree
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Create a tree (directed graph) of Javascript objects, one character per object.
*/class WordTree{/**
	 * WordTree Constructor
	 */constructor(){this.ParseTree={};}/** 
	 * Add a child character to a Parse Tree node
	 * @method addChild
	 * @param {Object} pTree - A parse tree to push the characters into
	 * @param {string} pPattern - The string to add to the tree
	 * @param {number} pIndex - The index of the character in the pattern
	 * @returns {Object} The resulting leaf node that was added (or found)
	 * @private
	 */addChild(pTree,pPattern,pIndex){if(!pTree.hasOwnProperty(pPattern[pIndex]))pTree[pPattern[pIndex]]={};return pTree[pPattern[pIndex]];}/** Add a Pattern to the Parse Tree
	 * @method addPattern
	 * @param {Object} pPatternStart - The starting string for the pattern (e.g. "${")
	 * @param {string} pPatternEnd - The ending string for the pattern (e.g. "}")
	 * @param {number} pParser - The function to parse if this is the matched pattern, once the Pattern End is met.  If this is a string, a simple replacement occurs.
	 * @return {bool} True if adding the pattern was successful
	 */addPattern(pPatternStart,pPatternEnd,pParser){if(pPatternStart.length<1)return false;if(typeof pPatternEnd==='string'&&pPatternEnd.length<1)return false;let tmpLeaf=this.ParseTree;// Add the tree of leaves iteratively
for(var i=0;i<pPatternStart.length;i++)tmpLeaf=this.addChild(tmpLeaf,pPatternStart,i);tmpLeaf.PatternStart=pPatternStart;tmpLeaf.PatternEnd=typeof pPatternEnd==='string'&&pPatternEnd.length>0?pPatternEnd:pPatternStart;tmpLeaf.Parse=typeof pParser==='function'?pParser:typeof pParser==='string'?()=>{return pParser;}:pData=>{return pData;};return true;}}module.exports=WordTree;},{}],47:[function(require,module,exports){/**
* @license MIT
* @author <steven@velozo.com>
*/ /**
* Manyfest browser shim loader
*/ // Load the manyfest module into the browser global automatically.
var libManyfest=require('./Manyfest.js');if(typeof window==='object')window.Manyfest=libManyfest;module.exports=libManyfest;},{"./Manyfest.js":57}],48:[function(require,module,exports){arguments[4][34][0].apply(exports,arguments);},{"dup":34}],49:[function(require,module,exports){arguments[4][35][0].apply(exports,arguments);},{"./Manyfest-LogToConsole.js":50,"dup":35}],50:[function(require,module,exports){arguments[4][36][0].apply(exports,arguments);},{"dup":36}],51:[function(require,module,exports){arguments[4][37][0].apply(exports,arguments);},{"./Manyfest-LogToConsole.js":50,"dup":37}],52:[function(require,module,exports){arguments[4][38][0].apply(exports,arguments);},{"./Manyfest-CleanWrapCharacters.js":48,"./Manyfest-LogToConsole.js":50,"dup":38,"elucidator":4,"precedent":44}],53:[function(require,module,exports){arguments[4][39][0].apply(exports,arguments);},{"./Manyfest-CleanWrapCharacters.js":48,"./Manyfest-LogToConsole.js":50,"dup":39,"elucidator":4,"precedent":44}],54:[function(require,module,exports){arguments[4][40][0].apply(exports,arguments);},{"./Manyfest-CleanWrapCharacters.js":48,"./Manyfest-LogToConsole.js":50,"dup":40,"precedent":44}],55:[function(require,module,exports){arguments[4][41][0].apply(exports,arguments);},{"./Manyfest-LogToConsole.js":50,"dup":41}],56:[function(require,module,exports){arguments[4][42][0].apply(exports,arguments);},{"./Manyfest-LogToConsole.js":50,"dup":42}],57:[function(require,module,exports){arguments[4][43][0].apply(exports,arguments);},{"./Manyfest-HashTranslation.js":49,"./Manyfest-LogToConsole.js":50,"./Manyfest-ObjectAddress-CheckAddressExists.js":51,"./Manyfest-ObjectAddress-DeleteValue.js":52,"./Manyfest-ObjectAddress-GetValue.js":53,"./Manyfest-ObjectAddress-SetValue.js":54,"./Manyfest-ObjectAddressGeneration.js":55,"./Manyfest-SchemaManipulation.js":56,"dup":43,"elucidator":4,"precedent":44}]},{},[47])(47);});