angular.module('visualDataApp.directives.mySunburstChartDirective',[])
	.directive('mySunburstChart',function(){
		function link(scope,el,attr){
			scope.$parent.$watch('employment',function(){
				if(typeof scope.$parent.employment !== "undefined"){
					
					var d = [];
					d.push(scope.$parent.employment);
					
					scope.years = defineYears(d);
					scope.inicial = scope.years[0];
					scope.actual = scope.inicial;
					scope.value = '0';
					scope.activity = 'Total';
					
					scope.$parent.$watchGroup(['pais','education'], function(){
						drawChart(scope,el,scope.$parent.employment);
					});
					
					scope.$watch('actual',function(){
						drawChart(scope,el,scope.$parent.employment);
					})
				}
			});
			
			function drawChart(scope, el, datos){
				
				d3.select(el[0]).selectAll("svg").remove();
					
				var width = el.width()-el.width()/10,
					height = el.width()-el.width()/6.5,
					radius = Math.min(width, height) / 2;
					
				var padding = 30;
				
				var x = d3.scale.linear()
					.range([0, 2 * Math.PI]);

				var y = d3.scale.sqrt()
					.range([0, radius]);

				var color = d3.scale.category20c();

				var svg = d3.select(el[0].children[1])
					.append("svg")
					.attr("width", width)
					.attr("height", height)
					.append("g")
					.attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

				var partition = d3.layout.partition()
					.value(function(d) { return d.size; });

				var arc = d3.svg.arc()
					.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
					.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
					.innerRadius(function(d) { return Math.max(0, y(d.y)); })
					.outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

				// PIVOT DATA
				// {"name":"Todos","children": [{"name":"Females","children":["name":"agricultura","children":["name":"education"....
				var root = {};
				
				var sexos = scope.$parent.sexos.slice(1);
				var activities = scope.$parent.activities.slice(1);
				var educations = scope.$parent.educations.slice(1);
				
				root["name"] = scope.$parent.sexos[0];
				
				var sxs = [];
				
				for (sexo in sexos) {
					var first = {};
					var acts = [];
					
					for (activity in activities){
						var second = {};
						var educs = []
						
						for (education in educations){
							var last = {};
							var size = parseFloat(datos[scope.$parent.pais][sexos[sexo]][scope.actual][educations[education]][activities[activity]][scope.value]["Value"].replace(/,/g,''));
							
							/* Educations */
							last["name"] = educations[education];
							last["size"] = size;
							
							/* children */
							educs.push(last);
						}
						
						second["name"] = activities[activity];
						second["children"] = educs;
						
						acts.push(second);
					}
					
					first["name"] = sexos[sexo];
					first["children"] = acts;
					
					sxs.push(first);
				}
				
				root["children"] = sxs;
				
				var tooltip;
				
				var path = svg.selectAll("path")
					.data(partition.nodes(root))
					.enter().append("path")
					.attr("d", arc)
					.attr("class", "arc-sunburst")
					.style("fill", function(d) { 
						if (d.name == "Total"){
							return "#BAB5D8";
						}	
						if (d.name == "Males"){
							return "#3F7F93";
						}
						if (d.name == "Females"){
							return "#DA6068";
						}
						return color((d.children ? d : d.parent).name); 
					})
					.on("click", click)
					.on("mouseover",function(d){
						var cr = d3.select(this);
						cr
							.style("opacity",0.5);
						d3.selectAll('#tooltip-sunburst').remove();
						tooltip = d3.select(el[0].children[1])
							.append("div")
							.attr("class", "tooltip-data")
							.attr("id","tooltip-sunburst");
						var absoluteMousePos = d3.mouse(this);
						tooltip
							.style('left', (absoluteMousePos[0]+padding*10)+'px')
							.style('top', (absoluteMousePos[1]+padding*10)+'px')
							.style('position', 'absolute') 
							.style('z-index', 1001);
							
						var tooltipText = "<h3>"+d.name.split("(")[0]+"</h3><table><tr><td>Employees:</td><td>"+(d.value/1000).toFixed(3)+"M</td></tr></table>"

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

				function click(d) {
					path.transition()
						.duration(750)
						.attrTween("d", arcTween(d));
				}
				
				d3.select(self.frameElement).style("height", height + "px");

				// Interpolate the scales!
				function arcTween(d) {
					var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
						yd = d3.interpolate(y.domain(), [d.y, 1]),
						yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
					return function(d, i) {
						return i 
							? function(t) { return arc(d); }
							: function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
					};
				}
		
				d3.select(el[0].children[0]).select("#selectSunburst").remove();
				
				var select = d3.select(el[0].children[0])
					.append("select")
					.attr("id","selectSunburst")
					.attr("class","mySelect");
					
				var select = d3.select("#selectSunburst");
				
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
							var value = $("#selectSunburst").val();
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