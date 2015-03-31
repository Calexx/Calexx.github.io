var app = angular.module('sexEmployment',[]);

app.controller('Data', function($scope, $compile){
	d3.json("json/europe.topo.json", function(error, europe) {	
		d3.json("json/educationEmployment.json", function(json) {
			d3.json("json/population.json",function(json2){
					if(error) throw error;
					$scope.$apply(function(){
						
						var data = pivotID(json,['GEO','SEX','TIME','ISCED11','ISCO08']);
						var population = pivotID(json2,['GEO','SEX','TIME']);
						
						$scope.datos = data;
						$scope.population = population;
						
						$scope.map = europe;
						
						$scope.paisos = Object.keys($scope.datos);
						$scope.sexos = Object.keys($scope.datos[$scope.paisos[0]]);
						$scope.years = Object.keys($scope.datos[$scope.paisos[0]][$scope.sexos[0]]);
						$scope.educations = Object.keys($scope.datos[$scope.paisos[0]][$scope.sexos[0]][$scope.years[0]]);
						$scope.activities = Object.keys($scope.datos[$scope.paisos[0]][$scope.sexos[0]][$scope.years[0]][$scope.educations[0]]);
						$scope.values = Object.keys($scope.datos[$scope.paisos[0]][$scope.sexos[0]][$scope.years[0]][$scope.educations[0]][$scope.activities[0]]);
						
						$scope.pais = $scope.paisos[0];
						$scope.year = $scope.years[0];
						$scope.education = $scope.educations[0];
						
						$scope.reconstruccion = false;
						
						$scope.changeValue = function(education){
							if($scope.education == education){
								if($scope.reconstruccion == true){
									$scope.reconstruccion = false;
									$("#page-container").empty();
									var template = getTemplateInicial();
									var linkFn = $compile(template);
									var content = linkFn($scope);
									$('#page-container').append(content);
								}
							}
							$scope.education = education;
						}
					});
			});
		});
	});
});

app.directive('myChart',function(){
	function link(scope,el,attr){
		scope.$parent.$watch('datos',function(){
			if(typeof scope.$parent.datos !== "undefined"){
				
				scope.value = '0';
				scope.activity = "Total";
	
				scope.$parent.$watchGroup(['pais','year','education'], function(){
					drawChart(scope,el,scope.$parent.datos);
				});
				
				scope.$watch('activity',function(){
					drawChart(scope,el,scope.$parent.datos);
				});
			}
		});
		
		function drawChart(scope, el, datos){
			
			d3.select(el[0]).selectAll("svg").remove();
			
			var w = el.width()-50,
				h = el.width()-100;
				
			var padding = 30;
			var formatBigNumbers = d3.format(".1s");
			var data = datos[scope.$parent.pais];
			
			var values = [];
			for (sexo in scope.$parent.sexos){
				if(scope.$parent.sexos[sexo]!="Total"){
					for (year in scope.$parent.years){
						values.push(parseFloat(data[scope.$parent.sexos[sexo]][scope.$parent.years[year]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,'')));
					}
				}
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
					return d/1000;
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
			
			var array = [];
			
			for (sexo in data){
				if(sexo!="Total"){
					for (year in data[sexo]){
						var d = {}
						var diccionario = {};
						diccionario["sexo"] = sexo;
						diccionario["Value"] = parseFloat(data[sexo][year][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''));
						d[year] = diccionario;
						array.push(d);
					}
				}
			}
			
			
			var tooltip;
			
			var circles = svg.selectAll("circle")
				.data(array)
				.enter()
				.append("circle")
				.attr("fill",function(d){
						if(d[Object.keys(d)[0]].sexo == "Males") return "blue";
						else return "pink"
				})
				.attr("cx", function(d) {
					return xScale(Object.keys(d)[0]);
				})
				.attr("cy", function(d) {
					if(isNaN(d[Object.keys(d)[0]].Value)){
						d3.select(this).remove();
					}
					else{
						return yScale(d[Object.keys(d)[0]].Value);
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
						.style('top', (absoluteMousePos[1]+padding)+'px')
						.style('position', 'absolute') 
						.style('z-index', 1001);
					var tooltipText = "<p id='tooltip_p'>" + d[Object.keys(d)[0]].Value + "</p>";
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
					return yScale(parseFloat(d[Object.keys(d)[0]].Value)); 
				})
				.interpolate("linear");
				
			var pathMen = svg.append("path")
				.attr("d", function(){
					var men = [];
					for (var i=0;i<array.length;i++){
						if(array[i][Object.keys(array[i])[0]].sexo == "Males"){
							men.push(array[i]);
						}
					}
					return lineFunction(men);
				})
				.attr("stroke", "blue")
				.attr("stroke-width", 0.5)
				.attr("fill", "none");
				
			var pathWomen = svg.append("path")
				.attr("d", function(){
					var women = [];
					for (var i=0;i<array.length;i++){
						if(array[i][Object.keys(array[i])[0]].sexo == "Females"){
							women.push(array[i]);
						}							
					}
					return lineFunction(women);
				})
				.attr("stroke", "pink")
				.attr("stroke-width", 0.5)
				.attr("fill", "none");

			d3.select(el[0].children[0]).selectAll("#selectStacked").remove();
			
			var select = d3.select(el[0].children[0])
				.append("select")
				.attr("id","selectStacked")
				.attr("class","mySelect");
				
			var select = d3.select("#selectStacked");
			
			var options = select.selectAll("option")
				.data(scope.$parent.activities)
				.enter()
				.append("option")
				.attr("class","options")
				.attr("value",function(d){
					return d;
				})
				.each(function(d){
					if(d == scope.activity) d3.select(this).attr("selected","selected");
				})
				.text(function(d){
					return d;
				});
				
			select
				.on("change",function(){
					scope.$apply(function(){
						var value = $("#selectStacked").val();
						scope.activity = value;
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
				
				scope.actual = scope.$parent.year;
				
				scope.value = '0';
				
				scope.$parent.$watchGroup(['education','year'], function(){
					drawMap(scope,el,scope.$parent.datos,$compile);
				});
			}
		});
		
		function drawMap(scope, el, datos, $compile){
			d3.select(el[0]).selectAll("svg").remove();
			
			var nElem = 0;
			var width = el.width()-50,
				height = el.width()-140;
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
					var dicc = {};
					dicc["Males"] = parseFloat(data[key]["Males"][scope.$parent.year][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
					dicc["Females"] = parseFloat(data[key]["Females"][scope.$parent.year][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
					initialValues[key] = dicc;
				}
			}
			
			svg.selectAll(".subunits")
				.data(topojson.feature(europe, europe.objects.regions).features.filter(function(d){
					if(d.properties.NUTS_ID.length == 2){
						return true;
					}
					else return false;
				}))
				.enter().append("path")
				.attr("d", path)
				.attr("class",function(d){
					for (key in data){
						if (dic[key] == d.properties.NUTS_ID.substring(0,2))return "subunit " + key;
					}
				})
				.style("fill", function(d){
					for (key in data){
						if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
							var men = parseFloat(data[key]["Males"][scope.$parent.year][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
							var women = parseFloat(data[key]["Females"][scope.$parent.year][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
							var total = men + women;
							var tono = ((men-women)/total)*100;
							if(tono<0){
								if(tono>-2){
									return "#F2DFE1"
								}
								else if (tono>-4){
									return "#EC9F94"
								}
								else{
									return "#DA6068";
								}
							}
							else if (tono>0){
								if(tono<10){
									return "#E9F2F5"
								}
								else if (tono<20){
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
				
			button
				.on("click",function(){
					scope.$apply(function(){
						scope.actual = scope.$parent.year;
					});
					var subunits = svg.selectAll(".subunit");
					/*subunits
						.style("fill", "#F2F2F2");*/
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
								var men = parseFloat(data[key]["Males"][scope.$parent.years[1]][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
								var women = parseFloat(data[key]["Females"][scope.$parent.years[1]][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
								var total = men + women;
								var tono = ((men-women)/total)*100;
							
								if(isNaN(tono)){
									return d3.select(this).style("fill");
								}
								else{
									if(tono<0){
										if(tono>-2){
											return "#F2DFE1"
										}
										else if (tono>-4){
											return "#EC9F94"
										}
										else{
											return "#DA6068";
										}
									}
									else if (tono>0){
										if(tono<10){
											return "#E9F2F5"
										}
										else if (tono<20){
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
										scope.actual = scope.$parent.year;
									});
								});
							i_year++;
						}
						else{
							d3.select(this).transition()
								.duration(1000) // this is 1s
								.delay(300)
								.each("end",repeatYear);
							scope.actual = scope.$parent.years[i_year];
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
										var men = parseFloat(data[key]["Males"][scope.$parent.year][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
										var women = parseFloat(data[key]["Females"][scope.$parent.year][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
										var total = men + women;
										var tono = ((men-women)/total)*100;
										if(isNaN(tono)){
											return d3.select(this).style("fill");
										}
										else{
											if(tono<0){
												if(tono>-2){
													return "#F2DFE1"
												}
												else if (tono>-4){
													return "#EC9F94"
												}
												else{
													return "#DA6068";
												}
											}
											else if (tono>0){
												if(tono<10){
													return "#E9F2F5"
												}
												else if (tono<20){
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
							.delay(5000);
						j_pais++;
					}
					else{
						d3.select(this).transition()
							.style("fill",function(d){
								for(key in data){
									if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
										var men = parseFloat(data[key]["Males"][scope.$parent.years[i_pais]][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
										var women = parseFloat(data[key]["Females"][scope.$parent.years[i_pais]][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
										var total = men + women;
										var tono = ((men-women)/total)*100;
										if(isNaN(tono)){
											return d3.select(this).style("fill");
										}
										else{
											if(tono<0){
												if(tono>-2){
													return "#F2DFE1"
												}
												else if (tono>-4){
													return "#EC9F94"
												}
												else{
													return "#DA6068";
												}
											}
											else if (tono>0){
												if(tono<10){
													return "#E9F2F5"
												}
												else if (tono<20){
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
			
			var h_leyenda = height/13;
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
				.attr("height", h_leyenda/5)
				.attr("id","lowest")
				.attr("fill", "#DA6068");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/5)
				.attr("id","low_mid")
				.attr("fill", "#EC9F94");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*2)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/5)
				.attr("id","low")
				.attr("fill", "#F2DFE1");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*3)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/5)
				.attr("id","nothing")
				.attr("fill", "#F2F2F2");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*4)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/5)
				.attr("id","hight")
				.attr("fill", "#E9F2F5");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*5)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/5)
				.attr("id","high_mid")
				.attr("fill", "#93B8C3");
			svg_leyenda
				.append("rect")
				.attr("x",w_rect*6)
				.attr("y",0)
				.attr("width", w_rect)
				.attr("height", h_leyenda/5)
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
				.attr("y",h_leyenda/2)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/6 + "px";
				})
				.text(">4%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect+w_rect/3)
				.attr("y",h_leyenda/2)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/6 + "px";
				})
				.text(">2%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*2+w_rect/3)
				.attr("y",h_leyenda/2)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/6 + "px";
				})
				.text(">0%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*3+w_rect/3)
				.attr("y",h_leyenda/2)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/6 + "px";
				})
				.text("0%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*4+w_rect/3)
				.attr("y",h_leyenda/2)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/6 + "px";
				})
				.text(">10%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*5+w_rect/3)
				.attr("y",h_leyenda/2)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/6 + "px";
				})
				.text(">20%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*6+w_rect/3)
				.attr("y",h_leyenda/2)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/6 + "px";
				})
				.text(">30%");
			svg_leyenda
				.append("text")
				.attr("x",w_rect+w_rect/3)
				.attr("y",h_leyenda)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/3 + "px";
				})
				.text("Females");
			svg_leyenda
				.append("text")
				.attr("x",w_rect*4.5+w_rect/3)
				.attr("y",h_leyenda)
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return h_leyenda/3 + "px";
				})
				.text("Males");
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
			
				scope.value = '0';
				
				scope.activity = "Total";
				
				scope.$parent.$watchGroup(['year','education'], function(){
					drawChart(scope,el,scope.$parent.datos);
				});
				
				scope.$watch('activity', function(){
					drawChart(scope,el,scope.$parent.datos);
				})
				
			}
		});
		
		function drawChart(scope, el, datos){
			
			d3.select(el[0]).selectAll("svg").remove();
				
			var w = el.width()-50,
				h = el.width()-125;
				
			var padding = el.width()/10;
			
			var h_rect = h/2;
			var w_leyenda = w/20;
			
			var svg_leyenda = d3.select(el[0].children[1])
				.append("svg")
				.attr("width", w_leyenda+padding/10)
				.attr("height", h)
				.attr("class","leyenda_bars");
			
			svg_leyenda
				.append("rect")
				.attr("x",padding/3)
				.attr("y",0)
				.attr("width", w_leyenda/4)
				.attr("height", h_rect)
				.attr("fill", "#3F7F93");			
			svg_leyenda
				.append("rect")
				.attr("x",padding/3)
				.attr("y",h_rect)
				.attr("width", w_leyenda/4)
				.attr("height", h_rect)
				.attr("fill", "#DA6068");
				
			svg_leyenda
				.append("text")
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return w_leyenda/2 + "px";
				})
				.attr("transform","translate("+padding/4+","+h_rect+") rotate(-90)")
				.text("Males");
			svg_leyenda
				.append("text")
				.attr("class","desc_leyenda")
				.style("font-size",function(d){
					return w_leyenda/2 + "px";
				})
				.attr("transform","translate("+padding/4+","+h_rect*2+") rotate(-90)")
				.text("Females");
				
			var data = datos[scope.$parent.pais];
			
			var values = [];
			var allValues = [];
			for (sector in data){
				if(sector == scope.$parent.sectors[0]){
					for (year in data[sector]){
						var v = {};
						v["year"] = year;
						v["sector"] = sector;
						v["value"] = parseFloat(data[sector][year][scope.value]["Value"].replace(/,/g,''));
						allValues.push(v);
					}
				}
				else{
					var element = []
					for (year in data[sector]){
						var v = {};
						v["year"] = year;
						v["sector"] = sector;
						v["value"] = parseFloat(data[sector][year][scope.value]["Value"].replace(/,/g,''));
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
				.range([0, w - padding*2]);
				
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.ticks(10)
				.tickFormat(function(d){
					return d.toString().substring(2);
				});
				
			var svg = d3.select(el[0].children[1])
				.append("svg")
				.attr("width", w-padding)
				.attr("height", h+h/5)
				.attr("class","stacked")
				.attr("id","stacked-char");
			
			svg
				.append("g")
				.attr("class", "axis")
				.attr("transform", "translate("+padding/3+","+(h+h/5-padding/1.2)+")")
				.attr("fill","black")
				.call(xAxis);
			
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
				.attr("width", (w-padding)/(scope.$parent.years.length+3))
				.attr("height", function(d) {
					var maximum;
					var year = d.year;
					for (var i=0;i<allValues.length;i++){
						if(allValues[i].year == year){
							maximum = allValues[i].value;
						}
					}
					var value = d.value;
					return ((value/maximum)*h);
				});
		}
	};
	
	return {
		link: link,
		restrict: 'AE',
		scope: true
	};
});