import PubSub from './pubsub.js';
import { HistoryObject } from './history.js';
import { defineGetters } from './helpers.js';

/**
 * The Store class represent the
 */
export default class Store {

  constructor(params = {}) {
    this.actions = {};
    this.mutations = {};
    this.state = {};
    this.getters = {};
    this.modules = {}
    this.status = 'resting';
    this.history = [];
    
    this.events = new PubSub();
    
    if (params.hasOwnProperty('actions')) {
      this.actions = params.actions;
    }
    
    if (params.hasOwnProperty('mutations')) {
      this.mutations = params.mutations;
    }
        
    if (params.hasOwnProperty('getters')) {
      this.getters = defineGetters(this, params.getters);
    }
        
    if (params.hasOwnProperty('modules')) {
      this.modules = params.modules;
    }
    
    const self = this;
    this.state = new Proxy((params.state || {}), {
      set(state, key, value) {
    
        state[key] = value;

        self.events.publish('stateChange', self.state);
    
        if (self.status !== 'mutation') {
          console.warn(`You should use a mutation to set ${key}`);
        }
    
        self.status = 'resting';
    
        return true;
      },
    });

    // Start recording history
    const baseState = new HistoryObject(Date.now(), 'Base State', {...this.state}, { ...this.state });
    this.history.push(baseState);

    // Define global score to access store
    window.$store = this;
    // Define WebComponent access
    HTMLElement.prototype.$store = this;
    console.state = () => console.table(this.history);
  }

  dispatch(actionKey, payload) {
  
    if (typeof this.actions[actionKey] !== 'function') {
      console.error(`[Litex][error] Action "${actionKey}" is called but doesn't exist.`);
      return false;
    }
  
    console.groupCollapsed(`[Litex] ACTION : ${actionKey}`);
    console.info('[Litex] : ', payload);
  
    this.status = 'action';
  
    this.actions[actionKey]({ ...this, dispatch: this.dispatch.bind(this), commit: this.commit.bind(this) }, payload);
  
    console.groupEnd();
  
    return true;
  }

  commit(mutationKey, payload) {

    if (typeof this.mutations[mutationKey] !== 'function') {
      console.error(`[Litex][error] Mutation "${mutationKey}" doesn't exist`);
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
