'use strict';

var Yakuza = require('../yakuza');
var _ = require('lodash');

// Create scraper
Yakuza.scraper('Articles');

// Create agents
Yakuza.scraper('Articles').agent('Reddit')
  .setup(function (config) {
    config.plan = [
      'getArticleLinks',
      'getArticles'
    ];
  });

// Create tasks
Yakuza.scraper('Articles').agent('Reddit').task('getArticleLinks')
.main(function (emitter, http, params) {
  console.log(params);
  return;
})
.builder(function (job) {
  var paramSets = [];

  _.each(job.params.subreddits, function (param) {
    paramSets.push(param);
  });

  return paramSets;
});


var job = Yakuza.job('Articles', 'Reddit', {subreddits: ['atheism', 'angularjs']});

job.enqueue('getArticleLinks');

job.run();
