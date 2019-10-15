// based on https://gist.github.com/mlhaufe/c841b2269b0099c3c52648717f9551cc
class Model {
  _observers = []
  _value = 0;
  observe( observer ){ this._observers.push( observer ) }
  unobserve(observer){ this._observers=this._observers.filter(o=> o!==observer)}
  notify( data ){ this._observers.forEach(o=> o.update(data) ) }
  set value( value ){
    this._value = value
    if( typeof( this.onChange ) == 'function' ) this.onChange( value )
    this.notify( value )
  }
  get value(){
    return this._value
  }
}

class SessionModel extends Model {
  _sessionVariable = '';
  constructor( sessionVariable, defaultValue ){
    super()
    this._sessionVariable = sessionVariable
    this._defaultValue = defaultValue;
    //this.loadValue()
  }
  loadValue(){
    if( sessionStorage.getItem( this._sessionVariable ) )
      super.value = sessionStorage.getItem( this._sessionVariable )
    else
      super.value = this._defaultValue
  }
  saveValue( value ){
    sessionStorage.setItem( this._sessionVariable, value )
  }
  onChange( value ){
    this.saveValue( value )
  }
}

class DependentModel extends Model {
  constructor( models, update ){
    super()
    models.forEach( m=> m.observe( this ) )
    this.update = update
  }
}

class View {
  _subViews = []
  constructor( model ){
    if( model ) this.setModel( model )
  }
  update( data ){
    this.onUpdate( data );
    this._subViews.forEach( s=> s.update( data ) );
  }
  getModel(){ return this._model }
  setModel( model ){ this._setModelAndController( model, this._controller ) }
  getDefaultController(){ return new Controller }
  getController(){ if( !this._controller )
                     this.setController(this.getDefaultController())
		   return this._controller}
  setController(controller){this._setModelAndController(this._model,controller)}
  _setModelAndController( model, controller ){
    if( this._model !== model ){
      if( this._model ) this._model.unobserve( this )
      if( model ) model.observe( this )
      this._model = model
    }
    if( controller ){ controller.setView( this ); controller.setModel( model ) }
    this._controller = controller
  }
  getSubViews(){ return new Array( this._subViews ) }
  addSubView( subView ){
    var prev = subView.getSuperView()
    if( prev ) prev.removeSubView( subView )
    this._subViews.push( subView )
    subView.setSuperView( this )
  }
  removeSubView( subView ){
    this._subViews=this._subViews.filter(s=>{if(s===subView) s.setSuperView(null)
                                               return s !== subView })
  }
  setSuperView( superView ){ this._superView = superView }
  getSuperView(){ return this._superView }
  destroy(){
    if( this._model ) this._model.unobserve( this )
    this._subViews.forEach(s=> s.destroy() )
  }
  onUpdate( value ){ }
  find( sel, ctx ){
    return (ctx || document).querySelector( sel )
  }
  show( element ){
    element.style.display = 'block';
  }
  hide( element ){
    element.style.display = 'none';
  }
}

class Controller {
  getModel(){ return this._model }
  setModel( model ){ this._model = model }
  getView(){ return this._view }
  setView( view ){ this._view = view } }

export { Model, SessionModel, DependentModel, View, Controller }
