# redux-typed-modules

Based on the [ducks-modular-redux / Redux modules](https://github.com/erikras/ducks-modular-redux) pattern, this library provides a simple, developer friendly, method for defining strongly typed modules in a pattern that will integrate seemlessly into projects currently following the Redux modules pattern.

Key features

- exports interface matching existing Redux module pattern. No changes required outside the module file!
- support for a transform method which is called after every reducer is run.
- support for a method to be called to add extra 'module global' data to actions, useful for adding timing.
- fully typed actions and reducers specific to the individual action!

Limitations

- Actions accept only one or no argument. To pass multiple arguments, use an object. Hoping for [variadic kinds](https://github.com/Microsoft/TypeScript/issues/5453) to be supported by TypeScript so I can change this.

## Installation

```shell
npm i --save redux-typed-modules
```

## Usage

Here is a basic TODO module using `redux-typed-modules`.

### src/modules/todos.ts

```typescript
import { Module, generateID } from 'redux-typed-modules';

export interface TODO {
  id: string
  added: Date,
  task: string,
}

export interface TODOState {
  todos: Map<string, TODO>;
}

// Initialize the module with an initial state
//
// *Optional configuration
//  actionExtraData: () => T; -> define a method to be called after an action is run
//    whose return value will be merged with the action result before being passed
//    to a reducer. Useful for adding global fields to actions, like the time.
//
//  postReducer: (state: STATETYPE) => STATETYPE; -> define a method to be called
//    after every reducer is run. The result of an individual actions reducer is
//    passed in to this method for you to transform / and or perform any additional
//    tasks on all actions.
const module = new Module({
  initialState: {
    todos: Map<string, TODO>()
  },
});

// Define the action and reducer to handle adding a new TODO using the createAction method
//
// createAction returns a typed action function which can be dispatched.
//
// *Optional configuration
//  type: string; -> define a custom type name for the action. If no type value
//    is provided a unique string id is generated for each action. I'd recommend
//    defining a type name for better logging.
export const addTodo = module.createAction({
  // The returned method from createAction will call this method when dispatched
  // and will share the same types.
  action: (todo: string) => {
    return {
      // generateID is just a basic alphanumeric random string generator used within
      // the module class for automatic type name creation, it's exported if you want
      // to use it selsewhere for simple string generation
      id: generateID(7),
      task: todo,
    };
  },

  // Here state is the STATETYPE as defined by initialState
  // and action is typed as the return of the above action method
  // merged with {type: string} & the return of actionExtraData If
  // that method is defined on the constructor options
  //
  // The return of the reducer can be a partial state, this will be
  // merged with the existing state behind the scenes.
  //
  // This removes any bleedthrough of types from other actions to help
  // prevent any confusion or misuse of action properties typical when
  // being forced to use a module global action interface.
  reducer: (state, action) => {
    return {
      todos: state.todos.set(a.id, {
        id: a.id,
        task: a.task
      })
    };
  }
});

// Define the action and reducer to handle removing a TODO
export const removeTodo = module.createAction({
  action: (id: string) => {
    return {
      id: id
    };
  },

  reducer: (s, a) => {
    return {
      todos: s.todos.remove(a.id)
    };
  }
});

// Export the reducer, compiled from each of the reducers provided
// in the createAction methods
export default module.createReducer();

```

### src/modules/reducer.ts - *defined as you would normally*

```typescript
import {combineReducers} from 'redux';

import todos, {TODOState} from './todos';
// import other modules...

// Define the state as presented after combineReducers merges
// each state
export interface GlobalState {
  todos: TODOState,
  // add other state types
}

export default combineReducers({
  todos,
  // other module reducers
});

```

### src/index.tsx - *defined as you would normally*

```jsx
import * as React from 'react';
import * as ReactDom from 'react-dom';
import {Provider} from 'react-redux';

import reducer from './modules/reducer';
import Todos from './components/Todos';

const store = createStore(reducer);
ReactDom.render(
  <Provider store={store}>
    <Todos />
  </Provider>,
  document.getElementById('app')
);

```
