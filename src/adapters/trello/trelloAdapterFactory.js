var request = require('request');
var _ = require('lodash');
var Q = require('q');
var listFactory = require('./trelloListFactory');

var BASE_URL = 'https://api.trello.com/1/';
var BOARDS_URL = BASE_URL + 'members/my/boards';


module.exports = function(options) {

  var authParams = {
    key: options.apiKey,
    token: options.token
  };

  function resolveBoardId(boardName) {

    var deferred = Q.defer();

    var queryParams = {
      key: authParams.key,
      token: authParams.token
    };

    var handleResponse = function(err, res, boards) {

      function findBoard() {
        return _(boards).find(function(board) {
          return board.name === boardName;
        });
      }

      if (err) {
        deferred.reject(err);

      } else {

        var board = findBoard();

        (board !== undefined)
            ? deferred.resolve(board.id)
            : deferred.reject(new Error('Could not find the board with name ' + boardName));
      }
    };

    request({ url: BOARDS_URL, qs: queryParams, json: true }, handleResponse);

    return deferred.promise;
  }

  var exports = {

    addCardToList: function(ticket, listId) {
      function url(listId) {
        return BASE_URL + 'lists/' + listId + '/cards';
      }

      var deferred = Q.defer();

      var desc = '';

      var queryParams = {
        // em dash
        name: ticket.id + ' — ' + ticket.name,
        key: authParams.key,
        token: authParams.token
      };

      function handleResponse(err, res, card) {

        if (err) {
          deferred.reject(err);

        } else {
          if(!ticket.tasks) deferred.resolve();
          var checkListParams = {
            name: 'Tasks',
            idCard:card.id,
            key: authParams.key,
            token: authParams.token
          };

          request({ url: BASE_URL + 'checklists', qs: checkListParams, method: 'POST', json: true}, function(err, res, checklist){
            var taskPromises = [];
            var taskPromise = Q.defer();
            _.each(ticket.tasks, function(task){
              var checkitemParams = {
                name: task.ObjectID + ' — ' + task.Name,
                key: authParams.key,
                token: authParams.token
              };
              request({url: BASE_URL + 'cards/' + card.id + '/checklist/' + checklist.id + '/checkItem', qs: checkitemParams, method: 'POST', json:true}, function(err, res){
                taskPromise.resolve();
              });
              taskPromises.push(taskPromise);
            });
            Q.all(taskPromises).then(function() {
              deferred.resolve();
            });
          });


        }
      }

      request({ url: url(listId), qs: queryParams, method: 'POST', json: true }, handleResponse);

      return deferred.promise;
    },

    getListsByBoardId: function(boardId) {

      function url(boardId) {
        return BASE_URL + 'boards/' + boardId + '/lists';
      }

      var deferred = Q.defer();

      var queryParams = {
        key: authParams.key,
        token: authParams.token
      };

      function handleResponse(err, res, lists) {

        if (err) {
          deferred.reject(err);

        } else {

          var mapped = _(lists).map(listFactory).value();

          deferred.resolve(mapped);
        }
      }

      request({ url: url(boardId), qs: queryParams, json: true }, handleResponse);

      return deferred.promise;
    },

    archiveAllListCards: function(listIds) {

      function archiveCards(listId) {
        return exports.archiveListCards(listId);
      }

      function promises() {
        return _(listIds).map(archiveCards).value();
      }

      return Q.all(promises());
    },

    getListsByBoardName: function(boardName) {

      function getLists(boardId) {
        return exports.getListsByBoardId(boardId);
      }

      return resolveBoardId(boardName).then(getLists);
    },

    archiveListCards: function(listId) {

      function url(listId) {
        return BASE_URL + 'lists/' + listId + '/archiveAllCards';
      }

      var deferred = Q.defer();

      function handleResponse(err, res, body) {

        if (err) {
          deferred.reject(err);

        } else {
          deferred.resolve(undefined);
        }
      }

      request({ url: url(listId), qs: authParams, method: 'POST' }, handleResponse);

      return deferred.promise;
    }
  };

  return exports;
};
