function drawTitle(id){
	var div = d3.select(id);
	var title = div
		.append("i")
		.attr("class","fa fa-bar-chart-o fa-fw")
		.html("Riqueza y Poblacion");
	var button = div
		.append("button")
		.attr("class","myButton")
		.text("update");
}

function drawGraph(data, id){
	var w = 600;
	var h = 400;
	var padding = 0;
	var i_circle,i_text,j_circle,j_text,i_year;
	var nElem = 10;
	var formatBigNumbers = d3.format(".1s");
	var div = d3.select(id);
	var svg = div
		.append("svg")
		.attr("width", w)
	    .attr("height", h)
		.attr("class","graph")
		.attr("id","svg_s");
		
	var array = [];
	for(var i=0;i<data.length;i++){
		var array2 = [];
		for (var j=0;j<data[0].datos.length;j++){
			array2.push(parseInt(data[i].datos[j].riqueza));
		}
		array.push(d3.max(array2));	
	}
	
	var maxRiq = d3.max(array);
	
	var array = [];
	for(var i=0;i<data.length;i++){
		var array2 = [];
		for (var j=0;j<data[0].datos.length;j++){
			array2.push(parseInt(data[i].datos[j].poblacion));
		}
		array.push(d3.max(array2));
	}
	
	var maxPob = d3.max(array);
	
	var svg = d3.select("#svg_s");
	
	var xScale = d3.scale.pow()
		.exponent(.10)
		.domain([0, maxPob])
		.range([padding, w - padding]);
	var yScale = d3.scale.linear()
	    .domain([0, maxRiq])
	    .range([h-padding, padding]);
	var rScale = d3.scale.sqrt()
	    .domain([0, maxPob])
	    .range([5, 20]);
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(3)
		.tickFormat(formatBigNumbers)
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(5)
		.tickFormat(formatBigNumbers);
	var circles = svg.selectAll("circle")
	    .data(data)
	    .enter()
	    .append("circle")
	    .attr("fill",function(d){
	    	switch(d.continente){
	    		case "europa":
	    			return "#5ebdb2";
	    		case "america":
	    			return "#e47c5d";
	    		case "asia":
	    			return "#e42d40";
	    	}
	    })
	    .attr("cx", function(d) {
			return xScale(d.datos[0].poblacion)-padding/2;
		})
		.attr("cy", function(d) {
		    return yScale(d.datos[0].riqueza);
		})
		.attr("r", function(d) {
			return rScale(d.datos[0].poblacion);
		});
		
	var texts = svg.selectAll("text")
		.attr("class","nombres")
	    .data(data)
	    .enter()
	    .append("text")
		.attr("x", function(d) {
			return xScale(d.datos[0].poblacion)+padding/10;
		})
		.attr("y", function(d) {
			return yScale(d.datos[0].riqueza)-padding/3;
		})
		.text(function(d) {
		    return d.nombre;
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "black");

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
	    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
	    .attr("transform", "translate("+ (padding/4) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
	    .attr("font-size", "10px")
		.attr("fill","black")
	    .text("Riqueza");

	svg
		.append("text")
	    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
	    .attr("transform", "translate("+((padding+w)/2)+","+(h-(padding/4))+")")  // centre below axis
	    .attr("font-size", "10px")
		.attr("fill","black")
	    .text("Poblacion");
	
	svg
		.append("text")
		.attr("id","year")
		.text(data[0].datos[0].year)
		.attr("x", padding+60)
		.attr("y", padding+10);
		
	var button = d3.select(".myButton");
	
	button
		.on("click",function(){
			i_circle = 0;
			i_text = 0;
			transitions();
		});
			
	function transitions(){
		
		var circles = svg.selectAll("circle");
		var texts = svg.selectAll("text").data(data);
		var year = svg.select("#year");
		
		i_circle = 2;
		i_text = 2;
		i_year = 2;
		j_circle = 2 * nElem;
		j_text = 2 * nElem;
		
		circles.transition()
			.attr("cx", function(d) {
				return xScale(d.datos[1].poblacion)-padding/2;
			})
			.attr("cy", function(d) {
				return yScale(d.datos[1].riqueza);
			})
			.attr("r", function(d) {
				return rScale(d.datos[1].poblacion);
			})
			.duration(1000)
			.delay(100)
			.each("end",repeatCircles);
		
		texts.transition()
			.attr("x", function(d) {
				return xScale(d.datos[1].poblacion)+padding/10;
			})
			.attr("y", function(d) {
				return yScale(d.datos[1].riqueza)-padding/3;
			})
			.duration(1000)
			.delay(100)
			.each("end",repeatText);
			
		year.transition()
			.text(data[0].datos[1].year)
			.duration(1000) // this is 1s
			.delay(100)
			.each("end",repeatYear);
	}
	
	function repeatYear(){
		if(i_year<data[0].datos.length+1){
			if(i_year==data[0].datos.length){
				d3.select(this).transition()
					.text(data[0].datos[0].year)
					.duration(3000) // this is 1s
					.delay(100);
				i_year++;
			}
			else{
				d3.select(this).transition()
					.text(data[0].datos[i_year].year)
					.duration(1000) // this is 1s
					.delay(100)
					.each("end",repeatYear);
				i_year++;
			}
		}
	}
	
	function repeatText(){
		i_text = parseInt(j_text/nElem);
		if(i_text<data[0].datos.length+1){
			if(i_text==data[0].datos.length){
				d3.select(this).transition()
					.attr("x", function(d) {
						return xScale(d.datos[0].poblacion)+padding/10;
					})
					.attr("y", function(d) {
						return yScale(d.datos[0].riqueza)-padding/3;
					})
					.duration(3000)
					.delay(100);
				j_text++;
			}
			else{
				d3.select(this).transition()
					.attr("x", function(d) {
						return xScale(d.datos[i_text].poblacion)+padding/10;
					})
					.attr("y", function(d) {
						return yScale(d.datos[i_text].riqueza)-padding/3;
					})
					.duration(1000)
					.delay(100)
					.each("end",repeatText);
				j_text++;
			}
		}
	}
		
		
	function repeatCircles(){
		i_circle = parseInt(j_circle/nElem);
		if(i_circle<data[0].datos.length+1){
			if(i_circle==data[0].datos.length){
				d3.select(this).transition()
					.attr("cx", function(d) {
						return xScale(d.datos[0].poblacion)-padding/2;
					})
					.attr("cy", function(d) {
						return yScale(d.datos[0].riqueza);
					})
					.attr("r", function(d) {
						return rScale(d.datos[0].poblacion);
					})
					.duration(3000)
					.delay(100);
				j_circle++;
			}
			else{
				d3.select(this).transition()
					.attr("cx", function(d) {
						return xScale(d.datos[i_circle].poblacion)-padding/2;
					})
					.attr("cy", function(d) {
						return yScale(d.datos[i_circle].riqueza);
					})
					.attr("r", function(d) {
						return rScale(d.datos[i_circle].poblacion);
					})
					.duration(1000)
					.delay(100)
					.each("end",repeatCircles);
				j_circle++;
			}
		}
	}
	
	var h_leyenda = h/3;
	
	var svg_leyenda = div
		.append("svg")
		.attr("width", w)
	    .attr("height", h_leyenda)
		.attr("class","leyenda");
	svg_leyenda
		.append("rect")
		.attr("x",padding)
		.attr("y",padding)
		.attr("width", 20)
	    .attr("height", 10)
    	.attr("fill", "#e42d40");
	svg_leyenda
		.append("rect")
		.attr("x",padding)
		.attr("y",padding*2)
		.attr("width", 20)
	    .attr("height", 10)
		.attr("fill", "#5ebdb2");
	svg_leyenda
		.append("rect")
		.attr("x",padding)
		.attr("y",padding*3)
		.attr("width", 20)
	    .attr("height", 10)
		.attr("fill", "#e47c5d");
	svg_leyenda
		.append("text")
		.attr("x", padding*2)
		.attr("y", padding+10)
	    .attr("font-size", "10px")
		.attr("fill","black")
	    .text("Asia");
	svg_leyenda
		.append("text")
		.attr("x", padding*2)
		.attr("y", padding*2+10)
	    .attr("font-size", "10px")
		.attr("fill","black")
	    .text("Europa");
	svg_leyenda
		.append("text")
		.attr("x", padding*2)
		.attr("y", padding*3+10)
	    .attr("font-size", "10px")
		.attr("fill","black")
	    .text("America");
}