(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Manyfest = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
;(function (globalScope) {
  'use strict';


  /*!
   *  decimal.js v10.4.2
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2022 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   */


  // -----------------------------------  EDITABLE DEFAULTS  ------------------------------------ //


    // The maximum exponent magnitude.
    // The limit on the value of `toExpNeg`, `toExpPos`, `minE` and `maxE`.
  var EXP_LIMIT = 9e15,                      // 0 to 9e15

    // The limit on the value of `precision`, and on the value of the first argument to
    // `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`.
    MAX_DIGITS = 1e9,                        // 0 to 1e9

    // Base conversion alphabet.
    NUMERALS = '0123456789abcdef',

    // The natural logarithm of 10 (1025 digits).
    LN10 = '2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058',

    // Pi (1025 digits).
    PI = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789',


    // The initial configuration properties of the Decimal constructor.
    DEFAULTS = {

      // These values must be integers within the stated ranges (inclusive).
      // Most of these values can be changed at run-time using the `Decimal.config` method.

      // The maximum number of significant digits of the result of a calculation or base conversion.
      // E.g. `Decimal.config({ precision: 20 });`
      precision: 20,                         // 1 to MAX_DIGITS

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
      rounding: 4,                           // 0 to 8

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
      modulo: 1,                             // 0 to 9

      // The exponent value at and beneath which `toString` returns exponential notation.
      // JavaScript numbers: -7
      toExpNeg: -7,                          // 0 to -EXP_LIMIT

      // The exponent value at and above which `toString` returns exponential notation.
      // JavaScript numbers: 21
      toExpPos:  21,                         // 0 to EXP_LIMIT

      // The minimum exponent value, beneath which underflow to zero occurs.
      // JavaScript numbers: -324  (5e-324)
      minE: -EXP_LIMIT,                      // -1 to -EXP_LIMIT

      // The maximum exponent value, above which overflow to Infinity occurs.
      // JavaScript numbers: 308  (1.7976931348623157e+308)
      maxE: EXP_LIMIT,                       // 1 to EXP_LIMIT

      // Whether to use cryptographically-secure random number generation, if available.
      crypto: false                          // true/false
    },


  // ----------------------------------- END OF EDITABLE DEFAULTS ------------------------------- //


    Decimal, inexact, noConflict, quadrant,
    external = true,

    decimalError = '[DecimalError] ',
    invalidArgument = decimalError + 'Invalid argument: ',
    precisionLimitExceeded = decimalError + 'Precision limit exceeded',
    cryptoUnavailable = decimalError + 'crypto unavailable',
    tag = '[object Decimal]',

    mathfloor = Math.floor,
    mathpow = Math.pow,

    isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,
    isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,
    isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,
    isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,

    BASE = 1e7,
    LOG_BASE = 7,
    MAX_SAFE_INTEGER = 9007199254740991,

    LN10_PRECISION = LN10.length - 1,
    PI_PRECISION = PI.length - 1,

    // Decimal.prototype object
    P = { toStringTag: tag };


  // Decimal prototype methods


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
   */


  /*
   * Return a new Decimal whose value is the absolute value of this Decimal.
   *
   */
  P.absoluteValue = P.abs = function () {
    var x = new this.constructor(this);
    if (x.s < 0) x.s = 1;
    return finalise(x);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of positive Infinity.
   *
   */
  P.ceil = function () {
    return finalise(new this.constructor(this), this.e + 1, 2);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal clamped to the range
   * delineated by `min` and `max`.
   *
   * min {number|string|Decimal}
   * max {number|string|Decimal}
   *
   */
  P.clampedTo = P.clamp = function (min, max) {
    var k,
      x = this,
      Ctor = x.constructor;
    min = new Ctor(min);
    max = new Ctor(max);
    if (!min.s || !max.s) return new Ctor(NaN);
    if (min.gt(max)) throw Error(invalidArgument + max);
    k = x.cmp(min);
    return k < 0 ? min : x.cmp(max) > 0 ? max : new Ctor(x);
  };


  /*
   * Return
   *   1    if the value of this Decimal is greater than the value of `y`,
   *  -1    if the value of this Decimal is less than the value of `y`,
   *   0    if they have the same value,
   *   NaN  if the value of either Decimal is NaN.
   *
   */
  P.comparedTo = P.cmp = function (y) {
    var i, j, xdL, ydL,
      x = this,
      xd = x.d,
      yd = (y = new x.constructor(y)).d,
      xs = x.s,
      ys = y.s;

    // Either NaN or ±Infinity?
    if (!xd || !yd) {
      return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
    }

    // Either zero?
    if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;

    // Signs differ?
    if (xs !== ys) return xs;

    // Compare exponents.
    if (x.e !== y.e) return x.e > y.e ^ xs < 0 ? 1 : -1;

    xdL = xd.length;
    ydL = yd.length;

    // Compare digit by digit.
    for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
      if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
    }

    // Compare lengths.
    return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
  };


  /*
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
   */
  P.cosine = P.cos = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.d) return new Ctor(NaN);

    // cos(0) = cos(-0) = 1
    if (!x.d[0]) return new Ctor(1);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;

    x = cosine(Ctor, toLessThanHalfPi(Ctor, x));

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
  };


  /*
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
   */
  P.cubeRoot = P.cbrt = function () {
    var e, m, n, r, rep, s, sd, t, t3, t3plusx,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);
    external = false;

    // Initial estimate.
    s = x.s * mathpow(x.s * x, 1 / 3);

     // Math.cbrt underflow/overflow?
     // Pass x to Math.pow as integer, then adjust the exponent of the result.
    if (!s || Math.abs(s) == 1 / 0) {
      n = digitsToString(x.d);
      e = x.e;

      // Adjust n exponent so it is a multiple of 3 away from x exponent.
      if (s = (e - n.length + 1) % 3) n += (s == 1 || s == -2 ? '0' : '00');
      s = mathpow(n, 1 / 3);

      // Rarely, e may be one less than the result exponent value.
      e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));

      if (s == 1 / 0) {
        n = '5e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new Ctor(n);
      r.s = x.s;
    } else {
      r = new Ctor(s.toString());
    }

    sd = (e = Ctor.precision) + 3;

    // Halley's method.
    // TODO? Compare Newton's method.
    for (;;) {
      t = r;
      t3 = t.times(t).times(t);
      t3plusx = t3.plus(x);
      r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);

      // TODO? Replace with for-loop and checkRoundingDigits.
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);

        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or 4999
        // , i.e. approaching a rounding boundary, continue the iteration.
        if (n == '9999' || !rep && n == '4999') {

          // On the first iteration only, check to see if rounding up gives the exact result as the
          // nines may infinitely repeat.
          if (!rep) {
            finalise(t, e + 1, 0);

            if (t.times(t).times(t).eq(x)) {
              r = t;
              break;
            }
          }

          sd += 4;
          rep = 1;
        } else {

          // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
          // If not, then there are further digits and m will be truthy.
          if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

            // Truncate to the first rounding digit.
            finalise(r, e + 1, 1);
            m = !r.times(r).times(r).eq(x);
          }

          break;
        }
      }
    }

    external = true;

    return finalise(r, e, Ctor.rounding, m);
  };


  /*
   * Return the number of decimal places of the value of this Decimal.
   *
   */
  P.decimalPlaces = P.dp = function () {
    var w,
      d = this.d,
      n = NaN;

    if (d) {
      w = d.length - 1;
      n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;

      // Subtract the number of trailing zeros of the last word.
      w = d[w];
      if (w) for (; w % 10 == 0; w /= 10) n--;
      if (n < 0) n = 0;
    }

    return n;
  };


  /*
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
   */
  P.dividedBy = P.div = function (y) {
    return divide(this, new this.constructor(y));
  };


  /*
   * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
   * by the value of `y`, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.dividedToIntegerBy = P.divToInt = function (y) {
    var x = this,
      Ctor = x.constructor;
    return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
  };


  /*
   * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
   *
   */
  P.equals = P.eq = function (y) {
    return this.cmp(y) === 0;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of negative Infinity.
   *
   */
  P.floor = function () {
    return finalise(new this.constructor(this), this.e + 1, 3);
  };


  /*
   * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
   * false.
   *
   */
  P.greaterThan = P.gt = function (y) {
    return this.cmp(y) > 0;
  };


  /*
   * Return true if the value of this Decimal is greater than or equal to the value of `y`,
   * otherwise return false.
   *
   */
  P.greaterThanOrEqualTo = P.gte = function (y) {
    var k = this.cmp(y);
    return k == 1 || k === 0;
  };


  /*
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
   */
  P.hyperbolicCosine = P.cosh = function () {
    var k, n, pr, rm, len,
      x = this,
      Ctor = x.constructor,
      one = new Ctor(1);

    if (!x.isFinite()) return new Ctor(x.s ? 1 / 0 : NaN);
    if (x.isZero()) return one;

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;

    // Argument reduction: cos(4x) = 1 - 8cos^2(x) + 8cos^4(x) + 1
    // i.e. cos(x) = 1 - cos^2(x/4)(8 - 8cos^2(x/4))

    // Estimate the optimum number of times to use the argument reduction.
    // TODO? Estimation reused from cosine() and may not be optimal here.
    if (len < 32) {
      k = Math.ceil(len / 3);
      n = (1 / tinyPow(4, k)).toString();
    } else {
      k = 16;
      n = '2.3283064365386962890625e-10';
    }

    x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);

    // Reverse argument reduction
    var cosh2_x,
      i = k,
      d8 = new Ctor(8);
    for (; i--;) {
      cosh2_x = x.times(x);
      x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
    }

    return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
  };


  /*
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
   */
  P.hyperbolicSine = P.sinh = function () {
    var k, pr, rm, len,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;

    if (len < 3) {
      x = taylorSeries(Ctor, 2, x, x, true);
    } else {

      // Alternative argument reduction: sinh(3x) = sinh(x)(3 + 4sinh^2(x))
      // i.e. sinh(x) = sinh(x/3)(3 + 4sinh^2(x/3))
      // 3 multiplications and 1 addition

      // Argument reduction: sinh(5x) = sinh(x)(5 + sinh^2(x)(20 + 16sinh^2(x)))
      // i.e. sinh(x) = sinh(x/5)(5 + sinh^2(x/5)(20 + 16sinh^2(x/5)))
      // 4 multiplications and 2 additions

      // Estimate the optimum number of times to use the argument reduction.
      k = 1.4 * Math.sqrt(len);
      k = k > 16 ? 16 : k | 0;

      x = x.times(1 / tinyPow(5, k));
      x = taylorSeries(Ctor, 2, x, x, true);

      // Reverse argument reduction
      var sinh2_x,
        d5 = new Ctor(5),
        d16 = new Ctor(16),
        d20 = new Ctor(20);
      for (; k--;) {
        sinh2_x = x.times(x);
        x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
      }
    }

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(x, pr, rm, true);
  };


  /*
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
   */
  P.hyperbolicTangent = P.tanh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(x.s);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 7;
    Ctor.rounding = 1;

    return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
  };


  /*
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
   */
  P.inverseCosine = P.acos = function () {
    var halfPi,
      x = this,
      Ctor = x.constructor,
      k = x.abs().cmp(1),
      pr = Ctor.precision,
      rm = Ctor.rounding;

    if (k !== -1) {
      return k === 0
        // |x| is 1
        ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0)
        // |x| > 1 or x is NaN
        : new Ctor(NaN);
    }

    if (x.isZero()) return getPi(Ctor, pr + 4, rm).times(0.5);

    // TODO? Special case acos(0.5) = pi/3 and acos(-0.5) = 2*pi/3

    Ctor.precision = pr + 6;
    Ctor.rounding = 1;

    x = x.asin();
    halfPi = getPi(Ctor, pr + 4, rm).times(0.5);

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return halfPi.minus(x);
  };


  /*
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
   */
  P.inverseHyperbolicCosine = P.acosh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (x.lte(1)) return new Ctor(x.eq(1) ? 0 : NaN);
    if (!x.isFinite()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
    Ctor.rounding = 1;
    external = false;

    x = x.times(x).minus(1).sqrt().plus(x);

    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.ln();
  };


  /*
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
   */
  P.inverseHyperbolicSine = P.asinh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
    Ctor.rounding = 1;
    external = false;

    x = x.times(x).plus(1).sqrt().plus(x);

    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.ln();
  };


  /*
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
   */
  P.inverseHyperbolicTangent = P.atanh = function () {
    var pr, rm, wpr, xsd,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.e >= 0) return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    xsd = x.sd();

    if (Math.max(xsd, pr) < 2 * -x.e - 1) return finalise(new Ctor(x), pr, rm, true);

    Ctor.precision = wpr = xsd - x.e;

    x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);

    Ctor.precision = pr + 4;
    Ctor.rounding = 1;

    x = x.ln();

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.times(0.5);
  };


  /*
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
   */
  P.inverseSine = P.asin = function () {
    var halfPi, k,
      pr, rm,
      x = this,
      Ctor = x.constructor;

    if (x.isZero()) return new Ctor(x);

    k = x.abs().cmp(1);
    pr = Ctor.precision;
    rm = Ctor.rounding;

    if (k !== -1) {

      // |x| is 1
      if (k === 0) {
        halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
        halfPi.s = x.s;
        return halfPi;
      }

      // |x| > 1 or x is NaN
      return new Ctor(NaN);
    }

    // TODO? Special case asin(1/2) = pi/6 and asin(-1/2) = -pi/6

    Ctor.precision = pr + 6;
    Ctor.rounding = 1;

    x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.times(2);
  };


  /*
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
   */
  P.inverseTangent = P.atan = function () {
    var i, j, k, n, px, t, r, wpr, x2,
      x = this,
      Ctor = x.constructor,
      pr = Ctor.precision,
      rm = Ctor.rounding;

    if (!x.isFinite()) {
      if (!x.s) return new Ctor(NaN);
      if (pr + 4 <= PI_PRECISION) {
        r = getPi(Ctor, pr + 4, rm).times(0.5);
        r.s = x.s;
        return r;
      }
    } else if (x.isZero()) {
      return new Ctor(x);
    } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
      r = getPi(Ctor, pr + 4, rm).times(0.25);
      r.s = x.s;
      return r;
    }

    Ctor.precision = wpr = pr + 10;
    Ctor.rounding = 1;

    // TODO? if (x >= 1 && pr <= PI_PRECISION) atan(x) = halfPi * x.s - atan(1 / x);

    // Argument reduction
    // Ensure |x| < 0.42
    // atan(x) = 2 * atan(x / (1 + sqrt(1 + x^2)))

    k = Math.min(28, wpr / LOG_BASE + 2 | 0);

    for (i = k; i; --i) x = x.div(x.times(x).plus(1).sqrt().plus(1));

    external = false;

    j = Math.ceil(wpr / LOG_BASE);
    n = 1;
    x2 = x.times(x);
    r = new Ctor(x);
    px = x;

    // atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
    for (; i !== -1;) {
      px = px.times(x2);
      t = r.minus(px.div(n += 2));

      px = px.times(x2);
      r = t.plus(px.div(n += 2));

      if (r.d[j] !== void 0) for (i = j; r.d[i] === t.d[i] && i--;);
    }

    if (k) r = r.times(2 << (k - 1));

    external = true;

    return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
  };


  /*
   * Return true if the value of this Decimal is a finite number, otherwise return false.
   *
   */
  P.isFinite = function () {
    return !!this.d;
  };


  /*
   * Return true if the value of this Decimal is an integer, otherwise return false.
   *
   */
  P.isInteger = P.isInt = function () {
    return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
  };


  /*
   * Return true if the value of this Decimal is NaN, otherwise return false.
   *
   */
  P.isNaN = function () {
    return !this.s;
  };


  /*
   * Return true if the value of this Decimal is negative, otherwise return false.
   *
   */
  P.isNegative = P.isNeg = function () {
    return this.s < 0;
  };


  /*
   * Return true if the value of this Decimal is positive, otherwise return false.
   *
   */
  P.isPositive = P.isPos = function () {
    return this.s > 0;
  };


  /*
   * Return true if the value of this Decimal is 0 or -0, otherwise return false.
   *
   */
  P.isZero = function () {
    return !!this.d && this.d[0] === 0;
  };


  /*
   * Return true if the value of this Decimal is less than `y`, otherwise return false.
   *
   */
  P.lessThan = P.lt = function (y) {
    return this.cmp(y) < 0;
  };


  /*
   * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
   *
   */
  P.lessThanOrEqualTo = P.lte = function (y) {
    return this.cmp(y) < 1;
  };


  /*
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
   */
  P.logarithm = P.log = function (base) {
    var isBase10, d, denominator, k, inf, num, sd, r,
      arg = this,
      Ctor = arg.constructor,
      pr = Ctor.precision,
      rm = Ctor.rounding,
      guard = 5;

    // Default base is 10.
    if (base == null) {
      base = new Ctor(10);
      isBase10 = true;
    } else {
      base = new Ctor(base);
      d = base.d;

      // Return NaN if base is negative, or non-finite, or is 0 or 1.
      if (base.s < 0 || !d || !d[0] || base.eq(1)) return new Ctor(NaN);

      isBase10 = base.eq(10);
    }

    d = arg.d;

    // Is arg negative, non-finite, 0 or 1?
    if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
      return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
    }

    // The result will have a non-terminating decimal expansion if base is 10 and arg is not an
    // integer power of 10.
    if (isBase10) {
      if (d.length > 1) {
        inf = true;
      } else {
        for (k = d[0]; k % 10 === 0;) k /= 10;
        inf = k !== 1;
      }
    }

    external = false;
    sd = pr + guard;
    num = naturalLogarithm(arg, sd);
    denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);

    // The result will have 5 rounding digits.
    r = divide(num, denominator, sd, 1);

    // If at a rounding boundary, i.e. the result's rounding digits are [49]9999 or [50]0000,
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
    if (checkRoundingDigits(r.d, k = pr, rm)) {

      do {
        sd += 10;
        num = naturalLogarithm(arg, sd);
        denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
        r = divide(num, denominator, sd, 1);

        if (!inf) {

          // Check for 14 nines from the 2nd rounding digit, as the first may be 4.
          if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
            r = finalise(r, pr + 1, 0);
          }

          break;
        }
      } while (checkRoundingDigits(r.d, k += 10, rm));
    }

    external = true;

    return finalise(r, pr, rm);
  };


  /*
   * Return a new Decimal whose value is the maximum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.max = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'lt');
  };
   */


  /*
   * Return a new Decimal whose value is the minimum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.min = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'gt');
  };
   */


  /*
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
   */
  P.minus = P.sub = function (y) {
    var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // If either is not finite...
    if (!x.d || !y.d) {

      // Return NaN if either is NaN.
      if (!x.s || !y.s) y = new Ctor(NaN);

      // Return y negated if x is finite and y is ±Infinity.
      else if (x.d) y.s = -y.s;

      // Return x if y is finite and x is ±Infinity.
      // Return x if both are ±Infinity with different signs.
      // Return NaN if both are ±Infinity with the same sign.
      else y = new Ctor(y.d || x.s !== y.s ? x : NaN);

      return y;
    }

    // If signs differ...
    if (x.s != y.s) {
      y.s = -y.s;
      return x.plus(y);
    }

    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;

    // If either is zero...
    if (!xd[0] || !yd[0]) {

      // Return y negated if x is zero and y is non-zero.
      if (yd[0]) y.s = -y.s;

      // Return x if y is zero and x is non-zero.
      else if (xd[0]) y = new Ctor(x);

      // Return zero if both are zero.
      // From IEEE 754 (2008) 6.3: 0 - 0 = -0 - -0 = -0 when rounding to -Infinity.
      else return new Ctor(rm === 3 ? -0 : 0);

      return external ? finalise(y, pr, rm) : y;
    }

    // x and y are finite, non-zero numbers with the same sign.

    // Calculate base 1e7 exponents.
    e = mathfloor(y.e / LOG_BASE);
    xe = mathfloor(x.e / LOG_BASE);

    xd = xd.slice();
    k = xe - e;

    // If base 1e7 exponents differ...
    if (k) {
      xLTy = k < 0;

      if (xLTy) {
        d = xd;
        k = -k;
        len = yd.length;
      } else {
        d = yd;
        e = xe;
        len = xd.length;
      }

      // Numbers with massively different exponents would result in a very high number of
      // zeros needing to be prepended, but this can be avoided while still ensuring correct
      // rounding by limiting the number of zeros to `Math.ceil(pr / LOG_BASE) + 2`.
      i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;

      if (k > i) {
        k = i;
        d.length = 1;
      }

      // Prepend zeros to equalise exponents.
      d.reverse();
      for (i = k; i--;) d.push(0);
      d.reverse();

    // Base 1e7 exponents equal.
    } else {

      // Check digits to determine which is the bigger number.

      i = xd.length;
      len = yd.length;
      xLTy = i < len;
      if (xLTy) len = i;

      for (i = 0; i < len; i++) {
        if (xd[i] != yd[i]) {
          xLTy = xd[i] < yd[i];
          break;
        }
      }

      k = 0;
    }

    if (xLTy) {
      d = xd;
      xd = yd;
      yd = d;
      y.s = -y.s;
    }

    len = xd.length;

    // Append zeros to `xd` if shorter.
    // Don't add zeros to `yd` if shorter as subtraction only needs to start at `yd` length.
    for (i = yd.length - len; i > 0; --i) xd[len++] = 0;

    // Subtract yd from xd.
    for (i = yd.length; i > k;) {

      if (xd[--i] < yd[i]) {
        for (j = i; j && xd[--j] === 0;) xd[j] = BASE - 1;
        --xd[j];
        xd[i] += BASE;
      }

      xd[i] -= yd[i];
    }

    // Remove trailing zeros.
    for (; xd[--len] === 0;) xd.pop();

    // Remove leading zeros and adjust exponent accordingly.
    for (; xd[0] === 0; xd.shift()) --e;

    // Zero?
    if (!xd[0]) return new Ctor(rm === 3 ? -0 : 0);

    y.d = xd;
    y.e = getBase10Exponent(xd, e);

    return external ? finalise(y, pr, rm) : y;
  };


  /*
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
   */
  P.modulo = P.mod = function (y) {
    var q,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // Return NaN if x is ±Infinity or NaN, or y is NaN or ±0.
    if (!x.d || !y.s || y.d && !y.d[0]) return new Ctor(NaN);

    // Return x if y is ±Infinity or x is ±0.
    if (!y.d || x.d && !x.d[0]) {
      return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
    }

    // Prevent rounding of intermediate calculations.
    external = false;

    if (Ctor.modulo == 9) {

      // Euclidian division: q = sign(y) * floor(x / abs(y))
      // result = x - q * y    where  0 <= result < abs(y)
      q = divide(x, y.abs(), 0, 3, 1);
      q.s *= y.s;
    } else {
      q = divide(x, y, 0, Ctor.modulo, 1);
    }

    q = q.times(y);

    external = true;

    return x.minus(q);
  };


  /*
   * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
   * i.e. the base e raised to the power the value of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.naturalExponential = P.exp = function () {
    return naturalExponential(this);
  };


  /*
   * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.naturalLogarithm = P.ln = function () {
    return naturalLogarithm(this);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
   * -1.
   *
   */
  P.negated = P.neg = function () {
    var x = new this.constructor(this);
    x.s = -x.s;
    return finalise(x);
  };


  /*
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
   */
  P.plus = P.add = function (y) {
    var carry, d, e, i, k, len, pr, rm, xd, yd,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // If either is not finite...
    if (!x.d || !y.d) {

      // Return NaN if either is NaN.
      if (!x.s || !y.s) y = new Ctor(NaN);

      // Return x if y is finite and x is ±Infinity.
      // Return x if both are ±Infinity with the same sign.
      // Return NaN if both are ±Infinity with different signs.
      // Return y if x is finite and y is ±Infinity.
      else if (!x.d) y = new Ctor(y.d || x.s === y.s ? x : NaN);

      return y;
    }

     // If signs differ...
    if (x.s != y.s) {
      y.s = -y.s;
      return x.minus(y);
    }

    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;

    // If either is zero...
    if (!xd[0] || !yd[0]) {

      // Return x if y is zero.
      // Return y if y is non-zero.
      if (!yd[0]) y = new Ctor(x);

      return external ? finalise(y, pr, rm) : y;
    }

    // x and y are finite, non-zero numbers with the same sign.

    // Calculate base 1e7 exponents.
    k = mathfloor(x.e / LOG_BASE);
    e = mathfloor(y.e / LOG_BASE);

    xd = xd.slice();
    i = k - e;

    // If base 1e7 exponents differ...
    if (i) {

      if (i < 0) {
        d = xd;
        i = -i;
        len = yd.length;
      } else {
        d = yd;
        e = k;
        len = xd.length;
      }

      // Limit number of zeros prepended to max(ceil(pr / LOG_BASE), len) + 1.
      k = Math.ceil(pr / LOG_BASE);
      len = k > len ? k + 1 : len + 1;

      if (i > len) {
        i = len;
        d.length = 1;
      }

      // Prepend zeros to equalise exponents. Note: Faster to use reverse then do unshifts.
      d.reverse();
      for (; i--;) d.push(0);
      d.reverse();
    }

    len = xd.length;
    i = yd.length;

    // If yd is longer than xd, swap xd and yd so xd points to the longer array.
    if (len - i < 0) {
      i = len;
      d = yd;
      yd = xd;
      xd = d;
    }

    // Only start adding at yd.length - 1 as the further digits of xd can be left as they are.
    for (carry = 0; i;) {
      carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
      xd[i] %= BASE;
    }

    if (carry) {
      xd.unshift(carry);
      ++e;
    }

    // Remove trailing zeros.
    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    for (len = xd.length; xd[--len] == 0;) xd.pop();

    y.d = xd;
    y.e = getBase10Exponent(xd, e);

    return external ? finalise(y, pr, rm) : y;
  };


  /*
   * Return the number of significant digits of the value of this Decimal.
   *
   * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
   *
   */
  P.precision = P.sd = function (z) {
    var k,
      x = this;

    if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);

    if (x.d) {
      k = getPrecision(x.d);
      if (z && x.e + 1 > k) k = x.e + 1;
    } else {
      k = NaN;
    }

    return k;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
   * rounding mode `rounding`.
   *
   */
  P.round = function () {
    var x = this,
      Ctor = x.constructor;

    return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
  };


  /*
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
   */
  P.sine = P.sin = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;

    x = sine(Ctor, toLessThanHalfPi(Ctor, x));

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
  };


  /*
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
   */
  P.squareRoot = P.sqrt = function () {
    var m, n, sd, r, rep, t,
      x = this,
      d = x.d,
      e = x.e,
      s = x.s,
      Ctor = x.constructor;

    // Negative/NaN/Infinity/zero?
    if (s !== 1 || !d || !d[0]) {
      return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
    }

    external = false;

    // Initial estimate.
    s = Math.sqrt(+x);

    // Math.sqrt underflow/overflow?
    // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
    if (s == 0 || s == 1 / 0) {
      n = digitsToString(d);

      if ((n.length + e) % 2 == 0) n += '0';
      s = Math.sqrt(n);
      e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);

      if (s == 1 / 0) {
        n = '5e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new Ctor(n);
    } else {
      r = new Ctor(s.toString());
    }

    sd = (e = Ctor.precision) + 3;

    // Newton-Raphson iteration.
    for (;;) {
      t = r;
      r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);

      // TODO? Replace with for-loop and checkRoundingDigits.
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);

        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or
        // 4999, i.e. approaching a rounding boundary, continue the iteration.
        if (n == '9999' || !rep && n == '4999') {

          // On the first iteration only, check to see if rounding up gives the exact result as the
          // nines may infinitely repeat.
          if (!rep) {
            finalise(t, e + 1, 0);

            if (t.times(t).eq(x)) {
              r = t;
              break;
            }
          }

          sd += 4;
          rep = 1;
        } else {

          // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
          // If not, then there are further digits and m will be truthy.
          if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

            // Truncate to the first rounding digit.
            finalise(r, e + 1, 1);
            m = !r.times(r).eq(x);
          }

          break;
        }
      }
    }

    external = true;

    return finalise(r, e, Ctor.rounding, m);
  };


  /*
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
   */
  P.tangent = P.tan = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 10;
    Ctor.rounding = 1;

    x = x.sin();
    x.s = 1;
    x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
  };


  /*
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
   */
  P.times = P.mul = function (y) {
    var carry, e, i, k, r, rL, t, xdL, ydL,
      x = this,
      Ctor = x.constructor,
      xd = x.d,
      yd = (y = new Ctor(y)).d;

    y.s *= x.s;

     // If either is NaN, ±Infinity or ±0...
    if (!xd || !xd[0] || !yd || !yd[0]) {

      return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd

        // Return NaN if either is NaN.
        // Return NaN if x is ±0 and y is ±Infinity, or y is ±0 and x is ±Infinity.
        ? NaN

        // Return ±Infinity if either is ±Infinity.
        // Return ±0 if either is ±0.
        : !xd || !yd ? y.s / 0 : y.s * 0);
    }

    e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
    xdL = xd.length;
    ydL = yd.length;

    // Ensure xd points to the longer array.
    if (xdL < ydL) {
      r = xd;
      xd = yd;
      yd = r;
      rL = xdL;
      xdL = ydL;
      ydL = rL;
    }

    // Initialise the result array with zeros.
    r = [];
    rL = xdL + ydL;
    for (i = rL; i--;) r.push(0);

    // Multiply!
    for (i = ydL; --i >= 0;) {
      carry = 0;
      for (k = xdL + i; k > i;) {
        t = r[k] + yd[i] * xd[k - i - 1] + carry;
        r[k--] = t % BASE | 0;
        carry = t / BASE | 0;
      }

      r[k] = (r[k] + carry) % BASE | 0;
    }

    // Remove trailing zeros.
    for (; !r[--rL];) r.pop();

    if (carry) ++e;
    else r.shift();

    y.d = r;
    y.e = getBase10Exponent(r, e);

    return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
  };


  /*
   * Return a string representing the value of this Decimal in base 2, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toBinary = function (sd, rm) {
    return toStringBinary(this, 2, sd, rm);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
   * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
   *
   * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toDecimalPlaces = P.toDP = function (dp, rm) {
    var x = this,
      Ctor = x.constructor;

    x = new Ctor(x);
    if (dp === void 0) return x;

    checkInt32(dp, 0, MAX_DIGITS);

    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);

    return finalise(x, dp + x.e + 1, rm);
  };


  /*
   * Return a string representing the value of this Decimal in exponential notation rounded to
   * `dp` fixed decimal places using rounding mode `rounding`.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toExponential = function (dp, rm) {
    var str,
      x = this,
      Ctor = x.constructor;

    if (dp === void 0) {
      str = finiteToString(x, true);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      x = finalise(new Ctor(x), dp + 1, rm);
      str = finiteToString(x, true, dp + 1);
    }

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
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
   */
  P.toFixed = function (dp, rm) {
    var str, y,
      x = this,
      Ctor = x.constructor;

    if (dp === void 0) {
      str = finiteToString(x);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      y = finalise(new Ctor(x), dp + x.e + 1, rm);
      str = finiteToString(y, false, dp + y.e + 1);
    }

    // To determine whether to add the minus sign look at the value before it was rounded,
    // i.e. look at `x` rather than `y`.
    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return an array representing the value of this Decimal as a simple fraction with an integer
   * numerator and an integer denominator.
   *
   * The denominator will be a positive non-zero value less than or equal to the specified maximum
   * denominator. If a maximum denominator is not specified, the denominator will be the lowest
   * value necessary to represent the number exactly.
   *
   * [maxD] {number|string|Decimal} Maximum denominator. Integer >= 1 and < Infinity.
   *
   */
  P.toFraction = function (maxD) {
    var d, d0, d1, d2, e, k, n, n0, n1, pr, q, r,
      x = this,
      xd = x.d,
      Ctor = x.constructor;

    if (!xd) return new Ctor(x);

    n1 = d0 = new Ctor(1);
    d1 = n0 = new Ctor(0);

    d = new Ctor(d1);
    e = d.e = getPrecision(xd) - x.e - 1;
    k = e % LOG_BASE;
    d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);

    if (maxD == null) {

      // d is 10**e, the minimum max-denominator needed.
      maxD = e > 0 ? d : n1;
    } else {
      n = new Ctor(maxD);
      if (!n.isInt() || n.lt(n1)) throw Error(invalidArgument + n);
      maxD = n.gt(d) ? (e > 0 ? d : n1) : n;
    }

    external = false;
    n = new Ctor(digitsToString(xd));
    pr = Ctor.precision;
    Ctor.precision = e = xd.length * LOG_BASE * 2;

    for (;;)  {
      q = divide(n, d, 0, 1, 1);
      d2 = d0.plus(q.times(d1));
      if (d2.cmp(maxD) == 1) break;
      d0 = d1;
      d1 = d2;
      d2 = n1;
      n1 = n0.plus(q.times(d2));
      n0 = d2;
      d2 = d;
      d = n.minus(q.times(d2));
      n = d2;
    }

    d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
    n0 = n0.plus(d2.times(n1));
    d0 = d0.plus(d2.times(d1));
    n0.s = n1.s = x.s;

    // Determine which fraction is closer to x, n0/d0 or n1/d1?
    r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1
        ? [n1, d1] : [n0, d0];

    Ctor.precision = pr;
    external = true;

    return r;
  };


  /*
   * Return a string representing the value of this Decimal in base 16, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toHexadecimal = P.toHex = function (sd, rm) {
    return toStringBinary(this, 16, sd, rm);
  };


  /*
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
   */
  P.toNearest = function (y, rm) {
    var x = this,
      Ctor = x.constructor;

    x = new Ctor(x);

    if (y == null) {

      // If x is not finite, return x.
      if (!x.d) return x;

      y = new Ctor(1);
      rm = Ctor.rounding;
    } else {
      y = new Ctor(y);
      if (rm === void 0) {
        rm = Ctor.rounding;
      } else {
        checkInt32(rm, 0, 8);
      }

      // If x is not finite, return x if y is not NaN, else NaN.
      if (!x.d) return y.s ? x : y;

      // If y is not finite, return Infinity with the sign of x if y is Infinity, else NaN.
      if (!y.d) {
        if (y.s) y.s = x.s;
        return y;
      }
    }

    // If y is not zero, calculate the nearest multiple of y to x.
    if (y.d[0]) {
      external = false;
      x = divide(x, y, 0, rm, 1).times(y);
      external = true;
      finalise(x);

    // If y is zero, return zero with the sign of x.
    } else {
      y.s = x.s;
      x = y;
    }

    return x;
  };


  /*
   * Return the value of this Decimal converted to a number primitive.
   * Zero keeps its sign.
   *
   */
  P.toNumber = function () {
    return +this;
  };


  /*
   * Return a string representing the value of this Decimal in base 8, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toOctal = function (sd, rm) {
    return toStringBinary(this, 8, sd, rm);
  };


  /*
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
   */
  P.toPower = P.pow = function (y) {
    var e, k, pr, r, rm, s,
      x = this,
      Ctor = x.constructor,
      yn = +(y = new Ctor(y));

    // Either ±Infinity, NaN or ±0?
    if (!x.d || !y.d || !x.d[0] || !y.d[0]) return new Ctor(mathpow(+x, yn));

    x = new Ctor(x);

    if (x.eq(1)) return x;

    pr = Ctor.precision;
    rm = Ctor.rounding;

    if (y.eq(1)) return finalise(x, pr, rm);

    // y exponent
    e = mathfloor(y.e / LOG_BASE);

    // If y is a small integer use the 'exponentiation by squaring' algorithm.
    if (e >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
      r = intPow(Ctor, x, k, pr);
      return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
    }

    s = x.s;

    // if x is negative
    if (s < 0) {

      // if y is not an integer
      if (e < y.d.length - 1) return new Ctor(NaN);

      // Result is positive if x is negative and the last digit of integer y is even.
      if ((y.d[e] & 1) == 0) s = 1;

      // if x.eq(-1)
      if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
        x.s = s;
        return x;
      }
    }

    // Estimate result exponent.
    // x^y = 10^e,  where e = y * log10(x)
    // log10(x) = log10(x_significand) + x_exponent
    // log10(x_significand) = ln(x_significand) / ln(10)
    k = mathpow(+x, yn);
    e = k == 0 || !isFinite(k)
      ? mathfloor(yn * (Math.log('0.' + digitsToString(x.d)) / Math.LN10 + x.e + 1))
      : new Ctor(k + '').e;

    // Exponent estimate may be incorrect e.g. x: 0.999999999999999999, y: 2.29, e: 0, r.e: -1.

    // Overflow/underflow?
    if (e > Ctor.maxE + 1 || e < Ctor.minE - 1) return new Ctor(e > 0 ? s / 0 : 0);

    external = false;
    Ctor.rounding = x.s = 1;

    // Estimate the extra guard digits needed to ensure five correct rounding digits from
    // naturalLogarithm(x). Example of failure without these extra digits (precision: 10):
    // new Decimal(2.32456).pow('2087987436534566.46411')
    // should be 1.162377823e+764914905173815, but is 1.162355823e+764914905173815
    k = Math.min(12, (e + '').length);

    // r = x^y = exp(y*ln(x))
    r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);

    // r may be Infinity, e.g. (0.9999999999999999).pow(-1e+40)
    if (r.d) {

      // Truncate to the required precision plus five rounding digits.
      r = finalise(r, pr + 5, 1);

      // If the rounding digits are [49]9999 or [50]0000 increase the precision by 10 and recalculate
      // the result.
      if (checkRoundingDigits(r.d, pr, rm)) {
        e = pr + 10;

        // Truncate to the increased precision plus five rounding digits.
        r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);

        // Check for 14 nines from the 2nd rounding digit (the first rounding digit may be 4 or 9).
        if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
          r = finalise(r, pr + 1, 0);
        }
      }
    }

    r.s = s;
    external = true;
    Ctor.rounding = rm;

    return finalise(r, pr, rm);
  };


  /*
   * Return a string representing the value of this Decimal rounded to `sd` significant digits
   * using rounding mode `rounding`.
   *
   * Return exponential notation if `sd` is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toPrecision = function (sd, rm) {
    var str,
      x = this,
      Ctor = x.constructor;

    if (sd === void 0) {
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
    } else {
      checkInt32(sd, 1, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      x = finalise(new Ctor(x), sd, rm);
      str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
    }

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
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
   */
  P.toSignificantDigits = P.toSD = function (sd, rm) {
    var x = this,
      Ctor = x.constructor;

    if (sd === void 0) {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    } else {
      checkInt32(sd, 1, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    }

    return finalise(new Ctor(x), sd, rm);
  };


  /*
   * Return a string representing the value of this Decimal.
   *
   * Return exponential notation if this Decimal has a positive exponent equal to or greater than
   * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
   *
   */
  P.toString = function () {
    var x = this,
      Ctor = x.constructor,
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal truncated to a whole number.
   *
   */
  P.truncated = P.trunc = function () {
    return finalise(new this.constructor(this), this.e + 1, 1);
  };


  /*
   * Return a string representing the value of this Decimal.
   * Unlike `toString`, negative zero will include the minus sign.
   *
   */
  P.valueOf = P.toJSON = function () {
    var x = this,
      Ctor = x.constructor,
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

    return x.isNeg() ? '-' + str : str;
  };


  // Helper functions for Decimal.prototype (P) and/or Decimal methods, and their callers.


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
   */


  function digitsToString(d) {
    var i, k, ws,
      indexOfLastWord = d.length - 1,
      str = '',
      w = d[0];

    if (indexOfLastWord > 0) {
      str += w;
      for (i = 1; i < indexOfLastWord; i++) {
        ws = d[i] + '';
        k = LOG_BASE - ws.length;
        if (k) str += getZeroString(k);
        str += ws;
      }

      w = d[i];
      ws = w + '';
      k = LOG_BASE - ws.length;
      if (k) str += getZeroString(k);
    } else if (w === 0) {
      return '0';
    }

    // Remove trailing zeros of last w.
    for (; w % 10 === 0;) w /= 10;

    return str + w;
  }


  function checkInt32(i, min, max) {
    if (i !== ~~i || i < min || i > max) {
      throw Error(invalidArgument + i);
    }
  }


  /*
   * Check 5 rounding digits if `repeating` is null, 4 otherwise.
   * `repeating == null` if caller is `log` or `pow`,
   * `repeating != null` if caller is `naturalLogarithm` or `naturalExponential`.
   */
  function checkRoundingDigits(d, i, rm, repeating) {
    var di, k, r, rd;

    // Get the length of the first word of the array d.
    for (k = d[0]; k >= 10; k /= 10) --i;

    // Is the rounding digit in the first word of d?
    if (--i < 0) {
      i += LOG_BASE;
      di = 0;
    } else {
      di = Math.ceil((i + 1) / LOG_BASE);
      i %= LOG_BASE;
    }

    // i is the index (0 - 6) of the rounding digit.
    // E.g. if within the word 3487563 the first rounding digit is 5,
    // then i = 4, k = 1000, rd = 3487563 % 1000 = 563
    k = mathpow(10, LOG_BASE - i);
    rd = d[di] % k | 0;

    if (repeating == null) {
      if (i < 3) {
        if (i == 0) rd = rd / 100 | 0;
        else if (i == 1) rd = rd / 10 | 0;
        r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 50000 || rd == 0;
      } else {
        r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) &&
          (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 ||
            (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
      }
    } else {
      if (i < 4) {
        if (i == 0) rd = rd / 1000 | 0;
        else if (i == 1) rd = rd / 100 | 0;
        else if (i == 2) rd = rd / 10 | 0;
        r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
      } else {
        r = ((repeating || rm < 4) && rd + 1 == k ||
        (!repeating && rm > 3) && rd + 1 == k / 2) &&
          (d[di + 1] / k / 1000 | 0) == mathpow(10, i - 3) - 1;
      }
    }

    return r;
  }


  // Convert string of `baseIn` to an array of numbers of `baseOut`.
  // Eg. convertBase('255', 10, 16) returns [15, 15].
  // Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
  function convertBase(str, baseIn, baseOut) {
    var j,
      arr = [0],
      arrL,
      i = 0,
      strL = str.length;

    for (; i < strL;) {
      for (arrL = arr.length; arrL--;) arr[arrL] *= baseIn;
      arr[0] += NUMERALS.indexOf(str.charAt(i++));
      for (j = 0; j < arr.length; j++) {
        if (arr[j] > baseOut - 1) {
          if (arr[j + 1] === void 0) arr[j + 1] = 0;
          arr[j + 1] += arr[j] / baseOut | 0;
          arr[j] %= baseOut;
        }
      }
    }

    return arr.reverse();
  }


  /*
   * cos(x) = 1 - x^2/2! + x^4/4! - ...
   * |x| < pi/2
   *
   */
  function cosine(Ctor, x) {
    var k, len, y;

    if (x.isZero()) return x;

    // Argument reduction: cos(4x) = 8*(cos^4(x) - cos^2(x)) + 1
    // i.e. cos(x) = 8*(cos^4(x/4) - cos^2(x/4)) + 1

    // Estimate the optimum number of times to use the argument reduction.
    len = x.d.length;
    if (len < 32) {
      k = Math.ceil(len / 3);
      y = (1 / tinyPow(4, k)).toString();
    } else {
      k = 16;
      y = '2.3283064365386962890625e-10';
    }

    Ctor.precision += k;

    x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));

    // Reverse argument reduction
    for (var i = k; i--;) {
      var cos2x = x.times(x);
      x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
    }

    Ctor.precision -= k;

    return x;
  }


  /*
   * Perform division in the specified base.
   */
  var divide = (function () {

    // Assumes non-zero x and k, and hence non-zero result.
    function multiplyInteger(x, k, base) {
      var temp,
        carry = 0,
        i = x.length;

      for (x = x.slice(); i--;) {
        temp = x[i] * k + carry;
        x[i] = temp % base | 0;
        carry = temp / base | 0;
      }

      if (carry) x.unshift(carry);

      return x;
    }

    function compare(a, b, aL, bL) {
      var i, r;

      if (aL != bL) {
        r = aL > bL ? 1 : -1;
      } else {
        for (i = r = 0; i < aL; i++) {
          if (a[i] != b[i]) {
            r = a[i] > b[i] ? 1 : -1;
            break;
          }
        }
      }

      return r;
    }

    function subtract(a, b, aL, base) {
      var i = 0;

      // Subtract b from a.
      for (; aL--;) {
        a[aL] -= i;
        i = a[aL] < b[aL] ? 1 : 0;
        a[aL] = i * base + a[aL] - b[aL];
      }

      // Remove leading zeros.
      for (; !a[0] && a.length > 1;) a.shift();
    }

    return function (x, y, pr, rm, dp, base) {
      var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0,
        yL, yz,
        Ctor = x.constructor,
        sign = x.s == y.s ? 1 : -1,
        xd = x.d,
        yd = y.d;

      // Either NaN, Infinity or 0?
      if (!xd || !xd[0] || !yd || !yd[0]) {

        return new Ctor(// Return NaN if either NaN, or both Infinity or 0.
          !x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN :

          // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
          xd && xd[0] == 0 || !yd ? sign * 0 : sign / 0);
      }

      if (base) {
        logBase = 1;
        e = x.e - y.e;
      } else {
        base = BASE;
        logBase = LOG_BASE;
        e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
      }

      yL = yd.length;
      xL = xd.length;
      q = new Ctor(sign);
      qd = q.d = [];

      // Result exponent may be one less than e.
      // The digit array of a Decimal from toStringBinary may have trailing zeros.
      for (i = 0; yd[i] == (xd[i] || 0); i++);

      if (yd[i] > (xd[i] || 0)) e--;

      if (pr == null) {
        sd = pr = Ctor.precision;
        rm = Ctor.rounding;
      } else if (dp) {
        sd = pr + (x.e - y.e) + 1;
      } else {
        sd = pr;
      }

      if (sd < 0) {
        qd.push(1);
        more = true;
      } else {

        // Convert precision in number of base 10 digits to base 1e7 digits.
        sd = sd / logBase + 2 | 0;
        i = 0;

        // divisor < 1e7
        if (yL == 1) {
          k = 0;
          yd = yd[0];
          sd++;

          // k is the carry.
          for (; (i < xL || k) && sd--; i++) {
            t = k * base + (xd[i] || 0);
            qd[i] = t / yd | 0;
            k = t % yd | 0;
          }

          more = k || i < xL;

        // divisor >= 1e7
        } else {

          // Normalise xd and yd so highest order digit of yd is >= base/2
          k = base / (yd[0] + 1) | 0;

          if (k > 1) {
            yd = multiplyInteger(yd, k, base);
            xd = multiplyInteger(xd, k, base);
            yL = yd.length;
            xL = xd.length;
          }

          xi = yL;
          rem = xd.slice(0, yL);
          remL = rem.length;

          // Add zeros to make remainder as long as divisor.
          for (; remL < yL;) rem[remL++] = 0;

          yz = yd.slice();
          yz.unshift(0);
          yd0 = yd[0];

          if (yd[1] >= base / 2) ++yd0;

          do {
            k = 0;

            // Compare divisor and remainder.
            cmp = compare(yd, rem, yL, remL);

            // If divisor < remainder.
            if (cmp < 0) {

              // Calculate trial digit, k.
              rem0 = rem[0];
              if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

              // k will be how many times the divisor goes into the current remainder.
              k = rem0 / yd0 | 0;

              //  Algorithm:
              //  1. product = divisor * trial digit (k)
              //  2. if product > remainder: product -= divisor, k--
              //  3. remainder -= product
              //  4. if product was < remainder at 2:
              //    5. compare new remainder and divisor
              //    6. If remainder > divisor: remainder -= divisor, k++

              if (k > 1) {
                if (k >= base) k = base - 1;

                // product = divisor * trial digit.
                prod = multiplyInteger(yd, k, base);
                prodL = prod.length;
                remL = rem.length;

                // Compare product and remainder.
                cmp = compare(prod, rem, prodL, remL);

                // product > remainder.
                if (cmp == 1) {
                  k--;

                  // Subtract divisor from product.
                  subtract(prod, yL < prodL ? yz : yd, prodL, base);
                }
              } else {

                // cmp is -1.
                // If k is 0, there is no need to compare yd and rem again below, so change cmp to 1
                // to avoid it. If k is 1 there is a need to compare yd and rem again below.
                if (k == 0) cmp = k = 1;
                prod = yd.slice();
              }

              prodL = prod.length;
              if (prodL < remL) prod.unshift(0);

              // Subtract product from remainder.
              subtract(rem, prod, remL, base);

              // If product was < previous remainder.
              if (cmp == -1) {
                remL = rem.length;

                // Compare divisor and new remainder.
                cmp = compare(yd, rem, yL, remL);

                // If divisor < new remainder, subtract divisor from remainder.
                if (cmp < 1) {
                  k++;

                  // Subtract divisor from remainder.
                  subtract(rem, yL < remL ? yz : yd, remL, base);
                }
              }

              remL = rem.length;
            } else if (cmp === 0) {
              k++;
              rem = [0];
            }    // if cmp === 1, k will be 0

            // Add the next digit, k, to the result array.
            qd[i++] = k;

            // Update the remainder.
            if (cmp && rem[0]) {
              rem[remL++] = xd[xi] || 0;
            } else {
              rem = [xd[xi]];
              remL = 1;
            }

          } while ((xi++ < xL || rem[0] !== void 0) && sd--);

          more = rem[0] !== void 0;
        }

        // Leading zero?
        if (!qd[0]) qd.shift();
      }

      // logBase is 1 when divide is being used for base conversion.
      if (logBase == 1) {
        q.e = e;
        inexact = more;
      } else {

        // To calculate q.e, first get the number of digits of qd[0].
        for (i = 1, k = qd[0]; k >= 10; k /= 10) i++;
        q.e = i + e * logBase - 1;

        finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
      }

      return q;
    };
  })();


  /*
   * Round `x` to `sd` significant digits using rounding mode `rm`.
   * Check for over/under-flow.
   */
   function finalise(x, sd, rm, isTruncated) {
    var digits, i, j, k, rd, roundUp, w, xd, xdi,
      Ctor = x.constructor;

    // Don't round if sd is null or undefined.
    out: if (sd != null) {
      xd = x.d;

      // Infinity/NaN.
      if (!xd) return x;

      // rd: the rounding digit, i.e. the digit after the digit that may be rounded up.
      // w: the word of xd containing rd, a base 1e7 number.
      // xdi: the index of w within xd.
      // digits: the number of digits of w.
      // i: what would be the index of rd within w if all the numbers were 7 digits long (i.e. if
      // they had leading zeros)
      // j: if > 0, the actual index of rd within w (if < 0, rd is a leading zero).

      // Get the length of the first word of the digits array xd.
      for (digits = 1, k = xd[0]; k >= 10; k /= 10) digits++;
      i = sd - digits;

      // Is the rounding digit in the first word of xd?
      if (i < 0) {
        i += LOG_BASE;
        j = sd;
        w = xd[xdi = 0];

        // Get the rounding digit at index j of w.
        rd = w / mathpow(10, digits - j - 1) % 10 | 0;
      } else {
        xdi = Math.ceil((i + 1) / LOG_BASE);
        k = xd.length;
        if (xdi >= k) {
          if (isTruncated) {

            // Needed by `naturalExponential`, `naturalLogarithm` and `squareRoot`.
            for (; k++ <= xdi;) xd.push(0);
            w = rd = 0;
            digits = 1;
            i %= LOG_BASE;
            j = i - LOG_BASE + 1;
          } else {
            break out;
          }
        } else {
          w = k = xd[xdi];

          // Get the number of digits of w.
          for (digits = 1; k >= 10; k /= 10) digits++;

          // Get the index of rd within w.
          i %= LOG_BASE;

          // Get the index of rd within w, adjusted for leading zeros.
          // The number of leading zeros of w is given by LOG_BASE - digits.
          j = i - LOG_BASE + digits;

          // Get the rounding digit at index j of w.
          rd = j < 0 ? 0 : w / mathpow(10, digits - j - 1) % 10 | 0;
        }
      }

      // Are there any non-zero digits after the rounding digit?
      isTruncated = isTruncated || sd < 0 ||
        xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits - j - 1));

      // The expression `w % mathpow(10, digits - j - 1)` returns all the digits of w to the right
      // of the digit at (left-to-right) index j, e.g. if w is 908714 and j is 2, the expression
      // will give 714.

      roundUp = rm < 4
        ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
        : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 &&

          // Check whether the digit to the left of the rounding digit is odd.
          ((i > 0 ? j > 0 ? w / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10) & 1 ||
            rm == (x.s < 0 ? 8 : 7));

      if (sd < 1 || !xd[0]) {
        xd.length = 0;
        if (roundUp) {

          // Convert sd to decimal places.
          sd -= x.e + 1;

          // 1, 0.1, 0.01, 0.001, 0.0001 etc.
          xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
          x.e = -sd || 0;
        } else {

          // Zero.
          xd[0] = x.e = 0;
        }

        return x;
      }

      // Remove excess digits.
      if (i == 0) {
        xd.length = xdi;
        k = 1;
        xdi--;
      } else {
        xd.length = xdi + 1;
        k = mathpow(10, LOG_BASE - i);

        // E.g. 56700 becomes 56000 if 7 is the rounding digit.
        // j > 0 means i > number of leading zeros of w.
        xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
      }

      if (roundUp) {
        for (;;) {

          // Is the digit to be rounded up in the first word of xd?
          if (xdi == 0) {

            // i will be the length of xd[0] before k is added.
            for (i = 1, j = xd[0]; j >= 10; j /= 10) i++;
            j = xd[0] += k;
            for (k = 1; j >= 10; j /= 10) k++;

            // if i != k the length has increased.
            if (i != k) {
              x.e++;
              if (xd[0] == BASE) xd[0] = 1;
            }

            break;
          } else {
            xd[xdi] += k;
            if (xd[xdi] != BASE) break;
            xd[xdi--] = 0;
            k = 1;
          }
        }
      }

      // Remove trailing zeros.
      for (i = xd.length; xd[--i] === 0;) xd.pop();
    }

    if (external) {

      // Overflow?
      if (x.e > Ctor.maxE) {

        // Infinity.
        x.d = null;
        x.e = NaN;

      // Underflow?
      } else if (x.e < Ctor.minE) {

        // Zero.
        x.e = 0;
        x.d = [0];
        // Ctor.underflow = true;
      } // else Ctor.underflow = false;
    }

    return x;
  }


  function finiteToString(x, isExp, sd) {
    if (!x.isFinite()) return nonFiniteToString(x);
    var k,
      e = x.e,
      str = digitsToString(x.d),
      len = str.length;

    if (isExp) {
      if (sd && (k = sd - len) > 0) {
        str = str.charAt(0) + '.' + str.slice(1) + getZeroString(k);
      } else if (len > 1) {
        str = str.charAt(0) + '.' + str.slice(1);
      }

      str = str + (x.e < 0 ? 'e' : 'e+') + x.e;
    } else if (e < 0) {
      str = '0.' + getZeroString(-e - 1) + str;
      if (sd && (k = sd - len) > 0) str += getZeroString(k);
    } else if (e >= len) {
      str += getZeroString(e + 1 - len);
      if (sd && (k = sd - e - 1) > 0) str = str + '.' + getZeroString(k);
    } else {
      if ((k = e + 1) < len) str = str.slice(0, k) + '.' + str.slice(k);
      if (sd && (k = sd - len) > 0) {
        if (e + 1 === len) str += '.';
        str += getZeroString(k);
      }
    }

    return str;
  }


  // Calculate the base 10 exponent from the base 1e7 exponent.
  function getBase10Exponent(digits, e) {
    var w = digits[0];

    // Add the number of digits of the first word of the digits array.
    for ( e *= LOG_BASE; w >= 10; w /= 10) e++;
    return e;
  }


  function getLn10(Ctor, sd, pr) {
    if (sd > LN10_PRECISION) {

      // Reset global state in case the exception is caught.
      external = true;
      if (pr) Ctor.precision = pr;
      throw Error(precisionLimitExceeded);
    }
    return finalise(new Ctor(LN10), sd, 1, true);
  }


  function getPi(Ctor, sd, rm) {
    if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
    return finalise(new Ctor(PI), sd, rm, true);
  }


  function getPrecision(digits) {
    var w = digits.length - 1,
      len = w * LOG_BASE + 1;

    w = digits[w];

    // If non-zero...
    if (w) {

      // Subtract the number of trailing zeros of the last word.
      for (; w % 10 == 0; w /= 10) len--;

      // Add the number of digits of the first word.
      for (w = digits[0]; w >= 10; w /= 10) len++;
    }

    return len;
  }


  function getZeroString(k) {
    var zs = '';
    for (; k--;) zs += '0';
    return zs;
  }


  /*
   * Return a new Decimal whose value is the value of Decimal `x` to the power `n`, where `n` is an
   * integer of type number.
   *
   * Implements 'exponentiation by squaring'. Called by `pow` and `parseOther`.
   *
   */
  function intPow(Ctor, x, n, pr) {
    var isTruncated,
      r = new Ctor(1),

      // Max n of 9007199254740991 takes 53 loop iterations.
      // Maximum digits array length; leaves [28, 34] guard digits.
      k = Math.ceil(pr / LOG_BASE + 4);

    external = false;

    for (;;) {
      if (n % 2) {
        r = r.times(x);
        if (truncate(r.d, k)) isTruncated = true;
      }

      n = mathfloor(n / 2);
      if (n === 0) {

        // To ensure correct rounding when r.d is truncated, increment the last word if it is zero.
        n = r.d.length - 1;
        if (isTruncated && r.d[n] === 0) ++r.d[n];
        break;
      }

      x = x.times(x);
      truncate(x.d, k);
    }

    external = true;

    return r;
  }


  function isOdd(n) {
    return n.d[n.d.length - 1] & 1;
  }


  /*
   * Handle `max` and `min`. `ltgt` is 'lt' or 'gt'.
   */
  function maxOrMin(Ctor, args, ltgt) {
    var y,
      x = new Ctor(args[0]),
      i = 0;

    for (; ++i < args.length;) {
      y = new Ctor(args[i]);
      if (!y.s) {
        x = y;
        break;
      } else if (x[ltgt](y)) {
        x = y;
      }
    }

    return x;
  }


  /*
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
   */
  function naturalExponential(x, sd) {
    var denominator, guard, j, pow, sum, t, wpr,
      rep = 0,
      i = 0,
      k = 0,
      Ctor = x.constructor,
      rm = Ctor.rounding,
      pr = Ctor.precision;

    // 0/NaN/Infinity?
    if (!x.d || !x.d[0] || x.e > 17) {

      return new Ctor(x.d
        ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0
        : x.s ? x.s < 0 ? 0 : x : 0 / 0);
    }

    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }

    t = new Ctor(0.03125);

    // while abs(x) >= 0.1
    while (x.e > -2) {

      // x = x / 2^5
      x = x.times(t);
      k += 5;
    }

    // Use 2 * log10(2^k) + 5 (empirically derived) to estimate the increase in precision
    // necessary to ensure the first 4 rounding digits are correct.
    guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
    wpr += guard;
    denominator = pow = sum = new Ctor(1);
    Ctor.precision = wpr;

    for (;;) {
      pow = finalise(pow.times(x), wpr, 1);
      denominator = denominator.times(++i);
      t = sum.plus(divide(pow, denominator, wpr, 1));

      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
        j = k;
        while (j--) sum = finalise(sum.times(sum), wpr, 1);

        // Check to see if the first 4 rounding digits are [49]999.
        // If so, repeat the summation with a higher precision, otherwise
        // e.g. with precision: 18, rounding: 1
        // exp(18.404272462595034083567793919843761) = 98372560.1229999999 (should be 98372560.123)
        // `wpr - guard` is the index of first rounding digit.
        if (sd == null) {

          if (rep < 3 && checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += 10;
            denominator = pow = t = new Ctor(1);
            i = 0;
            rep++;
          } else {
            return finalise(sum, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum;
        }
      }

      sum = t;
    }
  }


  /*
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
   */
  function naturalLogarithm(y, sd) {
    var c, c0, denominator, e, numerator, rep, sum, t, wpr, x1, x2,
      n = 1,
      guard = 10,
      x = y,
      xd = x.d,
      Ctor = x.constructor,
      rm = Ctor.rounding,
      pr = Ctor.precision;

    // Is x negative or Infinity, NaN, 0 or 1?
    if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
      return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
    }

    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }

    Ctor.precision = wpr += guard;
    c = digitsToString(xd);
    c0 = c.charAt(0);

    if (Math.abs(e = x.e) < 1.5e15) {

      // Argument reduction.
      // The series converges faster the closer the argument is to 1, so using
      // ln(a^b) = b * ln(a),   ln(a) = ln(a^b) / b
      // multiply the argument by itself until the leading digits of the significand are 7, 8, 9,
      // 10, 11, 12 or 13, recording the number of multiplications so the sum of the series can
      // later be divided by this number, then separate out the power of 10 using
      // ln(a*10^b) = ln(a) + b*ln(10).

      // max n is 21 (gives 0.9, 1.0 or 1.1) (9e15 / 21 = 4.2e14).
      //while (c0 < 9 && c0 != 1 || c0 == 1 && c.charAt(1) > 1) {
      // max n is 6 (gives 0.7 - 1.3)
      while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
        x = x.times(y);
        c = digitsToString(x.d);
        c0 = c.charAt(0);
        n++;
      }

      e = x.e;

      if (c0 > 1) {
        x = new Ctor('0.' + c);
        e++;
      } else {
        x = new Ctor(c0 + '.' + c.slice(1));
      }
    } else {

      // The argument reduction method above may result in overflow if the argument y is a massive
      // number with exponent >= 1500000000000000 (9e15 / 6 = 1.5e15), so instead recall this
      // function using ln(x*10^e) = ln(x) + e*ln(10).
      t = getLn10(Ctor, wpr + 2, pr).times(e + '');
      x = naturalLogarithm(new Ctor(c0 + '.' + c.slice(1)), wpr - guard).plus(t);
      Ctor.precision = pr;

      return sd == null ? finalise(x, pr, rm, external = true) : x;
    }

    // x1 is x reduced to a value near 1.
    x1 = x;

    // Taylor series.
    // ln(y) = ln((1 + x)/(1 - x)) = 2(x + x^3/3 + x^5/5 + x^7/7 + ...)
    // where x = (y - 1)/(y + 1)    (|x| < 1)
    sum = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
    x2 = finalise(x.times(x), wpr, 1);
    denominator = 3;

    for (;;) {
      numerator = finalise(numerator.times(x2), wpr, 1);
      t = sum.plus(divide(numerator, new Ctor(denominator), wpr, 1));

      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
        sum = sum.times(2);

        // Reverse the argument reduction. Check that e is not 0 because, besides preventing an
        // unnecessary calculation, -0 + 0 = +0 and to ensure correct rounding -0 needs to stay -0.
        if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ''));
        sum = divide(sum, new Ctor(n), wpr, 1);

        // Is rm > 3 and the first 4 rounding digits 4999, or rm < 4 (or the summation has
        // been repeated previously) and the first 4 rounding digits 9999?
        // If so, restart the summation with a higher precision, otherwise
        // e.g. with precision: 12, rounding: 1
        // ln(135520028.6126091714265381533) = 18.7246299999 when it should be 18.72463.
        // `wpr - guard` is the index of first rounding digit.
        if (sd == null) {
          if (checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += guard;
            t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
            x2 = finalise(x.times(x), wpr, 1);
            denominator = rep = 1;
          } else {
            return finalise(sum, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum;
        }
      }

      sum = t;
      denominator += 2;
    }
  }


  // ±Infinity, NaN.
  function nonFiniteToString(x) {
    // Unsigned.
    return String(x.s * x.s / 0);
  }


  /*
   * Parse the value of a new Decimal `x` from string `str`.
   */
  function parseDecimal(x, str) {
    var e, i, len;

    // Decimal point?
    if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

    // Exponential form?
    if ((i = str.search(/e/i)) > 0) {

      // Determine exponent.
      if (e < 0) e = i;
      e += +str.slice(i + 1);
      str = str.substring(0, i);
    } else if (e < 0) {

      // Integer.
      e = str.length;
    }

    // Determine leading zeros.
    for (i = 0; str.charCodeAt(i) === 48; i++);

    // Determine trailing zeros.
    for (len = str.length; str.charCodeAt(len - 1) === 48; --len);
    str = str.slice(i, len);

    if (str) {
      len -= i;
      x.e = e = e - i - 1;
      x.d = [];

      // Transform base

      // e is the base 10 exponent.
      // i is where to slice str to get the first word of the digits array.
      i = (e + 1) % LOG_BASE;
      if (e < 0) i += LOG_BASE;

      if (i < len) {
        if (i) x.d.push(+str.slice(0, i));
        for (len -= LOG_BASE; i < len;) x.d.push(+str.slice(i, i += LOG_BASE));
        str = str.slice(i);
        i = LOG_BASE - str.length;
      } else {
        i -= len;
      }

      for (; i--;) str += '0';
      x.d.push(+str);

      if (external) {

        // Overflow?
        if (x.e > x.constructor.maxE) {

          // Infinity.
          x.d = null;
          x.e = NaN;

        // Underflow?
        } else if (x.e < x.constructor.minE) {

          // Zero.
          x.e = 0;
          x.d = [0];
          // x.constructor.underflow = true;
        } // else x.constructor.underflow = false;
      }
    } else {

      // Zero.
      x.e = 0;
      x.d = [0];
    }

    return x;
  }


  /*
   * Parse the value of a new Decimal `x` from a string `str`, which is not a decimal value.
   */
  function parseOther(x, str) {
    var base, Ctor, divisor, i, isFloat, len, p, xd, xe;

    if (str.indexOf('_') > -1) {
      str = str.replace(/(\d)_(?=\d)/g, '$1');
      if (isDecimal.test(str)) return parseDecimal(x, str);
    } else if (str === 'Infinity' || str === 'NaN') {
      if (!+str) x.s = NaN;
      x.e = NaN;
      x.d = null;
      return x;
    }

    if (isHex.test(str))  {
      base = 16;
      str = str.toLowerCase();
    } else if (isBinary.test(str))  {
      base = 2;
    } else if (isOctal.test(str))  {
      base = 8;
    } else {
      throw Error(invalidArgument + str);
    }

    // Is there a binary exponent part?
    i = str.search(/p/i);

    if (i > 0) {
      p = +str.slice(i + 1);
      str = str.substring(2, i);
    } else {
      str = str.slice(2);
    }

    // Convert `str` as an integer then divide the result by `base` raised to a power such that the
    // fraction part will be restored.
    i = str.indexOf('.');
    isFloat = i >= 0;
    Ctor = x.constructor;

    if (isFloat) {
      str = str.replace('.', '');
      len = str.length;
      i = len - i;

      // log[10](16) = 1.2041... , log[10](88) = 1.9444....
      divisor = intPow(Ctor, new Ctor(base), i, i * 2);
    }

    xd = convertBase(str, base, BASE);
    xe = xd.length - 1;

    // Remove trailing zeros.
    for (i = xe; xd[i] === 0; --i) xd.pop();
    if (i < 0) return new Ctor(x.s * 0);
    x.e = getBase10Exponent(xd, xe);
    x.d = xd;
    external = false;

    // At what precision to perform the division to ensure exact conversion?
    // maxDecimalIntegerPartDigitCount = ceil(log[10](b) * otherBaseIntegerPartDigitCount)
    // log[10](2) = 0.30103, log[10](8) = 0.90309, log[10](16) = 1.20412
    // E.g. ceil(1.2 * 3) = 4, so up to 4 decimal digits are needed to represent 3 hex int digits.
    // maxDecimalFractionPartDigitCount = {Hex:4|Oct:3|Bin:1} * otherBaseFractionPartDigitCount
    // Therefore using 4 * the number of digits of str will always be enough.
    if (isFloat) x = divide(x, divisor, len * 4);

    // Multiply by the binary exponent part if present.
    if (p) x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal.pow(2, p));
    external = true;

    return x;
  }


  /*
   * sin(x) = x - x^3/3! + x^5/5! - ...
   * |x| < pi/2
   *
   */
  function sine(Ctor, x) {
    var k,
      len = x.d.length;

    if (len < 3) {
      return x.isZero() ? x : taylorSeries(Ctor, 2, x, x);
    }

    // Argument reduction: sin(5x) = 16*sin^5(x) - 20*sin^3(x) + 5*sin(x)
    // i.e. sin(x) = 16*sin^5(x/5) - 20*sin^3(x/5) + 5*sin(x/5)
    // and  sin(x) = sin(x/5)(5 + sin^2(x/5)(16sin^2(x/5) - 20))

    // Estimate the optimum number of times to use the argument reduction.
    k = 1.4 * Math.sqrt(len);
    k = k > 16 ? 16 : k | 0;

    x = x.times(1 / tinyPow(5, k));
    x = taylorSeries(Ctor, 2, x, x);

    // Reverse argument reduction
    var sin2_x,
      d5 = new Ctor(5),
      d16 = new Ctor(16),
      d20 = new Ctor(20);
    for (; k--;) {
      sin2_x = x.times(x);
      x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
    }

    return x;
  }


  // Calculate Taylor series for `cos`, `cosh`, `sin` and `sinh`.
  function taylorSeries(Ctor, n, x, y, isHyperbolic) {
    var j, t, u, x2,
      i = 1,
      pr = Ctor.precision,
      k = Math.ceil(pr / LOG_BASE);

    external = false;
    x2 = x.times(x);
    u = new Ctor(y);

    for (;;) {
      t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
      u = isHyperbolic ? y.plus(t) : y.minus(t);
      y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
      t = u.plus(y);

      if (t.d[k] !== void 0) {
        for (j = k; t.d[j] === u.d[j] && j--;);
        if (j == -1) break;
      }

      j = u;
      u = y;
      y = t;
      t = j;
      i++;
    }

    external = true;
    t.d.length = k + 1;

    return t;
  }


  // Exponent e must be positive and non-zero.
  function tinyPow(b, e) {
    var n = b;
    while (--e) n *= b;
    return n;
  }


  // Return the absolute value of `x` reduced to less than or equal to half pi.
  function toLessThanHalfPi(Ctor, x) {
    var t,
      isNeg = x.s < 0,
      pi = getPi(Ctor, Ctor.precision, 1),
      halfPi = pi.times(0.5);

    x = x.abs();

    if (x.lte(halfPi)) {
      quadrant = isNeg ? 4 : 1;
      return x;
    }

    t = x.divToInt(pi);

    if (t.isZero()) {
      quadrant = isNeg ? 3 : 2;
    } else {
      x = x.minus(t.times(pi));

      // 0 <= x < pi
      if (x.lte(halfPi)) {
        quadrant = isOdd(t) ? (isNeg ? 2 : 3) : (isNeg ? 4 : 1);
        return x;
      }

      quadrant = isOdd(t) ? (isNeg ? 1 : 4) : (isNeg ? 3 : 2);
    }

    return x.minus(pi).abs();
  }


  /*
   * Return the value of Decimal `x` as a string in base `baseOut`.
   *
   * If the optional `sd` argument is present include a binary exponent suffix.
   */
  function toStringBinary(x, baseOut, sd, rm) {
    var base, e, i, k, len, roundUp, str, xd, y,
      Ctor = x.constructor,
      isExp = sd !== void 0;

    if (isExp) {
      checkInt32(sd, 1, MAX_DIGITS);
      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    } else {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    }

    if (!x.isFinite()) {
      str = nonFiniteToString(x);
    } else {
      str = finiteToString(x);
      i = str.indexOf('.');

      // Use exponential notation according to `toExpPos` and `toExpNeg`? No, but if required:
      // maxBinaryExponent = floor((decimalExponent + 1) * log[2](10))
      // minBinaryExponent = floor(decimalExponent * log[2](10))
      // log[2](10) = 3.321928094887362347870319429489390175864

      if (isExp) {
        base = 2;
        if (baseOut == 16) {
          sd = sd * 4 - 3;
        } else if (baseOut == 8) {
          sd = sd * 3 - 2;
        }
      } else {
        base = baseOut;
      }

      // Convert the number as an integer then divide the result by its base raised to a power such
      // that the fraction part will be restored.

      // Non-integer.
      if (i >= 0) {
        str = str.replace('.', '');
        y = new Ctor(1);
        y.e = str.length - i;
        y.d = convertBase(finiteToString(y), 10, base);
        y.e = y.d.length;
      }

      xd = convertBase(str, 10, base);
      e = len = xd.length;

      // Remove trailing zeros.
      for (; xd[--len] == 0;) xd.pop();

      if (!xd[0]) {
        str = isExp ? '0p+0' : '0';
      } else {
        if (i < 0) {
          e--;
        } else {
          x = new Ctor(x);
          x.d = xd;
          x.e = e;
          x = divide(x, y, sd, rm, 0, base);
          xd = x.d;
          e = x.e;
          roundUp = inexact;
        }

        // The rounding digit, i.e. the digit after the digit that may be rounded up.
        i = xd[sd];
        k = base / 2;
        roundUp = roundUp || xd[sd + 1] !== void 0;

        roundUp = rm < 4
          ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2))
          : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 ||
            rm === (x.s < 0 ? 8 : 7));

        xd.length = sd;

        if (roundUp) {

          // Rounding up may mean the previous digit has to be rounded up and so on.
          for (; ++xd[--sd] > base - 1;) {
            xd[sd] = 0;
            if (!sd) {
              ++e;
              xd.unshift(1);
            }
          }
        }

        // Determine trailing zeros.
        for (len = xd.length; !xd[len - 1]; --len);

        // E.g. [4, 11, 15] becomes 4bf.
        for (i = 0, str = ''; i < len; i++) str += NUMERALS.charAt(xd[i]);

        // Add binary exponent suffix?
        if (isExp) {
          if (len > 1) {
            if (baseOut == 16 || baseOut == 8) {
              i = baseOut == 16 ? 4 : 3;
              for (--len; len % i; len++) str += '0';
              xd = convertBase(str, base, baseOut);
              for (len = xd.length; !xd[len - 1]; --len);

              // xd[0] will always be be 1
              for (i = 1, str = '1.'; i < len; i++) str += NUMERALS.charAt(xd[i]);
            } else {
              str = str.charAt(0) + '.' + str.slice(1);
            }
          }

          str =  str + (e < 0 ? 'p' : 'p+') + e;
        } else if (e < 0) {
          for (; ++e;) str = '0' + str;
          str = '0.' + str;
        } else {
          if (++e > len) for (e -= len; e-- ;) str += '0';
          else if (e < len) str = str.slice(0, e) + '.' + str.slice(e);
        }
      }

      str = (baseOut == 16 ? '0x' : baseOut == 2 ? '0b' : baseOut == 8 ? '0o' : '') + str;
    }

    return x.s < 0 ? '-' + str : str;
  }


  // Does not strip trailing zeros.
  function truncate(arr, len) {
    if (arr.length > len) {
      arr.length = len;
      return true;
    }
  }


  // Decimal methods


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
   */


  /*
   * Return a new Decimal whose value is the absolute value of `x`.
   *
   * x {number|string|Decimal}
   *
   */
  function abs(x) {
    return new this(x).abs();
  }


  /*
   * Return a new Decimal whose value is the arccosine in radians of `x`.
   *
   * x {number|string|Decimal}
   *
   */
  function acos(x) {
    return new this(x).acos();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function acosh(x) {
    return new this(x).acosh();
  }


  /*
   * Return a new Decimal whose value is the sum of `x` and `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function add(x, y) {
    return new this(x).plus(y);
  }


  /*
   * Return a new Decimal whose value is the arcsine in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function asin(x) {
    return new this(x).asin();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function asinh(x) {
    return new this(x).asinh();
  }


  /*
   * Return a new Decimal whose value is the arctangent in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function atan(x) {
    return new this(x).atan();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function atanh(x) {
    return new this(x).atanh();
  }


  /*
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
   */
  function atan2(y, x) {
    y = new this(y);
    x = new this(x);
    var r,
      pr = this.precision,
      rm = this.rounding,
      wpr = pr + 4;

    // Either NaN
    if (!y.s || !x.s) {
      r = new this(NaN);

    // Both ±Infinity
    } else if (!y.d && !x.d) {
      r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
      r.s = y.s;

    // x is ±Infinity or y is ±0
    } else if (!x.d || y.isZero()) {
      r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
      r.s = y.s;

    // y is ±Infinity or x is ±0
    } else if (!y.d || x.isZero()) {
      r = getPi(this, wpr, 1).times(0.5);
      r.s = y.s;

    // Both non-zero and finite
    } else if (x.s < 0) {
      this.precision = wpr;
      this.rounding = 1;
      r = this.atan(divide(y, x, wpr, 1));
      x = getPi(this, wpr, 1);
      this.precision = pr;
      this.rounding = rm;
      r = y.s < 0 ? r.minus(x) : r.plus(x);
    } else {
      r = this.atan(divide(y, x, wpr, 1));
    }

    return r;
  }


  /*
   * Return a new Decimal whose value is the cube root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function cbrt(x) {
    return new this(x).cbrt();
  }


  /*
   * Return a new Decimal whose value is `x` rounded to an integer using `ROUND_CEIL`.
   *
   * x {number|string|Decimal}
   *
   */
  function ceil(x) {
    return finalise(x = new this(x), x.e + 1, 2);
  }


  /*
   * Return a new Decimal whose value is `x` clamped to the range delineated by `min` and `max`.
   *
   * x {number|string|Decimal}
   * min {number|string|Decimal}
   * max {number|string|Decimal}
   *
   */
  function clamp(x, min, max) {
    return new this(x).clamp(min, max);
  }


  /*
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
   */
  function config(obj) {
    if (!obj || typeof obj !== 'object') throw Error(decimalError + 'Object expected');
    var i, p, v,
      useDefaults = obj.defaults === true,
      ps = [
        'precision', 1, MAX_DIGITS,
        'rounding', 0, 8,
        'toExpNeg', -EXP_LIMIT, 0,
        'toExpPos', 0, EXP_LIMIT,
        'maxE', 0, EXP_LIMIT,
        'minE', -EXP_LIMIT, 0,
        'modulo', 0, 9
      ];

    for (i = 0; i < ps.length; i += 3) {
      if (p = ps[i], useDefaults) this[p] = DEFAULTS[p];
      if ((v = obj[p]) !== void 0) {
        if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
        else throw Error(invalidArgument + p + ': ' + v);
      }
    }

    if (p = 'crypto', useDefaults) this[p] = DEFAULTS[p];
    if ((v = obj[p]) !== void 0) {
      if (v === true || v === false || v === 0 || v === 1) {
        if (v) {
          if (typeof crypto != 'undefined' && crypto &&
            (crypto.getRandomValues || crypto.randomBytes)) {
            this[p] = true;
          } else {
            throw Error(cryptoUnavailable);
          }
        } else {
          this[p] = false;
        }
      } else {
        throw Error(invalidArgument + p + ': ' + v);
      }
    }

    return this;
  }


  /*
   * Return a new Decimal whose value is the cosine of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function cos(x) {
    return new this(x).cos();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic cosine of `x`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function cosh(x) {
    return new this(x).cosh();
  }


  /*
   * Create and return a Decimal constructor with the same configuration properties as this Decimal
   * constructor.
   *
   */
  function clone(obj) {
    var i, p, ps;

    /*
     * The Decimal constructor and exported function.
     * Return a new Decimal instance.
     *
     * v {number|string|Decimal} A numeric value.
     *
     */
    function Decimal(v) {
      var e, i, t,
        x = this;

      // Decimal called without new.
      if (!(x instanceof Decimal)) return new Decimal(v);

      // Retain a reference to this Decimal constructor, and shadow Decimal.prototype.constructor
      // which points to Object.
      x.constructor = Decimal;

      // Duplicate.
      if (isDecimalInstance(v)) {
        x.s = v.s;

        if (external) {
          if (!v.d || v.e > Decimal.maxE) {

            // Infinity.
            x.e = NaN;
            x.d = null;
          } else if (v.e < Decimal.minE) {

            // Zero.
            x.e = 0;
            x.d = [0];
          } else {
            x.e = v.e;
            x.d = v.d.slice();
          }
        } else {
          x.e = v.e;
          x.d = v.d ? v.d.slice() : v.d;
        }

        return;
      }

      t = typeof v;

      if (t === 'number') {
        if (v === 0) {
          x.s = 1 / v < 0 ? -1 : 1;
          x.e = 0;
          x.d = [0];
          return;
        }

        if (v < 0) {
          v = -v;
          x.s = -1;
        } else {
          x.s = 1;
        }

        // Fast path for small integers.
        if (v === ~~v && v < 1e7) {
          for (e = 0, i = v; i >= 10; i /= 10) e++;

          if (external) {
            if (e > Decimal.maxE) {
              x.e = NaN;
              x.d = null;
            } else if (e < Decimal.minE) {
              x.e = 0;
              x.d = [0];
            } else {
              x.e = e;
              x.d = [v];
            }
          } else {
            x.e = e;
            x.d = [v];
          }

          return;

        // Infinity, NaN.
        } else if (v * 0 !== 0) {
          if (!v) x.s = NaN;
          x.e = NaN;
          x.d = null;
          return;
        }

        return parseDecimal(x, v.toString());

      } else if (t !== 'string') {
        throw Error(invalidArgument + v);
      }

      // Minus sign?
      if ((i = v.charCodeAt(0)) === 45) {
        v = v.slice(1);
        x.s = -1;
      } else {
        // Plus sign?
        if (i === 43) v = v.slice(1);
        x.s = 1;
      }

      return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
    }

    Decimal.prototype = P;

    Decimal.ROUND_UP = 0;
    Decimal.ROUND_DOWN = 1;
    Decimal.ROUND_CEIL = 2;
    Decimal.ROUND_FLOOR = 3;
    Decimal.ROUND_HALF_UP = 4;
    Decimal.ROUND_HALF_DOWN = 5;
    Decimal.ROUND_HALF_EVEN = 6;
    Decimal.ROUND_HALF_CEIL = 7;
    Decimal.ROUND_HALF_FLOOR = 8;
    Decimal.EUCLID = 9;

    Decimal.config = Decimal.set = config;
    Decimal.clone = clone;
    Decimal.isDecimal = isDecimalInstance;

    Decimal.abs = abs;
    Decimal.acos = acos;
    Decimal.acosh = acosh;        // ES6
    Decimal.add = add;
    Decimal.asin = asin;
    Decimal.asinh = asinh;        // ES6
    Decimal.atan = atan;
    Decimal.atanh = atanh;        // ES6
    Decimal.atan2 = atan2;
    Decimal.cbrt = cbrt;          // ES6
    Decimal.ceil = ceil;
    Decimal.clamp = clamp;
    Decimal.cos = cos;
    Decimal.cosh = cosh;          // ES6
    Decimal.div = div;
    Decimal.exp = exp;
    Decimal.floor = floor;
    Decimal.hypot = hypot;        // ES6
    Decimal.ln = ln;
    Decimal.log = log;
    Decimal.log10 = log10;        // ES6
    Decimal.log2 = log2;          // ES6
    Decimal.max = max;
    Decimal.min = min;
    Decimal.mod = mod;
    Decimal.mul = mul;
    Decimal.pow = pow;
    Decimal.random = random;
    Decimal.round = round;
    Decimal.sign = sign;          // ES6
    Decimal.sin = sin;
    Decimal.sinh = sinh;          // ES6
    Decimal.sqrt = sqrt;
    Decimal.sub = sub;
    Decimal.sum = sum;
    Decimal.tan = tan;
    Decimal.tanh = tanh;          // ES6
    Decimal.trunc = trunc;        // ES6

    if (obj === void 0) obj = {};
    if (obj) {
      if (obj.defaults !== true) {
        ps = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'maxE', 'minE', 'modulo', 'crypto'];
        for (i = 0; i < ps.length;) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
      }
    }

    Decimal.config(obj);

    return Decimal;
  }


  /*
   * Return a new Decimal whose value is `x` divided by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function div(x, y) {
    return new this(x).div(y);
  }


  /*
   * Return a new Decimal whose value is the natural exponential of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The power to which to raise the base of the natural log.
   *
   */
  function exp(x) {
    return new this(x).exp();
  }


  /*
   * Return a new Decimal whose value is `x` round to an integer using `ROUND_FLOOR`.
   *
   * x {number|string|Decimal}
   *
   */
  function floor(x) {
    return finalise(x = new this(x), x.e + 1, 3);
  }


  /*
   * Return a new Decimal whose value is the square root of the sum of the squares of the arguments,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * hypot(a, b, ...) = sqrt(a^2 + b^2 + ...)
   *
   * arguments {number|string|Decimal}
   *
   */
  function hypot() {
    var i, n,
      t = new this(0);

    external = false;

    for (i = 0; i < arguments.length;) {
      n = new this(arguments[i++]);
      if (!n.d) {
        if (n.s) {
          external = true;
          return new this(1 / 0);
        }
        t = n;
      } else if (t.d) {
        t = t.plus(n.times(n));
      }
    }

    external = true;

    return t.sqrt();
  }


  /*
   * Return true if object is a Decimal instance (where Decimal is any Decimal constructor),
   * otherwise return false.
   *
   */
  function isDecimalInstance(obj) {
    return obj instanceof Decimal || obj && obj.toStringTag === tag || false;
  }


  /*
   * Return a new Decimal whose value is the natural logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function ln(x) {
    return new this(x).ln();
  }


  /*
   * Return a new Decimal whose value is the log of `x` to the base `y`, or to base 10 if no base
   * is specified, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * log[y](x)
   *
   * x {number|string|Decimal} The argument of the logarithm.
   * y {number|string|Decimal} The base of the logarithm.
   *
   */
  function log(x, y) {
    return new this(x).log(y);
  }


  /*
   * Return a new Decimal whose value is the base 2 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function log2(x) {
    return new this(x).log(2);
  }


  /*
   * Return a new Decimal whose value is the base 10 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function log10(x) {
    return new this(x).log(10);
  }


  /*
   * Return a new Decimal whose value is the maximum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
  function max() {
    return maxOrMin(this, arguments, 'lt');
  }


  /*
   * Return a new Decimal whose value is the minimum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
  function min() {
    return maxOrMin(this, arguments, 'gt');
  }


  /*
   * Return a new Decimal whose value is `x` modulo `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function mod(x, y) {
    return new this(x).mod(y);
  }


  /*
   * Return a new Decimal whose value is `x` multiplied by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function mul(x, y) {
    return new this(x).mul(y);
  }


  /*
   * Return a new Decimal whose value is `x` raised to the power `y`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The base.
   * y {number|string|Decimal} The exponent.
   *
   */
  function pow(x, y) {
    return new this(x).pow(y);
  }


  /*
   * Returns a new Decimal with a random value equal to or greater than 0 and less than 1, and with
   * `sd`, or `Decimal.precision` if `sd` is omitted, significant digits (or less if trailing zeros
   * are produced).
   *
   * [sd] {number} Significant digits. Integer, 0 to MAX_DIGITS inclusive.
   *
   */
  function random(sd) {
    var d, e, k, n,
      i = 0,
      r = new this(1),
      rd = [];

    if (sd === void 0) sd = this.precision;
    else checkInt32(sd, 1, MAX_DIGITS);

    k = Math.ceil(sd / LOG_BASE);

    if (!this.crypto) {
      for (; i < k;) rd[i++] = Math.random() * 1e7 | 0;

    // Browsers supporting crypto.getRandomValues.
    } else if (crypto.getRandomValues) {
      d = crypto.getRandomValues(new Uint32Array(k));

      for (; i < k;) {
        n = d[i];

        // 0 <= n < 4294967296
        // Probability n >= 4.29e9, is 4967296 / 4294967296 = 0.00116 (1 in 865).
        if (n >= 4.29e9) {
          d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
        } else {

          // 0 <= n <= 4289999999
          // 0 <= (n % 1e7) <= 9999999
          rd[i++] = n % 1e7;
        }
      }

    // Node.js supporting crypto.randomBytes.
    } else if (crypto.randomBytes) {

      // buffer
      d = crypto.randomBytes(k *= 4);

      for (; i < k;) {

        // 0 <= n < 2147483648
        n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 0x7f) << 24);

        // Probability n >= 2.14e9, is 7483648 / 2147483648 = 0.0035 (1 in 286).
        if (n >= 2.14e9) {
          crypto.randomBytes(4).copy(d, i);
        } else {

          // 0 <= n <= 2139999999
          // 0 <= (n % 1e7) <= 9999999
          rd.push(n % 1e7);
          i += 4;
        }
      }

      i = k / 4;
    } else {
      throw Error(cryptoUnavailable);
    }

    k = rd[--i];
    sd %= LOG_BASE;

    // Convert trailing digits to zeros according to sd.
    if (k && sd) {
      n = mathpow(10, LOG_BASE - sd);
      rd[i] = (k / n | 0) * n;
    }

    // Remove trailing words which are zero.
    for (; rd[i] === 0; i--) rd.pop();

    // Zero?
    if (i < 0) {
      e = 0;
      rd = [0];
    } else {
      e = -1;

      // Remove leading words which are zero and adjust exponent accordingly.
      for (; rd[0] === 0; e -= LOG_BASE) rd.shift();

      // Count the digits of the first word of rd to determine leading zeros.
      for (k = 1, n = rd[0]; n >= 10; n /= 10) k++;

      // Adjust the exponent for leading zeros of the first word of rd.
      if (k < LOG_BASE) e -= LOG_BASE - k;
    }

    r.e = e;
    r.d = rd;

    return r;
  }


  /*
   * Return a new Decimal whose value is `x` rounded to an integer using rounding mode `rounding`.
   *
   * To emulate `Math.round`, set rounding to 7 (ROUND_HALF_CEIL).
   *
   * x {number|string|Decimal}
   *
   */
  function round(x) {
    return finalise(x = new this(x), x.e + 1, this.rounding);
  }


  /*
   * Return
   *   1    if x > 0,
   *  -1    if x < 0,
   *   0    if x is 0,
   *  -0    if x is -0,
   *   NaN  otherwise
   *
   * x {number|string|Decimal}
   *
   */
  function sign(x) {
    x = new this(x);
    return x.d ? (x.d[0] ? x.s : 0 * x.s) : x.s || NaN;
  }


  /*
   * Return a new Decimal whose value is the sine of `x`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function sin(x) {
    return new this(x).sin();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic sine of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function sinh(x) {
    return new this(x).sinh();
  }


  /*
   * Return a new Decimal whose value is the square root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function sqrt(x) {
    return new this(x).sqrt();
  }


  /*
   * Return a new Decimal whose value is `x` minus `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function sub(x, y) {
    return new this(x).sub(y);
  }


  /*
   * Return a new Decimal whose value is the sum of the arguments, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * Only the result is rounded, not the intermediate calculations.
   *
   * arguments {number|string|Decimal}
   *
   */
  function sum() {
    var i = 0,
      args = arguments,
      x = new this(args[i]);

    external = false;
    for (; x.s && ++i < args.length;) x = x.plus(args[i]);
    external = true;

    return finalise(x, this.precision, this.rounding);
  }


  /*
   * Return a new Decimal whose value is the tangent of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function tan(x) {
    return new this(x).tan();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic tangent of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function tanh(x) {
    return new this(x).tanh();
  }


  /*
   * Return a new Decimal whose value is `x` truncated to an integer.
   *
   * x {number|string|Decimal}
   *
   */
  function trunc(x) {
    return finalise(x = new this(x), x.e + 1, 1);
  }


  // Create and configure initial Decimal constructor.
  Decimal = clone(DEFAULTS);
  Decimal.prototype.constructor = Decimal;
  Decimal['default'] = Decimal.Decimal = Decimal;

  // Create the internal constants from their string values.
  LN10 = new Decimal(LN10);
  PI = new Decimal(PI);


  // Export.


  // AMD.
  if (typeof define == 'function' && define.amd) {
    define(function () {
      return Decimal;
    });

  // Node and other environments that support module.exports.
  } else if (typeof module != 'undefined' && module.exports) {
    if (typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol') {
      P[Symbol['for']('nodejs.util.inspect.custom')] = P.toString;
      P[Symbol.toStringTag] = 'Decimal';
    }

    module.exports = Decimal;

  // Browser.
  } else {
    if (!globalScope) {
      globalScope = typeof self != 'undefined' && self && self.self == self ? self : window;
    }

    noConflict = globalScope.Decimal;
    Decimal.noConflict = function () {
      globalScope.Decimal = noConflict;
      return Decimal;
    };

    globalScope.Decimal = Decimal;
  }
})(this);

},{}],2:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Instruction Set Bace Class.
*
* @class ElucidatorInstructionSet
*/
class ElucidatorInstructionSet
{
    constructor(pElucidator)
    {
        this.elucidator = pElucidator;

        this.namespace = 'default';
    }

    // Create an empty namespace for instructions and operations if either one doesn't exist
    initializeNamespace(pNamespace)
    {
        if (typeof(pNamespace) == 'string')
        {
            this.namespace = pNamespace;
        }
        if (!this.elucidator.instructionSets.hasOwnProperty(this.namespace))
        {
            this.elucidator.instructionSets[this.namespace.toLowerCase()] = {};
        }
        if (!this.elucidator.operationSets.hasOwnProperty(this.namespace))
        {
            this.elucidator.operationSets[this.namespace.toLowerCase()] = {};
        }
    }

    // Add an instruction to the set
    addInstruction(pInstructionHash, fInstructionFunction)
    {
        if (typeof(pInstructionHash) != 'string')
        {
            this.elucidator.logError(`Attempted to add an instruction with an invalid hash; expected a string but the instruction hash type was ${typeof(pInstructionHash)}`);
            return false;
        }
        if (typeof(fInstructionFunction) != 'function')
        {
            this.elucidator.logError(`Attempted to add an instruction with an invalid function; expected a function but type was ${typeof(fInstructionFunction)}`);
            return false;
        }

        this.elucidator.instructionSets[this.namespace.toLowerCase()][pInstructionHash] = fInstructionFunction;
        return true;
    }

    initializeInstructions()
    {
        // This is where we map in the instructions.
        // If the extending class calls super it will inject a harmless noop into the scope.
        // It isn't recommended to do these inline as lambdas, but this code is generally not expected to be called.
        // Unless the developer wants a noop in their instruction set...........
        this.addInstruction('noop', 
            (pOperation) =>
            {
                pOperation.logInfo('Executing a no-operation operation.');
                return true;
            });

        return true;
    }

    // Add an operation to the set
    addOperation(pOperationHash, pOperation)
    {
        if (typeof(pOperationHash) != 'string')
        {
            this.elucidator.logError(`Attempted to add an operation with an invalid hash; expected a string but the operation hash type was ${typeof(pOperationHash)}`, pOperation);
            return false;
        }
        if (typeof(pOperation) != 'object')
        {
            this.elucidator.logError(`Attempted to add an invalid operation; expected an object data type but the type was ${typeof(pOperation)}`, pOperation);
            return false;
        }
        // Validate the Description subobject, which is key to functioning.
        if (!pOperation.hasOwnProperty("Description"))
        {
            this.elucidator.logError(`Attempted to add an operation with an invalid description; no Description subobject set.`, pOperation);
            return false;
        }
        if (typeof(pOperation.Description) != 'object')
        {
            this.elucidator.logError(`Attempted to add an operation with an invalid description; Description subobject was not an object.  The type was ${typeof(pOperation.Description)}.`, pOperation);
            return false;
        }
        if (typeof(pOperation.Description.Hash) != 'string')
        {
            if (typeof(pOperation.Description.Operation) == 'string')
            {
                // Use the "Operation" as the "Hash"
                pOperation.Description.Hash = pOperation.Description.Operation;
            }
            else
            {
                this.elucidator.logError(`Attempted to add an operation with an invalid description; Description subobject did not contain a valid Hash which is required to call the operation.`, pOperation);
                return false;
            }
        }

        // Now auto create data if it is missing or wrong in the Description
        if ((typeof(pOperation.Description.Namespace) != 'string') || (pOperation.Description.Namespace != this.namespace))
        {
            pOperation.Description.Namespace = this.namespace;
        }
        if (typeof(pOperation.Description.Summary) != 'string')
        {
            pOperation.Description.Summary = `[${pOperation.Description.Namespace}] [${pOperation.Description.Hash}] operation.`;
        }

        // If there are no inputs, or outputs, or steps, add them.
        if (!pOperation.hasOwnProperty('Inputs'))
        {
            pOperation.Inputs = {};
        }
        if (!pOperation.hasOwnProperty('Outputs'))
        {
            pOperation.Outputs = {};
        }
        if (!pOperation.hasOwnProperty('Steps'))
        {
            pOperation.Steps = [];
        }

        // If there are no inputs, or outputs, or steps, add them.
        // TODO: Add a step where we try to load this into Manyfest and see that it's valid.
        if (typeof(pOperation.Inputs) !== 'object')
        {
            this.elucidator.logError(`Attempted to add an operation with an invalid Inputs object.`, pOperation);
            return false;
        }
        // If there are no inputs, or outputs, or steps, add them.
        // TODO: Add a step where we try to load this into Manyfest and see that it's valid.
        if (typeof(pOperation.Outputs) !== 'object')
        {
            this.elucidator.logError(`Attempted to add an operation with an invalid Outputs object.`, pOperation);
            return false;
        }
        if (!Array.isArray(pOperation.Steps))
        {
            this.elucidator.logError(`Attempted to add an operation with an invalid Steps array.`, pOperation);
            return false;
        }


        this.elucidator.operationSets[this.namespace.toLowerCase()][pOperationHash.toLowerCase()] = pOperation;
        return true;
    }

    initializeOperations()
    {
        this.addOperation('noop', 
            {
                "Description":
                {
                    "Operation": "noop",
                    "Description": "No operation - no affect on any data."
                }
            });

        return true;
    }
};

module.exports = ElucidatorInstructionSet;
},{}],3:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Elucidator simple logging shim (for browser and dependency-free running)
*/

const logToConsole = (pLogLine, pLogObject, pLogLevel) =>
{
    let tmpLogLine = (typeof(pLogLine) === 'string') ? pLogLine : '';
    let tmpLogLevel = (typeof(pLogLevel) === 'string') ? pLogLevel : 'INFO';

    console.log(`[Elucidator:${tmpLogLevel}] ${tmpLogLine}`);

    if (pLogObject) console.log(JSON.stringify(pLogObject,null,4)+"\n");
};

const logInfo = (pLogLine, pLogObject) =>
{
    logToConsole(pLogLine, pLogObject, 'Info');
};


const logWarning = (pLogLine, pLogObject) =>
{
    logToConsole(pLogLine, pLogObject, 'Warning');
};


const logError = (pLogLine, pLogObject) =>
{
    logToConsole(pLogLine, pLogObject, 'Error');
};

module.exports = (
{
    logToConsole: logToConsole,
    info: logInfo,
    warning: logWarning,
    error: logError
});
},{}],4:[function(require,module,exports){
// Solution providers are meant to be stateless, and not classes.
// These solution providers are akin to drivers, connecting code libraries or 
// other types of behavior to mapping operations.

let libElucidatorInstructionSet = require('../Elucidator-InstructionSet.js');

class Geometry extends libElucidatorInstructionSet
{
    constructor(pElucidator)
    {
        super(pElucidator);
        this.namespace = 'Geometry';
    }

    // Geometry provides no instructions
    initializeInstructions()
    {
        return true;
    }

    initializeOperations()
    {
        this.addOperation('rectanglearea', require(`./Operations/Geometry-RectangleArea.json`));

        return true;
    }
}

module.exports = Geometry;
},{"../Elucidator-InstructionSet.js":2,"./Operations/Geometry-RectangleArea.json":7}],5:[function(require,module,exports){
// Solution providers are meant to be stateless, and not classes.
// These solution providers are akin to drivers, connecting code libraries or 
// other types of behavior to mapping operations.

let libElucidatorInstructionSet = require('../Elucidator-InstructionSet.js');

const ifInstruction = (pOperation) =>
{
    let tmpLeftValue = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'leftValue');
    let tmpRightValue = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'rightValue');
    let tmpComparator = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'comparator').toString().toLowerCase();

    let tmpComparisonOperator = 'equal';

    // This may eventually come from configuration; for now just leave it here.
    let tmpComparisonOperatorMapping = (
        {
            '==':'equal',
            'eq':'equal',
            'equal':'equal',

            '!=':'notequal',
            'noteq':'notequal',
            'notequal':'notequal',

            '===':'identity',
            'id':'identity',
            'identity':'identity',

            '>':'greaterthan',
            'gt':'greaterthan',
            'greaterthan':'greaterthan',

            '>=':'greaterthanorequal',
            'gte':'greaterthanorequal',
            'greaterthanorequal':'greaterthanorequal',

            '<':'lessthan',
            'lt':'lessthan',
            'lessthan':'lessthan',

            '<=':'lessthanorequal',
            'lte':'lessthanorequal',
            'lessthanorequal':'lessthanorequal'
        });

    if (tmpComparisonOperatorMapping.hasOwnProperty(tmpComparator))
    {
        tmpComparisonOperator = tmpComparisonOperatorMapping[tmpComparator];
    }

    let tmpTrueNamespace = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'trueNamespace');
    let tmpTrueOperation = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'trueOperation');

    let tmpFalseNamespace = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'falseNamespace');
    let tmpFalseOperation = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'falseOperation');

    let tmpTruthiness = null;

    switch(tmpComparisonOperator)
    {
        case 'equal':
            tmpTruthiness = (tmpLeftValue == tmpRightValue);
            break;
        case 'identity':
            tmpTruthiness = (tmpLeftValue === tmpRightValue);
            break;
        case 'notequal':
            tmpTruthiness = (tmpLeftValue != tmpRightValue);
            break;
        case 'greaterthan':
            tmpTruthiness = (tmpLeftValue > tmpRightValue);
            break;
        case 'greaterthanorequal':
            tmpTruthiness = (tmpLeftValue >= tmpRightValue);
            break;
        case 'lessthan':
            tmpTruthiness = (tmpLeftValue < tmpRightValue);
            break;
        case 'lessthanorequal':
            tmpTruthiness = (tmpLeftValue <= tmpRightValue);
            break;
    }

    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'truthinessResult', tmpTruthiness);

    // Now execute the operations (unless it is a noop or a bunk operation)
    // This is, frankly, kindof a mind-blowing amount of recursion possibility.
    // Both of these are falling back on the base solution hash mapping.
    // --> Not certain if this is the correct approach and the only way to tell will be through exercise of this
    if (tmpTruthiness && (typeof(tmpTrueNamespace) == 'string') && (typeof(tmpTrueOperation) == 'string') && (tmpTrueOperation != 'noop'))
    {
        pOperation.Elucidator.solveInternalOperation(tmpTrueNamespace, tmpTrueOperation, pOperation.InputObject, pOperation.OutputObject, pOperation.DescriptionManyfest, pOperation.SolutionContext.InputHashMapping, pOperation.SolutionContext.OutputHashMapping, pOperation.SolutionContext);
    }
    else if ((typeof(tmpFalseNamespace) == 'string') &&  (typeof(tmpFalseOperation) == 'string') && (tmpFalseOperation != 'noop'))
    {
        pOperation.Elucidator.solveInternalOperation(tmpFalseNamespace, tmpFalseOperation, pOperation.InputObject, pOperation.OutputObject, pOperation.DescriptionManyfest, pOperation.SolutionContext.InputHashMapping, pOperation.SolutionContext.OutputHashMapping, pOperation.SolutionContext);
    }

    return true;
};

const executeOperation = (pOperation) =>
{
    let tmpNamespace = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'namespace');
    let tmpOperation = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'operation');

    pOperation.Elucidator.solveInternalOperation(tmpNamespace, tmpOperation, pOperation.InputObject, pOperation.OutputObject, pOperation.DescriptionManyfest, pOperation.SolutionContext.InputHashMapping, pOperation.SolutionContext.OutputHashMapping, pOperation.SolutionContext);

    return true;
}

class Logic extends libElucidatorInstructionSet
{
    constructor(pElucidator)
    {
        super(pElucidator);
        this.namespace = 'Logic';
    }

    initializeInstructions()
    {
        // Logic actually wants a noop instruction!
        super.initializeInstructions();

        this.addInstruction('if', ifInstruction);
        this.addInstruction('execute', executeOperation);

        return true;
    }

    initializeOperations()
    {
        this.addOperation('if', require(`./Operations/Logic-If.json`));
        this.addOperation('execute', require(`./Operations/Logic-Execute.json`));

        return true;
    }
}

module.exports = Logic;
},{"../Elucidator-InstructionSet.js":2,"./Operations/Logic-Execute.json":8,"./Operations/Logic-If.json":9}],6:[function(require,module,exports){
// Solution providers are meant to be stateless, and not classes.
// These solution providers are akin to drivers, connecting code libraries or 
// other types of behavior to mapping operations.

let libElucidatorInstructionSet = require('../Elucidator-InstructionSet.js');

let add = (pOperation) =>
{
    // This could be done in one line, but, would be more difficult to comprehend.
    let tmpA = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'a');
    let tmpB = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'b');
    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'x', tmpA + tmpB);
    return true;
};

let subtract = (pOperation) =>
{
    // This could be done in one line, but, would be more difficult to comprehend.
    let tmpA = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'a');
    let tmpB = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'b');
    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'x', tmpA - tmpB);
    return true;
};

let multiply = (pOperation) =>
{
    // This could be done in one line, but, would be more difficult to comprehend.
    let tmpA = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'a');
    let tmpB = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'b');
    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'x', tmpA * tmpB);
    return true;
};

let divide = (pOperation) =>
{
    // This could be done in one line, but, would be more difficult to comprehend.
    let tmpA = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'a');
    let tmpB = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'b');
    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'x', tmpA / tmpB);
    return true;
};

let aggregate = (pOperation) =>
{
    let tmpA = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'a');

    let tmpObjectType = typeof(tmpA);

    let tmpAggregationValue = 0;

    if (tmpObjectType == 'object')
    {
        if (Array.isArray(tmpA))
        {
            for (let i = 0; i < tmpA.length; i++)
            {
                // If this is an array, enumerate it and try to aggregate each number
                let tmpValue = parseInt(tmpA[i]);

                if (isNaN(tmpValue))
                {
                    pOperation.logError(`Array element index [${i}] could not be parsed as a number; skipping.  (${tmpA[i]})`);
                }
                else
                {
                    tmpAggregationValue += tmpValue;
                    pOperation.logInfo(`Adding element [${i}] value ${tmpValue} totaling: ${tmpAggregationValue}`)
                }
            }
        }
        else
        {
            let tmpObjectKeys = Object.keys(tmpA);
            for (let i = 0; i < tmpObjectKeys.length; i++)
            {
                let tmpValue = parseInt(tmpA[tmpObjectKeys[i]]);

                if (isNaN(tmpValue))
                {
                    pOperation.logError(`Object property [${tmpObjectKeys[i]}] could not be parsed as a number; skipping.  (${tmpA[tmpObjectKeys[i]]})`);
                }
                else
                {
                    tmpAggregationValue += tmpValue;
                    pOperation.logInfo(`Adding object property [${tmpObjectKeys[i]}] value ${tmpValue} totaling: ${tmpAggregationValue}`)
                }
            }
        }
    }
    else
    {
        let tmpValue = parseInt(tmpA);

        if (isNaN(tmpValue))
        {
            pOperation.logError(`Direct value could not be parsed as a number; skipping.  (${tmpA})`);
        }
        else
        {
            tmpAggregationValue += tmpValue;
        }
    }
    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'x', tmpAggregationValue);
    return true;
};

class MathJavascript extends libElucidatorInstructionSet
{
    constructor(pElucidator)
    {
        super(pElucidator);
        this.namespace = 'Math';
    }

    initializeInstructions()
    {
        this.addInstruction('add', add);

        this.addInstruction('subtract', subtract);
        this.addInstruction('sub', subtract);

        this.addInstruction('multiply', multiply);
        this.addInstruction('mul', multiply);

        this.addInstruction('divide', divide);
        this.addInstruction('div', divide);

        this.addInstruction('aggregate', aggregate);

        return true;
    }

    initializeOperations()
    {
        this.addOperation('add', require(`./Operations/Math-Add.json`));
        this.addOperation('subtract', require(`./Operations/Math-Subtract.json`));
        this.addOperation('multiply', require(`./Operations/Math-Multiply.json`));
        this.addOperation('divide', require(`./Operations/Math-Divide.json`));

        this.addOperation('aggregate', require(`./Operations/Math-Aggregate.json`));

        return true;
    }
}

module.exports = MathJavascript;
},{"../Elucidator-InstructionSet.js":2,"./Operations/Math-Add.json":10,"./Operations/Math-Aggregate.json":11,"./Operations/Math-Divide.json":12,"./Operations/Math-Multiply.json":13,"./Operations/Math-Subtract.json":14}],7:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "Geometry",
		"Operation": "RectangleArea",
		"Synopsis": "Solve for the area of a rectangle:  Area = Width * Height"
	},

	"Inputs": 
	{
		"Width": { "Hash":"Width", "Type":"Number" },
		"Height": { "Hash":"Height", "Type":"Number" }
	},

	"Outputs":
	{
		"Area": { "Hash":"Area", "Name": "Area of the Rectangle"},
		"Ratio": { "Hash":"Ratio", "Name": "The Ratio between the Width and the Height" }
	},
	
	"Log":
	{
		"PreOperation": "Solve for [ {{Name:Area}} ] based on [ {{Name:Width}} ] and [ {{Name:Height}} ].",
		"PostOperation": "Operation complete; [ {{Name:Area}} ] = {{InputValue:Width}} * {{InputValue:Height}} = {{OutputValue:Area}}"
	},

	"Steps":
	[
		{
			"Namespace": "PreciseMath",
			"Instruction": "multiply",
			"InputHashAddressMap": 
				{
					"a": "Width",
					"b": "Height"
				},
			"OutputHashAddressMap":
				{
					"x": "Area"
				}
		},
		{
			"Namespace": "PreciseMath",
			"Instruction": "divide",
			"InputHashAddressMap": 
				{
					"a": "Width",
					"b": "Height"
				},
			"OutputHashAddressMap":
				{
					"x": "Ratio"
				}
		}
	]
}
},{}],8:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "Logic",
		"Operation": "Execute",
		"Synopsis": "Execute an operation based on namespace and operation."
	},

	"Inputs": 
	{
		"namespace": { "Hash": "namespace", "Type": "string", "Default":"logic" },
		"operation": { "Hash": "operation", "Type": "string", "Default":"noop" }
	},

	"Outputs":
	{
	},
	
	"Log":
	{
		"PreOperation": "Execute the {{InputValue:operation}} operation in namespace {{InputValue:namespace}}.",
		"PostOperation": "Operation [{{InputValue:namespace}}:{{InputValue:operation}}] execution complete."
	},

	"Steps":
	[
		{
			"Namespace": "Logic",
			"Instruction": "execute"
		}
	]
}
},{}],9:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "Logic",
		"Operation": "If",
		"Synopsis": "Comparison-based if of leftValue and RightValue based on comparator.  Executes trueNamespace:trueOperation or falseNamespace:falseOperation based on truthiness of result.  Also outputs a true or false to truthinessResult."
	},

	"Inputs": 
	{
		"leftValue": { "Hash":"leftValue", "Type":"Any" },
		"rightValue": { "Hash":"rightValue", "Type":"Any", "Default": true },
		"comparator": { "Hash":"comparator", "Type":"String", "Default":"==" },

		"trueNamespace": {"Hash":"trueNamespace", "Type":"String", "Default":"logic" },
		"trueOperation": {"Hash":"trueOperation", "Type":"String", "Default":"noop" },

		"falseNamespace": {"Hash":"falseNamespace", "Type":"String", "Default":"logic" },
		"falseOperation": {"Hash":"falseOperation", "Type":"String", "Default":"noop" }
	},

	"Outputs":
	{
		"truthinessResult": { "Hash": "truthinessResult", "Type": "Boolean" }
	},
	
	"Log":
	{
		"PreOperation": "Compare {{Name:leftValue}} and {{Name:rightValue}} with the {{InputValue:comparator}} operator, storing the truthiness in {{Name:truthinessResult}}.",
		"PostOperation": "Operation complete: {{InputValue:leftValue}} {{InputValue:comparator}} {{InputValue:rightValue}} evaluated to {{OutputValue:truthinessResult}}"
	},

	"Steps":
	[
		{
			"Namespace": "Logic",
			"Instruction": "If"
		}
	]
}
},{}],10:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "Math",
		"Operation": "Add",
		"Synopsis": "Add two numbers:  x = a + b"
	},

	"Inputs": 
	{
		"a": { "Hash": "a", "Type": "Number" },
		"b": { "Hash": "b", "Type": "Number" }
	},

	"Outputs":
	{
		"x": { "Hash": "x", "Type": "Number" }
	},
	
	"Log":
	{
		"PreOperation": "Add {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.",
		"PostOperation": "Operation complete: {{Name:x}} = {{InputValue:a}} + {{InputValue:b}} = {{OutputValue:x}}"		
	},

	"Steps":
	[
		{
			"Namespace": "Math",
			"Instruction": "add"
		}
	]
}
},{}],11:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "Math",
		"Operation": "Aggregate",
		"Synopsis": "Aggregate a set of numbers (from array or object address):  x = a + b + ... + z"
	},

	"Inputs": 
	{
		"a": { "Hash": "a", "Type": "Number" }
	},

	"Outputs":
	{
		"x": { "Hash": "x", "Type": "Number" }
	},
	
	"Log":
	{
		"PreOperation": "Aggregate all numeric values in {{Name:a}}, storing the resultant in {{Name:x}}.",
		"PostOperation": "Operation complete: {{Name:x}} = {{OutputValue:x}}"		
	},

	"Steps":
	[
		{
			"Namespace": "Math",
			"Instruction": "aggregate"
		}
	]
}
},{}],12:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "Math",
		"Operation": "Divide",
		"Synopsis": "Divide two numbers:  x = a / b"
	},

	"Inputs": 
	{
		"a": { "Hash": "a", "Type": "Number" },
		"b": { "Hash": "b", "Type": "Number" }
	},

	"Outputs":
	{
		"x": { "Hash": "x", "Type": "Number" }
	},
	
	"Log":
	{
		"PreOperation": "Divide {{Name:a}} over {{Name:b}}, storing the value in {{Name:x}}.",
		"PostOperation": "Operation complete: {{Name:x}} = {{InputValue:a}} / {{InputValue:b}} = {{OutputValue:x}}"		
	},

	"Steps":
	[
		{
			"Namespace": "Math",
			"Instruction": "divide"
		}
	]
}
},{}],13:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "Math",
		"Operation": "Multiply",
		"Synopsis": "Multiply two numbers:  x = a * b"
	},

	"Inputs": 
	{
		"a": { "Hash": "a", "Type": "Number" },
		"b": { "Hash": "b", "Type": "Number" }
	},

	"Outputs":
	{
		"x": { "Hash": "x", "Type": "Number" }
	},
	
	"Log":
	{
		"PreOperation": "Multiply {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.",
		"PostOperation": "Operation complete: {{Name:x}} = {{InputValue:a}} * {{InputValue:b}} = {{OutputValue:x}}"		
	},

	"Steps":
	[
		{
			"Namespace": "Math",
			"Instruction": "multiply"
		}
	]
}
},{}],14:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "Math",
		"Operation": "Subtract",
		"Synopsis": "Subtract two numbers:  x = a - b"
	},

	"Inputs": 
	{
		"a": { "Hash": "a", "Type": "Number" },
		"b": { "Hash": "b", "Type": "Number" }
	},

	"Outputs":
	{
		"x": { "Hash": "x", "Type": "Number" }
	},
	
	"Log":
	{
		"PreOperation": "Subtract {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.",
		"PostOperation": "Operation complete: {{Name:x}} = {{InputValue:a}} - {{InputValue:b}} = {{OutputValue:x}}"		
	},

	"Steps":
	[
		{
			"Namespace": "Math",
			"Instruction": "subtract"
		}
	]
}
},{}],15:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "PreciseMath",
		"Operation": "Add",
		"Synopsis": "Precisely add two numbers:  x = a + b"
	},

	"Inputs": 
	{
		"a": { "Hash": "a", "Type": "Number" },
		"b": { "Hash": "b", "Type": "Number" }
	},

	"Outputs":
	{
		"x": { "Hash": "x", "Type": "Number" }
	},
	
	"Log":
	{
		"PreOperation": "Add {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.",
		"PostOperation": "Operation complete: {{Name:x}} = {{InputValue:a}} + {{InputValue:b}} = {{OutputValue:x}}"		
	},

	"Steps":
	[
		{
			"Namespace": "PreciseMath",
			"Instruction": "add"
		}
	]
}
},{}],16:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "PreciseMath",
		"Operation": "Aggregate",
		"Synopsis": "Precisely aggregate a set of numbers (from array or object address):  x = a + b + ... + z"
	},

	"Inputs": 
	{
		"a": { "Hash": "a", "Type": "Number" }
	},

	"Outputs":
	{
		"x": { "Hash": "x", "Type": "Number" }
	},
	
	"Log":
	{
		"PreOperation": "Aggregate all numeric values in {{Name:a}}, storing the resultant in {{Name:x}}.",
		"PostOperation": "Operation complete: {{Name:x}} = {{OutputValue:x}}"		
	},

	"Steps":
	[
		{
			"Namespace": "PreciseMath",
			"Instruction": "aggregate"
		}
	]
}
},{}],17:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "PreciseMath",
		"Operation": "Divide",
		"Synopsis": "Precisely divide two numbers:  x = a / b"
	},

	"Inputs": 
	{
		"a": { "Hash": "a", "Type": "Number" },
		"b": { "Hash": "b", "Type": "Number" }
	},

	"Outputs":
	{
		"x": { "Hash": "x", "Type": "Number" }
	},
	
	"Log":
	{
		"PreOperation": "Divide {{Name:a}} over {{Name:b}}, storing the value in {{Name:x}}.",
		"PostOperation": "Operation complete: {{Name:x}} = {{InputValue:a}} / {{InputValue:b}} = {{OutputValue:x}}"		
	},

	"Steps":
	[
		{
			"Namespace": "PreciseMath",
			"Instruction": "divide"
		}
	]
}
},{}],18:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "PreciseMath",
		"Operation": "Multiply",
		"Synopsis": "Precisely multiply two numbers:  x = a * b"
	},

	"Inputs": 
	{
		"a": { "Hash": "a", "Type": "Number" },
		"b": { "Hash": "b", "Type": "Number" }
	},

	"Outputs":
	{
		"x": { "Hash": "x", "Type": "Number" }
	},
	
	"Log":
	{
		"PreOperation": "Multiply {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.",
		"PostOperation": "Operation complete: {{Name:x}} = {{InputValue:a}} * {{InputValue:b}} = {{OutputValue:x}}"		
	},

	"Steps":
	[
		{
			"Namespace": "PreciseMath",
			"Instruction": "multiply"
		}
	]
}
},{}],19:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "PreciseMath",
		"Operation": "Subtract",
		"Synopsis": "Precisely subtract two numbers:  x = a - b"
	},

	"Inputs": 
	{
		"a": { "Hash": "a", "Type": "Number" },
		"b": { "Hash": "b", "Type": "Number" }
	},

	"Outputs":
	{
		"x": { "Hash": "x", "Type": "Number" }
	},
	
	"Log":
	{
		"PreOperation": "Subtract {{Name:a}} and {{Name:b}}, storing the value in {{Name:x}}.",
		"PostOperation": "Operation complete: {{Name:x}} = {{InputValue:a}} - {{InputValue:b}} = {{OutputValue:x}}"		
	},

	"Steps":
	[
		{
			"Namespace": "PreciseMath",
			"Instruction": "subtract"
		}
	]
}
},{}],20:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "String",
		"Operation": "Replace",
		"Synopsis": "Replace all instances of searchFor with replaceWith in inputString"
	},

	"Inputs": 
	{
		"inputString": { "Hash": "inputString", "Type": "String" },
		"searchFor": { "Hash": "searchFor", "Type": "String" },
		"replaceWith": { "Hash": "replaceWith", "Type": "String" }
	},

	"Outputs":
	{
		"outputString": { "Hash": "outputString", "Type": "String" }
	},
	
	"Log":
	{
		"PreOperation": "Search for [{{InputValue:searchFor}}] and replace it with [{{InputValue:replaceWith}}] in [{{InputValue:inputString}}].",
		"PostOperation": "Operation complete: {{Name:outputString}} = [{{OutputValue:outputString}}] from [{{InputValue:inputString}}] replacing [{{InputValue:searchFor}}] with [{{InputValue:replaceWith}}]."
	},

	"Steps":
	[
		{
			"Namespace": "String",
			"Instruction": "replace"
		}
	]
}
},{}],21:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "String",
		"Operation": "Substring",
		"Synopsis": "Get all characters between indexStart and indexEnd (optional) for a given inputString."
	},

	"Inputs": 
	{
		"inputString": { "Hash": "inputString", "Type": "String" },
		"indexStart": { "Hash": "indexStart", "Type": "Number", "Default":0 },
		"indexEnd": { "Hash": "indexEnd", "Type": "String", "Default":null }
	},

	"Outputs":
	{
		"outputString": { "Hash": "outputString", "Type": "String" }
	},
	
	"Log":
	{
		"PreOperation": "Get all characters between {{InputValue:indexStart}} and {{InputValue:indexEnd}} in [{{InputValue:inputString}}].",
		"PostOperation": "Operation complete: {{Name:outputString}} = [{{OutputValue:outputString}}] from [{{InputValue:inputString}}] between {{InputValue:indexStart}} and {{InputValue:indexEnd}}."
	},

	"Steps":
	[
		{
			"Namespace": "String",
			"Instruction": "substring"
		}
	]
}
},{}],22:[function(require,module,exports){
module.exports={
	"Description":
	{
		"Namespace": "String",
		"Operation": "Trim",
		"Synopsis": "Trim whitespace off the end of string in inputString, putting the result in outputString"
	},

	"Inputs": 
	{
		"inputString": { "Hash": "inputString", "Type": "String" }
	},

	"Outputs":
	{
		"outputString": { "Hash": "outputString", "Type": "String" }
	},
	
	"Log":
	{
		"PreOperation": "Trim the whitespace from value [{{InputValue:inputString}}].",
		"PostOperation": "Operation complete: {{Name:outputString}} = [{{OutputValue:outputString}}] from [{{InputValue:inputString}}]"
	},

	"Steps":
	[
		{
			"Namespace": "String",
			"Instruction": "trim"
		}
	]
}
},{}],23:[function(require,module,exports){
let libElucidatorInstructionSet = require('../Elucidator-InstructionSet.js');

const libDecimal = require('decimal.js');

let add = (pOperation) =>
{
    // This could be done in one line, but, would be more difficult to comprehend.
    let tmpA = new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'a'));
    let tmpB = new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'b'));
    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'x', tmpA.plus(tmpB).toString());
    return true;
};

let subtract = (pOperation) =>
{
    // This could be done in one line, but, would be more difficult to comprehend.
    let tmpA = new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'a'));
    let tmpB = new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'b'));
    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'x', tmpA.sub(tmpB).toString());
    return true;
};

let multiply = (pOperation) =>
{
    // This could be done in one line, but, would be more difficult to comprehend.
    let tmpA = new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'a'));
    let tmpB = new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'b'));
    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'x', tmpA.mul(tmpB).toString());
    return true;
};

let divide = (pOperation) =>
{
    // This could be done in one line, but, would be more difficult to comprehend.
    let tmpA = new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'a'));
    let tmpB = new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'b'));
    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'x', tmpA.div(tmpB).toString());
    return true;
};

let aggregate = (pOperation) =>
{
    let tmpA = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'a');

    let tmpObjectType = typeof(tmpA);

    let tmpAggregationValue = new libDecimal(0);

    if (tmpObjectType == 'object')
    {
        if (Array.isArray(tmpA))
        {
            for (let i = 0; i < tmpA.length; i++)
            {
                // If this is an array, enumerate it and try to aggregate each number
                let tmpValue = new libDecimal(tmpA[i]);

                if (isNaN(tmpValue))
                {
                    pOperation.logError(`Array element index [${i}] could not be parsed as a number by Decimal.js; skipping.  (${tmpA[i]})`);
                }
                else
                {
                    tmpAggregationValue = tmpAggregationValue.plus(tmpValue);
                    pOperation.logInfo(`Adding element [${i}] value ${tmpValue} totaling: ${tmpAggregationValue}`)
                }
            }
        }
        else
        {
            let tmpObjectKeys = Object.keys(tmpA);
            for (let i = 0; i < tmpObjectKeys.length; i++)
            {
                let tmpValue = new libDecimal(tmpA[tmpObjectKeys[i]]);

                if (isNaN(tmpValue))
                {
                    pOperation.logError(`Object property [${tmpObjectKeys[i]}] could not be parsed as a number; skipping.  (${tmpA[tmpObjectKeys[i]]})`);
                }
                else
                {
                    tmpAggregationValue = tmpAggregationValue.plus(tmpValue);
                    pOperation.logInfo(`Adding object property [${tmpObjectKeys[i]}] value ${tmpValue} totaling: ${tmpAggregationValue}`)
                }
            }
        }
    }
    else
    {
        let tmpValue = new libDecimal(tmpA);

        if (isNaN(tmpValue))
        {
            pOperation.logError(`Direct value could not be parsed as a number; skipping.  (${tmpA})`);
        }
        else
        {
            tmpAggregationValue = tmpValue;
        }
    }
    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'x', tmpAggregationValue.toString());
    return true;
};

let toFraction = (pOperation) =>
{
    // This could be done in one line, but, would be more difficult to comprehend.
    let tmpA = new libDecimal(pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'a'));
    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'x', tmpA.toFraction().toString());
    return true;
};


class PreciseMath extends libElucidatorInstructionSet
{
    constructor(pElucidator)
    {
        super(pElucidator);
        this.namespace = 'PreciseMath';
    }

    initializeInstructions()
    {
        this.addInstruction('add', add);

        this.addInstruction('subtract', subtract);
        this.addInstruction('sub', subtract);

        this.addInstruction('multiply', multiply);
        this.addInstruction('mul', multiply);

        this.addInstruction('divide', divide);
        this.addInstruction('div', divide);

        this.addInstruction('aggregate', aggregate);

		this.addInstruction('tofraction', toFraction);

        return true;
    }

    initializeOperations()
    {
        this.addOperation('add', require(`./Operations/PreciseMath-Add.json`));
        this.addOperation('subtract', require(`./Operations/PreciseMath-Subtract.json`));
        this.addOperation('multiply', require(`./Operations/PreciseMath-Multiply.json`));
        this.addOperation('divide', require(`./Operations/PreciseMath-Divide.json`));
        this.addOperation('aggregate', require('./Operations/PreciseMath-Aggregate.json'));

        return true;
    }
}

module.exports = PreciseMath;
},{"../Elucidator-InstructionSet.js":2,"./Operations/PreciseMath-Add.json":15,"./Operations/PreciseMath-Aggregate.json":16,"./Operations/PreciseMath-Divide.json":17,"./Operations/PreciseMath-Multiply.json":18,"./Operations/PreciseMath-Subtract.json":19,"decimal.js":1}],24:[function(require,module,exports){
// Solution providers are meant to be stateless, and not classes.
// These solution providers are akin to drivers, connecting code libraries or 
// other types of behavior to mapping operations.

let libElucidatorInstructionSet = require('../Elucidator-InstructionSet.js');

let trim = (pOperation) =>
{
    let tmpInputString = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'inputString');

    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'outputString', tmpInputString.trim());

    return true;
};

let replace = (pOperation) =>
{
    let tmpInputString = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'inputString');
    let tmpSearchFor = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'searchFor');
    let tmpReplaceWith = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'replaceWith');

    pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'outputString', tmpInputString.replace(tmpSearchFor, tmpReplaceWith));

    return true;
};

let substring = (pOperation) =>
{
    let tmpInputString = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'inputString');
    let indexStart = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'indexStart');
    let indexEnd = pOperation.InputManyfest.getValueByHash(pOperation.InputObject, 'indexEnd');

    if (indexEnd != null)
    {
        pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'outputString', tmpInputString.substring(indexStart, indexEnd));
    }
    else
    {
        pOperation.OutputManyfest.setValueByHash(pOperation.OutputObject, 'outputString', tmpInputString.substring(indexStart));
    }

    return true;
};

class StringOperations extends libElucidatorInstructionSet
{
    constructor(pElucidator)
    {
        super(pElucidator);
        this.namespace = 'String';
    }

    initializeInstructions()
    {
        this.addInstruction('trim', trim);
        this.addInstruction('replace', replace);
        this.addInstruction('substring', substring);

        return true;
    }

    initializeOperations()
    {
        this.addOperation('trim', require(`./Operations/String-Trim.json`));
        this.addOperation('replace', require(`./Operations/String-Replace.json`));
        this.addOperation('substring', require(`./Operations/String-Substring.json`));

        return true;
    }
}

module.exports = StringOperations;
},{"../Elucidator-InstructionSet.js":2,"./Operations/String-Replace.json":20,"./Operations/String-Substring.json":21,"./Operations/String-Trim.json":22}],25:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
const libSimpleLog = require('./Elucidator-LogToConsole.js');
const libManyfest = require('manyfest');
const libPrecedent = require('precedent');

const libElucidatorInstructionSet = require('./Elucidator-InstructionSet.js');

/**
* Elucidator object address-based descriptions and manipulations.
*
* @class Elucidator
*/
class Elucidator
{
    constructor(pOperations, fInfoLog, fErrorLog)
    {
        // Wire in logging
        this.logInfo = (typeof(fInfoLog) === 'function') ? fInfoLog : libSimpleLog.info;
        this.logWarning = (typeof(fWarningLog) === 'function') ? fWarningLog : libSimpleLog.warning;
        this.logError = (typeof(fErrorLog) === 'function') ? fErrorLog : libSimpleLog.error;

		// Instructions are the basic building blocks for operations
		this.instructionSets = {};

		// Operations are the solvers that can be called (instructions can't be called directly)
		// These can be added at run-time as well
		this.operationSets = {};

		// Decide later how to make this truly unique.
		this.UUID = 0;

		this.loadDefaultInstructionSets();

		if (pOperations)
		{
			let tmpSolverHashes = Object.keys(pOperations);
			for (let i = 0; i < tmpSolverHashes.length; i++)
			{
				this.addOperation('Custom',tmpSolverHashes[i], pOperations[tmpSolverHashes[i]]);
			}
		}
    }

	// Load an instruction set
	loadInstructionSet(cInstructionSet)
	{
		let tmpInstructionSet = new cInstructionSet(this);
		// Setup the namespace
		tmpInstructionSet.initializeNamespace();
		tmpInstructionSet.initializeInstructions();
		tmpInstructionSet.initializeOperations();
	}

	loadDefaultInstructionSets()
	{
		// The javascript math instructions and operations
		// These provide the "Math" namespace
		this.loadInstructionSet(require(`./InstructionSets/Math-Javascript.js`));

		// A precision javascript math library that is consistent across browsers, stable and without mantissa issues
		// Uses Decimal.js
		// These provide the "PreciseMath" namespace
		this.loadInstructionSet(require(`./InstructionSets/PreciseMath-Decimal.js`));

		// The abstract geometry instructions and operations (rectangle area, circle area, etc.)
		// These provide the "Geometry" namespace
		this.loadInstructionSet(require(`./InstructionSets/Geometry.js`));

		// The logic operations (if, execution of instructions, etc.)
		// These provide the "Logic" namespace
		this.loadInstructionSet(require(`./InstructionSets/Logic.js`));

		// Basic string manipulation instructions and operations
		// These provide the "String" namespace
		this.loadInstructionSet(require(`./InstructionSets/String.js`));
	}

	operationExists(pNamespace, pOperationHash)
	{
		if ((typeof(pNamespace) != 'string') || (typeof(pOperationHash) != 'string'))
		{
			return false;
		}

		let tmpNamespace = pNamespace.toLowerCase();
		return (this.operationSets.hasOwnProperty(tmpNamespace) && this.operationSets[tmpNamespace].hasOwnProperty(pOperationHash.toLowerCase()));
	}

	addOperation(pNamespace, pOperationHash, pOperation)
	{
        if (typeof(pNamespace) != 'string')
        {
            this.logError(`Attempted to add an operation at runtime via Elucidator.addOperation with an invalid namespace; expected a string but the type was ${typeof(pNamespace)}`, pOperation);
            return false;
        }

		let tmpOperationInjector = new libElucidatorInstructionSet(this);
		tmpOperationInjector.initializeNamespace(pNamespace);

		return tmpOperationInjector.addOperation(pOperationHash, pOperation);
	}

	solveInternalOperation(pNamespace, pOperationHash, pInputObject, pOutputObject, pDescriptionManyfest, pInputAddressMapping, pOutputAddressMapping, pSolutionContext)
	{
		if (!this.operationExists(pNamespace, pOperationHash))
		{
			this.logError(`Attempted to solveInternalOperation for namespace ${pNamespace} operationHash ${pOperationHash} but the operation was not found.`);
			// TODO: Should this return something with an error log populated?
			return false;
		}
		let tmpOperation = this.operationSets[pNamespace.toLowerCase()][pOperationHash.toLowerCase()];
		return this.solveOperation(tmpOperation, pInputObject, pOutputObject, pDescriptionManyfest, pInputAddressMapping, pOutputAddressMapping, pSolutionContext);
	}

	solveOperation(pOperationObject, pInputObject, pOutputObject, pDescriptionManyfest, pInputAddressMapping, pOutputAddressMapping, pSolutionContext)
	{
		let tmpOperation = JSON.parse(JSON.stringify(pOperationObject));

		if (typeof(pInputObject) != 'object')
		{
            this.logError(`Attempted to run a solve but the passed in Input was not an object.  The type was ${typeof(pInputObject)}.`);
			return false;
		}
		let tmpInputObject = pInputObject;

		// Default to reusing the input object as the output object.
		let tmpOutputObject = tmpInputObject;

		// This is how recursive solutions bind their context together.
		let tmpSolutionContext = pSolutionContext;
		if (typeof(tmpSolutionContext) === 'undefined')
		{
			tmpSolutionContext = (
				{
					"SolutionGUID": `Solution-${this.UUID++}`, 
					"SolutionBaseNamespace": pOperationObject.Description.Namespace,
					"SolutionBaseOperation": pOperationObject.Description.Operation,
					"SolutionLog": []
				});
			
			// This is the root operation, see if there are Inputs and Outputs created ... if not, create them.
			if (!tmpOperation.hasOwnProperty('Inputs'))
			{
				tmpOperation.Inputs = {};
			}
			if (!tmpOperation.hasOwnProperty('Outputs'))
			{
				tmpOperation.Outputs = {};
			}

			// This is the root Operation, see if there is a hash translation available for either side (input or output)
			if (tmpOperation.hasOwnProperty('InputHashTranslationTable'))
			{
				tmpSolutionContext.InputHashMapping = JSON.parse(JSON.stringify(tmpOperation.InputHashTranslationTable));
			}
			else
			{
				tmpSolutionContext.InputHashMapping = {};
			}

			if (tmpOperation.hasOwnProperty('OutputHashTranslationTable'))
			{
				tmpSolutionContext.OutputHashMapping = JSON.parse(JSON.stringify(tmpOperation.OutputHashTranslationTable));
			}

			if ((typeof(pOutputObject) != 'object')
				&& (typeof(tmpOutputHashMapping) == 'undefined') 
				&& (typeof(tmpInputHashMapping) != 'undefined'))
			{
				// Reuse the input hash mapping if:
				//   1) we auto-mapped the input hash mapping to the output because only an input object was supplied
				//   2) there *was not* an output hash mapping supplied
				//   3) there *was* an input hash mapping supplied
				//
				// This seems simple at first but exposes some really interesting behaviors in terms of
				// reusing the same object and schema for input and output, but having different hash
				// mappings for each of them.
				tmpSolutionContext.OutputHashMapping = tmpSolutionContext.InputHashMapping;
			}
		}

		if (typeof(pOutputObject) == 'object')
		{
			// If the call defined an explicit, different output object from the input object use that instead.
			tmpOutputObject = pOutputObject;
		}

		let tmpDescriptionManyfest = false;
		if (typeof(pDescriptionManyfest) === 'undefined')
		{
			// We are going to use this for some clever schema manipulations, then recreate the object
			tmpDescriptionManyfest = new libManyfest();
			// Synthesize a manyfest from the Input and Output properties
			let tmpManyfestSchema = (
				{
					Scope: 'Solver Data Part Descriptions',
					Descriptors: tmpDescriptionManyfest.schemaManipulations.mergeAddressMappings(tmpOperation.Inputs, tmpOperation.Outputs)
				});
			}
		else
		{
			// Clone the passed-in manyfest, so mutations do not alter the upstream version
			tmpDescriptionManyfest = pDescriptionManyfest.clone();
		}
		// Now that the operation object has been created uniquely, apply any passed-in address-hash and hash-hash remappings
		if (pInputAddressMapping)
		{
			tmpDescriptionManyfest.schemaManipulations.resolveAddressMappings(tmpOperation.Inputs, pInputAddressMapping);
		}
		if (pOutputAddressMapping)
		{
			tmpDescriptionManyfest.schemaManipulations.resolveAddressMappings(tmpOperation.Inputs, pOutputAddressMapping);
		}
		if (tmpSolutionContext.InputHashMapping)
		{
			tmpDescriptionManyfest.hashTranslations.addTranslation(tmpSolutionContext.InputHashMapping);
		}
		if (tmpSolutionContext.OutputHashMapping)
		{
			tmpDescriptionManyfest.hashTranslations.addTranslation(tmpSolutionContext.OutputHashMapping);			
		}


		// Set some kind of unique identifier for the operation
		tmpOperation.UUID = this.UUID++;
		tmpOperation.SolutionContext = tmpSolutionContext;

		if (tmpOperation.Description.Synopsys)
		{
			tmpSolutionContext.SolutionLog.push(`[${tmpOperation.UUID}]: Solver running operation ${tmpOperation.Description.Synopsys}`);
		}

		let tmpPrecedent = new libPrecedent();
		tmpPrecedent.addPattern('{{Name:', '}}',
			(pHash)=>
			{
				let tmpHash = pHash.trim();
				let tmpDescriptor = tmpDescriptionManyfest.getDescriptorByHash(tmpHash)

				// Return a human readable value
				if ((typeof(tmpDescriptor) == 'object')  && tmpDescriptor.hasOwnProperty('Name'))
				{
					return tmpDescriptor.Name;
				}
				else
				{
					return tmpHash;
				}
			});
		tmpPrecedent.addPattern('{{InputValue:', '}}',
			(pHash)=>
			{
				let tmpHash = pHash.trim();
				return tmpDescriptionManyfest.getValueByHash(tmpInputObject,tmpHash);
			});
		tmpPrecedent.addPattern('{{OutputValue:', '}}',
			(pHash)=>
			{
				let tmpHash = pHash.trim();
				return tmpDescriptionManyfest.getValueByHash(tmpOutputObject,tmpHash);
			});

		if (tmpOperation.hasOwnProperty('Log') && tmpOperation.Log.hasOwnProperty('PreOperation'))
		{
			if (typeof(tmpOperation.Log.PreOperation) == 'string')
			{
				tmpOperation.SolutionContext.SolutionLog.push(tmpPrecedent.parseString(tmpOperation.Log.PreOperation));
			}
			else if (Array.isArray(tmpOperation.Log.PreOperation))
			{
				for (let i = 0; i < tmpOperation.Log.PreOperation.length; i++)
				{
					if ((typeof(tmpOperation.Log.PreOperation[i]) == 'string'))
					{
						tmpOperation.SolutionContext.SolutionLog.push(tmpPrecedent.parseString(tmpOperation.Log.PreOperation[i]));
					}
				}
			}
		}

		// Now step through each operation and solve
		for (let i = 0; i < tmpOperation.Steps.length; i++)
		{
			let tmpStep = tmpOperation.Steps[i];

			// Instructions are always endpoints -- they *do not* recurse.
			if (tmpStep.hasOwnProperty('Instruction'))
			{
				let tmpInputSchema = (
					{
						"Scope": "InputObject",
						"Descriptors": JSON.parse(JSON.stringify(tmpOperation.Inputs))
					});
				// Perform step-specific address mappings.
				tmpDescriptionManyfest.schemaManipulations.resolveAddressMappings(tmpInputSchema.Descriptors, tmpStep.InputHashAddressMap);
				let tmpInputManyfest = new libManyfest(tmpInputSchema);
				if (tmpSolutionContext.InputHashMapping)
				{
					tmpInputManyfest.hashTranslations.addTranslation(tmpSolutionContext.InputHashMapping);
				}

				let tmpOutputSchema = (
					{
						"Scope": "OutputObject",
						"Descriptors": JSON.parse(JSON.stringify(tmpOperation.Outputs))
					});
					tmpDescriptionManyfest.schemaManipulations.resolveAddressMappings(tmpOutputSchema.Descriptors, tmpStep.OutputHashAddressMap);
				let tmpOutputManyfest = new libManyfest(tmpOutputSchema);
				if (tmpSolutionContext.OutputHashMapping)
				{
					tmpOutputManyfest.hashTranslations.addTranslation(tmpSolutionContext.OutputHashMapping);
				}
	
				// Construct the instruction state object
				let tmpInstructionState = (
				{
					Elucidator: this,

					Namespace: tmpStep.Namespace.toLowerCase(),
					Instruction: tmpStep.Instruction.toLowerCase(),

					Operation: tmpOperation,

					SolutionContext: tmpSolutionContext,

					DescriptionManyfest: tmpDescriptionManyfest,

					InputObject: tmpInputObject,
					InputManyfest: tmpInputManyfest,

					OutputObject: tmpOutputObject,
					OutputManyfest: tmpOutputManyfest
				});

				tmpInstructionState.logError = 
					(pMessage) => 
					{
						tmpSolutionContext.SolutionLog.push(`[ERROR][Operation ${tmpInstructionState.Operation.Description.Namespace}:${tmpInstructionState.Operation.Description.Hash} - Step #${i}:${tmpStep.Namespace}:${tmpStep.Instruction}] ${pMessage}`)
					};

				tmpInstructionState.logInfo = 
					(pMessage) => 
					{
						tmpSolutionContext.SolutionLog.push(`[INFO][Operation ${tmpInstructionState.Operation.Description.Namespace}:${tmpInstructionState.Operation.Description.Hash} - Step #${i}:${tmpStep.Namespace}:${tmpStep.Instruction}] ${pMessage}`)
					};

				if (this.instructionSets[tmpInstructionState.Namespace].hasOwnProperty(tmpInstructionState.Instruction))
				{
					let fInstruction = this.instructionSets[tmpInstructionState.Namespace][tmpInstructionState.Instruction];
					fInstruction(tmpInstructionState);
				}
			}

			// Operations recurse.
			if (tmpStep.hasOwnProperty('Operation'))
			{
				if (typeof(tmpStep.Operation) == 'string')
				{
					this.solveInternalOperation(tmpStep.Namespace, tmpStep.Operation, tmpInputObject, tmpOutputObject, tmpDescriptionManyfest, tmpStep.InputHashAddressMap, tmpStep.OutputHashAddressMap, tmpSolutionContext);
				}
				else if (typeof(tmpStep.Operation) == 'object')
				{
					// You can even define an inline object operation!  This gets crazy fast
					this.solveOperation(tmpStep.Operation, tmpInputObject, tmpOutputObject, tmpDescriptionManyfest, tmpStep.InputHashAddressMap, tmpStep.OutputHashAddressMap, tmpSolutionContext);
				}
			}
		}

		if (tmpOperation.hasOwnProperty('Log') && tmpOperation.Log.hasOwnProperty('PostOperation'))
		{
			if (typeof(tmpOperation.Log.PostOperation) == 'string')
			{
				tmpOperation.SolutionContext.SolutionLog.push(tmpPrecedent.parseString(tmpOperation.Log.PostOperation));
			}
			else if (Array.isArray(tmpOperation.Log.PreOperation))
			{
				for (let i = 0; i < tmpOperation.Log.PostOperation.length; i++)
				{
					if ((typeof(tmpOperation.Log.PostOperation[i]) == 'string'))
					{
						tmpOperation.SolutionContext.SolutionLog.push(tmpPrecedent.parseString(tmpOperation.Log.PostOperation[i]));
					}
				}
			}
		}

		return tmpSolutionContext;
	}
};

module.exports = Elucidator;
},{"./Elucidator-InstructionSet.js":2,"./Elucidator-LogToConsole.js":3,"./InstructionSets/Geometry.js":4,"./InstructionSets/Logic.js":5,"./InstructionSets/Math-Javascript.js":6,"./InstructionSets/PreciseMath-Decimal.js":23,"./InstructionSets/String.js":24,"manyfest":31,"precedent":32}],26:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');

/**
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
*/
class ManyfestHashTranslation
{
	constructor(pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) === 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) === 'function') ? pErrorLog : libSimpleLog;

        this.translationTable = {};
	}

    translationCount()
    {
        return Object.keys(this.translationTable).length;
    }

    addTranslation(pTranslation)
    {
        // This adds a translation in the form of:
        // { "SourceHash": "DestinationHash", "SecondSourceHash":"SecondDestinationHash" }
        if (typeof(pTranslation) != 'object')
        {
            this.logError(`Hash translation addTranslation expected a translation be type object but was passed in ${typeof(pTranslation)}`);
            return false;
        }

        let tmpTranslationSources = Object.keys(pTranslation)

        tmpTranslationSources.forEach(
            (pTranslationSource) =>
            {
                if (typeof(pTranslation[pTranslationSource]) != 'string')
                {
                    this.logError(`Hash translation addTranslation expected a translation destination hash for [${pTranslationSource}] to be a string but the referrant was a ${typeof(pTranslation[pTranslationSource])}`);
                }
                else
                {
                    this.translationTable[pTranslationSource] = pTranslation[pTranslationSource];
                }
            });
    }

    removeTranslationHash(pTranslationHash)
    {
        if (this.translationTable.hasOwnProperty(pTranslationHash))
        {
            delete this.translationTable[pTranslationHash];
        }
    }

    // This removes translations.
    // If passed a string, just removes the single one.
    // If passed an object, it does all the source keys.
    removeTranslation(pTranslation)
    {
        if (typeof(pTranslation) == 'string')
        {
            this.removeTranslationHash(pTranslation);
            return true;
        }
        else if (typeof(pTranslation) == 'object')
        {
            let tmpTranslationSources = Object.keys(pTranslation)

            tmpTranslationSources.forEach(
                (pTranslationSource) =>
                {
                    this.removeTranslation(pTranslationSource);
                });
            return true;
        }
        else
        {
            this.logError(`Hash translation removeTranslation expected either a string or an object but the passed-in translation was type ${typeof(pTranslation)}`);
            return false;
        }
    }

    clearTranslations()
    {
        this.translationTable = {};
    }

    translate(pTranslation)
    {
        if (this.translationTable.hasOwnProperty(pTranslation))
        {
            return this.translationTable[pTranslation];
        }
        else
        {
            return pTranslation;
        }
    }
}

module.exports = ManyfestHashTranslation;
},{"./Manyfest-LogToConsole.js":27}],27:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Manyfest simple logging shim (for browser and dependency-free running)
*/

const logToConsole = (pLogLine, pLogObject) =>
{
    let tmpLogLine = (typeof(pLogLine) === 'string') ? pLogLine : '';

    console.log(`[Manyfest] ${tmpLogLine}`);

    if (pLogObject) console.log(JSON.stringify(pLogObject));
};

module.exports = logToConsole;
},{}],28:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');

/**
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
*/
class ManyfestObjectAddressGeneration
{
	constructor(pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) == 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) == 'function') ? pErrorLog : libSimpleLog;
	}

	// generateAddressses
	//
	// This flattens an object into a set of key:value pairs for *EVERY SINGLE
	// POSSIBLE ADDRESS* in the object.  It can get ... really insane really
	// quickly.  This is not meant to be used directly to generate schemas, but
	// instead as a starting point for scripts or UIs.
	//
	// This will return a mega set of key:value pairs with all possible schema 
	// permutations and default values (when not an object) and everything else.
	generateAddressses (pObject, pBaseAddress, pSchema)
	{
		let tmpBaseAddress = (typeof(pBaseAddress) == 'string') ? pBaseAddress : '';
		let tmpSchema = (typeof(pSchema) == 'object') ? pSchema : {};

		let tmpObjectType = typeof(pObject);

		let tmpSchemaObjectEntry = (
			{
				Address: tmpBaseAddress,
				Hash: tmpBaseAddress,
				Name: tmpBaseAddress,
				// This is so scripts and UI controls can force a developer to opt-in.
				InSchema: false
			}
		)

		switch(tmpObjectType)
		{
			case 'string':
				tmpSchemaObjectEntry.DataType = 'String';
				tmpSchemaObjectEntry.Default = pObject;
				tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
				break;
			case 'number':
			case 'bigint':
				tmpSchemaObjectEntry.DataType = 'Number';
				tmpSchemaObjectEntry.Default = pObject;
				tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
				break;
			case 'undefined':
				tmpSchemaObjectEntry.DataType = 'Any';
				tmpSchemaObjectEntry.Default = pObject;
				tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
				break;
			case 'object':
				if (Array.isArray(pObject))
				{
					tmpSchemaObjectEntry.DataType = 'Array';
					if (tmpBaseAddress != '')
					{
						tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
					}
	
					for (let i = 0; i < pObject.length; i++)
					{
						this.generateAddressses(pObject[i], `${tmpBaseAddress}[${i}]`, tmpSchema);
					}
				}
				else
				{
					tmpSchemaObjectEntry.DataType = 'Object';
					if (tmpBaseAddress != '')
					{
						tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
						tmpBaseAddress += '.';
					}
	
					let tmpObjectProperties = Object.keys(pObject);

					for (let i = 0; i < tmpObjectProperties.length; i++)
					{
						this.generateAddressses(pObject[tmpObjectProperties[i]], `${tmpBaseAddress}${tmpObjectProperties[i]}`, tmpSchema);
					}			
				}
				break;
			case 'symbol':
			case 'function':
				// Symbols and functions neither recurse nor get added to the schema
				break;
		}

		return tmpSchema;
	}
};

module.exports = ManyfestObjectAddressGeneration;
},{"./Manyfest-LogToConsole.js":27}],29:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');

/**
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
* @class ManyfestObjectAddressResolver
*/
class ManyfestObjectAddressResolver
{
	constructor(pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) == 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) == 'function') ? pErrorLog : libSimpleLog;
	}

	// When a boxed property is passed in, it should have quotes of some
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
	// TODO: Should template literals be processed?  If so what state do they have access to?
	cleanWrapCharacters (pCharacter, pString)
	{
		if (pString.startsWith(pCharacter) && pString.endsWith(pCharacter))
		{
			return pString.substring(1, pString.length - 1);
		}
		else
		{
			return pString;
		}
	}

	// Check if an address exists.
	//
	// This is necessary because the getValueAtAddress function is ambiguous on 
	// whether the element/property is actually there or not (it returns 
	// undefined whether the property exists or not).  This function checks for
	// existance and returns true or false dependent.
	checkAddressExists (pObject, pAddress)
	{
		// TODO: Should these throw an error?
		// Make sure pObject is an object
		if (typeof(pObject) != 'object') return false;
		// Make sure pAddress is a string
		if (typeof(pAddress) != 'string') return false;

		// TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
		let tmpSeparatorIndex = pAddress.indexOf('.');

		// This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
		if (tmpSeparatorIndex == -1)
		{
			// Check if the address refers to a boxed property
			let tmpBracketStartIndex = pAddress.indexOf('[');
			let tmpBracketStopIndex = pAddress.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[10]
			// 		MyValues['Name']
			// 		MyValues["Age"]
			// 		MyValues[`Cost`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				// The "Name" of the Object contained too the left of the bracket
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
				// This is a rare case where Arrays testing as Objects is useful
				if (typeof(pObject[tmpBoxedPropertyName]) !== 'object')
				{
					return false;
				}

				// The "Reference" to the property within it, either an array element or object property
				let tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();
				// Attempt to parse the reference as a number, which will be used as an array element
				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
				//        This seems confusing to me at first read, so explaination:
				//        Is the Boxed Object an Array?  TRUE
				//        And is the Reference inside the boxed Object not a number? TRUE
				//        -->  So when these are in agreement, it's an impossible access state
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return false;
				}

				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to treat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynamic object property.
					// We would expect the property to be wrapped in some kind of quotes so strip them
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Check if the property exists.
					return pObject[tmpBoxedPropertyName].hasOwnProperty(tmpBoxedPropertyReference);
				}
				else
				{
					// Use the new in operator to see if the element is in the array
					return (tmpBoxedPropertyNumber in pObject[tmpBoxedPropertyName]);
				}
			}
			else
			{
				// Check if the property exists
				return pObject.hasOwnProperty(pAddress);
			}
		}
		else
		{
			let tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
			let tmpNewAddress = pAddress.substring(tmpSeparatorIndex+1);

			// Test if the tmpNewAddress is an array or object
			// Check if it's a boxed property
			let tmpBracketStartIndex = tmpSubObjectName.indexOf('[');
			let tmpBracketStopIndex = tmpSubObjectName.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[42]
			// 		MyValues['Color']
			// 		MyValues["Weight"]
			// 		MyValues[`Diameter`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				let tmpBoxedPropertyName = tmpSubObjectName.substring(0, tmpBracketStartIndex).trim();

				let tmpBoxedPropertyReference = tmpSubObjectName.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();

				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
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
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					// Because this is an impossible address, the property doesn't exist
					// TODO: Should we throw an error in this condition?
					return false;
				}

				//This is a bracketed value
				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to reat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynanmic object property.
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Recurse directly into the subobject
					return this.checkAddressExists(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpNewAddress);
				}
				else
				{
					// We parsed a valid number out of the boxed property name, so recurse into the array
					return this.checkAddressExists(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpNewAddress);
				}
			}

			// If there is an object property already named for the sub object, but it isn't an object
			// then the system can't set the value in there.  Error and abort!
			if (pObject.hasOwnProperty(tmpSubObjectName) && typeof(pObject[tmpSubObjectName]) !== 'object')
			{
				return false;
			}
			else if (pObject.hasOwnProperty(tmpSubObjectName))
			{
				// If there is already a subobject pass that to the recursive thingy
				return this.checkAddressExists(pObject[tmpSubObjectName], tmpNewAddress);
			}
			else
			{
				// Create a subobject and then pass that
				pObject[tmpSubObjectName] = {};
				return this.checkAddressExists(pObject[tmpSubObjectName], tmpNewAddress);
			}
		}
	}

	// Get the value of an element at an address
	getValueAtAddress (pObject, pAddress, pParentAddress)
	{
		// Make sure pObject is an object
		if (typeof(pObject) != 'object') return undefined;
		// Make sure pAddress is a string
		if (typeof(pAddress) != 'string') return undefined;
		let tmpParentAddress = "";
		if (typeof(pParentAddress) == 'string')
		{
			tmpParentAddress = pParentAddress;
		}

		// TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
		let tmpSeparatorIndex = pAddress.indexOf('.');

		// This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
		if (tmpSeparatorIndex == -1)
		{
			// Check if the address refers to a boxed property
			let tmpBracketStartIndex = pAddress.indexOf('[');
			let tmpBracketStopIndex = pAddress.indexOf(']');

			// Check for the Object Set Type marker.
			// Note this will not work with a bracket in the same address box set
			let tmpObjectTypeMarkerIndex = pAddress.indexOf('{}');

			// Boxed elements look like this:
			// 		MyValues[10]
			// 		MyValues['Name']
			// 		MyValues["Age"]
			// 		MyValues[`Cost`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				// The "Name" of the Object contained too the left of the bracket
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
				// This is a rare case where Arrays testing as Objects is useful
				if (typeof(pObject[tmpBoxedPropertyName]) !== 'object')
				{
					return undefined;
				}

				// The "Reference" to the property within it, either an array element or object property
				let tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();
				// Attempt to parse the reference as a number, which will be used as an array element
				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
				//        This seems confusing to me at first read, so explaination:
				//        Is the Boxed Object an Array?  TRUE
				//        And is the Reference inside the boxed Object not a number? TRUE
				//        -->  So when these are in agreement, it's an impossible access state
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return undefined;
				}

				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to treat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynamic object property.
					// We would expect the property to be wrapped in some kind of quotes so strip them
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Return the value in the property
					return pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference];
				}
				else
				{
					return pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber];
				}
			}
			// The requirements to detect a boxed set element are:
			//    1) The start bracket is after character 0
			else if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket is after the start bracket
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is nothing in the brackets
				&& (tmpBracketStopIndex - tmpBracketStartIndex == 1))
			{
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				if (!Array.isArray(pObject[tmpBoxedPropertyName]))
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				return pObject[tmpBoxedPropertyName];
			}
			// The object has been flagged as an object set, so treat it as such
			else if (tmpObjectTypeMarkerIndex > 0)
			{
				let tmpObjectPropertyName = pAddress.substring(0, tmpObjectTypeMarkerIndex).trim();

				if (typeof(pObject[tmpObjectPropertyName]) != 'object')
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				return pObject[tmpObjectPropertyName];
			}
			else
			{
				// Now is the point in recursion to return the value in the address
				return pObject[pAddress];
			}
		}
		else
		{
			let tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
			let tmpNewAddress = pAddress.substring(tmpSeparatorIndex+1);

			// BOXED ELEMENTS
			// Test if the tmpNewAddress is an array or object
			// Check if it's a boxed property
			let tmpBracketStartIndex = tmpSubObjectName.indexOf('[');
			let tmpBracketStopIndex = tmpSubObjectName.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[42]
			// 		MyValues['Color']
			// 		MyValues["Weight"]
			// 		MyValues[`Diameter`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				let tmpBoxedPropertyName = tmpSubObjectName.substring(0, tmpBracketStartIndex).trim();

				let tmpBoxedPropertyReference = tmpSubObjectName.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();

				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
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
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return undefined;
				}

				//This is a bracketed value
				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to reat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynanmic object property.
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Continue to manage the parent address for recursion
					tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
					// Recurse directly into the subobject
					return this.getValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpNewAddress, tmpParentAddress);
				}
				else
				{
					// Continue to manage the parent address for recursion
					tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
					// We parsed a valid number out of the boxed property name, so recurse into the array
					return this.getValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpNewAddress, tmpParentAddress);
				}
			}
			// The requirements to detect a boxed set element are:
			//    1) The start bracket is after character 0
			else if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket is after the start bracket
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is nothing in the brackets
				&& (tmpBracketStopIndex - tmpBracketStartIndex == 1))
			{
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				if (!Array.isArray(pObject[tmpBoxedPropertyName]))
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				// We need to enumerate the array and grab the addresses from there.
				let tmpArrayProperty = pObject[tmpBoxedPropertyName];
				// Managing the parent address is a bit more complex here -- the box will be added for each element.
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpBoxedPropertyName}`;
				// The container object is where we have the "Address":SOMEVALUE pairs
				let tmpContainerObject = {};
				for (let i = 0; i < tmpArrayProperty.length; i++)
				{
					let tmpPropertyParentAddress = `${tmpParentAddress}[${i}]`;
					let tmpValue = this.getValueAtAddress(pObject[tmpBoxedPropertyName][i], tmpNewAddress, tmpPropertyParentAddress);;
					tmpContainerObject[`${tmpPropertyParentAddress}.${tmpNewAddress}`] = tmpValue;
				}

				return tmpContainerObject;
			}

			// OBJECT SET
			// Note this will not work with a bracket in the same address box set
			let tmpObjectTypeMarkerIndex = pAddress.indexOf('{}');
			if (tmpObjectTypeMarkerIndex > 0)
			{
				let tmpObjectPropertyName = pAddress.substring(0, tmpObjectTypeMarkerIndex).trim();

				if (typeof(pObject[tmpObjectPropertyName]) != 'object')
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				// We need to enumerate the Object and grab the addresses from there.
				let tmpObjectProperty = pObject[tmpObjectPropertyName];
				let tmpObjectPropertyKeys = Object.keys(tmpObjectProperty);
				// Managing the parent address is a bit more complex here -- the box will be added for each element.
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpObjectPropertyName}`;
				// The container object is where we have the "Address":SOMEVALUE pairs
				let tmpContainerObject = {};
				for (let i = 0; i < tmpObjectPropertyKeys.length; i++)
				{
					let tmpPropertyParentAddress = `${tmpParentAddress}.${tmpObjectPropertyKeys[i]}`;
					let tmpValue = this.getValueAtAddress(pObject[tmpObjectPropertyName][tmpObjectPropertyKeys[i]], tmpNewAddress, tmpPropertyParentAddress);;
					tmpContainerObject[`${tmpPropertyParentAddress}.${tmpNewAddress}`] = tmpValue;
				}

				return tmpContainerObject;
			}

			// If there is an object property already named for the sub object, but it isn't an object
			// then the system can't set the value in there.  Error and abort!
			if (pObject.hasOwnProperty(tmpSubObjectName) && typeof(pObject[tmpSubObjectName]) !== 'object')
			{
				return undefined;
			}
			else if (pObject.hasOwnProperty(tmpSubObjectName))
			{
				// If there is already a subobject pass that to the recursive thingy
				// Continue to manage the parent address for recursion
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
				return this.getValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, tmpParentAddress);
			}
			else
			{
				// Create a subobject and then pass that
				// Continue to manage the parent address for recursion
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
				pObject[tmpSubObjectName] = {};
				return this.getValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, tmpParentAddress);
			}
		}
	}

	// Set the value of an element at an address
	setValueAtAddress (pObject, pAddress, pValue)
	{
		// Make sure pObject is an object
		if (typeof(pObject) != 'object') return false;
		// Make sure pAddress is a string
		if (typeof(pAddress) != 'string') return false;

		let tmpSeparatorIndex = pAddress.indexOf('.');

		if (tmpSeparatorIndex == -1)
		{
			// Check if it's a boxed property
			let tmpBracketStartIndex = pAddress.indexOf('[');
			let tmpBracketStopIndex = pAddress.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[10]
			// 		MyValues['Name']
			// 		MyValues["Age"]
			// 		MyValues[`Cost`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				// The "Name" of the Object contained too the left of the bracket
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
				// This is a rare case where Arrays testing as Objects is useful
				if (typeof(pObject[tmpBoxedPropertyName]) !== 'object')
				{
					return false;
				}

				// The "Reference" to the property within it, either an array element or object property
				let tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();
				// Attempt to parse the reference as a number, which will be used as an array element
				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
				//        This seems confusing to me at first read, so explaination:
				//        Is the Boxed Object an Array?  TRUE
				//        And is the Reference inside the boxed Object not a number? TRUE
				//        -->  So when these are in agreement, it's an impossible access state
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return false;
				}

				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to treat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynamic object property.
					// We would expect the property to be wrapped in some kind of quotes so strip them
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Return the value in the property
					pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference] = pValue;
					return true;
				}
				else
				{
					pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber] = pValue;
					return true;
				}
			}
			else
			{
				// Now is the time in recursion to set the value in the object
				pObject[pAddress] = pValue;
				return true;
			}
		}
		else
		{
			let tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
			let tmpNewAddress = pAddress.substring(tmpSeparatorIndex+1);

			// Test if the tmpNewAddress is an array or object
			// Check if it's a boxed property
			let tmpBracketStartIndex = tmpSubObjectName.indexOf('[');
			let tmpBracketStopIndex = tmpSubObjectName.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[42]
			// 		MyValues['Color']
			// 		MyValues["Weight"]
			// 		MyValues[`Diameter`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				let tmpBoxedPropertyName = tmpSubObjectName.substring(0, tmpBracketStartIndex).trim();

				let tmpBoxedPropertyReference = tmpSubObjectName.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();

				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
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
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return false;
				}

				//This is a bracketed value
				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to reat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynanmic object property.
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Recurse directly into the subobject
					return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpNewAddress, pValue);
				}
				else
				{
					// We parsed a valid number out of the boxed property name, so recurse into the array
					return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpNewAddress, pValue);
				}
			}

			// If there is an object property already named for the sub object, but it isn't an object
			// then the system can't set the value in there.  Error and abort!
			if (pObject.hasOwnProperty(tmpSubObjectName) && typeof(pObject[tmpSubObjectName]) !== 'object')
			{
				if (!pObject.hasOwnProperty('__ERROR'))
					pObject['__ERROR'] = {};
				// Put it in an error object so data isn't lost
				pObject['__ERROR'][pAddress] = pValue;
				return false;
			}
			else if (pObject.hasOwnProperty(tmpSubObjectName))
			{
				// If there is already a subobject pass that to the recursive thingy
				return this.setValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, pValue);
			}
			else
			{
				// Create a subobject and then pass that
				pObject[tmpSubObjectName] = {};
				return this.setValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, pValue);
			}
		}
	}
};

module.exports = ManyfestObjectAddressResolver;
},{"./Manyfest-LogToConsole.js":27}],30:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');

/**
* Schema Manipulation Functions
*
* @class ManyfestSchemaManipulation
*/
class ManyfestSchemaManipulation
{
	constructor(pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) === 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) === 'function') ? pErrorLog : libSimpleLog;
	}

    // This translates the default address mappings to something different.
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
	resolveAddressMappings(pManyfestSchemaDescriptors, pAddressMapping)
	{
		if (typeof(pManyfestSchemaDescriptors) != 'object')
		{
			this.logError(`Attempted to resolve address mapping but the descriptor was not an object.`);
			return false;
		}

		if (typeof(pAddressMapping) != 'object')
		{
			// No mappings were passed in
			return true;
		}

		// Get the arrays of both the schema definition and the hash mapping
		let tmpManyfestAddresses = Object.keys(pManyfestSchemaDescriptors);
		let tmpHashMapping = {};
		tmpManyfestAddresses.forEach(
			(pAddress) =>
			{
				if (pManyfestSchemaDescriptors[pAddress].hasOwnProperty('Hash'))
				{
					tmpHashMapping[pManyfestSchemaDescriptors[pAddress].Hash] = pAddress;
				}
			});

		let tmpAddressMappingSet = Object.keys(pAddressMapping);

		tmpAddressMappingSet.forEach(
			(pInputAddress) =>
			{
				let tmpNewDescriptorAddress = pAddressMapping[pInputAddress];
				let tmpOldDescriptorAddress = false;
				let tmpDescriptor = false;

				// See if there is a matching descriptor either by Address directly or Hash
				if (pManyfestSchemaDescriptors.hasOwnProperty(pInputAddress))
				{
					tmpOldDescriptorAddress = pInputAddress;
				}
				else if (tmpHashMapping.hasOwnProperty(pInputAddress))
				{
					tmpOldDescriptorAddress = tmpHashMapping[pInputAddress];
				}

				// If there was a matching descriptor in the manifest, store it in the temporary descriptor
				if (tmpOldDescriptorAddress)
				{
					tmpDescriptor = pManyfestSchemaDescriptors[tmpOldDescriptorAddress];
					delete pManyfestSchemaDescriptors[tmpOldDescriptorAddress];
				}
				else
				{
					// Create a new descriptor!  Map it to the input address.
					tmpDescriptor = { Hash:pInputAddress };
				}

				// Now re-add the descriptor to the manyfest schema
				pManyfestSchemaDescriptors[tmpNewDescriptorAddress] = tmpDescriptor;
			});

		return true;
	}

	safeResolveAddressMappings(pManyfestSchemaDescriptors, pAddressMapping)
	{
		// This returns the descriptors as a new object, safely remapping without mutating the original schema Descriptors
		let tmpManyfestSchemaDescriptors = JSON.parse(JSON.stringify(pManyfestSchemaDescriptors));
		this.resolveAddressMappings(tmpManyfestSchemaDescriptors, pAddressMapping);
		return tmpManyfestSchemaDescriptors;
	}

	mergeAddressMappings(pManyfestSchemaDescriptorsDestination, pManyfestSchemaDescriptorsSource)
	{
		if ((typeof(pManyfestSchemaDescriptorsSource) != 'object') || (typeof(pManyfestSchemaDescriptorsDestination) != 'object'))
		{
			this.logError(`Attempted to merge two schema descriptors but both were not objects.`);
			return false;
		}

		let tmpSource = JSON.parse(JSON.stringify(pManyfestSchemaDescriptorsSource));
		let tmpNewManyfestSchemaDescriptors = JSON.parse(JSON.stringify(pManyfestSchemaDescriptorsDestination));

		// The first passed-in set of descriptors takes precedence.
		let tmpDescriptorAddresses = Object.keys(tmpSource);

		tmpDescriptorAddresses.forEach(
			(pDescriptorAddress) => 
			{
				if (!tmpNewManyfestSchemaDescriptors.hasOwnProperty(pDescriptorAddress))
				{
					tmpNewManyfestSchemaDescriptors[pDescriptorAddress] = tmpSource[pDescriptorAddress];
				}
			});
		
		return tmpNewManyfestSchemaDescriptors;
	}
}

module.exports = ManyfestSchemaManipulation;
},{"./Manyfest-LogToConsole.js":27}],31:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');

let libHashTranslation = require('./Manyfest-HashTranslation.js');
let libObjectAddressResolver = require('./Manyfest-ObjectAddressResolver.js');
let libObjectAddressGeneration = require('./Manyfest-ObjectAddressGeneration.js');
let libSchemaManipulation = require('./Manyfest-SchemaManipulation.js');


/**
* Manyfest object address-based descriptions and manipulations.
*
* @class Manyfest
*/
class Manyfest
{
	constructor(pManifest, pInfoLog, pErrorLog, pOptions)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) === 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) === 'function') ? pErrorLog : libSimpleLog;

		// Create an object address resolver and map in the functions
		this.objectAddressResolver = new libObjectAddressResolver(this.logInfo, this.logError);

		this.options = (
			{
				strict: false,
				defaultValues: 
					{
						"String": "",
						"Number": 0,
						"Float": 0.0,
						"Integer": 0,
						"Boolean": false,
						"Binary": 0,
						"DateTime": 0,
						"Array": [],
						"Object": {},
						"Null": null
					}
			});

		this.scope = undefined;
		this.elementAddresses = undefined;
		this.elementHashes = undefined;
		this.elementDescriptors = undefined;

		this.reset();

		if (typeof(pManifest) === 'object')
		{
			this.loadManifest(pManifest);
		}

		this.schemaManipulations = new libSchemaManipulation(this.logInfo, this.logError);
		this.objectAddressGeneration = new libObjectAddressGeneration(this.logInfo, this.logError);

		this.hashTranslations = new libHashTranslation(this.logInfo, this.logError);
	}

	/*************************************************************************
	 * Schema Manifest Loading, Reading, Manipulation and Serialization Functions
	 */

	// Reset critical manifest properties
	reset()
	{
		this.scope = 'DEFAULT';
		this.elementAddresses = [];
		this.elementHashes = {};
		this.elementDescriptors = {};
	}

	clone()
	{
		// Make a copy of the options in-place
		let tmpNewOptions = JSON.parse(JSON.stringify(this.options));

		let tmpNewManyfest = new Manyfest(this.getManifest(), this.logInfo, this.logError, tmpNewOptions);

		// Import the hash translations
		tmpNewManyfest.hashTranslations.addTranslation(this.hashTranslations.translationTable);

		return tmpNewManyfest;
	}

	// Deserialize a Manifest from a string
	deserialize(pManifestString)
	{
		// TODO: Add guards for bad manifest string
		return this.loadManifest(JSON.parse(pManifestString));
	}

	// Load a manifest from an object
	loadManifest(pManifest)
	{
		if (typeof(pManifest) !== 'object')
		{
			this.logError(`(${this.scope}) Error loading manifest; expecting an object but parameter was type ${typeof(pManifest)}.`);
			return false;
		}

		if (pManifest.hasOwnProperty('Scope'))
		{
			if (typeof(pManifest.Scope) === 'string')
			{
				this.scope = pManifest.Scope;
			}
			else
			{
				this.logError(`(${this.scope}) Error loading scope from manifest; expecting a string but property was type ${typeof(pManifest.Scope)}.`, pManifest);
			}
		}
		else
		{
			this.logError(`(${this.scope}) Error loading scope from manifest object.  Property "Scope" does not exist in the root of the object.`, pManifest);
		}

		if (pManifest.hasOwnProperty('Descriptors'))
		{
			if (typeof(pManifest.Descriptors) === 'object')
			{
				let tmpDescriptionAddresses = Object.keys(pManifest.Descriptors);
				for (let i = 0; i < tmpDescriptionAddresses.length; i++)
				{
					this.addDescriptor(tmpDescriptionAddresses[i], pManifest.Descriptors[tmpDescriptionAddresses[i]]);
				}
			}
			else
			{
				this.logError(`(${this.scope}) Error loading description object from manifest object.  Expecting an object in 'Manifest.Descriptors' but the property was type ${typeof(pManifest.Descriptors)}.`, pManifest);
			}
		}
		else
		{
			this.logError(`(${this.scope}) Error loading object description from manifest object.  Property "Descriptors" does not exist in the root of the Manifest object.`, pManifest);
		}
	}

	// Serialize the Manifest to a string
	// TODO: Should this also serialize the translation table?
	serialize()
	{
		return JSON.stringify(this.getManifest());
	}

	getManifest()
	{
		return (
			{
				Scope: this.scope,
				Descriptors: JSON.parse(JSON.stringify(this.elementDescriptors))
			});
	}

	// Add a descriptor to the manifest
	addDescriptor(pAddress, pDescriptor)
	{
		if (typeof(pDescriptor) === 'object')
		{
			// Add the Address into the Descriptor if it doesn't exist:
			if (!pDescriptor.hasOwnProperty('Address'))
			{
				pDescriptor.Address = pAddress;
			}

			if (!this.elementDescriptors.hasOwnProperty(pAddress))
			{
				this.elementAddresses.push(pAddress);
			}

			// Add the element descriptor to the schema
			this.elementDescriptors[pAddress] = pDescriptor;

			// Always add the address as a hash
			this.elementHashes[pAddress] = pAddress;

			if (pDescriptor.hasOwnProperty('Hash'))
			{
				// TODO: Check if this is a good idea or not..
				//       Collisions are bound to happen with both representations of the address/hash in here and developers being able to create their own hashes.
				this.elementHashes[pDescriptor.Hash] = pAddress;
			}
			else
			{
				pDescriptor.Hash = pAddress;
			}

			return true;
		}
		else
		{
			this.logError(`(${this.scope}) Error loading object descriptor for address '${pAddress}' from manifest object.  Expecting an object but property was type ${typeof(pDescriptor)}.`);
			return false;
		}	
	}

	getDescriptorByHash(pHash)
	{
		return this.getDescriptor(this.resolveHashAddress(pHash));
	}

	getDescriptor(pAddress)
	{
		return this.elementDescriptors[pAddress];
	}

	/*************************************************************************
	 * Beginning of Object Manipulation (read & write) Functions
	 */
	// Check if an element exists by its hash
	checkAddressExistsByHash (pObject, pHash)
	{
		return this.checkAddressExists(pObject,this.resolveHashAddress(pHash));
	}

	// Check if an element exists at an address
	checkAddressExists (pObject, pAddress)
	{
		return this.objectAddressResolver.checkAddressExists(pObject, pAddress);
	}

	// Turn a hash into an address, factoring in the translation table.
	resolveHashAddress(pHash)
	{
		let tmpAddress = undefined;

		let tmpInElementHashTable = this.elementHashes.hasOwnProperty(pHash);
		let tmpInTranslationTable = this.hashTranslations.translationTable.hasOwnProperty(pHash);

		// The most straightforward: the hash exists, no translations.
		if (tmpInElementHashTable && !tmpInTranslationTable)
		{
			tmpAddress = this.elementHashes[pHash];
		}
		// There is a translation from one hash to another, and, the elementHashes contains the pointer end
		else if (tmpInTranslationTable && this.elementHashes.hasOwnProperty(this.hashTranslations.translate(pHash)))
		{
			tmpAddress = this.elementHashes[this.hashTranslations.translate(pHash)];
		}
		// Use the level of indirection only in the Translation Table 
		else if (tmpInTranslationTable)
		{
			tmpAddress = this.hashTranslations.translate(pHash);
		}
		// Just treat the hash as an address.
		// TODO: Discuss this ... it is magic but controversial
		else
		{
			tmpAddress = pHash;
		}

		return tmpAddress;
	}

	// Get the value of an element by its hash
	getValueByHash (pObject, pHash)
	{
		let tmpValue = this.getValueAtAddress(pObject, this.resolveHashAddress(pHash));

		if (typeof(tmpValue) == 'undefined')
		{
			// Try to get a default if it exists
			tmpValue = this.getDefaultValue(this.getDescriptorByHash(pHash));
		}

		return tmpValue;
	}

	// Get the value of an element at an address
	getValueAtAddress (pObject, pAddress)
	{
		let tmpValue = this.objectAddressResolver.getValueAtAddress(pObject, pAddress);

		if (typeof(tmpValue) == 'undefined')
		{
			// Try to get a default if it exists
			tmpValue = this.getDefaultValue(this.getDescriptor(pAddress));
		}

		return tmpValue;
	}

	// Set the value of an element by its hash
	setValueByHash(pObject, pHash, pValue)
	{
		return this.setValueAtAddress(pObject, this.resolveHashAddress(pHash), pValue);
	}


	// Set the value of an element at an address
	setValueAtAddress (pObject, pAddress, pValue)
	{
		return this.objectAddressResolver.setValueAtAddress(pObject, pAddress, pValue);
	}

	// Validate the consistency of an object against the schema
	validate(pObject)
	{
		let tmpValidationData =
		{
			Error: null,
			Errors: [],
			MissingElements:[]
		};

		if (typeof(pObject) !== 'object')
		{
			tmpValidationData.Error = true;
			tmpValidationData.Errors.push(`Expected passed in object to be type object but was passed in ${typeof(pObject)}`);
		}

		let addValidationError = (pAddress, pErrorMessage) =>
		{
			tmpValidationData.Error = true;
			tmpValidationData.Errors.push(`Element at address "${pAddress}" ${pErrorMessage}.`);
		};

		// Now enumerate through the values and check for anomalies based on the schema
		for (let i = 0; i < this.elementAddresses.length; i++)
		{
			let tmpDescriptor = this.getDescriptor(this.elementAddresses[i]);
			let tmpValueExists = this.checkAddressExists(pObject, tmpDescriptor.Address);
			let tmpValue = this.getValueAtAddress(pObject, tmpDescriptor.Address);

			if ((typeof(tmpValue) == 'undefined') || !tmpValueExists)
			{
				// This will technically mean that `Object.Some.Value = undefined` will end up showing as "missing"
				// TODO: Do we want to do a different message based on if the property exists but is undefined?
				tmpValidationData.MissingElements.push(tmpDescriptor.Address);
				if (tmpDescriptor.Required || this.options.strict)
				{
					addValidationError(tmpDescriptor.Address, 'is flagged REQUIRED but is not set in the object');
				}
			}

			// Now see if there is a data type specified for this element
			if (tmpDescriptor.DataType)
			{
				let tmpElementType = typeof(tmpValue);
				switch(tmpDescriptor.DataType.toString().trim().toLowerCase())
				{
					case 'string':
						if (tmpElementType != 'string')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						break;

					case 'number':
						if (tmpElementType != 'number')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						break;

					case 'integer':
						if (tmpElementType != 'number')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						else
						{
							let tmpValueString = tmpValue.toString();
							if (tmpValueString.indexOf('.') > -1)
							{
								// TODO: Is this an error?
								addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but has a decimal point in the number.`);
							}
						}
						break;

					case 'float':
						if (tmpElementType != 'number')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						break;

					case 'DateTime':
						let tmpValueDate = new Date(tmpValue);
						if (tmpValueDate.toString() == 'Invalid Date')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is not parsable as a Date by Javascript`);
						}
	
					default:
						// Check if this is a string, in the default case
						// Note this is only when a DataType is specified and it is an unrecognized data type.
						if (tmpElementType != 'string')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} (which auto-converted to String because it was unrecognized) but is of the type ${tmpElementType}`);
						}
						break;
				}
			}
		}

		return tmpValidationData;
	}

	// Returns a default value, or, the default value for the data type (which is overridable with configuration)
	getDefaultValue(pDescriptor)
	{
		if (typeof(pDescriptor) != 'object')
		{
			return undefined;
		}

		if (pDescriptor.hasOwnProperty('Default'))
		{
			return pDescriptor.Default;
		}
		else
		{
			// Default to a null if it doesn't have a type specified.
			// This will ensure a placeholder is created but isn't misinterpreted.
			let tmpDataType = (pDescriptor.hasOwnProperty('DataType')) ? pDescriptor.DataType : 'String';
			if (this.options.defaultValues.hasOwnProperty(tmpDataType))
			{
				return this.options.defaultValues[tmpDataType];
			}
			else
			{
				// give up and return null
				return null;
			}
		}
	}

	// Enumerate through the schema and populate default values if they don't exist.
	populateDefaults(pObject, pOverwriteProperties)
	{
		return this.populateObject(pObject, pOverwriteProperties,
			// This just sets up a simple filter to see if there is a default set.
			(pDescriptor) =>
			{
				return pDescriptor.hasOwnProperty('Default');
			});
	}

	// Forcefully populate all values even if they don't have defaults.
	// Based on type, this can do unexpected things.
	populateObject(pObject, pOverwriteProperties, fFilter)
	{
		// Automatically create an object if one isn't passed in.
		let tmpObject = (typeof(pObject) === 'object') ? pObject : {};
		// Default to *NOT OVERWRITING* properties
		let tmpOverwriteProperties = (typeof(pOverwriteProperties) == 'undefined') ? false : pOverwriteProperties;
		// This is a filter function, which is passed the schema and allows complex filtering of population
		// The default filter function just returns true, populating everything.
		let tmpFilterFunction = (typeof(fFilter) == 'function') ? fFilter : (pDescriptor) => { return true; };

		this.elementAddresses.forEach(
			(pAddress) =>
			{
				let tmpDescriptor = this.getDescriptor(pAddress);
				// Check the filter function to see if this is an address we want to set the value for.
				if (tmpFilterFunction(tmpDescriptor))
				{
					// If we are overwriting properties OR the property does not exist
					if (tmpOverwriteProperties || !this.checkAddressExists(tmpObject, pAddress))
					{
						this.setValueAtAddress(tmpObject, pAddress, this.getDefaultValue(tmpDescriptor));
					}
				}
			});

		return tmpObject;
	}
};

module.exports = Manyfest;
},{"./Manyfest-HashTranslation.js":26,"./Manyfest-LogToConsole.js":27,"./Manyfest-ObjectAddressGeneration.js":28,"./Manyfest-ObjectAddressResolver.js":29,"./Manyfest-SchemaManipulation.js":30}],32:[function(require,module,exports){
/**
* Precedent Meta-Templating
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Process text streams, parsing out meta-template expressions.
*/
var libWordTree = require(`./WordTree.js`);
var libStringParser = require(`./StringParser.js`);

class Precedent
{
	/**
	 * Precedent Constructor
	 */
	constructor()
	{
		this.WordTree = new libWordTree();
		
		this.StringParser = new libStringParser();

		this.ParseTree = this.WordTree.ParseTree;
	}
	
	/**
	 * Add a Pattern to the Parse Tree
	 * @method addPattern
	 * @param {Object} pTree - A node on the parse tree to push the characters into
	 * @param {string} pPattern - The string to add to the tree
	 * @param {number} pIndex - callback function
	 * @return {bool} True if adding the pattern was successful
	 */
	addPattern(pPatternStart, pPatternEnd, pParser)
	{
		return this.WordTree.addPattern(pPatternStart, pPatternEnd, pParser);
	}
	
	/**
	 * Parse a string with the existing parse tree
	 * @method parseString
	 * @param {string} pString - The string to parse
	 * @return {string} The result from the parser
	 */
	parseString(pString)
	{
		return this.StringParser.parseString(pString, this.ParseTree);
	}
}

module.exports = Precedent;

},{"./StringParser.js":33,"./WordTree.js":34}],33:[function(require,module,exports){
/**
* String Parser
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Parse a string, properly processing each matched token in the word tree.
*/

class StringParser
{
	/**
	 * StringParser Constructor
	 */
	constructor()
	{
	}
	
	/**
	 * Create a fresh parsing state object to work with.
	 * @method newParserState
	 * @param {Object} pParseTree - A node on the parse tree to begin parsing from (usually root)
	 * @return {Object} A new parser state object for running a character parser on
	 * @private
	 */
	newParserState (pParseTree)
	{
		return (
		{
		    ParseTree: pParseTree,

			Output: '',
			OutputBuffer: '',

			Pattern: false,

			PatternMatch: false,
			PatternMatchOutputBuffer: ''
		});
	}
		
	/**
	 * Assign a node of the parser tree to be the next potential match.
	 * If the node has a PatternEnd property, it is a valid match and supercedes the last valid match (or becomes the initial match).
	 * @method assignNode
	 * @param {Object} pNode - A node on the parse tree to assign
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */
	assignNode (pNode, pParserState)
	{
		pParserState.PatternMatch = pNode;

		// If the pattern has a END we can assume it has a parse function...
		if (pParserState.PatternMatch.hasOwnProperty('PatternEnd'))
		{
			// ... this is the legitimate start of a pattern.
			pParserState.Pattern = pParserState.PatternMatch;
		}
	}
	
	/**
	 * Append a character to the output buffer in the parser state.
	 * This output buffer is used when a potential match is being explored, or a match is being explored.
	 * @method appendOutputBuffer
	 * @param {string} pCharacter - The character to append
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */
	appendOutputBuffer (pCharacter, pParserState)
	{
		pParserState.OutputBuffer += pCharacter;
	}
	
	/**
	 * Flush the output buffer to the output and clear it.
	 * @method flushOutputBuffer
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */
	flushOutputBuffer (pParserState)
	{
		pParserState.Output += pParserState.OutputBuffer;
		pParserState.OutputBuffer = '';
	}

	
	/**
	 * Check if the pattern has ended.  If it has, properly flush the buffer and start looking for new patterns.
	 * @method checkPatternEnd
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */
	checkPatternEnd (pParserState)
	{
		if ((pParserState.OutputBuffer.length >= pParserState.Pattern.PatternEnd.length+pParserState.Pattern.PatternStart.length) && 
			(pParserState.OutputBuffer.substr(-pParserState.Pattern.PatternEnd.length) === pParserState.Pattern.PatternEnd))
		{
			// ... this is the end of a pattern, cut off the end tag and parse it.
			// Trim the start and end tags off the output buffer now
			pParserState.OutputBuffer = pParserState.Pattern.Parse(pParserState.OutputBuffer.substr(pParserState.Pattern.PatternStart.length, pParserState.OutputBuffer.length - (pParserState.Pattern.PatternStart.length+pParserState.Pattern.PatternEnd.length)));
			// Flush the output buffer.
			this.flushOutputBuffer(pParserState);
			// End pattern mode
			pParserState.Pattern = false;
			pParserState.PatternMatch = false;
		}
	}
	
	/**
	 * Parse a character in the buffer.
	 * @method parseCharacter
	 * @param {string} pCharacter - The character to append
	 * @param {Object} pParserState - The state object for the current parsing task
	 * @private
	 */
	parseCharacter (pCharacter, pParserState)
	{
		// (1) If we aren't in a pattern match, and we aren't potentially matching, and this may be the start of a new pattern....
		if (!pParserState.PatternMatch && pParserState.ParseTree.hasOwnProperty(pCharacter))
		{
			// ... assign the node as the matched node.
			this.assignNode(pParserState.ParseTree[pCharacter], pParserState);
			this.appendOutputBuffer(pCharacter, pParserState);
		}
		// (2) If we are in a pattern match (actively seeing if this is part of a new pattern token)
		else if (pParserState.PatternMatch)
		{
			// If the pattern has a subpattern with this key
			if (pParserState.PatternMatch.hasOwnProperty(pCharacter))
			{
				// Continue matching patterns.
				this.assignNode(pParserState.PatternMatch[pCharacter], pParserState);
			}
			this.appendOutputBuffer(pCharacter, pParserState);
			if (pParserState.Pattern)
			{
				// ... Check if this is the end of the pattern (if we are matching a valid pattern)...
				this.checkPatternEnd(pParserState);
			}
		}
		// (3) If we aren't in a pattern match or pattern, and this isn't the start of a new pattern (RAW mode)....
		else
		{
			pParserState.Output += pCharacter;
		}
	}
	
	/**
	 * Parse a string for matches, and process any template segments that occur.
	 * @method parseString
	 * @param {string} pString - The string to parse.
	 * @param {Object} pParseTree - The parse tree to begin parsing from (usually root)
	 */
	parseString (pString, pParseTree)
	{
		let tmpParserState = this.newParserState(pParseTree);

		for (var i = 0; i < pString.length; i++)
		{
			// TODO: This is not fast.
			this.parseCharacter(pString[i], tmpParserState);
		}
		
		this.flushOutputBuffer(tmpParserState);
		
		return tmpParserState.Output;
	}
}

module.exports = StringParser;

},{}],34:[function(require,module,exports){
/**
* Word Tree
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Create a tree (directed graph) of Javascript objects, one character per object.
*/

class WordTree
{
	/**
	 * WordTree Constructor
	 */
	constructor()
	{
		this.ParseTree = {};
	}
	
	/** 
	 * Add a child character to a Parse Tree node
	 * @method addChild
	 * @param {Object} pTree - A parse tree to push the characters into
	 * @param {string} pPattern - The string to add to the tree
	 * @param {number} pIndex - callback function
	 * @returns {Object} The resulting leaf node that was added (or found)
	 * @private
	 */
	addChild (pTree, pPattern, pIndex)
	{
		if (pIndex > pPattern.length)
			return pTree;
		
		if (!pTree.hasOwnProperty(pPattern[pIndex]))
			pTree[pPattern[pIndex]] = {};
		
		return pTree[pPattern[pIndex]];
	}
	
	/** Add a Pattern to the Parse Tree
	 * @method addPattern
	 * @param {Object} pTree - A node on the parse tree to push the characters into
	 * @param {string} pPattern - The string to add to the tree
	 * @param {number} pIndex - callback function
	 * @return {bool} True if adding the pattern was successful
	 */
	addPattern (pPatternStart, pPatternEnd, pParser)
	{
		if (pPatternStart.length < 1)
			return false;

		let tmpLeaf = this.ParseTree;

		// Add the tree of leaves iteratively
		for (var i = 0; i < pPatternStart.length; i++)
			tmpLeaf = this.addChild(tmpLeaf, pPatternStart, i);

		tmpLeaf.PatternStart = pPatternStart;
		tmpLeaf.PatternEnd = ((typeof(pPatternEnd) === 'string') && (pPatternEnd.length > 0)) ? pPatternEnd : pPatternStart;
		tmpLeaf.Parse = (typeof(pParser) === 'function') ? pParser : 
						(typeof(pParser) === 'string') ? () => { return pParser; } :
						(pData) => { return pData; };

		return true;
	}
}

module.exports = WordTree;

},{}],35:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Manyfest browser shim loader
*/

// Load the manyfest module into the browser global automatically.
var libManyfest = require('./Manyfest.js');

if (typeof(window) === 'object') window.Manyfest = libManyfest;

module.exports = libManyfest;
},{"./Manyfest.js":41}],36:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"./Manyfest-LogToConsole.js":37,"dup":26}],37:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],38:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"./Manyfest-LogToConsole.js":37,"dup":28}],39:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');
let libPrecedent = require('precedent');

/**
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
* TODO: Once we validate this pattern is good to go, break these out into 
*       three separate modules.
*
* @class ManyfestObjectAddressResolver
*/
class ManyfestObjectAddressResolver
{
	constructor(pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) == 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) == 'function') ? pErrorLog : libSimpleLog;

		this.elucidatorSolver = false;
		this.elucidatorSolverState = {};
	}

	// When a boxed property is passed in, it should have quotes of some
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
	// TODO: Should template literals be processed?  If so what state do they have access to?
	cleanWrapCharacters (pCharacter, pString)
	{
		if (pString.startsWith(pCharacter) && pString.endsWith(pCharacter))
		{
			return pString.substring(1, pString.length - 1);
		}
		else
		{
			return pString;
		}
	}

	// Check if an address exists.
	//
	// This is necessary because the getValueAtAddress function is ambiguous on 
	// whether the element/property is actually there or not (it returns 
	// undefined whether the property exists or not).  This function checks for
	// existance and returns true or false dependent.
	checkAddressExists (pObject, pAddress)
	{
		// TODO: Should these throw an error?
		// Make sure pObject is an object
		if (typeof(pObject) != 'object') return false;
		// Make sure pAddress is a string
		if (typeof(pAddress) != 'string') return false;

		// TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
		let tmpSeparatorIndex = pAddress.indexOf('.');

		// This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
		if (tmpSeparatorIndex == -1)
		{
			// Check if the address refers to a boxed property
			let tmpBracketStartIndex = pAddress.indexOf('[');
			let tmpBracketStopIndex = pAddress.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[10]
			// 		MyValues['Name']
			// 		MyValues["Age"]
			// 		MyValues[`Cost`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				// The "Name" of the Object contained too the left of the bracket
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
				// This is a rare case where Arrays testing as Objects is useful
				if (typeof(pObject[tmpBoxedPropertyName]) !== 'object')
				{
					return false;
				}

				// The "Reference" to the property within it, either an array element or object property
				let tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();
				// Attempt to parse the reference as a number, which will be used as an array element
				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
				//        This seems confusing to me at first read, so explaination:
				//        Is the Boxed Object an Array?  TRUE
				//        And is the Reference inside the boxed Object not a number? TRUE
				//        -->  So when these are in agreement, it's an impossible access state
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return false;
				}

				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to treat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynamic object property.
					// We would expect the property to be wrapped in some kind of quotes so strip them
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Check if the property exists.
					return pObject[tmpBoxedPropertyName].hasOwnProperty(tmpBoxedPropertyReference);
				}
				else
				{
					// Use the new in operator to see if the element is in the array
					return (tmpBoxedPropertyNumber in pObject[tmpBoxedPropertyName]);
				}
			}
			else
			{
				// Check if the property exists
				return pObject.hasOwnProperty(pAddress);
			}
		}
		else
		{
			let tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
			let tmpNewAddress = pAddress.substring(tmpSeparatorIndex+1);

			// Test if the tmpNewAddress is an array or object
			// Check if it's a boxed property
			let tmpBracketStartIndex = tmpSubObjectName.indexOf('[');
			let tmpBracketStopIndex = tmpSubObjectName.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[42]
			// 		MyValues['Color']
			// 		MyValues["Weight"]
			// 		MyValues[`Diameter`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				let tmpBoxedPropertyName = tmpSubObjectName.substring(0, tmpBracketStartIndex).trim();

				let tmpBoxedPropertyReference = tmpSubObjectName.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();

				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
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
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					// Because this is an impossible address, the property doesn't exist
					// TODO: Should we throw an error in this condition?
					return false;
				}

				//This is a bracketed value
				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to reat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynanmic object property.
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Recurse directly into the subobject
					return this.checkAddressExists(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpNewAddress);
				}
				else
				{
					// We parsed a valid number out of the boxed property name, so recurse into the array
					return this.checkAddressExists(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpNewAddress);
				}
			}

			// If there is an object property already named for the sub object, but it isn't an object
			// then the system can't set the value in there.  Error and abort!
			if (pObject.hasOwnProperty(tmpSubObjectName) && typeof(pObject[tmpSubObjectName]) !== 'object')
			{
				return false;
			}
			else if (pObject.hasOwnProperty(tmpSubObjectName))
			{
				// If there is already a subobject pass that to the recursive thingy
				return this.checkAddressExists(pObject[tmpSubObjectName], tmpNewAddress);
			}
			else
			{
				// Create a subobject and then pass that
				pObject[tmpSubObjectName] = {};
				return this.checkAddressExists(pObject[tmpSubObjectName], tmpNewAddress);
			}
		}
	}

	checkFilters(pAddress, pRecord)
	{
		let tmpPrecedent = new libPrecedent();
		// If we don't copy the string, precedent takes it out for good.
		// TODO: Consider adding a "don't replace" option for precedent
		let tmpAddress = pAddress;

		if (!this.elucidatorSolver)
		{
			// Again, manage against circular dependencies
			let libElucidator = require('elucidator');
			this.elucidatorSolver = new libElucidator({}, this.logInfo, this.logError);
		}

		if (this.elucidatorSolver)
		{
			// This allows the magic filtration with elucidator configuration
			// TODO: We could pass more state in (e.g. parent address, object, etc.)
			// TODO: Discuss this metaprogramming AT LENGTH
			let tmpFilterState = (
				{
					Record: pRecord,
					keepRecord: true 
				});

			// This is about as complex as it gets.
			// TODO: Optimize this so it is only initialized once.
			// TODO: That means figuring out a healthy pattern for passing in state to this
			tmpPrecedent.addPattern('<<~~', '~~>>',
				(pInstructionHash) => 
				{
					// This is for internal config on the solution steps.  Right now config is not shared across steps.
					if (this.elucidatorSolverState.hasOwnProperty(pInstructionHash))
					{
						tmpFilterState.SolutionState = this.elucidatorSolverState[pInstructionHash];
					}
					this.elucidatorSolver.solveInternalOperation('Custom', pInstructionHash, tmpFilterState);
				});
			tmpPrecedent.addPattern('<<~?', '?~>>',
				(pMagicSearchExpression) => 
				{
					if (typeof(pMagicSearchExpression) !== 'string')
					{
						return false;
					}
					// This expects a comma separated expression:
					//     Some.Address.In.The.Object,==,Search Term to Match
					let tmpMagicComparisonPatternSet = pMagicSearchExpression.split(',');

					let tmpSearchAddress = tmpMagicComparisonPatternSet[0];
					let tmpSearchComparator = tmpMagicComparisonPatternSet[1];
					let tmpSearchValue = tmpMagicComparisonPatternSet[2];

					tmpFilterState.ComparisonState = (
						{
							SearchAddress: tmpSearchAddress,
							Comparator: tmpSearchComparator,
							SearchTerm: tmpSearchValue
						});

					this.elucidatorSolver.solveOperation(
						{
							"Description":
							{
								"Operation": "Simple_If",
								"Synopsis": "Test for "
							},
							"Steps":
							[
								{
									"Namespace": "Logic",
									"Instruction": "if",
		
									"InputHashAddressMap": 
										{
											// This is ... dynamically assigning the address in the instruction
											// The complexity is astounding.
											"leftValue": `Record.${tmpSearchAddress}`,
											"rightValue": "ComparisonState.SearchTerm",
											"comparator": "ComparisonState.Comparator"
										},
									"OutputHashAddressMap": { "truthinessResult":"keepRecord" }
								}
							]
						}, tmpFilterState);
				});
			tmpPrecedent.parseString(tmpAddress);

			// It is expected that the operation will mutate this to some truthy value
			return tmpFilterState.keepRecord;
		}
		else
		{
			return true;
		}
	}

	// Get the value of an element at an address
	getValueAtAddress (pObject, pAddress, pParentAddress)
	{
		// Make sure pObject (the object we are meant to be recursing) is an object (which could be an array or object)
		if (typeof(pObject) != 'object') return undefined;
		// Make sure pAddress (the address we are resolving) is a string
		if (typeof(pAddress) != 'string') return undefined;
		// Stash the parent address for later resolution
		let tmpParentAddress = "";
		if (typeof(pParentAddress) == 'string')
		{
			tmpParentAddress = pParentAddress;
		}

		// TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
		let tmpSeparatorIndex = pAddress.indexOf('.');

		// This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
		if (tmpSeparatorIndex == -1)
		{
			// Check if the address refers to a boxed property
			let tmpBracketStartIndex = pAddress.indexOf('[');
			let tmpBracketStopIndex = pAddress.indexOf(']');

			// Check for the Object Set Type marker.
			// Note this will not work with a bracket in the same address box set
			let tmpObjectTypeMarkerIndex = pAddress.indexOf('{}');

			// Boxed elements look like this:
			// 		MyValues[10]
			// 		MyValues['Name']
			// 		MyValues["Age"]
			// 		MyValues[`Cost`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				// The "Name" of the Object contained too the left of the bracket
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
				// This is a rare case where Arrays testing as Objects is useful
				if (typeof(pObject[tmpBoxedPropertyName]) !== 'object')
				{
					return undefined;
				}

				// The "Reference" to the property within it, either an array element or object property
				let tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();
				// Attempt to parse the reference as a number, which will be used as an array element
				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
				//        This seems confusing to me at first read, so explaination:
				//        Is the Boxed Object an Array?  TRUE
				//        And is the Reference inside the boxed Object not a number? TRUE
				//        -->  So when these are in agreement, it's an impossible access state
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return undefined;
				}

				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to treat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynamic object property.
					// We would expect the property to be wrapped in some kind of quotes so strip them
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Return the value in the property
					return pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference];
				}
				else
				{
					return pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber];
				}
			}
			// The requirements to detect a boxed set element are:
			//    1) The start bracket is after character 0
			else if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket is after the start bracket
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is nothing in the brackets
				&& (tmpBracketStopIndex - tmpBracketStartIndex == 1))
			{
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				if (!Array.isArray(pObject[tmpBoxedPropertyName]))
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				let tmpInputArray = pObject[tmpBoxedPropertyName];
				let tmpOutputArray = [];
				for (let i = 0; i < tmpInputArray.length; i++)
				{
					// The filtering is complex but allows config-based metaprogramming directly from schema
					let tmpKeepRecord = this.checkFilters(pAddress, tmpInputArray[i]);
					if (tmpKeepRecord)
					{
						tmpOutputArray.push(tmpInputArray[i]);
					}
				}

				return tmpOutputArray;
			}
			// The object has been flagged as an object set, so treat it as such
			else if (tmpObjectTypeMarkerIndex > 0)
			{
				let tmpObjectPropertyName = pAddress.substring(0, tmpObjectTypeMarkerIndex).trim();

				if (typeof(pObject[tmpObjectPropertyName]) != 'object')
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				return pObject[tmpObjectPropertyName];
			}
			else
			{
				// Now is the point in recursion to return the value in the address
				return pObject[pAddress];
			}
		}
		else
		{
			let tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
			let tmpNewAddress = pAddress.substring(tmpSeparatorIndex+1);

			// BOXED ELEMENTS
			// Test if the tmpNewAddress is an array or object
			// Check if it's a boxed property
			let tmpBracketStartIndex = tmpSubObjectName.indexOf('[');
			let tmpBracketStopIndex = tmpSubObjectName.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[42]
			// 		MyValues['Color']
			// 		MyValues["Weight"]
			// 		MyValues[`Diameter`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				let tmpBoxedPropertyName = tmpSubObjectName.substring(0, tmpBracketStartIndex).trim();

				let tmpBoxedPropertyReference = tmpSubObjectName.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();

				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
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
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return undefined;
				}

				//This is a bracketed value
				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to reat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynanmic object property.
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Continue to manage the parent address for recursion
					tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
					// Recurse directly into the subobject
					return this.getValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpNewAddress, tmpParentAddress);
				}
				else
				{
					// Continue to manage the parent address for recursion
					tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
					// We parsed a valid number out of the boxed property name, so recurse into the array
					return this.getValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpNewAddress, tmpParentAddress);
				}
			}
			// The requirements to detect a boxed set element are:
			//    1) The start bracket is after character 0
			else if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket is after the start bracket
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is nothing in the brackets
				&& (tmpBracketStopIndex - tmpBracketStartIndex == 1))
			{
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				if (!Array.isArray(pObject[tmpBoxedPropertyName]))
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				// We need to enumerate the array and grab the addresses from there.
				let tmpArrayProperty = pObject[tmpBoxedPropertyName];
				// Managing the parent address is a bit more complex here -- the box will be added for each element.
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpBoxedPropertyName}`;
				// The container object is where we have the "Address":SOMEVALUE pairs
				let tmpContainerObject = {};
				for (let i = 0; i < tmpArrayProperty.length; i++)
				{
					let tmpPropertyParentAddress = `${tmpParentAddress}[${i}]`;
					let tmpValue = this.getValueAtAddress(pObject[tmpBoxedPropertyName][i], tmpNewAddress, tmpPropertyParentAddress);
					
					tmpContainerObject[`${tmpPropertyParentAddress}.${tmpNewAddress}`] = tmpValue;
				}

				return tmpContainerObject;
			}

			// OBJECT SET
			// Note this will not work with a bracket in the same address box set
			let tmpObjectTypeMarkerIndex = pAddress.indexOf('{}');
			if (tmpObjectTypeMarkerIndex > 0)
			{
				let tmpObjectPropertyName = pAddress.substring(0, tmpObjectTypeMarkerIndex).trim();

				if (typeof(pObject[tmpObjectPropertyName]) != 'object')
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				// We need to enumerate the Object and grab the addresses from there.
				let tmpObjectProperty = pObject[tmpObjectPropertyName];
				let tmpObjectPropertyKeys = Object.keys(tmpObjectProperty);
				// Managing the parent address is a bit more complex here -- the box will be added for each element.
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpObjectPropertyName}`;
				// The container object is where we have the "Address":SOMEVALUE pairs
				let tmpContainerObject = {};
				for (let i = 0; i < tmpObjectPropertyKeys.length; i++)
				{
					let tmpPropertyParentAddress = `${tmpParentAddress}.${tmpObjectPropertyKeys[i]}`;
					let tmpValue = this.getValueAtAddress(pObject[tmpObjectPropertyName][tmpObjectPropertyKeys[i]], tmpNewAddress, tmpPropertyParentAddress);
	
					// The filtering is complex but allows config-based metaprogramming directly from schema
					let tmpKeepRecord = this.checkFilters(pAddress, tmpValue);
					if (tmpKeepRecord)
					{
						tmpContainerObject[`${tmpPropertyParentAddress}.${tmpNewAddress}`] = tmpValue;
					}
				}

				return tmpContainerObject;
			}

			// If there is an object property already named for the sub object, but it isn't an object
			// then the system can't set the value in there.  Error and abort!
			if (pObject.hasOwnProperty(tmpSubObjectName) && typeof(pObject[tmpSubObjectName]) !== 'object')
			{
				return undefined;
			}
			else if (pObject.hasOwnProperty(tmpSubObjectName))
			{
				// If there is already a subobject pass that to the recursive thingy
				// Continue to manage the parent address for recursion
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
				return this.getValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, tmpParentAddress);
			}
			else
			{
				// Create a subobject and then pass that
				// Continue to manage the parent address for recursion
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
				pObject[tmpSubObjectName] = {};
				return this.getValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, tmpParentAddress);
			}
		}
	}

	// Set the value of an element at an address
	setValueAtAddress (pObject, pAddress, pValue)
	{
		// Make sure pObject is an object
		if (typeof(pObject) != 'object') return false;
		// Make sure pAddress is a string
		if (typeof(pAddress) != 'string') return false;

		let tmpSeparatorIndex = pAddress.indexOf('.');

		if (tmpSeparatorIndex == -1)
		{
			// Check if it's a boxed property
			let tmpBracketStartIndex = pAddress.indexOf('[');
			let tmpBracketStopIndex = pAddress.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[10]
			// 		MyValues['Name']
			// 		MyValues["Age"]
			// 		MyValues[`Cost`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				// The "Name" of the Object contained too the left of the bracket
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
				// This is a rare case where Arrays testing as Objects is useful
				if (typeof(pObject[tmpBoxedPropertyName]) !== 'object')
				{
					return false;
				}

				// The "Reference" to the property within it, either an array element or object property
				let tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();
				// Attempt to parse the reference as a number, which will be used as an array element
				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
				//        This seems confusing to me at first read, so explaination:
				//        Is the Boxed Object an Array?  TRUE
				//        And is the Reference inside the boxed Object not a number? TRUE
				//        -->  So when these are in agreement, it's an impossible access state
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return false;
				}

				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to treat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynamic object property.
					// We would expect the property to be wrapped in some kind of quotes so strip them
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Return the value in the property
					pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference] = pValue;
					return true;
				}
				else
				{
					pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber] = pValue;
					return true;
				}
			}
			else
			{
				// Now is the time in recursion to set the value in the object
				pObject[pAddress] = pValue;
				return true;
			}
		}
		else
		{
			let tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
			let tmpNewAddress = pAddress.substring(tmpSeparatorIndex+1);

			// Test if the tmpNewAddress is an array or object
			// Check if it's a boxed property
			let tmpBracketStartIndex = tmpSubObjectName.indexOf('[');
			let tmpBracketStopIndex = tmpSubObjectName.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[42]
			// 		MyValues['Color']
			// 		MyValues["Weight"]
			// 		MyValues[`Diameter`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				let tmpBoxedPropertyName = tmpSubObjectName.substring(0, tmpBracketStartIndex).trim();

				let tmpBoxedPropertyReference = tmpSubObjectName.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();

				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
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
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return false;
				}

				//This is a bracketed value
				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to reat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynanmic object property.
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Recurse directly into the subobject
					return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpNewAddress, pValue);
				}
				else
				{
					// We parsed a valid number out of the boxed property name, so recurse into the array
					return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpNewAddress, pValue);
				}
			}

			// If there is an object property already named for the sub object, but it isn't an object
			// then the system can't set the value in there.  Error and abort!
			if (pObject.hasOwnProperty(tmpSubObjectName) && typeof(pObject[tmpSubObjectName]) !== 'object')
			{
				if (!pObject.hasOwnProperty('__ERROR'))
					pObject['__ERROR'] = {};
				// Put it in an error object so data isn't lost
				pObject['__ERROR'][pAddress] = pValue;
				return false;
			}
			else if (pObject.hasOwnProperty(tmpSubObjectName))
			{
				// If there is already a subobject pass that to the recursive thingy
				return this.setValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, pValue);
			}
			else
			{
				// Create a subobject and then pass that
				pObject[tmpSubObjectName] = {};
				return this.setValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, pValue);
			}
		}
	}
};

module.exports = ManyfestObjectAddressResolver;
},{"./Manyfest-LogToConsole.js":37,"elucidator":25,"precedent":32}],40:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"./Manyfest-LogToConsole.js":37,"dup":30}],41:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');

let libPrecedent = require('precedent');

let libHashTranslation = require('./Manyfest-HashTranslation.js');
let libObjectAddressResolver = require('./Manyfest-ObjectAddressResolver.js');
let libObjectAddressGeneration = require('./Manyfest-ObjectAddressGeneration.js');
let libSchemaManipulation = require('./Manyfest-SchemaManipulation.js');


/**
* Manyfest object address-based descriptions and manipulations.
*
* @class Manyfest
*/
class Manyfest
{
	constructor(pManifest, pInfoLog, pErrorLog, pOptions)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) === 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) === 'function') ? pErrorLog : libSimpleLog;

		// Create an object address resolver and map in the functions
		this.objectAddressResolver = new libObjectAddressResolver(this.logInfo, this.logError);

		this.options = (
			{
				strict: false,
				defaultValues: 
					{
						"String": "",
						"Number": 0,
						"Float": 0.0,
						"Integer": 0,
						"Boolean": false,
						"Binary": 0,
						"DateTime": 0,
						"Array": [],
						"Object": {},
						"Null": null
					}
			});

		this.scope = undefined;
		this.elementAddresses = undefined;
		this.elementHashes = undefined;
		this.elementDescriptors = undefined;
		// This can cause a circular dependency chain, so it only gets initialized if the schema specifically calls for it.
		this.dataSolvers = undefined;
		// So solvers can use their own state
		this.dataSolverState = undefined;

		this.reset();

		if (typeof(pManifest) === 'object')
		{
			this.loadManifest(pManifest);
		}

		this.schemaManipulations = new libSchemaManipulation(this.logInfo, this.logError);
		this.objectAddressGeneration = new libObjectAddressGeneration(this.logInfo, this.logError);

		this.hashTranslations = new libHashTranslation(this.logInfo, this.logError);
	}

	/*************************************************************************
	 * Schema Manifest Loading, Reading, Manipulation and Serialization Functions
	 */

	// Reset critical manifest properties
	reset()
	{
		this.scope = 'DEFAULT';
		this.elementAddresses = [];
		this.elementHashes = {};
		this.elementDescriptors = {};
		this.dataSolvers = undefined;
		this.dataSolverState = {};

		this.libElucidator = undefined;
		this.objectAddressResolver.elucidatorSolver = false;
	}

	clone()
	{
		// Make a copy of the options in-place
		let tmpNewOptions = JSON.parse(JSON.stringify(this.options));

		let tmpNewManyfest = new Manyfest(this.getManifest(), this.logInfo, this.logError, tmpNewOptions);

		// Import the hash translations
		tmpNewManyfest.hashTranslations.addTranslation(this.hashTranslations.translationTable);

		return tmpNewManyfest;
	}

	// Deserialize a Manifest from a string
	deserialize(pManifestString)
	{
		// TODO: Add guards for bad manifest string
		return this.loadManifest(JSON.parse(pManifestString));
	}

	// Load a manifest from an object
	loadManifest(pManifest)
	{
		if (typeof(pManifest) !== 'object')
		{
			this.logError(`(${this.scope}) Error loading manifest; expecting an object but parameter was type ${typeof(pManifest)}.`);
			return false;
		}

		if (pManifest.hasOwnProperty('Scope'))
		{
			if (typeof(pManifest.Scope) === 'string')
			{
				this.scope = pManifest.Scope;
			}
			else
			{
				this.logError(`(${this.scope}) Error loading scope from manifest; expecting a string but property was type ${typeof(pManifest.Scope)}.`, pManifest);
			}
		}
		else
		{
			this.logError(`(${this.scope}) Error loading scope from manifest object.  Property "Scope" does not exist in the root of the object.`, pManifest);
		}

		if (pManifest.hasOwnProperty('Descriptors'))
		{
			if (typeof(pManifest.Descriptors) === 'object')
			{
				let tmpDescriptionAddresses = Object.keys(pManifest.Descriptors);
				for (let i = 0; i < tmpDescriptionAddresses.length; i++)
				{
					this.addDescriptor(tmpDescriptionAddresses[i], pManifest.Descriptors[tmpDescriptionAddresses[i]]);
				}
			}
			else
			{
				this.logError(`(${this.scope}) Error loading description object from manifest object.  Expecting an object in 'Manifest.Descriptors' but the property was type ${typeof(pManifest.Descriptors)}.`, pManifest);
			}
		}
		else
		{
			this.logError(`(${this.scope}) Error loading object description from manifest object.  Property "Descriptors" does not exist in the root of the Manifest object.`, pManifest);
		}

		// This seems like it would create a circular dependency issue but it only goes as deep as the schema defines Solvers
		if ((pManifest.hasOwnProperty('Solvers')) && (typeof(pManifest.Solvers) == 'object'))
		{
			// There are elucidator solvers passed-in, so we will create one to filter data.
			let libElucidator = require('elucidator');
			// WARNING THESE CAN MUTATE THE DATA
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
			this.dataSolvers = new libElucidator(pManifest.Solvers, this.logInfo, this.logError);
			this.objectAddressResolver.elucidatorSolver = this.dataSolvers;

			// Load the solver state in so each instruction can have internal config
			// TODO: Should this just be a part of the lower layer pattern?
			let tmpSolverKeys = Object.keys(pManifest.Solvers)
			for (let i = 0; i < tmpSolverKeys.length; i++)
			{
				this.dataSolverState[tmpSolverKeys] = pManifest.Solvers[tmpSolverKeys[i]];
			}
			this.objectAddressResolver.elucidatorSolverState = this.dataSolverState;
		}
	}

	// Serialize the Manifest to a string
	// TODO: Should this also serialize the translation table?
	serialize()
	{
		return JSON.stringify(this.getManifest());
	}

	getManifest()
	{
		return (
			{
				Scope: this.scope,
				Descriptors: JSON.parse(JSON.stringify(this.elementDescriptors))
			});
	}

	// Add a descriptor to the manifest
	addDescriptor(pAddress, pDescriptor)
	{
		if (typeof(pDescriptor) === 'object')
		{
			// Add the Address into the Descriptor if it doesn't exist:
			if (!pDescriptor.hasOwnProperty('Address'))
			{
				pDescriptor.Address = pAddress;
			}

			if (!this.elementDescriptors.hasOwnProperty(pAddress))
			{
				this.elementAddresses.push(pAddress);
			}

			// Add the element descriptor to the schema
			this.elementDescriptors[pAddress] = pDescriptor;

			// Always add the address as a hash
			this.elementHashes[pAddress] = pAddress;

			if (pDescriptor.hasOwnProperty('Hash'))
			{
				// TODO: Check if this is a good idea or not..
				//       Collisions are bound to happen with both representations of the address/hash in here and developers being able to create their own hashes.
				this.elementHashes[pDescriptor.Hash] = pAddress;
			}
			else
			{
				pDescriptor.Hash = pAddress;
			}

			return true;
		}
		else
		{
			this.logError(`(${this.scope}) Error loading object descriptor for address '${pAddress}' from manifest object.  Expecting an object but property was type ${typeof(pDescriptor)}.`);
			return false;
		}	
	}

	getDescriptorByHash(pHash)
	{
		return this.getDescriptor(this.resolveHashAddress(pHash));
	}

	getDescriptor(pAddress)
	{
		return this.elementDescriptors[pAddress];
	}

	// execute an action function for each descriptor
	eachDescriptor(fAction)
	{
        let tmpDescriptorAddresses = Object.keys(this.elementDescriptors);
        for (let i = 0; i < tmpDescriptorAddresses.length; i++)
        {
            fAction(this.elementDescriptors[tmpDescriptorAddresses[i]]);
        }

	}

	/*************************************************************************
	 * Beginning of Object Manipulation (read & write) Functions
	 */
	// Check if an element exists by its hash
	checkAddressExistsByHash (pObject, pHash)
	{
		return this.checkAddressExists(pObject,this.resolveHashAddress(pHash));
	}

	// Check if an element exists at an address
	checkAddressExists (pObject, pAddress)
	{
		return this.objectAddressResolver.checkAddressExists(pObject, pAddress);
	}

	// Turn a hash into an address, factoring in the translation table.
	resolveHashAddress(pHash)
	{
		let tmpAddress = undefined;

		let tmpInElementHashTable = this.elementHashes.hasOwnProperty(pHash);
		let tmpInTranslationTable = this.hashTranslations.translationTable.hasOwnProperty(pHash);

		// The most straightforward: the hash exists, no translations.
		if (tmpInElementHashTable && !tmpInTranslationTable)
		{
			tmpAddress = this.elementHashes[pHash];
		}
		// There is a translation from one hash to another, and, the elementHashes contains the pointer end
		else if (tmpInTranslationTable && this.elementHashes.hasOwnProperty(this.hashTranslations.translate(pHash)))
		{
			tmpAddress = this.elementHashes[this.hashTranslations.translate(pHash)];
		}
		// Use the level of indirection only in the Translation Table 
		else if (tmpInTranslationTable)
		{
			tmpAddress = this.hashTranslations.translate(pHash);
		}
		// Just treat the hash as an address.
		// TODO: Discuss this ... it is magic but controversial
		else
		{
			tmpAddress = pHash;
		}

		return tmpAddress;
	}

	// Get the value of an element by its hash
	getValueByHash (pObject, pHash)
	{
		let tmpValue = this.getValueAtAddress(pObject, this.resolveHashAddress(pHash));

		if (typeof(tmpValue) == 'undefined')
		{
			// Try to get a default if it exists
			tmpValue = this.getDefaultValue(this.getDescriptorByHash(pHash));
		}

		return tmpValue;
	}

	// Get the value of an element at an address
	getValueAtAddress (pObject, pAddress)
	{
		let tmpValue = this.objectAddressResolver.getValueAtAddress(pObject, pAddress);

		if (typeof(tmpValue) == 'undefined')
		{
			// Try to get a default if it exists
			tmpValue = this.getDefaultValue(this.getDescriptor(pAddress));
		}

		return tmpValue;
	}

	// Set the value of an element by its hash
	setValueByHash(pObject, pHash, pValue)
	{
		return this.setValueAtAddress(pObject, this.resolveHashAddress(pHash), pValue);
	}


	// Set the value of an element at an address
	setValueAtAddress (pObject, pAddress, pValue)
	{
		return this.objectAddressResolver.setValueAtAddress(pObject, pAddress, pValue);
	}

	// Validate the consistency of an object against the schema
	validate(pObject)
	{
		let tmpValidationData =
		{
			Error: null,
			Errors: [],
			MissingElements:[]
		};

		if (typeof(pObject) !== 'object')
		{
			tmpValidationData.Error = true;
			tmpValidationData.Errors.push(`Expected passed in object to be type object but was passed in ${typeof(pObject)}`);
		}

		let addValidationError = (pAddress, pErrorMessage) =>
		{
			tmpValidationData.Error = true;
			tmpValidationData.Errors.push(`Element at address "${pAddress}" ${pErrorMessage}.`);
		};

		// Now enumerate through the values and check for anomalies based on the schema
		for (let i = 0; i < this.elementAddresses.length; i++)
		{
			let tmpDescriptor = this.getDescriptor(this.elementAddresses[i]);
			let tmpValueExists = this.checkAddressExists(pObject, tmpDescriptor.Address);
			let tmpValue = this.getValueAtAddress(pObject, tmpDescriptor.Address);

			if ((typeof(tmpValue) == 'undefined') || !tmpValueExists)
			{
				// This will technically mean that `Object.Some.Value = undefined` will end up showing as "missing"
				// TODO: Do we want to do a different message based on if the property exists but is undefined?
				tmpValidationData.MissingElements.push(tmpDescriptor.Address);
				if (tmpDescriptor.Required || this.options.strict)
				{
					addValidationError(tmpDescriptor.Address, 'is flagged REQUIRED but is not set in the object');
				}
			}

			// Now see if there is a data type specified for this element
			if (tmpDescriptor.DataType)
			{
				let tmpElementType = typeof(tmpValue);
				switch(tmpDescriptor.DataType.toString().trim().toLowerCase())
				{
					case 'string':
						if (tmpElementType != 'string')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						break;

					case 'number':
						if (tmpElementType != 'number')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						break;

					case 'integer':
						if (tmpElementType != 'number')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						else
						{
							let tmpValueString = tmpValue.toString();
							if (tmpValueString.indexOf('.') > -1)
							{
								// TODO: Is this an error?
								addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but has a decimal point in the number.`);
							}
						}
						break;

					case 'float':
						if (tmpElementType != 'number')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						break;

					case 'DateTime':
						let tmpValueDate = new Date(tmpValue);
						if (tmpValueDate.toString() == 'Invalid Date')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is not parsable as a Date by Javascript`);
						}
	
					default:
						// Check if this is a string, in the default case
						// Note this is only when a DataType is specified and it is an unrecognized data type.
						if (tmpElementType != 'string')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} (which auto-converted to String because it was unrecognized) but is of the type ${tmpElementType}`);
						}
						break;
				}
			}
		}

		return tmpValidationData;
	}

	// Returns a default value, or, the default value for the data type (which is overridable with configuration)
	getDefaultValue(pDescriptor)
	{
		if (typeof(pDescriptor) != 'object')
		{
			return undefined;
		}

		if (pDescriptor.hasOwnProperty('Default'))
		{
			return pDescriptor.Default;
		}
		else
		{
			// Default to a null if it doesn't have a type specified.
			// This will ensure a placeholder is created but isn't misinterpreted.
			let tmpDataType = (pDescriptor.hasOwnProperty('DataType')) ? pDescriptor.DataType : 'String';
			if (this.options.defaultValues.hasOwnProperty(tmpDataType))
			{
				return this.options.defaultValues[tmpDataType];
			}
			else
			{
				// give up and return null
				return null;
			}
		}
	}

	// Enumerate through the schema and populate default values if they don't exist.
	populateDefaults(pObject, pOverwriteProperties)
	{
		return this.populateObject(pObject, pOverwriteProperties,
			// This just sets up a simple filter to see if there is a default set.
			(pDescriptor) =>
			{
				return pDescriptor.hasOwnProperty('Default');
			});
	}

	// Forcefully populate all values even if they don't have defaults.
	// Based on type, this can do unexpected things.
	populateObject(pObject, pOverwriteProperties, fFilter)
	{
		// Automatically create an object if one isn't passed in.
		let tmpObject = (typeof(pObject) === 'object') ? pObject : {};
		// Default to *NOT OVERWRITING* properties
		let tmpOverwriteProperties = (typeof(pOverwriteProperties) == 'undefined') ? false : pOverwriteProperties;
		// This is a filter function, which is passed the schema and allows complex filtering of population
		// The default filter function just returns true, populating everything.
		let tmpFilterFunction = (typeof(fFilter) == 'function') ? fFilter : (pDescriptor) => { return true; };

		this.elementAddresses.forEach(
			(pAddress) =>
			{
				let tmpDescriptor = this.getDescriptor(pAddress);
				// Check the filter function to see if this is an address we want to set the value for.
				if (tmpFilterFunction(tmpDescriptor))
				{
					// If we are overwriting properties OR the property does not exist
					if (tmpOverwriteProperties || !this.checkAddressExists(tmpObject, pAddress))
					{
						this.setValueAtAddress(tmpObject, pAddress, this.getDefaultValue(tmpDescriptor));
					}
				}
			});

		return tmpObject;
	}
};

module.exports = Manyfest;
},{"./Manyfest-HashTranslation.js":36,"./Manyfest-LogToConsole.js":37,"./Manyfest-ObjectAddressGeneration.js":38,"./Manyfest-ObjectAddressResolver.js":39,"./Manyfest-SchemaManipulation.js":40,"elucidator":25,"precedent":32}]},{},[35])(35)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZGVjaW1hbC5qcy9kZWNpbWFsLmpzIiwibm9kZV9tb2R1bGVzL2VsdWNpZGF0b3Ivc291cmNlL0VsdWNpZGF0b3ItSW5zdHJ1Y3Rpb25TZXQuanMiLCJub2RlX21vZHVsZXMvZWx1Y2lkYXRvci9zb3VyY2UvRWx1Y2lkYXRvci1Mb2dUb0NvbnNvbGUuanMiLCJub2RlX21vZHVsZXMvZWx1Y2lkYXRvci9zb3VyY2UvSW5zdHJ1Y3Rpb25TZXRzL0dlb21ldHJ5LmpzIiwibm9kZV9tb2R1bGVzL2VsdWNpZGF0b3Ivc291cmNlL0luc3RydWN0aW9uU2V0cy9Mb2dpYy5qcyIsIm5vZGVfbW9kdWxlcy9lbHVjaWRhdG9yL3NvdXJjZS9JbnN0cnVjdGlvblNldHMvTWF0aC1KYXZhc2NyaXB0LmpzIiwibm9kZV9tb2R1bGVzL2VsdWNpZGF0b3Ivc291cmNlL0luc3RydWN0aW9uU2V0cy9PcGVyYXRpb25zL0dlb21ldHJ5LVJlY3RhbmdsZUFyZWEuanNvbiIsIm5vZGVfbW9kdWxlcy9lbHVjaWRhdG9yL3NvdXJjZS9JbnN0cnVjdGlvblNldHMvT3BlcmF0aW9ucy9Mb2dpYy1FeGVjdXRlLmpzb24iLCJub2RlX21vZHVsZXMvZWx1Y2lkYXRvci9zb3VyY2UvSW5zdHJ1Y3Rpb25TZXRzL09wZXJhdGlvbnMvTG9naWMtSWYuanNvbiIsIm5vZGVfbW9kdWxlcy9lbHVjaWRhdG9yL3NvdXJjZS9JbnN0cnVjdGlvblNldHMvT3BlcmF0aW9ucy9NYXRoLUFkZC5qc29uIiwibm9kZV9tb2R1bGVzL2VsdWNpZGF0b3Ivc291cmNlL0luc3RydWN0aW9uU2V0cy9PcGVyYXRpb25zL01hdGgtQWdncmVnYXRlLmpzb24iLCJub2RlX21vZHVsZXMvZWx1Y2lkYXRvci9zb3VyY2UvSW5zdHJ1Y3Rpb25TZXRzL09wZXJhdGlvbnMvTWF0aC1EaXZpZGUuanNvbiIsIm5vZGVfbW9kdWxlcy9lbHVjaWRhdG9yL3NvdXJjZS9JbnN0cnVjdGlvblNldHMvT3BlcmF0aW9ucy9NYXRoLU11bHRpcGx5Lmpzb24iLCJub2RlX21vZHVsZXMvZWx1Y2lkYXRvci9zb3VyY2UvSW5zdHJ1Y3Rpb25TZXRzL09wZXJhdGlvbnMvTWF0aC1TdWJ0cmFjdC5qc29uIiwibm9kZV9tb2R1bGVzL2VsdWNpZGF0b3Ivc291cmNlL0luc3RydWN0aW9uU2V0cy9PcGVyYXRpb25zL1ByZWNpc2VNYXRoLUFkZC5qc29uIiwibm9kZV9tb2R1bGVzL2VsdWNpZGF0b3Ivc291cmNlL0luc3RydWN0aW9uU2V0cy9PcGVyYXRpb25zL1ByZWNpc2VNYXRoLUFnZ3JlZ2F0ZS5qc29uIiwibm9kZV9tb2R1bGVzL2VsdWNpZGF0b3Ivc291cmNlL0luc3RydWN0aW9uU2V0cy9PcGVyYXRpb25zL1ByZWNpc2VNYXRoLURpdmlkZS5qc29uIiwibm9kZV9tb2R1bGVzL2VsdWNpZGF0b3Ivc291cmNlL0luc3RydWN0aW9uU2V0cy9PcGVyYXRpb25zL1ByZWNpc2VNYXRoLU11bHRpcGx5Lmpzb24iLCJub2RlX21vZHVsZXMvZWx1Y2lkYXRvci9zb3VyY2UvSW5zdHJ1Y3Rpb25TZXRzL09wZXJhdGlvbnMvUHJlY2lzZU1hdGgtU3VidHJhY3QuanNvbiIsIm5vZGVfbW9kdWxlcy9lbHVjaWRhdG9yL3NvdXJjZS9JbnN0cnVjdGlvblNldHMvT3BlcmF0aW9ucy9TdHJpbmctUmVwbGFjZS5qc29uIiwibm9kZV9tb2R1bGVzL2VsdWNpZGF0b3Ivc291cmNlL0luc3RydWN0aW9uU2V0cy9PcGVyYXRpb25zL1N0cmluZy1TdWJzdHJpbmcuanNvbiIsIm5vZGVfbW9kdWxlcy9lbHVjaWRhdG9yL3NvdXJjZS9JbnN0cnVjdGlvblNldHMvT3BlcmF0aW9ucy9TdHJpbmctVHJpbS5qc29uIiwibm9kZV9tb2R1bGVzL2VsdWNpZGF0b3Ivc291cmNlL0luc3RydWN0aW9uU2V0cy9QcmVjaXNlTWF0aC1EZWNpbWFsLmpzIiwibm9kZV9tb2R1bGVzL2VsdWNpZGF0b3Ivc291cmNlL0luc3RydWN0aW9uU2V0cy9TdHJpbmcuanMiLCJub2RlX21vZHVsZXMvZWx1Y2lkYXRvci9zb3VyY2UvZWx1Y2lkYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9tYW55ZmVzdC9zb3VyY2UvTWFueWZlc3QtSGFzaFRyYW5zbGF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL21hbnlmZXN0L3NvdXJjZS9NYW55ZmVzdC1Mb2dUb0NvbnNvbGUuanMiLCJub2RlX21vZHVsZXMvbWFueWZlc3Qvc291cmNlL01hbnlmZXN0LU9iamVjdEFkZHJlc3NHZW5lcmF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL21hbnlmZXN0L3NvdXJjZS9NYW55ZmVzdC1PYmplY3RBZGRyZXNzUmVzb2x2ZXIuanMiLCJub2RlX21vZHVsZXMvbWFueWZlc3Qvc291cmNlL01hbnlmZXN0LVNjaGVtYU1hbmlwdWxhdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9tYW55ZmVzdC9zb3VyY2UvTWFueWZlc3QuanMiLCJub2RlX21vZHVsZXMvcHJlY2VkZW50L3NvdXJjZS9QcmVjZWRlbnQuanMiLCJub2RlX21vZHVsZXMvcHJlY2VkZW50L3NvdXJjZS9TdHJpbmdQYXJzZXIuanMiLCJub2RlX21vZHVsZXMvcHJlY2VkZW50L3NvdXJjZS9Xb3JkVHJlZS5qcyIsInNvdXJjZS9NYW55ZmVzdC1Ccm93c2VyLVNoaW0uanMiLCJzb3VyY2UvTWFueWZlc3QtT2JqZWN0QWRkcmVzc1Jlc29sdmVyLmpzIiwic291cmNlL01hbnlmZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3QwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbHpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCI7KGZ1bmN0aW9uIChnbG9iYWxTY29wZSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcblxyXG4gIC8qIVxyXG4gICAqICBkZWNpbWFsLmpzIHYxMC40LjJcclxuICAgKiAgQW4gYXJiaXRyYXJ5LXByZWNpc2lvbiBEZWNpbWFsIHR5cGUgZm9yIEphdmFTY3JpcHQuXHJcbiAgICogIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2RlY2ltYWwuanNcclxuICAgKiAgQ29weXJpZ2h0IChjKSAyMDIyIE1pY2hhZWwgTWNsYXVnaGxpbiA8TThjaDg4bEBnbWFpbC5jb20+XHJcbiAgICogIE1JVCBMaWNlbmNlXHJcbiAgICovXHJcblxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgRURJVEFCTEUgREVGQVVMVFMgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xyXG5cclxuXHJcbiAgICAvLyBUaGUgbWF4aW11bSBleHBvbmVudCBtYWduaXR1ZGUuXHJcbiAgICAvLyBUaGUgbGltaXQgb24gdGhlIHZhbHVlIG9mIGB0b0V4cE5lZ2AsIGB0b0V4cFBvc2AsIGBtaW5FYCBhbmQgYG1heEVgLlxyXG4gIHZhciBFWFBfTElNSVQgPSA5ZTE1LCAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDllMTVcclxuXHJcbiAgICAvLyBUaGUgbGltaXQgb24gdGhlIHZhbHVlIG9mIGBwcmVjaXNpb25gLCBhbmQgb24gdGhlIHZhbHVlIG9mIHRoZSBmaXJzdCBhcmd1bWVudCB0b1xyXG4gICAgLy8gYHRvRGVjaW1hbFBsYWNlc2AsIGB0b0V4cG9uZW50aWFsYCwgYHRvRml4ZWRgLCBgdG9QcmVjaXNpb25gIGFuZCBgdG9TaWduaWZpY2FudERpZ2l0c2AuXHJcbiAgICBNQVhfRElHSVRTID0gMWU5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMWU5XHJcblxyXG4gICAgLy8gQmFzZSBjb252ZXJzaW9uIGFscGhhYmV0LlxyXG4gICAgTlVNRVJBTFMgPSAnMDEyMzQ1Njc4OWFiY2RlZicsXHJcblxyXG4gICAgLy8gVGhlIG5hdHVyYWwgbG9nYXJpdGhtIG9mIDEwICgxMDI1IGRpZ2l0cykuXHJcbiAgICBMTjEwID0gJzIuMzAyNTg1MDkyOTk0MDQ1Njg0MDE3OTkxNDU0Njg0MzY0MjA3NjAxMTAxNDg4NjI4NzcyOTc2MDMzMzI3OTAwOTY3NTcyNjA5Njc3MzUyNDgwMjM1OTk3MjA1MDg5NTk4Mjk4MzQxOTY3Nzg0MDQyMjg2MjQ4NjMzNDA5NTI1NDY1MDgyODA2NzU2NjY2Mjg3MzY5MDk4NzgxNjg5NDgyOTA3MjA4MzI1NTU0NjgwODQzNzk5ODk0ODI2MjMzMTk4NTI4MzkzNTA1MzA4OTY1Mzc3NzMyNjI4ODQ2MTYzMzY2MjIyMjg3Njk4MjE5ODg2NzQ2NTQzNjY3NDc0NDA0MjQzMjc0MzY1MTU1MDQ4OTM0MzE0OTM5MzkxNDc5NjE5NDA0NDAwMjIyMTA1MTAxNzE0MTc0ODAwMzY4ODA4NDAxMjY0NzA4MDY4NTU2Nzc0MzIxNjIyODM1NTIyMDExNDgwNDY2MzcxNTY1OTEyMTM3MzQ1MDc0Nzg1Njk0NzY4MzQ2MzYxNjc5MjEwMTgwNjQ0NTA3MDY0ODAwMDI3NzUwMjY4NDkxNjc0NjU1MDU4Njg1NjkzNTY3MzQyMDY3MDU4MTEzNjQyOTIyNDU1NDQwNTc1ODkyNTcyNDIwODI0MTMxNDY5NTY4OTAxNjc1ODk0MDI1Njc3NjMxMTM1NjkxOTI5MjAzMzM3NjU4NzE0MTY2MDIzMDEwNTcwMzA4OTYzNDU3MjA3NTQ0MDM3MDg0NzQ2OTk0MDE2ODI2OTI4MjgwODQ4MTE4NDI4OTMxNDg0ODUyNDk0ODY0NDg3MTkyNzgwOTY3NjI3MTI3NTc3NTM5NzAyNzY2ODYwNTk1MjQ5NjcxNjY3NDE4MzQ4NTcwNDQyMjUwNzE5Nzk2NTAwNDcxNDk1MTA1MDQ5MjIxNDc3NjU2NzYzNjkzODY2Mjk3Njk3OTUyMjExMDcxODI2NDU0OTczNDc3MjY2MjQyNTcwOTQyOTMyMjU4Mjc5ODUwMjU4NTUwOTc4NTI2NTM4MzIwNzYwNjcyNjMxNzE2NDMwOTUwNTk5NTA4NzgwNzUyMzcxMDMzMzEwMTE5Nzg1NzU0NzMzMTU0MTQyMTgwODQyNzU0Mzg2MzU5MTc3ODExNzA1NDMwOTgyNzQ4MjM4NTA0NTY0ODAxOTA5NTYxMDI5OTI5MTgyNDMxODIzNzUyNTM1NzcwOTc1MDUzOTU2NTE4NzY5NzUxMDM3NDk3MDg4ODY5MjE4MDIwNTE4OTMzOTUwNzIzODUzOTIwNTE0NDYzNDE5NzI2NTI4NzI4Njk2NTExMDg2MjU3MTQ5MjE5ODg0OTk3ODc0ODg3Mzc3MTM0NTY4NjIwOTE2NzA1OCcsXHJcblxyXG4gICAgLy8gUGkgKDEwMjUgZGlnaXRzKS5cclxuICAgIFBJID0gJzMuMTQxNTkyNjUzNTg5NzkzMjM4NDYyNjQzMzgzMjc5NTAyODg0MTk3MTY5Mzk5Mzc1MTA1ODIwOTc0OTQ0NTkyMzA3ODE2NDA2Mjg2MjA4OTk4NjI4MDM0ODI1MzQyMTE3MDY3OTgyMTQ4MDg2NTEzMjgyMzA2NjQ3MDkzODQ0NjA5NTUwNTgyMjMxNzI1MzU5NDA4MTI4NDgxMTE3NDUwMjg0MTAyNzAxOTM4NTIxMTA1NTU5NjQ0NjIyOTQ4OTU0OTMwMzgxOTY0NDI4ODEwOTc1NjY1OTMzNDQ2MTI4NDc1NjQ4MjMzNzg2NzgzMTY1MjcxMjAxOTA5MTQ1NjQ4NTY2OTIzNDYwMzQ4NjEwNDU0MzI2NjQ4MjEzMzkzNjA3MjYwMjQ5MTQxMjczNzI0NTg3MDA2NjA2MzE1NTg4MTc0ODgxNTIwOTIwOTYyODI5MjU0MDkxNzE1MzY0MzY3ODkyNTkwMzYwMDExMzMwNTMwNTQ4ODIwNDY2NTIxMzg0MTQ2OTUxOTQxNTExNjA5NDMzMDU3MjcwMzY1NzU5NTkxOTUzMDkyMTg2MTE3MzgxOTMyNjExNzkzMTA1MTE4NTQ4MDc0NDYyMzc5OTYyNzQ5NTY3MzUxODg1NzUyNzI0ODkxMjI3OTM4MTgzMDExOTQ5MTI5ODMzNjczMzYyNDQwNjU2NjQzMDg2MDIxMzk0OTQ2Mzk1MjI0NzM3MTkwNzAyMTc5ODYwOTQzNzAyNzcwNTM5MjE3MTc2MjkzMTc2NzUyMzg0Njc0ODE4NDY3NjY5NDA1MTMyMDAwNTY4MTI3MTQ1MjYzNTYwODI3Nzg1NzcxMzQyNzU3Nzg5NjA5MTczNjM3MTc4NzIxNDY4NDQwOTAxMjI0OTUzNDMwMTQ2NTQ5NTg1MzcxMDUwNzkyMjc5Njg5MjU4OTIzNTQyMDE5OTU2MTEyMTI5MDIxOTYwODY0MDM0NDE4MTU5ODEzNjI5Nzc0NzcxMzA5OTYwNTE4NzA3MjExMzQ5OTk5OTk4MzcyOTc4MDQ5OTUxMDU5NzMxNzMyODE2MDk2MzE4NTk1MDI0NDU5NDU1MzQ2OTA4MzAyNjQyNTIyMzA4MjUzMzQ0Njg1MDM1MjYxOTMxMTg4MTcxMDEwMDAzMTM3ODM4NzUyODg2NTg3NTMzMjA4MzgxNDIwNjE3MTc3NjY5MTQ3MzAzNTk4MjUzNDkwNDI4NzU1NDY4NzMxMTU5NTYyODYzODgyMzUzNzg3NTkzNzUxOTU3NzgxODU3NzgwNTMyMTcxMjI2ODA2NjEzMDAxOTI3ODc2NjExMTk1OTA5MjE2NDIwMTk4OTM4MDk1MjU3MjAxMDY1NDg1ODYzMjc4OScsXHJcblxyXG5cclxuICAgIC8vIFRoZSBpbml0aWFsIGNvbmZpZ3VyYXRpb24gcHJvcGVydGllcyBvZiB0aGUgRGVjaW1hbCBjb25zdHJ1Y3Rvci5cclxuICAgIERFRkFVTFRTID0ge1xyXG5cclxuICAgICAgLy8gVGhlc2UgdmFsdWVzIG11c3QgYmUgaW50ZWdlcnMgd2l0aGluIHRoZSBzdGF0ZWQgcmFuZ2VzIChpbmNsdXNpdmUpLlxyXG4gICAgICAvLyBNb3N0IG9mIHRoZXNlIHZhbHVlcyBjYW4gYmUgY2hhbmdlZCBhdCBydW4tdGltZSB1c2luZyB0aGUgYERlY2ltYWwuY29uZmlnYCBtZXRob2QuXHJcblxyXG4gICAgICAvLyBUaGUgbWF4aW11bSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZGlnaXRzIG9mIHRoZSByZXN1bHQgb2YgYSBjYWxjdWxhdGlvbiBvciBiYXNlIGNvbnZlcnNpb24uXHJcbiAgICAgIC8vIEUuZy4gYERlY2ltYWwuY29uZmlnKHsgcHJlY2lzaW9uOiAyMCB9KTtgXHJcbiAgICAgIHByZWNpc2lvbjogMjAsICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDEgdG8gTUFYX0RJR0lUU1xyXG5cclxuICAgICAgLy8gVGhlIHJvdW5kaW5nIG1vZGUgdXNlZCB3aGVuIHJvdW5kaW5nIHRvIGBwcmVjaXNpb25gLlxyXG4gICAgICAvL1xyXG4gICAgICAvLyBST1VORF9VUCAgICAgICAgIDAgQXdheSBmcm9tIHplcm8uXHJcbiAgICAgIC8vIFJPVU5EX0RPV04gICAgICAgMSBUb3dhcmRzIHplcm8uXHJcbiAgICAgIC8vIFJPVU5EX0NFSUwgICAgICAgMiBUb3dhcmRzICtJbmZpbml0eS5cclxuICAgICAgLy8gUk9VTkRfRkxPT1IgICAgICAzIFRvd2FyZHMgLUluZmluaXR5LlxyXG4gICAgICAvLyBST1VORF9IQUxGX1VQICAgIDQgVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHVwLlxyXG4gICAgICAvLyBST1VORF9IQUxGX0RPV04gIDUgVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIGRvd24uXHJcbiAgICAgIC8vIFJPVU5EX0hBTEZfRVZFTiAgNiBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyBldmVuIG5laWdoYm91ci5cclxuICAgICAgLy8gUk9VTkRfSEFMRl9DRUlMICA3IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0b3dhcmRzICtJbmZpbml0eS5cclxuICAgICAgLy8gUk9VTkRfSEFMRl9GTE9PUiA4IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0b3dhcmRzIC1JbmZpbml0eS5cclxuICAgICAgLy9cclxuICAgICAgLy8gRS5nLlxyXG4gICAgICAvLyBgRGVjaW1hbC5yb3VuZGluZyA9IDQ7YFxyXG4gICAgICAvLyBgRGVjaW1hbC5yb3VuZGluZyA9IERlY2ltYWwuUk9VTkRfSEFMRl9VUDtgXHJcbiAgICAgIHJvdW5kaW5nOiA0LCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gOFxyXG5cclxuICAgICAgLy8gVGhlIG1vZHVsbyBtb2RlIHVzZWQgd2hlbiBjYWxjdWxhdGluZyB0aGUgbW9kdWx1czogYSBtb2Qgbi5cclxuICAgICAgLy8gVGhlIHF1b3RpZW50IChxID0gYSAvIG4pIGlzIGNhbGN1bGF0ZWQgYWNjb3JkaW5nIHRvIHRoZSBjb3JyZXNwb25kaW5nIHJvdW5kaW5nIG1vZGUuXHJcbiAgICAgIC8vIFRoZSByZW1haW5kZXIgKHIpIGlzIGNhbGN1bGF0ZWQgYXM6IHIgPSBhIC0gbiAqIHEuXHJcbiAgICAgIC8vXHJcbiAgICAgIC8vIFVQICAgICAgICAgMCBUaGUgcmVtYWluZGVyIGlzIHBvc2l0aXZlIGlmIHRoZSBkaXZpZGVuZCBpcyBuZWdhdGl2ZSwgZWxzZSBpcyBuZWdhdGl2ZS5cclxuICAgICAgLy8gRE9XTiAgICAgICAxIFRoZSByZW1haW5kZXIgaGFzIHRoZSBzYW1lIHNpZ24gYXMgdGhlIGRpdmlkZW5kIChKYXZhU2NyaXB0ICUpLlxyXG4gICAgICAvLyBGTE9PUiAgICAgIDMgVGhlIHJlbWFpbmRlciBoYXMgdGhlIHNhbWUgc2lnbiBhcyB0aGUgZGl2aXNvciAoUHl0aG9uICUpLlxyXG4gICAgICAvLyBIQUxGX0VWRU4gIDYgVGhlIElFRUUgNzU0IHJlbWFpbmRlciBmdW5jdGlvbi5cclxuICAgICAgLy8gRVVDTElEICAgICA5IEV1Y2xpZGlhbiBkaXZpc2lvbi4gcSA9IHNpZ24obikgKiBmbG9vcihhIC8gYWJzKG4pKS4gQWx3YXlzIHBvc2l0aXZlLlxyXG4gICAgICAvL1xyXG4gICAgICAvLyBUcnVuY2F0ZWQgZGl2aXNpb24gKDEpLCBmbG9vcmVkIGRpdmlzaW9uICgzKSwgdGhlIElFRUUgNzU0IHJlbWFpbmRlciAoNiksIGFuZCBFdWNsaWRpYW5cclxuICAgICAgLy8gZGl2aXNpb24gKDkpIGFyZSBjb21tb25seSB1c2VkIGZvciB0aGUgbW9kdWx1cyBvcGVyYXRpb24uIFRoZSBvdGhlciByb3VuZGluZyBtb2RlcyBjYW4gYWxzb1xyXG4gICAgICAvLyBiZSB1c2VkLCBidXQgdGhleSBtYXkgbm90IGdpdmUgdXNlZnVsIHJlc3VsdHMuXHJcbiAgICAgIG1vZHVsbzogMSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gOVxyXG5cclxuICAgICAgLy8gVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBiZW5lYXRoIHdoaWNoIGB0b1N0cmluZ2AgcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgLy8gSmF2YVNjcmlwdCBudW1iZXJzOiAtN1xyXG4gICAgICB0b0V4cE5lZzogLTcsICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIC1FWFBfTElNSVRcclxuXHJcbiAgICAgIC8vIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYWJvdmUgd2hpY2ggYHRvU3RyaW5nYCByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAvLyBKYXZhU2NyaXB0IG51bWJlcnM6IDIxXHJcbiAgICAgIHRvRXhwUG9zOiAgMjEsICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gRVhQX0xJTUlUXHJcblxyXG4gICAgICAvLyBUaGUgbWluaW11bSBleHBvbmVudCB2YWx1ZSwgYmVuZWF0aCB3aGljaCB1bmRlcmZsb3cgdG8gemVybyBvY2N1cnMuXHJcbiAgICAgIC8vIEphdmFTY3JpcHQgbnVtYmVyczogLTMyNCAgKDVlLTMyNClcclxuICAgICAgbWluRTogLUVYUF9MSU1JVCwgICAgICAgICAgICAgICAgICAgICAgLy8gLTEgdG8gLUVYUF9MSU1JVFxyXG5cclxuICAgICAgLy8gVGhlIG1heGltdW0gZXhwb25lbnQgdmFsdWUsIGFib3ZlIHdoaWNoIG92ZXJmbG93IHRvIEluZmluaXR5IG9jY3Vycy5cclxuICAgICAgLy8gSmF2YVNjcmlwdCBudW1iZXJzOiAzMDggICgxLjc5NzY5MzEzNDg2MjMxNTdlKzMwOClcclxuICAgICAgbWF4RTogRVhQX0xJTUlULCAgICAgICAgICAgICAgICAgICAgICAgLy8gMSB0byBFWFBfTElNSVRcclxuXHJcbiAgICAgIC8vIFdoZXRoZXIgdG8gdXNlIGNyeXB0b2dyYXBoaWNhbGx5LXNlY3VyZSByYW5kb20gbnVtYmVyIGdlbmVyYXRpb24sIGlmIGF2YWlsYWJsZS5cclxuICAgICAgY3J5cHRvOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJ1ZS9mYWxzZVxyXG4gICAgfSxcclxuXHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEVORCBPRiBFRElUQUJMRSBERUZBVUxUUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXHJcblxyXG5cclxuICAgIERlY2ltYWwsIGluZXhhY3QsIG5vQ29uZmxpY3QsIHF1YWRyYW50LFxyXG4gICAgZXh0ZXJuYWwgPSB0cnVlLFxyXG5cclxuICAgIGRlY2ltYWxFcnJvciA9ICdbRGVjaW1hbEVycm9yXSAnLFxyXG4gICAgaW52YWxpZEFyZ3VtZW50ID0gZGVjaW1hbEVycm9yICsgJ0ludmFsaWQgYXJndW1lbnQ6ICcsXHJcbiAgICBwcmVjaXNpb25MaW1pdEV4Y2VlZGVkID0gZGVjaW1hbEVycm9yICsgJ1ByZWNpc2lvbiBsaW1pdCBleGNlZWRlZCcsXHJcbiAgICBjcnlwdG9VbmF2YWlsYWJsZSA9IGRlY2ltYWxFcnJvciArICdjcnlwdG8gdW5hdmFpbGFibGUnLFxyXG4gICAgdGFnID0gJ1tvYmplY3QgRGVjaW1hbF0nLFxyXG5cclxuICAgIG1hdGhmbG9vciA9IE1hdGguZmxvb3IsXHJcbiAgICBtYXRocG93ID0gTWF0aC5wb3csXHJcblxyXG4gICAgaXNCaW5hcnkgPSAvXjBiKFswMV0rKFxcLlswMV0qKT98XFwuWzAxXSspKHBbKy1dP1xcZCspPyQvaSxcclxuICAgIGlzSGV4ID0gL14weChbMC05YS1mXSsoXFwuWzAtOWEtZl0qKT98XFwuWzAtOWEtZl0rKShwWystXT9cXGQrKT8kL2ksXHJcbiAgICBpc09jdGFsID0gL14wbyhbMC03XSsoXFwuWzAtN10qKT98XFwuWzAtN10rKShwWystXT9cXGQrKT8kL2ksXHJcbiAgICBpc0RlY2ltYWwgPSAvXihcXGQrKFxcLlxcZCopP3xcXC5cXGQrKShlWystXT9cXGQrKT8kL2ksXHJcblxyXG4gICAgQkFTRSA9IDFlNyxcclxuICAgIExPR19CQVNFID0gNyxcclxuICAgIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxLFxyXG5cclxuICAgIExOMTBfUFJFQ0lTSU9OID0gTE4xMC5sZW5ndGggLSAxLFxyXG4gICAgUElfUFJFQ0lTSU9OID0gUEkubGVuZ3RoIC0gMSxcclxuXHJcbiAgICAvLyBEZWNpbWFsLnByb3RvdHlwZSBvYmplY3RcclxuICAgIFAgPSB7IHRvU3RyaW5nVGFnOiB0YWcgfTtcclxuXHJcblxyXG4gIC8vIERlY2ltYWwgcHJvdG90eXBlIG1ldGhvZHNcclxuXHJcblxyXG4gIC8qXHJcbiAgICogIGFic29sdXRlVmFsdWUgICAgICAgICAgICAgYWJzXHJcbiAgICogIGNlaWxcclxuICAgKiAgY2xhbXBlZFRvICAgICAgICAgICAgICAgICBjbGFtcFxyXG4gICAqICBjb21wYXJlZFRvICAgICAgICAgICAgICAgIGNtcFxyXG4gICAqICBjb3NpbmUgICAgICAgICAgICAgICAgICAgIGNvc1xyXG4gICAqICBjdWJlUm9vdCAgICAgICAgICAgICAgICAgIGNicnRcclxuICAgKiAgZGVjaW1hbFBsYWNlcyAgICAgICAgICAgICBkcFxyXG4gICAqICBkaXZpZGVkQnkgICAgICAgICAgICAgICAgIGRpdlxyXG4gICAqICBkaXZpZGVkVG9JbnRlZ2VyQnkgICAgICAgIGRpdlRvSW50XHJcbiAgICogIGVxdWFscyAgICAgICAgICAgICAgICAgICAgZXFcclxuICAgKiAgZmxvb3JcclxuICAgKiAgZ3JlYXRlclRoYW4gICAgICAgICAgICAgICBndFxyXG4gICAqICBncmVhdGVyVGhhbk9yRXF1YWxUbyAgICAgIGd0ZVxyXG4gICAqICBoeXBlcmJvbGljQ29zaW5lICAgICAgICAgIGNvc2hcclxuICAgKiAgaHlwZXJib2xpY1NpbmUgICAgICAgICAgICBzaW5oXHJcbiAgICogIGh5cGVyYm9saWNUYW5nZW50ICAgICAgICAgdGFuaFxyXG4gICAqICBpbnZlcnNlQ29zaW5lICAgICAgICAgICAgIGFjb3NcclxuICAgKiAgaW52ZXJzZUh5cGVyYm9saWNDb3NpbmUgICBhY29zaFxyXG4gICAqICBpbnZlcnNlSHlwZXJib2xpY1NpbmUgICAgIGFzaW5oXHJcbiAgICogIGludmVyc2VIeXBlcmJvbGljVGFuZ2VudCAgYXRhbmhcclxuICAgKiAgaW52ZXJzZVNpbmUgICAgICAgICAgICAgICBhc2luXHJcbiAgICogIGludmVyc2VUYW5nZW50ICAgICAgICAgICAgYXRhblxyXG4gICAqICBpc0Zpbml0ZVxyXG4gICAqICBpc0ludGVnZXIgICAgICAgICAgICAgICAgIGlzSW50XHJcbiAgICogIGlzTmFOXHJcbiAgICogIGlzTmVnYXRpdmUgICAgICAgICAgICAgICAgaXNOZWdcclxuICAgKiAgaXNQb3NpdGl2ZSAgICAgICAgICAgICAgICBpc1Bvc1xyXG4gICAqICBpc1plcm9cclxuICAgKiAgbGVzc1RoYW4gICAgICAgICAgICAgICAgICBsdFxyXG4gICAqICBsZXNzVGhhbk9yRXF1YWxUbyAgICAgICAgIGx0ZVxyXG4gICAqICBsb2dhcml0aG0gICAgICAgICAgICAgICAgIGxvZ1xyXG4gICAqICBbbWF4aW11bV0gICAgICAgICAgICAgICAgIFttYXhdXHJcbiAgICogIFttaW5pbXVtXSAgICAgICAgICAgICAgICAgW21pbl1cclxuICAgKiAgbWludXMgICAgICAgICAgICAgICAgICAgICBzdWJcclxuICAgKiAgbW9kdWxvICAgICAgICAgICAgICAgICAgICBtb2RcclxuICAgKiAgbmF0dXJhbEV4cG9uZW50aWFsICAgICAgICBleHBcclxuICAgKiAgbmF0dXJhbExvZ2FyaXRobSAgICAgICAgICBsblxyXG4gICAqICBuZWdhdGVkICAgICAgICAgICAgICAgICAgIG5lZ1xyXG4gICAqICBwbHVzICAgICAgICAgICAgICAgICAgICAgIGFkZFxyXG4gICAqICBwcmVjaXNpb24gICAgICAgICAgICAgICAgIHNkXHJcbiAgICogIHJvdW5kXHJcbiAgICogIHNpbmUgICAgICAgICAgICAgICAgICAgICAgc2luXHJcbiAgICogIHNxdWFyZVJvb3QgICAgICAgICAgICAgICAgc3FydFxyXG4gICAqICB0YW5nZW50ICAgICAgICAgICAgICAgICAgIHRhblxyXG4gICAqICB0aW1lcyAgICAgICAgICAgICAgICAgICAgIG11bFxyXG4gICAqICB0b0JpbmFyeVxyXG4gICAqICB0b0RlY2ltYWxQbGFjZXMgICAgICAgICAgIHRvRFBcclxuICAgKiAgdG9FeHBvbmVudGlhbFxyXG4gICAqICB0b0ZpeGVkXHJcbiAgICogIHRvRnJhY3Rpb25cclxuICAgKiAgdG9IZXhhZGVjaW1hbCAgICAgICAgICAgICB0b0hleFxyXG4gICAqICB0b05lYXJlc3RcclxuICAgKiAgdG9OdW1iZXJcclxuICAgKiAgdG9PY3RhbFxyXG4gICAqICB0b1Bvd2VyICAgICAgICAgICAgICAgICAgIHBvd1xyXG4gICAqICB0b1ByZWNpc2lvblxyXG4gICAqICB0b1NpZ25pZmljYW50RGlnaXRzICAgICAgIHRvU0RcclxuICAgKiAgdG9TdHJpbmdcclxuICAgKiAgdHJ1bmNhdGVkICAgICAgICAgICAgICAgICB0cnVuY1xyXG4gICAqICB2YWx1ZU9mICAgICAgICAgICAgICAgICAgIHRvSlNPTlxyXG4gICAqL1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5hYnNvbHV0ZVZhbHVlID0gUC5hYnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgeCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgaWYgKHgucyA8IDApIHgucyA9IDE7XHJcbiAgICByZXR1cm4gZmluYWxpc2UoeCk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCByb3VuZGVkIHRvIGEgd2hvbGUgbnVtYmVyIGluIHRoZVxyXG4gICAqIGRpcmVjdGlvbiBvZiBwb3NpdGl2ZSBJbmZpbml0eS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuY2VpbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBmaW5hbGlzZShuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKSwgdGhpcy5lICsgMSwgMik7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBjbGFtcGVkIHRvIHRoZSByYW5nZVxyXG4gICAqIGRlbGluZWF0ZWQgYnkgYG1pbmAgYW5kIGBtYXhgLlxyXG4gICAqXHJcbiAgICogbWluIHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICogbWF4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBQLmNsYW1wZWRUbyA9IFAuY2xhbXAgPSBmdW5jdGlvbiAobWluLCBtYXgpIHtcclxuICAgIHZhciBrLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcbiAgICBtaW4gPSBuZXcgQ3RvcihtaW4pO1xyXG4gICAgbWF4ID0gbmV3IEN0b3IobWF4KTtcclxuICAgIGlmICghbWluLnMgfHwgIW1heC5zKSByZXR1cm4gbmV3IEN0b3IoTmFOKTtcclxuICAgIGlmIChtaW4uZ3QobWF4KSkgdGhyb3cgRXJyb3IoaW52YWxpZEFyZ3VtZW50ICsgbWF4KTtcclxuICAgIGsgPSB4LmNtcChtaW4pO1xyXG4gICAgcmV0dXJuIGsgPCAwID8gbWluIDogeC5jbXAobWF4KSA+IDAgPyBtYXggOiBuZXcgQ3Rvcih4KTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm5cclxuICAgKiAgIDEgICAgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIGB5YCxcclxuICAgKiAgLTEgICAgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIGB5YCxcclxuICAgKiAgIDAgICAgaWYgdGhleSBoYXZlIHRoZSBzYW1lIHZhbHVlLFxyXG4gICAqICAgTmFOICBpZiB0aGUgdmFsdWUgb2YgZWl0aGVyIERlY2ltYWwgaXMgTmFOLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5jb21wYXJlZFRvID0gUC5jbXAgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgdmFyIGksIGosIHhkTCwgeWRMLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgeGQgPSB4LmQsXHJcbiAgICAgIHlkID0gKHkgPSBuZXcgeC5jb25zdHJ1Y3Rvcih5KSkuZCxcclxuICAgICAgeHMgPSB4LnMsXHJcbiAgICAgIHlzID0geS5zO1xyXG5cclxuICAgIC8vIEVpdGhlciBOYU4gb3IgwrFJbmZpbml0eT9cclxuICAgIGlmICgheGQgfHwgIXlkKSB7XHJcbiAgICAgIHJldHVybiAheHMgfHwgIXlzID8gTmFOIDogeHMgIT09IHlzID8geHMgOiB4ZCA9PT0geWQgPyAwIDogIXhkIF4geHMgPCAwID8gMSA6IC0xO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgaWYgKCF4ZFswXSB8fCAheWRbMF0pIHJldHVybiB4ZFswXSA/IHhzIDogeWRbMF0gPyAteXMgOiAwO1xyXG5cclxuICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgIGlmICh4cyAhPT0geXMpIHJldHVybiB4cztcclxuXHJcbiAgICAvLyBDb21wYXJlIGV4cG9uZW50cy5cclxuICAgIGlmICh4LmUgIT09IHkuZSkgcmV0dXJuIHguZSA+IHkuZSBeIHhzIDwgMCA/IDEgOiAtMTtcclxuXHJcbiAgICB4ZEwgPSB4ZC5sZW5ndGg7XHJcbiAgICB5ZEwgPSB5ZC5sZW5ndGg7XHJcblxyXG4gICAgLy8gQ29tcGFyZSBkaWdpdCBieSBkaWdpdC5cclxuICAgIGZvciAoaSA9IDAsIGogPSB4ZEwgPCB5ZEwgPyB4ZEwgOiB5ZEw7IGkgPCBqOyArK2kpIHtcclxuICAgICAgaWYgKHhkW2ldICE9PSB5ZFtpXSkgcmV0dXJuIHhkW2ldID4geWRbaV0gXiB4cyA8IDAgPyAxIDogLTE7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxyXG4gICAgcmV0dXJuIHhkTCA9PT0geWRMID8gMCA6IHhkTCA+IHlkTCBeIHhzIDwgMCA/IDEgOiAtMTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgY29zaW5lIG9mIHRoZSB2YWx1ZSBpbiByYWRpYW5zIG9mIHRoaXMgRGVjaW1hbC5cclxuICAgKlxyXG4gICAqIERvbWFpbjogWy1JbmZpbml0eSwgSW5maW5pdHldXHJcbiAgICogUmFuZ2U6IFstMSwgMV1cclxuICAgKlxyXG4gICAqIGNvcygwKSAgICAgICAgID0gMVxyXG4gICAqIGNvcygtMCkgICAgICAgID0gMVxyXG4gICAqIGNvcyhJbmZpbml0eSkgID0gTmFOXHJcbiAgICogY29zKC1JbmZpbml0eSkgPSBOYU5cclxuICAgKiBjb3MoTmFOKSAgICAgICA9IE5hTlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5jb3NpbmUgPSBQLmNvcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBwciwgcm0sXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoIXguZCkgcmV0dXJuIG5ldyBDdG9yKE5hTik7XHJcblxyXG4gICAgLy8gY29zKDApID0gY29zKC0wKSA9IDFcclxuICAgIGlmICgheC5kWzBdKSByZXR1cm4gbmV3IEN0b3IoMSk7XHJcblxyXG4gICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcclxuICAgIHJtID0gQ3Rvci5yb3VuZGluZztcclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyBNYXRoLm1heCh4LmUsIHguc2QoKSkgKyBMT0dfQkFTRTtcclxuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xyXG5cclxuICAgIHggPSBjb3NpbmUoQ3RvciwgdG9MZXNzVGhhbkhhbGZQaShDdG9yLCB4KSk7XHJcblxyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcclxuXHJcbiAgICByZXR1cm4gZmluYWxpc2UocXVhZHJhbnQgPT0gMiB8fCBxdWFkcmFudCA9PSAzID8geC5uZWcoKSA6IHgsIHByLCBybSwgdHJ1ZSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICpcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgY3ViZSByb290IG9mIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwsIHJvdW5kZWQgdG9cclxuICAgKiBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogIGNicnQoMCkgID0gIDBcclxuICAgKiAgY2JydCgtMCkgPSAtMFxyXG4gICAqICBjYnJ0KDEpICA9ICAxXHJcbiAgICogIGNicnQoLTEpID0gLTFcclxuICAgKiAgY2JydChOKSAgPSAgTlxyXG4gICAqICBjYnJ0KC1JKSA9IC1JXHJcbiAgICogIGNicnQoSSkgID0gIElcclxuICAgKlxyXG4gICAqIE1hdGguY2JydCh4KSA9ICh4IDwgMCA/IC1NYXRoLnBvdygteCwgMS8zKSA6IE1hdGgucG93KHgsIDEvMykpXHJcbiAgICpcclxuICAgKi9cclxuICBQLmN1YmVSb290ID0gUC5jYnJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGUsIG0sIG4sIHIsIHJlcCwgcywgc2QsIHQsIHQzLCB0M3BsdXN4LFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgaWYgKCF4LmlzRmluaXRlKCkgfHwgeC5pc1plcm8oKSkgcmV0dXJuIG5ldyBDdG9yKHgpO1xyXG4gICAgZXh0ZXJuYWwgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBJbml0aWFsIGVzdGltYXRlLlxyXG4gICAgcyA9IHgucyAqIG1hdGhwb3coeC5zICogeCwgMSAvIDMpO1xyXG5cclxuICAgICAvLyBNYXRoLmNicnQgdW5kZXJmbG93L292ZXJmbG93P1xyXG4gICAgIC8vIFBhc3MgeCB0byBNYXRoLnBvdyBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgZXhwb25lbnQgb2YgdGhlIHJlc3VsdC5cclxuICAgIGlmICghcyB8fCBNYXRoLmFicyhzKSA9PSAxIC8gMCkge1xyXG4gICAgICBuID0gZGlnaXRzVG9TdHJpbmcoeC5kKTtcclxuICAgICAgZSA9IHguZTtcclxuXHJcbiAgICAgIC8vIEFkanVzdCBuIGV4cG9uZW50IHNvIGl0IGlzIGEgbXVsdGlwbGUgb2YgMyBhd2F5IGZyb20geCBleHBvbmVudC5cclxuICAgICAgaWYgKHMgPSAoZSAtIG4ubGVuZ3RoICsgMSkgJSAzKSBuICs9IChzID09IDEgfHwgcyA9PSAtMiA/ICcwJyA6ICcwMCcpO1xyXG4gICAgICBzID0gbWF0aHBvdyhuLCAxIC8gMyk7XHJcblxyXG4gICAgICAvLyBSYXJlbHksIGUgbWF5IGJlIG9uZSBsZXNzIHRoYW4gdGhlIHJlc3VsdCBleHBvbmVudCB2YWx1ZS5cclxuICAgICAgZSA9IG1hdGhmbG9vcigoZSArIDEpIC8gMykgLSAoZSAlIDMgPT0gKGUgPCAwID8gLTEgOiAyKSk7XHJcblxyXG4gICAgICBpZiAocyA9PSAxIC8gMCkge1xyXG4gICAgICAgIG4gPSAnNWUnICsgZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuID0gcy50b0V4cG9uZW50aWFsKCk7XHJcbiAgICAgICAgbiA9IG4uc2xpY2UoMCwgbi5pbmRleE9mKCdlJykgKyAxKSArIGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHIgPSBuZXcgQ3RvcihuKTtcclxuICAgICAgci5zID0geC5zO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgciA9IG5ldyBDdG9yKHMudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2QgPSAoZSA9IEN0b3IucHJlY2lzaW9uKSArIDM7XHJcblxyXG4gICAgLy8gSGFsbGV5J3MgbWV0aG9kLlxyXG4gICAgLy8gVE9ETz8gQ29tcGFyZSBOZXd0b24ncyBtZXRob2QuXHJcbiAgICBmb3IgKDs7KSB7XHJcbiAgICAgIHQgPSByO1xyXG4gICAgICB0MyA9IHQudGltZXModCkudGltZXModCk7XHJcbiAgICAgIHQzcGx1c3ggPSB0My5wbHVzKHgpO1xyXG4gICAgICByID0gZGl2aWRlKHQzcGx1c3gucGx1cyh4KS50aW1lcyh0KSwgdDNwbHVzeC5wbHVzKHQzKSwgc2QgKyAyLCAxKTtcclxuXHJcbiAgICAgIC8vIFRPRE8/IFJlcGxhY2Ugd2l0aCBmb3ItbG9vcCBhbmQgY2hlY2tSb3VuZGluZ0RpZ2l0cy5cclxuICAgICAgaWYgKGRpZ2l0c1RvU3RyaW5nKHQuZCkuc2xpY2UoMCwgc2QpID09PSAobiA9IGRpZ2l0c1RvU3RyaW5nKHIuZCkpLnNsaWNlKDAsIHNkKSkge1xyXG4gICAgICAgIG4gPSBuLnNsaWNlKHNkIC0gMywgc2QgKyAxKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIDR0aCByb3VuZGluZyBkaWdpdCBtYXkgYmUgaW4gZXJyb3IgYnkgLTEgc28gaWYgdGhlIDQgcm91bmRpbmcgZGlnaXRzIGFyZSA5OTk5IG9yIDQ5OTlcclxuICAgICAgICAvLyAsIGkuZS4gYXBwcm9hY2hpbmcgYSByb3VuZGluZyBib3VuZGFyeSwgY29udGludWUgdGhlIGl0ZXJhdGlvbi5cclxuICAgICAgICBpZiAobiA9PSAnOTk5OScgfHwgIXJlcCAmJiBuID09ICc0OTk5Jykge1xyXG5cclxuICAgICAgICAgIC8vIE9uIHRoZSBmaXJzdCBpdGVyYXRpb24gb25seSwgY2hlY2sgdG8gc2VlIGlmIHJvdW5kaW5nIHVwIGdpdmVzIHRoZSBleGFjdCByZXN1bHQgYXMgdGhlXHJcbiAgICAgICAgICAvLyBuaW5lcyBtYXkgaW5maW5pdGVseSByZXBlYXQuXHJcbiAgICAgICAgICBpZiAoIXJlcCkge1xyXG4gICAgICAgICAgICBmaW5hbGlzZSh0LCBlICsgMSwgMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodC50aW1lcyh0KS50aW1lcyh0KS5lcSh4KSkge1xyXG4gICAgICAgICAgICAgIHIgPSB0O1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgc2QgKz0gNDtcclxuICAgICAgICAgIHJlcCA9IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGUgcm91bmRpbmcgZGlnaXRzIGFyZSBudWxsLCAwezAsNH0gb3IgNTB7MCwzfSwgY2hlY2sgZm9yIGFuIGV4YWN0IHJlc3VsdC5cclxuICAgICAgICAgIC8vIElmIG5vdCwgdGhlbiB0aGVyZSBhcmUgZnVydGhlciBkaWdpdHMgYW5kIG0gd2lsbCBiZSB0cnV0aHkuXHJcbiAgICAgICAgICBpZiAoIStuIHx8ICErbi5zbGljZSgxKSAmJiBuLmNoYXJBdCgwKSA9PSAnNScpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRydW5jYXRlIHRvIHRoZSBmaXJzdCByb3VuZGluZyBkaWdpdC5cclxuICAgICAgICAgICAgZmluYWxpc2UociwgZSArIDEsIDEpO1xyXG4gICAgICAgICAgICBtID0gIXIudGltZXMocikudGltZXMocikuZXEoeCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiBmaW5hbGlzZShyLCBlLCBDdG9yLnJvdW5kaW5nLCBtKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBvZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5kZWNpbWFsUGxhY2VzID0gUC5kcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB3LFxyXG4gICAgICBkID0gdGhpcy5kLFxyXG4gICAgICBuID0gTmFOO1xyXG5cclxuICAgIGlmIChkKSB7XHJcbiAgICAgIHcgPSBkLmxlbmd0aCAtIDE7XHJcbiAgICAgIG4gPSAodyAtIG1hdGhmbG9vcih0aGlzLmUgLyBMT0dfQkFTRSkpICogTE9HX0JBU0U7XHJcblxyXG4gICAgICAvLyBTdWJ0cmFjdCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zIG9mIHRoZSBsYXN0IHdvcmQuXHJcbiAgICAgIHcgPSBkW3ddO1xyXG4gICAgICBpZiAodykgZm9yICg7IHcgJSAxMCA9PSAwOyB3IC89IDEwKSBuLS07XHJcbiAgICAgIGlmIChuIDwgMCkgbiA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG47XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogIG4gLyAwID0gSVxyXG4gICAqICBuIC8gTiA9IE5cclxuICAgKiAgbiAvIEkgPSAwXHJcbiAgICogIDAgLyBuID0gMFxyXG4gICAqICAwIC8gMCA9IE5cclxuICAgKiAgMCAvIE4gPSBOXHJcbiAgICogIDAgLyBJID0gMFxyXG4gICAqICBOIC8gbiA9IE5cclxuICAgKiAgTiAvIDAgPSBOXHJcbiAgICogIE4gLyBOID0gTlxyXG4gICAqICBOIC8gSSA9IE5cclxuICAgKiAgSSAvIG4gPSBJXHJcbiAgICogIEkgLyAwID0gSVxyXG4gICAqICBJIC8gTiA9IE5cclxuICAgKiAgSSAvIEkgPSBOXHJcbiAgICpcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGRpdmlkZWQgYnkgYHlgLCByb3VuZGVkIHRvXHJcbiAgICogYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuZGl2aWRlZEJ5ID0gUC5kaXYgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgcmV0dXJuIGRpdmlkZSh0aGlzLCBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih5KSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGludGVnZXIgcGFydCBvZiBkaXZpZGluZyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsXHJcbiAgICogYnkgdGhlIHZhbHVlIG9mIGB5YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5kaXZpZGVkVG9JbnRlZ2VyQnkgPSBQLmRpdlRvSW50ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcbiAgICByZXR1cm4gZmluYWxpc2UoZGl2aWRlKHgsIG5ldyBDdG9yKHkpLCAwLCAxLCAxKSwgQ3Rvci5wcmVjaXNpb24sIEN0b3Iucm91bmRpbmcpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgZXF1YWwgdG8gdGhlIHZhbHVlIG9mIGB5YCwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuZXF1YWxzID0gUC5lcSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5jbXAoeSkgPT09IDA7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCByb3VuZGVkIHRvIGEgd2hvbGUgbnVtYmVyIGluIHRoZVxyXG4gICAqIGRpcmVjdGlvbiBvZiBuZWdhdGl2ZSBJbmZpbml0eS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuZmxvb3IgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gZmluYWxpc2UobmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyksIHRoaXMuZSArIDEsIDMpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBgeWAsIG90aGVyd2lzZSByZXR1cm5cclxuICAgKiBmYWxzZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuZ3JlYXRlclRoYW4gPSBQLmd0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgIHJldHVybiB0aGlzLmNtcCh5KSA+IDA7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlIG9mIGB5YCxcclxuICAgKiBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5ncmVhdGVyVGhhbk9yRXF1YWxUbyA9IFAuZ3RlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgIHZhciBrID0gdGhpcy5jbXAoeSk7XHJcbiAgICByZXR1cm4gayA9PSAxIHx8IGsgPT09IDA7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGh5cGVyYm9saWMgY29zaW5lIG9mIHRoZSB2YWx1ZSBpbiByYWRpYW5zIG9mIHRoaXNcclxuICAgKiBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cclxuICAgKiBSYW5nZTogWzEsIEluZmluaXR5XVxyXG4gICAqXHJcbiAgICogY29zaCh4KSA9IDEgKyB4XjIvMiEgKyB4XjQvNCEgKyB4XjYvNiEgKyAuLi5cclxuICAgKlxyXG4gICAqIGNvc2goMCkgICAgICAgICA9IDFcclxuICAgKiBjb3NoKC0wKSAgICAgICAgPSAxXHJcbiAgICogY29zaChJbmZpbml0eSkgID0gSW5maW5pdHlcclxuICAgKiBjb3NoKC1JbmZpbml0eSkgPSBJbmZpbml0eVxyXG4gICAqIGNvc2goTmFOKSAgICAgICA9IE5hTlxyXG4gICAqXHJcbiAgICogIHggICAgICAgIHRpbWUgdGFrZW4gKG1zKSAgIHJlc3VsdFxyXG4gICAqIDEwMDAgICAgICA5ICAgICAgICAgICAgICAgICA5Ljg1MDM1NTU3MDA4NTIzNDk2OTRlKzQzM1xyXG4gICAqIDEwMDAwICAgICAyNSAgICAgICAgICAgICAgICA0LjQwMzQwOTExMjgzMTQ2MDc5MzZlKzQzNDJcclxuICAgKiAxMDAwMDAgICAgMTcxICAgICAgICAgICAgICAgMS40MDMzMzE2ODAyMTMwNjE1ODk3ZSs0MzQyOVxyXG4gICAqIDEwMDAwMDAgICAzODE3ICAgICAgICAgICAgICAxLjUxNjYwNzY5ODQwMTA0Mzc3MjVlKzQzNDI5NFxyXG4gICAqIDEwMDAwMDAwICBhYmFuZG9uZWQgYWZ0ZXIgMiBtaW51dGUgd2FpdFxyXG4gICAqXHJcbiAgICogVE9ETz8gQ29tcGFyZSBwZXJmb3JtYW5jZSBvZiBjb3NoKHgpID0gMC41ICogKGV4cCh4KSArIGV4cCgteCkpXHJcbiAgICpcclxuICAgKi9cclxuICBQLmh5cGVyYm9saWNDb3NpbmUgPSBQLmNvc2ggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgaywgbiwgcHIsIHJtLCBsZW4sXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgb25lID0gbmV3IEN0b3IoMSk7XHJcblxyXG4gICAgaWYgKCF4LmlzRmluaXRlKCkpIHJldHVybiBuZXcgQ3Rvcih4LnMgPyAxIC8gMCA6IE5hTik7XHJcbiAgICBpZiAoeC5pc1plcm8oKSkgcmV0dXJuIG9uZTtcclxuXHJcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwciArIE1hdGgubWF4KHguZSwgeC5zZCgpKSArIDQ7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcclxuICAgIGxlbiA9IHguZC5sZW5ndGg7XHJcblxyXG4gICAgLy8gQXJndW1lbnQgcmVkdWN0aW9uOiBjb3MoNHgpID0gMSAtIDhjb3NeMih4KSArIDhjb3NeNCh4KSArIDFcclxuICAgIC8vIGkuZS4gY29zKHgpID0gMSAtIGNvc14yKHgvNCkoOCAtIDhjb3NeMih4LzQpKVxyXG5cclxuICAgIC8vIEVzdGltYXRlIHRoZSBvcHRpbXVtIG51bWJlciBvZiB0aW1lcyB0byB1c2UgdGhlIGFyZ3VtZW50IHJlZHVjdGlvbi5cclxuICAgIC8vIFRPRE8/IEVzdGltYXRpb24gcmV1c2VkIGZyb20gY29zaW5lKCkgYW5kIG1heSBub3QgYmUgb3B0aW1hbCBoZXJlLlxyXG4gICAgaWYgKGxlbiA8IDMyKSB7XHJcbiAgICAgIGsgPSBNYXRoLmNlaWwobGVuIC8gMyk7XHJcbiAgICAgIG4gPSAoMSAvIHRpbnlQb3coNCwgaykpLnRvU3RyaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBrID0gMTY7XHJcbiAgICAgIG4gPSAnMi4zMjgzMDY0MzY1Mzg2OTYyODkwNjI1ZS0xMCc7XHJcbiAgICB9XHJcblxyXG4gICAgeCA9IHRheWxvclNlcmllcyhDdG9yLCAxLCB4LnRpbWVzKG4pLCBuZXcgQ3RvcigxKSwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gUmV2ZXJzZSBhcmd1bWVudCByZWR1Y3Rpb25cclxuICAgIHZhciBjb3NoMl94LFxyXG4gICAgICBpID0gayxcclxuICAgICAgZDggPSBuZXcgQ3Rvcig4KTtcclxuICAgIGZvciAoOyBpLS07KSB7XHJcbiAgICAgIGNvc2gyX3ggPSB4LnRpbWVzKHgpO1xyXG4gICAgICB4ID0gb25lLm1pbnVzKGNvc2gyX3gudGltZXMoZDgubWludXMoY29zaDJfeC50aW1lcyhkOCkpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZpbmFsaXNlKHgsIEN0b3IucHJlY2lzaW9uID0gcHIsIEN0b3Iucm91bmRpbmcgPSBybSwgdHJ1ZSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGh5cGVyYm9saWMgc2luZSBvZiB0aGUgdmFsdWUgaW4gcmFkaWFucyBvZiB0aGlzXHJcbiAgICogRGVjaW1hbC5cclxuICAgKlxyXG4gICAqIERvbWFpbjogWy1JbmZpbml0eSwgSW5maW5pdHldXHJcbiAgICogUmFuZ2U6IFstSW5maW5pdHksIEluZmluaXR5XVxyXG4gICAqXHJcbiAgICogc2luaCh4KSA9IHggKyB4XjMvMyEgKyB4XjUvNSEgKyB4XjcvNyEgKyAuLi5cclxuICAgKlxyXG4gICAqIHNpbmgoMCkgICAgICAgICA9IDBcclxuICAgKiBzaW5oKC0wKSAgICAgICAgPSAtMFxyXG4gICAqIHNpbmgoSW5maW5pdHkpICA9IEluZmluaXR5XHJcbiAgICogc2luaCgtSW5maW5pdHkpID0gLUluZmluaXR5XHJcbiAgICogc2luaChOYU4pICAgICAgID0gTmFOXHJcbiAgICpcclxuICAgKiB4ICAgICAgICB0aW1lIHRha2VuIChtcylcclxuICAgKiAxMCAgICAgICAyIG1zXHJcbiAgICogMTAwICAgICAgNSBtc1xyXG4gICAqIDEwMDAgICAgIDE0IG1zXHJcbiAgICogMTAwMDAgICAgODIgbXNcclxuICAgKiAxMDAwMDAgICA4ODYgbXMgICAgICAgICAgICAxLjQwMzMzMTY4MDIxMzA2MTU4OTdlKzQzNDI5XHJcbiAgICogMjAwMDAwICAgMjYxMyBtc1xyXG4gICAqIDMwMDAwMCAgIDU0MDcgbXNcclxuICAgKiA0MDAwMDAgICA4ODI0IG1zXHJcbiAgICogNTAwMDAwICAgMTMwMjYgbXMgICAgICAgICAgOC43MDgwNjQzNjEyNzE4MDg0MTI5ZSsyMTcxNDZcclxuICAgKiAxMDAwMDAwICA0ODU0MyBtc1xyXG4gICAqXHJcbiAgICogVE9ETz8gQ29tcGFyZSBwZXJmb3JtYW5jZSBvZiBzaW5oKHgpID0gMC41ICogKGV4cCh4KSAtIGV4cCgteCkpXHJcbiAgICpcclxuICAgKi9cclxuICBQLmh5cGVyYm9saWNTaW5lID0gUC5zaW5oID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGssIHByLCBybSwgbGVuLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgaWYgKCF4LmlzRmluaXRlKCkgfHwgeC5pc1plcm8oKSkgcmV0dXJuIG5ldyBDdG9yKHgpO1xyXG5cclxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgTWF0aC5tYXgoeC5lLCB4LnNkKCkpICsgNDtcclxuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xyXG4gICAgbGVuID0geC5kLmxlbmd0aDtcclxuXHJcbiAgICBpZiAobGVuIDwgMykge1xyXG4gICAgICB4ID0gdGF5bG9yU2VyaWVzKEN0b3IsIDIsIHgsIHgsIHRydWUpO1xyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIC8vIEFsdGVybmF0aXZlIGFyZ3VtZW50IHJlZHVjdGlvbjogc2luaCgzeCkgPSBzaW5oKHgpKDMgKyA0c2luaF4yKHgpKVxyXG4gICAgICAvLyBpLmUuIHNpbmgoeCkgPSBzaW5oKHgvMykoMyArIDRzaW5oXjIoeC8zKSlcclxuICAgICAgLy8gMyBtdWx0aXBsaWNhdGlvbnMgYW5kIDEgYWRkaXRpb25cclxuXHJcbiAgICAgIC8vIEFyZ3VtZW50IHJlZHVjdGlvbjogc2luaCg1eCkgPSBzaW5oKHgpKDUgKyBzaW5oXjIoeCkoMjAgKyAxNnNpbmheMih4KSkpXHJcbiAgICAgIC8vIGkuZS4gc2luaCh4KSA9IHNpbmgoeC81KSg1ICsgc2luaF4yKHgvNSkoMjAgKyAxNnNpbmheMih4LzUpKSlcclxuICAgICAgLy8gNCBtdWx0aXBsaWNhdGlvbnMgYW5kIDIgYWRkaXRpb25zXHJcblxyXG4gICAgICAvLyBFc3RpbWF0ZSB0aGUgb3B0aW11bSBudW1iZXIgb2YgdGltZXMgdG8gdXNlIHRoZSBhcmd1bWVudCByZWR1Y3Rpb24uXHJcbiAgICAgIGsgPSAxLjQgKiBNYXRoLnNxcnQobGVuKTtcclxuICAgICAgayA9IGsgPiAxNiA/IDE2IDogayB8IDA7XHJcblxyXG4gICAgICB4ID0geC50aW1lcygxIC8gdGlueVBvdyg1LCBrKSk7XHJcbiAgICAgIHggPSB0YXlsb3JTZXJpZXMoQ3RvciwgMiwgeCwgeCwgdHJ1ZSk7XHJcblxyXG4gICAgICAvLyBSZXZlcnNlIGFyZ3VtZW50IHJlZHVjdGlvblxyXG4gICAgICB2YXIgc2luaDJfeCxcclxuICAgICAgICBkNSA9IG5ldyBDdG9yKDUpLFxyXG4gICAgICAgIGQxNiA9IG5ldyBDdG9yKDE2KSxcclxuICAgICAgICBkMjAgPSBuZXcgQ3RvcigyMCk7XHJcbiAgICAgIGZvciAoOyBrLS07KSB7XHJcbiAgICAgICAgc2luaDJfeCA9IHgudGltZXMoeCk7XHJcbiAgICAgICAgeCA9IHgudGltZXMoZDUucGx1cyhzaW5oMl94LnRpbWVzKGQxNi50aW1lcyhzaW5oMl94KS5wbHVzKGQyMCkpKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IHJtO1xyXG5cclxuICAgIHJldHVybiBmaW5hbGlzZSh4LCBwciwgcm0sIHRydWUpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBoeXBlcmJvbGljIHRhbmdlbnQgb2YgdGhlIHZhbHVlIGluIHJhZGlhbnMgb2YgdGhpc1xyXG4gICAqIERlY2ltYWwuXHJcbiAgICpcclxuICAgKiBEb21haW46IFstSW5maW5pdHksIEluZmluaXR5XVxyXG4gICAqIFJhbmdlOiBbLTEsIDFdXHJcbiAgICpcclxuICAgKiB0YW5oKHgpID0gc2luaCh4KSAvIGNvc2goeClcclxuICAgKlxyXG4gICAqIHRhbmgoMCkgICAgICAgICA9IDBcclxuICAgKiB0YW5oKC0wKSAgICAgICAgPSAtMFxyXG4gICAqIHRhbmgoSW5maW5pdHkpICA9IDFcclxuICAgKiB0YW5oKC1JbmZpbml0eSkgPSAtMVxyXG4gICAqIHRhbmgoTmFOKSAgICAgICA9IE5hTlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5oeXBlcmJvbGljVGFuZ2VudCA9IFAudGFuaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBwciwgcm0sXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5ldyBDdG9yKHgucyk7XHJcbiAgICBpZiAoeC5pc1plcm8oKSkgcmV0dXJuIG5ldyBDdG9yKHgpO1xyXG5cclxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgNztcclxuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xyXG5cclxuICAgIHJldHVybiBkaXZpZGUoeC5zaW5oKCksIHguY29zaCgpLCBDdG9yLnByZWNpc2lvbiA9IHByLCBDdG9yLnJvdW5kaW5nID0gcm0pO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBhcmNjb3NpbmUgKGludmVyc2UgY29zaW5lKSBpbiByYWRpYW5zIG9mIHRoZSB2YWx1ZSBvZlxyXG4gICAqIHRoaXMgRGVjaW1hbC5cclxuICAgKlxyXG4gICAqIERvbWFpbjogWy0xLCAxXVxyXG4gICAqIFJhbmdlOiBbMCwgcGldXHJcbiAgICpcclxuICAgKiBhY29zKHgpID0gcGkvMiAtIGFzaW4oeClcclxuICAgKlxyXG4gICAqIGFjb3MoMCkgICAgICAgPSBwaS8yXHJcbiAgICogYWNvcygtMCkgICAgICA9IHBpLzJcclxuICAgKiBhY29zKDEpICAgICAgID0gMFxyXG4gICAqIGFjb3MoLTEpICAgICAgPSBwaVxyXG4gICAqIGFjb3MoMS8yKSAgICAgPSBwaS8zXHJcbiAgICogYWNvcygtMS8yKSAgICA9IDIqcGkvM1xyXG4gICAqIGFjb3MofHh8ID4gMSkgPSBOYU5cclxuICAgKiBhY29zKE5hTikgICAgID0gTmFOXHJcbiAgICpcclxuICAgKi9cclxuICBQLmludmVyc2VDb3NpbmUgPSBQLmFjb3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgaGFsZlBpLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgIGsgPSB4LmFicygpLmNtcCgxKSxcclxuICAgICAgcHIgPSBDdG9yLnByZWNpc2lvbixcclxuICAgICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG5cclxuICAgIGlmIChrICE9PSAtMSkge1xyXG4gICAgICByZXR1cm4gayA9PT0gMFxyXG4gICAgICAgIC8vIHx4fCBpcyAxXHJcbiAgICAgICAgPyB4LmlzTmVnKCkgPyBnZXRQaShDdG9yLCBwciwgcm0pIDogbmV3IEN0b3IoMClcclxuICAgICAgICAvLyB8eHwgPiAxIG9yIHggaXMgTmFOXHJcbiAgICAgICAgOiBuZXcgQ3RvcihOYU4pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh4LmlzWmVybygpKSByZXR1cm4gZ2V0UGkoQ3RvciwgcHIgKyA0LCBybSkudGltZXMoMC41KTtcclxuXHJcbiAgICAvLyBUT0RPPyBTcGVjaWFsIGNhc2UgYWNvcygwLjUpID0gcGkvMyBhbmQgYWNvcygtMC41KSA9IDIqcGkvM1xyXG5cclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyA2O1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XHJcblxyXG4gICAgeCA9IHguYXNpbigpO1xyXG4gICAgaGFsZlBpID0gZ2V0UGkoQ3RvciwgcHIgKyA0LCBybSkudGltZXMoMC41KTtcclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IHJtO1xyXG5cclxuICAgIHJldHVybiBoYWxmUGkubWludXMoeCk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGludmVyc2Ugb2YgdGhlIGh5cGVyYm9saWMgY29zaW5lIGluIHJhZGlhbnMgb2YgdGhlXHJcbiAgICogdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogRG9tYWluOiBbMSwgSW5maW5pdHldXHJcbiAgICogUmFuZ2U6IFswLCBJbmZpbml0eV1cclxuICAgKlxyXG4gICAqIGFjb3NoKHgpID0gbG4oeCArIHNxcnQoeF4yIC0gMSkpXHJcbiAgICpcclxuICAgKiBhY29zaCh4IDwgMSkgICAgID0gTmFOXHJcbiAgICogYWNvc2goTmFOKSAgICAgICA9IE5hTlxyXG4gICAqIGFjb3NoKEluZmluaXR5KSAgPSBJbmZpbml0eVxyXG4gICAqIGFjb3NoKC1JbmZpbml0eSkgPSBOYU5cclxuICAgKiBhY29zaCgwKSAgICAgICAgID0gTmFOXHJcbiAgICogYWNvc2goLTApICAgICAgICA9IE5hTlxyXG4gICAqIGFjb3NoKDEpICAgICAgICAgPSAwXHJcbiAgICogYWNvc2goLTEpICAgICAgICA9IE5hTlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5pbnZlcnNlSHlwZXJib2xpY0Nvc2luZSA9IFAuYWNvc2ggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgcHIsIHJtLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgaWYgKHgubHRlKDEpKSByZXR1cm4gbmV3IEN0b3IoeC5lcSgxKSA/IDAgOiBOYU4pO1xyXG4gICAgaWYgKCF4LmlzRmluaXRlKCkpIHJldHVybiBuZXcgQ3Rvcih4KTtcclxuXHJcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwciArIE1hdGgubWF4KE1hdGguYWJzKHguZSksIHguc2QoKSkgKyA0O1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG5cclxuICAgIHggPSB4LnRpbWVzKHgpLm1pbnVzKDEpLnNxcnQoKS5wbHVzKHgpO1xyXG5cclxuICAgIGV4dGVybmFsID0gdHJ1ZTtcclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHI7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0gcm07XHJcblxyXG4gICAgcmV0dXJuIHgubG4oKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgaHlwZXJib2xpYyBzaW5lIGluIHJhZGlhbnMgb2YgdGhlIHZhbHVlXHJcbiAgICogb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cclxuICAgKiBSYW5nZTogWy1JbmZpbml0eSwgSW5maW5pdHldXHJcbiAgICpcclxuICAgKiBhc2luaCh4KSA9IGxuKHggKyBzcXJ0KHheMiArIDEpKVxyXG4gICAqXHJcbiAgICogYXNpbmgoTmFOKSAgICAgICA9IE5hTlxyXG4gICAqIGFzaW5oKEluZmluaXR5KSAgPSBJbmZpbml0eVxyXG4gICAqIGFzaW5oKC1JbmZpbml0eSkgPSAtSW5maW5pdHlcclxuICAgKiBhc2luaCgwKSAgICAgICAgID0gMFxyXG4gICAqIGFzaW5oKC0wKSAgICAgICAgPSAtMFxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5pbnZlcnNlSHlwZXJib2xpY1NpbmUgPSBQLmFzaW5oID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHByLCBybSxcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIGlmICgheC5pc0Zpbml0ZSgpIHx8IHguaXNaZXJvKCkpIHJldHVybiBuZXcgQ3Rvcih4KTtcclxuXHJcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwciArIDIgKiBNYXRoLm1heChNYXRoLmFicyh4LmUpLCB4LnNkKCkpICsgNjtcclxuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xyXG4gICAgZXh0ZXJuYWwgPSBmYWxzZTtcclxuXHJcbiAgICB4ID0geC50aW1lcyh4KS5wbHVzKDEpLnNxcnQoKS5wbHVzKHgpO1xyXG5cclxuICAgIGV4dGVybmFsID0gdHJ1ZTtcclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHI7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0gcm07XHJcblxyXG4gICAgcmV0dXJuIHgubG4oKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgaHlwZXJib2xpYyB0YW5nZW50IGluIHJhZGlhbnMgb2YgdGhlXHJcbiAgICogdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogRG9tYWluOiBbLTEsIDFdXHJcbiAgICogUmFuZ2U6IFstSW5maW5pdHksIEluZmluaXR5XVxyXG4gICAqXHJcbiAgICogYXRhbmgoeCkgPSAwLjUgKiBsbigoMSArIHgpIC8gKDEgLSB4KSlcclxuICAgKlxyXG4gICAqIGF0YW5oKHx4fCA+IDEpICAgPSBOYU5cclxuICAgKiBhdGFuaChOYU4pICAgICAgID0gTmFOXHJcbiAgICogYXRhbmgoSW5maW5pdHkpICA9IE5hTlxyXG4gICAqIGF0YW5oKC1JbmZpbml0eSkgPSBOYU5cclxuICAgKiBhdGFuaCgwKSAgICAgICAgID0gMFxyXG4gICAqIGF0YW5oKC0wKSAgICAgICAgPSAtMFxyXG4gICAqIGF0YW5oKDEpICAgICAgICAgPSBJbmZpbml0eVxyXG4gICAqIGF0YW5oKC0xKSAgICAgICAgPSAtSW5maW5pdHlcclxuICAgKlxyXG4gICAqL1xyXG4gIFAuaW52ZXJzZUh5cGVyYm9saWNUYW5nZW50ID0gUC5hdGFuaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBwciwgcm0sIHdwciwgeHNkLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgaWYgKCF4LmlzRmluaXRlKCkpIHJldHVybiBuZXcgQ3RvcihOYU4pO1xyXG4gICAgaWYgKHguZSA+PSAwKSByZXR1cm4gbmV3IEN0b3IoeC5hYnMoKS5lcSgxKSA/IHgucyAvIDAgOiB4LmlzWmVybygpID8geCA6IE5hTik7XHJcblxyXG4gICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcclxuICAgIHJtID0gQ3Rvci5yb3VuZGluZztcclxuICAgIHhzZCA9IHguc2QoKTtcclxuXHJcbiAgICBpZiAoTWF0aC5tYXgoeHNkLCBwcikgPCAyICogLXguZSAtIDEpIHJldHVybiBmaW5hbGlzZShuZXcgQ3Rvcih4KSwgcHIsIHJtLCB0cnVlKTtcclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHdwciA9IHhzZCAtIHguZTtcclxuXHJcbiAgICB4ID0gZGl2aWRlKHgucGx1cygxKSwgbmV3IEN0b3IoMSkubWludXMoeCksIHdwciArIHByLCAxKTtcclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgNDtcclxuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xyXG5cclxuICAgIHggPSB4LmxuKCk7XHJcblxyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcclxuXHJcbiAgICByZXR1cm4geC50aW1lcygwLjUpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBhcmNzaW5lIChpbnZlcnNlIHNpbmUpIGluIHJhZGlhbnMgb2YgdGhlIHZhbHVlIG9mIHRoaXNcclxuICAgKiBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cclxuICAgKiBSYW5nZTogWy1waS8yLCBwaS8yXVxyXG4gICAqXHJcbiAgICogYXNpbih4KSA9IDIqYXRhbih4LygxICsgc3FydCgxIC0geF4yKSkpXHJcbiAgICpcclxuICAgKiBhc2luKDApICAgICAgID0gMFxyXG4gICAqIGFzaW4oLTApICAgICAgPSAtMFxyXG4gICAqIGFzaW4oMS8yKSAgICAgPSBwaS82XHJcbiAgICogYXNpbigtMS8yKSAgICA9IC1waS82XHJcbiAgICogYXNpbigxKSAgICAgICA9IHBpLzJcclxuICAgKiBhc2luKC0xKSAgICAgID0gLXBpLzJcclxuICAgKiBhc2luKHx4fCA+IDEpID0gTmFOXHJcbiAgICogYXNpbihOYU4pICAgICA9IE5hTlxyXG4gICAqXHJcbiAgICogVE9ETz8gQ29tcGFyZSBwZXJmb3JtYW5jZSBvZiBUYXlsb3Igc2VyaWVzLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5pbnZlcnNlU2luZSA9IFAuYXNpbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBoYWxmUGksIGssXHJcbiAgICAgIHByLCBybSxcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIGlmICh4LmlzWmVybygpKSByZXR1cm4gbmV3IEN0b3IoeCk7XHJcblxyXG4gICAgayA9IHguYWJzKCkuY21wKDEpO1xyXG4gICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcclxuICAgIHJtID0gQ3Rvci5yb3VuZGluZztcclxuXHJcbiAgICBpZiAoayAhPT0gLTEpIHtcclxuXHJcbiAgICAgIC8vIHx4fCBpcyAxXHJcbiAgICAgIGlmIChrID09PSAwKSB7XHJcbiAgICAgICAgaGFsZlBpID0gZ2V0UGkoQ3RvciwgcHIgKyA0LCBybSkudGltZXMoMC41KTtcclxuICAgICAgICBoYWxmUGkucyA9IHgucztcclxuICAgICAgICByZXR1cm4gaGFsZlBpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB8eHwgPiAxIG9yIHggaXMgTmFOXHJcbiAgICAgIHJldHVybiBuZXcgQ3RvcihOYU4pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE8/IFNwZWNpYWwgY2FzZSBhc2luKDEvMikgPSBwaS82IGFuZCBhc2luKC0xLzIpID0gLXBpLzZcclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgNjtcclxuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xyXG5cclxuICAgIHggPSB4LmRpdihuZXcgQ3RvcigxKS5taW51cyh4LnRpbWVzKHgpKS5zcXJ0KCkucGx1cygxKSkuYXRhbigpO1xyXG5cclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHI7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0gcm07XHJcblxyXG4gICAgcmV0dXJuIHgudGltZXMoMik7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGFyY3RhbmdlbnQgKGludmVyc2UgdGFuZ2VudCkgaW4gcmFkaWFucyBvZiB0aGUgdmFsdWVcclxuICAgKiBvZiB0aGlzIERlY2ltYWwuXHJcbiAgICpcclxuICAgKiBEb21haW46IFstSW5maW5pdHksIEluZmluaXR5XVxyXG4gICAqIFJhbmdlOiBbLXBpLzIsIHBpLzJdXHJcbiAgICpcclxuICAgKiBhdGFuKHgpID0geCAtIHheMy8zICsgeF41LzUgLSB4XjcvNyArIC4uLlxyXG4gICAqXHJcbiAgICogYXRhbigwKSAgICAgICAgID0gMFxyXG4gICAqIGF0YW4oLTApICAgICAgICA9IC0wXHJcbiAgICogYXRhbigxKSAgICAgICAgID0gcGkvNFxyXG4gICAqIGF0YW4oLTEpICAgICAgICA9IC1waS80XHJcbiAgICogYXRhbihJbmZpbml0eSkgID0gcGkvMlxyXG4gICAqIGF0YW4oLUluZmluaXR5KSA9IC1waS8yXHJcbiAgICogYXRhbihOYU4pICAgICAgID0gTmFOXHJcbiAgICpcclxuICAgKi9cclxuICBQLmludmVyc2VUYW5nZW50ID0gUC5hdGFuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGksIGosIGssIG4sIHB4LCB0LCByLCB3cHIsIHgyLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgIHByID0gQ3Rvci5wcmVjaXNpb24sXHJcbiAgICAgIHJtID0gQ3Rvci5yb3VuZGluZztcclxuXHJcbiAgICBpZiAoIXguaXNGaW5pdGUoKSkge1xyXG4gICAgICBpZiAoIXgucykgcmV0dXJuIG5ldyBDdG9yKE5hTik7XHJcbiAgICAgIGlmIChwciArIDQgPD0gUElfUFJFQ0lTSU9OKSB7XHJcbiAgICAgICAgciA9IGdldFBpKEN0b3IsIHByICsgNCwgcm0pLnRpbWVzKDAuNSk7XHJcbiAgICAgICAgci5zID0geC5zO1xyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHguaXNaZXJvKCkpIHtcclxuICAgICAgcmV0dXJuIG5ldyBDdG9yKHgpO1xyXG4gICAgfSBlbHNlIGlmICh4LmFicygpLmVxKDEpICYmIHByICsgNCA8PSBQSV9QUkVDSVNJT04pIHtcclxuICAgICAgciA9IGdldFBpKEN0b3IsIHByICsgNCwgcm0pLnRpbWVzKDAuMjUpO1xyXG4gICAgICByLnMgPSB4LnM7XHJcbiAgICAgIHJldHVybiByO1xyXG4gICAgfVxyXG5cclxuICAgIEN0b3IucHJlY2lzaW9uID0gd3ByID0gcHIgKyAxMDtcclxuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xyXG5cclxuICAgIC8vIFRPRE8/IGlmICh4ID49IDEgJiYgcHIgPD0gUElfUFJFQ0lTSU9OKSBhdGFuKHgpID0gaGFsZlBpICogeC5zIC0gYXRhbigxIC8geCk7XHJcblxyXG4gICAgLy8gQXJndW1lbnQgcmVkdWN0aW9uXHJcbiAgICAvLyBFbnN1cmUgfHh8IDwgMC40MlxyXG4gICAgLy8gYXRhbih4KSA9IDIgKiBhdGFuKHggLyAoMSArIHNxcnQoMSArIHheMikpKVxyXG5cclxuICAgIGsgPSBNYXRoLm1pbigyOCwgd3ByIC8gTE9HX0JBU0UgKyAyIHwgMCk7XHJcblxyXG4gICAgZm9yIChpID0gazsgaTsgLS1pKSB4ID0geC5kaXYoeC50aW1lcyh4KS5wbHVzKDEpLnNxcnQoKS5wbHVzKDEpKTtcclxuXHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG5cclxuICAgIGogPSBNYXRoLmNlaWwod3ByIC8gTE9HX0JBU0UpO1xyXG4gICAgbiA9IDE7XHJcbiAgICB4MiA9IHgudGltZXMoeCk7XHJcbiAgICByID0gbmV3IEN0b3IoeCk7XHJcbiAgICBweCA9IHg7XHJcblxyXG4gICAgLy8gYXRhbih4KSA9IHggLSB4XjMvMyArIHheNS81IC0geF43LzcgKyAuLi5cclxuICAgIGZvciAoOyBpICE9PSAtMTspIHtcclxuICAgICAgcHggPSBweC50aW1lcyh4Mik7XHJcbiAgICAgIHQgPSByLm1pbnVzKHB4LmRpdihuICs9IDIpKTtcclxuXHJcbiAgICAgIHB4ID0gcHgudGltZXMoeDIpO1xyXG4gICAgICByID0gdC5wbHVzKHB4LmRpdihuICs9IDIpKTtcclxuXHJcbiAgICAgIGlmIChyLmRbal0gIT09IHZvaWQgMCkgZm9yIChpID0gajsgci5kW2ldID09PSB0LmRbaV0gJiYgaS0tOyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGspIHIgPSByLnRpbWVzKDIgPDwgKGsgLSAxKSk7XHJcblxyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiBmaW5hbGlzZShyLCBDdG9yLnByZWNpc2lvbiA9IHByLCBDdG9yLnJvdW5kaW5nID0gcm0sIHRydWUpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgYSBmaW5pdGUgbnVtYmVyLCBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5pc0Zpbml0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAhIXRoaXMuZDtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIGFuIGludGVnZXIsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmlzSW50ZWdlciA9IFAuaXNJbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gISF0aGlzLmQgJiYgbWF0aGZsb29yKHRoaXMuZSAvIExPR19CQVNFKSA+IHRoaXMuZC5sZW5ndGggLSAyO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgTmFOLCBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5pc05hTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAhdGhpcy5zO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgbmVnYXRpdmUsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmlzTmVnYXRpdmUgPSBQLmlzTmVnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucyA8IDA7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBwb3NpdGl2ZSwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuaXNQb3NpdGl2ZSA9IFAuaXNQb3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zID4gMDtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIDAgb3IgLTAsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmlzWmVybyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAhIXRoaXMuZCAmJiB0aGlzLmRbMF0gPT09IDA7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBsZXNzIHRoYW4gYHlgLCBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5sZXNzVGhhbiA9IFAubHQgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMDtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgeWAsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmxlc3NUaGFuT3JFcXVhbFRvID0gUC5sdGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gdGhlIGxvZ2FyaXRobSBvZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIHRvIHRoZSBzcGVjaWZpZWQgYmFzZSwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiBJZiBubyBiYXNlIGlzIHNwZWNpZmllZCwgcmV0dXJuIGxvZ1sxMF0oYXJnKS5cclxuICAgKlxyXG4gICAqIGxvZ1tiYXNlXShhcmcpID0gbG4oYXJnKSAvIGxuKGJhc2UpXHJcbiAgICpcclxuICAgKiBUaGUgcmVzdWx0IHdpbGwgYWx3YXlzIGJlIGNvcnJlY3RseSByb3VuZGVkIGlmIHRoZSBiYXNlIG9mIHRoZSBsb2cgaXMgMTAsIGFuZCAnYWxtb3N0IGFsd2F5cydcclxuICAgKiBvdGhlcndpc2U6XHJcbiAgICpcclxuICAgKiBEZXBlbmRpbmcgb24gdGhlIHJvdW5kaW5nIG1vZGUsIHRoZSByZXN1bHQgbWF5IGJlIGluY29ycmVjdGx5IHJvdW5kZWQgaWYgdGhlIGZpcnN0IGZpZnRlZW5cclxuICAgKiByb3VuZGluZyBkaWdpdHMgYXJlIFs0OV05OTk5OTk5OTk5OTk5OSBvciBbNTBdMDAwMDAwMDAwMDAwMDAuIEluIHRoYXQgY2FzZSwgdGhlIG1heGltdW0gZXJyb3JcclxuICAgKiBiZXR3ZWVuIHRoZSByZXN1bHQgYW5kIHRoZSBjb3JyZWN0bHkgcm91bmRlZCByZXN1bHQgd2lsbCBiZSBvbmUgdWxwICh1bml0IGluIHRoZSBsYXN0IHBsYWNlKS5cclxuICAgKlxyXG4gICAqIGxvZ1stYl0oYSkgICAgICAgPSBOYU5cclxuICAgKiBsb2dbMF0oYSkgICAgICAgID0gTmFOXHJcbiAgICogbG9nWzFdKGEpICAgICAgICA9IE5hTlxyXG4gICAqIGxvZ1tOYU5dKGEpICAgICAgPSBOYU5cclxuICAgKiBsb2dbSW5maW5pdHldKGEpID0gTmFOXHJcbiAgICogbG9nW2JdKDApICAgICAgICA9IC1JbmZpbml0eVxyXG4gICAqIGxvZ1tiXSgtMCkgICAgICAgPSAtSW5maW5pdHlcclxuICAgKiBsb2dbYl0oLWEpICAgICAgID0gTmFOXHJcbiAgICogbG9nW2JdKDEpICAgICAgICA9IDBcclxuICAgKiBsb2dbYl0oSW5maW5pdHkpID0gSW5maW5pdHlcclxuICAgKiBsb2dbYl0oTmFOKSAgICAgID0gTmFOXHJcbiAgICpcclxuICAgKiBbYmFzZV0ge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gVGhlIGJhc2Ugb2YgdGhlIGxvZ2FyaXRobS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAubG9nYXJpdGhtID0gUC5sb2cgPSBmdW5jdGlvbiAoYmFzZSkge1xyXG4gICAgdmFyIGlzQmFzZTEwLCBkLCBkZW5vbWluYXRvciwgaywgaW5mLCBudW0sIHNkLCByLFxyXG4gICAgICBhcmcgPSB0aGlzLFxyXG4gICAgICBDdG9yID0gYXJnLmNvbnN0cnVjdG9yLFxyXG4gICAgICBwciA9IEN0b3IucHJlY2lzaW9uLFxyXG4gICAgICBybSA9IEN0b3Iucm91bmRpbmcsXHJcbiAgICAgIGd1YXJkID0gNTtcclxuXHJcbiAgICAvLyBEZWZhdWx0IGJhc2UgaXMgMTAuXHJcbiAgICBpZiAoYmFzZSA9PSBudWxsKSB7XHJcbiAgICAgIGJhc2UgPSBuZXcgQ3RvcigxMCk7XHJcbiAgICAgIGlzQmFzZTEwID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGJhc2UgPSBuZXcgQ3RvcihiYXNlKTtcclxuICAgICAgZCA9IGJhc2UuZDtcclxuXHJcbiAgICAgIC8vIFJldHVybiBOYU4gaWYgYmFzZSBpcyBuZWdhdGl2ZSwgb3Igbm9uLWZpbml0ZSwgb3IgaXMgMCBvciAxLlxyXG4gICAgICBpZiAoYmFzZS5zIDwgMCB8fCAhZCB8fCAhZFswXSB8fCBiYXNlLmVxKDEpKSByZXR1cm4gbmV3IEN0b3IoTmFOKTtcclxuXHJcbiAgICAgIGlzQmFzZTEwID0gYmFzZS5lcSgxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgZCA9IGFyZy5kO1xyXG5cclxuICAgIC8vIElzIGFyZyBuZWdhdGl2ZSwgbm9uLWZpbml0ZSwgMCBvciAxP1xyXG4gICAgaWYgKGFyZy5zIDwgMCB8fCAhZCB8fCAhZFswXSB8fCBhcmcuZXEoMSkpIHtcclxuICAgICAgcmV0dXJuIG5ldyBDdG9yKGQgJiYgIWRbMF0gPyAtMSAvIDAgOiBhcmcucyAhPSAxID8gTmFOIDogZCA/IDAgOiAxIC8gMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhlIHJlc3VsdCB3aWxsIGhhdmUgYSBub24tdGVybWluYXRpbmcgZGVjaW1hbCBleHBhbnNpb24gaWYgYmFzZSBpcyAxMCBhbmQgYXJnIGlzIG5vdCBhblxyXG4gICAgLy8gaW50ZWdlciBwb3dlciBvZiAxMC5cclxuICAgIGlmIChpc0Jhc2UxMCkge1xyXG4gICAgICBpZiAoZC5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgaW5mID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3IgKGsgPSBkWzBdOyBrICUgMTAgPT09IDA7KSBrIC89IDEwO1xyXG4gICAgICAgIGluZiA9IGsgIT09IDE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG4gICAgc2QgPSBwciArIGd1YXJkO1xyXG4gICAgbnVtID0gbmF0dXJhbExvZ2FyaXRobShhcmcsIHNkKTtcclxuICAgIGRlbm9taW5hdG9yID0gaXNCYXNlMTAgPyBnZXRMbjEwKEN0b3IsIHNkICsgMTApIDogbmF0dXJhbExvZ2FyaXRobShiYXNlLCBzZCk7XHJcblxyXG4gICAgLy8gVGhlIHJlc3VsdCB3aWxsIGhhdmUgNSByb3VuZGluZyBkaWdpdHMuXHJcbiAgICByID0gZGl2aWRlKG51bSwgZGVub21pbmF0b3IsIHNkLCAxKTtcclxuXHJcbiAgICAvLyBJZiBhdCBhIHJvdW5kaW5nIGJvdW5kYXJ5LCBpLmUuIHRoZSByZXN1bHQncyByb3VuZGluZyBkaWdpdHMgYXJlIFs0OV05OTk5IG9yIFs1MF0wMDAwLFxyXG4gICAgLy8gY2FsY3VsYXRlIDEwIGZ1cnRoZXIgZGlnaXRzLlxyXG4gICAgLy9cclxuICAgIC8vIElmIHRoZSByZXN1bHQgaXMga25vd24gdG8gaGF2ZSBhbiBpbmZpbml0ZSBkZWNpbWFsIGV4cGFuc2lvbiwgcmVwZWF0IHRoaXMgdW50aWwgaXQgaXMgY2xlYXJcclxuICAgIC8vIHRoYXQgdGhlIHJlc3VsdCBpcyBhYm92ZSBvciBiZWxvdyB0aGUgYm91bmRhcnkuIE90aGVyd2lzZSwgaWYgYWZ0ZXIgY2FsY3VsYXRpbmcgdGhlIDEwXHJcbiAgICAvLyBmdXJ0aGVyIGRpZ2l0cywgdGhlIGxhc3QgMTQgYXJlIG5pbmVzLCByb3VuZCB1cCBhbmQgYXNzdW1lIHRoZSByZXN1bHQgaXMgZXhhY3QuXHJcbiAgICAvLyBBbHNvIGFzc3VtZSB0aGUgcmVzdWx0IGlzIGV4YWN0IGlmIHRoZSBsYXN0IDE0IGFyZSB6ZXJvLlxyXG4gICAgLy9cclxuICAgIC8vIEV4YW1wbGUgb2YgYSByZXN1bHQgdGhhdCB3aWxsIGJlIGluY29ycmVjdGx5IHJvdW5kZWQ6XHJcbiAgICAvLyBsb2dbMTA0ODU3Nl0oNDUwMzU5OTYyNzM3MDUwMikgPSAyLjYwMDAwMDAwMDAwMDAwMDA5NjEwMjc5NTExNDQ0NzQ2Li4uXHJcbiAgICAvLyBUaGUgYWJvdmUgcmVzdWx0IGNvcnJlY3RseSByb3VuZGVkIHVzaW5nIFJPVU5EX0NFSUwgdG8gMSBkZWNpbWFsIHBsYWNlIHNob3VsZCBiZSAyLjcsIGJ1dCBpdFxyXG4gICAgLy8gd2lsbCBiZSBnaXZlbiBhcyAyLjYgYXMgdGhlcmUgYXJlIDE1IHplcm9zIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSByZXF1ZXN0ZWQgZGVjaW1hbCBwbGFjZSwgc29cclxuICAgIC8vIHRoZSBleGFjdCByZXN1bHQgd291bGQgYmUgYXNzdW1lZCB0byBiZSAyLjYsIHdoaWNoIHJvdW5kZWQgdXNpbmcgUk9VTkRfQ0VJTCB0byAxIGRlY2ltYWxcclxuICAgIC8vIHBsYWNlIGlzIHN0aWxsIDIuNi5cclxuICAgIGlmIChjaGVja1JvdW5kaW5nRGlnaXRzKHIuZCwgayA9IHByLCBybSkpIHtcclxuXHJcbiAgICAgIGRvIHtcclxuICAgICAgICBzZCArPSAxMDtcclxuICAgICAgICBudW0gPSBuYXR1cmFsTG9nYXJpdGhtKGFyZywgc2QpO1xyXG4gICAgICAgIGRlbm9taW5hdG9yID0gaXNCYXNlMTAgPyBnZXRMbjEwKEN0b3IsIHNkICsgMTApIDogbmF0dXJhbExvZ2FyaXRobShiYXNlLCBzZCk7XHJcbiAgICAgICAgciA9IGRpdmlkZShudW0sIGRlbm9taW5hdG9yLCBzZCwgMSk7XHJcblxyXG4gICAgICAgIGlmICghaW5mKSB7XHJcblxyXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIDE0IG5pbmVzIGZyb20gdGhlIDJuZCByb3VuZGluZyBkaWdpdCwgYXMgdGhlIGZpcnN0IG1heSBiZSA0LlxyXG4gICAgICAgICAgaWYgKCtkaWdpdHNUb1N0cmluZyhyLmQpLnNsaWNlKGsgKyAxLCBrICsgMTUpICsgMSA9PSAxZTE0KSB7XHJcbiAgICAgICAgICAgIHIgPSBmaW5hbGlzZShyLCBwciArIDEsIDApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfSB3aGlsZSAoY2hlY2tSb3VuZGluZ0RpZ2l0cyhyLmQsIGsgKz0gMTAsIHJtKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiBmaW5hbGlzZShyLCBwciwgcm0pO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBtYXhpbXVtIG9mIHRoZSBhcmd1bWVudHMgYW5kIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwuXHJcbiAgICpcclxuICAgKiBhcmd1bWVudHMge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gIFAubWF4ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guY2FsbChhcmd1bWVudHMsIHRoaXMpO1xyXG4gICAgcmV0dXJuIG1heE9yTWluKHRoaXMuY29uc3RydWN0b3IsIGFyZ3VtZW50cywgJ2x0Jyk7XHJcbiAgfTtcclxuICAgKi9cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIG1pbmltdW0gb2YgdGhlIGFyZ3VtZW50cyBhbmQgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbC5cclxuICAgKlxyXG4gICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgUC5taW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5jYWxsKGFyZ3VtZW50cywgdGhpcyk7XHJcbiAgICByZXR1cm4gbWF4T3JNaW4odGhpcy5jb25zdHJ1Y3RvciwgYXJndW1lbnRzLCAnZ3QnKTtcclxuICB9O1xyXG4gICAqL1xyXG5cclxuXHJcbiAgLypcclxuICAgKiAgbiAtIDAgPSBuXHJcbiAgICogIG4gLSBOID0gTlxyXG4gICAqICBuIC0gSSA9IC1JXHJcbiAgICogIDAgLSBuID0gLW5cclxuICAgKiAgMCAtIDAgPSAwXHJcbiAgICogIDAgLSBOID0gTlxyXG4gICAqICAwIC0gSSA9IC1JXHJcbiAgICogIE4gLSBuID0gTlxyXG4gICAqICBOIC0gMCA9IE5cclxuICAgKiAgTiAtIE4gPSBOXHJcbiAgICogIE4gLSBJID0gTlxyXG4gICAqICBJIC0gbiA9IElcclxuICAgKiAgSSAtIDAgPSBJXHJcbiAgICogIEkgLSBOID0gTlxyXG4gICAqICBJIC0gSSA9IE5cclxuICAgKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgbWludXMgYHlgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAubWludXMgPSBQLnN1YiA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICB2YXIgZCwgZSwgaSwgaiwgaywgbGVuLCBwciwgcm0sIHhkLCB4ZSwgeExUeSwgeWQsXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICB5ID0gbmV3IEN0b3IoeSk7XHJcblxyXG4gICAgLy8gSWYgZWl0aGVyIGlzIG5vdCBmaW5pdGUuLi5cclxuICAgIGlmICgheC5kIHx8ICF5LmQpIHtcclxuXHJcbiAgICAgIC8vIFJldHVybiBOYU4gaWYgZWl0aGVyIGlzIE5hTi5cclxuICAgICAgaWYgKCF4LnMgfHwgIXkucykgeSA9IG5ldyBDdG9yKE5hTik7XHJcblxyXG4gICAgICAvLyBSZXR1cm4geSBuZWdhdGVkIGlmIHggaXMgZmluaXRlIGFuZCB5IGlzIMKxSW5maW5pdHkuXHJcbiAgICAgIGVsc2UgaWYgKHguZCkgeS5zID0gLXkucztcclxuXHJcbiAgICAgIC8vIFJldHVybiB4IGlmIHkgaXMgZmluaXRlIGFuZCB4IGlzIMKxSW5maW5pdHkuXHJcbiAgICAgIC8vIFJldHVybiB4IGlmIGJvdGggYXJlIMKxSW5maW5pdHkgd2l0aCBkaWZmZXJlbnQgc2lnbnMuXHJcbiAgICAgIC8vIFJldHVybiBOYU4gaWYgYm90aCBhcmUgwrFJbmZpbml0eSB3aXRoIHRoZSBzYW1lIHNpZ24uXHJcbiAgICAgIGVsc2UgeSA9IG5ldyBDdG9yKHkuZCB8fCB4LnMgIT09IHkucyA/IHggOiBOYU4pO1xyXG5cclxuICAgICAgcmV0dXJuIHk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgc2lnbnMgZGlmZmVyLi4uXHJcbiAgICBpZiAoeC5zICE9IHkucykge1xyXG4gICAgICB5LnMgPSAteS5zO1xyXG4gICAgICByZXR1cm4geC5wbHVzKHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHhkID0geC5kO1xyXG4gICAgeWQgPSB5LmQ7XHJcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG5cclxuICAgIC8vIElmIGVpdGhlciBpcyB6ZXJvLi4uXHJcbiAgICBpZiAoIXhkWzBdIHx8ICF5ZFswXSkge1xyXG5cclxuICAgICAgLy8gUmV0dXJuIHkgbmVnYXRlZCBpZiB4IGlzIHplcm8gYW5kIHkgaXMgbm9uLXplcm8uXHJcbiAgICAgIGlmICh5ZFswXSkgeS5zID0gLXkucztcclxuXHJcbiAgICAgIC8vIFJldHVybiB4IGlmIHkgaXMgemVybyBhbmQgeCBpcyBub24temVyby5cclxuICAgICAgZWxzZSBpZiAoeGRbMF0pIHkgPSBuZXcgQ3Rvcih4KTtcclxuXHJcbiAgICAgIC8vIFJldHVybiB6ZXJvIGlmIGJvdGggYXJlIHplcm8uXHJcbiAgICAgIC8vIEZyb20gSUVFRSA3NTQgKDIwMDgpIDYuMzogMCAtIDAgPSAtMCAtIC0wID0gLTAgd2hlbiByb3VuZGluZyB0byAtSW5maW5pdHkuXHJcbiAgICAgIGVsc2UgcmV0dXJuIG5ldyBDdG9yKHJtID09PSAzID8gLTAgOiAwKTtcclxuXHJcbiAgICAgIHJldHVybiBleHRlcm5hbCA/IGZpbmFsaXNlKHksIHByLCBybSkgOiB5O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHggYW5kIHkgYXJlIGZpbml0ZSwgbm9uLXplcm8gbnVtYmVycyB3aXRoIHRoZSBzYW1lIHNpZ24uXHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIGJhc2UgMWU3IGV4cG9uZW50cy5cclxuICAgIGUgPSBtYXRoZmxvb3IoeS5lIC8gTE9HX0JBU0UpO1xyXG4gICAgeGUgPSBtYXRoZmxvb3IoeC5lIC8gTE9HX0JBU0UpO1xyXG5cclxuICAgIHhkID0geGQuc2xpY2UoKTtcclxuICAgIGsgPSB4ZSAtIGU7XHJcblxyXG4gICAgLy8gSWYgYmFzZSAxZTcgZXhwb25lbnRzIGRpZmZlci4uLlxyXG4gICAgaWYgKGspIHtcclxuICAgICAgeExUeSA9IGsgPCAwO1xyXG5cclxuICAgICAgaWYgKHhMVHkpIHtcclxuICAgICAgICBkID0geGQ7XHJcbiAgICAgICAgayA9IC1rO1xyXG4gICAgICAgIGxlbiA9IHlkLmxlbmd0aDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkID0geWQ7XHJcbiAgICAgICAgZSA9IHhlO1xyXG4gICAgICAgIGxlbiA9IHhkLmxlbmd0aDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTnVtYmVycyB3aXRoIG1hc3NpdmVseSBkaWZmZXJlbnQgZXhwb25lbnRzIHdvdWxkIHJlc3VsdCBpbiBhIHZlcnkgaGlnaCBudW1iZXIgb2ZcclxuICAgICAgLy8gemVyb3MgbmVlZGluZyB0byBiZSBwcmVwZW5kZWQsIGJ1dCB0aGlzIGNhbiBiZSBhdm9pZGVkIHdoaWxlIHN0aWxsIGVuc3VyaW5nIGNvcnJlY3RcclxuICAgICAgLy8gcm91bmRpbmcgYnkgbGltaXRpbmcgdGhlIG51bWJlciBvZiB6ZXJvcyB0byBgTWF0aC5jZWlsKHByIC8gTE9HX0JBU0UpICsgMmAuXHJcbiAgICAgIGkgPSBNYXRoLm1heChNYXRoLmNlaWwocHIgLyBMT0dfQkFTRSksIGxlbikgKyAyO1xyXG5cclxuICAgICAgaWYgKGsgPiBpKSB7XHJcbiAgICAgICAgayA9IGk7XHJcbiAgICAgICAgZC5sZW5ndGggPSAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgZC5yZXZlcnNlKCk7XHJcbiAgICAgIGZvciAoaSA9IGs7IGktLTspIGQucHVzaCgwKTtcclxuICAgICAgZC5yZXZlcnNlKCk7XHJcblxyXG4gICAgLy8gQmFzZSAxZTcgZXhwb25lbnRzIGVxdWFsLlxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIC8vIENoZWNrIGRpZ2l0cyB0byBkZXRlcm1pbmUgd2hpY2ggaXMgdGhlIGJpZ2dlciBudW1iZXIuXHJcblxyXG4gICAgICBpID0geGQubGVuZ3RoO1xyXG4gICAgICBsZW4gPSB5ZC5sZW5ndGg7XHJcbiAgICAgIHhMVHkgPSBpIDwgbGVuO1xyXG4gICAgICBpZiAoeExUeSkgbGVuID0gaTtcclxuXHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgIGlmICh4ZFtpXSAhPSB5ZFtpXSkge1xyXG4gICAgICAgICAgeExUeSA9IHhkW2ldIDwgeWRbaV07XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGsgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh4TFR5KSB7XHJcbiAgICAgIGQgPSB4ZDtcclxuICAgICAgeGQgPSB5ZDtcclxuICAgICAgeWQgPSBkO1xyXG4gICAgICB5LnMgPSAteS5zO1xyXG4gICAgfVxyXG5cclxuICAgIGxlbiA9IHhkLmxlbmd0aDtcclxuXHJcbiAgICAvLyBBcHBlbmQgemVyb3MgdG8gYHhkYCBpZiBzaG9ydGVyLlxyXG4gICAgLy8gRG9uJ3QgYWRkIHplcm9zIHRvIGB5ZGAgaWYgc2hvcnRlciBhcyBzdWJ0cmFjdGlvbiBvbmx5IG5lZWRzIHRvIHN0YXJ0IGF0IGB5ZGAgbGVuZ3RoLlxyXG4gICAgZm9yIChpID0geWQubGVuZ3RoIC0gbGVuOyBpID4gMDsgLS1pKSB4ZFtsZW4rK10gPSAwO1xyXG5cclxuICAgIC8vIFN1YnRyYWN0IHlkIGZyb20geGQuXHJcbiAgICBmb3IgKGkgPSB5ZC5sZW5ndGg7IGkgPiBrOykge1xyXG5cclxuICAgICAgaWYgKHhkWy0taV0gPCB5ZFtpXSkge1xyXG4gICAgICAgIGZvciAoaiA9IGk7IGogJiYgeGRbLS1qXSA9PT0gMDspIHhkW2pdID0gQkFTRSAtIDE7XHJcbiAgICAgICAgLS14ZFtqXTtcclxuICAgICAgICB4ZFtpXSArPSBCQVNFO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB4ZFtpXSAtPSB5ZFtpXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICBmb3IgKDsgeGRbLS1sZW5dID09PSAwOykgeGQucG9wKCk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIGxlYWRpbmcgemVyb3MgYW5kIGFkanVzdCBleHBvbmVudCBhY2NvcmRpbmdseS5cclxuICAgIGZvciAoOyB4ZFswXSA9PT0gMDsgeGQuc2hpZnQoKSkgLS1lO1xyXG5cclxuICAgIC8vIFplcm8/XHJcbiAgICBpZiAoIXhkWzBdKSByZXR1cm4gbmV3IEN0b3Iocm0gPT09IDMgPyAtMCA6IDApO1xyXG5cclxuICAgIHkuZCA9IHhkO1xyXG4gICAgeS5lID0gZ2V0QmFzZTEwRXhwb25lbnQoeGQsIGUpO1xyXG5cclxuICAgIHJldHVybiBleHRlcm5hbCA/IGZpbmFsaXNlKHksIHByLCBybSkgOiB5O1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqICAgbiAlIDAgPSAgTlxyXG4gICAqICAgbiAlIE4gPSAgTlxyXG4gICAqICAgbiAlIEkgPSAgblxyXG4gICAqICAgMCAlIG4gPSAgMFxyXG4gICAqICAtMCAlIG4gPSAtMFxyXG4gICAqICAgMCAlIDAgPSAgTlxyXG4gICAqICAgMCAlIE4gPSAgTlxyXG4gICAqICAgMCAlIEkgPSAgMFxyXG4gICAqICAgTiAlIG4gPSAgTlxyXG4gICAqICAgTiAlIDAgPSAgTlxyXG4gICAqICAgTiAlIE4gPSAgTlxyXG4gICAqICAgTiAlIEkgPSAgTlxyXG4gICAqICAgSSAlIG4gPSAgTlxyXG4gICAqICAgSSAlIDAgPSAgTlxyXG4gICAqICAgSSAlIE4gPSAgTlxyXG4gICAqICAgSSAlIEkgPSAgTlxyXG4gICAqXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBtb2R1bG8gYHlgLCByb3VuZGVkIHRvXHJcbiAgICogYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIFRoZSByZXN1bHQgZGVwZW5kcyBvbiB0aGUgbW9kdWxvIG1vZGUuXHJcbiAgICpcclxuICAgKi9cclxuICBQLm1vZHVsbyA9IFAubW9kID0gZnVuY3Rpb24gKHkpIHtcclxuICAgIHZhciBxLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgeSA9IG5ldyBDdG9yKHkpO1xyXG5cclxuICAgIC8vIFJldHVybiBOYU4gaWYgeCBpcyDCsUluZmluaXR5IG9yIE5hTiwgb3IgeSBpcyBOYU4gb3IgwrEwLlxyXG4gICAgaWYgKCF4LmQgfHwgIXkucyB8fCB5LmQgJiYgIXkuZFswXSkgcmV0dXJuIG5ldyBDdG9yKE5hTik7XHJcblxyXG4gICAgLy8gUmV0dXJuIHggaWYgeSBpcyDCsUluZmluaXR5IG9yIHggaXMgwrEwLlxyXG4gICAgaWYgKCF5LmQgfHwgeC5kICYmICF4LmRbMF0pIHtcclxuICAgICAgcmV0dXJuIGZpbmFsaXNlKG5ldyBDdG9yKHgpLCBDdG9yLnByZWNpc2lvbiwgQ3Rvci5yb3VuZGluZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUHJldmVudCByb3VuZGluZyBvZiBpbnRlcm1lZGlhdGUgY2FsY3VsYXRpb25zLlxyXG4gICAgZXh0ZXJuYWwgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoQ3Rvci5tb2R1bG8gPT0gOSkge1xyXG5cclxuICAgICAgLy8gRXVjbGlkaWFuIGRpdmlzaW9uOiBxID0gc2lnbih5KSAqIGZsb29yKHggLyBhYnMoeSkpXHJcbiAgICAgIC8vIHJlc3VsdCA9IHggLSBxICogeSAgICB3aGVyZSAgMCA8PSByZXN1bHQgPCBhYnMoeSlcclxuICAgICAgcSA9IGRpdmlkZSh4LCB5LmFicygpLCAwLCAzLCAxKTtcclxuICAgICAgcS5zICo9IHkucztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHEgPSBkaXZpZGUoeCwgeSwgMCwgQ3Rvci5tb2R1bG8sIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHEgPSBxLnRpbWVzKHkpO1xyXG5cclxuICAgIGV4dGVybmFsID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4geC5taW51cyhxKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbmF0dXJhbCBleHBvbmVudGlhbCBvZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLFxyXG4gICAqIGkuZS4gdGhlIGJhc2UgZSByYWlzZWQgdG8gdGhlIHBvd2VyIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmBcclxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5uYXR1cmFsRXhwb25lbnRpYWwgPSBQLmV4cCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBuYXR1cmFsRXhwb25lbnRpYWwodGhpcyk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIG5hdHVyYWwgbG9nYXJpdGhtIG9mIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwsXHJcbiAgICogcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5uYXR1cmFsTG9nYXJpdGhtID0gUC5sbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBuYXR1cmFsTG9nYXJpdGhtKHRoaXMpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgbmVnYXRlZCwgaS5lLiBhcyBpZiBtdWx0aXBsaWVkIGJ5XHJcbiAgICogLTEuXHJcbiAgICpcclxuICAgKi9cclxuICBQLm5lZ2F0ZWQgPSBQLm5lZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB4ID0gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyk7XHJcbiAgICB4LnMgPSAteC5zO1xyXG4gICAgcmV0dXJuIGZpbmFsaXNlKHgpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqICBuICsgMCA9IG5cclxuICAgKiAgbiArIE4gPSBOXHJcbiAgICogIG4gKyBJID0gSVxyXG4gICAqICAwICsgbiA9IG5cclxuICAgKiAgMCArIDAgPSAwXHJcbiAgICogIDAgKyBOID0gTlxyXG4gICAqICAwICsgSSA9IElcclxuICAgKiAgTiArIG4gPSBOXHJcbiAgICogIE4gKyAwID0gTlxyXG4gICAqICBOICsgTiA9IE5cclxuICAgKiAgTiArIEkgPSBOXHJcbiAgICogIEkgKyBuID0gSVxyXG4gICAqICBJICsgMCA9IElcclxuICAgKiAgSSArIE4gPSBOXHJcbiAgICogIEkgKyBJID0gSVxyXG4gICAqXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBwbHVzIGB5YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKi9cclxuICBQLnBsdXMgPSBQLmFkZCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICB2YXIgY2FycnksIGQsIGUsIGksIGssIGxlbiwgcHIsIHJtLCB4ZCwgeWQsXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICB5ID0gbmV3IEN0b3IoeSk7XHJcblxyXG4gICAgLy8gSWYgZWl0aGVyIGlzIG5vdCBmaW5pdGUuLi5cclxuICAgIGlmICgheC5kIHx8ICF5LmQpIHtcclxuXHJcbiAgICAgIC8vIFJldHVybiBOYU4gaWYgZWl0aGVyIGlzIE5hTi5cclxuICAgICAgaWYgKCF4LnMgfHwgIXkucykgeSA9IG5ldyBDdG9yKE5hTik7XHJcblxyXG4gICAgICAvLyBSZXR1cm4geCBpZiB5IGlzIGZpbml0ZSBhbmQgeCBpcyDCsUluZmluaXR5LlxyXG4gICAgICAvLyBSZXR1cm4geCBpZiBib3RoIGFyZSDCsUluZmluaXR5IHdpdGggdGhlIHNhbWUgc2lnbi5cclxuICAgICAgLy8gUmV0dXJuIE5hTiBpZiBib3RoIGFyZSDCsUluZmluaXR5IHdpdGggZGlmZmVyZW50IHNpZ25zLlxyXG4gICAgICAvLyBSZXR1cm4geSBpZiB4IGlzIGZpbml0ZSBhbmQgeSBpcyDCsUluZmluaXR5LlxyXG4gICAgICBlbHNlIGlmICgheC5kKSB5ID0gbmV3IEN0b3IoeS5kIHx8IHgucyA9PT0geS5zID8geCA6IE5hTik7XHJcblxyXG4gICAgICByZXR1cm4geTtcclxuICAgIH1cclxuXHJcbiAgICAgLy8gSWYgc2lnbnMgZGlmZmVyLi4uXHJcbiAgICBpZiAoeC5zICE9IHkucykge1xyXG4gICAgICB5LnMgPSAteS5zO1xyXG4gICAgICByZXR1cm4geC5taW51cyh5KTtcclxuICAgIH1cclxuXHJcbiAgICB4ZCA9IHguZDtcclxuICAgIHlkID0geS5kO1xyXG4gICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcclxuICAgIHJtID0gQ3Rvci5yb3VuZGluZztcclxuXHJcbiAgICAvLyBJZiBlaXRoZXIgaXMgemVyby4uLlxyXG4gICAgaWYgKCF4ZFswXSB8fCAheWRbMF0pIHtcclxuXHJcbiAgICAgIC8vIFJldHVybiB4IGlmIHkgaXMgemVyby5cclxuICAgICAgLy8gUmV0dXJuIHkgaWYgeSBpcyBub24temVyby5cclxuICAgICAgaWYgKCF5ZFswXSkgeSA9IG5ldyBDdG9yKHgpO1xyXG5cclxuICAgICAgcmV0dXJuIGV4dGVybmFsID8gZmluYWxpc2UoeSwgcHIsIHJtKSA6IHk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8geCBhbmQgeSBhcmUgZmluaXRlLCBub24temVybyBudW1iZXJzIHdpdGggdGhlIHNhbWUgc2lnbi5cclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgYmFzZSAxZTcgZXhwb25lbnRzLlxyXG4gICAgayA9IG1hdGhmbG9vcih4LmUgLyBMT0dfQkFTRSk7XHJcbiAgICBlID0gbWF0aGZsb29yKHkuZSAvIExPR19CQVNFKTtcclxuXHJcbiAgICB4ZCA9IHhkLnNsaWNlKCk7XHJcbiAgICBpID0gayAtIGU7XHJcblxyXG4gICAgLy8gSWYgYmFzZSAxZTcgZXhwb25lbnRzIGRpZmZlci4uLlxyXG4gICAgaWYgKGkpIHtcclxuXHJcbiAgICAgIGlmIChpIDwgMCkge1xyXG4gICAgICAgIGQgPSB4ZDtcclxuICAgICAgICBpID0gLWk7XHJcbiAgICAgICAgbGVuID0geWQubGVuZ3RoO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGQgPSB5ZDtcclxuICAgICAgICBlID0gaztcclxuICAgICAgICBsZW4gPSB4ZC5sZW5ndGg7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIExpbWl0IG51bWJlciBvZiB6ZXJvcyBwcmVwZW5kZWQgdG8gbWF4KGNlaWwocHIgLyBMT0dfQkFTRSksIGxlbikgKyAxLlxyXG4gICAgICBrID0gTWF0aC5jZWlsKHByIC8gTE9HX0JBU0UpO1xyXG4gICAgICBsZW4gPSBrID4gbGVuID8gayArIDEgOiBsZW4gKyAxO1xyXG5cclxuICAgICAgaWYgKGkgPiBsZW4pIHtcclxuICAgICAgICBpID0gbGVuO1xyXG4gICAgICAgIGQubGVuZ3RoID0gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuIE5vdGU6IEZhc3RlciB0byB1c2UgcmV2ZXJzZSB0aGVuIGRvIHVuc2hpZnRzLlxyXG4gICAgICBkLnJldmVyc2UoKTtcclxuICAgICAgZm9yICg7IGktLTspIGQucHVzaCgwKTtcclxuICAgICAgZC5yZXZlcnNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGVuID0geGQubGVuZ3RoO1xyXG4gICAgaSA9IHlkLmxlbmd0aDtcclxuXHJcbiAgICAvLyBJZiB5ZCBpcyBsb25nZXIgdGhhbiB4ZCwgc3dhcCB4ZCBhbmQgeWQgc28geGQgcG9pbnRzIHRvIHRoZSBsb25nZXIgYXJyYXkuXHJcbiAgICBpZiAobGVuIC0gaSA8IDApIHtcclxuICAgICAgaSA9IGxlbjtcclxuICAgICAgZCA9IHlkO1xyXG4gICAgICB5ZCA9IHhkO1xyXG4gICAgICB4ZCA9IGQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT25seSBzdGFydCBhZGRpbmcgYXQgeWQubGVuZ3RoIC0gMSBhcyB0aGUgZnVydGhlciBkaWdpdHMgb2YgeGQgY2FuIGJlIGxlZnQgYXMgdGhleSBhcmUuXHJcbiAgICBmb3IgKGNhcnJ5ID0gMDsgaTspIHtcclxuICAgICAgY2FycnkgPSAoeGRbLS1pXSA9IHhkW2ldICsgeWRbaV0gKyBjYXJyeSkgLyBCQVNFIHwgMDtcclxuICAgICAgeGRbaV0gJT0gQkFTRTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY2FycnkpIHtcclxuICAgICAgeGQudW5zaGlmdChjYXJyeSk7XHJcbiAgICAgICsrZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciB6ZXJvLCBhcyAreCArICt5ICE9IDAgJiYgLXggKyAteSAhPSAwXHJcbiAgICBmb3IgKGxlbiA9IHhkLmxlbmd0aDsgeGRbLS1sZW5dID09IDA7KSB4ZC5wb3AoKTtcclxuXHJcbiAgICB5LmQgPSB4ZDtcclxuICAgIHkuZSA9IGdldEJhc2UxMEV4cG9uZW50KHhkLCBlKTtcclxuXHJcbiAgICByZXR1cm4gZXh0ZXJuYWwgPyBmaW5hbGlzZSh5LCBwciwgcm0pIDogeTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBkaWdpdHMgb2YgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbC5cclxuICAgKlxyXG4gICAqIFt6XSB7Ym9vbGVhbnxudW1iZXJ9IFdoZXRoZXIgdG8gY291bnQgaW50ZWdlci1wYXJ0IHRyYWlsaW5nIHplcm9zOiB0cnVlLCBmYWxzZSwgMSBvciAwLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5wcmVjaXNpb24gPSBQLnNkID0gZnVuY3Rpb24gKHopIHtcclxuICAgIHZhciBrLFxyXG4gICAgICB4ID0gdGhpcztcclxuXHJcbiAgICBpZiAoeiAhPT0gdm9pZCAwICYmIHogIT09ICEheiAmJiB6ICE9PSAxICYmIHogIT09IDApIHRocm93IEVycm9yKGludmFsaWRBcmd1bWVudCArIHopO1xyXG5cclxuICAgIGlmICh4LmQpIHtcclxuICAgICAgayA9IGdldFByZWNpc2lvbih4LmQpO1xyXG4gICAgICBpZiAoeiAmJiB4LmUgKyAxID4gaykgayA9IHguZSArIDE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBrID0gTmFOO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBrO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgcm91bmRlZCB0byBhIHdob2xlIG51bWJlciB1c2luZ1xyXG4gICAqIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAucm91bmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIHJldHVybiBmaW5hbGlzZShuZXcgQ3Rvcih4KSwgeC5lICsgMSwgQ3Rvci5yb3VuZGluZyk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHNpbmUgb2YgdGhlIHZhbHVlIGluIHJhZGlhbnMgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cclxuICAgKiBSYW5nZTogWy0xLCAxXVxyXG4gICAqXHJcbiAgICogc2luKHgpID0geCAtIHheMy8zISArIHheNS81ISAtIC4uLlxyXG4gICAqXHJcbiAgICogc2luKDApICAgICAgICAgPSAwXHJcbiAgICogc2luKC0wKSAgICAgICAgPSAtMFxyXG4gICAqIHNpbihJbmZpbml0eSkgID0gTmFOXHJcbiAgICogc2luKC1JbmZpbml0eSkgPSBOYU5cclxuICAgKiBzaW4oTmFOKSAgICAgICA9IE5hTlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5zaW5lID0gUC5zaW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgcHIsIHJtLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgaWYgKCF4LmlzRmluaXRlKCkpIHJldHVybiBuZXcgQ3RvcihOYU4pO1xyXG4gICAgaWYgKHguaXNaZXJvKCkpIHJldHVybiBuZXcgQ3Rvcih4KTtcclxuXHJcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwciArIE1hdGgubWF4KHguZSwgeC5zZCgpKSArIExPR19CQVNFO1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XHJcblxyXG4gICAgeCA9IHNpbmUoQ3RvciwgdG9MZXNzVGhhbkhhbGZQaShDdG9yLCB4KSk7XHJcblxyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcclxuXHJcbiAgICByZXR1cm4gZmluYWxpc2UocXVhZHJhbnQgPiAyID8geC5uZWcoKSA6IHgsIHByLCBybSwgdHJ1ZSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoaXMgRGVjaW1hbCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiAgc3FydCgtbikgPSAgTlxyXG4gICAqICBzcXJ0KE4pICA9ICBOXHJcbiAgICogIHNxcnQoLUkpID0gIE5cclxuICAgKiAgc3FydChJKSAgPSAgSVxyXG4gICAqICBzcXJ0KDApICA9ICAwXHJcbiAgICogIHNxcnQoLTApID0gLTBcclxuICAgKlxyXG4gICAqL1xyXG4gIFAuc3F1YXJlUm9vdCA9IFAuc3FydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBtLCBuLCBzZCwgciwgcmVwLCB0LFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgZCA9IHguZCxcclxuICAgICAgZSA9IHguZSxcclxuICAgICAgcyA9IHgucyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgLy8gTmVnYXRpdmUvTmFOL0luZmluaXR5L3plcm8/XHJcbiAgICBpZiAocyAhPT0gMSB8fCAhZCB8fCAhZFswXSkge1xyXG4gICAgICByZXR1cm4gbmV3IEN0b3IoIXMgfHwgcyA8IDAgJiYgKCFkIHx8IGRbMF0pID8gTmFOIDogZCA/IHggOiAxIC8gMCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXh0ZXJuYWwgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBJbml0aWFsIGVzdGltYXRlLlxyXG4gICAgcyA9IE1hdGguc3FydCgreCk7XHJcblxyXG4gICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgIC8vIFBhc3MgeCB0byBNYXRoLnNxcnQgYXMgaW50ZWdlciwgdGhlbiBhZGp1c3QgdGhlIGV4cG9uZW50IG9mIHRoZSByZXN1bHQuXHJcbiAgICBpZiAocyA9PSAwIHx8IHMgPT0gMSAvIDApIHtcclxuICAgICAgbiA9IGRpZ2l0c1RvU3RyaW5nKGQpO1xyXG5cclxuICAgICAgaWYgKChuLmxlbmd0aCArIGUpICUgMiA9PSAwKSBuICs9ICcwJztcclxuICAgICAgcyA9IE1hdGguc3FydChuKTtcclxuICAgICAgZSA9IG1hdGhmbG9vcigoZSArIDEpIC8gMikgLSAoZSA8IDAgfHwgZSAlIDIpO1xyXG5cclxuICAgICAgaWYgKHMgPT0gMSAvIDApIHtcclxuICAgICAgICBuID0gJzVlJyArIGU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbiA9IHMudG9FeHBvbmVudGlhbCgpO1xyXG4gICAgICAgIG4gPSBuLnNsaWNlKDAsIG4uaW5kZXhPZignZScpICsgMSkgKyBlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByID0gbmV3IEN0b3Iobik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByID0gbmV3IEN0b3Iocy50b1N0cmluZygpKTtcclxuICAgIH1cclxuXHJcbiAgICBzZCA9IChlID0gQ3Rvci5wcmVjaXNpb24pICsgMztcclxuXHJcbiAgICAvLyBOZXd0b24tUmFwaHNvbiBpdGVyYXRpb24uXHJcbiAgICBmb3IgKDs7KSB7XHJcbiAgICAgIHQgPSByO1xyXG4gICAgICByID0gdC5wbHVzKGRpdmlkZSh4LCB0LCBzZCArIDIsIDEpKS50aW1lcygwLjUpO1xyXG5cclxuICAgICAgLy8gVE9ETz8gUmVwbGFjZSB3aXRoIGZvci1sb29wIGFuZCBjaGVja1JvdW5kaW5nRGlnaXRzLlxyXG4gICAgICBpZiAoZGlnaXRzVG9TdHJpbmcodC5kKS5zbGljZSgwLCBzZCkgPT09IChuID0gZGlnaXRzVG9TdHJpbmcoci5kKSkuc2xpY2UoMCwgc2QpKSB7XHJcbiAgICAgICAgbiA9IG4uc2xpY2Uoc2QgLSAzLCBzZCArIDEpO1xyXG5cclxuICAgICAgICAvLyBUaGUgNHRoIHJvdW5kaW5nIGRpZ2l0IG1heSBiZSBpbiBlcnJvciBieSAtMSBzbyBpZiB0aGUgNCByb3VuZGluZyBkaWdpdHMgYXJlIDk5OTkgb3JcclxuICAgICAgICAvLyA0OTk5LCBpLmUuIGFwcHJvYWNoaW5nIGEgcm91bmRpbmcgYm91bmRhcnksIGNvbnRpbnVlIHRoZSBpdGVyYXRpb24uXHJcbiAgICAgICAgaWYgKG4gPT0gJzk5OTknIHx8ICFyZXAgJiYgbiA9PSAnNDk5OScpIHtcclxuXHJcbiAgICAgICAgICAvLyBPbiB0aGUgZmlyc3QgaXRlcmF0aW9uIG9ubHksIGNoZWNrIHRvIHNlZSBpZiByb3VuZGluZyB1cCBnaXZlcyB0aGUgZXhhY3QgcmVzdWx0IGFzIHRoZVxyXG4gICAgICAgICAgLy8gbmluZXMgbWF5IGluZmluaXRlbHkgcmVwZWF0LlxyXG4gICAgICAgICAgaWYgKCFyZXApIHtcclxuICAgICAgICAgICAgZmluYWxpc2UodCwgZSArIDEsIDApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHQudGltZXModCkuZXEoeCkpIHtcclxuICAgICAgICAgICAgICByID0gdDtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHNkICs9IDQ7XHJcbiAgICAgICAgICByZXAgPSAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gSWYgdGhlIHJvdW5kaW5nIGRpZ2l0cyBhcmUgbnVsbCwgMHswLDR9IG9yIDUwezAsM30sIGNoZWNrIGZvciBhbiBleGFjdCByZXN1bHQuXHJcbiAgICAgICAgICAvLyBJZiBub3QsIHRoZW4gdGhlcmUgYXJlIGZ1cnRoZXIgZGlnaXRzIGFuZCBtIHdpbGwgYmUgdHJ1dGh5LlxyXG4gICAgICAgICAgaWYgKCErbiB8fCAhK24uc2xpY2UoMSkgJiYgbi5jaGFyQXQoMCkgPT0gJzUnKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUcnVuY2F0ZSB0byB0aGUgZmlyc3Qgcm91bmRpbmcgZGlnaXQuXHJcbiAgICAgICAgICAgIGZpbmFsaXNlKHIsIGUgKyAxLCAxKTtcclxuICAgICAgICAgICAgbSA9ICFyLnRpbWVzKHIpLmVxKHgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4dGVybmFsID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gZmluYWxpc2UociwgZSwgQ3Rvci5yb3VuZGluZywgbSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHRhbmdlbnQgb2YgdGhlIHZhbHVlIGluIHJhZGlhbnMgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cclxuICAgKiBSYW5nZTogWy1JbmZpbml0eSwgSW5maW5pdHldXHJcbiAgICpcclxuICAgKiB0YW4oMCkgICAgICAgICA9IDBcclxuICAgKiB0YW4oLTApICAgICAgICA9IC0wXHJcbiAgICogdGFuKEluZmluaXR5KSAgPSBOYU5cclxuICAgKiB0YW4oLUluZmluaXR5KSA9IE5hTlxyXG4gICAqIHRhbihOYU4pICAgICAgID0gTmFOXHJcbiAgICpcclxuICAgKi9cclxuICBQLnRhbmdlbnQgPSBQLnRhbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBwciwgcm0sXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5ldyBDdG9yKE5hTik7XHJcbiAgICBpZiAoeC5pc1plcm8oKSkgcmV0dXJuIG5ldyBDdG9yKHgpO1xyXG5cclxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgMTA7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcclxuXHJcbiAgICB4ID0geC5zaW4oKTtcclxuICAgIHgucyA9IDE7XHJcbiAgICB4ID0gZGl2aWRlKHgsIG5ldyBDdG9yKDEpLm1pbnVzKHgudGltZXMoeCkpLnNxcnQoKSwgcHIgKyAxMCwgMCk7XHJcblxyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcclxuXHJcbiAgICByZXR1cm4gZmluYWxpc2UocXVhZHJhbnQgPT0gMiB8fCBxdWFkcmFudCA9PSA0ID8geC5uZWcoKSA6IHgsIHByLCBybSwgdHJ1ZSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogIG4gKiAwID0gMFxyXG4gICAqICBuICogTiA9IE5cclxuICAgKiAgbiAqIEkgPSBJXHJcbiAgICogIDAgKiBuID0gMFxyXG4gICAqICAwICogMCA9IDBcclxuICAgKiAgMCAqIE4gPSBOXHJcbiAgICogIDAgKiBJID0gTlxyXG4gICAqICBOICogbiA9IE5cclxuICAgKiAgTiAqIDAgPSBOXHJcbiAgICogIE4gKiBOID0gTlxyXG4gICAqICBOICogSSA9IE5cclxuICAgKiAgSSAqIG4gPSBJXHJcbiAgICogIEkgKiAwID0gTlxyXG4gICAqICBJICogTiA9IE5cclxuICAgKiAgSSAqIEkgPSBJXHJcbiAgICpcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGlzIERlY2ltYWwgdGltZXMgYHlgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50XHJcbiAgICogZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAudGltZXMgPSBQLm11bCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICB2YXIgY2FycnksIGUsIGksIGssIHIsIHJMLCB0LCB4ZEwsIHlkTCxcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICB4ZCA9IHguZCxcclxuICAgICAgeWQgPSAoeSA9IG5ldyBDdG9yKHkpKS5kO1xyXG5cclxuICAgIHkucyAqPSB4LnM7XHJcblxyXG4gICAgIC8vIElmIGVpdGhlciBpcyBOYU4sIMKxSW5maW5pdHkgb3IgwrEwLi4uXHJcbiAgICBpZiAoIXhkIHx8ICF4ZFswXSB8fCAheWQgfHwgIXlkWzBdKSB7XHJcblxyXG4gICAgICByZXR1cm4gbmV3IEN0b3IoIXkucyB8fCB4ZCAmJiAheGRbMF0gJiYgIXlkIHx8IHlkICYmICF5ZFswXSAmJiAheGRcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIE5hTiBpZiBlaXRoZXIgaXMgTmFOLlxyXG4gICAgICAgIC8vIFJldHVybiBOYU4gaWYgeCBpcyDCsTAgYW5kIHkgaXMgwrFJbmZpbml0eSwgb3IgeSBpcyDCsTAgYW5kIHggaXMgwrFJbmZpbml0eS5cclxuICAgICAgICA/IE5hTlxyXG5cclxuICAgICAgICAvLyBSZXR1cm4gwrFJbmZpbml0eSBpZiBlaXRoZXIgaXMgwrFJbmZpbml0eS5cclxuICAgICAgICAvLyBSZXR1cm4gwrEwIGlmIGVpdGhlciBpcyDCsTAuXHJcbiAgICAgICAgOiAheGQgfHwgIXlkID8geS5zIC8gMCA6IHkucyAqIDApO1xyXG4gICAgfVxyXG5cclxuICAgIGUgPSBtYXRoZmxvb3IoeC5lIC8gTE9HX0JBU0UpICsgbWF0aGZsb29yKHkuZSAvIExPR19CQVNFKTtcclxuICAgIHhkTCA9IHhkLmxlbmd0aDtcclxuICAgIHlkTCA9IHlkLmxlbmd0aDtcclxuXHJcbiAgICAvLyBFbnN1cmUgeGQgcG9pbnRzIHRvIHRoZSBsb25nZXIgYXJyYXkuXHJcbiAgICBpZiAoeGRMIDwgeWRMKSB7XHJcbiAgICAgIHIgPSB4ZDtcclxuICAgICAgeGQgPSB5ZDtcclxuICAgICAgeWQgPSByO1xyXG4gICAgICByTCA9IHhkTDtcclxuICAgICAgeGRMID0geWRMO1xyXG4gICAgICB5ZEwgPSByTDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJbml0aWFsaXNlIHRoZSByZXN1bHQgYXJyYXkgd2l0aCB6ZXJvcy5cclxuICAgIHIgPSBbXTtcclxuICAgIHJMID0geGRMICsgeWRMO1xyXG4gICAgZm9yIChpID0gckw7IGktLTspIHIucHVzaCgwKTtcclxuXHJcbiAgICAvLyBNdWx0aXBseSFcclxuICAgIGZvciAoaSA9IHlkTDsgLS1pID49IDA7KSB7XHJcbiAgICAgIGNhcnJ5ID0gMDtcclxuICAgICAgZm9yIChrID0geGRMICsgaTsgayA+IGk7KSB7XHJcbiAgICAgICAgdCA9IHJba10gKyB5ZFtpXSAqIHhkW2sgLSBpIC0gMV0gKyBjYXJyeTtcclxuICAgICAgICByW2stLV0gPSB0ICUgQkFTRSB8IDA7XHJcbiAgICAgICAgY2FycnkgPSB0IC8gQkFTRSB8IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJba10gPSAocltrXSArIGNhcnJ5KSAlIEJBU0UgfCAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgIGZvciAoOyAhclstLXJMXTspIHIucG9wKCk7XHJcblxyXG4gICAgaWYgKGNhcnJ5KSArK2U7XHJcbiAgICBlbHNlIHIuc2hpZnQoKTtcclxuXHJcbiAgICB5LmQgPSByO1xyXG4gICAgeS5lID0gZ2V0QmFzZTEwRXhwb25lbnQociwgZSk7XHJcblxyXG4gICAgcmV0dXJuIGV4dGVybmFsID8gZmluYWxpc2UoeSwgQ3Rvci5wcmVjaXNpb24sIEN0b3Iucm91bmRpbmcpIDogeTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaW4gYmFzZSAyLCByb3VuZCB0byBgc2RgIHNpZ25pZmljYW50XHJcbiAgICogZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJtYC5cclxuICAgKlxyXG4gICAqIElmIHRoZSBvcHRpb25hbCBgc2RgIGFyZ3VtZW50IGlzIHByZXNlbnQgdGhlbiByZXR1cm4gYmluYXJ5IGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAqXHJcbiAgICogW3NkXSB7bnVtYmVyfSBTaWduaWZpY2FudCBkaWdpdHMuIEludGVnZXIsIDEgdG8gTUFYX0RJR0lUUyBpbmNsdXNpdmUuXHJcbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC50b0JpbmFyeSA9IGZ1bmN0aW9uIChzZCwgcm0pIHtcclxuICAgIHJldHVybiB0b1N0cmluZ0JpbmFyeSh0aGlzLCAyLCBzZCwgcm0pO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgcm91bmRlZCB0byBhIG1heGltdW0gb2YgYGRwYFxyXG4gICAqIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJtYCBvciBgcm91bmRpbmdgIGlmIGBybWAgaXMgb21pdHRlZC5cclxuICAgKlxyXG4gICAqIElmIGBkcGAgaXMgb21pdHRlZCwgcmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbC5cclxuICAgKlxyXG4gICAqIFtkcF0ge251bWJlcn0gRGVjaW1hbCBwbGFjZXMuIEludGVnZXIsIDAgdG8gTUFYX0RJR0lUUyBpbmNsdXNpdmUuXHJcbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC50b0RlY2ltYWxQbGFjZXMgPSBQLnRvRFAgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIHggPSBuZXcgQ3Rvcih4KTtcclxuICAgIGlmIChkcCA9PT0gdm9pZCAwKSByZXR1cm4geDtcclxuXHJcbiAgICBjaGVja0ludDMyKGRwLCAwLCBNQVhfRElHSVRTKTtcclxuXHJcbiAgICBpZiAocm0gPT09IHZvaWQgMCkgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgZWxzZSBjaGVja0ludDMyKHJtLCAwLCA4KTtcclxuXHJcbiAgICByZXR1cm4gZmluYWxpc2UoeCwgZHAgKyB4LmUgKyAxLCBybSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGluIGV4cG9uZW50aWFsIG5vdGF0aW9uIHJvdW5kZWQgdG9cclxuICAgKiBgZHBgIGZpeGVkIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIFtkcF0ge251bWJlcn0gRGVjaW1hbCBwbGFjZXMuIEludGVnZXIsIDAgdG8gTUFYX0RJR0lUUyBpbmNsdXNpdmUuXHJcbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC50b0V4cG9uZW50aWFsID0gZnVuY3Rpb24gKGRwLCBybSkge1xyXG4gICAgdmFyIHN0cixcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIGlmIChkcCA9PT0gdm9pZCAwKSB7XHJcbiAgICAgIHN0ciA9IGZpbml0ZVRvU3RyaW5nKHgsIHRydWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY2hlY2tJbnQzMihkcCwgMCwgTUFYX0RJR0lUUyk7XHJcblxyXG4gICAgICBpZiAocm0gPT09IHZvaWQgMCkgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgICBlbHNlIGNoZWNrSW50MzIocm0sIDAsIDgpO1xyXG5cclxuICAgICAgeCA9IGZpbmFsaXNlKG5ldyBDdG9yKHgpLCBkcCArIDEsIHJtKTtcclxuICAgICAgc3RyID0gZmluaXRlVG9TdHJpbmcoeCwgdHJ1ZSwgZHAgKyAxKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4geC5pc05lZygpICYmICF4LmlzWmVybygpID8gJy0nICsgc3RyIDogc3RyO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpbiBub3JtYWwgKGZpeGVkLXBvaW50KSBub3RhdGlvbiB0b1xyXG4gICAqIGBkcGAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm1gIG9yIGByb3VuZGluZ2AgaWYgYHJtYCBpc1xyXG4gICAqIG9taXR0ZWQuXHJcbiAgICpcclxuICAgKiBBcyB3aXRoIEphdmFTY3JpcHQgbnVtYmVycywgKC0wKS50b0ZpeGVkKDApIGlzICcwJywgYnV0IGUuZy4gKC0wLjAwMDAxKS50b0ZpeGVkKDApIGlzICctMCcuXHJcbiAgICpcclxuICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWF9ESUdJVFMgaW5jbHVzaXZlLlxyXG4gICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgKlxyXG4gICAqICgtMCkudG9GaXhlZCgwKSBpcyAnMCcsIGJ1dCAoLTAuMSkudG9GaXhlZCgwKSBpcyAnLTAnLlxyXG4gICAqICgtMCkudG9GaXhlZCgxKSBpcyAnMC4wJywgYnV0ICgtMC4wMSkudG9GaXhlZCgxKSBpcyAnLTAuMCcuXHJcbiAgICogKC0wKS50b0ZpeGVkKDMpIGlzICcwLjAwMCcuXHJcbiAgICogKC0wLjUpLnRvRml4ZWQoMCkgaXMgJy0wJy5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAudG9GaXhlZCA9IGZ1bmN0aW9uIChkcCwgcm0pIHtcclxuICAgIHZhciBzdHIsIHksXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoZHAgPT09IHZvaWQgMCkge1xyXG4gICAgICBzdHIgPSBmaW5pdGVUb1N0cmluZyh4KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNoZWNrSW50MzIoZHAsIDAsIE1BWF9ESUdJVFMpO1xyXG5cclxuICAgICAgaWYgKHJtID09PSB2b2lkIDApIHJtID0gQ3Rvci5yb3VuZGluZztcclxuICAgICAgZWxzZSBjaGVja0ludDMyKHJtLCAwLCA4KTtcclxuXHJcbiAgICAgIHkgPSBmaW5hbGlzZShuZXcgQ3Rvcih4KSwgZHAgKyB4LmUgKyAxLCBybSk7XHJcbiAgICAgIHN0ciA9IGZpbml0ZVRvU3RyaW5nKHksIGZhbHNlLCBkcCArIHkuZSArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRvIGRldGVybWluZSB3aGV0aGVyIHRvIGFkZCB0aGUgbWludXMgc2lnbiBsb29rIGF0IHRoZSB2YWx1ZSBiZWZvcmUgaXQgd2FzIHJvdW5kZWQsXHJcbiAgICAvLyBpLmUuIGxvb2sgYXQgYHhgIHJhdGhlciB0aGFuIGB5YC5cclxuICAgIHJldHVybiB4LmlzTmVnKCkgJiYgIXguaXNaZXJvKCkgPyAnLScgKyBzdHIgOiBzdHI7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGFuIGFycmF5IHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGFzIGEgc2ltcGxlIGZyYWN0aW9uIHdpdGggYW4gaW50ZWdlclxyXG4gICAqIG51bWVyYXRvciBhbmQgYW4gaW50ZWdlciBkZW5vbWluYXRvci5cclxuICAgKlxyXG4gICAqIFRoZSBkZW5vbWluYXRvciB3aWxsIGJlIGEgcG9zaXRpdmUgbm9uLXplcm8gdmFsdWUgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBzcGVjaWZpZWQgbWF4aW11bVxyXG4gICAqIGRlbm9taW5hdG9yLiBJZiBhIG1heGltdW0gZGVub21pbmF0b3IgaXMgbm90IHNwZWNpZmllZCwgdGhlIGRlbm9taW5hdG9yIHdpbGwgYmUgdGhlIGxvd2VzdFxyXG4gICAqIHZhbHVlIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIG51bWJlciBleGFjdGx5LlxyXG4gICAqXHJcbiAgICogW21heERdIHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IE1heGltdW0gZGVub21pbmF0b3IuIEludGVnZXIgPj0gMSBhbmQgPCBJbmZpbml0eS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAudG9GcmFjdGlvbiA9IGZ1bmN0aW9uIChtYXhEKSB7XHJcbiAgICB2YXIgZCwgZDAsIGQxLCBkMiwgZSwgaywgbiwgbjAsIG4xLCBwciwgcSwgcixcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIHhkID0geC5kLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoIXhkKSByZXR1cm4gbmV3IEN0b3IoeCk7XHJcblxyXG4gICAgbjEgPSBkMCA9IG5ldyBDdG9yKDEpO1xyXG4gICAgZDEgPSBuMCA9IG5ldyBDdG9yKDApO1xyXG5cclxuICAgIGQgPSBuZXcgQ3RvcihkMSk7XHJcbiAgICBlID0gZC5lID0gZ2V0UHJlY2lzaW9uKHhkKSAtIHguZSAtIDE7XHJcbiAgICBrID0gZSAlIExPR19CQVNFO1xyXG4gICAgZC5kWzBdID0gbWF0aHBvdygxMCwgayA8IDAgPyBMT0dfQkFTRSArIGsgOiBrKTtcclxuXHJcbiAgICBpZiAobWF4RCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAvLyBkIGlzIDEwKiplLCB0aGUgbWluaW11bSBtYXgtZGVub21pbmF0b3IgbmVlZGVkLlxyXG4gICAgICBtYXhEID0gZSA+IDAgPyBkIDogbjE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBuID0gbmV3IEN0b3IobWF4RCk7XHJcbiAgICAgIGlmICghbi5pc0ludCgpIHx8IG4ubHQobjEpKSB0aHJvdyBFcnJvcihpbnZhbGlkQXJndW1lbnQgKyBuKTtcclxuICAgICAgbWF4RCA9IG4uZ3QoZCkgPyAoZSA+IDAgPyBkIDogbjEpIDogbjtcclxuICAgIH1cclxuXHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG4gICAgbiA9IG5ldyBDdG9yKGRpZ2l0c1RvU3RyaW5nKHhkKSk7XHJcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBlID0geGQubGVuZ3RoICogTE9HX0JBU0UgKiAyO1xyXG5cclxuICAgIGZvciAoOzspICB7XHJcbiAgICAgIHEgPSBkaXZpZGUobiwgZCwgMCwgMSwgMSk7XHJcbiAgICAgIGQyID0gZDAucGx1cyhxLnRpbWVzKGQxKSk7XHJcbiAgICAgIGlmIChkMi5jbXAobWF4RCkgPT0gMSkgYnJlYWs7XHJcbiAgICAgIGQwID0gZDE7XHJcbiAgICAgIGQxID0gZDI7XHJcbiAgICAgIGQyID0gbjE7XHJcbiAgICAgIG4xID0gbjAucGx1cyhxLnRpbWVzKGQyKSk7XHJcbiAgICAgIG4wID0gZDI7XHJcbiAgICAgIGQyID0gZDtcclxuICAgICAgZCA9IG4ubWludXMocS50aW1lcyhkMikpO1xyXG4gICAgICBuID0gZDI7XHJcbiAgICB9XHJcblxyXG4gICAgZDIgPSBkaXZpZGUobWF4RC5taW51cyhkMCksIGQxLCAwLCAxLCAxKTtcclxuICAgIG4wID0gbjAucGx1cyhkMi50aW1lcyhuMSkpO1xyXG4gICAgZDAgPSBkMC5wbHVzKGQyLnRpbWVzKGQxKSk7XHJcbiAgICBuMC5zID0gbjEucyA9IHgucztcclxuXHJcbiAgICAvLyBEZXRlcm1pbmUgd2hpY2ggZnJhY3Rpb24gaXMgY2xvc2VyIHRvIHgsIG4wL2QwIG9yIG4xL2QxP1xyXG4gICAgciA9IGRpdmlkZShuMSwgZDEsIGUsIDEpLm1pbnVzKHgpLmFicygpLmNtcChkaXZpZGUobjAsIGQwLCBlLCAxKS5taW51cyh4KS5hYnMoKSkgPCAxXHJcbiAgICAgICAgPyBbbjEsIGQxXSA6IFtuMCwgZDBdO1xyXG5cclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHI7XHJcbiAgICBleHRlcm5hbCA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIHI7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGluIGJhc2UgMTYsIHJvdW5kIHRvIGBzZGAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm1gLlxyXG4gICAqXHJcbiAgICogSWYgdGhlIG9wdGlvbmFsIGBzZGAgYXJndW1lbnQgaXMgcHJlc2VudCB0aGVuIHJldHVybiBiaW5hcnkgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICpcclxuICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cclxuICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICpcclxuICAgKi9cclxuICBQLnRvSGV4YWRlY2ltYWwgPSBQLnRvSGV4ID0gZnVuY3Rpb24gKHNkLCBybSkge1xyXG4gICAgcmV0dXJuIHRvU3RyaW5nQmluYXJ5KHRoaXMsIDE2LCBzZCwgcm0pO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybnMgYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbmVhcmVzdCBtdWx0aXBsZSBvZiBgeWAgaW4gdGhlIGRpcmVjdGlvbiBvZiByb3VuZGluZ1xyXG4gICAqIG1vZGUgYHJtYCwgb3IgYERlY2ltYWwucm91bmRpbmdgIGlmIGBybWAgaXMgb21pdHRlZCwgdG8gdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbC5cclxuICAgKlxyXG4gICAqIFRoZSByZXR1cm4gdmFsdWUgd2lsbCBhbHdheXMgaGF2ZSB0aGUgc2FtZSBzaWduIGFzIHRoaXMgRGVjaW1hbCwgdW5sZXNzIGVpdGhlciB0aGlzIERlY2ltYWxcclxuICAgKiBvciBgeWAgaXMgTmFOLCBpbiB3aGljaCBjYXNlIHRoZSByZXR1cm4gdmFsdWUgd2lsbCBiZSBhbHNvIGJlIE5hTi5cclxuICAgKlxyXG4gICAqIFRoZSByZXR1cm4gdmFsdWUgaXMgbm90IGFmZmVjdGVkIGJ5IHRoZSB2YWx1ZSBvZiBgcHJlY2lzaW9uYC5cclxuICAgKlxyXG4gICAqIHkge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gVGhlIG1hZ25pdHVkZSB0byByb3VuZCB0byBhIG11bHRpcGxlIG9mLlxyXG4gICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgKlxyXG4gICAqICd0b05lYXJlc3QoKSByb3VuZGluZyBtb2RlIG5vdCBhbiBpbnRlZ2VyOiB7cm19J1xyXG4gICAqICd0b05lYXJlc3QoKSByb3VuZGluZyBtb2RlIG91dCBvZiByYW5nZToge3JtfSdcclxuICAgKlxyXG4gICAqL1xyXG4gIFAudG9OZWFyZXN0ID0gZnVuY3Rpb24gKHksIHJtKSB7XHJcbiAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIHggPSBuZXcgQ3Rvcih4KTtcclxuXHJcbiAgICBpZiAoeSA9PSBudWxsKSB7XHJcblxyXG4gICAgICAvLyBJZiB4IGlzIG5vdCBmaW5pdGUsIHJldHVybiB4LlxyXG4gICAgICBpZiAoIXguZCkgcmV0dXJuIHg7XHJcblxyXG4gICAgICB5ID0gbmV3IEN0b3IoMSk7XHJcbiAgICAgIHJtID0gQ3Rvci5yb3VuZGluZztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHkgPSBuZXcgQ3Rvcih5KTtcclxuICAgICAgaWYgKHJtID09PSB2b2lkIDApIHtcclxuICAgICAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2hlY2tJbnQzMihybSwgMCwgOCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHggaXMgbm90IGZpbml0ZSwgcmV0dXJuIHggaWYgeSBpcyBub3QgTmFOLCBlbHNlIE5hTi5cclxuICAgICAgaWYgKCF4LmQpIHJldHVybiB5LnMgPyB4IDogeTtcclxuXHJcbiAgICAgIC8vIElmIHkgaXMgbm90IGZpbml0ZSwgcmV0dXJuIEluZmluaXR5IHdpdGggdGhlIHNpZ24gb2YgeCBpZiB5IGlzIEluZmluaXR5LCBlbHNlIE5hTi5cclxuICAgICAgaWYgKCF5LmQpIHtcclxuICAgICAgICBpZiAoeS5zKSB5LnMgPSB4LnM7XHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB5IGlzIG5vdCB6ZXJvLCBjYWxjdWxhdGUgdGhlIG5lYXJlc3QgbXVsdGlwbGUgb2YgeSB0byB4LlxyXG4gICAgaWYgKHkuZFswXSkge1xyXG4gICAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG4gICAgICB4ID0gZGl2aWRlKHgsIHksIDAsIHJtLCAxKS50aW1lcyh5KTtcclxuICAgICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG4gICAgICBmaW5hbGlzZSh4KTtcclxuXHJcbiAgICAvLyBJZiB5IGlzIHplcm8sIHJldHVybiB6ZXJvIHdpdGggdGhlIHNpZ24gb2YgeC5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHkucyA9IHgucztcclxuICAgICAgeCA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHg7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgY29udmVydGVkIHRvIGEgbnVtYmVyIHByaW1pdGl2ZS5cclxuICAgKiBaZXJvIGtlZXBzIGl0cyBzaWduLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC50b051bWJlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiArdGhpcztcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaW4gYmFzZSA4LCByb3VuZCB0byBgc2RgIHNpZ25pZmljYW50XHJcbiAgICogZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJtYC5cclxuICAgKlxyXG4gICAqIElmIHRoZSBvcHRpb25hbCBgc2RgIGFyZ3VtZW50IGlzIHByZXNlbnQgdGhlbiByZXR1cm4gYmluYXJ5IGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAqXHJcbiAgICogW3NkXSB7bnVtYmVyfSBTaWduaWZpY2FudCBkaWdpdHMuIEludGVnZXIsIDEgdG8gTUFYX0RJR0lUUyBpbmNsdXNpdmUuXHJcbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC50b09jdGFsID0gZnVuY3Rpb24gKHNkLCBybSkge1xyXG4gICAgcmV0dXJuIHRvU3RyaW5nQmluYXJ5KHRoaXMsIDgsIHNkLCBybSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCByYWlzZWQgdG8gdGhlIHBvd2VyIGB5YCwgcm91bmRlZFxyXG4gICAqIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiBFQ01BU2NyaXB0IGNvbXBsaWFudC5cclxuICAgKlxyXG4gICAqICAgcG93KHgsIE5hTikgICAgICAgICAgICAgICAgICAgICAgICAgICA9IE5hTlxyXG4gICAqICAgcG93KHgsIMKxMCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAxXHJcblxyXG4gICAqICAgcG93KE5hTiwgbm9uLXplcm8pICAgICAgICAgICAgICAgICAgICA9IE5hTlxyXG4gICAqICAgcG93KGFicyh4KSA+IDEsICtJbmZpbml0eSkgICAgICAgICAgICA9ICtJbmZpbml0eVxyXG4gICAqICAgcG93KGFicyh4KSA+IDEsIC1JbmZpbml0eSkgICAgICAgICAgICA9ICswXHJcbiAgICogICBwb3coYWJzKHgpID09IDEsIMKxSW5maW5pdHkpICAgICAgICAgICA9IE5hTlxyXG4gICAqICAgcG93KGFicyh4KSA8IDEsICtJbmZpbml0eSkgICAgICAgICAgICA9ICswXHJcbiAgICogICBwb3coYWJzKHgpIDwgMSwgLUluZmluaXR5KSAgICAgICAgICAgID0gK0luZmluaXR5XHJcbiAgICogICBwb3coK0luZmluaXR5LCB5ID4gMCkgICAgICAgICAgICAgICAgID0gK0luZmluaXR5XHJcbiAgICogICBwb3coK0luZmluaXR5LCB5IDwgMCkgICAgICAgICAgICAgICAgID0gKzBcclxuICAgKiAgIHBvdygtSW5maW5pdHksIG9kZCBpbnRlZ2VyID4gMCkgICAgICAgPSAtSW5maW5pdHlcclxuICAgKiAgIHBvdygtSW5maW5pdHksIGV2ZW4gaW50ZWdlciA+IDApICAgICAgPSArSW5maW5pdHlcclxuICAgKiAgIHBvdygtSW5maW5pdHksIG9kZCBpbnRlZ2VyIDwgMCkgICAgICAgPSAtMFxyXG4gICAqICAgcG93KC1JbmZpbml0eSwgZXZlbiBpbnRlZ2VyIDwgMCkgICAgICA9ICswXHJcbiAgICogICBwb3coKzAsIHkgPiAwKSAgICAgICAgICAgICAgICAgICAgICAgID0gKzBcclxuICAgKiAgIHBvdygrMCwgeSA8IDApICAgICAgICAgICAgICAgICAgICAgICAgPSArSW5maW5pdHlcclxuICAgKiAgIHBvdygtMCwgb2RkIGludGVnZXIgPiAwKSAgICAgICAgICAgICAgPSAtMFxyXG4gICAqICAgcG93KC0wLCBldmVuIGludGVnZXIgPiAwKSAgICAgICAgICAgICA9ICswXHJcbiAgICogICBwb3coLTAsIG9kZCBpbnRlZ2VyIDwgMCkgICAgICAgICAgICAgID0gLUluZmluaXR5XHJcbiAgICogICBwb3coLTAsIGV2ZW4gaW50ZWdlciA8IDApICAgICAgICAgICAgID0gK0luZmluaXR5XHJcbiAgICogICBwb3coZmluaXRlIHggPCAwLCBmaW5pdGUgbm9uLWludGVnZXIpID0gTmFOXHJcbiAgICpcclxuICAgKiBGb3Igbm9uLWludGVnZXIgb3IgdmVyeSBsYXJnZSBleHBvbmVudHMgcG93KHgsIHkpIGlzIGNhbGN1bGF0ZWQgdXNpbmdcclxuICAgKlxyXG4gICAqICAgeF55ID0gZXhwKHkqbG4oeCkpXHJcbiAgICpcclxuICAgKiBBc3N1bWluZyB0aGUgZmlyc3QgMTUgcm91bmRpbmcgZGlnaXRzIGFyZSBlYWNoIGVxdWFsbHkgbGlrZWx5IHRvIGJlIGFueSBkaWdpdCAwLTksIHRoZVxyXG4gICAqIHByb2JhYmlsaXR5IG9mIGFuIGluY29ycmVjdGx5IHJvdW5kZWQgcmVzdWx0XHJcbiAgICogUChbNDldOXsxNH0gfCBbNTBdMHsxNH0pID0gMiAqIDAuMiAqIDEwXi0xNCA9IDRlLTE1ID0gMS8yLjVlKzE0XHJcbiAgICogaS5lLiAxIGluIDI1MCwwMDAsMDAwLDAwMCwwMDBcclxuICAgKlxyXG4gICAqIElmIGEgcmVzdWx0IGlzIGluY29ycmVjdGx5IHJvdW5kZWQgdGhlIG1heGltdW0gZXJyb3Igd2lsbCBiZSAxIHVscCAodW5pdCBpbiBsYXN0IHBsYWNlKS5cclxuICAgKlxyXG4gICAqIHkge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gVGhlIHBvd2VyIHRvIHdoaWNoIHRvIHJhaXNlIHRoaXMgRGVjaW1hbC5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAudG9Qb3dlciA9IFAucG93ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgIHZhciBlLCBrLCBwciwgciwgcm0sIHMsXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgeW4gPSArKHkgPSBuZXcgQ3Rvcih5KSk7XHJcblxyXG4gICAgLy8gRWl0aGVyIMKxSW5maW5pdHksIE5hTiBvciDCsTA/XHJcbiAgICBpZiAoIXguZCB8fCAheS5kIHx8ICF4LmRbMF0gfHwgIXkuZFswXSkgcmV0dXJuIG5ldyBDdG9yKG1hdGhwb3coK3gsIHluKSk7XHJcblxyXG4gICAgeCA9IG5ldyBDdG9yKHgpO1xyXG5cclxuICAgIGlmICh4LmVxKDEpKSByZXR1cm4geDtcclxuXHJcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG5cclxuICAgIGlmICh5LmVxKDEpKSByZXR1cm4gZmluYWxpc2UoeCwgcHIsIHJtKTtcclxuXHJcbiAgICAvLyB5IGV4cG9uZW50XHJcbiAgICBlID0gbWF0aGZsb29yKHkuZSAvIExPR19CQVNFKTtcclxuXHJcbiAgICAvLyBJZiB5IGlzIGEgc21hbGwgaW50ZWdlciB1c2UgdGhlICdleHBvbmVudGlhdGlvbiBieSBzcXVhcmluZycgYWxnb3JpdGhtLlxyXG4gICAgaWYgKGUgPj0geS5kLmxlbmd0aCAtIDEgJiYgKGsgPSB5biA8IDAgPyAteW4gOiB5bikgPD0gTUFYX1NBRkVfSU5URUdFUikge1xyXG4gICAgICByID0gaW50UG93KEN0b3IsIHgsIGssIHByKTtcclxuICAgICAgcmV0dXJuIHkucyA8IDAgPyBuZXcgQ3RvcigxKS5kaXYocikgOiBmaW5hbGlzZShyLCBwciwgcm0pO1xyXG4gICAgfVxyXG5cclxuICAgIHMgPSB4LnM7XHJcblxyXG4gICAgLy8gaWYgeCBpcyBuZWdhdGl2ZVxyXG4gICAgaWYgKHMgPCAwKSB7XHJcblxyXG4gICAgICAvLyBpZiB5IGlzIG5vdCBhbiBpbnRlZ2VyXHJcbiAgICAgIGlmIChlIDwgeS5kLmxlbmd0aCAtIDEpIHJldHVybiBuZXcgQ3RvcihOYU4pO1xyXG5cclxuICAgICAgLy8gUmVzdWx0IGlzIHBvc2l0aXZlIGlmIHggaXMgbmVnYXRpdmUgYW5kIHRoZSBsYXN0IGRpZ2l0IG9mIGludGVnZXIgeSBpcyBldmVuLlxyXG4gICAgICBpZiAoKHkuZFtlXSAmIDEpID09IDApIHMgPSAxO1xyXG5cclxuICAgICAgLy8gaWYgeC5lcSgtMSlcclxuICAgICAgaWYgKHguZSA9PSAwICYmIHguZFswXSA9PSAxICYmIHguZC5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgIHgucyA9IHM7XHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBFc3RpbWF0ZSByZXN1bHQgZXhwb25lbnQuXHJcbiAgICAvLyB4XnkgPSAxMF5lLCAgd2hlcmUgZSA9IHkgKiBsb2cxMCh4KVxyXG4gICAgLy8gbG9nMTAoeCkgPSBsb2cxMCh4X3NpZ25pZmljYW5kKSArIHhfZXhwb25lbnRcclxuICAgIC8vIGxvZzEwKHhfc2lnbmlmaWNhbmQpID0gbG4oeF9zaWduaWZpY2FuZCkgLyBsbigxMClcclxuICAgIGsgPSBtYXRocG93KCt4LCB5bik7XHJcbiAgICBlID0gayA9PSAwIHx8ICFpc0Zpbml0ZShrKVxyXG4gICAgICA/IG1hdGhmbG9vcih5biAqIChNYXRoLmxvZygnMC4nICsgZGlnaXRzVG9TdHJpbmcoeC5kKSkgLyBNYXRoLkxOMTAgKyB4LmUgKyAxKSlcclxuICAgICAgOiBuZXcgQ3RvcihrICsgJycpLmU7XHJcblxyXG4gICAgLy8gRXhwb25lbnQgZXN0aW1hdGUgbWF5IGJlIGluY29ycmVjdCBlLmcuIHg6IDAuOTk5OTk5OTk5OTk5OTk5OTk5LCB5OiAyLjI5LCBlOiAwLCByLmU6IC0xLlxyXG5cclxuICAgIC8vIE92ZXJmbG93L3VuZGVyZmxvdz9cclxuICAgIGlmIChlID4gQ3Rvci5tYXhFICsgMSB8fCBlIDwgQ3Rvci5taW5FIC0gMSkgcmV0dXJuIG5ldyBDdG9yKGUgPiAwID8gcyAvIDAgOiAwKTtcclxuXHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IHgucyA9IDE7XHJcblxyXG4gICAgLy8gRXN0aW1hdGUgdGhlIGV4dHJhIGd1YXJkIGRpZ2l0cyBuZWVkZWQgdG8gZW5zdXJlIGZpdmUgY29ycmVjdCByb3VuZGluZyBkaWdpdHMgZnJvbVxyXG4gICAgLy8gbmF0dXJhbExvZ2FyaXRobSh4KS4gRXhhbXBsZSBvZiBmYWlsdXJlIHdpdGhvdXQgdGhlc2UgZXh0cmEgZGlnaXRzIChwcmVjaXNpb246IDEwKTpcclxuICAgIC8vIG5ldyBEZWNpbWFsKDIuMzI0NTYpLnBvdygnMjA4Nzk4NzQzNjUzNDU2Ni40NjQxMScpXHJcbiAgICAvLyBzaG91bGQgYmUgMS4xNjIzNzc4MjNlKzc2NDkxNDkwNTE3MzgxNSwgYnV0IGlzIDEuMTYyMzU1ODIzZSs3NjQ5MTQ5MDUxNzM4MTVcclxuICAgIGsgPSBNYXRoLm1pbigxMiwgKGUgKyAnJykubGVuZ3RoKTtcclxuXHJcbiAgICAvLyByID0geF55ID0gZXhwKHkqbG4oeCkpXHJcbiAgICByID0gbmF0dXJhbEV4cG9uZW50aWFsKHkudGltZXMobmF0dXJhbExvZ2FyaXRobSh4LCBwciArIGspKSwgcHIpO1xyXG5cclxuICAgIC8vIHIgbWF5IGJlIEluZmluaXR5LCBlLmcuICgwLjk5OTk5OTk5OTk5OTk5OTkpLnBvdygtMWUrNDApXHJcbiAgICBpZiAoci5kKSB7XHJcblxyXG4gICAgICAvLyBUcnVuY2F0ZSB0byB0aGUgcmVxdWlyZWQgcHJlY2lzaW9uIHBsdXMgZml2ZSByb3VuZGluZyBkaWdpdHMuXHJcbiAgICAgIHIgPSBmaW5hbGlzZShyLCBwciArIDUsIDEpO1xyXG5cclxuICAgICAgLy8gSWYgdGhlIHJvdW5kaW5nIGRpZ2l0cyBhcmUgWzQ5XTk5OTkgb3IgWzUwXTAwMDAgaW5jcmVhc2UgdGhlIHByZWNpc2lvbiBieSAxMCBhbmQgcmVjYWxjdWxhdGVcclxuICAgICAgLy8gdGhlIHJlc3VsdC5cclxuICAgICAgaWYgKGNoZWNrUm91bmRpbmdEaWdpdHMoci5kLCBwciwgcm0pKSB7XHJcbiAgICAgICAgZSA9IHByICsgMTA7XHJcblxyXG4gICAgICAgIC8vIFRydW5jYXRlIHRvIHRoZSBpbmNyZWFzZWQgcHJlY2lzaW9uIHBsdXMgZml2ZSByb3VuZGluZyBkaWdpdHMuXHJcbiAgICAgICAgciA9IGZpbmFsaXNlKG5hdHVyYWxFeHBvbmVudGlhbCh5LnRpbWVzKG5hdHVyYWxMb2dhcml0aG0oeCwgZSArIGspKSwgZSksIGUgKyA1LCAxKTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIDE0IG5pbmVzIGZyb20gdGhlIDJuZCByb3VuZGluZyBkaWdpdCAodGhlIGZpcnN0IHJvdW5kaW5nIGRpZ2l0IG1heSBiZSA0IG9yIDkpLlxyXG4gICAgICAgIGlmICgrZGlnaXRzVG9TdHJpbmcoci5kKS5zbGljZShwciArIDEsIHByICsgMTUpICsgMSA9PSAxZTE0KSB7XHJcbiAgICAgICAgICByID0gZmluYWxpc2UociwgcHIgKyAxLCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByLnMgPSBzO1xyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IHJtO1xyXG5cclxuICAgIHJldHVybiBmaW5hbGlzZShyLCBwciwgcm0pO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCByb3VuZGVkIHRvIGBzZGAgc2lnbmlmaWNhbnQgZGlnaXRzXHJcbiAgICogdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogUmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIGBzZGAgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnRcclxuICAgKiB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZSB2YWx1ZSBpbiBub3JtYWwgbm90YXRpb24uXHJcbiAgICpcclxuICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cclxuICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICpcclxuICAgKi9cclxuICBQLnRvUHJlY2lzaW9uID0gZnVuY3Rpb24gKHNkLCBybSkge1xyXG4gICAgdmFyIHN0cixcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIGlmIChzZCA9PT0gdm9pZCAwKSB7XHJcbiAgICAgIHN0ciA9IGZpbml0ZVRvU3RyaW5nKHgsIHguZSA8PSBDdG9yLnRvRXhwTmVnIHx8IHguZSA+PSBDdG9yLnRvRXhwUG9zKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNoZWNrSW50MzIoc2QsIDEsIE1BWF9ESUdJVFMpO1xyXG5cclxuICAgICAgaWYgKHJtID09PSB2b2lkIDApIHJtID0gQ3Rvci5yb3VuZGluZztcclxuICAgICAgZWxzZSBjaGVja0ludDMyKHJtLCAwLCA4KTtcclxuXHJcbiAgICAgIHggPSBmaW5hbGlzZShuZXcgQ3Rvcih4KSwgc2QsIHJtKTtcclxuICAgICAgc3RyID0gZmluaXRlVG9TdHJpbmcoeCwgc2QgPD0geC5lIHx8IHguZSA8PSBDdG9yLnRvRXhwTmVnLCBzZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHguaXNOZWcoKSAmJiAheC5pc1plcm8oKSA/ICctJyArIHN0ciA6IHN0cjtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIHJvdW5kZWQgdG8gYSBtYXhpbXVtIG9mIGBzZGBcclxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm1gLCBvciB0byBgcHJlY2lzaW9uYCBhbmQgYHJvdW5kaW5nYCByZXNwZWN0aXZlbHkgaWZcclxuICAgKiBvbWl0dGVkLlxyXG4gICAqXHJcbiAgICogW3NkXSB7bnVtYmVyfSBTaWduaWZpY2FudCBkaWdpdHMuIEludGVnZXIsIDEgdG8gTUFYX0RJR0lUUyBpbmNsdXNpdmUuXHJcbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAqXHJcbiAgICogJ3RvU0QoKSBkaWdpdHMgb3V0IG9mIHJhbmdlOiB7c2R9J1xyXG4gICAqICd0b1NEKCkgZGlnaXRzIG5vdCBhbiBpbnRlZ2VyOiB7c2R9J1xyXG4gICAqICd0b1NEKCkgcm91bmRpbmcgbW9kZSBub3QgYW4gaW50ZWdlcjoge3JtfSdcclxuICAgKiAndG9TRCgpIHJvdW5kaW5nIG1vZGUgb3V0IG9mIHJhbmdlOiB7cm19J1xyXG4gICAqXHJcbiAgICovXHJcbiAgUC50b1NpZ25pZmljYW50RGlnaXRzID0gUC50b1NEID0gZnVuY3Rpb24gKHNkLCBybSkge1xyXG4gICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoc2QgPT09IHZvaWQgMCkge1xyXG4gICAgICBzZCA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjaGVja0ludDMyKHNkLCAxLCBNQVhfRElHSVRTKTtcclxuXHJcbiAgICAgIGlmIChybSA9PT0gdm9pZCAwKSBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICAgIGVsc2UgY2hlY2tJbnQzMihybSwgMCwgOCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZpbmFsaXNlKG5ldyBDdG9yKHgpLCBzZCwgcm0pO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbC5cclxuICAgKlxyXG4gICAqIFJldHVybiBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGlzIERlY2ltYWwgaGFzIGEgcG9zaXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgZ3JlYXRlciB0aGFuXHJcbiAgICogYHRvRXhwUG9zYCwgb3IgYSBuZWdhdGl2ZSBleHBvbmVudCBlcXVhbCB0byBvciBsZXNzIHRoYW4gYHRvRXhwTmVnYC5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICBzdHIgPSBmaW5pdGVUb1N0cmluZyh4LCB4LmUgPD0gQ3Rvci50b0V4cE5lZyB8fCB4LmUgPj0gQ3Rvci50b0V4cFBvcyk7XHJcblxyXG4gICAgcmV0dXJuIHguaXNOZWcoKSAmJiAheC5pc1plcm8oKSA/ICctJyArIHN0ciA6IHN0cjtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIHRydW5jYXRlZCB0byBhIHdob2xlIG51bWJlci5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAudHJ1bmNhdGVkID0gUC50cnVuYyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBmaW5hbGlzZShuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKSwgdGhpcy5lICsgMSwgMSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqIFVubGlrZSBgdG9TdHJpbmdgLCBuZWdhdGl2ZSB6ZXJvIHdpbGwgaW5jbHVkZSB0aGUgbWludXMgc2lnbi5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAudmFsdWVPZiA9IFAudG9KU09OID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgc3RyID0gZmluaXRlVG9TdHJpbmcoeCwgeC5lIDw9IEN0b3IudG9FeHBOZWcgfHwgeC5lID49IEN0b3IudG9FeHBQb3MpO1xyXG5cclxuICAgIHJldHVybiB4LmlzTmVnKCkgPyAnLScgKyBzdHIgOiBzdHI7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8vIEhlbHBlciBmdW5jdGlvbnMgZm9yIERlY2ltYWwucHJvdG90eXBlIChQKSBhbmQvb3IgRGVjaW1hbCBtZXRob2RzLCBhbmQgdGhlaXIgY2FsbGVycy5cclxuXHJcblxyXG4gIC8qXHJcbiAgICogIGRpZ2l0c1RvU3RyaW5nICAgICAgICAgICBQLmN1YmVSb290LCBQLmxvZ2FyaXRobSwgUC5zcXVhcmVSb290LCBQLnRvRnJhY3Rpb24sIFAudG9Qb3dlcixcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbml0ZVRvU3RyaW5nLCBuYXR1cmFsRXhwb25lbnRpYWwsIG5hdHVyYWxMb2dhcml0aG1cclxuICAgKiAgY2hlY2tJbnQzMiAgICAgICAgICAgICAgIFAudG9EZWNpbWFsUGxhY2VzLCBQLnRvRXhwb25lbnRpYWwsIFAudG9GaXhlZCwgUC50b05lYXJlc3QsXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBQLnRvUHJlY2lzaW9uLCBQLnRvU2lnbmlmaWNhbnREaWdpdHMsIHRvU3RyaW5nQmluYXJ5LCByYW5kb21cclxuICAgKiAgY2hlY2tSb3VuZGluZ0RpZ2l0cyAgICAgIFAubG9nYXJpdGhtLCBQLnRvUG93ZXIsIG5hdHVyYWxFeHBvbmVudGlhbCwgbmF0dXJhbExvZ2FyaXRobVxyXG4gICAqICBjb252ZXJ0QmFzZSAgICAgICAgICAgICAgdG9TdHJpbmdCaW5hcnksIHBhcnNlT3RoZXJcclxuICAgKiAgY29zICAgICAgICAgICAgICAgICAgICAgIFAuY29zXHJcbiAgICogIGRpdmlkZSAgICAgICAgICAgICAgICAgICBQLmF0YW5oLCBQLmN1YmVSb290LCBQLmRpdmlkZWRCeSwgUC5kaXZpZGVkVG9JbnRlZ2VyQnksXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBQLmxvZ2FyaXRobSwgUC5tb2R1bG8sIFAuc3F1YXJlUm9vdCwgUC50YW4sIFAudGFuaCwgUC50b0ZyYWN0aW9uLFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgUC50b05lYXJlc3QsIHRvU3RyaW5nQmluYXJ5LCBuYXR1cmFsRXhwb25lbnRpYWwsIG5hdHVyYWxMb2dhcml0aG0sXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICB0YXlsb3JTZXJpZXMsIGF0YW4yLCBwYXJzZU90aGVyXHJcbiAgICogIGZpbmFsaXNlICAgICAgICAgICAgICAgICBQLmFic29sdXRlVmFsdWUsIFAuYXRhbiwgUC5hdGFuaCwgUC5jZWlsLCBQLmNvcywgUC5jb3NoLFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgUC5jdWJlUm9vdCwgUC5kaXZpZGVkVG9JbnRlZ2VyQnksIFAuZmxvb3IsIFAubG9nYXJpdGhtLCBQLm1pbnVzLFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgUC5tb2R1bG8sIFAubmVnYXRlZCwgUC5wbHVzLCBQLnJvdW5kLCBQLnNpbiwgUC5zaW5oLCBQLnNxdWFyZVJvb3QsXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBQLnRhbiwgUC50aW1lcywgUC50b0RlY2ltYWxQbGFjZXMsIFAudG9FeHBvbmVudGlhbCwgUC50b0ZpeGVkLFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgUC50b05lYXJlc3QsIFAudG9Qb3dlciwgUC50b1ByZWNpc2lvbiwgUC50b1NpZ25pZmljYW50RGlnaXRzLFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgUC50cnVuY2F0ZWQsIGRpdmlkZSwgZ2V0TG4xMCwgZ2V0UGksIG5hdHVyYWxFeHBvbmVudGlhbCxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdHVyYWxMb2dhcml0aG0sIGNlaWwsIGZsb29yLCByb3VuZCwgdHJ1bmNcclxuICAgKiAgZmluaXRlVG9TdHJpbmcgICAgICAgICAgIFAudG9FeHBvbmVudGlhbCwgUC50b0ZpeGVkLCBQLnRvUHJlY2lzaW9uLCBQLnRvU3RyaW5nLCBQLnZhbHVlT2YsXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICB0b1N0cmluZ0JpbmFyeVxyXG4gICAqICBnZXRCYXNlMTBFeHBvbmVudCAgICAgICAgUC5taW51cywgUC5wbHVzLCBQLnRpbWVzLCBwYXJzZU90aGVyXHJcbiAgICogIGdldExuMTAgICAgICAgICAgICAgICAgICBQLmxvZ2FyaXRobSwgbmF0dXJhbExvZ2FyaXRobVxyXG4gICAqICBnZXRQaSAgICAgICAgICAgICAgICAgICAgUC5hY29zLCBQLmFzaW4sIFAuYXRhbiwgdG9MZXNzVGhhbkhhbGZQaSwgYXRhbjJcclxuICAgKiAgZ2V0UHJlY2lzaW9uICAgICAgICAgICAgIFAucHJlY2lzaW9uLCBQLnRvRnJhY3Rpb25cclxuICAgKiAgZ2V0WmVyb1N0cmluZyAgICAgICAgICAgIGRpZ2l0c1RvU3RyaW5nLCBmaW5pdGVUb1N0cmluZ1xyXG4gICAqICBpbnRQb3cgICAgICAgICAgICAgICAgICAgUC50b1Bvd2VyLCBwYXJzZU90aGVyXHJcbiAgICogIGlzT2RkICAgICAgICAgICAgICAgICAgICB0b0xlc3NUaGFuSGFsZlBpXHJcbiAgICogIG1heE9yTWluICAgICAgICAgICAgICAgICBtYXgsIG1pblxyXG4gICAqICBuYXR1cmFsRXhwb25lbnRpYWwgICAgICAgUC5uYXR1cmFsRXhwb25lbnRpYWwsIFAudG9Qb3dlclxyXG4gICAqICBuYXR1cmFsTG9nYXJpdGhtICAgICAgICAgUC5hY29zaCwgUC5hc2luaCwgUC5hdGFuaCwgUC5sb2dhcml0aG0sIFAubmF0dXJhbExvZ2FyaXRobSxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIFAudG9Qb3dlciwgbmF0dXJhbEV4cG9uZW50aWFsXHJcbiAgICogIG5vbkZpbml0ZVRvU3RyaW5nICAgICAgICBmaW5pdGVUb1N0cmluZywgdG9TdHJpbmdCaW5hcnlcclxuICAgKiAgcGFyc2VEZWNpbWFsICAgICAgICAgICAgIERlY2ltYWxcclxuICAgKiAgcGFyc2VPdGhlciAgICAgICAgICAgICAgIERlY2ltYWxcclxuICAgKiAgc2luICAgICAgICAgICAgICAgICAgICAgIFAuc2luXHJcbiAgICogIHRheWxvclNlcmllcyAgICAgICAgICAgICBQLmNvc2gsIFAuc2luaCwgY29zLCBzaW5cclxuICAgKiAgdG9MZXNzVGhhbkhhbGZQaSAgICAgICAgIFAuY29zLCBQLnNpblxyXG4gICAqICB0b1N0cmluZ0JpbmFyeSAgICAgICAgICAgUC50b0JpbmFyeSwgUC50b0hleGFkZWNpbWFsLCBQLnRvT2N0YWxcclxuICAgKiAgdHJ1bmNhdGUgICAgICAgICAgICAgICAgIGludFBvd1xyXG4gICAqXHJcbiAgICogIFRocm93czogICAgICAgICAgICAgICAgICBQLmxvZ2FyaXRobSwgUC5wcmVjaXNpb24sIFAudG9GcmFjdGlvbiwgY2hlY2tJbnQzMiwgZ2V0TG4xMCwgZ2V0UGksXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBuYXR1cmFsTG9nYXJpdGhtLCBjb25maWcsIHBhcnNlT3RoZXIsIHJhbmRvbSwgRGVjaW1hbFxyXG4gICAqL1xyXG5cclxuXHJcbiAgZnVuY3Rpb24gZGlnaXRzVG9TdHJpbmcoZCkge1xyXG4gICAgdmFyIGksIGssIHdzLFxyXG4gICAgICBpbmRleE9mTGFzdFdvcmQgPSBkLmxlbmd0aCAtIDEsXHJcbiAgICAgIHN0ciA9ICcnLFxyXG4gICAgICB3ID0gZFswXTtcclxuXHJcbiAgICBpZiAoaW5kZXhPZkxhc3RXb3JkID4gMCkge1xyXG4gICAgICBzdHIgKz0gdztcclxuICAgICAgZm9yIChpID0gMTsgaSA8IGluZGV4T2ZMYXN0V29yZDsgaSsrKSB7XHJcbiAgICAgICAgd3MgPSBkW2ldICsgJyc7XHJcbiAgICAgICAgayA9IExPR19CQVNFIC0gd3MubGVuZ3RoO1xyXG4gICAgICAgIGlmIChrKSBzdHIgKz0gZ2V0WmVyb1N0cmluZyhrKTtcclxuICAgICAgICBzdHIgKz0gd3M7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHcgPSBkW2ldO1xyXG4gICAgICB3cyA9IHcgKyAnJztcclxuICAgICAgayA9IExPR19CQVNFIC0gd3MubGVuZ3RoO1xyXG4gICAgICBpZiAoaykgc3RyICs9IGdldFplcm9TdHJpbmcoayk7XHJcbiAgICB9IGVsc2UgaWYgKHcgPT09IDApIHtcclxuICAgICAgcmV0dXJuICcwJztcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3Mgb2YgbGFzdCB3LlxyXG4gICAgZm9yICg7IHcgJSAxMCA9PT0gMDspIHcgLz0gMTA7XHJcblxyXG4gICAgcmV0dXJuIHN0ciArIHc7XHJcbiAgfVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gY2hlY2tJbnQzMihpLCBtaW4sIG1heCkge1xyXG4gICAgaWYgKGkgIT09IH5+aSB8fCBpIDwgbWluIHx8IGkgPiBtYXgpIHtcclxuICAgICAgdGhyb3cgRXJyb3IoaW52YWxpZEFyZ3VtZW50ICsgaSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBDaGVjayA1IHJvdW5kaW5nIGRpZ2l0cyBpZiBgcmVwZWF0aW5nYCBpcyBudWxsLCA0IG90aGVyd2lzZS5cclxuICAgKiBgcmVwZWF0aW5nID09IG51bGxgIGlmIGNhbGxlciBpcyBgbG9nYCBvciBgcG93YCxcclxuICAgKiBgcmVwZWF0aW5nICE9IG51bGxgIGlmIGNhbGxlciBpcyBgbmF0dXJhbExvZ2FyaXRobWAgb3IgYG5hdHVyYWxFeHBvbmVudGlhbGAuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY2hlY2tSb3VuZGluZ0RpZ2l0cyhkLCBpLCBybSwgcmVwZWF0aW5nKSB7XHJcbiAgICB2YXIgZGksIGssIHIsIHJkO1xyXG5cclxuICAgIC8vIEdldCB0aGUgbGVuZ3RoIG9mIHRoZSBmaXJzdCB3b3JkIG9mIHRoZSBhcnJheSBkLlxyXG4gICAgZm9yIChrID0gZFswXTsgayA+PSAxMDsgayAvPSAxMCkgLS1pO1xyXG5cclxuICAgIC8vIElzIHRoZSByb3VuZGluZyBkaWdpdCBpbiB0aGUgZmlyc3Qgd29yZCBvZiBkP1xyXG4gICAgaWYgKC0taSA8IDApIHtcclxuICAgICAgaSArPSBMT0dfQkFTRTtcclxuICAgICAgZGkgPSAwO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGkgPSBNYXRoLmNlaWwoKGkgKyAxKSAvIExPR19CQVNFKTtcclxuICAgICAgaSAlPSBMT0dfQkFTRTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpIGlzIHRoZSBpbmRleCAoMCAtIDYpIG9mIHRoZSByb3VuZGluZyBkaWdpdC5cclxuICAgIC8vIEUuZy4gaWYgd2l0aGluIHRoZSB3b3JkIDM0ODc1NjMgdGhlIGZpcnN0IHJvdW5kaW5nIGRpZ2l0IGlzIDUsXHJcbiAgICAvLyB0aGVuIGkgPSA0LCBrID0gMTAwMCwgcmQgPSAzNDg3NTYzICUgMTAwMCA9IDU2M1xyXG4gICAgayA9IG1hdGhwb3coMTAsIExPR19CQVNFIC0gaSk7XHJcbiAgICByZCA9IGRbZGldICUgayB8IDA7XHJcblxyXG4gICAgaWYgKHJlcGVhdGluZyA9PSBudWxsKSB7XHJcbiAgICAgIGlmIChpIDwgMykge1xyXG4gICAgICAgIGlmIChpID09IDApIHJkID0gcmQgLyAxMDAgfCAwO1xyXG4gICAgICAgIGVsc2UgaWYgKGkgPT0gMSkgcmQgPSByZCAvIDEwIHwgMDtcclxuICAgICAgICByID0gcm0gPCA0ICYmIHJkID09IDk5OTk5IHx8IHJtID4gMyAmJiByZCA9PSA0OTk5OSB8fCByZCA9PSA1MDAwMCB8fCByZCA9PSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHIgPSAocm0gPCA0ICYmIHJkICsgMSA9PSBrIHx8IHJtID4gMyAmJiByZCArIDEgPT0gayAvIDIpICYmXHJcbiAgICAgICAgICAoZFtkaSArIDFdIC8gayAvIDEwMCB8IDApID09IG1hdGhwb3coMTAsIGkgLSAyKSAtIDEgfHxcclxuICAgICAgICAgICAgKHJkID09IGsgLyAyIHx8IHJkID09IDApICYmIChkW2RpICsgMV0gLyBrIC8gMTAwIHwgMCkgPT0gMDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGkgPCA0KSB7XHJcbiAgICAgICAgaWYgKGkgPT0gMCkgcmQgPSByZCAvIDEwMDAgfCAwO1xyXG4gICAgICAgIGVsc2UgaWYgKGkgPT0gMSkgcmQgPSByZCAvIDEwMCB8IDA7XHJcbiAgICAgICAgZWxzZSBpZiAoaSA9PSAyKSByZCA9IHJkIC8gMTAgfCAwO1xyXG4gICAgICAgIHIgPSAocmVwZWF0aW5nIHx8IHJtIDwgNCkgJiYgcmQgPT0gOTk5OSB8fCAhcmVwZWF0aW5nICYmIHJtID4gMyAmJiByZCA9PSA0OTk5O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHIgPSAoKHJlcGVhdGluZyB8fCBybSA8IDQpICYmIHJkICsgMSA9PSBrIHx8XHJcbiAgICAgICAgKCFyZXBlYXRpbmcgJiYgcm0gPiAzKSAmJiByZCArIDEgPT0gayAvIDIpICYmXHJcbiAgICAgICAgICAoZFtkaSArIDFdIC8gayAvIDEwMDAgfCAwKSA9PSBtYXRocG93KDEwLCBpIC0gMykgLSAxO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHI7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQ29udmVydCBzdHJpbmcgb2YgYGJhc2VJbmAgdG8gYW4gYXJyYXkgb2YgbnVtYmVycyBvZiBgYmFzZU91dGAuXHJcbiAgLy8gRWcuIGNvbnZlcnRCYXNlKCcyNTUnLCAxMCwgMTYpIHJldHVybnMgWzE1LCAxNV0uXHJcbiAgLy8gRWcuIGNvbnZlcnRCYXNlKCdmZicsIDE2LCAxMCkgcmV0dXJucyBbMiwgNSwgNV0uXHJcbiAgZnVuY3Rpb24gY29udmVydEJhc2Uoc3RyLCBiYXNlSW4sIGJhc2VPdXQpIHtcclxuICAgIHZhciBqLFxyXG4gICAgICBhcnIgPSBbMF0sXHJcbiAgICAgIGFyckwsXHJcbiAgICAgIGkgPSAwLFxyXG4gICAgICBzdHJMID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICBmb3IgKDsgaSA8IHN0ckw7KSB7XHJcbiAgICAgIGZvciAoYXJyTCA9IGFyci5sZW5ndGg7IGFyckwtLTspIGFyclthcnJMXSAqPSBiYXNlSW47XHJcbiAgICAgIGFyclswXSArPSBOVU1FUkFMUy5pbmRleE9mKHN0ci5jaGFyQXQoaSsrKSk7XHJcbiAgICAgIGZvciAoaiA9IDA7IGogPCBhcnIubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBpZiAoYXJyW2pdID4gYmFzZU91dCAtIDEpIHtcclxuICAgICAgICAgIGlmIChhcnJbaiArIDFdID09PSB2b2lkIDApIGFycltqICsgMV0gPSAwO1xyXG4gICAgICAgICAgYXJyW2ogKyAxXSArPSBhcnJbal0gLyBiYXNlT3V0IHwgMDtcclxuICAgICAgICAgIGFycltqXSAlPSBiYXNlT3V0O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhcnIucmV2ZXJzZSgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogY29zKHgpID0gMSAtIHheMi8yISArIHheNC80ISAtIC4uLlxyXG4gICAqIHx4fCA8IHBpLzJcclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGNvc2luZShDdG9yLCB4KSB7XHJcbiAgICB2YXIgaywgbGVuLCB5O1xyXG5cclxuICAgIGlmICh4LmlzWmVybygpKSByZXR1cm4geDtcclxuXHJcbiAgICAvLyBBcmd1bWVudCByZWR1Y3Rpb246IGNvcyg0eCkgPSA4Kihjb3NeNCh4KSAtIGNvc14yKHgpKSArIDFcclxuICAgIC8vIGkuZS4gY29zKHgpID0gOCooY29zXjQoeC80KSAtIGNvc14yKHgvNCkpICsgMVxyXG5cclxuICAgIC8vIEVzdGltYXRlIHRoZSBvcHRpbXVtIG51bWJlciBvZiB0aW1lcyB0byB1c2UgdGhlIGFyZ3VtZW50IHJlZHVjdGlvbi5cclxuICAgIGxlbiA9IHguZC5sZW5ndGg7XHJcbiAgICBpZiAobGVuIDwgMzIpIHtcclxuICAgICAgayA9IE1hdGguY2VpbChsZW4gLyAzKTtcclxuICAgICAgeSA9ICgxIC8gdGlueVBvdyg0LCBrKSkudG9TdHJpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGsgPSAxNjtcclxuICAgICAgeSA9ICcyLjMyODMwNjQzNjUzODY5NjI4OTA2MjVlLTEwJztcclxuICAgIH1cclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiArPSBrO1xyXG5cclxuICAgIHggPSB0YXlsb3JTZXJpZXMoQ3RvciwgMSwgeC50aW1lcyh5KSwgbmV3IEN0b3IoMSkpO1xyXG5cclxuICAgIC8vIFJldmVyc2UgYXJndW1lbnQgcmVkdWN0aW9uXHJcbiAgICBmb3IgKHZhciBpID0gazsgaS0tOykge1xyXG4gICAgICB2YXIgY29zMnggPSB4LnRpbWVzKHgpO1xyXG4gICAgICB4ID0gY29zMngudGltZXMoY29zMngpLm1pbnVzKGNvczJ4KS50aW1lcyg4KS5wbHVzKDEpO1xyXG4gICAgfVxyXG5cclxuICAgIEN0b3IucHJlY2lzaW9uIC09IGs7XHJcblxyXG4gICAgcmV0dXJuIHg7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBQZXJmb3JtIGRpdmlzaW9uIGluIHRoZSBzcGVjaWZpZWQgYmFzZS5cclxuICAgKi9cclxuICB2YXIgZGl2aWRlID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAvLyBBc3N1bWVzIG5vbi16ZXJvIHggYW5kIGssIGFuZCBoZW5jZSBub24temVybyByZXN1bHQuXHJcbiAgICBmdW5jdGlvbiBtdWx0aXBseUludGVnZXIoeCwgaywgYmFzZSkge1xyXG4gICAgICB2YXIgdGVtcCxcclxuICAgICAgICBjYXJyeSA9IDAsXHJcbiAgICAgICAgaSA9IHgubGVuZ3RoO1xyXG5cclxuICAgICAgZm9yICh4ID0geC5zbGljZSgpOyBpLS07KSB7XHJcbiAgICAgICAgdGVtcCA9IHhbaV0gKiBrICsgY2Fycnk7XHJcbiAgICAgICAgeFtpXSA9IHRlbXAgJSBiYXNlIHwgMDtcclxuICAgICAgICBjYXJyeSA9IHRlbXAgLyBiYXNlIHwgMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNhcnJ5KSB4LnVuc2hpZnQoY2FycnkpO1xyXG5cclxuICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29tcGFyZShhLCBiLCBhTCwgYkwpIHtcclxuICAgICAgdmFyIGksIHI7XHJcblxyXG4gICAgICBpZiAoYUwgIT0gYkwpIHtcclxuICAgICAgICByID0gYUwgPiBiTCA/IDEgOiAtMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3IgKGkgPSByID0gMDsgaSA8IGFMOyBpKyspIHtcclxuICAgICAgICAgIGlmIChhW2ldICE9IGJbaV0pIHtcclxuICAgICAgICAgICAgciA9IGFbaV0gPiBiW2ldID8gMSA6IC0xO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN1YnRyYWN0KGEsIGIsIGFMLCBiYXNlKSB7XHJcbiAgICAgIHZhciBpID0gMDtcclxuXHJcbiAgICAgIC8vIFN1YnRyYWN0IGIgZnJvbSBhLlxyXG4gICAgICBmb3IgKDsgYUwtLTspIHtcclxuICAgICAgICBhW2FMXSAtPSBpO1xyXG4gICAgICAgIGkgPSBhW2FMXSA8IGJbYUxdID8gMSA6IDA7XHJcbiAgICAgICAgYVthTF0gPSBpICogYmFzZSArIGFbYUxdIC0gYlthTF07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIHplcm9zLlxyXG4gICAgICBmb3IgKDsgIWFbMF0gJiYgYS5sZW5ndGggPiAxOykgYS5zaGlmdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiAoeCwgeSwgcHIsIHJtLCBkcCwgYmFzZSkge1xyXG4gICAgICB2YXIgY21wLCBlLCBpLCBrLCBsb2dCYXNlLCBtb3JlLCBwcm9kLCBwcm9kTCwgcSwgcWQsIHJlbSwgcmVtTCwgcmVtMCwgc2QsIHQsIHhpLCB4TCwgeWQwLFxyXG4gICAgICAgIHlMLCB5eixcclxuICAgICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICBzaWduID0geC5zID09IHkucyA/IDEgOiAtMSxcclxuICAgICAgICB4ZCA9IHguZCxcclxuICAgICAgICB5ZCA9IHkuZDtcclxuXHJcbiAgICAgIC8vIEVpdGhlciBOYU4sIEluZmluaXR5IG9yIDA/XHJcbiAgICAgIGlmICgheGQgfHwgIXhkWzBdIHx8ICF5ZCB8fCAheWRbMF0pIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBDdG9yKC8vIFJldHVybiBOYU4gaWYgZWl0aGVyIE5hTiwgb3IgYm90aCBJbmZpbml0eSBvciAwLlxyXG4gICAgICAgICAgIXgucyB8fCAheS5zIHx8ICh4ZCA/IHlkICYmIHhkWzBdID09IHlkWzBdIDogIXlkKSA/IE5hTiA6XHJcblxyXG4gICAgICAgICAgLy8gUmV0dXJuIMKxMCBpZiB4IGlzIDAgb3IgeSBpcyDCsUluZmluaXR5LCBvciByZXR1cm4gwrFJbmZpbml0eSBhcyB5IGlzIDAuXHJcbiAgICAgICAgICB4ZCAmJiB4ZFswXSA9PSAwIHx8ICF5ZCA/IHNpZ24gKiAwIDogc2lnbiAvIDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYmFzZSkge1xyXG4gICAgICAgIGxvZ0Jhc2UgPSAxO1xyXG4gICAgICAgIGUgPSB4LmUgLSB5LmU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYmFzZSA9IEJBU0U7XHJcbiAgICAgICAgbG9nQmFzZSA9IExPR19CQVNFO1xyXG4gICAgICAgIGUgPSBtYXRoZmxvb3IoeC5lIC8gbG9nQmFzZSkgLSBtYXRoZmxvb3IoeS5lIC8gbG9nQmFzZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHlMID0geWQubGVuZ3RoO1xyXG4gICAgICB4TCA9IHhkLmxlbmd0aDtcclxuICAgICAgcSA9IG5ldyBDdG9yKHNpZ24pO1xyXG4gICAgICBxZCA9IHEuZCA9IFtdO1xyXG5cclxuICAgICAgLy8gUmVzdWx0IGV4cG9uZW50IG1heSBiZSBvbmUgbGVzcyB0aGFuIGUuXHJcbiAgICAgIC8vIFRoZSBkaWdpdCBhcnJheSBvZiBhIERlY2ltYWwgZnJvbSB0b1N0cmluZ0JpbmFyeSBtYXkgaGF2ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgZm9yIChpID0gMDsgeWRbaV0gPT0gKHhkW2ldIHx8IDApOyBpKyspO1xyXG5cclxuICAgICAgaWYgKHlkW2ldID4gKHhkW2ldIHx8IDApKSBlLS07XHJcblxyXG4gICAgICBpZiAocHIgPT0gbnVsbCkge1xyXG4gICAgICAgIHNkID0gcHIgPSBDdG9yLnByZWNpc2lvbjtcclxuICAgICAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICAgIH0gZWxzZSBpZiAoZHApIHtcclxuICAgICAgICBzZCA9IHByICsgKHguZSAtIHkuZSkgKyAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNkID0gcHI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzZCA8IDApIHtcclxuICAgICAgICBxZC5wdXNoKDEpO1xyXG4gICAgICAgIG1vcmUgPSB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IHByZWNpc2lvbiBpbiBudW1iZXIgb2YgYmFzZSAxMCBkaWdpdHMgdG8gYmFzZSAxZTcgZGlnaXRzLlxyXG4gICAgICAgIHNkID0gc2QgLyBsb2dCYXNlICsgMiB8IDA7XHJcbiAgICAgICAgaSA9IDA7XHJcblxyXG4gICAgICAgIC8vIGRpdmlzb3IgPCAxZTdcclxuICAgICAgICBpZiAoeUwgPT0gMSkge1xyXG4gICAgICAgICAgayA9IDA7XHJcbiAgICAgICAgICB5ZCA9IHlkWzBdO1xyXG4gICAgICAgICAgc2QrKztcclxuXHJcbiAgICAgICAgICAvLyBrIGlzIHRoZSBjYXJyeS5cclxuICAgICAgICAgIGZvciAoOyAoaSA8IHhMIHx8IGspICYmIHNkLS07IGkrKykge1xyXG4gICAgICAgICAgICB0ID0gayAqIGJhc2UgKyAoeGRbaV0gfHwgMCk7XHJcbiAgICAgICAgICAgIHFkW2ldID0gdCAvIHlkIHwgMDtcclxuICAgICAgICAgICAgayA9IHQgJSB5ZCB8IDA7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbW9yZSA9IGsgfHwgaSA8IHhMO1xyXG5cclxuICAgICAgICAvLyBkaXZpc29yID49IDFlN1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gTm9ybWFsaXNlIHhkIGFuZCB5ZCBzbyBoaWdoZXN0IG9yZGVyIGRpZ2l0IG9mIHlkIGlzID49IGJhc2UvMlxyXG4gICAgICAgICAgayA9IGJhc2UgLyAoeWRbMF0gKyAxKSB8IDA7XHJcblxyXG4gICAgICAgICAgaWYgKGsgPiAxKSB7XHJcbiAgICAgICAgICAgIHlkID0gbXVsdGlwbHlJbnRlZ2VyKHlkLCBrLCBiYXNlKTtcclxuICAgICAgICAgICAgeGQgPSBtdWx0aXBseUludGVnZXIoeGQsIGssIGJhc2UpO1xyXG4gICAgICAgICAgICB5TCA9IHlkLmxlbmd0aDtcclxuICAgICAgICAgICAgeEwgPSB4ZC5sZW5ndGg7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgeGkgPSB5TDtcclxuICAgICAgICAgIHJlbSA9IHhkLnNsaWNlKDAsIHlMKTtcclxuICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgIC8vIEFkZCB6ZXJvcyB0byBtYWtlIHJlbWFpbmRlciBhcyBsb25nIGFzIGRpdmlzb3IuXHJcbiAgICAgICAgICBmb3IgKDsgcmVtTCA8IHlMOykgcmVtW3JlbUwrK10gPSAwO1xyXG5cclxuICAgICAgICAgIHl6ID0geWQuc2xpY2UoKTtcclxuICAgICAgICAgIHl6LnVuc2hpZnQoMCk7XHJcbiAgICAgICAgICB5ZDAgPSB5ZFswXTtcclxuXHJcbiAgICAgICAgICBpZiAoeWRbMV0gPj0gYmFzZSAvIDIpICsreWQwO1xyXG5cclxuICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgayA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBDb21wYXJlIGRpdmlzb3IgYW5kIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgY21wID0gY29tcGFyZSh5ZCwgcmVtLCB5TCwgcmVtTCk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBkaXZpc29yIDwgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBpZiAoY21wIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgdHJpYWwgZGlnaXQsIGsuXHJcbiAgICAgICAgICAgICAgcmVtMCA9IHJlbVswXTtcclxuICAgICAgICAgICAgICBpZiAoeUwgIT0gcmVtTCkgcmVtMCA9IHJlbTAgKiBiYXNlICsgKHJlbVsxXSB8fCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gayB3aWxsIGJlIGhvdyBtYW55IHRpbWVzIHRoZSBkaXZpc29yIGdvZXMgaW50byB0aGUgY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgayA9IHJlbTAgLyB5ZDAgfCAwO1xyXG5cclxuICAgICAgICAgICAgICAvLyAgQWxnb3JpdGhtOlxyXG4gICAgICAgICAgICAgIC8vICAxLiBwcm9kdWN0ID0gZGl2aXNvciAqIHRyaWFsIGRpZ2l0IChrKVxyXG4gICAgICAgICAgICAgIC8vICAyLiBpZiBwcm9kdWN0ID4gcmVtYWluZGVyOiBwcm9kdWN0IC09IGRpdmlzb3IsIGstLVxyXG4gICAgICAgICAgICAgIC8vICAzLiByZW1haW5kZXIgLT0gcHJvZHVjdFxyXG4gICAgICAgICAgICAgIC8vICA0LiBpZiBwcm9kdWN0IHdhcyA8IHJlbWFpbmRlciBhdCAyOlxyXG4gICAgICAgICAgICAgIC8vICAgIDUuIGNvbXBhcmUgbmV3IHJlbWFpbmRlciBhbmQgZGl2aXNvclxyXG4gICAgICAgICAgICAgIC8vICAgIDYuIElmIHJlbWFpbmRlciA+IGRpdmlzb3I6IHJlbWFpbmRlciAtPSBkaXZpc29yLCBrKytcclxuXHJcbiAgICAgICAgICAgICAgaWYgKGsgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoayA+PSBiYXNlKSBrID0gYmFzZSAtIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcHJvZHVjdCA9IGRpdmlzb3IgKiB0cmlhbCBkaWdpdC5cclxuICAgICAgICAgICAgICAgIHByb2QgPSBtdWx0aXBseUludGVnZXIoeWQsIGssIGJhc2UpO1xyXG4gICAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgcHJvZHVjdCBhbmQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgY21wID0gY29tcGFyZShwcm9kLCByZW0sIHByb2RMLCByZW1MKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBwcm9kdWN0ID4gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgIGstLTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIFN1YnRyYWN0IGRpdmlzb3IgZnJvbSBwcm9kdWN0LlxyXG4gICAgICAgICAgICAgICAgICBzdWJ0cmFjdChwcm9kLCB5TCA8IHByb2RMID8geXogOiB5ZCwgcHJvZEwsIGJhc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY21wIGlzIC0xLlxyXG4gICAgICAgICAgICAgICAgLy8gSWYgayBpcyAwLCB0aGVyZSBpcyBubyBuZWVkIHRvIGNvbXBhcmUgeWQgYW5kIHJlbSBhZ2FpbiBiZWxvdywgc28gY2hhbmdlIGNtcCB0byAxXHJcbiAgICAgICAgICAgICAgICAvLyB0byBhdm9pZCBpdC4gSWYgayBpcyAxIHRoZXJlIGlzIGEgbmVlZCB0byBjb21wYXJlIHlkIGFuZCByZW0gYWdhaW4gYmVsb3cuXHJcbiAgICAgICAgICAgICAgICBpZiAoayA9PSAwKSBjbXAgPSBrID0gMTtcclxuICAgICAgICAgICAgICAgIHByb2QgPSB5ZC5zbGljZSgpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcclxuICAgICAgICAgICAgICBpZiAocHJvZEwgPCByZW1MKSBwcm9kLnVuc2hpZnQoMCk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIFN1YnRyYWN0IHByb2R1Y3QgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgc3VidHJhY3QocmVtLCBwcm9kLCByZW1MLCBiYXNlKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gSWYgcHJvZHVjdCB3YXMgPCBwcmV2aW91cyByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgaWYgKGNtcCA9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgcmVtTCA9IHJlbS5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCBuZXcgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgY21wID0gY29tcGFyZSh5ZCwgcmVtLCB5TCwgcmVtTCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZGl2aXNvciA8IG5ldyByZW1haW5kZXIsIHN1YnRyYWN0IGRpdmlzb3IgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoY21wIDwgMSkge1xyXG4gICAgICAgICAgICAgICAgICBrKys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAvLyBTdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgICBzdWJ0cmFjdChyZW0sIHlMIDwgcmVtTCA/IHl6IDogeWQsIHJlbUwsIGJhc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgcmVtTCA9IHJlbS5sZW5ndGg7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgaysrO1xyXG4gICAgICAgICAgICAgIHJlbSA9IFswXTtcclxuICAgICAgICAgICAgfSAgICAvLyBpZiBjbXAgPT09IDEsIGsgd2lsbCBiZSAwXHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlIG5leHQgZGlnaXQsIGssIHRvIHRoZSByZXN1bHQgYXJyYXkuXHJcbiAgICAgICAgICAgIHFkW2krK10gPSBrO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGlmIChjbXAgJiYgcmVtWzBdKSB7XHJcbiAgICAgICAgICAgICAgcmVtW3JlbUwrK10gPSB4ZFt4aV0gfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICByZW0gPSBbeGRbeGldXTtcclxuICAgICAgICAgICAgICByZW1MID0gMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH0gd2hpbGUgKCh4aSsrIDwgeEwgfHwgcmVtWzBdICE9PSB2b2lkIDApICYmIHNkLS0pO1xyXG5cclxuICAgICAgICAgIG1vcmUgPSByZW1bMF0gIT09IHZvaWQgMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIExlYWRpbmcgemVybz9cclxuICAgICAgICBpZiAoIXFkWzBdKSBxZC5zaGlmdCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBsb2dCYXNlIGlzIDEgd2hlbiBkaXZpZGUgaXMgYmVpbmcgdXNlZCBmb3IgYmFzZSBjb252ZXJzaW9uLlxyXG4gICAgICBpZiAobG9nQmFzZSA9PSAxKSB7XHJcbiAgICAgICAgcS5lID0gZTtcclxuICAgICAgICBpbmV4YWN0ID0gbW9yZTtcclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gVG8gY2FsY3VsYXRlIHEuZSwgZmlyc3QgZ2V0IHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIHFkWzBdLlxyXG4gICAgICAgIGZvciAoaSA9IDEsIGsgPSBxZFswXTsgayA+PSAxMDsgayAvPSAxMCkgaSsrO1xyXG4gICAgICAgIHEuZSA9IGkgKyBlICogbG9nQmFzZSAtIDE7XHJcblxyXG4gICAgICAgIGZpbmFsaXNlKHEsIGRwID8gcHIgKyBxLmUgKyAxIDogcHIsIHJtLCBtb3JlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHE7XHJcbiAgICB9O1xyXG4gIH0pKCk7XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJvdW5kIGB4YCB0byBgc2RgIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGBybWAuXHJcbiAgICogQ2hlY2sgZm9yIG92ZXIvdW5kZXItZmxvdy5cclxuICAgKi9cclxuICAgZnVuY3Rpb24gZmluYWxpc2UoeCwgc2QsIHJtLCBpc1RydW5jYXRlZCkge1xyXG4gICAgdmFyIGRpZ2l0cywgaSwgaiwgaywgcmQsIHJvdW5kVXAsIHcsIHhkLCB4ZGksXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIC8vIERvbid0IHJvdW5kIGlmIHNkIGlzIG51bGwgb3IgdW5kZWZpbmVkLlxyXG4gICAgb3V0OiBpZiAoc2QgIT0gbnVsbCkge1xyXG4gICAgICB4ZCA9IHguZDtcclxuXHJcbiAgICAgIC8vIEluZmluaXR5L05hTi5cclxuICAgICAgaWYgKCF4ZCkgcmV0dXJuIHg7XHJcblxyXG4gICAgICAvLyByZDogdGhlIHJvdW5kaW5nIGRpZ2l0LCBpLmUuIHRoZSBkaWdpdCBhZnRlciB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgLy8gdzogdGhlIHdvcmQgb2YgeGQgY29udGFpbmluZyByZCwgYSBiYXNlIDFlNyBudW1iZXIuXHJcbiAgICAgIC8vIHhkaTogdGhlIGluZGV4IG9mIHcgd2l0aGluIHhkLlxyXG4gICAgICAvLyBkaWdpdHM6IHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIHcuXHJcbiAgICAgIC8vIGk6IHdoYXQgd291bGQgYmUgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiB3IGlmIGFsbCB0aGUgbnVtYmVycyB3ZXJlIDcgZGlnaXRzIGxvbmcgKGkuZS4gaWZcclxuICAgICAgLy8gdGhleSBoYWQgbGVhZGluZyB6ZXJvcylcclxuICAgICAgLy8gajogaWYgPiAwLCB0aGUgYWN0dWFsIGluZGV4IG9mIHJkIHdpdGhpbiB3IChpZiA8IDAsIHJkIGlzIGEgbGVhZGluZyB6ZXJvKS5cclxuXHJcbiAgICAgIC8vIEdldCB0aGUgbGVuZ3RoIG9mIHRoZSBmaXJzdCB3b3JkIG9mIHRoZSBkaWdpdHMgYXJyYXkgeGQuXHJcbiAgICAgIGZvciAoZGlnaXRzID0gMSwgayA9IHhkWzBdOyBrID49IDEwOyBrIC89IDEwKSBkaWdpdHMrKztcclxuICAgICAgaSA9IHNkIC0gZGlnaXRzO1xyXG5cclxuICAgICAgLy8gSXMgdGhlIHJvdW5kaW5nIGRpZ2l0IGluIHRoZSBmaXJzdCB3b3JkIG9mIHhkP1xyXG4gICAgICBpZiAoaSA8IDApIHtcclxuICAgICAgICBpICs9IExPR19CQVNFO1xyXG4gICAgICAgIGogPSBzZDtcclxuICAgICAgICB3ID0geGRbeGRpID0gMF07XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgcm91bmRpbmcgZGlnaXQgYXQgaW5kZXggaiBvZiB3LlxyXG4gICAgICAgIHJkID0gdyAvIG1hdGhwb3coMTAsIGRpZ2l0cyAtIGogLSAxKSAlIDEwIHwgMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB4ZGkgPSBNYXRoLmNlaWwoKGkgKyAxKSAvIExPR19CQVNFKTtcclxuICAgICAgICBrID0geGQubGVuZ3RoO1xyXG4gICAgICAgIGlmICh4ZGkgPj0gaykge1xyXG4gICAgICAgICAgaWYgKGlzVHJ1bmNhdGVkKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBOZWVkZWQgYnkgYG5hdHVyYWxFeHBvbmVudGlhbGAsIGBuYXR1cmFsTG9nYXJpdGhtYCBhbmQgYHNxdWFyZVJvb3RgLlxyXG4gICAgICAgICAgICBmb3IgKDsgaysrIDw9IHhkaTspIHhkLnB1c2goMCk7XHJcbiAgICAgICAgICAgIHcgPSByZCA9IDA7XHJcbiAgICAgICAgICAgIGRpZ2l0cyA9IDE7XHJcbiAgICAgICAgICAgIGkgJT0gTE9HX0JBU0U7XHJcbiAgICAgICAgICAgIGogPSBpIC0gTE9HX0JBU0UgKyAxO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYnJlYWsgb3V0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB3ID0gayA9IHhkW3hkaV07XHJcblxyXG4gICAgICAgICAgLy8gR2V0IHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIHcuXHJcbiAgICAgICAgICBmb3IgKGRpZ2l0cyA9IDE7IGsgPj0gMTA7IGsgLz0gMTApIGRpZ2l0cysrO1xyXG5cclxuICAgICAgICAgIC8vIEdldCB0aGUgaW5kZXggb2YgcmQgd2l0aGluIHcuXHJcbiAgICAgICAgICBpICU9IExPR19CQVNFO1xyXG5cclxuICAgICAgICAgIC8vIEdldCB0aGUgaW5kZXggb2YgcmQgd2l0aGluIHcsIGFkanVzdGVkIGZvciBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgICAgLy8gVGhlIG51bWJlciBvZiBsZWFkaW5nIHplcm9zIG9mIHcgaXMgZ2l2ZW4gYnkgTE9HX0JBU0UgLSBkaWdpdHMuXHJcbiAgICAgICAgICBqID0gaSAtIExPR19CQVNFICsgZGlnaXRzO1xyXG5cclxuICAgICAgICAgIC8vIEdldCB0aGUgcm91bmRpbmcgZGlnaXQgYXQgaW5kZXggaiBvZiB3LlxyXG4gICAgICAgICAgcmQgPSBqIDwgMCA/IDAgOiB3IC8gbWF0aHBvdygxMCwgZGlnaXRzIC0gaiAtIDEpICUgMTAgfCAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQXJlIHRoZXJlIGFueSBub24temVybyBkaWdpdHMgYWZ0ZXIgdGhlIHJvdW5kaW5nIGRpZ2l0P1xyXG4gICAgICBpc1RydW5jYXRlZCA9IGlzVHJ1bmNhdGVkIHx8IHNkIDwgMCB8fFxyXG4gICAgICAgIHhkW3hkaSArIDFdICE9PSB2b2lkIDAgfHwgKGogPCAwID8gdyA6IHcgJSBtYXRocG93KDEwLCBkaWdpdHMgLSBqIC0gMSkpO1xyXG5cclxuICAgICAgLy8gVGhlIGV4cHJlc3Npb24gYHcgJSBtYXRocG93KDEwLCBkaWdpdHMgLSBqIC0gMSlgIHJldHVybnMgYWxsIHRoZSBkaWdpdHMgb2YgdyB0byB0aGUgcmlnaHRcclxuICAgICAgLy8gb2YgdGhlIGRpZ2l0IGF0IChsZWZ0LXRvLXJpZ2h0KSBpbmRleCBqLCBlLmcuIGlmIHcgaXMgOTA4NzE0IGFuZCBqIGlzIDIsIHRoZSBleHByZXNzaW9uXHJcbiAgICAgIC8vIHdpbGwgZ2l2ZSA3MTQuXHJcblxyXG4gICAgICByb3VuZFVwID0gcm0gPCA0XHJcbiAgICAgICAgPyAocmQgfHwgaXNUcnVuY2F0ZWQpICYmIChybSA9PSAwIHx8IHJtID09ICh4LnMgPCAwID8gMyA6IDIpKVxyXG4gICAgICAgIDogcmQgPiA1IHx8IHJkID09IDUgJiYgKHJtID09IDQgfHwgaXNUcnVuY2F0ZWQgfHwgcm0gPT0gNiAmJlxyXG5cclxuICAgICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGRpZ2l0IHRvIHRoZSBsZWZ0IG9mIHRoZSByb3VuZGluZyBkaWdpdCBpcyBvZGQuXHJcbiAgICAgICAgICAoKGkgPiAwID8gaiA+IDAgPyB3IC8gbWF0aHBvdygxMCwgZGlnaXRzIC0gaikgOiAwIDogeGRbeGRpIC0gMV0pICUgMTApICYgMSB8fFxyXG4gICAgICAgICAgICBybSA9PSAoeC5zIDwgMCA/IDggOiA3KSk7XHJcblxyXG4gICAgICBpZiAoc2QgPCAxIHx8ICF4ZFswXSkge1xyXG4gICAgICAgIHhkLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgaWYgKHJvdW5kVXApIHtcclxuXHJcbiAgICAgICAgICAvLyBDb252ZXJ0IHNkIHRvIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAgc2QgLT0geC5lICsgMTtcclxuXHJcbiAgICAgICAgICAvLyAxLCAwLjEsIDAuMDEsIDAuMDAxLCAwLjAwMDEgZXRjLlxyXG4gICAgICAgICAgeGRbMF0gPSBtYXRocG93KDEwLCAoTE9HX0JBU0UgLSBzZCAlIExPR19CQVNFKSAlIExPR19CQVNFKTtcclxuICAgICAgICAgIHguZSA9IC1zZCB8fCAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgIHhkWzBdID0geC5lID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZW1vdmUgZXhjZXNzIGRpZ2l0cy5cclxuICAgICAgaWYgKGkgPT0gMCkge1xyXG4gICAgICAgIHhkLmxlbmd0aCA9IHhkaTtcclxuICAgICAgICBrID0gMTtcclxuICAgICAgICB4ZGktLTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB4ZC5sZW5ndGggPSB4ZGkgKyAxO1xyXG4gICAgICAgIGsgPSBtYXRocG93KDEwLCBMT0dfQkFTRSAtIGkpO1xyXG5cclxuICAgICAgICAvLyBFLmcuIDU2NzAwIGJlY29tZXMgNTYwMDAgaWYgNyBpcyB0aGUgcm91bmRpbmcgZGlnaXQuXHJcbiAgICAgICAgLy8gaiA+IDAgbWVhbnMgaSA+IG51bWJlciBvZiBsZWFkaW5nIHplcm9zIG9mIHcuXHJcbiAgICAgICAgeGRbeGRpXSA9IGogPiAwID8gKHcgLyBtYXRocG93KDEwLCBkaWdpdHMgLSBqKSAlIG1hdGhwb3coMTAsIGopIHwgMCkgKiBrIDogMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHJvdW5kVXApIHtcclxuICAgICAgICBmb3IgKDs7KSB7XHJcblxyXG4gICAgICAgICAgLy8gSXMgdGhlIGRpZ2l0IHRvIGJlIHJvdW5kZWQgdXAgaW4gdGhlIGZpcnN0IHdvcmQgb2YgeGQ/XHJcbiAgICAgICAgICBpZiAoeGRpID09IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGkgd2lsbCBiZSB0aGUgbGVuZ3RoIG9mIHhkWzBdIGJlZm9yZSBrIGlzIGFkZGVkLlxyXG4gICAgICAgICAgICBmb3IgKGkgPSAxLCBqID0geGRbMF07IGogPj0gMTA7IGogLz0gMTApIGkrKztcclxuICAgICAgICAgICAgaiA9IHhkWzBdICs9IGs7XHJcbiAgICAgICAgICAgIGZvciAoayA9IDE7IGogPj0gMTA7IGogLz0gMTApIGsrKztcclxuXHJcbiAgICAgICAgICAgIC8vIGlmIGkgIT0gayB0aGUgbGVuZ3RoIGhhcyBpbmNyZWFzZWQuXHJcbiAgICAgICAgICAgIGlmIChpICE9IGspIHtcclxuICAgICAgICAgICAgICB4LmUrKztcclxuICAgICAgICAgICAgICBpZiAoeGRbMF0gPT0gQkFTRSkgeGRbMF0gPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHhkW3hkaV0gKz0gaztcclxuICAgICAgICAgICAgaWYgKHhkW3hkaV0gIT0gQkFTRSkgYnJlYWs7XHJcbiAgICAgICAgICAgIHhkW3hkaS0tXSA9IDA7XHJcbiAgICAgICAgICAgIGsgPSAxO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICBmb3IgKGkgPSB4ZC5sZW5ndGg7IHhkWy0taV0gPT09IDA7KSB4ZC5wb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZXh0ZXJuYWwpIHtcclxuXHJcbiAgICAgIC8vIE92ZXJmbG93P1xyXG4gICAgICBpZiAoeC5lID4gQ3Rvci5tYXhFKSB7XHJcblxyXG4gICAgICAgIC8vIEluZmluaXR5LlxyXG4gICAgICAgIHguZCA9IG51bGw7XHJcbiAgICAgICAgeC5lID0gTmFOO1xyXG5cclxuICAgICAgLy8gVW5kZXJmbG93P1xyXG4gICAgICB9IGVsc2UgaWYgKHguZSA8IEN0b3IubWluRSkge1xyXG5cclxuICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgIHguZSA9IDA7XHJcbiAgICAgICAgeC5kID0gWzBdO1xyXG4gICAgICAgIC8vIEN0b3IudW5kZXJmbG93ID0gdHJ1ZTtcclxuICAgICAgfSAvLyBlbHNlIEN0b3IudW5kZXJmbG93ID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHg7XHJcbiAgfVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gZmluaXRlVG9TdHJpbmcoeCwgaXNFeHAsIHNkKSB7XHJcbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5vbkZpbml0ZVRvU3RyaW5nKHgpO1xyXG4gICAgdmFyIGssXHJcbiAgICAgIGUgPSB4LmUsXHJcbiAgICAgIHN0ciA9IGRpZ2l0c1RvU3RyaW5nKHguZCksXHJcbiAgICAgIGxlbiA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgaWYgKGlzRXhwKSB7XHJcbiAgICAgIGlmIChzZCAmJiAoayA9IHNkIC0gbGVuKSA+IDApIHtcclxuICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgJy4nICsgc3RyLnNsaWNlKDEpICsgZ2V0WmVyb1N0cmluZyhrKTtcclxuICAgICAgfSBlbHNlIGlmIChsZW4gPiAxKSB7XHJcbiAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArICcuJyArIHN0ci5zbGljZSgxKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc3RyID0gc3RyICsgKHguZSA8IDAgPyAnZScgOiAnZSsnKSArIHguZTtcclxuICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuICAgICAgc3RyID0gJzAuJyArIGdldFplcm9TdHJpbmcoLWUgLSAxKSArIHN0cjtcclxuICAgICAgaWYgKHNkICYmIChrID0gc2QgLSBsZW4pID4gMCkgc3RyICs9IGdldFplcm9TdHJpbmcoayk7XHJcbiAgICB9IGVsc2UgaWYgKGUgPj0gbGVuKSB7XHJcbiAgICAgIHN0ciArPSBnZXRaZXJvU3RyaW5nKGUgKyAxIC0gbGVuKTtcclxuICAgICAgaWYgKHNkICYmIChrID0gc2QgLSBlIC0gMSkgPiAwKSBzdHIgPSBzdHIgKyAnLicgKyBnZXRaZXJvU3RyaW5nKGspO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKChrID0gZSArIDEpIDwgbGVuKSBzdHIgPSBzdHIuc2xpY2UoMCwgaykgKyAnLicgKyBzdHIuc2xpY2Uoayk7XHJcbiAgICAgIGlmIChzZCAmJiAoayA9IHNkIC0gbGVuKSA+IDApIHtcclxuICAgICAgICBpZiAoZSArIDEgPT09IGxlbikgc3RyICs9ICcuJztcclxuICAgICAgICBzdHIgKz0gZ2V0WmVyb1N0cmluZyhrKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzdHI7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBiYXNlIDEwIGV4cG9uZW50IGZyb20gdGhlIGJhc2UgMWU3IGV4cG9uZW50LlxyXG4gIGZ1bmN0aW9uIGdldEJhc2UxMEV4cG9uZW50KGRpZ2l0cywgZSkge1xyXG4gICAgdmFyIHcgPSBkaWdpdHNbMF07XHJcblxyXG4gICAgLy8gQWRkIHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIHRoZSBmaXJzdCB3b3JkIG9mIHRoZSBkaWdpdHMgYXJyYXkuXHJcbiAgICBmb3IgKCBlICo9IExPR19CQVNFOyB3ID49IDEwOyB3IC89IDEwKSBlKys7XHJcbiAgICByZXR1cm4gZTtcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiBnZXRMbjEwKEN0b3IsIHNkLCBwcikge1xyXG4gICAgaWYgKHNkID4gTE4xMF9QUkVDSVNJT04pIHtcclxuXHJcbiAgICAgIC8vIFJlc2V0IGdsb2JhbCBzdGF0ZSBpbiBjYXNlIHRoZSBleGNlcHRpb24gaXMgY2F1Z2h0LlxyXG4gICAgICBleHRlcm5hbCA9IHRydWU7XHJcbiAgICAgIGlmIChwcikgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuICAgICAgdGhyb3cgRXJyb3IocHJlY2lzaW9uTGltaXRFeGNlZWRlZCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmluYWxpc2UobmV3IEN0b3IoTE4xMCksIHNkLCAxLCB0cnVlKTtcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiBnZXRQaShDdG9yLCBzZCwgcm0pIHtcclxuICAgIGlmIChzZCA+IFBJX1BSRUNJU0lPTikgdGhyb3cgRXJyb3IocHJlY2lzaW9uTGltaXRFeGNlZWRlZCk7XHJcbiAgICByZXR1cm4gZmluYWxpc2UobmV3IEN0b3IoUEkpLCBzZCwgcm0sIHRydWUpO1xyXG4gIH1cclxuXHJcblxyXG4gIGZ1bmN0aW9uIGdldFByZWNpc2lvbihkaWdpdHMpIHtcclxuICAgIHZhciB3ID0gZGlnaXRzLmxlbmd0aCAtIDEsXHJcbiAgICAgIGxlbiA9IHcgKiBMT0dfQkFTRSArIDE7XHJcblxyXG4gICAgdyA9IGRpZ2l0c1t3XTtcclxuXHJcbiAgICAvLyBJZiBub24temVyby4uLlxyXG4gICAgaWYgKHcpIHtcclxuXHJcbiAgICAgIC8vIFN1YnRyYWN0IHRoZSBudW1iZXIgb2YgdHJhaWxpbmcgemVyb3Mgb2YgdGhlIGxhc3Qgd29yZC5cclxuICAgICAgZm9yICg7IHcgJSAxMCA9PSAwOyB3IC89IDEwKSBsZW4tLTtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiB0aGUgZmlyc3Qgd29yZC5cclxuICAgICAgZm9yICh3ID0gZGlnaXRzWzBdOyB3ID49IDEwOyB3IC89IDEwKSBsZW4rKztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbGVuO1xyXG4gIH1cclxuXHJcblxyXG4gIGZ1bmN0aW9uIGdldFplcm9TdHJpbmcoaykge1xyXG4gICAgdmFyIHpzID0gJyc7XHJcbiAgICBmb3IgKDsgay0tOykgenMgKz0gJzAnO1xyXG4gICAgcmV0dXJuIHpzO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIERlY2ltYWwgYHhgIHRvIHRoZSBwb3dlciBgbmAsIHdoZXJlIGBuYCBpcyBhblxyXG4gICAqIGludGVnZXIgb2YgdHlwZSBudW1iZXIuXHJcbiAgICpcclxuICAgKiBJbXBsZW1lbnRzICdleHBvbmVudGlhdGlvbiBieSBzcXVhcmluZycuIENhbGxlZCBieSBgcG93YCBhbmQgYHBhcnNlT3RoZXJgLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gaW50UG93KEN0b3IsIHgsIG4sIHByKSB7XHJcbiAgICB2YXIgaXNUcnVuY2F0ZWQsXHJcbiAgICAgIHIgPSBuZXcgQ3RvcigxKSxcclxuXHJcbiAgICAgIC8vIE1heCBuIG9mIDkwMDcxOTkyNTQ3NDA5OTEgdGFrZXMgNTMgbG9vcCBpdGVyYXRpb25zLlxyXG4gICAgICAvLyBNYXhpbXVtIGRpZ2l0cyBhcnJheSBsZW5ndGg7IGxlYXZlcyBbMjgsIDM0XSBndWFyZCBkaWdpdHMuXHJcbiAgICAgIGsgPSBNYXRoLmNlaWwocHIgLyBMT0dfQkFTRSArIDQpO1xyXG5cclxuICAgIGV4dGVybmFsID0gZmFsc2U7XHJcblxyXG4gICAgZm9yICg7Oykge1xyXG4gICAgICBpZiAobiAlIDIpIHtcclxuICAgICAgICByID0gci50aW1lcyh4KTtcclxuICAgICAgICBpZiAodHJ1bmNhdGUoci5kLCBrKSkgaXNUcnVuY2F0ZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBuID0gbWF0aGZsb29yKG4gLyAyKTtcclxuICAgICAgaWYgKG4gPT09IDApIHtcclxuXHJcbiAgICAgICAgLy8gVG8gZW5zdXJlIGNvcnJlY3Qgcm91bmRpbmcgd2hlbiByLmQgaXMgdHJ1bmNhdGVkLCBpbmNyZW1lbnQgdGhlIGxhc3Qgd29yZCBpZiBpdCBpcyB6ZXJvLlxyXG4gICAgICAgIG4gPSByLmQubGVuZ3RoIC0gMTtcclxuICAgICAgICBpZiAoaXNUcnVuY2F0ZWQgJiYgci5kW25dID09PSAwKSArK3IuZFtuXTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgeCA9IHgudGltZXMoeCk7XHJcbiAgICAgIHRydW5jYXRlKHguZCwgayk7XHJcbiAgICB9XHJcblxyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiByO1xyXG4gIH1cclxuXHJcblxyXG4gIGZ1bmN0aW9uIGlzT2RkKG4pIHtcclxuICAgIHJldHVybiBuLmRbbi5kLmxlbmd0aCAtIDFdICYgMTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIEhhbmRsZSBgbWF4YCBhbmQgYG1pbmAuIGBsdGd0YCBpcyAnbHQnIG9yICdndCcuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gbWF4T3JNaW4oQ3RvciwgYXJncywgbHRndCkge1xyXG4gICAgdmFyIHksXHJcbiAgICAgIHggPSBuZXcgQ3RvcihhcmdzWzBdKSxcclxuICAgICAgaSA9IDA7XHJcblxyXG4gICAgZm9yICg7ICsraSA8IGFyZ3MubGVuZ3RoOykge1xyXG4gICAgICB5ID0gbmV3IEN0b3IoYXJnc1tpXSk7XHJcbiAgICAgIGlmICgheS5zKSB7XHJcbiAgICAgICAgeCA9IHk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH0gZWxzZSBpZiAoeFtsdGd0XSh5KSkge1xyXG4gICAgICAgIHggPSB5O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHg7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbmF0dXJhbCBleHBvbmVudGlhbCBvZiBgeGAgcm91bmRlZCB0byBgc2RgIHNpZ25pZmljYW50XHJcbiAgICogZGlnaXRzLlxyXG4gICAqXHJcbiAgICogVGF5bG9yL01hY2xhdXJpbiBzZXJpZXMuXHJcbiAgICpcclxuICAgKiBleHAoeCkgPSB4XjAvMCEgKyB4XjEvMSEgKyB4XjIvMiEgKyB4XjMvMyEgKyAuLi5cclxuICAgKlxyXG4gICAqIEFyZ3VtZW50IHJlZHVjdGlvbjpcclxuICAgKiAgIFJlcGVhdCB4ID0geCAvIDMyLCBrICs9IDUsIHVudGlsIHx4fCA8IDAuMVxyXG4gICAqICAgZXhwKHgpID0gZXhwKHggLyAyXmspXigyXmspXHJcbiAgICpcclxuICAgKiBQcmV2aW91c2x5LCB0aGUgYXJndW1lbnQgd2FzIGluaXRpYWxseSByZWR1Y2VkIGJ5XHJcbiAgICogZXhwKHgpID0gZXhwKHIpICogMTBeayAgd2hlcmUgciA9IHggLSBrICogbG4xMCwgayA9IGZsb29yKHggLyBsbjEwKVxyXG4gICAqIHRvIGZpcnN0IHB1dCByIGluIHRoZSByYW5nZSBbMCwgbG4xMF0sIGJlZm9yZSBkaXZpZGluZyBieSAzMiB1bnRpbCB8eHwgPCAwLjEsIGJ1dCB0aGlzIHdhc1xyXG4gICAqIGZvdW5kIHRvIGJlIHNsb3dlciB0aGFuIGp1c3QgZGl2aWRpbmcgcmVwZWF0ZWRseSBieSAzMiBhcyBhYm92ZS5cclxuICAgKlxyXG4gICAqIE1heCBpbnRlZ2VyIGFyZ3VtZW50OiBleHAoJzIwNzIzMjY1ODM2OTQ2NDEzJykgPSA2LjNlKzkwMDAwMDAwMDAwMDAwMDBcclxuICAgKiBNaW4gaW50ZWdlciBhcmd1bWVudDogZXhwKCctMjA3MjMyNjU4MzY5NDY0MTEnKSA9IDEuMmUtOTAwMDAwMDAwMDAwMDAwMFxyXG4gICAqIChNYXRoIG9iamVjdCBpbnRlZ2VyIG1pbi9tYXg6IE1hdGguZXhwKDcwOSkgPSA4LjJlKzMwNywgTWF0aC5leHAoLTc0NSkgPSA1ZS0zMjQpXHJcbiAgICpcclxuICAgKiAgZXhwKEluZmluaXR5KSAgPSBJbmZpbml0eVxyXG4gICAqICBleHAoLUluZmluaXR5KSA9IDBcclxuICAgKiAgZXhwKE5hTikgICAgICAgPSBOYU5cclxuICAgKiAgZXhwKMKxMCkgICAgICAgID0gMVxyXG4gICAqXHJcbiAgICogIGV4cCh4KSBpcyBub24tdGVybWluYXRpbmcgZm9yIGFueSBmaW5pdGUsIG5vbi16ZXJvIHguXHJcbiAgICpcclxuICAgKiAgVGhlIHJlc3VsdCB3aWxsIGFsd2F5cyBiZSBjb3JyZWN0bHkgcm91bmRlZC5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIG5hdHVyYWxFeHBvbmVudGlhbCh4LCBzZCkge1xyXG4gICAgdmFyIGRlbm9taW5hdG9yLCBndWFyZCwgaiwgcG93LCBzdW0sIHQsIHdwcixcclxuICAgICAgcmVwID0gMCxcclxuICAgICAgaSA9IDAsXHJcbiAgICAgIGsgPSAwLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgcm0gPSBDdG9yLnJvdW5kaW5nLFxyXG4gICAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG5cclxuICAgIC8vIDAvTmFOL0luZmluaXR5P1xyXG4gICAgaWYgKCF4LmQgfHwgIXguZFswXSB8fCB4LmUgPiAxNykge1xyXG5cclxuICAgICAgcmV0dXJuIG5ldyBDdG9yKHguZFxyXG4gICAgICAgID8gIXguZFswXSA/IDEgOiB4LnMgPCAwID8gMCA6IDEgLyAwXHJcbiAgICAgICAgOiB4LnMgPyB4LnMgPCAwID8gMCA6IHggOiAwIC8gMCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNkID09IG51bGwpIHtcclxuICAgICAgZXh0ZXJuYWwgPSBmYWxzZTtcclxuICAgICAgd3ByID0gcHI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3cHIgPSBzZDtcclxuICAgIH1cclxuXHJcbiAgICB0ID0gbmV3IEN0b3IoMC4wMzEyNSk7XHJcblxyXG4gICAgLy8gd2hpbGUgYWJzKHgpID49IDAuMVxyXG4gICAgd2hpbGUgKHguZSA+IC0yKSB7XHJcblxyXG4gICAgICAvLyB4ID0geCAvIDJeNVxyXG4gICAgICB4ID0geC50aW1lcyh0KTtcclxuICAgICAgayArPSA1O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSAyICogbG9nMTAoMl5rKSArIDUgKGVtcGlyaWNhbGx5IGRlcml2ZWQpIHRvIGVzdGltYXRlIHRoZSBpbmNyZWFzZSBpbiBwcmVjaXNpb25cclxuICAgIC8vIG5lY2Vzc2FyeSB0byBlbnN1cmUgdGhlIGZpcnN0IDQgcm91bmRpbmcgZGlnaXRzIGFyZSBjb3JyZWN0LlxyXG4gICAgZ3VhcmQgPSBNYXRoLmxvZyhtYXRocG93KDIsIGspKSAvIE1hdGguTE4xMCAqIDIgKyA1IHwgMDtcclxuICAgIHdwciArPSBndWFyZDtcclxuICAgIGRlbm9taW5hdG9yID0gcG93ID0gc3VtID0gbmV3IEN0b3IoMSk7XHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHdwcjtcclxuXHJcbiAgICBmb3IgKDs7KSB7XHJcbiAgICAgIHBvdyA9IGZpbmFsaXNlKHBvdy50aW1lcyh4KSwgd3ByLCAxKTtcclxuICAgICAgZGVub21pbmF0b3IgPSBkZW5vbWluYXRvci50aW1lcygrK2kpO1xyXG4gICAgICB0ID0gc3VtLnBsdXMoZGl2aWRlKHBvdywgZGVub21pbmF0b3IsIHdwciwgMSkpO1xyXG5cclxuICAgICAgaWYgKGRpZ2l0c1RvU3RyaW5nKHQuZCkuc2xpY2UoMCwgd3ByKSA9PT0gZGlnaXRzVG9TdHJpbmcoc3VtLmQpLnNsaWNlKDAsIHdwcikpIHtcclxuICAgICAgICBqID0gaztcclxuICAgICAgICB3aGlsZSAoai0tKSBzdW0gPSBmaW5hbGlzZShzdW0udGltZXMoc3VtKSwgd3ByLCAxKTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBmaXJzdCA0IHJvdW5kaW5nIGRpZ2l0cyBhcmUgWzQ5XTk5OS5cclxuICAgICAgICAvLyBJZiBzbywgcmVwZWF0IHRoZSBzdW1tYXRpb24gd2l0aCBhIGhpZ2hlciBwcmVjaXNpb24sIG90aGVyd2lzZVxyXG4gICAgICAgIC8vIGUuZy4gd2l0aCBwcmVjaXNpb246IDE4LCByb3VuZGluZzogMVxyXG4gICAgICAgIC8vIGV4cCgxOC40MDQyNzI0NjI1OTUwMzQwODM1Njc3OTM5MTk4NDM3NjEpID0gOTgzNzI1NjAuMTIyOTk5OTk5OSAoc2hvdWxkIGJlIDk4MzcyNTYwLjEyMylcclxuICAgICAgICAvLyBgd3ByIC0gZ3VhcmRgIGlzIHRoZSBpbmRleCBvZiBmaXJzdCByb3VuZGluZyBkaWdpdC5cclxuICAgICAgICBpZiAoc2QgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgIGlmIChyZXAgPCAzICYmIGNoZWNrUm91bmRpbmdEaWdpdHMoc3VtLmQsIHdwciAtIGd1YXJkLCBybSwgcmVwKSkge1xyXG4gICAgICAgICAgICBDdG9yLnByZWNpc2lvbiA9IHdwciArPSAxMDtcclxuICAgICAgICAgICAgZGVub21pbmF0b3IgPSBwb3cgPSB0ID0gbmV3IEN0b3IoMSk7XHJcbiAgICAgICAgICAgIGkgPSAwO1xyXG4gICAgICAgICAgICByZXArKztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmaW5hbGlzZShzdW0sIEN0b3IucHJlY2lzaW9uID0gcHIsIHJtLCBleHRlcm5hbCA9IHRydWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xyXG4gICAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN1bSA9IHQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbmF0dXJhbCBsb2dhcml0aG0gb2YgYHhgIHJvdW5kZWQgdG8gYHNkYCBzaWduaWZpY2FudFxyXG4gICAqIGRpZ2l0cy5cclxuICAgKlxyXG4gICAqICBsbigtbikgICAgICAgID0gTmFOXHJcbiAgICogIGxuKDApICAgICAgICAgPSAtSW5maW5pdHlcclxuICAgKiAgbG4oLTApICAgICAgICA9IC1JbmZpbml0eVxyXG4gICAqICBsbigxKSAgICAgICAgID0gMFxyXG4gICAqICBsbihJbmZpbml0eSkgID0gSW5maW5pdHlcclxuICAgKiAgbG4oLUluZmluaXR5KSA9IE5hTlxyXG4gICAqICBsbihOYU4pICAgICAgID0gTmFOXHJcbiAgICpcclxuICAgKiAgbG4obikgKG4gIT0gMSkgaXMgbm9uLXRlcm1pbmF0aW5nLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gbmF0dXJhbExvZ2FyaXRobSh5LCBzZCkge1xyXG4gICAgdmFyIGMsIGMwLCBkZW5vbWluYXRvciwgZSwgbnVtZXJhdG9yLCByZXAsIHN1bSwgdCwgd3ByLCB4MSwgeDIsXHJcbiAgICAgIG4gPSAxLFxyXG4gICAgICBndWFyZCA9IDEwLFxyXG4gICAgICB4ID0geSxcclxuICAgICAgeGQgPSB4LmQsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICBybSA9IEN0b3Iucm91bmRpbmcsXHJcbiAgICAgIHByID0gQ3Rvci5wcmVjaXNpb247XHJcblxyXG4gICAgLy8gSXMgeCBuZWdhdGl2ZSBvciBJbmZpbml0eSwgTmFOLCAwIG9yIDE/XHJcbiAgICBpZiAoeC5zIDwgMCB8fCAheGQgfHwgIXhkWzBdIHx8ICF4LmUgJiYgeGRbMF0gPT0gMSAmJiB4ZC5sZW5ndGggPT0gMSkge1xyXG4gICAgICByZXR1cm4gbmV3IEN0b3IoeGQgJiYgIXhkWzBdID8gLTEgLyAwIDogeC5zICE9IDEgPyBOYU4gOiB4ZCA/IDAgOiB4KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2QgPT0gbnVsbCkge1xyXG4gICAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG4gICAgICB3cHIgPSBwcjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHdwciA9IHNkO1xyXG4gICAgfVxyXG5cclxuICAgIEN0b3IucHJlY2lzaW9uID0gd3ByICs9IGd1YXJkO1xyXG4gICAgYyA9IGRpZ2l0c1RvU3RyaW5nKHhkKTtcclxuICAgIGMwID0gYy5jaGFyQXQoMCk7XHJcblxyXG4gICAgaWYgKE1hdGguYWJzKGUgPSB4LmUpIDwgMS41ZTE1KSB7XHJcblxyXG4gICAgICAvLyBBcmd1bWVudCByZWR1Y3Rpb24uXHJcbiAgICAgIC8vIFRoZSBzZXJpZXMgY29udmVyZ2VzIGZhc3RlciB0aGUgY2xvc2VyIHRoZSBhcmd1bWVudCBpcyB0byAxLCBzbyB1c2luZ1xyXG4gICAgICAvLyBsbihhXmIpID0gYiAqIGxuKGEpLCAgIGxuKGEpID0gbG4oYV5iKSAvIGJcclxuICAgICAgLy8gbXVsdGlwbHkgdGhlIGFyZ3VtZW50IGJ5IGl0c2VsZiB1bnRpbCB0aGUgbGVhZGluZyBkaWdpdHMgb2YgdGhlIHNpZ25pZmljYW5kIGFyZSA3LCA4LCA5LFxyXG4gICAgICAvLyAxMCwgMTEsIDEyIG9yIDEzLCByZWNvcmRpbmcgdGhlIG51bWJlciBvZiBtdWx0aXBsaWNhdGlvbnMgc28gdGhlIHN1bSBvZiB0aGUgc2VyaWVzIGNhblxyXG4gICAgICAvLyBsYXRlciBiZSBkaXZpZGVkIGJ5IHRoaXMgbnVtYmVyLCB0aGVuIHNlcGFyYXRlIG91dCB0aGUgcG93ZXIgb2YgMTAgdXNpbmdcclxuICAgICAgLy8gbG4oYSoxMF5iKSA9IGxuKGEpICsgYipsbigxMCkuXHJcblxyXG4gICAgICAvLyBtYXggbiBpcyAyMSAoZ2l2ZXMgMC45LCAxLjAgb3IgMS4xKSAoOWUxNSAvIDIxID0gNC4yZTE0KS5cclxuICAgICAgLy93aGlsZSAoYzAgPCA5ICYmIGMwICE9IDEgfHwgYzAgPT0gMSAmJiBjLmNoYXJBdCgxKSA+IDEpIHtcclxuICAgICAgLy8gbWF4IG4gaXMgNiAoZ2l2ZXMgMC43IC0gMS4zKVxyXG4gICAgICB3aGlsZSAoYzAgPCA3ICYmIGMwICE9IDEgfHwgYzAgPT0gMSAmJiBjLmNoYXJBdCgxKSA+IDMpIHtcclxuICAgICAgICB4ID0geC50aW1lcyh5KTtcclxuICAgICAgICBjID0gZGlnaXRzVG9TdHJpbmcoeC5kKTtcclxuICAgICAgICBjMCA9IGMuY2hhckF0KDApO1xyXG4gICAgICAgIG4rKztcclxuICAgICAgfVxyXG5cclxuICAgICAgZSA9IHguZTtcclxuXHJcbiAgICAgIGlmIChjMCA+IDEpIHtcclxuICAgICAgICB4ID0gbmV3IEN0b3IoJzAuJyArIGMpO1xyXG4gICAgICAgIGUrKztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB4ID0gbmV3IEN0b3IoYzAgKyAnLicgKyBjLnNsaWNlKDEpKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFRoZSBhcmd1bWVudCByZWR1Y3Rpb24gbWV0aG9kIGFib3ZlIG1heSByZXN1bHQgaW4gb3ZlcmZsb3cgaWYgdGhlIGFyZ3VtZW50IHkgaXMgYSBtYXNzaXZlXHJcbiAgICAgIC8vIG51bWJlciB3aXRoIGV4cG9uZW50ID49IDE1MDAwMDAwMDAwMDAwMDAgKDllMTUgLyA2ID0gMS41ZTE1KSwgc28gaW5zdGVhZCByZWNhbGwgdGhpc1xyXG4gICAgICAvLyBmdW5jdGlvbiB1c2luZyBsbih4KjEwXmUpID0gbG4oeCkgKyBlKmxuKDEwKS5cclxuICAgICAgdCA9IGdldExuMTAoQ3Rvciwgd3ByICsgMiwgcHIpLnRpbWVzKGUgKyAnJyk7XHJcbiAgICAgIHggPSBuYXR1cmFsTG9nYXJpdGhtKG5ldyBDdG9yKGMwICsgJy4nICsgYy5zbGljZSgxKSksIHdwciAtIGd1YXJkKS5wbHVzKHQpO1xyXG4gICAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xyXG5cclxuICAgICAgcmV0dXJuIHNkID09IG51bGwgPyBmaW5hbGlzZSh4LCBwciwgcm0sIGV4dGVybmFsID0gdHJ1ZSkgOiB4O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHgxIGlzIHggcmVkdWNlZCB0byBhIHZhbHVlIG5lYXIgMS5cclxuICAgIHgxID0geDtcclxuXHJcbiAgICAvLyBUYXlsb3Igc2VyaWVzLlxyXG4gICAgLy8gbG4oeSkgPSBsbigoMSArIHgpLygxIC0geCkpID0gMih4ICsgeF4zLzMgKyB4XjUvNSArIHheNy83ICsgLi4uKVxyXG4gICAgLy8gd2hlcmUgeCA9ICh5IC0gMSkvKHkgKyAxKSAgICAofHh8IDwgMSlcclxuICAgIHN1bSA9IG51bWVyYXRvciA9IHggPSBkaXZpZGUoeC5taW51cygxKSwgeC5wbHVzKDEpLCB3cHIsIDEpO1xyXG4gICAgeDIgPSBmaW5hbGlzZSh4LnRpbWVzKHgpLCB3cHIsIDEpO1xyXG4gICAgZGVub21pbmF0b3IgPSAzO1xyXG5cclxuICAgIGZvciAoOzspIHtcclxuICAgICAgbnVtZXJhdG9yID0gZmluYWxpc2UobnVtZXJhdG9yLnRpbWVzKHgyKSwgd3ByLCAxKTtcclxuICAgICAgdCA9IHN1bS5wbHVzKGRpdmlkZShudW1lcmF0b3IsIG5ldyBDdG9yKGRlbm9taW5hdG9yKSwgd3ByLCAxKSk7XHJcblxyXG4gICAgICBpZiAoZGlnaXRzVG9TdHJpbmcodC5kKS5zbGljZSgwLCB3cHIpID09PSBkaWdpdHNUb1N0cmluZyhzdW0uZCkuc2xpY2UoMCwgd3ByKSkge1xyXG4gICAgICAgIHN1bSA9IHN1bS50aW1lcygyKTtcclxuXHJcbiAgICAgICAgLy8gUmV2ZXJzZSB0aGUgYXJndW1lbnQgcmVkdWN0aW9uLiBDaGVjayB0aGF0IGUgaXMgbm90IDAgYmVjYXVzZSwgYmVzaWRlcyBwcmV2ZW50aW5nIGFuXHJcbiAgICAgICAgLy8gdW5uZWNlc3NhcnkgY2FsY3VsYXRpb24sIC0wICsgMCA9ICswIGFuZCB0byBlbnN1cmUgY29ycmVjdCByb3VuZGluZyAtMCBuZWVkcyB0byBzdGF5IC0wLlxyXG4gICAgICAgIGlmIChlICE9PSAwKSBzdW0gPSBzdW0ucGx1cyhnZXRMbjEwKEN0b3IsIHdwciArIDIsIHByKS50aW1lcyhlICsgJycpKTtcclxuICAgICAgICBzdW0gPSBkaXZpZGUoc3VtLCBuZXcgQ3RvcihuKSwgd3ByLCAxKTtcclxuXHJcbiAgICAgICAgLy8gSXMgcm0gPiAzIGFuZCB0aGUgZmlyc3QgNCByb3VuZGluZyBkaWdpdHMgNDk5OSwgb3Igcm0gPCA0IChvciB0aGUgc3VtbWF0aW9uIGhhc1xyXG4gICAgICAgIC8vIGJlZW4gcmVwZWF0ZWQgcHJldmlvdXNseSkgYW5kIHRoZSBmaXJzdCA0IHJvdW5kaW5nIGRpZ2l0cyA5OTk5P1xyXG4gICAgICAgIC8vIElmIHNvLCByZXN0YXJ0IHRoZSBzdW1tYXRpb24gd2l0aCBhIGhpZ2hlciBwcmVjaXNpb24sIG90aGVyd2lzZVxyXG4gICAgICAgIC8vIGUuZy4gd2l0aCBwcmVjaXNpb246IDEyLCByb3VuZGluZzogMVxyXG4gICAgICAgIC8vIGxuKDEzNTUyMDAyOC42MTI2MDkxNzE0MjY1MzgxNTMzKSA9IDE4LjcyNDYyOTk5OTkgd2hlbiBpdCBzaG91bGQgYmUgMTguNzI0NjMuXHJcbiAgICAgICAgLy8gYHdwciAtIGd1YXJkYCBpcyB0aGUgaW5kZXggb2YgZmlyc3Qgcm91bmRpbmcgZGlnaXQuXHJcbiAgICAgICAgaWYgKHNkID09IG51bGwpIHtcclxuICAgICAgICAgIGlmIChjaGVja1JvdW5kaW5nRGlnaXRzKHN1bS5kLCB3cHIgLSBndWFyZCwgcm0sIHJlcCkpIHtcclxuICAgICAgICAgICAgQ3Rvci5wcmVjaXNpb24gPSB3cHIgKz0gZ3VhcmQ7XHJcbiAgICAgICAgICAgIHQgPSBudW1lcmF0b3IgPSB4ID0gZGl2aWRlKHgxLm1pbnVzKDEpLCB4MS5wbHVzKDEpLCB3cHIsIDEpO1xyXG4gICAgICAgICAgICB4MiA9IGZpbmFsaXNlKHgudGltZXMoeCksIHdwciwgMSk7XHJcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gcmVwID0gMTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmaW5hbGlzZShzdW0sIEN0b3IucHJlY2lzaW9uID0gcHIsIHJtLCBleHRlcm5hbCA9IHRydWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xyXG4gICAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN1bSA9IHQ7XHJcbiAgICAgIGRlbm9taW5hdG9yICs9IDI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gwrFJbmZpbml0eSwgTmFOLlxyXG4gIGZ1bmN0aW9uIG5vbkZpbml0ZVRvU3RyaW5nKHgpIHtcclxuICAgIC8vIFVuc2lnbmVkLlxyXG4gICAgcmV0dXJuIFN0cmluZyh4LnMgKiB4LnMgLyAwKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFBhcnNlIHRoZSB2YWx1ZSBvZiBhIG5ldyBEZWNpbWFsIGB4YCBmcm9tIHN0cmluZyBgc3RyYC5cclxuICAgKi9cclxuICBmdW5jdGlvbiBwYXJzZURlY2ltYWwoeCwgc3RyKSB7XHJcbiAgICB2YXIgZSwgaSwgbGVuO1xyXG5cclxuICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICBpZiAoKGUgPSBzdHIuaW5kZXhPZignLicpKSA+IC0xKSBzdHIgPSBzdHIucmVwbGFjZSgnLicsICcnKTtcclxuXHJcbiAgICAvLyBFeHBvbmVudGlhbCBmb3JtP1xyXG4gICAgaWYgKChpID0gc3RyLnNlYXJjaCgvZS9pKSkgPiAwKSB7XHJcblxyXG4gICAgICAvLyBEZXRlcm1pbmUgZXhwb25lbnQuXHJcbiAgICAgIGlmIChlIDwgMCkgZSA9IGk7XHJcbiAgICAgIGUgKz0gK3N0ci5zbGljZShpICsgMSk7XHJcbiAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoMCwgaSk7XHJcbiAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAvLyBJbnRlZ2VyLlxyXG4gICAgICBlID0gc3RyLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEZXRlcm1pbmUgbGVhZGluZyB6ZXJvcy5cclxuICAgIGZvciAoaSA9IDA7IHN0ci5jaGFyQ29kZUF0KGkpID09PSA0ODsgaSsrKTtcclxuXHJcbiAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICBmb3IgKGxlbiA9IHN0ci5sZW5ndGg7IHN0ci5jaGFyQ29kZUF0KGxlbiAtIDEpID09PSA0ODsgLS1sZW4pO1xyXG4gICAgc3RyID0gc3RyLnNsaWNlKGksIGxlbik7XHJcblxyXG4gICAgaWYgKHN0cikge1xyXG4gICAgICBsZW4gLT0gaTtcclxuICAgICAgeC5lID0gZSA9IGUgLSBpIC0gMTtcclxuICAgICAgeC5kID0gW107XHJcblxyXG4gICAgICAvLyBUcmFuc2Zvcm0gYmFzZVxyXG5cclxuICAgICAgLy8gZSBpcyB0aGUgYmFzZSAxMCBleHBvbmVudC5cclxuICAgICAgLy8gaSBpcyB3aGVyZSB0byBzbGljZSBzdHIgdG8gZ2V0IHRoZSBmaXJzdCB3b3JkIG9mIHRoZSBkaWdpdHMgYXJyYXkuXHJcbiAgICAgIGkgPSAoZSArIDEpICUgTE9HX0JBU0U7XHJcbiAgICAgIGlmIChlIDwgMCkgaSArPSBMT0dfQkFTRTtcclxuXHJcbiAgICAgIGlmIChpIDwgbGVuKSB7XHJcbiAgICAgICAgaWYgKGkpIHguZC5wdXNoKCtzdHIuc2xpY2UoMCwgaSkpO1xyXG4gICAgICAgIGZvciAobGVuIC09IExPR19CQVNFOyBpIDwgbGVuOykgeC5kLnB1c2goK3N0ci5zbGljZShpLCBpICs9IExPR19CQVNFKSk7XHJcbiAgICAgICAgc3RyID0gc3RyLnNsaWNlKGkpO1xyXG4gICAgICAgIGkgPSBMT0dfQkFTRSAtIHN0ci5sZW5ndGg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaSAtPSBsZW47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoOyBpLS07KSBzdHIgKz0gJzAnO1xyXG4gICAgICB4LmQucHVzaCgrc3RyKTtcclxuXHJcbiAgICAgIGlmIChleHRlcm5hbCkge1xyXG5cclxuICAgICAgICAvLyBPdmVyZmxvdz9cclxuICAgICAgICBpZiAoeC5lID4geC5jb25zdHJ1Y3Rvci5tYXhFKSB7XHJcblxyXG4gICAgICAgICAgLy8gSW5maW5pdHkuXHJcbiAgICAgICAgICB4LmQgPSBudWxsO1xyXG4gICAgICAgICAgeC5lID0gTmFOO1xyXG5cclxuICAgICAgICAvLyBVbmRlcmZsb3c/XHJcbiAgICAgICAgfSBlbHNlIGlmICh4LmUgPCB4LmNvbnN0cnVjdG9yLm1pbkUpIHtcclxuXHJcbiAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgeC5lID0gMDtcclxuICAgICAgICAgIHguZCA9IFswXTtcclxuICAgICAgICAgIC8vIHguY29uc3RydWN0b3IudW5kZXJmbG93ID0gdHJ1ZTtcclxuICAgICAgICB9IC8vIGVsc2UgeC5jb25zdHJ1Y3Rvci51bmRlcmZsb3cgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFplcm8uXHJcbiAgICAgIHguZSA9IDA7XHJcbiAgICAgIHguZCA9IFswXTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4geDtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFBhcnNlIHRoZSB2YWx1ZSBvZiBhIG5ldyBEZWNpbWFsIGB4YCBmcm9tIGEgc3RyaW5nIGBzdHJgLCB3aGljaCBpcyBub3QgYSBkZWNpbWFsIHZhbHVlLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHBhcnNlT3RoZXIoeCwgc3RyKSB7XHJcbiAgICB2YXIgYmFzZSwgQ3RvciwgZGl2aXNvciwgaSwgaXNGbG9hdCwgbGVuLCBwLCB4ZCwgeGU7XHJcblxyXG4gICAgaWYgKHN0ci5pbmRleE9mKCdfJykgPiAtMSkge1xyXG4gICAgICBzdHIgPSBzdHIucmVwbGFjZSgvKFxcZClfKD89XFxkKS9nLCAnJDEnKTtcclxuICAgICAgaWYgKGlzRGVjaW1hbC50ZXN0KHN0cikpIHJldHVybiBwYXJzZURlY2ltYWwoeCwgc3RyKTtcclxuICAgIH0gZWxzZSBpZiAoc3RyID09PSAnSW5maW5pdHknIHx8IHN0ciA9PT0gJ05hTicpIHtcclxuICAgICAgaWYgKCErc3RyKSB4LnMgPSBOYU47XHJcbiAgICAgIHguZSA9IE5hTjtcclxuICAgICAgeC5kID0gbnVsbDtcclxuICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzSGV4LnRlc3Qoc3RyKSkgIHtcclxuICAgICAgYmFzZSA9IDE2O1xyXG4gICAgICBzdHIgPSBzdHIudG9Mb3dlckNhc2UoKTtcclxuICAgIH0gZWxzZSBpZiAoaXNCaW5hcnkudGVzdChzdHIpKSAge1xyXG4gICAgICBiYXNlID0gMjtcclxuICAgIH0gZWxzZSBpZiAoaXNPY3RhbC50ZXN0KHN0cikpICB7XHJcbiAgICAgIGJhc2UgPSA4O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgRXJyb3IoaW52YWxpZEFyZ3VtZW50ICsgc3RyKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJcyB0aGVyZSBhIGJpbmFyeSBleHBvbmVudCBwYXJ0P1xyXG4gICAgaSA9IHN0ci5zZWFyY2goL3AvaSk7XHJcblxyXG4gICAgaWYgKGkgPiAwKSB7XHJcbiAgICAgIHAgPSArc3RyLnNsaWNlKGkgKyAxKTtcclxuICAgICAgc3RyID0gc3RyLnN1YnN0cmluZygyLCBpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN0ciA9IHN0ci5zbGljZSgyKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb252ZXJ0IGBzdHJgIGFzIGFuIGludGVnZXIgdGhlbiBkaXZpZGUgdGhlIHJlc3VsdCBieSBgYmFzZWAgcmFpc2VkIHRvIGEgcG93ZXIgc3VjaCB0aGF0IHRoZVxyXG4gICAgLy8gZnJhY3Rpb24gcGFydCB3aWxsIGJlIHJlc3RvcmVkLlxyXG4gICAgaSA9IHN0ci5pbmRleE9mKCcuJyk7XHJcbiAgICBpc0Zsb2F0ID0gaSA+PSAwO1xyXG4gICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgaWYgKGlzRmxvYXQpIHtcclxuICAgICAgc3RyID0gc3RyLnJlcGxhY2UoJy4nLCAnJyk7XHJcbiAgICAgIGxlbiA9IHN0ci5sZW5ndGg7XHJcbiAgICAgIGkgPSBsZW4gLSBpO1xyXG5cclxuICAgICAgLy8gbG9nWzEwXSgxNikgPSAxLjIwNDEuLi4gLCBsb2dbMTBdKDg4KSA9IDEuOTQ0NC4uLi5cclxuICAgICAgZGl2aXNvciA9IGludFBvdyhDdG9yLCBuZXcgQ3RvcihiYXNlKSwgaSwgaSAqIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIHhkID0gY29udmVydEJhc2Uoc3RyLCBiYXNlLCBCQVNFKTtcclxuICAgIHhlID0geGQubGVuZ3RoIC0gMTtcclxuXHJcbiAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICBmb3IgKGkgPSB4ZTsgeGRbaV0gPT09IDA7IC0taSkgeGQucG9wKCk7XHJcbiAgICBpZiAoaSA8IDApIHJldHVybiBuZXcgQ3Rvcih4LnMgKiAwKTtcclxuICAgIHguZSA9IGdldEJhc2UxMEV4cG9uZW50KHhkLCB4ZSk7XHJcbiAgICB4LmQgPSB4ZDtcclxuICAgIGV4dGVybmFsID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQXQgd2hhdCBwcmVjaXNpb24gdG8gcGVyZm9ybSB0aGUgZGl2aXNpb24gdG8gZW5zdXJlIGV4YWN0IGNvbnZlcnNpb24/XHJcbiAgICAvLyBtYXhEZWNpbWFsSW50ZWdlclBhcnREaWdpdENvdW50ID0gY2VpbChsb2dbMTBdKGIpICogb3RoZXJCYXNlSW50ZWdlclBhcnREaWdpdENvdW50KVxyXG4gICAgLy8gbG9nWzEwXSgyKSA9IDAuMzAxMDMsIGxvZ1sxMF0oOCkgPSAwLjkwMzA5LCBsb2dbMTBdKDE2KSA9IDEuMjA0MTJcclxuICAgIC8vIEUuZy4gY2VpbCgxLjIgKiAzKSA9IDQsIHNvIHVwIHRvIDQgZGVjaW1hbCBkaWdpdHMgYXJlIG5lZWRlZCB0byByZXByZXNlbnQgMyBoZXggaW50IGRpZ2l0cy5cclxuICAgIC8vIG1heERlY2ltYWxGcmFjdGlvblBhcnREaWdpdENvdW50ID0ge0hleDo0fE9jdDozfEJpbjoxfSAqIG90aGVyQmFzZUZyYWN0aW9uUGFydERpZ2l0Q291bnRcclxuICAgIC8vIFRoZXJlZm9yZSB1c2luZyA0ICogdGhlIG51bWJlciBvZiBkaWdpdHMgb2Ygc3RyIHdpbGwgYWx3YXlzIGJlIGVub3VnaC5cclxuICAgIGlmIChpc0Zsb2F0KSB4ID0gZGl2aWRlKHgsIGRpdmlzb3IsIGxlbiAqIDQpO1xyXG5cclxuICAgIC8vIE11bHRpcGx5IGJ5IHRoZSBiaW5hcnkgZXhwb25lbnQgcGFydCBpZiBwcmVzZW50LlxyXG4gICAgaWYgKHApIHggPSB4LnRpbWVzKE1hdGguYWJzKHApIDwgNTQgPyBtYXRocG93KDIsIHApIDogRGVjaW1hbC5wb3coMiwgcCkpO1xyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiB4O1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogc2luKHgpID0geCAtIHheMy8zISArIHheNS81ISAtIC4uLlxyXG4gICAqIHx4fCA8IHBpLzJcclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHNpbmUoQ3RvciwgeCkge1xyXG4gICAgdmFyIGssXHJcbiAgICAgIGxlbiA9IHguZC5sZW5ndGg7XHJcblxyXG4gICAgaWYgKGxlbiA8IDMpIHtcclxuICAgICAgcmV0dXJuIHguaXNaZXJvKCkgPyB4IDogdGF5bG9yU2VyaWVzKEN0b3IsIDIsIHgsIHgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFyZ3VtZW50IHJlZHVjdGlvbjogc2luKDV4KSA9IDE2KnNpbl41KHgpIC0gMjAqc2luXjMoeCkgKyA1KnNpbih4KVxyXG4gICAgLy8gaS5lLiBzaW4oeCkgPSAxNipzaW5eNSh4LzUpIC0gMjAqc2luXjMoeC81KSArIDUqc2luKHgvNSlcclxuICAgIC8vIGFuZCAgc2luKHgpID0gc2luKHgvNSkoNSArIHNpbl4yKHgvNSkoMTZzaW5eMih4LzUpIC0gMjApKVxyXG5cclxuICAgIC8vIEVzdGltYXRlIHRoZSBvcHRpbXVtIG51bWJlciBvZiB0aW1lcyB0byB1c2UgdGhlIGFyZ3VtZW50IHJlZHVjdGlvbi5cclxuICAgIGsgPSAxLjQgKiBNYXRoLnNxcnQobGVuKTtcclxuICAgIGsgPSBrID4gMTYgPyAxNiA6IGsgfCAwO1xyXG5cclxuICAgIHggPSB4LnRpbWVzKDEgLyB0aW55UG93KDUsIGspKTtcclxuICAgIHggPSB0YXlsb3JTZXJpZXMoQ3RvciwgMiwgeCwgeCk7XHJcblxyXG4gICAgLy8gUmV2ZXJzZSBhcmd1bWVudCByZWR1Y3Rpb25cclxuICAgIHZhciBzaW4yX3gsXHJcbiAgICAgIGQ1ID0gbmV3IEN0b3IoNSksXHJcbiAgICAgIGQxNiA9IG5ldyBDdG9yKDE2KSxcclxuICAgICAgZDIwID0gbmV3IEN0b3IoMjApO1xyXG4gICAgZm9yICg7IGstLTspIHtcclxuICAgICAgc2luMl94ID0geC50aW1lcyh4KTtcclxuICAgICAgeCA9IHgudGltZXMoZDUucGx1cyhzaW4yX3gudGltZXMoZDE2LnRpbWVzKHNpbjJfeCkubWludXMoZDIwKSkpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4geDtcclxuICB9XHJcblxyXG5cclxuICAvLyBDYWxjdWxhdGUgVGF5bG9yIHNlcmllcyBmb3IgYGNvc2AsIGBjb3NoYCwgYHNpbmAgYW5kIGBzaW5oYC5cclxuICBmdW5jdGlvbiB0YXlsb3JTZXJpZXMoQ3RvciwgbiwgeCwgeSwgaXNIeXBlcmJvbGljKSB7XHJcbiAgICB2YXIgaiwgdCwgdSwgeDIsXHJcbiAgICAgIGkgPSAxLFxyXG4gICAgICBwciA9IEN0b3IucHJlY2lzaW9uLFxyXG4gICAgICBrID0gTWF0aC5jZWlsKHByIC8gTE9HX0JBU0UpO1xyXG5cclxuICAgIGV4dGVybmFsID0gZmFsc2U7XHJcbiAgICB4MiA9IHgudGltZXMoeCk7XHJcbiAgICB1ID0gbmV3IEN0b3IoeSk7XHJcblxyXG4gICAgZm9yICg7Oykge1xyXG4gICAgICB0ID0gZGl2aWRlKHUudGltZXMoeDIpLCBuZXcgQ3RvcihuKysgKiBuKyspLCBwciwgMSk7XHJcbiAgICAgIHUgPSBpc0h5cGVyYm9saWMgPyB5LnBsdXModCkgOiB5Lm1pbnVzKHQpO1xyXG4gICAgICB5ID0gZGl2aWRlKHQudGltZXMoeDIpLCBuZXcgQ3RvcihuKysgKiBuKyspLCBwciwgMSk7XHJcbiAgICAgIHQgPSB1LnBsdXMoeSk7XHJcblxyXG4gICAgICBpZiAodC5kW2tdICE9PSB2b2lkIDApIHtcclxuICAgICAgICBmb3IgKGogPSBrOyB0LmRbal0gPT09IHUuZFtqXSAmJiBqLS07KTtcclxuICAgICAgICBpZiAoaiA9PSAtMSkgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGogPSB1O1xyXG4gICAgICB1ID0geTtcclxuICAgICAgeSA9IHQ7XHJcbiAgICAgIHQgPSBqO1xyXG4gICAgICBpKys7XHJcbiAgICB9XHJcblxyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG4gICAgdC5kLmxlbmd0aCA9IGsgKyAxO1xyXG5cclxuICAgIHJldHVybiB0O1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIEV4cG9uZW50IGUgbXVzdCBiZSBwb3NpdGl2ZSBhbmQgbm9uLXplcm8uXHJcbiAgZnVuY3Rpb24gdGlueVBvdyhiLCBlKSB7XHJcbiAgICB2YXIgbiA9IGI7XHJcbiAgICB3aGlsZSAoLS1lKSBuICo9IGI7XHJcbiAgICByZXR1cm4gbjtcclxuICB9XHJcblxyXG5cclxuICAvLyBSZXR1cm4gdGhlIGFic29sdXRlIHZhbHVlIG9mIGB4YCByZWR1Y2VkIHRvIGxlc3MgdGhhbiBvciBlcXVhbCB0byBoYWxmIHBpLlxyXG4gIGZ1bmN0aW9uIHRvTGVzc1RoYW5IYWxmUGkoQ3RvciwgeCkge1xyXG4gICAgdmFyIHQsXHJcbiAgICAgIGlzTmVnID0geC5zIDwgMCxcclxuICAgICAgcGkgPSBnZXRQaShDdG9yLCBDdG9yLnByZWNpc2lvbiwgMSksXHJcbiAgICAgIGhhbGZQaSA9IHBpLnRpbWVzKDAuNSk7XHJcblxyXG4gICAgeCA9IHguYWJzKCk7XHJcblxyXG4gICAgaWYgKHgubHRlKGhhbGZQaSkpIHtcclxuICAgICAgcXVhZHJhbnQgPSBpc05lZyA/IDQgOiAxO1xyXG4gICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcbiAgICB0ID0geC5kaXZUb0ludChwaSk7XHJcblxyXG4gICAgaWYgKHQuaXNaZXJvKCkpIHtcclxuICAgICAgcXVhZHJhbnQgPSBpc05lZyA/IDMgOiAyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgeCA9IHgubWludXModC50aW1lcyhwaSkpO1xyXG5cclxuICAgICAgLy8gMCA8PSB4IDwgcGlcclxuICAgICAgaWYgKHgubHRlKGhhbGZQaSkpIHtcclxuICAgICAgICBxdWFkcmFudCA9IGlzT2RkKHQpID8gKGlzTmVnID8gMiA6IDMpIDogKGlzTmVnID8gNCA6IDEpO1xyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBxdWFkcmFudCA9IGlzT2RkKHQpID8gKGlzTmVnID8gMSA6IDQpIDogKGlzTmVnID8gMyA6IDIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB4Lm1pbnVzKHBpKS5hYnMoKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0aGUgdmFsdWUgb2YgRGVjaW1hbCBgeGAgYXMgYSBzdHJpbmcgaW4gYmFzZSBgYmFzZU91dGAuXHJcbiAgICpcclxuICAgKiBJZiB0aGUgb3B0aW9uYWwgYHNkYCBhcmd1bWVudCBpcyBwcmVzZW50IGluY2x1ZGUgYSBiaW5hcnkgZXhwb25lbnQgc3VmZml4LlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHRvU3RyaW5nQmluYXJ5KHgsIGJhc2VPdXQsIHNkLCBybSkge1xyXG4gICAgdmFyIGJhc2UsIGUsIGksIGssIGxlbiwgcm91bmRVcCwgc3RyLCB4ZCwgeSxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgIGlzRXhwID0gc2QgIT09IHZvaWQgMDtcclxuXHJcbiAgICBpZiAoaXNFeHApIHtcclxuICAgICAgY2hlY2tJbnQzMihzZCwgMSwgTUFYX0RJR0lUUyk7XHJcbiAgICAgIGlmIChybSA9PT0gdm9pZCAwKSBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICAgIGVsc2UgY2hlY2tJbnQzMihybSwgMCwgOCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZCA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF4LmlzRmluaXRlKCkpIHtcclxuICAgICAgc3RyID0gbm9uRmluaXRlVG9TdHJpbmcoeCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdHIgPSBmaW5pdGVUb1N0cmluZyh4KTtcclxuICAgICAgaSA9IHN0ci5pbmRleE9mKCcuJyk7XHJcblxyXG4gICAgICAvLyBVc2UgZXhwb25lbnRpYWwgbm90YXRpb24gYWNjb3JkaW5nIHRvIGB0b0V4cFBvc2AgYW5kIGB0b0V4cE5lZ2A/IE5vLCBidXQgaWYgcmVxdWlyZWQ6XHJcbiAgICAgIC8vIG1heEJpbmFyeUV4cG9uZW50ID0gZmxvb3IoKGRlY2ltYWxFeHBvbmVudCArIDEpICogbG9nWzJdKDEwKSlcclxuICAgICAgLy8gbWluQmluYXJ5RXhwb25lbnQgPSBmbG9vcihkZWNpbWFsRXhwb25lbnQgKiBsb2dbMl0oMTApKVxyXG4gICAgICAvLyBsb2dbMl0oMTApID0gMy4zMjE5MjgwOTQ4ODczNjIzNDc4NzAzMTk0Mjk0ODkzOTAxNzU4NjRcclxuXHJcbiAgICAgIGlmIChpc0V4cCkge1xyXG4gICAgICAgIGJhc2UgPSAyO1xyXG4gICAgICAgIGlmIChiYXNlT3V0ID09IDE2KSB7XHJcbiAgICAgICAgICBzZCA9IHNkICogNCAtIDM7XHJcbiAgICAgICAgfSBlbHNlIGlmIChiYXNlT3V0ID09IDgpIHtcclxuICAgICAgICAgIHNkID0gc2QgKiAzIC0gMjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYmFzZSA9IGJhc2VPdXQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENvbnZlcnQgdGhlIG51bWJlciBhcyBhbiBpbnRlZ2VyIHRoZW4gZGl2aWRlIHRoZSByZXN1bHQgYnkgaXRzIGJhc2UgcmFpc2VkIHRvIGEgcG93ZXIgc3VjaFxyXG4gICAgICAvLyB0aGF0IHRoZSBmcmFjdGlvbiBwYXJ0IHdpbGwgYmUgcmVzdG9yZWQuXHJcblxyXG4gICAgICAvLyBOb24taW50ZWdlci5cclxuICAgICAgaWYgKGkgPj0gMCkge1xyXG4gICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKCcuJywgJycpO1xyXG4gICAgICAgIHkgPSBuZXcgQ3RvcigxKTtcclxuICAgICAgICB5LmUgPSBzdHIubGVuZ3RoIC0gaTtcclxuICAgICAgICB5LmQgPSBjb252ZXJ0QmFzZShmaW5pdGVUb1N0cmluZyh5KSwgMTAsIGJhc2UpO1xyXG4gICAgICAgIHkuZSA9IHkuZC5sZW5ndGg7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHhkID0gY29udmVydEJhc2Uoc3RyLCAxMCwgYmFzZSk7XHJcbiAgICAgIGUgPSBsZW4gPSB4ZC5sZW5ndGg7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgIGZvciAoOyB4ZFstLWxlbl0gPT0gMDspIHhkLnBvcCgpO1xyXG5cclxuICAgICAgaWYgKCF4ZFswXSkge1xyXG4gICAgICAgIHN0ciA9IGlzRXhwID8gJzBwKzAnIDogJzAnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChpIDwgMCkge1xyXG4gICAgICAgICAgZS0tO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB4ID0gbmV3IEN0b3IoeCk7XHJcbiAgICAgICAgICB4LmQgPSB4ZDtcclxuICAgICAgICAgIHguZSA9IGU7XHJcbiAgICAgICAgICB4ID0gZGl2aWRlKHgsIHksIHNkLCBybSwgMCwgYmFzZSk7XHJcbiAgICAgICAgICB4ZCA9IHguZDtcclxuICAgICAgICAgIGUgPSB4LmU7XHJcbiAgICAgICAgICByb3VuZFVwID0gaW5leGFjdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRoZSByb3VuZGluZyBkaWdpdCwgaS5lLiB0aGUgZGlnaXQgYWZ0ZXIgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgaSA9IHhkW3NkXTtcclxuICAgICAgICBrID0gYmFzZSAvIDI7XHJcbiAgICAgICAgcm91bmRVcCA9IHJvdW5kVXAgfHwgeGRbc2QgKyAxXSAhPT0gdm9pZCAwO1xyXG5cclxuICAgICAgICByb3VuZFVwID0gcm0gPCA0XHJcbiAgICAgICAgICA/IChpICE9PSB2b2lkIDAgfHwgcm91bmRVcCkgJiYgKHJtID09PSAwIHx8IHJtID09PSAoeC5zIDwgMCA/IDMgOiAyKSlcclxuICAgICAgICAgIDogaSA+IGsgfHwgaSA9PT0gayAmJiAocm0gPT09IDQgfHwgcm91bmRVcCB8fCBybSA9PT0gNiAmJiB4ZFtzZCAtIDFdICYgMSB8fFxyXG4gICAgICAgICAgICBybSA9PT0gKHgucyA8IDAgPyA4IDogNykpO1xyXG5cclxuICAgICAgICB4ZC5sZW5ndGggPSBzZDtcclxuXHJcbiAgICAgICAgaWYgKHJvdW5kVXApIHtcclxuXHJcbiAgICAgICAgICAvLyBSb3VuZGluZyB1cCBtYXkgbWVhbiB0aGUgcHJldmlvdXMgZGlnaXQgaGFzIHRvIGJlIHJvdW5kZWQgdXAgYW5kIHNvIG9uLlxyXG4gICAgICAgICAgZm9yICg7ICsreGRbLS1zZF0gPiBiYXNlIC0gMTspIHtcclxuICAgICAgICAgICAgeGRbc2RdID0gMDtcclxuICAgICAgICAgICAgaWYgKCFzZCkge1xyXG4gICAgICAgICAgICAgICsrZTtcclxuICAgICAgICAgICAgICB4ZC51bnNoaWZ0KDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChsZW4gPSB4ZC5sZW5ndGg7ICF4ZFtsZW4gLSAxXTsgLS1sZW4pO1xyXG5cclxuICAgICAgICAvLyBFLmcuIFs0LCAxMSwgMTVdIGJlY29tZXMgNGJmLlxyXG4gICAgICAgIGZvciAoaSA9IDAsIHN0ciA9ICcnOyBpIDwgbGVuOyBpKyspIHN0ciArPSBOVU1FUkFMUy5jaGFyQXQoeGRbaV0pO1xyXG5cclxuICAgICAgICAvLyBBZGQgYmluYXJ5IGV4cG9uZW50IHN1ZmZpeD9cclxuICAgICAgICBpZiAoaXNFeHApIHtcclxuICAgICAgICAgIGlmIChsZW4gPiAxKSB7XHJcbiAgICAgICAgICAgIGlmIChiYXNlT3V0ID09IDE2IHx8IGJhc2VPdXQgPT0gOCkge1xyXG4gICAgICAgICAgICAgIGkgPSBiYXNlT3V0ID09IDE2ID8gNCA6IDM7XHJcbiAgICAgICAgICAgICAgZm9yICgtLWxlbjsgbGVuICUgaTsgbGVuKyspIHN0ciArPSAnMCc7XHJcbiAgICAgICAgICAgICAgeGQgPSBjb252ZXJ0QmFzZShzdHIsIGJhc2UsIGJhc2VPdXQpO1xyXG4gICAgICAgICAgICAgIGZvciAobGVuID0geGQubGVuZ3RoOyAheGRbbGVuIC0gMV07IC0tbGVuKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8geGRbMF0gd2lsbCBhbHdheXMgYmUgYmUgMVxyXG4gICAgICAgICAgICAgIGZvciAoaSA9IDEsIHN0ciA9ICcxLic7IGkgPCBsZW47IGkrKykgc3RyICs9IE5VTUVSQUxTLmNoYXJBdCh4ZFtpXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArICcuJyArIHN0ci5zbGljZSgxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHN0ciA9ICBzdHIgKyAoZSA8IDAgPyAncCcgOiAncCsnKSArIGU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG4gICAgICAgICAgZm9yICg7ICsrZTspIHN0ciA9ICcwJyArIHN0cjtcclxuICAgICAgICAgIHN0ciA9ICcwLicgKyBzdHI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICgrK2UgPiBsZW4pIGZvciAoZSAtPSBsZW47IGUtLSA7KSBzdHIgKz0gJzAnO1xyXG4gICAgICAgICAgZWxzZSBpZiAoZSA8IGxlbikgc3RyID0gc3RyLnNsaWNlKDAsIGUpICsgJy4nICsgc3RyLnNsaWNlKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgc3RyID0gKGJhc2VPdXQgPT0gMTYgPyAnMHgnIDogYmFzZU91dCA9PSAyID8gJzBiJyA6IGJhc2VPdXQgPT0gOCA/ICcwbycgOiAnJykgKyBzdHI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHgucyA8IDAgPyAnLScgKyBzdHIgOiBzdHI7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gRG9lcyBub3Qgc3RyaXAgdHJhaWxpbmcgemVyb3MuXHJcbiAgZnVuY3Rpb24gdHJ1bmNhdGUoYXJyLCBsZW4pIHtcclxuICAgIGlmIChhcnIubGVuZ3RoID4gbGVuKSB7XHJcbiAgICAgIGFyci5sZW5ndGggPSBsZW47XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIERlY2ltYWwgbWV0aG9kc1xyXG5cclxuXHJcbiAgLypcclxuICAgKiAgYWJzXHJcbiAgICogIGFjb3NcclxuICAgKiAgYWNvc2hcclxuICAgKiAgYWRkXHJcbiAgICogIGFzaW5cclxuICAgKiAgYXNpbmhcclxuICAgKiAgYXRhblxyXG4gICAqICBhdGFuaFxyXG4gICAqICBhdGFuMlxyXG4gICAqICBjYnJ0XHJcbiAgICogIGNlaWxcclxuICAgKiAgY2xhbXBcclxuICAgKiAgY2xvbmVcclxuICAgKiAgY29uZmlnXHJcbiAgICogIGNvc1xyXG4gICAqICBjb3NoXHJcbiAgICogIGRpdlxyXG4gICAqICBleHBcclxuICAgKiAgZmxvb3JcclxuICAgKiAgaHlwb3RcclxuICAgKiAgbG5cclxuICAgKiAgbG9nXHJcbiAgICogIGxvZzJcclxuICAgKiAgbG9nMTBcclxuICAgKiAgbWF4XHJcbiAgICogIG1pblxyXG4gICAqICBtb2RcclxuICAgKiAgbXVsXHJcbiAgICogIHBvd1xyXG4gICAqICByYW5kb21cclxuICAgKiAgcm91bmRcclxuICAgKiAgc2V0XHJcbiAgICogIHNpZ25cclxuICAgKiAgc2luXHJcbiAgICogIHNpbmhcclxuICAgKiAgc3FydFxyXG4gICAqICBzdWJcclxuICAgKiAgc3VtXHJcbiAgICogIHRhblxyXG4gICAqICB0YW5oXHJcbiAgICogIHRydW5jXHJcbiAgICovXHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiBgeGAuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBhYnMoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmFicygpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGFyY2Nvc2luZSBpbiByYWRpYW5zIG9mIGB4YC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFjb3MoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmFjb3MoKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBoeXBlcmJvbGljIGNvc2luZSBvZiBgeGAsIHJvdW5kZWQgdG9cclxuICAgKiBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBBIHZhbHVlIGluIHJhZGlhbnMuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBhY29zaCh4KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuYWNvc2goKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBzdW0gb2YgYHhgIGFuZCBgeWAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqIHkge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZCh4LCB5KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkucGx1cyh5KTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBhcmNzaW5lIGluIHJhZGlhbnMgb2YgYHhgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFzaW4oeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmFzaW4oKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBoeXBlcmJvbGljIHNpbmUgb2YgYHhgLCByb3VuZGVkIHRvXHJcbiAgICogYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gQSB2YWx1ZSBpbiByYWRpYW5zLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gYXNpbmgoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmFzaW5oKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgYXJjdGFuZ2VudCBpbiByYWRpYW5zIG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBhdGFuKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5hdGFuKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgaHlwZXJib2xpYyB0YW5nZW50IG9mIGB4YCwgcm91bmRlZCB0b1xyXG4gICAqIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IEEgdmFsdWUgaW4gcmFkaWFucy5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGF0YW5oKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5hdGFuaCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGFyY3RhbmdlbnQgaW4gcmFkaWFucyBvZiBgeS94YCBpbiB0aGUgcmFuZ2UgLXBpIHRvIHBpXHJcbiAgICogKGluY2x1c2l2ZSksIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIERvbWFpbjogWy1JbmZpbml0eSwgSW5maW5pdHldXHJcbiAgICogUmFuZ2U6IFstcGksIHBpXVxyXG4gICAqXHJcbiAgICogeSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgeS1jb29yZGluYXRlLlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gVGhlIHgtY29vcmRpbmF0ZS5cclxuICAgKlxyXG4gICAqIGF0YW4yKMKxMCwgLTApICAgICAgICAgICAgICAgPSDCsXBpXHJcbiAgICogYXRhbjIowrEwLCArMCkgICAgICAgICAgICAgICA9IMKxMFxyXG4gICAqIGF0YW4yKMKxMCwgLXgpICAgICAgICAgICAgICAgPSDCsXBpIGZvciB4ID4gMFxyXG4gICAqIGF0YW4yKMKxMCwgeCkgICAgICAgICAgICAgICAgPSDCsTAgZm9yIHggPiAwXHJcbiAgICogYXRhbjIoLXksIMKxMCkgICAgICAgICAgICAgICA9IC1waS8yIGZvciB5ID4gMFxyXG4gICAqIGF0YW4yKHksIMKxMCkgICAgICAgICAgICAgICAgPSBwaS8yIGZvciB5ID4gMFxyXG4gICAqIGF0YW4yKMKxeSwgLUluZmluaXR5KSAgICAgICAgPSDCsXBpIGZvciBmaW5pdGUgeSA+IDBcclxuICAgKiBhdGFuMijCsXksICtJbmZpbml0eSkgICAgICAgID0gwrEwIGZvciBmaW5pdGUgeSA+IDBcclxuICAgKiBhdGFuMijCsUluZmluaXR5LCB4KSAgICAgICAgID0gwrFwaS8yIGZvciBmaW5pdGUgeFxyXG4gICAqIGF0YW4yKMKxSW5maW5pdHksIC1JbmZpbml0eSkgPSDCsTMqcGkvNFxyXG4gICAqIGF0YW4yKMKxSW5maW5pdHksICtJbmZpbml0eSkgPSDCsXBpLzRcclxuICAgKiBhdGFuMihOYU4sIHgpID0gTmFOXHJcbiAgICogYXRhbjIoeSwgTmFOKSA9IE5hTlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gYXRhbjIoeSwgeCkge1xyXG4gICAgeSA9IG5ldyB0aGlzKHkpO1xyXG4gICAgeCA9IG5ldyB0aGlzKHgpO1xyXG4gICAgdmFyIHIsXHJcbiAgICAgIHByID0gdGhpcy5wcmVjaXNpb24sXHJcbiAgICAgIHJtID0gdGhpcy5yb3VuZGluZyxcclxuICAgICAgd3ByID0gcHIgKyA0O1xyXG5cclxuICAgIC8vIEVpdGhlciBOYU5cclxuICAgIGlmICgheS5zIHx8ICF4LnMpIHtcclxuICAgICAgciA9IG5ldyB0aGlzKE5hTik7XHJcblxyXG4gICAgLy8gQm90aCDCsUluZmluaXR5XHJcbiAgICB9IGVsc2UgaWYgKCF5LmQgJiYgIXguZCkge1xyXG4gICAgICByID0gZ2V0UGkodGhpcywgd3ByLCAxKS50aW1lcyh4LnMgPiAwID8gMC4yNSA6IDAuNzUpO1xyXG4gICAgICByLnMgPSB5LnM7XHJcblxyXG4gICAgLy8geCBpcyDCsUluZmluaXR5IG9yIHkgaXMgwrEwXHJcbiAgICB9IGVsc2UgaWYgKCF4LmQgfHwgeS5pc1plcm8oKSkge1xyXG4gICAgICByID0geC5zIDwgMCA/IGdldFBpKHRoaXMsIHByLCBybSkgOiBuZXcgdGhpcygwKTtcclxuICAgICAgci5zID0geS5zO1xyXG5cclxuICAgIC8vIHkgaXMgwrFJbmZpbml0eSBvciB4IGlzIMKxMFxyXG4gICAgfSBlbHNlIGlmICgheS5kIHx8IHguaXNaZXJvKCkpIHtcclxuICAgICAgciA9IGdldFBpKHRoaXMsIHdwciwgMSkudGltZXMoMC41KTtcclxuICAgICAgci5zID0geS5zO1xyXG5cclxuICAgIC8vIEJvdGggbm9uLXplcm8gYW5kIGZpbml0ZVxyXG4gICAgfSBlbHNlIGlmICh4LnMgPCAwKSB7XHJcbiAgICAgIHRoaXMucHJlY2lzaW9uID0gd3ByO1xyXG4gICAgICB0aGlzLnJvdW5kaW5nID0gMTtcclxuICAgICAgciA9IHRoaXMuYXRhbihkaXZpZGUoeSwgeCwgd3ByLCAxKSk7XHJcbiAgICAgIHggPSBnZXRQaSh0aGlzLCB3cHIsIDEpO1xyXG4gICAgICB0aGlzLnByZWNpc2lvbiA9IHByO1xyXG4gICAgICB0aGlzLnJvdW5kaW5nID0gcm07XHJcbiAgICAgIHIgPSB5LnMgPCAwID8gci5taW51cyh4KSA6IHIucGx1cyh4KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHIgPSB0aGlzLmF0YW4oZGl2aWRlKHksIHgsIHdwciwgMSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGN1YmUgcm9vdCBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY2JydCh4KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuY2JydCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIHJvdW5kZWQgdG8gYW4gaW50ZWdlciB1c2luZyBgUk9VTkRfQ0VJTGAuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBjZWlsKHgpIHtcclxuICAgIHJldHVybiBmaW5hbGlzZSh4ID0gbmV3IHRoaXMoeCksIHguZSArIDEsIDIpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIGNsYW1wZWQgdG8gdGhlIHJhbmdlIGRlbGluZWF0ZWQgYnkgYG1pbmAgYW5kIGBtYXhgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqIG1pbiB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqIG1heCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY2xhbXAoeCwgbWluLCBtYXgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5jbGFtcChtaW4sIG1heCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBDb25maWd1cmUgZ2xvYmFsIHNldHRpbmdzIGZvciBhIERlY2ltYWwgY29uc3RydWN0b3IuXHJcbiAgICpcclxuICAgKiBgb2JqYCBpcyBhbiBvYmplY3Qgd2l0aCBvbmUgb3IgbW9yZSBvZiB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXMsXHJcbiAgICpcclxuICAgKiAgIHByZWNpc2lvbiAge251bWJlcn1cclxuICAgKiAgIHJvdW5kaW5nICAge251bWJlcn1cclxuICAgKiAgIHRvRXhwTmVnICAge251bWJlcn1cclxuICAgKiAgIHRvRXhwUG9zICAge251bWJlcn1cclxuICAgKiAgIG1heEUgICAgICAge251bWJlcn1cclxuICAgKiAgIG1pbkUgICAgICAge251bWJlcn1cclxuICAgKiAgIG1vZHVsbyAgICAge251bWJlcn1cclxuICAgKiAgIGNyeXB0byAgICAge2Jvb2xlYW58bnVtYmVyfVxyXG4gICAqICAgZGVmYXVsdHMgICB7dHJ1ZX1cclxuICAgKlxyXG4gICAqIEUuZy4gRGVjaW1hbC5jb25maWcoeyBwcmVjaXNpb246IDIwLCByb3VuZGluZzogNCB9KVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY29uZmlnKG9iaikge1xyXG4gICAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHRocm93IEVycm9yKGRlY2ltYWxFcnJvciArICdPYmplY3QgZXhwZWN0ZWQnKTtcclxuICAgIHZhciBpLCBwLCB2LFxyXG4gICAgICB1c2VEZWZhdWx0cyA9IG9iai5kZWZhdWx0cyA9PT0gdHJ1ZSxcclxuICAgICAgcHMgPSBbXHJcbiAgICAgICAgJ3ByZWNpc2lvbicsIDEsIE1BWF9ESUdJVFMsXHJcbiAgICAgICAgJ3JvdW5kaW5nJywgMCwgOCxcclxuICAgICAgICAndG9FeHBOZWcnLCAtRVhQX0xJTUlULCAwLFxyXG4gICAgICAgICd0b0V4cFBvcycsIDAsIEVYUF9MSU1JVCxcclxuICAgICAgICAnbWF4RScsIDAsIEVYUF9MSU1JVCxcclxuICAgICAgICAnbWluRScsIC1FWFBfTElNSVQsIDAsXHJcbiAgICAgICAgJ21vZHVsbycsIDAsIDlcclxuICAgICAgXTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgcHMubGVuZ3RoOyBpICs9IDMpIHtcclxuICAgICAgaWYgKHAgPSBwc1tpXSwgdXNlRGVmYXVsdHMpIHRoaXNbcF0gPSBERUZBVUxUU1twXTtcclxuICAgICAgaWYgKCh2ID0gb2JqW3BdKSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgaWYgKG1hdGhmbG9vcih2KSA9PT0gdiAmJiB2ID49IHBzW2kgKyAxXSAmJiB2IDw9IHBzW2kgKyAyXSkgdGhpc1twXSA9IHY7XHJcbiAgICAgICAgZWxzZSB0aHJvdyBFcnJvcihpbnZhbGlkQXJndW1lbnQgKyBwICsgJzogJyArIHYpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHAgPSAnY3J5cHRvJywgdXNlRGVmYXVsdHMpIHRoaXNbcF0gPSBERUZBVUxUU1twXTtcclxuICAgIGlmICgodiA9IG9ialtwXSkgIT09IHZvaWQgMCkge1xyXG4gICAgICBpZiAodiA9PT0gdHJ1ZSB8fCB2ID09PSBmYWxzZSB8fCB2ID09PSAwIHx8IHYgPT09IDEpIHtcclxuICAgICAgICBpZiAodikge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBjcnlwdG8gIT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvICYmXHJcbiAgICAgICAgICAgIChjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzIHx8IGNyeXB0by5yYW5kb21CeXRlcykpIHtcclxuICAgICAgICAgICAgdGhpc1twXSA9IHRydWU7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihjcnlwdG9VbmF2YWlsYWJsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXNbcF0gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgRXJyb3IoaW52YWxpZEFyZ3VtZW50ICsgcCArICc6ICcgKyB2KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGNvc2luZSBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBBIHZhbHVlIGluIHJhZGlhbnMuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBjb3MoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmNvcygpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGh5cGVyYm9saWMgY29zaW5lIG9mIGB4YCwgcm91bmRlZCB0byBwcmVjaXNpb25cclxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBBIHZhbHVlIGluIHJhZGlhbnMuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBjb3NoKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5jb3NoKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIERlY2ltYWwgY29uc3RydWN0b3Igd2l0aCB0aGUgc2FtZSBjb25maWd1cmF0aW9uIHByb3BlcnRpZXMgYXMgdGhpcyBEZWNpbWFsXHJcbiAgICogY29uc3RydWN0b3IuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBjbG9uZShvYmopIHtcclxuICAgIHZhciBpLCBwLCBwcztcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIERlY2ltYWwgY29uc3RydWN0b3IgYW5kIGV4cG9ydGVkIGZ1bmN0aW9uLlxyXG4gICAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgaW5zdGFuY2UuXHJcbiAgICAgKlxyXG4gICAgICogdiB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBEZWNpbWFsKHYpIHtcclxuICAgICAgdmFyIGUsIGksIHQsXHJcbiAgICAgICAgeCA9IHRoaXM7XHJcblxyXG4gICAgICAvLyBEZWNpbWFsIGNhbGxlZCB3aXRob3V0IG5ldy5cclxuICAgICAgaWYgKCEoeCBpbnN0YW5jZW9mIERlY2ltYWwpKSByZXR1cm4gbmV3IERlY2ltYWwodik7XHJcblxyXG4gICAgICAvLyBSZXRhaW4gYSByZWZlcmVuY2UgdG8gdGhpcyBEZWNpbWFsIGNvbnN0cnVjdG9yLCBhbmQgc2hhZG93IERlY2ltYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yXHJcbiAgICAgIC8vIHdoaWNoIHBvaW50cyB0byBPYmplY3QuXHJcbiAgICAgIHguY29uc3RydWN0b3IgPSBEZWNpbWFsO1xyXG5cclxuICAgICAgLy8gRHVwbGljYXRlLlxyXG4gICAgICBpZiAoaXNEZWNpbWFsSW5zdGFuY2UodikpIHtcclxuICAgICAgICB4LnMgPSB2LnM7XHJcblxyXG4gICAgICAgIGlmIChleHRlcm5hbCkge1xyXG4gICAgICAgICAgaWYgKCF2LmQgfHwgdi5lID4gRGVjaW1hbC5tYXhFKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJbmZpbml0eS5cclxuICAgICAgICAgICAgeC5lID0gTmFOO1xyXG4gICAgICAgICAgICB4LmQgPSBudWxsO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICh2LmUgPCBEZWNpbWFsLm1pbkUpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgIHguZSA9IDA7XHJcbiAgICAgICAgICAgIHguZCA9IFswXTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHguZSA9IHYuZTtcclxuICAgICAgICAgICAgeC5kID0gdi5kLnNsaWNlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHguZSA9IHYuZTtcclxuICAgICAgICAgIHguZCA9IHYuZCA/IHYuZC5zbGljZSgpIDogdi5kO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0ID0gdHlwZW9mIHY7XHJcblxyXG4gICAgICBpZiAodCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICBpZiAodiA9PT0gMCkge1xyXG4gICAgICAgICAgeC5zID0gMSAvIHYgPCAwID8gLTEgOiAxO1xyXG4gICAgICAgICAgeC5lID0gMDtcclxuICAgICAgICAgIHguZCA9IFswXTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh2IDwgMCkge1xyXG4gICAgICAgICAgdiA9IC12O1xyXG4gICAgICAgICAgeC5zID0gLTE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHgucyA9IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBGYXN0IHBhdGggZm9yIHNtYWxsIGludGVnZXJzLlxyXG4gICAgICAgIGlmICh2ID09PSB+fnYgJiYgdiA8IDFlNykge1xyXG4gICAgICAgICAgZm9yIChlID0gMCwgaSA9IHY7IGkgPj0gMTA7IGkgLz0gMTApIGUrKztcclxuXHJcbiAgICAgICAgICBpZiAoZXh0ZXJuYWwpIHtcclxuICAgICAgICAgICAgaWYgKGUgPiBEZWNpbWFsLm1heEUpIHtcclxuICAgICAgICAgICAgICB4LmUgPSBOYU47XHJcbiAgICAgICAgICAgICAgeC5kID0gbnVsbDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlIDwgRGVjaW1hbC5taW5FKSB7XHJcbiAgICAgICAgICAgICAgeC5lID0gMDtcclxuICAgICAgICAgICAgICB4LmQgPSBbMF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgeC5lID0gZTtcclxuICAgICAgICAgICAgICB4LmQgPSBbdl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHguZSA9IGU7XHJcbiAgICAgICAgICAgIHguZCA9IFt2XTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIEluZmluaXR5LCBOYU4uXHJcbiAgICAgICAgfSBlbHNlIGlmICh2ICogMCAhPT0gMCkge1xyXG4gICAgICAgICAgaWYgKCF2KSB4LnMgPSBOYU47XHJcbiAgICAgICAgICB4LmUgPSBOYU47XHJcbiAgICAgICAgICB4LmQgPSBudWxsO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRGVjaW1hbCh4LCB2LnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgfSBlbHNlIGlmICh0ICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgIHRocm93IEVycm9yKGludmFsaWRBcmd1bWVudCArIHYpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBNaW51cyBzaWduP1xyXG4gICAgICBpZiAoKGkgPSB2LmNoYXJDb2RlQXQoMCkpID09PSA0NSkge1xyXG4gICAgICAgIHYgPSB2LnNsaWNlKDEpO1xyXG4gICAgICAgIHgucyA9IC0xO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIFBsdXMgc2lnbj9cclxuICAgICAgICBpZiAoaSA9PT0gNDMpIHYgPSB2LnNsaWNlKDEpO1xyXG4gICAgICAgIHgucyA9IDE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBpc0RlY2ltYWwudGVzdCh2KSA/IHBhcnNlRGVjaW1hbCh4LCB2KSA6IHBhcnNlT3RoZXIoeCwgdik7XHJcbiAgICB9XHJcblxyXG4gICAgRGVjaW1hbC5wcm90b3R5cGUgPSBQO1xyXG5cclxuICAgIERlY2ltYWwuUk9VTkRfVVAgPSAwO1xyXG4gICAgRGVjaW1hbC5ST1VORF9ET1dOID0gMTtcclxuICAgIERlY2ltYWwuUk9VTkRfQ0VJTCA9IDI7XHJcbiAgICBEZWNpbWFsLlJPVU5EX0ZMT09SID0gMztcclxuICAgIERlY2ltYWwuUk9VTkRfSEFMRl9VUCA9IDQ7XHJcbiAgICBEZWNpbWFsLlJPVU5EX0hBTEZfRE9XTiA9IDU7XHJcbiAgICBEZWNpbWFsLlJPVU5EX0hBTEZfRVZFTiA9IDY7XHJcbiAgICBEZWNpbWFsLlJPVU5EX0hBTEZfQ0VJTCA9IDc7XHJcbiAgICBEZWNpbWFsLlJPVU5EX0hBTEZfRkxPT1IgPSA4O1xyXG4gICAgRGVjaW1hbC5FVUNMSUQgPSA5O1xyXG5cclxuICAgIERlY2ltYWwuY29uZmlnID0gRGVjaW1hbC5zZXQgPSBjb25maWc7XHJcbiAgICBEZWNpbWFsLmNsb25lID0gY2xvbmU7XHJcbiAgICBEZWNpbWFsLmlzRGVjaW1hbCA9IGlzRGVjaW1hbEluc3RhbmNlO1xyXG5cclxuICAgIERlY2ltYWwuYWJzID0gYWJzO1xyXG4gICAgRGVjaW1hbC5hY29zID0gYWNvcztcclxuICAgIERlY2ltYWwuYWNvc2ggPSBhY29zaDsgICAgICAgIC8vIEVTNlxyXG4gICAgRGVjaW1hbC5hZGQgPSBhZGQ7XHJcbiAgICBEZWNpbWFsLmFzaW4gPSBhc2luO1xyXG4gICAgRGVjaW1hbC5hc2luaCA9IGFzaW5oOyAgICAgICAgLy8gRVM2XHJcbiAgICBEZWNpbWFsLmF0YW4gPSBhdGFuO1xyXG4gICAgRGVjaW1hbC5hdGFuaCA9IGF0YW5oOyAgICAgICAgLy8gRVM2XHJcbiAgICBEZWNpbWFsLmF0YW4yID0gYXRhbjI7XHJcbiAgICBEZWNpbWFsLmNicnQgPSBjYnJ0OyAgICAgICAgICAvLyBFUzZcclxuICAgIERlY2ltYWwuY2VpbCA9IGNlaWw7XHJcbiAgICBEZWNpbWFsLmNsYW1wID0gY2xhbXA7XHJcbiAgICBEZWNpbWFsLmNvcyA9IGNvcztcclxuICAgIERlY2ltYWwuY29zaCA9IGNvc2g7ICAgICAgICAgIC8vIEVTNlxyXG4gICAgRGVjaW1hbC5kaXYgPSBkaXY7XHJcbiAgICBEZWNpbWFsLmV4cCA9IGV4cDtcclxuICAgIERlY2ltYWwuZmxvb3IgPSBmbG9vcjtcclxuICAgIERlY2ltYWwuaHlwb3QgPSBoeXBvdDsgICAgICAgIC8vIEVTNlxyXG4gICAgRGVjaW1hbC5sbiA9IGxuO1xyXG4gICAgRGVjaW1hbC5sb2cgPSBsb2c7XHJcbiAgICBEZWNpbWFsLmxvZzEwID0gbG9nMTA7ICAgICAgICAvLyBFUzZcclxuICAgIERlY2ltYWwubG9nMiA9IGxvZzI7ICAgICAgICAgIC8vIEVTNlxyXG4gICAgRGVjaW1hbC5tYXggPSBtYXg7XHJcbiAgICBEZWNpbWFsLm1pbiA9IG1pbjtcclxuICAgIERlY2ltYWwubW9kID0gbW9kO1xyXG4gICAgRGVjaW1hbC5tdWwgPSBtdWw7XHJcbiAgICBEZWNpbWFsLnBvdyA9IHBvdztcclxuICAgIERlY2ltYWwucmFuZG9tID0gcmFuZG9tO1xyXG4gICAgRGVjaW1hbC5yb3VuZCA9IHJvdW5kO1xyXG4gICAgRGVjaW1hbC5zaWduID0gc2lnbjsgICAgICAgICAgLy8gRVM2XHJcbiAgICBEZWNpbWFsLnNpbiA9IHNpbjtcclxuICAgIERlY2ltYWwuc2luaCA9IHNpbmg7ICAgICAgICAgIC8vIEVTNlxyXG4gICAgRGVjaW1hbC5zcXJ0ID0gc3FydDtcclxuICAgIERlY2ltYWwuc3ViID0gc3ViO1xyXG4gICAgRGVjaW1hbC5zdW0gPSBzdW07XHJcbiAgICBEZWNpbWFsLnRhbiA9IHRhbjtcclxuICAgIERlY2ltYWwudGFuaCA9IHRhbmg7ICAgICAgICAgIC8vIEVTNlxyXG4gICAgRGVjaW1hbC50cnVuYyA9IHRydW5jOyAgICAgICAgLy8gRVM2XHJcblxyXG4gICAgaWYgKG9iaiA9PT0gdm9pZCAwKSBvYmogPSB7fTtcclxuICAgIGlmIChvYmopIHtcclxuICAgICAgaWYgKG9iai5kZWZhdWx0cyAhPT0gdHJ1ZSkge1xyXG4gICAgICAgIHBzID0gWydwcmVjaXNpb24nLCAncm91bmRpbmcnLCAndG9FeHBOZWcnLCAndG9FeHBQb3MnLCAnbWF4RScsICdtaW5FJywgJ21vZHVsbycsICdjcnlwdG8nXTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcHMubGVuZ3RoOykgaWYgKCFvYmouaGFzT3duUHJvcGVydHkocCA9IHBzW2krK10pKSBvYmpbcF0gPSB0aGlzW3BdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgRGVjaW1hbC5jb25maWcob2JqKTtcclxuXHJcbiAgICByZXR1cm4gRGVjaW1hbDtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIGB4YCBkaXZpZGVkIGJ5IGB5YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudFxyXG4gICAqIGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICogeSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZGl2KHgsIHkpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5kaXYoeSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbmF0dXJhbCBleHBvbmVudGlhbCBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmBcclxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgcG93ZXIgdG8gd2hpY2ggdG8gcmFpc2UgdGhlIGJhc2Ugb2YgdGhlIG5hdHVyYWwgbG9nLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZXhwKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5leHAoKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIGB4YCByb3VuZCB0byBhbiBpbnRlZ2VyIHVzaW5nIGBST1VORF9GTE9PUmAuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBmbG9vcih4KSB7XHJcbiAgICByZXR1cm4gZmluYWxpc2UoeCA9IG5ldyB0aGlzKHgpLCB4LmUgKyAxLCAzKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiB0aGUgc3VtIG9mIHRoZSBzcXVhcmVzIG9mIHRoZSBhcmd1bWVudHMsXHJcbiAgICogcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogaHlwb3QoYSwgYiwgLi4uKSA9IHNxcnQoYV4yICsgYl4yICsgLi4uKVxyXG4gICAqXHJcbiAgICogYXJndW1lbnRzIHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBoeXBvdCgpIHtcclxuICAgIHZhciBpLCBuLFxyXG4gICAgICB0ID0gbmV3IHRoaXMoMCk7XHJcblxyXG4gICAgZXh0ZXJuYWwgPSBmYWxzZTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDspIHtcclxuICAgICAgbiA9IG5ldyB0aGlzKGFyZ3VtZW50c1tpKytdKTtcclxuICAgICAgaWYgKCFuLmQpIHtcclxuICAgICAgICBpZiAobi5zKSB7XHJcbiAgICAgICAgICBleHRlcm5hbCA9IHRydWU7XHJcbiAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoMSAvIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0ID0gbjtcclxuICAgICAgfSBlbHNlIGlmICh0LmQpIHtcclxuICAgICAgICB0ID0gdC5wbHVzKG4udGltZXMobikpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiB0LnNxcnQoKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0cnVlIGlmIG9iamVjdCBpcyBhIERlY2ltYWwgaW5zdGFuY2UgKHdoZXJlIERlY2ltYWwgaXMgYW55IERlY2ltYWwgY29uc3RydWN0b3IpLFxyXG4gICAqIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBpc0RlY2ltYWxJbnN0YW5jZShvYmopIHtcclxuICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBEZWNpbWFsIHx8IG9iaiAmJiBvYmoudG9TdHJpbmdUYWcgPT09IHRhZyB8fCBmYWxzZTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBuYXR1cmFsIGxvZ2FyaXRobSBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmBcclxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gbG4oeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmxuKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbG9nIG9mIGB4YCB0byB0aGUgYmFzZSBgeWAsIG9yIHRvIGJhc2UgMTAgaWYgbm8gYmFzZVxyXG4gICAqIGlzIHNwZWNpZmllZCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogbG9nW3ldKHgpXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IFRoZSBhcmd1bWVudCBvZiB0aGUgbG9nYXJpdGhtLlxyXG4gICAqIHkge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gVGhlIGJhc2Ugb2YgdGhlIGxvZ2FyaXRobS5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGxvZyh4LCB5KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkubG9nKHkpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGJhc2UgMiBsb2dhcml0aG0gb2YgYHhgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGxvZzIoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmxvZygyKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBiYXNlIDEwIGxvZ2FyaXRobSBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmBcclxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gbG9nMTAoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmxvZygxMCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbWF4aW11bSBvZiB0aGUgYXJndW1lbnRzLlxyXG4gICAqXHJcbiAgICogYXJndW1lbnRzIHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBtYXgoKSB7XHJcbiAgICByZXR1cm4gbWF4T3JNaW4odGhpcywgYXJndW1lbnRzLCAnbHQnKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBtaW5pbXVtIG9mIHRoZSBhcmd1bWVudHMuXHJcbiAgICpcclxuICAgKiBhcmd1bWVudHMge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIG1pbigpIHtcclxuICAgIHJldHVybiBtYXhPck1pbih0aGlzLCBhcmd1bWVudHMsICdndCcpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIG1vZHVsbyBgeWAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzXHJcbiAgICogdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqIHkge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIG1vZCh4LCB5KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkubW9kKHkpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIG11bHRpcGxpZWQgYnkgYHlgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50XHJcbiAgICogZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKiB5IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBtdWwoeCwgeSkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLm11bCh5KTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIGB4YCByYWlzZWQgdG8gdGhlIHBvd2VyIGB5YCwgcm91bmRlZCB0byBwcmVjaXNpb25cclxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgYmFzZS5cclxuICAgKiB5IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IFRoZSBleHBvbmVudC5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHBvdyh4LCB5KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkucG93KHkpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJucyBhIG5ldyBEZWNpbWFsIHdpdGggYSByYW5kb20gdmFsdWUgZXF1YWwgdG8gb3IgZ3JlYXRlciB0aGFuIDAgYW5kIGxlc3MgdGhhbiAxLCBhbmQgd2l0aFxyXG4gICAqIGBzZGAsIG9yIGBEZWNpbWFsLnByZWNpc2lvbmAgaWYgYHNkYCBpcyBvbWl0dGVkLCBzaWduaWZpY2FudCBkaWdpdHMgKG9yIGxlc3MgaWYgdHJhaWxpbmcgemVyb3NcclxuICAgKiBhcmUgcHJvZHVjZWQpLlxyXG4gICAqXHJcbiAgICogW3NkXSB7bnVtYmVyfSBTaWduaWZpY2FudCBkaWdpdHMuIEludGVnZXIsIDAgdG8gTUFYX0RJR0lUUyBpbmNsdXNpdmUuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiByYW5kb20oc2QpIHtcclxuICAgIHZhciBkLCBlLCBrLCBuLFxyXG4gICAgICBpID0gMCxcclxuICAgICAgciA9IG5ldyB0aGlzKDEpLFxyXG4gICAgICByZCA9IFtdO1xyXG5cclxuICAgIGlmIChzZCA9PT0gdm9pZCAwKSBzZCA9IHRoaXMucHJlY2lzaW9uO1xyXG4gICAgZWxzZSBjaGVja0ludDMyKHNkLCAxLCBNQVhfRElHSVRTKTtcclxuXHJcbiAgICBrID0gTWF0aC5jZWlsKHNkIC8gTE9HX0JBU0UpO1xyXG5cclxuICAgIGlmICghdGhpcy5jcnlwdG8pIHtcclxuICAgICAgZm9yICg7IGkgPCBrOykgcmRbaSsrXSA9IE1hdGgucmFuZG9tKCkgKiAxZTcgfCAwO1xyXG5cclxuICAgIC8vIEJyb3dzZXJzIHN1cHBvcnRpbmcgY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5cclxuICAgIH0gZWxzZSBpZiAoY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xyXG4gICAgICBkID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDMyQXJyYXkoaykpO1xyXG5cclxuICAgICAgZm9yICg7IGkgPCBrOykge1xyXG4gICAgICAgIG4gPSBkW2ldO1xyXG5cclxuICAgICAgICAvLyAwIDw9IG4gPCA0Mjk0OTY3Mjk2XHJcbiAgICAgICAgLy8gUHJvYmFiaWxpdHkgbiA+PSA0LjI5ZTksIGlzIDQ5NjcyOTYgLyA0Mjk0OTY3Mjk2ID0gMC4wMDExNiAoMSBpbiA4NjUpLlxyXG4gICAgICAgIGlmIChuID49IDQuMjllOSkge1xyXG4gICAgICAgICAgZFtpXSA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQzMkFycmF5KDEpKVswXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIDAgPD0gbiA8PSA0Mjg5OTk5OTk5XHJcbiAgICAgICAgICAvLyAwIDw9IChuICUgMWU3KSA8PSA5OTk5OTk5XHJcbiAgICAgICAgICByZFtpKytdID0gbiAlIDFlNztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAvLyBOb2RlLmpzIHN1cHBvcnRpbmcgY3J5cHRvLnJhbmRvbUJ5dGVzLlxyXG4gICAgfSBlbHNlIGlmIChjcnlwdG8ucmFuZG9tQnl0ZXMpIHtcclxuXHJcbiAgICAgIC8vIGJ1ZmZlclxyXG4gICAgICBkID0gY3J5cHRvLnJhbmRvbUJ5dGVzKGsgKj0gNCk7XHJcblxyXG4gICAgICBmb3IgKDsgaSA8IGs7KSB7XHJcblxyXG4gICAgICAgIC8vIDAgPD0gbiA8IDIxNDc0ODM2NDhcclxuICAgICAgICBuID0gZFtpXSArIChkW2kgKyAxXSA8PCA4KSArIChkW2kgKyAyXSA8PCAxNikgKyAoKGRbaSArIDNdICYgMHg3ZikgPDwgMjQpO1xyXG5cclxuICAgICAgICAvLyBQcm9iYWJpbGl0eSBuID49IDIuMTRlOSwgaXMgNzQ4MzY0OCAvIDIxNDc0ODM2NDggPSAwLjAwMzUgKDEgaW4gMjg2KS5cclxuICAgICAgICBpZiAobiA+PSAyLjE0ZTkpIHtcclxuICAgICAgICAgIGNyeXB0by5yYW5kb21CeXRlcyg0KS5jb3B5KGQsIGkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gMCA8PSBuIDw9IDIxMzk5OTk5OTlcclxuICAgICAgICAgIC8vIDAgPD0gKG4gJSAxZTcpIDw9IDk5OTk5OTlcclxuICAgICAgICAgIHJkLnB1c2gobiAlIDFlNyk7XHJcbiAgICAgICAgICBpICs9IDQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpID0gayAvIDQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBFcnJvcihjcnlwdG9VbmF2YWlsYWJsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgayA9IHJkWy0taV07XHJcbiAgICBzZCAlPSBMT0dfQkFTRTtcclxuXHJcbiAgICAvLyBDb252ZXJ0IHRyYWlsaW5nIGRpZ2l0cyB0byB6ZXJvcyBhY2NvcmRpbmcgdG8gc2QuXHJcbiAgICBpZiAoayAmJiBzZCkge1xyXG4gICAgICBuID0gbWF0aHBvdygxMCwgTE9HX0JBU0UgLSBzZCk7XHJcbiAgICAgIHJkW2ldID0gKGsgLyBuIHwgMCkgKiBuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB3b3JkcyB3aGljaCBhcmUgemVyby5cclxuICAgIGZvciAoOyByZFtpXSA9PT0gMDsgaS0tKSByZC5wb3AoKTtcclxuXHJcbiAgICAvLyBaZXJvP1xyXG4gICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgIGUgPSAwO1xyXG4gICAgICByZCA9IFswXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGUgPSAtMTtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIHdvcmRzIHdoaWNoIGFyZSB6ZXJvIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgIGZvciAoOyByZFswXSA9PT0gMDsgZSAtPSBMT0dfQkFTRSkgcmQuc2hpZnQoKTtcclxuXHJcbiAgICAgIC8vIENvdW50IHRoZSBkaWdpdHMgb2YgdGhlIGZpcnN0IHdvcmQgb2YgcmQgdG8gZGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgIGZvciAoayA9IDEsIG4gPSByZFswXTsgbiA+PSAxMDsgbiAvPSAxMCkgaysrO1xyXG5cclxuICAgICAgLy8gQWRqdXN0IHRoZSBleHBvbmVudCBmb3IgbGVhZGluZyB6ZXJvcyBvZiB0aGUgZmlyc3Qgd29yZCBvZiByZC5cclxuICAgICAgaWYgKGsgPCBMT0dfQkFTRSkgZSAtPSBMT0dfQkFTRSAtIGs7XHJcbiAgICB9XHJcblxyXG4gICAgci5lID0gZTtcclxuICAgIHIuZCA9IHJkO1xyXG5cclxuICAgIHJldHVybiByO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIHJvdW5kZWQgdG8gYW4gaW50ZWdlciB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiBUbyBlbXVsYXRlIGBNYXRoLnJvdW5kYCwgc2V0IHJvdW5kaW5nIHRvIDcgKFJPVU5EX0hBTEZfQ0VJTCkuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiByb3VuZCh4KSB7XHJcbiAgICByZXR1cm4gZmluYWxpc2UoeCA9IG5ldyB0aGlzKHgpLCB4LmUgKyAxLCB0aGlzLnJvdW5kaW5nKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVyblxyXG4gICAqICAgMSAgICBpZiB4ID4gMCxcclxuICAgKiAgLTEgICAgaWYgeCA8IDAsXHJcbiAgICogICAwICAgIGlmIHggaXMgMCxcclxuICAgKiAgLTAgICAgaWYgeCBpcyAtMCxcclxuICAgKiAgIE5hTiAgb3RoZXJ3aXNlXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBzaWduKHgpIHtcclxuICAgIHggPSBuZXcgdGhpcyh4KTtcclxuICAgIHJldHVybiB4LmQgPyAoeC5kWzBdID8geC5zIDogMCAqIHgucykgOiB4LnMgfHwgTmFOO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHNpbmUgb2YgYHhgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0c1xyXG4gICAqIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gQSB2YWx1ZSBpbiByYWRpYW5zLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc2luKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5zaW4oKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBoeXBlcmJvbGljIHNpbmUgb2YgYHhgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gQSB2YWx1ZSBpbiByYWRpYW5zLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc2luaCh4KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuc2luaCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudFxyXG4gICAqIGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBzcXJ0KHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5zcXJ0KCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyBgeGAgbWludXMgYHlgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0c1xyXG4gICAqIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKiB5IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBzdWIoeCwgeSkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLnN1Yih5KTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBzdW0gb2YgdGhlIGFyZ3VtZW50cywgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiBPbmx5IHRoZSByZXN1bHQgaXMgcm91bmRlZCwgbm90IHRoZSBpbnRlcm1lZGlhdGUgY2FsY3VsYXRpb25zLlxyXG4gICAqXHJcbiAgICogYXJndW1lbnRzIHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBzdW0oKSB7XHJcbiAgICB2YXIgaSA9IDAsXHJcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHMsXHJcbiAgICAgIHggPSBuZXcgdGhpcyhhcmdzW2ldKTtcclxuXHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG4gICAgZm9yICg7IHgucyAmJiArK2kgPCBhcmdzLmxlbmd0aDspIHggPSB4LnBsdXMoYXJnc1tpXSk7XHJcbiAgICBleHRlcm5hbCA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIGZpbmFsaXNlKHgsIHRoaXMucHJlY2lzaW9uLCB0aGlzLnJvdW5kaW5nKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB0YW5nZW50IG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudFxyXG4gICAqIGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IEEgdmFsdWUgaW4gcmFkaWFucy5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHRhbih4KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkudGFuKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaHlwZXJib2xpYyB0YW5nZW50IG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IEEgdmFsdWUgaW4gcmFkaWFucy5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHRhbmgoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLnRhbmgoKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIGB4YCB0cnVuY2F0ZWQgdG8gYW4gaW50ZWdlci5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHRydW5jKHgpIHtcclxuICAgIHJldHVybiBmaW5hbGlzZSh4ID0gbmV3IHRoaXMoeCksIHguZSArIDEsIDEpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIENyZWF0ZSBhbmQgY29uZmlndXJlIGluaXRpYWwgRGVjaW1hbCBjb25zdHJ1Y3Rvci5cclxuICBEZWNpbWFsID0gY2xvbmUoREVGQVVMVFMpO1xyXG4gIERlY2ltYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRGVjaW1hbDtcclxuICBEZWNpbWFsWydkZWZhdWx0J10gPSBEZWNpbWFsLkRlY2ltYWwgPSBEZWNpbWFsO1xyXG5cclxuICAvLyBDcmVhdGUgdGhlIGludGVybmFsIGNvbnN0YW50cyBmcm9tIHRoZWlyIHN0cmluZyB2YWx1ZXMuXHJcbiAgTE4xMCA9IG5ldyBEZWNpbWFsKExOMTApO1xyXG4gIFBJID0gbmV3IERlY2ltYWwoUEkpO1xyXG5cclxuXHJcbiAgLy8gRXhwb3J0LlxyXG5cclxuXHJcbiAgLy8gQU1ELlxyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIERlY2ltYWw7XHJcbiAgICB9KTtcclxuXHJcbiAgLy8gTm9kZSBhbmQgb3RoZXIgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cy5cclxuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgIGlmICh0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PSAnc3ltYm9sJykge1xyXG4gICAgICBQW1N5bWJvbFsnZm9yJ10oJ25vZGVqcy51dGlsLmluc3BlY3QuY3VzdG9tJyldID0gUC50b1N0cmluZztcclxuICAgICAgUFtTeW1ib2wudG9TdHJpbmdUYWddID0gJ0RlY2ltYWwnO1xyXG4gICAgfVxyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gRGVjaW1hbDtcclxuXHJcbiAgLy8gQnJvd3Nlci5cclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKCFnbG9iYWxTY29wZSkge1xyXG4gICAgICBnbG9iYWxTY29wZSA9IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYgJiYgc2VsZi5zZWxmID09IHNlbGYgPyBzZWxmIDogd2luZG93O1xyXG4gICAgfVxyXG5cclxuICAgIG5vQ29uZmxpY3QgPSBnbG9iYWxTY29wZS5EZWNpbWFsO1xyXG4gICAgRGVjaW1hbC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBnbG9iYWxTY29wZS5EZWNpbWFsID0gbm9Db25mbGljdDtcclxuICAgICAgcmV0dXJuIERlY2ltYWw7XHJcbiAgICB9O1xyXG5cclxuICAgIGdsb2JhbFNjb3BlLkRlY2ltYWwgPSBEZWNpbWFsO1xyXG4gIH1cclxufSkodGhpcyk7XHJcbiIsIi8qKlxuKiBAbGljZW5zZSBNSVRcbiogQGF1dGhvciA8c3RldmVuQHZlbG96by5jb20+XG4qL1xuXG4vKipcbiogSW5zdHJ1Y3Rpb24gU2V0IEJhY2UgQ2xhc3MuXG4qXG4qIEBjbGFzcyBFbHVjaWRhdG9ySW5zdHJ1Y3Rpb25TZXRcbiovXG5jbGFzcyBFbHVjaWRhdG9ySW5zdHJ1Y3Rpb25TZXRcbntcbiAgICBjb25zdHJ1Y3RvcihwRWx1Y2lkYXRvcilcbiAgICB7XG4gICAgICAgIHRoaXMuZWx1Y2lkYXRvciA9IHBFbHVjaWRhdG9yO1xuXG4gICAgICAgIHRoaXMubmFtZXNwYWNlID0gJ2RlZmF1bHQnO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhbiBlbXB0eSBuYW1lc3BhY2UgZm9yIGluc3RydWN0aW9ucyBhbmQgb3BlcmF0aW9ucyBpZiBlaXRoZXIgb25lIGRvZXNuJ3QgZXhpc3RcbiAgICBpbml0aWFsaXplTmFtZXNwYWNlKHBOYW1lc3BhY2UpXG4gICAge1xuICAgICAgICBpZiAodHlwZW9mKHBOYW1lc3BhY2UpID09ICdzdHJpbmcnKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLm5hbWVzcGFjZSA9IHBOYW1lc3BhY2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmVsdWNpZGF0b3IuaW5zdHJ1Y3Rpb25TZXRzLmhhc093blByb3BlcnR5KHRoaXMubmFtZXNwYWNlKSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5lbHVjaWRhdG9yLmluc3RydWN0aW9uU2V0c1t0aGlzLm5hbWVzcGFjZS50b0xvd2VyQ2FzZSgpXSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5lbHVjaWRhdG9yLm9wZXJhdGlvblNldHMuaGFzT3duUHJvcGVydHkodGhpcy5uYW1lc3BhY2UpKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmVsdWNpZGF0b3Iub3BlcmF0aW9uU2V0c1t0aGlzLm5hbWVzcGFjZS50b0xvd2VyQ2FzZSgpXSA9IHt9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGFuIGluc3RydWN0aW9uIHRvIHRoZSBzZXRcbiAgICBhZGRJbnN0cnVjdGlvbihwSW5zdHJ1Y3Rpb25IYXNoLCBmSW5zdHJ1Y3Rpb25GdW5jdGlvbilcbiAgICB7XG4gICAgICAgIGlmICh0eXBlb2YocEluc3RydWN0aW9uSGFzaCkgIT0gJ3N0cmluZycpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuZWx1Y2lkYXRvci5sb2dFcnJvcihgQXR0ZW1wdGVkIHRvIGFkZCBhbiBpbnN0cnVjdGlvbiB3aXRoIGFuIGludmFsaWQgaGFzaDsgZXhwZWN0ZWQgYSBzdHJpbmcgYnV0IHRoZSBpbnN0cnVjdGlvbiBoYXNoIHR5cGUgd2FzICR7dHlwZW9mKHBJbnN0cnVjdGlvbkhhc2gpfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YoZkluc3RydWN0aW9uRnVuY3Rpb24pICE9ICdmdW5jdGlvbicpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuZWx1Y2lkYXRvci5sb2dFcnJvcihgQXR0ZW1wdGVkIHRvIGFkZCBhbiBpbnN0cnVjdGlvbiB3aXRoIGFuIGludmFsaWQgZnVuY3Rpb247IGV4cGVjdGVkIGEgZnVuY3Rpb24gYnV0IHR5cGUgd2FzICR7dHlwZW9mKGZJbnN0cnVjdGlvbkZ1bmN0aW9uKX1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWx1Y2lkYXRvci5pbnN0cnVjdGlvblNldHNbdGhpcy5uYW1lc3BhY2UudG9Mb3dlckNhc2UoKV1bcEluc3RydWN0aW9uSGFzaF0gPSBmSW5zdHJ1Y3Rpb25GdW5jdGlvbjtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZUluc3RydWN0aW9ucygpXG4gICAge1xuICAgICAgICAvLyBUaGlzIGlzIHdoZXJlIHdlIG1hcCBpbiB0aGUgaW5zdHJ1Y3Rpb25zLlxuICAgICAgICAvLyBJZiB0aGUgZXh0ZW5kaW5nIGNsYXNzIGNhbGxzIHN1cGVyIGl0IHdpbGwgaW5qZWN0IGEgaGFybWxlc3Mgbm9vcCBpbnRvIHRoZSBzY29wZS5cbiAgICAgICAgLy8gSXQgaXNuJ3QgcmVjb21tZW5kZWQgdG8gZG8gdGhlc2UgaW5saW5lIGFzIGxhbWJkYXMsIGJ1dCB0aGlzIGNvZGUgaXMgZ2VuZXJhbGx5IG5vdCBleHBlY3RlZCB0byBiZSBjYWxsZWQuXG4gICAgICAgIC8vIFVubGVzcyB0aGUgZGV2ZWxvcGVyIHdhbnRzIGEgbm9vcCBpbiB0aGVpciBpbnN0cnVjdGlvbiBzZXQuLi4uLi4uLi4uLlxuICAgICAgICB0aGlzLmFkZEluc3RydWN0aW9uKCdub29wJywgXG4gICAgICAgICAgICAocE9wZXJhdGlvbikgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBwT3BlcmF0aW9uLmxvZ0luZm8oJ0V4ZWN1dGluZyBhIG5vLW9wZXJhdGlvbiBvcGVyYXRpb24uJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBBZGQgYW4gb3BlcmF0aW9uIHRvIHRoZSBzZXRcbiAgICBhZGRPcGVyYXRpb24ocE9wZXJhdGlvbkhhc2gsIHBPcGVyYXRpb24pXG4gICAge1xuICAgICAgICBpZiAodHlwZW9mKHBPcGVyYXRpb25IYXNoKSAhPSAnc3RyaW5nJylcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5lbHVjaWRhdG9yLmxvZ0Vycm9yKGBBdHRlbXB0ZWQgdG8gYWRkIGFuIG9wZXJhdGlvbiB3aXRoIGFuIGludmFsaWQgaGFzaDsgZXhwZWN0ZWQgYSBzdHJpbmcgYnV0IHRoZSBvcGVyYXRpb24gaGFzaCB0eXBlIHdhcyAke3R5cGVvZihwT3BlcmF0aW9uSGFzaCl9YCwgcE9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZihwT3BlcmF0aW9uKSAhPSAnb2JqZWN0JylcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5lbHVjaWRhdG9yLmxvZ0Vycm9yKGBBdHRlbXB0ZWQgdG8gYWRkIGFuIGludmFsaWQgb3BlcmF0aW9uOyBleHBlY3RlZCBhbiBvYmplY3QgZGF0YSB0eXBlIGJ1dCB0aGUgdHlwZSB3YXMgJHt0eXBlb2YocE9wZXJhdGlvbil9YCwgcE9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVmFsaWRhdGUgdGhlIERlc2NyaXB0aW9uIHN1Ym9iamVjdCwgd2hpY2ggaXMga2V5IHRvIGZ1bmN0aW9uaW5nLlxuICAgICAgICBpZiAoIXBPcGVyYXRpb24uaGFzT3duUHJvcGVydHkoXCJEZXNjcmlwdGlvblwiKSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5lbHVjaWRhdG9yLmxvZ0Vycm9yKGBBdHRlbXB0ZWQgdG8gYWRkIGFuIG9wZXJhdGlvbiB3aXRoIGFuIGludmFsaWQgZGVzY3JpcHRpb247IG5vIERlc2NyaXB0aW9uIHN1Ym9iamVjdCBzZXQuYCwgcE9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZihwT3BlcmF0aW9uLkRlc2NyaXB0aW9uKSAhPSAnb2JqZWN0JylcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5lbHVjaWRhdG9yLmxvZ0Vycm9yKGBBdHRlbXB0ZWQgdG8gYWRkIGFuIG9wZXJhdGlvbiB3aXRoIGFuIGludmFsaWQgZGVzY3JpcHRpb247IERlc2NyaXB0aW9uIHN1Ym9iamVjdCB3YXMgbm90IGFuIG9iamVjdC4gIFRoZSB0eXBlIHdhcyAke3R5cGVvZihwT3BlcmF0aW9uLkRlc2NyaXB0aW9uKX0uYCwgcE9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZihwT3BlcmF0aW9uLkRlc2NyaXB0aW9uLkhhc2gpICE9ICdzdHJpbmcnKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAodHlwZW9mKHBPcGVyYXRpb24uRGVzY3JpcHRpb24uT3BlcmF0aW9uKSA9PSAnc3RyaW5nJylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBVc2UgdGhlIFwiT3BlcmF0aW9uXCIgYXMgdGhlIFwiSGFzaFwiXG4gICAgICAgICAgICAgICAgcE9wZXJhdGlvbi5EZXNjcmlwdGlvbi5IYXNoID0gcE9wZXJhdGlvbi5EZXNjcmlwdGlvbi5PcGVyYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbHVjaWRhdG9yLmxvZ0Vycm9yKGBBdHRlbXB0ZWQgdG8gYWRkIGFuIG9wZXJhdGlvbiB3aXRoIGFuIGludmFsaWQgZGVzY3JpcHRpb247IERlc2NyaXB0aW9uIHN1Ym9iamVjdCBkaWQgbm90IGNvbnRhaW4gYSB2YWxpZCBIYXNoIHdoaWNoIGlzIHJlcXVpcmVkIHRvIGNhbGwgdGhlIG9wZXJhdGlvbi5gLCBwT3BlcmF0aW9uKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3cgYXV0byBjcmVhdGUgZGF0YSBpZiBpdCBpcyBtaXNzaW5nIG9yIHdyb25nIGluIHRoZSBEZXNjcmlwdGlvblxuICAgICAgICBpZiAoKHR5cGVvZihwT3BlcmF0aW9uLkRlc2NyaXB0aW9uLk5hbWVzcGFjZSkgIT0gJ3N0cmluZycpIHx8IChwT3BlcmF0aW9uLkRlc2NyaXB0aW9uLk5hbWVzcGFjZSAhPSB0aGlzLm5hbWVzcGFjZSkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHBPcGVyYXRpb24uRGVzY3JpcHRpb24uTmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZihwT3BlcmF0aW9uLkRlc2NyaXB0aW9uLlN1bW1hcnkpICE9ICdzdHJpbmcnKVxuICAgICAgICB7XG4gICAgICAgICAgICBwT3BlcmF0aW9uLkRlc2NyaXB0aW9uLlN1bW1hcnkgPSBgWyR7cE9wZXJhdGlvbi5EZXNjcmlwdGlvbi5OYW1lc3BhY2V9XSBbJHtwT3BlcmF0aW9uLkRlc2NyaXB0aW9uLkhhc2h9XSBvcGVyYXRpb24uYDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBpbnB1dHMsIG9yIG91dHB1dHMsIG9yIHN0ZXBzLCBhZGQgdGhlbS5cbiAgICAgICAgaWYgKCFwT3BlcmF0aW9uLmhhc093blByb3BlcnR5KCdJbnB1dHMnKSlcbiAgICAgICAge1xuICAgICAgICAgICAgcE9wZXJhdGlvbi5JbnB1dHMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBPcGVyYXRpb24uaGFzT3duUHJvcGVydHkoJ091dHB1dHMnKSlcbiAgICAgICAge1xuICAgICAgICAgICAgcE9wZXJhdGlvbi5PdXRwdXRzID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwT3BlcmF0aW9uLmhhc093blByb3BlcnR5KCdTdGVwcycpKVxuICAgICAgICB7XG4gICAgICAgICAgICBwT3BlcmF0aW9uLlN0ZXBzID0gW107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gaW5wdXRzLCBvciBvdXRwdXRzLCBvciBzdGVwcywgYWRkIHRoZW0uXG4gICAgICAgIC8vIFRPRE86IEFkZCBhIHN0ZXAgd2hlcmUgd2UgdHJ5IHRvIGxvYWQgdGhpcyBpbnRvIE1hbnlmZXN0IGFuZCBzZWUgdGhhdCBpdCdzIHZhbGlkLlxuICAgICAgICBpZiAodHlwZW9mKHBPcGVyYXRpb24uSW5wdXRzKSAhPT0gJ29iamVjdCcpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuZWx1Y2lkYXRvci5sb2dFcnJvcihgQXR0ZW1wdGVkIHRvIGFkZCBhbiBvcGVyYXRpb24gd2l0aCBhbiBpbnZhbGlkIElucHV0cyBvYmplY3QuYCwgcE9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIGlucHV0cywgb3Igb3V0cHV0cywgb3Igc3RlcHMsIGFkZCB0aGVtLlxuICAgICAgICAvLyBUT0RPOiBBZGQgYSBzdGVwIHdoZXJlIHdlIHRyeSB0byBsb2FkIHRoaXMgaW50byBNYW55ZmVzdCBhbmQgc2VlIHRoYXQgaXQncyB2YWxpZC5cbiAgICAgICAgaWYgKHR5cGVvZihwT3BlcmF0aW9uLk91dHB1dHMpICE9PSAnb2JqZWN0JylcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5lbHVjaWRhdG9yLmxvZ0Vycm9yKGBBdHRlbXB0ZWQgdG8gYWRkIGFuIG9wZXJhdGlvbiB3aXRoIGFuIGludmFsaWQgT3V0cHV0cyBvYmplY3QuYCwgcE9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHBPcGVyYXRpb24uU3RlcHMpKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmVsdWNpZGF0b3IubG9nRXJyb3IoYEF0dGVtcHRlZCB0byBhZGQgYW4gb3BlcmF0aW9uIHdpdGggYW4gaW52YWxpZCBTdGVwcyBhcnJheS5gLCBwT3BlcmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgdGhpcy5lbHVjaWRhdG9yLm9wZXJhdGlvblNldHNbdGhpcy5uYW1lc3BhY2UudG9Mb3dlckNhc2UoKV1bcE9wZXJhdGlvbkhhc2gudG9Mb3dlckNhc2UoKV0gPSBwT3BlcmF0aW9uO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpbml0aWFsaXplT3BlcmF0aW9ucygpXG4gICAge1xuICAgICAgICB0aGlzLmFkZE9wZXJhdGlvbignbm9vcCcsIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiRGVzY3JpcHRpb25cIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwibm9vcFwiLFxuICAgICAgICAgICAgICAgICAgICBcIkRlc2NyaXB0aW9uXCI6IFwiTm8gb3BlcmF0aW9uIC0gbm8gYWZmZWN0IG9uIGFueSBkYXRhLlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbHVjaWRhdG9ySW5zdHJ1Y3Rpb25TZXQ7IiwiLyoqXG4qIEBsaWNlbnNlIE1JVFxuKiBAYXV0aG9yIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbiovXG5cbi8qKlxuKiBFbHVjaWRhdG9yIHNpbXBsZSBsb2dnaW5nIHNoaW0gKGZvciBicm93c2VyIGFuZCBkZXBlbmRlbmN5LWZyZWUgcnVubmluZylcbiovXG5cbmNvbnN0IGxvZ1RvQ29uc29sZSA9IChwTG9nTGluZSwgcExvZ09iamVjdCwgcExvZ0xldmVsKSA9Plxue1xuICAgIGxldCB0bXBMb2dMaW5lID0gKHR5cGVvZihwTG9nTGluZSkgPT09ICdzdHJpbmcnKSA/IHBMb2dMaW5lIDogJyc7XG4gICAgbGV0IHRtcExvZ0xldmVsID0gKHR5cGVvZihwTG9nTGV2ZWwpID09PSAnc3RyaW5nJykgPyBwTG9nTGV2ZWwgOiAnSU5GTyc7XG5cbiAgICBjb25zb2xlLmxvZyhgW0VsdWNpZGF0b3I6JHt0bXBMb2dMZXZlbH1dICR7dG1wTG9nTGluZX1gKTtcblxuICAgIGlmIChwTG9nT2JqZWN0KSBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShwTG9nT2JqZWN0LG51bGwsNCkrXCJcXG5cIik7XG59O1xuXG5jb25zdCBsb2dJbmZvID0gKHBMb2dMaW5lLCBwTG9nT2JqZWN0KSA9Plxue1xuICAgIGxvZ1RvQ29uc29sZShwTG9nTGluZSwgcExvZ09iamVjdCwgJ0luZm8nKTtcbn07XG5cblxuY29uc3QgbG9nV2FybmluZyA9IChwTG9nTGluZSwgcExvZ09iamVjdCkgPT5cbntcbiAgICBsb2dUb0NvbnNvbGUocExvZ0xpbmUsIHBMb2dPYmplY3QsICdXYXJuaW5nJyk7XG59O1xuXG5cbmNvbnN0IGxvZ0Vycm9yID0gKHBMb2dMaW5lLCBwTG9nT2JqZWN0KSA9Plxue1xuICAgIGxvZ1RvQ29uc29sZShwTG9nTGluZSwgcExvZ09iamVjdCwgJ0Vycm9yJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbntcbiAgICBsb2dUb0NvbnNvbGU6IGxvZ1RvQ29uc29sZSxcbiAgICBpbmZvOiBsb2dJbmZvLFxuICAgIHdhcm5pbmc6IGxvZ1dhcm5pbmcsXG4gICAgZXJyb3I6IGxvZ0Vycm9yXG59KTsiLCIvLyBTb2x1dGlvbiBwcm92aWRlcnMgYXJlIG1lYW50IHRvIGJlIHN0YXRlbGVzcywgYW5kIG5vdCBjbGFzc2VzLlxuLy8gVGhlc2Ugc29sdXRpb24gcHJvdmlkZXJzIGFyZSBha2luIHRvIGRyaXZlcnMsIGNvbm5lY3RpbmcgY29kZSBsaWJyYXJpZXMgb3IgXG4vLyBvdGhlciB0eXBlcyBvZiBiZWhhdmlvciB0byBtYXBwaW5nIG9wZXJhdGlvbnMuXG5cbmxldCBsaWJFbHVjaWRhdG9ySW5zdHJ1Y3Rpb25TZXQgPSByZXF1aXJlKCcuLi9FbHVjaWRhdG9yLUluc3RydWN0aW9uU2V0LmpzJyk7XG5cbmNsYXNzIEdlb21ldHJ5IGV4dGVuZHMgbGliRWx1Y2lkYXRvckluc3RydWN0aW9uU2V0XG57XG4gICAgY29uc3RydWN0b3IocEVsdWNpZGF0b3IpXG4gICAge1xuICAgICAgICBzdXBlcihwRWx1Y2lkYXRvcik7XG4gICAgICAgIHRoaXMubmFtZXNwYWNlID0gJ0dlb21ldHJ5JztcbiAgICB9XG5cbiAgICAvLyBHZW9tZXRyeSBwcm92aWRlcyBubyBpbnN0cnVjdGlvbnNcbiAgICBpbml0aWFsaXplSW5zdHJ1Y3Rpb25zKClcbiAgICB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGluaXRpYWxpemVPcGVyYXRpb25zKClcbiAgICB7XG4gICAgICAgIHRoaXMuYWRkT3BlcmF0aW9uKCdyZWN0YW5nbGVhcmVhJywgcmVxdWlyZShgLi9PcGVyYXRpb25zL0dlb21ldHJ5LVJlY3RhbmdsZUFyZWEuanNvbmApKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gR2VvbWV0cnk7IiwiLy8gU29sdXRpb24gcHJvdmlkZXJzIGFyZSBtZWFudCB0byBiZSBzdGF0ZWxlc3MsIGFuZCBub3QgY2xhc3Nlcy5cbi8vIFRoZXNlIHNvbHV0aW9uIHByb3ZpZGVycyBhcmUgYWtpbiB0byBkcml2ZXJzLCBjb25uZWN0aW5nIGNvZGUgbGlicmFyaWVzIG9yIFxuLy8gb3RoZXIgdHlwZXMgb2YgYmVoYXZpb3IgdG8gbWFwcGluZyBvcGVyYXRpb25zLlxuXG5sZXQgbGliRWx1Y2lkYXRvckluc3RydWN0aW9uU2V0ID0gcmVxdWlyZSgnLi4vRWx1Y2lkYXRvci1JbnN0cnVjdGlvblNldC5qcycpO1xuXG5jb25zdCBpZkluc3RydWN0aW9uID0gKHBPcGVyYXRpb24pID0+XG57XG4gICAgbGV0IHRtcExlZnRWYWx1ZSA9IHBPcGVyYXRpb24uSW5wdXRNYW55ZmVzdC5nZXRWYWx1ZUJ5SGFzaChwT3BlcmF0aW9uLklucHV0T2JqZWN0LCAnbGVmdFZhbHVlJyk7XG4gICAgbGV0IHRtcFJpZ2h0VmFsdWUgPSBwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ3JpZ2h0VmFsdWUnKTtcbiAgICBsZXQgdG1wQ29tcGFyYXRvciA9IHBPcGVyYXRpb24uSW5wdXRNYW55ZmVzdC5nZXRWYWx1ZUJ5SGFzaChwT3BlcmF0aW9uLklucHV0T2JqZWN0LCAnY29tcGFyYXRvcicpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcblxuICAgIGxldCB0bXBDb21wYXJpc29uT3BlcmF0b3IgPSAnZXF1YWwnO1xuXG4gICAgLy8gVGhpcyBtYXkgZXZlbnR1YWxseSBjb21lIGZyb20gY29uZmlndXJhdGlvbjsgZm9yIG5vdyBqdXN0IGxlYXZlIGl0IGhlcmUuXG4gICAgbGV0IHRtcENvbXBhcmlzb25PcGVyYXRvck1hcHBpbmcgPSAoXG4gICAgICAgIHtcbiAgICAgICAgICAgICc9PSc6J2VxdWFsJyxcbiAgICAgICAgICAgICdlcSc6J2VxdWFsJyxcbiAgICAgICAgICAgICdlcXVhbCc6J2VxdWFsJyxcblxuICAgICAgICAgICAgJyE9Jzonbm90ZXF1YWwnLFxuICAgICAgICAgICAgJ25vdGVxJzonbm90ZXF1YWwnLFxuICAgICAgICAgICAgJ25vdGVxdWFsJzonbm90ZXF1YWwnLFxuXG4gICAgICAgICAgICAnPT09JzonaWRlbnRpdHknLFxuICAgICAgICAgICAgJ2lkJzonaWRlbnRpdHknLFxuICAgICAgICAgICAgJ2lkZW50aXR5JzonaWRlbnRpdHknLFxuXG4gICAgICAgICAgICAnPic6J2dyZWF0ZXJ0aGFuJyxcbiAgICAgICAgICAgICdndCc6J2dyZWF0ZXJ0aGFuJyxcbiAgICAgICAgICAgICdncmVhdGVydGhhbic6J2dyZWF0ZXJ0aGFuJyxcblxuICAgICAgICAgICAgJz49JzonZ3JlYXRlcnRoYW5vcmVxdWFsJyxcbiAgICAgICAgICAgICdndGUnOidncmVhdGVydGhhbm9yZXF1YWwnLFxuICAgICAgICAgICAgJ2dyZWF0ZXJ0aGFub3JlcXVhbCc6J2dyZWF0ZXJ0aGFub3JlcXVhbCcsXG5cbiAgICAgICAgICAgICc8JzonbGVzc3RoYW4nLFxuICAgICAgICAgICAgJ2x0JzonbGVzc3RoYW4nLFxuICAgICAgICAgICAgJ2xlc3N0aGFuJzonbGVzc3RoYW4nLFxuXG4gICAgICAgICAgICAnPD0nOidsZXNzdGhhbm9yZXF1YWwnLFxuICAgICAgICAgICAgJ2x0ZSc6J2xlc3N0aGFub3JlcXVhbCcsXG4gICAgICAgICAgICAnbGVzc3RoYW5vcmVxdWFsJzonbGVzc3RoYW5vcmVxdWFsJ1xuICAgICAgICB9KTtcblxuICAgIGlmICh0bXBDb21wYXJpc29uT3BlcmF0b3JNYXBwaW5nLmhhc093blByb3BlcnR5KHRtcENvbXBhcmF0b3IpKVxuICAgIHtcbiAgICAgICAgdG1wQ29tcGFyaXNvbk9wZXJhdG9yID0gdG1wQ29tcGFyaXNvbk9wZXJhdG9yTWFwcGluZ1t0bXBDb21wYXJhdG9yXTtcbiAgICB9XG5cbiAgICBsZXQgdG1wVHJ1ZU5hbWVzcGFjZSA9IHBPcGVyYXRpb24uSW5wdXRNYW55ZmVzdC5nZXRWYWx1ZUJ5SGFzaChwT3BlcmF0aW9uLklucHV0T2JqZWN0LCAndHJ1ZU5hbWVzcGFjZScpO1xuICAgIGxldCB0bXBUcnVlT3BlcmF0aW9uID0gcE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICd0cnVlT3BlcmF0aW9uJyk7XG5cbiAgICBsZXQgdG1wRmFsc2VOYW1lc3BhY2UgPSBwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ2ZhbHNlTmFtZXNwYWNlJyk7XG4gICAgbGV0IHRtcEZhbHNlT3BlcmF0aW9uID0gcE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdmYWxzZU9wZXJhdGlvbicpO1xuXG4gICAgbGV0IHRtcFRydXRoaW5lc3MgPSBudWxsO1xuXG4gICAgc3dpdGNoKHRtcENvbXBhcmlzb25PcGVyYXRvcilcbiAgICB7XG4gICAgICAgIGNhc2UgJ2VxdWFsJzpcbiAgICAgICAgICAgIHRtcFRydXRoaW5lc3MgPSAodG1wTGVmdFZhbHVlID09IHRtcFJpZ2h0VmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2lkZW50aXR5JzpcbiAgICAgICAgICAgIHRtcFRydXRoaW5lc3MgPSAodG1wTGVmdFZhbHVlID09PSB0bXBSaWdodFZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdub3RlcXVhbCc6XG4gICAgICAgICAgICB0bXBUcnV0aGluZXNzID0gKHRtcExlZnRWYWx1ZSAhPSB0bXBSaWdodFZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdncmVhdGVydGhhbic6XG4gICAgICAgICAgICB0bXBUcnV0aGluZXNzID0gKHRtcExlZnRWYWx1ZSA+IHRtcFJpZ2h0VmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2dyZWF0ZXJ0aGFub3JlcXVhbCc6XG4gICAgICAgICAgICB0bXBUcnV0aGluZXNzID0gKHRtcExlZnRWYWx1ZSA+PSB0bXBSaWdodFZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdsZXNzdGhhbic6XG4gICAgICAgICAgICB0bXBUcnV0aGluZXNzID0gKHRtcExlZnRWYWx1ZSA8IHRtcFJpZ2h0VmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2xlc3N0aGFub3JlcXVhbCc6XG4gICAgICAgICAgICB0bXBUcnV0aGluZXNzID0gKHRtcExlZnRWYWx1ZSA8PSB0bXBSaWdodFZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHBPcGVyYXRpb24uT3V0cHV0TWFueWZlc3Quc2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5PdXRwdXRPYmplY3QsICd0cnV0aGluZXNzUmVzdWx0JywgdG1wVHJ1dGhpbmVzcyk7XG5cbiAgICAvLyBOb3cgZXhlY3V0ZSB0aGUgb3BlcmF0aW9ucyAodW5sZXNzIGl0IGlzIGEgbm9vcCBvciBhIGJ1bmsgb3BlcmF0aW9uKVxuICAgIC8vIFRoaXMgaXMsIGZyYW5rbHksIGtpbmRvZiBhIG1pbmQtYmxvd2luZyBhbW91bnQgb2YgcmVjdXJzaW9uIHBvc3NpYmlsaXR5LlxuICAgIC8vIEJvdGggb2YgdGhlc2UgYXJlIGZhbGxpbmcgYmFjayBvbiB0aGUgYmFzZSBzb2x1dGlvbiBoYXNoIG1hcHBpbmcuXG4gICAgLy8gLS0+IE5vdCBjZXJ0YWluIGlmIHRoaXMgaXMgdGhlIGNvcnJlY3QgYXBwcm9hY2ggYW5kIHRoZSBvbmx5IHdheSB0byB0ZWxsIHdpbGwgYmUgdGhyb3VnaCBleGVyY2lzZSBvZiB0aGlzXG4gICAgaWYgKHRtcFRydXRoaW5lc3MgJiYgKHR5cGVvZih0bXBUcnVlTmFtZXNwYWNlKSA9PSAnc3RyaW5nJykgJiYgKHR5cGVvZih0bXBUcnVlT3BlcmF0aW9uKSA9PSAnc3RyaW5nJykgJiYgKHRtcFRydWVPcGVyYXRpb24gIT0gJ25vb3AnKSlcbiAgICB7XG4gICAgICAgIHBPcGVyYXRpb24uRWx1Y2lkYXRvci5zb2x2ZUludGVybmFsT3BlcmF0aW9uKHRtcFRydWVOYW1lc3BhY2UsIHRtcFRydWVPcGVyYXRpb24sIHBPcGVyYXRpb24uSW5wdXRPYmplY3QsIHBPcGVyYXRpb24uT3V0cHV0T2JqZWN0LCBwT3BlcmF0aW9uLkRlc2NyaXB0aW9uTWFueWZlc3QsIHBPcGVyYXRpb24uU29sdXRpb25Db250ZXh0LklucHV0SGFzaE1hcHBpbmcsIHBPcGVyYXRpb24uU29sdXRpb25Db250ZXh0Lk91dHB1dEhhc2hNYXBwaW5nLCBwT3BlcmF0aW9uLlNvbHV0aW9uQ29udGV4dCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCh0eXBlb2YodG1wRmFsc2VOYW1lc3BhY2UpID09ICdzdHJpbmcnKSAmJiAgKHR5cGVvZih0bXBGYWxzZU9wZXJhdGlvbikgPT0gJ3N0cmluZycpICYmICh0bXBGYWxzZU9wZXJhdGlvbiAhPSAnbm9vcCcpKVxuICAgIHtcbiAgICAgICAgcE9wZXJhdGlvbi5FbHVjaWRhdG9yLnNvbHZlSW50ZXJuYWxPcGVyYXRpb24odG1wRmFsc2VOYW1lc3BhY2UsIHRtcEZhbHNlT3BlcmF0aW9uLCBwT3BlcmF0aW9uLklucHV0T2JqZWN0LCBwT3BlcmF0aW9uLk91dHB1dE9iamVjdCwgcE9wZXJhdGlvbi5EZXNjcmlwdGlvbk1hbnlmZXN0LCBwT3BlcmF0aW9uLlNvbHV0aW9uQ29udGV4dC5JbnB1dEhhc2hNYXBwaW5nLCBwT3BlcmF0aW9uLlNvbHV0aW9uQ29udGV4dC5PdXRwdXRIYXNoTWFwcGluZywgcE9wZXJhdGlvbi5Tb2x1dGlvbkNvbnRleHQpO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xufTtcblxuY29uc3QgZXhlY3V0ZU9wZXJhdGlvbiA9IChwT3BlcmF0aW9uKSA9Plxue1xuICAgIGxldCB0bXBOYW1lc3BhY2UgPSBwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ25hbWVzcGFjZScpO1xuICAgIGxldCB0bXBPcGVyYXRpb24gPSBwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ29wZXJhdGlvbicpO1xuXG4gICAgcE9wZXJhdGlvbi5FbHVjaWRhdG9yLnNvbHZlSW50ZXJuYWxPcGVyYXRpb24odG1wTmFtZXNwYWNlLCB0bXBPcGVyYXRpb24sIHBPcGVyYXRpb24uSW5wdXRPYmplY3QsIHBPcGVyYXRpb24uT3V0cHV0T2JqZWN0LCBwT3BlcmF0aW9uLkRlc2NyaXB0aW9uTWFueWZlc3QsIHBPcGVyYXRpb24uU29sdXRpb25Db250ZXh0LklucHV0SGFzaE1hcHBpbmcsIHBPcGVyYXRpb24uU29sdXRpb25Db250ZXh0Lk91dHB1dEhhc2hNYXBwaW5nLCBwT3BlcmF0aW9uLlNvbHV0aW9uQ29udGV4dCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuY2xhc3MgTG9naWMgZXh0ZW5kcyBsaWJFbHVjaWRhdG9ySW5zdHJ1Y3Rpb25TZXRcbntcbiAgICBjb25zdHJ1Y3RvcihwRWx1Y2lkYXRvcilcbiAgICB7XG4gICAgICAgIHN1cGVyKHBFbHVjaWRhdG9yKTtcbiAgICAgICAgdGhpcy5uYW1lc3BhY2UgPSAnTG9naWMnO1xuICAgIH1cblxuICAgIGluaXRpYWxpemVJbnN0cnVjdGlvbnMoKVxuICAgIHtcbiAgICAgICAgLy8gTG9naWMgYWN0dWFsbHkgd2FudHMgYSBub29wIGluc3RydWN0aW9uIVxuICAgICAgICBzdXBlci5pbml0aWFsaXplSW5zdHJ1Y3Rpb25zKCk7XG5cbiAgICAgICAgdGhpcy5hZGRJbnN0cnVjdGlvbignaWYnLCBpZkluc3RydWN0aW9uKTtcbiAgICAgICAgdGhpcy5hZGRJbnN0cnVjdGlvbignZXhlY3V0ZScsIGV4ZWN1dGVPcGVyYXRpb24pO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGluaXRpYWxpemVPcGVyYXRpb25zKClcbiAgICB7XG4gICAgICAgIHRoaXMuYWRkT3BlcmF0aW9uKCdpZicsIHJlcXVpcmUoYC4vT3BlcmF0aW9ucy9Mb2dpYy1JZi5qc29uYCkpO1xuICAgICAgICB0aGlzLmFkZE9wZXJhdGlvbignZXhlY3V0ZScsIHJlcXVpcmUoYC4vT3BlcmF0aW9ucy9Mb2dpYy1FeGVjdXRlLmpzb25gKSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2ljOyIsIi8vIFNvbHV0aW9uIHByb3ZpZGVycyBhcmUgbWVhbnQgdG8gYmUgc3RhdGVsZXNzLCBhbmQgbm90IGNsYXNzZXMuXG4vLyBUaGVzZSBzb2x1dGlvbiBwcm92aWRlcnMgYXJlIGFraW4gdG8gZHJpdmVycywgY29ubmVjdGluZyBjb2RlIGxpYnJhcmllcyBvciBcbi8vIG90aGVyIHR5cGVzIG9mIGJlaGF2aW9yIHRvIG1hcHBpbmcgb3BlcmF0aW9ucy5cblxubGV0IGxpYkVsdWNpZGF0b3JJbnN0cnVjdGlvblNldCA9IHJlcXVpcmUoJy4uL0VsdWNpZGF0b3ItSW5zdHJ1Y3Rpb25TZXQuanMnKTtcblxubGV0IGFkZCA9IChwT3BlcmF0aW9uKSA9Plxue1xuICAgIC8vIFRoaXMgY291bGQgYmUgZG9uZSBpbiBvbmUgbGluZSwgYnV0LCB3b3VsZCBiZSBtb3JlIGRpZmZpY3VsdCB0byBjb21wcmVoZW5kLlxuICAgIGxldCB0bXBBID0gcE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdhJyk7XG4gICAgbGV0IHRtcEIgPSBwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ2InKTtcbiAgICBwT3BlcmF0aW9uLk91dHB1dE1hbnlmZXN0LnNldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uT3V0cHV0T2JqZWN0LCAneCcsIHRtcEEgKyB0bXBCKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbmxldCBzdWJ0cmFjdCA9IChwT3BlcmF0aW9uKSA9Plxue1xuICAgIC8vIFRoaXMgY291bGQgYmUgZG9uZSBpbiBvbmUgbGluZSwgYnV0LCB3b3VsZCBiZSBtb3JlIGRpZmZpY3VsdCB0byBjb21wcmVoZW5kLlxuICAgIGxldCB0bXBBID0gcE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdhJyk7XG4gICAgbGV0IHRtcEIgPSBwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ2InKTtcbiAgICBwT3BlcmF0aW9uLk91dHB1dE1hbnlmZXN0LnNldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uT3V0cHV0T2JqZWN0LCAneCcsIHRtcEEgLSB0bXBCKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbmxldCBtdWx0aXBseSA9IChwT3BlcmF0aW9uKSA9Plxue1xuICAgIC8vIFRoaXMgY291bGQgYmUgZG9uZSBpbiBvbmUgbGluZSwgYnV0LCB3b3VsZCBiZSBtb3JlIGRpZmZpY3VsdCB0byBjb21wcmVoZW5kLlxuICAgIGxldCB0bXBBID0gcE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdhJyk7XG4gICAgbGV0IHRtcEIgPSBwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ2InKTtcbiAgICBwT3BlcmF0aW9uLk91dHB1dE1hbnlmZXN0LnNldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uT3V0cHV0T2JqZWN0LCAneCcsIHRtcEEgKiB0bXBCKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbmxldCBkaXZpZGUgPSAocE9wZXJhdGlvbikgPT5cbntcbiAgICAvLyBUaGlzIGNvdWxkIGJlIGRvbmUgaW4gb25lIGxpbmUsIGJ1dCwgd291bGQgYmUgbW9yZSBkaWZmaWN1bHQgdG8gY29tcHJlaGVuZC5cbiAgICBsZXQgdG1wQSA9IHBPcGVyYXRpb24uSW5wdXRNYW55ZmVzdC5nZXRWYWx1ZUJ5SGFzaChwT3BlcmF0aW9uLklucHV0T2JqZWN0LCAnYScpO1xuICAgIGxldCB0bXBCID0gcE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdiJyk7XG4gICAgcE9wZXJhdGlvbi5PdXRwdXRNYW55ZmVzdC5zZXRWYWx1ZUJ5SGFzaChwT3BlcmF0aW9uLk91dHB1dE9iamVjdCwgJ3gnLCB0bXBBIC8gdG1wQik7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5sZXQgYWdncmVnYXRlID0gKHBPcGVyYXRpb24pID0+XG57XG4gICAgbGV0IHRtcEEgPSBwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ2EnKTtcblxuICAgIGxldCB0bXBPYmplY3RUeXBlID0gdHlwZW9mKHRtcEEpO1xuXG4gICAgbGV0IHRtcEFnZ3JlZ2F0aW9uVmFsdWUgPSAwO1xuXG4gICAgaWYgKHRtcE9iamVjdFR5cGUgPT0gJ29iamVjdCcpXG4gICAge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0bXBBKSlcbiAgICAgICAge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0bXBBLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYW4gYXJyYXksIGVudW1lcmF0ZSBpdCBhbmQgdHJ5IHRvIGFnZ3JlZ2F0ZSBlYWNoIG51bWJlclxuICAgICAgICAgICAgICAgIGxldCB0bXBWYWx1ZSA9IHBhcnNlSW50KHRtcEFbaV0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHRtcFZhbHVlKSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHBPcGVyYXRpb24ubG9nRXJyb3IoYEFycmF5IGVsZW1lbnQgaW5kZXggWyR7aX1dIGNvdWxkIG5vdCBiZSBwYXJzZWQgYXMgYSBudW1iZXI7IHNraXBwaW5nLiAgKCR7dG1wQVtpXX0pYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRtcEFnZ3JlZ2F0aW9uVmFsdWUgKz0gdG1wVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHBPcGVyYXRpb24ubG9nSW5mbyhgQWRkaW5nIGVsZW1lbnQgWyR7aX1dIHZhbHVlICR7dG1wVmFsdWV9IHRvdGFsaW5nOiAke3RtcEFnZ3JlZ2F0aW9uVmFsdWV9YClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgdG1wT2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzKHRtcEEpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0bXBPYmplY3RLZXlzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxldCB0bXBWYWx1ZSA9IHBhcnNlSW50KHRtcEFbdG1wT2JqZWN0S2V5c1tpXV0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHRtcFZhbHVlKSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHBPcGVyYXRpb24ubG9nRXJyb3IoYE9iamVjdCBwcm9wZXJ0eSBbJHt0bXBPYmplY3RLZXlzW2ldfV0gY291bGQgbm90IGJlIHBhcnNlZCBhcyBhIG51bWJlcjsgc2tpcHBpbmcuICAoJHt0bXBBW3RtcE9iamVjdEtleXNbaV1dfSlgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wQWdncmVnYXRpb25WYWx1ZSArPSB0bXBWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgcE9wZXJhdGlvbi5sb2dJbmZvKGBBZGRpbmcgb2JqZWN0IHByb3BlcnR5IFske3RtcE9iamVjdEtleXNbaV19XSB2YWx1ZSAke3RtcFZhbHVlfSB0b3RhbGluZzogJHt0bXBBZ2dyZWdhdGlvblZhbHVlfWApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIGxldCB0bXBWYWx1ZSA9IHBhcnNlSW50KHRtcEEpO1xuXG4gICAgICAgIGlmIChpc05hTih0bXBWYWx1ZSkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHBPcGVyYXRpb24ubG9nRXJyb3IoYERpcmVjdCB2YWx1ZSBjb3VsZCBub3QgYmUgcGFyc2VkIGFzIGEgbnVtYmVyOyBza2lwcGluZy4gICgke3RtcEF9KWApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdG1wQWdncmVnYXRpb25WYWx1ZSArPSB0bXBWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwT3BlcmF0aW9uLk91dHB1dE1hbnlmZXN0LnNldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uT3V0cHV0T2JqZWN0LCAneCcsIHRtcEFnZ3JlZ2F0aW9uVmFsdWUpO1xuICAgIHJldHVybiB0cnVlO1xufTtcblxuY2xhc3MgTWF0aEphdmFzY3JpcHQgZXh0ZW5kcyBsaWJFbHVjaWRhdG9ySW5zdHJ1Y3Rpb25TZXRcbntcbiAgICBjb25zdHJ1Y3RvcihwRWx1Y2lkYXRvcilcbiAgICB7XG4gICAgICAgIHN1cGVyKHBFbHVjaWRhdG9yKTtcbiAgICAgICAgdGhpcy5uYW1lc3BhY2UgPSAnTWF0aCc7XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZUluc3RydWN0aW9ucygpXG4gICAge1xuICAgICAgICB0aGlzLmFkZEluc3RydWN0aW9uKCdhZGQnLCBhZGQpO1xuXG4gICAgICAgIHRoaXMuYWRkSW5zdHJ1Y3Rpb24oJ3N1YnRyYWN0Jywgc3VidHJhY3QpO1xuICAgICAgICB0aGlzLmFkZEluc3RydWN0aW9uKCdzdWInLCBzdWJ0cmFjdCk7XG5cbiAgICAgICAgdGhpcy5hZGRJbnN0cnVjdGlvbignbXVsdGlwbHknLCBtdWx0aXBseSk7XG4gICAgICAgIHRoaXMuYWRkSW5zdHJ1Y3Rpb24oJ211bCcsIG11bHRpcGx5KTtcblxuICAgICAgICB0aGlzLmFkZEluc3RydWN0aW9uKCdkaXZpZGUnLCBkaXZpZGUpO1xuICAgICAgICB0aGlzLmFkZEluc3RydWN0aW9uKCdkaXYnLCBkaXZpZGUpO1xuXG4gICAgICAgIHRoaXMuYWRkSW5zdHJ1Y3Rpb24oJ2FnZ3JlZ2F0ZScsIGFnZ3JlZ2F0ZSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZU9wZXJhdGlvbnMoKVxuICAgIHtcbiAgICAgICAgdGhpcy5hZGRPcGVyYXRpb24oJ2FkZCcsIHJlcXVpcmUoYC4vT3BlcmF0aW9ucy9NYXRoLUFkZC5qc29uYCkpO1xuICAgICAgICB0aGlzLmFkZE9wZXJhdGlvbignc3VidHJhY3QnLCByZXF1aXJlKGAuL09wZXJhdGlvbnMvTWF0aC1TdWJ0cmFjdC5qc29uYCkpO1xuICAgICAgICB0aGlzLmFkZE9wZXJhdGlvbignbXVsdGlwbHknLCByZXF1aXJlKGAuL09wZXJhdGlvbnMvTWF0aC1NdWx0aXBseS5qc29uYCkpO1xuICAgICAgICB0aGlzLmFkZE9wZXJhdGlvbignZGl2aWRlJywgcmVxdWlyZShgLi9PcGVyYXRpb25zL01hdGgtRGl2aWRlLmpzb25gKSk7XG5cbiAgICAgICAgdGhpcy5hZGRPcGVyYXRpb24oJ2FnZ3JlZ2F0ZScsIHJlcXVpcmUoYC4vT3BlcmF0aW9ucy9NYXRoLUFnZ3JlZ2F0ZS5qc29uYCkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYXRoSmF2YXNjcmlwdDsiLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiRGVzY3JpcHRpb25cIjpcblx0e1xuXHRcdFwiTmFtZXNwYWNlXCI6IFwiR2VvbWV0cnlcIixcblx0XHRcIk9wZXJhdGlvblwiOiBcIlJlY3RhbmdsZUFyZWFcIixcblx0XHRcIlN5bm9wc2lzXCI6IFwiU29sdmUgZm9yIHRoZSBhcmVhIG9mIGEgcmVjdGFuZ2xlOiAgQXJlYSA9IFdpZHRoICogSGVpZ2h0XCJcblx0fSxcblxuXHRcIklucHV0c1wiOiBcblx0e1xuXHRcdFwiV2lkdGhcIjogeyBcIkhhc2hcIjpcIldpZHRoXCIsIFwiVHlwZVwiOlwiTnVtYmVyXCIgfSxcblx0XHRcIkhlaWdodFwiOiB7IFwiSGFzaFwiOlwiSGVpZ2h0XCIsIFwiVHlwZVwiOlwiTnVtYmVyXCIgfVxuXHR9LFxuXG5cdFwiT3V0cHV0c1wiOlxuXHR7XG5cdFx0XCJBcmVhXCI6IHsgXCJIYXNoXCI6XCJBcmVhXCIsIFwiTmFtZVwiOiBcIkFyZWEgb2YgdGhlIFJlY3RhbmdsZVwifSxcblx0XHRcIlJhdGlvXCI6IHsgXCJIYXNoXCI6XCJSYXRpb1wiLCBcIk5hbWVcIjogXCJUaGUgUmF0aW8gYmV0d2VlbiB0aGUgV2lkdGggYW5kIHRoZSBIZWlnaHRcIiB9XG5cdH0sXG5cdFxuXHRcIkxvZ1wiOlxuXHR7XG5cdFx0XCJQcmVPcGVyYXRpb25cIjogXCJTb2x2ZSBmb3IgWyB7e05hbWU6QXJlYX19IF0gYmFzZWQgb24gWyB7e05hbWU6V2lkdGh9fSBdIGFuZCBbIHt7TmFtZTpIZWlnaHR9fSBdLlwiLFxuXHRcdFwiUG9zdE9wZXJhdGlvblwiOiBcIk9wZXJhdGlvbiBjb21wbGV0ZTsgWyB7e05hbWU6QXJlYX19IF0gPSB7e0lucHV0VmFsdWU6V2lkdGh9fSAqIHt7SW5wdXRWYWx1ZTpIZWlnaHR9fSA9IHt7T3V0cHV0VmFsdWU6QXJlYX19XCJcblx0fSxcblxuXHRcIlN0ZXBzXCI6XG5cdFtcblx0XHR7XG5cdFx0XHRcIk5hbWVzcGFjZVwiOiBcIlByZWNpc2VNYXRoXCIsXG5cdFx0XHRcIkluc3RydWN0aW9uXCI6IFwibXVsdGlwbHlcIixcblx0XHRcdFwiSW5wdXRIYXNoQWRkcmVzc01hcFwiOiBcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwiYVwiOiBcIldpZHRoXCIsXG5cdFx0XHRcdFx0XCJiXCI6IFwiSGVpZ2h0XCJcblx0XHRcdFx0fSxcblx0XHRcdFwiT3V0cHV0SGFzaEFkZHJlc3NNYXBcIjpcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwieFwiOiBcIkFyZWFcIlxuXHRcdFx0XHR9XG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcIk5hbWVzcGFjZVwiOiBcIlByZWNpc2VNYXRoXCIsXG5cdFx0XHRcIkluc3RydWN0aW9uXCI6IFwiZGl2aWRlXCIsXG5cdFx0XHRcIklucHV0SGFzaEFkZHJlc3NNYXBcIjogXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcImFcIjogXCJXaWR0aFwiLFxuXHRcdFx0XHRcdFwiYlwiOiBcIkhlaWdodFwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcIk91dHB1dEhhc2hBZGRyZXNzTWFwXCI6XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInhcIjogXCJSYXRpb1wiXG5cdFx0XHRcdH1cblx0XHR9XG5cdF1cbn0iLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiRGVzY3JpcHRpb25cIjpcblx0e1xuXHRcdFwiTmFtZXNwYWNlXCI6IFwiTG9naWNcIixcblx0XHRcIk9wZXJhdGlvblwiOiBcIkV4ZWN1dGVcIixcblx0XHRcIlN5bm9wc2lzXCI6IFwiRXhlY3V0ZSBhbiBvcGVyYXRpb24gYmFzZWQgb24gbmFtZXNwYWNlIGFuZCBvcGVyYXRpb24uXCJcblx0fSxcblxuXHRcIklucHV0c1wiOiBcblx0e1xuXHRcdFwibmFtZXNwYWNlXCI6IHsgXCJIYXNoXCI6IFwibmFtZXNwYWNlXCIsIFwiVHlwZVwiOiBcInN0cmluZ1wiLCBcIkRlZmF1bHRcIjpcImxvZ2ljXCIgfSxcblx0XHRcIm9wZXJhdGlvblwiOiB7IFwiSGFzaFwiOiBcIm9wZXJhdGlvblwiLCBcIlR5cGVcIjogXCJzdHJpbmdcIiwgXCJEZWZhdWx0XCI6XCJub29wXCIgfVxuXHR9LFxuXG5cdFwiT3V0cHV0c1wiOlxuXHR7XG5cdH0sXG5cdFxuXHRcIkxvZ1wiOlxuXHR7XG5cdFx0XCJQcmVPcGVyYXRpb25cIjogXCJFeGVjdXRlIHRoZSB7e0lucHV0VmFsdWU6b3BlcmF0aW9ufX0gb3BlcmF0aW9uIGluIG5hbWVzcGFjZSB7e0lucHV0VmFsdWU6bmFtZXNwYWNlfX0uXCIsXG5cdFx0XCJQb3N0T3BlcmF0aW9uXCI6IFwiT3BlcmF0aW9uIFt7e0lucHV0VmFsdWU6bmFtZXNwYWNlfX06e3tJbnB1dFZhbHVlOm9wZXJhdGlvbn19XSBleGVjdXRpb24gY29tcGxldGUuXCJcblx0fSxcblxuXHRcIlN0ZXBzXCI6XG5cdFtcblx0XHR7XG5cdFx0XHRcIk5hbWVzcGFjZVwiOiBcIkxvZ2ljXCIsXG5cdFx0XHRcIkluc3RydWN0aW9uXCI6IFwiZXhlY3V0ZVwiXG5cdFx0fVxuXHRdXG59IiwibW9kdWxlLmV4cG9ydHM9e1xuXHRcIkRlc2NyaXB0aW9uXCI6XG5cdHtcblx0XHRcIk5hbWVzcGFjZVwiOiBcIkxvZ2ljXCIsXG5cdFx0XCJPcGVyYXRpb25cIjogXCJJZlwiLFxuXHRcdFwiU3lub3BzaXNcIjogXCJDb21wYXJpc29uLWJhc2VkIGlmIG9mIGxlZnRWYWx1ZSBhbmQgUmlnaHRWYWx1ZSBiYXNlZCBvbiBjb21wYXJhdG9yLiAgRXhlY3V0ZXMgdHJ1ZU5hbWVzcGFjZTp0cnVlT3BlcmF0aW9uIG9yIGZhbHNlTmFtZXNwYWNlOmZhbHNlT3BlcmF0aW9uIGJhc2VkIG9uIHRydXRoaW5lc3Mgb2YgcmVzdWx0LiAgQWxzbyBvdXRwdXRzIGEgdHJ1ZSBvciBmYWxzZSB0byB0cnV0aGluZXNzUmVzdWx0LlwiXG5cdH0sXG5cblx0XCJJbnB1dHNcIjogXG5cdHtcblx0XHRcImxlZnRWYWx1ZVwiOiB7IFwiSGFzaFwiOlwibGVmdFZhbHVlXCIsIFwiVHlwZVwiOlwiQW55XCIgfSxcblx0XHRcInJpZ2h0VmFsdWVcIjogeyBcIkhhc2hcIjpcInJpZ2h0VmFsdWVcIiwgXCJUeXBlXCI6XCJBbnlcIiwgXCJEZWZhdWx0XCI6IHRydWUgfSxcblx0XHRcImNvbXBhcmF0b3JcIjogeyBcIkhhc2hcIjpcImNvbXBhcmF0b3JcIiwgXCJUeXBlXCI6XCJTdHJpbmdcIiwgXCJEZWZhdWx0XCI6XCI9PVwiIH0sXG5cblx0XHRcInRydWVOYW1lc3BhY2VcIjoge1wiSGFzaFwiOlwidHJ1ZU5hbWVzcGFjZVwiLCBcIlR5cGVcIjpcIlN0cmluZ1wiLCBcIkRlZmF1bHRcIjpcImxvZ2ljXCIgfSxcblx0XHRcInRydWVPcGVyYXRpb25cIjoge1wiSGFzaFwiOlwidHJ1ZU9wZXJhdGlvblwiLCBcIlR5cGVcIjpcIlN0cmluZ1wiLCBcIkRlZmF1bHRcIjpcIm5vb3BcIiB9LFxuXG5cdFx0XCJmYWxzZU5hbWVzcGFjZVwiOiB7XCJIYXNoXCI6XCJmYWxzZU5hbWVzcGFjZVwiLCBcIlR5cGVcIjpcIlN0cmluZ1wiLCBcIkRlZmF1bHRcIjpcImxvZ2ljXCIgfSxcblx0XHRcImZhbHNlT3BlcmF0aW9uXCI6IHtcIkhhc2hcIjpcImZhbHNlT3BlcmF0aW9uXCIsIFwiVHlwZVwiOlwiU3RyaW5nXCIsIFwiRGVmYXVsdFwiOlwibm9vcFwiIH1cblx0fSxcblxuXHRcIk91dHB1dHNcIjpcblx0e1xuXHRcdFwidHJ1dGhpbmVzc1Jlc3VsdFwiOiB7IFwiSGFzaFwiOiBcInRydXRoaW5lc3NSZXN1bHRcIiwgXCJUeXBlXCI6IFwiQm9vbGVhblwiIH1cblx0fSxcblx0XG5cdFwiTG9nXCI6XG5cdHtcblx0XHRcIlByZU9wZXJhdGlvblwiOiBcIkNvbXBhcmUge3tOYW1lOmxlZnRWYWx1ZX19IGFuZCB7e05hbWU6cmlnaHRWYWx1ZX19IHdpdGggdGhlIHt7SW5wdXRWYWx1ZTpjb21wYXJhdG9yfX0gb3BlcmF0b3IsIHN0b3JpbmcgdGhlIHRydXRoaW5lc3MgaW4ge3tOYW1lOnRydXRoaW5lc3NSZXN1bHR9fS5cIixcblx0XHRcIlBvc3RPcGVyYXRpb25cIjogXCJPcGVyYXRpb24gY29tcGxldGU6IHt7SW5wdXRWYWx1ZTpsZWZ0VmFsdWV9fSB7e0lucHV0VmFsdWU6Y29tcGFyYXRvcn19IHt7SW5wdXRWYWx1ZTpyaWdodFZhbHVlfX0gZXZhbHVhdGVkIHRvIHt7T3V0cHV0VmFsdWU6dHJ1dGhpbmVzc1Jlc3VsdH19XCJcblx0fSxcblxuXHRcIlN0ZXBzXCI6XG5cdFtcblx0XHR7XG5cdFx0XHRcIk5hbWVzcGFjZVwiOiBcIkxvZ2ljXCIsXG5cdFx0XHRcIkluc3RydWN0aW9uXCI6IFwiSWZcIlxuXHRcdH1cblx0XVxufSIsIm1vZHVsZS5leHBvcnRzPXtcblx0XCJEZXNjcmlwdGlvblwiOlxuXHR7XG5cdFx0XCJOYW1lc3BhY2VcIjogXCJNYXRoXCIsXG5cdFx0XCJPcGVyYXRpb25cIjogXCJBZGRcIixcblx0XHRcIlN5bm9wc2lzXCI6IFwiQWRkIHR3byBudW1iZXJzOiAgeCA9IGEgKyBiXCJcblx0fSxcblxuXHRcIklucHV0c1wiOiBcblx0e1xuXHRcdFwiYVwiOiB7IFwiSGFzaFwiOiBcImFcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfSxcblx0XHRcImJcIjogeyBcIkhhc2hcIjogXCJiXCIsIFwiVHlwZVwiOiBcIk51bWJlclwiIH1cblx0fSxcblxuXHRcIk91dHB1dHNcIjpcblx0e1xuXHRcdFwieFwiOiB7IFwiSGFzaFwiOiBcInhcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfVxuXHR9LFxuXHRcblx0XCJMb2dcIjpcblx0e1xuXHRcdFwiUHJlT3BlcmF0aW9uXCI6IFwiQWRkIHt7TmFtZTphfX0gYW5kIHt7TmFtZTpifX0sIHN0b3JpbmcgdGhlIHZhbHVlIGluIHt7TmFtZTp4fX0uXCIsXG5cdFx0XCJQb3N0T3BlcmF0aW9uXCI6IFwiT3BlcmF0aW9uIGNvbXBsZXRlOiB7e05hbWU6eH19ID0ge3tJbnB1dFZhbHVlOmF9fSArIHt7SW5wdXRWYWx1ZTpifX0gPSB7e091dHB1dFZhbHVlOnh9fVwiXHRcdFxuXHR9LFxuXG5cdFwiU3RlcHNcIjpcblx0W1xuXHRcdHtcblx0XHRcdFwiTmFtZXNwYWNlXCI6IFwiTWF0aFwiLFxuXHRcdFx0XCJJbnN0cnVjdGlvblwiOiBcImFkZFwiXG5cdFx0fVxuXHRdXG59IiwibW9kdWxlLmV4cG9ydHM9e1xuXHRcIkRlc2NyaXB0aW9uXCI6XG5cdHtcblx0XHRcIk5hbWVzcGFjZVwiOiBcIk1hdGhcIixcblx0XHRcIk9wZXJhdGlvblwiOiBcIkFnZ3JlZ2F0ZVwiLFxuXHRcdFwiU3lub3BzaXNcIjogXCJBZ2dyZWdhdGUgYSBzZXQgb2YgbnVtYmVycyAoZnJvbSBhcnJheSBvciBvYmplY3QgYWRkcmVzcyk6ICB4ID0gYSArIGIgKyAuLi4gKyB6XCJcblx0fSxcblxuXHRcIklucHV0c1wiOiBcblx0e1xuXHRcdFwiYVwiOiB7IFwiSGFzaFwiOiBcImFcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfVxuXHR9LFxuXG5cdFwiT3V0cHV0c1wiOlxuXHR7XG5cdFx0XCJ4XCI6IHsgXCJIYXNoXCI6IFwieFwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9XG5cdH0sXG5cdFxuXHRcIkxvZ1wiOlxuXHR7XG5cdFx0XCJQcmVPcGVyYXRpb25cIjogXCJBZ2dyZWdhdGUgYWxsIG51bWVyaWMgdmFsdWVzIGluIHt7TmFtZTphfX0sIHN0b3JpbmcgdGhlIHJlc3VsdGFudCBpbiB7e05hbWU6eH19LlwiLFxuXHRcdFwiUG9zdE9wZXJhdGlvblwiOiBcIk9wZXJhdGlvbiBjb21wbGV0ZToge3tOYW1lOnh9fSA9IHt7T3V0cHV0VmFsdWU6eH19XCJcdFx0XG5cdH0sXG5cblx0XCJTdGVwc1wiOlxuXHRbXG5cdFx0e1xuXHRcdFx0XCJOYW1lc3BhY2VcIjogXCJNYXRoXCIsXG5cdFx0XHRcIkluc3RydWN0aW9uXCI6IFwiYWdncmVnYXRlXCJcblx0XHR9XG5cdF1cbn0iLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiRGVzY3JpcHRpb25cIjpcblx0e1xuXHRcdFwiTmFtZXNwYWNlXCI6IFwiTWF0aFwiLFxuXHRcdFwiT3BlcmF0aW9uXCI6IFwiRGl2aWRlXCIsXG5cdFx0XCJTeW5vcHNpc1wiOiBcIkRpdmlkZSB0d28gbnVtYmVyczogIHggPSBhIC8gYlwiXG5cdH0sXG5cblx0XCJJbnB1dHNcIjogXG5cdHtcblx0XHRcImFcIjogeyBcIkhhc2hcIjogXCJhXCIsIFwiVHlwZVwiOiBcIk51bWJlclwiIH0sXG5cdFx0XCJiXCI6IHsgXCJIYXNoXCI6IFwiYlwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9XG5cdH0sXG5cblx0XCJPdXRwdXRzXCI6XG5cdHtcblx0XHRcInhcIjogeyBcIkhhc2hcIjogXCJ4XCIsIFwiVHlwZVwiOiBcIk51bWJlclwiIH1cblx0fSxcblx0XG5cdFwiTG9nXCI6XG5cdHtcblx0XHRcIlByZU9wZXJhdGlvblwiOiBcIkRpdmlkZSB7e05hbWU6YX19IG92ZXIge3tOYW1lOmJ9fSwgc3RvcmluZyB0aGUgdmFsdWUgaW4ge3tOYW1lOnh9fS5cIixcblx0XHRcIlBvc3RPcGVyYXRpb25cIjogXCJPcGVyYXRpb24gY29tcGxldGU6IHt7TmFtZTp4fX0gPSB7e0lucHV0VmFsdWU6YX19IC8ge3tJbnB1dFZhbHVlOmJ9fSA9IHt7T3V0cHV0VmFsdWU6eH19XCJcdFx0XG5cdH0sXG5cblx0XCJTdGVwc1wiOlxuXHRbXG5cdFx0e1xuXHRcdFx0XCJOYW1lc3BhY2VcIjogXCJNYXRoXCIsXG5cdFx0XHRcIkluc3RydWN0aW9uXCI6IFwiZGl2aWRlXCJcblx0XHR9XG5cdF1cbn0iLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiRGVzY3JpcHRpb25cIjpcblx0e1xuXHRcdFwiTmFtZXNwYWNlXCI6IFwiTWF0aFwiLFxuXHRcdFwiT3BlcmF0aW9uXCI6IFwiTXVsdGlwbHlcIixcblx0XHRcIlN5bm9wc2lzXCI6IFwiTXVsdGlwbHkgdHdvIG51bWJlcnM6ICB4ID0gYSAqIGJcIlxuXHR9LFxuXG5cdFwiSW5wdXRzXCI6IFxuXHR7XG5cdFx0XCJhXCI6IHsgXCJIYXNoXCI6IFwiYVwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9LFxuXHRcdFwiYlwiOiB7IFwiSGFzaFwiOiBcImJcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfVxuXHR9LFxuXG5cdFwiT3V0cHV0c1wiOlxuXHR7XG5cdFx0XCJ4XCI6IHsgXCJIYXNoXCI6IFwieFwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9XG5cdH0sXG5cdFxuXHRcIkxvZ1wiOlxuXHR7XG5cdFx0XCJQcmVPcGVyYXRpb25cIjogXCJNdWx0aXBseSB7e05hbWU6YX19IGFuZCB7e05hbWU6Yn19LCBzdG9yaW5nIHRoZSB2YWx1ZSBpbiB7e05hbWU6eH19LlwiLFxuXHRcdFwiUG9zdE9wZXJhdGlvblwiOiBcIk9wZXJhdGlvbiBjb21wbGV0ZToge3tOYW1lOnh9fSA9IHt7SW5wdXRWYWx1ZTphfX0gKiB7e0lucHV0VmFsdWU6Yn19ID0ge3tPdXRwdXRWYWx1ZTp4fX1cIlx0XHRcblx0fSxcblxuXHRcIlN0ZXBzXCI6XG5cdFtcblx0XHR7XG5cdFx0XHRcIk5hbWVzcGFjZVwiOiBcIk1hdGhcIixcblx0XHRcdFwiSW5zdHJ1Y3Rpb25cIjogXCJtdWx0aXBseVwiXG5cdFx0fVxuXHRdXG59IiwibW9kdWxlLmV4cG9ydHM9e1xuXHRcIkRlc2NyaXB0aW9uXCI6XG5cdHtcblx0XHRcIk5hbWVzcGFjZVwiOiBcIk1hdGhcIixcblx0XHRcIk9wZXJhdGlvblwiOiBcIlN1YnRyYWN0XCIsXG5cdFx0XCJTeW5vcHNpc1wiOiBcIlN1YnRyYWN0IHR3byBudW1iZXJzOiAgeCA9IGEgLSBiXCJcblx0fSxcblxuXHRcIklucHV0c1wiOiBcblx0e1xuXHRcdFwiYVwiOiB7IFwiSGFzaFwiOiBcImFcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfSxcblx0XHRcImJcIjogeyBcIkhhc2hcIjogXCJiXCIsIFwiVHlwZVwiOiBcIk51bWJlclwiIH1cblx0fSxcblxuXHRcIk91dHB1dHNcIjpcblx0e1xuXHRcdFwieFwiOiB7IFwiSGFzaFwiOiBcInhcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfVxuXHR9LFxuXHRcblx0XCJMb2dcIjpcblx0e1xuXHRcdFwiUHJlT3BlcmF0aW9uXCI6IFwiU3VidHJhY3Qge3tOYW1lOmF9fSBhbmQge3tOYW1lOmJ9fSwgc3RvcmluZyB0aGUgdmFsdWUgaW4ge3tOYW1lOnh9fS5cIixcblx0XHRcIlBvc3RPcGVyYXRpb25cIjogXCJPcGVyYXRpb24gY29tcGxldGU6IHt7TmFtZTp4fX0gPSB7e0lucHV0VmFsdWU6YX19IC0ge3tJbnB1dFZhbHVlOmJ9fSA9IHt7T3V0cHV0VmFsdWU6eH19XCJcdFx0XG5cdH0sXG5cblx0XCJTdGVwc1wiOlxuXHRbXG5cdFx0e1xuXHRcdFx0XCJOYW1lc3BhY2VcIjogXCJNYXRoXCIsXG5cdFx0XHRcIkluc3RydWN0aW9uXCI6IFwic3VidHJhY3RcIlxuXHRcdH1cblx0XVxufSIsIm1vZHVsZS5leHBvcnRzPXtcblx0XCJEZXNjcmlwdGlvblwiOlxuXHR7XG5cdFx0XCJOYW1lc3BhY2VcIjogXCJQcmVjaXNlTWF0aFwiLFxuXHRcdFwiT3BlcmF0aW9uXCI6IFwiQWRkXCIsXG5cdFx0XCJTeW5vcHNpc1wiOiBcIlByZWNpc2VseSBhZGQgdHdvIG51bWJlcnM6ICB4ID0gYSArIGJcIlxuXHR9LFxuXG5cdFwiSW5wdXRzXCI6IFxuXHR7XG5cdFx0XCJhXCI6IHsgXCJIYXNoXCI6IFwiYVwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9LFxuXHRcdFwiYlwiOiB7IFwiSGFzaFwiOiBcImJcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfVxuXHR9LFxuXG5cdFwiT3V0cHV0c1wiOlxuXHR7XG5cdFx0XCJ4XCI6IHsgXCJIYXNoXCI6IFwieFwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9XG5cdH0sXG5cdFxuXHRcIkxvZ1wiOlxuXHR7XG5cdFx0XCJQcmVPcGVyYXRpb25cIjogXCJBZGQge3tOYW1lOmF9fSBhbmQge3tOYW1lOmJ9fSwgc3RvcmluZyB0aGUgdmFsdWUgaW4ge3tOYW1lOnh9fS5cIixcblx0XHRcIlBvc3RPcGVyYXRpb25cIjogXCJPcGVyYXRpb24gY29tcGxldGU6IHt7TmFtZTp4fX0gPSB7e0lucHV0VmFsdWU6YX19ICsge3tJbnB1dFZhbHVlOmJ9fSA9IHt7T3V0cHV0VmFsdWU6eH19XCJcdFx0XG5cdH0sXG5cblx0XCJTdGVwc1wiOlxuXHRbXG5cdFx0e1xuXHRcdFx0XCJOYW1lc3BhY2VcIjogXCJQcmVjaXNlTWF0aFwiLFxuXHRcdFx0XCJJbnN0cnVjdGlvblwiOiBcImFkZFwiXG5cdFx0fVxuXHRdXG59IiwibW9kdWxlLmV4cG9ydHM9e1xuXHRcIkRlc2NyaXB0aW9uXCI6XG5cdHtcblx0XHRcIk5hbWVzcGFjZVwiOiBcIlByZWNpc2VNYXRoXCIsXG5cdFx0XCJPcGVyYXRpb25cIjogXCJBZ2dyZWdhdGVcIixcblx0XHRcIlN5bm9wc2lzXCI6IFwiUHJlY2lzZWx5IGFnZ3JlZ2F0ZSBhIHNldCBvZiBudW1iZXJzIChmcm9tIGFycmF5IG9yIG9iamVjdCBhZGRyZXNzKTogIHggPSBhICsgYiArIC4uLiArIHpcIlxuXHR9LFxuXG5cdFwiSW5wdXRzXCI6IFxuXHR7XG5cdFx0XCJhXCI6IHsgXCJIYXNoXCI6IFwiYVwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9XG5cdH0sXG5cblx0XCJPdXRwdXRzXCI6XG5cdHtcblx0XHRcInhcIjogeyBcIkhhc2hcIjogXCJ4XCIsIFwiVHlwZVwiOiBcIk51bWJlclwiIH1cblx0fSxcblx0XG5cdFwiTG9nXCI6XG5cdHtcblx0XHRcIlByZU9wZXJhdGlvblwiOiBcIkFnZ3JlZ2F0ZSBhbGwgbnVtZXJpYyB2YWx1ZXMgaW4ge3tOYW1lOmF9fSwgc3RvcmluZyB0aGUgcmVzdWx0YW50IGluIHt7TmFtZTp4fX0uXCIsXG5cdFx0XCJQb3N0T3BlcmF0aW9uXCI6IFwiT3BlcmF0aW9uIGNvbXBsZXRlOiB7e05hbWU6eH19ID0ge3tPdXRwdXRWYWx1ZTp4fX1cIlx0XHRcblx0fSxcblxuXHRcIlN0ZXBzXCI6XG5cdFtcblx0XHR7XG5cdFx0XHRcIk5hbWVzcGFjZVwiOiBcIlByZWNpc2VNYXRoXCIsXG5cdFx0XHRcIkluc3RydWN0aW9uXCI6IFwiYWdncmVnYXRlXCJcblx0XHR9XG5cdF1cbn0iLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiRGVzY3JpcHRpb25cIjpcblx0e1xuXHRcdFwiTmFtZXNwYWNlXCI6IFwiUHJlY2lzZU1hdGhcIixcblx0XHRcIk9wZXJhdGlvblwiOiBcIkRpdmlkZVwiLFxuXHRcdFwiU3lub3BzaXNcIjogXCJQcmVjaXNlbHkgZGl2aWRlIHR3byBudW1iZXJzOiAgeCA9IGEgLyBiXCJcblx0fSxcblxuXHRcIklucHV0c1wiOiBcblx0e1xuXHRcdFwiYVwiOiB7IFwiSGFzaFwiOiBcImFcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfSxcblx0XHRcImJcIjogeyBcIkhhc2hcIjogXCJiXCIsIFwiVHlwZVwiOiBcIk51bWJlclwiIH1cblx0fSxcblxuXHRcIk91dHB1dHNcIjpcblx0e1xuXHRcdFwieFwiOiB7IFwiSGFzaFwiOiBcInhcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfVxuXHR9LFxuXHRcblx0XCJMb2dcIjpcblx0e1xuXHRcdFwiUHJlT3BlcmF0aW9uXCI6IFwiRGl2aWRlIHt7TmFtZTphfX0gb3ZlciB7e05hbWU6Yn19LCBzdG9yaW5nIHRoZSB2YWx1ZSBpbiB7e05hbWU6eH19LlwiLFxuXHRcdFwiUG9zdE9wZXJhdGlvblwiOiBcIk9wZXJhdGlvbiBjb21wbGV0ZToge3tOYW1lOnh9fSA9IHt7SW5wdXRWYWx1ZTphfX0gLyB7e0lucHV0VmFsdWU6Yn19ID0ge3tPdXRwdXRWYWx1ZTp4fX1cIlx0XHRcblx0fSxcblxuXHRcIlN0ZXBzXCI6XG5cdFtcblx0XHR7XG5cdFx0XHRcIk5hbWVzcGFjZVwiOiBcIlByZWNpc2VNYXRoXCIsXG5cdFx0XHRcIkluc3RydWN0aW9uXCI6IFwiZGl2aWRlXCJcblx0XHR9XG5cdF1cbn0iLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiRGVzY3JpcHRpb25cIjpcblx0e1xuXHRcdFwiTmFtZXNwYWNlXCI6IFwiUHJlY2lzZU1hdGhcIixcblx0XHRcIk9wZXJhdGlvblwiOiBcIk11bHRpcGx5XCIsXG5cdFx0XCJTeW5vcHNpc1wiOiBcIlByZWNpc2VseSBtdWx0aXBseSB0d28gbnVtYmVyczogIHggPSBhICogYlwiXG5cdH0sXG5cblx0XCJJbnB1dHNcIjogXG5cdHtcblx0XHRcImFcIjogeyBcIkhhc2hcIjogXCJhXCIsIFwiVHlwZVwiOiBcIk51bWJlclwiIH0sXG5cdFx0XCJiXCI6IHsgXCJIYXNoXCI6IFwiYlwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9XG5cdH0sXG5cblx0XCJPdXRwdXRzXCI6XG5cdHtcblx0XHRcInhcIjogeyBcIkhhc2hcIjogXCJ4XCIsIFwiVHlwZVwiOiBcIk51bWJlclwiIH1cblx0fSxcblx0XG5cdFwiTG9nXCI6XG5cdHtcblx0XHRcIlByZU9wZXJhdGlvblwiOiBcIk11bHRpcGx5IHt7TmFtZTphfX0gYW5kIHt7TmFtZTpifX0sIHN0b3JpbmcgdGhlIHZhbHVlIGluIHt7TmFtZTp4fX0uXCIsXG5cdFx0XCJQb3N0T3BlcmF0aW9uXCI6IFwiT3BlcmF0aW9uIGNvbXBsZXRlOiB7e05hbWU6eH19ID0ge3tJbnB1dFZhbHVlOmF9fSAqIHt7SW5wdXRWYWx1ZTpifX0gPSB7e091dHB1dFZhbHVlOnh9fVwiXHRcdFxuXHR9LFxuXG5cdFwiU3RlcHNcIjpcblx0W1xuXHRcdHtcblx0XHRcdFwiTmFtZXNwYWNlXCI6IFwiUHJlY2lzZU1hdGhcIixcblx0XHRcdFwiSW5zdHJ1Y3Rpb25cIjogXCJtdWx0aXBseVwiXG5cdFx0fVxuXHRdXG59IiwibW9kdWxlLmV4cG9ydHM9e1xuXHRcIkRlc2NyaXB0aW9uXCI6XG5cdHtcblx0XHRcIk5hbWVzcGFjZVwiOiBcIlByZWNpc2VNYXRoXCIsXG5cdFx0XCJPcGVyYXRpb25cIjogXCJTdWJ0cmFjdFwiLFxuXHRcdFwiU3lub3BzaXNcIjogXCJQcmVjaXNlbHkgc3VidHJhY3QgdHdvIG51bWJlcnM6ICB4ID0gYSAtIGJcIlxuXHR9LFxuXG5cdFwiSW5wdXRzXCI6IFxuXHR7XG5cdFx0XCJhXCI6IHsgXCJIYXNoXCI6IFwiYVwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9LFxuXHRcdFwiYlwiOiB7IFwiSGFzaFwiOiBcImJcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfVxuXHR9LFxuXG5cdFwiT3V0cHV0c1wiOlxuXHR7XG5cdFx0XCJ4XCI6IHsgXCJIYXNoXCI6IFwieFwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9XG5cdH0sXG5cdFxuXHRcIkxvZ1wiOlxuXHR7XG5cdFx0XCJQcmVPcGVyYXRpb25cIjogXCJTdWJ0cmFjdCB7e05hbWU6YX19IGFuZCB7e05hbWU6Yn19LCBzdG9yaW5nIHRoZSB2YWx1ZSBpbiB7e05hbWU6eH19LlwiLFxuXHRcdFwiUG9zdE9wZXJhdGlvblwiOiBcIk9wZXJhdGlvbiBjb21wbGV0ZToge3tOYW1lOnh9fSA9IHt7SW5wdXRWYWx1ZTphfX0gLSB7e0lucHV0VmFsdWU6Yn19ID0ge3tPdXRwdXRWYWx1ZTp4fX1cIlx0XHRcblx0fSxcblxuXHRcIlN0ZXBzXCI6XG5cdFtcblx0XHR7XG5cdFx0XHRcIk5hbWVzcGFjZVwiOiBcIlByZWNpc2VNYXRoXCIsXG5cdFx0XHRcIkluc3RydWN0aW9uXCI6IFwic3VidHJhY3RcIlxuXHRcdH1cblx0XVxufSIsIm1vZHVsZS5leHBvcnRzPXtcblx0XCJEZXNjcmlwdGlvblwiOlxuXHR7XG5cdFx0XCJOYW1lc3BhY2VcIjogXCJTdHJpbmdcIixcblx0XHRcIk9wZXJhdGlvblwiOiBcIlJlcGxhY2VcIixcblx0XHRcIlN5bm9wc2lzXCI6IFwiUmVwbGFjZSBhbGwgaW5zdGFuY2VzIG9mIHNlYXJjaEZvciB3aXRoIHJlcGxhY2VXaXRoIGluIGlucHV0U3RyaW5nXCJcblx0fSxcblxuXHRcIklucHV0c1wiOiBcblx0e1xuXHRcdFwiaW5wdXRTdHJpbmdcIjogeyBcIkhhc2hcIjogXCJpbnB1dFN0cmluZ1wiLCBcIlR5cGVcIjogXCJTdHJpbmdcIiB9LFxuXHRcdFwic2VhcmNoRm9yXCI6IHsgXCJIYXNoXCI6IFwic2VhcmNoRm9yXCIsIFwiVHlwZVwiOiBcIlN0cmluZ1wiIH0sXG5cdFx0XCJyZXBsYWNlV2l0aFwiOiB7IFwiSGFzaFwiOiBcInJlcGxhY2VXaXRoXCIsIFwiVHlwZVwiOiBcIlN0cmluZ1wiIH1cblx0fSxcblxuXHRcIk91dHB1dHNcIjpcblx0e1xuXHRcdFwib3V0cHV0U3RyaW5nXCI6IHsgXCJIYXNoXCI6IFwib3V0cHV0U3RyaW5nXCIsIFwiVHlwZVwiOiBcIlN0cmluZ1wiIH1cblx0fSxcblx0XG5cdFwiTG9nXCI6XG5cdHtcblx0XHRcIlByZU9wZXJhdGlvblwiOiBcIlNlYXJjaCBmb3IgW3t7SW5wdXRWYWx1ZTpzZWFyY2hGb3J9fV0gYW5kIHJlcGxhY2UgaXQgd2l0aCBbe3tJbnB1dFZhbHVlOnJlcGxhY2VXaXRofX1dIGluIFt7e0lucHV0VmFsdWU6aW5wdXRTdHJpbmd9fV0uXCIsXG5cdFx0XCJQb3N0T3BlcmF0aW9uXCI6IFwiT3BlcmF0aW9uIGNvbXBsZXRlOiB7e05hbWU6b3V0cHV0U3RyaW5nfX0gPSBbe3tPdXRwdXRWYWx1ZTpvdXRwdXRTdHJpbmd9fV0gZnJvbSBbe3tJbnB1dFZhbHVlOmlucHV0U3RyaW5nfX1dIHJlcGxhY2luZyBbe3tJbnB1dFZhbHVlOnNlYXJjaEZvcn19XSB3aXRoIFt7e0lucHV0VmFsdWU6cmVwbGFjZVdpdGh9fV0uXCJcblx0fSxcblxuXHRcIlN0ZXBzXCI6XG5cdFtcblx0XHR7XG5cdFx0XHRcIk5hbWVzcGFjZVwiOiBcIlN0cmluZ1wiLFxuXHRcdFx0XCJJbnN0cnVjdGlvblwiOiBcInJlcGxhY2VcIlxuXHRcdH1cblx0XVxufSIsIm1vZHVsZS5leHBvcnRzPXtcblx0XCJEZXNjcmlwdGlvblwiOlxuXHR7XG5cdFx0XCJOYW1lc3BhY2VcIjogXCJTdHJpbmdcIixcblx0XHRcIk9wZXJhdGlvblwiOiBcIlN1YnN0cmluZ1wiLFxuXHRcdFwiU3lub3BzaXNcIjogXCJHZXQgYWxsIGNoYXJhY3RlcnMgYmV0d2VlbiBpbmRleFN0YXJ0IGFuZCBpbmRleEVuZCAob3B0aW9uYWwpIGZvciBhIGdpdmVuIGlucHV0U3RyaW5nLlwiXG5cdH0sXG5cblx0XCJJbnB1dHNcIjogXG5cdHtcblx0XHRcImlucHV0U3RyaW5nXCI6IHsgXCJIYXNoXCI6IFwiaW5wdXRTdHJpbmdcIiwgXCJUeXBlXCI6IFwiU3RyaW5nXCIgfSxcblx0XHRcImluZGV4U3RhcnRcIjogeyBcIkhhc2hcIjogXCJpbmRleFN0YXJ0XCIsIFwiVHlwZVwiOiBcIk51bWJlclwiLCBcIkRlZmF1bHRcIjowIH0sXG5cdFx0XCJpbmRleEVuZFwiOiB7IFwiSGFzaFwiOiBcImluZGV4RW5kXCIsIFwiVHlwZVwiOiBcIlN0cmluZ1wiLCBcIkRlZmF1bHRcIjpudWxsIH1cblx0fSxcblxuXHRcIk91dHB1dHNcIjpcblx0e1xuXHRcdFwib3V0cHV0U3RyaW5nXCI6IHsgXCJIYXNoXCI6IFwib3V0cHV0U3RyaW5nXCIsIFwiVHlwZVwiOiBcIlN0cmluZ1wiIH1cblx0fSxcblx0XG5cdFwiTG9nXCI6XG5cdHtcblx0XHRcIlByZU9wZXJhdGlvblwiOiBcIkdldCBhbGwgY2hhcmFjdGVycyBiZXR3ZWVuIHt7SW5wdXRWYWx1ZTppbmRleFN0YXJ0fX0gYW5kIHt7SW5wdXRWYWx1ZTppbmRleEVuZH19IGluIFt7e0lucHV0VmFsdWU6aW5wdXRTdHJpbmd9fV0uXCIsXG5cdFx0XCJQb3N0T3BlcmF0aW9uXCI6IFwiT3BlcmF0aW9uIGNvbXBsZXRlOiB7e05hbWU6b3V0cHV0U3RyaW5nfX0gPSBbe3tPdXRwdXRWYWx1ZTpvdXRwdXRTdHJpbmd9fV0gZnJvbSBbe3tJbnB1dFZhbHVlOmlucHV0U3RyaW5nfX1dIGJldHdlZW4ge3tJbnB1dFZhbHVlOmluZGV4U3RhcnR9fSBhbmQge3tJbnB1dFZhbHVlOmluZGV4RW5kfX0uXCJcblx0fSxcblxuXHRcIlN0ZXBzXCI6XG5cdFtcblx0XHR7XG5cdFx0XHRcIk5hbWVzcGFjZVwiOiBcIlN0cmluZ1wiLFxuXHRcdFx0XCJJbnN0cnVjdGlvblwiOiBcInN1YnN0cmluZ1wiXG5cdFx0fVxuXHRdXG59IiwibW9kdWxlLmV4cG9ydHM9e1xuXHRcIkRlc2NyaXB0aW9uXCI6XG5cdHtcblx0XHRcIk5hbWVzcGFjZVwiOiBcIlN0cmluZ1wiLFxuXHRcdFwiT3BlcmF0aW9uXCI6IFwiVHJpbVwiLFxuXHRcdFwiU3lub3BzaXNcIjogXCJUcmltIHdoaXRlc3BhY2Ugb2ZmIHRoZSBlbmQgb2Ygc3RyaW5nIGluIGlucHV0U3RyaW5nLCBwdXR0aW5nIHRoZSByZXN1bHQgaW4gb3V0cHV0U3RyaW5nXCJcblx0fSxcblxuXHRcIklucHV0c1wiOiBcblx0e1xuXHRcdFwiaW5wdXRTdHJpbmdcIjogeyBcIkhhc2hcIjogXCJpbnB1dFN0cmluZ1wiLCBcIlR5cGVcIjogXCJTdHJpbmdcIiB9XG5cdH0sXG5cblx0XCJPdXRwdXRzXCI6XG5cdHtcblx0XHRcIm91dHB1dFN0cmluZ1wiOiB7IFwiSGFzaFwiOiBcIm91dHB1dFN0cmluZ1wiLCBcIlR5cGVcIjogXCJTdHJpbmdcIiB9XG5cdH0sXG5cdFxuXHRcIkxvZ1wiOlxuXHR7XG5cdFx0XCJQcmVPcGVyYXRpb25cIjogXCJUcmltIHRoZSB3aGl0ZXNwYWNlIGZyb20gdmFsdWUgW3t7SW5wdXRWYWx1ZTppbnB1dFN0cmluZ319XS5cIixcblx0XHRcIlBvc3RPcGVyYXRpb25cIjogXCJPcGVyYXRpb24gY29tcGxldGU6IHt7TmFtZTpvdXRwdXRTdHJpbmd9fSA9IFt7e091dHB1dFZhbHVlOm91dHB1dFN0cmluZ319XSBmcm9tIFt7e0lucHV0VmFsdWU6aW5wdXRTdHJpbmd9fV1cIlxuXHR9LFxuXG5cdFwiU3RlcHNcIjpcblx0W1xuXHRcdHtcblx0XHRcdFwiTmFtZXNwYWNlXCI6IFwiU3RyaW5nXCIsXG5cdFx0XHRcIkluc3RydWN0aW9uXCI6IFwidHJpbVwiXG5cdFx0fVxuXHRdXG59IiwibGV0IGxpYkVsdWNpZGF0b3JJbnN0cnVjdGlvblNldCA9IHJlcXVpcmUoJy4uL0VsdWNpZGF0b3ItSW5zdHJ1Y3Rpb25TZXQuanMnKTtcblxuY29uc3QgbGliRGVjaW1hbCA9IHJlcXVpcmUoJ2RlY2ltYWwuanMnKTtcblxubGV0IGFkZCA9IChwT3BlcmF0aW9uKSA9Plxue1xuICAgIC8vIFRoaXMgY291bGQgYmUgZG9uZSBpbiBvbmUgbGluZSwgYnV0LCB3b3VsZCBiZSBtb3JlIGRpZmZpY3VsdCB0byBjb21wcmVoZW5kLlxuICAgIGxldCB0bXBBID0gbmV3IGxpYkRlY2ltYWwocE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdhJykpO1xuICAgIGxldCB0bXBCID0gbmV3IGxpYkRlY2ltYWwocE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdiJykpO1xuICAgIHBPcGVyYXRpb24uT3V0cHV0TWFueWZlc3Quc2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5PdXRwdXRPYmplY3QsICd4JywgdG1wQS5wbHVzKHRtcEIpLnRvU3RyaW5nKCkpO1xuICAgIHJldHVybiB0cnVlO1xufTtcblxubGV0IHN1YnRyYWN0ID0gKHBPcGVyYXRpb24pID0+XG57XG4gICAgLy8gVGhpcyBjb3VsZCBiZSBkb25lIGluIG9uZSBsaW5lLCBidXQsIHdvdWxkIGJlIG1vcmUgZGlmZmljdWx0IHRvIGNvbXByZWhlbmQuXG4gICAgbGV0IHRtcEEgPSBuZXcgbGliRGVjaW1hbChwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ2EnKSk7XG4gICAgbGV0IHRtcEIgPSBuZXcgbGliRGVjaW1hbChwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ2InKSk7XG4gICAgcE9wZXJhdGlvbi5PdXRwdXRNYW55ZmVzdC5zZXRWYWx1ZUJ5SGFzaChwT3BlcmF0aW9uLk91dHB1dE9iamVjdCwgJ3gnLCB0bXBBLnN1Yih0bXBCKS50b1N0cmluZygpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbmxldCBtdWx0aXBseSA9IChwT3BlcmF0aW9uKSA9Plxue1xuICAgIC8vIFRoaXMgY291bGQgYmUgZG9uZSBpbiBvbmUgbGluZSwgYnV0LCB3b3VsZCBiZSBtb3JlIGRpZmZpY3VsdCB0byBjb21wcmVoZW5kLlxuICAgIGxldCB0bXBBID0gbmV3IGxpYkRlY2ltYWwocE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdhJykpO1xuICAgIGxldCB0bXBCID0gbmV3IGxpYkRlY2ltYWwocE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdiJykpO1xuICAgIHBPcGVyYXRpb24uT3V0cHV0TWFueWZlc3Quc2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5PdXRwdXRPYmplY3QsICd4JywgdG1wQS5tdWwodG1wQikudG9TdHJpbmcoKSk7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5sZXQgZGl2aWRlID0gKHBPcGVyYXRpb24pID0+XG57XG4gICAgLy8gVGhpcyBjb3VsZCBiZSBkb25lIGluIG9uZSBsaW5lLCBidXQsIHdvdWxkIGJlIG1vcmUgZGlmZmljdWx0IHRvIGNvbXByZWhlbmQuXG4gICAgbGV0IHRtcEEgPSBuZXcgbGliRGVjaW1hbChwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ2EnKSk7XG4gICAgbGV0IHRtcEIgPSBuZXcgbGliRGVjaW1hbChwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ2InKSk7XG4gICAgcE9wZXJhdGlvbi5PdXRwdXRNYW55ZmVzdC5zZXRWYWx1ZUJ5SGFzaChwT3BlcmF0aW9uLk91dHB1dE9iamVjdCwgJ3gnLCB0bXBBLmRpdih0bXBCKS50b1N0cmluZygpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbmxldCBhZ2dyZWdhdGUgPSAocE9wZXJhdGlvbikgPT5cbntcbiAgICBsZXQgdG1wQSA9IHBPcGVyYXRpb24uSW5wdXRNYW55ZmVzdC5nZXRWYWx1ZUJ5SGFzaChwT3BlcmF0aW9uLklucHV0T2JqZWN0LCAnYScpO1xuXG4gICAgbGV0IHRtcE9iamVjdFR5cGUgPSB0eXBlb2YodG1wQSk7XG5cbiAgICBsZXQgdG1wQWdncmVnYXRpb25WYWx1ZSA9IG5ldyBsaWJEZWNpbWFsKDApO1xuXG4gICAgaWYgKHRtcE9iamVjdFR5cGUgPT0gJ29iamVjdCcpXG4gICAge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0bXBBKSlcbiAgICAgICAge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0bXBBLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYW4gYXJyYXksIGVudW1lcmF0ZSBpdCBhbmQgdHJ5IHRvIGFnZ3JlZ2F0ZSBlYWNoIG51bWJlclxuICAgICAgICAgICAgICAgIGxldCB0bXBWYWx1ZSA9IG5ldyBsaWJEZWNpbWFsKHRtcEFbaV0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHRtcFZhbHVlKSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHBPcGVyYXRpb24ubG9nRXJyb3IoYEFycmF5IGVsZW1lbnQgaW5kZXggWyR7aX1dIGNvdWxkIG5vdCBiZSBwYXJzZWQgYXMgYSBudW1iZXIgYnkgRGVjaW1hbC5qczsgc2tpcHBpbmcuICAoJHt0bXBBW2ldfSlgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wQWdncmVnYXRpb25WYWx1ZSA9IHRtcEFnZ3JlZ2F0aW9uVmFsdWUucGx1cyh0bXBWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHBPcGVyYXRpb24ubG9nSW5mbyhgQWRkaW5nIGVsZW1lbnQgWyR7aX1dIHZhbHVlICR7dG1wVmFsdWV9IHRvdGFsaW5nOiAke3RtcEFnZ3JlZ2F0aW9uVmFsdWV9YClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgdG1wT2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzKHRtcEEpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0bXBPYmplY3RLZXlzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxldCB0bXBWYWx1ZSA9IG5ldyBsaWJEZWNpbWFsKHRtcEFbdG1wT2JqZWN0S2V5c1tpXV0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHRtcFZhbHVlKSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHBPcGVyYXRpb24ubG9nRXJyb3IoYE9iamVjdCBwcm9wZXJ0eSBbJHt0bXBPYmplY3RLZXlzW2ldfV0gY291bGQgbm90IGJlIHBhcnNlZCBhcyBhIG51bWJlcjsgc2tpcHBpbmcuICAoJHt0bXBBW3RtcE9iamVjdEtleXNbaV1dfSlgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wQWdncmVnYXRpb25WYWx1ZSA9IHRtcEFnZ3JlZ2F0aW9uVmFsdWUucGx1cyh0bXBWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHBPcGVyYXRpb24ubG9nSW5mbyhgQWRkaW5nIG9iamVjdCBwcm9wZXJ0eSBbJHt0bXBPYmplY3RLZXlzW2ldfV0gdmFsdWUgJHt0bXBWYWx1ZX0gdG90YWxpbmc6ICR7dG1wQWdncmVnYXRpb25WYWx1ZX1gKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICBsZXQgdG1wVmFsdWUgPSBuZXcgbGliRGVjaW1hbCh0bXBBKTtcblxuICAgICAgICBpZiAoaXNOYU4odG1wVmFsdWUpKVxuICAgICAgICB7XG4gICAgICAgICAgICBwT3BlcmF0aW9uLmxvZ0Vycm9yKGBEaXJlY3QgdmFsdWUgY291bGQgbm90IGJlIHBhcnNlZCBhcyBhIG51bWJlcjsgc2tpcHBpbmcuICAoJHt0bXBBfSlgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRtcEFnZ3JlZ2F0aW9uVmFsdWUgPSB0bXBWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwT3BlcmF0aW9uLk91dHB1dE1hbnlmZXN0LnNldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uT3V0cHV0T2JqZWN0LCAneCcsIHRtcEFnZ3JlZ2F0aW9uVmFsdWUudG9TdHJpbmcoKSk7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5sZXQgdG9GcmFjdGlvbiA9IChwT3BlcmF0aW9uKSA9Plxue1xuICAgIC8vIFRoaXMgY291bGQgYmUgZG9uZSBpbiBvbmUgbGluZSwgYnV0LCB3b3VsZCBiZSBtb3JlIGRpZmZpY3VsdCB0byBjb21wcmVoZW5kLlxuICAgIGxldCB0bXBBID0gbmV3IGxpYkRlY2ltYWwocE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdhJykpO1xuICAgIHBPcGVyYXRpb24uT3V0cHV0TWFueWZlc3Quc2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5PdXRwdXRPYmplY3QsICd4JywgdG1wQS50b0ZyYWN0aW9uKCkudG9TdHJpbmcoKSk7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5cbmNsYXNzIFByZWNpc2VNYXRoIGV4dGVuZHMgbGliRWx1Y2lkYXRvckluc3RydWN0aW9uU2V0XG57XG4gICAgY29uc3RydWN0b3IocEVsdWNpZGF0b3IpXG4gICAge1xuICAgICAgICBzdXBlcihwRWx1Y2lkYXRvcik7XG4gICAgICAgIHRoaXMubmFtZXNwYWNlID0gJ1ByZWNpc2VNYXRoJztcbiAgICB9XG5cbiAgICBpbml0aWFsaXplSW5zdHJ1Y3Rpb25zKClcbiAgICB7XG4gICAgICAgIHRoaXMuYWRkSW5zdHJ1Y3Rpb24oJ2FkZCcsIGFkZCk7XG5cbiAgICAgICAgdGhpcy5hZGRJbnN0cnVjdGlvbignc3VidHJhY3QnLCBzdWJ0cmFjdCk7XG4gICAgICAgIHRoaXMuYWRkSW5zdHJ1Y3Rpb24oJ3N1YicsIHN1YnRyYWN0KTtcblxuICAgICAgICB0aGlzLmFkZEluc3RydWN0aW9uKCdtdWx0aXBseScsIG11bHRpcGx5KTtcbiAgICAgICAgdGhpcy5hZGRJbnN0cnVjdGlvbignbXVsJywgbXVsdGlwbHkpO1xuXG4gICAgICAgIHRoaXMuYWRkSW5zdHJ1Y3Rpb24oJ2RpdmlkZScsIGRpdmlkZSk7XG4gICAgICAgIHRoaXMuYWRkSW5zdHJ1Y3Rpb24oJ2RpdicsIGRpdmlkZSk7XG5cbiAgICAgICAgdGhpcy5hZGRJbnN0cnVjdGlvbignYWdncmVnYXRlJywgYWdncmVnYXRlKTtcblxuXHRcdHRoaXMuYWRkSW5zdHJ1Y3Rpb24oJ3RvZnJhY3Rpb24nLCB0b0ZyYWN0aW9uKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpbml0aWFsaXplT3BlcmF0aW9ucygpXG4gICAge1xuICAgICAgICB0aGlzLmFkZE9wZXJhdGlvbignYWRkJywgcmVxdWlyZShgLi9PcGVyYXRpb25zL1ByZWNpc2VNYXRoLUFkZC5qc29uYCkpO1xuICAgICAgICB0aGlzLmFkZE9wZXJhdGlvbignc3VidHJhY3QnLCByZXF1aXJlKGAuL09wZXJhdGlvbnMvUHJlY2lzZU1hdGgtU3VidHJhY3QuanNvbmApKTtcbiAgICAgICAgdGhpcy5hZGRPcGVyYXRpb24oJ211bHRpcGx5JywgcmVxdWlyZShgLi9PcGVyYXRpb25zL1ByZWNpc2VNYXRoLU11bHRpcGx5Lmpzb25gKSk7XG4gICAgICAgIHRoaXMuYWRkT3BlcmF0aW9uKCdkaXZpZGUnLCByZXF1aXJlKGAuL09wZXJhdGlvbnMvUHJlY2lzZU1hdGgtRGl2aWRlLmpzb25gKSk7XG4gICAgICAgIHRoaXMuYWRkT3BlcmF0aW9uKCdhZ2dyZWdhdGUnLCByZXF1aXJlKCcuL09wZXJhdGlvbnMvUHJlY2lzZU1hdGgtQWdncmVnYXRlLmpzb24nKSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByZWNpc2VNYXRoOyIsIi8vIFNvbHV0aW9uIHByb3ZpZGVycyBhcmUgbWVhbnQgdG8gYmUgc3RhdGVsZXNzLCBhbmQgbm90IGNsYXNzZXMuXG4vLyBUaGVzZSBzb2x1dGlvbiBwcm92aWRlcnMgYXJlIGFraW4gdG8gZHJpdmVycywgY29ubmVjdGluZyBjb2RlIGxpYnJhcmllcyBvciBcbi8vIG90aGVyIHR5cGVzIG9mIGJlaGF2aW9yIHRvIG1hcHBpbmcgb3BlcmF0aW9ucy5cblxubGV0IGxpYkVsdWNpZGF0b3JJbnN0cnVjdGlvblNldCA9IHJlcXVpcmUoJy4uL0VsdWNpZGF0b3ItSW5zdHJ1Y3Rpb25TZXQuanMnKTtcblxubGV0IHRyaW0gPSAocE9wZXJhdGlvbikgPT5cbntcbiAgICBsZXQgdG1wSW5wdXRTdHJpbmcgPSBwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ2lucHV0U3RyaW5nJyk7XG5cbiAgICBwT3BlcmF0aW9uLk91dHB1dE1hbnlmZXN0LnNldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uT3V0cHV0T2JqZWN0LCAnb3V0cHV0U3RyaW5nJywgdG1wSW5wdXRTdHJpbmcudHJpbSgpKTtcblxuICAgIHJldHVybiB0cnVlO1xufTtcblxubGV0IHJlcGxhY2UgPSAocE9wZXJhdGlvbikgPT5cbntcbiAgICBsZXQgdG1wSW5wdXRTdHJpbmcgPSBwT3BlcmF0aW9uLklucHV0TWFueWZlc3QuZ2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5JbnB1dE9iamVjdCwgJ2lucHV0U3RyaW5nJyk7XG4gICAgbGV0IHRtcFNlYXJjaEZvciA9IHBPcGVyYXRpb24uSW5wdXRNYW55ZmVzdC5nZXRWYWx1ZUJ5SGFzaChwT3BlcmF0aW9uLklucHV0T2JqZWN0LCAnc2VhcmNoRm9yJyk7XG4gICAgbGV0IHRtcFJlcGxhY2VXaXRoID0gcE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdyZXBsYWNlV2l0aCcpO1xuXG4gICAgcE9wZXJhdGlvbi5PdXRwdXRNYW55ZmVzdC5zZXRWYWx1ZUJ5SGFzaChwT3BlcmF0aW9uLk91dHB1dE9iamVjdCwgJ291dHB1dFN0cmluZycsIHRtcElucHV0U3RyaW5nLnJlcGxhY2UodG1wU2VhcmNoRm9yLCB0bXBSZXBsYWNlV2l0aCkpO1xuXG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5sZXQgc3Vic3RyaW5nID0gKHBPcGVyYXRpb24pID0+XG57XG4gICAgbGV0IHRtcElucHV0U3RyaW5nID0gcE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdpbnB1dFN0cmluZycpO1xuICAgIGxldCBpbmRleFN0YXJ0ID0gcE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdpbmRleFN0YXJ0Jyk7XG4gICAgbGV0IGluZGV4RW5kID0gcE9wZXJhdGlvbi5JbnB1dE1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uSW5wdXRPYmplY3QsICdpbmRleEVuZCcpO1xuXG4gICAgaWYgKGluZGV4RW5kICE9IG51bGwpXG4gICAge1xuICAgICAgICBwT3BlcmF0aW9uLk91dHB1dE1hbnlmZXN0LnNldFZhbHVlQnlIYXNoKHBPcGVyYXRpb24uT3V0cHV0T2JqZWN0LCAnb3V0cHV0U3RyaW5nJywgdG1wSW5wdXRTdHJpbmcuc3Vic3RyaW5nKGluZGV4U3RhcnQsIGluZGV4RW5kKSk7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIHBPcGVyYXRpb24uT3V0cHV0TWFueWZlc3Quc2V0VmFsdWVCeUhhc2gocE9wZXJhdGlvbi5PdXRwdXRPYmplY3QsICdvdXRwdXRTdHJpbmcnLCB0bXBJbnB1dFN0cmluZy5zdWJzdHJpbmcoaW5kZXhTdGFydCkpO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xufTtcblxuY2xhc3MgU3RyaW5nT3BlcmF0aW9ucyBleHRlbmRzIGxpYkVsdWNpZGF0b3JJbnN0cnVjdGlvblNldFxue1xuICAgIGNvbnN0cnVjdG9yKHBFbHVjaWRhdG9yKVxuICAgIHtcbiAgICAgICAgc3VwZXIocEVsdWNpZGF0b3IpO1xuICAgICAgICB0aGlzLm5hbWVzcGFjZSA9ICdTdHJpbmcnO1xuICAgIH1cblxuICAgIGluaXRpYWxpemVJbnN0cnVjdGlvbnMoKVxuICAgIHtcbiAgICAgICAgdGhpcy5hZGRJbnN0cnVjdGlvbigndHJpbScsIHRyaW0pO1xuICAgICAgICB0aGlzLmFkZEluc3RydWN0aW9uKCdyZXBsYWNlJywgcmVwbGFjZSk7XG4gICAgICAgIHRoaXMuYWRkSW5zdHJ1Y3Rpb24oJ3N1YnN0cmluZycsIHN1YnN0cmluZyk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZU9wZXJhdGlvbnMoKVxuICAgIHtcbiAgICAgICAgdGhpcy5hZGRPcGVyYXRpb24oJ3RyaW0nLCByZXF1aXJlKGAuL09wZXJhdGlvbnMvU3RyaW5nLVRyaW0uanNvbmApKTtcbiAgICAgICAgdGhpcy5hZGRPcGVyYXRpb24oJ3JlcGxhY2UnLCByZXF1aXJlKGAuL09wZXJhdGlvbnMvU3RyaW5nLVJlcGxhY2UuanNvbmApKTtcbiAgICAgICAgdGhpcy5hZGRPcGVyYXRpb24oJ3N1YnN0cmluZycsIHJlcXVpcmUoYC4vT3BlcmF0aW9ucy9TdHJpbmctU3Vic3RyaW5nLmpzb25gKSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0cmluZ09wZXJhdGlvbnM7IiwiLyoqXG4qIEBsaWNlbnNlIE1JVFxuKiBAYXV0aG9yIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbiovXG5jb25zdCBsaWJTaW1wbGVMb2cgPSByZXF1aXJlKCcuL0VsdWNpZGF0b3ItTG9nVG9Db25zb2xlLmpzJyk7XG5jb25zdCBsaWJNYW55ZmVzdCA9IHJlcXVpcmUoJ21hbnlmZXN0Jyk7XG5jb25zdCBsaWJQcmVjZWRlbnQgPSByZXF1aXJlKCdwcmVjZWRlbnQnKTtcblxuY29uc3QgbGliRWx1Y2lkYXRvckluc3RydWN0aW9uU2V0ID0gcmVxdWlyZSgnLi9FbHVjaWRhdG9yLUluc3RydWN0aW9uU2V0LmpzJyk7XG5cbi8qKlxuKiBFbHVjaWRhdG9yIG9iamVjdCBhZGRyZXNzLWJhc2VkIGRlc2NyaXB0aW9ucyBhbmQgbWFuaXB1bGF0aW9ucy5cbipcbiogQGNsYXNzIEVsdWNpZGF0b3JcbiovXG5jbGFzcyBFbHVjaWRhdG9yXG57XG4gICAgY29uc3RydWN0b3IocE9wZXJhdGlvbnMsIGZJbmZvTG9nLCBmRXJyb3JMb2cpXG4gICAge1xuICAgICAgICAvLyBXaXJlIGluIGxvZ2dpbmdcbiAgICAgICAgdGhpcy5sb2dJbmZvID0gKHR5cGVvZihmSW5mb0xvZykgPT09ICdmdW5jdGlvbicpID8gZkluZm9Mb2cgOiBsaWJTaW1wbGVMb2cuaW5mbztcbiAgICAgICAgdGhpcy5sb2dXYXJuaW5nID0gKHR5cGVvZihmV2FybmluZ0xvZykgPT09ICdmdW5jdGlvbicpID8gZldhcm5pbmdMb2cgOiBsaWJTaW1wbGVMb2cud2FybmluZztcbiAgICAgICAgdGhpcy5sb2dFcnJvciA9ICh0eXBlb2YoZkVycm9yTG9nKSA9PT0gJ2Z1bmN0aW9uJykgPyBmRXJyb3JMb2cgOiBsaWJTaW1wbGVMb2cuZXJyb3I7XG5cblx0XHQvLyBJbnN0cnVjdGlvbnMgYXJlIHRoZSBiYXNpYyBidWlsZGluZyBibG9ja3MgZm9yIG9wZXJhdGlvbnNcblx0XHR0aGlzLmluc3RydWN0aW9uU2V0cyA9IHt9O1xuXG5cdFx0Ly8gT3BlcmF0aW9ucyBhcmUgdGhlIHNvbHZlcnMgdGhhdCBjYW4gYmUgY2FsbGVkIChpbnN0cnVjdGlvbnMgY2FuJ3QgYmUgY2FsbGVkIGRpcmVjdGx5KVxuXHRcdC8vIFRoZXNlIGNhbiBiZSBhZGRlZCBhdCBydW4tdGltZSBhcyB3ZWxsXG5cdFx0dGhpcy5vcGVyYXRpb25TZXRzID0ge307XG5cblx0XHQvLyBEZWNpZGUgbGF0ZXIgaG93IHRvIG1ha2UgdGhpcyB0cnVseSB1bmlxdWUuXG5cdFx0dGhpcy5VVUlEID0gMDtcblxuXHRcdHRoaXMubG9hZERlZmF1bHRJbnN0cnVjdGlvblNldHMoKTtcblxuXHRcdGlmIChwT3BlcmF0aW9ucylcblx0XHR7XG5cdFx0XHRsZXQgdG1wU29sdmVySGFzaGVzID0gT2JqZWN0LmtleXMocE9wZXJhdGlvbnMpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0bXBTb2x2ZXJIYXNoZXMubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuYWRkT3BlcmF0aW9uKCdDdXN0b20nLHRtcFNvbHZlckhhc2hlc1tpXSwgcE9wZXJhdGlvbnNbdG1wU29sdmVySGFzaGVzW2ldXSk7XG5cdFx0XHR9XG5cdFx0fVxuICAgIH1cblxuXHQvLyBMb2FkIGFuIGluc3RydWN0aW9uIHNldFxuXHRsb2FkSW5zdHJ1Y3Rpb25TZXQoY0luc3RydWN0aW9uU2V0KVxuXHR7XG5cdFx0bGV0IHRtcEluc3RydWN0aW9uU2V0ID0gbmV3IGNJbnN0cnVjdGlvblNldCh0aGlzKTtcblx0XHQvLyBTZXR1cCB0aGUgbmFtZXNwYWNlXG5cdFx0dG1wSW5zdHJ1Y3Rpb25TZXQuaW5pdGlhbGl6ZU5hbWVzcGFjZSgpO1xuXHRcdHRtcEluc3RydWN0aW9uU2V0LmluaXRpYWxpemVJbnN0cnVjdGlvbnMoKTtcblx0XHR0bXBJbnN0cnVjdGlvblNldC5pbml0aWFsaXplT3BlcmF0aW9ucygpO1xuXHR9XG5cblx0bG9hZERlZmF1bHRJbnN0cnVjdGlvblNldHMoKVxuXHR7XG5cdFx0Ly8gVGhlIGphdmFzY3JpcHQgbWF0aCBpbnN0cnVjdGlvbnMgYW5kIG9wZXJhdGlvbnNcblx0XHQvLyBUaGVzZSBwcm92aWRlIHRoZSBcIk1hdGhcIiBuYW1lc3BhY2Vcblx0XHR0aGlzLmxvYWRJbnN0cnVjdGlvblNldChyZXF1aXJlKGAuL0luc3RydWN0aW9uU2V0cy9NYXRoLUphdmFzY3JpcHQuanNgKSk7XG5cblx0XHQvLyBBIHByZWNpc2lvbiBqYXZhc2NyaXB0IG1hdGggbGlicmFyeSB0aGF0IGlzIGNvbnNpc3RlbnQgYWNyb3NzIGJyb3dzZXJzLCBzdGFibGUgYW5kIHdpdGhvdXQgbWFudGlzc2EgaXNzdWVzXG5cdFx0Ly8gVXNlcyBEZWNpbWFsLmpzXG5cdFx0Ly8gVGhlc2UgcHJvdmlkZSB0aGUgXCJQcmVjaXNlTWF0aFwiIG5hbWVzcGFjZVxuXHRcdHRoaXMubG9hZEluc3RydWN0aW9uU2V0KHJlcXVpcmUoYC4vSW5zdHJ1Y3Rpb25TZXRzL1ByZWNpc2VNYXRoLURlY2ltYWwuanNgKSk7XG5cblx0XHQvLyBUaGUgYWJzdHJhY3QgZ2VvbWV0cnkgaW5zdHJ1Y3Rpb25zIGFuZCBvcGVyYXRpb25zIChyZWN0YW5nbGUgYXJlYSwgY2lyY2xlIGFyZWEsIGV0Yy4pXG5cdFx0Ly8gVGhlc2UgcHJvdmlkZSB0aGUgXCJHZW9tZXRyeVwiIG5hbWVzcGFjZVxuXHRcdHRoaXMubG9hZEluc3RydWN0aW9uU2V0KHJlcXVpcmUoYC4vSW5zdHJ1Y3Rpb25TZXRzL0dlb21ldHJ5LmpzYCkpO1xuXG5cdFx0Ly8gVGhlIGxvZ2ljIG9wZXJhdGlvbnMgKGlmLCBleGVjdXRpb24gb2YgaW5zdHJ1Y3Rpb25zLCBldGMuKVxuXHRcdC8vIFRoZXNlIHByb3ZpZGUgdGhlIFwiTG9naWNcIiBuYW1lc3BhY2Vcblx0XHR0aGlzLmxvYWRJbnN0cnVjdGlvblNldChyZXF1aXJlKGAuL0luc3RydWN0aW9uU2V0cy9Mb2dpYy5qc2ApKTtcblxuXHRcdC8vIEJhc2ljIHN0cmluZyBtYW5pcHVsYXRpb24gaW5zdHJ1Y3Rpb25zIGFuZCBvcGVyYXRpb25zXG5cdFx0Ly8gVGhlc2UgcHJvdmlkZSB0aGUgXCJTdHJpbmdcIiBuYW1lc3BhY2Vcblx0XHR0aGlzLmxvYWRJbnN0cnVjdGlvblNldChyZXF1aXJlKGAuL0luc3RydWN0aW9uU2V0cy9TdHJpbmcuanNgKSk7XG5cdH1cblxuXHRvcGVyYXRpb25FeGlzdHMocE5hbWVzcGFjZSwgcE9wZXJhdGlvbkhhc2gpXG5cdHtcblx0XHRpZiAoKHR5cGVvZihwTmFtZXNwYWNlKSAhPSAnc3RyaW5nJykgfHwgKHR5cGVvZihwT3BlcmF0aW9uSGFzaCkgIT0gJ3N0cmluZycpKVxuXHRcdHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRsZXQgdG1wTmFtZXNwYWNlID0gcE5hbWVzcGFjZS50b0xvd2VyQ2FzZSgpO1xuXHRcdHJldHVybiAodGhpcy5vcGVyYXRpb25TZXRzLmhhc093blByb3BlcnR5KHRtcE5hbWVzcGFjZSkgJiYgdGhpcy5vcGVyYXRpb25TZXRzW3RtcE5hbWVzcGFjZV0uaGFzT3duUHJvcGVydHkocE9wZXJhdGlvbkhhc2gudG9Mb3dlckNhc2UoKSkpO1xuXHR9XG5cblx0YWRkT3BlcmF0aW9uKHBOYW1lc3BhY2UsIHBPcGVyYXRpb25IYXNoLCBwT3BlcmF0aW9uKVxuXHR7XG4gICAgICAgIGlmICh0eXBlb2YocE5hbWVzcGFjZSkgIT0gJ3N0cmluZycpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMubG9nRXJyb3IoYEF0dGVtcHRlZCB0byBhZGQgYW4gb3BlcmF0aW9uIGF0IHJ1bnRpbWUgdmlhIEVsdWNpZGF0b3IuYWRkT3BlcmF0aW9uIHdpdGggYW4gaW52YWxpZCBuYW1lc3BhY2U7IGV4cGVjdGVkIGEgc3RyaW5nIGJ1dCB0aGUgdHlwZSB3YXMgJHt0eXBlb2YocE5hbWVzcGFjZSl9YCwgcE9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuXHRcdGxldCB0bXBPcGVyYXRpb25JbmplY3RvciA9IG5ldyBsaWJFbHVjaWRhdG9ySW5zdHJ1Y3Rpb25TZXQodGhpcyk7XG5cdFx0dG1wT3BlcmF0aW9uSW5qZWN0b3IuaW5pdGlhbGl6ZU5hbWVzcGFjZShwTmFtZXNwYWNlKTtcblxuXHRcdHJldHVybiB0bXBPcGVyYXRpb25JbmplY3Rvci5hZGRPcGVyYXRpb24ocE9wZXJhdGlvbkhhc2gsIHBPcGVyYXRpb24pO1xuXHR9XG5cblx0c29sdmVJbnRlcm5hbE9wZXJhdGlvbihwTmFtZXNwYWNlLCBwT3BlcmF0aW9uSGFzaCwgcElucHV0T2JqZWN0LCBwT3V0cHV0T2JqZWN0LCBwRGVzY3JpcHRpb25NYW55ZmVzdCwgcElucHV0QWRkcmVzc01hcHBpbmcsIHBPdXRwdXRBZGRyZXNzTWFwcGluZywgcFNvbHV0aW9uQ29udGV4dClcblx0e1xuXHRcdGlmICghdGhpcy5vcGVyYXRpb25FeGlzdHMocE5hbWVzcGFjZSwgcE9wZXJhdGlvbkhhc2gpKVxuXHRcdHtcblx0XHRcdHRoaXMubG9nRXJyb3IoYEF0dGVtcHRlZCB0byBzb2x2ZUludGVybmFsT3BlcmF0aW9uIGZvciBuYW1lc3BhY2UgJHtwTmFtZXNwYWNlfSBvcGVyYXRpb25IYXNoICR7cE9wZXJhdGlvbkhhc2h9IGJ1dCB0aGUgb3BlcmF0aW9uIHdhcyBub3QgZm91bmQuYCk7XG5cdFx0XHQvLyBUT0RPOiBTaG91bGQgdGhpcyByZXR1cm4gc29tZXRoaW5nIHdpdGggYW4gZXJyb3IgbG9nIHBvcHVsYXRlZD9cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0bGV0IHRtcE9wZXJhdGlvbiA9IHRoaXMub3BlcmF0aW9uU2V0c1twTmFtZXNwYWNlLnRvTG93ZXJDYXNlKCldW3BPcGVyYXRpb25IYXNoLnRvTG93ZXJDYXNlKCldO1xuXHRcdHJldHVybiB0aGlzLnNvbHZlT3BlcmF0aW9uKHRtcE9wZXJhdGlvbiwgcElucHV0T2JqZWN0LCBwT3V0cHV0T2JqZWN0LCBwRGVzY3JpcHRpb25NYW55ZmVzdCwgcElucHV0QWRkcmVzc01hcHBpbmcsIHBPdXRwdXRBZGRyZXNzTWFwcGluZywgcFNvbHV0aW9uQ29udGV4dCk7XG5cdH1cblxuXHRzb2x2ZU9wZXJhdGlvbihwT3BlcmF0aW9uT2JqZWN0LCBwSW5wdXRPYmplY3QsIHBPdXRwdXRPYmplY3QsIHBEZXNjcmlwdGlvbk1hbnlmZXN0LCBwSW5wdXRBZGRyZXNzTWFwcGluZywgcE91dHB1dEFkZHJlc3NNYXBwaW5nLCBwU29sdXRpb25Db250ZXh0KVxuXHR7XG5cdFx0bGV0IHRtcE9wZXJhdGlvbiA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocE9wZXJhdGlvbk9iamVjdCkpO1xuXG5cdFx0aWYgKHR5cGVvZihwSW5wdXRPYmplY3QpICE9ICdvYmplY3QnKVxuXHRcdHtcbiAgICAgICAgICAgIHRoaXMubG9nRXJyb3IoYEF0dGVtcHRlZCB0byBydW4gYSBzb2x2ZSBidXQgdGhlIHBhc3NlZCBpbiBJbnB1dCB3YXMgbm90IGFuIG9iamVjdC4gIFRoZSB0eXBlIHdhcyAke3R5cGVvZihwSW5wdXRPYmplY3QpfS5gKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0bGV0IHRtcElucHV0T2JqZWN0ID0gcElucHV0T2JqZWN0O1xuXG5cdFx0Ly8gRGVmYXVsdCB0byByZXVzaW5nIHRoZSBpbnB1dCBvYmplY3QgYXMgdGhlIG91dHB1dCBvYmplY3QuXG5cdFx0bGV0IHRtcE91dHB1dE9iamVjdCA9IHRtcElucHV0T2JqZWN0O1xuXG5cdFx0Ly8gVGhpcyBpcyBob3cgcmVjdXJzaXZlIHNvbHV0aW9ucyBiaW5kIHRoZWlyIGNvbnRleHQgdG9nZXRoZXIuXG5cdFx0bGV0IHRtcFNvbHV0aW9uQ29udGV4dCA9IHBTb2x1dGlvbkNvbnRleHQ7XG5cdFx0aWYgKHR5cGVvZih0bXBTb2x1dGlvbkNvbnRleHQpID09PSAndW5kZWZpbmVkJylcblx0XHR7XG5cdFx0XHR0bXBTb2x1dGlvbkNvbnRleHQgPSAoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcIlNvbHV0aW9uR1VJRFwiOiBgU29sdXRpb24tJHt0aGlzLlVVSUQrK31gLCBcblx0XHRcdFx0XHRcIlNvbHV0aW9uQmFzZU5hbWVzcGFjZVwiOiBwT3BlcmF0aW9uT2JqZWN0LkRlc2NyaXB0aW9uLk5hbWVzcGFjZSxcblx0XHRcdFx0XHRcIlNvbHV0aW9uQmFzZU9wZXJhdGlvblwiOiBwT3BlcmF0aW9uT2JqZWN0LkRlc2NyaXB0aW9uLk9wZXJhdGlvbixcblx0XHRcdFx0XHRcIlNvbHV0aW9uTG9nXCI6IFtdXG5cdFx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHQvLyBUaGlzIGlzIHRoZSByb290IG9wZXJhdGlvbiwgc2VlIGlmIHRoZXJlIGFyZSBJbnB1dHMgYW5kIE91dHB1dHMgY3JlYXRlZCAuLi4gaWYgbm90LCBjcmVhdGUgdGhlbS5cblx0XHRcdGlmICghdG1wT3BlcmF0aW9uLmhhc093blByb3BlcnR5KCdJbnB1dHMnKSlcblx0XHRcdHtcblx0XHRcdFx0dG1wT3BlcmF0aW9uLklucHV0cyA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0aWYgKCF0bXBPcGVyYXRpb24uaGFzT3duUHJvcGVydHkoJ091dHB1dHMnKSlcblx0XHRcdHtcblx0XHRcdFx0dG1wT3BlcmF0aW9uLk91dHB1dHMgPSB7fTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVGhpcyBpcyB0aGUgcm9vdCBPcGVyYXRpb24sIHNlZSBpZiB0aGVyZSBpcyBhIGhhc2ggdHJhbnNsYXRpb24gYXZhaWxhYmxlIGZvciBlaXRoZXIgc2lkZSAoaW5wdXQgb3Igb3V0cHV0KVxuXHRcdFx0aWYgKHRtcE9wZXJhdGlvbi5oYXNPd25Qcm9wZXJ0eSgnSW5wdXRIYXNoVHJhbnNsYXRpb25UYWJsZScpKVxuXHRcdFx0e1xuXHRcdFx0XHR0bXBTb2x1dGlvbkNvbnRleHQuSW5wdXRIYXNoTWFwcGluZyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodG1wT3BlcmF0aW9uLklucHV0SGFzaFRyYW5zbGF0aW9uVGFibGUpKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0dG1wU29sdXRpb25Db250ZXh0LklucHV0SGFzaE1hcHBpbmcgPSB7fTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRtcE9wZXJhdGlvbi5oYXNPd25Qcm9wZXJ0eSgnT3V0cHV0SGFzaFRyYW5zbGF0aW9uVGFibGUnKSlcblx0XHRcdHtcblx0XHRcdFx0dG1wU29sdXRpb25Db250ZXh0Lk91dHB1dEhhc2hNYXBwaW5nID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0bXBPcGVyYXRpb24uT3V0cHV0SGFzaFRyYW5zbGF0aW9uVGFibGUpKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCh0eXBlb2YocE91dHB1dE9iamVjdCkgIT0gJ29iamVjdCcpXG5cdFx0XHRcdCYmICh0eXBlb2YodG1wT3V0cHV0SGFzaE1hcHBpbmcpID09ICd1bmRlZmluZWQnKSBcblx0XHRcdFx0JiYgKHR5cGVvZih0bXBJbnB1dEhhc2hNYXBwaW5nKSAhPSAndW5kZWZpbmVkJykpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFJldXNlIHRoZSBpbnB1dCBoYXNoIG1hcHBpbmcgaWY6XG5cdFx0XHRcdC8vICAgMSkgd2UgYXV0by1tYXBwZWQgdGhlIGlucHV0IGhhc2ggbWFwcGluZyB0byB0aGUgb3V0cHV0IGJlY2F1c2Ugb25seSBhbiBpbnB1dCBvYmplY3Qgd2FzIHN1cHBsaWVkXG5cdFx0XHRcdC8vICAgMikgdGhlcmUgKndhcyBub3QqIGFuIG91dHB1dCBoYXNoIG1hcHBpbmcgc3VwcGxpZWRcblx0XHRcdFx0Ly8gICAzKSB0aGVyZSAqd2FzKiBhbiBpbnB1dCBoYXNoIG1hcHBpbmcgc3VwcGxpZWRcblx0XHRcdFx0Ly9cblx0XHRcdFx0Ly8gVGhpcyBzZWVtcyBzaW1wbGUgYXQgZmlyc3QgYnV0IGV4cG9zZXMgc29tZSByZWFsbHkgaW50ZXJlc3RpbmcgYmVoYXZpb3JzIGluIHRlcm1zIG9mXG5cdFx0XHRcdC8vIHJldXNpbmcgdGhlIHNhbWUgb2JqZWN0IGFuZCBzY2hlbWEgZm9yIGlucHV0IGFuZCBvdXRwdXQsIGJ1dCBoYXZpbmcgZGlmZmVyZW50IGhhc2hcblx0XHRcdFx0Ly8gbWFwcGluZ3MgZm9yIGVhY2ggb2YgdGhlbS5cblx0XHRcdFx0dG1wU29sdXRpb25Db250ZXh0Lk91dHB1dEhhc2hNYXBwaW5nID0gdG1wU29sdXRpb25Db250ZXh0LklucHV0SGFzaE1hcHBpbmc7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZihwT3V0cHV0T2JqZWN0KSA9PSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHQvLyBJZiB0aGUgY2FsbCBkZWZpbmVkIGFuIGV4cGxpY2l0LCBkaWZmZXJlbnQgb3V0cHV0IG9iamVjdCBmcm9tIHRoZSBpbnB1dCBvYmplY3QgdXNlIHRoYXQgaW5zdGVhZC5cblx0XHRcdHRtcE91dHB1dE9iamVjdCA9IHBPdXRwdXRPYmplY3Q7XG5cdFx0fVxuXG5cdFx0bGV0IHRtcERlc2NyaXB0aW9uTWFueWZlc3QgPSBmYWxzZTtcblx0XHRpZiAodHlwZW9mKHBEZXNjcmlwdGlvbk1hbnlmZXN0KSA9PT0gJ3VuZGVmaW5lZCcpXG5cdFx0e1xuXHRcdFx0Ly8gV2UgYXJlIGdvaW5nIHRvIHVzZSB0aGlzIGZvciBzb21lIGNsZXZlciBzY2hlbWEgbWFuaXB1bGF0aW9ucywgdGhlbiByZWNyZWF0ZSB0aGUgb2JqZWN0XG5cdFx0XHR0bXBEZXNjcmlwdGlvbk1hbnlmZXN0ID0gbmV3IGxpYk1hbnlmZXN0KCk7XG5cdFx0XHQvLyBTeW50aGVzaXplIGEgbWFueWZlc3QgZnJvbSB0aGUgSW5wdXQgYW5kIE91dHB1dCBwcm9wZXJ0aWVzXG5cdFx0XHRsZXQgdG1wTWFueWZlc3RTY2hlbWEgPSAoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRTY29wZTogJ1NvbHZlciBEYXRhIFBhcnQgRGVzY3JpcHRpb25zJyxcblx0XHRcdFx0XHREZXNjcmlwdG9yczogdG1wRGVzY3JpcHRpb25NYW55ZmVzdC5zY2hlbWFNYW5pcHVsYXRpb25zLm1lcmdlQWRkcmVzc01hcHBpbmdzKHRtcE9wZXJhdGlvbi5JbnB1dHMsIHRtcE9wZXJhdGlvbi5PdXRwdXRzKVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Ly8gQ2xvbmUgdGhlIHBhc3NlZC1pbiBtYW55ZmVzdCwgc28gbXV0YXRpb25zIGRvIG5vdCBhbHRlciB0aGUgdXBzdHJlYW0gdmVyc2lvblxuXHRcdFx0dG1wRGVzY3JpcHRpb25NYW55ZmVzdCA9IHBEZXNjcmlwdGlvbk1hbnlmZXN0LmNsb25lKCk7XG5cdFx0fVxuXHRcdC8vIE5vdyB0aGF0IHRoZSBvcGVyYXRpb24gb2JqZWN0IGhhcyBiZWVuIGNyZWF0ZWQgdW5pcXVlbHksIGFwcGx5IGFueSBwYXNzZWQtaW4gYWRkcmVzcy1oYXNoIGFuZCBoYXNoLWhhc2ggcmVtYXBwaW5nc1xuXHRcdGlmIChwSW5wdXRBZGRyZXNzTWFwcGluZylcblx0XHR7XG5cdFx0XHR0bXBEZXNjcmlwdGlvbk1hbnlmZXN0LnNjaGVtYU1hbmlwdWxhdGlvbnMucmVzb2x2ZUFkZHJlc3NNYXBwaW5ncyh0bXBPcGVyYXRpb24uSW5wdXRzLCBwSW5wdXRBZGRyZXNzTWFwcGluZyk7XG5cdFx0fVxuXHRcdGlmIChwT3V0cHV0QWRkcmVzc01hcHBpbmcpXG5cdFx0e1xuXHRcdFx0dG1wRGVzY3JpcHRpb25NYW55ZmVzdC5zY2hlbWFNYW5pcHVsYXRpb25zLnJlc29sdmVBZGRyZXNzTWFwcGluZ3ModG1wT3BlcmF0aW9uLklucHV0cywgcE91dHB1dEFkZHJlc3NNYXBwaW5nKTtcblx0XHR9XG5cdFx0aWYgKHRtcFNvbHV0aW9uQ29udGV4dC5JbnB1dEhhc2hNYXBwaW5nKVxuXHRcdHtcblx0XHRcdHRtcERlc2NyaXB0aW9uTWFueWZlc3QuaGFzaFRyYW5zbGF0aW9ucy5hZGRUcmFuc2xhdGlvbih0bXBTb2x1dGlvbkNvbnRleHQuSW5wdXRIYXNoTWFwcGluZyk7XG5cdFx0fVxuXHRcdGlmICh0bXBTb2x1dGlvbkNvbnRleHQuT3V0cHV0SGFzaE1hcHBpbmcpXG5cdFx0e1xuXHRcdFx0dG1wRGVzY3JpcHRpb25NYW55ZmVzdC5oYXNoVHJhbnNsYXRpb25zLmFkZFRyYW5zbGF0aW9uKHRtcFNvbHV0aW9uQ29udGV4dC5PdXRwdXRIYXNoTWFwcGluZyk7XHRcdFx0XG5cdFx0fVxuXG5cblx0XHQvLyBTZXQgc29tZSBraW5kIG9mIHVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgb3BlcmF0aW9uXG5cdFx0dG1wT3BlcmF0aW9uLlVVSUQgPSB0aGlzLlVVSUQrKztcblx0XHR0bXBPcGVyYXRpb24uU29sdXRpb25Db250ZXh0ID0gdG1wU29sdXRpb25Db250ZXh0O1xuXG5cdFx0aWYgKHRtcE9wZXJhdGlvbi5EZXNjcmlwdGlvbi5TeW5vcHN5cylcblx0XHR7XG5cdFx0XHR0bXBTb2x1dGlvbkNvbnRleHQuU29sdXRpb25Mb2cucHVzaChgWyR7dG1wT3BlcmF0aW9uLlVVSUR9XTogU29sdmVyIHJ1bm5pbmcgb3BlcmF0aW9uICR7dG1wT3BlcmF0aW9uLkRlc2NyaXB0aW9uLlN5bm9wc3lzfWApO1xuXHRcdH1cblxuXHRcdGxldCB0bXBQcmVjZWRlbnQgPSBuZXcgbGliUHJlY2VkZW50KCk7XG5cdFx0dG1wUHJlY2VkZW50LmFkZFBhdHRlcm4oJ3t7TmFtZTonLCAnfX0nLFxuXHRcdFx0KHBIYXNoKT0+XG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBIYXNoID0gcEhhc2gudHJpbSgpO1xuXHRcdFx0XHRsZXQgdG1wRGVzY3JpcHRvciA9IHRtcERlc2NyaXB0aW9uTWFueWZlc3QuZ2V0RGVzY3JpcHRvckJ5SGFzaCh0bXBIYXNoKVxuXG5cdFx0XHRcdC8vIFJldHVybiBhIGh1bWFuIHJlYWRhYmxlIHZhbHVlXG5cdFx0XHRcdGlmICgodHlwZW9mKHRtcERlc2NyaXB0b3IpID09ICdvYmplY3QnKSAgJiYgdG1wRGVzY3JpcHRvci5oYXNPd25Qcm9wZXJ0eSgnTmFtZScpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHRtcERlc2NyaXB0b3IuTmFtZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gdG1wSGFzaDtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0dG1wUHJlY2VkZW50LmFkZFBhdHRlcm4oJ3t7SW5wdXRWYWx1ZTonLCAnfX0nLFxuXHRcdFx0KHBIYXNoKT0+XG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBIYXNoID0gcEhhc2gudHJpbSgpO1xuXHRcdFx0XHRyZXR1cm4gdG1wRGVzY3JpcHRpb25NYW55ZmVzdC5nZXRWYWx1ZUJ5SGFzaCh0bXBJbnB1dE9iamVjdCx0bXBIYXNoKTtcblx0XHRcdH0pO1xuXHRcdHRtcFByZWNlZGVudC5hZGRQYXR0ZXJuKCd7e091dHB1dFZhbHVlOicsICd9fScsXG5cdFx0XHQocEhhc2gpPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcEhhc2ggPSBwSGFzaC50cmltKCk7XG5cdFx0XHRcdHJldHVybiB0bXBEZXNjcmlwdGlvbk1hbnlmZXN0LmdldFZhbHVlQnlIYXNoKHRtcE91dHB1dE9iamVjdCx0bXBIYXNoKTtcblx0XHRcdH0pO1xuXG5cdFx0aWYgKHRtcE9wZXJhdGlvbi5oYXNPd25Qcm9wZXJ0eSgnTG9nJykgJiYgdG1wT3BlcmF0aW9uLkxvZy5oYXNPd25Qcm9wZXJ0eSgnUHJlT3BlcmF0aW9uJykpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZih0bXBPcGVyYXRpb24uTG9nLlByZU9wZXJhdGlvbikgPT0gJ3N0cmluZycpXG5cdFx0XHR7XG5cdFx0XHRcdHRtcE9wZXJhdGlvbi5Tb2x1dGlvbkNvbnRleHQuU29sdXRpb25Mb2cucHVzaCh0bXBQcmVjZWRlbnQucGFyc2VTdHJpbmcodG1wT3BlcmF0aW9uLkxvZy5QcmVPcGVyYXRpb24pKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodG1wT3BlcmF0aW9uLkxvZy5QcmVPcGVyYXRpb24pKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRtcE9wZXJhdGlvbi5Mb2cuUHJlT3BlcmF0aW9uLmxlbmd0aDsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCh0eXBlb2YodG1wT3BlcmF0aW9uLkxvZy5QcmVPcGVyYXRpb25baV0pID09ICdzdHJpbmcnKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0bXBPcGVyYXRpb24uU29sdXRpb25Db250ZXh0LlNvbHV0aW9uTG9nLnB1c2godG1wUHJlY2VkZW50LnBhcnNlU3RyaW5nKHRtcE9wZXJhdGlvbi5Mb2cuUHJlT3BlcmF0aW9uW2ldKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gTm93IHN0ZXAgdGhyb3VnaCBlYWNoIG9wZXJhdGlvbiBhbmQgc29sdmVcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRtcE9wZXJhdGlvbi5TdGVwcy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRsZXQgdG1wU3RlcCA9IHRtcE9wZXJhdGlvbi5TdGVwc1tpXTtcblxuXHRcdFx0Ly8gSW5zdHJ1Y3Rpb25zIGFyZSBhbHdheXMgZW5kcG9pbnRzIC0tIHRoZXkgKmRvIG5vdCogcmVjdXJzZS5cblx0XHRcdGlmICh0bXBTdGVwLmhhc093blByb3BlcnR5KCdJbnN0cnVjdGlvbicpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wSW5wdXRTY2hlbWEgPSAoXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XCJTY29wZVwiOiBcIklucHV0T2JqZWN0XCIsXG5cdFx0XHRcdFx0XHRcIkRlc2NyaXB0b3JzXCI6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodG1wT3BlcmF0aW9uLklucHV0cykpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdC8vIFBlcmZvcm0gc3RlcC1zcGVjaWZpYyBhZGRyZXNzIG1hcHBpbmdzLlxuXHRcdFx0XHR0bXBEZXNjcmlwdGlvbk1hbnlmZXN0LnNjaGVtYU1hbmlwdWxhdGlvbnMucmVzb2x2ZUFkZHJlc3NNYXBwaW5ncyh0bXBJbnB1dFNjaGVtYS5EZXNjcmlwdG9ycywgdG1wU3RlcC5JbnB1dEhhc2hBZGRyZXNzTWFwKTtcblx0XHRcdFx0bGV0IHRtcElucHV0TWFueWZlc3QgPSBuZXcgbGliTWFueWZlc3QodG1wSW5wdXRTY2hlbWEpO1xuXHRcdFx0XHRpZiAodG1wU29sdXRpb25Db250ZXh0LklucHV0SGFzaE1hcHBpbmcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0bXBJbnB1dE1hbnlmZXN0Lmhhc2hUcmFuc2xhdGlvbnMuYWRkVHJhbnNsYXRpb24odG1wU29sdXRpb25Db250ZXh0LklucHV0SGFzaE1hcHBpbmcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHRtcE91dHB1dFNjaGVtYSA9IChcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcIlNjb3BlXCI6IFwiT3V0cHV0T2JqZWN0XCIsXG5cdFx0XHRcdFx0XHRcIkRlc2NyaXB0b3JzXCI6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodG1wT3BlcmF0aW9uLk91dHB1dHMpKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHRtcERlc2NyaXB0aW9uTWFueWZlc3Quc2NoZW1hTWFuaXB1bGF0aW9ucy5yZXNvbHZlQWRkcmVzc01hcHBpbmdzKHRtcE91dHB1dFNjaGVtYS5EZXNjcmlwdG9ycywgdG1wU3RlcC5PdXRwdXRIYXNoQWRkcmVzc01hcCk7XG5cdFx0XHRcdGxldCB0bXBPdXRwdXRNYW55ZmVzdCA9IG5ldyBsaWJNYW55ZmVzdCh0bXBPdXRwdXRTY2hlbWEpO1xuXHRcdFx0XHRpZiAodG1wU29sdXRpb25Db250ZXh0Lk91dHB1dEhhc2hNYXBwaW5nKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG1wT3V0cHV0TWFueWZlc3QuaGFzaFRyYW5zbGF0aW9ucy5hZGRUcmFuc2xhdGlvbih0bXBTb2x1dGlvbkNvbnRleHQuT3V0cHV0SGFzaE1hcHBpbmcpO1xuXHRcdFx0XHR9XG5cdFxuXHRcdFx0XHQvLyBDb25zdHJ1Y3QgdGhlIGluc3RydWN0aW9uIHN0YXRlIG9iamVjdFxuXHRcdFx0XHRsZXQgdG1wSW5zdHJ1Y3Rpb25TdGF0ZSA9IChcblx0XHRcdFx0e1xuXHRcdFx0XHRcdEVsdWNpZGF0b3I6IHRoaXMsXG5cblx0XHRcdFx0XHROYW1lc3BhY2U6IHRtcFN0ZXAuTmFtZXNwYWNlLnRvTG93ZXJDYXNlKCksXG5cdFx0XHRcdFx0SW5zdHJ1Y3Rpb246IHRtcFN0ZXAuSW5zdHJ1Y3Rpb24udG9Mb3dlckNhc2UoKSxcblxuXHRcdFx0XHRcdE9wZXJhdGlvbjogdG1wT3BlcmF0aW9uLFxuXG5cdFx0XHRcdFx0U29sdXRpb25Db250ZXh0OiB0bXBTb2x1dGlvbkNvbnRleHQsXG5cblx0XHRcdFx0XHREZXNjcmlwdGlvbk1hbnlmZXN0OiB0bXBEZXNjcmlwdGlvbk1hbnlmZXN0LFxuXG5cdFx0XHRcdFx0SW5wdXRPYmplY3Q6IHRtcElucHV0T2JqZWN0LFxuXHRcdFx0XHRcdElucHV0TWFueWZlc3Q6IHRtcElucHV0TWFueWZlc3QsXG5cblx0XHRcdFx0XHRPdXRwdXRPYmplY3Q6IHRtcE91dHB1dE9iamVjdCxcblx0XHRcdFx0XHRPdXRwdXRNYW55ZmVzdDogdG1wT3V0cHV0TWFueWZlc3Rcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dG1wSW5zdHJ1Y3Rpb25TdGF0ZS5sb2dFcnJvciA9IFxuXHRcdFx0XHRcdChwTWVzc2FnZSkgPT4gXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dG1wU29sdXRpb25Db250ZXh0LlNvbHV0aW9uTG9nLnB1c2goYFtFUlJPUl1bT3BlcmF0aW9uICR7dG1wSW5zdHJ1Y3Rpb25TdGF0ZS5PcGVyYXRpb24uRGVzY3JpcHRpb24uTmFtZXNwYWNlfToke3RtcEluc3RydWN0aW9uU3RhdGUuT3BlcmF0aW9uLkRlc2NyaXB0aW9uLkhhc2h9IC0gU3RlcCAjJHtpfToke3RtcFN0ZXAuTmFtZXNwYWNlfToke3RtcFN0ZXAuSW5zdHJ1Y3Rpb259XSAke3BNZXNzYWdlfWApXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHR0bXBJbnN0cnVjdGlvblN0YXRlLmxvZ0luZm8gPSBcblx0XHRcdFx0XHQocE1lc3NhZ2UpID0+IFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRtcFNvbHV0aW9uQ29udGV4dC5Tb2x1dGlvbkxvZy5wdXNoKGBbSU5GT11bT3BlcmF0aW9uICR7dG1wSW5zdHJ1Y3Rpb25TdGF0ZS5PcGVyYXRpb24uRGVzY3JpcHRpb24uTmFtZXNwYWNlfToke3RtcEluc3RydWN0aW9uU3RhdGUuT3BlcmF0aW9uLkRlc2NyaXB0aW9uLkhhc2h9IC0gU3RlcCAjJHtpfToke3RtcFN0ZXAuTmFtZXNwYWNlfToke3RtcFN0ZXAuSW5zdHJ1Y3Rpb259XSAke3BNZXNzYWdlfWApXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAodGhpcy5pbnN0cnVjdGlvblNldHNbdG1wSW5zdHJ1Y3Rpb25TdGF0ZS5OYW1lc3BhY2VdLmhhc093blByb3BlcnR5KHRtcEluc3RydWN0aW9uU3RhdGUuSW5zdHJ1Y3Rpb24pKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGZJbnN0cnVjdGlvbiA9IHRoaXMuaW5zdHJ1Y3Rpb25TZXRzW3RtcEluc3RydWN0aW9uU3RhdGUuTmFtZXNwYWNlXVt0bXBJbnN0cnVjdGlvblN0YXRlLkluc3RydWN0aW9uXTtcblx0XHRcdFx0XHRmSW5zdHJ1Y3Rpb24odG1wSW5zdHJ1Y3Rpb25TdGF0ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gT3BlcmF0aW9ucyByZWN1cnNlLlxuXHRcdFx0aWYgKHRtcFN0ZXAuaGFzT3duUHJvcGVydHkoJ09wZXJhdGlvbicpKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodHlwZW9mKHRtcFN0ZXAuT3BlcmF0aW9uKSA9PSAnc3RyaW5nJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRoaXMuc29sdmVJbnRlcm5hbE9wZXJhdGlvbih0bXBTdGVwLk5hbWVzcGFjZSwgdG1wU3RlcC5PcGVyYXRpb24sIHRtcElucHV0T2JqZWN0LCB0bXBPdXRwdXRPYmplY3QsIHRtcERlc2NyaXB0aW9uTWFueWZlc3QsIHRtcFN0ZXAuSW5wdXRIYXNoQWRkcmVzc01hcCwgdG1wU3RlcC5PdXRwdXRIYXNoQWRkcmVzc01hcCwgdG1wU29sdXRpb25Db250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmICh0eXBlb2YodG1wU3RlcC5PcGVyYXRpb24pID09ICdvYmplY3QnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gWW91IGNhbiBldmVuIGRlZmluZSBhbiBpbmxpbmUgb2JqZWN0IG9wZXJhdGlvbiEgIFRoaXMgZ2V0cyBjcmF6eSBmYXN0XG5cdFx0XHRcdFx0dGhpcy5zb2x2ZU9wZXJhdGlvbih0bXBTdGVwLk9wZXJhdGlvbiwgdG1wSW5wdXRPYmplY3QsIHRtcE91dHB1dE9iamVjdCwgdG1wRGVzY3JpcHRpb25NYW55ZmVzdCwgdG1wU3RlcC5JbnB1dEhhc2hBZGRyZXNzTWFwLCB0bXBTdGVwLk91dHB1dEhhc2hBZGRyZXNzTWFwLCB0bXBTb2x1dGlvbkNvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHRtcE9wZXJhdGlvbi5oYXNPd25Qcm9wZXJ0eSgnTG9nJykgJiYgdG1wT3BlcmF0aW9uLkxvZy5oYXNPd25Qcm9wZXJ0eSgnUG9zdE9wZXJhdGlvbicpKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YodG1wT3BlcmF0aW9uLkxvZy5Qb3N0T3BlcmF0aW9uKSA9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0dG1wT3BlcmF0aW9uLlNvbHV0aW9uQ29udGV4dC5Tb2x1dGlvbkxvZy5wdXNoKHRtcFByZWNlZGVudC5wYXJzZVN0cmluZyh0bXBPcGVyYXRpb24uTG9nLlBvc3RPcGVyYXRpb24pKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodG1wT3BlcmF0aW9uLkxvZy5QcmVPcGVyYXRpb24pKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRtcE9wZXJhdGlvbi5Mb2cuUG9zdE9wZXJhdGlvbi5sZW5ndGg7IGkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICgodHlwZW9mKHRtcE9wZXJhdGlvbi5Mb2cuUG9zdE9wZXJhdGlvbltpXSkgPT0gJ3N0cmluZycpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRtcE9wZXJhdGlvbi5Tb2x1dGlvbkNvbnRleHQuU29sdXRpb25Mb2cucHVzaCh0bXBQcmVjZWRlbnQucGFyc2VTdHJpbmcodG1wT3BlcmF0aW9uLkxvZy5Qb3N0T3BlcmF0aW9uW2ldKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRtcFNvbHV0aW9uQ29udGV4dDtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbHVjaWRhdG9yOyIsIi8qKlxuKiBAbGljZW5zZSBNSVRcbiogQGF1dGhvciA8c3RldmVuQHZlbG96by5jb20+XG4qL1xubGV0IGxpYlNpbXBsZUxvZyA9IHJlcXVpcmUoJy4vTWFueWZlc3QtTG9nVG9Db25zb2xlLmpzJyk7XG5cbi8qKlxuKiBIYXNoIFRyYW5zbGF0aW9uXG4qXG4qIFRoaXMgaXMgYSB2ZXJ5IHNpbXBsZSB0cmFuc2xhdGlvbiB0YWJsZSBmb3IgaGFzaGVzLCB3aGljaCBhbGxvd3MgdGhlIHNhbWUgc2NoZW1hIHRvIHJlc29sdmUgXG4qIGRpZmZlcmVudGx5IGJhc2VkIG9uIGEgbG9hZGVkIHRyYW5zbGF0aW9uIHRhYmxlLlxuKlxuKiBUaGlzIGlzIHRvIHByZXZlbnQgdGhlIHJlcXVpcmVtZW50IGZvciBtdXRhdGluZyBzY2hlbWFzIG92ZXIgYW5kIG92ZXIgYWdhaW4gd2hlbiB3ZSB3YW50IHRvXG4qIHJldXNlIHRoZSBzdHJ1Y3R1cmUgYnV0IGxvb2sgdXAgZGF0YSBlbGVtZW50cyBieSBkaWZmZXJlbnQgYWRkcmVzc2VzLlxuKlxuKiBPbmUgc2lkZS1lZmZlY3Qgb2YgdGhpcyBpcyB0aGF0IGEgdHJhbnNsYXRpb24gdGFibGUgY2FuIFwib3ZlcnJpZGVcIiB0aGUgYnVpbHQtaW4gaGFzaGVzLCBzaW5jZVxuKiB0aGlzIGlzIGFsd2F5cyB1c2VkIHRvIHJlc29sdmUgaGFzaGVzIGJlZm9yZSBhbnkgb2YgdGhlIGZ1bmN0aW9uQ2FsbEJ5SGFzaChwSGFzaCwgLi4uKSBwZXJmb3JtXG4qIHRoZWlyIGxvb2t1cHMgYnkgaGFzaC5cbipcbiogQGNsYXNzIE1hbnlmZXN0SGFzaFRyYW5zbGF0aW9uXG4qL1xuY2xhc3MgTWFueWZlc3RIYXNoVHJhbnNsYXRpb25cbntcblx0Y29uc3RydWN0b3IocEluZm9Mb2csIHBFcnJvckxvZylcblx0e1xuXHRcdC8vIFdpcmUgaW4gbG9nZ2luZ1xuXHRcdHRoaXMubG9nSW5mbyA9ICh0eXBlb2YocEluZm9Mb2cpID09PSAnZnVuY3Rpb24nKSA/IHBJbmZvTG9nIDogbGliU2ltcGxlTG9nO1xuXHRcdHRoaXMubG9nRXJyb3IgPSAodHlwZW9mKHBFcnJvckxvZykgPT09ICdmdW5jdGlvbicpID8gcEVycm9yTG9nIDogbGliU2ltcGxlTG9nO1xuXG4gICAgICAgIHRoaXMudHJhbnNsYXRpb25UYWJsZSA9IHt9O1xuXHR9XG5cbiAgICB0cmFuc2xhdGlvbkNvdW50KClcbiAgICB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnRyYW5zbGF0aW9uVGFibGUpLmxlbmd0aDtcbiAgICB9XG5cbiAgICBhZGRUcmFuc2xhdGlvbihwVHJhbnNsYXRpb24pXG4gICAge1xuICAgICAgICAvLyBUaGlzIGFkZHMgYSB0cmFuc2xhdGlvbiBpbiB0aGUgZm9ybSBvZjpcbiAgICAgICAgLy8geyBcIlNvdXJjZUhhc2hcIjogXCJEZXN0aW5hdGlvbkhhc2hcIiwgXCJTZWNvbmRTb3VyY2VIYXNoXCI6XCJTZWNvbmREZXN0aW5hdGlvbkhhc2hcIiB9XG4gICAgICAgIGlmICh0eXBlb2YocFRyYW5zbGF0aW9uKSAhPSAnb2JqZWN0JylcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5sb2dFcnJvcihgSGFzaCB0cmFuc2xhdGlvbiBhZGRUcmFuc2xhdGlvbiBleHBlY3RlZCBhIHRyYW5zbGF0aW9uIGJlIHR5cGUgb2JqZWN0IGJ1dCB3YXMgcGFzc2VkIGluICR7dHlwZW9mKHBUcmFuc2xhdGlvbil9YCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdG1wVHJhbnNsYXRpb25Tb3VyY2VzID0gT2JqZWN0LmtleXMocFRyYW5zbGF0aW9uKVxuXG4gICAgICAgIHRtcFRyYW5zbGF0aW9uU291cmNlcy5mb3JFYWNoKFxuICAgICAgICAgICAgKHBUcmFuc2xhdGlvblNvdXJjZSkgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mKHBUcmFuc2xhdGlvbltwVHJhbnNsYXRpb25Tb3VyY2VdKSAhPSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nRXJyb3IoYEhhc2ggdHJhbnNsYXRpb24gYWRkVHJhbnNsYXRpb24gZXhwZWN0ZWQgYSB0cmFuc2xhdGlvbiBkZXN0aW5hdGlvbiBoYXNoIGZvciBbJHtwVHJhbnNsYXRpb25Tb3VyY2V9XSB0byBiZSBhIHN0cmluZyBidXQgdGhlIHJlZmVycmFudCB3YXMgYSAke3R5cGVvZihwVHJhbnNsYXRpb25bcFRyYW5zbGF0aW9uU291cmNlXSl9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRpb25UYWJsZVtwVHJhbnNsYXRpb25Tb3VyY2VdID0gcFRyYW5zbGF0aW9uW3BUcmFuc2xhdGlvblNvdXJjZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlVHJhbnNsYXRpb25IYXNoKHBUcmFuc2xhdGlvbkhhc2gpXG4gICAge1xuICAgICAgICBpZiAodGhpcy50cmFuc2xhdGlvblRhYmxlLmhhc093blByb3BlcnR5KHBUcmFuc2xhdGlvbkhhc2gpKVxuICAgICAgICB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy50cmFuc2xhdGlvblRhYmxlW3BUcmFuc2xhdGlvbkhhc2hdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhpcyByZW1vdmVzIHRyYW5zbGF0aW9ucy5cbiAgICAvLyBJZiBwYXNzZWQgYSBzdHJpbmcsIGp1c3QgcmVtb3ZlcyB0aGUgc2luZ2xlIG9uZS5cbiAgICAvLyBJZiBwYXNzZWQgYW4gb2JqZWN0LCBpdCBkb2VzIGFsbCB0aGUgc291cmNlIGtleXMuXG4gICAgcmVtb3ZlVHJhbnNsYXRpb24ocFRyYW5zbGF0aW9uKVxuICAgIHtcbiAgICAgICAgaWYgKHR5cGVvZihwVHJhbnNsYXRpb24pID09ICdzdHJpbmcnKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZVRyYW5zbGF0aW9uSGFzaChwVHJhbnNsYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mKHBUcmFuc2xhdGlvbikgPT0gJ29iamVjdCcpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCB0bXBUcmFuc2xhdGlvblNvdXJjZXMgPSBPYmplY3Qua2V5cyhwVHJhbnNsYXRpb24pXG5cbiAgICAgICAgICAgIHRtcFRyYW5zbGF0aW9uU291cmNlcy5mb3JFYWNoKFxuICAgICAgICAgICAgICAgIChwVHJhbnNsYXRpb25Tb3VyY2UpID0+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVRyYW5zbGF0aW9uKHBUcmFuc2xhdGlvblNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMubG9nRXJyb3IoYEhhc2ggdHJhbnNsYXRpb24gcmVtb3ZlVHJhbnNsYXRpb24gZXhwZWN0ZWQgZWl0aGVyIGEgc3RyaW5nIG9yIGFuIG9iamVjdCBidXQgdGhlIHBhc3NlZC1pbiB0cmFuc2xhdGlvbiB3YXMgdHlwZSAke3R5cGVvZihwVHJhbnNsYXRpb24pfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xlYXJUcmFuc2xhdGlvbnMoKVxuICAgIHtcbiAgICAgICAgdGhpcy50cmFuc2xhdGlvblRhYmxlID0ge307XG4gICAgfVxuXG4gICAgdHJhbnNsYXRlKHBUcmFuc2xhdGlvbilcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zbGF0aW9uVGFibGUuaGFzT3duUHJvcGVydHkocFRyYW5zbGF0aW9uKSlcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRpb25UYWJsZVtwVHJhbnNsYXRpb25dO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHBUcmFuc2xhdGlvbjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYW55ZmVzdEhhc2hUcmFuc2xhdGlvbjsiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cblxuLyoqXG4qIE1hbnlmZXN0IHNpbXBsZSBsb2dnaW5nIHNoaW0gKGZvciBicm93c2VyIGFuZCBkZXBlbmRlbmN5LWZyZWUgcnVubmluZylcbiovXG5cbmNvbnN0IGxvZ1RvQ29uc29sZSA9IChwTG9nTGluZSwgcExvZ09iamVjdCkgPT5cbntcbiAgICBsZXQgdG1wTG9nTGluZSA9ICh0eXBlb2YocExvZ0xpbmUpID09PSAnc3RyaW5nJykgPyBwTG9nTGluZSA6ICcnO1xuXG4gICAgY29uc29sZS5sb2coYFtNYW55ZmVzdF0gJHt0bXBMb2dMaW5lfWApO1xuXG4gICAgaWYgKHBMb2dPYmplY3QpIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHBMb2dPYmplY3QpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbG9nVG9Db25zb2xlOyIsIi8qKlxuKiBAbGljZW5zZSBNSVRcbiogQGF1dGhvciA8c3RldmVuQHZlbG96by5jb20+XG4qL1xubGV0IGxpYlNpbXBsZUxvZyA9IHJlcXVpcmUoJy4vTWFueWZlc3QtTG9nVG9Db25zb2xlLmpzJyk7XG5cbi8qKlxuKiBPYmplY3QgQWRkcmVzcyBHZW5lcmF0aW9uXG4qXG4qIEF1dG9tYWdpY2FsbHkgZ2VuZXJhdGUgYWRkcmVzc2VzIGFuZCBwcm9wZXJ0aWVzIGJhc2VkIG9uIGEgcGFzc2VkLWluIG9iamVjdCwgXG4qIHRvIGJlIHVzZWQgZm9yIGVhc3kgY3JlYXRpb24gb2Ygc2NoZW1hcy4gIE1lYW50IHRvIHNpbXBsaWZ5IHRoZSBsaXZlcyBvZlxuKiBkZXZlbG9wZXJzIHdhbnRpbmcgdG8gY3JlYXRlIHNjaGVtYXMgd2l0aG91dCB0eXBpbmcgYSBidW5jaCBvZiBzdHVmZi5cbiogXG4qIElNUE9SVEFOVCBOT1RFOiBUaGlzIGNvZGUgaXMgaW50ZW50aW9uYWxseSBtb3JlIHZlcmJvc2UgdGhhbiBuZWNlc3NhcnksIHRvXG4qICAgICAgICAgICAgICAgICBiZSBleHRyZW1lbHkgY2xlYXIgd2hhdCBpcyBnb2luZyBvbiBpbiB0aGUgcmVjdXJzaW9uIGZvclxuKiAgICAgICAgICAgICAgICAgZWFjaCBvZiB0aGUgdGhyZWUgYWRkcmVzcyByZXNvbHV0aW9uIGZ1bmN0aW9ucy5cbiogXG4qICAgICAgICAgICAgICAgICBBbHRob3VnaCB0aGVyZSBpcyBzb21lIG9wcG9ydHVuaXR5IHRvIHJlcGVhdCBvdXJzZWx2ZXMgYVxuKiAgICAgICAgICAgICAgICAgYml0IGxlc3MgaW4gdGhpcyBjb2RlYmFzZSAoZS5nLiB3aXRoIGRldGVjdGlvbiBvZiBhcnJheXNcbiogICAgICAgICAgICAgICAgIHZlcnN1cyBvYmplY3RzIHZlcnN1cyBkaXJlY3QgcHJvcGVydGllcyksIGl0IGNhbiBtYWtlXG4qICAgICAgICAgICAgICAgICBkZWJ1Z2dpbmcuLiBjaGFsbGVuZ2luZy4gIFRoZSBtaW5pZmllZCB2ZXJzaW9uIG9mIHRoZSBjb2RlXG4qICAgICAgICAgICAgICAgICBvcHRpbWl6ZXMgb3V0IGFsbW9zdCBhbnl0aGluZyByZXBlYXRlZCBpbiBoZXJlLiAgU28gcGxlYXNlXG4qICAgICAgICAgICAgICAgICBiZSBraW5kIGFuZCByZXdpbmQuLi4gbWVhbmluZyBwbGVhc2Uga2VlcCB0aGUgY29kZWJhc2UgbGVzc1xuKiAgICAgICAgICAgICAgICAgdGVyc2UgYW5kIG1vcmUgdmVyYm9zZSBzbyBodW1hbnMgY2FuIGNvbXByZWhlbmQgaXQuXG4qICAgICAgICAgICAgICAgICBcbipcbiogQGNsYXNzIE1hbnlmZXN0T2JqZWN0QWRkcmVzc0dlbmVyYXRpb25cbiovXG5jbGFzcyBNYW55ZmVzdE9iamVjdEFkZHJlc3NHZW5lcmF0aW9uXG57XG5cdGNvbnN0cnVjdG9yKHBJbmZvTG9nLCBwRXJyb3JMb2cpXG5cdHtcblx0XHQvLyBXaXJlIGluIGxvZ2dpbmdcblx0XHR0aGlzLmxvZ0luZm8gPSAodHlwZW9mKHBJbmZvTG9nKSA9PSAnZnVuY3Rpb24nKSA/IHBJbmZvTG9nIDogbGliU2ltcGxlTG9nO1xuXHRcdHRoaXMubG9nRXJyb3IgPSAodHlwZW9mKHBFcnJvckxvZykgPT0gJ2Z1bmN0aW9uJykgPyBwRXJyb3JMb2cgOiBsaWJTaW1wbGVMb2c7XG5cdH1cblxuXHQvLyBnZW5lcmF0ZUFkZHJlc3NzZXNcblx0Ly9cblx0Ly8gVGhpcyBmbGF0dGVucyBhbiBvYmplY3QgaW50byBhIHNldCBvZiBrZXk6dmFsdWUgcGFpcnMgZm9yICpFVkVSWSBTSU5HTEVcblx0Ly8gUE9TU0lCTEUgQUREUkVTUyogaW4gdGhlIG9iamVjdC4gIEl0IGNhbiBnZXQgLi4uIHJlYWxseSBpbnNhbmUgcmVhbGx5XG5cdC8vIHF1aWNrbHkuICBUaGlzIGlzIG5vdCBtZWFudCB0byBiZSB1c2VkIGRpcmVjdGx5IHRvIGdlbmVyYXRlIHNjaGVtYXMsIGJ1dFxuXHQvLyBpbnN0ZWFkIGFzIGEgc3RhcnRpbmcgcG9pbnQgZm9yIHNjcmlwdHMgb3IgVUlzLlxuXHQvL1xuXHQvLyBUaGlzIHdpbGwgcmV0dXJuIGEgbWVnYSBzZXQgb2Yga2V5OnZhbHVlIHBhaXJzIHdpdGggYWxsIHBvc3NpYmxlIHNjaGVtYSBcblx0Ly8gcGVybXV0YXRpb25zIGFuZCBkZWZhdWx0IHZhbHVlcyAod2hlbiBub3QgYW4gb2JqZWN0KSBhbmQgZXZlcnl0aGluZyBlbHNlLlxuXHRnZW5lcmF0ZUFkZHJlc3NzZXMgKHBPYmplY3QsIHBCYXNlQWRkcmVzcywgcFNjaGVtYSlcblx0e1xuXHRcdGxldCB0bXBCYXNlQWRkcmVzcyA9ICh0eXBlb2YocEJhc2VBZGRyZXNzKSA9PSAnc3RyaW5nJykgPyBwQmFzZUFkZHJlc3MgOiAnJztcblx0XHRsZXQgdG1wU2NoZW1hID0gKHR5cGVvZihwU2NoZW1hKSA9PSAnb2JqZWN0JykgPyBwU2NoZW1hIDoge307XG5cblx0XHRsZXQgdG1wT2JqZWN0VHlwZSA9IHR5cGVvZihwT2JqZWN0KTtcblxuXHRcdGxldCB0bXBTY2hlbWFPYmplY3RFbnRyeSA9IChcblx0XHRcdHtcblx0XHRcdFx0QWRkcmVzczogdG1wQmFzZUFkZHJlc3MsXG5cdFx0XHRcdEhhc2g6IHRtcEJhc2VBZGRyZXNzLFxuXHRcdFx0XHROYW1lOiB0bXBCYXNlQWRkcmVzcyxcblx0XHRcdFx0Ly8gVGhpcyBpcyBzbyBzY3JpcHRzIGFuZCBVSSBjb250cm9scyBjYW4gZm9yY2UgYSBkZXZlbG9wZXIgdG8gb3B0LWluLlxuXHRcdFx0XHRJblNjaGVtYTogZmFsc2Vcblx0XHRcdH1cblx0XHQpXG5cblx0XHRzd2l0Y2godG1wT2JqZWN0VHlwZSlcblx0XHR7XG5cdFx0XHRjYXNlICdzdHJpbmcnOlxuXHRcdFx0XHR0bXBTY2hlbWFPYmplY3RFbnRyeS5EYXRhVHlwZSA9ICdTdHJpbmcnO1xuXHRcdFx0XHR0bXBTY2hlbWFPYmplY3RFbnRyeS5EZWZhdWx0ID0gcE9iamVjdDtcblx0XHRcdFx0dG1wU2NoZW1hW3RtcEJhc2VBZGRyZXNzXSA9IHRtcFNjaGVtYU9iamVjdEVudHJ5O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRjYXNlICdiaWdpbnQnOlxuXHRcdFx0XHR0bXBTY2hlbWFPYmplY3RFbnRyeS5EYXRhVHlwZSA9ICdOdW1iZXInO1xuXHRcdFx0XHR0bXBTY2hlbWFPYmplY3RFbnRyeS5EZWZhdWx0ID0gcE9iamVjdDtcblx0XHRcdFx0dG1wU2NoZW1hW3RtcEJhc2VBZGRyZXNzXSA9IHRtcFNjaGVtYU9iamVjdEVudHJ5O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3VuZGVmaW5lZCc6XG5cdFx0XHRcdHRtcFNjaGVtYU9iamVjdEVudHJ5LkRhdGFUeXBlID0gJ0FueSc7XG5cdFx0XHRcdHRtcFNjaGVtYU9iamVjdEVudHJ5LkRlZmF1bHQgPSBwT2JqZWN0O1xuXHRcdFx0XHR0bXBTY2hlbWFbdG1wQmFzZUFkZHJlc3NdID0gdG1wU2NoZW1hT2JqZWN0RW50cnk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnb2JqZWN0Jzpcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocE9iamVjdCkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0bXBTY2hlbWFPYmplY3RFbnRyeS5EYXRhVHlwZSA9ICdBcnJheSc7XG5cdFx0XHRcdFx0aWYgKHRtcEJhc2VBZGRyZXNzICE9ICcnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRtcFNjaGVtYVt0bXBCYXNlQWRkcmVzc10gPSB0bXBTY2hlbWFPYmplY3RFbnRyeTtcblx0XHRcdFx0XHR9XG5cdFxuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcE9iamVjdC5sZW5ndGg7IGkrKylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQWRkcmVzc3NlcyhwT2JqZWN0W2ldLCBgJHt0bXBCYXNlQWRkcmVzc31bJHtpfV1gLCB0bXBTY2hlbWEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0bXBTY2hlbWFPYmplY3RFbnRyeS5EYXRhVHlwZSA9ICdPYmplY3QnO1xuXHRcdFx0XHRcdGlmICh0bXBCYXNlQWRkcmVzcyAhPSAnJylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0bXBTY2hlbWFbdG1wQmFzZUFkZHJlc3NdID0gdG1wU2NoZW1hT2JqZWN0RW50cnk7XG5cdFx0XHRcdFx0XHR0bXBCYXNlQWRkcmVzcyArPSAnLic7XG5cdFx0XHRcdFx0fVxuXHRcblx0XHRcdFx0XHRsZXQgdG1wT2JqZWN0UHJvcGVydGllcyA9IE9iamVjdC5rZXlzKHBPYmplY3QpO1xuXG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0bXBPYmplY3RQcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVBZGRyZXNzc2VzKHBPYmplY3RbdG1wT2JqZWN0UHJvcGVydGllc1tpXV0sIGAke3RtcEJhc2VBZGRyZXNzfSR7dG1wT2JqZWN0UHJvcGVydGllc1tpXX1gLCB0bXBTY2hlbWEpO1xuXHRcdFx0XHRcdH1cdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3N5bWJvbCc6XG5cdFx0XHRjYXNlICdmdW5jdGlvbic6XG5cdFx0XHRcdC8vIFN5bWJvbHMgYW5kIGZ1bmN0aW9ucyBuZWl0aGVyIHJlY3Vyc2Ugbm9yIGdldCBhZGRlZCB0byB0aGUgc2NoZW1hXG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiB0bXBTY2hlbWE7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFueWZlc3RPYmplY3RBZGRyZXNzR2VuZXJhdGlvbjsiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cbmxldCBsaWJTaW1wbGVMb2cgPSByZXF1aXJlKCcuL01hbnlmZXN0LUxvZ1RvQ29uc29sZS5qcycpO1xuXG4vKipcbiogT2JqZWN0IEFkZHJlc3MgUmVzb2x2ZXJcbiogXG4qIElNUE9SVEFOVCBOT1RFOiBUaGlzIGNvZGUgaXMgaW50ZW50aW9uYWxseSBtb3JlIHZlcmJvc2UgdGhhbiBuZWNlc3NhcnksIHRvXG4qICAgICAgICAgICAgICAgICBiZSBleHRyZW1lbHkgY2xlYXIgd2hhdCBpcyBnb2luZyBvbiBpbiB0aGUgcmVjdXJzaW9uIGZvclxuKiAgICAgICAgICAgICAgICAgZWFjaCBvZiB0aGUgdGhyZWUgYWRkcmVzcyByZXNvbHV0aW9uIGZ1bmN0aW9ucy5cbiogXG4qICAgICAgICAgICAgICAgICBBbHRob3VnaCB0aGVyZSBpcyBzb21lIG9wcG9ydHVuaXR5IHRvIHJlcGVhdCBvdXJzZWx2ZXMgYVxuKiAgICAgICAgICAgICAgICAgYml0IGxlc3MgaW4gdGhpcyBjb2RlYmFzZSAoZS5nLiB3aXRoIGRldGVjdGlvbiBvZiBhcnJheXNcbiogICAgICAgICAgICAgICAgIHZlcnN1cyBvYmplY3RzIHZlcnN1cyBkaXJlY3QgcHJvcGVydGllcyksIGl0IGNhbiBtYWtlXG4qICAgICAgICAgICAgICAgICBkZWJ1Z2dpbmcuLiBjaGFsbGVuZ2luZy4gIFRoZSBtaW5pZmllZCB2ZXJzaW9uIG9mIHRoZSBjb2RlXG4qICAgICAgICAgICAgICAgICBvcHRpbWl6ZXMgb3V0IGFsbW9zdCBhbnl0aGluZyByZXBlYXRlZCBpbiBoZXJlLiAgU28gcGxlYXNlXG4qICAgICAgICAgICAgICAgICBiZSBraW5kIGFuZCByZXdpbmQuLi4gbWVhbmluZyBwbGVhc2Uga2VlcCB0aGUgY29kZWJhc2UgbGVzc1xuKiAgICAgICAgICAgICAgICAgdGVyc2UgYW5kIG1vcmUgdmVyYm9zZSBzbyBodW1hbnMgY2FuIGNvbXByZWhlbmQgaXQuXG4qICAgICAgICAgICAgICAgICBcbipcbiogQGNsYXNzIE1hbnlmZXN0T2JqZWN0QWRkcmVzc1Jlc29sdmVyXG4qL1xuY2xhc3MgTWFueWZlc3RPYmplY3RBZGRyZXNzUmVzb2x2ZXJcbntcblx0Y29uc3RydWN0b3IocEluZm9Mb2csIHBFcnJvckxvZylcblx0e1xuXHRcdC8vIFdpcmUgaW4gbG9nZ2luZ1xuXHRcdHRoaXMubG9nSW5mbyA9ICh0eXBlb2YocEluZm9Mb2cpID09ICdmdW5jdGlvbicpID8gcEluZm9Mb2cgOiBsaWJTaW1wbGVMb2c7XG5cdFx0dGhpcy5sb2dFcnJvciA9ICh0eXBlb2YocEVycm9yTG9nKSA9PSAnZnVuY3Rpb24nKSA/IHBFcnJvckxvZyA6IGxpYlNpbXBsZUxvZztcblx0fVxuXG5cdC8vIFdoZW4gYSBib3hlZCBwcm9wZXJ0eSBpcyBwYXNzZWQgaW4sIGl0IHNob3VsZCBoYXZlIHF1b3RlcyBvZiBzb21lXG5cdC8vIGtpbmQgYXJvdW5kIGl0LlxuXHQvL1xuXHQvLyBGb3IgaW5zdGFuY2U6XG5cdC8vIFx0XHRNeVZhbHVlc1snTmFtZSddXG5cdC8vIFx0XHRNeVZhbHVlc1tcIkFnZVwiXVxuXHQvLyBcdFx0TXlWYWx1ZXNbYENvc3RgXVxuXHQvL1xuXHQvLyBUaGlzIGZ1bmN0aW9uIHJlbW92ZXMgdGhlIHdyYXBwaW5nIHF1b3Rlcy5cblx0Ly9cblx0Ly8gUGxlYXNlIG5vdGUgaXQgKkRPRVMgTk9UIFBBUlNFKiB0ZW1wbGF0ZSBsaXRlcmFscywgc28gYmFja3RpY2tzIGp1c3Rcblx0Ly8gZW5kIHVwIGRvaW5nIHRoZSBzYW1lIHRoaW5nIGFzIG90aGVyIHF1b3RlIHR5cGVzLlxuXHQvL1xuXHQvLyBUT0RPOiBTaG91bGQgdGVtcGxhdGUgbGl0ZXJhbHMgYmUgcHJvY2Vzc2VkPyAgSWYgc28gd2hhdCBzdGF0ZSBkbyB0aGV5IGhhdmUgYWNjZXNzIHRvP1xuXHRjbGVhbldyYXBDaGFyYWN0ZXJzIChwQ2hhcmFjdGVyLCBwU3RyaW5nKVxuXHR7XG5cdFx0aWYgKHBTdHJpbmcuc3RhcnRzV2l0aChwQ2hhcmFjdGVyKSAmJiBwU3RyaW5nLmVuZHNXaXRoKHBDaGFyYWN0ZXIpKVxuXHRcdHtcblx0XHRcdHJldHVybiBwU3RyaW5nLnN1YnN0cmluZygxLCBwU3RyaW5nLmxlbmd0aCAtIDEpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHBTdHJpbmc7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2hlY2sgaWYgYW4gYWRkcmVzcyBleGlzdHMuXG5cdC8vXG5cdC8vIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlIGdldFZhbHVlQXRBZGRyZXNzIGZ1bmN0aW9uIGlzIGFtYmlndW91cyBvbiBcblx0Ly8gd2hldGhlciB0aGUgZWxlbWVudC9wcm9wZXJ0eSBpcyBhY3R1YWxseSB0aGVyZSBvciBub3QgKGl0IHJldHVybnMgXG5cdC8vIHVuZGVmaW5lZCB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBleGlzdHMgb3Igbm90KS4gIFRoaXMgZnVuY3Rpb24gY2hlY2tzIGZvclxuXHQvLyBleGlzdGFuY2UgYW5kIHJldHVybnMgdHJ1ZSBvciBmYWxzZSBkZXBlbmRlbnQuXG5cdGNoZWNrQWRkcmVzc0V4aXN0cyAocE9iamVjdCwgcEFkZHJlc3MpXG5cdHtcblx0XHQvLyBUT0RPOiBTaG91bGQgdGhlc2UgdGhyb3cgYW4gZXJyb3I/XG5cdFx0Ly8gTWFrZSBzdXJlIHBPYmplY3QgaXMgYW4gb2JqZWN0XG5cdFx0aWYgKHR5cGVvZihwT2JqZWN0KSAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuXHRcdC8vIE1ha2Ugc3VyZSBwQWRkcmVzcyBpcyBhIHN0cmluZ1xuXHRcdGlmICh0eXBlb2YocEFkZHJlc3MpICE9ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG5cblx0XHQvLyBUT0RPOiBNYWtlIHRoaXMgd29yayBmb3IgdGhpbmdzIGxpa2UgU29tZVJvb3RPYmplY3QuTWV0YWRhdGFbXCJTb21lLlBlb3BsZS5Vc2UuQmFkLk9iamVjdC5Qcm9wZXJ0eS5OYW1lc1wiXVxuXHRcdGxldCB0bXBTZXBhcmF0b3JJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJy4nKTtcblxuXHRcdC8vIFRoaXMgaXMgdGhlIHRlcm1pbmFsIGFkZHJlc3Mgc3RyaW5nIChubyBtb3JlIGRvdHMgc28gdGhlIFJFQ1VTSU9OIEVORFMgSU4gSEVSRSBzb21laG93KVxuXHRcdGlmICh0bXBTZXBhcmF0b3JJbmRleCA9PSAtMSlcblx0XHR7XG5cdFx0XHQvLyBDaGVjayBpZiB0aGUgYWRkcmVzcyByZWZlcnMgdG8gYSBib3hlZCBwcm9wZXJ0eVxuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdGFydEluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignWycpO1xuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdG9wSW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCddJyk7XG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1sxMF1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snTmFtZSddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJBZ2VcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgQ29zdGBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMSkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRoZSBcIk5hbWVcIiBvZiB0aGUgT2JqZWN0IGNvbnRhaW5lZCB0b28gdGhlIGxlZnQgb2YgdGhlIGJyYWNrZXRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0Ly8gSWYgdGhlIHN1YnByb3BlcnR5IGRvZXNuJ3QgdGVzdCBhcyBhIHByb3BlciBPYmplY3QsIG5vbmUgb2YgdGhlIHJlc3Qgb2YgdGhpcyBpcyBwb3NzaWJsZS5cblx0XHRcdFx0Ly8gVGhpcyBpcyBhIHJhcmUgY2FzZSB3aGVyZSBBcnJheXMgdGVzdGluZyBhcyBPYmplY3RzIGlzIHVzZWZ1bFxuXHRcdFx0XHRpZiAodHlwZW9mKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBUaGUgXCJSZWZlcmVuY2VcIiB0byB0aGUgcHJvcGVydHkgd2l0aGluIGl0LCBlaXRoZXIgYW4gYXJyYXkgZWxlbWVudCBvciBvYmplY3QgcHJvcGVydHlcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSBwQWRkcmVzcy5zdWJzdHJpbmcodG1wQnJhY2tldFN0YXJ0SW5kZXgrMSwgdG1wQnJhY2tldFN0b3BJbmRleCkudHJpbSgpO1xuXHRcdFx0XHQvLyBBdHRlbXB0IHRvIHBhcnNlIHRoZSByZWZlcmVuY2UgYXMgYSBudW1iZXIsIHdoaWNoIHdpbGwgYmUgdXNlZCBhcyBhbiBhcnJheSBlbGVtZW50XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TnVtYmVyID0gcGFyc2VJbnQodG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSwgMTApO1xuXG5cdFx0XHRcdC8vIEd1YXJkOiBJZiB0aGUgcmVmZXJyYW50IGlzIGEgbnVtYmVyIGFuZCB0aGUgYm94ZWQgcHJvcGVydHkgaXMgbm90IGFuIGFycmF5LCBvciB2aWNlIHZlcnNhLCByZXR1cm4gdW5kZWZpbmVkLlxuXHRcdFx0XHQvLyAgICAgICAgVGhpcyBzZWVtcyBjb25mdXNpbmcgdG8gbWUgYXQgZmlyc3QgcmVhZCwgc28gZXhwbGFpbmF0aW9uOlxuXHRcdFx0XHQvLyAgICAgICAgSXMgdGhlIEJveGVkIE9iamVjdCBhbiBBcnJheT8gIFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIEFuZCBpcyB0aGUgUmVmZXJlbmNlIGluc2lkZSB0aGUgYm94ZWQgT2JqZWN0IG5vdCBhIG51bWJlcj8gVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgLS0+ICBTbyB3aGVuIHRoZXNlIGFyZSBpbiBhZ3JlZW1lbnQsIGl0J3MgYW4gaW1wb3NzaWJsZSBhY2Nlc3Mgc3RhdGVcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pID09IGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0aWYgKGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBpc24ndCBhIG51bWJlciAuLi4gbGV0J3MgdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHQvLyBXZSB3b3VsZCBleHBlY3QgdGhlIHByb3BlcnR5IHRvIGJlIHdyYXBwZWQgaW4gc29tZSBraW5kIG9mIHF1b3RlcyBzbyBzdHJpcCB0aGVtXG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnXCInLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdgJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycyhcIidcIiwgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cblx0XHRcdFx0XHQvLyBDaGVjayBpZiB0aGUgcHJvcGVydHkgZXhpc3RzLlxuXHRcdFx0XHRcdHJldHVybiBwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXS5oYXNPd25Qcm9wZXJ0eSh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBVc2UgdGhlIG5ldyBpbiBvcGVyYXRvciB0byBzZWUgaWYgdGhlIGVsZW1lbnQgaXMgaW4gdGhlIGFycmF5XG5cdFx0XHRcdFx0cmV0dXJuICh0bXBCb3hlZFByb3BlcnR5TnVtYmVyIGluIHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBDaGVjayBpZiB0aGUgcHJvcGVydHkgZXhpc3RzXG5cdFx0XHRcdHJldHVybiBwT2JqZWN0Lmhhc093blByb3BlcnR5KHBBZGRyZXNzKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCB0bXBTdWJPYmplY3ROYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcFNlcGFyYXRvckluZGV4KTtcblx0XHRcdGxldCB0bXBOZXdBZGRyZXNzID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcFNlcGFyYXRvckluZGV4KzEpO1xuXG5cdFx0XHQvLyBUZXN0IGlmIHRoZSB0bXBOZXdBZGRyZXNzIGlzIGFuIGFycmF5IG9yIG9iamVjdFxuXHRcdFx0Ly8gQ2hlY2sgaWYgaXQncyBhIGJveGVkIHByb3BlcnR5XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0YXJ0SW5kZXggPSB0bXBTdWJPYmplY3ROYW1lLmluZGV4T2YoJ1snKTtcblx0XHRcdGxldCB0bXBCcmFja2V0U3RvcEluZGV4ID0gdG1wU3ViT2JqZWN0TmFtZS5pbmRleE9mKCddJyk7XG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1s0Ml1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snQ29sb3InXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW1wiV2VpZ2h0XCJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbYERpYW1ldGVyYF1cblx0XHRcdC8vXG5cdFx0XHQvLyBXaGVuIHdlIGFyZSBwYXNzZWQgU29tZU9iamVjdFtcIk5hbWVcIl0gdGhpcyBjb2RlIGJlbG93IHJlY3Vyc2VzIGFzIGlmIGl0IHdlcmUgU29tZU9iamVjdC5OYW1lXG5cdFx0XHQvLyBUaGUgcmVxdWlyZW1lbnRzIHRvIGRldGVjdCBhIGJveGVkIGVsZW1lbnQgYXJlOlxuXHRcdFx0Ly8gICAgMSkgVGhlIHN0YXJ0IGJyYWNrZXQgaXMgYWZ0ZXIgY2hhcmFjdGVyIDBcblx0XHRcdGlmICgodG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSBcblx0XHRcdC8vICAgIDIpIFRoZSBlbmQgYnJhY2tldCBoYXMgc29tZXRoaW5nIGJldHdlZW4gdGhlbVxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCA+IHRtcEJyYWNrZXRTdGFydEluZGV4KSBcblx0XHRcdC8vICAgIDMpIFRoZXJlIGlzIGRhdGEgXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4IC0gdG1wQnJhY2tldFN0YXJ0SW5kZXggPiAxKSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gdG1wU3ViT2JqZWN0TmFtZS5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRtcFN1Yk9iamVjdE5hbWUuc3Vic3RyaW5nKHRtcEJyYWNrZXRTdGFydEluZGV4KzEsIHRtcEJyYWNrZXRTdG9wSW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU51bWJlciA9IHBhcnNlSW50KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UsIDEwKTtcblxuXHRcdFx0XHQvLyBHdWFyZDogSWYgdGhlIHJlZmVycmFudCBpcyBhIG51bWJlciBhbmQgdGhlIGJveGVkIHByb3BlcnR5IGlzIG5vdCBhbiBhcnJheSwgb3IgdmljZSB2ZXJzYSwgcmV0dXJuIHVuZGVmaW5lZC5cblx0XHRcdFx0Ly8gICAgICAgIFRoaXMgc2VlbXMgY29uZnVzaW5nIHRvIG1lIGF0IGZpcnN0IHJlYWQsIHNvIGV4cGxhaW5hdGlvbjpcblx0XHRcdFx0Ly8gICAgICAgIElzIHRoZSBCb3hlZCBPYmplY3QgYW4gQXJyYXk/ICBUUlVFXG5cdFx0XHRcdC8vICAgICAgICBBbmQgaXMgdGhlIFJlZmVyZW5jZSBpbnNpZGUgdGhlIGJveGVkIE9iamVjdCBub3QgYSBudW1iZXI/IFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIC0tPiAgU28gd2hlbiB0aGVzZSBhcmUgaW4gYWdyZWVtZW50LCBpdCdzIGFuIGltcG9zc2libGUgYWNjZXNzIHN0YXRlXG5cdFx0XHRcdC8vIFRoaXMgY291bGQgYmUgYSBmYWlsdXJlIGluIHRoZSByZWN1cnNpb24gY2hhaW4gYmVjYXVzZSB0aGV5IHBhc3NlZCBzb21ldGhpbmcgbGlrZSB0aGlzIGluOlxuXHRcdFx0XHQvLyAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzWzFdLlRhcmR5XG5cdFx0XHRcdC8vICAgICAgIEJVVFxuXHRcdFx0XHQvLyAgICAgICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHMgaXMgYW4gb2JqZWN0LCBzbyB0aGUgWzFdLlRhcmR5IGlzIG5vdCBwb3NzaWJsZSB0byBhY2Nlc3Ncblx0XHRcdFx0Ly8gVGhpcyBjb3VsZCBiZSBhIGZhaWx1cmUgaW4gdGhlIHJlY3Vyc2lvbiBjaGFpbiBiZWNhdXNlIHRoZXkgcGFzc2VkIHNvbWV0aGluZyBsaWtlIHRoaXMgaW46XG5cdFx0XHRcdC8vICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHNbXCJKYW5lRG9lXCJdLkdyYWRlXG5cdFx0XHRcdC8vICAgICAgIEJVVFxuXHRcdFx0XHQvLyAgICAgICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHMgaXMgYW4gYXJyYXksIHNvIHRoZSBbXCJKYW5lRG9lXCJdLkdyYWRlIGlzIG5vdCBwb3NzaWJsZSB0byBhY2Nlc3Ncblx0XHRcdFx0Ly8gVE9ETzogU2hvdWxkIHRoaXMgYmUgYW4gZXJyb3Igb3Igc29tZXRoaW5nPyAgU2hvdWxkIHdlIGtlZXAgYSBsb2cgb2YgZmFpbHVyZXMgbGlrZSB0aGlzP1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgPT0gaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBCZWNhdXNlIHRoaXMgaXMgYW4gaW1wb3NzaWJsZSBhZGRyZXNzLCB0aGUgcHJvcGVydHkgZG9lc24ndCBleGlzdFxuXHRcdFx0XHRcdC8vIFRPRE86IFNob3VsZCB3ZSB0aHJvdyBhbiBlcnJvciBpbiB0aGlzIGNvbmRpdGlvbj9cblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL1RoaXMgaXMgYSBicmFja2V0ZWQgdmFsdWVcblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gcmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFubWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgZGlyZWN0bHkgaW50byB0aGUgc3Vib2JqZWN0XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlSZWZlcmVuY2VdLCB0bXBOZXdBZGRyZXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBXZSBwYXJzZWQgYSB2YWxpZCBudW1iZXIgb3V0IG9mIHRoZSBib3hlZCBwcm9wZXJ0eSBuYW1lLCBzbyByZWN1cnNlIGludG8gdGhlIGFycmF5XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlOdW1iZXJdLCB0bXBOZXdBZGRyZXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBhbiBvYmplY3QgcHJvcGVydHkgYWxyZWFkeSBuYW1lZCBmb3IgdGhlIHN1YiBvYmplY3QsIGJ1dCBpdCBpc24ndCBhbiBvYmplY3Rcblx0XHRcdC8vIHRoZW4gdGhlIHN5c3RlbSBjYW4ndCBzZXQgdGhlIHZhbHVlIGluIHRoZXJlLiAgRXJyb3IgYW5kIGFib3J0IVxuXHRcdFx0aWYgKHBPYmplY3QuaGFzT3duUHJvcGVydHkodG1wU3ViT2JqZWN0TmFtZSkgJiYgdHlwZW9mKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0pICE9PSAnb2JqZWN0Jylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh0bXBTdWJPYmplY3ROYW1lKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhIHN1Ym9iamVjdCBwYXNzIHRoYXQgdG8gdGhlIHJlY3Vyc2l2ZSB0aGluZ3lcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0sIHRtcE5ld0FkZHJlc3MpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBDcmVhdGUgYSBzdWJvYmplY3QgYW5kIHRoZW4gcGFzcyB0aGF0XG5cdFx0XHRcdHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0gPSB7fTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0sIHRtcE5ld0FkZHJlc3MpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIEdldCB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBhdCBhbiBhZGRyZXNzXG5cdGdldFZhbHVlQXRBZGRyZXNzIChwT2JqZWN0LCBwQWRkcmVzcywgcFBhcmVudEFkZHJlc3MpXG5cdHtcblx0XHQvLyBNYWtlIHN1cmUgcE9iamVjdCBpcyBhbiBvYmplY3Rcblx0XHRpZiAodHlwZW9mKHBPYmplY3QpICE9ICdvYmplY3QnKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdC8vIE1ha2Ugc3VyZSBwQWRkcmVzcyBpcyBhIHN0cmluZ1xuXHRcdGlmICh0eXBlb2YocEFkZHJlc3MpICE9ICdzdHJpbmcnKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdGxldCB0bXBQYXJlbnRBZGRyZXNzID0gXCJcIjtcblx0XHRpZiAodHlwZW9mKHBQYXJlbnRBZGRyZXNzKSA9PSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHR0bXBQYXJlbnRBZGRyZXNzID0gcFBhcmVudEFkZHJlc3M7XG5cdFx0fVxuXG5cdFx0Ly8gVE9ETzogTWFrZSB0aGlzIHdvcmsgZm9yIHRoaW5ncyBsaWtlIFNvbWVSb290T2JqZWN0Lk1ldGFkYXRhW1wiU29tZS5QZW9wbGUuVXNlLkJhZC5PYmplY3QuUHJvcGVydHkuTmFtZXNcIl1cblx0XHRsZXQgdG1wU2VwYXJhdG9ySW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCcuJyk7XG5cblx0XHQvLyBUaGlzIGlzIHRoZSB0ZXJtaW5hbCBhZGRyZXNzIHN0cmluZyAobm8gbW9yZSBkb3RzIHNvIHRoZSBSRUNVU0lPTiBFTkRTIElOIEhFUkUgc29tZWhvdylcblx0XHRpZiAodG1wU2VwYXJhdG9ySW5kZXggPT0gLTEpXG5cdFx0e1xuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIGFkZHJlc3MgcmVmZXJzIHRvIGEgYm94ZWQgcHJvcGVydHlcblx0XHRcdGxldCB0bXBCcmFja2V0U3RhcnRJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJ1snKTtcblx0XHRcdGxldCB0bXBCcmFja2V0U3RvcEluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignXScpO1xuXG5cdFx0XHQvLyBDaGVjayBmb3IgdGhlIE9iamVjdCBTZXQgVHlwZSBtYXJrZXIuXG5cdFx0XHQvLyBOb3RlIHRoaXMgd2lsbCBub3Qgd29yayB3aXRoIGEgYnJhY2tldCBpbiB0aGUgc2FtZSBhZGRyZXNzIGJveCBzZXRcblx0XHRcdGxldCB0bXBPYmplY3RUeXBlTWFya2VySW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCd7fScpO1xuXG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1sxMF1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snTmFtZSddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJBZ2VcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgQ29zdGBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMSkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRoZSBcIk5hbWVcIiBvZiB0aGUgT2JqZWN0IGNvbnRhaW5lZCB0b28gdGhlIGxlZnQgb2YgdGhlIGJyYWNrZXRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0Ly8gSWYgdGhlIHN1YnByb3BlcnR5IGRvZXNuJ3QgdGVzdCBhcyBhIHByb3BlciBPYmplY3QsIG5vbmUgb2YgdGhlIHJlc3Qgb2YgdGhpcyBpcyBwb3NzaWJsZS5cblx0XHRcdFx0Ly8gVGhpcyBpcyBhIHJhcmUgY2FzZSB3aGVyZSBBcnJheXMgdGVzdGluZyBhcyBPYmplY3RzIGlzIHVzZWZ1bFxuXHRcdFx0XHRpZiAodHlwZW9mKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVGhlIFwiUmVmZXJlbmNlXCIgdG8gdGhlIHByb3BlcnR5IHdpdGhpbiBpdCwgZWl0aGVyIGFuIGFycmF5IGVsZW1lbnQgb3Igb2JqZWN0IHByb3BlcnR5XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcEJyYWNrZXRTdGFydEluZGV4KzEsIHRtcEJyYWNrZXRTdG9wSW5kZXgpLnRyaW0oKTtcblx0XHRcdFx0Ly8gQXR0ZW1wdCB0byBwYXJzZSB0aGUgcmVmZXJlbmNlIGFzIGEgbnVtYmVyLCB3aGljaCB3aWxsIGJlIHVzZWQgYXMgYW4gYXJyYXkgZWxlbWVudFxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU51bWJlciA9IHBhcnNlSW50KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UsIDEwKTtcblxuXHRcdFx0XHQvLyBHdWFyZDogSWYgdGhlIHJlZmVycmFudCBpcyBhIG51bWJlciBhbmQgdGhlIGJveGVkIHByb3BlcnR5IGlzIG5vdCBhbiBhcnJheSwgb3IgdmljZSB2ZXJzYSwgcmV0dXJuIHVuZGVmaW5lZC5cblx0XHRcdFx0Ly8gICAgICAgIFRoaXMgc2VlbXMgY29uZnVzaW5nIHRvIG1lIGF0IGZpcnN0IHJlYWQsIHNvIGV4cGxhaW5hdGlvbjpcblx0XHRcdFx0Ly8gICAgICAgIElzIHRoZSBCb3hlZCBPYmplY3QgYW4gQXJyYXk/ICBUUlVFXG5cdFx0XHRcdC8vICAgICAgICBBbmQgaXMgdGhlIFJlZmVyZW5jZSBpbnNpZGUgdGhlIGJveGVkIE9iamVjdCBub3QgYSBudW1iZXI/IFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIC0tPiAgU28gd2hlbiB0aGVzZSBhcmUgaW4gYWdyZWVtZW50LCBpdCdzIGFuIGltcG9zc2libGUgYWNjZXNzIHN0YXRlXG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSA9PSBpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyAgICA0KSBJZiB0aGUgbWlkZGxlIHBhcnQgaXMgKm9ubHkqIGEgbnVtYmVyIChubyBzaW5nbGUsIGRvdWJsZSBvciBiYWNrdGljayBxdW90ZXMpIGl0IGlzIGFuIGFycmF5IGVsZW1lbnQsXG5cdFx0XHRcdC8vICAgICAgIG90aGVyd2lzZSB3ZSB3aWxsIHRyeSB0byB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRcdC8vIFdlIHdvdWxkIGV4cGVjdCB0aGUgcHJvcGVydHkgdG8gYmUgd3JhcHBlZCBpbiBzb21lIGtpbmQgb2YgcXVvdGVzIHNvIHN0cmlwIHRoZW1cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIFJldHVybiB0aGUgdmFsdWUgaW4gdGhlIHByb3BlcnR5XG5cdFx0XHRcdFx0cmV0dXJuIHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlSZWZlcmVuY2VdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5TnVtYmVyXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBzZXQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0ZWxzZSBpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaXMgYWZ0ZXIgdGhlIHN0YXJ0IGJyYWNrZXRcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBub3RoaW5nIGluIHRoZSBicmFja2V0c1xuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID09IDEpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSBwQWRkcmVzcy5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gV2UgYXNrZWQgZm9yIGEgc2V0IGZyb20gYW4gYXJyYXkgYnV0IGl0IGlzbnQnIGFuIGFycmF5LlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXTtcblx0XHRcdH1cblx0XHRcdC8vIFRoZSBvYmplY3QgaGFzIGJlZW4gZmxhZ2dlZCBhcyBhbiBvYmplY3Qgc2V0LCBzbyB0cmVhdCBpdCBhcyBzdWNoXG5cdFx0XHRlbHNlIGlmICh0bXBPYmplY3RUeXBlTWFya2VySW5kZXggPiAwKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wT2JqZWN0UHJvcGVydHlOYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcE9iamVjdFR5cGVNYXJrZXJJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YocE9iamVjdFt0bXBPYmplY3RQcm9wZXJ0eU5hbWVdKSAhPSAnb2JqZWN0Jylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFdlIGFza2VkIGZvciBhIHNldCBmcm9tIGFuIGFycmF5IGJ1dCBpdCBpc250JyBhbiBhcnJheS5cblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcE9iamVjdFt0bXBPYmplY3RQcm9wZXJ0eU5hbWVdO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBOb3cgaXMgdGhlIHBvaW50IGluIHJlY3Vyc2lvbiB0byByZXR1cm4gdGhlIHZhbHVlIGluIHRoZSBhZGRyZXNzXG5cdFx0XHRcdHJldHVybiBwT2JqZWN0W3BBZGRyZXNzXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCB0bXBTdWJPYmplY3ROYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcFNlcGFyYXRvckluZGV4KTtcblx0XHRcdGxldCB0bXBOZXdBZGRyZXNzID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcFNlcGFyYXRvckluZGV4KzEpO1xuXG5cdFx0XHQvLyBCT1hFRCBFTEVNRU5UU1xuXHRcdFx0Ly8gVGVzdCBpZiB0aGUgdG1wTmV3QWRkcmVzcyBpcyBhbiBhcnJheSBvciBvYmplY3Rcblx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYSBib3hlZCBwcm9wZXJ0eVxuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdGFydEluZGV4ID0gdG1wU3ViT2JqZWN0TmFtZS5pbmRleE9mKCdbJyk7XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0b3BJbmRleCA9IHRtcFN1Yk9iamVjdE5hbWUuaW5kZXhPZignXScpO1xuXHRcdFx0Ly8gQm94ZWQgZWxlbWVudHMgbG9vayBsaWtlIHRoaXM6XG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbNDJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbJ0NvbG9yJ11cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tcIldlaWdodFwiXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW2BEaWFtZXRlcmBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMSkpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TmFtZSA9IHRtcFN1Yk9iamVjdE5hbWUuc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0bXBTdWJPYmplY3ROYW1lLnN1YnN0cmluZyh0bXBCcmFja2V0U3RhcnRJbmRleCsxLCB0bXBCcmFja2V0U3RvcEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOdW1iZXIgPSBwYXJzZUludCh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlLCAxMCk7XG5cblx0XHRcdFx0Ly8gR3VhcmQ6IElmIHRoZSByZWZlcnJhbnQgaXMgYSBudW1iZXIgYW5kIHRoZSBib3hlZCBwcm9wZXJ0eSBpcyBub3QgYW4gYXJyYXksIG9yIHZpY2UgdmVyc2EsIHJldHVybiB1bmRlZmluZWQuXG5cdFx0XHRcdC8vICAgICAgICBUaGlzIHNlZW1zIGNvbmZ1c2luZyB0byBtZSBhdCBmaXJzdCByZWFkLCBzbyBleHBsYWluYXRpb246XG5cdFx0XHRcdC8vICAgICAgICBJcyB0aGUgQm94ZWQgT2JqZWN0IGFuIEFycmF5PyAgVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgQW5kIGlzIHRoZSBSZWZlcmVuY2UgaW5zaWRlIHRoZSBib3hlZCBPYmplY3Qgbm90IGEgbnVtYmVyPyBUUlVFXG5cdFx0XHRcdC8vICAgICAgICAtLT4gIFNvIHdoZW4gdGhlc2UgYXJlIGluIGFncmVlbWVudCwgaXQncyBhbiBpbXBvc3NpYmxlIGFjY2VzcyBzdGF0ZVxuXHRcdFx0XHQvLyBUaGlzIGNvdWxkIGJlIGEgZmFpbHVyZSBpbiB0aGUgcmVjdXJzaW9uIGNoYWluIGJlY2F1c2UgdGhleSBwYXNzZWQgc29tZXRoaW5nIGxpa2UgdGhpcyBpbjpcblx0XHRcdFx0Ly8gICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50c1sxXS5UYXJkeVxuXHRcdFx0XHQvLyAgICAgICBCVVRcblx0XHRcdFx0Ly8gICAgICAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzIGlzIGFuIG9iamVjdCwgc28gdGhlIFsxXS5UYXJkeSBpcyBub3QgcG9zc2libGUgdG8gYWNjZXNzXG5cdFx0XHRcdC8vIFRoaXMgY291bGQgYmUgYSBmYWlsdXJlIGluIHRoZSByZWN1cnNpb24gY2hhaW4gYmVjYXVzZSB0aGV5IHBhc3NlZCBzb21ldGhpbmcgbGlrZSB0aGlzIGluOlxuXHRcdFx0XHQvLyAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzW1wiSmFuZURvZVwiXS5HcmFkZVxuXHRcdFx0XHQvLyAgICAgICBCVVRcblx0XHRcdFx0Ly8gICAgICAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzIGlzIGFuIGFycmF5LCBzbyB0aGUgW1wiSmFuZURvZVwiXS5HcmFkZSBpcyBub3QgcG9zc2libGUgdG8gYWNjZXNzXG5cdFx0XHRcdC8vIFRPRE86IFNob3VsZCB0aGlzIGJlIGFuIGVycm9yIG9yIHNvbWV0aGluZz8gIFNob3VsZCB3ZSBrZWVwIGEgbG9nIG9mIGZhaWx1cmVzIGxpa2UgdGhpcz9cblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pID09IGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vVGhpcyBpcyBhIGJyYWNrZXRlZCB2YWx1ZVxuXHRcdFx0XHQvLyAgICA0KSBJZiB0aGUgbWlkZGxlIHBhcnQgaXMgKm9ubHkqIGEgbnVtYmVyIChubyBzaW5nbGUsIGRvdWJsZSBvciBiYWNrdGljayBxdW90ZXMpIGl0IGlzIGFuIGFycmF5IGVsZW1lbnQsXG5cdFx0XHRcdC8vICAgICAgIG90aGVyd2lzZSB3ZSB3aWxsIHRyeSB0byByZWF0IGl0IGFzIGEgZHluYW1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdGlmIChpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFRoaXMgaXNuJ3QgYSBudW1iZXIgLi4uIGxldCdzIHRyZWF0IGl0IGFzIGEgZHluYW5taWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ1wiJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnYCcsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoXCInXCIsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXG5cdFx0XHRcdFx0Ly8gQ29udGludWUgdG8gbWFuYWdlIHRoZSBwYXJlbnQgYWRkcmVzcyBmb3IgcmVjdXJzaW9uXG5cdFx0XHRcdFx0dG1wUGFyZW50QWRkcmVzcyA9IGAke3RtcFBhcmVudEFkZHJlc3N9JHsodG1wUGFyZW50QWRkcmVzcy5sZW5ndGggPiAwKSA/ICcuJyA6ICcnfSR7dG1wU3ViT2JqZWN0TmFtZX1gO1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgZGlyZWN0bHkgaW50byB0aGUgc3Vib2JqZWN0XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZV0sIHRtcE5ld0FkZHJlc3MsIHRtcFBhcmVudEFkZHJlc3MpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIENvbnRpbnVlIHRvIG1hbmFnZSB0aGUgcGFyZW50IGFkZHJlc3MgZm9yIHJlY3Vyc2lvblxuXHRcdFx0XHRcdHRtcFBhcmVudEFkZHJlc3MgPSBgJHt0bXBQYXJlbnRBZGRyZXNzfSR7KHRtcFBhcmVudEFkZHJlc3MubGVuZ3RoID4gMCkgPyAnLicgOiAnJ30ke3RtcFN1Yk9iamVjdE5hbWV9YDtcblx0XHRcdFx0XHQvLyBXZSBwYXJzZWQgYSB2YWxpZCBudW1iZXIgb3V0IG9mIHRoZSBib3hlZCBwcm9wZXJ0eSBuYW1lLCBzbyByZWN1cnNlIGludG8gdGhlIGFycmF5XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eU51bWJlcl0sIHRtcE5ld0FkZHJlc3MsIHRtcFBhcmVudEFkZHJlc3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBUaGUgcmVxdWlyZW1lbnRzIHRvIGRldGVjdCBhIGJveGVkIHNldCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRlbHNlIGlmICgodG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSBcblx0XHRcdC8vICAgIDIpIFRoZSBlbmQgYnJhY2tldCBpcyBhZnRlciB0aGUgc3RhcnQgYnJhY2tldFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCA+IHRtcEJyYWNrZXRTdGFydEluZGV4KSBcblx0XHRcdC8vICAgIDMpIFRoZXJlIGlzIG5vdGhpbmcgaW4gdGhlIGJyYWNrZXRzXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4IC0gdG1wQnJhY2tldFN0YXJ0SW5kZXggPT0gMSkpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBCcmFja2V0U3RhcnRJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBXZSBhc2tlZCBmb3IgYSBzZXQgZnJvbSBhbiBhcnJheSBidXQgaXQgaXNudCcgYW4gYXJyYXkuXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gV2UgbmVlZCB0byBlbnVtZXJhdGUgdGhlIGFycmF5IGFuZCBncmFiIHRoZSBhZGRyZXNzZXMgZnJvbSB0aGVyZS5cblx0XHRcdFx0bGV0IHRtcEFycmF5UHJvcGVydHkgPSBwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXTtcblx0XHRcdFx0Ly8gTWFuYWdpbmcgdGhlIHBhcmVudCBhZGRyZXNzIGlzIGEgYml0IG1vcmUgY29tcGxleCBoZXJlIC0tIHRoZSBib3ggd2lsbCBiZSBhZGRlZCBmb3IgZWFjaCBlbGVtZW50LlxuXHRcdFx0XHR0bXBQYXJlbnRBZGRyZXNzID0gYCR7dG1wUGFyZW50QWRkcmVzc30keyh0bXBQYXJlbnRBZGRyZXNzLmxlbmd0aCA+IDApID8gJy4nIDogJyd9JHt0bXBCb3hlZFByb3BlcnR5TmFtZX1gO1xuXHRcdFx0XHQvLyBUaGUgY29udGFpbmVyIG9iamVjdCBpcyB3aGVyZSB3ZSBoYXZlIHRoZSBcIkFkZHJlc3NcIjpTT01FVkFMVUUgcGFpcnNcblx0XHRcdFx0bGV0IHRtcENvbnRhaW5lck9iamVjdCA9IHt9O1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRtcEFycmF5UHJvcGVydHkubGVuZ3RoOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdG1wUHJvcGVydHlQYXJlbnRBZGRyZXNzID0gYCR7dG1wUGFyZW50QWRkcmVzc31bJHtpfV1gO1xuXHRcdFx0XHRcdGxldCB0bXBWYWx1ZSA9IHRoaXMuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1baV0sIHRtcE5ld0FkZHJlc3MsIHRtcFByb3BlcnR5UGFyZW50QWRkcmVzcyk7O1xuXHRcdFx0XHRcdHRtcENvbnRhaW5lck9iamVjdFtgJHt0bXBQcm9wZXJ0eVBhcmVudEFkZHJlc3N9LiR7dG1wTmV3QWRkcmVzc31gXSA9IHRtcFZhbHVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHRtcENvbnRhaW5lck9iamVjdDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gT0JKRUNUIFNFVFxuXHRcdFx0Ly8gTm90ZSB0aGlzIHdpbGwgbm90IHdvcmsgd2l0aCBhIGJyYWNrZXQgaW4gdGhlIHNhbWUgYWRkcmVzcyBib3ggc2V0XG5cdFx0XHRsZXQgdG1wT2JqZWN0VHlwZU1hcmtlckluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZigne30nKTtcblx0XHRcdGlmICh0bXBPYmplY3RUeXBlTWFya2VySW5kZXggPiAwKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wT2JqZWN0UHJvcGVydHlOYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcE9iamVjdFR5cGVNYXJrZXJJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YocE9iamVjdFt0bXBPYmplY3RQcm9wZXJ0eU5hbWVdKSAhPSAnb2JqZWN0Jylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFdlIGFza2VkIGZvciBhIHNldCBmcm9tIGFuIGFycmF5IGJ1dCBpdCBpc250JyBhbiBhcnJheS5cblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBXZSBuZWVkIHRvIGVudW1lcmF0ZSB0aGUgT2JqZWN0IGFuZCBncmFiIHRoZSBhZGRyZXNzZXMgZnJvbSB0aGVyZS5cblx0XHRcdFx0bGV0IHRtcE9iamVjdFByb3BlcnR5ID0gcE9iamVjdFt0bXBPYmplY3RQcm9wZXJ0eU5hbWVdO1xuXHRcdFx0XHRsZXQgdG1wT2JqZWN0UHJvcGVydHlLZXlzID0gT2JqZWN0LmtleXModG1wT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHQvLyBNYW5hZ2luZyB0aGUgcGFyZW50IGFkZHJlc3MgaXMgYSBiaXQgbW9yZSBjb21wbGV4IGhlcmUgLS0gdGhlIGJveCB3aWxsIGJlIGFkZGVkIGZvciBlYWNoIGVsZW1lbnQuXG5cdFx0XHRcdHRtcFBhcmVudEFkZHJlc3MgPSBgJHt0bXBQYXJlbnRBZGRyZXNzfSR7KHRtcFBhcmVudEFkZHJlc3MubGVuZ3RoID4gMCkgPyAnLicgOiAnJ30ke3RtcE9iamVjdFByb3BlcnR5TmFtZX1gO1xuXHRcdFx0XHQvLyBUaGUgY29udGFpbmVyIG9iamVjdCBpcyB3aGVyZSB3ZSBoYXZlIHRoZSBcIkFkZHJlc3NcIjpTT01FVkFMVUUgcGFpcnNcblx0XHRcdFx0bGV0IHRtcENvbnRhaW5lck9iamVjdCA9IHt9O1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRtcE9iamVjdFByb3BlcnR5S2V5cy5sZW5ndGg7IGkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB0bXBQcm9wZXJ0eVBhcmVudEFkZHJlc3MgPSBgJHt0bXBQYXJlbnRBZGRyZXNzfS4ke3RtcE9iamVjdFByb3BlcnR5S2V5c1tpXX1gO1xuXHRcdFx0XHRcdGxldCB0bXBWYWx1ZSA9IHRoaXMuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBPYmplY3RQcm9wZXJ0eU5hbWVdW3RtcE9iamVjdFByb3BlcnR5S2V5c1tpXV0sIHRtcE5ld0FkZHJlc3MsIHRtcFByb3BlcnR5UGFyZW50QWRkcmVzcyk7O1xuXHRcdFx0XHRcdHRtcENvbnRhaW5lck9iamVjdFtgJHt0bXBQcm9wZXJ0eVBhcmVudEFkZHJlc3N9LiR7dG1wTmV3QWRkcmVzc31gXSA9IHRtcFZhbHVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHRtcENvbnRhaW5lck9iamVjdDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgYW4gb2JqZWN0IHByb3BlcnR5IGFscmVhZHkgbmFtZWQgZm9yIHRoZSBzdWIgb2JqZWN0LCBidXQgaXQgaXNuJ3QgYW4gb2JqZWN0XG5cdFx0XHQvLyB0aGVuIHRoZSBzeXN0ZW0gY2FuJ3Qgc2V0IHRoZSB2YWx1ZSBpbiB0aGVyZS4gIEVycm9yIGFuZCBhYm9ydCFcblx0XHRcdGlmIChwT2JqZWN0Lmhhc093blByb3BlcnR5KHRtcFN1Yk9iamVjdE5hbWUpICYmIHR5cGVvZihwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwT2JqZWN0Lmhhc093blByb3BlcnR5KHRtcFN1Yk9iamVjdE5hbWUpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGEgc3Vib2JqZWN0IHBhc3MgdGhhdCB0byB0aGUgcmVjdXJzaXZlIHRoaW5neVxuXHRcdFx0XHQvLyBDb250aW51ZSB0byBtYW5hZ2UgdGhlIHBhcmVudCBhZGRyZXNzIGZvciByZWN1cnNpb25cblx0XHRcdFx0dG1wUGFyZW50QWRkcmVzcyA9IGAke3RtcFBhcmVudEFkZHJlc3N9JHsodG1wUGFyZW50QWRkcmVzcy5sZW5ndGggPiAwKSA/ICcuJyA6ICcnfSR7dG1wU3ViT2JqZWN0TmFtZX1gO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdLCB0bXBOZXdBZGRyZXNzLCB0bXBQYXJlbnRBZGRyZXNzKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gQ3JlYXRlIGEgc3Vib2JqZWN0IGFuZCB0aGVuIHBhc3MgdGhhdFxuXHRcdFx0XHQvLyBDb250aW51ZSB0byBtYW5hZ2UgdGhlIHBhcmVudCBhZGRyZXNzIGZvciByZWN1cnNpb25cblx0XHRcdFx0dG1wUGFyZW50QWRkcmVzcyA9IGAke3RtcFBhcmVudEFkZHJlc3N9JHsodG1wUGFyZW50QWRkcmVzcy5sZW5ndGggPiAwKSA/ICcuJyA6ICcnfSR7dG1wU3ViT2JqZWN0TmFtZX1gO1xuXHRcdFx0XHRwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdID0ge307XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0sIHRtcE5ld0FkZHJlc3MsIHRtcFBhcmVudEFkZHJlc3MpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFNldCB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBhdCBhbiBhZGRyZXNzXG5cdHNldFZhbHVlQXRBZGRyZXNzIChwT2JqZWN0LCBwQWRkcmVzcywgcFZhbHVlKVxuXHR7XG5cdFx0Ly8gTWFrZSBzdXJlIHBPYmplY3QgaXMgYW4gb2JqZWN0XG5cdFx0aWYgKHR5cGVvZihwT2JqZWN0KSAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuXHRcdC8vIE1ha2Ugc3VyZSBwQWRkcmVzcyBpcyBhIHN0cmluZ1xuXHRcdGlmICh0eXBlb2YocEFkZHJlc3MpICE9ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG5cblx0XHRsZXQgdG1wU2VwYXJhdG9ySW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCcuJyk7XG5cblx0XHRpZiAodG1wU2VwYXJhdG9ySW5kZXggPT0gLTEpXG5cdFx0e1xuXHRcdFx0Ly8gQ2hlY2sgaWYgaXQncyBhIGJveGVkIHByb3BlcnR5XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0YXJ0SW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCdbJyk7XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0b3BJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJ10nKTtcblx0XHRcdC8vIEJveGVkIGVsZW1lbnRzIGxvb2sgbGlrZSB0aGlzOlxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWzEwXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWydOYW1lJ11cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tcIkFnZVwiXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW2BDb3N0YF1cblx0XHRcdC8vXG5cdFx0XHQvLyBXaGVuIHdlIGFyZSBwYXNzZWQgU29tZU9iamVjdFtcIk5hbWVcIl0gdGhpcyBjb2RlIGJlbG93IHJlY3Vyc2VzIGFzIGlmIGl0IHdlcmUgU29tZU9iamVjdC5OYW1lXG5cdFx0XHQvLyBUaGUgcmVxdWlyZW1lbnRzIHRvIGRldGVjdCBhIGJveGVkIGVsZW1lbnQgYXJlOlxuXHRcdFx0Ly8gICAgMSkgVGhlIHN0YXJ0IGJyYWNrZXQgaXMgYWZ0ZXIgY2hhcmFjdGVyIDBcblx0XHRcdGlmICgodG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSBcblx0XHRcdC8vICAgIDIpIFRoZSBlbmQgYnJhY2tldCBoYXMgc29tZXRoaW5nIGJldHdlZW4gdGhlbVxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCA+IHRtcEJyYWNrZXRTdGFydEluZGV4KSBcblx0XHRcdC8vICAgIDMpIFRoZXJlIGlzIGRhdGEgXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4IC0gdG1wQnJhY2tldFN0YXJ0SW5kZXggPiAxKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gVGhlIFwiTmFtZVwiIG9mIHRoZSBPYmplY3QgY29udGFpbmVkIHRvbyB0aGUgbGVmdCBvZiB0aGUgYnJhY2tldFxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSBwQWRkcmVzcy5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHQvLyBJZiB0aGUgc3VicHJvcGVydHkgZG9lc24ndCB0ZXN0IGFzIGEgcHJvcGVyIE9iamVjdCwgbm9uZSBvZiB0aGUgcmVzdCBvZiB0aGlzIGlzIHBvc3NpYmxlLlxuXHRcdFx0XHQvLyBUaGlzIGlzIGEgcmFyZSBjYXNlIHdoZXJlIEFycmF5cyB0ZXN0aW5nIGFzIE9iamVjdHMgaXMgdXNlZnVsXG5cdFx0XHRcdGlmICh0eXBlb2YocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pICE9PSAnb2JqZWN0Jylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFRoZSBcIlJlZmVyZW5jZVwiIHRvIHRoZSBwcm9wZXJ0eSB3aXRoaW4gaXQsIGVpdGhlciBhbiBhcnJheSBlbGVtZW50IG9yIG9iamVjdCBwcm9wZXJ0eVxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHBBZGRyZXNzLnN1YnN0cmluZyh0bXBCcmFja2V0U3RhcnRJbmRleCsxLCB0bXBCcmFja2V0U3RvcEluZGV4KS50cmltKCk7XG5cdFx0XHRcdC8vIEF0dGVtcHQgdG8gcGFyc2UgdGhlIHJlZmVyZW5jZSBhcyBhIG51bWJlciwgd2hpY2ggd2lsbCBiZSB1c2VkIGFzIGFuIGFycmF5IGVsZW1lbnRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOdW1iZXIgPSBwYXJzZUludCh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlLCAxMCk7XG5cblx0XHRcdFx0Ly8gR3VhcmQ6IElmIHRoZSByZWZlcnJhbnQgaXMgYSBudW1iZXIgYW5kIHRoZSBib3hlZCBwcm9wZXJ0eSBpcyBub3QgYW4gYXJyYXksIG9yIHZpY2UgdmVyc2EsIHJldHVybiB1bmRlZmluZWQuXG5cdFx0XHRcdC8vICAgICAgICBUaGlzIHNlZW1zIGNvbmZ1c2luZyB0byBtZSBhdCBmaXJzdCByZWFkLCBzbyBleHBsYWluYXRpb246XG5cdFx0XHRcdC8vICAgICAgICBJcyB0aGUgQm94ZWQgT2JqZWN0IGFuIEFycmF5PyAgVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgQW5kIGlzIHRoZSBSZWZlcmVuY2UgaW5zaWRlIHRoZSBib3hlZCBPYmplY3Qgbm90IGEgbnVtYmVyPyBUUlVFXG5cdFx0XHRcdC8vICAgICAgICAtLT4gIFNvIHdoZW4gdGhlc2UgYXJlIGluIGFncmVlbWVudCwgaXQncyBhbiBpbXBvc3NpYmxlIGFjY2VzcyBzdGF0ZVxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgPT0gaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyAgICA0KSBJZiB0aGUgbWlkZGxlIHBhcnQgaXMgKm9ubHkqIGEgbnVtYmVyIChubyBzaW5nbGUsIGRvdWJsZSBvciBiYWNrdGljayBxdW90ZXMpIGl0IGlzIGFuIGFycmF5IGVsZW1lbnQsXG5cdFx0XHRcdC8vICAgICAgIG90aGVyd2lzZSB3ZSB3aWxsIHRyeSB0byB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRcdC8vIFdlIHdvdWxkIGV4cGVjdCB0aGUgcHJvcGVydHkgdG8gYmUgd3JhcHBlZCBpbiBzb21lIGtpbmQgb2YgcXVvdGVzIHNvIHN0cmlwIHRoZW1cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIFJldHVybiB0aGUgdmFsdWUgaW4gdGhlIHByb3BlcnR5XG5cdFx0XHRcdFx0cE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZV0gPSBwVmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eU51bWJlcl0gPSBwVmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gTm93IGlzIHRoZSB0aW1lIGluIHJlY3Vyc2lvbiB0byBzZXQgdGhlIHZhbHVlIGluIHRoZSBvYmplY3Rcblx0XHRcdFx0cE9iamVjdFtwQWRkcmVzc10gPSBwVmFsdWU7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGV0IHRtcFN1Yk9iamVjdE5hbWUgPSBwQWRkcmVzcy5zdWJzdHJpbmcoMCwgdG1wU2VwYXJhdG9ySW5kZXgpO1xuXHRcdFx0bGV0IHRtcE5ld0FkZHJlc3MgPSBwQWRkcmVzcy5zdWJzdHJpbmcodG1wU2VwYXJhdG9ySW5kZXgrMSk7XG5cblx0XHRcdC8vIFRlc3QgaWYgdGhlIHRtcE5ld0FkZHJlc3MgaXMgYW4gYXJyYXkgb3Igb2JqZWN0XG5cdFx0XHQvLyBDaGVjayBpZiBpdCdzIGEgYm94ZWQgcHJvcGVydHlcblx0XHRcdGxldCB0bXBCcmFja2V0U3RhcnRJbmRleCA9IHRtcFN1Yk9iamVjdE5hbWUuaW5kZXhPZignWycpO1xuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdG9wSW5kZXggPSB0bXBTdWJPYmplY3ROYW1lLmluZGV4T2YoJ10nKTtcblx0XHRcdC8vIEJveGVkIGVsZW1lbnRzIGxvb2sgbGlrZSB0aGlzOlxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWzQyXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWydDb2xvciddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJXZWlnaHRcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgRGlhbWV0ZXJgXVxuXHRcdFx0Ly9cblx0XHRcdC8vIFdoZW4gd2UgYXJlIHBhc3NlZCBTb21lT2JqZWN0W1wiTmFtZVwiXSB0aGlzIGNvZGUgYmVsb3cgcmVjdXJzZXMgYXMgaWYgaXQgd2VyZSBTb21lT2JqZWN0Lk5hbWVcblx0XHRcdC8vIFRoZSByZXF1aXJlbWVudHMgdG8gZGV0ZWN0IGEgYm94ZWQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0aWYgKCh0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApIFxuXHRcdFx0Ly8gICAgMikgVGhlIGVuZCBicmFja2V0IGhhcyBzb21ldGhpbmcgYmV0d2VlbiB0aGVtXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4ID4gdG1wQnJhY2tldFN0YXJ0SW5kZXgpIFxuXHRcdFx0Ly8gICAgMykgVGhlcmUgaXMgZGF0YSBcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggLSB0bXBCcmFja2V0U3RhcnRJbmRleCA+IDEpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSB0bXBTdWJPYmplY3ROYW1lLnN1YnN0cmluZygwLCB0bXBCcmFja2V0U3RhcnRJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdG1wU3ViT2JqZWN0TmFtZS5zdWJzdHJpbmcodG1wQnJhY2tldFN0YXJ0SW5kZXgrMSwgdG1wQnJhY2tldFN0b3BJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TnVtYmVyID0gcGFyc2VJbnQodG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSwgMTApO1xuXG5cdFx0XHRcdC8vIEd1YXJkOiBJZiB0aGUgcmVmZXJyYW50IGlzIGEgbnVtYmVyIGFuZCB0aGUgYm94ZWQgcHJvcGVydHkgaXMgbm90IGFuIGFycmF5LCBvciB2aWNlIHZlcnNhLCByZXR1cm4gdW5kZWZpbmVkLlxuXHRcdFx0XHQvLyAgICAgICAgVGhpcyBzZWVtcyBjb25mdXNpbmcgdG8gbWUgYXQgZmlyc3QgcmVhZCwgc28gZXhwbGFpbmF0aW9uOlxuXHRcdFx0XHQvLyAgICAgICAgSXMgdGhlIEJveGVkIE9iamVjdCBhbiBBcnJheT8gIFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIEFuZCBpcyB0aGUgUmVmZXJlbmNlIGluc2lkZSB0aGUgYm94ZWQgT2JqZWN0IG5vdCBhIG51bWJlcj8gVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgLS0+ICBTbyB3aGVuIHRoZXNlIGFyZSBpbiBhZ3JlZW1lbnQsIGl0J3MgYW4gaW1wb3NzaWJsZSBhY2Nlc3Mgc3RhdGVcblx0XHRcdFx0Ly8gVGhpcyBjb3VsZCBiZSBhIGZhaWx1cmUgaW4gdGhlIHJlY3Vyc2lvbiBjaGFpbiBiZWNhdXNlIHRoZXkgcGFzc2VkIHNvbWV0aGluZyBsaWtlIHRoaXMgaW46XG5cdFx0XHRcdC8vICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHNbMV0uVGFyZHlcblx0XHRcdFx0Ly8gICAgICAgQlVUXG5cdFx0XHRcdC8vICAgICAgICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50cyBpcyBhbiBvYmplY3QsIHNvIHRoZSBbMV0uVGFyZHkgaXMgbm90IHBvc3NpYmxlIHRvIGFjY2Vzc1xuXHRcdFx0XHQvLyBUaGlzIGNvdWxkIGJlIGEgZmFpbHVyZSBpbiB0aGUgcmVjdXJzaW9uIGNoYWluIGJlY2F1c2UgdGhleSBwYXNzZWQgc29tZXRoaW5nIGxpa2UgdGhpcyBpbjpcblx0XHRcdFx0Ly8gICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50c1tcIkphbmVEb2VcIl0uR3JhZGVcblx0XHRcdFx0Ly8gICAgICAgQlVUXG5cdFx0XHRcdC8vICAgICAgICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50cyBpcyBhbiBhcnJheSwgc28gdGhlIFtcIkphbmVEb2VcIl0uR3JhZGUgaXMgbm90IHBvc3NpYmxlIHRvIGFjY2Vzc1xuXHRcdFx0XHQvLyBUT0RPOiBTaG91bGQgdGhpcyBiZSBhbiBlcnJvciBvciBzb21ldGhpbmc/ICBTaG91bGQgd2Uga2VlcCBhIGxvZyBvZiBmYWlsdXJlcyBsaWtlIHRoaXM/XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSA9PSBpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vVGhpcyBpcyBhIGJyYWNrZXRlZCB2YWx1ZVxuXHRcdFx0XHQvLyAgICA0KSBJZiB0aGUgbWlkZGxlIHBhcnQgaXMgKm9ubHkqIGEgbnVtYmVyIChubyBzaW5nbGUsIGRvdWJsZSBvciBiYWNrdGljayBxdW90ZXMpIGl0IGlzIGFuIGFycmF5IGVsZW1lbnQsXG5cdFx0XHRcdC8vICAgICAgIG90aGVyd2lzZSB3ZSB3aWxsIHRyeSB0byByZWF0IGl0IGFzIGEgZHluYW1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdGlmIChpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFRoaXMgaXNuJ3QgYSBudW1iZXIgLi4uIGxldCdzIHRyZWF0IGl0IGFzIGEgZHluYW5taWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ1wiJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnYCcsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoXCInXCIsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBkaXJlY3RseSBpbnRvIHRoZSBzdWJvYmplY3Rcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5zZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlXSwgdG1wTmV3QWRkcmVzcywgcFZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBXZSBwYXJzZWQgYSB2YWxpZCBudW1iZXIgb3V0IG9mIHRoZSBib3hlZCBwcm9wZXJ0eSBuYW1lLCBzbyByZWN1cnNlIGludG8gdGhlIGFycmF5XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eU51bWJlcl0sIHRtcE5ld0FkZHJlc3MsIHBWYWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgYW4gb2JqZWN0IHByb3BlcnR5IGFscmVhZHkgbmFtZWQgZm9yIHRoZSBzdWIgb2JqZWN0LCBidXQgaXQgaXNuJ3QgYW4gb2JqZWN0XG5cdFx0XHQvLyB0aGVuIHRoZSBzeXN0ZW0gY2FuJ3Qgc2V0IHRoZSB2YWx1ZSBpbiB0aGVyZS4gIEVycm9yIGFuZCBhYm9ydCFcblx0XHRcdGlmIChwT2JqZWN0Lmhhc093blByb3BlcnR5KHRtcFN1Yk9iamVjdE5hbWUpICYmIHR5cGVvZihwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICghcE9iamVjdC5oYXNPd25Qcm9wZXJ0eSgnX19FUlJPUicpKVxuXHRcdFx0XHRcdHBPYmplY3RbJ19fRVJST1InXSA9IHt9O1xuXHRcdFx0XHQvLyBQdXQgaXQgaW4gYW4gZXJyb3Igb2JqZWN0IHNvIGRhdGEgaXNuJ3QgbG9zdFxuXHRcdFx0XHRwT2JqZWN0WydfX0VSUk9SJ11bcEFkZHJlc3NdID0gcFZhbHVlO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwT2JqZWN0Lmhhc093blByb3BlcnR5KHRtcFN1Yk9iamVjdE5hbWUpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGEgc3Vib2JqZWN0IHBhc3MgdGhhdCB0byB0aGUgcmVjdXJzaXZlIHRoaW5neVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5zZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdLCB0bXBOZXdBZGRyZXNzLCBwVmFsdWUpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBDcmVhdGUgYSBzdWJvYmplY3QgYW5kIHRoZW4gcGFzcyB0aGF0XG5cdFx0XHRcdHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0gPSB7fTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSwgdG1wTmV3QWRkcmVzcywgcFZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFueWZlc3RPYmplY3RBZGRyZXNzUmVzb2x2ZXI7IiwiLyoqXG4qIEBsaWNlbnNlIE1JVFxuKiBAYXV0aG9yIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbiovXG5sZXQgbGliU2ltcGxlTG9nID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1Mb2dUb0NvbnNvbGUuanMnKTtcblxuLyoqXG4qIFNjaGVtYSBNYW5pcHVsYXRpb24gRnVuY3Rpb25zXG4qXG4qIEBjbGFzcyBNYW55ZmVzdFNjaGVtYU1hbmlwdWxhdGlvblxuKi9cbmNsYXNzIE1hbnlmZXN0U2NoZW1hTWFuaXB1bGF0aW9uXG57XG5cdGNvbnN0cnVjdG9yKHBJbmZvTG9nLCBwRXJyb3JMb2cpXG5cdHtcblx0XHQvLyBXaXJlIGluIGxvZ2dpbmdcblx0XHR0aGlzLmxvZ0luZm8gPSAodHlwZW9mKHBJbmZvTG9nKSA9PT0gJ2Z1bmN0aW9uJykgPyBwSW5mb0xvZyA6IGxpYlNpbXBsZUxvZztcblx0XHR0aGlzLmxvZ0Vycm9yID0gKHR5cGVvZihwRXJyb3JMb2cpID09PSAnZnVuY3Rpb24nKSA/IHBFcnJvckxvZyA6IGxpYlNpbXBsZUxvZztcblx0fVxuXG4gICAgLy8gVGhpcyB0cmFuc2xhdGVzIHRoZSBkZWZhdWx0IGFkZHJlc3MgbWFwcGluZ3MgdG8gc29tZXRoaW5nIGRpZmZlcmVudC5cbiAgICAvL1xuICAgIC8vIEZvciBpbnN0YW5jZSB5b3UgY2FuIHBhc3MgaW4gbWFueWZlc3Qgc2NoZW1hIGRlc2NyaXB0b3Igb2JqZWN0OlxuICAgIC8vIFx0e1xuXHQvL1x0ICBcIkFkZHJlc3MuT2YuYVwiOiB7IFwiSGFzaFwiOiBcImFcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfSxcblx0Ly9cdCAgXCJBZGRyZXNzLk9mLmJcIjogeyBcIkhhc2hcIjogXCJiXCIsIFwiVHlwZVwiOiBcIk51bWJlclwiIH1cblx0Ly8gIH1cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gQW5kIHRoZW4gYW4gYWRkcmVzcyBtYXBwaW5nIChiYXNpY2FsbHkgYSBIYXNoLT5BZGRyZXNzIG1hcClcbiAgICAvLyAge1xuICAgIC8vICAgIFwiYVwiOiBcIk5ldy5BZGRyZXNzLk9mLmFcIixcbiAgICAvLyAgICBcImJcIjogXCJOZXcuQWRkcmVzcy5PZi5iXCIgIFxuICAgIC8vICB9XG4gICAgLy9cbiAgICAvLyBOT1RFOiBUaGlzIG11dGF0ZXMgdGhlIHNjaGVtYSBvYmplY3QgcGVybWFuZW50bHksIGFsdGVyaW5nIHRoZSBiYXNlIGhhc2guXG4gICAgLy8gICAgICAgSWYgdGhlcmUgaXMgYSBjb2xsaXNpb24gd2l0aCBhbiBleGlzdGluZyBhZGRyZXNzLCBpdCBjYW4gbGVhZCB0byBvdmVyd3JpdGVzLlxuICAgIC8vIFRPRE86IERpc2N1c3Mgd2hhdCBzaG91bGQgaGFwcGVuIG9uIGNvbGxpc2lvbnMuXG5cdHJlc29sdmVBZGRyZXNzTWFwcGluZ3MocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnMsIHBBZGRyZXNzTWFwcGluZylcblx0e1xuXHRcdGlmICh0eXBlb2YocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnMpICE9ICdvYmplY3QnKVxuXHRcdHtcblx0XHRcdHRoaXMubG9nRXJyb3IoYEF0dGVtcHRlZCB0byByZXNvbHZlIGFkZHJlc3MgbWFwcGluZyBidXQgdGhlIGRlc2NyaXB0b3Igd2FzIG5vdCBhbiBvYmplY3QuYCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZihwQWRkcmVzc01hcHBpbmcpICE9ICdvYmplY3QnKVxuXHRcdHtcblx0XHRcdC8vIE5vIG1hcHBpbmdzIHdlcmUgcGFzc2VkIGluXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBHZXQgdGhlIGFycmF5cyBvZiBib3RoIHRoZSBzY2hlbWEgZGVmaW5pdGlvbiBhbmQgdGhlIGhhc2ggbWFwcGluZ1xuXHRcdGxldCB0bXBNYW55ZmVzdEFkZHJlc3NlcyA9IE9iamVjdC5rZXlzKHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzKTtcblx0XHRsZXQgdG1wSGFzaE1hcHBpbmcgPSB7fTtcblx0XHR0bXBNYW55ZmVzdEFkZHJlc3Nlcy5mb3JFYWNoKFxuXHRcdFx0KHBBZGRyZXNzKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRpZiAocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNbcEFkZHJlc3NdLmhhc093blByb3BlcnR5KCdIYXNoJykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0bXBIYXNoTWFwcGluZ1twTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc1twQWRkcmVzc10uSGFzaF0gPSBwQWRkcmVzcztcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRsZXQgdG1wQWRkcmVzc01hcHBpbmdTZXQgPSBPYmplY3Qua2V5cyhwQWRkcmVzc01hcHBpbmcpO1xuXG5cdFx0dG1wQWRkcmVzc01hcHBpbmdTZXQuZm9yRWFjaChcblx0XHRcdChwSW5wdXRBZGRyZXNzKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wTmV3RGVzY3JpcHRvckFkZHJlc3MgPSBwQWRkcmVzc01hcHBpbmdbcElucHV0QWRkcmVzc107XG5cdFx0XHRcdGxldCB0bXBPbGREZXNjcmlwdG9yQWRkcmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRsZXQgdG1wRGVzY3JpcHRvciA9IGZhbHNlO1xuXG5cdFx0XHRcdC8vIFNlZSBpZiB0aGVyZSBpcyBhIG1hdGNoaW5nIGRlc2NyaXB0b3IgZWl0aGVyIGJ5IEFkZHJlc3MgZGlyZWN0bHkgb3IgSGFzaFxuXHRcdFx0XHRpZiAocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnMuaGFzT3duUHJvcGVydHkocElucHV0QWRkcmVzcykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0bXBPbGREZXNjcmlwdG9yQWRkcmVzcyA9IHBJbnB1dEFkZHJlc3M7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAodG1wSGFzaE1hcHBpbmcuaGFzT3duUHJvcGVydHkocElucHV0QWRkcmVzcykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0bXBPbGREZXNjcmlwdG9yQWRkcmVzcyA9IHRtcEhhc2hNYXBwaW5nW3BJbnB1dEFkZHJlc3NdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gSWYgdGhlcmUgd2FzIGEgbWF0Y2hpbmcgZGVzY3JpcHRvciBpbiB0aGUgbWFuaWZlc3QsIHN0b3JlIGl0IGluIHRoZSB0ZW1wb3JhcnkgZGVzY3JpcHRvclxuXHRcdFx0XHRpZiAodG1wT2xkRGVzY3JpcHRvckFkZHJlc3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0bXBEZXNjcmlwdG9yID0gcE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNbdG1wT2xkRGVzY3JpcHRvckFkZHJlc3NdO1xuXHRcdFx0XHRcdGRlbGV0ZSBwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc1t0bXBPbGREZXNjcmlwdG9yQWRkcmVzc107XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQ3JlYXRlIGEgbmV3IGRlc2NyaXB0b3IhICBNYXAgaXQgdG8gdGhlIGlucHV0IGFkZHJlc3MuXG5cdFx0XHRcdFx0dG1wRGVzY3JpcHRvciA9IHsgSGFzaDpwSW5wdXRBZGRyZXNzIH07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBOb3cgcmUtYWRkIHRoZSBkZXNjcmlwdG9yIHRvIHRoZSBtYW55ZmVzdCBzY2hlbWFcblx0XHRcdFx0cE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNbdG1wTmV3RGVzY3JpcHRvckFkZHJlc3NdID0gdG1wRGVzY3JpcHRvcjtcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRzYWZlUmVzb2x2ZUFkZHJlc3NNYXBwaW5ncyhwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycywgcEFkZHJlc3NNYXBwaW5nKVxuXHR7XG5cdFx0Ly8gVGhpcyByZXR1cm5zIHRoZSBkZXNjcmlwdG9ycyBhcyBhIG5ldyBvYmplY3QsIHNhZmVseSByZW1hcHBpbmcgd2l0aG91dCBtdXRhdGluZyB0aGUgb3JpZ2luYWwgc2NoZW1hIERlc2NyaXB0b3JzXG5cdFx0bGV0IHRtcE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzKSk7XG5cdFx0dGhpcy5yZXNvbHZlQWRkcmVzc01hcHBpbmdzKHRtcE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnMsIHBBZGRyZXNzTWFwcGluZyk7XG5cdFx0cmV0dXJuIHRtcE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnM7XG5cdH1cblxuXHRtZXJnZUFkZHJlc3NNYXBwaW5ncyhwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc0Rlc3RpbmF0aW9uLCBwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc1NvdXJjZSlcblx0e1xuXHRcdGlmICgodHlwZW9mKHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzU291cmNlKSAhPSAnb2JqZWN0JykgfHwgKHR5cGVvZihwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc0Rlc3RpbmF0aW9uKSAhPSAnb2JqZWN0JykpXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2dFcnJvcihgQXR0ZW1wdGVkIHRvIG1lcmdlIHR3byBzY2hlbWEgZGVzY3JpcHRvcnMgYnV0IGJvdGggd2VyZSBub3Qgb2JqZWN0cy5gKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRsZXQgdG1wU291cmNlID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc1NvdXJjZSkpO1xuXHRcdGxldCB0bXBOZXdNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc0Rlc3RpbmF0aW9uKSk7XG5cblx0XHQvLyBUaGUgZmlyc3QgcGFzc2VkLWluIHNldCBvZiBkZXNjcmlwdG9ycyB0YWtlcyBwcmVjZWRlbmNlLlxuXHRcdGxldCB0bXBEZXNjcmlwdG9yQWRkcmVzc2VzID0gT2JqZWN0LmtleXModG1wU291cmNlKTtcblxuXHRcdHRtcERlc2NyaXB0b3JBZGRyZXNzZXMuZm9yRWFjaChcblx0XHRcdChwRGVzY3JpcHRvckFkZHJlc3MpID0+IFxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoIXRtcE5ld01hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnMuaGFzT3duUHJvcGVydHkocERlc2NyaXB0b3JBZGRyZXNzKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRtcE5ld01hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNbcERlc2NyaXB0b3JBZGRyZXNzXSA9IHRtcFNvdXJjZVtwRGVzY3JpcHRvckFkZHJlc3NdO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcblx0XHRyZXR1cm4gdG1wTmV3TWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycztcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnlmZXN0U2NoZW1hTWFuaXB1bGF0aW9uOyIsIi8qKlxuKiBAbGljZW5zZSBNSVRcbiogQGF1dGhvciA8c3RldmVuQHZlbG96by5jb20+XG4qL1xubGV0IGxpYlNpbXBsZUxvZyA9IHJlcXVpcmUoJy4vTWFueWZlc3QtTG9nVG9Db25zb2xlLmpzJyk7XG5cbmxldCBsaWJIYXNoVHJhbnNsYXRpb24gPSByZXF1aXJlKCcuL01hbnlmZXN0LUhhc2hUcmFuc2xhdGlvbi5qcycpO1xubGV0IGxpYk9iamVjdEFkZHJlc3NSZXNvbHZlciA9IHJlcXVpcmUoJy4vTWFueWZlc3QtT2JqZWN0QWRkcmVzc1Jlc29sdmVyLmpzJyk7XG5sZXQgbGliT2JqZWN0QWRkcmVzc0dlbmVyYXRpb24gPSByZXF1aXJlKCcuL01hbnlmZXN0LU9iamVjdEFkZHJlc3NHZW5lcmF0aW9uLmpzJyk7XG5sZXQgbGliU2NoZW1hTWFuaXB1bGF0aW9uID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1TY2hlbWFNYW5pcHVsYXRpb24uanMnKTtcblxuXG4vKipcbiogTWFueWZlc3Qgb2JqZWN0IGFkZHJlc3MtYmFzZWQgZGVzY3JpcHRpb25zIGFuZCBtYW5pcHVsYXRpb25zLlxuKlxuKiBAY2xhc3MgTWFueWZlc3RcbiovXG5jbGFzcyBNYW55ZmVzdFxue1xuXHRjb25zdHJ1Y3RvcihwTWFuaWZlc3QsIHBJbmZvTG9nLCBwRXJyb3JMb2csIHBPcHRpb25zKVxuXHR7XG5cdFx0Ly8gV2lyZSBpbiBsb2dnaW5nXG5cdFx0dGhpcy5sb2dJbmZvID0gKHR5cGVvZihwSW5mb0xvZykgPT09ICdmdW5jdGlvbicpID8gcEluZm9Mb2cgOiBsaWJTaW1wbGVMb2c7XG5cdFx0dGhpcy5sb2dFcnJvciA9ICh0eXBlb2YocEVycm9yTG9nKSA9PT0gJ2Z1bmN0aW9uJykgPyBwRXJyb3JMb2cgOiBsaWJTaW1wbGVMb2c7XG5cblx0XHQvLyBDcmVhdGUgYW4gb2JqZWN0IGFkZHJlc3MgcmVzb2x2ZXIgYW5kIG1hcCBpbiB0aGUgZnVuY3Rpb25zXG5cdFx0dGhpcy5vYmplY3RBZGRyZXNzUmVzb2x2ZXIgPSBuZXcgbGliT2JqZWN0QWRkcmVzc1Jlc29sdmVyKHRoaXMubG9nSW5mbywgdGhpcy5sb2dFcnJvcik7XG5cblx0XHR0aGlzLm9wdGlvbnMgPSAoXG5cdFx0XHR7XG5cdFx0XHRcdHN0cmljdDogZmFsc2UsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZXM6IFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFwiU3RyaW5nXCI6IFwiXCIsXG5cdFx0XHRcdFx0XHRcIk51bWJlclwiOiAwLFxuXHRcdFx0XHRcdFx0XCJGbG9hdFwiOiAwLjAsXG5cdFx0XHRcdFx0XHRcIkludGVnZXJcIjogMCxcblx0XHRcdFx0XHRcdFwiQm9vbGVhblwiOiBmYWxzZSxcblx0XHRcdFx0XHRcdFwiQmluYXJ5XCI6IDAsXG5cdFx0XHRcdFx0XHRcIkRhdGVUaW1lXCI6IDAsXG5cdFx0XHRcdFx0XHRcIkFycmF5XCI6IFtdLFxuXHRcdFx0XHRcdFx0XCJPYmplY3RcIjoge30sXG5cdFx0XHRcdFx0XHRcIk51bGxcIjogbnVsbFxuXHRcdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0dGhpcy5zY29wZSA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLmVsZW1lbnRBZGRyZXNzZXMgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5lbGVtZW50SGFzaGVzID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMuZWxlbWVudERlc2NyaXB0b3JzID0gdW5kZWZpbmVkO1xuXG5cdFx0dGhpcy5yZXNldCgpO1xuXG5cdFx0aWYgKHR5cGVvZihwTWFuaWZlc3QpID09PSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHR0aGlzLmxvYWRNYW5pZmVzdChwTWFuaWZlc3QpO1xuXHRcdH1cblxuXHRcdHRoaXMuc2NoZW1hTWFuaXB1bGF0aW9ucyA9IG5ldyBsaWJTY2hlbWFNYW5pcHVsYXRpb24odGhpcy5sb2dJbmZvLCB0aGlzLmxvZ0Vycm9yKTtcblx0XHR0aGlzLm9iamVjdEFkZHJlc3NHZW5lcmF0aW9uID0gbmV3IGxpYk9iamVjdEFkZHJlc3NHZW5lcmF0aW9uKHRoaXMubG9nSW5mbywgdGhpcy5sb2dFcnJvcik7XG5cblx0XHR0aGlzLmhhc2hUcmFuc2xhdGlvbnMgPSBuZXcgbGliSGFzaFRyYW5zbGF0aW9uKHRoaXMubG9nSW5mbywgdGhpcy5sb2dFcnJvcik7XG5cdH1cblxuXHQvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXHQgKiBTY2hlbWEgTWFuaWZlc3QgTG9hZGluZywgUmVhZGluZywgTWFuaXB1bGF0aW9uIGFuZCBTZXJpYWxpemF0aW9uIEZ1bmN0aW9uc1xuXHQgKi9cblxuXHQvLyBSZXNldCBjcml0aWNhbCBtYW5pZmVzdCBwcm9wZXJ0aWVzXG5cdHJlc2V0KClcblx0e1xuXHRcdHRoaXMuc2NvcGUgPSAnREVGQVVMVCc7XG5cdFx0dGhpcy5lbGVtZW50QWRkcmVzc2VzID0gW107XG5cdFx0dGhpcy5lbGVtZW50SGFzaGVzID0ge307XG5cdFx0dGhpcy5lbGVtZW50RGVzY3JpcHRvcnMgPSB7fTtcblx0fVxuXG5cdGNsb25lKClcblx0e1xuXHRcdC8vIE1ha2UgYSBjb3B5IG9mIHRoZSBvcHRpb25zIGluLXBsYWNlXG5cdFx0bGV0IHRtcE5ld09wdGlvbnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMub3B0aW9ucykpO1xuXG5cdFx0bGV0IHRtcE5ld01hbnlmZXN0ID0gbmV3IE1hbnlmZXN0KHRoaXMuZ2V0TWFuaWZlc3QoKSwgdGhpcy5sb2dJbmZvLCB0aGlzLmxvZ0Vycm9yLCB0bXBOZXdPcHRpb25zKTtcblxuXHRcdC8vIEltcG9ydCB0aGUgaGFzaCB0cmFuc2xhdGlvbnNcblx0XHR0bXBOZXdNYW55ZmVzdC5oYXNoVHJhbnNsYXRpb25zLmFkZFRyYW5zbGF0aW9uKHRoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGlvblRhYmxlKTtcblxuXHRcdHJldHVybiB0bXBOZXdNYW55ZmVzdDtcblx0fVxuXG5cdC8vIERlc2VyaWFsaXplIGEgTWFuaWZlc3QgZnJvbSBhIHN0cmluZ1xuXHRkZXNlcmlhbGl6ZShwTWFuaWZlc3RTdHJpbmcpXG5cdHtcblx0XHQvLyBUT0RPOiBBZGQgZ3VhcmRzIGZvciBiYWQgbWFuaWZlc3Qgc3RyaW5nXG5cdFx0cmV0dXJuIHRoaXMubG9hZE1hbmlmZXN0KEpTT04ucGFyc2UocE1hbmlmZXN0U3RyaW5nKSk7XG5cdH1cblxuXHQvLyBMb2FkIGEgbWFuaWZlc3QgZnJvbSBhbiBvYmplY3Rcblx0bG9hZE1hbmlmZXN0KHBNYW5pZmVzdClcblx0e1xuXHRcdGlmICh0eXBlb2YocE1hbmlmZXN0KSAhPT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2dFcnJvcihgKCR7dGhpcy5zY29wZX0pIEVycm9yIGxvYWRpbmcgbWFuaWZlc3Q7IGV4cGVjdGluZyBhbiBvYmplY3QgYnV0IHBhcmFtZXRlciB3YXMgdHlwZSAke3R5cGVvZihwTWFuaWZlc3QpfS5gKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAocE1hbmlmZXN0Lmhhc093blByb3BlcnR5KCdTY29wZScpKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YocE1hbmlmZXN0LlNjb3BlKSA9PT0gJ3N0cmluZycpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuc2NvcGUgPSBwTWFuaWZlc3QuU2NvcGU7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMubG9nRXJyb3IoYCgke3RoaXMuc2NvcGV9KSBFcnJvciBsb2FkaW5nIHNjb3BlIGZyb20gbWFuaWZlc3Q7IGV4cGVjdGluZyBhIHN0cmluZyBidXQgcHJvcGVydHkgd2FzIHR5cGUgJHt0eXBlb2YocE1hbmlmZXN0LlNjb3BlKX0uYCwgcE1hbmlmZXN0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHRoaXMubG9nRXJyb3IoYCgke3RoaXMuc2NvcGV9KSBFcnJvciBsb2FkaW5nIHNjb3BlIGZyb20gbWFuaWZlc3Qgb2JqZWN0LiAgUHJvcGVydHkgXCJTY29wZVwiIGRvZXMgbm90IGV4aXN0IGluIHRoZSByb290IG9mIHRoZSBvYmplY3QuYCwgcE1hbmlmZXN0KTtcblx0XHR9XG5cblx0XHRpZiAocE1hbmlmZXN0Lmhhc093blByb3BlcnR5KCdEZXNjcmlwdG9ycycpKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YocE1hbmlmZXN0LkRlc2NyaXB0b3JzKSA9PT0gJ29iamVjdCcpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBEZXNjcmlwdGlvbkFkZHJlc3NlcyA9IE9iamVjdC5rZXlzKHBNYW5pZmVzdC5EZXNjcmlwdG9ycyk7XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdG1wRGVzY3JpcHRpb25BZGRyZXNzZXMubGVuZ3RoOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLmFkZERlc2NyaXB0b3IodG1wRGVzY3JpcHRpb25BZGRyZXNzZXNbaV0sIHBNYW5pZmVzdC5EZXNjcmlwdG9yc1t0bXBEZXNjcmlwdGlvbkFkZHJlc3Nlc1tpXV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMubG9nRXJyb3IoYCgke3RoaXMuc2NvcGV9KSBFcnJvciBsb2FkaW5nIGRlc2NyaXB0aW9uIG9iamVjdCBmcm9tIG1hbmlmZXN0IG9iamVjdC4gIEV4cGVjdGluZyBhbiBvYmplY3QgaW4gJ01hbmlmZXN0LkRlc2NyaXB0b3JzJyBidXQgdGhlIHByb3BlcnR5IHdhcyB0eXBlICR7dHlwZW9mKHBNYW5pZmVzdC5EZXNjcmlwdG9ycyl9LmAsIHBNYW5pZmVzdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBvYmplY3QgZGVzY3JpcHRpb24gZnJvbSBtYW5pZmVzdCBvYmplY3QuICBQcm9wZXJ0eSBcIkRlc2NyaXB0b3JzXCIgZG9lcyBub3QgZXhpc3QgaW4gdGhlIHJvb3Qgb2YgdGhlIE1hbmlmZXN0IG9iamVjdC5gLCBwTWFuaWZlc3QpO1xuXHRcdH1cblx0fVxuXG5cdC8vIFNlcmlhbGl6ZSB0aGUgTWFuaWZlc3QgdG8gYSBzdHJpbmdcblx0Ly8gVE9ETzogU2hvdWxkIHRoaXMgYWxzbyBzZXJpYWxpemUgdGhlIHRyYW5zbGF0aW9uIHRhYmxlP1xuXHRzZXJpYWxpemUoKVxuXHR7XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0TWFuaWZlc3QoKSk7XG5cdH1cblxuXHRnZXRNYW5pZmVzdCgpXG5cdHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0e1xuXHRcdFx0XHRTY29wZTogdGhpcy5zY29wZSxcblx0XHRcdFx0RGVzY3JpcHRvcnM6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5lbGVtZW50RGVzY3JpcHRvcnMpKVxuXHRcdFx0fSk7XG5cdH1cblxuXHQvLyBBZGQgYSBkZXNjcmlwdG9yIHRvIHRoZSBtYW5pZmVzdFxuXHRhZGREZXNjcmlwdG9yKHBBZGRyZXNzLCBwRGVzY3JpcHRvcilcblx0e1xuXHRcdGlmICh0eXBlb2YocERlc2NyaXB0b3IpID09PSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHQvLyBBZGQgdGhlIEFkZHJlc3MgaW50byB0aGUgRGVzY3JpcHRvciBpZiBpdCBkb2Vzbid0IGV4aXN0OlxuXHRcdFx0aWYgKCFwRGVzY3JpcHRvci5oYXNPd25Qcm9wZXJ0eSgnQWRkcmVzcycpKVxuXHRcdFx0e1xuXHRcdFx0XHRwRGVzY3JpcHRvci5BZGRyZXNzID0gcEFkZHJlc3M7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghdGhpcy5lbGVtZW50RGVzY3JpcHRvcnMuaGFzT3duUHJvcGVydHkocEFkZHJlc3MpKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmVsZW1lbnRBZGRyZXNzZXMucHVzaChwQWRkcmVzcyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEFkZCB0aGUgZWxlbWVudCBkZXNjcmlwdG9yIHRvIHRoZSBzY2hlbWFcblx0XHRcdHRoaXMuZWxlbWVudERlc2NyaXB0b3JzW3BBZGRyZXNzXSA9IHBEZXNjcmlwdG9yO1xuXG5cdFx0XHQvLyBBbHdheXMgYWRkIHRoZSBhZGRyZXNzIGFzIGEgaGFzaFxuXHRcdFx0dGhpcy5lbGVtZW50SGFzaGVzW3BBZGRyZXNzXSA9IHBBZGRyZXNzO1xuXG5cdFx0XHRpZiAocERlc2NyaXB0b3IuaGFzT3duUHJvcGVydHkoJ0hhc2gnKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gVE9ETzogQ2hlY2sgaWYgdGhpcyBpcyBhIGdvb2QgaWRlYSBvciBub3QuLlxuXHRcdFx0XHQvLyAgICAgICBDb2xsaXNpb25zIGFyZSBib3VuZCB0byBoYXBwZW4gd2l0aCBib3RoIHJlcHJlc2VudGF0aW9ucyBvZiB0aGUgYWRkcmVzcy9oYXNoIGluIGhlcmUgYW5kIGRldmVsb3BlcnMgYmVpbmcgYWJsZSB0byBjcmVhdGUgdGhlaXIgb3duIGhhc2hlcy5cblx0XHRcdFx0dGhpcy5lbGVtZW50SGFzaGVzW3BEZXNjcmlwdG9yLkhhc2hdID0gcEFkZHJlc3M7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHBEZXNjcmlwdG9yLkhhc2ggPSBwQWRkcmVzcztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBvYmplY3QgZGVzY3JpcHRvciBmb3IgYWRkcmVzcyAnJHtwQWRkcmVzc30nIGZyb20gbWFuaWZlc3Qgb2JqZWN0LiAgRXhwZWN0aW5nIGFuIG9iamVjdCBidXQgcHJvcGVydHkgd2FzIHR5cGUgJHt0eXBlb2YocERlc2NyaXB0b3IpfS5gKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XHRcblx0fVxuXG5cdGdldERlc2NyaXB0b3JCeUhhc2gocEhhc2gpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5nZXREZXNjcmlwdG9yKHRoaXMucmVzb2x2ZUhhc2hBZGRyZXNzKHBIYXNoKSk7XG5cdH1cblxuXHRnZXREZXNjcmlwdG9yKHBBZGRyZXNzKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZWxlbWVudERlc2NyaXB0b3JzW3BBZGRyZXNzXTtcblx0fVxuXG5cdC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cdCAqIEJlZ2lubmluZyBvZiBPYmplY3QgTWFuaXB1bGF0aW9uIChyZWFkICYgd3JpdGUpIEZ1bmN0aW9uc1xuXHQgKi9cblx0Ly8gQ2hlY2sgaWYgYW4gZWxlbWVudCBleGlzdHMgYnkgaXRzIGhhc2hcblx0Y2hlY2tBZGRyZXNzRXhpc3RzQnlIYXNoIChwT2JqZWN0LCBwSGFzaClcblx0e1xuXHRcdHJldHVybiB0aGlzLmNoZWNrQWRkcmVzc0V4aXN0cyhwT2JqZWN0LHRoaXMucmVzb2x2ZUhhc2hBZGRyZXNzKHBIYXNoKSk7XG5cdH1cblxuXHQvLyBDaGVjayBpZiBhbiBlbGVtZW50IGV4aXN0cyBhdCBhbiBhZGRyZXNzXG5cdGNoZWNrQWRkcmVzc0V4aXN0cyAocE9iamVjdCwgcEFkZHJlc3MpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5vYmplY3RBZGRyZXNzUmVzb2x2ZXIuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3QsIHBBZGRyZXNzKTtcblx0fVxuXG5cdC8vIFR1cm4gYSBoYXNoIGludG8gYW4gYWRkcmVzcywgZmFjdG9yaW5nIGluIHRoZSB0cmFuc2xhdGlvbiB0YWJsZS5cblx0cmVzb2x2ZUhhc2hBZGRyZXNzKHBIYXNoKVxuXHR7XG5cdFx0bGV0IHRtcEFkZHJlc3MgPSB1bmRlZmluZWQ7XG5cblx0XHRsZXQgdG1wSW5FbGVtZW50SGFzaFRhYmxlID0gdGhpcy5lbGVtZW50SGFzaGVzLmhhc093blByb3BlcnR5KHBIYXNoKTtcblx0XHRsZXQgdG1wSW5UcmFuc2xhdGlvblRhYmxlID0gdGhpcy5oYXNoVHJhbnNsYXRpb25zLnRyYW5zbGF0aW9uVGFibGUuaGFzT3duUHJvcGVydHkocEhhc2gpO1xuXG5cdFx0Ly8gVGhlIG1vc3Qgc3RyYWlnaHRmb3J3YXJkOiB0aGUgaGFzaCBleGlzdHMsIG5vIHRyYW5zbGF0aW9ucy5cblx0XHRpZiAodG1wSW5FbGVtZW50SGFzaFRhYmxlICYmICF0bXBJblRyYW5zbGF0aW9uVGFibGUpXG5cdFx0e1xuXHRcdFx0dG1wQWRkcmVzcyA9IHRoaXMuZWxlbWVudEhhc2hlc1twSGFzaF07XG5cdFx0fVxuXHRcdC8vIFRoZXJlIGlzIGEgdHJhbnNsYXRpb24gZnJvbSBvbmUgaGFzaCB0byBhbm90aGVyLCBhbmQsIHRoZSBlbGVtZW50SGFzaGVzIGNvbnRhaW5zIHRoZSBwb2ludGVyIGVuZFxuXHRcdGVsc2UgaWYgKHRtcEluVHJhbnNsYXRpb25UYWJsZSAmJiB0aGlzLmVsZW1lbnRIYXNoZXMuaGFzT3duUHJvcGVydHkodGhpcy5oYXNoVHJhbnNsYXRpb25zLnRyYW5zbGF0ZShwSGFzaCkpKVxuXHRcdHtcblx0XHRcdHRtcEFkZHJlc3MgPSB0aGlzLmVsZW1lbnRIYXNoZXNbdGhpcy5oYXNoVHJhbnNsYXRpb25zLnRyYW5zbGF0ZShwSGFzaCldO1xuXHRcdH1cblx0XHQvLyBVc2UgdGhlIGxldmVsIG9mIGluZGlyZWN0aW9uIG9ubHkgaW4gdGhlIFRyYW5zbGF0aW9uIFRhYmxlIFxuXHRcdGVsc2UgaWYgKHRtcEluVHJhbnNsYXRpb25UYWJsZSlcblx0XHR7XG5cdFx0XHR0bXBBZGRyZXNzID0gdGhpcy5oYXNoVHJhbnNsYXRpb25zLnRyYW5zbGF0ZShwSGFzaCk7XG5cdFx0fVxuXHRcdC8vIEp1c3QgdHJlYXQgdGhlIGhhc2ggYXMgYW4gYWRkcmVzcy5cblx0XHQvLyBUT0RPOiBEaXNjdXNzIHRoaXMgLi4uIGl0IGlzIG1hZ2ljIGJ1dCBjb250cm92ZXJzaWFsXG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHRtcEFkZHJlc3MgPSBwSGFzaDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdG1wQWRkcmVzcztcblx0fVxuXG5cdC8vIEdldCB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBieSBpdHMgaGFzaFxuXHRnZXRWYWx1ZUJ5SGFzaCAocE9iamVjdCwgcEhhc2gpXG5cdHtcblx0XHRsZXQgdG1wVmFsdWUgPSB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3QsIHRoaXMucmVzb2x2ZUhhc2hBZGRyZXNzKHBIYXNoKSk7XG5cblx0XHRpZiAodHlwZW9mKHRtcFZhbHVlKSA9PSAndW5kZWZpbmVkJylcblx0XHR7XG5cdFx0XHQvLyBUcnkgdG8gZ2V0IGEgZGVmYXVsdCBpZiBpdCBleGlzdHNcblx0XHRcdHRtcFZhbHVlID0gdGhpcy5nZXREZWZhdWx0VmFsdWUodGhpcy5nZXREZXNjcmlwdG9yQnlIYXNoKHBIYXNoKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRtcFZhbHVlO1xuXHR9XG5cblx0Ly8gR2V0IHRoZSB2YWx1ZSBvZiBhbiBlbGVtZW50IGF0IGFuIGFkZHJlc3Ncblx0Z2V0VmFsdWVBdEFkZHJlc3MgKHBPYmplY3QsIHBBZGRyZXNzKVxuXHR7XG5cdFx0bGV0IHRtcFZhbHVlID0gdGhpcy5vYmplY3RBZGRyZXNzUmVzb2x2ZXIuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdCwgcEFkZHJlc3MpO1xuXG5cdFx0aWYgKHR5cGVvZih0bXBWYWx1ZSkgPT0gJ3VuZGVmaW5lZCcpXG5cdFx0e1xuXHRcdFx0Ly8gVHJ5IHRvIGdldCBhIGRlZmF1bHQgaWYgaXQgZXhpc3RzXG5cdFx0XHR0bXBWYWx1ZSA9IHRoaXMuZ2V0RGVmYXVsdFZhbHVlKHRoaXMuZ2V0RGVzY3JpcHRvcihwQWRkcmVzcykpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0bXBWYWx1ZTtcblx0fVxuXG5cdC8vIFNldCB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBieSBpdHMgaGFzaFxuXHRzZXRWYWx1ZUJ5SGFzaChwT2JqZWN0LCBwSGFzaCwgcFZhbHVlKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuc2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdCwgdGhpcy5yZXNvbHZlSGFzaEFkZHJlc3MocEhhc2gpLCBwVmFsdWUpO1xuXHR9XG5cblxuXHQvLyBTZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYXQgYW4gYWRkcmVzc1xuXHRzZXRWYWx1ZUF0QWRkcmVzcyAocE9iamVjdCwgcEFkZHJlc3MsIHBWYWx1ZSlcblx0e1xuXHRcdHJldHVybiB0aGlzLm9iamVjdEFkZHJlc3NSZXNvbHZlci5zZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0LCBwQWRkcmVzcywgcFZhbHVlKTtcblx0fVxuXG5cdC8vIFZhbGlkYXRlIHRoZSBjb25zaXN0ZW5jeSBvZiBhbiBvYmplY3QgYWdhaW5zdCB0aGUgc2NoZW1hXG5cdHZhbGlkYXRlKHBPYmplY3QpXG5cdHtcblx0XHRsZXQgdG1wVmFsaWRhdGlvbkRhdGEgPVxuXHRcdHtcblx0XHRcdEVycm9yOiBudWxsLFxuXHRcdFx0RXJyb3JzOiBbXSxcblx0XHRcdE1pc3NpbmdFbGVtZW50czpbXVxuXHRcdH07XG5cblx0XHRpZiAodHlwZW9mKHBPYmplY3QpICE9PSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHR0bXBWYWxpZGF0aW9uRGF0YS5FcnJvciA9IHRydWU7XG5cdFx0XHR0bXBWYWxpZGF0aW9uRGF0YS5FcnJvcnMucHVzaChgRXhwZWN0ZWQgcGFzc2VkIGluIG9iamVjdCB0byBiZSB0eXBlIG9iamVjdCBidXQgd2FzIHBhc3NlZCBpbiAke3R5cGVvZihwT2JqZWN0KX1gKTtcblx0XHR9XG5cblx0XHRsZXQgYWRkVmFsaWRhdGlvbkVycm9yID0gKHBBZGRyZXNzLCBwRXJyb3JNZXNzYWdlKSA9PlxuXHRcdHtcblx0XHRcdHRtcFZhbGlkYXRpb25EYXRhLkVycm9yID0gdHJ1ZTtcblx0XHRcdHRtcFZhbGlkYXRpb25EYXRhLkVycm9ycy5wdXNoKGBFbGVtZW50IGF0IGFkZHJlc3MgXCIke3BBZGRyZXNzfVwiICR7cEVycm9yTWVzc2FnZX0uYCk7XG5cdFx0fTtcblxuXHRcdC8vIE5vdyBlbnVtZXJhdGUgdGhyb3VnaCB0aGUgdmFsdWVzIGFuZCBjaGVjayBmb3IgYW5vbWFsaWVzIGJhc2VkIG9uIHRoZSBzY2hlbWFcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZWxlbWVudEFkZHJlc3Nlcy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRsZXQgdG1wRGVzY3JpcHRvciA9IHRoaXMuZ2V0RGVzY3JpcHRvcih0aGlzLmVsZW1lbnRBZGRyZXNzZXNbaV0pO1xuXHRcdFx0bGV0IHRtcFZhbHVlRXhpc3RzID0gdGhpcy5jaGVja0FkZHJlc3NFeGlzdHMocE9iamVjdCwgdG1wRGVzY3JpcHRvci5BZGRyZXNzKTtcblx0XHRcdGxldCB0bXBWYWx1ZSA9IHRoaXMuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdCwgdG1wRGVzY3JpcHRvci5BZGRyZXNzKTtcblxuXHRcdFx0aWYgKCh0eXBlb2YodG1wVmFsdWUpID09ICd1bmRlZmluZWQnKSB8fCAhdG1wVmFsdWVFeGlzdHMpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRoaXMgd2lsbCB0ZWNobmljYWxseSBtZWFuIHRoYXQgYE9iamVjdC5Tb21lLlZhbHVlID0gdW5kZWZpbmVkYCB3aWxsIGVuZCB1cCBzaG93aW5nIGFzIFwibWlzc2luZ1wiXG5cdFx0XHRcdC8vIFRPRE86IERvIHdlIHdhbnQgdG8gZG8gYSBkaWZmZXJlbnQgbWVzc2FnZSBiYXNlZCBvbiBpZiB0aGUgcHJvcGVydHkgZXhpc3RzIGJ1dCBpcyB1bmRlZmluZWQ/XG5cdFx0XHRcdHRtcFZhbGlkYXRpb25EYXRhLk1pc3NpbmdFbGVtZW50cy5wdXNoKHRtcERlc2NyaXB0b3IuQWRkcmVzcyk7XG5cdFx0XHRcdGlmICh0bXBEZXNjcmlwdG9yLlJlcXVpcmVkIHx8IHRoaXMub3B0aW9ucy5zdHJpY3QpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCAnaXMgZmxhZ2dlZCBSRVFVSVJFRCBidXQgaXMgbm90IHNldCBpbiB0aGUgb2JqZWN0Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gTm93IHNlZSBpZiB0aGVyZSBpcyBhIGRhdGEgdHlwZSBzcGVjaWZpZWQgZm9yIHRoaXMgZWxlbWVudFxuXHRcdFx0aWYgKHRtcERlc2NyaXB0b3IuRGF0YVR5cGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBFbGVtZW50VHlwZSA9IHR5cGVvZih0bXBWYWx1ZSk7XG5cdFx0XHRcdHN3aXRjaCh0bXBEZXNjcmlwdG9yLkRhdGFUeXBlLnRvU3RyaW5nKCkudHJpbSgpLnRvTG93ZXJDYXNlKCkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYXNlICdzdHJpbmcnOlxuXHRcdFx0XHRcdFx0aWYgKHRtcEVsZW1lbnRUeXBlICE9ICdzdHJpbmcnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCBgaGFzIGEgRGF0YVR5cGUgJHt0bXBEZXNjcmlwdG9yLkRhdGFUeXBlfSBidXQgaXMgb2YgdGhlIHR5cGUgJHt0bXBFbGVtZW50VHlwZX1gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSAnbnVtYmVyJzpcblx0XHRcdFx0XHRcdGlmICh0bXBFbGVtZW50VHlwZSAhPSAnbnVtYmVyJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGlzIG9mIHRoZSB0eXBlICR7dG1wRWxlbWVudFR5cGV9YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgJ2ludGVnZXInOlxuXHRcdFx0XHRcdFx0aWYgKHRtcEVsZW1lbnRUeXBlICE9ICdudW1iZXInKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCBgaGFzIGEgRGF0YVR5cGUgJHt0bXBEZXNjcmlwdG9yLkRhdGFUeXBlfSBidXQgaXMgb2YgdGhlIHR5cGUgJHt0bXBFbGVtZW50VHlwZX1gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IHRtcFZhbHVlU3RyaW5nID0gdG1wVmFsdWUudG9TdHJpbmcoKTtcblx0XHRcdFx0XHRcdFx0aWYgKHRtcFZhbHVlU3RyaW5nLmluZGV4T2YoJy4nKSA+IC0xKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gVE9ETzogSXMgdGhpcyBhbiBlcnJvcj9cblx0XHRcdFx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCBgaGFzIGEgRGF0YVR5cGUgJHt0bXBEZXNjcmlwdG9yLkRhdGFUeXBlfSBidXQgaGFzIGEgZGVjaW1hbCBwb2ludCBpbiB0aGUgbnVtYmVyLmApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgJ2Zsb2F0Jzpcblx0XHRcdFx0XHRcdGlmICh0bXBFbGVtZW50VHlwZSAhPSAnbnVtYmVyJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGlzIG9mIHRoZSB0eXBlICR7dG1wRWxlbWVudFR5cGV9YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgJ0RhdGVUaW1lJzpcblx0XHRcdFx0XHRcdGxldCB0bXBWYWx1ZURhdGUgPSBuZXcgRGF0ZSh0bXBWYWx1ZSk7XG5cdFx0XHRcdFx0XHRpZiAodG1wVmFsdWVEYXRlLnRvU3RyaW5nKCkgPT0gJ0ludmFsaWQgRGF0ZScpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsIGBoYXMgYSBEYXRhVHlwZSAke3RtcERlc2NyaXB0b3IuRGF0YVR5cGV9IGJ1dCBpcyBub3QgcGFyc2FibGUgYXMgYSBEYXRlIGJ5IEphdmFzY3JpcHRgKTtcblx0XHRcdFx0XHRcdH1cblx0XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdC8vIENoZWNrIGlmIHRoaXMgaXMgYSBzdHJpbmcsIGluIHRoZSBkZWZhdWx0IGNhc2Vcblx0XHRcdFx0XHRcdC8vIE5vdGUgdGhpcyBpcyBvbmx5IHdoZW4gYSBEYXRhVHlwZSBpcyBzcGVjaWZpZWQgYW5kIGl0IGlzIGFuIHVucmVjb2duaXplZCBkYXRhIHR5cGUuXG5cdFx0XHRcdFx0XHRpZiAodG1wRWxlbWVudFR5cGUgIT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsIGBoYXMgYSBEYXRhVHlwZSAke3RtcERlc2NyaXB0b3IuRGF0YVR5cGV9ICh3aGljaCBhdXRvLWNvbnZlcnRlZCB0byBTdHJpbmcgYmVjYXVzZSBpdCB3YXMgdW5yZWNvZ25pemVkKSBidXQgaXMgb2YgdGhlIHR5cGUgJHt0bXBFbGVtZW50VHlwZX1gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRtcFZhbGlkYXRpb25EYXRhO1xuXHR9XG5cblx0Ly8gUmV0dXJucyBhIGRlZmF1bHQgdmFsdWUsIG9yLCB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhlIGRhdGEgdHlwZSAod2hpY2ggaXMgb3ZlcnJpZGFibGUgd2l0aCBjb25maWd1cmF0aW9uKVxuXHRnZXREZWZhdWx0VmFsdWUocERlc2NyaXB0b3IpXG5cdHtcblx0XHRpZiAodHlwZW9mKHBEZXNjcmlwdG9yKSAhPSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGlmIChwRGVzY3JpcHRvci5oYXNPd25Qcm9wZXJ0eSgnRGVmYXVsdCcpKVxuXHRcdHtcblx0XHRcdHJldHVybiBwRGVzY3JpcHRvci5EZWZhdWx0O1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Ly8gRGVmYXVsdCB0byBhIG51bGwgaWYgaXQgZG9lc24ndCBoYXZlIGEgdHlwZSBzcGVjaWZpZWQuXG5cdFx0XHQvLyBUaGlzIHdpbGwgZW5zdXJlIGEgcGxhY2Vob2xkZXIgaXMgY3JlYXRlZCBidXQgaXNuJ3QgbWlzaW50ZXJwcmV0ZWQuXG5cdFx0XHRsZXQgdG1wRGF0YVR5cGUgPSAocERlc2NyaXB0b3IuaGFzT3duUHJvcGVydHkoJ0RhdGFUeXBlJykpID8gcERlc2NyaXB0b3IuRGF0YVR5cGUgOiAnU3RyaW5nJztcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMuZGVmYXVsdFZhbHVlcy5oYXNPd25Qcm9wZXJ0eSh0bXBEYXRhVHlwZSkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnMuZGVmYXVsdFZhbHVlc1t0bXBEYXRhVHlwZV07XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIGdpdmUgdXAgYW5kIHJldHVybiBudWxsXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIEVudW1lcmF0ZSB0aHJvdWdoIHRoZSBzY2hlbWEgYW5kIHBvcHVsYXRlIGRlZmF1bHQgdmFsdWVzIGlmIHRoZXkgZG9uJ3QgZXhpc3QuXG5cdHBvcHVsYXRlRGVmYXVsdHMocE9iamVjdCwgcE92ZXJ3cml0ZVByb3BlcnRpZXMpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5wb3B1bGF0ZU9iamVjdChwT2JqZWN0LCBwT3ZlcndyaXRlUHJvcGVydGllcyxcblx0XHRcdC8vIFRoaXMganVzdCBzZXRzIHVwIGEgc2ltcGxlIGZpbHRlciB0byBzZWUgaWYgdGhlcmUgaXMgYSBkZWZhdWx0IHNldC5cblx0XHRcdChwRGVzY3JpcHRvcikgPT5cblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHBEZXNjcmlwdG9yLmhhc093blByb3BlcnR5KCdEZWZhdWx0Jyk7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8vIEZvcmNlZnVsbHkgcG9wdWxhdGUgYWxsIHZhbHVlcyBldmVuIGlmIHRoZXkgZG9uJ3QgaGF2ZSBkZWZhdWx0cy5cblx0Ly8gQmFzZWQgb24gdHlwZSwgdGhpcyBjYW4gZG8gdW5leHBlY3RlZCB0aGluZ3MuXG5cdHBvcHVsYXRlT2JqZWN0KHBPYmplY3QsIHBPdmVyd3JpdGVQcm9wZXJ0aWVzLCBmRmlsdGVyKVxuXHR7XG5cdFx0Ly8gQXV0b21hdGljYWxseSBjcmVhdGUgYW4gb2JqZWN0IGlmIG9uZSBpc24ndCBwYXNzZWQgaW4uXG5cdFx0bGV0IHRtcE9iamVjdCA9ICh0eXBlb2YocE9iamVjdCkgPT09ICdvYmplY3QnKSA/IHBPYmplY3QgOiB7fTtcblx0XHQvLyBEZWZhdWx0IHRvICpOT1QgT1ZFUldSSVRJTkcqIHByb3BlcnRpZXNcblx0XHRsZXQgdG1wT3ZlcndyaXRlUHJvcGVydGllcyA9ICh0eXBlb2YocE92ZXJ3cml0ZVByb3BlcnRpZXMpID09ICd1bmRlZmluZWQnKSA/IGZhbHNlIDogcE92ZXJ3cml0ZVByb3BlcnRpZXM7XG5cdFx0Ly8gVGhpcyBpcyBhIGZpbHRlciBmdW5jdGlvbiwgd2hpY2ggaXMgcGFzc2VkIHRoZSBzY2hlbWEgYW5kIGFsbG93cyBjb21wbGV4IGZpbHRlcmluZyBvZiBwb3B1bGF0aW9uXG5cdFx0Ly8gVGhlIGRlZmF1bHQgZmlsdGVyIGZ1bmN0aW9uIGp1c3QgcmV0dXJucyB0cnVlLCBwb3B1bGF0aW5nIGV2ZXJ5dGhpbmcuXG5cdFx0bGV0IHRtcEZpbHRlckZ1bmN0aW9uID0gKHR5cGVvZihmRmlsdGVyKSA9PSAnZnVuY3Rpb24nKSA/IGZGaWx0ZXIgOiAocERlc2NyaXB0b3IpID0+IHsgcmV0dXJuIHRydWU7IH07XG5cblx0XHR0aGlzLmVsZW1lbnRBZGRyZXNzZXMuZm9yRWFjaChcblx0XHRcdChwQWRkcmVzcykgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcERlc2NyaXB0b3IgPSB0aGlzLmdldERlc2NyaXB0b3IocEFkZHJlc3MpO1xuXHRcdFx0XHQvLyBDaGVjayB0aGUgZmlsdGVyIGZ1bmN0aW9uIHRvIHNlZSBpZiB0aGlzIGlzIGFuIGFkZHJlc3Mgd2Ugd2FudCB0byBzZXQgdGhlIHZhbHVlIGZvci5cblx0XHRcdFx0aWYgKHRtcEZpbHRlckZ1bmN0aW9uKHRtcERlc2NyaXB0b3IpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gSWYgd2UgYXJlIG92ZXJ3cml0aW5nIHByb3BlcnRpZXMgT1IgdGhlIHByb3BlcnR5IGRvZXMgbm90IGV4aXN0XG5cdFx0XHRcdFx0aWYgKHRtcE92ZXJ3cml0ZVByb3BlcnRpZXMgfHwgIXRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHRtcE9iamVjdCwgcEFkZHJlc3MpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRoaXMuc2V0VmFsdWVBdEFkZHJlc3ModG1wT2JqZWN0LCBwQWRkcmVzcywgdGhpcy5nZXREZWZhdWx0VmFsdWUodG1wRGVzY3JpcHRvcikpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gdG1wT2JqZWN0O1xuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnlmZXN0OyIsIi8qKlxuKiBQcmVjZWRlbnQgTWV0YS1UZW1wbGF0aW5nXG4qXG4qIEBsaWNlbnNlICAgICBNSVRcbipcbiogQGF1dGhvciAgICAgIFN0ZXZlbiBWZWxvem8gPHN0ZXZlbkB2ZWxvem8uY29tPlxuKlxuKiBAZGVzY3JpcHRpb24gUHJvY2VzcyB0ZXh0IHN0cmVhbXMsIHBhcnNpbmcgb3V0IG1ldGEtdGVtcGxhdGUgZXhwcmVzc2lvbnMuXG4qL1xudmFyIGxpYldvcmRUcmVlID0gcmVxdWlyZShgLi9Xb3JkVHJlZS5qc2ApO1xudmFyIGxpYlN0cmluZ1BhcnNlciA9IHJlcXVpcmUoYC4vU3RyaW5nUGFyc2VyLmpzYCk7XG5cbmNsYXNzIFByZWNlZGVudFxue1xuXHQvKipcblx0ICogUHJlY2VkZW50IENvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHR0aGlzLldvcmRUcmVlID0gbmV3IGxpYldvcmRUcmVlKCk7XG5cdFx0XG5cdFx0dGhpcy5TdHJpbmdQYXJzZXIgPSBuZXcgbGliU3RyaW5nUGFyc2VyKCk7XG5cblx0XHR0aGlzLlBhcnNlVHJlZSA9IHRoaXMuV29yZFRyZWUuUGFyc2VUcmVlO1xuXHR9XG5cdFxuXHQvKipcblx0ICogQWRkIGEgUGF0dGVybiB0byB0aGUgUGFyc2UgVHJlZVxuXHQgKiBAbWV0aG9kIGFkZFBhdHRlcm5cblx0ICogQHBhcmFtIHtPYmplY3R9IHBUcmVlIC0gQSBub2RlIG9uIHRoZSBwYXJzZSB0cmVlIHRvIHB1c2ggdGhlIGNoYXJhY3RlcnMgaW50b1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gcFBhdHRlcm4gLSBUaGUgc3RyaW5nIHRvIGFkZCB0byB0aGUgdHJlZVxuXHQgKiBAcGFyYW0ge251bWJlcn0gcEluZGV4IC0gY2FsbGJhY2sgZnVuY3Rpb25cblx0ICogQHJldHVybiB7Ym9vbH0gVHJ1ZSBpZiBhZGRpbmcgdGhlIHBhdHRlcm4gd2FzIHN1Y2Nlc3NmdWxcblx0ICovXG5cdGFkZFBhdHRlcm4ocFBhdHRlcm5TdGFydCwgcFBhdHRlcm5FbmQsIHBQYXJzZXIpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5Xb3JkVHJlZS5hZGRQYXR0ZXJuKHBQYXR0ZXJuU3RhcnQsIHBQYXR0ZXJuRW5kLCBwUGFyc2VyKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFBhcnNlIGEgc3RyaW5nIHdpdGggdGhlIGV4aXN0aW5nIHBhcnNlIHRyZWVcblx0ICogQG1ldGhvZCBwYXJzZVN0cmluZ1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gcFN0cmluZyAtIFRoZSBzdHJpbmcgdG8gcGFyc2Vcblx0ICogQHJldHVybiB7c3RyaW5nfSBUaGUgcmVzdWx0IGZyb20gdGhlIHBhcnNlclxuXHQgKi9cblx0cGFyc2VTdHJpbmcocFN0cmluZylcblx0e1xuXHRcdHJldHVybiB0aGlzLlN0cmluZ1BhcnNlci5wYXJzZVN0cmluZyhwU3RyaW5nLCB0aGlzLlBhcnNlVHJlZSk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcmVjZWRlbnQ7XG4iLCIvKipcbiogU3RyaW5nIFBhcnNlclxuKlxuKiBAbGljZW5zZSAgICAgTUlUXG4qXG4qIEBhdXRob3IgICAgICBTdGV2ZW4gVmVsb3pvIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbipcbiogQGRlc2NyaXB0aW9uIFBhcnNlIGEgc3RyaW5nLCBwcm9wZXJseSBwcm9jZXNzaW5nIGVhY2ggbWF0Y2hlZCB0b2tlbiBpbiB0aGUgd29yZCB0cmVlLlxuKi9cblxuY2xhc3MgU3RyaW5nUGFyc2VyXG57XG5cdC8qKlxuXHQgKiBTdHJpbmdQYXJzZXIgQ29uc3RydWN0b3Jcblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHR9XG5cdFxuXHQvKipcblx0ICogQ3JlYXRlIGEgZnJlc2ggcGFyc2luZyBzdGF0ZSBvYmplY3QgdG8gd29yayB3aXRoLlxuXHQgKiBAbWV0aG9kIG5ld1BhcnNlclN0YXRlXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwUGFyc2VUcmVlIC0gQSBub2RlIG9uIHRoZSBwYXJzZSB0cmVlIHRvIGJlZ2luIHBhcnNpbmcgZnJvbSAodXN1YWxseSByb290KVxuXHQgKiBAcmV0dXJuIHtPYmplY3R9IEEgbmV3IHBhcnNlciBzdGF0ZSBvYmplY3QgZm9yIHJ1bm5pbmcgYSBjaGFyYWN0ZXIgcGFyc2VyIG9uXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRuZXdQYXJzZXJTdGF0ZSAocFBhcnNlVHJlZSlcblx0e1xuXHRcdHJldHVybiAoXG5cdFx0e1xuXHRcdCAgICBQYXJzZVRyZWU6IHBQYXJzZVRyZWUsXG5cblx0XHRcdE91dHB1dDogJycsXG5cdFx0XHRPdXRwdXRCdWZmZXI6ICcnLFxuXG5cdFx0XHRQYXR0ZXJuOiBmYWxzZSxcblxuXHRcdFx0UGF0dGVybk1hdGNoOiBmYWxzZSxcblx0XHRcdFBhdHRlcm5NYXRjaE91dHB1dEJ1ZmZlcjogJydcblx0XHR9KTtcblx0fVxuXHRcdFxuXHQvKipcblx0ICogQXNzaWduIGEgbm9kZSBvZiB0aGUgcGFyc2VyIHRyZWUgdG8gYmUgdGhlIG5leHQgcG90ZW50aWFsIG1hdGNoLlxuXHQgKiBJZiB0aGUgbm9kZSBoYXMgYSBQYXR0ZXJuRW5kIHByb3BlcnR5LCBpdCBpcyBhIHZhbGlkIG1hdGNoIGFuZCBzdXBlcmNlZGVzIHRoZSBsYXN0IHZhbGlkIG1hdGNoIChvciBiZWNvbWVzIHRoZSBpbml0aWFsIG1hdGNoKS5cblx0ICogQG1ldGhvZCBhc3NpZ25Ob2RlXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwTm9kZSAtIEEgbm9kZSBvbiB0aGUgcGFyc2UgdHJlZSB0byBhc3NpZ25cblx0ICogQHBhcmFtIHtPYmplY3R9IHBQYXJzZXJTdGF0ZSAtIFRoZSBzdGF0ZSBvYmplY3QgZm9yIHRoZSBjdXJyZW50IHBhcnNpbmcgdGFza1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YXNzaWduTm9kZSAocE5vZGUsIHBQYXJzZXJTdGF0ZSlcblx0e1xuXHRcdHBQYXJzZXJTdGF0ZS5QYXR0ZXJuTWF0Y2ggPSBwTm9kZTtcblxuXHRcdC8vIElmIHRoZSBwYXR0ZXJuIGhhcyBhIEVORCB3ZSBjYW4gYXNzdW1lIGl0IGhhcyBhIHBhcnNlIGZ1bmN0aW9uLi4uXG5cdFx0aWYgKHBQYXJzZXJTdGF0ZS5QYXR0ZXJuTWF0Y2guaGFzT3duUHJvcGVydHkoJ1BhdHRlcm5FbmQnKSlcblx0XHR7XG5cdFx0XHQvLyAuLi4gdGhpcyBpcyB0aGUgbGVnaXRpbWF0ZSBzdGFydCBvZiBhIHBhdHRlcm4uXG5cdFx0XHRwUGFyc2VyU3RhdGUuUGF0dGVybiA9IHBQYXJzZXJTdGF0ZS5QYXR0ZXJuTWF0Y2g7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogQXBwZW5kIGEgY2hhcmFjdGVyIHRvIHRoZSBvdXRwdXQgYnVmZmVyIGluIHRoZSBwYXJzZXIgc3RhdGUuXG5cdCAqIFRoaXMgb3V0cHV0IGJ1ZmZlciBpcyB1c2VkIHdoZW4gYSBwb3RlbnRpYWwgbWF0Y2ggaXMgYmVpbmcgZXhwbG9yZWQsIG9yIGEgbWF0Y2ggaXMgYmVpbmcgZXhwbG9yZWQuXG5cdCAqIEBtZXRob2QgYXBwZW5kT3V0cHV0QnVmZmVyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwQ2hhcmFjdGVyIC0gVGhlIGNoYXJhY3RlciB0byBhcHBlbmRcblx0ICogQHBhcmFtIHtPYmplY3R9IHBQYXJzZXJTdGF0ZSAtIFRoZSBzdGF0ZSBvYmplY3QgZm9yIHRoZSBjdXJyZW50IHBhcnNpbmcgdGFza1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YXBwZW5kT3V0cHV0QnVmZmVyIChwQ2hhcmFjdGVyLCBwUGFyc2VyU3RhdGUpXG5cdHtcblx0XHRwUGFyc2VyU3RhdGUuT3V0cHV0QnVmZmVyICs9IHBDaGFyYWN0ZXI7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBGbHVzaCB0aGUgb3V0cHV0IGJ1ZmZlciB0byB0aGUgb3V0cHV0IGFuZCBjbGVhciBpdC5cblx0ICogQG1ldGhvZCBmbHVzaE91dHB1dEJ1ZmZlclxuXHQgKiBAcGFyYW0ge09iamVjdH0gcFBhcnNlclN0YXRlIC0gVGhlIHN0YXRlIG9iamVjdCBmb3IgdGhlIGN1cnJlbnQgcGFyc2luZyB0YXNrXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmbHVzaE91dHB1dEJ1ZmZlciAocFBhcnNlclN0YXRlKVxuXHR7XG5cdFx0cFBhcnNlclN0YXRlLk91dHB1dCArPSBwUGFyc2VyU3RhdGUuT3V0cHV0QnVmZmVyO1xuXHRcdHBQYXJzZXJTdGF0ZS5PdXRwdXRCdWZmZXIgPSAnJztcblx0fVxuXG5cdFxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIHBhdHRlcm4gaGFzIGVuZGVkLiAgSWYgaXQgaGFzLCBwcm9wZXJseSBmbHVzaCB0aGUgYnVmZmVyIGFuZCBzdGFydCBsb29raW5nIGZvciBuZXcgcGF0dGVybnMuXG5cdCAqIEBtZXRob2QgY2hlY2tQYXR0ZXJuRW5kXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwUGFyc2VyU3RhdGUgLSBUaGUgc3RhdGUgb2JqZWN0IGZvciB0aGUgY3VycmVudCBwYXJzaW5nIHRhc2tcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGNoZWNrUGF0dGVybkVuZCAocFBhcnNlclN0YXRlKVxuXHR7XG5cdFx0aWYgKChwUGFyc2VyU3RhdGUuT3V0cHV0QnVmZmVyLmxlbmd0aCA+PSBwUGFyc2VyU3RhdGUuUGF0dGVybi5QYXR0ZXJuRW5kLmxlbmd0aCtwUGFyc2VyU3RhdGUuUGF0dGVybi5QYXR0ZXJuU3RhcnQubGVuZ3RoKSAmJiBcblx0XHRcdChwUGFyc2VyU3RhdGUuT3V0cHV0QnVmZmVyLnN1YnN0cigtcFBhcnNlclN0YXRlLlBhdHRlcm4uUGF0dGVybkVuZC5sZW5ndGgpID09PSBwUGFyc2VyU3RhdGUuUGF0dGVybi5QYXR0ZXJuRW5kKSlcblx0XHR7XG5cdFx0XHQvLyAuLi4gdGhpcyBpcyB0aGUgZW5kIG9mIGEgcGF0dGVybiwgY3V0IG9mZiB0aGUgZW5kIHRhZyBhbmQgcGFyc2UgaXQuXG5cdFx0XHQvLyBUcmltIHRoZSBzdGFydCBhbmQgZW5kIHRhZ3Mgb2ZmIHRoZSBvdXRwdXQgYnVmZmVyIG5vd1xuXHRcdFx0cFBhcnNlclN0YXRlLk91dHB1dEJ1ZmZlciA9IHBQYXJzZXJTdGF0ZS5QYXR0ZXJuLlBhcnNlKHBQYXJzZXJTdGF0ZS5PdXRwdXRCdWZmZXIuc3Vic3RyKHBQYXJzZXJTdGF0ZS5QYXR0ZXJuLlBhdHRlcm5TdGFydC5sZW5ndGgsIHBQYXJzZXJTdGF0ZS5PdXRwdXRCdWZmZXIubGVuZ3RoIC0gKHBQYXJzZXJTdGF0ZS5QYXR0ZXJuLlBhdHRlcm5TdGFydC5sZW5ndGgrcFBhcnNlclN0YXRlLlBhdHRlcm4uUGF0dGVybkVuZC5sZW5ndGgpKSk7XG5cdFx0XHQvLyBGbHVzaCB0aGUgb3V0cHV0IGJ1ZmZlci5cblx0XHRcdHRoaXMuZmx1c2hPdXRwdXRCdWZmZXIocFBhcnNlclN0YXRlKTtcblx0XHRcdC8vIEVuZCBwYXR0ZXJuIG1vZGVcblx0XHRcdHBQYXJzZXJTdGF0ZS5QYXR0ZXJuID0gZmFsc2U7XG5cdFx0XHRwUGFyc2VyU3RhdGUuUGF0dGVybk1hdGNoID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogUGFyc2UgYSBjaGFyYWN0ZXIgaW4gdGhlIGJ1ZmZlci5cblx0ICogQG1ldGhvZCBwYXJzZUNoYXJhY3RlclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gcENoYXJhY3RlciAtIFRoZSBjaGFyYWN0ZXIgdG8gYXBwZW5kXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwUGFyc2VyU3RhdGUgLSBUaGUgc3RhdGUgb2JqZWN0IGZvciB0aGUgY3VycmVudCBwYXJzaW5nIHRhc2tcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHBhcnNlQ2hhcmFjdGVyIChwQ2hhcmFjdGVyLCBwUGFyc2VyU3RhdGUpXG5cdHtcblx0XHQvLyAoMSkgSWYgd2UgYXJlbid0IGluIGEgcGF0dGVybiBtYXRjaCwgYW5kIHdlIGFyZW4ndCBwb3RlbnRpYWxseSBtYXRjaGluZywgYW5kIHRoaXMgbWF5IGJlIHRoZSBzdGFydCBvZiBhIG5ldyBwYXR0ZXJuLi4uLlxuXHRcdGlmICghcFBhcnNlclN0YXRlLlBhdHRlcm5NYXRjaCAmJiBwUGFyc2VyU3RhdGUuUGFyc2VUcmVlLmhhc093blByb3BlcnR5KHBDaGFyYWN0ZXIpKVxuXHRcdHtcblx0XHRcdC8vIC4uLiBhc3NpZ24gdGhlIG5vZGUgYXMgdGhlIG1hdGNoZWQgbm9kZS5cblx0XHRcdHRoaXMuYXNzaWduTm9kZShwUGFyc2VyU3RhdGUuUGFyc2VUcmVlW3BDaGFyYWN0ZXJdLCBwUGFyc2VyU3RhdGUpO1xuXHRcdFx0dGhpcy5hcHBlbmRPdXRwdXRCdWZmZXIocENoYXJhY3RlciwgcFBhcnNlclN0YXRlKTtcblx0XHR9XG5cdFx0Ly8gKDIpIElmIHdlIGFyZSBpbiBhIHBhdHRlcm4gbWF0Y2ggKGFjdGl2ZWx5IHNlZWluZyBpZiB0aGlzIGlzIHBhcnQgb2YgYSBuZXcgcGF0dGVybiB0b2tlbilcblx0XHRlbHNlIGlmIChwUGFyc2VyU3RhdGUuUGF0dGVybk1hdGNoKVxuXHRcdHtcblx0XHRcdC8vIElmIHRoZSBwYXR0ZXJuIGhhcyBhIHN1YnBhdHRlcm4gd2l0aCB0aGlzIGtleVxuXHRcdFx0aWYgKHBQYXJzZXJTdGF0ZS5QYXR0ZXJuTWF0Y2guaGFzT3duUHJvcGVydHkocENoYXJhY3RlcikpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIENvbnRpbnVlIG1hdGNoaW5nIHBhdHRlcm5zLlxuXHRcdFx0XHR0aGlzLmFzc2lnbk5vZGUocFBhcnNlclN0YXRlLlBhdHRlcm5NYXRjaFtwQ2hhcmFjdGVyXSwgcFBhcnNlclN0YXRlKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuYXBwZW5kT3V0cHV0QnVmZmVyKHBDaGFyYWN0ZXIsIHBQYXJzZXJTdGF0ZSk7XG5cdFx0XHRpZiAocFBhcnNlclN0YXRlLlBhdHRlcm4pXG5cdFx0XHR7XG5cdFx0XHRcdC8vIC4uLiBDaGVjayBpZiB0aGlzIGlzIHRoZSBlbmQgb2YgdGhlIHBhdHRlcm4gKGlmIHdlIGFyZSBtYXRjaGluZyBhIHZhbGlkIHBhdHRlcm4pLi4uXG5cdFx0XHRcdHRoaXMuY2hlY2tQYXR0ZXJuRW5kKHBQYXJzZXJTdGF0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vICgzKSBJZiB3ZSBhcmVuJ3QgaW4gYSBwYXR0ZXJuIG1hdGNoIG9yIHBhdHRlcm4sIGFuZCB0aGlzIGlzbid0IHRoZSBzdGFydCBvZiBhIG5ldyBwYXR0ZXJuIChSQVcgbW9kZSkuLi4uXG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHBQYXJzZXJTdGF0ZS5PdXRwdXQgKz0gcENoYXJhY3Rlcjtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBQYXJzZSBhIHN0cmluZyBmb3IgbWF0Y2hlcywgYW5kIHByb2Nlc3MgYW55IHRlbXBsYXRlIHNlZ21lbnRzIHRoYXQgb2NjdXIuXG5cdCAqIEBtZXRob2QgcGFyc2VTdHJpbmdcblx0ICogQHBhcmFtIHtzdHJpbmd9IHBTdHJpbmcgLSBUaGUgc3RyaW5nIHRvIHBhcnNlLlxuXHQgKiBAcGFyYW0ge09iamVjdH0gcFBhcnNlVHJlZSAtIFRoZSBwYXJzZSB0cmVlIHRvIGJlZ2luIHBhcnNpbmcgZnJvbSAodXN1YWxseSByb290KVxuXHQgKi9cblx0cGFyc2VTdHJpbmcgKHBTdHJpbmcsIHBQYXJzZVRyZWUpXG5cdHtcblx0XHRsZXQgdG1wUGFyc2VyU3RhdGUgPSB0aGlzLm5ld1BhcnNlclN0YXRlKHBQYXJzZVRyZWUpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwU3RyaW5nLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdC8vIFRPRE86IFRoaXMgaXMgbm90IGZhc3QuXG5cdFx0XHR0aGlzLnBhcnNlQ2hhcmFjdGVyKHBTdHJpbmdbaV0sIHRtcFBhcnNlclN0YXRlKTtcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5mbHVzaE91dHB1dEJ1ZmZlcih0bXBQYXJzZXJTdGF0ZSk7XG5cdFx0XG5cdFx0cmV0dXJuIHRtcFBhcnNlclN0YXRlLk91dHB1dDtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0cmluZ1BhcnNlcjtcbiIsIi8qKlxuKiBXb3JkIFRyZWVcbipcbiogQGxpY2Vuc2UgICAgIE1JVFxuKlxuKiBAYXV0aG9yICAgICAgU3RldmVuIFZlbG96byA8c3RldmVuQHZlbG96by5jb20+XG4qXG4qIEBkZXNjcmlwdGlvbiBDcmVhdGUgYSB0cmVlIChkaXJlY3RlZCBncmFwaCkgb2YgSmF2YXNjcmlwdCBvYmplY3RzLCBvbmUgY2hhcmFjdGVyIHBlciBvYmplY3QuXG4qL1xuXG5jbGFzcyBXb3JkVHJlZVxue1xuXHQvKipcblx0ICogV29yZFRyZWUgQ29uc3RydWN0b3Jcblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHRoaXMuUGFyc2VUcmVlID0ge307XG5cdH1cblx0XG5cdC8qKiBcblx0ICogQWRkIGEgY2hpbGQgY2hhcmFjdGVyIHRvIGEgUGFyc2UgVHJlZSBub2RlXG5cdCAqIEBtZXRob2QgYWRkQ2hpbGRcblx0ICogQHBhcmFtIHtPYmplY3R9IHBUcmVlIC0gQSBwYXJzZSB0cmVlIHRvIHB1c2ggdGhlIGNoYXJhY3RlcnMgaW50b1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gcFBhdHRlcm4gLSBUaGUgc3RyaW5nIHRvIGFkZCB0byB0aGUgdHJlZVxuXHQgKiBAcGFyYW0ge251bWJlcn0gcEluZGV4IC0gY2FsbGJhY2sgZnVuY3Rpb25cblx0ICogQHJldHVybnMge09iamVjdH0gVGhlIHJlc3VsdGluZyBsZWFmIG5vZGUgdGhhdCB3YXMgYWRkZWQgKG9yIGZvdW5kKVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YWRkQ2hpbGQgKHBUcmVlLCBwUGF0dGVybiwgcEluZGV4KVxuXHR7XG5cdFx0aWYgKHBJbmRleCA+IHBQYXR0ZXJuLmxlbmd0aClcblx0XHRcdHJldHVybiBwVHJlZTtcblx0XHRcblx0XHRpZiAoIXBUcmVlLmhhc093blByb3BlcnR5KHBQYXR0ZXJuW3BJbmRleF0pKVxuXHRcdFx0cFRyZWVbcFBhdHRlcm5bcEluZGV4XV0gPSB7fTtcblx0XHRcblx0XHRyZXR1cm4gcFRyZWVbcFBhdHRlcm5bcEluZGV4XV07XG5cdH1cblx0XG5cdC8qKiBBZGQgYSBQYXR0ZXJuIHRvIHRoZSBQYXJzZSBUcmVlXG5cdCAqIEBtZXRob2QgYWRkUGF0dGVyblxuXHQgKiBAcGFyYW0ge09iamVjdH0gcFRyZWUgLSBBIG5vZGUgb24gdGhlIHBhcnNlIHRyZWUgdG8gcHVzaCB0aGUgY2hhcmFjdGVycyBpbnRvXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwUGF0dGVybiAtIFRoZSBzdHJpbmcgdG8gYWRkIHRvIHRoZSB0cmVlXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBwSW5kZXggLSBjYWxsYmFjayBmdW5jdGlvblxuXHQgKiBAcmV0dXJuIHtib29sfSBUcnVlIGlmIGFkZGluZyB0aGUgcGF0dGVybiB3YXMgc3VjY2Vzc2Z1bFxuXHQgKi9cblx0YWRkUGF0dGVybiAocFBhdHRlcm5TdGFydCwgcFBhdHRlcm5FbmQsIHBQYXJzZXIpXG5cdHtcblx0XHRpZiAocFBhdHRlcm5TdGFydC5sZW5ndGggPCAxKVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0bGV0IHRtcExlYWYgPSB0aGlzLlBhcnNlVHJlZTtcblxuXHRcdC8vIEFkZCB0aGUgdHJlZSBvZiBsZWF2ZXMgaXRlcmF0aXZlbHlcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBQYXR0ZXJuU3RhcnQubGVuZ3RoOyBpKyspXG5cdFx0XHR0bXBMZWFmID0gdGhpcy5hZGRDaGlsZCh0bXBMZWFmLCBwUGF0dGVyblN0YXJ0LCBpKTtcblxuXHRcdHRtcExlYWYuUGF0dGVyblN0YXJ0ID0gcFBhdHRlcm5TdGFydDtcblx0XHR0bXBMZWFmLlBhdHRlcm5FbmQgPSAoKHR5cGVvZihwUGF0dGVybkVuZCkgPT09ICdzdHJpbmcnKSAmJiAocFBhdHRlcm5FbmQubGVuZ3RoID4gMCkpID8gcFBhdHRlcm5FbmQgOiBwUGF0dGVyblN0YXJ0O1xuXHRcdHRtcExlYWYuUGFyc2UgPSAodHlwZW9mKHBQYXJzZXIpID09PSAnZnVuY3Rpb24nKSA/IHBQYXJzZXIgOiBcblx0XHRcdFx0XHRcdCh0eXBlb2YocFBhcnNlcikgPT09ICdzdHJpbmcnKSA/ICgpID0+IHsgcmV0dXJuIHBQYXJzZXI7IH0gOlxuXHRcdFx0XHRcdFx0KHBEYXRhKSA9PiB7IHJldHVybiBwRGF0YTsgfTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gV29yZFRyZWU7XG4iLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cblxuLyoqXG4qIE1hbnlmZXN0IGJyb3dzZXIgc2hpbSBsb2FkZXJcbiovXG5cbi8vIExvYWQgdGhlIG1hbnlmZXN0IG1vZHVsZSBpbnRvIHRoZSBicm93c2VyIGdsb2JhbCBhdXRvbWF0aWNhbGx5LlxudmFyIGxpYk1hbnlmZXN0ID0gcmVxdWlyZSgnLi9NYW55ZmVzdC5qcycpO1xuXG5pZiAodHlwZW9mKHdpbmRvdykgPT09ICdvYmplY3QnKSB3aW5kb3cuTWFueWZlc3QgPSBsaWJNYW55ZmVzdDtcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJNYW55ZmVzdDsiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cbmxldCBsaWJTaW1wbGVMb2cgPSByZXF1aXJlKCcuL01hbnlmZXN0LUxvZ1RvQ29uc29sZS5qcycpO1xubGV0IGxpYlByZWNlZGVudCA9IHJlcXVpcmUoJ3ByZWNlZGVudCcpO1xuXG4vKipcbiogT2JqZWN0IEFkZHJlc3MgUmVzb2x2ZXJcbiogXG4qIElNUE9SVEFOVCBOT1RFOiBUaGlzIGNvZGUgaXMgaW50ZW50aW9uYWxseSBtb3JlIHZlcmJvc2UgdGhhbiBuZWNlc3NhcnksIHRvXG4qICAgICAgICAgICAgICAgICBiZSBleHRyZW1lbHkgY2xlYXIgd2hhdCBpcyBnb2luZyBvbiBpbiB0aGUgcmVjdXJzaW9uIGZvclxuKiAgICAgICAgICAgICAgICAgZWFjaCBvZiB0aGUgdGhyZWUgYWRkcmVzcyByZXNvbHV0aW9uIGZ1bmN0aW9ucy5cbiogXG4qICAgICAgICAgICAgICAgICBBbHRob3VnaCB0aGVyZSBpcyBzb21lIG9wcG9ydHVuaXR5IHRvIHJlcGVhdCBvdXJzZWx2ZXMgYVxuKiAgICAgICAgICAgICAgICAgYml0IGxlc3MgaW4gdGhpcyBjb2RlYmFzZSAoZS5nLiB3aXRoIGRldGVjdGlvbiBvZiBhcnJheXNcbiogICAgICAgICAgICAgICAgIHZlcnN1cyBvYmplY3RzIHZlcnN1cyBkaXJlY3QgcHJvcGVydGllcyksIGl0IGNhbiBtYWtlXG4qICAgICAgICAgICAgICAgICBkZWJ1Z2dpbmcuLiBjaGFsbGVuZ2luZy4gIFRoZSBtaW5pZmllZCB2ZXJzaW9uIG9mIHRoZSBjb2RlXG4qICAgICAgICAgICAgICAgICBvcHRpbWl6ZXMgb3V0IGFsbW9zdCBhbnl0aGluZyByZXBlYXRlZCBpbiBoZXJlLiAgU28gcGxlYXNlXG4qICAgICAgICAgICAgICAgICBiZSBraW5kIGFuZCByZXdpbmQuLi4gbWVhbmluZyBwbGVhc2Uga2VlcCB0aGUgY29kZWJhc2UgbGVzc1xuKiAgICAgICAgICAgICAgICAgdGVyc2UgYW5kIG1vcmUgdmVyYm9zZSBzbyBodW1hbnMgY2FuIGNvbXByZWhlbmQgaXQuXG4qICAgICAgICAgICAgICAgICBcbiogVE9ETzogT25jZSB3ZSB2YWxpZGF0ZSB0aGlzIHBhdHRlcm4gaXMgZ29vZCB0byBnbywgYnJlYWsgdGhlc2Ugb3V0IGludG8gXG4qICAgICAgIHRocmVlIHNlcGFyYXRlIG1vZHVsZXMuXG4qXG4qIEBjbGFzcyBNYW55ZmVzdE9iamVjdEFkZHJlc3NSZXNvbHZlclxuKi9cbmNsYXNzIE1hbnlmZXN0T2JqZWN0QWRkcmVzc1Jlc29sdmVyXG57XG5cdGNvbnN0cnVjdG9yKHBJbmZvTG9nLCBwRXJyb3JMb2cpXG5cdHtcblx0XHQvLyBXaXJlIGluIGxvZ2dpbmdcblx0XHR0aGlzLmxvZ0luZm8gPSAodHlwZW9mKHBJbmZvTG9nKSA9PSAnZnVuY3Rpb24nKSA/IHBJbmZvTG9nIDogbGliU2ltcGxlTG9nO1xuXHRcdHRoaXMubG9nRXJyb3IgPSAodHlwZW9mKHBFcnJvckxvZykgPT0gJ2Z1bmN0aW9uJykgPyBwRXJyb3JMb2cgOiBsaWJTaW1wbGVMb2c7XG5cblx0XHR0aGlzLmVsdWNpZGF0b3JTb2x2ZXIgPSBmYWxzZTtcblx0XHR0aGlzLmVsdWNpZGF0b3JTb2x2ZXJTdGF0ZSA9IHt9O1xuXHR9XG5cblx0Ly8gV2hlbiBhIGJveGVkIHByb3BlcnR5IGlzIHBhc3NlZCBpbiwgaXQgc2hvdWxkIGhhdmUgcXVvdGVzIG9mIHNvbWVcblx0Ly8ga2luZCBhcm91bmQgaXQuXG5cdC8vXG5cdC8vIEZvciBpbnN0YW5jZTpcblx0Ly8gXHRcdE15VmFsdWVzWydOYW1lJ11cblx0Ly8gXHRcdE15VmFsdWVzW1wiQWdlXCJdXG5cdC8vIFx0XHRNeVZhbHVlc1tgQ29zdGBdXG5cdC8vXG5cdC8vIFRoaXMgZnVuY3Rpb24gcmVtb3ZlcyB0aGUgd3JhcHBpbmcgcXVvdGVzLlxuXHQvL1xuXHQvLyBQbGVhc2Ugbm90ZSBpdCAqRE9FUyBOT1QgUEFSU0UqIHRlbXBsYXRlIGxpdGVyYWxzLCBzbyBiYWNrdGlja3MganVzdFxuXHQvLyBlbmQgdXAgZG9pbmcgdGhlIHNhbWUgdGhpbmcgYXMgb3RoZXIgcXVvdGUgdHlwZXMuXG5cdC8vXG5cdC8vIFRPRE86IFNob3VsZCB0ZW1wbGF0ZSBsaXRlcmFscyBiZSBwcm9jZXNzZWQ/ICBJZiBzbyB3aGF0IHN0YXRlIGRvIHRoZXkgaGF2ZSBhY2Nlc3MgdG8/XG5cdGNsZWFuV3JhcENoYXJhY3RlcnMgKHBDaGFyYWN0ZXIsIHBTdHJpbmcpXG5cdHtcblx0XHRpZiAocFN0cmluZy5zdGFydHNXaXRoKHBDaGFyYWN0ZXIpICYmIHBTdHJpbmcuZW5kc1dpdGgocENoYXJhY3RlcikpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHBTdHJpbmcuc3Vic3RyaW5nKDEsIHBTdHJpbmcubGVuZ3RoIC0gMSk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRyZXR1cm4gcFN0cmluZztcblx0XHR9XG5cdH1cblxuXHQvLyBDaGVjayBpZiBhbiBhZGRyZXNzIGV4aXN0cy5cblx0Ly9cblx0Ly8gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGUgZ2V0VmFsdWVBdEFkZHJlc3MgZnVuY3Rpb24gaXMgYW1iaWd1b3VzIG9uIFxuXHQvLyB3aGV0aGVyIHRoZSBlbGVtZW50L3Byb3BlcnR5IGlzIGFjdHVhbGx5IHRoZXJlIG9yIG5vdCAoaXQgcmV0dXJucyBcblx0Ly8gdW5kZWZpbmVkIHdoZXRoZXIgdGhlIHByb3BlcnR5IGV4aXN0cyBvciBub3QpLiAgVGhpcyBmdW5jdGlvbiBjaGVja3MgZm9yXG5cdC8vIGV4aXN0YW5jZSBhbmQgcmV0dXJucyB0cnVlIG9yIGZhbHNlIGRlcGVuZGVudC5cblx0Y2hlY2tBZGRyZXNzRXhpc3RzIChwT2JqZWN0LCBwQWRkcmVzcylcblx0e1xuXHRcdC8vIFRPRE86IFNob3VsZCB0aGVzZSB0aHJvdyBhbiBlcnJvcj9cblx0XHQvLyBNYWtlIHN1cmUgcE9iamVjdCBpcyBhbiBvYmplY3Rcblx0XHRpZiAodHlwZW9mKHBPYmplY3QpICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG5cdFx0Ly8gTWFrZSBzdXJlIHBBZGRyZXNzIGlzIGEgc3RyaW5nXG5cdFx0aWYgKHR5cGVvZihwQWRkcmVzcykgIT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcblxuXHRcdC8vIFRPRE86IE1ha2UgdGhpcyB3b3JrIGZvciB0aGluZ3MgbGlrZSBTb21lUm9vdE9iamVjdC5NZXRhZGF0YVtcIlNvbWUuUGVvcGxlLlVzZS5CYWQuT2JqZWN0LlByb3BlcnR5Lk5hbWVzXCJdXG5cdFx0bGV0IHRtcFNlcGFyYXRvckluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignLicpO1xuXG5cdFx0Ly8gVGhpcyBpcyB0aGUgdGVybWluYWwgYWRkcmVzcyBzdHJpbmcgKG5vIG1vcmUgZG90cyBzbyB0aGUgUkVDVVNJT04gRU5EUyBJTiBIRVJFIHNvbWVob3cpXG5cdFx0aWYgKHRtcFNlcGFyYXRvckluZGV4ID09IC0xKVxuXHRcdHtcblx0XHRcdC8vIENoZWNrIGlmIHRoZSBhZGRyZXNzIHJlZmVycyB0byBhIGJveGVkIHByb3BlcnR5XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0YXJ0SW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCdbJyk7XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0b3BJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJ10nKTtcblx0XHRcdC8vIEJveGVkIGVsZW1lbnRzIGxvb2sgbGlrZSB0aGlzOlxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWzEwXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWydOYW1lJ11cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tcIkFnZVwiXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW2BDb3N0YF1cblx0XHRcdC8vXG5cdFx0XHQvLyBXaGVuIHdlIGFyZSBwYXNzZWQgU29tZU9iamVjdFtcIk5hbWVcIl0gdGhpcyBjb2RlIGJlbG93IHJlY3Vyc2VzIGFzIGlmIGl0IHdlcmUgU29tZU9iamVjdC5OYW1lXG5cdFx0XHQvLyBUaGUgcmVxdWlyZW1lbnRzIHRvIGRldGVjdCBhIGJveGVkIGVsZW1lbnQgYXJlOlxuXHRcdFx0Ly8gICAgMSkgVGhlIHN0YXJ0IGJyYWNrZXQgaXMgYWZ0ZXIgY2hhcmFjdGVyIDBcblx0XHRcdGlmICgodG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSBcblx0XHRcdC8vICAgIDIpIFRoZSBlbmQgYnJhY2tldCBoYXMgc29tZXRoaW5nIGJldHdlZW4gdGhlbVxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCA+IHRtcEJyYWNrZXRTdGFydEluZGV4KSBcblx0XHRcdC8vICAgIDMpIFRoZXJlIGlzIGRhdGEgXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4IC0gdG1wQnJhY2tldFN0YXJ0SW5kZXggPiAxKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gVGhlIFwiTmFtZVwiIG9mIHRoZSBPYmplY3QgY29udGFpbmVkIHRvbyB0aGUgbGVmdCBvZiB0aGUgYnJhY2tldFxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSBwQWRkcmVzcy5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHQvLyBJZiB0aGUgc3VicHJvcGVydHkgZG9lc24ndCB0ZXN0IGFzIGEgcHJvcGVyIE9iamVjdCwgbm9uZSBvZiB0aGUgcmVzdCBvZiB0aGlzIGlzIHBvc3NpYmxlLlxuXHRcdFx0XHQvLyBUaGlzIGlzIGEgcmFyZSBjYXNlIHdoZXJlIEFycmF5cyB0ZXN0aW5nIGFzIE9iamVjdHMgaXMgdXNlZnVsXG5cdFx0XHRcdGlmICh0eXBlb2YocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pICE9PSAnb2JqZWN0Jylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFRoZSBcIlJlZmVyZW5jZVwiIHRvIHRoZSBwcm9wZXJ0eSB3aXRoaW4gaXQsIGVpdGhlciBhbiBhcnJheSBlbGVtZW50IG9yIG9iamVjdCBwcm9wZXJ0eVxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHBBZGRyZXNzLnN1YnN0cmluZyh0bXBCcmFja2V0U3RhcnRJbmRleCsxLCB0bXBCcmFja2V0U3RvcEluZGV4KS50cmltKCk7XG5cdFx0XHRcdC8vIEF0dGVtcHQgdG8gcGFyc2UgdGhlIHJlZmVyZW5jZSBhcyBhIG51bWJlciwgd2hpY2ggd2lsbCBiZSB1c2VkIGFzIGFuIGFycmF5IGVsZW1lbnRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOdW1iZXIgPSBwYXJzZUludCh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlLCAxMCk7XG5cblx0XHRcdFx0Ly8gR3VhcmQ6IElmIHRoZSByZWZlcnJhbnQgaXMgYSBudW1iZXIgYW5kIHRoZSBib3hlZCBwcm9wZXJ0eSBpcyBub3QgYW4gYXJyYXksIG9yIHZpY2UgdmVyc2EsIHJldHVybiB1bmRlZmluZWQuXG5cdFx0XHRcdC8vICAgICAgICBUaGlzIHNlZW1zIGNvbmZ1c2luZyB0byBtZSBhdCBmaXJzdCByZWFkLCBzbyBleHBsYWluYXRpb246XG5cdFx0XHRcdC8vICAgICAgICBJcyB0aGUgQm94ZWQgT2JqZWN0IGFuIEFycmF5PyAgVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgQW5kIGlzIHRoZSBSZWZlcmVuY2UgaW5zaWRlIHRoZSBib3hlZCBPYmplY3Qgbm90IGEgbnVtYmVyPyBUUlVFXG5cdFx0XHRcdC8vICAgICAgICAtLT4gIFNvIHdoZW4gdGhlc2UgYXJlIGluIGFncmVlbWVudCwgaXQncyBhbiBpbXBvc3NpYmxlIGFjY2VzcyBzdGF0ZVxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgPT0gaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyAgICA0KSBJZiB0aGUgbWlkZGxlIHBhcnQgaXMgKm9ubHkqIGEgbnVtYmVyIChubyBzaW5nbGUsIGRvdWJsZSBvciBiYWNrdGljayBxdW90ZXMpIGl0IGlzIGFuIGFycmF5IGVsZW1lbnQsXG5cdFx0XHRcdC8vICAgICAgIG90aGVyd2lzZSB3ZSB3aWxsIHRyeSB0byB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRcdC8vIFdlIHdvdWxkIGV4cGVjdCB0aGUgcHJvcGVydHkgdG8gYmUgd3JhcHBlZCBpbiBzb21lIGtpbmQgb2YgcXVvdGVzIHNvIHN0cmlwIHRoZW1cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIENoZWNrIGlmIHRoZSBwcm9wZXJ0eSBleGlzdHMuXG5cdFx0XHRcdFx0cmV0dXJuIHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdLmhhc093blByb3BlcnR5KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFVzZSB0aGUgbmV3IGluIG9wZXJhdG9yIHRvIHNlZSBpZiB0aGUgZWxlbWVudCBpcyBpbiB0aGUgYXJyYXlcblx0XHRcdFx0XHRyZXR1cm4gKHRtcEJveGVkUHJvcGVydHlOdW1iZXIgaW4gcE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIENoZWNrIGlmIHRoZSBwcm9wZXJ0eSBleGlzdHNcblx0XHRcdFx0cmV0dXJuIHBPYmplY3QuaGFzT3duUHJvcGVydHkocEFkZHJlc3MpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGV0IHRtcFN1Yk9iamVjdE5hbWUgPSBwQWRkcmVzcy5zdWJzdHJpbmcoMCwgdG1wU2VwYXJhdG9ySW5kZXgpO1xuXHRcdFx0bGV0IHRtcE5ld0FkZHJlc3MgPSBwQWRkcmVzcy5zdWJzdHJpbmcodG1wU2VwYXJhdG9ySW5kZXgrMSk7XG5cblx0XHRcdC8vIFRlc3QgaWYgdGhlIHRtcE5ld0FkZHJlc3MgaXMgYW4gYXJyYXkgb3Igb2JqZWN0XG5cdFx0XHQvLyBDaGVjayBpZiBpdCdzIGEgYm94ZWQgcHJvcGVydHlcblx0XHRcdGxldCB0bXBCcmFja2V0U3RhcnRJbmRleCA9IHRtcFN1Yk9iamVjdE5hbWUuaW5kZXhPZignWycpO1xuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdG9wSW5kZXggPSB0bXBTdWJPYmplY3ROYW1lLmluZGV4T2YoJ10nKTtcblx0XHRcdC8vIEJveGVkIGVsZW1lbnRzIGxvb2sgbGlrZSB0aGlzOlxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWzQyXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWydDb2xvciddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJXZWlnaHRcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgRGlhbWV0ZXJgXVxuXHRcdFx0Ly9cblx0XHRcdC8vIFdoZW4gd2UgYXJlIHBhc3NlZCBTb21lT2JqZWN0W1wiTmFtZVwiXSB0aGlzIGNvZGUgYmVsb3cgcmVjdXJzZXMgYXMgaWYgaXQgd2VyZSBTb21lT2JqZWN0Lk5hbWVcblx0XHRcdC8vIFRoZSByZXF1aXJlbWVudHMgdG8gZGV0ZWN0IGEgYm94ZWQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0aWYgKCh0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApIFxuXHRcdFx0Ly8gICAgMikgVGhlIGVuZCBicmFja2V0IGhhcyBzb21ldGhpbmcgYmV0d2VlbiB0aGVtXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4ID4gdG1wQnJhY2tldFN0YXJ0SW5kZXgpIFxuXHRcdFx0Ly8gICAgMykgVGhlcmUgaXMgZGF0YSBcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggLSB0bXBCcmFja2V0U3RhcnRJbmRleCA+IDEpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSB0bXBTdWJPYmplY3ROYW1lLnN1YnN0cmluZygwLCB0bXBCcmFja2V0U3RhcnRJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdG1wU3ViT2JqZWN0TmFtZS5zdWJzdHJpbmcodG1wQnJhY2tldFN0YXJ0SW5kZXgrMSwgdG1wQnJhY2tldFN0b3BJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TnVtYmVyID0gcGFyc2VJbnQodG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSwgMTApO1xuXG5cdFx0XHRcdC8vIEd1YXJkOiBJZiB0aGUgcmVmZXJyYW50IGlzIGEgbnVtYmVyIGFuZCB0aGUgYm94ZWQgcHJvcGVydHkgaXMgbm90IGFuIGFycmF5LCBvciB2aWNlIHZlcnNhLCByZXR1cm4gdW5kZWZpbmVkLlxuXHRcdFx0XHQvLyAgICAgICAgVGhpcyBzZWVtcyBjb25mdXNpbmcgdG8gbWUgYXQgZmlyc3QgcmVhZCwgc28gZXhwbGFpbmF0aW9uOlxuXHRcdFx0XHQvLyAgICAgICAgSXMgdGhlIEJveGVkIE9iamVjdCBhbiBBcnJheT8gIFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIEFuZCBpcyB0aGUgUmVmZXJlbmNlIGluc2lkZSB0aGUgYm94ZWQgT2JqZWN0IG5vdCBhIG51bWJlcj8gVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgLS0+ICBTbyB3aGVuIHRoZXNlIGFyZSBpbiBhZ3JlZW1lbnQsIGl0J3MgYW4gaW1wb3NzaWJsZSBhY2Nlc3Mgc3RhdGVcblx0XHRcdFx0Ly8gVGhpcyBjb3VsZCBiZSBhIGZhaWx1cmUgaW4gdGhlIHJlY3Vyc2lvbiBjaGFpbiBiZWNhdXNlIHRoZXkgcGFzc2VkIHNvbWV0aGluZyBsaWtlIHRoaXMgaW46XG5cdFx0XHRcdC8vICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHNbMV0uVGFyZHlcblx0XHRcdFx0Ly8gICAgICAgQlVUXG5cdFx0XHRcdC8vICAgICAgICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50cyBpcyBhbiBvYmplY3QsIHNvIHRoZSBbMV0uVGFyZHkgaXMgbm90IHBvc3NpYmxlIHRvIGFjY2Vzc1xuXHRcdFx0XHQvLyBUaGlzIGNvdWxkIGJlIGEgZmFpbHVyZSBpbiB0aGUgcmVjdXJzaW9uIGNoYWluIGJlY2F1c2UgdGhleSBwYXNzZWQgc29tZXRoaW5nIGxpa2UgdGhpcyBpbjpcblx0XHRcdFx0Ly8gICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50c1tcIkphbmVEb2VcIl0uR3JhZGVcblx0XHRcdFx0Ly8gICAgICAgQlVUXG5cdFx0XHRcdC8vICAgICAgICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50cyBpcyBhbiBhcnJheSwgc28gdGhlIFtcIkphbmVEb2VcIl0uR3JhZGUgaXMgbm90IHBvc3NpYmxlIHRvIGFjY2Vzc1xuXHRcdFx0XHQvLyBUT0RPOiBTaG91bGQgdGhpcyBiZSBhbiBlcnJvciBvciBzb21ldGhpbmc/ICBTaG91bGQgd2Uga2VlcCBhIGxvZyBvZiBmYWlsdXJlcyBsaWtlIHRoaXM/XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSA9PSBpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEJlY2F1c2UgdGhpcyBpcyBhbiBpbXBvc3NpYmxlIGFkZHJlc3MsIHRoZSBwcm9wZXJ0eSBkb2Vzbid0IGV4aXN0XG5cdFx0XHRcdFx0Ly8gVE9ETzogU2hvdWxkIHdlIHRocm93IGFuIGVycm9yIGluIHRoaXMgY29uZGl0aW9uP1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vVGhpcyBpcyBhIGJyYWNrZXRlZCB2YWx1ZVxuXHRcdFx0XHQvLyAgICA0KSBJZiB0aGUgbWlkZGxlIHBhcnQgaXMgKm9ubHkqIGEgbnVtYmVyIChubyBzaW5nbGUsIGRvdWJsZSBvciBiYWNrdGljayBxdW90ZXMpIGl0IGlzIGFuIGFycmF5IGVsZW1lbnQsXG5cdFx0XHRcdC8vICAgICAgIG90aGVyd2lzZSB3ZSB3aWxsIHRyeSB0byByZWF0IGl0IGFzIGEgZHluYW1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdGlmIChpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFRoaXMgaXNuJ3QgYSBudW1iZXIgLi4uIGxldCdzIHRyZWF0IGl0IGFzIGEgZHluYW5taWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ1wiJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnYCcsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoXCInXCIsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBkaXJlY3RseSBpbnRvIHRoZSBzdWJvYmplY3Rcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5jaGVja0FkZHJlc3NFeGlzdHMocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZV0sIHRtcE5ld0FkZHJlc3MpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFdlIHBhcnNlZCBhIHZhbGlkIG51bWJlciBvdXQgb2YgdGhlIGJveGVkIHByb3BlcnR5IG5hbWUsIHNvIHJlY3Vyc2UgaW50byB0aGUgYXJyYXlcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5jaGVja0FkZHJlc3NFeGlzdHMocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eU51bWJlcl0sIHRtcE5ld0FkZHJlc3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHRoZXJlIGlzIGFuIG9iamVjdCBwcm9wZXJ0eSBhbHJlYWR5IG5hbWVkIGZvciB0aGUgc3ViIG9iamVjdCwgYnV0IGl0IGlzbid0IGFuIG9iamVjdFxuXHRcdFx0Ly8gdGhlbiB0aGUgc3lzdGVtIGNhbid0IHNldCB0aGUgdmFsdWUgaW4gdGhlcmUuICBFcnJvciBhbmQgYWJvcnQhXG5cdFx0XHRpZiAocE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh0bXBTdWJPYmplY3ROYW1lKSAmJiB0eXBlb2YocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSkgIT09ICdvYmplY3QnKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwT2JqZWN0Lmhhc093blByb3BlcnR5KHRtcFN1Yk9iamVjdE5hbWUpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGEgc3Vib2JqZWN0IHBhc3MgdGhhdCB0byB0aGUgcmVjdXJzaXZlIHRoaW5neVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5jaGVja0FkZHJlc3NFeGlzdHMocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSwgdG1wTmV3QWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIENyZWF0ZSBhIHN1Ym9iamVjdCBhbmQgdGhlbiBwYXNzIHRoYXRcblx0XHRcdFx0cE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSA9IHt9O1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jaGVja0FkZHJlc3NFeGlzdHMocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSwgdG1wTmV3QWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y2hlY2tGaWx0ZXJzKHBBZGRyZXNzLCBwUmVjb3JkKVxuXHR7XG5cdFx0bGV0IHRtcFByZWNlZGVudCA9IG5ldyBsaWJQcmVjZWRlbnQoKTtcblx0XHQvLyBJZiB3ZSBkb24ndCBjb3B5IHRoZSBzdHJpbmcsIHByZWNlZGVudCB0YWtlcyBpdCBvdXQgZm9yIGdvb2QuXG5cdFx0Ly8gVE9ETzogQ29uc2lkZXIgYWRkaW5nIGEgXCJkb24ndCByZXBsYWNlXCIgb3B0aW9uIGZvciBwcmVjZWRlbnRcblx0XHRsZXQgdG1wQWRkcmVzcyA9IHBBZGRyZXNzO1xuXG5cdFx0aWYgKCF0aGlzLmVsdWNpZGF0b3JTb2x2ZXIpXG5cdFx0e1xuXHRcdFx0Ly8gQWdhaW4sIG1hbmFnZSBhZ2FpbnN0IGNpcmN1bGFyIGRlcGVuZGVuY2llc1xuXHRcdFx0bGV0IGxpYkVsdWNpZGF0b3IgPSByZXF1aXJlKCdlbHVjaWRhdG9yJyk7XG5cdFx0XHR0aGlzLmVsdWNpZGF0b3JTb2x2ZXIgPSBuZXcgbGliRWx1Y2lkYXRvcih7fSwgdGhpcy5sb2dJbmZvLCB0aGlzLmxvZ0Vycm9yKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5lbHVjaWRhdG9yU29sdmVyKVxuXHRcdHtcblx0XHRcdC8vIFRoaXMgYWxsb3dzIHRoZSBtYWdpYyBmaWx0cmF0aW9uIHdpdGggZWx1Y2lkYXRvciBjb25maWd1cmF0aW9uXG5cdFx0XHQvLyBUT0RPOiBXZSBjb3VsZCBwYXNzIG1vcmUgc3RhdGUgaW4gKGUuZy4gcGFyZW50IGFkZHJlc3MsIG9iamVjdCwgZXRjLilcblx0XHRcdC8vIFRPRE86IERpc2N1c3MgdGhpcyBtZXRhcHJvZ3JhbW1pbmcgQVQgTEVOR1RIXG5cdFx0XHRsZXQgdG1wRmlsdGVyU3RhdGUgPSAoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRSZWNvcmQ6IHBSZWNvcmQsXG5cdFx0XHRcdFx0a2VlcFJlY29yZDogdHJ1ZSBcblx0XHRcdFx0fSk7XG5cblx0XHRcdC8vIFRoaXMgaXMgYWJvdXQgYXMgY29tcGxleCBhcyBpdCBnZXRzLlxuXHRcdFx0Ly8gVE9ETzogT3B0aW1pemUgdGhpcyBzbyBpdCBpcyBvbmx5IGluaXRpYWxpemVkIG9uY2UuXG5cdFx0XHQvLyBUT0RPOiBUaGF0IG1lYW5zIGZpZ3VyaW5nIG91dCBhIGhlYWx0aHkgcGF0dGVybiBmb3IgcGFzc2luZyBpbiBzdGF0ZSB0byB0aGlzXG5cdFx0XHR0bXBQcmVjZWRlbnQuYWRkUGF0dGVybignPDx+ficsICd+fj4+Jyxcblx0XHRcdFx0KHBJbnN0cnVjdGlvbkhhc2gpID0+IFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBpcyBmb3IgaW50ZXJuYWwgY29uZmlnIG9uIHRoZSBzb2x1dGlvbiBzdGVwcy4gIFJpZ2h0IG5vdyBjb25maWcgaXMgbm90IHNoYXJlZCBhY3Jvc3Mgc3RlcHMuXG5cdFx0XHRcdFx0aWYgKHRoaXMuZWx1Y2lkYXRvclNvbHZlclN0YXRlLmhhc093blByb3BlcnR5KHBJbnN0cnVjdGlvbkhhc2gpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRtcEZpbHRlclN0YXRlLlNvbHV0aW9uU3RhdGUgPSB0aGlzLmVsdWNpZGF0b3JTb2x2ZXJTdGF0ZVtwSW5zdHJ1Y3Rpb25IYXNoXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5lbHVjaWRhdG9yU29sdmVyLnNvbHZlSW50ZXJuYWxPcGVyYXRpb24oJ0N1c3RvbScsIHBJbnN0cnVjdGlvbkhhc2gsIHRtcEZpbHRlclN0YXRlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR0bXBQcmVjZWRlbnQuYWRkUGF0dGVybignPDx+PycsICc/fj4+Jyxcblx0XHRcdFx0KHBNYWdpY1NlYXJjaEV4cHJlc3Npb24pID0+IFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZihwTWFnaWNTZWFyY2hFeHByZXNzaW9uKSAhPT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBUaGlzIGV4cGVjdHMgYSBjb21tYSBzZXBhcmF0ZWQgZXhwcmVzc2lvbjpcblx0XHRcdFx0XHQvLyAgICAgU29tZS5BZGRyZXNzLkluLlRoZS5PYmplY3QsPT0sU2VhcmNoIFRlcm0gdG8gTWF0Y2hcblx0XHRcdFx0XHRsZXQgdG1wTWFnaWNDb21wYXJpc29uUGF0dGVyblNldCA9IHBNYWdpY1NlYXJjaEV4cHJlc3Npb24uc3BsaXQoJywnKTtcblxuXHRcdFx0XHRcdGxldCB0bXBTZWFyY2hBZGRyZXNzID0gdG1wTWFnaWNDb21wYXJpc29uUGF0dGVyblNldFswXTtcblx0XHRcdFx0XHRsZXQgdG1wU2VhcmNoQ29tcGFyYXRvciA9IHRtcE1hZ2ljQ29tcGFyaXNvblBhdHRlcm5TZXRbMV07XG5cdFx0XHRcdFx0bGV0IHRtcFNlYXJjaFZhbHVlID0gdG1wTWFnaWNDb21wYXJpc29uUGF0dGVyblNldFsyXTtcblxuXHRcdFx0XHRcdHRtcEZpbHRlclN0YXRlLkNvbXBhcmlzb25TdGF0ZSA9IChcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0U2VhcmNoQWRkcmVzczogdG1wU2VhcmNoQWRkcmVzcyxcblx0XHRcdFx0XHRcdFx0Q29tcGFyYXRvcjogdG1wU2VhcmNoQ29tcGFyYXRvcixcblx0XHRcdFx0XHRcdFx0U2VhcmNoVGVybTogdG1wU2VhcmNoVmFsdWVcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dGhpcy5lbHVjaWRhdG9yU29sdmVyLnNvbHZlT3BlcmF0aW9uKFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcIk9wZXJhdGlvblwiOiBcIlNpbXBsZV9JZlwiLFxuXHRcdFx0XHRcdFx0XHRcdFwiU3lub3BzaXNcIjogXCJUZXN0IGZvciBcIlxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcIlN0ZXBzXCI6XG5cdFx0XHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcIk5hbWVzcGFjZVwiOiBcIkxvZ2ljXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcIkluc3RydWN0aW9uXCI6IFwiaWZcIixcblx0XHRcblx0XHRcdFx0XHRcdFx0XHRcdFwiSW5wdXRIYXNoQWRkcmVzc01hcFwiOiBcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFRoaXMgaXMgLi4uIGR5bmFtaWNhbGx5IGFzc2lnbmluZyB0aGUgYWRkcmVzcyBpbiB0aGUgaW5zdHJ1Y3Rpb25cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBUaGUgY29tcGxleGl0eSBpcyBhc3RvdW5kaW5nLlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFwibGVmdFZhbHVlXCI6IGBSZWNvcmQuJHt0bXBTZWFyY2hBZGRyZXNzfWAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XCJyaWdodFZhbHVlXCI6IFwiQ29tcGFyaXNvblN0YXRlLlNlYXJjaFRlcm1cIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcImNvbXBhcmF0b3JcIjogXCJDb21wYXJpc29uU3RhdGUuQ29tcGFyYXRvclwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcIk91dHB1dEhhc2hBZGRyZXNzTWFwXCI6IHsgXCJ0cnV0aGluZXNzUmVzdWx0XCI6XCJrZWVwUmVjb3JkXCIgfVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XVxuXHRcdFx0XHRcdFx0fSwgdG1wRmlsdGVyU3RhdGUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdHRtcFByZWNlZGVudC5wYXJzZVN0cmluZyh0bXBBZGRyZXNzKTtcblxuXHRcdFx0Ly8gSXQgaXMgZXhwZWN0ZWQgdGhhdCB0aGUgb3BlcmF0aW9uIHdpbGwgbXV0YXRlIHRoaXMgdG8gc29tZSB0cnV0aHkgdmFsdWVcblx0XHRcdHJldHVybiB0bXBGaWx0ZXJTdGF0ZS5rZWVwUmVjb3JkO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG5cblx0Ly8gR2V0IHRoZSB2YWx1ZSBvZiBhbiBlbGVtZW50IGF0IGFuIGFkZHJlc3Ncblx0Z2V0VmFsdWVBdEFkZHJlc3MgKHBPYmplY3QsIHBBZGRyZXNzLCBwUGFyZW50QWRkcmVzcylcblx0e1xuXHRcdC8vIE1ha2Ugc3VyZSBwT2JqZWN0ICh0aGUgb2JqZWN0IHdlIGFyZSBtZWFudCB0byBiZSByZWN1cnNpbmcpIGlzIGFuIG9iamVjdCAod2hpY2ggY291bGQgYmUgYW4gYXJyYXkgb3Igb2JqZWN0KVxuXHRcdGlmICh0eXBlb2YocE9iamVjdCkgIT0gJ29iamVjdCcpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0Ly8gTWFrZSBzdXJlIHBBZGRyZXNzICh0aGUgYWRkcmVzcyB3ZSBhcmUgcmVzb2x2aW5nKSBpcyBhIHN0cmluZ1xuXHRcdGlmICh0eXBlb2YocEFkZHJlc3MpICE9ICdzdHJpbmcnKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdC8vIFN0YXNoIHRoZSBwYXJlbnQgYWRkcmVzcyBmb3IgbGF0ZXIgcmVzb2x1dGlvblxuXHRcdGxldCB0bXBQYXJlbnRBZGRyZXNzID0gXCJcIjtcblx0XHRpZiAodHlwZW9mKHBQYXJlbnRBZGRyZXNzKSA9PSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHR0bXBQYXJlbnRBZGRyZXNzID0gcFBhcmVudEFkZHJlc3M7XG5cdFx0fVxuXG5cdFx0Ly8gVE9ETzogTWFrZSB0aGlzIHdvcmsgZm9yIHRoaW5ncyBsaWtlIFNvbWVSb290T2JqZWN0Lk1ldGFkYXRhW1wiU29tZS5QZW9wbGUuVXNlLkJhZC5PYmplY3QuUHJvcGVydHkuTmFtZXNcIl1cblx0XHRsZXQgdG1wU2VwYXJhdG9ySW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCcuJyk7XG5cblx0XHQvLyBUaGlzIGlzIHRoZSB0ZXJtaW5hbCBhZGRyZXNzIHN0cmluZyAobm8gbW9yZSBkb3RzIHNvIHRoZSBSRUNVU0lPTiBFTkRTIElOIEhFUkUgc29tZWhvdylcblx0XHRpZiAodG1wU2VwYXJhdG9ySW5kZXggPT0gLTEpXG5cdFx0e1xuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIGFkZHJlc3MgcmVmZXJzIHRvIGEgYm94ZWQgcHJvcGVydHlcblx0XHRcdGxldCB0bXBCcmFja2V0U3RhcnRJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJ1snKTtcblx0XHRcdGxldCB0bXBCcmFja2V0U3RvcEluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignXScpO1xuXG5cdFx0XHQvLyBDaGVjayBmb3IgdGhlIE9iamVjdCBTZXQgVHlwZSBtYXJrZXIuXG5cdFx0XHQvLyBOb3RlIHRoaXMgd2lsbCBub3Qgd29yayB3aXRoIGEgYnJhY2tldCBpbiB0aGUgc2FtZSBhZGRyZXNzIGJveCBzZXRcblx0XHRcdGxldCB0bXBPYmplY3RUeXBlTWFya2VySW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCd7fScpO1xuXG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1sxMF1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snTmFtZSddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJBZ2VcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgQ29zdGBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMSkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRoZSBcIk5hbWVcIiBvZiB0aGUgT2JqZWN0IGNvbnRhaW5lZCB0b28gdGhlIGxlZnQgb2YgdGhlIGJyYWNrZXRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0Ly8gSWYgdGhlIHN1YnByb3BlcnR5IGRvZXNuJ3QgdGVzdCBhcyBhIHByb3BlciBPYmplY3QsIG5vbmUgb2YgdGhlIHJlc3Qgb2YgdGhpcyBpcyBwb3NzaWJsZS5cblx0XHRcdFx0Ly8gVGhpcyBpcyBhIHJhcmUgY2FzZSB3aGVyZSBBcnJheXMgdGVzdGluZyBhcyBPYmplY3RzIGlzIHVzZWZ1bFxuXHRcdFx0XHRpZiAodHlwZW9mKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVGhlIFwiUmVmZXJlbmNlXCIgdG8gdGhlIHByb3BlcnR5IHdpdGhpbiBpdCwgZWl0aGVyIGFuIGFycmF5IGVsZW1lbnQgb3Igb2JqZWN0IHByb3BlcnR5XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcEJyYWNrZXRTdGFydEluZGV4KzEsIHRtcEJyYWNrZXRTdG9wSW5kZXgpLnRyaW0oKTtcblx0XHRcdFx0Ly8gQXR0ZW1wdCB0byBwYXJzZSB0aGUgcmVmZXJlbmNlIGFzIGEgbnVtYmVyLCB3aGljaCB3aWxsIGJlIHVzZWQgYXMgYW4gYXJyYXkgZWxlbWVudFxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU51bWJlciA9IHBhcnNlSW50KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UsIDEwKTtcblxuXHRcdFx0XHQvLyBHdWFyZDogSWYgdGhlIHJlZmVycmFudCBpcyBhIG51bWJlciBhbmQgdGhlIGJveGVkIHByb3BlcnR5IGlzIG5vdCBhbiBhcnJheSwgb3IgdmljZSB2ZXJzYSwgcmV0dXJuIHVuZGVmaW5lZC5cblx0XHRcdFx0Ly8gICAgICAgIFRoaXMgc2VlbXMgY29uZnVzaW5nIHRvIG1lIGF0IGZpcnN0IHJlYWQsIHNvIGV4cGxhaW5hdGlvbjpcblx0XHRcdFx0Ly8gICAgICAgIElzIHRoZSBCb3hlZCBPYmplY3QgYW4gQXJyYXk/ICBUUlVFXG5cdFx0XHRcdC8vICAgICAgICBBbmQgaXMgdGhlIFJlZmVyZW5jZSBpbnNpZGUgdGhlIGJveGVkIE9iamVjdCBub3QgYSBudW1iZXI/IFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIC0tPiAgU28gd2hlbiB0aGVzZSBhcmUgaW4gYWdyZWVtZW50LCBpdCdzIGFuIGltcG9zc2libGUgYWNjZXNzIHN0YXRlXG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSA9PSBpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyAgICA0KSBJZiB0aGUgbWlkZGxlIHBhcnQgaXMgKm9ubHkqIGEgbnVtYmVyIChubyBzaW5nbGUsIGRvdWJsZSBvciBiYWNrdGljayBxdW90ZXMpIGl0IGlzIGFuIGFycmF5IGVsZW1lbnQsXG5cdFx0XHRcdC8vICAgICAgIG90aGVyd2lzZSB3ZSB3aWxsIHRyeSB0byB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRcdC8vIFdlIHdvdWxkIGV4cGVjdCB0aGUgcHJvcGVydHkgdG8gYmUgd3JhcHBlZCBpbiBzb21lIGtpbmQgb2YgcXVvdGVzIHNvIHN0cmlwIHRoZW1cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIFJldHVybiB0aGUgdmFsdWUgaW4gdGhlIHByb3BlcnR5XG5cdFx0XHRcdFx0cmV0dXJuIHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlSZWZlcmVuY2VdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5TnVtYmVyXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBzZXQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0ZWxzZSBpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaXMgYWZ0ZXIgdGhlIHN0YXJ0IGJyYWNrZXRcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBub3RoaW5nIGluIHRoZSBicmFja2V0c1xuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID09IDEpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSBwQWRkcmVzcy5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gV2UgYXNrZWQgZm9yIGEgc2V0IGZyb20gYW4gYXJyYXkgYnV0IGl0IGlzbnQnIGFuIGFycmF5LlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCB0bXBJbnB1dEFycmF5ID0gcE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV07XG5cdFx0XHRcdGxldCB0bXBPdXRwdXRBcnJheSA9IFtdO1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRtcElucHV0QXJyYXkubGVuZ3RoOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGUgZmlsdGVyaW5nIGlzIGNvbXBsZXggYnV0IGFsbG93cyBjb25maWctYmFzZWQgbWV0YXByb2dyYW1taW5nIGRpcmVjdGx5IGZyb20gc2NoZW1hXG5cdFx0XHRcdFx0bGV0IHRtcEtlZXBSZWNvcmQgPSB0aGlzLmNoZWNrRmlsdGVycyhwQWRkcmVzcywgdG1wSW5wdXRBcnJheVtpXSk7XG5cdFx0XHRcdFx0aWYgKHRtcEtlZXBSZWNvcmQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dG1wT3V0cHV0QXJyYXkucHVzaCh0bXBJbnB1dEFycmF5W2ldKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gdG1wT3V0cHV0QXJyYXk7XG5cdFx0XHR9XG5cdFx0XHQvLyBUaGUgb2JqZWN0IGhhcyBiZWVuIGZsYWdnZWQgYXMgYW4gb2JqZWN0IHNldCwgc28gdHJlYXQgaXQgYXMgc3VjaFxuXHRcdFx0ZWxzZSBpZiAodG1wT2JqZWN0VHlwZU1hcmtlckluZGV4ID4gMClcblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcE9iamVjdFByb3BlcnR5TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBPYmplY3RUeXBlTWFya2VySW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mKHBPYmplY3RbdG1wT2JqZWN0UHJvcGVydHlOYW1lXSkgIT0gJ29iamVjdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBXZSBhc2tlZCBmb3IgYSBzZXQgZnJvbSBhbiBhcnJheSBidXQgaXQgaXNudCcgYW4gYXJyYXkuXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHBPYmplY3RbdG1wT2JqZWN0UHJvcGVydHlOYW1lXTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gTm93IGlzIHRoZSBwb2ludCBpbiByZWN1cnNpb24gdG8gcmV0dXJuIHRoZSB2YWx1ZSBpbiB0aGUgYWRkcmVzc1xuXHRcdFx0XHRyZXR1cm4gcE9iamVjdFtwQWRkcmVzc107XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsZXQgdG1wU3ViT2JqZWN0TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBTZXBhcmF0b3JJbmRleCk7XG5cdFx0XHRsZXQgdG1wTmV3QWRkcmVzcyA9IHBBZGRyZXNzLnN1YnN0cmluZyh0bXBTZXBhcmF0b3JJbmRleCsxKTtcblxuXHRcdFx0Ly8gQk9YRUQgRUxFTUVOVFNcblx0XHRcdC8vIFRlc3QgaWYgdGhlIHRtcE5ld0FkZHJlc3MgaXMgYW4gYXJyYXkgb3Igb2JqZWN0XG5cdFx0XHQvLyBDaGVjayBpZiBpdCdzIGEgYm94ZWQgcHJvcGVydHlcblx0XHRcdGxldCB0bXBCcmFja2V0U3RhcnRJbmRleCA9IHRtcFN1Yk9iamVjdE5hbWUuaW5kZXhPZignWycpO1xuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdG9wSW5kZXggPSB0bXBTdWJPYmplY3ROYW1lLmluZGV4T2YoJ10nKTtcblx0XHRcdC8vIEJveGVkIGVsZW1lbnRzIGxvb2sgbGlrZSB0aGlzOlxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWzQyXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWydDb2xvciddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJXZWlnaHRcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgRGlhbWV0ZXJgXVxuXHRcdFx0Ly9cblx0XHRcdC8vIFdoZW4gd2UgYXJlIHBhc3NlZCBTb21lT2JqZWN0W1wiTmFtZVwiXSB0aGlzIGNvZGUgYmVsb3cgcmVjdXJzZXMgYXMgaWYgaXQgd2VyZSBTb21lT2JqZWN0Lk5hbWVcblx0XHRcdC8vIFRoZSByZXF1aXJlbWVudHMgdG8gZGV0ZWN0IGEgYm94ZWQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0aWYgKCh0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApIFxuXHRcdFx0Ly8gICAgMikgVGhlIGVuZCBicmFja2V0IGhhcyBzb21ldGhpbmcgYmV0d2VlbiB0aGVtXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4ID4gdG1wQnJhY2tldFN0YXJ0SW5kZXgpIFxuXHRcdFx0Ly8gICAgMykgVGhlcmUgaXMgZGF0YSBcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggLSB0bXBCcmFja2V0U3RhcnRJbmRleCA+IDEpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSB0bXBTdWJPYmplY3ROYW1lLnN1YnN0cmluZygwLCB0bXBCcmFja2V0U3RhcnRJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdG1wU3ViT2JqZWN0TmFtZS5zdWJzdHJpbmcodG1wQnJhY2tldFN0YXJ0SW5kZXgrMSwgdG1wQnJhY2tldFN0b3BJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TnVtYmVyID0gcGFyc2VJbnQodG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSwgMTApO1xuXG5cdFx0XHRcdC8vIEd1YXJkOiBJZiB0aGUgcmVmZXJyYW50IGlzIGEgbnVtYmVyIGFuZCB0aGUgYm94ZWQgcHJvcGVydHkgaXMgbm90IGFuIGFycmF5LCBvciB2aWNlIHZlcnNhLCByZXR1cm4gdW5kZWZpbmVkLlxuXHRcdFx0XHQvLyAgICAgICAgVGhpcyBzZWVtcyBjb25mdXNpbmcgdG8gbWUgYXQgZmlyc3QgcmVhZCwgc28gZXhwbGFpbmF0aW9uOlxuXHRcdFx0XHQvLyAgICAgICAgSXMgdGhlIEJveGVkIE9iamVjdCBhbiBBcnJheT8gIFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIEFuZCBpcyB0aGUgUmVmZXJlbmNlIGluc2lkZSB0aGUgYm94ZWQgT2JqZWN0IG5vdCBhIG51bWJlcj8gVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgLS0+ICBTbyB3aGVuIHRoZXNlIGFyZSBpbiBhZ3JlZW1lbnQsIGl0J3MgYW4gaW1wb3NzaWJsZSBhY2Nlc3Mgc3RhdGVcblx0XHRcdFx0Ly8gVGhpcyBjb3VsZCBiZSBhIGZhaWx1cmUgaW4gdGhlIHJlY3Vyc2lvbiBjaGFpbiBiZWNhdXNlIHRoZXkgcGFzc2VkIHNvbWV0aGluZyBsaWtlIHRoaXMgaW46XG5cdFx0XHRcdC8vICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHNbMV0uVGFyZHlcblx0XHRcdFx0Ly8gICAgICAgQlVUXG5cdFx0XHRcdC8vICAgICAgICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50cyBpcyBhbiBvYmplY3QsIHNvIHRoZSBbMV0uVGFyZHkgaXMgbm90IHBvc3NpYmxlIHRvIGFjY2Vzc1xuXHRcdFx0XHQvLyBUaGlzIGNvdWxkIGJlIGEgZmFpbHVyZSBpbiB0aGUgcmVjdXJzaW9uIGNoYWluIGJlY2F1c2UgdGhleSBwYXNzZWQgc29tZXRoaW5nIGxpa2UgdGhpcyBpbjpcblx0XHRcdFx0Ly8gICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50c1tcIkphbmVEb2VcIl0uR3JhZGVcblx0XHRcdFx0Ly8gICAgICAgQlVUXG5cdFx0XHRcdC8vICAgICAgICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50cyBpcyBhbiBhcnJheSwgc28gdGhlIFtcIkphbmVEb2VcIl0uR3JhZGUgaXMgbm90IHBvc3NpYmxlIHRvIGFjY2Vzc1xuXHRcdFx0XHQvLyBUT0RPOiBTaG91bGQgdGhpcyBiZSBhbiBlcnJvciBvciBzb21ldGhpbmc/ICBTaG91bGQgd2Uga2VlcCBhIGxvZyBvZiBmYWlsdXJlcyBsaWtlIHRoaXM/XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSA9PSBpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL1RoaXMgaXMgYSBicmFja2V0ZWQgdmFsdWVcblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gcmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFubWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIENvbnRpbnVlIHRvIG1hbmFnZSB0aGUgcGFyZW50IGFkZHJlc3MgZm9yIHJlY3Vyc2lvblxuXHRcdFx0XHRcdHRtcFBhcmVudEFkZHJlc3MgPSBgJHt0bXBQYXJlbnRBZGRyZXNzfSR7KHRtcFBhcmVudEFkZHJlc3MubGVuZ3RoID4gMCkgPyAnLicgOiAnJ30ke3RtcFN1Yk9iamVjdE5hbWV9YDtcblx0XHRcdFx0XHQvLyBSZWN1cnNlIGRpcmVjdGx5IGludG8gdGhlIHN1Ym9iamVjdFxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlSZWZlcmVuY2VdLCB0bXBOZXdBZGRyZXNzLCB0bXBQYXJlbnRBZGRyZXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBDb250aW51ZSB0byBtYW5hZ2UgdGhlIHBhcmVudCBhZGRyZXNzIGZvciByZWN1cnNpb25cblx0XHRcdFx0XHR0bXBQYXJlbnRBZGRyZXNzID0gYCR7dG1wUGFyZW50QWRkcmVzc30keyh0bXBQYXJlbnRBZGRyZXNzLmxlbmd0aCA+IDApID8gJy4nIDogJyd9JHt0bXBTdWJPYmplY3ROYW1lfWA7XG5cdFx0XHRcdFx0Ly8gV2UgcGFyc2VkIGEgdmFsaWQgbnVtYmVyIG91dCBvZiB0aGUgYm94ZWQgcHJvcGVydHkgbmFtZSwgc28gcmVjdXJzZSBpbnRvIHRoZSBhcnJheVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlOdW1iZXJdLCB0bXBOZXdBZGRyZXNzLCB0bXBQYXJlbnRBZGRyZXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBzZXQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0ZWxzZSBpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaXMgYWZ0ZXIgdGhlIHN0YXJ0IGJyYWNrZXRcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBub3RoaW5nIGluIHRoZSBicmFja2V0c1xuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID09IDEpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSBwQWRkcmVzcy5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gV2UgYXNrZWQgZm9yIGEgc2V0IGZyb20gYW4gYXJyYXkgYnV0IGl0IGlzbnQnIGFuIGFycmF5LlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFdlIG5lZWQgdG8gZW51bWVyYXRlIHRoZSBhcnJheSBhbmQgZ3JhYiB0aGUgYWRkcmVzc2VzIGZyb20gdGhlcmUuXG5cdFx0XHRcdGxldCB0bXBBcnJheVByb3BlcnR5ID0gcE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV07XG5cdFx0XHRcdC8vIE1hbmFnaW5nIHRoZSBwYXJlbnQgYWRkcmVzcyBpcyBhIGJpdCBtb3JlIGNvbXBsZXggaGVyZSAtLSB0aGUgYm94IHdpbGwgYmUgYWRkZWQgZm9yIGVhY2ggZWxlbWVudC5cblx0XHRcdFx0dG1wUGFyZW50QWRkcmVzcyA9IGAke3RtcFBhcmVudEFkZHJlc3N9JHsodG1wUGFyZW50QWRkcmVzcy5sZW5ndGggPiAwKSA/ICcuJyA6ICcnfSR7dG1wQm94ZWRQcm9wZXJ0eU5hbWV9YDtcblx0XHRcdFx0Ly8gVGhlIGNvbnRhaW5lciBvYmplY3QgaXMgd2hlcmUgd2UgaGF2ZSB0aGUgXCJBZGRyZXNzXCI6U09NRVZBTFVFIHBhaXJzXG5cdFx0XHRcdGxldCB0bXBDb250YWluZXJPYmplY3QgPSB7fTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0bXBBcnJheVByb3BlcnR5Lmxlbmd0aDsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHRtcFByb3BlcnR5UGFyZW50QWRkcmVzcyA9IGAke3RtcFBhcmVudEFkZHJlc3N9WyR7aX1dYDtcblx0XHRcdFx0XHRsZXQgdG1wVmFsdWUgPSB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW2ldLCB0bXBOZXdBZGRyZXNzLCB0bXBQcm9wZXJ0eVBhcmVudEFkZHJlc3MpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHRtcENvbnRhaW5lck9iamVjdFtgJHt0bXBQcm9wZXJ0eVBhcmVudEFkZHJlc3N9LiR7dG1wTmV3QWRkcmVzc31gXSA9IHRtcFZhbHVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHRtcENvbnRhaW5lck9iamVjdDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gT0JKRUNUIFNFVFxuXHRcdFx0Ly8gTm90ZSB0aGlzIHdpbGwgbm90IHdvcmsgd2l0aCBhIGJyYWNrZXQgaW4gdGhlIHNhbWUgYWRkcmVzcyBib3ggc2V0XG5cdFx0XHRsZXQgdG1wT2JqZWN0VHlwZU1hcmtlckluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZigne30nKTtcblx0XHRcdGlmICh0bXBPYmplY3RUeXBlTWFya2VySW5kZXggPiAwKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wT2JqZWN0UHJvcGVydHlOYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcE9iamVjdFR5cGVNYXJrZXJJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YocE9iamVjdFt0bXBPYmplY3RQcm9wZXJ0eU5hbWVdKSAhPSAnb2JqZWN0Jylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFdlIGFza2VkIGZvciBhIHNldCBmcm9tIGFuIGFycmF5IGJ1dCBpdCBpc250JyBhbiBhcnJheS5cblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBXZSBuZWVkIHRvIGVudW1lcmF0ZSB0aGUgT2JqZWN0IGFuZCBncmFiIHRoZSBhZGRyZXNzZXMgZnJvbSB0aGVyZS5cblx0XHRcdFx0bGV0IHRtcE9iamVjdFByb3BlcnR5ID0gcE9iamVjdFt0bXBPYmplY3RQcm9wZXJ0eU5hbWVdO1xuXHRcdFx0XHRsZXQgdG1wT2JqZWN0UHJvcGVydHlLZXlzID0gT2JqZWN0LmtleXModG1wT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHQvLyBNYW5hZ2luZyB0aGUgcGFyZW50IGFkZHJlc3MgaXMgYSBiaXQgbW9yZSBjb21wbGV4IGhlcmUgLS0gdGhlIGJveCB3aWxsIGJlIGFkZGVkIGZvciBlYWNoIGVsZW1lbnQuXG5cdFx0XHRcdHRtcFBhcmVudEFkZHJlc3MgPSBgJHt0bXBQYXJlbnRBZGRyZXNzfSR7KHRtcFBhcmVudEFkZHJlc3MubGVuZ3RoID4gMCkgPyAnLicgOiAnJ30ke3RtcE9iamVjdFByb3BlcnR5TmFtZX1gO1xuXHRcdFx0XHQvLyBUaGUgY29udGFpbmVyIG9iamVjdCBpcyB3aGVyZSB3ZSBoYXZlIHRoZSBcIkFkZHJlc3NcIjpTT01FVkFMVUUgcGFpcnNcblx0XHRcdFx0bGV0IHRtcENvbnRhaW5lck9iamVjdCA9IHt9O1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRtcE9iamVjdFByb3BlcnR5S2V5cy5sZW5ndGg7IGkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB0bXBQcm9wZXJ0eVBhcmVudEFkZHJlc3MgPSBgJHt0bXBQYXJlbnRBZGRyZXNzfS4ke3RtcE9iamVjdFByb3BlcnR5S2V5c1tpXX1gO1xuXHRcdFx0XHRcdGxldCB0bXBWYWx1ZSA9IHRoaXMuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBPYmplY3RQcm9wZXJ0eU5hbWVdW3RtcE9iamVjdFByb3BlcnR5S2V5c1tpXV0sIHRtcE5ld0FkZHJlc3MsIHRtcFByb3BlcnR5UGFyZW50QWRkcmVzcyk7XG5cdFxuXHRcdFx0XHRcdC8vIFRoZSBmaWx0ZXJpbmcgaXMgY29tcGxleCBidXQgYWxsb3dzIGNvbmZpZy1iYXNlZCBtZXRhcHJvZ3JhbW1pbmcgZGlyZWN0bHkgZnJvbSBzY2hlbWFcblx0XHRcdFx0XHRsZXQgdG1wS2VlcFJlY29yZCA9IHRoaXMuY2hlY2tGaWx0ZXJzKHBBZGRyZXNzLCB0bXBWYWx1ZSk7XG5cdFx0XHRcdFx0aWYgKHRtcEtlZXBSZWNvcmQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dG1wQ29udGFpbmVyT2JqZWN0W2Ake3RtcFByb3BlcnR5UGFyZW50QWRkcmVzc30uJHt0bXBOZXdBZGRyZXNzfWBdID0gdG1wVmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHRtcENvbnRhaW5lck9iamVjdDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgYW4gb2JqZWN0IHByb3BlcnR5IGFscmVhZHkgbmFtZWQgZm9yIHRoZSBzdWIgb2JqZWN0LCBidXQgaXQgaXNuJ3QgYW4gb2JqZWN0XG5cdFx0XHQvLyB0aGVuIHRoZSBzeXN0ZW0gY2FuJ3Qgc2V0IHRoZSB2YWx1ZSBpbiB0aGVyZS4gIEVycm9yIGFuZCBhYm9ydCFcblx0XHRcdGlmIChwT2JqZWN0Lmhhc093blByb3BlcnR5KHRtcFN1Yk9iamVjdE5hbWUpICYmIHR5cGVvZihwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwT2JqZWN0Lmhhc093blByb3BlcnR5KHRtcFN1Yk9iamVjdE5hbWUpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGEgc3Vib2JqZWN0IHBhc3MgdGhhdCB0byB0aGUgcmVjdXJzaXZlIHRoaW5neVxuXHRcdFx0XHQvLyBDb250aW51ZSB0byBtYW5hZ2UgdGhlIHBhcmVudCBhZGRyZXNzIGZvciByZWN1cnNpb25cblx0XHRcdFx0dG1wUGFyZW50QWRkcmVzcyA9IGAke3RtcFBhcmVudEFkZHJlc3N9JHsodG1wUGFyZW50QWRkcmVzcy5sZW5ndGggPiAwKSA/ICcuJyA6ICcnfSR7dG1wU3ViT2JqZWN0TmFtZX1gO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdLCB0bXBOZXdBZGRyZXNzLCB0bXBQYXJlbnRBZGRyZXNzKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gQ3JlYXRlIGEgc3Vib2JqZWN0IGFuZCB0aGVuIHBhc3MgdGhhdFxuXHRcdFx0XHQvLyBDb250aW51ZSB0byBtYW5hZ2UgdGhlIHBhcmVudCBhZGRyZXNzIGZvciByZWN1cnNpb25cblx0XHRcdFx0dG1wUGFyZW50QWRkcmVzcyA9IGAke3RtcFBhcmVudEFkZHJlc3N9JHsodG1wUGFyZW50QWRkcmVzcy5sZW5ndGggPiAwKSA/ICcuJyA6ICcnfSR7dG1wU3ViT2JqZWN0TmFtZX1gO1xuXHRcdFx0XHRwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdID0ge307XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0sIHRtcE5ld0FkZHJlc3MsIHRtcFBhcmVudEFkZHJlc3MpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFNldCB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBhdCBhbiBhZGRyZXNzXG5cdHNldFZhbHVlQXRBZGRyZXNzIChwT2JqZWN0LCBwQWRkcmVzcywgcFZhbHVlKVxuXHR7XG5cdFx0Ly8gTWFrZSBzdXJlIHBPYmplY3QgaXMgYW4gb2JqZWN0XG5cdFx0aWYgKHR5cGVvZihwT2JqZWN0KSAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuXHRcdC8vIE1ha2Ugc3VyZSBwQWRkcmVzcyBpcyBhIHN0cmluZ1xuXHRcdGlmICh0eXBlb2YocEFkZHJlc3MpICE9ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG5cblx0XHRsZXQgdG1wU2VwYXJhdG9ySW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCcuJyk7XG5cblx0XHRpZiAodG1wU2VwYXJhdG9ySW5kZXggPT0gLTEpXG5cdFx0e1xuXHRcdFx0Ly8gQ2hlY2sgaWYgaXQncyBhIGJveGVkIHByb3BlcnR5XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0YXJ0SW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCdbJyk7XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0b3BJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJ10nKTtcblx0XHRcdC8vIEJveGVkIGVsZW1lbnRzIGxvb2sgbGlrZSB0aGlzOlxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWzEwXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWydOYW1lJ11cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tcIkFnZVwiXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW2BDb3N0YF1cblx0XHRcdC8vXG5cdFx0XHQvLyBXaGVuIHdlIGFyZSBwYXNzZWQgU29tZU9iamVjdFtcIk5hbWVcIl0gdGhpcyBjb2RlIGJlbG93IHJlY3Vyc2VzIGFzIGlmIGl0IHdlcmUgU29tZU9iamVjdC5OYW1lXG5cdFx0XHQvLyBUaGUgcmVxdWlyZW1lbnRzIHRvIGRldGVjdCBhIGJveGVkIGVsZW1lbnQgYXJlOlxuXHRcdFx0Ly8gICAgMSkgVGhlIHN0YXJ0IGJyYWNrZXQgaXMgYWZ0ZXIgY2hhcmFjdGVyIDBcblx0XHRcdGlmICgodG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSBcblx0XHRcdC8vICAgIDIpIFRoZSBlbmQgYnJhY2tldCBoYXMgc29tZXRoaW5nIGJldHdlZW4gdGhlbVxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCA+IHRtcEJyYWNrZXRTdGFydEluZGV4KSBcblx0XHRcdC8vICAgIDMpIFRoZXJlIGlzIGRhdGEgXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4IC0gdG1wQnJhY2tldFN0YXJ0SW5kZXggPiAxKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gVGhlIFwiTmFtZVwiIG9mIHRoZSBPYmplY3QgY29udGFpbmVkIHRvbyB0aGUgbGVmdCBvZiB0aGUgYnJhY2tldFxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSBwQWRkcmVzcy5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHQvLyBJZiB0aGUgc3VicHJvcGVydHkgZG9lc24ndCB0ZXN0IGFzIGEgcHJvcGVyIE9iamVjdCwgbm9uZSBvZiB0aGUgcmVzdCBvZiB0aGlzIGlzIHBvc3NpYmxlLlxuXHRcdFx0XHQvLyBUaGlzIGlzIGEgcmFyZSBjYXNlIHdoZXJlIEFycmF5cyB0ZXN0aW5nIGFzIE9iamVjdHMgaXMgdXNlZnVsXG5cdFx0XHRcdGlmICh0eXBlb2YocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pICE9PSAnb2JqZWN0Jylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFRoZSBcIlJlZmVyZW5jZVwiIHRvIHRoZSBwcm9wZXJ0eSB3aXRoaW4gaXQsIGVpdGhlciBhbiBhcnJheSBlbGVtZW50IG9yIG9iamVjdCBwcm9wZXJ0eVxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHBBZGRyZXNzLnN1YnN0cmluZyh0bXBCcmFja2V0U3RhcnRJbmRleCsxLCB0bXBCcmFja2V0U3RvcEluZGV4KS50cmltKCk7XG5cdFx0XHRcdC8vIEF0dGVtcHQgdG8gcGFyc2UgdGhlIHJlZmVyZW5jZSBhcyBhIG51bWJlciwgd2hpY2ggd2lsbCBiZSB1c2VkIGFzIGFuIGFycmF5IGVsZW1lbnRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOdW1iZXIgPSBwYXJzZUludCh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlLCAxMCk7XG5cblx0XHRcdFx0Ly8gR3VhcmQ6IElmIHRoZSByZWZlcnJhbnQgaXMgYSBudW1iZXIgYW5kIHRoZSBib3hlZCBwcm9wZXJ0eSBpcyBub3QgYW4gYXJyYXksIG9yIHZpY2UgdmVyc2EsIHJldHVybiB1bmRlZmluZWQuXG5cdFx0XHRcdC8vICAgICAgICBUaGlzIHNlZW1zIGNvbmZ1c2luZyB0byBtZSBhdCBmaXJzdCByZWFkLCBzbyBleHBsYWluYXRpb246XG5cdFx0XHRcdC8vICAgICAgICBJcyB0aGUgQm94ZWQgT2JqZWN0IGFuIEFycmF5PyAgVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgQW5kIGlzIHRoZSBSZWZlcmVuY2UgaW5zaWRlIHRoZSBib3hlZCBPYmplY3Qgbm90IGEgbnVtYmVyPyBUUlVFXG5cdFx0XHRcdC8vICAgICAgICAtLT4gIFNvIHdoZW4gdGhlc2UgYXJlIGluIGFncmVlbWVudCwgaXQncyBhbiBpbXBvc3NpYmxlIGFjY2VzcyBzdGF0ZVxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgPT0gaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyAgICA0KSBJZiB0aGUgbWlkZGxlIHBhcnQgaXMgKm9ubHkqIGEgbnVtYmVyIChubyBzaW5nbGUsIGRvdWJsZSBvciBiYWNrdGljayBxdW90ZXMpIGl0IGlzIGFuIGFycmF5IGVsZW1lbnQsXG5cdFx0XHRcdC8vICAgICAgIG90aGVyd2lzZSB3ZSB3aWxsIHRyeSB0byB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRcdC8vIFdlIHdvdWxkIGV4cGVjdCB0aGUgcHJvcGVydHkgdG8gYmUgd3JhcHBlZCBpbiBzb21lIGtpbmQgb2YgcXVvdGVzIHNvIHN0cmlwIHRoZW1cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIFJldHVybiB0aGUgdmFsdWUgaW4gdGhlIHByb3BlcnR5XG5cdFx0XHRcdFx0cE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZV0gPSBwVmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eU51bWJlcl0gPSBwVmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gTm93IGlzIHRoZSB0aW1lIGluIHJlY3Vyc2lvbiB0byBzZXQgdGhlIHZhbHVlIGluIHRoZSBvYmplY3Rcblx0XHRcdFx0cE9iamVjdFtwQWRkcmVzc10gPSBwVmFsdWU7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGV0IHRtcFN1Yk9iamVjdE5hbWUgPSBwQWRkcmVzcy5zdWJzdHJpbmcoMCwgdG1wU2VwYXJhdG9ySW5kZXgpO1xuXHRcdFx0bGV0IHRtcE5ld0FkZHJlc3MgPSBwQWRkcmVzcy5zdWJzdHJpbmcodG1wU2VwYXJhdG9ySW5kZXgrMSk7XG5cblx0XHRcdC8vIFRlc3QgaWYgdGhlIHRtcE5ld0FkZHJlc3MgaXMgYW4gYXJyYXkgb3Igb2JqZWN0XG5cdFx0XHQvLyBDaGVjayBpZiBpdCdzIGEgYm94ZWQgcHJvcGVydHlcblx0XHRcdGxldCB0bXBCcmFja2V0U3RhcnRJbmRleCA9IHRtcFN1Yk9iamVjdE5hbWUuaW5kZXhPZignWycpO1xuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdG9wSW5kZXggPSB0bXBTdWJPYmplY3ROYW1lLmluZGV4T2YoJ10nKTtcblx0XHRcdC8vIEJveGVkIGVsZW1lbnRzIGxvb2sgbGlrZSB0aGlzOlxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWzQyXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWydDb2xvciddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJXZWlnaHRcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgRGlhbWV0ZXJgXVxuXHRcdFx0Ly9cblx0XHRcdC8vIFdoZW4gd2UgYXJlIHBhc3NlZCBTb21lT2JqZWN0W1wiTmFtZVwiXSB0aGlzIGNvZGUgYmVsb3cgcmVjdXJzZXMgYXMgaWYgaXQgd2VyZSBTb21lT2JqZWN0Lk5hbWVcblx0XHRcdC8vIFRoZSByZXF1aXJlbWVudHMgdG8gZGV0ZWN0IGEgYm94ZWQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0aWYgKCh0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApIFxuXHRcdFx0Ly8gICAgMikgVGhlIGVuZCBicmFja2V0IGhhcyBzb21ldGhpbmcgYmV0d2VlbiB0aGVtXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4ID4gdG1wQnJhY2tldFN0YXJ0SW5kZXgpIFxuXHRcdFx0Ly8gICAgMykgVGhlcmUgaXMgZGF0YSBcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggLSB0bXBCcmFja2V0U3RhcnRJbmRleCA+IDEpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSB0bXBTdWJPYmplY3ROYW1lLnN1YnN0cmluZygwLCB0bXBCcmFja2V0U3RhcnRJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdG1wU3ViT2JqZWN0TmFtZS5zdWJzdHJpbmcodG1wQnJhY2tldFN0YXJ0SW5kZXgrMSwgdG1wQnJhY2tldFN0b3BJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TnVtYmVyID0gcGFyc2VJbnQodG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSwgMTApO1xuXG5cdFx0XHRcdC8vIEd1YXJkOiBJZiB0aGUgcmVmZXJyYW50IGlzIGEgbnVtYmVyIGFuZCB0aGUgYm94ZWQgcHJvcGVydHkgaXMgbm90IGFuIGFycmF5LCBvciB2aWNlIHZlcnNhLCByZXR1cm4gdW5kZWZpbmVkLlxuXHRcdFx0XHQvLyAgICAgICAgVGhpcyBzZWVtcyBjb25mdXNpbmcgdG8gbWUgYXQgZmlyc3QgcmVhZCwgc28gZXhwbGFpbmF0aW9uOlxuXHRcdFx0XHQvLyAgICAgICAgSXMgdGhlIEJveGVkIE9iamVjdCBhbiBBcnJheT8gIFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIEFuZCBpcyB0aGUgUmVmZXJlbmNlIGluc2lkZSB0aGUgYm94ZWQgT2JqZWN0IG5vdCBhIG51bWJlcj8gVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgLS0+ICBTbyB3aGVuIHRoZXNlIGFyZSBpbiBhZ3JlZW1lbnQsIGl0J3MgYW4gaW1wb3NzaWJsZSBhY2Nlc3Mgc3RhdGVcblx0XHRcdFx0Ly8gVGhpcyBjb3VsZCBiZSBhIGZhaWx1cmUgaW4gdGhlIHJlY3Vyc2lvbiBjaGFpbiBiZWNhdXNlIHRoZXkgcGFzc2VkIHNvbWV0aGluZyBsaWtlIHRoaXMgaW46XG5cdFx0XHRcdC8vICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHNbMV0uVGFyZHlcblx0XHRcdFx0Ly8gICAgICAgQlVUXG5cdFx0XHRcdC8vICAgICAgICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50cyBpcyBhbiBvYmplY3QsIHNvIHRoZSBbMV0uVGFyZHkgaXMgbm90IHBvc3NpYmxlIHRvIGFjY2Vzc1xuXHRcdFx0XHQvLyBUaGlzIGNvdWxkIGJlIGEgZmFpbHVyZSBpbiB0aGUgcmVjdXJzaW9uIGNoYWluIGJlY2F1c2UgdGhleSBwYXNzZWQgc29tZXRoaW5nIGxpa2UgdGhpcyBpbjpcblx0XHRcdFx0Ly8gICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50c1tcIkphbmVEb2VcIl0uR3JhZGVcblx0XHRcdFx0Ly8gICAgICAgQlVUXG5cdFx0XHRcdC8vICAgICAgICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50cyBpcyBhbiBhcnJheSwgc28gdGhlIFtcIkphbmVEb2VcIl0uR3JhZGUgaXMgbm90IHBvc3NpYmxlIHRvIGFjY2Vzc1xuXHRcdFx0XHQvLyBUT0RPOiBTaG91bGQgdGhpcyBiZSBhbiBlcnJvciBvciBzb21ldGhpbmc/ICBTaG91bGQgd2Uga2VlcCBhIGxvZyBvZiBmYWlsdXJlcyBsaWtlIHRoaXM/XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSA9PSBpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vVGhpcyBpcyBhIGJyYWNrZXRlZCB2YWx1ZVxuXHRcdFx0XHQvLyAgICA0KSBJZiB0aGUgbWlkZGxlIHBhcnQgaXMgKm9ubHkqIGEgbnVtYmVyIChubyBzaW5nbGUsIGRvdWJsZSBvciBiYWNrdGljayBxdW90ZXMpIGl0IGlzIGFuIGFycmF5IGVsZW1lbnQsXG5cdFx0XHRcdC8vICAgICAgIG90aGVyd2lzZSB3ZSB3aWxsIHRyeSB0byByZWF0IGl0IGFzIGEgZHluYW1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdGlmIChpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFRoaXMgaXNuJ3QgYSBudW1iZXIgLi4uIGxldCdzIHRyZWF0IGl0IGFzIGEgZHluYW5taWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ1wiJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnYCcsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoXCInXCIsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBkaXJlY3RseSBpbnRvIHRoZSBzdWJvYmplY3Rcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5zZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlXSwgdG1wTmV3QWRkcmVzcywgcFZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBXZSBwYXJzZWQgYSB2YWxpZCBudW1iZXIgb3V0IG9mIHRoZSBib3hlZCBwcm9wZXJ0eSBuYW1lLCBzbyByZWN1cnNlIGludG8gdGhlIGFycmF5XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eU51bWJlcl0sIHRtcE5ld0FkZHJlc3MsIHBWYWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgYW4gb2JqZWN0IHByb3BlcnR5IGFscmVhZHkgbmFtZWQgZm9yIHRoZSBzdWIgb2JqZWN0LCBidXQgaXQgaXNuJ3QgYW4gb2JqZWN0XG5cdFx0XHQvLyB0aGVuIHRoZSBzeXN0ZW0gY2FuJ3Qgc2V0IHRoZSB2YWx1ZSBpbiB0aGVyZS4gIEVycm9yIGFuZCBhYm9ydCFcblx0XHRcdGlmIChwT2JqZWN0Lmhhc093blByb3BlcnR5KHRtcFN1Yk9iamVjdE5hbWUpICYmIHR5cGVvZihwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICghcE9iamVjdC5oYXNPd25Qcm9wZXJ0eSgnX19FUlJPUicpKVxuXHRcdFx0XHRcdHBPYmplY3RbJ19fRVJST1InXSA9IHt9O1xuXHRcdFx0XHQvLyBQdXQgaXQgaW4gYW4gZXJyb3Igb2JqZWN0IHNvIGRhdGEgaXNuJ3QgbG9zdFxuXHRcdFx0XHRwT2JqZWN0WydfX0VSUk9SJ11bcEFkZHJlc3NdID0gcFZhbHVlO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwT2JqZWN0Lmhhc093blByb3BlcnR5KHRtcFN1Yk9iamVjdE5hbWUpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGEgc3Vib2JqZWN0IHBhc3MgdGhhdCB0byB0aGUgcmVjdXJzaXZlIHRoaW5neVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5zZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdLCB0bXBOZXdBZGRyZXNzLCBwVmFsdWUpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBDcmVhdGUgYSBzdWJvYmplY3QgYW5kIHRoZW4gcGFzcyB0aGF0XG5cdFx0XHRcdHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0gPSB7fTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSwgdG1wTmV3QWRkcmVzcywgcFZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFueWZlc3RPYmplY3RBZGRyZXNzUmVzb2x2ZXI7IiwiLyoqXG4qIEBsaWNlbnNlIE1JVFxuKiBAYXV0aG9yIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbiovXG5sZXQgbGliU2ltcGxlTG9nID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1Mb2dUb0NvbnNvbGUuanMnKTtcblxubGV0IGxpYlByZWNlZGVudCA9IHJlcXVpcmUoJ3ByZWNlZGVudCcpO1xuXG5sZXQgbGliSGFzaFRyYW5zbGF0aW9uID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1IYXNoVHJhbnNsYXRpb24uanMnKTtcbmxldCBsaWJPYmplY3RBZGRyZXNzUmVzb2x2ZXIgPSByZXF1aXJlKCcuL01hbnlmZXN0LU9iamVjdEFkZHJlc3NSZXNvbHZlci5qcycpO1xubGV0IGxpYk9iamVjdEFkZHJlc3NHZW5lcmF0aW9uID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1PYmplY3RBZGRyZXNzR2VuZXJhdGlvbi5qcycpO1xubGV0IGxpYlNjaGVtYU1hbmlwdWxhdGlvbiA9IHJlcXVpcmUoJy4vTWFueWZlc3QtU2NoZW1hTWFuaXB1bGF0aW9uLmpzJyk7XG5cblxuLyoqXG4qIE1hbnlmZXN0IG9iamVjdCBhZGRyZXNzLWJhc2VkIGRlc2NyaXB0aW9ucyBhbmQgbWFuaXB1bGF0aW9ucy5cbipcbiogQGNsYXNzIE1hbnlmZXN0XG4qL1xuY2xhc3MgTWFueWZlc3Rcbntcblx0Y29uc3RydWN0b3IocE1hbmlmZXN0LCBwSW5mb0xvZywgcEVycm9yTG9nLCBwT3B0aW9ucylcblx0e1xuXHRcdC8vIFdpcmUgaW4gbG9nZ2luZ1xuXHRcdHRoaXMubG9nSW5mbyA9ICh0eXBlb2YocEluZm9Mb2cpID09PSAnZnVuY3Rpb24nKSA/IHBJbmZvTG9nIDogbGliU2ltcGxlTG9nO1xuXHRcdHRoaXMubG9nRXJyb3IgPSAodHlwZW9mKHBFcnJvckxvZykgPT09ICdmdW5jdGlvbicpID8gcEVycm9yTG9nIDogbGliU2ltcGxlTG9nO1xuXG5cdFx0Ly8gQ3JlYXRlIGFuIG9iamVjdCBhZGRyZXNzIHJlc29sdmVyIGFuZCBtYXAgaW4gdGhlIGZ1bmN0aW9uc1xuXHRcdHRoaXMub2JqZWN0QWRkcmVzc1Jlc29sdmVyID0gbmV3IGxpYk9iamVjdEFkZHJlc3NSZXNvbHZlcih0aGlzLmxvZ0luZm8sIHRoaXMubG9nRXJyb3IpO1xuXG5cdFx0dGhpcy5vcHRpb25zID0gKFxuXHRcdFx0e1xuXHRcdFx0XHRzdHJpY3Q6IGZhbHNlLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWVzOiBcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcIlN0cmluZ1wiOiBcIlwiLFxuXHRcdFx0XHRcdFx0XCJOdW1iZXJcIjogMCxcblx0XHRcdFx0XHRcdFwiRmxvYXRcIjogMC4wLFxuXHRcdFx0XHRcdFx0XCJJbnRlZ2VyXCI6IDAsXG5cdFx0XHRcdFx0XHRcIkJvb2xlYW5cIjogZmFsc2UsXG5cdFx0XHRcdFx0XHRcIkJpbmFyeVwiOiAwLFxuXHRcdFx0XHRcdFx0XCJEYXRlVGltZVwiOiAwLFxuXHRcdFx0XHRcdFx0XCJBcnJheVwiOiBbXSxcblx0XHRcdFx0XHRcdFwiT2JqZWN0XCI6IHt9LFxuXHRcdFx0XHRcdFx0XCJOdWxsXCI6IG51bGxcblx0XHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuc2NvcGUgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5lbGVtZW50QWRkcmVzc2VzID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMuZWxlbWVudEhhc2hlcyA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLmVsZW1lbnREZXNjcmlwdG9ycyA9IHVuZGVmaW5lZDtcblx0XHQvLyBUaGlzIGNhbiBjYXVzZSBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgY2hhaW4sIHNvIGl0IG9ubHkgZ2V0cyBpbml0aWFsaXplZCBpZiB0aGUgc2NoZW1hIHNwZWNpZmljYWxseSBjYWxscyBmb3IgaXQuXG5cdFx0dGhpcy5kYXRhU29sdmVycyA9IHVuZGVmaW5lZDtcblx0XHQvLyBTbyBzb2x2ZXJzIGNhbiB1c2UgdGhlaXIgb3duIHN0YXRlXG5cdFx0dGhpcy5kYXRhU29sdmVyU3RhdGUgPSB1bmRlZmluZWQ7XG5cblx0XHR0aGlzLnJlc2V0KCk7XG5cblx0XHRpZiAodHlwZW9mKHBNYW5pZmVzdCkgPT09ICdvYmplY3QnKVxuXHRcdHtcblx0XHRcdHRoaXMubG9hZE1hbmlmZXN0KHBNYW5pZmVzdCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zY2hlbWFNYW5pcHVsYXRpb25zID0gbmV3IGxpYlNjaGVtYU1hbmlwdWxhdGlvbih0aGlzLmxvZ0luZm8sIHRoaXMubG9nRXJyb3IpO1xuXHRcdHRoaXMub2JqZWN0QWRkcmVzc0dlbmVyYXRpb24gPSBuZXcgbGliT2JqZWN0QWRkcmVzc0dlbmVyYXRpb24odGhpcy5sb2dJbmZvLCB0aGlzLmxvZ0Vycm9yKTtcblxuXHRcdHRoaXMuaGFzaFRyYW5zbGF0aW9ucyA9IG5ldyBsaWJIYXNoVHJhbnNsYXRpb24odGhpcy5sb2dJbmZvLCB0aGlzLmxvZ0Vycm9yKTtcblx0fVxuXG5cdC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cdCAqIFNjaGVtYSBNYW5pZmVzdCBMb2FkaW5nLCBSZWFkaW5nLCBNYW5pcHVsYXRpb24gYW5kIFNlcmlhbGl6YXRpb24gRnVuY3Rpb25zXG5cdCAqL1xuXG5cdC8vIFJlc2V0IGNyaXRpY2FsIG1hbmlmZXN0IHByb3BlcnRpZXNcblx0cmVzZXQoKVxuXHR7XG5cdFx0dGhpcy5zY29wZSA9ICdERUZBVUxUJztcblx0XHR0aGlzLmVsZW1lbnRBZGRyZXNzZXMgPSBbXTtcblx0XHR0aGlzLmVsZW1lbnRIYXNoZXMgPSB7fTtcblx0XHR0aGlzLmVsZW1lbnREZXNjcmlwdG9ycyA9IHt9O1xuXHRcdHRoaXMuZGF0YVNvbHZlcnMgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5kYXRhU29sdmVyU3RhdGUgPSB7fTtcblxuXHRcdHRoaXMubGliRWx1Y2lkYXRvciA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLm9iamVjdEFkZHJlc3NSZXNvbHZlci5lbHVjaWRhdG9yU29sdmVyID0gZmFsc2U7XG5cdH1cblxuXHRjbG9uZSgpXG5cdHtcblx0XHQvLyBNYWtlIGEgY29weSBvZiB0aGUgb3B0aW9ucyBpbi1wbGFjZVxuXHRcdGxldCB0bXBOZXdPcHRpb25zID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm9wdGlvbnMpKTtcblxuXHRcdGxldCB0bXBOZXdNYW55ZmVzdCA9IG5ldyBNYW55ZmVzdCh0aGlzLmdldE1hbmlmZXN0KCksIHRoaXMubG9nSW5mbywgdGhpcy5sb2dFcnJvciwgdG1wTmV3T3B0aW9ucyk7XG5cblx0XHQvLyBJbXBvcnQgdGhlIGhhc2ggdHJhbnNsYXRpb25zXG5cdFx0dG1wTmV3TWFueWZlc3QuaGFzaFRyYW5zbGF0aW9ucy5hZGRUcmFuc2xhdGlvbih0aGlzLmhhc2hUcmFuc2xhdGlvbnMudHJhbnNsYXRpb25UYWJsZSk7XG5cblx0XHRyZXR1cm4gdG1wTmV3TWFueWZlc3Q7XG5cdH1cblxuXHQvLyBEZXNlcmlhbGl6ZSBhIE1hbmlmZXN0IGZyb20gYSBzdHJpbmdcblx0ZGVzZXJpYWxpemUocE1hbmlmZXN0U3RyaW5nKVxuXHR7XG5cdFx0Ly8gVE9ETzogQWRkIGd1YXJkcyBmb3IgYmFkIG1hbmlmZXN0IHN0cmluZ1xuXHRcdHJldHVybiB0aGlzLmxvYWRNYW5pZmVzdChKU09OLnBhcnNlKHBNYW5pZmVzdFN0cmluZykpO1xuXHR9XG5cblx0Ly8gTG9hZCBhIG1hbmlmZXN0IGZyb20gYW4gb2JqZWN0XG5cdGxvYWRNYW5pZmVzdChwTWFuaWZlc3QpXG5cdHtcblx0XHRpZiAodHlwZW9mKHBNYW5pZmVzdCkgIT09ICdvYmplY3QnKVxuXHRcdHtcblx0XHRcdHRoaXMubG9nRXJyb3IoYCgke3RoaXMuc2NvcGV9KSBFcnJvciBsb2FkaW5nIG1hbmlmZXN0OyBleHBlY3RpbmcgYW4gb2JqZWN0IGJ1dCBwYXJhbWV0ZXIgd2FzIHR5cGUgJHt0eXBlb2YocE1hbmlmZXN0KX0uYCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKHBNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eSgnU2NvcGUnKSlcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mKHBNYW5pZmVzdC5TY29wZSkgPT09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLnNjb3BlID0gcE1hbmlmZXN0LlNjb3BlO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBzY29wZSBmcm9tIG1hbmlmZXN0OyBleHBlY3RpbmcgYSBzdHJpbmcgYnV0IHByb3BlcnR5IHdhcyB0eXBlICR7dHlwZW9mKHBNYW5pZmVzdC5TY29wZSl9LmAsIHBNYW5pZmVzdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBzY29wZSBmcm9tIG1hbmlmZXN0IG9iamVjdC4gIFByb3BlcnR5IFwiU2NvcGVcIiBkb2VzIG5vdCBleGlzdCBpbiB0aGUgcm9vdCBvZiB0aGUgb2JqZWN0LmAsIHBNYW5pZmVzdCk7XG5cdFx0fVxuXG5cdFx0aWYgKHBNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eSgnRGVzY3JpcHRvcnMnKSlcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mKHBNYW5pZmVzdC5EZXNjcmlwdG9ycykgPT09ICdvYmplY3QnKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wRGVzY3JpcHRpb25BZGRyZXNzZXMgPSBPYmplY3Qua2V5cyhwTWFuaWZlc3QuRGVzY3JpcHRvcnMpO1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRtcERlc2NyaXB0aW9uQWRkcmVzc2VzLmxlbmd0aDsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5hZGREZXNjcmlwdG9yKHRtcERlc2NyaXB0aW9uQWRkcmVzc2VzW2ldLCBwTWFuaWZlc3QuRGVzY3JpcHRvcnNbdG1wRGVzY3JpcHRpb25BZGRyZXNzZXNbaV1dKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBkZXNjcmlwdGlvbiBvYmplY3QgZnJvbSBtYW5pZmVzdCBvYmplY3QuICBFeHBlY3RpbmcgYW4gb2JqZWN0IGluICdNYW5pZmVzdC5EZXNjcmlwdG9ycycgYnV0IHRoZSBwcm9wZXJ0eSB3YXMgdHlwZSAke3R5cGVvZihwTWFuaWZlc3QuRGVzY3JpcHRvcnMpfS5gLCBwTWFuaWZlc3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2dFcnJvcihgKCR7dGhpcy5zY29wZX0pIEVycm9yIGxvYWRpbmcgb2JqZWN0IGRlc2NyaXB0aW9uIGZyb20gbWFuaWZlc3Qgb2JqZWN0LiAgUHJvcGVydHkgXCJEZXNjcmlwdG9yc1wiIGRvZXMgbm90IGV4aXN0IGluIHRoZSByb290IG9mIHRoZSBNYW5pZmVzdCBvYmplY3QuYCwgcE1hbmlmZXN0KTtcblx0XHR9XG5cblx0XHQvLyBUaGlzIHNlZW1zIGxpa2UgaXQgd291bGQgY3JlYXRlIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSBpc3N1ZSBidXQgaXQgb25seSBnb2VzIGFzIGRlZXAgYXMgdGhlIHNjaGVtYSBkZWZpbmVzIFNvbHZlcnNcblx0XHRpZiAoKHBNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eSgnU29sdmVycycpKSAmJiAodHlwZW9mKHBNYW5pZmVzdC5Tb2x2ZXJzKSA9PSAnb2JqZWN0JykpXG5cdFx0e1xuXHRcdFx0Ly8gVGhlcmUgYXJlIGVsdWNpZGF0b3Igc29sdmVycyBwYXNzZWQtaW4sIHNvIHdlIHdpbGwgY3JlYXRlIG9uZSB0byBmaWx0ZXIgZGF0YS5cblx0XHRcdGxldCBsaWJFbHVjaWRhdG9yID0gcmVxdWlyZSgnZWx1Y2lkYXRvcicpO1xuXHRcdFx0Ly8gV0FSTklORyBUSEVTRSBDQU4gTVVUQVRFIFRIRSBEQVRBXG5cdFx0XHRcdC8vIFRoZSBwYXR0ZXJuIGZvciB0aGUgc29sdmVyIGlzOiB7PH5+U29sdmVyTmFtZX5+Pn0gYW55d2hlcmUgaW4gYSBwcm9wZXJ0eS5cblx0XHRcdFx0Ly8gICBZZXMsIHRoaXMgbWVhbnMgeW91ciBKYXZhc2NyaXB0IGVsZW1lbnRzIGNhbid0IGhhdmUgbXkgc2VsZi1zdHlsZWQgamVsbHlmaXNoIGJyYWNrZXRzIGluIHRoZW0uXG5cdFx0XHRcdC8vICAgVGhpcyBkb2VzLCB0aG91Z2gsIG1lYW4gd2UgY2FuIGZpbHRlciBhdCBtdWx0aXBsZSBsYXllcnMgc2FmZWx5LlxuXHRcdFx0XHQvLyAgIEJlY2F1c2UgdGhlc2UgY2FuIGJlIHB1dCBhdCBhbnkgYWRkcmVzc1xuXHRcdFx0Ly8gVGhlIHNvbHZlciB0aGVtc2VsdmVzOlxuXHRcdFx0XHQvLyAgIFRoZXkgYXJlIHBhc3NlZC1pbiBhbiBvYmplY3QsIGFuZCB0aGUgY3VycmVudCByZWNvcmQgaXMgaW4gdGhlIFJlY29yZCBzdWJvYmplY3QuXG5cdFx0XHRcdC8vICAgQmFzaWMgb3BlcmF0aW9ucyBjYW4ganVzdCB3cml0ZSB0byB0aGUgcm9vdCBvYmplY3QgYnV0Li4uXG5cdFx0XHRcdC8vICAgSUYgWU9VIFBFUk1VVEUgVEhFIFJlY29yZCBTVUJPQkpFQ1QgWU9VIENBTiBBRkZFQ1QgUkVDVVJTSU9OXG5cdFx0XHQvLyBUaGlzIGlzIG1vc3RseSBtZWFudCBmb3IgaWYgc3RhdGVtZW50cyB0byBmaWx0ZXIuXG5cdFx0XHRcdC8vICAgQmFzaWNhbGx5IG9uIGFnZ3JlZ2F0aW9uLCBpZiBhIGZpbHRlciBpcyBzZXQgaXQgd2lsbCBzZXQgXCJrZWVwIHJlY29yZFwiIHRvIHRydWUgYW5kIGxldCB0aGUgc29sdmVyIGRlY2lkZSBkaWZmZXJlbnRseS5cblx0XHRcdHRoaXMuZGF0YVNvbHZlcnMgPSBuZXcgbGliRWx1Y2lkYXRvcihwTWFuaWZlc3QuU29sdmVycywgdGhpcy5sb2dJbmZvLCB0aGlzLmxvZ0Vycm9yKTtcblx0XHRcdHRoaXMub2JqZWN0QWRkcmVzc1Jlc29sdmVyLmVsdWNpZGF0b3JTb2x2ZXIgPSB0aGlzLmRhdGFTb2x2ZXJzO1xuXG5cdFx0XHQvLyBMb2FkIHRoZSBzb2x2ZXIgc3RhdGUgaW4gc28gZWFjaCBpbnN0cnVjdGlvbiBjYW4gaGF2ZSBpbnRlcm5hbCBjb25maWdcblx0XHRcdC8vIFRPRE86IFNob3VsZCB0aGlzIGp1c3QgYmUgYSBwYXJ0IG9mIHRoZSBsb3dlciBsYXllciBwYXR0ZXJuP1xuXHRcdFx0bGV0IHRtcFNvbHZlcktleXMgPSBPYmplY3Qua2V5cyhwTWFuaWZlc3QuU29sdmVycylcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdG1wU29sdmVyS2V5cy5sZW5ndGg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5kYXRhU29sdmVyU3RhdGVbdG1wU29sdmVyS2V5c10gPSBwTWFuaWZlc3QuU29sdmVyc1t0bXBTb2x2ZXJLZXlzW2ldXTtcblx0XHRcdH1cblx0XHRcdHRoaXMub2JqZWN0QWRkcmVzc1Jlc29sdmVyLmVsdWNpZGF0b3JTb2x2ZXJTdGF0ZSA9IHRoaXMuZGF0YVNvbHZlclN0YXRlO1xuXHRcdH1cblx0fVxuXG5cdC8vIFNlcmlhbGl6ZSB0aGUgTWFuaWZlc3QgdG8gYSBzdHJpbmdcblx0Ly8gVE9ETzogU2hvdWxkIHRoaXMgYWxzbyBzZXJpYWxpemUgdGhlIHRyYW5zbGF0aW9uIHRhYmxlP1xuXHRzZXJpYWxpemUoKVxuXHR7XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0TWFuaWZlc3QoKSk7XG5cdH1cblxuXHRnZXRNYW5pZmVzdCgpXG5cdHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0e1xuXHRcdFx0XHRTY29wZTogdGhpcy5zY29wZSxcblx0XHRcdFx0RGVzY3JpcHRvcnM6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5lbGVtZW50RGVzY3JpcHRvcnMpKVxuXHRcdFx0fSk7XG5cdH1cblxuXHQvLyBBZGQgYSBkZXNjcmlwdG9yIHRvIHRoZSBtYW5pZmVzdFxuXHRhZGREZXNjcmlwdG9yKHBBZGRyZXNzLCBwRGVzY3JpcHRvcilcblx0e1xuXHRcdGlmICh0eXBlb2YocERlc2NyaXB0b3IpID09PSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHQvLyBBZGQgdGhlIEFkZHJlc3MgaW50byB0aGUgRGVzY3JpcHRvciBpZiBpdCBkb2Vzbid0IGV4aXN0OlxuXHRcdFx0aWYgKCFwRGVzY3JpcHRvci5oYXNPd25Qcm9wZXJ0eSgnQWRkcmVzcycpKVxuXHRcdFx0e1xuXHRcdFx0XHRwRGVzY3JpcHRvci5BZGRyZXNzID0gcEFkZHJlc3M7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghdGhpcy5lbGVtZW50RGVzY3JpcHRvcnMuaGFzT3duUHJvcGVydHkocEFkZHJlc3MpKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmVsZW1lbnRBZGRyZXNzZXMucHVzaChwQWRkcmVzcyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEFkZCB0aGUgZWxlbWVudCBkZXNjcmlwdG9yIHRvIHRoZSBzY2hlbWFcblx0XHRcdHRoaXMuZWxlbWVudERlc2NyaXB0b3JzW3BBZGRyZXNzXSA9IHBEZXNjcmlwdG9yO1xuXG5cdFx0XHQvLyBBbHdheXMgYWRkIHRoZSBhZGRyZXNzIGFzIGEgaGFzaFxuXHRcdFx0dGhpcy5lbGVtZW50SGFzaGVzW3BBZGRyZXNzXSA9IHBBZGRyZXNzO1xuXG5cdFx0XHRpZiAocERlc2NyaXB0b3IuaGFzT3duUHJvcGVydHkoJ0hhc2gnKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gVE9ETzogQ2hlY2sgaWYgdGhpcyBpcyBhIGdvb2QgaWRlYSBvciBub3QuLlxuXHRcdFx0XHQvLyAgICAgICBDb2xsaXNpb25zIGFyZSBib3VuZCB0byBoYXBwZW4gd2l0aCBib3RoIHJlcHJlc2VudGF0aW9ucyBvZiB0aGUgYWRkcmVzcy9oYXNoIGluIGhlcmUgYW5kIGRldmVsb3BlcnMgYmVpbmcgYWJsZSB0byBjcmVhdGUgdGhlaXIgb3duIGhhc2hlcy5cblx0XHRcdFx0dGhpcy5lbGVtZW50SGFzaGVzW3BEZXNjcmlwdG9yLkhhc2hdID0gcEFkZHJlc3M7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHBEZXNjcmlwdG9yLkhhc2ggPSBwQWRkcmVzcztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBvYmplY3QgZGVzY3JpcHRvciBmb3IgYWRkcmVzcyAnJHtwQWRkcmVzc30nIGZyb20gbWFuaWZlc3Qgb2JqZWN0LiAgRXhwZWN0aW5nIGFuIG9iamVjdCBidXQgcHJvcGVydHkgd2FzIHR5cGUgJHt0eXBlb2YocERlc2NyaXB0b3IpfS5gKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XHRcblx0fVxuXG5cdGdldERlc2NyaXB0b3JCeUhhc2gocEhhc2gpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5nZXREZXNjcmlwdG9yKHRoaXMucmVzb2x2ZUhhc2hBZGRyZXNzKHBIYXNoKSk7XG5cdH1cblxuXHRnZXREZXNjcmlwdG9yKHBBZGRyZXNzKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZWxlbWVudERlc2NyaXB0b3JzW3BBZGRyZXNzXTtcblx0fVxuXG5cdC8vIGV4ZWN1dGUgYW4gYWN0aW9uIGZ1bmN0aW9uIGZvciBlYWNoIGRlc2NyaXB0b3Jcblx0ZWFjaERlc2NyaXB0b3IoZkFjdGlvbilcblx0e1xuICAgICAgICBsZXQgdG1wRGVzY3JpcHRvckFkZHJlc3NlcyA9IE9iamVjdC5rZXlzKHRoaXMuZWxlbWVudERlc2NyaXB0b3JzKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0bXBEZXNjcmlwdG9yQWRkcmVzc2VzLmxlbmd0aDsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBmQWN0aW9uKHRoaXMuZWxlbWVudERlc2NyaXB0b3JzW3RtcERlc2NyaXB0b3JBZGRyZXNzZXNbaV1dKTtcbiAgICAgICAgfVxuXG5cdH1cblxuXHQvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXHQgKiBCZWdpbm5pbmcgb2YgT2JqZWN0IE1hbmlwdWxhdGlvbiAocmVhZCAmIHdyaXRlKSBGdW5jdGlvbnNcblx0ICovXG5cdC8vIENoZWNrIGlmIGFuIGVsZW1lbnQgZXhpc3RzIGJ5IGl0cyBoYXNoXG5cdGNoZWNrQWRkcmVzc0V4aXN0c0J5SGFzaCAocE9iamVjdCwgcEhhc2gpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5jaGVja0FkZHJlc3NFeGlzdHMocE9iamVjdCx0aGlzLnJlc29sdmVIYXNoQWRkcmVzcyhwSGFzaCkpO1xuXHR9XG5cblx0Ly8gQ2hlY2sgaWYgYW4gZWxlbWVudCBleGlzdHMgYXQgYW4gYWRkcmVzc1xuXHRjaGVja0FkZHJlc3NFeGlzdHMgKHBPYmplY3QsIHBBZGRyZXNzKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMub2JqZWN0QWRkcmVzc1Jlc29sdmVyLmNoZWNrQWRkcmVzc0V4aXN0cyhwT2JqZWN0LCBwQWRkcmVzcyk7XG5cdH1cblxuXHQvLyBUdXJuIGEgaGFzaCBpbnRvIGFuIGFkZHJlc3MsIGZhY3RvcmluZyBpbiB0aGUgdHJhbnNsYXRpb24gdGFibGUuXG5cdHJlc29sdmVIYXNoQWRkcmVzcyhwSGFzaClcblx0e1xuXHRcdGxldCB0bXBBZGRyZXNzID0gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHRtcEluRWxlbWVudEhhc2hUYWJsZSA9IHRoaXMuZWxlbWVudEhhc2hlcy5oYXNPd25Qcm9wZXJ0eShwSGFzaCk7XG5cdFx0bGV0IHRtcEluVHJhbnNsYXRpb25UYWJsZSA9IHRoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGlvblRhYmxlLmhhc093blByb3BlcnR5KHBIYXNoKTtcblxuXHRcdC8vIFRoZSBtb3N0IHN0cmFpZ2h0Zm9yd2FyZDogdGhlIGhhc2ggZXhpc3RzLCBubyB0cmFuc2xhdGlvbnMuXG5cdFx0aWYgKHRtcEluRWxlbWVudEhhc2hUYWJsZSAmJiAhdG1wSW5UcmFuc2xhdGlvblRhYmxlKVxuXHRcdHtcblx0XHRcdHRtcEFkZHJlc3MgPSB0aGlzLmVsZW1lbnRIYXNoZXNbcEhhc2hdO1xuXHRcdH1cblx0XHQvLyBUaGVyZSBpcyBhIHRyYW5zbGF0aW9uIGZyb20gb25lIGhhc2ggdG8gYW5vdGhlciwgYW5kLCB0aGUgZWxlbWVudEhhc2hlcyBjb250YWlucyB0aGUgcG9pbnRlciBlbmRcblx0XHRlbHNlIGlmICh0bXBJblRyYW5zbGF0aW9uVGFibGUgJiYgdGhpcy5lbGVtZW50SGFzaGVzLmhhc093blByb3BlcnR5KHRoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGUocEhhc2gpKSlcblx0XHR7XG5cdFx0XHR0bXBBZGRyZXNzID0gdGhpcy5lbGVtZW50SGFzaGVzW3RoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGUocEhhc2gpXTtcblx0XHR9XG5cdFx0Ly8gVXNlIHRoZSBsZXZlbCBvZiBpbmRpcmVjdGlvbiBvbmx5IGluIHRoZSBUcmFuc2xhdGlvbiBUYWJsZSBcblx0XHRlbHNlIGlmICh0bXBJblRyYW5zbGF0aW9uVGFibGUpXG5cdFx0e1xuXHRcdFx0dG1wQWRkcmVzcyA9IHRoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGUocEhhc2gpO1xuXHRcdH1cblx0XHQvLyBKdXN0IHRyZWF0IHRoZSBoYXNoIGFzIGFuIGFkZHJlc3MuXG5cdFx0Ly8gVE9ETzogRGlzY3VzcyB0aGlzIC4uLiBpdCBpcyBtYWdpYyBidXQgY29udHJvdmVyc2lhbFxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0bXBBZGRyZXNzID0gcEhhc2g7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRtcEFkZHJlc3M7XG5cdH1cblxuXHQvLyBHZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYnkgaXRzIGhhc2hcblx0Z2V0VmFsdWVCeUhhc2ggKHBPYmplY3QsIHBIYXNoKVxuXHR7XG5cdFx0bGV0IHRtcFZhbHVlID0gdGhpcy5nZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0LCB0aGlzLnJlc29sdmVIYXNoQWRkcmVzcyhwSGFzaCkpO1xuXG5cdFx0aWYgKHR5cGVvZih0bXBWYWx1ZSkgPT0gJ3VuZGVmaW5lZCcpXG5cdFx0e1xuXHRcdFx0Ly8gVHJ5IHRvIGdldCBhIGRlZmF1bHQgaWYgaXQgZXhpc3RzXG5cdFx0XHR0bXBWYWx1ZSA9IHRoaXMuZ2V0RGVmYXVsdFZhbHVlKHRoaXMuZ2V0RGVzY3JpcHRvckJ5SGFzaChwSGFzaCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0bXBWYWx1ZTtcblx0fVxuXG5cdC8vIEdldCB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBhdCBhbiBhZGRyZXNzXG5cdGdldFZhbHVlQXRBZGRyZXNzIChwT2JqZWN0LCBwQWRkcmVzcylcblx0e1xuXHRcdGxldCB0bXBWYWx1ZSA9IHRoaXMub2JqZWN0QWRkcmVzc1Jlc29sdmVyLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3QsIHBBZGRyZXNzKTtcblxuXHRcdGlmICh0eXBlb2YodG1wVmFsdWUpID09ICd1bmRlZmluZWQnKVxuXHRcdHtcblx0XHRcdC8vIFRyeSB0byBnZXQgYSBkZWZhdWx0IGlmIGl0IGV4aXN0c1xuXHRcdFx0dG1wVmFsdWUgPSB0aGlzLmdldERlZmF1bHRWYWx1ZSh0aGlzLmdldERlc2NyaXB0b3IocEFkZHJlc3MpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdG1wVmFsdWU7XG5cdH1cblxuXHQvLyBTZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYnkgaXRzIGhhc2hcblx0c2V0VmFsdWVCeUhhc2gocE9iamVjdCwgcEhhc2gsIHBWYWx1ZSlcblx0e1xuXHRcdHJldHVybiB0aGlzLnNldFZhbHVlQXRBZGRyZXNzKHBPYmplY3QsIHRoaXMucmVzb2x2ZUhhc2hBZGRyZXNzKHBIYXNoKSwgcFZhbHVlKTtcblx0fVxuXG5cblx0Ly8gU2V0IHRoZSB2YWx1ZSBvZiBhbiBlbGVtZW50IGF0IGFuIGFkZHJlc3Ncblx0c2V0VmFsdWVBdEFkZHJlc3MgKHBPYmplY3QsIHBBZGRyZXNzLCBwVmFsdWUpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5vYmplY3RBZGRyZXNzUmVzb2x2ZXIuc2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdCwgcEFkZHJlc3MsIHBWYWx1ZSk7XG5cdH1cblxuXHQvLyBWYWxpZGF0ZSB0aGUgY29uc2lzdGVuY3kgb2YgYW4gb2JqZWN0IGFnYWluc3QgdGhlIHNjaGVtYVxuXHR2YWxpZGF0ZShwT2JqZWN0KVxuXHR7XG5cdFx0bGV0IHRtcFZhbGlkYXRpb25EYXRhID1cblx0XHR7XG5cdFx0XHRFcnJvcjogbnVsbCxcblx0XHRcdEVycm9yczogW10sXG5cdFx0XHRNaXNzaW5nRWxlbWVudHM6W11cblx0XHR9O1xuXG5cdFx0aWYgKHR5cGVvZihwT2JqZWN0KSAhPT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0dG1wVmFsaWRhdGlvbkRhdGEuRXJyb3IgPSB0cnVlO1xuXHRcdFx0dG1wVmFsaWRhdGlvbkRhdGEuRXJyb3JzLnB1c2goYEV4cGVjdGVkIHBhc3NlZCBpbiBvYmplY3QgdG8gYmUgdHlwZSBvYmplY3QgYnV0IHdhcyBwYXNzZWQgaW4gJHt0eXBlb2YocE9iamVjdCl9YCk7XG5cdFx0fVxuXG5cdFx0bGV0IGFkZFZhbGlkYXRpb25FcnJvciA9IChwQWRkcmVzcywgcEVycm9yTWVzc2FnZSkgPT5cblx0XHR7XG5cdFx0XHR0bXBWYWxpZGF0aW9uRGF0YS5FcnJvciA9IHRydWU7XG5cdFx0XHR0bXBWYWxpZGF0aW9uRGF0YS5FcnJvcnMucHVzaChgRWxlbWVudCBhdCBhZGRyZXNzIFwiJHtwQWRkcmVzc31cIiAke3BFcnJvck1lc3NhZ2V9LmApO1xuXHRcdH07XG5cblx0XHQvLyBOb3cgZW51bWVyYXRlIHRocm91Z2ggdGhlIHZhbHVlcyBhbmQgY2hlY2sgZm9yIGFub21hbGllcyBiYXNlZCBvbiB0aGUgc2NoZW1hXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVsZW1lbnRBZGRyZXNzZXMubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0bGV0IHRtcERlc2NyaXB0b3IgPSB0aGlzLmdldERlc2NyaXB0b3IodGhpcy5lbGVtZW50QWRkcmVzc2VzW2ldKTtcblx0XHRcdGxldCB0bXBWYWx1ZUV4aXN0cyA9IHRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3QsIHRtcERlc2NyaXB0b3IuQWRkcmVzcyk7XG5cdFx0XHRsZXQgdG1wVmFsdWUgPSB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3QsIHRtcERlc2NyaXB0b3IuQWRkcmVzcyk7XG5cblx0XHRcdGlmICgodHlwZW9mKHRtcFZhbHVlKSA9PSAndW5kZWZpbmVkJykgfHwgIXRtcFZhbHVlRXhpc3RzKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaGlzIHdpbGwgdGVjaG5pY2FsbHkgbWVhbiB0aGF0IGBPYmplY3QuU29tZS5WYWx1ZSA9IHVuZGVmaW5lZGAgd2lsbCBlbmQgdXAgc2hvd2luZyBhcyBcIm1pc3NpbmdcIlxuXHRcdFx0XHQvLyBUT0RPOiBEbyB3ZSB3YW50IHRvIGRvIGEgZGlmZmVyZW50IG1lc3NhZ2UgYmFzZWQgb24gaWYgdGhlIHByb3BlcnR5IGV4aXN0cyBidXQgaXMgdW5kZWZpbmVkP1xuXHRcdFx0XHR0bXBWYWxpZGF0aW9uRGF0YS5NaXNzaW5nRWxlbWVudHMucHVzaCh0bXBEZXNjcmlwdG9yLkFkZHJlc3MpO1xuXHRcdFx0XHRpZiAodG1wRGVzY3JpcHRvci5SZXF1aXJlZCB8fCB0aGlzLm9wdGlvbnMuc3RyaWN0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgJ2lzIGZsYWdnZWQgUkVRVUlSRUQgYnV0IGlzIG5vdCBzZXQgaW4gdGhlIG9iamVjdCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIE5vdyBzZWUgaWYgdGhlcmUgaXMgYSBkYXRhIHR5cGUgc3BlY2lmaWVkIGZvciB0aGlzIGVsZW1lbnRcblx0XHRcdGlmICh0bXBEZXNjcmlwdG9yLkRhdGFUeXBlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wRWxlbWVudFR5cGUgPSB0eXBlb2YodG1wVmFsdWUpO1xuXHRcdFx0XHRzd2l0Y2godG1wRGVzY3JpcHRvci5EYXRhVHlwZS50b1N0cmluZygpLnRyaW0oKS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0XHRcdGlmICh0bXBFbGVtZW50VHlwZSAhPSAnc3RyaW5nJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGlzIG9mIHRoZSB0eXBlICR7dG1wRWxlbWVudFR5cGV9YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRcdFx0XHRpZiAodG1wRWxlbWVudFR5cGUgIT0gJ251bWJlcicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsIGBoYXMgYSBEYXRhVHlwZSAke3RtcERlc2NyaXB0b3IuRGF0YVR5cGV9IGJ1dCBpcyBvZiB0aGUgdHlwZSAke3RtcEVsZW1lbnRUeXBlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlICdpbnRlZ2VyJzpcblx0XHRcdFx0XHRcdGlmICh0bXBFbGVtZW50VHlwZSAhPSAnbnVtYmVyJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGlzIG9mIHRoZSB0eXBlICR7dG1wRWxlbWVudFR5cGV9YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCB0bXBWYWx1ZVN0cmluZyA9IHRtcFZhbHVlLnRvU3RyaW5nKCk7XG5cdFx0XHRcdFx0XHRcdGlmICh0bXBWYWx1ZVN0cmluZy5pbmRleE9mKCcuJykgPiAtMSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vIFRPRE86IElzIHRoaXMgYW4gZXJyb3I/XG5cdFx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGhhcyBhIGRlY2ltYWwgcG9pbnQgaW4gdGhlIG51bWJlci5gKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlICdmbG9hdCc6XG5cdFx0XHRcdFx0XHRpZiAodG1wRWxlbWVudFR5cGUgIT0gJ251bWJlcicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsIGBoYXMgYSBEYXRhVHlwZSAke3RtcERlc2NyaXB0b3IuRGF0YVR5cGV9IGJ1dCBpcyBvZiB0aGUgdHlwZSAke3RtcEVsZW1lbnRUeXBlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlICdEYXRlVGltZSc6XG5cdFx0XHRcdFx0XHRsZXQgdG1wVmFsdWVEYXRlID0gbmV3IERhdGUodG1wVmFsdWUpO1xuXHRcdFx0XHRcdFx0aWYgKHRtcFZhbHVlRGF0ZS50b1N0cmluZygpID09ICdJbnZhbGlkIERhdGUnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCBgaGFzIGEgRGF0YVR5cGUgJHt0bXBEZXNjcmlwdG9yLkRhdGFUeXBlfSBidXQgaXMgbm90IHBhcnNhYmxlIGFzIGEgRGF0ZSBieSBKYXZhc2NyaXB0YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHQvLyBDaGVjayBpZiB0aGlzIGlzIGEgc3RyaW5nLCBpbiB0aGUgZGVmYXVsdCBjYXNlXG5cdFx0XHRcdFx0XHQvLyBOb3RlIHRoaXMgaXMgb25seSB3aGVuIGEgRGF0YVR5cGUgaXMgc3BlY2lmaWVkIGFuZCBpdCBpcyBhbiB1bnJlY29nbml6ZWQgZGF0YSB0eXBlLlxuXHRcdFx0XHRcdFx0aWYgKHRtcEVsZW1lbnRUeXBlICE9ICdzdHJpbmcnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCBgaGFzIGEgRGF0YVR5cGUgJHt0bXBEZXNjcmlwdG9yLkRhdGFUeXBlfSAod2hpY2ggYXV0by1jb252ZXJ0ZWQgdG8gU3RyaW5nIGJlY2F1c2UgaXQgd2FzIHVucmVjb2duaXplZCkgYnV0IGlzIG9mIHRoZSB0eXBlICR7dG1wRWxlbWVudFR5cGV9YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0bXBWYWxpZGF0aW9uRGF0YTtcblx0fVxuXG5cdC8vIFJldHVybnMgYSBkZWZhdWx0IHZhbHVlLCBvciwgdGhlIGRlZmF1bHQgdmFsdWUgZm9yIHRoZSBkYXRhIHR5cGUgKHdoaWNoIGlzIG92ZXJyaWRhYmxlIHdpdGggY29uZmlndXJhdGlvbilcblx0Z2V0RGVmYXVsdFZhbHVlKHBEZXNjcmlwdG9yKVxuXHR7XG5cdFx0aWYgKHR5cGVvZihwRGVzY3JpcHRvcikgIT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRpZiAocERlc2NyaXB0b3IuaGFzT3duUHJvcGVydHkoJ0RlZmF1bHQnKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gcERlc2NyaXB0b3IuRGVmYXVsdDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdC8vIERlZmF1bHQgdG8gYSBudWxsIGlmIGl0IGRvZXNuJ3QgaGF2ZSBhIHR5cGUgc3BlY2lmaWVkLlxuXHRcdFx0Ly8gVGhpcyB3aWxsIGVuc3VyZSBhIHBsYWNlaG9sZGVyIGlzIGNyZWF0ZWQgYnV0IGlzbid0IG1pc2ludGVycHJldGVkLlxuXHRcdFx0bGV0IHRtcERhdGFUeXBlID0gKHBEZXNjcmlwdG9yLmhhc093blByb3BlcnR5KCdEYXRhVHlwZScpKSA/IHBEZXNjcmlwdG9yLkRhdGFUeXBlIDogJ1N0cmluZyc7XG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLmRlZmF1bHRWYWx1ZXMuaGFzT3duUHJvcGVydHkodG1wRGF0YVR5cGUpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLmRlZmF1bHRWYWx1ZXNbdG1wRGF0YVR5cGVdO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBnaXZlIHVwIGFuZCByZXR1cm4gbnVsbFxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBFbnVtZXJhdGUgdGhyb3VnaCB0aGUgc2NoZW1hIGFuZCBwb3B1bGF0ZSBkZWZhdWx0IHZhbHVlcyBpZiB0aGV5IGRvbid0IGV4aXN0LlxuXHRwb3B1bGF0ZURlZmF1bHRzKHBPYmplY3QsIHBPdmVyd3JpdGVQcm9wZXJ0aWVzKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMucG9wdWxhdGVPYmplY3QocE9iamVjdCwgcE92ZXJ3cml0ZVByb3BlcnRpZXMsXG5cdFx0XHQvLyBUaGlzIGp1c3Qgc2V0cyB1cCBhIHNpbXBsZSBmaWx0ZXIgdG8gc2VlIGlmIHRoZXJlIGlzIGEgZGVmYXVsdCBzZXQuXG5cdFx0XHQocERlc2NyaXB0b3IpID0+XG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBwRGVzY3JpcHRvci5oYXNPd25Qcm9wZXJ0eSgnRGVmYXVsdCcpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvLyBGb3JjZWZ1bGx5IHBvcHVsYXRlIGFsbCB2YWx1ZXMgZXZlbiBpZiB0aGV5IGRvbid0IGhhdmUgZGVmYXVsdHMuXG5cdC8vIEJhc2VkIG9uIHR5cGUsIHRoaXMgY2FuIGRvIHVuZXhwZWN0ZWQgdGhpbmdzLlxuXHRwb3B1bGF0ZU9iamVjdChwT2JqZWN0LCBwT3ZlcndyaXRlUHJvcGVydGllcywgZkZpbHRlcilcblx0e1xuXHRcdC8vIEF1dG9tYXRpY2FsbHkgY3JlYXRlIGFuIG9iamVjdCBpZiBvbmUgaXNuJ3QgcGFzc2VkIGluLlxuXHRcdGxldCB0bXBPYmplY3QgPSAodHlwZW9mKHBPYmplY3QpID09PSAnb2JqZWN0JykgPyBwT2JqZWN0IDoge307XG5cdFx0Ly8gRGVmYXVsdCB0byAqTk9UIE9WRVJXUklUSU5HKiBwcm9wZXJ0aWVzXG5cdFx0bGV0IHRtcE92ZXJ3cml0ZVByb3BlcnRpZXMgPSAodHlwZW9mKHBPdmVyd3JpdGVQcm9wZXJ0aWVzKSA9PSAndW5kZWZpbmVkJykgPyBmYWxzZSA6IHBPdmVyd3JpdGVQcm9wZXJ0aWVzO1xuXHRcdC8vIFRoaXMgaXMgYSBmaWx0ZXIgZnVuY3Rpb24sIHdoaWNoIGlzIHBhc3NlZCB0aGUgc2NoZW1hIGFuZCBhbGxvd3MgY29tcGxleCBmaWx0ZXJpbmcgb2YgcG9wdWxhdGlvblxuXHRcdC8vIFRoZSBkZWZhdWx0IGZpbHRlciBmdW5jdGlvbiBqdXN0IHJldHVybnMgdHJ1ZSwgcG9wdWxhdGluZyBldmVyeXRoaW5nLlxuXHRcdGxldCB0bXBGaWx0ZXJGdW5jdGlvbiA9ICh0eXBlb2YoZkZpbHRlcikgPT0gJ2Z1bmN0aW9uJykgPyBmRmlsdGVyIDogKHBEZXNjcmlwdG9yKSA9PiB7IHJldHVybiB0cnVlOyB9O1xuXG5cdFx0dGhpcy5lbGVtZW50QWRkcmVzc2VzLmZvckVhY2goXG5cdFx0XHQocEFkZHJlc3MpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBEZXNjcmlwdG9yID0gdGhpcy5nZXREZXNjcmlwdG9yKHBBZGRyZXNzKTtcblx0XHRcdFx0Ly8gQ2hlY2sgdGhlIGZpbHRlciBmdW5jdGlvbiB0byBzZWUgaWYgdGhpcyBpcyBhbiBhZGRyZXNzIHdlIHdhbnQgdG8gc2V0IHRoZSB2YWx1ZSBmb3IuXG5cdFx0XHRcdGlmICh0bXBGaWx0ZXJGdW5jdGlvbih0bXBEZXNjcmlwdG9yKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIElmIHdlIGFyZSBvdmVyd3JpdGluZyBwcm9wZXJ0aWVzIE9SIHRoZSBwcm9wZXJ0eSBkb2VzIG5vdCBleGlzdFxuXHRcdFx0XHRcdGlmICh0bXBPdmVyd3JpdGVQcm9wZXJ0aWVzIHx8ICF0aGlzLmNoZWNrQWRkcmVzc0V4aXN0cyh0bXBPYmplY3QsIHBBZGRyZXNzKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aGlzLnNldFZhbHVlQXRBZGRyZXNzKHRtcE9iamVjdCwgcEFkZHJlc3MsIHRoaXMuZ2V0RGVmYXVsdFZhbHVlKHRtcERlc2NyaXB0b3IpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRtcE9iamVjdDtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYW55ZmVzdDsiXX0=
