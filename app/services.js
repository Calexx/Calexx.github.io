angular.module('visualDataApp.services',[])

	// Factoria de carga de datos con DEFERRED i PROMISES para cargas asincronas
	.factory('loadJSON',function($q){
		var data = {};
		var deferred = $q.defer();
		d3.json("assets/json/europe.topo.json",function(europe) {	
			d3.json("assets/json/educationEmployment.json",function(error,employment) {
				d3.json("assets/json/population.json",function(population){
					d3.json("assets/json/salary.json",function(salary){
						d3.json("assets/json/pibCapita.json",function(pib){
							d3.json("assets/json/expenditureEducation.json",function(expenditure){
								d3.json("assets/json/education.json",function(education){
									d3.json("assets/json/salaryEducation.json",function(salaryEducation){
										if(error) throw error;
										data["europe"] = europe;
										data["employment"] = employment;
										data["population"] = population;
										data["salary"] = salary;
										data["pib"] = pib;
										data["expenditure"] = expenditure;
										data["education"] = education;
										data["salaryEducation"] = salaryEducation;
										deferred.resolve(data);
									});
								});
							});	
						});
					});
				});
			});
		});
		
		data.getEurope = function(){
			return data["europe"];
		}
		
		data.getEmployment = function(){
			return data["employment"];
		}
		
		data.getPopulation = function(){
			return data["population"];
		}
		
		data.getSalary = function(){
			return data["salary"];
		}
		
		data.getPib = function(){
			return data["pib"];
		}
		
		data.getExpenditure = function(){
			return data["expenditure"];
		}
		
		data.getEducation = function(){
			return data["education"];
		}
		
		data.getSalaryEducation = function(){
			return data["salaryEducation"];
		}
		
		return deferred.promise;
		
	})
	
	
	// Servicio de Crear Diccionario Europa
	.service('diccionarioEuropa',function(){
		var dicc = {
			"Belgium":"BE"
			,"Bulgaria":"BG"
			,"Czech Republic":"CZ"
			,"Denmark":"DK"
			,"Germany (until 1990 former territory of the FRG)":"DE"
			,"Estonia":"EE"
			,"Ireland":"IE"
			,"Greece":"EL"
			,"Spain":"ES"
			,"France":"FR"
			,"Croatia":"HR"
			,"Italy":"IT"
			,"Cyprus":"CY" 
			,"Latvia":"LV"
			,"Lithuania":"LT"
			,"Luxembourg":"LU"
			,"Hungary":"HU"
			,"Netherlands":"NL"
			,"Austria":"AT"
			,"Poland":"PL"
			,"Portugal":"PT"
			,"Romania":"RO"
			,"Slovenia":"SI"
			,"Slovakia":"SK"
			,"Finland":"FI"
			,"Sweden":"SE",
			"United Kingdom":"UK"
		}
		
		this.getDicc = function(){
			return dicc;
		}
	});

		