const Utils = require('../utils');
const Event = require('../core/event');
const Assets = require('./assets');

AFRAME.registerComponent('card', {
  schema: {
    width: {
      type: "number",
      default: 1
    },
    height: {
      type: "number",
      default: 1
    },
    color: {
      type: "color",
      default: "#FFF"
    },
    opacity: {
      type: "number",
      default: 1
    },
    shift: {
      type: "boolean",
      default: true
    },
    type: {
      type: "string",
      default: "flat"
    },
    radiusScale: {
      type: "number",
      default: 0.0125
    }
  },
  init: function () {
    Utils.preloadAssets(Assets);

    this.card = document.createElement('a-rounded');
    this.card.setAttribute('height', this.data.height);
    this.card.setAttribute('width', this.data.width);
    this.card.setAttribute('radius', Math.max(this.data.height, this.data.width) * this.data.radiusScale);

    this.shadow = document.createElement('a-image');
    this.shadow.setAttribute('height', this.data.height * 1.25);
    this.shadow.setAttribute('width', this.data.width * 1.25)
    this.shadow.setAttribute('src', '#aframeButtonShadow');

    if (this.data.shift) {
      this.card.setAttribute('position', `0 0 -0.001`);
      this.shadow.setAttribute('position', `${this.data.width/2} ${this.data.height/2} -0.002`);
    } else {
      this.card.setAttribute('position', `${-this.data.width/2} ${-this.data.height/2} -0.001`);
      this.shadow.setAttribute('position', `0 0 -0.002`);
    }
    this.el.append(this.card);
    this.el.append(this.shadow);

  },
  update: function () {
    if (this.data.type === "flat") {
      this.shadow.setAttribute('visible', false);
    }
    this.card.setAttribute('color', this.data.color);
    Utils.updateOpacity(this.el, this.data.opacity);
  },
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {}
});

AFRAME.registerPrimitive('a-card', {
  defaultComponents: {
    card: {}
  },
  mappings: {
    width: "card.width",
    height: "card.height",
    color: "card.color",
    opacity: "card.opacity",
    type: "card.type",
    'radius-scale': "card.radiusScale"
  }
});