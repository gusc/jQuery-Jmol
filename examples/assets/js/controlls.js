// Clear text area on focus
function clear(){
	$(this).text('');
	$(this).unbind('focus', clear);
}
$(document).ready(function(){
	// Initialize Jmol
	var jmol = new Jmol('#jmol', {
		appletUrl : 'assets/java/jmol/',
		width: 400,
		height: 400,
		modelUrl : 'data/ch4.pdb',
		background: '#FFFFFF',
		events : ['hover', 'pick'],
		onEcho : function(msg){
			$('.jmol-log').append('<br />' + msg);
		}
	});
	// Bind a listener for hover event
	jmol.addEventListener('hover', function(e, arguments){
		$('.jmol-log').append('<br />' + arguments[1]);
	});
	// Bind a listener for pick event
	jmol.addEventListener('pick', function(e, arguments){
		$('.jmol-log').append('<br />' + arguments[1]);
	});
	// Create a callback script element
	jmol.addCallbackScript('.jmol-send', function(){
		return $('.jmol-input').val();
	});
	// Create a data script element
	jmol.addDataScript('.jmol-controll');
	
	// Bind a clear function to textarea
	$('.jmol-input').bind('focus', clear);
});