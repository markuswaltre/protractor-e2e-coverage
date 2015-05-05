var q = require('q'),
		crypto = require('crypto'),
    fs = require('fs'),
    path = require('path'),
		_ = require('underscore'),
    wrench = require('wrench');


var CoveragePlugin = function() {
	this.DOMelements = [];
	this.logs = [];
	this.browserLogAvailable = false;
	this.name = 'CoverageE2E';
	this.outdir;
  this.config = {
    elements: [
      {
        'type': 'button',
        'events': ['click'],
        'elements': []
      },
      {
        'type': 'a',
        'events': ['click', 'blur', 'focus'],
        'elements': []
      },
      {
        'type': 'form',
        'events': ['submit'],
        'elements': []
      },
      {
        'type': 'input',
        'events': ['input', 'click', 'invalid', 'focus', 'blur', 'change'],
        'elements': []
      },
      {
        'type': 'select',
        'events': ['click', 'change'],
        'elements': []
      },
      {
        'type': 'textarea',
        'events': ['input', 'click', 'focus', 'blur', 'change'],
        'elements': []
      }
    ]
  };
};

CoveragePlugin.prototype.hash = function(elem) {
	var shasum = crypto.createHash('sha1');
  // remove html classes for hash
  // so we don't get duplicate on things like .ng-touched
  var r = /\s\bclass=("[^"]+")/g;
  shasum.update(elem.replace(r, ' '));
  return shasum.digest('hex');
}

CoveragePlugin.prototype.updateElement = function(event, obj, url) {
	var self = this;	

	var hash = self.hash(obj);

  var index = _.findIndex(self.DOMelements, {'url': url});
  var elem = _.findIndex(self.DOMelements[index].elements, {'hash': hash});

  if(elem !== -1) {
    var element = self.DOMelements[index].elements[elem];

    element.tested = true;

    if(element.events.indexOf(event) === -1) {
      element.events.push(event);
    }
  }
}

CoveragePlugin.prototype.storeElement = function(element, type) {
	var self = this;

  var hash = self.hash(element.item);
  var index = _.findIndex(self.DOMelements, {'url': element.location});

  // element structure
  function buildElement() {
    return {
      'hash': hash,
      'element': element.item,
      'css': element.css,
      'type': type,
      'tested': false,
      'events': []
    }
  }

  // if the url hasn't been seen
  if(index === -1) {
    var urlObj = {
      'url': element.location,
      'elements': [buildElement()]
    }
    self.DOMelements.push(urlObj);
  } 
  // if the item on the location hasn't been seen
  else if(_.findIndex(self.DOMelements[index].elements, {'hash': hash}) === -1) {
      self.DOMelements[index].elements.push(buildElement());
  }
}

CoveragePlugin.prototype.parseLogs = function(config) {
	var self = this;

	if(this.browserLogAvailable) {
		this.logs.forEach(function(log) {
			var warnings = log.filter(function(node) {
	      return (node.level || {}).name === 'WARNING';
	    });

	    warnings.forEach(function(elem) {
	      var m = JSON.parse(elem.message);
	      if (m.message.hasOwnProperty('parameters')) { 

	        var p = m.message.parameters;

	        if(p[0].value === self.name) {
	          self.updateElement(p[1].value, p[2].value, p[3].value);
	        }
	      }
	    });
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

  if(config.elements) {
    self.config.elements = config.elements;
  }

  browser.manage().logs().getAvailableLogTypes().then(function(res) {
    self.browserLogAvailable = res.indexOf('browser') > -1;
  });
};

CoveragePlugin.prototype.postTest = function(config) {
	var self = this;
	var deferred = q.defer();

  browser.executeScript(function() {
    var helper = {
      hashCode: function (s) {
        var clean = helper.cleanElement(s);
        return clean.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
      },
      cleanElement: function(s) {
        // remove html classes for hash
        // so we don't get duplicate on things like .ng-touched
        var r = /\s\bclass=("[^"]+")/g;
        return s.replace(r, ' ');
      },
      getNodes: function(type) {
        // return NodeList
        var arr_nodes = document.querySelectorAll(type);
        // convert to array
        return Array.prototype.slice.call(arr_nodes);  
      }
    }

    // Elements and events we want to investigate
    var DOMcomponents = arguments[0];

    var url = window.location.pathname;  

    DOMcomponents.forEach(function(DOMtype) {
      var DOMitems = helper.getNodes(DOMtype.type);

      DOMitems.forEach(function(item) {
        var hash = helper.hashCode(item.outerHTML + url);

        // check if eventlistener exists
        if(!window.sessionStorage.getItem(hash)) {

          // if not, add one eventlistener for each event
          var events = DOMtype.events;
          events.forEach(function(event) {
            item.addEventListener(event, function() {
              // needs to be info to be catched by the browserlogs capture
              console.info('CoverageE2E', event, item.outerHTML, window.location.pathname);
            }); 
          });

          // store eventlistener in sessionstorage
          window.sessionStorage.setItem(hash, 'CoverageE2E');

          // get computedCss on element, doesnt look at nested    
          var css = window.getComputedStyle(item).cssText;

          DOMtype.elements.push({'item': item.outerHTML, 'css': css, 'location': url}); 
        }
      });
    });

    return DOMcomponents;
  }, self.config.elements).then(function(DOMcomponents) {

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

  // build coverage file
  var outfileCoverage = path.join(self.outdir, 'coverage.json');
  fs.writeFileSync(outfileCoverage, JSON.stringify(self.DOMelements));

  // save config setting
  var outfileConfig = path.join(self.outdir, 'config.json');
  fs.writeFileSync(outfileConfig, JSON.stringify(self.config.elements));

  // copy report folder
  wrench.copyDirRecursive(__dirname + '/report', self.outdir + '/report', {forceDelete: true}, done);
};

CoveragePlugin.prototype.postResults = function(config) {
	var self = this;
	var deferred = q.defer();

	self.parseLogs();
  self.outputResults(deferred.resolve)

	return deferred.promise;
};

var coveragePlugin = new CoveragePlugin();

exports.setup = coveragePlugin.setup.bind(coveragePlugin);
exports.postTest = coveragePlugin.postTest.bind(coveragePlugin);
exports.postResults = coveragePlugin.postResults.bind(coveragePlugin);
exports.CoveragePlugin = CoveragePlugin;