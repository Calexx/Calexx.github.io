function pivotID(json, group){
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

	var result = _.groupByMulti(json, group);

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

function rgb2hex(rgb) {
     if (  rgb.search("rgb") == -1 ) {
          return rgb;
     } else {
          rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
          function hex(x) {
               return ("0" + parseInt(x).toString(16)).slice(-2);
          }
          return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
     }
}

function compare(a,b){
	if(a.year<b.year){
		return -1;
	}
	if(a.year>b.year){
		return 1;
	}
	return 0;
}

function defineYears(data){
	var years = [];
	for (var i=0;i<data.length;i++){
		years.push(Object.keys(data[i][Object.keys(data[i])[0]][Object.keys(data[i][Object.keys(data[i])[0]])[0]]));
	}
	var selectedIntersection = _.intersection.apply(_, years);
	return selectedIntersection;
}

$(window).bind('resize', function(e){
	if (window.RT) clearTimeout(window.RT);
	window.RT = setTimeout(function(){
		this.location.reload(false);
	}, 100);
});

function getTemplateInicial(){
	return "<div class='row' id='row'><div class='col-lg-12'><div my-map class='panel panel-default big-panel'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-bar-chart-o fa-fw'></i> Employment Comparison at year:</h3></div><div class='panel-body'><h1 id='year-title'>{{actual}}</h1></div></div></div></div><div class='row' id='row2'><div class='col-lg-4'><div my-chart class='panel panel-default'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-long-arrow-right fa-fw'></i> {{pais}} Employment in :</h3></div><div class='panel-body'></div></div></div><div class='col-lg-4'><div my-stacked-bar class='panel panel-default'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-clock-o fa-fw'></i> {{pais}} : I+D Sectors by {{values_indicator[value]}}</h3></div><div class='panel-body'></div></div></div><div class='col-lg-4'><div my-pie-chart class='panel panel-default'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-clock-o fa-fw'></i> {{pais}} Employment in :</h3></div><div class='panel-body'></div></div></div></div><div class='row' id='row3'><div class='col-lg-6'><div my-bubble-chart class='panel panel-default'><div class='panel-heading'><h3 class='panel-title transitioning-title'><i class='fa fa-clock-o fa-fw'></i> {{pais}} Salary/Employment evaluation at year :</h3></div><div class='panel-body'><h1 id='year-title-black'>{{actual}}</h1></div></div></div>";
}

function getTemplateReconstruir(){
	return "<div class='row' id='row'><div class='col-lg-6'><div my-bubble-chart class='panel panel-default'><div class='panel-heading'><h3 class='panel-title transitioning-title'><i class='fa fa-long-arrow-right fa-fw'></i>{{pais}} Salary/Employment evaluation at year :</h3></div><div class='panel-body'><h1 id='year-title-black'>{{actual}}</h1></div></div></div><div class='col-lg-6'><div my-map class='panel panel-default big-panel'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-long-arrow-right fa-fw'></i>Employment Comparison at year:</h3></div><div class='panel-body'><h1 id='year-title'>{{actual}}</h1></div></div></div></div><div class='row' id='row2'><div class='col-lg-4'><div my-chart class='panel panel-default'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-clock-o fa-fw'></i> {{pais}} Employment in:</h3></div><div class='panel-body'></div></div></div><div class='col-lg-4'><div my-stacked-bar class='panel panel-default'><div class='panel-heading'><h3 class='panel-title'><i class='fa fa-clock-o fa-fw'></i> {{pais}} Employment in :</h3></div><div class='panel-body'></div></div></div><div class='col-lg-4'><div my-pie-chart class='panel panel-default'><div class='panel-heading'><h3 class='panel-title' style='font-size:16px;padding:5px;'><i class='fa fa-clock-o fa-fw'></i> {{pais}} Employment in :</h3></div><div class='panel-body'></div></div></div></div>";
}