/**
 * Copyright 2010 Ajax.org B.V.
 *
 * This product includes software developed by
 * Ajax.org B.V. (http://www.ajax.org/).
 *
 * Author: Fabian Jaokbs <fabian@ajax.org>
 */

var pkg = require('../package.json');
var debug = require('debug')(pkg.name);
var Request = require('./request');

/**
 * @param proxy String http://some.proxy/
 * @param http bool Prefer clear text?
 * @constructor
 */
var BitBucket = function(proxy, http){

  /**
   * Define HTTP proxy in format localhost:3128
   */
  if (proxy) {
    /* eslint-disable key-spacing, max-len, camelcase */
    this.$proxy_host = proxy.split(':')[0];
    this.$proxy_port = proxy.split(':')[1];
    /* eslint-enable key-spacing, max-len, camelcase */
  }
  if (http) {
    /* eslint-disable key-spacing, max-len, camelcase */
    this.$use_http = true;
    /* eslint-enable key-spacing, max-len, camelcase */
  }
  /**
   * The list of loaded API instances
   */
  this.$apis = [];

  /**
   * The request instance used to communicate with GitHub
   */
  this.$request = null;
};

/**
 * Authenticate a user for all next requests
 *
 * @param {String} login      GitHub username
 * @param {String} token      GitHub private token
 * @return {BitBucket}        fluent interface
 */
BitBucket.prototype.authenticate = function(login, token) {
  debug('Deprecated: use \'authenticateToken\' instead!');
  return this.authenticateToken(login, token);
};

/**
 * Authenticate a user for all next requests using an API token
 *
 * @param {String} login      GitHub username
 * @param {String} token      GitHub API token
 * @return {BitBucket}        fluent interface
 */
BitBucket.prototype.authenticateToken = function(login, token)
{
  this.getRequest()
    .setOption('login_type', 'token')
    .setOption('username', login)
    .setOption('api_token', token);

  return this;
};

/**
 * Authenticate a user for all next requests using an API token
 *
 * @param {String} login      GitHub username
 * @param {String} password   GitHub password
 * @return {BitBucket}        fluent interface
 */
BitBucket.prototype.authenticatePassword = function(login, password)
{
  this.getRequest()
    .setOption('login_type', 'basic')
    .setOption('username', login)
    .setOption('password', password);

  return this;
};

/**
 * Authenticate a user for all next requests using an API token
 *
 * @param {OAuth} oauth
 * @param {String} accessToken
 * @param accessTokenSecret
 * @return {BitBucket}        fluent interface
 */
BitBucket.prototype.authenticateOAuth =
  function(oauth, accessToken, accessTokenSecret)
  {
    this.getRequest()
      .setOption('login_type', 'oauth')
      .setOption('oauth', oauth)
      .setOption('oauth_access_token', accessToken)
      .setOption('oauth_access_token_secret', accessTokenSecret);

    return this;
  };

/**
 * Deauthenticate a user for all next requests
 *
 * @return {BitBucket}               fluent interface
 */
BitBucket.prototype.deAuthenticate = function() {
  this.getRequest()
    .setOption('login_type', 'none');

  return this;
};

/**
 * Call any route, GET method
 * Ex: api.get('repos/show/my-username/my-repo')
 *
 * @param {String}  route            the GitHub route
 * @param {Object}  parameters       GET parameters
 * @param {Object}  requestOptions   reconfigure the request
 * @param callback (err{msg:''}, body{})
 * @returns {Request}
 */
BitBucket.prototype.get =
  function(route, parameters, requestOptions, callback) {
    return this.getRequest()
      .get(route, parameters || {}, requestOptions, callback);
  };

/**
 * Call any route, DELETE method
 * Ex: api.delete('repos/show/my-username/my-repo')
 *
 * @param {String}  route            the GitHub route
 * @param {Object}  parameters       GET parameters
 * @param {Object}  requestOptions   reconfigure the request
 * @param callback (err{msg:''}, body{})
 * @returns {Request}
 */
/* eslint-disable dot-notation */
BitBucket.prototype['delete'] =
/* eslint-enable dot-notation */
  function(route, parameters, requestOptions, callback) {
    return this.getRequest()
      .send(route, parameters, 'DELETE', requestOptions, callback);
  };

/**
 * Call any route, POST method
 * Ex: api.post('repos/show/my-username',
 *        {'email': 'my-new-email@provider.org'})
 *
 * @param {String}  route            the GitHub route
 * @param {Object}  parameters       POST parameters
 * @param {Object}  requestOptions   reconfigure the request
 * @param callback (err{msg:''}, body{})
 * @returns {Request}
 */
BitBucket.prototype.post =
  function(route, parameters, requestOptions, callback) {
    return this.getRequest()
      .post(route, parameters || {}, requestOptions, callback);
  };

/**
 * Get the request
 *
 * @return {Request}  a request instance
 */
BitBucket.prototype.getRequest = function()
{
  if (!this.$request) {
    this.$request = new Request({
      /* eslint-disable key-spacing, max-len, camelcase */
      'proxy_host': this.$proxy_host,
      'proxy_port': this.$proxy_port,
      'protocol' : this.$use_http ? 'http' : 'https'
      /* eslint-enable key-spacing, max-len, camelcase */
    });
  }

  return this.$request;
};

/**
 * Get the user API
 *
 * @return {UserApi}  the user API
 */
BitBucket.prototype.getUserApi = function()
{
  if (!this.$apis.user) {
    this.$apis.user = new (require('./user') )(this);
  }

  return this.$apis.user;
};

/**
 * Get the users API
 *
 * @return {UsersApi}  the users API
 */
BitBucket.prototype.getUsersApi = function()
{
  if (!this.$apis.users) {
    this.$apis.users = new (require('./users') )(this);
  }

  return this.$apis.users;
};

/**
 * Get the repo API
 *
 * @return {RepoApi}  the repo API
 */
BitBucket.prototype.getRepoApi = function()
{
  if (!this.$apis.repo) {
    this.$apis.repo = new (require('./repo') )(this);
  }

  return this.$apis.repo;
};

/**
 * Get the ssh API
 *
 * @return {SshApi}  the SSH API
 */
BitBucket.prototype.getSshApi = function()
{
  if (!this.$apis.ssh) {
    this.$apis.ssh = new (require('./ssh') )(this);
  }

  return this.$apis.ssh;
};

/**
 * Get the email API
 *
 * @return {EmailApi}  the email API
 */
BitBucket.prototype.getEmailApi = function()
{
  if (!this.$apis.email) {
    this.$apis.email = new (require('./email') )(this);
  }

  return this.$apis.email;
};

/* eslint-disable */
// @todo
//    /**
//     * Get the issue API
//     *
//     * @return {IssueApi} the issue API
//     */
//    this.getIssueApi = function()
//    {
//        if(!this.$apis['issue']) {
//            this.$apis['issue'] = new (require('./github/IssueApi').IssueApi)(this);
//        }
//
//        return this.$apis['issue'];
//    };
//
//    /**
//     * Get the pull API
//     *
//     * @return {PullApi} the pull API
//     */
//    this.getPullApi = function()
//    {
//        if(!this.$apis['pull']) {
//            this.$apis['pull'] = new (require('./github/PullApi').PullApi)(this);
//        }
//
//        return this.$apis['pull'];
//    };
//
//    /**
//     * Get the object API
//     *
//     * @return {ObjectApi} the object API
//     */
//    this.getObjectApi = function()
//    {
//        if(!this.$apis['object']) {
//            this.$apis['object'] = new (require('./github/ObjectApi').ObjectApi)(this);
//        }
//
//        return this.$apis['object'];
//    };
//
//    /**
//     * Get the commit API
//     *
//     * @return {CommitTest} the commit API
//     */
//    this.getCommitApi = function()
//    {
//        if(!this.$apis['commit']) {
//            this.$apis['commit'] = new (require('./github/CommitApi').CommitApi)(this);
//        }
//
//        return this.$apis['commit'];
//    };
/* eslint-enable */


module.exports = BitBucket;
