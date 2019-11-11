// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

    Array.prototype.map = function(callback/*, thisArg*/) {
  
      var T, A, k;
  
      if (this == null) {
        throw new TypeError('this is null or not defined');
      }
  
      // 1. Let O be the result of calling ToObject passing the |this| 
      //    value as the argument.
      var O = Object(this);
  
      // 2. Let lenValue be the result of calling the Get internal 
      //    method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;
  
      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }
  
      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if (arguments.length > 1) {
        T = arguments[1];
      }
  
      // 6. Let A be a new array created as if by the expression new Array(len) 
      //    where Array is the standard built-in constructor with that name and 
      //    len is the value of len.
      A = new Array(len);
  
      // 7. Let k be 0
      k = 0;
  
      // 8. Repeat, while k < len
      while (k < len) {
  
        var kValue, mappedValue;
  
        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal 
        //    method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if (k in O) {
  
          // i. Let kValue be the result of calling the Get internal 
          //    method of O with argument Pk.
          kValue = O[k];
  
          // ii. Let mappedValue be the result of calling the Call internal 
          //     method of callback with T as the this value and argument 
          //     list containing kValue, k, and O.
          mappedValue = callback.call(T, kValue, k, O);
  
          // iii. Call the DefineOwnProperty internal method of A with arguments
          // Pk, Property Descriptor
          // { Value: mappedValue,
          //   Writable: true,
          //   Enumerable: true,
          //   Configurable: true },
          // and false.
  
          // In browsers that support Object.defineProperty, use the following:
          // Object.defineProperty(A, k, {
          //   value: mappedValue,
          //   writable: true,
          //   enumerable: true,
          //   configurable: true
          // });
  
          // For best browser support, use the following:
          A[k] = mappedValue;
        }
        // d. Increase k by 1.
        k++;
      }
  
      // 9. return A
      return A;
    };
  }

  // Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
  
      var k;
  
      // 1. Let O be the result of calling ToObject passing
      //    the this value as the argument.
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
  
      var O = Object(this);
  
      // 2. Let lenValue be the result of calling the Get
      //    internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;
  
      // 4. If len is 0, return -1.
      if (len === 0) {
        return -1;
      }
  
      // 5. If argument fromIndex was passed let n be
      //    ToInteger(fromIndex); else let n be 0.
      var n = +fromIndex || 0;
  
      if (Math.abs(n) === Infinity) {
        n = 0;
      }
  
      // 6. If n >= len, return -1.
      if (n >= len) {
        return -1;
      }
  
      // 7. If n >= 0, then Let k be n.
      // 8. Else, n<0, Let k be len - abs(n).
      //    If k is less than 0, then let k be 0.
      k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
  
      // 9. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the
        //    HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        //    i.  Let elementK be the result of calling the Get
        //        internal method of O with the argument ToString(k).
        //   ii.  Let same be the result of applying the
        //        Strict Equality Comparison Algorithm to
        //        searchElement and elementK.
        //  iii.  If same is true, return k.
        if (k in O && O[k] === searchElement) {
          return k;
        }
        k++;
      }
      return -1;
    };
  }

if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

      var result = [];

      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop);
      }

      if (hasDontEnumBug) {
        for (var i=0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
        }
      }
      return result;
    }
  })()
};

if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          // this instanceof fBound === true时,说明返回的fBound被当做new的构造函数调用
          return fToBind.apply(this instanceof fBound
                 ? this
                 : oThis,
                 // 获取调用时(fBound)的传参.bind 返回的函数入参往往是这么传递的
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    // 维护原型关系
    if (this.prototype) {
      // 当执行Function.prototype.bind()时, this为Function.prototype 
      // this.prototype(即Function.prototype.prototype)为undefined
      fNOP.prototype = this.prototype; 
    }
    // 下行的代码使fBound.prototype是fNOP的实例,因此
    // 返回的fBound若作为new的构造函数,new生成的新对象作为this传入fBound,新对象的__proto__就是fNOP的实例
    fBound.prototype = new fNOP();

    return fBound;
  };
}