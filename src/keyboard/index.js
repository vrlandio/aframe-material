const Utils = require( "../utils" );
const Draw = require( "./draw" );
const Behaviors = require( "./behaviors" );
const SFX = require( "./sfx" );
const Event = require( "../core/event" );

AFRAME.registerComponent( "keyboard", {
	schema: {
		isOpen: { type: "boolean", default: false },
		physicalKeyboard: { type: "boolean", default: false }
	},
	currentInput: null,
	init: function () {

		let that = this;
		console.error( "keyboardInit" );
		// SFX
		//SFX.init(this.el);

		// Draw
		this.keydownEventKey = this.keydownEventKey.bind( this );
		this.inputEvent = this.inputEvent.bind( this );
		this.didFocusInputEventKey = this.didFocusInputEventKey.bind( this );
		this.didBlurInputEvent = this.didBlurInputEvent.bind( this );
		this.dismissEvent = this.dismissEvent.bind( this );
		this.backspaceEvent = this.backspaceEvent.bind( this );
		this.onTabNextInput = this.onTabNextInput.bind( this );
		Draw.init( this.el );

		// Init keyboard UI
		let numericalUI = Draw.numericalUI(),
			mainUI = Draw.mainUI(),
			actionsUI = Draw.actionsUI();

		// Create layout
		this.el.alphabeticalLayout = Draw.alphabeticalLayout();
		this.el.symbolsLayout = Draw.symbolsLayout();

		// Append layouts to UI
		//numericalUI.appendChild( Draw.numericalLayout() );
		mainUI.appendChild( this.el.alphabeticalLayout );
		actionsUI.appendChild( Draw.actionsLayout() );

		//this.el.appendChild( numericalUI );
		this.el.appendChild( mainUI );
		this.el.appendChild( actionsUI );

		// Inject methods in elements..
		this.el.show = function () {

			Behaviors.showKeyboard( that.el );

		};
		this.el.hide = function () {

			Behaviors.hideKeyboard( that.el );

		};
		this.el.open = function () {

			Behaviors.openKeyboard( that.el );

		};
		this.el.dismiss = function () {

			Behaviors.dismissKeyboard( that.el );

		};
	/*	this.el.destroy = function () {

			Behaviors.destroyKeyboard( that.el );

		};
*/
		// Set default value
	//	this.el.setAttribute( "scale", "1 1 1" );
	//	this.el.setAttribute( "rotation", "0 0 0" );
	//	this.el.setAttribute( "position", "-0.5 0.3 -1.5" );
		this.el.setAttribute( "class", "ui" );
		// Register keyboard events
		this.el.addEventListener( "input", this.inputEvent );
		this.el.addEventListener( "backspace", this.backspaceEvent );
		this.el.addEventListener( "dismiss", this.dismissEvent );
		this.el.addEventListener( "onTabNextInput", this.onTabNextInput );
		// Register global events
		document.addEventListener( "keydown", this.keydownEventKey );
		document.addEventListener( "didfocusinput", this.didFocusInputEventKey );
		document.addEventListener( "didblurinput", this.didBlurInputEvent );

	},
	update: function () {

		// document.removeEventListener("keydown", this.keydownEventKey.bind(this));
		if ( this.data.isOpen ) {

			Behaviors.showKeyboard( this.el );

		} else {

			Behaviors.hideKeyboard( this.el );

		}

	},
	tick: function () {},
	remove: function () {

		console.error( "keyboard remove" );
		document.removeEventListener( "keydown", this.keydownEventKey );

		this.el.removeEventListener( "input", this.inputEvent );
		this.el.removeEventListener( "backspace", this.backspaceEvent );
		this.el.removeEventListener( "dismiss", this.dismissEvent );
		this.el.removeEventListener( "onTabNextInput", this.onTabNextInput );
		document.removeEventListener( "didfocusinput", this.didFocusInputEventKey.bind( this ) );
		document.removeEventListener( "didblurinput", this.didBlurInputEvent.bind( this ) );

	},
	pause: function () {

		document.removeEventListener( "keydown", this.keydownEventKey.bind( this ) );

	},
	play: function () {},

	// Fired on keyboard key press
	inputEvent: function ( e ) {

		e.stopPropagation();
		e.preventDefault();
		if ( this.currentInput ) {

			console.error( e.detail );
			this.currentInput.appendString( e.detail );

		}

	},

	// Fired on backspace key press
	backspaceEvent: function ( e ) {

		e.stopPropagation();
		e.preventDefault();
		console.error( "backspaceEvent deleteLast" );
		if ( this.currentInput ) {

			this.currentInput.deleteLast();

		}

	},

	dismissEvent: function ( e ) {

		if ( this.currentInput ) {

			this.currentInput.blur();

		}

	},

	onTabNextInput: function ( e ) {

		console.error( this.currentInput );
		let inputs = document.querySelectorAll( "a-input" );
		console.error( inputs );
		if ( this.currentInput ) {

			this.currentInput.blur();

		}
		if ( inputs[ 1 ] ) inputs[ 1 ].focus();

	},
	// physical keyboard event
	keydownEventKey: function ( e ) {

		console.error( e );
		console.error( "keydown" + e );
		console.error( "keydown" + e.key );
		console.error( "keydown" + this.currentInput );
		if ( this.data.physicalKeyboard) {

			// this.currentInput = e.detail

			if ( e.key === "Enter" ) {

				Event.emit( Behaviors.el, "input", "\n" );
				Event.emit( Behaviors.el, "enter", "\n" );

			} else if ( e.key === "Backspace" ) {

				Event.emit( Behaviors.el, "backspace" );

			} else if ( e.key === "Escape" ) {
				// Event.emit(Behaviors.el, "dismiss");
			} else if ( e.key === "Tab" ) {

				Event.emit( Behaviors.el, "onTabNextInput" );

			} else if ( e.key.length < 2 ) {

				Event.emit( Behaviors.el, "input", e.key );

			}
			e = null;

		}

	},

	// Fired when an input has been selected
	didFocusInputEventKey: function ( e ) {

		e.preventDefault();
		e.stopPropagation();
		console.error( "didFocusInputKey" );
		console.error( e );
		if ( this.currentInput ) {

			this.currentInput.blur( true );

		}
		this.currentInput = e.detail;
		if ( ! this.el.isOpen ) {
			//Behaviors.openKeyboard(this.el);
		}
		e = null;

	},

	// Fired when an input has been deselected
	didBlurInputEvent: function ( e ) {
console.error("didBlurInputEvent")
		this.currentInput = null;
		Behaviors.dismissKeyboard( this.el );

	}
} );

AFRAME.registerPrimitive( "a-keyboard", {
	defaultComponents: {
		keyboard: {}
	},
	mappings: {
		"is-open": "keyboard.isOpen",
		"physical-keyboard": "keyboard.physicalKeyboard"
	}
} );
