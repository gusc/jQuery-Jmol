/*
 * jMol - jQuery Plugin
 * Complete replacement for Jmol.js
 * 
 * Copyright (c) 2012 Gusts 'gusC' Kaksis
 * 
 * Version: 1.0.0 alpha (10/07/2012)
 * Requires: jQuery v1.4+
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

/**
* We need this class to overcome stupid "functionName"-as-a-string passed to Java Applet
* This class will route callbacks back to the original callback functions added as a
* options to jquery plugin initialization
*/
var JmolCallbackWrapper = (function($){
	var _cbReady = function(id){
		$('#' + id)._jmol_cb('ready', arguments);
	},
	_cbEcho = function(id){
		$('#' + id)._jmol_cb('echo', arguments);
	},
	_cbHover = function(id){
		$('#' + id)._jmol_cb('hover', arguments);
	},
	_cbLoad = function(id){
		$('#' + id)._jmol_cb('load', arguments);
	},
	_cbMeasure = function(id){
		$('#' + id)._jmol_cb('measure', arguments);
	},
	_cbMessage = function(id){
		$('#' + id)._jmol_cb('message', arguments);
	},
	_cbPick = function(id){
		$('#' + id)._jmol_cb('pick', arguments);
	},
	_cbScript = function(id){
		$('#' + id)._jmol_cb('script', arguments);
	},
	_cbSync = function(id){
		return $('#' + id)._jmol_cb('sync', arguments);
	};
	
	return {
		cbReady : _cbReady,
		cbEcho : _cbEcho,
		cbHover : _cbHover,
		cbLoad : _cbLoad,
		cbMeasure : _cbMeasure,
		cbMessage : _cbMessage,
		cbPick : _cbPick,
		cbScript : _cbScript,
		cbSync : _cbSync
	};
})(jQuery);

/**
* This is the real-deal - a jMol jquery plugin
*/
(function($){
	var jMol = (function(){
		/**
		* Default option set
		*/
		var _defaults = {
			// Jmol initialization properties
			appletUrl : '',
			appletFile : 'JmolApplet0.jar',
			syncId: 0,
			memLimit: 512,
			width: 400,
			height: 300,
			menuUrl : 'jmol.mnu',
			modelUrl : '',
			background: '#000000',
			
			// Jmol callback events
			onReady: function (uid) {},
			onDestroy: function (uid) {},
			onEcho: function (msg) {},
			onHover: function (name, idx) {},
			onLoad: function (url, file_name, name, err_msg, err_no, frame_prev, frame_last) {},
			onMeasure: function (msg) {},
			onMessage: function (msg) {},
			onPick: function (atom) {},
			onScript: function (msg) {},
			onSync: function (msg) { return 1; },
		},
		/**
		* HTML template for Jmol applet
		*/
		_htmlTemplate = '<object type="application/x-java-applet" id="%id%" name="%name%" class="jmol%class%" width="%width%" height="%height%"%add_params%>'
  		+ '<param name="syncId" value="%sync_id%"/>'
  		+ '<param name="progressbar" value="true">'
  		+ '<param name="progresscolor" value="blue">'
  		+ '<param name="boxbgcolor" value="%bg_color%"/>'
  		+ '<param name="boxfgcolor" value="black">'
  		+ '<param name="boxmessage" value="Downloading JmolApplet ...">'
      + '<param name="mayscript" value="true">'
  		+ '<param name="code" value="JmolApplet" />'
  		+ '<param name="codebase" value="%applet_url%" />'
  		+ '<param name="archive" value="%applet_file%" />'
  		+ '<param name="java_arguments" value="%java_args%"/>'
  		+ '<param name="script" value="%script%"/>'
  		
  		+ '<param name="appletReadyCallback" value="JmolCallbackWrapper.cbReady" />'
  		+ '<param name="echoCallback" value="JmolCallbackWrapper.cbEcho" />'
  		+ '<param name="hoverCallback" value="JmolCallbackWrapper.cbHover" />'
  		+ '<param name="loadStructCallback" value="JmolCallbackWrapper.cbLoad" />'
  		+ '<param name="measureCallback" value="JmolCallbackWrapper.cbMeasure" />'
  		+ '<param name="messageCallback" value="JmolCallbackWrapper.cbMessage" />'
  		+ '<param name="pickCallback" value="JmolCallbackWrapper.cbPick" />'
  		+ '<param name="scriptCallback" value="JmolCallbackWrapper.cbScript" />'
  		//+ '<param name="syncCallback" value="JmolCallbackWrapper.cbSync" />'
  		
  		+ '<p style="background-color:yellow; color:black; width:400px;height:400px;text-align:center;vertical-align:middle;">'
			+ 'You do not have Java applets enabled in your web browser, or your browser is blocking this applet.<br>'
			+ 'Check the warning message from your browser and/or enable Java applets in<br>'
			+ 'your web browser preferences, or install the Java Runtime Environment from <a href="http://www.java.com">www.java.com</a><br></p>'
			+ '</object>',
		/**
		* Java applet Class ID
		*/
		_windowsClassId = 'clsid:8AD9C840-044E-11D1-B3E9-00805F499D93',
		/**
		* Windows CAB URL for Java installer
		*/
  	_windowsCabUrl = 'http://java.sun.com/update/1.6.0/jinstall-6u22-windows-i586.cab',
  	/**
  	* Internal applet counter, for unique ID generation
  	*/
  	_appletCounter = 0,
  	/**
  	* Internal option cache
  	* key: applet HTML ID attribute
  	* value: option set
  	*/
  	_optionsCache = {};
		
		/**
		* Main entry point for jQuery plugin
		* @param mixed - object for initialization options, string script commands for later scripting of Jmol applet
		* @return jQuery
		*/
		var _proc = function(command){
			var options = {};
			if (typeof command == 'object'){
				options = $.extend({}, _defaults, command || {});
			} else if (typeof command == 'undefined'){
				// Initialize with default settings
				options = $.extend({}, _defaults, {});
				command = options;
			}
			var ret = this;
			this.each(function(i, item) {
				var $item = $(item);
				if ($item.is('.jmol')){
					if (typeof command == 'string'){
						var o = $item.get(0);
						// Default action is to pass anything as a script to jmol applet
						// We don't want to over-abstract anything, jquery plugin is only used for
						// the ease of initialization and communication, everything else should be
						// done in one language, that is Jmol scripting language
						o.script(command);
					} else if (typeof command == 'object'){
						// TODO: update options and send some commands (for example background color, etc.)
						console.log('jMol option update not implemented');
					}
				} else if (typeof command == 'object'){
					// Initialize only when command is an object and .jmol class is not set
					_appletCounter ++;
					var id = $item.attr('id');
					var cls = $item.attr('class');
					if (typeof id == 'undefined'){
						// We need an unique ID, so here we generate it if there is none
						id = 'jmolApplet' + _appletCounter;
					}
					if (typeof cls == 'undefined'){
						cls = '';
					} else {
						cls = ' ' + cls;
					}
					if (options['syncId'] <= 0){
						options['syncId'] = _appletCounter;
					}
					$applet = _buildApplet(id, cls, options);
					$item.replaceWith($applet);
					$item = $applet;
					_optionsCache[id] = options;
				} else {
					// Well ther's your problem, sir
					console.log('Error in initializing jMol');
				}
			});
			return ret;
		},
		/**
		* Callback wrapper function. This function receives messages from JmolCallbackWrapper, which
		* receives original messages from Jmol applet. This function routes callback messages to any
		* associated callback method in options.
		* @param string - internal callback name (ready, load, echo, etc.)
		* @param array - list of arguments passed from applet to JmolCallbackWrapper function
		* @return integer - only for SyncCallback
		*/
		_callback = function(name, args){
			var options = _optionsCache[args[0]];
			switch (name){
				case 'ready':
					if (args[2]){
						options.onReady(args[1]);
					} else {
						options.onDestroy(args[1]);
					}
					break;
				case 'echo':
					options.onEcho(args[1]);
					break;
				case 'hover':
					options.onHover(args[1], args[2]);
					break;
				case 'load':
					options.onLoad(args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
					break;
				case 'measure':
					options.onMeasure(args[1]);
					break;
				case 'message':
					options.onMessage(args[1]);
					break;
				case 'pick':
					var a = args[1].split(' ');
					var atom = {
						id : a[0],
						num : a[1],
						coords : {
							x : a[2],
							y : a[3],
							z : a[4]
						}
					};
					options.onPick(atom);
					break;
				case 'script':
					options.onScript(args[1]);
					break;
			}
			console.log(name, args);
		},
		/**
		* Build applet's HTML block from a template
		* @param string - ID attribute
		* @param string - additional class attributes
		* @param object - jquery plugin options
		* @return jQuery - jQuery wrapped DOM fragment of applet's HTML code
		*/
		_buildApplet = function(id, cls, options){
			var add_params = '';
			if ($.browser.msie){
				add_params = ' classid="' + _windowsClassId + '" codebase="' + _windowsCabUrl + '"';
			}
			var script = '';
			if (options['menuUrl'].length > 0){
				script += 'load MENU ' + options['menuUrl'] + ';';
			}
			if (options['modelUrl'].length > 0){
				script += 'load ' + options['modelUrl'] + ';';
			}
			var html = _htmlTemplate.replace('%add_params%', add_params);
			html = html.replace('%sync_id%', options['syncId']);
			html = html.replace('%id%', id);
			html = html.replace('%name%', id);
			html = html.replace('%class%', cls);
			html = html.replace('%width%', options['width']);
			html = html.replace('%height%', options['height']);
			html = html.replace('%applet_url%', options['appletUrl']);
			html = html.replace('%applet_file%', options['appletFile']);
			html = html.replace('%java_args%', '-Xmx' + options['memLimit'] + 'm');
			html = html.replace('%bg_color%', options['background']);
			html = html.replace('%script%', script);
			return $(html);
		};
		
		return {
			proc : _proc,
			callback : _callback
		};
	})();
	
	$.fn.extend({
		// register jMol plugin
		jmol : jMol.proc,
		// register jMol Internal-external callback routing backdoor
		_jmol_cb : jMol.callback
	});
})(jQuery);