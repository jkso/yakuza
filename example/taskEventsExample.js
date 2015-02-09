var Yakuza = require('../yakuza.js');

Yakuza.scraper('Test');
Yakuza.agent('Test', 'AgentOne').setup(function (config) {
  config.plan = [
    ['TaskOne', 'TaskTwo', 'TaskThree']
  ]
});

Yakuza.task('Test', 'AgentOne', 'TaskOne').main(function (task) {
  var time = Math.floor(Math.random() * (3000 - 400 + 1)) + 400;
  setTimeout(function () {
    // task.fail(new Error ('Shit went south'), 'Help us please!')
    task.success('no proble captn');
  }, time);
});

Yakuza.task('Test', 'AgentOne', 'TaskTwo').main(function (task) {
  var time = Math.floor(Math.random() * (3000 - 400 + 1)) + 400;
  setTimeout(function () {
    // task.fail(new Error ('NOOOO'), 'Doomed')
    task.success('no proble captn');
  }, time);
});

Yakuza.task('Test', 'AgentOne', 'TaskThree').main(function (task) {
  var time = Math.floor(Math.random() * (3000 - 400 + 1)) + 400;

  setTimeout(function () {
    task.fail(new Error ('Please kill me'), '666')
    // task.success('no proble captn');
  }, time);
});

var job = Yakuza.job('Test', 'AgentOne');

job.on('success', function () {
  console.log('Job success');
});
job.on('fail', function (response) {
  console.log('Job fail');
  console.log(response);
});

job.on('task:*:fail', function (response) {
  console.log('Task failed');
  console.log(response);
});

job.on('task:*:success', function (response) {
  console.log('Task succeeded');
  console.log(response);
});

job.enqueue('TaskOne');
job.enqueue('TaskTwo');
job.enqueue('TaskThree');

job.run();
