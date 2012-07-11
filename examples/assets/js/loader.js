$(document).ready(function(){
	$('.jmol-applet').jmol({
		appletUrl : 'assets/java/jmol/',
		width: 640,
		height: 480,
		background: '#FFFFFF'
	});
	$('.jmol-link').click(function(e){
		e.preventDefault();
		$('.jmol-applet').jmol('load ' + $(this).attr('href'));
	});
});