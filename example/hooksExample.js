'use strict';

var Yakuza = require('../yakuza');

Yakuza.scraper('hookTest').agent('fooAgent')
  .setup(function (config) {
    config.plan = ['firstTask', 'secondTask'];
  });

Yakuza.scraper('hookTest').agent('fooAgent').task('firstTask')
  .setup(function (config) {
    config.hooks.onSuccess = function (event) {

      console.log('Task firstTask successfully ended with event:');
      event.stopJob();

      return;
    };
  })
  .main(function (job) {
    setTimeout(function () {
      job.success('value');
    }, 1203);
  });

Yakuza.scraper('hookTest').agent('fooAgent').task('secondTask')
  .setup(function (config) {
    config.hooks.onSuccess = function (event) {

      console.log('Task secondTask successfully ended with event:');
      console.log(event);
      return;
    };
  })
  .main(function (job) {
    setTimeout(function () {
      job.success('finishing value');
    }, 1232);
  });

var job = Yakuza.job('hookTest', 'fooAgent');

job.on('job:success', function () {
  console.log('Job successfully finished');
});

job.on('job:finish', function () {
  console.log('Job finished');
});

job.enqueue('firstTask').enqueue('secondTask');

job.run();
