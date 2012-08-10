jQuery-Jmol - a jQuery plugin for Jmol
===============================

This plugin is intended to replace the old-school Jmol.js and add the ease of use of jQuery coding style. Also this plugin is inteded to work with W3C standards compatible <object> tags (maybe breaking backwards compatibility with old-school browsers) and get rid of improper use of inline scripting.

Installation
============

```html
<!DOCTYPE html> 
<html lang="en">
<head> 
  <meta charset="utf-8">
  <title>jQuery-Jmol Site</title>
  <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6/jquery.min.js"></script>
  <script type="text/javascript" src="jquery.jmol.min.js"></script>
  <script type="text/javascript" src="main.js"></script>
</head>
<body>
  <div id="my-jmol-viewer">This content will be replaced with Jmol applet</div>
</body>
</html>
```

Where main.js contains initialization:

```javascript
$(document).ready(function(){
  $('#my-jmol-viewer').jmol({
    appletUrl : '/jmol/',
    width: 640,
    height: 480,
    menuUrl : '/jmol/jmol.mnu',
    modelUrl : '/test.pdb',
    background: '#FFFFFF',
  });
});
```

Documentation
=============

For documentation go to this site: http://gusc.lv/jmol/

Changelog
=========

2012.08.10 2.0.0
  Complete rewrite. Introduced a Jmol applet wrapper object. Overriden .bind() and .unbind() methods in jQuery to set up callbacks when neccessary.

2012.08.05 1.3.0
  Separate jQuery call .jmolscript() for Jmol scripting. .jmol() now takes 3 different string options for initialized plugin: hide (hide applet), show (show applet), destroy (destroy applet and plugin instance)

2012.07.18 1.2.0 (not released)
  Removed data mangling from measurement, hovering and picking callbacks - raw string data will be passed to user. Introduced Jmol.js (version 3.0) scripting library to aid development.

2012.07.12 1.1.0
  Only messaging callbacks are available as callback options through jQuery. Hover, pick, load, ready and destroy are now sent as an event, so you can bind and unbind a listener. 
  Also the plugin does not replace the placeholder, but instead use it as a base object, applet gets appended inside with an ID of placeholder preceding with underscore.

2012.07.11 1.0.2 alpha
  Timeout did not work, so I found that ready callback sent an extra parameter - internal Java object with all the public methods.

2012.07.11 1.0.1 alpha
  Removed applet file name from jQuery options, now they are hard coded
	Introduced useSigned:Boolean option, weather to load signed or unsigned applet
	Little more cheating on unresponsive Java applet - reset DOM tree and try to push scripts after setTimeout
  
2012.07.10 1.0.0 alpha
  Initial release
