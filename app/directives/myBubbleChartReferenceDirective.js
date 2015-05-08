angular.module('visualDataApp.directives.myBubbleChartReferenceDirective',[])
	.directive('myBubbleChartReference',function(){
		function link(scope,el,attr){
			scope.$parent.$watch('employment',function(){
				if(typeof scope.$parent.employment !== "undefined"){
					
					// definir years de actuacion;
					var d = [];
					d.push(scope.$parent.employment);
					d.push(scope.$parent.educationLevel);
					d.push(scope.$parent.salaryTotal);
					d.push(scope.$parent.salary);
					d.push(scope.$parent.population);
					
					scope.years = defineYears(d);
					scope.inicial = scope.years[0];
					scope.actual = scope.inicial;
					scope.activity = "Total";
					
					scope.value = '0';
					scope.mostrar = "Females";
					
					scope.$parent.$watchGroup(['education','pais'], function(){
						drawChart(scope,el);
					});
					
					scope.$watch('mostrar', function(){
						drawChart(scope,el);
					});
				}
			});
		
			function drawChart(scope, el){
				
				var population = scope.$parent.population;
				var educationLevel = scope.$parent.educationLevel;
				var employment = scope.$parent.employment;
				var salary = scope.$parent.salary;
				var education = scope.$parent.education;
				var salaryTotal = scope.$parent.salaryTotal;
				
				d3.select(el[0]).selectAll("svg").remove();
				
				var w = el.width()-el.width()/10,
					h = el.width()-el.width()/6.5;
					
				var padding = el.width()/10;
				
				var nElem = 0;
				var i_circle,j_circle, i_year;
				var formatBigNumbers = d3.format(".1s");
				//var color = d3.scale.category20c();
				
				//var data = datos;

				var dic = scope.$parent.diccEurope;
				var tooltip;
				
				// definir rango de actuacion --> min and max de componentes
				var years = scope.years;
				
				/* definir valores */
				var sexos = scope.$parent.sexos.slice(1);
				var total = scope.$parent.sexos[0];
				
				var mapEducation = mappingEducation(education);
				
				var initialValues = [];	
				for (var i=0;i<sexos.length;i++){
					var diccV = {};
					var diccY = {};
					for (var j=0;j<years.length;j++){
						dicc = {};
						if(mapEducation==-1){
							dicc["salary"] = parseFloat(salaryTotal[scope.$parent.pais][sexos[i]][years[j]][scope.value]["Value"].replace(/,/g,''));
							var pop = parseFloat(population[scope.$parent.pais][sexos[i]][years[j]][scope.value]["Value"].replace(/,/g,''));
							dicc["population"] = pop;
							var employ = ((parseFloat(employment[scope.$parent.pais][sexos[i]][years[j]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''))*1000)/pop)*100;
							dicc["employment"] = employ;
						}
						else{
							var se = mappingSalary(mapEducation);
							dicc["salary"] = parseFloat(salary[scope.$parent.pais][sexos[i]][years[j]][se][scope.value]["Value"].replace(/,/g,''));
							var perc_pop = parseFloat(educationLevel[scope.$parent.pais][sexos[i]][years[j]][mapEducation.toString()]["Value"].replace(/,/g,''));
							var pop = parseFloat(population[scope.$parent.pais][sexos[i]][years[j]][scope.value]["Value"].replace(/,/g,''));
							var perc = pop*perc_pop/100;
							dicc["population"] = perc;
							var employ = ((parseFloat(employment[scope.$parent.pais][sexos[i]][years[j]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''))*1000)/perc)*100;
							dicc["employment"] = employ;
						}
						diccY[years[j]] = dicc;
					}
					diccV[sexos[i]] = diccY;
					diccV["pais"] = scope.$parent.pais;
					initialValues.push(diccV);
				}	
				
				scope.actual = years[0];
				
				var svg = d3.select(el[0].children[1])
					.append("svg")
					.attr("id","bubble-europe")
					.attr("width", w)
					.attr("height", h)
				
				
				var pobValues = [];
				var salaryValues = [];
				var empValues = [];
				
				for (var j=0;j<years.length;j++){
					if(scope.mostrar == "Females"){
						salaryValues.push(initialValues[0][sexos[0]][years[j]]["salary"]);
						empValues.push(initialValues[0][sexos[0]][years[j]]["employment"]);
					}
					else{
						salaryValues.push(initialValues[1][sexos[1]][years[j]]["salary"]);
						empValues.push(initialValues[1][sexos[1]][years[j]]["employment"]);
					}
					
					var pob = initialValues[1][sexos[1]][years[j]]["population"] + initialValues[0][sexos[0]][years[j]]["population"];
					pobValues.push(pob);
				}
				
				var xScale = d3.scale.linear()
					.domain([d3.mean(salaryValues)-d3.mean(salaryValues)/1.5, d3.mean(salaryValues)+d3.mean(salaryValues)/1.5])
					.range([padding, w - padding]);
				var yScale = d3.scale.linear()
					.domain([d3.mean(empValues)-d3.mean(empValues)/1.5, d3.mean(empValues)+d3.mean(empValues)/1.5])
					.range([h-padding, padding/2]);
				var rScale = d3.scale.linear()
					.domain([0, d3.max(pobValues)])
					.range([5, 30]);
				
				var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.ticks(4);
					
				var yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left")
					.tickFormat(function(d){
						return Math.trunc(d);
					})
					.ticks(4);
					
				var lineDataX = [{"x":d3.mean(salaryValues)-d3.mean(salaryValues)/1.5, "y":d3.mean(empValues)},{"x":d3.mean(salaryValues)+d3.mean(salaryValues)/1.5,"y":d3.mean(empValues)}];
				
				var lineDataY = [{"x":d3.mean(salaryValues), "y":d3.mean(empValues)-d3.mean(empValues)/1.5},{"x":d3.mean(salaryValues),"y":d3.mean(empValues)+d3.mean(empValues)/1.5}];
				
				var lineFunction = d3.svg.line()
					.x (function(d){
						return xScale(d.x);
					})
					.y (function(d){
						return yScale(d.y);
					})
					.interpolate("linear");
					
				var linepath = svg.append("path")
					.attr("class", function(d){
						if (scope.mostrar == "Females"){
							return "axis-males";
						}
						else return "axis-females";
					})
					.attr("d",lineFunction(lineDataX))
					.attr("stroke-width",0.5)
					.attr("fill","none");
					
				var linepath2 = svg.append("path")
					.attr("class", function(d){
						if (scope.mostrar == "Females"){
							return "axis-males";
						}
						else return "axis-females";
					})
					.attr("d",lineFunction(lineDataY))
					.attr("stroke-width",0.5)
					.attr("fill","none");
					
				var circles = svg.selectAll("circle")
					.data(initialValues)
					.enter()
					.append("circle")
					.filter(function (d){
						return Object.keys(d)[0] == scope.mostrar;
					})
					.attr("class",function (d){
						return "cercle " + Object.keys(d)[0];
					})
					.each(function(){
						nElem++;
					})
					.attr("cx", function(d) {
						return xScale(d[Object.keys(d)[0]][scope.inicial]['salary']);
					})
					.attr("cy", function(d) {
						return yScale(d[Object.keys(d)[0]][scope.inicial]['employment']);
					})
					.attr("r", function(d) {
						return rScale(d[Object.keys(d)[0]][scope.inicial]['population']);
					})
					.style("visibility",function(d){
						if(isNaN(d[Object.keys(d)[0]][scope.inicial]['employment']) || isNaN(d[Object.keys(d)[0]][scope.inicial]['salary']) || isNaN(d[Object.keys(d)[0]][scope.inicial]['population']))
							return "hidden";
						else return "visible";
					})
					.on("mouseover",function(d){
						var cr = d3.select(this);
						cr
							.style("stroke","black")
							.style("opacity",0.5);
						d3.selectAll('#tooltip-reference').remove();
						tooltip = d3.select(el[0].children[1])
							.append("div")
							.attr("class", "tooltip-data")
							.attr("id", "tooltip-reference");
						var absoluteMousePos = d3.mouse(this);
						tooltip
							.style('left', (absoluteMousePos[0])+'px')
							.style('top', (absoluteMousePos[1])+'px')
							.style('position', 'absolute') 
							.style('z-index', 1001);
						var tooltipText = "<h3>"+scope.$parent.pais.split('(')[0]+"</h3><table><tr><td>Salary:</td><td>"+d[Object.keys(d)[0]][scope.actual].salary+"€</td></tr><tr><td>Employment:</td><td>"+Math.round(d[Object.keys(d)[0]][scope.actual].employment)+"%</td></tr></table>";
						tooltip
							.html(tooltipText);
							
						var lineData = [{"x":d3.mean(salaryValues)-d3.mean(salaryValues)/1.5,"y":d[Object.keys(d)[0]][scope.actual].employment},{"x":d[Object.keys(d)[0]][scope.actual].salary,"y":d[Object.keys(d)[0]][scope.actual].employment},{"x":d[Object.keys(d)[0]][scope.actual].salary,"y":d3.mean(empValues)-d3.mean(empValues)/1.5}];
						
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
							.attr("fill","none");
					})
					.on("mouseleave",function(d){
						var linepath = svg.selectAll(".mousepath").remove();
						var cr = d3.select(this);
						cr
							.style("opacity",1)
							.style("stroke","");
						tooltip.remove();
					});
				
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
			  
				svg
					.append("text")
					.attr("text-anchor", "middle") 
					.attr("transform", "translate("+ (padding/4) +","+(h/2)+")rotate(-90)") 
					.attr("font-size", "10px")
					.attr("fill","black")
					.text("Employment in %");

				svg
					.append("text")
					.attr("text-anchor", "middle")  
					.attr("transform", "translate("+((padding+w)/2.3)+","+(h-(padding/4))+")")
					.attr("font-size", "10px")
					.attr("fill","black")
					.text("Salary");
					
				d3.select(el[0].children[0]).selectAll(".myButton").remove();
				
				var button = d3.select(el[0].children[0])
					.append("button")
					.attr("class","myButton");
					
				button
					.on("click",function(){
						scope.$apply(function(){
							scope.actual = scope.inicial;
						});
						transitions();
					});
				
				svg.append("text")
					.attr("id","year");
				
				function transitions(){
					var circles = svg.selectAll("circle")
						.filter(function (d){
							return Object.keys(d)[0] == scope.mostrar;
						});
						
					var year = svg.select("#year");
						
					i_circle = 2;
					i_year = 1;
					j_circle = 2 * nElem;
					
					circles.transition()
						.attr("cx", function(d) {
							return xScale(d[Object.keys(d)[0]][years[1]]['salary']);
						})
						.attr("cy", function(d) {
							return yScale(d[Object.keys(d)[0]][years[1]]['employment']);
						})
						.attr("r", function(d) {
							return rScale(d[Object.keys(d)[0]][years[1]]['population']);
						})
						.style("visibility",function(d){
							if(isNaN(d[Object.keys(d)[0]][years[1]]['employment']) || isNaN(d[Object.keys(d)[0]][years[1]]['salary']) || isNaN(d[Object.keys(d)[0]][years[1]]['population']))
								return "hidden";
							else return "visible";
						})
						.duration(2000)
						.delay(0)
						.each("end",repeatCircles);
						
					year.transition()
						.duration(2000)
						.delay(0)
						.each("end",repeatYear);
				}
				
				function repeatCircles(){
					i_circle = parseInt(j_circle/nElem);
					if(i_circle<years.length+1){
						if(i_circle!=years.length){
							d3.select(this).transition()
								.attr("cx", function(d) {
									return xScale(d[Object.keys(d)[0]][years[i_circle]]['salary']);
								})
								.attr("cy", function(d) {
									return yScale(d[Object.keys(d)[0]][years[i_circle]]['employment']);
								})
								.attr("r", function(d) {
									return rScale(d[Object.keys(d)[0]][years[i_circle]]['population']);
								})
								.style("visibility",function(d){
									if(isNaN(d[Object.keys(d)[0]][years[i_circle]]['employment']) || isNaN(d[Object.keys(d)[0]][years[i_circle]]['salary']) || isNaN(d[Object.keys(d)[0]][years[i_circle]]['population']))
										return "hidden";
									else return "visible";
								})
								.duration(2000)
								.delay(0)
								.each("end",repeatCircles);
							j_circle++;
						}
					}
				}
				
				function repeatYear(){
					scope.$apply (function(){
						if(i_year<years.length+1){
							if(i_year!=years.length){
								d3.select(this).transition()
									.duration(2000) // this is 1s
									.delay(0)
									.each("end",repeatYear);
								scope.actual = years[i_year];
								i_year++;
							}
						}
					});
				}
				
				d3.select(el[0].children[0]).selectAll("#selectBubble").remove();
				
				var select = d3.select(el[0].children[0])
					.append("select")
					.attr("id","selectBubble")
					.attr("class","mySelect");
					
				var select = d3.select("#selectBubble");
				
				var options = select.selectAll("option")
					.data(sexos)
					.enter()
					.append("option")
					.attr("class","options")
					.attr("value",function(d){
						return d;
					})
					.each(function(d){
						if(d == scope.mostrar) d3.select(this).attr("selected","selected");
					})
					.text(function(d){
						return d;
					});
					
				select
					.on("change",function(){
						scope.$apply(function(){
							var value = $("#selectBubble").val();
							scope.mostrar = value;
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