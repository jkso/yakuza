'use strict';

var Yakuza = require('../yakuza');
var _ = require('lodash');
var cheerio = require('cheerio');

Yakuza.scraper('Loginer');

Yakuza.scraper('Loginer').agent('Santander')
  .setup(function (config) {
    config.plan = [
      {taskId: 'login'},
      {taskId: 'afterLogin'}
    ];
  });

Yakuza.task('Loginer', 'Santander', 'login')
  .builder(function (job) {
    return job.params.credentials;
  })

  .main(function (task, http, params) {
    var username, password, baseUrl, opts, loginData;

    username = params.username;
    password = params.password;
    baseUrl = 'https://www.santander.cl/transa/cruce.asp';

    loginData = {
      'd_rut' : '',
      'd_pin' : '',
      'hrut' : '',
      'rut' : username,
      'IDLOGIN' : 'BancoSantander',
      'tipo' : 0,
      'pin' : password,
      'usateclado' : 'si',
      'dondeentro' : 'home',
      'rslAlto' : '768',
      'rslAncho' : '1366'
    };

    opts = {
      headers: {
        'followRedirect': true,
        'User-Agent': '',
        'Content-Type' : 'application/x-www-form-urlencoded; charset=utf8',
        'Accept-Encoding': ''
      },
      url: baseUrl,
      form: loginData
    };

    http.post(opts, function (err, res, body) {
      task.share('url', res.headers.location);
      task.saveCookies();
      task.success('Authorized');
    });
  });

Yakuza.task('Loginer', 'Santander', 'afterLogin')
  .builder(function () {
    console.log(true);
  })
  .main(function (task, http, params) {
    console.log('Jar received in afterLogin jar is: ');
    console.log(JSON.stringify(http.getCookieJar()));

    task.success();
  });

var jobParams = {
  credentials: {
    username: '15.311.907-4',
    password: '6958'
  }
};

var loginTestJob = Yakuza.job('Loginer', 'Santander', jobParams);

loginTestJob.enqueue('login');
loginTestJob.enqueue('afterLogin');

loginTestJob.on('fail', function (response) {
  console.log('Job Failed!');
});

loginTestJob.on('success', function (response) {
  console.log('Job Succeeded!');
})

loginTestJob.run();
