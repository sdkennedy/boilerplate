"use strict";

// Libraries
var Bacon = require("baconjs");
var Immutable = require("immutable");
// Types
var UpdateResult = require("./types").UpdateResult;

/**
 * Saves each Update event on updateStream via saveFunc creating a stream of the results
 *
 * @param { Bacon.EventStream<Update> } updateRequests stream of update requests
 * @param { function( update:Update ):Promise<obj, Error> } saveFunc called on each incomming update to persists it.
 * @returns { Bacon.EventStream<UpdateResult> } stream containing the result of saving each incomming update
 */
function createUpdateResults(updateRequests, saveFunc) => {
    return updateRequests.flatMap(
        (updateRequest) => {
            var promise = saveFunc( updateRequest ).then(
                (result) => new UpdateResult(true, update, result),
                (error) => new UpdateResult(false, update, null, error)
            );
            return Bacon.fromPromise( promise );
        }
    );
};

/**
 * Creates a Bacon.Property containing updates that have not been saved
 *
 * @param  { Bacon.EventStream<Update> } updateRequests stream of update requests
 * @param  { Bacon.EventStream<UpdateResult> } UpdateResult stream of update results
 * @return { Bacon.Property< Immutable.OrderedSet<Update> > }
 */
function createPendingUpdates(updateRequests, updateResults) => {
    return Bacon.update(
        // Store updates in the order in which they are recieved
        Immutable.OrderedSet(),
        [updateRequests], (pendingUpdates, updateRequest) => pendingUpdates.add(updateRequest),
        [updateResults], (pendingUpdates, updateResult) => pendingUpdates.delete( updateResult.update )
    );
};

module.exports = {
    createUpdateResults,
    createPendingUpdates
};