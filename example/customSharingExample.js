'use strict';
var _ = require('lodash');
var Yakuza = require('../yakuza');

Yakuza.scraper('TestScraper').agent('TestAgent').setup(function (config) {
  config.plan = [
    'CountVocals',
    'ShowResults'
  ];
});

// We define this as a named function just for ease in the example, it should be used as an
// anonymous function
var sumProperties = function (current, next) {
  var newObject = {};

  if (_.isObject(current)) {
    _.each(_.keys(current), function (key) {
      var currentValue = current[key];
      var nextValue = next[key] || 0;
      newObject[key] = currentValue + nextValue;
    });
  } else {
    newObject = next;
  }

  return newObject;
};

// Define a scraper-level sharing method. `current` refers to the actual value of the key in which
// we are sharing. `Next` is the value we will now share in the key
// The returned value will be the new value for the defined key
// In this case the sumProperties method will sum the values of all the properties present in
// the current object. For simplicity we are avoiding corner cases
Yakuza.scraper('TestScraper').addShareMethod('sumProperties', sumProperties);

Yakuza.task('TestScraper', 'TestAgent', 'CountVocals')
  .builder(function (job) {
    // Instance 'JoinStrings' once per element in params
    return job.params;
  })
  .main(function (task, http, params) {
    var counts, string;

    string = params;
    counts = {a: 0, e: 0, i: 0, o: 0, u: 0};

    counts.a = (string.match(/a/g) || []).length;
    counts.e = (string.match(/e/g) || []).length;
    counts.i = (string.match(/i/g) || []).length;
    counts.o = (string.match(/o/g) || []).length;
    counts.u = (string.match(/u/g) || []).length;

    task.share('counts', counts, {method: 'sumProperties'});

    // Alternatively you could define the method here, which would only work for this task
    // task.share('counts', counts, {method: sumProperties});

    task.success();
  });

Yakuza.task('TestScraper', 'TestAgent', 'ShowResults')
  .builder(function (job) {
    return job.shared('CountVocals.counts');
  })
  .main(function (task, http, params) {
    console.log(params);
    task.success();
  });

var job = Yakuza.job('TestScraper', 'TestAgent', ['murcielago', 'ballena', 'canguro']);

job.enqueue('CountVocals').enqueue('ShowResults');

job.run();
