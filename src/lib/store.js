import PubSub from './pubsub.js';
import { HistoryObject } from './history.js';
import { createProxy, defineActions, defineGetters, isPromise, registerModules } from './helpers.js';
import { consoleTable, rewind } from './console.js';
import { logger, groupCollapsed } from './logger.js';

/**
 * The Store class represent the
 */
export default class Store {

  constructor(params = {}) {
    this._isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? true : false;
    this.actions = new PubSub();
    this.mutations = new PubSub();
    this.state = {};
    this._state = {};
    this.getters = {};
    this.modules = {}
    this.status = 'resting';
    this.history = [];

    this.events = new PubSub();
    
    registerModules(this, { root: params });
    // if (params.hasOwnProperty('actions')) {
    //   defineActions(this, params.actions, '', true);
    // }

    // if (params.hasOwnProperty('mutations')) {
    //   this.mutations = params.mutations;
    // }

    // if (params.hasOwnProperty('getters')) {
    //   this.getters = defineGetters(this, params.getters);
    // }

    // if (params.hasOwnProperty('modules')) {
    //   registerModules(this, params.modules);
    // }
console.log(this._state);
    // Create a proxy listener that will intercept every change made to a sub property of the state object
    // And dispatch to all listeners the new state
    const createProxyMethod = createProxy.bind(this);
    this.state = createProxyMethod(this._state);
    this._state = {};

    // Start recording history
    const baseState = new HistoryObject(Date.now(), 'Base State', { ...this.state }, { ...this.state });
    this.history.push(baseState);

    // Define global score to access store
    window.$store = this;
    // Define WebComponent access
    HTMLElement.prototype.$store = this;
    console.state = consoleTable.bind(this);
    console.state.rewind = rewind.bind(this);

    // Dispaly Litex ready
    if (this._isDev) {
      groupCollapsed('log', 'State management', () => {
        logger('log', `Use : "console.state()" To dispaly the state change history`);
        logger('log', `Use : "console.state.rewind(INDEX)" To navigate into state history`);
      });
    }
  }

  dispatch(actionKey, payload) {
  
    // if (this._isDev && typeof this.actions[actionKey] !== 'function') {
    //   console.error(`[Litex][error] Action "${actionKey}" is called but doesn't exist.`);
    //   return;
    // }
  
    if (this._isDev) {
      groupCollapsed('log', `ACTION : ${actionKey}`, () => logger('log', payload));
    }
  
    this.status = 'action';

    const actionsResults = this.actions.publish(actionKey, payload);

    let res = Promise.all(actionsResults);

    
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
  
    console.groupEnd();
  
    // Return the actions result so it can be anything such as promise
    // So in the other hand we could await
    return res;
  }

  commit(mutationKey, payload) {

    if (typeof this.mutations[mutationKey] !== 'function') {
      logger('error', `[Litex][error] Mutation "${mutationKey}" doesn't exist`);
      return false;
    }
  
    this.status = 'mutation';
  
    const state = new HistoryObject(Date.now(), mutationKey, payload, { ...this.state });
    this.history.push(state);
    let newState = this.mutations[mutationKey](this.state, payload);
  
    this.state = Object.assign(this.state, newState);
  
    return true;
  }
};
