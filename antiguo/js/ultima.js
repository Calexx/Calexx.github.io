function drawMap(spain,id){
	var width = 600,
		height = 500;

	var projection = d3.geo.albers()
		.center([0, 40])
		.rotate([4.4, 0])
		.parallels([50, 60])
		.scale(1200 * 2.6)
		.translate([width / 3, height / 2.25]);

	var path = d3.geo.path()
		.projection(projection)
		.pointRadius(2);

	var div = d3.select(id);
		
	var svg = div.append("svg")
		.attr("width", width)
		.attr("height", height);

	svg.selectAll(".subunit")
		.data(topojson.feature(spain, spain.objects.subunits).features)
		.enter().append("path")
		.attr("class", function(d) { return "subunit " + d.id; })
		.attr("d", path);

	svg.append("path")
		.datum(topojson.mesh(spain, spain.objects.subunits, function(a, b) { return true; }))
		.attr("d", path)
		.attr("class", "subunit-boundary");

	svg.selectAll(".provinces")
		.data(topojson.feature(spain, spain.objects.provinces).features)
		.enter().append("path")
		.attr("class", function(d,i) { 
			if (i==9 || i==16 || i==36 || i==12 || i==26){ return "province colored";}
			else return "province else";
		})
		.attr("d", path);
	
	svg.append("path")
		.datum(topojson.mesh(spain, spain.objects.provinces, function(a, b) { return a !== b; }))
		.attr("d", path)
		.attr("class", "provinces-boundary");
	
	svg.selectAll(".places")
		.data(topojson.feature(spain, spain.objects.places).features)
		.enter().append("path")
		.attr("class", function(d) { return "place " + d.properties.name; })
		.attr("d", path);
	
	svg.selectAll(".place-label")
		.data(topojson.feature(spain, spain.objects.places).features)
		.enter().append("text")
		.attr("class", "place-label")
		.attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
		.attr("x", function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
		.attr("dy", ".35em")
		.style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; })
		.text(function(d) { return d.properties.name; });
	
}