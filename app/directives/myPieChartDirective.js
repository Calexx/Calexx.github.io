angular.module('visualDataApp.directives.myPieChartDirective',[])
	.directive('myPieChart',function(){
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
				
				var w = el.width()-el.width()/10,
					h = el.width()-el.width()/4;
					r = Math.min(w, h)/ 2;
					
				var padding = 30;
				
				var data = [];
				var cont = 0;
				var resto = 0;
				
				var dic = scope.$parent.diccEurope;
				
				/* organizar datos con formato {label,value} para PIE*/
				var sexos = scope.$parent.sexos.slice(1);

				for (var i=0;i<sexos.length;i++){
					var dicc = {};
					dicc["label"] = sexos[i];
					dicc["value"] = parseFloat(datos[scope.$parent.pais][sexos[i]][scope.actual][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''));
					
					var total = parseFloat(datos[scope.$parent.pais]["Total"][scope.actual][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,''));
					
					dicc["percentage"] = ((parseFloat(datos[scope.$parent.pais][sexos[i]][scope.actual][scope.$parent.education][scope.activity][scope.value]["Value"].replace(/,/g,'')))/total)*100;

					data.push(dicc);
				}
				
				var svg = d3.select(el[0].children[1])
					.append("svg")
					.attr("width", w)
					.attr("height", h)
					.append("g")
					.attr("class","pie")
					.attr("id","pie-char")
					.attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");	
				
				var arc = d3.svg.arc()
					.outerRadius(r - 10)
					.innerRadius(0);
					
				var pie = d3.layout.pie()
					.value(function(d) { return d.value; })
					.sort(null);

				var g = svg.selectAll(".arc")
					.data(pie(data))
					.enter()
					.append("g")
					.attr("class", "arc");
				
				var tooltip;
				
				g.append("path")
					.attr("d", arc)
					.style("fill", function(d,i) { 
						if(d.data.label=="Males") return "#3F7F93";	
						else return "#DA6068";
					})
					.on("mouseover",function(d){
						var cr = d3.select(this);
						cr
							.style("opacity",0.5)
							.style("stroke","black")
						d3.selectAll('.tooltip-pie').remove();
						tooltip = d3.select(el[0].children[1]).append("div").attr("class", "tooltip");
						var absoluteMousePos = d3.mouse(this);
						tooltip
							.style('left', (absoluteMousePos[0]+padding*2)+'px')
							.style('top', (absoluteMousePos[1]+padding*3)+'px')
							.style('position', 'absolute') 
							.style('z-index', 1001);
							
						var tooltipText = "<h3>"+d.data.label.split(" ")[0]+"</h3><p>"+ Math.round(d.data.percentage)+"%" + "</p>";
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
		
				d3.select(el[0].children[0]).select("#selectPie").remove();
				
				var select = d3.select(el[0].children[0])
					.append("select")
					.attr("id","selectPie")
					.attr("class","mySelect");
					
				var select = d3.select("#selectPie");
				
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
							var value = $("#selectPie").val();
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