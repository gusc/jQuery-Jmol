$(document).ready(function(){
	$('.jmol-applet').jmol({
		appletUrl : 'assets/java/jmol/',
    width: 640,
    height: 480,
    menuUrl : 'assets/java/jmol/jmol.mnu',
    background: '#FFFFFF'
	});
	$('.jmol-link').click(function(e){
		e.preventDefault();
		$.ajax($(this).attr('href'), {
			dataType: 'text',
			type: 'get',
			success: function(data){
				console.log(data);
				$('.jmol-applet').jmol('load INLINE "' + data + '"');		
			}
		});
	});
});