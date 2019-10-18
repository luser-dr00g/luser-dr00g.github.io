/*jshint esversion: 6 */

// based on https://gist.github.com/mlhaufe/c841b2269b0099c3c52648717f9551cc
class Model {
  constructor(){
    this._observers = [];
  }
  observe( observer ){ this._observers.push( observer ); }
  unobserve(observer){ this._observers=this._observers.filter(o=> o!==observer);}
  notify( data ){ this._observers.forEach(o=> o.update(data) ); }
  set value( value ){
    this._value = value;
    this.onChange( value );
    this.notify( value );
  }
  get value(){
    return this._value;
  }
  onChange( value ){ }
}

class SessionModel extends Model {
  constructor( sessionVariable, defaultValue ){
    super();
    this._sessionVariable = sessionVariable;
    this._defaultValue = defaultValue;
    //this.loadValue()
  }
  loadValue(){
    if( sessionStorage.getItem( this._sessionVariable ) )
      super.value = sessionStorage.getItem( this._sessionVariable );
    else
      super.value = this._defaultValue;
  }
  saveValue( value ){
    //console.log( 'saveValue' );
    sessionStorage.setItem( this._sessionVariable, value );
  }
  onChange( value ){
    this.saveValue( value );
  }
}

class DependentModel extends Model {
  constructor( models ){
    super();
    models.forEach( m=> m.observe( this ) );
  }
}

class View {
  constructor( model ){
    if( model ) this.setModel( model );
    this._subViews = [];
  }
  update( data ){
    this.onUpdate( data );
    this._subViews.forEach( s=> s.update( data ) );
  }
  getModel(){ return this._model; }
  setModel( model ){ this._setModelAndController( model, this._controller ); }
  getDefaultController(){ return new Controller(); }
  getController(){ if( !this._controller )
		     this.setController(this.getDefaultController());
		   return this._controller; }
  setController(controller){this._setModelAndController(this._model,controller);}
  _setModelAndController( model, controller ){
    if( this._model !== model ){
      if( this._model ) this._model.unobserve( this );
      if( model ) model.observe( this );
      this._model = model;
    }
    if( controller ){ controller.setView( this ); controller.setModel( model ); }
    this._controller = controller;
  }
  getSubViews(){ return new Array( this._subViews ); }
  addSubView( subView ){
    var prev = subView.getSuperView();
    if( prev ) prev.removeSubView( subView );
    this._subViews.push( subView );
    subView.setSuperView( this );
  }
  removeSubView( subView ){
    this._subViews=this._subViews.filter(s=>{if(s===subView)s.setSuperView(null);
                                             return s !== subView; });
  }
  setSuperView( superView ){ this._superView = superView; }
  getSuperView(){ return this._superView; }
  destroy(){
    if( this._model ) this._model.unobserve( this );
    this._subViews.forEach(s=> s.destroy() );
  }
  setHtmlElement( element ){ this._htmlElement = element; }
  onUpdate( value ){ }
  find( sel ){
    return (this._htmlElement || document).querySelector( sel );
  }
  findAll( sel ){
    return Array.from( (this._htmlElement || document).querySelectorAll( sel ) );
  }
  show( element ){
    (element || this._htmlElement).style.display = '';
  }
  hide( element ){
    (element || this._htmlElement).style.display = 'none';
  }
}

class Controller {
  getModel(){ return this._model; }
  setModel( model ){ this._model = model; }
  getView(){ return this._view; }
  setView( view ){ this._view = view; }
}

export { Model, SessionModel, DependentModel, View, Controller };
