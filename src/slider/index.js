const Utils = require("../utils");
const Event = require("../core/event");
const Assets = require("./assets");
const SFX = require("./sfx");

AFRAME.registerComponent("slider", {
  schema: {
    name: { type: "string", default: "" },
    enabled: { type: "boolean", default: false },
    disabled: { type: "boolean", default: false },
    fillColor: { type: "color", default: "#bababa" },
    knobColor: { type: "color", default: "#f5f5f5" },
    fillColorEnabled: { type: "color", default: "#80a8ff" },
    knobColorEnabled: { type: "color", default: "#4076fd" },
    fillColorDisabled: { type: "color", default: "#939393" },
    knobColorDisabled: { type: "color", default: "#a2a2a2" }
  },
  init: function() {
    var that = this;

    // Assets
    Utils.preloadAssets(Assets);

    // SFX
    SFX.init(this.el);

    // FILL
    this.el.fill = document.createElement("a-rounded");
    this.el.fill.setAttribute("width", 2);
    this.el.fill.setAttribute("height", 0.16);
    this.el.fill.setAttribute("radius", 0.08);
    this.el.fill.setAttribute("side", "double");
    this.el.fill.setAttribute("position", "0 0 0.01");
    this.el.appendChild(this.el.fill);

    // KNOB
    this.el.knob = document.createElement("a-circle");
    this.el.knob.setAttribute("position", "0.06 0.08 0.02");
    this.el.knob.setAttribute("radius", 0.12);
    this.el.knob.setAttribute("side", "double");
    this.el.appendChild(this.el.knob);

    // SHADOW
    this.el.shadow_el = document.createElement("a-image");
    this.el.shadow_el.setAttribute("width", 0.24 * 1.25);
    this.el.shadow_el.setAttribute("height", 0.24 * 1.25);
    this.el.shadow_el.setAttribute("position", "0 0 -0.001");
    this.el.shadow_el.setAttribute("src", "#aframeSwitchShadow");
    this.el.knob.appendChild(this.el.shadow_el);

    this.el.addEventListener("click", function(evt) {
      console.log("I was clicked at: ", evt.detail.intersection.point);
      var localCoordinates = this.el.object3D.worldToLocal(
        evt.detail.intersection.point
      );
      console.log("local coordinates: ", localCoordinates);
      console.log("current percent: " + data.percent);
      var sliderBarWidth = 2; // total width of slider bar
      if (localCoordinates.x <= -sliderBarWidth / 2) {
        data.percent = 0;
      } else if (localCoordinates.x >= sliderBarWidth / 2) {
        data.percent = 1.0;
      } else {
        data.percent =
          (localCoordinates.x + sliderBarWidth / 2) / sliderBarWidth;
      }
      console.log("handle container: " + handleContainer);
      Event.emit(this, "change", this.components.slider.data.enabled);
    });

    Object.defineProperty(this.el, "enabled", {
      get: function() {
        return this.getAttribute("enabled");
      },
      set: function(value) {
        this.setAttribute("enabled", value);
      },
      enumerable: true,
      configurable: true
    });
  },
  on: function() {
    this.el.fill.setAttribute("color", this.data.fillColorEnabled);
    this.el.knob.setAttribute("position", "0.32 0.08 0.02");
    this.el.knob.setAttribute("color", this.data.knobColorEnabled);
  },
  off: function() {
    this.el.fill.setAttribute("color", this.data.fillColor);
    this.el.knob.setAttribute("position", "0.06 0.08 0.02");
    this.el.knob.setAttribute("color", this.data.knobColor);
  },
  disable: function() {
    this.el.fill.setAttribute("color", this.data.fillColorDisabled);
    this.el.knob.setAttribute("color", this.data.knobColorDisabled);
  },
  update: function() {
    //this.el.knob.getAttribute('position')
  },
  tick: function() {},
  remove: function() {},
  pause: function() {},
  play: function() {}
});

AFRAME.registerPrimitive("a-slider", {
  defaultComponents: {
    switch: {}
  },
  mappings: {
    name: "slider.name",
    enabled: "slider.enabled",
    disabled: "slider.disabled",
    "fill-color": "slider.fillColor",
    "knob-color": "slider.knobColor",
    "fill-color-enabled": "slider.fillColorEnabled",
    "knob-color-enabled": "slider.knobColorEnabled",
    "fill-color-disabled": "slider.fillColorDisabled",
    "knob-color-disabled": "slider.knobColorDisabled"
  }
});
