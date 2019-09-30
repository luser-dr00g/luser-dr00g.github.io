let attach = (x,y,z)=> x.addEventListener( y, z );
let qs     = (sel,ctx)=> (ctx || document).querySelector( sel );
let qsa    = (sel,ctx)=> Array.from( (ctx || document).querySelectorAll( sel ) );
let rad    = a=> a * (Math.PI / 180);
let nop    = ()=> 0;
let Turtle = ()=>{ return { x: 10, y: 10, a: 0, s: 20, d: 90, t: 1 }; };
let debug  = str=> qs('#debug').innerHTML = str;

// doodle class
function Doodle(){
    this.data = [];
}
Doodle.prototype = {
  add: function(x){
      this.data.push(x); this.merge(); (this.change||nop)(); return x; },
  remove: function(){
      var x = this.data.pop(); (this.change||nop)(); return x; },
  del: function(){
      this.data = []; (this.change||nop)(); },
  merge: function(){
      this.data.reduceRight( (acc,cur,i,arr) => {
	  if( acc[0] == cur[0] ){
	      if( is_move( acc[0] ) ){ cur[1] += acc[1]; }
	      else                { cur[1]  = acc[1]; }
	      arr.splice(i+1,1);
	  }
	  return cur;
      });
  },
};

function DoodleList(){
    this.list = [];
}
DoodleList.prototype = {
  save: function(x){
      this.list.push(JSON.stringify(x)); (this.change||nop)(); },
  restore: function( idx ){
      //return JSON.parse( this.list.splice( idx, 1 )[0] );
      return JSON.parse( this.list[idx] );
  },
  remove: function( idx ){
      this.list.splice( idx, 1 ); (this.change||nop)(); },
};
      

// models
var thedoodle = new Doodle();
var undoodle = new Doodle();
var lastelement = 0;
var doodlelist = new DoodleList();

function choose_doodle( idx ){
    var x = doodlelist.restore( idx );
    thedoodle.data = x.data;
    (thedoodle.change||nop)();
}

function delete_doodle( idx ){
    doodlelist.remove( idx );
}

function choose_undoodle( idx ){
    var x = doodlelist.restore( idx );
    undoodle.data = reverseArray( x.data );
    (undoodle.change||nop)();
}

function swap_doodles(){
    var x = thedoodle.data;
    thedoodle.data = reverseArray( undoodle.data );
    undoodle.data = reverseArray( x );
    (thedoodle.change||nop)();
    (undoodle.change||nop)();
}

function save_state_to_session(){
  sessionStorage.setItem('v6doodle', JSON.stringify( thedoodle.data ) );
  sessionStorage.setItem('v6undoodle', JSON.stringify( undoodle.data ) );
  sessionStorage.setItem('v6lastelement', JSON.stringify( lastelement ) );
  sessionStorage.setItem('v6doodlelist', JSON.stringify( doodlelist.list ) );
}
function load_state_from_session(){
  let x = sessionStorage.getItem('v6doodle');
  if( x != null ){ thedoodle.data = JSON.parse( x ); }
  let y = sessionStorage.getItem('v6undoodle');
  if( y != null ){ undoodle.data = JSON.parse( y ); }
  let z = sessionStorage.getItem('v6lastelement');
  if( z != null ){ lastelement = JSON.parse( z ); }
  let p = sessionStorage.getItem('v6doodlelist');
  if( p != null ){ doodlelist.list = JSON.parse( p ); }
}

// view
function turtle_after_render_sketch(){
  let cx = qs("canvas").getContext('2d');
  cx.fillStyle = 'white';
  cx.fillRect( 0, 0, cx.canvas.width, cx.canvas.height );
  cx.beginPath();
  cx.strokeStyle = 'black';

  let pt = points_and_last_turtle( thedoodle.data, Turtle() );
  thedoodle.points = pt[0];
  let ps = remove_duplicate_points( pt[0] ), tlast = pt[1];
  cx.moveTo(...ps[0]);
    ps.slice(1).forEach(p => cx.lineTo(...p));
    cx.stroke();
    cx.fillRect( tlast.x -2, tlast.y -2, 4, 4 );

  cx.beginPath();
  cx.strokeStyle = "red";

  let upt = points_and_last_turtle( reverseArray(undoodle.data), tlast );
  undoodle.points = upt[0];
  let us = remove_duplicate_points( upt[0] );
  cx.moveTo( tlast.x, tlast.y );
    us.slice(1).forEach(p => cx.lineTo(...p));
    cx.stroke();

  return tlast;
};

function points_and_last_turtle( commands, turtle ){
  let turtles = scan( commands, turtlecommand, turtle );
  let points = turtles.map(t => [t.x, t.y]);
  let last_turtle = turtles[ turtles.length - 1 ];
  return [ points, last_turtle];
}

function turtlecommand( turtle, cmd ){
  let c = cmd[0], n = cmd[1], t = turtle;
  return {
    x: (t.x + (c=='F'? 1 :c=='B'? -1 :0) * n * t.s * Math.cos(rad(t.a))),
    y: (t.y + (c=='F'? 1 :c=='B'? -1 :0) * n * t.s * Math.sin(rad(t.a))),
    a: (t.a + (c=='R'? 1 :c=='L'? -1 :0) * n * t.d),
    s: (c=='S'? n :t.s),
    d: (c=='A'? n :t.d),
    t: (c=='T'? n :t.t),
  };
}

function remove_duplicate_points( a ){
    var z = [], zlast;
    z.push( zlast = a[0] );
    for( var i = 1; i < a.length ; ++i ){
	if( ! ( a[i][0] == zlast[0] && a[i][1] == zlast[1] ) ){
	    z.push( zlast = a[i] );
	}
    }
    return z;
}


function reverseArray(arr) {
  var newArray = [];
  for( var i = arr.length - 1; i >= 0; i--) { newArray.push(arr[i]); }
  return newArray;
}
  
//like array.reduce() but returns array of intermediate results
function scan(){
    let a = arguments[0],
	f = arguments[1],
	s = arguments[2] || {},
	z = [],
	i = 0;
    if( s !== {} ){
	z.push( s );
    } else {
	z.push( a[0] );
	++i;
    }
    for(; i < a.length; ++i ){
	let last = z[ z.length - 1 ];
	z.push( f( last, a[i] ) );
    }
    return z;
};

function doodle_data_to_string( d ){
    var z = '';
    if( d.length ){
      d.forEach( e => {
	  z += e[0];
	  if( is_move( e[0] ) && e[1]==1 ){
	      // don't print 1s on moves
	  } else {
	      z += e[1];
	  }
      });
    }
    return z;
}

function add_breaking_spaces( d ){
    var z = '';
    for( var i=0; i < d.length; ++i ){
	var e = d.charAt(i);
	if( e=='f'||e=='B'||e=='L'||e=='R' ){
	    z += '<wbr>';
	}
	z += e;
    }
    return z;
}

function doodle_data_to_links( d, func ){
    var z = '';
    if( d.length ){
      d.forEach( (e,i) => {
	  z += '<a href=# onclick='+ func + '(' + i + ')>' +
	       e[0];
	  if( is_move( e[0] ) && e[1]==1 ){
	      // don't print 1s on moves
	  } else {
	      z += e[1];
	  }
	  z += '</a><wbr>';
      });
    }
    return z;
}

function undo_to_( idx ){
    while( thedoodle.data.length > idx ){
	undoodle.add( thedoodle.remove() );
    }
}

function redo_to_( idx ){
    for( var i = 0; i < idx + 1; ++i ){
	thedoodle.add( undoodle.remove() );
    }
}

function show_last_element_maybe(){
    if( lastelement && undoodle.data.length == 0 ){
	qs('.last').innerHTML =
	    '<span style=color:red>(</span>' +
	    '<a href=# onclick="thedoodle.add(['+
	      '\''+lastelement[0]+'\'' +','+ lastelement[1]
	      +'])">' +
	    lastelement[0] +
	    '</a>' +
	    '<span style=color:red>)</span>' +
	    '';
    } else {
	qs('.last').innerHTML = '';
    }
}
function stepchange(){ thedoodle.add(['S',qs('#i_step').value]); }
function anglechange(){thedoodle.add(['A',qs('#i_angle').value]); }

function show_faq(){
    qs('#faq_show').style.display = 'none';
    qs('#faq_content').style.display = 'block';
    return false;
}
function hide_faq(){
    qs('#faq_content').style.display = 'none';
    qs('#faq_show').style.display = 'block';
    return false;
}

function S_GET( id ){
    var a = window.location.href;
    var b = a.split("?")[1];
    var c = b.split("&");
    var d = '';
    c.forEach( part=>{
	pair = part.split("=");
	if( decodeURIComponent(pair[0]) == id )
	    d = decodeURIComponent(pair[1]);
    });
    return d;
}

function read_number_or_one( str, idx ){
    var n = str.substring( idx ).match(/^\d+/);
    if( n !== null ){
	return { num: Number( n[0] ), len: n[0].length };
    } else {
	return { num: 1, len: 0 };
    }
}

function doodle_data_from_string( d ){
    var z = [];
    for( var i = 0; i < d.length - 1; ++i ){
	var c = d.charAt(i);
	var s = read_number_or_one( d, i+1 );
	i += s.len;
	z.push( [ c, s.num ] );
    }
    return z;
}

var last_canvas_width = 200,
    last_canvas_height = 200;

function fix_canvas_size(){
    let c = qs('canvas'),
	w = c.offsetWidth,
	h = c.offsetHeight;
    if( w != c.width || h != c.height ){
	c.width = 200;
	c.height = 200;
	let ww = qs("#sketch").offsetWidth,
	    hh = qs("#sketch").offsetHeight;
	c.width = ww;
	c.height = hh;
	redraw_canvas();
    }
}

function redraw_canvas(){
    turtle_after_render_sketch();
}

function handle_canvas_size(){
    fix_canvas_size();
    attach( window, 'resize', fix_canvas_size );
}

function is_move( c ){
    return c=='F'||c=='B'||c=='L'||c=='R';
}

function comma_pair( p ){
    return '' + p[0] + ',' + p[1];
}

function line_group( a ){
    return a.join(' ');
}

function fortuple( a, n, f ){
    var z = [];
    for( var i=0; i < a.length; i+=n ){
	z.push( f( a.slice( i, Math.min(i+n, a.length) ) ) );
    }
    return z;
}

showing_svg_image = 0;

function show_svg_image(){
    qs('#svg_show_image').style.display = 'none';
    qs('#svg_show_code').style.display = 'block';
    showing_svg_image = 'image';
    update_svg();
    return false;
}

function show_svg_code(){
    qs('#svg_show_code').style.display = 'none';
    qs('#svg_show_image').style.display = 'block';
    showing_svg_image = 0;
    update_svg();
    return false;
}

function update_svg(){
    let c = qs("canvas");
    let pt = points_and_last_turtle( thedoodle.data, Turtle() );
    let p = remove_duplicate_points( pt[0] );
    let points = fortuple( p.map( comma_pair ), 5, line_group ).join('\n');
    let upt = points_and_last_turtle( reverseArray(undoodle.data), pt[1] );
    let up = remove_duplicate_points( upt[0] );
    let upoints = fortuple( up.map( comma_pair ), 5, line_group ).join('\n');
    let lt = ( showing_svg_image == 'image'? '<' :'&lt;' );
    qs(".svg").innerHTML =
	'<p>' +
	lt+'svg width="'+ c.width +'" height="'+ c.height +'">\n' +
	lt+'rect x="0" y="0" width="'+ c.width +'" height="'+ c.height +'"\n' +
	  'style="fill:white"' +
	  '/>\n' +
	lt+'polyline\n' +
	  'points="' + points +'"\n' +
	  'style="fill:white;stroke:black;stroke-width:2"' +
	  '/>\n' +
	lt+'polyline\n' +
	  'points="' + upoints + '"\n' +
	  'style="fill:white;stroke:red;stroke-width:2"' +
	  '/>\n' +
	lt+'/svg>\n' +
	'';
}

function point_on_line( x, y, x0, y0, x1, y1 ){
}

function canvas_clicked( x, y ){
    for( var i=0; i < thedoodle.points.length - 1; ++i ){
	point_on_line( x, y,
		       thedoodle.points[i][0], thedoodle.points[i][1],
		       thedoodle.points[i+1][0], thedoodle.points[i+1][1] );
    }
    for( var i=0; i < undoodle.points.length - 1; ++i ){
	point_on_line( x, y,
		       undoodle.points[i][0], undoodle.points[i][1],
		       undoodle.points[i+1][0], undoodle.points[i+1][1] );
    }
}

// control
attach( document, 'DOMContentLoaded', ()=>{
  load_state_from_session();
  if( window.location.search ){
    var d = doodle_data_from_string( S_GET('doodle') );
    thedoodle.data = d;
    //debug( d );
  }
  handle_canvas_size();

  // user via view triggers model changes
attach(qs('canvas'),'click', (e)=>{
    let x = e.clientX - canvas.offsetLeft,
	y = e.clientY - canvas.offsetTop;
    canvas_clicked( x, y );
});
attach(qs('#b_f'),'click', ()=>{ thedoodle.add( lastelement = ['F',1] ) });
attach(qs('#b_b'),'click', ()=>{ thedoodle.add( lastelement = ['B',1] ) });
attach(qs('#b_l'),'click', ()=>{ thedoodle.add( lastelement = ['L',1] ) });
attach(qs('#b_r'),'click', ()=>{ thedoodle.add( lastelement = ['R',1] ) });

attach(qs('#i_step'),'change',()=>{ stepchange(); });
attach(qs('#b_s_plus_five'), 'click', ()=>{
    qs('#i_step').value = Number(qs('#i_step').value) +  5; stepchange(); });
attach(qs('#b_s_plus_ten'),  'click', ()=>{
    qs('#i_step').value = Number(qs('#i_step').value) + 10; stepchange(); });
attach(qs('#b_s_minus_five'),'click', ()=>{
    qs('#i_step').value = Number(qs('#i_step').value) -  5; stepchange(); });
attach(qs('#b_s_minus_ten'), 'click', ()=>{
    qs('#i_step').value = Number(qs('#i_step').value) - 10; stepchange(); });
attach(qs('#i_angle'),'change',()=>{ anglechange() });
attach(qs('#b_a_plus_five'), 'click', ()=>{
    qs('#i_angle').value = Number(qs('#i_angle').value) +  5; anglechange(); });
attach(qs('#b_a_plus_ten'),  'click', ()=>{
    qs('#i_angle').value = Number(qs('#i_angle').value) + 10; anglechange(); });
attach(qs('#b_a_minus_five'),'click', ()=>{
    qs('#i_angle').value = Number(qs('#i_angle').value) -  5; anglechange(); });
attach(qs('#b_a_minus_ten'), 'click', ()=>{
    qs('#i_angle').value = Number(qs('#i_angle').value) - 10; anglechange(); });

attach(qs('#b_undo'),'click', ()=>{
  if( thedoodle.data.length ){ undoodle.add( thedoodle.remove() ); }});
attach(qs('#b_redo'),'click', ()=>{
  if( undoodle.data.length ){ thedoodle.add( undoodle.remove() ); }
  else if( lastelement ){ thedoodle.add( lastelement ); }});
attach(qs('#b_undo_all'),'click', ()=>{
  while( thedoodle.data.length ){ undoodle.add( thedoodle.remove() ); }});
attach(qs('#b_redo_all'),'click', ()=>{
  while( undoodle.data.length ){ thedoodle.add( undoodle.remove() ); }});
attach(qs('#b_undo_one'),'click', ()=>{
  if( thedoodle.data.length ){
    var x = thedoodle.remove();
    if( is_move( x[0] ) && x[1]>1 ){
      thedoodle.add( [ x[0], x[1]-1 ] );
      x[1] = 1;
    } 
    undoodle.add( x );
  }
});
attach(qs('#b_redo_one'),'click', ()=>{
  if( undoodle.data.length ){
    var x = undoodle.remove();
    if( is_move( x[0] ) && x[1]>1 ){
      undoodle.add( [ x[0], x[1]-1 ] );
      x[1] = 1;
    } 
    thedoodle.add( x );
  } else {
    thedoodle.add( lastelement );
  }
});

attach(qs('#b_new'),'click', ()=>{ thedoodle.del() });
attach(qs('#b_save'),'click', ()=>{ doodlelist.save( thedoodle ) });
attach(qs('#b_swap'),'click', ()=>{ swap_doodles() });
attach(qs('#b_drop'),'click', ()=>{ var x = undoodle.remove();
				    if( is_move( x[0] ) ){
					lastelement = x;
					(undoodle.change||nop)()
				    } });
attach(qs('#b_clear'),'click', ()=>{ undoodle.del() });


  // model changes trigger view updates & syncs
(thedoodle.change = ()=>{
  qs('.info').innerHTML = doodle_data_to_links( thedoodle.data, 'undo_to_' );
  show_last_element_maybe();
  let t = turtle_after_render_sketch();
  qs('#i_step').value = t.s;
  qs('#i_angle').value = t.d;
  qs('#a_share').href = '?doodle=' + doodle_data_to_string( thedoodle.data );
  update_svg();
  save_state_to_session();
})();    // and do it now

(undoodle.change = ()=>{
  qs('.undo').innerHTML =
	  doodle_data_to_links( reverseArray( undoodle.data ), 'redo_to_' );
  let t = turtle_after_render_sketch();
  show_last_element_maybe();
  update_svg();
  save_state_to_session();
})();    // do it

(doodlelist.change = ()=>{
  if( doodlelist.list != null ){
    var x = '<table width=100%>';
    doodlelist.list.forEach( (d,i)=>{
	var datastring = doodle_data_to_string( JSON.parse(d).data );
	x += '\n<tr><td>' + i + 
	    '<td><a href=# onclick=choose_doodle(' + i + ')>' +
	      add_breaking_spaces( datastring ) +
	    '</a> ' +
	    '<td><a href=# onclick=choose_undoodle(' + i + ')>' +
	        '<nobr><small>to undo</small></nobr></a> ' +
	    '<td><a href=?doodle=' + datastring + ' >' +
	        '<small>share</small></a> ' +
	    '<td><a href=# onclick=delete_doodle(' + i + ')>' +
	        '<small>delete</small></a> ';
    });
    x += '</table>';
    qs('.list').innerHTML = x;
  }
  save_state_to_session();
})();    // !

}); // DOMContentLoaded
