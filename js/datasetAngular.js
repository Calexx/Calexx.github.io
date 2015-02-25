var app = angular.module('datasetAngular', [])
	
	// Pivotaje de datos del JSON
	function pivotID(json){
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

		var result = _.groupByMulti(json, ['GEO','SECTPERF','TIME']);

		return result;
	}

	// Diccionario correspondencias NUTS
	function crearDiccionarioEuropa (){
		return dicc = {
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
	}
	
	//Inicializar data
	app.controller("datasetPrueba",function($scope){
		d3.json("json/europe.topo.json", function(error, europe) {	
			if(error) throw error;
			d3.json("json/I+D_europe.json", function(json) {
				$scope.$apply(function(){
					//datos globales
					$scope.datos = pivotID(json);
					
					//Indices
					$scope.paisos = Object.keys(data);
					$scope.sectors = Object.keys(data[$scope.paisos[0]]);
					$scope.years = Object.keys(data[$scope.paisos[0]][$scope.sectors[0]]);
					$scope.values = {}
					var indices = Object.keys(data[$scope.paisos[0]][$scope.sectors[0]][$scope.years[0]]);
					for (var i=0; i<indices.length;i++){
						var value = indices[i];
						$scope.values[value] = data[$scope.paisos[0]][$scope.sectors[0]][$scope.years[0]][value]["UNIT"];
					}
					
					//Variables del Mapa
					$scope.sector = $scope.sectors[0];
					$scope.year = $scope.years[0];
					$scope.valor = Object.keys($scope.values)[0];
					$scope.boundary = topojson.mesh(europe, europe.objects.regions, function(d) {
						if(d.properties.NUTS_ID.length == 2){
							return true;
						}
						else return false;
					});
					$scope.land = topojson.feature(europe, europe.objects.regions);
				});
			});
		});
	});
	
	// Le paso los attr por data;
	app.directive("map", function($window) {
		function link(scope, el, attr){
			el = el[0];
			var nElem = 0;
			var width = 600,
				height = 800;
			var padding = 40;
			var i_pais,j_pais;
		
			var div = d3.select(el);
	
			var projection = d3.geo.mercator()
				.center([0, 40])
				.scale(600)
				.translate([width / 3, height/1.25]);

			var path = d3.geo.path()
				.projection(projection)
				.pointRadius(2);
		
			var svg = div
				.append("svg")
				.attr("id","europe_svg")
				.attr("width", width)
				.attr("height", height)

			var dic = crearDiccionarioEuropa();
	 
			var initialValues = {};
	 
			var yearsSort = $scope.years.slice(indexOf($scope.year),$scope.years.length);
			
			for (key in data){
				if (_.contains(Object.keys(dic), key)){
					initialValues[key] = data[key][$scope.sector][$scope.year][$scope.valor]["Value"];
				}
			}
			 
			var g = svg.append('g');
			var land = g.append('path');
			var boundary = g.append('path');
			
			scope.$watch('land', function(geo){
				if(!geo) return;
				land
					.data(geo.filter(function(d){
						if(d.properties.NUTS_ID.length == 2){
							return true;
						}
						else return false;
					}))
					.attr("d", path)
					.attr("class", function(d){
						for (key in data){
							if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
								var tono = data[key][$scope.sector][$scope.year][$scope.valor]["Value"];
								if(tono<100){
									return "subunit " + key + " " + "primero";
								}
								else if (tono<500){
									return "subunit " + key + " " + "segundo";
								}
								else if (tono<1000){
									return "subunit " + key + " " + "tercero";
								}
								else{
									return "subunit " + key + " " + "cuarto";
								}
							}
						}
					})
					.each(function(){
						nElem++;
					});
			});
			
			scope.$watch('boundary', function(geo){
				if(!geo) return;
				boundary
					.datum(geo)
					.attr("class", "subunit-boundary")
					.attr("d", path);
			});
			
			svg.append("text")
				.attr("id","sector")
				.text($scope.sector)
				.attr("x", padding)
				.attr("y", padding);
	 	
			svg.append("text")
				.attr("id","year")
				.text($scope.year)
				.attr("x", padding*10+30)
				.attr("y", padding);
	 
			var button = d3.select(".myButton");
	 
			button
				.on("click",function(){
					transitions();
				});
	 	
		function transitions(){
			i_pais = 2;
			j_pais = 2 * nElem;
			i_year = 2;
			
			var subunits = svg.selectAll(".subunit");
			var year = svg.select("#year");
			
			subunits.transition()
				.style("fill",function(d){
					for(key in data){
						if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
							var tono = initialValues[key]-data[key][$scope.sector][yearsSort[1]][$scope.value]["Value"];
							if(tono<0){
								var qual = initialValues[key]/Math.abs(tono);
								if(qual<10){
									return "#FAE6E7"
								}
								else if (qual<20){
									return "#E98E95"
								}
								else{
									return "#D93A46";
								}
							}
							else if (tono>0){
								var qual = initialValues[key]/Math.abs(tono);
								if(qual<10){
									return "#E9F2F5"
								}
								else if (qual<20){
									return "#93B8C3"
								}
								else{
									return "#3F7F93";
								}
							}
							else{
								return "#F2F2F2";
							}
						}
					}
				})
				.duration(1000)
				.delay(300)
				.each("end",repeat);
				
			year.transition()
				.text(yearsSort[1])
				.duration(1000) // this is 1s
				.delay(500)
				.each("end",repeatYear);
		}
	
	function repeat(){
		i_pais = parseInt(j_pais/nElem);
		//ultima transicion o no
		if(i_pais<yearsSort.length+1){
			//ultimo año
			if(i_pais == yearsSort.length){
				d3.select(this).transition()
					.style("fill",function(d){
						for(key in data){
							if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
								var tono = data[key][$scope.sector][$scope.year][$scope.value]["Value"];
								if(tono<0){
									var qual = initialValues[key]/Math.abs(tono);
									if(qual<10){
										return "#F2F2F2"
									}
									else if (qual<20){
										return "#F2F2F2"
									}
									else{
										return "#F2F2F2";
									}
								}
								else if (tono>0){
									var qual = initialValues[key]/Math.abs(tono);
									if(qual<10){
										return "#F2F2F2"
									}
									else if (qual<20){
										return "#F2F2F2"
									}
									else{
										return "#F2F2F2";
									}
								}
								else{
									return "#F2F2F2";
								}
							}
						}
					})
					.duration(1000) // this is 1s
					.delay(5000);
				j_pais++;
			}
			else{
				d3.select(this).transition()
					.style("fill",function(d){
						for(key in data){
							if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
								var tono = initialValues[key]-data[key][$scope.sector][yearsSort[i_pais]][$scope.value]["Value"];
								if(tono<0){
									var qual = initialValues[key]/Math.abs(tono);
									if(qual<10){
										return "#FAE6E7"
									}
									else if (qual<20){
										return "#E98E95"
									}
									else{
										return "#D93A46";
									}
								}
								else if (tono>0){
									var qual = initialValues[key]/Math.abs(tono);
									if(qual<10){
										return "#E9F2F5"
									}
									else if (qual<20){
										return "#93B8C3"
									}
									else{
										return "#3F7F93";
									}
								}
								else{
									return "#F2F2F2";
								}
							}
						}
					})
					.duration(1000) // this is 1s
					.delay(300)
					.each("end",repeat);
				j_pais++;
			}
		}
	}
	
	function repeatYear(){
		if(i_year<yearsSort.length+1){
			if(i_year==yearsSort.length){
				d3.select(this).transition()
					.text(yearsSort[0])
					.duration(1000) // this is 1s
					.delay(5000);
				i_year++;
			}
			else{
				d3.select(this).transition()
					.text(yearsSort[i_year])
					.duration(1000) // this is 1s
					.delay(300)
					.each("end",repeatYear);
				i_year++;
			}
		}
	}
	
	var h_leyenda = 20;
	var w_rect = width/7;
	
	var svg_leyenda = div
		.append("svg")
		.attr("width", width)
		.attr("height", h_leyenda)
		.attr("class","leyenda");
		
	svg_leyenda
		.append("rect")
		.attr("x",0)
		.attr("y",0)
		.attr("width", w_rect)
		.attr("height", h_leyenda)
		.attr("fill", "#D93A46");
	svg_leyenda
		.append("rect")
		.attr("x",w_rect)
		.attr("y",0)
		.attr("width", w_rect)
		.attr("height", h_leyenda)
		.attr("fill", "#E98E95");
	svg_leyenda
		.append("rect")
		.attr("x",w_rect*2)
		.attr("y",0)
		.attr("width", w_rect)
		.attr("height", h_leyenda)
		.attr("fill", "#FAE6E7");
	svg_leyenda
		.append("rect")
		.attr("x",w_rect*3)
		.attr("y",0)
		.attr("width", w_rect)
		.attr("height", h_leyenda)
		.attr("fill", "#F2F2F2");
	svg_leyenda
		.append("rect")
		.attr("x",w_rect*4)
		.attr("y",0)
		.attr("width", w_rect)
		.attr("height", h_leyenda)
		.attr("fill", "#E9F2F5");
	svg_leyenda
		.append("rect")
		.attr("x",w_rect*5)
		.attr("y",0)
		.attr("width", w_rect)
		.attr("height", h_leyenda)
		.attr("fill", "#93B8C3");
	svg_leyenda
		.append("rect")
		.attr("x",w_rect*6)
		.attr("y",0)
		.attr("width", w_rect)
		.attr("height", h_leyenda)
		.attr("fill", "#3F7F93");
	}
			
	return {
		link: link,
		restrict: 'E',
		scope: {sector: '=', year: '=', valor: '=', boundary: '=', land: '='}
	};
}); 