"use strict";

// Libraries
var Bacon = require("baconjs");
var Bluebird = require("bluebird");
var Immutable = require("immutable");
// Buses
var crudBuses = require("scripts/actions/crud").buses;

function createUpdateResults(updateBus, saveFunc) => {
    return updateBus.flatMap(
        (update) => Bacon.fromPromise( saveFunc(update) )
    );
};

function createPendingUpdates(updateBus, updateResults) => {
    return Bacon.update(
        // Store updates in the order in which they are recieved
        Immutable.OrderedSet(),
        [crudBuses.update], (updates, update) => updates.add(update),
        [updateResults], (updates, result) => updates.delete( result.get("update") )
    );
};

function createConfirmedEntities(updateResults) => {
    var successfulUpdates = updateResults
        .filter( (result) => result.get("success") )
        .map( (result) => result.get("update") );

    return Bacon.update(
        Immutable.Map(),
        [successfulUpdates], (entities, update) => entities.set( update.get("id"), update.get("entity") )
    );
};

function createOptimisticEntities(confirmedEntities, pendingUpdates) => {
    return Bacon.combineWith(
        (confirmedEntities, pendingUpdates) => {
            // Apply pendingUpdates to confirmedEntities
            return pendingUpdates.reduce(
                (acc, update) => acc.set(update.get("id"), update.get("entity")),
                confirmedEntities
            );
        },
        confirmedEntities,
        pendingUpdates
    );
};

function createEntityStore(updateBus, saveFunc) => {
    var updateResults = createUpdateResults(updateBus, saveFunc);
    var pendingUpdates = createPendingUpdates( updateBus, updateResults );
    var successfulUpdates = createSuccessfulUpdates();
    var confirmedEntities = createConfirmedEntities(updateResults);
    var optimisticEntities = createOptimisticEntities(confirmedEntities, pendingUpdates);
    return {
        updateResults,
        pendingUpdates,
        successfulUpdates,
        confirmedEntities,
        optimisticEntities
    };
};

module.exports = createEntityStore;