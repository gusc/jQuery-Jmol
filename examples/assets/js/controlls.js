// Clear text area on focus
function clear(){
	$(this).text('');
	$(this).unbind('focus', clear);
}
$(document).ready(function(){
	// Initialize Jmol
	$('#jmol').jmol({
		appletUrl : 'assets/java/jmol/',
		width: 400,
		height: 400,
		modelUrl : 'data/ch4.pdb',
		background: '#FFFFFF'
	}).bind('jmol_echo', function(e, jmol, msg){
			$('.jmol-log').append('<br />' + msg);
	}).bind('jmol_hover', function(e, jmol, data){
		$('.jmol-log').append('<br />' + data.label);
	}).bind('jmol_pick', function(e, jmol, data){
		$('.jmol-log').append('<br />' + data.label);
	});
	// Send a script from text area to Jmol
	$('.jmol-send').bind('click', function(e){
		e.preventDefault();
		jmol.script($('.jmol-input').val());
		// or
		// $('#jmol').data('jmol').script($('.jmol-input').val());
	});
	// Perform scripting actions stored in data attributes
	$('.jmol-controll').bind('click', function(e){
		e.preventDefault();
		if ($(this).data('script')){
			$('#jmol').data('jmol').script($(this).data('script'));
		}
	});
	// Bind a clear function to textarea
	$('.jmol-input').bind('focus', clear);
});