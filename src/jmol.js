/**
* JmolApplet implementation with jQuery Jmol plugin
* @version 3.0 (if Jmol.js is 1.0 and Jmol*.js with OOP approach is 2.0)
*/

//
// Level 1
// Jmol initialization and event listeners (for hard core developers :)) 
// Thease steps actually can be ommited and you can use $.jmol directly
//

/**
* Jmol constructor method
* @param placeholder - placeholder element, in which to place Jmol Java applet
* @param options - Jmol initialization options
*/
var Jmol = function(placeholder, options){
	if (typeof jQuery == 'undefined'){
		alert('jQuery is required to run Jmol');
		return false;
	}
	this.$jmol = jQuery(placeholder).jmol(options);
};
/**
* Send a script to Jmol directly
* @param script - script source
*/
Jmol.prototype.script = function(script){
	this.$jmol.jmolscript(script);
};
/**
* Binds an event listener on Jmol to listen for any events coming from applet
* @param event - event name (one of the following: hover, pick, measure, load, animate, resize)
* @param listener - a listener function
*/
Jmol.prototype.addEventListener = function(event, listener){
	this.$jmol.bind(event, listener);
};
/**
* Unbind an event listener from Jmol
* @param event - event name (one of the following: hover, pick, measure, load, animate, resize)
* @param listener - a listener function
*/
Jmol.prototype.removeEventListener = function(event, listener){
	this.$jmol.unbind(event, listener);
};

//
// Level 2
// Predefined control element bindings
// Bind a click and change event listeners to links, buttons, checboxes, selects, etc. to perform a script in Jmol
//

/**
* Use clickable element as a script launcher
* If options is a function - it will be used as a callback to generate script source.
* If options is a string - it will be used as a script source.
* If options is undefined - it'll check if for href and data-script attributes:
* 	If href is "#" or "javascript:..." then it will check for data-script attribute and if it's defined - send the source to Jmol.
* 	If href is not "#" or "javascript:..." then it will ask Jmol to load the URL.
* @param element - link element
* @param options - callback function, string script source or none for href or data-script attribute
*/
Jmol.prototype.bindClickScript = function(element, options){
	var _this = this;
	var $jmol = this.$jmol;
	$(element).bind('click', function(e){
		e.preventDefault();
		var $this = $(this);
		var script = '';
		if (typeof options == 'undefined'){
			var url = $this.attr('href');
			if (url != '#' && url.toLowerCase().indexOf('javascript:') < 0){
				// It's a link
				script = 'script "' + url + '"';
			} else if ($this.data('script')){
				// It's a data attribute with script source
				script = $this.data('script');
			}
		} else if (typeof options == 'string'){
			// It's a direct script passed to element
			script = options;
		} else if (typeof options == 'function' || typeof options == 'unknown'){
			// It's a callback function
			script = options(_this, this);
		}
		if (script.length > 0){
			$jmol.jmolscript(script);
		}
	});
};
/**
* Remove clickable element as a script launcher
* @param element - link element
*/
Jmol.prototype.unbindChangeScript = function(element){
	$(element).unbind('click');
};
/**
* Use changable element to perform a script (checkbox[checked/unchecked], select, radio, etc);
* If options is a function - it will be used as a callback to generate script source.
* If options is a string - it will be used as a script source.
* If options is undefined - it'll check if href attribute is "#" then it will check for data-script attribute. If href is not "#", it'll ask Jmol to load the URL.
* @param element - link element
* @param options - callback function, string script source or none for href or data-script attribute - used on change event (except for checkbox and radio - see options_off)
* @param options_off - callback function, string script source or none for href or data-script-reset attribute - used on inactive state for checkbox and radio
*/
Jmol.prototype.bindChangeScript = function(element, options, options_off){
	var _this = this;
	var $jmol = this.$jmol;
	$(element).bind('change', function(e){
		e.preventDefault();
		var $this = $(this);
		var script = '';
		if ($this.is(':checkbox') || $this.is(':radio')){
			if ($this.is(':checked')){
				// Radio or checkbox in checked state
				if (typeof options == 'undefined'){
					if ($this.data('script')){
						// It's a data-script attribute
						script = $this.data('script');
					} else {
						// Use value attribute
						script = $this.val();
					}
				} else if (typeof options == 'string'){
					// It's a script source
					script = options;
				} else if (typeof options == 'function' || typeof options == 'unknown'){
					// It's a callback
					script = options(_this, this);
				}
			} else {
				// Un-checked state
				if (typeof options_off == 'undefined'){
					if ($this.data('script-reset')){
						// It's a data-script-reset attribute
						script = $this.data('script-reset');
					}
				} else if (typeof options_off == 'string'){
					// It's a script source
					script = options_off;
				} else if (typeof options_off == 'function' || typeof options_off == 'unknown'){
					// It's a callback
					script = options_off(_this, this);
				}
			}
		} else if ($this.is('select')){
			if (typeof options == 'undefined'){
				// Simply use the value
				script = $this.val();
			} else if (typeof options == 'string'){
				// I don't know why would anyone use this, but for claritys sake, we allow it
				script = options;
			} else if (typeof options == 'function' || typeof options == 'unknown'){
				// It's a callback
				script = options(_this, this);
			}
		} else {
			// Umm ... kinda risky, but we could add an input here
			// TODO: think about it
		}
		if (script.length > 0){
			$jmol.jmolscript(script);
		}
	});
};
/**
* Remove dual state element (checkbox) as a script launcher
* @param element - link element
*/
Jmol.prototype.unbindChangeScript = function(element){
	$(element).unbind('change');
};

//
// Level 3
// More robust functions for ease of development
// 

/**
* Binds aany clickable element as a script initiator.
* @param element - any HTML element
* @param script - Jmol script source
*/
Jmol.prototype.addScript = function(element, script){
	this.bindClickScript(element, script);
};
/**
* Binds any clickable element as a script initiator.
* Script must be generated in the callback function and returned as a string
* @param element - any HTML element
* @param callback - a callback function used to generate Jmol script
*/
Jmol.prototype.addCallbackScript = function(element, callback){
	this.bindClickScript(element, callback);
};
/**
* Binds any clickable element as a script initiator. 
* Script in a data-script attribute will be loaded by Jmol.
* @param element - any HTML element
*/
Jmol.prototype.addDataScript = function(element){
	this.bindClickScript(element);
};
/**
* Binds a link element as a URL loader for Jmol.
* File specified in href attribute will be loaded by Jmol.
* @param element - link element
*/
Jmol.prototype.addURLLoader = function(element){
	if ($(element).is('a') && $(this).attr('href')){
		var $jmol = this.$jmol;
		$(element).click(function(e){
			e.preventDefault();
			var $this = $(this);
			if ($this.attr('href')){
				var url = $(this).attr('href');
				if (url != '#' && url.toLowerCase().indexOf('javascript:') < 0){
					$jmol.jmolscript('load "' + url + '"');
				}
			}
		});
	}
};
/**
* Binds a link element as an AJAX loader for Jmol. 
* File specified in href attribute will be loaded with AJAX and pushed to Jmol.
* @param element - link element
*/
Jmol.prototype.addAJAXLoader = function(element){
	if ($(element).is('a')){
		var $jmol = this.$jmol;
		$(element).click(function(e){
			e.preventDefault();
			var $this = $(this);
			if ($this.attr('href')){
				var url = $(this).attr('href');
				if (url != '#' && url.toLowerCase().indexOf('javascript:') < 0){
					$.ajax(url, {
						dataType: 'text',
						type: 'get',
						success: function(data){
							$jmol.jmolscript('load INLINE "' + data + '"');		
						}
					});
				}
			}
		});
	}
};