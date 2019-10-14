import {Model, SessionModel, DependentModel, View, Controller}
       from './mvc.js';

class LocationModel extends Model {
  set value( value ){ super.value = this.formatQuery( value ); }
  get value(){ return super.value; }
  formatQuery( q ){
    var m;
    if( m = q.match(/(-?\d+(\.\d+)?),(-?\d+(\.\d+))?/) ){
      return `lat=${m[1]}&lon=${m[3]}`;
    } else if( m = q.match(/ *(\d\d\d\d\d) */) ){
      return 'zip=' + m[1];
    } else {
      return 'q=' + q.replace(/ /g,'+');
    }
  }
}

class RequestModel extends DependentModel {
  constructor( models ){
    super( models,
      function (value){
	if( location.value )
	  this.value =
	    this.formatRequest( reportType.value, location.value, unit.value )
      }
    );
  }
  url = 'https://api.openweathermap.org/data/2.5/'
  auth = '&APPID=39495affc770605f852615a5be774e62'
  formatRequest( type, loc, unit ){
    let req = type=='current'? 'weather' : 'forecast';
    if( unit == 'standard' ) unit = ''; else unit = '&units=' + unit;
    return `${this.url}${req}?${loc}${unit}${this.auth}`;
  }
}

class WeatherModel extends DependentModel {
  constructor( models ){
    super( models,
      function (value){
	//console.log( 'XHR ' + value );
	xhr({
	  type: 'GET',
	  url: value,
	  success: function( x, obj ){
	    obj.value = JSON.parse( x.response );
	    serverData.value = request.value + '\n' + x.response;
	  },
	  failure: function( x, obj ){
	    serverData.value = `server returned ${x.status} ${x.statusText}`;
	  }
	}, this);
      }
    );
  }
}


class WeatherView extends View {
  constructor( model ){
    super( model,
      function( value ){
	switch( reportType.value ){
	case 'current':   this.showCurrentWeather( value ); break;
	case 'forecast2': this.showForecast( value, 2 );     break;
	case 'forecast3': this.showForecast( value, 3 );     break;
	case 'forecast4': this.showForecast( value, 4 );     break;
	case 'forecast5': this.showForecast( value, 5 );     break;
	}
      });
  }
  showCurrentWeather( data ){
    //console.log('display current weather');
    this.find('.report').innerHTML = this.formatWeatherData( data );
  }
  showForecast( data, days ){
    //console.log(`display ${days} day forecast`);
    this.find('.report').innerHTML = this.formatForecastData( data, days );
  }
  formatWeatherData( data ){
return `<h1>Current Weather for \
<nobr>${data.name},</nobr> ${data.sys.country}</h1>
<div class=report_data>${this.formatWeatherResults(data)}</div>`;
  }
  formatForecastData( data, days ){
return `<h1>${days} days forecast for \
<nobr>${data.city.name},</nobr> ${data.city.country}</h1>
<div class=report_data>${this.formatForecastResults(data,days)}</div>`;
  }
  formatForecastResults( data, days ){
    let list = data.list.slice( 0, days * 8 );
    let z = '';
    for( var i = 0; i < list.length; i += 8 ){
      z += this.formatWeatherResults( list[i] );
    }
    return z;
  }
  formatWeatherResults( data ){
    let dayTime = (data.dt_txt ? dayOfWeek( fixUtc( data.dt_txt ) ) + ' ' +
		    timeOfDay( fixUtc( data.dt_txt ) ) + '<br>' : '');
return `<div class=result>
${dayTime}
${data.weather[0].main}<br>
<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"><br>
${data.weather[0].description}<br>
${data.main.temp}&deg; ${unit_[unit.value].temp}<br>
${data.main.humidity} % humidity<br>
wind ${data.wind.deg? compassPoint( data.wind.deg )+' ' :''}\
${data.wind.speed} ${unit_[unit.value].speed}<br>
${data.main.pressure} hPa pressure<br>
</div>`;
  }
}

class WeatherController extends Controller {
  search(){ location.value = this.getView().find('.i_search').value }
  unit_imperial(){ unit.value = 'imperial' }
  unit_metric(){ unit.value = 'metric'   }
  unit_standard(){ unit.value = 'standard' }
  current(){ reportType.value = 'current'   }
  forecast2(){ reportType.value = 'forecast2' }
  forecast3(){ reportType.value = 'forecast3' }
  forecast4(){ reportType.value = 'forecast4' }
  forecast5(){ reportType.value = 'forecast5' }
  show_server_data(){ showingServerData.value = true  }
  hide_server_data(){ showingServerData.value = false }
}

var location    = new LocationModel();

var unit        = new SessionModel( 'weather_unit' );
//window.unit = unit;

var reportType = new SessionModel( 'weather_report_type' );

var request     = new RequestModel( [location, unit, reportType] );

var weather     = new WeatherModel( [request] );

var serverData = new Model();

var showingServerData = new Model();



var unitControls = new View( unit,
  function( value ){
    console.log( value );
    this.show( this.find('.unit_imperial') );
    this.show( this.find('.unit_metric') );
    this.show( this.find('.unit_standard') );
    this.hide( this.find('.unit_' + value) );
  }
);

var reportTypeControls = new View( reportType,
  function( value ){
    console.log( value );
    this.show( this.find('.current') );
    this.show( this.find('.forecast2') );
    this.show( this.find('.forecast3') );
    this.show( this.find('.forecast4') );
    this.show( this.find('.forecast5') );
    this.hide( this.find('.' + value ) );
  }
);

var report = new WeatherView( weather );

var serverDataView = new View( serverData,
  function( value ){
    this.find('.server_data').innerText += value + '\n';
  }
);

var showingServerDataView = new View( showingServerData,
  function( value ){
    if( value ){
      this.show( this.find('.server_data') );
      this.hide( this.find('.show_server_data') );
      this.show( this.find('.hide_server_data') );
    } else {
      this.hide( this.find('.server_data') );
      this.show( this.find('.show_server_data') );
      this.hide( this.find('.hide_server_data') );
    }
  }
);


var control = new WeatherController();
control.setView( report );


document.addEventListener( 'DOMContentLoaded', main );

function main(){
  unit.loadValue();
  reportType.loadValue();
  getGeolocationIfAvailable();

  document.addEventListener( 'click', click );
  control.getView().find('.i_search').addEventListener('keydown', e=>{
    if( e.keyCode == 13 ){
	location.value = e.target.value;
	e.target.blur();
	return false;
    }
    return true;
  });
}

function click( e ){
  if( typeof( control[ e.target.className ] ) == 'function' )
    control[ e.target.className ]()
}

function getGeolocationIfAvailable(){
  if( 'geolocation' in navigator ){
    navigator.geolocation.getCurrentPosition( function(pos){
      geolocationFound( pos.coords.latitude, pos.coords.longitude );
    });
  }
}
function geolocationFound( lat, lon ){ location.value = `${lat},${lon}`; }

function xhr( options, obj ){
  let url     = options.url,
      type    = options.type,
      success = options.success || nop,
      failure = options.failure || nop,
      xh      = new XMLHttpRequest();
  xh.onreadystatechange = function(){
    if( xh.readyState == 4 ){
      if( 200 <= xh.status && xh.status < 300 ){ success( xh, obj ); }
      else { failure( xh, obj ); }
    }
  };
  xh.open( type, url, true );
  xh.send();
}

function fixUtc( dt ){
    return dt.replace(/ /,'T') + '.000Z';
}

function dayOfWeek( dt ){
  let d = new Date(dt);
  let w = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return w[ d.getDay() ];
}

function timeOfDay( dt ){
  let d = new Date(dt);
  let hour = d.getHours();
  let h = hour == 0 || hour == 12 ? 12 : hour % 12;
  let qm = hour < 12 ? 'AM' : 'PM';
  return '' + h + qm;
}

function compassPoint( d ){
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
