function pivotID(json){
	var groupedData = _.groupBy(json, function(d){return d.GEO});
	console.log(groupedData);
}