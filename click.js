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
      cursor: default;
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
  increment() {
    this._stateNumber = (this._stateNumber + 1) % this._states.length;
    this._state = this._states[ this._stateNumber ];
  }
  draw() {
    let box = this.shadowRoot.querySelector("#box");
    //console.log( box );
    this.value = this._state;
    //console.log( this.value );
    this.label =
      this.hasAttribute( this.value )  ? this.getAttribute( this.value )  : this.value;
    box.toggleAttribute( "readonly" );
      box.value = this.label;
    box.toggleAttribute( "readonly" );
    box.blur();
  }
  click( event ){
    event.preventDefault();
    this.increment();
    this.draw();
    return;
  }
  connectedCallback() {
    this.shadowRoot.querySelector("#box").addEventListener( "click", (e)=>this.click(e) );

    if(  this.hasAttribute( "cycle" )  ){
      this._states =
	( this.hasAttribute("states") ?
	    this.getAttribute("states") : "empty true false" ).split( " " );
      //console.log( this._states );
      this._stateNumber = 0;
      this._state = this._states[ this._stateNumber ];
      let box = this.shadowRoot.querySelector("#box");
      let size = this._states.
        map(x=>this.hasAttribute(x)?this.getAttribute(x):x).
        map(x=>x.length).
        reduce( max );
      //console.log( size );
      box.setAttribute( "size", size );
      if(  this.hasAttribute( "value" )  ){
        this.setValue( this.getAttribute( "value" ) );
      }
    }
  }
  disconnectedCallback() {
    this.shadowRoot.querySelector("#box").removeEventListener();
  }
  static get observedAttributes() {
    return ["value"];
  }
  attributeChangedCallback( name, oldValue, newValue ){
    if(  name == "value"  ){
      if(  this.states  ) this.setValue( newValue );
    }
  }
}

window.customElements.define( "click-box", ClickBox );
