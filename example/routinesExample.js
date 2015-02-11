'use strict';

var Yakuza = require('../yakuza');

var scraper = Yakuza.scraper('Scraper');
var agent = Yakuza.agent('Scraper', 'Agent').setup(function (config) {
  config.plan = ['TaskOne', 'TaskTwo', 'TaskThree'];
});

agent.task('TaskOne').main(function (task) {
  console.log('TaskOne executed');
  task.success('TaskOne executed!');
});

agent.task('TaskTwo').main(function (task) {
  console.log('TaskTwo executed');
  task.success('TaskTwo executed!');
});

agent.task('TaskThree').main(function (task) {
  console.log('TaskThree executed');
  task.success('TaskThree executed!');
});

scraper.routine('FirstTwo', ['TaskOne', 'TaskTwo']);
scraper.routine('All', ['TaskOne', 'TaskTwo', 'TaskThree']);
scraper.routine('Some', ['TaskOne', 'TaskThree']);

agent.routine('FirstTwo', ['TaskOne']);
agent.routine('Some', ['TaskOne', 'TaskTwo', 'TaskThree']);

var job1 = Yakuza.job('Scraper', 'Agent', {foo: 'bar'});
var job2 = Yakuza.job('Scraper', 'Agent', {foo: 'bar'});
var job3 = Yakuza.job('Scraper', 'Agent', {foo: 'bar'});


// job1.routine('FirstTwo');
// job1.run();
//
// job2.routine('All');
// job2.run();

job3.routine('Some');
job3.run();
