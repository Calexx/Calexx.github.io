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
	
	/*.service('customColors',function(){
		"hombres" --> "mujeres";	
	}*/
	
	/*.service ('eurostat',function($q){
		var deferred = $q.defer();
		
		makeCorsRequest("http://ec.europa.eu/eurostat/SDMX/diss-web/rest/data/cdh_e_fos/..../",test);
		
		function xmlToJson(xml) {
			// Create the return object
			var obj = {};

			if (xml.nodeType == 1) { // element
				// do attributes
				if (xml.attributes.length > 0) {
				obj["@attributes"] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType == 3) { // text
				obj = xml.nodeValue;
			}
			// do children
			if (xml.hasChildNodes()) {
				for(var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i);
					var nodeName = item.nodeName;
					if (typeof(obj[nodeName]) == "undefined") {
						obj[nodeName] = xmlToJson(item);
					} else {
						if (typeof(obj[nodeName].push) == "undefined") {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						obj[nodeName].push(xmlToJson(item));
					}
				}
			}
			return obj;
		};
		
		function test(){
			var json = xmlToJson(this.responseXML);
			console.log(json[Object.keys(json)[0]]["ns1:DataSet"]["Series"]);
		}
		
		function makeCorsRequest(url, onLoadFunc) {
	        var xhr = createCORSRequest(url);
	        xhr.onload = onLoadFunc;
	        xhr.onerror = function () {
	            throw "error";
	        };
			xhr.setRequestHeader("Accept","application/vnd.sdmx.structurespecificdata+xml");
	        xhr.send();
	    }
		
		function createCORSRequest(url) {
	        var method = 'GET';
	        if (typeof XDomainRequest != "undefined") {
	            // XDomainRequest for IE.
	            var xhr = new XDomainRequest();
	            xhr.open(method, url);
	        } else {
	            var xhr = new XMLHttpRequest();
	            // XHR for Chrome/Firefox/Opera/Safari.
	            xhr.open(method, url, true);
	        }
	        return xhr;
	    }
		
		return deferred.promise;
	});*/

		