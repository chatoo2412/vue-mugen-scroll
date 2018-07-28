'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var throttle = _interopDefault(require('throttleit'));
var inViewport = _interopDefault(require('element-in-view'));

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

        var inView = inViewport(this$1.$refs.scroll, {
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
      this.check = throttle(execute, 200);
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

module.exports = MugenScroll;
