const Utils = require('../utils');
const Event = require('../core/event');
const Assets = require('./assets');
const SFX = require('./sfx');

AFRAME.registerComponent('slider', {
  schema: {
    name: {
      type: "string",
      default: ""
    },
    value: {
      type: "number",
      default: 0
    },
    min: {
      type: "number",
      default: 0
    },
    max: {
      type: "number",
      default: 100
    },
    disabled: {
      type: 'boolean',
      default: false
    },
    trackColor: {
      type: "color",
      default: "#bababa"
    },
    knobColor: {
      type: "color",
      default: "#4076fd"
    },
    trackColorDisabled: {
      type: "color",
      default: "#939393"
    },
    knobColorDisabled: {
      type: "color",
      default: "#a2a2a2"
    },
    opacity: {
      type: "number",
      default: 1
    },
    width: {
      type: "number",
      default: 1.52
    }
  },
  init: function () {
    var that = this;

    // Assets
    Utils.preloadAssets(Assets);

    // SFX
    SFX.init(this.el);

    this.percent = this.data.value / (this.data.max - this.data.min);
    this.dragging = false;
    this.dragger = null;

    // BACKGROUND
    this.background = document.createElement('a-plane');
    this.background.setAttribute('width', this.data.width);
    this.background.setAttribute('height', 0.216);
    this.background.setAttribute('position', '0 0 -0.001');
    this.background.setAttribute('material', 'opacity', 0);
    this.el.appendChild(this.background);

    // TRACK
    this.track = document.createElement('a-plane');
    this.track.setAttribute('width', this.data.width)
    this.track.setAttribute('height', 0.02)
    this.track.setAttribute('position', '0 0 0.001')
    this.el.appendChild(this.track);

    // HIGHLIGHT
    this.highlight = document.createElement('a-plane');
    this.highlight.setAttribute('width', this.percent * this.data.width);
    this.highlight.setAttribute('height', 0.02);
    this.highlight.setAttribute('position', `${(-this.data.width+this.percent * this.data.width)/2} 0 0.0011`);
    this.highlight.setAttribute('visible', false);
    this.el.appendChild(this.highlight);

    // KNOB
    this.knob = document.createElement('a-circle');
    this.knob.setAttribute('position', `${-this.data.width/2+this.percent * this.data.width} 0 0.002`);
    this.knob.setAttribute('radius', 0.072)
    this.el.appendChild(this.knob);


    this.el.addEventListener('click', function (evt) {
      if (this.components.slider.data.disabled) {
        return;
      }
      var localCoordinates = this.object3D.worldToLocal(evt.detail.intersection.point);
      var sliderBarWidth = that.data.width; // total width of slider bar
      if (localCoordinates.x <= (-sliderBarWidth / 2)) {
        that.percent = 0;
      } else if (localCoordinates.x >= (sliderBarWidth / 2)) {
        that.percent = 1.0;
      } else {
        that.percent = (localCoordinates.x + (sliderBarWidth / 2)) / sliderBarWidth;
      }
      this.setAttribute('value', that.percent * (that.data.max - that.data.min) + that.data.min);
      Event.emit(this, 'change', this.components.slider.data.value);
    });

    this.knob.addEventListener('mousedown', function (evt) {
      that.knob.setAttribute('radius', 0.108);
      that.dragger = evt.detail.cursorEl;
    });

    this.knob.addEventListener('mouseup', function () {
      that.knob.setAttribute('radius', 0.072);
      that.dragger = null;
    });

    this.el.addEventListener('mousedown', function () {
      if (this.components.slider && this.components.slider.data.disabled) {
        return SFX.clickDisabled(this);
      }
      SFX.click(this);
    });
    this.el.addEventListener('mouseup', function () {
      if (this.components.slider && this.components.slider.data.disabled) {
        return;
      }
    });

    Object.defineProperty(this.el, 'value', {
      get: function () {
        return this.getAttribute('value');
      },
      set: function (value) {
        this.setAttribute('value', value);
      },
      enumerable: true,
      configurable: true
    });
  },

  disable: function () {
    this.track.setAttribute('color', this.data.trackColorDisabled);
    this.highlight.setAttribute('color', this.data.trackColorDisabled);
    this.knob.setAttribute('color', this.data.knobColorDisabled);
  },
  enable: function () {
    this.track.setAttribute('color', this.data.trackColor);
    this.highlight.setAttribute('color', this.data.knobColor);
    this.knob.setAttribute('color', this.data.knobColor);
  },
  updateForegroundOpacity(opacity) {
    this.track.setAttribute('opacity', opacity);
    this.highlight.setAttribute('opacity', opacity);
    this.knob.setAttribute('opacity', opacity);
  },
  update: function () {
    if ((this.percent * this.data.width) <= this.data.min) {
      this.highlight.setAttribute('visible', false);
    } else {
      this.highlight.setAttribute('visible', true);
      this.highlight.setAttribute('geometry', 'width', this.percent * this.data.width);
      this.highlight.setAttribute('position', `${(-this.data.width+this.percent * this.data.width)/2} 0 0.0011`);
    }

    this.knob.setAttribute('position', `${-this.data.width/2+this.percent*this.data.width} 0 0.002`);

    if (this.data.disabled) {
      this.disable();
    } else {
      this.enable();
    }

    this.updateForegroundOpacity(this.data.opacity);
  },
  tick: function () {
    if (this.dragger && this.dragger.components.cursor.eventDetail.intersection) {
      if (this.data.disabled) {
        return;
      }
      var localCoordinates = this.el.object3D.worldToLocal(this.dragger.components.cursor.eventDetail.intersection.point);
      var sliderBarWidth = this.data.width; // total width of slider bar
      if (localCoordinates.x <= (-sliderBarWidth / 2)) {
        this.percent = 0;
      } else if (localCoordinates.x >= (sliderBarWidth / 2)) {
        this.percent = 1.0;
      } else {
        this.percent = (localCoordinates.x + (sliderBarWidth / 2)) / sliderBarWidth;
      }
      this.el.setAttribute('value', this.percent * (this.data.max - this.data.min) + this.data.min);
      Event.emit(this.el, 'change', this.data.value);
    } else {
      this.dragger = null;
    }
  },
  remove: function () {},
  pause: function () {},
  play: function () {}
});

AFRAME.registerPrimitive('a-slider', {
  defaultComponents: {
    slider: {}
  },
  mappings: {
    name: 'slider.name',
    value: 'slider.value',
    min: 'slider.min',
    max: 'slider.max',
    disabled: 'slider.disabled',
    'track-color': 'slider.trackColor',
    'knob-color': 'slider.knobColor',
    'track-color-disabled': 'slider.trackColorDisabled',
    'knob-color-disabled': 'slider.knobColorDisabled',
    opacity: 'slider.opacity',
    width: 'slider.width'
  }
});