'use strict';

var Yakuza = require('../yakuza');
var _ = require('lodash');
var cheerio = require('cheerio');

var imagesScraper = Yakuza.scraper('images');
var googleAgt = imagesScraper.agent('9gag');

var searchTsk = googleAgt.task('search');
var getPostTsk = googleAgt.task('getPost');
var shipTsk = googleAgt.task('ship');

googleAgt.setup(function (config) {
  config.plan = [
    'search',
    'getPost',
    'ship'
  ];
});

// Search task
searchTsk.builder(function (job) {
  var sets = [];

  _.each(job.params.queries, function (query) {
    sets.push({query: query});
  });

  return sets;
});
searchTsk.main(function (task, http, params) {
  var links, query, queryUrl;

  links = [];
  query = params.query;
  queryUrl = 'http://9gag.com/search?query=' + query;

  http.get(queryUrl, function (err, res, body) {
    var $ = cheerio.load(body);
    var badges = $('.badge-entry-collection').find('li');

    $(badges).each(function (idx, elem) {
      links.push($(elem).attr('data-entry-url'));
    });

    task.share('links', links, {concat: true});
    task.success(links);
  });

});

// Get posts data
getPostTsk.builder(function (job) {
  var links = job.shared('search.links');

  return links;
});
getPostTsk.main(function (task, http, params) {
  var baseUrl = 'http://www.9gag.com';
  var path = params;
  var url = baseUrl + path;
  var post = {};

  http.get(url, function (err, res, body) {
    var $ = cheerio.load(body);

    post.title = $('.badge-item-title').text();
    post.imageUrl = $('.badge-item-img').attr('src');

    task.share('posts', post, {concat: true});
    task.success(post);
  });
});

// Ship all posts into one response
shipTsk.builder(function (job) {
  var posts = job.shared('getPost.posts');

  console.log(posts);

  return posts
});
shipTsk.main(function (task, http, params) {
  task.success(params);
});


// Create job
var job = Yakuza.job('images', '9gag', {queries: ['good', 'fun']});

job.enqueue('search');
job.enqueue('getPost');
job.enqueue('ship');

job.on('task:success', function (task, data) {
  console.log('\n-- Successfuly funished: '+task.taskId+' --');
  console.log(data);
  console.log('-------------');
});

job.on('job:success', function (task, data) {
  console.log('Job succeeded');
});

job.run();
