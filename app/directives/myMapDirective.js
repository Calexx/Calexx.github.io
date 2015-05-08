angular.module('visualDataApp.directives.myMapDirective',[])
	.directive('myMap',function($compile){
		function link(scope,el,attr){
			scope.$parent.$watch('employment',function(){
				if(typeof scope.$parent.employment !== "undefined"){

					var d = [];
					d.push(scope.$parent.employment);
					
					scope.years = defineYears(d);
					scope.inicial = scope.years[0];
					scope.actual = scope.inicial;
					scope.value = '0';
					
					scope.$parent.$watch('education', function(){
						drawMap(scope,el,scope.$parent.employment,$compile);
					});
				}
			});
			
			function drawMap(scope, el, datos, $compile){
				
				d3.select(el[0]).selectAll("svg").remove();
				
				var nElem = 0;
				var width = el.width()-el.width()/10,
					height = el.width()-el.width()/5;
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

				var dic = scope.$parent.diccEurope;
				
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
								var men = parseFloat(data[key]["Males"][scope.inicial][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
								var women = parseFloat(data[key]["Females"][scope.inicial][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
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
									if(tono<2){
										return "#E9F2F5"
									}
									else if (tono<4){
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
								var template = "<div ng-include src="+'"'+"'"+"views/secondaryView.tpl.html"+"'"+'"'+"></div>";
								//var template = "<p> fdsda </p>";
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
							scope.actual = scope.inicial;
						});
						var subunits = svg.selectAll(".subunit");
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
									var men = parseFloat(data[key]["Males"][scope.years[1]][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
									var women = parseFloat(data[key]["Females"][scope.years[1]][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
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
											if(tono<2){
												return "#E9F2F5"
											}
											else if (tono<4){
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
						if(i_year<scope.years.length+1){
							if(i_year!=scope.years.length){
								d3.select(this).transition()
									.duration(1000) // this is 1s
									.delay(300)
									.each("end",repeatYear);
								scope.actual = scope.years[i_year];
								i_year++;
							}
						}
					});
				}
				
				
				function repeat(){
					i_pais = parseInt(j_pais/nElem);
					//ultima transicion o no
					if(i_pais<scope.years.length+1){
						//ultimo año
						if(i_pais != scope.years.length){
							d3.select(this).transition()
								.style("fill",function(d){
									for(key in data){
										if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
											var men = parseFloat(data[key]["Males"][scope.years[i_pais]][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
											var women = parseFloat(data[key]["Females"][scope.years[i_pais]][scope.$parent.education]["Total"][scope.value]["Value"].replace(/,/g,''));
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
													if(tono<2){
														return "#E9F2F5"
													}
													else if (tono<4){
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
						return h_leyenda/3 + "px";
					})
					.text(">4%");
				svg_leyenda
					.append("text")
					.attr("x",w_rect+w_rect/3)
					.attr("y",h_leyenda/2)
					.attr("class","desc_leyenda")
					.style("font-size",function(d){
						return h_leyenda/3 + "px";
					})
					.text(">2%");
				svg_leyenda
					.append("text")
					.attr("x",w_rect*2+w_rect/3)
					.attr("y",h_leyenda/2)
					.attr("class","desc_leyenda")
					.style("font-size",function(d){
						return h_leyenda/3 + "px";
					})
					.text(">0%");
				svg_leyenda
					.append("text")
					.attr("x",w_rect*3+w_rect/3)
					.attr("y",h_leyenda/2)
					.attr("class","desc_leyenda")
					.style("font-size",function(d){
						return h_leyenda/3 + "px";
					})
					.text("0%");
				svg_leyenda
					.append("text")
					.attr("x",w_rect*4+w_rect/3)
					.attr("y",h_leyenda/2)
					.attr("class","desc_leyenda")
					.style("font-size",function(d){
						return h_leyenda/3 + "px";
					})
					.text(">0%");
				svg_leyenda
					.append("text")
					.attr("x",w_rect*5+w_rect/3)
					.attr("y",h_leyenda/2)
					.attr("class","desc_leyenda")
					.style("font-size",function(d){
						return h_leyenda/3 + "px";
					})
					.text(">2%");
				svg_leyenda
					.append("text")
					.attr("x",w_rect*6+w_rect/3)
					.attr("y",h_leyenda/2)
					.attr("class","desc_leyenda")
					.style("font-size",function(d){
						return h_leyenda/3 + "px";
					})
					.text(">4%");
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
		
		function postlink(scope,el,attr){
			$('.tooltip').tooltipster({
				arrow: false,
				animation: 'grow',
				delay: 100,
				hideOnClick: true,
				theme: 'tooltipster-custom',
				trigger: 'click'
			});
		}
			
		return {
			restrict: 'AE',
			compile: function compile(tElement, tAttributes, transcludeFn ) {
				// Compile code goes here.
				return {
					pre: link,
					post: postlink
				};
			},
			scope: true
		};
	});