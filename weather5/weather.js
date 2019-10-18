/*jshint esversion: 6 */

class Chrono extends Date {
  constructor( dt ){
    super( dt.replace(/ /,'T') + '.000Z' );
  }
  dayOfWeek(){
    return this.toLocaleDateString('en-US', {weekday: 'long'});
  }
  timeOfDay(){
    return this.toLocaleTimeString('en-US', {hour: 'numeric', hour12: true});
  }
}

class CompassPoint {
  constructor( deg ){
    this.deg = deg;
  }
  toString(){
    return [     'N','NNE',
      'NE','ENE','E','ESE',
      'SE','SSE','S','SSW',
      'SW','WSW','W','WNW',
      'NW','NNW'
    ][ Math.floor( (this.deg+11.25) / 22.5 ) % 16 ];
  }
}


import {Model, SessionModel, DependentModel, View} from './mvc.js';

class LocationModel extends Model {
  set value( value ){ super.value = this.formatQuery( value ); }
  get value(){ return super.value; }
  formatQuery( q ){
    var m;
    if( (m = q.match(/(-?\d+(\.\d+)?),(-?\d+(\.\d+))?/)) ){
      return `lat=${m[1]}&lon=${m[3]}`;
    } else if( (m = q.match(/ *(\d\d\d\d\d) */)) ){
      return 'zip=' + m[1];
    } else {
      return 'q=' + q.replace(/ /g,'+');
    }
  }
  getGeolocationIfAvailable(){
    if( 'geolocation' in navigator ){
      navigator.geolocation.getCurrentPosition( (pos)=>{
	this.geolocationFound( pos.coords.latitude, pos.coords.longitude );
      });
    }
  }
  geolocationFound( lat, lon ){ this.value = `${lat},${lon}`; }
}

class UnitModel extends SessionModel {
  unit( category ){
    return {
      speed: {
	standard: 'm/s',
	metric:   'm/s',
	imperial: 'M/h'
      },
      temp: {
	standard: 'K',
	metric:   'C',
	imperial: 'F'
      },
      pressure: {
	standard: 'hPa',
	metric:   'mmHg',
	imperial: 'inHg'
      }
    }[ category ][ this.value ];
  }
  convert( value, category ){
    //console.log( 'convert ' + value + ' ' + category );
    return this.fixPrecision( this[category]( value ) );
  }
  speed( value ){
    let t = {
      standard: function(x){ return x; },
      metric:   function(x){ return x; },
      imperial: function(x){ return x * 2.237; }
    };
    return t[ this.value ]( value );
  }
  temp( value ){
    let t = {
      standard: function(x){ return x; },
      metric:   function(x){ return x - 273.15; },
      imperial: function(x){ return (x - 273.15) * 9/5 + 32; },
    };
    return t[ this.value ]( value );
  }
  pressure( value ){
    let t = {
      standard: function(x){ return x; },
      metric:   function(x){ return x * 0.75006; },
      imperial: function(x){ return x * 0.02953; }
    };
    return t[ this.value ]( value );
  }
  fixPrecision( value ){
    let x = '' + Math.floor( value * 1000 + 0.5 );
    return x.substr(0, x.length - 3) + '.' + x.substr(x.length - 3);
  }
}

class DaysModel extends SessionModel {
}

var auth = '&APPID=39495affc770605f852615a5be774e62';

class WeatherModel extends DependentModel {
  update( loc ){
    this.value = 'loading';
    const url =
	  'https://api.openweathermap.org/data/2.5/weather?' + loc + auth;
    //console.log( url );
    fetch( url ).then( response=>{
      if( response.ok ){
	return response.json();
      } else {
	return null;
      }
    }).then( data =>{
      //console.log( data )
      if( data ){
	this.value = data;
      }
    });
  }
}

class ForecastModel extends DependentModel {
  update( loc ){
    let url =
	'https://api.openweathermap.org/data/2.5/forecast?' + loc + auth;
    //console.log( url );
    fetch( url ).then( response =>{
      if( response.ok ){
	return response.json();
      } else {
	return null;
      }
    }).then( data =>{
      //console.log( data )
      if( data ){
	this.value = data;
      }
    });
  }
}

class UnitView extends View {
  onUpdate( value ){
    //console.log( value );
    this.findAll('div').forEach( d=> this.show( d ) );
    this.hide( this.find('.unit_' + value) );
  }
}

class DaysView extends View {
  onUpdate( value ){
    //console.log( value );
    this.findAll('div').forEach( d=> this.show( d ) );
    this.hide( this.find('.forecast_' + value) );
  }
}

class ReportView extends View {
  onUpdate( data ){
    //console.log( 'report ' + data )
    if( data === 'loading' ){
      this.hide( this.find('.instructions') );
      this.show( this.find('.loading') );
      this.hide( this.find('.report') );
    } else {
      this.hide( this.find('.instructions') );
      this.hide( this.find('.loading') );
      this.show( this.find('.report') );
      this.find('.report_title_city').textContent = data.name;
      this.find('.report_title_country_code').textContent = data.sys.country;
    }
  }
}

class DetailView extends View {
  onUpdate( data ){
    if( data !== 'loading' ){
      let time = data.dt_txt ? new Chrono( data.dt_txt ) : null;
      time = time ? time.dayOfWeek() + ' ' + time.timeOfDay() : 'Now';
      this.find('.detail_time').textContent = time;
      this.find('.detail_main').textContent = data.weather[0].main;
      this.find('.detail_icon').src =
	'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png';
      this.find('.detail_description').textContent = data.weather[0].description;
      this.find('.detail_temp').textContent =
	this._unit.convert( data.main.temp, 'temp' );
      this.find('.detail_temp_unit').textContent =
	this._unit.unit( 'temp' );
      this.find('.detail_humidity').textContent = data.main.humidity;
      this.find('.detail_wind_dir').textContent =
	data.wind.deg ? `${new CompassPoint(data.wind.deg)}` : '';
      this.find('.detail_wind_speed').textContent =
	this._unit.convert( data.wind.speed, 'speed' );
      this.find('.detail_speed_unit').textContent =
	this._unit.unit( 'speed' );
      this.find('.detail_pressure').textContent =
	this._unit.convert( data.main.pressure, 'pressure' );
      this.find('.detail_pressure_unit').textContent =
	this._unit.unit( 'pressure' );
    }
  }
}

class ChartDays extends View {
  onUpdate( days ){
    var i;
    //console.log( days );
    for( i = 0; i < days; ++i ){
      this.findAll('.chart' + i).forEach( tr => this.show( tr ) );
    }
    for( ; i < 8; ++i ){
      this.findAll('.chart' + i).forEach( tr => this.hide( tr ) );
    }
  }
}

class ChartView extends View {
  onUpdate( data ){
    data.list.forEach( (item,i) => {
      let j = Math.floor( i/8 ), k = i%8;
      let x = '#chart_' + j + '_' + k + '_';
      let time = new Chrono( item.dt_txt );
      //console.log( x + 'time' );
      this.find(x + 'day').innerHTML = time.dayOfWeek();
      this.find(x + 'time').innerHTML = time.timeOfDay();
      this.find(x + 'temp').innerHTML =
	this._unit.convert( item.main.temp, 'temp' );
      this.find(x + 'temp_unit').innerHTML =
	this._unit.unit( 'temp' );
      this.find(x + 'description').innerHTML = item.weather[0].description;
      this.find(x + 'icon').src =
	'https://openweathermap.org/img/wn/' + item.weather[0].icon + '@2x.png';
      this.find(x + 'icon').height = 24;
      /*
      */
    });
  }
}

export {
  LocationModel, UnitModel, DaysModel, WeatherModel, ForecastModel,
  UnitView, DaysView, ReportView, DetailView, ChartDays, ChartView
};
