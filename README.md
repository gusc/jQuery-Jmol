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
  <title>jMol Site</title>
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

Sending script messages after initialization
============================================

```javascript
// after initialization jmol method will route all the calls to the script method
// of Jmol applet. All the commands are documented on http://chemapps.stolaf.edu/jmol/docs/
$('#my-jmol-viewer').jmol('load /other_test.pdb'); 
```

Options
=======

* appletUrl - URL to the directory where Jmol applets reside
* useSigned - Weather to use signed or unsigned applet (default: false)
* syncId - Jmol sync ID, if 0 specified new one will be generated (default: 0)
* memLimit - Java memory limit in megabytes (default: 512)
* width - Width of an applet window (default: 400)
* height - height of an applet window (default: 300)
* menuUrl - Jmol menu file URL (default: 'jmol.mnu')
* modelUrl - model file to load at startup (default: '')
* background - background color of Jmol applet (default: '#000000')

There are also callback options, where you specify your own callback function.

* **onReady**(uid) - called when applet becomes ready. Arguments:
 * **uid** - unique ID of applet
* **onDestroy**(uid) - called when applet has been destroyed.Arguments:
 * **uid** - unique ID of applet
* **onEcho**(msg) - echo message callback. Arguments:
 * **msg** - string message
* **onHover**(name, idx) -  called when a mouse hover an atom. Arguments: 
 * **name** - name of an atom as a string
 * **idx** - atom index
* **onLoad**(url, file_name, name, err_msg, err_no, frame_prev, frame_last) - called when a model file has been loaded. Arguments:
 * **url** - URL of a model file
 * **file_name** - model file name without a directory path
 * **name** - internal name of a model
 * **err_msg** - error message if any
 * **err_no** - error code
 * **frame_prev** - prior frame
 * **frame_last** - last frame
* **onMeasure**(msg) - called when a measurement has been made. Arguments: 
 * **msg** - measurement messsage as a string
* **onMessage**(msg) - called when a message has been sent from an applet. Arguments:
 * **msg** - string message
* **onPick**(atom) - called when an atom has been clicked on. Arguments:
 * **atom** - an object of atom data:
<pre>
      id : atom id,
      num : atom number
      coords : {
        x : x coordinate,
        y : y coordinate,
        z : z coordinate
      }
</pre>
* onScript(msg) - called when a script is being processed. Arguments:
 * **msg** - string message

Changelog
=========

2012.07.11 1.0.1 alpha
  Removed applet file name from jQuery options, now they are hard coded
	Introduced useSigned:Boolean option, weather to load signed or unsigned applet
	Little more cheating on unresponsive Java applet - reset DOM tree and try to push scripts after setTimeout
  
2012.07.10 1.0.0 alpha
  Initial release
