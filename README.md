jMol - a jQuery plugin for Jmol
===============================

This plugin is intended to replace the old-school Jmol.js and add the ease of use of jQuery coding style. Also this plugin is inteded to work with W3C standards compatible <object> tags (maybe breaking backwards compatibility with old-school browsers) and get rid of improper use of inline scripting.

Installation
============

```html
<!DOCTYPE html> 
<html lang="en">
<head> 
  <meta charset="utf-8">
  <title>Rural Tourism 360</title>
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

Options
=======

* appletUrl - URL to the directory where Jmol applets reside
* appletFile - Jmol applets file name (default: JmolApplet0.jar)
* syncId - Jmol sync ID, if 0 specified new one will be generated (default: 0)
* memLimit - Java memory limit in megabytes (default: 512)
* width - Width of an applet window (default: 400)
* height - height of an applet window (default: 300)
* menuUrl - Jmol menu file URL (default: 'jmol.mnu')
* modelUrl - model file to load at startup (default: '')
* background - background color of Jmol applet (default: '#000000')

There are also callback options, where you specify your own callback function.

* onReady - called when applet becomes ready
* onDestroy - called when applet has been destroyed
* onEcho - echo message callback
** msg - string message
* onHover -  called when a mouse hover an atom. 
** name - name of an atom as a string
** idx - atom index
* onLoad - called when a model file has been loaded.
** url - URL of a model file
** file_name - model file name without a directory path
** name - internal name of a model
** err_msg - error message if any
** err_no - error code
** frame_prev - prior frame
** frame_last - last frame
* onMeasure - called when a measurement has been made. 
** msg - measurement messsage as a string
* onMessage - called when a message has been sent from an applet.
** msg - string message
* onPick - called when an atom has been clicked on
** atom - an object of atom data:
<pre>
      id : atom id,
      num : atom number
      coords : {
        x : float x coordinate,
        y : float y coordinate,
        z : float z coordinate
      }
</pre>
* onScript - called when a script is being processed
** msg - string message

Changelog
=========

2012.07.10 1.0.0 alpha
  Initial release

