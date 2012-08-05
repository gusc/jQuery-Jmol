$(document).ready(function(){
	// Initialize Jmol
	var jmol = new Jmol('#jmol', {
		appletUrl : 'assets/java/jmol/',
		width: 400,
		height: 400,
		background: '#FFFFFF'
	});
	// Create URL loader
	jmol.addURLLoader('.jmol-link');
});