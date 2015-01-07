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
      'getArticle'
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
  .main(function (task, http, params) {
    console.log('Getting article links for '+params);
    setTimeout(function () {
      task.share('articleLinks', ['http://www.fake.com', 'http://www.two.com']);
      return task.success({paramsReceived: params});
    }, 500);
  });
// Create getArticle task
Yakuza.scraper('Articles').agent('Reddit').task('getArticle')
  .builder(function (job) {
    var articleLinks = job.shared('getArticleLinks.articleLinks'); // Array of links

    return articleLinks;
  })
  .main(function (task, http, params) {
    console.log('running getArticle task with params: ');
    console.log(params);
    setTimeout(function () {
      task.success('winwon');
    }, 500);
  });


var job = Yakuza.job('Articles', 'Reddit', {subreddits: ['atheism', 'angularjs']});

job.enqueue('getArticleLinks');
job.enqueue('getArticle');

job.on('fail', function () {
  console.log('Job Failed!');
});

job.on('success', function () {
  console.log('Job Succeeded!');
});

job.on('finish', function () {
  console.log('Job Finished..');
});

job.run();
