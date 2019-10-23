
/**
 * The mapState method create the needed property for the given component Class/Object
 * And return the corresponding value from the state
 * 
 * @param {Object/Class} component The instance on which to set the getter and setter
 * @param {Array/Object} properties The property to map to the state
 */
const mapState = (component, properties) => {
  // Map properties to any item from the given array
  if (properties instanceof Array) {
    for (let property of properties) {
      // Assign new getter and setter to the given component
      // Note : As any modification of the state must be made in a mutation
      //        This setter only display an error
      Object.defineProperty(component, property, {
        get: function() {
          $store.events.subscribe('stateChange', () => this.requestUpdate(property));
          return $store.state[property];
        },
        set: setterError,
        configurable: true
      });
    }
  } else if (properties instanceof Object) {
    for (let property of Object.keys(properties)) {
      // If the property is a string, we only define an alias for the given key to the state property
      if (typeof properties[property] ===  'string') {
        const stateProperty = properties[property];

        Object.defineProperty(component, property, {
          get: function() {
            $store.events.subscribe('stateChange', () => this.requestUpdate(property));
            return $store.state[stateProperty];
          },
          set: setterError,
          configurable: true
        });
      } else {
        // If the property if the custom function, we execute the given function with the state object as parameter
        Object.defineProperty(component, property, {
          get: function() {
            $store.events.subscribe('stateChange', () => this.requestUpdate(property));
            return properties[property]($store.state);
          },
          set: setterError,
          configurable: true
        });
      }
    }
  }
};

const defineGetters = (store, getters) => {
  for (let getter of Object.keys(getters)) {
    Object.defineProperty(store.getters, getter, {
      get: function() {
        return getters[getter](store.state);
      },
      set: setterError,
      configurable: true
    });
  }
  return store.getters;
}

/**
 * Display an error message if a mapped property is altered outside a store mutation
 */
function setterError() {
  console.error('[Litex][error] : Cannot mutate state property outside of a mutation');
}

export {
  mapState,
  defineGetters
};
