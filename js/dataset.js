function drawGraph(data,id,sector){
	var div = d3.select(id);
	
	var w = 265,
		h = 265;
		
	var padding = 30;
	
	var initialValue = data[sector]["2004"][0]["Value"];
	
	var values = [];
	for (key in data[sector]){
		values.push(data[sector][key][0]["Value"].replace(',',''));
	}
	
	var xScale = d3.scale.linear()
		.domain([2004, 2013])
		.range([padding, w - padding]);
	
	var yScale = d3.scale.linear()
	    .domain([d3.min(values), d3.max(values)])
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
		.ticks(5);
		
	var svg = div
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
		.attr("transform", "translate("+padding+",0)")
		.attr("fill","black")
		.call(yAxis); 
	
	var array = []
	for (key in data[sector]){
		var value = {};
		value[key] = data[sector][key][0]["Value"].replace(',','');
		array.push(value);
	}
	
	var circles = svg.selectAll("circle")
	    .data(array)
	    .enter()
	    .append("circle")
	    .attr("fill",function(d){
				var value = d[Object.keys(d)[0]] - initialValue;
				initialValue = d[Object.keys(d)[0]];
				if (value<0){
					return "#D93A46";
				} 
				else if (value>0){
					return "#3F7F93";
				}
				else{
					return "#F2F2F2";
				}
	    })
	    .attr("cx", function(d) {
			return xScale(Object.keys(d)[0]);
		})
		.attr("cy", function(d) {
			return yScale(d[Object.keys(d)[0]]);
		})
		.attr("r", function(d) {
			return 2;
		});
		
	var lineFunction = d3.svg.line()
		.x(function(d) {
			return xScale(parseFloat(Object.keys(d)[0]));
		})
		.y(function(d) { 
			return yScale(parseFloat(d[Object.keys(d)[0]])); 
		})
		.interpolate("linear");
		
	var path = svg.append("path")
		.attr("d", lineFunction(array))
		.attr("stroke", "black")
		.attr("stroke-width", 0.5)
		.attr("fill", "none");
	
}

function drawTitle(id, title){
	var div = d3.select(id);
	var title = div
		.append("i")
		.attr("class","fa fa-bar-chart-o fa-fw")
		.html(title);
}

function drawTitleButton(id){
	var div = d3.select(id);
	var title = div
		.append("i")
		.attr("class","fa fa-bar-chart-o fa-fw")
		.html("I+D en Europa");
	var button = div
		.append("button")
		.attr("class","myButton")
		.text("update");
}

function drawMap(europe,data,id){
	var nElem = 0;
	var width = 600,
		height = 800;
	var padding = 40;
	var i_pais,j_pais;
		
	var div = d3.select(id);
	

	var projection = d3.geo.mercator()
		.center([0, 40])
		.scale(600)
		.translate([width / 3, height/1.25]);

	var path = d3.geo.path()
		.projection(projection)
		.pointRadius(2);
		
	var svg = div
		.append("svg")
		.attr("id","europe_svg")
		.attr("width", width)
		.attr("height", height)

	 var dic = crearDiccionarioEuropa();
	 
	 var yearsSort = Object.keys(data[Object.keys(data)[0]][Object.keys(data[Object.keys(data)[0]])[0]]).sort();
	 
	 var initialValues = {};
	 
	 for (key in data){
	 	if (_.contains(Object.keys(dic), key)){
	 		initialValues[key] = data[key]["All sectors"][yearsSort[0]][0]["Value"];
	 	}
	 }
	 
	 // Euro Per Capita in RESEARCH
	 svg.selectAll(".subunits")
	 	.data(topojson.feature(europe, europe.objects.regions).features.filter(function(d){
	 		if(d.properties.NUTS_ID.length == 2){
	 			return true;
	 		}
	 		else return false;
	 	}))
	 	.enter().append("path")
	 	.attr("d", path)
	 	.attr("class", function(d){
	 		for (key in data){
	 			if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
	 				var tono = data[key]["All sectors"][yearsSort[0]][0]["Value"].replace(',','');
					if(tono<100){
	 					return "subunit " + key + " " + "primero";
	 				}
	 				else if (tono<500){
	 					return "subunit " + key + " " + "segundo";
	 				}
	 				else if (tono<1000){
	 					return "subunit " + key + " " + "tercero";
	 				}
	 				else{
	 					return "subunit " + key + " " + "cuarto";
	 				}
	 			}
	 		}
	 	})
	 	.each(function(){
	 		nElem++;
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
	 	.attr("id","sector")
	 	.text(function(){
	 		var pais = Object.keys(data)[0];
	 		var sector = Object.keys(data[pais])[0];
	 		return sector;
	 	})
	 	.attr("x", padding)
	 	.attr("y", padding);
	 	
	 svg.append("text")
	 	.attr("id","year")
	 	.text(function(){
	 		var pais = Object.keys(data)[0];
	 		var sector = Object.keys(data[pais])[0];
	 		var year = Object.keys(data[pais][sector]).sort()[0];
	 		return year;
	 	})
	 	.attr("x", padding*10+30)
	 	.attr("y", padding);
	 
	 var button = d3.select(".myButton");
	 
	 button
	 	.on("click",function(){
	 		transitions();
	 	});
	 	
	 function transitions(){
	 	i_pais = 2;
	 	j_pais = 2 * nElem;
	 	i_year = 2;
	 	
	 	var subunits = svg.selectAll(".subunit");
	 	var year = svg.select("#year");
	 	
	 	subunits.transition()
	 		.style("fill",function(d){
	 			for(key in data){
	 				if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
						var value = initialValues[key].replace(',','');
						var value2 = data[key]["All sectors"][yearsSort[1]][0]["Value"].replace(',','');
	 					var tono = value2-value;
	 					if(tono<0){
	 						var qual = value/Math.abs(tono);
	 						if(qual<10){
	 							return "#FAE6E7"
	 						}
	 						else if (qual<20){
	 							return "#E98E95"
	 						}
	 						else{
	 							return "#D93A46";
	 						}
	 					}
	 					else if (tono>0){
	 						var qual = value/Math.abs(tono);
	 						if(qual<10){
	 							return "#E9F2F5"
	 						}
	 						else if (qual<20){
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
	 		.duration(1000)
	 		.delay(300)
	 		.each("end",repeat);
	 		
	 	year.transition()
	 		.text(yearsSort[1])
	 		.duration(1000) // this is 1s
	 		.delay(500)
	 		.each("end",repeatYear);
	 }
	 
	 function repeat(){
	 	i_pais = parseInt(j_pais/nElem);
	 	//ultima transicion o no
	 	if(i_pais<yearsSort.length+1){
	 		//ultimo año
	 		if(i_pais == yearsSort.length){
	 			d3.select(this).transition()
	 				.style("fill",function(d){
	 					for(key in data){
	 						if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
								var value = initialValues[key].replace(',','');
								var tono = data[key]["All sectors"][yearsSort[0]][0]["Value"].replace(',','');
	 							if(tono<0){
	 								var qual = value/Math.abs(tono);
	 								if(qual<10){
	 									return "#F2F2F2"
	 								}
	 								else if (qual<20){
	 									return "#F2F2F2"
	 								}
	 								else{
	 									return "#F2F2F2";
	 								}
	 							}
	 							else if (tono>0){
	 								var qual = value/Math.abs(tono);
	 								if(qual<10){
	 									return "#F2F2F2"
	 								}
	 								else if (qual<20){
	 									return "#F2F2F2"
	 								}
	 								else{
	 									return "#F2F2F2";
	 								}
	 							}
	 							else{
	 								return "#F2F2F2";
	 							}
	 						}
	 					}
	 				})
	 				.duration(1000) // this is 1s
	 				.delay(5000);
	 			j_pais++;
	 		}
	 		else{
	 			d3.select(this).transition()
	 				.style("fill",function(d){
	 					for(key in data){
	 						if (dic[key] == d.properties.NUTS_ID.substring(0,2)){
								var value = initialValues[key].replace(',','');
								var value2 = data[key]["All sectors"][yearsSort[i_pais]][0]["Value"].replace(',','');
	 							var tono = value2-value;
	 							if(tono<0){
	 								var qual = value/Math.abs(tono);
	 								if(qual<10){
	 									return "#FAE6E7"
	 								}
	 								else if (qual<20){
	 									return "#E98E95"
	 								}
	 								else{
	 									return "#D93A46";
	 								}
	 							}
	 							else if (tono>0){
	 								var qual = value/Math.abs(tono);
	 								if(qual<10){
	 									return "#E9F2F5"
	 								}
	 								else if (qual<20){
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
	 				.duration(1000) // this is 1s
	 				.delay(300)
	 				.each("end",repeat);
	 			j_pais++;
	 		}
	 	}
	 }
	 
	 function repeatYear(){
	 	if(i_year<yearsSort.length+1){
	 		if(i_year==yearsSort.length){
	 			d3.select(this).transition()
	 				.text(yearsSort[0])
	 				.duration(1000) // this is 1s
	 				.delay(5000);
	 			i_year++;
	 		}
	 		else{
	 			d3.select(this).transition()
	 				.text(yearsSort[i_year])
	 				.duration(1000) // this is 1s
	 				.delay(300)
	 				.each("end",repeatYear);
	 			i_year++;
	 		}
	 	}
	 }
	 
	 var h_leyenda = 20;
	 var w_rect = width/7;
	 
	 var svg_leyenda = div
	 	.append("svg")
	 	.attr("width", width)
	 	.attr("height", h_leyenda)
	 	.attr("class","leyenda");
	 	
	 	
	 svg_leyenda
	 	.append("rect")
	 	.attr("x",0)
	 	.attr("y",0)
	 	.attr("width", w_rect)
	 	.attr("height", h_leyenda)
	 	.attr("fill", "#D93A46");
	 svg_leyenda
	 	.append("rect")
	 	.attr("x",w_rect)
	 	.attr("y",0)
	 	.attr("width", w_rect)
	 	.attr("height", h_leyenda)
	 	.attr("fill", "#E98E95");
	 svg_leyenda
	 	.append("rect")
	 	.attr("x",w_rect*2)
	 	.attr("y",0)
	 	.attr("width", w_rect)
	 	.attr("height", h_leyenda)
	 	.attr("fill", "#FAE6E7");
	 svg_leyenda
	 	.append("rect")
	 	.attr("x",w_rect*3)
	 	.attr("y",0)
	 	.attr("width", w_rect)
	 	.attr("height", h_leyenda)
	 	.attr("fill", "#F2F2F2");
	 svg_leyenda
	 	.append("rect")
	 	.attr("x",w_rect*4)
	 	.attr("y",0)
	 	.attr("width", w_rect)
	 	.attr("height", h_leyenda)
	 	.attr("fill", "#E9F2F5");
	 svg_leyenda
	 	.append("rect")
	 	.attr("x",w_rect*5)
	 	.attr("y",0)
	 	.attr("width", w_rect)
	 	.attr("height", h_leyenda)
	 	.attr("fill", "#93B8C3");
	 svg_leyenda
	 	.append("rect")
	 	.attr("x",w_rect*6)
	 	.attr("y",0)
	 	.attr("width", w_rect)
	 	.attr("height", h_leyenda)
	 	.attr("fill", "#3F7F93");
	 	
     
	 /*svg_leyenda
	 	.append("text")
	 	.attr("x", padding)
	 	.attr("y", padding-10*2)
	 	.attr("font-size", "10px")
	 	.attr("fill","black")
	 	.text("I+D inversion");
	 svg_leyenda
	 	.append("text")
	 	.attr("x", padding*2)
	 	.attr("y", padding+10)
	 	.attr("font-size", "10px")
	 	.attr("fill","black")
	 	.text("0-100 M. €");
	 svg_leyenda
	 	.append("text")
	 	.attr("x", padding*2)
	 	.attr("y", padding*2+10)
	 	.attr("font-size", "10px")
	 	.attr("fill","black")
	 	.text("101-500 M. €");
	 svg_leyenda
	 	.append("text")
	 	.attr("x", padding*2)
	 	.attr("y", padding*3+10)
	 	.attr("font-size", "10px")
	 	.attr("fill","black")
	 	.text("501-1000 M. €");
	 svg_leyenda
	 	.append("text")
	 	.attr("x", padding*2)
	 	.attr("y", padding*4+10)
	 	.attr("font-size", "10px")
	 	.attr("fill","blac		k")
	 	.text("> 1000 M. €");*/
}

function pivotID(json){
	_.groupByMulti = function (obj, values, context) {
		if (!values.length)
			return obj;
		var byFirst = _.groupBy(obj, values[0], context),
			rest = values.slice(1);
		for (var prop in byFirst) {
			byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
		}
		return byFirst;
	};

	var result = _.groupByMulti(json, ['GEO','SECTPERF','TIME']);

	return result;
}

function crearDiccionarioEuropa (){
	return dicc = {
		"Belgium":"BE"
		,"Bulgaria":"BG"
		,"Czech Republic":"CZ"
		,"Denmark":"DK"
		,"Germany (until 1990 former territory of the FRG)":"DE"
		,"Estonia":"EE"
		,"Ireland":"IE"
		,"Greece":"EL"
		,"Spain":"ES"
		,"France":"FR"
		,"Croatia":"HR"
		,"Italy":"IT"
		,"Cyprus":"CY" 
		,"Latvia":"LV"
		,"Lithuania":"LT"
		,"Luxembourg":"LU"
		,"Hungary":"HU"
		,"Netherlands":"NL"
		,"Austria":"AT"
		,"Poland":"PL"
		,"Portugal":"PT"
		,"Romania":"RO"
		,"Slovenia":"SI"
		,"Slovakia":"SK"
		,"Finland":"FI"
		,"Sweden":"SE",
		"United Kingdom":"UK"
	}
}