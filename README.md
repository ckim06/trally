## Trally


#### Description

Import Rally tickets into Trello.


#### Prerequisites

1. [Get a Trello API key and a write token](https://trello.com/app-key). Pro tip: When generating the token, set the expiration parameter to 'never'.
2. Manually create a Trello board w/ lists
3. [Create a new Rally API key](https://rally1.rallydev.com/login/accounts/index.html#/keys)


#### Example usage

```javascript

var trallyFactory = require('trally');
var trally = trallyFactory({
  rallyApiKey: '_hsEpPBu4QqKYz7qJQnaqgb8E2qTzZEiVqzbnV217UiE',
  trelloApiKey: '41b00aa8e8fe2c1315d96e7384d60eb4',
  trelloToken: '8ba2142d3b75052fc8b82c75b2ee24918e1d6003d20d2863f7cf59a23862201b'
});

var RallyState = trally.constants.RallyState;
var importService = trally.services.importService;

var importParams = {
  rallyProjectId: 'project-id',
  trelloBoardName: 'board-name',
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

```
