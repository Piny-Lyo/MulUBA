import { createStore, applyMiddleware, compose } from "redux";
import reducer from './reducer';
import thunk from 'redux-thunk';

const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(thunk),
);

const initState = {
  userID: null,
  users: [],
  userBehaviors: {},
  dayTime: null,
  hourBehaviors: {},
  minBehaviorsOfHour: [],
  userMinBehaviors: []
}

const store = createStore(
    reducer,
    initState,
    enhancer,
);


export default store;