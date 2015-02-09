/**
* @author Rafael Vidaurre
* @module Task
*/

'use strict';

var Q = require('q');
var Http = require('./http');
var _ = require('lodash');

/**
* Is the product of a Task being built, contains status data, the main method of the task and other,
* stuff required for it to be run
* @class
*/

// TODO: Add id to the task
function Task (taskId, main, params, defaultCookies, config) {

  /** Id of the task's task definition */
  this.taskId = taskId;

  /** Time at which the task started running */
  this.startTime = null;

  /** Time at which the task finished running */
  this.endTime = null;

  /** Time the task spent running */
  this.elapsedTime = null;

  /**
  * Configuration object
  * @private
  */
  this._config = config;

  /**
  * Number of retries performed by the built task
  * @private
  */
  this._retries = 0;

  /**
  * Deferred which controls task's _runningPromise resolution
  * @private
  */
  this._runningDeferred = Q.defer();

  /**
  * Promise which exposes Task's running state
  * @private
  */
  this._runningPromise = this._runningDeferred.promise;

  /**
  * Parameters which will be used by its main method
  * @private
  */
  this._params = params;

  /**
  * Main method to be run
  * @private
  */
  this._main = main;

  /**
  * Storage for the task instance, this saves data which is exposed explicitly via emitter.share()
  * method and is later on provided in the _onSuccess method as an argument of the task's promise's
  * resolve method
  * @private
  */
  this._sharedStorage = {};

  /**
  * Request object for this task instance
  * @private
  */
  this._http = null;

  /**
  * Jar to be saved by the task, if defined it will be used in the next execution block if this task
  * finishes successfully
  * @private
  */
  this._savedJar = null;


  this._http = defaultCookies ? new Http(defaultCookies) : new Http();
}

/**
* Method run when the task finishes running even if errors ocurred
* @private
*/
Task.prototype._onFinish = function () {
  this.endTime = Date.now();
  this.elapsedTime = this.endTime - this.startTime;
};

/**
* Called by the task's emitter object, it exposes a key with its value to be used in another task
* later on
* @param {string} key Key by which the value will be shared
* @param value A value which will be shared
* @private
*/
Task.prototype._onShare = function (key, value) {
  if (value === undefined) {
    throw new Error('Missing key/value in share method call');
  }
  this._sharedStorage[key] = value;
};

/**
* Called in the task's main method when the task ended successfuly
* @param response Data retrieved by the task
* @private
*/
Task.prototype._onSuccess = function (data) {
  var response, hookMessage, stopJob;

  stopJob = false;

  // Response object to be provided to the promise
  response = {
    data: data,
    task: this,
    status: 'success',
    savedCookieJar: this._savedJar
  };

  // Object passed to the hook for execution control and providing useful data
  hookMessage = {
    stopJob: function () {
      stopJob = true;
    },
    data: response.data
  };

  if (_.isFunction(this._config.hooks.onSuccess)) {
    this._config.hooks.onSuccess(hookMessage);
  }

  this._onFinish();

  if (stopJob) {
    this._runningDeferred.reject(response);
  } else {
    this._runningDeferred.resolve(response);
  }
};

/**
* Called in the task's main method, it saves the current cookies that have been set by the task.
* note that the cookies ONLY get applied if the task finishes successfully
* @private
*/
Task.prototype._onSaveCookies = function () {
  // TODO: Accept custom jar as parameter
  var jar;

  // Deep clone the object to avoid it from being updated
  jar = _.cloneDeep(http.getCookieJar());

  this._savedJar = jar;
};

/**
* Called by the task's main method when an error ocurred
* @param {Error} error Error object with stracktrace and everything
* @param {string} message Message explaining what failed
* @private
*/
Task.prototype._onFail = function (error, message) {
  var response;

  response = {
    error: error,
    message: message,
    task: this,
    status: 'fail'
  };

  this._onFinish();
  this._runningDeferred.reject(response);
};

/**
* Run this task's main method by providing it needed parameters. This is where the scraping spends
* most of its time
* @private
*/
Task.prototype._run = function () {
  var emitter = {
    success: this._onSuccess.bind(this),
    fail: this._onFail.bind(this),
    share: this._onShare.bind(this)
  };

  this.startTime = Date.now();

  // TODO: Maybe handle the exception thrown by the onError method to control crashes
  this._main(emitter, this._http, this._params);
};


module.exports = Task;
