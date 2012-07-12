function clear(){
	$(this).text('');
	$(this).unbind('focus', clear);
}
$(document).ready(function(){
	$('.jmol-applet').jmol({
		appletUrl : 'assets/java/jmol/',
		width: 400,
		height: 400,
		modelUrl : 'data/ch4.pdb',
		background: '#FFFFFF',
		onEcho : function(msg){
			$('.jmol-log').append('<br />' + msg);
		}
	});
	$('.jmol-applet').bind('hover', function(e, atom){
		$('.jmol-log').append('<br />Hovered over ' + atom.name + ' (' + atom.num + ')');
	});
	$('.jmol-applet').bind('pick', function(e, atom){
		$('.jmol-log').append('<br />Picked ' + atom.name + ' (' + atom.num + ')');
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