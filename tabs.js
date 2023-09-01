const tabsPanelTemplate = document.createElement( "template" );
tabsPanelTemplate.innerHTML = `
  <style>
    .tabs{
      display: flex;
      justify-content: flex-start;
      border-bottom: 2px solid;
    }
    ::slotted([slot="tab"]) {
      padding: 1ex;
      margin: 1ex;
      border: none;
    }
    ::slotted([slot="tab"].active) {
      border: solid 3px;
    }
    ::slotted([slot="content"]){
      display: none;
    }
    ::slotted([slot="content"].active){
      display: block;
    }
  </style>
  <slot name="tab" class="tabs"></slot>
  <slot name="content"></slot>
`;

class TabsPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow( {mode:"open"} );
    this.shadowRoot.appendChild( tabsPanelTemplate.content.cloneNode(true) );
  }

  connectedCallback() {
    this.querySelectorAll('[slot="tab"]').forEach( tab => {
      tab.addEventListener( "click", e => {
	this.querySelectorAll("[slot]").forEach( tab => tab.classList.remove( "active" ) );
	tab.classList.add( "active" );
	this.querySelector( tab.dataset.target ).classList.add( "active" );
      })
    });
  }

  disconnectedCallback() {
    this.querySelectorAll('[slot="tab"]').forEach( tab => {
      tab.removeEventListener();
    });
  }
};

window.customElements.define( "tabs-panel", TabsPanel );
