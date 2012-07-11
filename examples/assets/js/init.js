$(document).ready(function(){
	$('.jmol-applet').jmol({
		appletUrl : 'assets/java/jmol/',
    width: 640,
    height: 480,
    modelUrl : 'data/ch4.pdb',
    background: '#FFFFFF'
	});
});