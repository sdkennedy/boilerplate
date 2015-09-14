"use strict";

var createActions = require("scripts/utils/actions").createActions;

// Stores listen to buses, components call actions
var { buses, actions } = createActions({
    addItem(text) {
        this.push({text});
    },
    removeItem(id) {
        this.push(id);
    },
    setItem(item) {
        this.push(item);
    },
    toggleItem(id, checked) {
        this.push({id, checked});
    }
});

module.exports = { buses, actions };