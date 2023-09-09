const clickBoxTemplate = document.createElement( "template" );
clickBoxTemplate.innerHTML = `
  <style>
    :host {
      --bg-color: var(--table-bg, white);
      --fg-color: var(--text, black);
    }
    input{
      color: var(--fg-color);
      border-color: var(--fg-color);
      background-color: var(--bg-color);
      text-align: center;
      font-size: x-small;
      cursor: default;
      padding: 0;
      margin: 0;
    }
  </style>
  <input id="box" type="text" readonly>
`;

function max( x, y ){
  return  y > x  ? y  : x;
}

class ClickBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow( {mode:"open"} );
    this.shadowRoot.appendChild( clickBoxTemplate.content.cloneNode(true) );

  }
  setValue( val ){
    this._state = val;
    this._stateNumber = this._states.findIndex( x => x == val );
    this.draw();
  }
  setLabel( label ){
    this._stateNumber = this._labels.findIndex( x => x == label );
    this._state = this._states[ this._stateNumber ];
    this.draw();
  }
  increment() {
    this._stateNumber = (this._stateNumber + 1) % this._states.length;
    this._state = this._states[ this._stateNumber ];
    this.draw();
  }
  draw() {
    //console.log( box );
    this.setAttribute( "value", this._state );
    this.label =
      this.hasAttribute( this._state )  ? this.getAttribute( this._state )  : this._state;
    this.setAttribute( "label", this.label );
    let box = this.shadowRoot.querySelector("#box");
    box.toggleAttribute( "readonly" );
      box.value = this.label;
    box.toggleAttribute( "readonly" );
    box.blur();
    this.dispatchChangeEvent();
  }
  click( event ){
    event.preventDefault();
    this.increment();
    return;
  }
  connectedCallback() {
    let clicker = (e)=>{this.click(e)}
    this.shadowRoot.querySelector("#box").addEventListener( "click", clicker );
    this._clicker = clicker;

    if(  this.hasAttribute( "cycle" )  ){
      this._states =
	( this.hasAttribute("states") ?
	    this.getAttribute("states") : "empty true false" ).split( " " );
      this._labels = this._states.map( x=>this.hasAttribute(x)?this.getAttribute(x):x );
      //console.log( this._states );
      this._stateNumber = 0;
      this._state = this._states[ this._stateNumber ];
      let box = this.shadowRoot.querySelector("#box");
      let size = this._states.
        map( x=>this.hasAttribute(x)?this.getAttribute(x):x ).
        map( x=>x.length ).
        reduce( max );
      //console.log( size );
      box.setAttribute( "size", size );
      if(  this.hasAttribute( "value" )  ){
        this.setValue( this.getAttribute( "value" ) );
      }
    }
  }
  disconnectedCallback() {
    if(  this._clicker  ){
      this.shadowRoot.querySelector("#box").removeEventListener( "click", this._clicker );
      this._clicker = null;
    }
  }
  static get observedAttributes() {
    return ["value", "label"];
  }
  attributeChangedCallback( name, oldValue, newValue ){
    switch(  name  ){
    case "value": if(  this.states  ) this.setValue( newValue ); break;
    case "label": if(  this.states  ) this.setLabel( newValue ); break;
    }
  }
  dispatchChangeEvent(){
    const changeEvent = new CustomEvent( 'change', {
      detail: this._state,
      bubbles: true,
      composed: true,
    } );
    this.dispatchEvent( changeEvent );
  }
}

window.customElements.define( "click-box", ClickBox );
