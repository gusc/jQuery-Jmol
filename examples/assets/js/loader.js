$(document).ready(function(){
	// Initialize Jmol
	$('#jmol').jmol({
		appletUrl : 'assets/java/jmol/',
		width: 400,
		height: 400,
		background: '#FFFFFF'
	});
	// Create URL loader
	$('.jmol-link').bind('click', function(e){
		e.preventDefault();
		$('#jmol').data('jmol').script('load "' + $(this).attr('href') + '"');
	});
});