$(document).ready(function(){
	// Initialize Jmol
	var jmol = new Jmol('#jmol', {
		appletUrl : 'assets/java/jmol/',
		width: 400,
		height: 400,
		modelUrl : 'data/ch4.pdb',
		background: '#FFFFFF'
	});
});