function getData() {

	var xmlhttp = new XMLHttpRequest();
	var url = "coverage.json";

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var data = JSON.parse(xmlhttp.responseText);
			buildTemplates(data);
		} 
	}

	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

getData();

_.templateSettings.variable = "t";

var title = _.template(
    $("script.title").html()
);

$("#container").after(
	title({'title': "Some title here"})
);


function buildTemplates(data) {
	var template_item = _.template(
		$("script.item").html()
	);

	var items = $("#items");
	data.forEach(function(item) {
		items.append(template_item(item));
	});
};