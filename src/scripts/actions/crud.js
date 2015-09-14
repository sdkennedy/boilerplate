"use strict";

// Libraries
var Immutable = require("immutable");
// Actions
var createActions = require("scripts/utils/actions").createActions;

// Stores listen to buses, components call actions
var { buses, actions } = createActions({
    update(id, entity) {
        this.push(Immutable.Map({id, entity}));
    }
});

module.exports = { buses, actions };