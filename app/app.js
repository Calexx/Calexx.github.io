// Cargamos modulos de angular
angular.module('visualDataApp',['visualDataApp.controllers','visualDataApp.services','visualDataApp.directives']);

// Asignamos propiedad de resize
$(window).bind('resize', function(e){
	if (window.RT) clearTimeout(window.RT);
	window.RT = setTimeout(function(){
		this.location.reload(false);
	}, 100);
});