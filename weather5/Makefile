all: style.css index.html

style.css: style.scss
	sass style.scss style.css
	#cat style.css

index.html: index.php
	php index.php > index.html
	#cat index.html

cp:
	cp index.html app.js weather.js mvc.js style.css \
	   index.php style.scss Makefile                 \
	   ~/luser-dr00g.github.io/weather5
