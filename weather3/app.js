let qs = (sel,ctx)=> (ctx || document).querySelector( sel );
import {Model, View, Controller} from './mvc.js';

function main(){ //DOMContentLoaded
  document.addEventListener('click', click );
  qs('.i_search').addEventListener('keydown', e=>{
    if( e.keyCode == 13 || e.which == 13 ){
      location.setValue( format_query( qs('.i_search').value ) )
      qs('.i_search').blur();
      return false;
    }
    return true;
  });
  unit.setValue(sessionStorage.getItem('weather_unit')||'imperial');
  report_type.setValue(sessionStorage.getItem('weather_report_type')||'current');
  get_geolocation_if_available();
}


var location = new Model();

var unit = new Model();
unit.onChange = function( value ){
  sessionStorage.setItem( 'weather_unit', value );
}

var unit_controls = new View();
unit_controls.setModel( unit );
unit_controls.onUpdate = function( value ){
  show( qs('.unit_imperial') );
  show( qs('.unit_metric'  ) );
  show( qs('.unit_standard') );
  show( qs('.unit_' + value) );
}

var report_type = new Model();
report_type.onChange = function( value ){
  sessionStorage.setItem( 'weather_report_type', value );
}

var report_type_controls = new View();
report_type_controls.setModel( report_type );
report_type_controls.onUpdate = function( value ){
  show( qs('.current') );
  show( qs('.forecast2') );
  show( qs('.forecast3') );
  show( qs('.forecast4') );
  show( qs('.forecast5') );
  show( qs('.' + value ) );
}

var request = new Model();
location.observe( request );
unit.observe( request );
report_type.observe( request );
request.update = function( value ){
  if( location.value )
    this.setValue( authenticate( format_request( report_type.value,
						 location.value,
						 unit.value ) ) );
}

var weather = new Model();
request.observe( weather );
weather.update = function( value ){
  xhr({
      type: 'GET',
      url: value,
      success: function( x ){
	  weather.setValue( JSON.parse( x.response ) );
      },
      failure: function( x ){
	  log_server_data( 'server returned ' + x.status + ' ' + x.statusText );
      }
  });
}

var showing_server_data = new Model();
var server_data_view = new View();
server_data_view.setModel( showing_server_data );
server_data_view.onUpdate = function( value ){
  if( value ){
    show( qs('.server_data') )
    hide( qs('.show_server_data') )
    show( qs('.hide_server_data') )
  } else {
    hide( qs('.server_data') )
    show( qs('.show_server_data') )
    hide( qs('.hide_server_data') )
  }
}


var report = new View();
report.setModel( weather );
report.onUpdate = function( value ){
  switch( report_type.value ){
  case 'current':   show_current_weather( value ); break;
  case 'forecast2': show_forecast( value, 2 ); break;
  case 'forecast3': show_forecast( value, 3 ); break;
  case 'forecast4': show_forecast( value, 4 ); break;
  case 'forecast5': show_forecast( value, 5 ); break;
  }
}


var control = report.getController();
control.search = function(){
  location.setValue( format_query( qs('.i_search').value ) )
}
control.unit_imperial = function(){ unit.setValue( 'imperial' ) }
control.unit_metric   = function(){ unit.setValue( 'metric' )   }
control.unit_standard = function(){ unit.setValue( 'standard' ) }
control.current       = function(){ report_type.setValue( 'current' )   }
control.forecast2     = function(){ report_type.setValue( 'forecast2' ) }
control.forecast3     = function(){ report_type.setValue( 'forecast3' ) }
control.forecast4     = function(){ report_type.setValue( 'forecast4' ) }
control.forecast5     = function(){ report_type.setValue( 'forecast5' ) }
control.show_server_data=function(){ showing_server_data.setValue( true )  }
control.hide_server_data=function(){ showing_server_data.setValue( false ) }

function hide( x ){ x.style.display = 'none' }
function show( x ){ x.style.display = 'block' }

function get_geolocation_if_available(){
  if( 'geolocation' in navigator ){
    navigator.geolocation.getCurrentPosition( function(pos){
      geolocation_found( pos.coords.latitude, pos.coords.longitude );
    });
  }
}

function geolocation_found( lat, lon ){
  location.setValue( format_latlon_query( lat, lon ) );
}

function format_latlon_query( lat, lon ){
  return 'lat=' + lat + '&lon=' + lon;
}

function format_query( q ){
  var m;
  if( m = q.match(/(-?\d+(\.\d+)?),(-?\d+(\.\d+))?/) ){
    return format_latlon_query( m[1], m[2] );
  } else if( m = q.match(/ *(\d\d\d\d\d) */) ){
    return 'zip=' + m[1];
  } else {
    return 'q=' + q.replace(/ /g,'+');
  }
}

function format_request( type, loc, u ){
    return url_for_request( type ) +
	loc +
	( u? u != 'standard' ? '&units=' + u :'' :'');
}

function url_for_request( type ){
  switch( type ){
  case 'current':   return 'https://api.openweathermap.org/data/2.5/weather?'
  case 'forecast2':
  case 'forecast3':
  case 'forecast4':
  case 'forecast5': return 'https://api.openweathermap.org/data/2.5/forecast?'
  }
}

function authenticate( url ){
  return url + '&APPID=39495affc770605f852615a5be774e62';
}


function show_current_weather( data ){
  log_server_data( request.value + '<br>' +
		    JSON.stringify( data ) );
  qs('.report').innerHTML = format_weather_data( data );
}

function show_forecast( data, days ){
  log_server_data( request.value + '<br>' +
		    JSON.stringify( data ) );
  qs('.report').innerHTML = format_forecast_data( data, days );
}

function format_weather_data( data ){
  return '<h1>Current weather for ' +
	  data.name + ', ' +
	  data.sys.country + '</h1>' +
	'<div class=report_data>' +
	format_weather_results( data ) +
	'</div>';
}

function format_forecast_data( data, days ){
  return '<h1>' + days + ' day forecast for ' +
	  data.city.name + ', ' +
	  data.city.country + '</h1>' +
	'<div class=report_data>' +
	format_forecast_results( data, days ) +
	'</div>';
}

function format_forecast_results( data, days ){
  let list = data.list.slice( 0, days * 8 );
  let z = '';
  for( var i = 0; i < list.length; i += 8 ){
    z += format_weather_results( list[i] );
  }
  //return JSON.stringify( list );
  return z;
}

function format_weather_results( data ){
  return '<div class=result>' +
    '<tr><td colspan=3 class=top>' +
      (data.dt_txt ?
        day_of_week( fix_utc( data.dt_txt ) ) + ' ' +
        time( fix_utc( data.dt_txt ) ) + '<br>'
        : '' ) +
      data.weather[0].main + '<br>' +
      '<img src="https://openweathermap.org/img/wn/' +
	data.weather[0].icon + '@2x.png">' + '<br>' +
      data.weather[0].description + '<br>' +
      data.main.temp + '&deg; ' + unit_[unit.value].temp +'<br>' +
      data.main.humidity + '% humidity' + '<br>' +
      'wind ' +
	(data.wind.deg ? compass_point( data.wind.deg ) + ' ' : '') +
	data.wind.speed + ' ' + unit_[unit.value].speed + '<br>' +
      data.main.pressure + ' hPa pressure' + '<br>' +
    '</div>';
}

function fix_utc( dt ){
    return dt.replace(/ /,'T') + '.000Z';
}

function day_of_week( dt ){
  let d = new Date(dt);
  let w = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return w[ d.getDay() ];
}

function time( dt ){
  let d = new Date(dt);
  let hour = d.getHours();
  let h = hour == 0 || hour == 12 ? 12 : hour % 12;
  let qm = hour < 12 ? 'AM' : 'PM';
  return '' + h + qm;
}

function compass_point( d ){
  return (d<11.25 || d>=348.75)? 'N' :
         (d>=11.25 && d<33.75)? 'NNE' :
         (d>=33.75 && d<56.25)? 'NE' :
         (d>=56.25 && d<78.75)? 'ENE' :
         (d>=78.75 && d<101.25)? 'E' :
         (d>=101.25 && d<123.75)? 'ESE' :
         (d>=123.75 && d<146.25)? 'SE' :
         (d>=146.25 && d<168.75)? 'SSE' :
         (d>=168.75 && d<191.25)? 'S' :
	 (d>=191.25 && d<213.75)? 'SSW' :
	 (d>=213.75 && d<236.25)? 'SW' :
	 (d>=236.25 && d<258.75)? 'WSW' :
	 (d>=258.75 && d<281.25)? 'W' :
	 (d>=281.25 && d<303.75)? 'WNW' :
	 (d>=303.75 && d<326.25)? 'NW' :
	 (d>=326.25 && d<348.75)? 'NNW' : 'error';
}

var unit_ = {
    'standard': {
	temp: 'K',
	speed: 'm/s',
    },
    'metric': {
	temp: 'C',
	speed: 'm/s',
    },
    'imperial': {
	temp: 'F',
	speed: 'M/h',
    }
};


function xhr( options ){
  let url     = options.url,
      type    = options.type,
      success = options.success || nop,
      failure = options.failure || nop,
      xh      = new XMLHttpRequest();
  xh.onreadystatechange = function(){
    if( xh.readyState == 4 ){
      if( 200 <= xh.status && xh.status < 300 ){ success( xh ); }
      else { failure( xh ); }
    }
  };
  xh.open( type, url, true );
  xh.send();
}

function click( e ){
  if( typeof( control[ e.target.className ] ) == 'function' )
    control[ e.target.className ]()
}
function log_server_data( msg ){ qs('.server_data').innerHTML += msg + '<br>'; }
function debug( msg ){ qs('.debug').innerHTML += msg + '<br>'; }

document.addEventListener('DOMContentLoaded', main );
