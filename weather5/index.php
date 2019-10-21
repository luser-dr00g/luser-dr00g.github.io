<!doctype html>
<html lang=en>
<head>
  <meta charset=utf-8>
  <title>Weather</title>
  <script type=module src=app.js ></script>
  <link href=style.css rel=stylesheet type=text/css >
</head>
<body>

<header>
  <div class=controls >
    <div id=loc class=panel >
      <input class=location type=text placeholder="City or ZIP or lat,lon">
      <button class=search >Search</button>
    </div>
    <div id=unit class=panel >
      <div class=unit_imperial >imperial</div>
      <div class=unit_metric >metric</div>
      <div class=unit_standard >standard</div>
    </div>
    <div id=days class=panel >
<?php for( $i=1; $i<=5; ++$i ): ?>
      <div class=forecast_<?= $i ?> ><?= $i ?> day forecast</div>
<?php endfor; ?>
    </div>
  </div>
</header>

<main>
  <div class=instructions >
    Enable Browser Location or Use Search Box for Weather info
  </div>
  <div class=loading style=display:none >
    Request sent. Waiting for weather data.
  </div>
  <div class=error style=display:none >
    Location not found.
  </div>
  <div class=report style=display:none >
    <div class=report_title >
      Weather for
      <span class=report_title_city style=white-space:nowrap >City</span>,
      <span class=report_title_country_code >CC</span>
    </div>
    <div class=report_data >

      <div class=detail >
        <span class=detail_time            >Now            </span><br>
        <span class=detail_main            >Clouds         </span><br>
        <img class=detail_icon src='https://openweathermap.org/img/wn/01d@2x.png' alt=icon >           <br>
        <span class=detail_description     >overcast clouds</span><br>
        <span class=detail_temp            >61.36          </span>&deg;
          <span class=detail_temp_unit     >F              </span><br>
        <span class=detail_humidity        >72             </span>% humidity<br>
        <span class=detail_wind_dir        >S              </span>
          <span class=detail_wind_speed    >8.05           </span>
          <span class=detail_speed_unit    >M/h            </span><br>
        <span class=detail_pressure        >1015           </span>
          <span class=detail_pressure_unit >hPa            </span><br>
      </div>

      <div class=chart >
        <table >
<?php for( $i=0; $i < 40; ++$i ):
  $day   = floor( $i / 8 );
  $slice = $i % 8; ?>
          <tr class=chart<?= $day ?> >
            <td><span id=chart_<?= $day ?>_<?= $slice ?>_day >Monday</span>
            <td><span id=chart_<?= $day ?>_<?= $slice ?>_time >12AM</span>
            <td><span id=chart_<?= $day ?>_<?= $slice ?>_temp >63</span>&deg;
                <span id=chart_<?= $day ?>_<?= $slice ?>_temp_unit >F</span>
            <td><span id=chart_<?= $day ?>_<?= $slice ?>_description >Cloudy</span>
            <td><img id=chart_<?= $day ?>_<?= $slice ?>_icon
		     src='https://openweathermap.org/img/wn/02d@2x.png' alt=icon >
<?php endfor; ?>
        </table>
      </div>

    </div>
  </div>
</main>

<footer>
  <div >Weather data provided by
    <a href="https://openweathermap.org/" >openweathermap.org</a>.
  </div>
</footer>

</body>
