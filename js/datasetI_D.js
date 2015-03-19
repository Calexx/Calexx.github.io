var app = angular.module('datasetI_D', []);

app.controller('Data', function($scope, $compile){
    d3.json("json/europe.topo.json", function(error, europe) {	
		d3.json("json/I+D_europe.json", function(json) {
			if(error) throw error;
			$scope.$apply(function(){
				data = pivotID(json);
				$scope.datos = data;
				$scope.map = europe;
				
				$scope.paisos = Object.keys($scope.datos);
				$scope.sectors = Object.keys($scope.datos[$scope.paisos[0]]);
				$scope.years = Object.keys($scope.datos[$scope.paisos[0]][$scope.sectors[0]]);
				$scope.values = Object.keys($scope.datos[$scope.paisos[0]][$scope.sectors[0]][$scope.years[0]]); 
				
				$scope.pais = $scope.paisos[0];
				$scope.year = $scope.years[0];
				$scope.actual = $scope.year;
				$scope.sector = $scope.sectors[0];
				
				$scope.reconstruccion = false;
				
				$scope.values_indicator = {};
				
				for (var i=0; i<$scope.values.length; i++){
					$scope.values_indicator[$scope.values[i]] = $scope.datos[$scope.paisos[0]][$scope.sectors[0]][$scope.years[0]][$scope.values[i]]["UNIT"];
				}
				
				$scope.changeValue = function(sector){
					if($scope.sector == sector){
						if($scope.reconstruccion == true){
							$scope.reconstruccion = false;
							$("#page-container").empty();
							var template = getTemplateInicial();
							console.log(template);
							var linkFn = $compile(template);
							var content = linkFn($scope);
							$('#page-container').append(content);
						}
					}
					$scope.sector = sector;
				}
				
			});
		});
	});
});

app.directive('myChart',function(){
	function link(scope,el,attr){
		scope.$parent.$watch('datos',function(){
			if(typeof scope.$parent.datos !== "undefined"){
				
				scope.value = attr.value;
				
				scope.$parent.$watchGroup(['pais','year','sector'], function(){
					drawMap(scope,el,scope.$parent.datos);
				});
				
				scope.$watch('value',function(){
					drawMap(scope,el,scope.$parent.datos);
				});
			}
		});
		
		function drawMap(scope, el, datos){
			
			d3.select(el[0]).selectAll("svg").remove();
			
			var w = el.width()-50,
				h = el.width()-100;
				
			var padding = 30;
			
			var data = datos[scope.$parent.pais];
			var initialValue = parseFloat(data[scope.$parent.sector][scope.$parent.year][scope.value]["Value"].replace(',',''));
			
			var values = [];
			for (key in data[scope.sector]){
				values.push(parseFloat(data[scope.$parent.sector][key][scope.value]["Value"].replace(',','')));
			}
			
			var xScale = d3.scale.linear()
				.domain([scope.$parent.year, scope.$parent.years[scope.$parent.years.length-1]])
				.range([padding, w - padding]);
			
			var yScale = d3.scale.linear()
				.domain([d3.min(values), d3.max(values)])
				.range([h-padding, padding]);
				
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.ticks(10)
				.tickFormat(function(d){
					return d.toString().substring(2);
				});
			
			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left")
				.tickFormat(function(d){
					return d.toString().substring(0,3);
				})
				.ticks(5);
				
			var svg = d3.select(el[0].children[1])
				.append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("class","graph")
				.attr("id","svg_s");
			
			svg
				.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0,"+(h-padding)+")")
				.attr("fill","black")
				.call(xAxis);
				
			svg
				.append("g")
				.attr("class", "axis")
				.attr("transform", "translate("+padding+",0)")
				.attr("fill","black")
				.call(yAxis); 
			
			var array = []
			for (key in data[scope.$parent.sector]){
				var value = {};
				value[key] = parseFloat(data[scope.$parent.sector][key][scope.value]["Value"].replace(',',''));
				array.push(value);
			}
			
			var tooltip;
			var bodyNode = d3.select("body").node();
			
			var circles = svg.selectAll("circle")
				.data(array)
				.enter()
				.append("circle")
				.attr("fill",function(d){
						var value = parseFloat(d[Object.keys(d)[0]]) - initialValue;
						initialValue = parseFloat(d[Object.keys(d)[0]]);
						if (value<0){
							return "#D93A46";
						} 
						else if (value>0){
							return "#3F7F93";
						}
						else{
							return "#F2F2F2";
						}
				})
				.attr("cx", function(d) {
					return xScale(Object.keys(d)[0]);
				})
				.attr("cy", function(d) {
					if(isNaN(d[Object.keys(d)[0]])){
						d3.select(this).remove();
					}
					else{
						return yScale(d[Object.keys(d)[0]]);
					}
				})
				.attr("r", function(d) {
					return 2;
				})
				.on ("mouseover",function(d){
					var cr = d3.select(this);
					cr.attr("r",5);
					d3.selectAll('.tooltip').remove();
					tooltip = d3.select(el[0].children[1]).append("div").attr("class", "tooltip");
					var absoluteMousePos = d3.mouse(this);
					tooltip
						.style('left', (absoluteMousePos[0])+'px')
						.style('top', (absoluteMousePos[1]-10)+'px')
						.style('position', 'absolute') 
						.style('z-index', 1001);
					var tooltipText = "<p id='tooltip_p'>" + d[Object.keys(d)[0]] + "</p>";
					tooltip
						.html(tooltipText);
				})
				.on ("mouseleave",function(d){
					var cr = d3.select(this);
					cr.attr("r",2);
					tooltip.remove();
				})
				
			var lineFunction = d3.svg.line()
				.x(function(d) {
					return xScale(parseFloat(Object.keys(d)[0]));
				})
				.y(function(d) { 
					return yScale(parseFloat(d[Object.keys(d)[0]])); 
				})
				.interpolate("linear");
				
			var path = svg.append("path")
				.attr("d", lineFunction(array))
				.attr("stroke", "black")
				.attr("stroke-width", 0.5)
				.attr("fill", "none");

			d3.select(el[0].children[0]).selectAll(".mySelect").remove();
			
			var select = d3.select(el[0].children[0])
				.append("select")
				.attr("id","selectStacked")
				.attr("class","mySelect");
				
			var select = d3.select(".mySelect");
			
			var options = select.selectAll("option")
				.data(scope.$parent.values)
				.enter()
				.append("option")
				.attr("class","options")
				.attr("value",function(d){
					return d;
				})
				.each(function(d){
					if(d == scope.value) d3.select(this).attr("selected","selected");
				})
				.text(function(d){
					return scope.$parent.values_indicator[d];
				});
				
			select
				.on("change",function(){
					scope.$apply(function(){
						var value = $("#selectStacked").val();
						scope.value = value;
					});
				});
		}
	};
	
	return {
		link: link,
		restrict: 'AE',
		scope: true
	};
});

app.directive('myMap',function($compile){
	function link(scope,el,attr){
		scope.$parent.$watch('datos',function(){
			if(typeof scope.$parent.datos !== "undefined"){
				
				scope.value = attr.value;
				
				scope.$parent.$watchGroup(['sector','year'], function(){
					drawMap(scope,el,scope.$parent.datos,$compile);
				});
			}
		});
		
		function drawMap(scope, el, datos, $compile){
			d3.select(el[0]).selectAll("svg").remove();
			
			var nElem = 0;
			var width = el.width()-50,
				height = el.width()-100;
			var padding = 20;
			var i_pais,j_pais;		

			var data = datos;
			var europe = scope.$parent.map;
			
			var projection = d3.geo.mercator()
				.center([0, 40])
				.scale(width/1.5)
				.translate([width / 2.5, height/1.25]);

			var path = d3.geo.path()
				.projection(projection)
				.pointRadius(2);
				
			var svg = d3.select(el[0].children[1])
				.append("svg")
				.attr("id","europe_svg")
				.attr("width", width)
				.attr("height", height)

			var dic = crearDiccionarioEuropa();
			
			var initialValues = {};
			
			for (key in data){
				if (_.contains(Object.keys(dic), key)){
					initialValues[key] = parseFloat(data[key][scope.$parent.sector][scope.$parent.year][scope.value]["Value"].replace(',',''));
				}
			}
			
			// Euro Per Capita in RESEARCH
			svg.selectAll(".subunits")
				.data(topojson.feature(europe, europe.objects.regions).features.filter(function(d){
					if(d.properties.NUTS_ID.length == 2){
						return true;
					}
					else return false;
				}))
				.enter().append("path")
				.attr("d", path)
				.attr("class", function(d){
					for (key in data){
						if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
							var tono = parseFloat(data[key][scope.$parent.sector][scope.$parent.year][scope.value]["Value"].replace(',',''));
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
				})
				.on("mouseover",function(){
					d3.select(this)
						.style("opacity",0.8);
				})
				.on("mouseleave",function(){
					d3.select(this)
						.style("opacity",1);	
				})
				.on("click",function(d){
					scope.$apply(function(){
						for (key in data){
							if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
								scope.$parent.pais = key;
							}
						}
						
						if(scope.$parent.reconstruccion == false){
							scope.$parent.reconstruccion = true;
							$("#page-container").empty();
							var template = 	getTemplateReconstruir();
							var linkFn = $compile(template);
							var content = linkFn(scope);
							$('#page-container').append(content);
						}	
					});
				});
				
			svg.append("path")
				//.datum(topojson.mesh(europe, europe.objects.regions, function(a, b) { return a !== b}))
				.datum(topojson.mesh(europe, europe.objects.regions, function(d) {
					if(d.properties.NUTS_ID.length == 2){
						return true;
					}
					else return false;
				}))
				.attr("d", path)
				.attr("class", "subunit-boundary");
			
			svg.append("text")
				.attr("id","year");
		
			d3.select(el[0].children[0]).selectAll(".myButton").remove();
			
			var button = d3.select(el[0].children[0])
				.append("button")
				.attr("class","myButton");
				
			var button = d3.select(".myButton");
				
			button
				.on("click",function(){
					scope.$apply(function(){
						scope.$parent.actual = scope.$parent.year;
					});
					var subunits = svg.selectAll(".subunit");
					subunits
						.style("fill", "#F2F2F2");
					transitions();
				});
				
			function transitions(){
				i_pais = 2;
				j_pais = 2 * nElem;
				i_year = 1;
				
				var subunits = svg.selectAll(".subunit");
				var year = svg.select("#year");
				
				subunits.transition()
					.style("fill",function(d){
						for(key in data){
							if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
								var value = initialValues[key];
								var value2 = parseFloat(data[key][scope.$parent.sector][scope.$parent.years[1]][scope.value]["Value"].replace(',',''));
								var tono = value2-value;
								if(isNaN(tono)){
									return d3.select(this).style("fill");
								}
								else{
									if(tono<0){
										var qual = (Math.abs(tono)/value)*100;
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
										var qual = (Math.abs(tono)/value)*100;
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
						}
					})
					.duration(1000)
					.delay(300)
					.each("end",repeat);
					
				year.transition()
					.duration(1000) // this is 1s
					.delay(300)
					.each("end",repeatYear);
				}
			
			function repeatYear(){
				scope.$apply (function(){
					if(i_year<scope.$parent.years.length+1){
						if(i_year==scope.$parent.years.length){
							d3.select(this).transition()
								.duration(1000) // this is 1s
								.delay(5000)
								.each("end",function(){
									scope.$apply (function(){
										scope.$parent.actual = scope.$parent.year;
									});
								});
							i_year++;
						}
						else{
							d3.select(this).transition()
								.duration(1000) // this is 1s
								.delay(300)
								.each("end",repeatYear);
							scope.$parent.actual = scope.$parent.years[i_year];
							i_year++;
						}
					}
				});
			}
			
			
			function repeat(){
				i_pais = parseInt(j_pais/nElem);
				//ultima transicion o no
				if(i_pais<scope.$parent.years.length+1){
					//ultimo año
					if(i_pais == scope.$parent.years.length){
						d3.select(this).transition()
							.style("fill",function(d){
								for(key in data){
									if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
										var value = initialValues[key];
										var tono = parseFloat(data[key][scope.$parent.sector][scope.$parent.year][scope.value]["Value"].replace(',',''));
										if(isNaN(tono)){
											return d3.select(this).style("fill");
										}
										else{
											if(tono<0){
												var qual = (Math.abs(tono)/value)*100;
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
												var qual = (Math.abs(tono)/value)*100;
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
										var value = initialValues[key];
										var value2 = parseFloat(data[key][scope.$parent.sector][scope.$parent.years[i_pais]][scope.value]["Value"].replace(',',''));
										var tono = value2-value;
										if(isNaN(tono)){
											return d3.select(this).style("fill");
										}
										else{
											if(tono<0){
												var qual = (Math.abs(tono)/value)*100;
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
												var qual = (Math.abs(tono)/value)*100;
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
								}
							})
							.duration(1000) // this is 1s
							.delay(300)
							.each("end",repeat);
						j_pais++;
					}
				}
			}
			
			var h_leyenda = height/20;
			var w_rect = width/7;
			
			var svg_leyenda = d3.select(el[0].children[1])
				.append("svg")
				.attr("width", width)
				.attr("height", h_leyenda)
				.attr("class","leyenda");
			svg_leyenda
				.append("rect")
				.attr("x",0)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/3)
				.attr("id","lowest")
				.attr("fill", "#D93A46");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/3)
				.attr("id","low_mid")
				.attr("fill", "#E98E95");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*2)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/3)
				.attr("id","low")
				.attr("fill", "#FAE6E7");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*3)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/3)
				.attr("id","nothing")
				.attr("fill", "#F2F2F2");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*4)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/3)
				.attr("id","hight")
				.attr("fill", "#E9F2F5");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*5)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/3)
				.attr("id","high_mid")
				.attr("fill", "#93B8C3");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*6)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/3)
				.attr("id","highest")
				.attr("fill", "#3F7F93");
			svg_leyenda.selectAll("rect")
				.on("mouseover",function (d){
					var rect = d3.select(this)
						.attr("opacity",0.8);
					var color = rect.attr("fill");
					var subunits = svg.selectAll(".subunit");
					subunits
						.each(function () {
							var unit = d3.select(this);
							var color_unit = rgb2hex(unit.style("fill")).toUpperCase();
							if(color_unit ==  color){
								unit
									.style("opacity",0.8);
							}
						});
				})
				.on("mouseleave",function (d){
					d3.select(this)
						.attr("opacity",1);
					var subunits = svg.selectAll(".subunit");
					subunits
						.each(function () {
							var unit = d3.select(this)
								.style("opacity",1);
						});
				});
			svg_leyenda
				.append("text")
				.attr("x",w_rect/3)
				.attr("y",h_leyenda/1.5)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/4 + "px";
				})
				.text("-30%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect+w_rect/3)
				.attr("y",h_leyenda/1.5)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/4 + "px";
				})
				.text("-20%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*2+w_rect/3)
				.attr("y",h_leyenda/1.5)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/4 + "px";
				})
				.text("-10%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*3+w_rect/3)
				.attr("y",h_leyenda/1.5)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/4 + "px";
				})
				.text("-0%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*4+w_rect/3)
				.attr("y",h_leyenda/1.5)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/4 + "px";
				})
				.text("+10%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*5+w_rect/3)
				.attr("y",h_leyenda/1.5)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/4 + "px";
				})
				.text("+20%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*6+w_rect/3)
				.attr("y",h_leyenda/1.5)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/4 + "px";
				})
				.text("+30%");
				
				/*.on("click", function(d){
					var subunits = svg.selectAll(".subunit");
					subunits.transition().duration(0);
					var year = svg.selectAll("#year");
					year.transition().duration(0);
				});*/
		}
	};
	return {
		link: link,
		restrict: 'AE',
		scope: true
	};
});

app.directive('myStackedBar',function(){
	function link(scope,el,attr){
		scope.$parent.$watch('datos',function(){
			if(typeof scope.$parent.datos !== "undefined"){	
			
				scope.value = attr.value;
				
				scope.$parent.$watch('pais', function(){
					drawMap(scope,el,scope.$parent.datos);
				});
				
			}
		});
		
		function drawMap(scope, el, datos){
			
			d3.select(el[0]).selectAll("svg").remove();
			
			/*var w = el.width()-el.width()/3.75,
				h = el.width()-el.width()/3.75;*/
				
			var w = el.width()-50,
				h = el.width()-100;
				
			var padding = el.width()/10;
			
			var data = datos[scope.$parent.pais];
			
			var values = [];
			var allValues = [];
			for (sector in data){
				if(sector == scope.$parent.sectors[0]){
					for (year in data[sector]){
						var v = {};
						v["year"] = year;
						v["sector"] = sector;
						v["value"] = parseFloat(data[sector][year][scope.value]["Value"].replace(',',''));
						allValues.push(v);
					}
				}
				else{
					var element = []
					for (year in data[sector]){
						var v = {};
						v["year"] = year;
						v["sector"] = sector;
						v["value"] = parseFloat(data[sector][year][scope.value]["Value"].replace(',',''));
						values.push(v);
					}					
				}
				
			}
			
			values.sort(compare);
			
			var minmax = [];
			for (var i=0;i<values.length;i++){
				minmax.push(values[i].value);
			}	
			
			var xScale = d3.scale.linear()
				.domain([scope.$parent.year, scope.$parent.years[scope.$parent.years.length-1]])
				.range([0, w - padding]);
				
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.ticks(10)
				.tickFormat(function(d){
					return d.toString().substring(2);
				});
				
			var svg = d3.select(el[0].children[1])
				.append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("class","stacked")
				.attr("id","stacked-char");
			
			/*svg
				.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0,"+(h-padding/1.2)+")")
				.attr("fill","black")
				.call(xAxis);*/
			
			var anterior = 0;
			var contador = 1;
			var cont = 1;
			
			var rect = svg.selectAll("rect")
				.data(values)
				.enter()
				.append("rect")
				.attr("x", function(d, i) {
					return xScale(d.year);
				})
				.attr("class",function(d){
					return "bar" + " " + d.sector.replace(/ /g,'');
				})
				.attr("y", function(d) {
					var a = anterior;
					var maximum;
					var year = d.year;
					for (var i=0;i<allValues.length;i++){
						if(allValues[i].year == year){
							maximum = allValues[i].value;
						}
					}
					var value = d.value;
					if(contador%(scope.$parent.sectors.length-1)==0){
						anterior = 0;
					}
					else{
						anterior = (anterior+(value/maximum)*h);
					}
					contador++;
					return a;
				})
				.attr("width", w/(scope.$parent.years.length+2))
				.attr("height", function(d) {
					var maximum;
					var year = d.year;
					for (var i=0;i<allValues.length;i++){
						if(allValues[i].year == year){
							maximum = allValues[i].value;
						}
					}
					var value = d.value;
					return ((value/maximum)*h);  //Solo el dato
				});
				
			/*var h_leyenda = h/10;
			var w_rect = (w-padding)/4;*/
			
			var h_leyenda = h/20;
			var w_rect = w/4;
			
			var svg_leyenda = d3.select(el[0].children[1])
				.append("svg")
				.attr("width", w)
				.attr("height", h_leyenda+padding/10)
				.attr("class","leyenda_bars");
			
			svg_leyenda
				.append("rect")
				.attr("x",0)
				.attr("y",padding/10)
				.attr("width", w_rect)
				.attr("height", h_leyenda/4)
				.attr("fill", "#00ACAC");			
			svg_leyenda
				.append("rect")
				.attr("x",w_rect)
				.attr("y",padding/10)
				.attr("width", w_rect)
				.attr("height", h_leyenda/4)
				.attr("fill", "#348FE2");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*2)
				.attr("y",padding/10)
				.attr("width", w_rect)
				.attr("height", h_leyenda/4)
				.attr("fill", "#727CB6");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*3)
				.attr("y",padding/10)
				.attr("width", w_rect-padding/3.5)
				.attr("height", h_leyenda/4)
				.attr("fill", "#2D353C");
				
			svg_leyenda
				.append("text")
				.attr("x",0)
				.attr("y",padding/10+h_leyenda/1.5)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/2 + "px";
				})
				.text("Business");
			svg_leyenda
				.append("text")
				.attr("x",w_rect)
				.attr("y",padding/10+h_leyenda/1.5)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/2 + "px";
				})
				.text("Government");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*2)
				.attr("y",padding/10+h_leyenda/1.5)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/2 + "px";
				})
				.text("H.Education");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*3)
				.attr("y",padding/10+h_leyenda/1.5)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/2 + "px";
				})
				.text("Private");
		}
	};
	
	return {
		link: link,
		restrict: 'AE',
		scope: true
	};
});

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

function rgb2hex(rgb) {
     if (  rgb.search("rgb") == -1 ) {
          return rgb;
     } else {
          rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
          function hex(x) {
               return ("0" + parseInt(x).toString(16)).slice(-2);
          }
          return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
     }
}

function compare(a,b){
	if(a.year<b.year){
		return -1;
	}
	if(a.year>b.year){
		return 1;
	}
	return 0;
}

$(window).bind('resize', function(e){
	if (window.RT) clearTimeout(window.RT);
	window.RT = setTimeout(function(){
		this.location.reload(false);
	}, 100);
});

function getTemplateInicial(){
	return "<div class='row' id='row2'><div class='col-lg-12'><div my-map value='0' class='panel panel-default big-panel'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-bar-chart-o fa-fw'></i> {{sector}} at year : {{actual}}</h3></div><div class='panel-body'></div></div></div></div><div class='row' id='row3'><div class='col-lg-4'><div my-chart value='0' class='panel panel-default'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-long-arrow-right fa-fw'></i> {{pais}} : </h3></div><div class='panel-body'></div></div></div><div class='col-lg-4'><div my-stacked-bar value='0' class='panel panel-default'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-clock-o fa-fw'></i> {{pais}} : I+D Sector by {{values_indicator[value]}}</h3></div><div class='panel-body'> </div></div></div></div>";
}

function getTemplateReconstruir(){
	return "<div class='row' id='row'><div class='col-lg-6'><div my-stacked-bar value='0' class='panel panel-default'><div class='panel-heading'><h3 class='panel-title' style='font-size:16px;padding:5px;'><i class='fa fa-clock-o fa-fw'></i> {{pais}} : I+D Sectors by {{values_indicator[value]}}</h3></div><div class='panel-body'></div></div></div><div class='col-lg-6'><div my-map value='0' class='panel panel-default big-panel'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-long-arrow-right fa-fw'></i>  {{sector}} at year : {{actual}}</h3></div><div class='panel-body'></div></div></div></div><div class='row' id='row2'><div class='col-lg-4'><div my-chart value='0' class='panel panel-default'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-clock-o fa-fw'></i> {{pais}} : {{values_indicator[value]}}</h3></div><div class='panel-body'></div></div></div></div>";
}