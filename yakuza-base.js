/**
* @module YakuzaBase
* @author Rafael Vidaurre
* @requires Utils
* @requires Scraper
* @requires Job
*/

'use strict';

var shortId = require('shortid');
var utils = require('./utils');
var _ = require('lodash');
var Scraper = require('./scraper');
var Job = require('./job');

/**
* Main singleton class used to define scrapers and their properties
* @class
*/
function YakuzaBase () {
  /**
  * Set of scraper instances
  * @private
  */
  this._scrapers = {};

  /**
  * Set of job instances
  * @private
  */
  this._jobs = {};

  /**
  * Share methods available at framework-level
  * @private
  */
  this._shareMethods = {};
}

/**
* Creates a new scraper instance
* @param {string} scraperId name to be asigned to the created scraper
* @return {Scraper} scraper created
* @private
*/
YakuzaBase.prototype._createScraper = function (scraperId) {
  this._scrapers[scraperId] = new Scraper();
  return this._scrapers[scraperId];
};

/**
* Returns a scraper instance, if it doesn't exist, it creates it
* @param {string} scraperId name for the new scraper or by which to look for if it exists
* @return {Scraper} scraper instance
*/
YakuzaBase.prototype.scraper = function (scraperId) {
  var thisScraper, scraperExists;

  scraperExists = utils.hasKey(this._scrapers, scraperId);
  thisScraper = scraperExists ? this._scrapers[scraperId] : this._createScraper(scraperId);

  return thisScraper;
};

/**
* Returns an agent instance, if it doesn't exists, it creates it
* @param {string} scraperId name of the scraper to which the agent belongs to
* @param {string} agentId name of the new agent or by which to look for if it exists
* @return {Agent} agent instance
*/
YakuzaBase.prototype.agent = function (scraperId, agentId) {
  return this.scraper(scraperId).agent(agentId);
};

YakuzaBase.prototype.task = function (scraperId, agentId, taskId) {
  return this.agent(scraperId, agentId).task(taskId);
};

/**
* Instances a new job
* @param {string} scraperId name of the scraper that will be used by the Job
* @param {string} agentId name of the agent that will be used by the Job
* @return {Job} Job instance that has been created
*/
YakuzaBase.prototype.job = function (scraperId, agentId, params) {
  var newId, scraper, agent, newJob;

  scraper = this._scrapers[scraperId];
  agent = scraper._agents[agentId];
  newId = shortId.generate();
  newJob = new Job(newId, scraper, agent, params);
  this._jobs[newId] = newJob;

  return newJob;
};

/**
* Applies all configurations for all scrapers and agents, Yakuza can eager-load (via this
* method) or lazy-load (by running a job).
*/
YakuzaBase.prototype.ready = function () {
  _.each(this._scrapers, function (scraper) {
    scraper._applySetup();
    _.each(scraper._agents, function (agent) {
      agent._applySetup();
    });
  });
};

/**
* Defines a custom share method which will be available to any scraper
* @param {string} methodName Name of the method to be defined
* @param {function} sharingFunction Function to be used
*/
YakuzaBase.prototype.addShareMethod = function (methodName, shareFunction) {
  if (!_.isString(methodName)) {
    throw new Error('Share method name must be a string');
  }

  if (!_.isFunction(shareFunction)) {
    throw new Error('Share method must be a function')
  }
  
  this._shareMethods[methodName] = sharingFunction;
};

module.exports = YakuzaBase;
