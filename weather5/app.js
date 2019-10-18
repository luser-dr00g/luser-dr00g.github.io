/*jshint esversion: 6 */

import {
  LocationModel, UnitModel, DaysModel, WeatherModel, ForecastModel,
  UnitView, DaysView, ReportView, DetailView, ChartDays, ChartView,
} from './weather.js';
import { View, Controller } from './mvc.js';

class WeatherController extends Controller {
  search(){
    const input = this.getView().find( '.location' );
    _location.value = input.value;
    input.blur();
  }
  unit_imperial(){ unit.value = 'imperial';
		   detail.update( weather.value );
		   chart.update( forecast.value ); }
  unit_metric(){   unit.value = 'metric';
		   detail.update( weather.value );
		   chart.update( forecast.value ); }
  unit_standard(){ unit.value = 'standard';
		   detail.update( weather.value );
		   chart.update( forecast.value ); }
  forecast_1(){ days.value = 1; }
  forecast_2(){ days.value = 2; }
  forecast_3(){ days.value = 3; }
  forecast_4(){ days.value = 4; }
  forecast_5(){ days.value = 5; }
}

var _location  = new LocationModel();
var unit      = new UnitModel( 'weather_unit', 'imperial' );
var days      = new DaysModel( 'weather_days', 2 );

var weather   = new WeatherModel( [ _location ] );
var forecast  = new ForecastModel( [ _location ] );

var locationView = new View( _location );
var unitView  = new UnitView( unit );
var daysView  = new DaysView( days );
var report    = new ReportView( weather );
var detail    = new DetailView( weather );
detail._unit  = unit;
var chartdays = new ChartDays( days );
var chart     = new ChartView( forecast );
chart._unit   = unit;

var control  = new WeatherController();
control.setView( locationView );


function main(){
  document.addEventListener( 'click', click );
  document.addEventListener( 'keydown', key );

  unitView.setHtmlElement( unitView.find('#unit') );
  daysView.setHtmlElement( daysView.find('#days') );
  detail.setHtmlElement( detail.find('.detail') );
  chartdays.setHtmlElement( chartdays.find('.chart') );
  chart.setHtmlElement( chart.find('.chart') );

  chart.findAll('tr').forEach( (tr,i)=>{
    tr.addEventListener( 'mouseenter', ()=>
      detail.update( forecast.value.list[i] )
    );
    tr.addEventListener( 'mouseleave', ()=>
      detail.update( weather.value )
    );
  });
  unit.loadValue();
  days.loadValue();
  //_location.value = '63118';
  _location.getGeolocationIfAvailable();
}

function click( e ){
  //console.log( e.target );
  //console.log( e.target.className );
  //console.log( control[ e.target.className ] );
  if( typeof( control[ e.target.className ] ) == 'function' )
    control[ e.target.className ]();
}

function key( e ){
  if( e.keyCode == 13 ){
    control.search();
    return false;
  }
  return true;
}

document.addEventListener( 'DOMContentLoaded', main );
