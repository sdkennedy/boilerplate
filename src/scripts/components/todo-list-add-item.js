"use strict";

var addItem = require("scripts/actions/todo-list").actions.addItem;
var React = require("react/addons");

var D = React.DOM;

// CSS
require("styles/components/todo-list-add-item.less");

var TodoListAddItem = React.createClass({


    displayName: "TodoListAddItem",

    getInitialState() {
        return { text:"" };
    },

    render() {
        return D.input({
            className:"todo-list-add-item",
            placeholder:"Enter a new note",
            onChange:this.handleInputChange,
            onKeyPress:this.handleInputKeyPress,
            value:this.state.text
        });
    },

    handleInputChange(e) {
        this.setState({ text:e.target.value });
    },

    handleInputKeyPress(e) {
        // Enter press
        if(e.charCode === 13){
            addItem( this.state.text );
            this.setState({ text:"" });
        }
    }

});

module.exports = TodoListAddItem;