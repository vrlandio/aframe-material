const Utils = require('../utils');
const Event = require('../core/event');
const Assets = require('./assets');
/*
@BUG: Space has not effect when no letter comes after.
@TODO: <progress value="70" max="100">70 %</progress>
*/

AFRAME.registerComponent('text-label', {
  schema: {
    value: {
      type: "string",
      default: ""
    },
    name: {
      type: "string",
      default: ""
    },
    color: {
      type: "color",
      default: "#000"
    },
    align: {
      type: "string",
      default: "left"
    },
    font: {
      type: "string",
      default: ""
    },
    opacity: {
      type: "number",
      default: 1
    },
    side: {
      type: "string",
      default: 'front'
    },
    tabSize: {
      type: "int",
      default: 4
    },
    letterSpacing: {
      type: "int",
      default: 0
    },
    lineHeight: {
      type: "string",
      default: ""
    },
    maxLength: {
      type: "int",
      default: 0
    },
    type: {
      type: "string",
      default: "raised"
    },
    width: {
      type: "number",
      default: 1
    },
    height: {
      type: "number",
      default: 0.18
    },
    radiusScale: {
      type: "number",
      default: 0.0125
    },
    backgroundColor: {
      type: "color",
      default: "#FFF"
    },
    backgroundOpacity: {
      type: "number",
      default: 1
    }
  },

  init: function () {
    let that = this;

    // Assets
    Utils.preloadAssets(Assets);

    this.shadow = document.createElement('a-image');
    this.shadow.setAttribute('height', this.data.height * 1.17);
    this.shadow.setAttribute('width', this.data.width * 1.17)
    this.shadow.setAttribute('src', '#aframeButtonShadow');
    this.shadow.setAttribute('position', `${this.data.width/2} 0 -0.001`);
    this.el.appendChild(this.shadow);

    this.background = document.createElement('a-rounded');
    this.background.setAttribute('radius', Math.max(this.data.width, this.data.height) * this.data.radiusScale);
    this.background.setAttribute('height', this.data.height);
    this.background.setAttribute('side', 'double')
    this.el.appendChild(this.background);

    this.text = document.createElement('a-entity');
    this.el.appendChild(this.text);

  },
  update: function () {
    let that = this;
    let padding = {
      left: 0.021,
      right: 0.021
    };

    let props = {
      color: this.data.color,
      align: this.data.align,
      side: this.data.side,
      tabSize: this.data.tabSize,
      wrapCount: 24 * this.data.width,
      width: this.data.width
    };

    // Max length
    if (this.data.maxLength) {
      props.value = this.data.value.substring(0, this.data.maxLength);
      this.el.setAttribute('value', props.value)
    } else {
      props.value = this.data.value;
    }

    if (this.data.font.length) {
      props.font = this.data.font
    }
    if (this.data.letterSpacing) {
      props.letterSpacing = this.data.letterSpacing;
    }
    if (this.data.lineHeight.length) {
      props.lineHeight = this.data.lineHeight;
    }
    this.text.setAttribute("text", props);
    if (this.data.align === 'left') {
      this.text.setAttribute('position', padding.left - 0.001 + this.data.width / 2 + ' 0 0.002');
    } else if (this.data.align === 'center') {
      this.text.setAttribute('position', -0.001 + this.data.width / 2 + ' 0 0.002');
    } else {
      this.text.setAttribute('position', -(padding.right - 0.001) + this.data.width / 2 + ' 0 0.002');
    }

    this.background.setAttribute('color', this.data.backgroundColor)
    this.background.setAttribute('width', this.data.width);
    this.background.setAttribute('position', '0 -0.09 0.001');

    if (this.data.type === 'flat') {
      this.shadow.setAttribute('visible', false);
    }
  },
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {}
});

AFRAME.registerPrimitive('a-text-label', {
  defaultComponents: {
    'text-label': {}
  },
  mappings: {
    value: 'text-label.value',
    name: 'text-label.name',
    color: 'text-label.color',
    align: 'text-label.align',
    font: 'text-label.font',
    'opacity': 'text-label.opacity',
    'side': 'text-label.side',
    'tab-size': 'text-label.tabSize',
    'max-length': 'text-label.maxLength',
    type: 'text-label.type',
    width: 'text-label.width',
    height: 'text-label.height',
    'letter-spacing': 'text-label.letterSpacing',
    'line-height': 'text-label.lineHeight',
    'radius-scale': 'text-label.radiusScale',
    'background-color': 'text-label.backgroundColor',
    'background-opacity': 'text-label.backgroundOpacity'
  }
});