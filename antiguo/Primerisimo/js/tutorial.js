function drawBars(id){
	var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
					11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];
	var div = d3.select(id);
	var w = 500;
	var h = 100;
	var barPadding = 1;
	var svg = div
		.append("svg")
		.attr("width", w)
		.attr("height", h);
	var rects = svg.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
			return i * (w / dataset.length);
		})
		.attr("y", function(d) {
			return h - (d * 4);  //Altura menos el dato
		})
		.attr("width", w / dataset.length - barPadding)
		.attr("height", function(d) {
			return d*4;  //Solo el dato
		})
		.attr("fill", function(d) {
			//return "rgb(0, 0, " + (d * 10) + ")";
			return "rgb(0, 0,"+ (d*10) +")";
		});
	var texts = svg.selectAll("text")
		.data(dataset)
		.enter()
		.append("text")
		.text(function(d) {
			return d;
		})
		.attr("x", function(d, i) {
			return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
		})
		.attr("y", function(d) {
			return h - (d * 4) + 15;              // +15
		})
		.attr("font-family", "sans-serif")
		.attr("text-anchor", "middle")
		.attr("font-size", "11px")
		.attr("fill", "white");
}

function drawPoints(id){
	var dataset = [[5, 20], [480, 90], [250, 50], [100, 33], [330, 95],
	               [410, 12], [475, 44], [25, 67], [85, 21], [220, 88],[600, 150]];
	var w = 500;
	var h = 300;
	var padding = 20;
	var div = d3.select(id);
	var svg = div
		.append("svg")
	    .attr("width", w)
	    .attr("height", h);
	var xScale = d3.scale.linear()
    	.domain([0, d3.max(dataset, function(d) { return d[0]; })])
    	.range([padding, w - padding * 2]);
	var yScale = d3.scale.linear()
	    .domain([0, d3.max(dataset, function(d) { return d[1]; })])
	    .range([h - padding, padding]);
	var rScale = d3.scale.linear()
	    .domain([0, d3.max(dataset, function(d) { return d[1]; })])
	    .range([2, 5]);
	var circles = svg.selectAll("circle")
	    .data(dataset)
	    .enter()
	    .append("circle")
	    .attr("cx", function(d) {
    		return xScale(d[0]);
    	})
		.attr("cy", function(d) {
		    return yScale(d[1]);
		})
		.attr("r", function(d) {
    		return rScale(d[1]);
    	})
		.attr("fill","#3F7F93");
	var texts = svg.selectAll("text")
	    .data(dataset)
	    .enter()
	    .append("text")
	    .text(function(d) {
		    return d[0] + "," + d[1];
		})
		.attr("x", function(d) {
    		return xScale(d[0]);
		})
		.attr("y", function(d) {
    		return yScale(d[1]);
    	})
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "#000000");
}

function drawPointsAxis(id){
	var dataset = [];
	var numDataPoints = 50;
	var formatAsPercentage = d3.format(".1%");
	var xRange = Math.random() * 1000;
	var yRange = Math.random() * 1000;
	for (var i = 0; i < numDataPoints; i++) {
	    var newNumber1 = Math.round(Math.random() * xRange);
	    var newNumber2 = Math.round(Math.random() * yRange);
	    dataset.push([newNumber1, newNumber2]);
	}
	var w = 500;
	var h = 300;
	var padding = 30;
	var div = d3.select(id);
	var svg = div
		.append("svg")
	    .attr("width", w)
	    .attr("height", h);
	var xScale = d3.scale.linear()
    	.domain([0, d3.max(dataset, function(d) { return d[0]; })])
    	.range([padding, w - padding * 2]);
	var yScale = d3.scale.linear()
	    .domain([0, d3.max(dataset, function(d) { return d[1]; })])
	    .range([h - padding, padding]);
	var rScale = d3.scale.linear()
	    .domain([0, d3.max(dataset, function(d) { return d[1]; })])
	    .range([2, 5]);
	var circles = svg.selectAll("circle")
	    .data(dataset)
	    .enter()
	    .append("circle")
	    .attr("cx", function(d) {
    		return xScale(d[0]);
    	})
		.attr("cy", function(d) {
		    return yScale(d[1]);
		})
		.attr("r", function(d) {
    		return rScale(d[1]);
    	})
		.attr("fill","#3F7F93");
	var texts = svg.selectAll("text")
	    .data(dataset)
	    .enter()
	    .append("text")
	    .text(function(d) {
		    return d[0] + "," + d[1];
		})
		.attr("x", function(d) {
    		return xScale(d[0]);
		})
		.attr("y", function(d) {
    		return yScale(d[1]);
    	})
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill","#000000");
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(5)
		//.tickFormat(formatAsPercentage);
	var yAxis = d3.svg.axis()
    	.scale(yScale)
    	.orient("left")
    	.ticks(5);
	svg
		.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - padding) + ")")
		.call(xAxis);
	svg
		.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);
}