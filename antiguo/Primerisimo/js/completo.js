function drawTitle(id){
	var div = d3.select(id);
	var title = div
		.append("i")
		.attr("class","fa fa-bar-chart-o fa-fw")
		.html("Riqueza");
	var button = div
		.append("button")
		.attr("class","myButton")
		.text("update");
}

function drawMap(world,data,id){
	var width = 600;
	var height = 400;
	var i_pais,j_pais,nElem;
	var padding = 40;
	
	var projection = d3.geo.mercator()
	    .center([0, 40])
	    .scale(90)
	    .translate([width / 2, height/1.75]);
	
	var path = d3.geo.path()
	    .projection(projection)
	    .pointRadius(2);
	
	var div = d3.select(id);
	
	var svg = div.append("svg")
	    .attr("width", width)
	    .attr("height", height)
		.attr("id","svg_s");
		
			
	nElem = data.length;
			
	svg = d3.select("#svg_s");
			
	svg.selectAll(".subunits")
		.data(topojson.feature(world, world.objects.subunits).features)
		.enter().append("path")
		.attr("class", function(d) {
			for(var i=0;i<data.length;i++){
				if(data[i].id == d.id){
					var tono = ''+data[i].datos[0].riqueza.length;
					switch(tono){
						case "1":
							return "subunit " + d.id + " " + "primero";
							break;
						case "2":
							return "subunit " + d.id + " " + "segundo";
							break;
						case "3":
							return "subunit " + d.id + " " + "tercero";
							break;
						case "4":
							return "subunit " + d.id + " " + "cuarto";
							break;
					}
				}
			}
			return "subunit " + d.id; 
		})
		.attr("d", path)
		.on("mouseover", mouseover)
		.on("mouseleave",mouseleave);
			
	svg.append("path")
		.datum(topojson.mesh(world, world.objects.subunits, function(a, b) { return a !== b}))
		.attr("d", path)
		.attr("class", "subunit-boundary");

	svg.append("text")
		.attr("id","year")
		.text(data[0].datos[0].year)
		.attr("x", padding*10+100)
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
		
		var subunits = svg.selectAll(".subunit")
			.filter(function(d){
				for(var i=0;i<data.length;i++){
					if(data[i].id == d.id ){
						return true
					}
				}
				return false;
			});
			
		var year = svg.select("#year");
		
		subunits.transition()
			.style("fill",function(d){
				for(var i=0;i<data.length;i++){
					if(data[i].id == d.id){
						var tono = ''+data[i].datos[1].riqueza.length;
						switch(tono){
							case "1":
								return "#5ebdb2";
								break;
							case "2":
								return "#e47c5d";
								break;
							case "3":
								return "#e42d40";
								break;
							case "4":
								return "#142b3b";
								break;
						}
					}
				}
			})
					.duration(2000)
					.delay(300)
					.each("end",repeat);
					
				year.transition()
					.text(data[0].datos[1].year)
					.duration(2000) // this is 1s
					.delay(500)
					.each("end",repeatYear);
	}
			
	function repeatYear(){
		if(i_year<data[0].datos.length+1){
			if(i_year==data[0].datos.length){
				d3.select(this).transition()
					.text(data[0].datos[0].year)
					.duration(2000) // this is 1s
					.delay(300);
				i_year++;
			}
			else{
				d3.select(this).transition()
					.text(data[0].datos[i_year].year)
					.duration(2000) // this is 1s
					.delay(300)
					.each("end",repeatYear);
				i_year++;
			}
		}
	}
		
	function repeat(){
		i_pais = parseInt(j_pais/nElem);
		if(i_pais<data[0].datos.length+1){
			if(i_pais==data[0].datos.length){
				d3.select(this).transition()
					.style("fill",function(d){
						for(var i=0;i<data.length;i++){
							if(data[i].id == d.id){
								var tono = ''+data[i].datos[0].riqueza.length;
								switch(tono){
									case "1":
										return "#5ebdb2";
										break;
									case "2":
										return "#e47c5d";
										break;
									case "3":
										return "#e42d40";
										break;
									case "4":
										return "#142b3b";
										break;
								}
							}
						}
					})
					.duration(2000) // this is 1s
					.delay(300)
				j_pais++;
			}
			else{
				d3.select(this).transition()
					.style("fill",function(d){
						for(var i=0;i<data.length;i++){
							if(data[i].id == d.id){
								var tono = ''+data[i].datos[i_pais].riqueza.length;
								switch(tono){
									case "1":
										return "#5ebdb2";
										break;
									case "2":
										return "#e47c5d";
										break;
									case "3":
										return "#e42d40";
										break;
									case "4":
										return "#142b3b";
										break;
								}
							}
						}
					})
					.duration(2000) // this is 1s
					.delay(300)
					.each("end",repeat);
				j_pais++;
			}
		}
	}	
		
	var h_leyenda = height/2;
	
	var svg_leyenda = div
		.append("svg")
		.attr("width", width)
		.attr("height", h_leyenda)
		.attr("class","leyenda");
	svg_leyenda
		.append("rect")
		.attr("x",padding)
		.attr("y",padding)
		.attr("width", 20)
		.attr("height", 10)
		.attr("fill", "#5ebdb2");
	svg_leyenda
		.append("rect")
		.attr("x",padding)
		.attr("y",padding*2)
		.attr("width", 20)
		.attr("height", 10)
		.attr("fill", "#e47c5d");
	svg_leyenda
		.append("rect")
		.attr("x",padding)
		.attr("y",padding*3)
		.attr("width", 20)
		.attr("height", 10)
		.attr("fill", "#e42d40");
	svg_leyenda
		.append("rect")
		.attr("x",padding)
		.attr("y",padding*4)
		.attr("width", 20)
		.attr("height", 10)
		.attr("fill", "#142b3b");
	svg_leyenda
		.append("text")
		.attr("x", padding)
		.attr("y", padding-10*2)
		.attr("font-size", "10px")
		.attr("fill","black")
		.text("Riqueza");
	svg_leyenda
		.append("text")
		.attr("x", padding*2)
		.attr("y", padding+10)
		.attr("font-size", "10px")
		.attr("fill","black")
		.text("0-9 M");
	svg_leyenda
		.append("text")
		.attr("x", padding*2)
		.attr("y", padding*2+10)
		.attr("font-size", "10px")
		.attr("fill","black")
		.text("10-99 M");
	svg_leyenda
		.append("text")
		.attr("x", padding*2)
		.attr("y", padding*3+10)
		.attr("font-size", "10px")
		.attr("fill","black")
		.text("100-999 M");
	svg_leyenda
		.append("text")
		.attr("x", padding*2)
		.attr("y", padding*4+10)
		.attr("font-size", "10px")
		.attr("fill","black")
		.text("1000-9999 M");
		
	function mouseover (){
		var subunit = d3.select(this);
		subunit
			.style("opacity",0.3);
	}
	
	function mouseleave (){
		var subunit = d3.select(this);
		subunit
			.style("opacity",1);
	}				
}