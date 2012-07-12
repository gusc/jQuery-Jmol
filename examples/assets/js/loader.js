$(document).ready(function(){
	$('.jmol-applet').jmol({
		appletUrl : 'assets/java/jmol/',
		width: 400,
		height: 400,
		background: '#FFFFFF'
	});
	$('.jmol-link').click(function(e){
		e.preventDefault();
		$('.jmol-applet').jmol('load ' + $(this).attr('href'));
	});
});