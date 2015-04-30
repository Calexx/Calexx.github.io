angular.module('visualDataApp.directives.myBubbleChartSexDirective',[])
	.directive('myBubbleChartSex',function(){
		function link(scope,el,attr){
			scope.$parent.$watch('employment',function(){
				if(typeof scope.$parent.employment !== "undefined"){
					
					var d = [];
					d.push(scope.$parent.population);
					d.push(scope.$parent.pib);
					d.push(scope.$parent.salary);
					d.push(scope.$parent.salaryTotal);
					
					scope.years = defineYears(d);
					scope.inicial = scope.years[0];
					scope.actual = scope.inicial;
					
					scope.value = '0';
					scope.sex = attr.sex;
					
					scope.$parent.$watch('education', function(){
						drawChart(scope,el);
					});
				}
			});
			
			function drawChart(scope, el){
				
				var population = scope.$parent.population;
				var pib = scope.$parent.pib;
				var salary = scope.$parent.salary;
				var salaryTotal = scope.$parent.salaryTotal;
				var education = scope.$parent.education;
				
				d3.select(el[0]).selectAll("svg").remove();
				
				var w = el.width()-el.width()/10,
					h = el.width()-el.width()/1.5;
					
				//var padding_v = el.height()/5;
				//var padding_h = el.width()/15;
				var padding = 20;
				
				var nElem = 0;
				var i_circle,j_circle, i_year;
				var formatBigNumbers = d3.format(".1s");
				var color = d3.scale.category20c();
				
				//var data = datos;

				var dic = scope.$parent.diccEurope;
				var tooltip;
				
				var mapEducation = mappingEducation(education);
				
				// definir rango de actuacion --> min and max de componentes
				var years = scope.years;
				
				/* definir valores */
				var initialValues = [];
				var paisosDic = {};			
				for (pais in dic){
					var paisosDic = {};
					var diccc = {};
					for (var j=0;j<years.length;j++){
						var dicc = {};
						dicc["pib"] = parseFloat(pib[pais][Object.keys(pib[pais])[0]][years[j]][scope.value]["Value"].replace(/,/g,''));
						dicc["population"] = parseFloat(population[pais][scope.sex][years[j]][scope.value]["Value"].replace(/,/g,''));
						if(mapEducation==-1){
							dicc["salary"] = parseFloat(salaryTotal[pais][scope.sex][years[j]][scope.value]["Value"].replace(/,/g,''));
						}
						else{
							var se = mappingSalary(mapEducation);
							dicc["salary"] = parseFloat(salary[pais][scope.sex][years[j]][se][scope.value]["Value"].replace(/,/g,''));
						}
						diccc[years[j]] = dicc;
					}
					paisosDic[pais] = diccc;
					initialValues.push(paisosDic);
				}	

				var i = [];
				
				for (val in initialValues){
					for (year in years){
						if (isNaN(initialValues[val][Object.keys(initialValues[val])[0]][years[year]].salary)){
							var r = interpolateX(initialValues[val][Object.keys(initialValues[val])[0]],year);
							if(r == "error"){
								delete initialValues[val];
							}
							else{
								initialValues[val][Object.keys(initialValues[val])[0]][years[year]].salary = r;
							}
						}
						if (isNaN(initialValues[val][Object.keys(initialValues[val])[0]][years[year]].pib)){
							var r = interpolateY(initialValues[val][Object.keys(initialValues[val])[0]],year);
							if(r == "error"){
								if(!_.contains(i, val)){
									i.push(val);
								}
							}
							else{
								initialValues[val][Object.keys(initialValues[val])[0]][years[year]].pib = r;
							}
						}
						if (isNaN(initialValues[val][Object.keys(initialValues[val])[0]][years[year]].population)){
							var r = interpolateR(initialValues[val][Object.keys(initialValues[val])[0]],year);
							if(r == "error"){
								delete initialValues[val];
							}
							else{
								initialValues[val][Object.keys(initialValues[val])[0]][years[year]]["population"] = r;
								
							}
						}
					}
				}
				
				for (elim in i){
					delete initialValues[i[elim]];
				}

				var undef;
				for (var i=0; i < initialValues.length; i++) {
					if (initialValues[i] === undef ) {
						initialValues.splice(i,1);
						i--;
					}
				}
				
				scope.actual = years[0];
				
				var svg = d3.select(el[0].children[1])
					.append("svg")
					.attr("id","bubble-europe")
					.attr("width", w)
					.attr("height", h)
				
				
				/* Definir dominio ejes */
				var salaryValues = [];
				var pobValues = [];
				var values = [];
				
				for (pais in dic){
					for (var j=0;j<years.length;j++){
						pobValues.push(parseFloat(population[pais]["Total"][years[j]][scope.value]["Value"].replace(/,/g,'')));
						salaryValues.push(parseFloat(salaryTotal[pais]["Total"][years[j]][scope.value]["Value"].replace(/,/g,'')));
						values.push(parseFloat(pib[pais][Object.keys(pib[pais])[0]][years[j]][scope.value]["Value"].replace(/,/g,'')));
					}
				}
				
				var xScale = d3.scale.linear()
					.domain([0, d3.max(salaryValues)+d3.min(salaryValues)])
					.range([padding*2.3, w - padding/2]);
				var yScale = d3.scale.linear()
					.domain([0, d3.max(values)])
					.range([h-padding*1.5, padding/2]);
				var rScale = d3.scale.linear()
					.domain([d3.min(pobValues), d3.max(pobValues)])
					.range([3, 18]);
				
				var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.ticks(5);
					
				var yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left")
					.tickFormat(function(d){
						return d/1000 + 'M';
					})
					.ticks(4);
					
				//var lineData = [{"x":0, "y":0},{"x":d3.max(salaryValues),"y":d3.max(values)}];
				
				var circles = svg.selectAll("circle")
					.data(initialValues)
					.enter()
					.append("circle")
					.style("opacity",0.8)
					.style("cursor","pointer")
					.attr("fill",function(d,i){
						return color(i);
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
						return yScale(d[Object.keys(d)[0]][scope.inicial]['pib']);
					})
					.attr("r", function(d) {
						return rScale(d[Object.keys(d)[0]][scope.inicial]['population']);
					})
					
					.on("mouseover",function(d){
						d3.selectAll('#tooltip-chart-sex').remove();
						tooltip = d3.select(el[0].children[1])
							.append("div")
							.attr("class", "tooltip-data")
							.attr("id","tooltip-chart-sex");
						var cr = d3.select(this);
						cr
							.style("stroke","black")
							.style("opacity",1);
						var absoluteMousePos = d3.mouse(this);
						tooltip
							.style('left', (absoluteMousePos[0]+padding*3)+'px')
							.style('top', (absoluteMousePos[1])+'px')
							.style('position', 'absolute') 
							.style('z-index', 1001);
						var tooltipText = "<h3>"+Object.keys(d)[0].split('(')[0]+"</h3><table><tr><td>Salary:</td><td>"+d[Object.keys(d)[0]][scope.actual].salary+"€</td></tr><tr><td>GDP:</td><td>"+d[Object.keys(d)[0]][scope.actual].pib/1000+"M</td></tr></table>";

						tooltip
							.html(tooltipText);
						
						var lineData = [{"x":0,"y":d[Object.keys(d)[0]][scope.actual].pib},{"x":d[Object.keys(d)[0]][scope.actual].salary,"y":d[Object.keys(d)[0]][scope.actual].pib},{"x":d[Object.keys(d)[0]][scope.actual].salary,"y":0}];
						
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
							.style("opacity",0.8)
							.style("stroke","");
						tooltip.remove();
					})
					
					.on("click",function(d){
						scope.$apply(function(){
							scope.$parent.pais = Object.keys(d)[0];
						});
					});
				
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
			  
				svg
					.append("text")
					.attr("text-anchor", "middle") 
					.attr("transform", "translate("+ (padding/2) +","+(h/2)+")rotate(-90)") 
					.attr("font-size", "9px")
					.attr("fill","black")
					.text("GDP");

				svg
					.append("text")
					.attr("text-anchor", "middle")  
					.attr("transform", "translate("+((padding+w)/2)+","+(h-(padding/4))+")")
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
					var circles = svg.selectAll("circle");
					var year = svg.select("#year");
						
					i_circle = 2;
					i_year = 1;
					j_circle = 2 * nElem;
					
					circles.transition()
						.attr("cx", function(d) {
							return xScale(d[Object.keys(d)[0]][years[1]]['salary']);
						})
						.attr("cy", function(d) {
							return yScale(d[Object.keys(d)[0]][years[1]]['pib']);
						})
						.attr("r", function(d) {
							return rScale(d[Object.keys(d)[0]][years[1]]['population']);
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
									return yScale(d[Object.keys(d)[0]][years[i_circle]]['pib']);
								})
								.attr("r", function(d) {
									return rScale(d[Object.keys(d)[0]][years[i_circle]]['population']);
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
				
				function interpolateX(values,year){
					if(year==0){
						var r = [];
						for (var i=0;i<years.length && r.length<2;i++){
							if(!isNaN(values[years[i]].salary)){
								r.push(values[years[i]].salary);
							}
						}
						if(r.length==2){
							var r1 = r[0];
							var r2 = r[1];
							return r1+(r1-r2);
						}
						else{
							return "error";
						}
					}
					else if(year==1){
						return values[years[year-1]].salary;
					}
					else{
						var x1 = values[years[year-1]].salary;
						var x2 = values[years[year-2]].salary;
						return x2-(x2-x1);
					}
				}
				
				function interpolateY(values,year){
					if(year==0){
						var r = [];
						for (var i=0;i<years.length && r.length<2;i++){
							if(!isNaN(values[years[i]].pib)){
								r.push(values[years[i]].pib);
							}
						}
						if(r.length==2){
							var r1 = r[0];
							var r2 = r[1];
							return r1+(r1-r2);
						}
						else{
							return "error";
						}
					}
					else if(year==1){
						return values[years[year-1]].pib;
					}
					else{
						var x1 = values[years[year-1]].pib;
						var x2 = values[years[year-2]].pib;
						return x2-(x2-x1);
					}
				}
				
				function interpolateR(values,year){
					if(year==0){
						var r = [];
						for (var i=0;i<years.length && r.length<2;i++){
							if(!isNaN(values[years[i]].population)){
								r.push(values[years[i]].population);
							}
						}
						if(r.length==2){
							var r1 = r[0];
							var r2 = r[1];
							return r1+(r1-r2);
						}
						else{
							return "error";
						}
					}
					else if(year==1){
						return values[years[year-1]].population;
					}
					else{
						var x1 = values[years[year-1]].population;
						var x2 = values[years[year-2]].population;
						return x2-(x2-x1);
					}
				}
			}
		};
		
		return {
			link: link,
			restrict: 'AE',
			scope: true
		};
	});