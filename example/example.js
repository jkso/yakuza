'use strict';

var Yakuza = require('../yakuza');

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
  .main(function (emitter, http) {
    http.get('http://www.reddit.com/', function (err, res, body) {
      console.log(body);
    });
  })
  .builder(function (job) {
    console.log(job);
  });


var job = Yakuza.job('Articles', 'Reddit', {subreddit: 'atheism'});

job.enqueue('getArticleLinks');

job.run();
