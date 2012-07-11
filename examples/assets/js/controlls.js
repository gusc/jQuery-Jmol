function clear(){
	$(this).text('');
	$(this).unbind('focus', clear);
}
$(document).ready(function(){
	$('.jmol-applet').jmol({
		appletUrl : 'assets/java/jmol/',
		width: 640,
		height: 480,
		modelUrl : 'data/ch4.pdb',
		background: '#FFFFFF',
		onEcho : function(msg){
			$('.jmol-log').append('<br />' + msg);
		}
	});
	$('.jmol-input').bind('focus', clear)
	$('.jmol-send').click(function(e){
		e.preventDefault();
		$('.jmol-applet').jmol($('.jmol-input').val());
	});
	$('.jmol-controll').click(function(e){
		e.preventDefault();
		$('.jmol-applet').jmol($(this).data('script'));
	});
});