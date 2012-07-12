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

* **onEcho**(msg) - receives ECHO command output from Jmol applet. Arguments:
 * **msg** - string message
* onScript(arguments) - receives script specific messages from Jmol applet. Arguments:
 * **arguments** - an array of raw arguments received from Jmol
* **onMessage**(arguments) - receives any type of messages (including echo or script, if their callbacks are not specified). Arguments:
 * **arguments** - an array of raw arguments received from Jmol

Events
======

* **ready** -  invoked when Jmol applet becomes ready. Handler arguments: 
 * **event** - standard event object
 * **uid** - unique internal ID of Jmol
* **destroy** -  invoked when Jmol applet gets destroyed. Handler arguments: 
 * **event** - standard event object
 * **uid** - unique internal ID of Jmol
* **hover** -  invoked when a mouse hovers an atom. Handler arguments: 
 * **event** - standard event object
 * **atom** - an atom object
<pre>
{
	index : integer, zero based atom index in the model file,
	name : string, name of an atom as defined in model file,
	num : string, number of an atom as defined in model file,
	coords : {
		x : float, x coordinate,
		y : float, y coordinate,
		z : float, z coordinate
	}
}
</pre>
* **pick** - invoked when a mouse picks (selects, clicks) an atom. Handler arguments:
 * **event** - standard event object
 * **atom** - an atom object
* **load** - invoked when a model file has been loaded. Handler arguments:
 * **event** - standard event object
 * **info** - file loading info object
<pre>
{
	url : string, URL of a file loaded,
	file_name : string, file name without a directory path,
	name : string, internal model name,
	err_msg : string, error message, if any,
	err_no : string, error number, if any,
	frame_prev : string, frame number prior to loading the current model, in file.model form
	frame_last : string, last frame number after loading the current model, in file.model form
}						
</pre>
* **measure** - invoked when a measurement has been made. Handler arguments: 
 * **event** - standard event object
 * **measurement** - a measurement result object
<pre>
{
	type : string, one of the following "distance", "angle", "torsion",
	value : float, measurement value
}						
</pre>

Changelog
=========

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
