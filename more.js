const morePanelTemplate = document.createElement("template");
morePanelTemplate.innerHTML = `
  <style>
    .content{
      border: 1px solid;
      border-radius: 5px;
    }
    #toggle{
      font-size: small;
      text-decoration: underline;
      cursor: pointer;
    }
  </style>
  <div class="content">
    <span id=toggle></span>
    <slot></slot>
  </div>
`;

class MorePanel extends HTMLElement {

  constructor() {
    super();
    this.attachShadow( {mode:"open"} );
    this.shadowRoot.appendChild( morePanelTemplate.content.cloneNode(true) );
    let content = this.shadowRoot.querySelector(".content");
    this.showStuff();
  }

  showStuff() {
    if(  this.classList.contains( "more" )  )
      this.showMore();
    else
      this.showLess();
  }
  
  connectedCallback() {
    this.shadowRoot.querySelector("#toggle").addEventListener( "click", ()=>{
      this.classList.toggle( "more" );
      this.showStuff();
    });
    self.addEventListener( "redraw", (event) => this.showStuff() );
  }
  
  disconnectedCallback() {
    this.shadowRoot.querySelector("#toggle").removeEventListener();
  }

  showMore() {
    this.shadowRoot.querySelector("#toggle").textContent="(less)";
    this.querySelectorAll(".less").forEach( el => el.style.display = 'none' );
    this.querySelectorAll(".more").forEach( el => el.style.display = '' );
  }

  showLess() {
    this.shadowRoot.querySelector("#toggle").textContent="(more)";
    this.querySelectorAll(".more").forEach( el => el.style.display = 'none' );
    this.querySelectorAll(".less").forEach( el => el.style.display = '' );
  }
}

window.customElements.define( "more-panel", MorePanel );
