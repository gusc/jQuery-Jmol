/*
 * jMol - jQuery Plugin
 * Complete replacement for Jmol.js
 * 
 * Copyright (c) 2012 Gusts 'gusC' Kaksis
 * 
 * Version: 1.0.2 alpha (11/07/2012)
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
			useSigned : false,
			syncId: 0,
			memLimit: 512,
			width: 400,
			height: 300,
			menuUrl : '',
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
		* Unsigned applet file
		*/
		_appletFile = 'JmolApplet0.jar', 
		/**
		* Signed applet file
		*/
		_appletFileSigned = 'JmolAppletSigned0.jar', 
		/**
		* HTML template for Jmol applet
		*/
		_htmlTemplate = '<object type="application/x-java-applet" id="%id%" name="%name%" class="jmol-initialized%class%" width="%width%" height="%height%"%add_attr%>'
			+ '<param name="syncId" value="%sync_id%"/>'
			+ '<param name="progressbar" value="true">'
			+ '<param name="progresscolor" value="blue">'
			+ '<param name="boxbgcolor" value="%bg_color%"/>'
			+ '<param name="boxfgcolor" value="black">'
			+ '<param name="boxmessage" value="Downloading JmolApplet ...">'
			+ '<param name="mayscript" value="mayscript">'
			+ '<param name="codebase" value="%applet_url%" />'
			+ '<param name="archive" value="%applet_file%" />'
			+ '<param name="code" value="JmolApplet.class" />'
			+ '<param name="java_arguments" value="%java_args%"/>'
			+ '<param name="script" value="%script%"/>'

			+ '%add_param%'

			+ '<param name="appletReadyCallback" value="JmolCallbackWrapper.cbReady" />'
			+ '<param name="echoCallback" value="JmolCallbackWrapper.cbEcho" />'
			+ '<param name="hoverCallback" value="JmolCallbackWrapper.cbHover" />'
			+ '<param name="loadStructCallback" value="JmolCallbackWrapper.cbLoad" />'
			+ '<param name="measureCallback" value="JmolCallbackWrapper.cbMeasure" />'
			+ '<param name="messageCallback" value="JmolCallbackWrapper.cbMessage" />'
			+ '<param name="pickCallback" value="JmolCallbackWrapper.cbPick" />'
			+ '<param name="scriptCallback" value="JmolCallbackWrapper.cbScript" />'
			+ '<param name="syncCallback" value="JmolCallbackWrapper.cbSync" />'

			+ '<p>You do not have Java applets enabled in your web browser, or your browser is blocking this applet.<br>'
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
		_optionsCache = {},
		/**
		* It seems that "appletReadyCallback" return's an internal wrapper object
		* Which we kindly store here to use instead of document.getElementById('some_applet') and then wonder
		* why an object does not have a method for no reason.
		*/
		_applets = {};
		
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
				if ($item.is('.jmol-initialized')){
					if (typeof command == 'string'){
						// Default action is to pass anything as a script to jmol applet
						// We don't want to over-abstract anything, jquery plugin is only used for
						// the ease of initialization and communication, everything else should be
						// done in one language, that is Jmol scripting language
						_appletScript($item.attr('id'), command);
					} else if (typeof command == 'object'){
						// TODO: update options and send some commands (for example background color, etc.)
						_debug('jMol option update not implemented');
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
					$applet = $(_appletBuildHtml(id, cls, options));
					$item.after($applet);
					$item.remove();
					$item = $applet;
					_optionsCache[id] = options;
					$applet = null;
				} else {
					// Well ther's your problem, sir
					_debug('Error in initializing jMol');
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
						// Funny thing about Jmol Java applet :)
						// Hacking is the way to the victory
						console.log(args[3]);
						_applets[args[0]] = args[3];
						options.onReady(args[1]);
					} else {
						_applets[args[0]] = null;
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
							x : parseFloat(a[2]),
							y : parseFloat(a[3]),
							z : parseFloat(a[4])
						}
					};
					options.onPick(atom);
					break;
				case 'script':
					options.onScript(args[1]);
					break;
			}
		},
		/**
		* Find a Jmol applet
		* @param string - ID attribute
		* @return object - hopefully an applet
		*/
		_appletFind = function(id){
			if (typeof _applets[id] != 'undefined'){
				return _applets[id];
			} else {
				var doc = document;
				if (doc.getElementById(id))
					return doc.getElementById(id);
				else if (doc.applets)
					return doc.applets[id];
				else
					return doc[id];
			}
		}
		/**
		* Pass a script to Jmol applet
		* @param string - Jmol applet object ID
		* @param string - Jmol script
		* @return boolean
		*/
		_appletScript = function(id, command){
			var applet = _appletFind(id);
			if (applet){
				if (typeof applet.script != 'undefined'){ // IE says it's unknown, everybody else says it's a function
					applet.script(command);
					applet = null;
					return true;
				} else {
					_debug('Oppsy daisy, Jmol has no method script()');
				}
			} else {
				_debug('Oppsy daisy, Jmol was not found');
			}
			applet = null;
			return false;
		},
		/**
		* Build applet's HTML block from a template
		* @param string - ID attribute
		* @param string - additional class attributes
		* @param object - jquery plugin options
		* @return string - applets HTML code
		*/
		_appletBuildHtml = function(id, cls, options){
			var add_attr = '';
			if (navigator.userAgent){
				if (navigator.userAgent.indexOf('MSIE') != -1){
					// IE - add classid and codebase
					add_attr = ' classid="' + _windowsClassId + '" codebase="' + _windowsCabUrl + '"';
				}
			}
			var add_param = '';
			if (navigator.platform){
				if (navigator.platform.indexOf('Mac') != -1){
					// MacOS - add command thread to overcome some Java security restrictions
					// like java.security.AccessControlException: access denied (java.net.SocketPermission...)
					add_param = '<param name="UseCommandThread" value="true">'; 
				}
			}
			var script = '';
			if (options['menuUrl'].length > 0){
				script += 'load MENU ' + options['menuUrl'] + ';';
			}
			if (options['modelUrl'].length > 0){
				script += 'load ' + options['modelUrl'] + ';';
			}
			var html = _htmlTemplate.replace('%add_attr%', add_attr);
			html = html.replace('%add_param%', add_param);
			html = html.replace('%sync_id%', options['syncId']);
			html = html.replace('%id%', id);
			html = html.replace('%name%', id);
			html = html.replace('%class%', cls);
			html = html.replace('%width%', options['width']);
			html = html.replace('%height%', options['height']);
			html = html.replace('%applet_url%', options['appletUrl']);
			html = html.replace('%applet_file%', (options['useSigned'] ? _appletFileSigned : _appletFile));
			html = html.replace('%java_args%', '-Xmx' + options['memLimit'] + 'm');
			html = html.replace('%bg_color%', options['background']);
			html = html.replace('%script%', script);
			return html;
		},
		/**
		* Debug wrapper
		*/
		_debug = function(msg){
			if (typeof console == 'object'){
				console.log(msg);
			} else {
				//alert(msg);
			}
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