'use strict';

var Yakuza = require('../yakuza');

// Create scraper
Yakuza.scraper('Articles');

// Create agents
Yakuza.scraper('Articles').agent('Reddit')
  .setup(function (config) {
    config.executionPlan = [
      'getArticleLinks',
      'getArticles'
    ];
  });

// Create tasks
Yakuza.scraper('Articles').agent('Reddit').task('getArticleLinks')
  .main(function (emitter, http) {
    http.get('http://www.reddit.com/', function (err, res, body) {
      console.log(body);
    });
  });


var job = Yakuza.job('Articles', 'Reddit');

job.enqueue('getArticleLinks');
