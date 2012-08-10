// Clear an element on focus
function clear(){
	$(this).text('');
	$(this).unbind('focus', clear);
}
// Initial query name
var molname = 'ethanol';
// Database URLs
var db_table = {
	"nci3d": "http://cactus.nci.nih.gov/chemical/structure/%FILE/file?format=sdf&get3d=True",
	"nci": "http://cactus.nci.nih.gov/chemical/structure/%FILE/file?format=sdf",
	"pdb": "http://www.rcsb.org/pdb/files/%FILE.pdb",
	"cif": "http://www.rcsb.org/pdb/files/ligand/%FILE.cif",
	"pubchem": "http://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/%FILE/SDF?record_type=3d",
	"file": "%FILE"
};

var jmol;

$(document).ready(function(){
	// Initialize Jmol applet
	$('#jmol').jmol({
		appletUrl : 'assets/java/jmol/',
		useSigned: true,
		width: 400,
		height: 400,
		background: '#FFFFFF',
		onReady : function(_jmol){
			jmol = _jmol;
		}
	});
	// Set up an event
	$('#jmol').bind('jmol_echo', function(e, jmol, msg){
		$('.jmol-log').append('<br />' + msg);
	});
	// Bind a hover event listener
	$('#jmol').bind('jmol_hover', function(e, jmol, data){ 
		$('.jmol-log').append('<br />Hovered over ' + data.label);
	});
	// Bind a pick event listener
	$('#jmol').bind('jmol_pick', function(e, jmol, data){ 
		$('.jmol-log').append('<br />Picked ' + data.label);
	});
	// Send a script from text area to Jmol
	$('.jmol-send').bind('click', function(e){
		e.preventDefault();
		jmol.script($('.jmol-input').val());
		// or
		// $('#jmol').data('jmol').script($('.jmol-input').val());
	});
	// Open up Jmol console
	$('.jmol-console').bind('click', function(e){
		e.preventDefault();
		jmol.script('console');
	});
	// Perform scripting actions stored in data attributes
	$('.jmol-script').bind('click', function(e){
		e.preventDefault();
		if ($(this).data('script')){
			jmol.script($(this).data('script'));
		}
	});
	// Prompt for a molecule to search in database
	$('.jmol-prompt').click(function(e){
		e.preventDefault();
		var $el = $(this);
		var db = $el.data('database');
		var url = db_table[db];
		if (molname == null || molname == ''){
			molname = 'ethanol';
		}
		molname = prompt($el.attr('title'), molname);
		if (molname){
			url = url.replace('%FILE', molname);
			$.ajax(url, {
				dataType: "text",
				data : {},
				success: function(a) {
					jmol.script('load INLINE "' + a + '"');
					// If we have some special script which should be executed after successful load, 
					// then this is where it will get executed
					if ($el.data('script-after')){
						jmol.script($el.data('script-after'));
					}
				},
				error: function(err) {
					console.log('there be error');
				}
			});
		}
	});
	
	// Clear scripting text area on focus
	$('.jmol-input').bind('focus', clear);
});