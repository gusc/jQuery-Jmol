$(document).ready(function(){
	$('.jmol-applet').jmol({
		appletUrl : 'assets/java/jmol/',
		width: 400,
		height: 400,
		background: '#FFFFFF'
	});
	$('.jmol-link').click(function(e){
		e.preventDefault();
		$.ajax($(this).attr('href'), {
			dataType: 'text',
			type: 'get',
			success: function(data){
				$('.jmol-applet').jmol('load INLINE "' + data + '"');		
			}
		});
	});
});