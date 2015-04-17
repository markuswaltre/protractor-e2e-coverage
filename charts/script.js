/*
 * Play with this code and it'll update in the panel opposite.
 *
 * Why not try some of the options above?
 */

function buildTemplates(data) {
  var dataUrls = [];

  var locations = [];
  data.forEach(function(item) {
    item.locations.forEach(function(url) {
      if(locations.indexOf(url) === -1) {
        locations.push(url);
      }
    });
  });

  locations.forEach(function(url) {
    dataUrls.push({'url': url, 'visited': 0, 'notseen': 0});
  });

  data.forEach(function(item) {
    if(_.isEmpty(item.seen)) {
      var match = _.where(dataUrls, {'url': item.loca}
    } else {
      // save seen
      for (url in item.seen) {
        console.log(url);
      }
    }
  });

  Morris.Bar({
    element: 'bar-example',
    data: [
      { y: '2006', a: 100, b: 90 },
      { y: '2007', a: 75,  b: 65 },
      { y: '2008', a: 50,  b: 40 },
      { y: '2009', a: 75,  b: 65 },
      { y: '2010', a: 50,  b: 40 },
      { y: '2011', a: 75,  b: 65 },
      { y: '2012', a: 100, b: 90 }
    ],
    xkey: 'y',
    ykeys: ['a', 'b'],
    labels: ['Series A', 'Series B'],
    stacked: true
  });

};

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