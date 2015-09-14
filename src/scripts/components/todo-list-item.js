"use strict";

var { toggleItem, removeItem } = require("scripts/actions/todo-list").actions;
var React = require("react/addons");

var D = React.DOM;

// CSS
require("styles/components/todo-list-item.less");

var TodoListItem = React.createClass({

    displayName: "TodoListItem",

    render() {
        return D.li(
            {
                className:"todo-list-item",
                onClick:this.handleClickItem
            },
            D.div(
                { className:"value" },
                this.renderCheckbox(),
                this.renderItemText()
            ),
            this.renderDeleteButton()
        );
    },

    renderCheckbox() {
        return D.input({
            type:"checkbox",
            checked:this.props.checked,
            onChange:this.handleChangeCheckbox
        });
    },

    renderItemText() {
        return D.span(
            null,
            this.props.item.get("text")
        );
    },

    renderDeleteButton() {
        return D.button(
            {
                className:"delete",
                onClick:this.handleClickDelete
            },
            "X"
        );
    },

    handleClickDelete(e) {
        removeItem( this.props.item.get("id") );
    },

    handleClickItem(e) {
        var checked, item;
        var target =  e.target;
        if([ "INPUT", "BUTTON" ].indexOf(target.tagName) === -1 ){
            item = this.props.item;
            this.toggleItem( !this.props.checked );
        }
    },

    handleChangeCheckbox(e) {
        this.toggleItem( e.target.checked );
    },

    toggleItem(checked) {
        toggleItem( this.props.item.get("id"), checked );
    }
});

module.exports = TodoListItem;