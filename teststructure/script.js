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

function buildTemplates(data) {
	var seen = data.length;
	var tested = 0;
	var buttonsSeen = 0;
	var buttonsTested = 0;
	var linksSeen = 0;
	var linksTested = 0;
	var inputsSeen = 0;
	var inputsTested = 0;
	var urlsSeen = [];

	data.forEach(function(item) {
		console.log(item);

		item.locations.forEach(function(url) {
			if(urlsSeen.indexOf(url) === -1) {
				urlsSeen.push(url);
			}
		});

		if(item.type === 'button') buttonsSeen += 1;
		if(item.type === 'button' && item.tested) buttonsTested += 1;
		if(item.type === 'a') linksSeen += 1;
		if(item.type === 'a' && item.tested) linksTested += 1;
		if(item.type === 'input') inputsSeen += 1;
		if(item.type === 'input' && item.tested) inputsTested += 1;
		if(item.tested) tested += 1;
	});

	var buttonsPercentage = Math.round(buttonsTested/buttonsSeen*100) + '%';
	var linksPercentage = Math.round(linksTested/linksSeen*100) + '%';
	var inputsPercentage = Math.round(inputsTested/inputsSeen*100) + '%';	
	var percentage = Math.round(tested/seen*100) + '%';

	// seen
	// tested
	// percentage
	// buttons-percentage
	// links-percentage
	// inputs-percentage
	// urls-seen
	// urls
	// container

	document.getElementsByClassName('seen')[0].innerHTML = seen;
	document.getElementsByClassName('tested')[0].innerHTML = tested;
	document.getElementsByClassName('percentage')[0].innerHTML = percentage;

	document.getElementsByClassName('buttons-percentage')[0].innerHTML = buttonsPercentage;
	document.getElementsByClassName('links-percentage')[0].innerHTML = linksPercentage;
	document.getElementsByClassName('inputs-percentage')[0].innerHTML = inputsPercentage;

	urlsSeen.forEach(function(item) {
		var elem = document.createElement('li');
		elem.innerHTML = item;
		document.getElementsByClassName('urls-seen')[0].appendChild(elem);
	});
}