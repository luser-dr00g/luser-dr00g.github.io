//Extract personnel data from paycor scheduling website
//Open page, apply filters, select day;
//then open JavaScript console and copy/paste these
//three paragraphs separately. Execute "populate();"
//as many times as necessary until the page has scrolled
//to the bottom before copy/pasting the last paragraph.
function unique( arr ){
  let output = [ arr.shift() ];
  arr.forEach( e => {
    if(  output.findIndex( x => arreq( e, x ) ) == -1  )
      output.push( e );
  });
  return  output;
}
function arreq( a, b ){
  return  a.length == b.length  &&
    a.map( (ai,i) => ai==b[i] ).reduce( (x,y) => x&&y, true );
}
function populate(){
  let people = [ [] ];
  let rows = document.querySelectorAll('[role="row"]');
  rows.forEach( row => {
    let a = row.querySelector("a");
    if(  ! a  ) return;
    let name = a.textContent;
    let times = row.querySelectorAll("time");
    if(  ! times[0]  ) return;
    let start = times[0].textContent;
    let end = times[1].textContent;
    let position = row.querySelector(".schedule-card__summary").textContent;
    people.push( [ position, name, start, end ] );
  } );
  thePeople = thePeople.concat( people );
  let grid = document.querySelector('[role="grid"]');
  let thumbHeight = grid.scrollHeight - grid.scrollTopMax;
  grid.scrollTop = grid.scrollTop + (thumbHeight / 2);
  return  people;
}
function getDate(){
  let span = document.querySelector("#e2e-schedule-header-day");
  return  span.textContent;
}
function formatText( data ){
  var cat = "";
  return  "data for " + getDate() + "\n" +
    data.map( rec =>{
      let [ pre, name, start, end ] = rec;
      start = start.replace( /^0/, "" );
      end = end.replace( /^0/, "" );
      let person = "\t" + name + " " + start + "-" + end + "   ";
      if(  pre == cat  ){
	return  person;
      } else {
	cat = pre;
	return  pre + "\n" + person;
      }
    } ).join( "\n" );
}
var thePeople = [];

populate();  // repeat ad libitum

formatText( unique(thePeople).slice(1) );
