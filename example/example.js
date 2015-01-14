'use strict';

var Yakuza = require('../yakuza');
var _ = require('lodash');
var cheerio = require('cheerio');

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
    var threadUrl = 'http://reddit.com/r/'+params;
    console.log('Getting article links for '+params);

    http.get(threadUrl, function (err, res, body) {
      var $ = cheerio.load(body);
      var links = [];
      var titleElements = $('a.title');

      // Parse all titles
      $(titleElements).each(function (key, elem) {
        links.push($(elem).attr('href'));
      });

      // Share links for next task to be used
      task.share('articleLinks', links);

      // Finish task and successfully ship data
      return task.success(links);
      // return task.fail(new Error('something failed!'));
    });
  });

var job = Yakuza.job('Articles', 'Reddit', {subreddits: ['atheism', 'angularjs']});

job.enqueue('getArticleLinks');

job.on('fail', function () {
  console.log('Job Failed!');
});

job.on('success', function () {
  console.log('Job Succeeded!');
});

job.on('finish', function () {
  console.log('Job Finished..');
});

job.on('task:success', function (task, data) {
  console.log('\n-- Successfuly funished: '+task.taskId+' --');
  console.log(data);
  console.log('-------------');
});

job.run();
