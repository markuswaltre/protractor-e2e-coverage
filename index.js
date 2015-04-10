var q = require('q'),
		crypto = require('crypto'),
    fs = require('fs'),
    path = require('path'),
		_ = require('underscore');


var CoveragePlugin = function() {
	this.DOMelements = [];
	this.logs = [];
	this.browserLogAvailable = false;
	this.name = 'CoverageE2E';
	this.outdir;
};

CoveragePlugin.prototype.hash = function(elem) {
	var shasum = crypto.createHash('sha1');
  shasum.update(elem);
  return shasum.digest('hex');
}

CoveragePlugin.prototype.updateElement = function(event, obj) {
	var self = this;	

	var hash = self.hash(obj);
  var elem = self.findElement(hash);
  if(elem) {
    elem.seen = true;

    if(elem.events.indexOf(event) === -1) {
      elem.events.push(event);
    }
  }
}

CoveragePlugin.prototype.findElement = function(hash) {
	var self = this;
  return _.findWhere(self.DOMelements, {'hash': hash});
}


CoveragePlugin.prototype.storeElement = function(element, type) {
	var self = this;

  var h = self.hash(element);
  var exists = !!self.findElement(h);

  if(!exists) {
    var obj = { 
      'hash': h,
      'element': element,
      'type': type,
      'seen': false,
      'events': []
    }
    
    self.DOMelements.push(obj);
  }
}

CoveragePlugin.prototype.parseLogs = function(config) {
	var self = this;

	if(this.browserLogAvailable) {
		this.logs.forEach(function(log) {
			var warnings = log.filter(function(node) {
	      return (node.level || {}).name === 'WARNING';
	    });

	    var count = 0;
	    warnings.forEach(function(elem) {
	      var m = JSON.parse(elem.message);
	      if (m.message.hasOwnProperty('parameters')) { 

	        var p = m.message.parameters;

	        if(p[0].value === 'CoverageE2E') {
	          count += 1;
	          self.updateElement(p[1].value, p[2].value);
	        }
	      }

	    });

	    console.log('Events in log: ', count);
		});
	}
};

CoveragePlugin.prototype.saveLogs = function(config) {
	var self = this;

  if(this.browserLogAvailable) {
    browser.manage().logs().get('browser').then(function(log) {
      self.logs.push(log);
    });
  }
};

CoveragePlugin.prototype.setup = function(config) {
	var self = this;
	self.outdir = path.resolve(process.cwd(), config.outdir);

  browser.manage().logs().getAvailableLogTypes().then(function(res) {
    self.browserLogAvailable = res.indexOf('browser') > -1;
  });
};

CoveragePlugin.prototype.postTest = function(config) {
	var self = this;
	var deferred = q.defer();

  browser.executeScript_(function() {
    var helper = {
      hashCode: function (s) {
        return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
      },
      getNodes: function(type) {
        // return NodeList
        var arr_nodes = document.querySelectorAll(type);
        // convert to array
        return Array.prototype.slice.call(arr_nodes);  
      }
    }

    // Elements we want to investigate
    var DOMcomponents = [
      {
        'type': 'button',
        'events': ['click'],
        'elements': []
      },
      {
        'type': 'a',
        'events': ['focus', 'click'],
        'elements': []
      },
      {
        'type': 'input',
        'events': ['focus', 'blur'],
        'elements': []
      },
    ];


    DOMcomponents.forEach(function(DOMtype) {
      var DOMitems = helper.getNodes(DOMtype.type);

      DOMitems.forEach(function(item) {
        var hash = helper.hashCode(item.outerHTML);

        // check if eventlistener exists
        if(!window.sessionStorage.getItem(hash)) {

          // if not, add one eventlistener for each event
          var events = DOMtype.events;
          events.forEach(function(event) {
            item.addEventListener(event, function() {
              // needs to be info to be catched by the browserlogs capture
              console.info('CoverageE2E', event, item.outerHTML);
            }); 
          });

          // store eventlistener in sessionstorage
          window.sessionStorage.setItem(hash, 'CoverageE2E');    
          // store element for return to plugin
    			// TODO strip class=''
          DOMtype.elements.push(item.outerHTML); 
        }
      });
    });

    return DOMcomponents;
  }).then(function(DOMcomponents) {

    DOMcomponents.forEach(function(DOMtype) {
      var elements = DOMtype.elements;
      elements.forEach(function(elem) {
        self.storeElement(elem, DOMtype.type);
      });
    });

    self.saveLogs();
  	deferred.resolve();
  });

	return deferred.promise;
};

CoveragePlugin.prototype.outputResults = function(done) {
	var self = this;
	try {
    fs.mkdirSync(self.outdir);
  } catch (e) {
    if (e.code != 'EEXIST') throw e;
  }

  var stream = fs.createReadStream(path.join(__dirname, 'index.html'));
  var outfile = path.join(self.outdir, 'coverage.json');
  fs.writeFileSync(outfile, JSON.stringify(self.DOMelements));
  stream.pipe(fs.createWriteStream(path.join(this.outdir, 'index.html')));
  stream.on('end', done);
};

CoveragePlugin.prototype.postResults = function(config) {
	var self = this;
	var deferred = q.defer();

	self.parseLogs();

  var seen = 0;
  self.DOMelements.forEach(function(elem) {
    console.log(elem.hash, ' ', elem.seen, ' ', elem.events);
    if(elem.seen) seen += 1;
  });

  console.log('Number of elements ', self.DOMelements.length);
  console.log('Number of elements interacted', seen);
  self.outputResults(deferred.resolve)

	return deferred.promise;
};

var coveragePlugin = new CoveragePlugin();

exports.setup = coveragePlugin.setup.bind(coveragePlugin);
exports.postTest = coveragePlugin.postTest.bind(coveragePlugin);
exports.postResults = coveragePlugin.postResults.bind(coveragePlugin);
exports.CoveragePlugin = CoveragePlugin;