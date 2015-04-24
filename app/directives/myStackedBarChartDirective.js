angular.module('visualDataApp.directives.myStackedBarChartDirective',[])
	.directive('myStackedBar',function(){
		function link(scope,el,attr){
			scope.$parent.$watch('employment',function(){
				if(typeof scope.$parent.employment !== "undefined"){	
				
					var d = [];
					d.push(scope.$parent.employment);
					
					scope.years = defineYears(d);
					scope.value = '0';
					scope.activity = "Total";
					
					
					scope.$parent.$watchGroup(['education','pais'], function(){
						drawChart(scope,el,scope.$parent.employment);
					});
					
					scope.$watch('activity', function(){
						drawChart(scope,el,scope.$parent.employment);
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
				for (sexo in data){
					if(sexo == scope.$parent.sexos[0]){
						for (year in data[sexo]){
							var v = {};
							v["year"] = year;
							v["value"] = parseFloat(data[sexo][year][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''));
							allValues.push(v);
						}
					}
					else{
						var element = []
						for (year in data[sexo]){
							var v = {};
							v["year"] = year;
							v["sexo"] = sexo;
							v["value"] = parseFloat(data[sexo][year][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''));
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
					.domain([scope.years[0], scope.years[scope.years.length-1]])
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
						return "bar" + " " + d.sexo;
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
						if(contador%(scope.$parent.sexos.length-1)==0){
							anterior = 0;
						}
						else{
							anterior = (anterior+(value/maximum)*h);
						}
						contador++;
						return a;
					})
					.attr("width", (w-padding)/(scope.years.length+3))
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