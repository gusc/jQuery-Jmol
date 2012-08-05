/*
 * jQueryJmol - jQuery Plugin
 * Complete replacement for Jmol.js
 * 
 * Copyright (c) 2012 Gusts 'gusC' Kaksis
 * 
 * Version: 1.3.0 (05/08/2012)
 * Requires: jQuery v1.4+
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

/**
* We need this private static class to overcome shortage with 
* "functionName"-as-a-string passed to Java Applet
* This class will route callbacks back to the original callback functions or
* event handlers
*/
var _jQueryJmolRouter = (function($){
	var _cbEval = function(id){
		// Use callback options
		$('#' + id.substr(1))._jmol_cb('eval', arguments);
	},
	_cbMessage = function(id){
		// Use callback options
		$('#' + id.substr(1))._jmol_cb('message', arguments);
	},
	_cbEcho = function(id){
		// Use callback options
		$('#' + id.substr(1))._jmol_cb('echo', arguments);
	},
	_cbScript = function(id){
		// Use callback options
		$('#' + id.substr(1))._jmol_cb('script', arguments);
	},
	_cbSync = function(id){
		// Use callback options
		// TODO: implement a method in plugin - enable/disable sync
		return $('#' + id.substr(1))._jmol_cb('sync', arguments);
	},
	_cbReady = function(id){
		// Must go through, because of some house cleaning stuff
		$('#' + id.substr(1))._jmol_cb('ready', arguments);
	},
	_cbLoad = function(id){
		// Trigger directly
		$('#' + id.substr(1)).triggerHandler('load', arguments);
	},
	_cbHover = function(id){
		// Trigger directly
		$('#' + id.substr(1)).triggerHandler('hover', arguments);
	},
	_cbPick = function(id){
		// Trigger directly
		$('#' + id.substr(1)).triggerHandler('pick', arguments);
	},
	_cbMeasure = function(id){
		// Trigger directly
		$('#' + id.substr(1)).triggerHandler('measure', arguments);
	},
	_cbAnim = function(id){
		// Trigger directly
		$('#' + id.substr(1)).triggerHandler('animate', arguments);
	},
	_cbMin = function(id){
		// Trigger directly
		$('#' + id.substr(1)).triggerHandler('minimize', arguments);
	},
	_cbResize = function(id){
		// Trigger directly
		$('#' + id.substr(1)).triggerHandler('resize', arguments);
	};
	
	return {
		// Only callbacks as param
		cbEval : _cbEval,
		// Only callbacks
		cbMessage : _cbMessage,
		cbEcho : _cbEcho,
		cbScript : _cbScript,
		cbSync : _cbSync,
		// Only events as param
		cbReady : _cbReady,
		// Only events
		cbLoad : _cbLoad,
		cbHover : _cbHover,
		cbPick : _cbPick,
		cbMeasure : _cbMeasure,
		cbAnim : _cbAnim,
		cbMin : _cbMin,
		cbResize : _cbResize
	};
})(jQuery);

/**
* This is the real-deal - a jQueryJmol jquery plugin
*/
(function($){
	var jQueryJmolPlugin = (function(){
		/**
		* Just a reminder what is considered an event, everything else is a callback
		*/
		var _events = ['ready', 'destroy', 'load', 'hover', 'pick', 'measure', 'animate', 'minimize', 'resize'];
		/**
		* Default option set
		*/
		var _defaults = {
			// Jmol initialization properties
			appletUrl : '', // URL of a directory where applet's jar file resides
			useSigned : false, // Use self signed version
			memLimit: 512, // Java memory limit in Megabytes
			width: 400, // Applets width in pixels
			height: 300, // Applets height in pixels
			menuUrl : '', // URL of a menu file
			modelUrl : '', // URL of an initial model file
			background: '#000000', // Background color
			events : null, // An array of events that will be listened for (possible values: hover, pick, measure, load, minimize, animate);
			
			// Jmol callback events
			onEcho: null, // param: array of arguments
			onMessage: null, // param: array of arguments
			onScript: null, // param: array of arguments
			onSync: null, // param: array of arguments
			onEval: null // param: array of arguments
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
		_htmlTemplate = '<object type="application/x-java-applet" id="%id%" name="%name%" width="%width%" height="%height%"%add_attr%>'
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
			//+ '<param name="script" value="%script%"/>'

			+ '%add_param%'

			+ '<p>You do not have Java applets enabled in your web browser, or your browser is blocking this applet.<br>'
			+ 'Check the warning message from your browser and/or enable Java applets in<br>'
			+ 'your web browser preferences, or install the Java Runtime Environment from <a href="http://www.java.com">www.java.com</a><br></p>'
			+ '</object>',
		/**
		* We set thease callbacks only if options are set
		* so we don't bring unnecessary load to JavaScript
		* 
		* Also thease callbacks are set after Jmol has initialized
		*/
		_cbAfter = {
			hover : 'HoverCallback _jQueryJmolRouter.cbHover',
			load : 'LoadStructCallback jQueryJmolRouter.cbLoad',
			pick : 'PickCallback jQueryJmolRouter.cbPick',
			measure : 'MeasureCallback jQueryJmolRouter.cbMeasure',
			sync : 'SyncCallback jQueryJmolRouter.cbSync',
			msg : 'MessageCallback jQueryJmolRouter.cbMessage',
			echo : 'EchoCallback jQueryJmolRouter.cbEcho',
			script : 'ScriptCallback jQueryJmolRouter.cbScript',
			anim : 'AnimFrameCallback jQueryJmolRouter.cbAnim',
			min : 'MinimizationCallback jQueryJmolRouter.cbMin',
			resize : 'ResizeCallback jQueryJmolRouter.cbResize'
		},
		/**
		* Thease callbacks have to be set before the applet has initialized (documentation says so :)
		*/
		_cbBefore = {
			ready : '<param name="appletReadyCallback" value="_jQueryJmolRouter.cbReady" />',
			eval : '<param name="evalCallback" value="_jQueryJmolRouter.cbEval" />'
		},
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
		* Internal option and applet's external interface cache
		* key: applet's HTML ID attribute
		* value: {
		*   options : option cache
		*   applet : external interface
		* } 
		*/
		_appletCache = {},
		/**
		* Local script cache, where to store any script that has to be performed, when Jmol applet becomes ready
		*/
		_scriptCache = {},
		/**
		* Debug mode enabled?
		*/
		_debugMode = true;
		
		/**
		* Main entry point for jQuery plugin initialization
		* @param mixed - object for initialization options, string internal commands (hide, show, destroy)
		* @return jQuery
		*/
		var _init = function(command){
			return this.each(function(i, item) {
				var $item = $(item);
				if ($item.data('jmol')){
					if (typeof command == 'string'){
						// Perform some jQuery or DOM related tasks with Jmol Applet
						var id = $item.attr('id');
						switch (command){
							case 'hide':
								// Hide Jmol Applet
								// We can't use dislpay:none, it will break Java
								$item.find('object').css('width', '2px');
								$item.find('object').css('height', '2px');
								break;
							case 'show':
								// Restore Jmol Applet in to the view
								var options = _appletCache[id]['options'];
								$item.find('object').css('width', options['width'] + 'px');
								$item.find('object').css('height', options['height'] + 'px');
								break;
							case 'destroy':
								// Destroy Jmol Applet
								var applet = _appletFind(id);
								if (applet){
									if (typeof applet.script != 'undefined'){ // IE says it's unknown, everybody else says it's a function
										//TODO: ask Bob for help! It seems there is no way to do a clean destruction. We need a method to destroy applet itself
										//applet.destroy();
									}
								}
								applet = null;
								// Internal cleanup
								delete _appletCache[id]['applet'];
								delete _appletCache[id]['options'];
								delete _scriptCache[id];
								// Remove an applet from the view completely and forget it
								$item.find('object').remove();
								break;
						}
					} else if (typeof command == 'object'){
						// Update options
						var id = $item.attr('id');
						var options = _appletCache[id]['options'];
						for (var a in command){
							switch (a){
								case 'background':
									_appletScript(id, 'background ' + command[a].replace('#', 'x'));
									break;
								case 'menuUrl':
									_appletScript(id, 'load MENU "' + command[a] + '"');
									break;
								case 'modelUrl':
									_appletScript(id, 'load "' + command[a] + '"');
									break;
								//TODO: events and callbacks (except for ready and onEval)
							}
							options[a] = command;
						}
						_appletCache[id]['options'] = options;
					}
				} else {
					// This will allow Jmol to initialize with default options
					var options = $.extend({}, _defaults, {});
					if (typeof command == 'object'){
						options = $.extend(options, command || {});
					}
					_appletCounter ++;
					var id = $item.attr('id');
					if (typeof id == 'undefined'){
						// We need an unique ID, so here we generate it if there is none
						id = 'jmolApplet' + _appletCounter
						$item.attr('id', id);
					}
					// Prepare cached values
					_appletCache[id] = {
						options : options,
						applet : null
					};
					// Prepare script cache
					// Load default assets
					_scriptCache[id] = new Array();
					if (options['menuUrl'] != null && options['menuUrl'].length > 0){
						_scriptCache[id].push('load MENU ' + options['menuUrl']);
					}
					if (options['modelUrl'] != null && options['modelUrl'].length > 0){
						_scriptCache[id].push('load ' + options['modelUrl']);
					}
					// Set event listeners
					if (options['events'] != null && options['events'].length > 0){
						for (var a in options['events']){
							if (typeof _cbAfter[options['events'][a]] != 'undefined'){
								_scriptCache[id].push('set ' + _cbAfter[options['events'][a]]);
							}
						}
					}
					// Set callback functions
					if (options['onEcho'] != null){
						_scriptCache[id].push('set ' + _cbAfter['echo']);
					}
					if (options['onScript'] != null){
						_scriptCache[id].push('set ' + _cbAfter['script']);
					}
					if (options['onMessage'] != null){
						_scriptCache[id].push('set ' + _cbAfter['message']);
					}
					if (options['onSync'] != null){
						_scriptCache[id].push('set ' + _cbAfter['sync']);
					}
					// Insert HTML block
					$item.html(_appletBuildHtml('_' + id, options));
					// Mark Jmol initialized
					$item.data('jmol', true);
				}
			});
		},
		/**
		* Jmol scripting interface through jQuery
		* @param mixed - string or an array of script commands
		* @return jQuery
		*/
		_script = function(script){
			return this.each(function(i, item) {
				var $item = $(item);
				var id = $item.attr('id');
				if ($item.data('jmol')){
					// Push through
					if (typeof script == 'string'){
						_appletScript(id, script);
					} else if (typeof script == 'object'){
						for (var a in script){
							_appletScript(id, script[a]);
						}
					}
				} else {
					// Not yet initialized - let's store it in the cache
					if (typeof _scriptCache[id] != 'object'){
						_scriptCache[id] = new Array();
					}
					if (typeof script == 'string'){
						_scriptCache[id].push(script);
					} else if (typeof script == 'object'){
						for (var a in script){
							_scriptCache[id].push(script[a]);
						}
					}
				}
			});
		},
		/**
		* Callback wrapper function. This function receives messages from JmolCallbackWrapper, which
		* receives original messages from Jmol applet. This function routes callback messages to any
		* associated callback method in options.
		* @param string - internal callback name (ready, load, echo, etc.)
		* @param array - list of arguments passed from applet to JmolCallbackWrapper function
		* @return integer - only for SyncCallback (everything else: void)
		*/
		_callback = function(name, args){
			var id = $(this).attr('id');
			var options = _appletCache[id]['options'];
			switch (name){
				case 'ready':
					if (args[2]){
						// Funny thing about Jmol Java applet :)
						// fourth parameter is a reference to external interface
						// Hacking is the way to the victory
						_appletCache[id]['applet'] = args[3];
						// Call for initial scripts from cache
						if (typeof _scriptCache[id] != 'undefined'){
							var scripts = _scriptCache[id];
							for (var a in scripts){
								_appletScript(id, scripts[a]);
							}
							// Clear cache
							delete _scriptCache[id];
						}
						// Call event handlers
						this.triggerHandler('ready', args[1]);
					} else {
						// Call event handlers
						this.triggerHandler('destroy', args[1])
						// Delete cache
						delete _appletCache[id];
					}
					break;
				case 'eval':
					if (options['onEval'] != null){
						options.onEval(args);
					}
					break;
				case 'echo':
					if (options['onEcho'] != null){
						options.onEcho(args);
					}
					break;
				case 'message':
					if (options['onMessage'] != null){
						options.onMessage(args);
					}
					break;
				case 'script':
					if (options['onScript'] != null){
						options.onScript(args);
					}
					break;
				case 'sync':
					if (options['onSync'] != null){
						return options.onSync();
					}
					return 1;
					break;
			}
		},
		/**
		* Find a Jmol applet
		* @param string - ID attribute
		* @return object - hopefully an applet
		*/
		_appletFind = function(id){
			if (typeof _appletCache[id] != 'undefined'){
				if (_appletCache[id]['applet'] !== null){
					return _appletCache[id]['applet'];
				}
			}
			var doc = document;
			if (doc.getElementById(id))
				return doc.getElementById(id);
			else if (doc.applets)
				return doc.applets[id];
			else
				return doc[id];
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
		_appletBuildHtml = function(id, options){
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
			// We need ready internaly, so this goes on by default
			add_param += _cbBefore['ready'];
			// Eval is optional, but is required before initialization
			if (options['onEval'] !== null){
				add_param += _cbBefore['eval'];
			}
			
			var html = _htmlTemplate.replace('%add_attr%', add_attr);
			html = html.replace('%add_param%', add_param);
			html = html.replace('%sync_id%', ("" + Math.random()).substring(3));
			html = html.replace('%id%', id);
			html = html.replace('%name%', id);
			html = html.replace('%width%', options['width']);
			html = html.replace('%height%', options['height']);
			html = html.replace('%applet_url%', options['appletUrl']);
			html = html.replace('%applet_file%', (options['useSigned'] ? _appletFileSigned : _appletFile));
			html = html.replace('%java_args%', '-Xmx' + options['memLimit'] + 'm');
			html = html.replace('%bg_color%', options['background']);
			return html;
		},
		/**
		* Debug wrapper
		*/
		_debug = function(msg){
			if (_debugMode){
				if (typeof console == 'object'){
					console.log(msg);
				} else {
					if (typeof msg == 'object'){
						var str = '';
						for (var a in msg){
							str += a + ': ' + msg[a] + '\n';
						}
						msg = str;
					}
					alert(msg);
				}
			}
		};
		
		return {
			init : _init,
			script : _script,
			callback : _callback
		};
	})();
	
	$.fn.extend({
		// register jQueryJmol plugin
		jmol : jQueryJmolPlugin.init,
		// We separate Jmol scripting interface so we can add our own commands that
		// we need for Jmol-jQuery operations
		jmolscript : jQueryJmolPlugin.script,
		// register jQueryJmol backdoor for callback router (private use only)
		_jmol_cb : jQueryJmolPlugin.callback
	});
})(jQuery);