(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.MugenScroll = factory());
}(this, (function () { 'use strict';

var throttleit = throttle;

/**
 * Returns a new function that, when invoked, invokes `func` at most once per `wait` milliseconds.
 *
 * @param {Function} func Function to wrap.
 * @param {Number} wait Number of milliseconds that must elapse between `func` invocations.
 * @return {Function} A new function that wraps the `func` function passed in.
 */

function throttle (func, wait) {
  var ctx, args, rtn, timeoutID; // caching
  var last = 0;

  return function throttled () {
    ctx = this;
    args = arguments;
    var delta = new Date() - last;
    if (!timeoutID)
      { if (delta >= wait) { call(); }
      else { timeoutID = setTimeout(call, wait - delta); } }
    return rtn;
  };

  function call () {
    timeoutID = 0;
    last = +new Date();
    rtn = func.apply(ctx, args);
    ctx = null;
    args = null;
  }
}

var index = function (element, ref) {
  if ( ref === void 0 ) { ref = {}; }
  var offset = ref.offset; if ( offset === void 0 ) { offset = 0; }
  var threshold = ref.threshold; if ( threshold === void 0 ) { threshold = 0; }

  var ref$1 = element.getBoundingClientRect();
  var top = ref$1.top;
  var right = ref$1.right;
  var bottom = ref$1.bottom;
  var left = ref$1.left;
  var width = ref$1.width;
  var height = ref$1.height;

  var intersection = {
    t: bottom,
    r: window.innerWidth - left,
    b: window.innerHeight - top,
    l: right
  };

  var elementThreshold = {
    x: threshold * width,
    y: threshold * height
  };

  return (
    intersection.t >= (offset.top || offset + elementThreshold.y) &&
    intersection.r >= (offset.right || offset + elementThreshold.x) &&
    intersection.b >= (offset.bottom || offset + elementThreshold.y) &&
    intersection.l >= (offset.left || offset + elementThreshold.x)
  )
};

var elementInView_common = index;

var triggers = ['scroll', 'resize'];

var MugenScroll = {
  name: 'mugen-scroll',
  props: {
    handler: {
      type: Function,
      required: true
    },
    shouldHandle: {
      type: Boolean,
      default: true
    },
    offset: {
      type: [Number, Object],
      default: 0
    },
    threshold: {
      type: Number,
      default: 0
    },
    handleOnMount: {
      type: Boolean,
      default: true
    },
    scrollContainer: {
      type: String
    }
  },
  mounted: function mounted() {
    this.checkInView();
  },
  methods: {
    checkInView: function checkInView() {
      var this$1 = this;

      var execute = function () {
        // The element can be removed
        if (!this$1.$refs.scroll) {
          return
        }

        var inView = elementInView_common(this$1.$refs.scroll, {
          offset: this$1.offset,
          threshold: this$1.threshold
        });
        if (this$1.shouldHandle && inView) {
          this$1.handler();
        }
      };

      // checkInView right after this component is mounted
      if (this.handleOnMount) {
        execute();
      }

      if (this.scrollContainer) {
        var parent = this;
        while ((parent = parent.$parent) && !this._scrollContainer) {
          this$1._scrollContainer = parent.$refs[this$1.scrollContainer];
        }
        // Ensure it's html element (ref could be component)
        if (this._scrollContainer && this._scrollContainer.$el) {
          this._scrollContainer = this._scrollContainer.$el;
        }
      }

      this._scrollContainer = this._scrollContainer || window;

      // Add event listeners
      this.check = throttleit(execute, 200);
      triggers.forEach(function (event) { return this$1._scrollContainer.addEventListener(event, this$1.check); });
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'mugen-scroll',
      ref: 'scroll'
    }, this.$slots.default)
  },
  beforeDestroy: function beforeDestroy() {
    var this$1 = this;

    triggers.forEach(function (event) { return this$1._scrollContainer.removeEventListener(event, this$1.check); });
  }
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.component(MugenScroll.name, MugenScroll);
}

return MugenScroll;

})));
