// Funcion que pasa un RGB a Hexadecimal
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

// Funcion para comparar y hacer sort de objetos con years
function compare(a,b){
	if(a.year<b.year){
		return -1;
	}
	if(a.year>b.year){
		return 1;
	}
	if(a.year == b.year){
		if(a.sexo == 'Females' && b.sexo == 'Males') return 1;
		if(b.sexo == 'Females' && a.sexo == 'Males') return -1;
		return 0;
	}
}


// Define la interseccion de multiples arrays con years
function defineYears(data){
	var years = [];
	for (var i=0;i<data.length;i++){
		years.push(Object.keys(data[i][Object.keys(data[i])[0]][Object.keys(data[i][Object.keys(data[i])[0]])[0]]));
	}
	var selectedIntersection = _.intersection.apply(_, years);
	return selectedIntersection;
}

// Define la union de multiples arrays
function unionValues(data){
	var selectedUnion = _.union.apply(_, data);
	return selectedUnion;
}

// Mapea los niveles de educacion
function mappingEducation(level){
	console.log(level);
	if (level == "All ISCED 2011 levels ") {
		return -1;
	}
	
	if (level == "Less than primary, primary and lower secondary education (levels 0-2)"){
		return 0;
	}
	
	if (level == "Upper secondary and post-secondary non-tertiary education (levels 3 and 4)"){
		return 1;
	}
	
	if (level == "Tertiary education (levels 5-8)"){
		return 2;
	}
}