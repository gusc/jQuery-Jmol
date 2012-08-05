$(document).ready(function(){
	// Initialize Jmol
	var jmol = new Jmol('#jmol', {
		appletUrl : 'assets/java/jmol/',
		width: 400,
		height: 400,
		background: '#FFFFFF'
	});
	// Make all a.jmol-link elements an AJAX loaders
	jmol.addAJAXLoader('a.jmol-link');
});