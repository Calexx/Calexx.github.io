angular.module('visualDataApp.controllers',[])

	// Controlador principal de la aplicación
	.controller('mainCtrl',function($scope,loadJSON,diccionarioEuropa/*,eurostat*/){
		
		/*eurostat.then(function(data) {
			console.log(data);
		})*/
		
		loadJSON.then(function(data) {  
			//$scope.$apply(function(){
				// Carga de datos
				$scope.employment = pivotID(data.getEmployment(),['GEO','SEX','TIME','ISCED11','ISCO08']);
				$scope.population = pivotID(data.getPopulation(),['GEO','SEX','TIME']);
				$scope.salary = pivotID(data.getSalaryEducation(),['GEO','SEX','TIME','ISCED97']);
				$scope.salaryTotal = pivotID(data.getSalary(),['GEO','SEX','TIME']);				
				$scope.pib = pivotID(data.getPib(),['GEO','NA_ITEM','TIME']);
				$scope.expenditure = pivotID(data.getExpenditure(),['GEO','INDIC_ED','TIME']);
				$scope.educationLevel = pivotID(data.getEducation(),['GEO','SEX','TIME']);
				
				//Carga TOPOJSON
				$scope.map = data.getEurope();
				$scope.diccEurope = diccionarioEuropa.getDicc();
				
				console.log($scope.salary);
				
				//Asignamos scopes para visualizacion inicial
				var paisos = Object.keys($scope.employment);
				$scope.sexos = Object.keys($scope.employment[paisos[0]]);
				var years = Object.keys($scope.employment[paisos[0]][$scope.sexos[0]]);
				$scope.educations = Object.keys($scope.employment[paisos[0]][$scope.sexos[0]][years[0]]);
				$scope.activities = Object.keys($scope.employment[paisos[0]][$scope.sexos[0]][years[0]][$scope.educations[0]]);
				
				// Pais inicial para visualización inicial Charts
				$scope.pais = paisos[1];
				$scope.education = $scope.educations[0];
				
				// Definimos reconstrucción view --> Posteriomente se hara con carga de views
				$scope.reconstruccion = false;				
				$scope.changeValue = function(education){
					if($scope.education == education){
						if($scope.reconstruccion == true){
							$scope.reconstruccion = false;
							$("#page-container").empty();
							var template = "<div ng-include src=''views/primaryView.tpl.html''></div>";
							var linkFn = $compile(template);
							var content = linkFn($scope);
							$('#page-container').append(content);
						}
					}
					$scope.education = education;
				}
			//});
		});
		
		// Definimos funcion de pivotaje de JSONS --> Solo se usara en el controlador
		function pivotID(json, group){
			_.groupByMulti = function (obj, values, context) {
				if (!values.length)
					return obj;
				var byFirst = _.groupBy(obj, values[0], context),
					rest = values.slice(1);
				for (var prop in byFirst) {
					byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
				}
				return byFirst;
			};

			var result = _.groupByMulti(json, group);

			return result;
		}
	});