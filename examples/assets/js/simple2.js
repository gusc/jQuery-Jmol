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
// Jmol object
var jmol;

$(document).ready(function(){
	// Initialize Jmol applet
	jmol = new Jmol('#jmol', {
		appletUrl : 'assets/java/jmol/',
		useSigned: true,
		width: 400,
		height: 400,
		background: '#FFFFFF',
		onEcho : function(msg){
			$('.jmol-log').append('<br />' + msg);
		}
	});
	// Bind a hover event listener
	jmol.addEventListener('hover', function(e, atom){ 
		$('.jmol-log').append('<br />Hovered over ' + atom.name + ' (' + atom.num + ')');
	});
	// Bind a pick event listener
	jmol.addEventListener('pick', function(e, atom){ 
		$('.jmol-log').append('<br />Picked ' + atom.name + ' (' + atom.num + ')');
	});
	// Send a script from text area to Jmol
	jmol.addCallbackScript('.jmol-send', function(e){
		return $('.jmol-input').val();
	});
	// Open up Jmol console
	jmol.addScript('.jmol-console', 'console');
	// Perform scripting actions stored in data attributes
	jmol.addDataScript('.jmol-script');
	// Prompt for a molecule to search in database
	$('.jmol-prompt').click(function(e){
		e.preventDefault();
		var $el = $(this);
		var db = $el.data('database');
		var url = db_table[db];
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