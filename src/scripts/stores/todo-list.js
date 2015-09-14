"use strict";

var Bacon = require("baconjs");
var Immutable = require("immutable");
var todoListBuses = require("scripts/actions/todo-list").buses;

// items mutation functions
var deleteItem = (items, id) => items.delete(id);
var setItem = (items, item) => items.set(item.get("id"), item);

var addItem = todoListBuses.addItem.scan(
    null,
    (prevItem, {text}) => {
        // Create an auto incrementing id
        var id = prevItem ? (prevItem.get("id")+1) : 0;
        return Immutable.Map({ id, text });
    }
).changes();

// items property
var items = Bacon.update(
    Immutable.OrderedMap(),
    [todoListBuses.removeItem], deleteItem,
    [todoListBuses.setItem], setItem,
    [addItem], setItem
);

var toggleCheckedItemId = (checkedItems, { id, checked}) => checkedItems[checked ? "add" : "delete"](id);
// selectedItemId property
var checkedItemIds = Bacon.update(
    Immutable.Set(),
    [todoListBuses.toggleItem], toggleCheckedItemId
);

module.exports = {
    items,
    checkedItemIds
};