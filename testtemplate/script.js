var data = [];
var config = [];
var statistics = [];
var statistics_types = [];
var globals = {};

function getData() {

	var xmlhttp = new XMLHttpRequest();
	var url = "coverage.json";

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			data = JSON.parse(xmlhttp.responseText);
			rebuildData();
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
			config = JSON.parse(xmlhttp.responseText);
			buildTypes();
		} 
	}

	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

getConfig();
getData();

function rebuildData() {
	var statisticsObjects = [];

	data.forEach(function(state) {
		var that = this;

		var seen = state.elements.length;
		var tested = 0;
		var global = 0;

		var types = [];

		state.elements.forEach(function(elem) {
			var globalEvents = [];

			if(elem.tested) {
				tested+=1
			};

			var statisticsObj = _.findWhere(statisticsObjects, {'hash': elem.hash});

			if(typeof statisticsObj === "undefined") {
				var obj = {
					"hash": elem.hash,
					"type": elem.type,
					"tested": elem.tested
				}
				statisticsObjects.push(obj);
			} else if(elem.tested) {
				statisticsObj.seen = elem.tested;
			}

			var gl = findGlobal(elem.hash);
			if(gl[0]) {
				global+=1;
			}

			var unseenLocal = findEvents(elem.type, elem.events);
			var unseenGlobal = findEvents(elem.type, gl[1]);
			var seenGlobal = findEvents(elem.type, unseenGlobal);

			elem.eventsStats = {
				'unseen': unseenLocal,
				'unseen_global': unseenGlobal,
				'seen_global': seenGlobal
			};
			elem.percentage = {
				'here': Math.round(elem.events.length/(elem.events.length + elem.eventsStats.unseen.length)*100),
				'global': Math.round(gl[1].length/(gl[1].length + elem.eventsStats.unseen_global.length)*100)
			}

			var typesCount = _.findWhere(types, {'type': elem.type});
			if(typeof typesCount === "undefined") {
				var obj = {
					"type": elem.type,
					"seen": 1,
					"here": elem.tested ? 1 : 0,
					"global": gl[0] ? 1 : 0
				}
				types.push(obj);
			} else {
				typesCount.seen += 1;
				typesCount.here += elem.tested ? 1 : 0;
				typesCount.global += gl[0] ? 1 : 0;
			}
		});

		_.forEach(types, function(type) {
			type.percentage_here = Math.round(type.here/type.seen*100);
			type.percentage_global = Math.round(type.global/type.seen*100);
		});	

		state.percentage = {
			'here': Math.round(tested/seen*100),
			'global': Math.round(global/seen*100)
		}

		state.count = {
			'seen': seen,
			'tested': tested,
			'tested_global': global
		}

		state.types = types;
	});

	function findEvents(type, events) {
		var configType = _.findWhere(config, {'type': type});
		return _.difference(configType.events, events);
	}  

	function findGlobal(hash) {
		var found = [false, []];

		data.forEach(function(state) {
			var result = _.findWhere(state.elements, {'hash': hash});
			if(result && result.tested) {
				found[0] = true;
				found[1] = _.union(found[1], result.events)
			};
		});

		return found;
	}

	var st_tested = 0, types = [];
	_.forEach(statisticsObjects, function(element) {
		if(element.tested) st_tested += 1;

		var type = _.findWhere(types, {'type': element.type});
		if(typeof type === "undefined") {
			var obj = {
				"type": element.type,
				"count": 1,
				"tested": element.tested ? 1 : 0
			};
			types.push(obj);
		} else {
			type.count += 1;
			type.tested += element.tested ? 1 : 0;
		}
	});

	_.forEach(types, function(type) {
		type.percentage = Math.round(type.tested/type.count*100);
	});

	statistics.count = statisticsObjects.length;
	statistics.tested = st_tested;
	statistics.percentage = Math.round(st_tested/ statisticsObjects.length*100);
	statistics_types = types;

	console.log(statistics);

	console.dir(data);
	console.log(data);
	console.log(statisticsObjects);

	buildTemplates();
	buildStatistics();
	// buildStatisticsTypes();
}

function buildTemplates() {
	var t = _.template(
		$("script#template_states").html()
	);

	var div = $("#states");
	div.append(t({states: data}));

	$('.ui.accordion').accordion('refresh');
};

function buildTypes() {
	var t = _.template(
		$("script#template_types").html()
	);

	var div = $("#types");
	div.append(t({types: config}));
}

function buildStatistics() {
	var t = _.template(
		$("script#template_statistics").html()
	);

	var div = $("#statistics");
	div.append(t({statistics: statistics}));
}

function buildStatisticsTypes() {
	var t = _.template(
		$("script#template_statistics_types").html()
	);

	var div = $("#statistics_types");
	div.append(t({types: statistics_types}));
}

function toggleState(el) {
	$(el).parent().find('.content').toggle();
}

function toggleElement(el, next) {
	$(el).next(next).toggle();
}

function toggleTypes(el) {
	$(el).siblings('.types').toggle();
}

// todo remove the exclusive feature
$('.ui.accordion').accordion();
