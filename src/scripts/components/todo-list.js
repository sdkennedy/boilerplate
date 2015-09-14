"use strict";

var React = require("react/addons");
var TodoListItems = require("scripts/components/todo-list-items");
var TodoListAddItem = require("scripts/components/todo-list-add-item");

var D = React.DOM;

// CSS
require("styles/components/todo-list.less");

var TodoList = React.createClass({

    displayName: "TodoList",

    render() {
        return D.div(
            { className:"todo-list" },
            D.h1(null, "Todo Lists"),
            TodoListAddItem(),
            TodoListItems({
                items:this.props.items,
                checkedItemIds: this.props.checkedItemIds
            })
        );
    }
});

module.exports = TodoList;