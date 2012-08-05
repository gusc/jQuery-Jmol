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

Initialization options
======================

* appletUrl - URL to the directory where Jmol applets reside
* background - background color of Jmol applet (default: '#000000')
* events - an array of event names that should be prepared for listeners (default: null)
* height - height of an applet window (default: 300)
* memLimit - Java memory limit in megabytes (default: 512)
* menuUrl - Jmol menu file URL (default: 'jmol.mnu')
* modelUrl - model file to load at startup (default: '')
* width - Width of an applet window (default: 400)
* syncId - Jmol sync ID, if 0 specified new one will be generated (default: 0)
* useSigned - Weather to use signed or unsigned applet (default: false)

There are also callback options, where you specify your own callback function.

* **onEcho**(msg) - receives ECHO command output from Jmol applet. Arguments:
 * **msg** - string message
* **onMessage**(arguments) - receives any type of messages (including echo or script, if their callbacks are not specified). Arguments:
 * **arguments** - an array of raw arguments received from Jmol
* onScript(arguments) - receives script specific messages from Jmol applet. Arguments:
 * **arguments** - an array of raw arguments received from Jmol

Events
======

* **animate** -  invoked when Jmol applet does animation. Handler arguments: 
 * **event** - standard event object
 * **arguments** - an array of arguments
* **destroy** -  invoked when Jmol applet gets destroyed. Handler arguments: 
 * **event** - standard event object
 * **arguments** - an array of arguments
* **hover** -  invoked when a mouse hovers an atom. Handler arguments: 
 * **event** - standard event object
 * **arguments** - an array of arguments
* **load** - invoked when a model file has been loaded. Handler arguments:
 * **event** - standard event object
 * **arguments** - an array of arguments
* **measure** - invoked when a measurement has been made. Handler arguments: 
 * **event** - standard event object
 * **arguments** - an array of arguments
* **minimize** - invoked when Jmol applet does minimization. Handler arguments: 
 * **event** - standard event object
 * **arguments** - an array of arguments
* **pick** - invoked when a mouse picks (selects, clicks) an atom. Handler arguments:
 * **event** - standard event object
 * **arguments** - an array of arguments
* **ready** -  invoked when Jmol applet becomes ready. Handler arguments: 
 * **event** - standard event object
 * **arguments** - an array of arguments
* **resize** -  invoked when a Jmol applet's size changes. Handler arguments: 
 * **event** - standard event object
 * **arguments** - an array of arguments


Sending script messages after initialization
============================================

```javascript
// after initialization jmolscript method will route all the calls to the script method
// of Jmol applet. All the commands are documented on http://chemapps.stolaf.edu/jmol/docs/
$('#my-jmol-viewer').jmolscript('load /other_test.pdb'); 
```


jQuery commands for initialized plugin
============================================

```javascript
// after initialization jmol method will accept option object or 3 internal commands: hide, show, destroy
$('#my-jmol-viewer').jmol('hide'); 
// It is highly advised to use jmol('hide') and jmol('show') instead of jQuery's own hide() and show methods, 
// because Java does not like display:none state in Internet Explorer.
```

Changelog
=========

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
