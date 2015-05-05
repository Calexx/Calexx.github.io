angular.module('visualDataApp.directives.myChordDiagramDirective',[])
	.directive('myChordDiagram',function(){
		function link(scope,el,attr){
			scope.$parent.$watch('employment',function(){
				if(typeof scope.$parent.employment !== "undefined"){
					
					var d = [];
					d.push(scope.$parent.employment);
					
					scope.years = defineYears(d);
					scope.value = '0';
					scope.inicial = scope.years[0];
					scope.actual = scope.inicial;
					
					scope.$parent.$watchGroup(['pais','education'], function(){
						drawChart(scope,el,scope.$parent.employment);
					});
					
					scope.$watch('actual', function(){
						drawChart(scope,el,scope.$parent.employment);
					});
				}
			});
			
			function drawChart(scope, el, datos){
				
				d3.select(el[0]).selectAll("svg").remove();
				
				var array = [];
				var sexos = scope.$parent.sexos.slice(1);
				var activities = scope.$parent.activities.slice(1);
				var years = scope.years;
				var namesByIndex = {};
				var index = 0;
				var color = d3.scale.category20c();
				
				for (var i=0;i<sexos.length;i++){
					var s = [];
					for (sexo in sexos){
						for (var j=0;j<sexos.length;j++){
							s.push(0);
						};
						for (activity in activities){
							s.push(parseFloat(datos[scope.$parent.pais][sexos[sexo]][scope.actual][scope.$parent.education][activities[activity]][scope.value]["Value"].replace(/,/g,'')));
						}
					}
					namesByIndex[index] = sexos[i];
					index++;
					array.push(s);
				}
				
				for (var i=0;i<activities.length;i++){ 
					var s = [];
					for (activity in activities){
						for (sexo in sexos){
							s.push(parseFloat(datos[scope.$parent.pais][sexos[sexo]][scope.actual][scope.$parent.education][activities[activity]][scope.value]["Value"].replace(/,/g,'')));
						}
						for (var j=0;j<activities.length;j++){
							s.push(0);
						}
					}
					namesByIndex[index] = activities[i];
					index++;
					array.push(s);
				}
				
				var w = el.width()-el.width()/10,
					h = el.width()-el.width()/6.5,
					outerRadius = Math.min(w, h) / 2,
					innerRadius = outerRadius - 24;
					
				var padding = 30;
					
				var arc = d3.svg.arc()
					.innerRadius(innerRadius)
					.outerRadius(outerRadius);
					
				var layout = d3.layout.chord()
					.padding(.04)
					.sortSubgroups(d3.descending)
					.sortChords(d3.ascending);
					
				var path = d3.svg.chord()
					.radius(innerRadius);

				var svg = d3.select(el[0].children[1]).append("svg")
					.attr("width", w)
					.attr("height", h)
					.append("g")
					.attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");
					
				layout.matrix(array);
				
				var tooltip;
				
				var group = svg.selectAll(".group")
					.data(layout.groups)
					.enter().append("g")
					.attr("class", "group")
					.style("cursor","default")
					.on("mouseover", fadeOver(0.02))
					.on("mouseleave", fadeOut(0.8));
				
				function fadeOver(opacity) {
					return function(d, i) {
						svg.selectAll("path.chord")
							.filter(function(d) { return d.source.index != i && d.target.index != i; })
							.transition()
							.style("stroke-opacity", opacity)
							.style("fill-opacity", opacity);
							
						var cr = d3.select(this);
						cr
							.style("opacity",0.5);
						d3.selectAll('#tooltip-chord').remove();
						tooltip = d3.select(el[0].children[1])
							.append("div")
							.attr("class", "tooltip-data")
							.attr("id","tooltip-chord");
						var absoluteMousePos = d3.mouse(this);
						tooltip
							.style('left', (absoluteMousePos[0])+'px')
							.style('top', (absoluteMousePos[1]+padding*10)+'px')
							.style('position', 'absolute') 
							.style('z-index', 1001);
							
						if (namesByIndex[d.index] == "Males" || namesByIndex[d.index]=="Females"){
							var total = parseFloat(datos[scope.$parent.pais][namesByIndex[d.index]][scope.actual][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
							var tooltipText = "<h3>"+namesByIndex[d.index]+"</h3><table><tr><td>Total Employees:</td><td>"+(total/1000).toFixed(3)+"M</td></tr></table>";
						}
						else{
							var males = parseFloat(datos[scope.$parent.pais]["Males"][scope.actual][scope.$parent.education][namesByIndex[d.index]][scope.value]["Value"].replace(/,/g,''));
							var females = parseFloat(datos[scope.$parent.pais]["Females"][scope.actual][scope.$parent.education][namesByIndex[d.index]][scope.value]["Value"].replace(/,/g,''));
							var tooltipText = "<h3>"+namesByIndex[d.index]+"</h3><table><tr><td>Males:</td><td>"+(males/1000).toFixed(3)+"M</td></tr><tr><td>Females:</td><td>"+(females/1000).toFixed(3)+"M</td></tr></table>";
						}

						tooltip
							.html(tooltipText);
					};
				}
				
				function fadeOut(opacity) {
					return function(d, i) {
						
						var cr = d3.select(this);
						cr
							.style("opacity",1);
							
						svg.selectAll("path.chord")
							.filter(function(d) { return d.source.index != i && d.target.index != i; })
							.transition()
							.style("stroke-opacity", opacity)
							.style("fill-opacity", opacity);
							
						tooltip.remove();
					};
				}
					
				var fill = d3.scale.category20c();
				
				var groupPath = group.append("path")
					.attr("id", function(d, i) { return "group" + i; })
					.attr("d", arc)
					.style("fill", function(d, i) { 
						if(namesByIndex[d.index] == "Females"){
							return "#DA6068";
						}
						if(namesByIndex[d.index] == "Males"){
							return "#3F7F93";
						}
						return fill(d.index);
					});
				
				var groupText = group.append("text")
					.attr("x", 6)
					.attr("dy", 15);
				
				groupText.append("textPath")
					.attr("xlink:href", function(d, i) { return "#group" + i; })
					.style("font-size", function(d, i){
						if(namesByIndex[i] == "Females"){
							return "15px";
						}
						if(namesByIndex[i] == "Males"){
							return "15px";
						}
						return "9px";
					})
					.text(function(d, i) { 
						return namesByIndex[i].split(' ')[0]; 
					});
				
				var chord = svg.selectAll(".chord")
					.data(layout.chords)
					.enter().append("path")
					.attr("class", "chord")
					.style("stroke", function(d) {
						if(namesByIndex[d.source.index] == "Females"){
							return d3.rgb(fill(d.target.index)).darker(); 
						}
						if(namesByIndex[d.source.index] == "Males"){
							return d3.rgb(fill(d.target.index)).darker(); 
						}
						return d3.rgb(fill(d.source.index)).darker(); 
					})
					.style("fill", function(d) { 
						if(namesByIndex[d.source.index] == "Females"){
							return fill(d.target.index); 
						}
						if(namesByIndex[d.source.index] == "Males"){
							return fill(d.target.index); 
						} 
						return fill(d.source.index); 
					})
					.attr("d", path);				
				
				d3.select(el[0].children[0]).select("#selectChord").remove();
				
				var select = d3.select(el[0].children[0])
					.append("select")
					.attr("id","selectChord")
					.attr("class","mySelect");
					
				var select = d3.select("#selectChord");
				
				var options = select.selectAll("option")
					.data(scope.years)
					.enter()
					.append("option")
					.attr("class","options")
					.attr("value",function(d){
						return d;
					})
					.each(function(d){
						if(d == scope.actual) d3.select(this).attr("selected","selected");
					})
					.text(function(d){
						return d;
					});
					
				select
					.on("change",function(){
						scope.$apply(function(){
							var value = $("#selectChord").val();
							scope.actual = value;
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