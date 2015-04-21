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

function getConfig() {

	var xmlhttp = new XMLHttpRequest();
	var url = "config.json";

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var config = JSON.parse(xmlhttp.responseText);
		} 
	}

	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

getConfig();
getData();

function buildTemplates(data) {
	var t = _.template(
		$("script#main_template").html()
	);

	var items = $("#container");
	items.append(t({states: data}));
};

function toggleElement(el) {
	console.log(el);
	console.log('toggle');
	$(el).find('ul').toggle();
}