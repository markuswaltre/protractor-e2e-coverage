var data = [];
var config = [];
var statistics = [];
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

	console.dir(data);
	console.log(data);

	buildTemplates();
	buildStatistics();
}

function buildTemplates() {
	var t = _.template(
		$("script#template_states").html()
	);

	var div = $("#states");
	div.append(t({states: data}));
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

function toggleState(el) {
	$(el).parent().find('.content').toggle();
}

function toggleElement(el, next) {
	$(el).find(next).toggle();
}

function toggleTypes(el) {
	$(el).siblings('.types').toggle();
}