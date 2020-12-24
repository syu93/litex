import { isObject } from './helpers.js';
export default class PubSub {

  constructor() {
    this.events = {};
  }

  /**
   * Register an event with the given callback
   * @param {String} event The event name
   * @param {Function} callback The callback function to run when the event is dispatched
   */
  subscribe(event, callback, context) {
    if (!this.events.hasOwnProperty(event)) {
      this.events[event] = [];
    }
  
    return this.events[event].push(context ? { context, callback } : callback);
  }

  /**
   * Dispatch the given named event with the given parameters 
   * @param {String} event The event name
   * @param  {...any} args Parameters to be passed to event handler
   */
  publish(event, ...args) {
    if(!this.events.hasOwnProperty(event)) {
      return [];
    }
  
    return this.events[event].map(callable => {
      if (isObject(callable)) {
        const { context, callback } = callable;
        return callback.apply(null, [ context, ...args ]);
      }
      return callable.apply(null, args);
    });
  }

};
