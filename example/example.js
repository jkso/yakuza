'use strict';

var Yakuza = require('../yakuza');
var _ = require('lodash');

// Create scraper
Yakuza.scraper('Articles');

// Create agents
Yakuza.scraper('Articles').agent('Reddit')
  .setup(function (config) {
    config.plan = [
      {taskId: 'getArticleLinks', selfSync: false},
      'getArticles'
    ];
  });

// Create getArticleLinks task
Yakuza.scraper('Articles').agent('Reddit').task('getArticleLinks')
  // Builder that determines the amount of times to instance the task
  .builder(function (job) {
    var paramSets = [];

    _.each(job.params.subreddits, function (param) {
      paramSets.push(param);
    });

    return paramSets;
  })
  // Main task method
  .main(function (emitter, http, params) {
    console.log('Getting article links for '+params);
    setTimeout(function () {
      return emitter.success({paramsReceived: params});
    }, 500);
  });
// Create getArticle task
Yakuza.scraper('Articles').agent('Reddit').task('getArticle');


var job = Yakuza.job('Articles', 'Reddit', {subreddits: ['atheism', 'angularjs']});

job.enqueue('getArticleLinks').enqueue('getArticle');

job.run();
