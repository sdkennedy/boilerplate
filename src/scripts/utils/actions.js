"use strict";

var Bacon = require("baconjs");
var _ = require("lodash");

var createActions = (unboundActions) => {
    var buses = {};
    var actions = {};
    _.forEach(
        unboundActions,
        (unboundAction, actionName) => {
            var bus = new Bacon.Bus();
            var boundAction = unboundAction.bind(bus);
            buses[actionName] = bus;
            actions[actionName] = boundAction;
        }
    );
    return {
        // Stores listen to buses
        buses,
        // Components call bound actions
        actions
    };
};

module.exports = { createActions };