var app = angular.module('pruebaAngular', [])
	
	//Inicializar data
	app.controller("pruebaController",function($scope){
		d3.json("json/spain.topo.json", function(error, spain) {
			if(error) throw error;
			$scope.$apply(function(){
				$scope.land = topojson.feature(spain, spain.objects.provinces);
				$scope.boundary = topojson.mesh(spain, spain.objects.provinces, function(a, b) { return a !== b; });
				$scope.time = "2014";
			});
		});
	});
	
	// Le paso los attr por data;
	app.directive("tweetMap", function($window) {
		function link(scope, el, attr){
			
			el = el[0];
			
			var width=600;
			var height=500;

			var projection = d3.geo.albers()
				.center([0, 40])
				.rotate([4.4, 0])
				.parallels([50, 60])
				.scale(1200 * 2.6)
				.translate([width / 3, height / 2.25]);

			var path = d3.geo.path()
				.projection(projection)
				.pointRadius(2);
			
			var svg = d3.select(el).append("svg")
				.attr("width", width)
				.attr("height", height);
				
			var g = svg.append('g');
			
			var time = svg.append('text');
			var land = g.append('path');
			var boundary = g.append('path');
			
			scope.$watch('land', function(geo){
				if(!geo) return;
				land.datum(geo).attr('class', 'land').attr('d', path);
			});
			
			scope.$watch('boundary', function(geo){
				if(!geo) return;
				boundary.datum(geo).attr("class", "boundary").attr("d", path);
			});
			
			scope.$watch('time',function(geo){
				if(!geo) return;
				time.text(geo).attr("class","text").attr("x",20).attr("y",40).attr("font-size", "50px");
			});
		};
		
		return {
			link: link,
			restrict: 'E',
			scope: { land: '=', boundary: '=', time: '=' }
		};
	}); 