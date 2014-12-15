'use strict';

var Yakuza = require('../yakuza');
var _ = require('lodash');

// Create scraper
Yakuza.scraper('Articles');

// Create agents
Yakuza.scraper('Articles').agent('Reddit')
  .setup(function (config) {
    config.plan = [
      {taskId: 'getArticleLinks', selfSync: true},
      'getArticles'
    ];
  });

// Create tasks
Yakuza.scraper('Articles').agent('Reddit').task('getArticleLinks')
.builder(function (job) {
  // Builder that determines the amount of times to instance the task
  var paramSets = [];

  _.each(job.params.subreddits, function (param) {
    paramSets.push(param);
  });

  return paramSets;
})
.main(function (emitter, http, params) {
  // Main task method
  console.log(params);
  setTimeout(function () {
    return emitter.success({paramsReceived: params});
  }, 500);
});


var job = Yakuza.job('Articles', 'Reddit', {subreddits: ['atheism', 'angularjs']});

job.enqueue('getArticleLinks');

job.run();
