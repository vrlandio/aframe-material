const Utils = require('../utils');
const Event = require('../core/event');

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
    radius: {
      type: "number",
      default: 0.05
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
    }
  },
  init: function () {
    this.card = document.createElement('a-rounded');
    this.card.setAttribute('height', this.data.height);
    this.card.setAttribute('width', this.data.width);
    this.card.setAttribute('radius', this.data.radius);
    if (this.data.shift) {
      this.card.setAttribute('position', `0 0 -0.01`)
    } else {
      this.card.setAttribute('position', `${-this.data.width/2} ${-this.data.height/2} -0.01`)
    }
    this.el.append(this.card);
  },
  update: function () {
    this.card.setAttribute('color', this.data.color);
    this.card.setAttribute('opacity', this.data.opacity);
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
    radius: "card.radius",
    color: "card.color",
    opacity: "card.opacity"
  }
});