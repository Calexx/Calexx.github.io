angular.module('visualDataApp.directives.myAreaChartDirective',[])
	.directive('myAreaChart',function(){
		function link(scope,el,attr){
			scope.$parent.$watch('employment',function(){
				if(typeof scope.$parent.employment !== "undefined"){
					
					var d = [];
					d.push(scope.$parent.expenditure);
					d.push(scope.$parent.pib);
					
					scope.years = defineYears(d);
					scope.value = '0';

					scope.$parent.$watch('pais', function(){
						drawChart(scope,el,scope.$parent.expenditure,scope.$parent.pib);
					});
				}
			});
			
			function drawChart(scope, el, expenditure, pib){
				
				d3.select(el[0]).selectAll("svg").remove();
				
				var w = el.width()-el.width()/10,
					h = el.width()-el.width()/1.5;
					
				var padding = 20;
				var formatBigNumbers = d3.format(".1s");
				
				/* Valores para dominio ejes */
				var values = [];
				var valuesPib = [];
				var valuesExpenditure = [];
				
				if (scope.$parent.pais == "European Union (27 countries)"){
					var pais = "European Union (28 countries)";
				}
				else {
					var pais = scope.$parent.pais;
				}
				
				for (year in scope.years){
					valuesPib.push(parseFloat(pib[pais][Object.keys(pib[pais])[0]][scope.years[year]][scope.value]["Value"].replace(/,/g,'')));
					valuesExpenditure.push(parseFloat(expenditure[pais][Object.keys(expenditure[pais])[0]][scope.years[year]][scope.value]["Value"].replace(/,/g,'')));
				}
				
				values.push(valuesPib);
				values.push(valuesExpenditure);
				
				var valuesUnion = unionValues(values);
				
				var xScale = d3.scale.linear()
					.domain([scope.years[0], scope.years[scope.years.length-1]])
					.range([padding*2.3, w - padding/2]);
				
				var yScale = d3.scale.linear()
					.domain([0, d3.max(valuesUnion) + d3.min(valuesUnion)])
					.range([h-padding*1.5, padding/2]);
					
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
						return d/1000 + 'k';
					})
					.ticks(5);
					
				var svg = d3.select(el[0].children[1])
					.append("svg")
					.attr("width", w)
					.attr("height", h)
					.attr("class","graph")
					.attr("id","svg_s"); 
				
				var tooltip;
				
				/* Valores para mostrar */
				var array = [];
				for (year in scope.years){
					var diccionario = {};
					diccionario["expenditure"] = parseFloat(expenditure[pais][Object.keys(expenditure[pais])[0]][scope.years[year]][scope.value]["Value"].replace(/,/g,''));
					diccionario["pib"] = parseFloat(pib[pais][Object.keys(pib[pais])[0]][scope.years[year]][scope.value]["Value"].replace(/,/g,''));
					diccionario["year"] = scope.years[year];
					array.push(diccionario);
				}
				
				var areaExpenditure = d3.svg.area()
					.x(function(d) { return xScale(d.year); })
					.y0(function(d) { return yScale(d.expenditure); })
					.y1(function(d) { return yScale(0)});
				
				var areaPib = d3.svg.area()
					.x(function(d) { return xScale(d.year); })
					.y0(function(d) { return yScale(d.pib); })
					.y1(function(d) { return yScale(0)});				

					
				svg.append("path")
					.datum(array)
					.attr("class", "area-path-pib")
					.attr("d", areaPib)
					.on("mouseover",function(d){
						d3.selectAll('.tooltip').remove();
						tooltip = d3.select(el[0].children[1]).append("div").attr("class", "tooltip");
						var cr = d3.select(this);
						cr
							.style("opacity",0.5);
						var absoluteMousePos = d3.mouse(this);
						tooltip
							.style('left', (absoluteMousePos[0])+'px')
							.style('top', (absoluteMousePos[1]-padding)+'px')
							.style('position', 'absolute') 
							.style('z-index', 1001);
						var tooltipText = "<h3>GDP</h3>";
						tooltip
							.html(tooltipText);
						
						/*var lineData = [{"x":0,"y":d[Object.keys(d)[0]][scope.actual].pib},{"x":d[Object.keys(d)[0]][scope.actual].salary,"y":d[Object.keys(d)[0]][scope.actual].pib},{"x":d[Object.keys(d)[0]][scope.actual].salary,"y":0}];
						
						var lineFunction = d3.svg.line()
							.x (function(d){
								return xScale(d.x);
							})
							.y (function(d){
								return yScale(d.y);
							})
							.interpolate("linear");
					
						var linepath = svg.append("path")
							.attr("class","mousepath")
							.attr("d",lineFunction(lineData))
							.attr("stroke","grey")
							.attr("stroke-width",0.8)
							.attr("fill","none");*/
					})
					
					
					.on("mouseleave",function(d){
						//var linepath = svg.selectAll(".mousepath").remove();
						var cr = d3.select(this);
						cr
							.style("opacity",1)
							.style("stroke","");
						tooltip.remove();
					});
					
				svg.append("path")
					.datum(array)
					.attr("class", "area-path-expenditure")
					.attr("d", areaExpenditure)
					.on("mouseover",function(d){
						d3.selectAll('.tooltip').remove();
						tooltip = d3.select(el[0].children[1]).append("div").attr("class", "tooltip");
						var cr = d3.select(this);
						cr
							.style("opacity",0.5);
						var absoluteMousePos = d3.mouse(this);
						tooltip
							.style('left', (absoluteMousePos[0])+'px')
							.style('top', (absoluteMousePos[1]-padding)+'px')
							.style('position', 'absolute') 
							.style('z-index', 1001);
						var tooltipText = "<h3>Expenditure in education</h3>";
						tooltip
							.html(tooltipText);
						
						/*var lineData = [{"x":0,"y":d[Object.keys(d)[0]][scope.actual].pib},{"x":d[Object.keys(d)[0]][scope.actual].salary,"y":d[Object.keys(d)[0]][scope.actual].pib},{"x":d[Object.keys(d)[0]][scope.actual].salary,"y":0}];
						
						var lineFunction = d3.svg.line()
							.x (function(d){
								return xScale(d.x);
							})
							.y (function(d){
								return yScale(d.y);
							})
							.interpolate("linear");
					
						var linepath = svg.append("path")
							.attr("class","mousepath")
							.attr("d",lineFunction(lineData))
							.attr("stroke","grey")
							.attr("stroke-width",0.8)
							.attr("fill","none");*/
					})
					
					
					.on("mouseleave",function(d){
						//var linepath = svg.selectAll(".mousepath").remove();
						var cr = d3.select(this);
						cr
							.style("opacity",1)
							.style("stroke","");
						tooltip.remove();
					});
					
				svg
					.append("text")
					.attr("text-anchor", "middle") 
					.attr("transform", "translate("+ (padding/2) +","+(h/2)+")rotate(-90)") 
					.attr("font-size", "9px")
					.attr("fill","black")
					.text("value per capita");

				svg
					.append("text")
					.attr("text-anchor", "middle")  
					.attr("transform", "translate("+((padding+w)/2)+","+(h-(padding/4))+")")
					.attr("font-size", "10px")
					.attr("fill","black")
					.text("years");
					
				svg
					.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(0,"+(h-padding*1.5)+")")
					.attr("fill","black")
					.call(xAxis);
				svg
					.append("g")
					.attr("class", "axis")
					.attr("transform", "translate("+padding*2.3+",0)")
					.attr("fill","black")
					.call(yAxis);

			}
		};
		
		return {
			link: link,
			restrict: 'AE',
			scope: true
		};
	});