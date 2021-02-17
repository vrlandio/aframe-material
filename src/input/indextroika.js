const Utils = require( "../utils" );
const Event = require( "../core/event" );
import { getCaretAtPoint, getSelectionRects } from 'troika-three-text'
/*
@BUG: Space has not effect when no letter comes after.
@TODO: <progress value="70" max="100">70 %</progress>
*/

AFRAME.registerComponent( "inputtroika", {
	schema: {
		value: { type: "string", default: "" },
		name: { type: "string", default: "" },
		disabled: { type: "boolean", default: false },
		color: { type: "color", default: "#fff" },
		align: { type: "string", default: "left" },
		font: { type: "string", default: "" },
		fontSize: { type: "number", default: 0.01 },
		maxWidth: { type: "number", default: 0.3 },
		letterSpacing: { type: "int", default: 0 },
		lineHeight: { type: "string", default: "" },
		opacity: { type: "number", default: 0 },
		side: { type: "string", default: "front" },
		tabSize: { type: "int", default: 4 },
		placeholder: { type: "string", default: "" },
		placeholderColor: { type: "color", default: "#AAA" },
		maxLength: { type: "int", default: 25 },
		type: { type: "string", default: "text" },
		width: { type: "number", default: 1 },
		height: { type: "number", default: 0.18 },
		cursorWidth: { type: "number", default: 0.005 },
		cursorHeight: { type: "number", default: 0.015 },
		cursorColor: { type: "color", default: "#007AFF" },
		backgroundColor: { type: "color", default: "#fff" },
		backgroundOpacity: { type: "number", default: 0 }
	},

	init: function () {

	
		let that = this;

		this.background = document.createElement( "a-plane" );
	
		this.background.setAttribute( "height", this.data.height );
		this.background.setAttribute( "position", "0 0 0" );
		this.background.setAttribute( "side", "double" );
		this.background.setAttribute( "class", "ui" );
		this.el.appendChild( this.background );

		this.cursor = document.createElement( "a-plane" );
		this.cursor.setAttribute( "position", "0 0 0" );
		this.cursor.setAttribute( "visible", false );
	//	this.cursor.setAttribute( "class", "ui" );
		this.el.appendChild( this.cursor );

		this.text = document.createElement( "a-troika-text" );
		this.text.setAttribute("troika-text","maxWidth", this.data.maxWidth)
		this.text.setAttribute("troika-text","align", "left")
		this.text.setAttribute("troika-text","fontSize", this.data.fontSize)
		this.text.setAttribute("troika-text","color", "#ffffff")
		this.text.setAttribute("troika-text","baseline", "top")
		this.text.setAttribute("troika-text","anchor", "align")
		
		
		this.el.appendChild( this.text );

		this.placeholder = document.createElement( "a-entity" );
		this.placeholder.setAttribute( "visible", false );
		this.el.appendChild( this.placeholder );

		this.el.focus = this.focus.bind( this );
		this.el.blur = this.blur.bind( this );
		this.el.appendString = this.appendString.bind( this );
		this.el.setString = this.setString.bind( this );
		this.el.deleteLast = this.deleteLast.bind( this );

	
		
		this.text.addEventListener("object3dset", e => {
			this.text.object3D.children[0].addEventListener('synccomplete', (e) => {
				let padding = {
					left: 0.01,
					right: 0.01,
					top: 0.002
				};

				let v = e.target._textRenderInfo.totalBlockSize 

				const catBox = getSelectionRects(e.target._textRenderInfo, 0 , this.data.value.length )

				let right = 0
				 if (catBox[catBox.length-1]) 
				   right = catBox[catBox.length-1].right
				this.cursor.setAttribute("position", ((right - this.data.width / 2) + padding.left)   + " "  + ((this.data.height / 2 - v[1]) - padding.top +this.data.cursorHeight/2)   + " 0.0004");
			  })
		})


		
		this.blink();
		this.background.addEventListener( "mousedown", e => {

			e.stopPropagation();
			e.preventDefault();

			
			  
		
			if ( this.data.disabled ) {

				this.blur();
				return;

			}

			that.focus();

		} );




		/*this.background.addEventListener( "mouseout", e => {

			e.stopPropagation();
			e.preventDefault();

			
			  
		
			if ( this.data.disabled ) {

				this.blur();
				return;

			}

			that.blur();

		} );
*/
	
		Object.defineProperty( this.el, "value", {
			get: function () {

				return this.getAttribute( "value" );

			},
			set: function ( value ) {

				this.setAttribute( "value", value );

			},
			enumerable: true,
			configurable: true
		} );

	},
	play: function () {

		console.error( "input play" );

	},
	pause: function () {

		console.error( "input pause" );

	},
	blink: function () {

		let that = this;
		if ( ! this.isFocused ) {

			this.cursor.setAttribute( "visible", false );
			clearInterval( this.cursorInterval );
			this.cursorInterval = null;
			return;

		}

		this.cursorInterval = setInterval( function () {

			that.cursor.setAttribute( "visible", ! that.cursor.getAttribute( "visible" ) );

		}, 500 );

	},
	isFocused: false,
	focus: function ( noemit ) {

		if ( this.isFocused ) {

			return;

		}
		console.error( "focus" );

		this.isFocused = true;
		this.cursor.setAttribute( "visible", true );
		this.blink();

		Event.emit( this.el, "focus" );
		if ( ! noemit ) {

			Event.emit( document, "didfocusinput", this.el );

		}

		
		let playerRig = document.querySelector( "#player-rig" );
		playerRig.setAttribute( "character-controller", "enabled", false );
		playerRig.setAttribute( "jump-component", "enabled", false );
		playerRig.setAttribute( "thirdpersionview-component-toggle", "enabled", false );
		playerRig.setAttribute( "reposition-component", "enabled", false );
		if (this.el.getAttribute( "gun"))
		this.el.setAttribute( "gun", "enabled", false );
		this.el.sceneEl.setAttribute( "preventDefaultKeys", "enabled", false );

		// noemit = false;

	},
	blur: function ( noemit ) {

		console.error( "blur" );
		if ( ! this.isFocused ) {

			return;

		}
		this.isFocused = false;
		if ( this.cursorInterval ) {

			clearInterval( this.cursorInterval );
			this.cursorInterval = null;

		}
		this.cursor.setAttribute( "visible", false );
		Event.emit( this.el, "didblurinput" );
		if ( ! noemit ) {

			Event.emit( document, "didblurinput", this.el );

		}

		
		let playerRig = document.querySelector( "#player-rig" );
		playerRig.setAttribute( "character-controller", "enabled", true );
		playerRig.setAttribute( "jump-component", "enabled", true );
		playerRig.setAttribute( "thirdpersionview-component-toggle", "enabled", true );
		playerRig.setAttribute( "reposition-component", "enabled", true );
		if (this.el.getAttribute( "gun"))
		this.el.setAttribute( "gun", "enabled", true );
		this.el.sceneEl.setAttribute( "preventDefaultKeys", "enabled", true );

	},
	appendString: function ( data ) {

		if ( data === "\n" ) {

			return this.blur();

		}
		let str = this.el.getAttribute( "value" );
	/*	if ( ! str ) {

			str = "";

		}
	*/
		str = str + data;
		this.el.setAttribute( "value", str );
	
		Event.emit( this.el, "change", str );

	},
	setString: function ( data ) {

		let str = this.el.getAttribute( "value" );
	/*	if ( ! str ) {

			str = "";

		}
	*/
		str = data;
		this.el.setAttribute( "value", str );
		Event.emit( this.el, "change", str );

	},
	deleteLast: function () {

		let str = this.el.getAttribute( "value" );
	/*	if ( ! str ) {

			str = "";

		}
	*/
		str = str.slice( 0, - 1 );
		this.el.setAttribute( "value", str );
		Event.emit( this.el, "change", str );

	},
	updateText: function () {

		let that = this;
		let padding = {
			left: 0.01,
			right: 0.01,
			top: 0.001
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
		if ( this.data.maxLength ) {

			props.value = this.data.value.substring( 0, this.data.maxLength );
			this.el.setAttribute( "value", props.value );

		} else {

			props.value = this.data.value;

		}

		if ( this.data.type === "password" ) {

			props.value = "*".repeat( this.data.value.length );

		}

		if ( this.data.font.length ) {

			props.font = this.data.font;

		}
		if ( this.data.letterSpacing ) {

			props.letterSpacing = this.data.letterSpacing;

		}
		if ( this.data.lineHeight.length ) {

			props.lineHeight = this.data.lineHeight;

		}
		console.error(props)
	//	this.text.setAttribute( "visible", false );
		this.text.setAttribute( "troika-text", props );

	console.error(this.text.object3D)

		if ( props.value.length ) {

			this.placeholder.setAttribute( "visible", false );

		} else {

			this.placeholder.setAttribute( "visible", true );

		}

		let placeholder_props = Utils.clone( props );
		placeholder_props.value = this.data.placeholder;
		placeholder_props.color = this.data.placeholderColor;
		//placeholder_props.fontSize = 0.01;
		this.placeholder.setAttribute( "troika-text", placeholder_props );
		this.placeholder.setAttribute( "position", "0 0 0.0001" );
	


		this.background.setAttribute( "color", this.data.backgroundColor );
		/*if (this.data.backgroundOpacity) {
      setTimeout(function() {
        Utils.updateOpacity(that.background, that.data.backgroundOpacity);
      }, 0);
    }*/
		this.background.setAttribute( "width", this.data.width );
		//this.background.setAttribute('position', this.data.width/2+' 0 0');
		//this.background.setAttribute( "position", "0 -0.09 0.001" );
		//this.text.setAttribute( "position", -this.data.width / 2 + " 0 0.002" );
		//this.placeholder.setAttribute( "position", padding.left - 0.001 + this.data.width / 2 + " 0 0.002" );
		this.text.setAttribute( "position",  ((-this.data.width / 2) + padding.left) + " " +  ((this.data.height / 2) - padding.top) + " 0.0001" );

	},
	updateCursor: function () {

		this.cursor.setAttribute( "width", this.data.cursorWidth );
		this.cursor.setAttribute( "height", this.data.cursorHeight );
		this.cursor.setAttribute( "color", this.data.cursorColor );
		this.cursor.setAttribute( "emissive", this.data.cursorColor );

	},
	update: function () {


	

		this.updateCursor();
		this.updateText();

	},
	tick: function () {},
	remove: function () {

console.error("input remove")
this.blur();
this.el.removeObject3D( "mesh" );

//this.background.geometry.dispose();
//this.background.material.dispose();

this.el.object3D.remove(this.background)
this.el.remove(this.background)
this.el.object3D.remove(this.cursor)
this.el.remove(this.cursor)
this.el.object3D.remove(this.placeholder)
this.el.remove(this.placeholder)
this.el.object3D.remove(this.text)
this.el.remove(this.text)

console.error(this.placeholder.object3D)
console.error(this.el.object3D)

	},
	pause: function () {},
	play: function () {}
} );

AFRAME.registerPrimitive( "a-inputtroika", {
	defaultComponents: {
		inputtroika: {}
	},
	mappings: {
		value: "inputtroika.value",
		name: "inputtroika.name",
		disabled: "inputtroika.disabled",
		color: "inputtroika.color",
		align: "inputtroika.align",
		font: "inputtroika.font",
		"letter-spacing": "inputtroika.letterSpacing",
		"line-height": "inputtroika.lineHeight",
		opacity: "inputtroika.opacity",
		side: "inputtroika.side",
		"tab-size": "inputtroika.tabSize",
		placeholder: "inputtroika.placeholder",
		"placeholder-color": "inputtroika.placeholderColor",
		"max-length": "inputtroika.maxLength",
		type: "inputtroika.type",
		width: "inputtroika.width",
		height: "inputtroika.height",
		"font-size": "inputtroika.fontSize",
		"cursor-width": "inputtroika.cursorWidth",
		"cursor-height": "inputtroika.cursorHeight",
		"cursor-color": "inputtroika.cursorColor",
		"background-color": "inputtroika.backgroundColor",
		"background-opacity": "inputtroika.backgroundOpacity"
	}
} );
