"use strict";

var Immutable = require("immutable");
var React = require("react/addons");
var TodoListItem = require("scripts/components/todo-list-item");

var D = React.DOM;

// CSS
require("styles/components/todo-list-items.less");

var TodoListItems = React.createClass({

    displayName: "TodoListItems",

    getDefaultProps() {
        return {
            selectedItem:null,
            items:Immutable.OrderedMap()
        };
    },

    render() {
        return D.ul(
            { className:"todo-list-items" },
            this.props.items
                .map( this.renderItem  )
                .toJS()
        );
    },

    renderItem(item) {
        return TodoListItem({
            item,
            checked:this.props.checkedItemIds.has( item.get("id") )
        });
    }
});

module.exports = TodoListItems;