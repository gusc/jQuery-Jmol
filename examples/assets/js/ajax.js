// Reference to wrapper object
var my_jmol;

$(document).ready(function(){
	// Initialize Jmol
	$('#jmol').jmol({
		appletUrl : 'assets/java/jmol/',
		width: 400,
		height: 400,
		background: '#FFFFFF',
		onReady : function(jmol){
			// Here we store the reference once Jmol get's ready
			my_jmol = jmol;
		}
	});
	// Make all a.jmol-link elements an AJAX loaders
	$('a.jmol-link').bind('click', function(e){
		e.preventDefault();
		$.ajax($(this).attr('href'), {
			dataType: 'text',
			type: 'get',
			success: function(data){
				my_jmol.script('load INLINE "' + data + '"');		
			}
		});
	});
});