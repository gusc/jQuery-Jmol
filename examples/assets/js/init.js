$(document).ready(function(){
	// Initialize Jmol
	$('#jmol').jmol({
		appletUrl : 'assets/java/jmol/',
		width: 400,
		height: 400,
		modelUrl : 'data/ch4.pdb',
		background: '#FFFFFF'
	});
});