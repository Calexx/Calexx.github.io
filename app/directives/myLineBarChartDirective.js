angular.module('visualDataApp.directives.myLineBarChartDirective',[])
	.directive('myLineBarChart',function(){
		function link(scope,el,attr){
			scope.$parent.$watch('employment',function(){
				if(typeof scope.$parent.employment !== "undefined"){
					
					var d = [];
					d.push(scope.$parent.expenditure);
					d.push(scope.$parent.employment);
					d.push(scope.$parent.population);
					d.push(scope.$parent.educationLevel);
					
					scope.years = defineYears(d);
					scope.value = '0';
					scope.activity = "Total";
					scope.mostrar = "Females";

					scope.$parent.$watchGroup(['pais','education'], function(){
						drawChart(scope,el,scope.$parent.expenditure,scope.$parent.employment,scope.$parent.population,scope.$parent.educationLevel,scope.$parent.education);
					});
					
					scope.$watch('mostrar', function(){
						drawChart(scope,el,scope.$parent.expenditure,scope.$parent.employment,scope.$parent.population,scope.$parent.educationLevel,scope.$parent.education);
					});
				}
			});
			
			function drawChart(scope, el, expenditure, employment, population, educationLevel, education){
				
				d3.select(el[0]).selectAll("svg").remove();
				
				var w = el.width()-el.width()/10,
					h = el.width()-el.width()/1.5;
					
				var padding = 20;
				var formatBigNumbers = d3.format(".1s");
				var sexos = scope.$parent.sexos.slice(1);
				var years = scope.years;
				
				/* Valores para dominio ejes */
				var valuesMen = [];
				var valuesWomen = [];
				var valuesExpenditure = [];
				
				if (scope.$parent.pais == "European Union (27 countries)"){
					var pais = "European Union (28 countries)";
				}
				else {
					var pais = scope.$parent.pais;
				}
				
				var mapEducation = mappingEducation(education);
				for (year in scope.years){
					valuesExpenditure.push(parseFloat(expenditure[pais][Object.keys(expenditure[pais])[0]][scope.years[year]][scope.value]["Value"].replace(/,/g,'')));
					if(mapEducation==-1){
						var popF = parseFloat(population[scope.$parent.pais][sexos[1]][scope.years[year]][scope.value]["Value"].replace(/,/g,''));
						var employF = ((parseFloat(employment[scope.$parent.pais][sexos[1]][scope.years[year]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''))*1000)/popF)*100;
						valuesWomen.push(employF);
						
						var popM = parseFloat(population[scope.$parent.pais][sexos[0]][scope.years[year]][scope.value]["Value"].replace(/,/g,''));
						var employM = ((parseFloat(employment[scope.$parent.pais][sexos[0]][scope.years[year]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''))*1000)/popM)*100;
						valuesMen.push(employM);
					}
					else{		
						var perc_pop = parseFloat(educationLevel[scope.$parent.pais][sexos[1]][scope.years[year]][mapEducation.toString()]["Value"].replace(/,/g,''));
						var pop = parseFloat(population[scope.$parent.pais][sexos[1]][scope.years[year]][scope.value]["Value"].replace(/,/g,''));
						var perc = pop*perc_pop/100;
						var employ = ((parseFloat(employment[scope.$parent.pais][sexos[1]][scope.years[year]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''))*1000)/perc)*100;
						valuesWomen.push(employ);
						// MEN VALUES
						var perc_popM = parseFloat(educationLevel[scope.$parent.pais][sexos[0]][scope.years[year]][mapEducation.toString()]["Value"].replace(/,/g,''));
						var popM = parseFloat(population[scope.$parent.pais][sexos[0]][scope.years[year]][scope.value]["Value"].replace(/,/g,''));
						var percM = popM*perc_popM/100;
						var employM = ((parseFloat(employment[scope.$parent.pais][sexos[0]][scope.years[year]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''))*1000)/percM)*100;
						valuesMen.push(employM);				
					}
				}
				
				var values = [];
				values.push(valuesMen);
				values.push(valuesWomen);
				var valuesUnion = unionValues(values);
				
				var xScale = d3.scale.linear()
					.domain([scope.years[0]-1, scope.years[scope.years.length-1]])
					.range([padding+padding*0.2, w - padding*3]);
					
				var xScaleExp = d3.scale.linear()
					.domain([scope.years[0], scope.years[scope.years.length-1]])
					.range([padding*2.3, w - padding*2]);
				
				var yScale = d3.scale.linear()
					.domain([0, 60])
					.range([h-padding*1.5, padding/2]);
					
				var yScaleExp = d3.scale.linear()
					.domain([0,d3.max(valuesExpenditure)+d3.min(valuesExpenditure)])
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
					.ticks(5);
					
				var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.tickValues(years)
					.tickFormat(function(d){
						return d.toString().substring(2);
					});
				
				var yAxisExpenditure = d3.svg.axis()
					.scale(yScaleExp)
					.orient("right")
					.tickFormat(function(d){
						return d/1000 + 'k';
					})
					.ticks(4);
					
				var svg = d3.select(el[0].children[1])
					.append("svg")
					.attr("width", w)
					.attr("height", h)
					.attr("class","graph")
					.attr("id","svg_s");
				
				var initialValues = [];
				var initialValuesExp = [];
				for (var j=0;j<years.length;j++){
					diccM = {};
					diccF = {};
					diccExp = {};
					
					// Expenditure
					diccExp["year"] = years[j];
					diccExp["value"] = parseFloat(expenditure[pais][Object.keys(expenditure[pais])[0]][years[j]][scope.value]["Value"].replace(/,/g,''));
					
					// Employment
					if(mapEducation==-1){
						var pop = parseFloat(population[scope.$parent.pais][sexos[1]][years[j]][scope.value]["Value"].replace(/,/g,''));
						var employ = ((parseFloat(employment[scope.$parent.pais][sexos[1]][years[j]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''))*1000)/pop)*100;							
						diccF[sexos[1]] = employ;
						
						var popM = parseFloat(population[scope.$parent.pais][sexos[0]][years[j]][scope.value]["Value"].replace(/,/g,''));
						var employM = ((parseFloat(employment[scope.$parent.pais][sexos[0]][years[j]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''))*1000)/popM)*100;							
						diccM[sexos[0]] = employM;
					
					}
					else{
						var perc_pop = parseFloat(educationLevel[scope.$parent.pais][sexos[1]][years[j]][mapEducation.toString()]["Value"].replace(/,/g,''));
						var pop = parseFloat(population[scope.$parent.pais][sexos[1]][years[j]][scope.value]["Value"].replace(/,/g,''));
						var perc = pop*perc_pop/100;
						var employ = ((parseFloat(employment[scope.$parent.pais][sexos[1]][years[j]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''))*1000)/perc)*100;
						
						diccF[sexos[1]] = employ;
						
						var perc_popM = parseFloat(educationLevel[scope.$parent.pais][sexos[0]][years[j]][mapEducation.toString()]["Value"].replace(/,/g,''));
						var popM = parseFloat(population[scope.$parent.pais][sexos[0]][years[j]][scope.value]["Value"].replace(/,/g,''));
						var percM = popM*perc_popM/100;
						var employM = ((parseFloat(employment[scope.$parent.pais][sexos[0]][years[j]][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''))*1000)/percM)*100;
						
						diccM[sexos[0]] = employM;
					}
					diccM["year"] = years[j];
					diccF["year"] = years[j];
					initialValues.push(diccM);
					initialValues.push(diccF);
					initialValuesExp.push(diccExp);
				}
				
				var tooltip;
					
				var rects = svg.selectAll("rect")
					.data(initialValues)
					.enter()
					.append("rect")
					.attr("x", function(d,i) {
						if(i%2==0){
							return xScale(d["year"])-padding;
						}
						else return xScale(d["year"]);
					})
					.attr("y", function(d) {
						return yScale(d[Object.keys(d)[0]]);
					})
					.attr("width", padding)
					.attr("height", function(d) {
						return (h-padding*1.5)-yScale(d[Object.keys(d)[0]]);
					})
					.attr("class", function(d) {
						return "rect " + Object.keys(d)[0]; 
					})
					.on("mouseover",function(d){
						var cr = d3.select(this);
						cr
							.style("opacity",0.5);
						d3.selectAll('.tooltip').remove();
						tooltip = d3.select(el[0].children[1]).append("div").attr("class", "tooltip");
						var absoluteMousePos = d3.mouse(this);
						tooltip
							.style('left', (absoluteMousePos[0]+padding*3)+'px')
							.style('top', (absoluteMousePos[1])+'px')
							.style('position', 'absolute') 
							.style('z-index', 1001);
						var tooltipText = "<h3>"+Object.keys(d)[0]+"</h3><p>"+ Math.round(d[Object.keys(d)[0]]) + "%</p>";
						tooltip
							.html(tooltipText);
					})
					.on("mouseleave",function(d){
						var cr = d3.select(this);
						cr
							.style("opacity",1)
							.style("stroke","");
						tooltip.remove();
					});
					
				var lineFunction = d3.svg.line()
					.x(function(d) {
						return xScaleExp(d["year"]);
					})
					.y(function(d) { 
						return yScaleExp(d["value"]); 
					})
					.interpolate("linear");
						
				var path = svg.append("path")
					.attr("d", lineFunction(initialValuesExp))
					.attr("stroke", "yellow")
					.attr("stroke-width", 0.5)
					.attr("fill", "none");
					
				svg
					.append("text")
					.attr("text-anchor", "middle") 
					.attr("transform", "translate("+ (padding/2) +","+(h/2)+")rotate(-90)") 
					.attr("font-size", "9px")
					.attr("fill","black")
					.text("employment %");

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
					
				svg
					.append("g")
					.attr("class", "axis")
					.attr("transform", "translate("+(w-padding*2)+",0)")
					.attr("fill","black")
					.call(yAxisExpenditure);
				
				svg
					.append("text")
					.attr("text-anchor", "middle") 
					.attr("transform", "translate("+(w-padding/2)+","+(h-padding*5)+")rotate(90)") 
					.attr("font-size", "9px")
					.attr("fill","black")
					.text("expenditure in education");
			}	
		};
		
		return {
			link: link,
			restrict: 'AE',
			scope: true
		};
	});