# baconflux
Proof of concept using Bacon.js to create a Flux-like architecture.

## Installing

Pull down dependancies
```
npm install
```

## Running

To run webpack-dev-server configured with the react-hot-loader

```
grunt serve
```

## Architecture

### Prerequisite concepts
This implementation heavily relies on Functional Reactive Programming (which is different than React). Netflix has produced a very good talk on the topic which can be viewed here: [https://www.youtube.com/watch?v=XRYN2xt11Ek](https://www.youtube.com/watch?v=XRYN2xt11Ek)

### Overview

Here is a diagram of how everything generally fits together:
![Overal Architecture Diagram](https://cloud.githubusercontent.com/assets/8094943/7668549/4167fe78-fbf3-11e4-92b0-6d5fc4352b85.png)

Data generally flows through the system in the following way:

1. React Component calls Action Function
2. Action Function pushes event on to Action Bus
3. Store Property recieves Action Bus events and updates its state accordingly
4. React Component listens for Store Property changes and rerenders its view when necessary

### Stores

#### Overview
The purpose of Flux stores is to hold and manage the modification of application state. Flux stores contain Bacon Properties that listen to Action Buses for events which modify their internal state. Every time a property state changes it in turn emits its own event.

#### Creating Store Properties
Store properties have an initial state and can be mutated by incomming action events. Here is a simplified example:

`createActions` will take each incomming function, create an action bus for it and bind the function's this to that bus. [createActions definition](https://github.com/sdkennedy/baconflux/blob/master/src/scripts/utils/actions.js#L6)
```js

var {actions, buses} = createActions({
    removeItem(id){ this.push(id); },
    setItem(item){ this.push(item); },
});

// Mutation Functions
var deleteItem = (previousItems, id) => previousItems.delete(id);
var setItem = (previousItems, item) => previousItems.set(item.get("id"), item);

// Store Property
var todoItems = Bacon.update(
    Immutable.OrderedMap(),
    [buses.removeItem], deleteItem,
    [buses.setItem], setItem
);
```

Properties can then be used in the following way:
```js
var unsubscribeFn = todoItems.onValue(
    (items) => console.log( JSON.stringify( items.toJS() ) )
);

actions.setItem({ id:1, text:"First todo list item!"});
// { "1": { "id":1, "text":"First todo list item!" } }
actions.setItem({ id:2, text:"Second todo list item!"});
// { "1": { "id":1, "text":"First todo list item!" }, "2": { "id":2, "text":"Second todo list item!" } }
actions.removeItem(1);
// { "2": { "id":2, "text":"Second todo list item!" } }

// If we are done listening to todoItems we can unsubscribe with unsubscribeFn.
unsubscribeFn()
```

#### Using Store Properties in React
Although React components can manually subscribe/unsubscribe on componentDidMount/componentWillUnmount respectively, the [react-bacon](https://github.com/jamesmacaulay/react-bacon) library provides a mixin that conveniently assigns the current value of a Bacon.js Property to a state key. When the property value changes so does the state property value.
This avoids the boilerplate of having to constantly subscribe and unsubscribe from properties.
```js
var App = React.createClass({
    mixins:[ ReactBaconMixin ],
    componentWillMount() {
        this.plug(todoStore.items, 'todoItems');
    },

    render() {
        return D.div(
            { className:"main" },
            TodoList({
                items:this.state.todoItems
            })
        );
    }
});
```

### The Functional Part of FRP
The great thing about using FRP is that EventStreams (Action Buses) and Properties can be composed and transformed into new EventStreams and Properties with functional operators.

#### Composed Properties
If we had two properties `todoStore.items` {Immutable.Map()} and `todoStore.checkedItemIds` {Immutable.Set()} you can compose those properties in a new function `todoStore.checkedItems` that stores all of the checked items. When `todoStore.items` or `todoStore.checkedItemIds` update, `todoStore.checkedItems` will automatically be updated as well.
```js
var checkedItems = Bacon.combineWith(
    (items, checkedItemIds) => items.filter( (item) => checkedItemIds.has(item.id) ),
    todoStore.items,
    todoStore.checkedItemIds
);
```

#### Interaction with Asyncronous APIs 
When making potentially slow API requests, it is some times useful to optimistically update the UI state before making the request and then reconciling the UI state after the request fails or succeeds. Being able to create derived action EventStreams can solve this problem elegantly.

If we have an Action Bus (EventStream) ```loadItemsBusStarted``` we can create a derived Action Bus ``` loadItemsBusFinished``` that will fire an event after the API call has completed.

```js
var loadItemsBusFinished = loadItemsBusStarted
    .flatMap( (event) => Bacon.fromPromise($.get("api/todoItems")) )
    .map( (elements) => { success:true, elements:elements } )
    .flatMapError( (error) => Bacon.constant({ success:false, error:error }) );
```

It is easiest to think of FRP operators like functional array operators. Bacon.fromPromise creates a nested EventStream (think array) with [0..1] events. So for each incomming event we are creating a nested EventStream  instead of a new event. This is equivalent to:

```js
var initialArray = [1,2,3];
initialArray.map( (item) => [item] );
// [ [1], [2], [3] ]

// If javascript had flatMap it would do map, then concatenates all of the sub arrays
initialArray.flatMap( (item) => [item] );
// [ 1, 2, 3 ]
```

We can now build our todoStore.items Property with both the ```loadItemsBusStarted``` and ```loadItemsBusFinished``` events.
```js
var setLoading = (items, event) => items.set("loading", true);
var setError = (items, error) => items.merge({ loading:false, error:error });
var setElements = (items, elements) => items.merge({ error:null, loading:false, loaded:true, element:elements });
var items = Bacon.update(
    Immutable.Map({
        error:null,
        loaded:false,
        loading:false,
        elements:Immutable.List()
    }),
    [loadItemsBusStarted], setLoading,
    [loadItemsBusFinished], (items, event) => {
        if(event.success){
            return setElements(items, event.elements);
        } else {
            return setError(items, event.error);
        }
    }
);
```

### Performance

These are some preliminary performance considerations.

#### Atomic Property Updates
One great aspect of Bacon.js is that properties composed of other properties are updated atomically.
If a have a property A and two properties B, C that are derived from A and a Property D that is derived from B + C, Bacon.js is smart enough to only fire on change event for D. This is because all derived properties are updated atomically before firing any change events. You can read more about this [here](https://baconjs.github.io/api.html#atomic-updates). 

This usually results in one action event only causing one rerendering of the UI. Although one Action Bus event might cause a derived Action Buses to fire an event. [See: Interaction With Asyncronous APIs ](#interaction-with-asyncronous-apis)
