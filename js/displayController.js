function displayController($scope){
	
	
	$scope.drawTutorial = function() {
		var myNode = document.getElementById("page-wrapper");
		while (myNode.firstChild) {
			myNode.removeChild(myNode.firstChild);
		}
	};
	
	$scope.drawPrimera = function() {
		var myNode = document.getElementById("page-wrapper");
		while (myNode.firstChild) {
			myNode.removeChild(myNode.firstChild);
		}
		
	};
	
	$scope.drawCompleto = function() {
		var myNode = document.getElementById("page-wrapper");
		while (myNode.firstChild) {
			myNode.removeChild(myNode.firstChild);
		}
	};
	
	$scope.drawDataset = function() {
		var myNode = document.getElementById("page-wrapper");
		while (myNode.firstChild) {
			myNode.removeChild(myNode.firstChild);
		}
	};
}