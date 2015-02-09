'use strict';

var Yakuza = require('../yakuza');
var _ = require('lodash');
var cheerio = require('cheerio');

Yakuza.scoper('Loginer');

Yakuza.scraper('Loginer').agent('Santander')
  .setup(function (config) {
    config.plan = [
      {taskId: 'login'},
      {taskId: 'afterLogin'}
    ];
  });

Yakuza.scraper('Loginer').agent('Santander').task('login')
  .builder(function (job) {
    return job.params.credentials;
  })

  .main(function (task, http, params) {
    var username, password, baseUrl, opts;


    username = params.credentials.username;
    password = params.credentials.password;
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
      opts = sb.http.options();
      task.share('url', res.headers.location);
      task.saveCookies();
      task.success('Authorized');
    });
  });

Yakuza.task('Loginer', 'Santander', 'afterLogin')

var jobParams = {
  {credentials: {
    username: '15.311.907-4',
    password: '6958'}
  }
};

var loginTestJob = Yakuza.job('Loginer', 'Santander', jobParams});
