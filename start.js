var trallyFactory = require('./index.js');
var API_KEYS = require('./api-keys.js')

var trally = trallyFactory(API_KEYS.API_KEYS);

var RallyState = trally.constants.RallyState;
var importService = trally.services.importService;

var importParams = {
  rallyProjectId: API_KEYS.rallyProjectId,
  trelloBoardName: 'Rally Integration',
  stateMappings: [
    [RallyState.BACKLOG, 'ToDo'],
    [RallyState.DEFINED, 'ToDo'],
    [RallyState.IN_PROGRESS, 'Active'],
    [RallyState.COMPLETED, 'Testing'],
    [RallyState.ACCEPTED, 'Done']
  ]
};

importService.importCurrentRallySprintIntoTrello(importParams).then(function() {
  console.log('Tickets imported');
}).catch(function(e) {
  console.log('Error while importing', e);
}).done();

// Get trello cards, get rally tickets.  Update data with newest.
