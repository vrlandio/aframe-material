const Assets = require('./assets');
const Config = require('./config');
const Utils = require('../utils');
const Event = require('../core/event');
const SFX = require('./sfx');
const Behaviors = {};

Behaviors.el = null;

// -----------------------------------------------------------------------------
// KEYBOARD METHODS

Behaviors.showKeyboard = function (el) {
  if (el.o_position) {
    el.object3D.position.copy(el.o_position);
  }
  el.isOpen = true;
  for (let item of el.querySelectorAll('[data-ui]')) {
    for (let child of item.children) {
      child.setAttribute('show', true);
    }
  }
  let parent = el.parentNode;
  if (parent) {
    return;
  }
  el.sceneEl.appendChild(el);
};

Behaviors.hideKeyboard = function (el) {
  let position = el.getAttribute("position");
  if (position.x !== -10000) {
    if (!el.o_position) {
      el.o_position = new THREE.Vector3();
    }
    el.o_position.copy(position);
  }
  el.isOpen = false;
  el.setAttribute("position", "-10000 -10000 -10000");
  el.setAttribute('fadeout', {
    duration: 1
  });
}

Behaviors.destroyKeyboard = function (el) {
  let parent = el.parentNode;
  if (!parent) {
    return;
  }
  parent.removeChild(el);
};

Behaviors.openKeyboard = function (el) {
  if (el.o_position) {
    el.object3D.position.copy(el.o_position);
  }
  el.isOpen = true;
  el._transitioning = true;
  let parent = el.parentNode;
  if (!parent) {
    el.sceneEl.appendChild(el);
  }
  for (let item of el.querySelectorAll('[data-ui]')) {
    for (let child of item.children) {
      child.setAttribute('hide', true);
    }

    function animationend() {
      item.children[0].removeEventListener('animationend', animationend)
      setTimeout(function () {
        item.children[1].setAttribute('fadein', {
          duration: 160
        });
        Event.emit(Behaviors.el, 'didopen');
        el._transitioning = false;
      }, 10)
    }
    item.children[0].setAttribute('fadein', {
      duration: 160
    });
    item.children[0].addEventListener('animationend', animationend)
  }
};

Behaviors.dismissKeyboard = function (el) {
  el._transitioning = true;
  for (let item of el.querySelectorAll('[data-ui]')) {
    for (let child of item.children) {
      child.setAttribute('show', true);
    }
    el.isOpen = false;

    function animationend() {
      item.children[1].removeEventListener('animationend', animationend)
      setTimeout(function () {
        function animationend() {
          item.children[0].removeEventListener('animationend', animationend);
          Behaviors.hideKeyboard(el);
          Event.emit(Behaviors.el, 'diddismiss');
          el._transitioning = false;
        }
        item.children[0].setAttribute('fadeout', {
          duration: 160
        });
        item.children[0].addEventListener('animationend', animationend);
      }, 10)
    }
    item.children[1].setAttribute('fadeout', {
      duration: 160
    });
    item.children[1].addEventListener('animationend', animationend)
  }
};

// -----------------------------------------------------------------------------
// KEY EVENTS

Behaviors.addKeyEvents = (el) => {
  el.addEventListener('click', (e) => {
    if (e instanceof MouseEvent && Behaviors.el.isOpen) {
      Behaviors.keyClick(el);
    }
  });
  el.addEventListener('mousedown', (e) => {
    if (e instanceof MouseEvent && Behaviors.el.isOpen) {
      Behaviors.keyDown(el);
    }
  });
  el.addEventListener('mouseup', (e) => {
    if (e instanceof MouseEvent && Behaviors.el.isOpen) {
      Behaviors.keyOut(el);
    }
  });
  el.addEventListener('raycaster-intersected', (e) => {
    if (e instanceof MouseEvent && Behaviors.el.isOpen) {
      Behaviors.keyIn(el);
    }
  });
  el.addEventListener('raycaster-intersected-cleared', (e) => {
    if (e instanceof MouseEvent && Behaviors.el.isOpen) {
      Behaviors.keyOut(el);
    }
  });
};

// -----------------------------------------------------------------------------
// KEYCLICK

Behaviors.keyClick = function (keyEl) {
  SFX.keyDown(Behaviors.el);

  let type = keyEl.getAttribute('key-type');
  let value = keyEl.getAttribute('key-value');

  if (type === 'text' || type === 'spacebar') {
    if (type === 'spacebar') {
      value = ' ';
    }
    if (Behaviors.isShiftEnabled) {
      value = value.toUpperCase();
      Behaviors.shiftToggle();
    }
    // else if (Behaviors.isSymbols) {
    //   Behaviors.symbolsToggle();
    // }
    Event.emit(Behaviors.el, 'input', value);
  } else if (type === 'shift') {
    Behaviors.shiftToggle();
  } else if (type === 'symbol') {
    Behaviors.symbolsToggle();
  } else if (type === 'backspace') {
    Event.emit(Behaviors.el, 'backspace');
  } else if (type === 'enter') {
    Event.emit(Behaviors.el, 'input', '\n');
    Event.emit(Behaviors.el, 'enter', '\n');
  } else if (type === 'dismiss') {
    Event.emit(Behaviors.el, 'dismiss');
  }
}

// -----------------------------------------------------------------------------
// KEYDOWN

Behaviors.keyDown = function (keyEl) {
  if (Behaviors.el._transitioning) {
    return;
  }
  keyEl.object3D.position.z = 0.003;
  if (keyEl.getAttribute('key-type') === 'spacebar') {
    keyEl.setAttribute('color', Config.SPACEBAR_COLOR_ACTIVE);
  } else {
    keyEl.setAttribute('color', Config.KEY_COLOR_ACTIVE);
  }
};

// -----------------------------------------------------------------------------
// KEYIN

Behaviors.keyIn = function (keyEl) {
  if (Behaviors.el._transitioning) {
    return;
  }
  if (keyEl.object3D.children[2] && keyEl.object3D.children[2].material && !keyEl.object3D.children[2].material.opacity) {
    return
  }
  SFX.keyIn(Behaviors.el);
  if (keyEl.getAttribute('key-type') === 'spacebar') {
    keyEl.setAttribute('color', Config.SPACEBAR_COLOR_HIGHLIGHT);
  } else {
    keyEl.setAttribute('color', Config.KEY_COLOR_HIGHLIGHT);
  }
};

// -----------------------------------------------------------------------------
// KEYOUT

Behaviors.keyOut = function (keyEl) {
  keyEl.object3D.position.z = 0;
  if (keyEl.getAttribute('key-type') === 'spacebar') {
    keyEl.setAttribute('color', Config.KEY_COLOR_ACTIVE);
  } else {
    keyEl.setAttribute('color', Config.KEYBOARD_COLOR);
  }
}

// -----------------------------------------------------------------------------
// SHIFT

Behaviors.isShiftEnabled = false;
Behaviors.shiftToggle = function () {
  Behaviors.isShiftEnabled = !Behaviors.isShiftEnabled;

  var icon_el = Behaviors.el.shiftKey.querySelector('[data-type]');
  if (Behaviors.isShiftEnabled) {
    icon_el.setAttribute('src', Assets.aframeKeyboardShiftActive);
  } else {
    icon_el.setAttribute('src', Assets.aframeKeyboardShift);
  }

  for (let keyEl of document.querySelectorAll("[key-id]")) {
    let key_id = keyEl.getAttribute('key-id'),
      key_type = keyEl.getAttribute('key-type');
    if (key_id.startsWith('main-') && key_type === "text") {
      let textEl = keyEl.querySelector('a-text');
      if (textEl) {
        let value = textEl.getAttribute('value').toLowerCase();
        if (this.isShiftEnabled) {
          value = value.toUpperCase();
        }
        textEl.setAttribute('value', value);
      }
    }
  }
}

Behaviors.isSymbols = false;
Behaviors.symbolsToggle = function () {
  Behaviors.isSymbols = !Behaviors.isSymbols;
  if (!Behaviors.isSymbols) {
    Behaviors.el.mainAlphaUI.object3D.position.set(0.312, 0, 0);
    Behaviors.el.mainSymbolUI.object3D.position.set(-10000, -10000, -10000);
  } else {
    Behaviors.el.mainSymbolUI.object3D.position.set(0.312, 0, 0);
    Behaviors.el.mainAlphaUI.object3D.position.set(-10000, -10000, -10000);
  }
}
module.exports = Behaviors;