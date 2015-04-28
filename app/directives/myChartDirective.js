angular.module('visualDataApp.directives.myChartDirective',[])
	.directive('myChart',function(){
		function link(scope,el,attr){
			scope.$parent.$watch('employment',function(){
				if(typeof scope.$parent.employment !== "undefined"){
					
					var d = [];
					d.push(scope.$parent.employment);
					
					scope.years = defineYears(d);
					scope.value = '0';
					scope.activity = "Total";
		
					scope.$parent.$watchGroup(['pais','education'], function(){
						drawChart(scope,el,scope.$parent.employment);
					});
					
					scope.$watch('activity',function(){
						drawChart(scope,el,scope.$parent.employment);
					});
				}
			});
			
			function drawChart(scope, el, datos){
				
				d3.select(el[0]).selectAll("svg").remove();
				
				var w = el.width()-el.width()/10,
					h = el.width()-el.width()/4;
					
				var padding = 30;
				var formatBigNumbers = d3.format(".1s");
				var data = datos[scope.$parent.pais];
				
				/* Valores para dominio ejes */
				var values = [];
				for (sexo in scope.$parent.sexos){
					if(scope.$parent.sexos[sexo]!="Total"){
						for (year in scope.years){
							values.push(parseFloat(data[scope.$parent.sexos[sexo]][scope.years[year]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,'')));
						}
					}
				}

				var xScale = d3.scale.linear()
					.domain([scope.years[0], scope.years[scope.years.length-1]])
					.range([padding+padding/2, w - padding]);
				
				var yScale = d3.scale.linear()
					.domain([0, d3.max(values)])
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
						return d/1000 + "M";
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
					.attr("transform", "translate("+(padding+padding/2)+",0)")
					.attr("fill","black")
					.call(yAxis); 
				
				/* Valores para mostrar */
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
					.style("cursor","auto")
					.attr("fill",function(d){
							if(d[Object.keys(d)[0]].sexo == "Males") return "#3F7F93";
							else return "#DA6068"
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
							.style('top', (absoluteMousePos[1])+'px')
							.style('position', 'absolute') 
							.style('z-index', 1001);
						var tooltipText = "<h3>"+d[Object.keys(d)[0]].sexo+"</h3><table><tr><td>Employees:</td><td>"+(d[Object.keys(d)[0]].Value/1000).toFixed(2)+"M</td></tr></table>";
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
							if(array[i][Object.keys(array[i])[0]].sexo == "Males" && !isNaN(array[i][Object.keys(array[i])[0]].Value)){
								men.push(array[i]);
							}
						}
						return lineFunction(men);
					})
					.attr("stroke", "#3F7F93")
					.attr("stroke-width", 0.5)
					.attr("fill", "none");
					
				var pathWomen = svg.append("path")
					.attr("d", function(){
						var women = [];
						for (var i=0;i<array.length;i++){
							if(array[i][Object.keys(array[i])[0]].sexo == "Females" && !isNaN(array[i][Object.keys(array[i])[0]].Value)){
								women.push(array[i]);
							}							
						}
						return lineFunction(women);
					})
					.attr("stroke", "#DA6068")
					.attr("stroke-width", 0.5)
					.attr("fill", "none");

				d3.select(el[0].children[0]).selectAll("#selectChart").remove();
				
				var select = d3.select(el[0].children[0])
					.append("select")
					.attr("id","selectChart")
					.attr("class","mySelect");
					
				var select = d3.select("#selectChart");
				
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
							var value = $("#selectChart").val();
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