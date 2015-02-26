var app = angular.module('datasetAngular', []);

app.controller('Data', function($scope){
    d3.json("json/europe.topo.json", function(error, europe) {	
		d3.json("json/I+D_europe.json", function(json) {
			if(error) throw error;
			$scope.$apply(function(){
				data = pivotID(json);
				$scope.datos = data;
				$scope.map = europe;
				
				$scope.paisos = Object.keys($scope.datos);
				$scope.sectors = Object.keys($scope.datos[$scope.paisos[0]]);
				$scope.years = Object.keys($scope.datos[$scope.paisos[0]][$scope.sectors[0]]);
				$scope.values = Object.keys($scope.datos[$scope.paisos[0]][$scope.sectors[0]][$scope.years[0]]); 
				
				$scope.pais = $scope.paisos[0];
				$scope.year = $scope.years[0];
				$scope.value = $scope.values[0];
			});
		});
	});
});

app.directive('myChart',function(){
	function link(scope,el,attr){
		scope.$watch('datos',function(){
			if(typeof scope.datos !== "undefined"){
				
				scope.sector = attr.sector;
				
				scope.$watchGroup(['pais','year','value'], function(){
					drawMap(scope,el,scope.datos);
				});
			}
		});
		
		function drawMap(scope, el, datos){
			
			d3.select(el[0]).selectAll("svg").remove();
			
			var w = 265,
				h = 265;
			var padding = 30;
			
			var data = datos[scope.pais];
			var initialValue = data[scope.sector][scope.year][scope.value]["Value"];
			var values = [];
			for (key in data[scope.sector]){
				values.push(data[scope.sector][key][scope.value]["Value"].replace(',',''));
			}
			var xScale = d3.scale.linear()
				.domain([scope.year, scope.years[scope.years.length-1]])
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
				
			var svg = d3.select(el[0])
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
			for (key in data[scope.sector]){
				var value = {};
				value[key] = data[scope.sector][key][scope.value]["Value"].replace(',','');
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
	};
	
	return {
		link: link,
		restrict: 'AE',
		scope: true
	};
});

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