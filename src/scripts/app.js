"use strict";

// Libraries
var Immutable = require("immutable");
var React = require("react/addons");
var ReactBaconMixin = require("react-bacon").BaconMixin;
var _ = require("lodash");
// Actions
var crudActions = require("scripts/actions/crud").actions;
// Stores
var todoStore = require("scripts/stores/todo-list");
var crudStore = require("scripts/stores/crud");
// Components
var TodoList = require("scripts/components/todo-list");

var D = React.DOM;

// CSS
require("styles/main.less");

var App = React.createClass({

    mixins:[ ReactBaconMixin ],

    componentWillMount() {
        this.plug(todoStore.items, 'todoItems');
        this.plug(todoStore.checkedItemIds, 'todoCheckedItemIds');
    },

    render() {
        return D.div(
            { className:"main" },
            TodoList({
                items:this.state.todoItems,
                checkedItemIds:this.state.todoCheckedItemIds
            })
        );
    }
});

var startTime = new Date().getTime();
var now = () => (new Date()).getTime();
_.forEach(
    crudStore,
    (prop, key) => {
        prop.onValue( (val) => {
            console.log(`${now() - startTime} ${key} -> ${val}`);
        });
    }
);
crudActions.update(1, Immutable.Map({name:"Test"}) );
crudActions.update(1, Immutable.Map({name:"Test Updated"}) );
crudActions.update(1, null );

module.exports = App;