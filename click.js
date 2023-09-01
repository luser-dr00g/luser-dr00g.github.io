const clickBoxTemplate = document.createElement( "template" );
clickBoxTemplate.innerHTML = `
  <style>
    input{
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
    if(  this.hasAttribute( "cycle" )  ){
      this._states =
	( this.hasAttribute("states") ?
	    this.getAttribute("states") : "empty true false" ).split( " " );
      console.log( this._states );
      this._stateNumber = 0;
      this._state = this._states[ this._stateNumber ];
      let box = this.shadowRoot.querySelector("#box");
      let size = this._states.
        map(x=>this.hasAttribute(x)?this.getAttribute(x):x).
        map(x=>x.length).
        reduce( max );
      console.log( size );
      box.setAttribute( "size", size );
    }
  }
  increment() {
    this._stateNumber = (this._stateNumber + 1) % this._states.length;
    this._state = this._states[ this._stateNumber ];
  }
  draw() {
    let box = this.shadowRoot.querySelector("#box");
    console.log( box );
    this.value = this._state;
    console.log( this.value );
    box.toggleAttribute( "readonly" );
    if(  this.hasAttribute( this.value )  ){
      box.value = this.getAttribute( this.value );
    } else {
      box.value = this.value;
    }
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
  }
  disconnectedCallback() {
    this.shadowRoot.querySelector("#box").removeEventListener();
  }
}

window.customElements.define( "click-box", ClickBox );
