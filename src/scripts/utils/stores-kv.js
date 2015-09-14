var Bacon = require("baconjs");

function applyUpdate(store, update) {
    var id = update.get("id");
    var entity = update.get("entity");

    if( !id ){
        // Do nothing
    } else if ( !entity ) {
        return store.delete(id);
    } else {
        return store.set(id, entity);
    }
}

function createKVStore(updateStream, exportStream){
    return Bacon.update(
        Immutable.Map(),
        [updateStream], applyUpdate,
        [exportStream], (store, _) => store
    );
}

function createOptimisticKVStore(kvStore, pendingUpdates){
    return Bacon.combineWith(
        (store, pendingUpdates) => store.pendingUpdates.reduce( applyUpdate, store ),
        kvStore,
        pendingUpdates
    )
}

module.exports = { createKVStore, createOptimisticKVStore }