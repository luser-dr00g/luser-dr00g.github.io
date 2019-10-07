class Model {
  _observers = []
  observe( observer ){ this._observers.push( observer ) }
  unobserve(observer){ this._observers=this._observers.filter(o=> o!==observer)}
  notify( data ){ this._observers.forEach(o=> o.update(data) ) }
  setValue( value ){
    if( typeof( this.onChange ) == 'function' ) this.onChange( value )
    this.notify( this.value = value )
  };
}

class View {
  _subViews = []
  update( data ){
    if( typeof( this.onUpdate ) == 'function' ) this.onUpdate( data );
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
  } }

class Controller {
  getModel(){ return this._model }
  setModel( model ){ this._model = model }
  getView(){ return this._view }
  setView( view ){ this._view = view } }

export { Model, View, Controller }
