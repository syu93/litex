const ROOT_STATE_KEY = 'root';
const SUB_STATE_IDENTIFIER = '$';

/**
 * The mapState method create the needed property for the given component Class/Object
 * And return the corresponding value from the state
 * 
 * @param {Object/Class} component The instance on which to set the getter and setter
 * @param {Array/Object} properties The property to map to the state
 */
export function mapState(component, properties) {
  // FIXME : Add shallow equal to check if it should can requestUpdate
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

/**
 * The defineGetters method will define all given getters added into the store
 * @param {Store} store The Store object
 * @param {Object} getters An object containing the getters methods to add to the store object
 */
export function defineGetters(store, getters, currentPath = '') {
  for (let getter of Object.keys(getters)) {
    Object.defineProperty(store.getters, getter, {
      get: function() {
        return getters[getter](store.state, store.getters);
      },
      set: setterError,
      configurable: true
    });
  }
  return store.getters;
}

export function defineState(store, module, absolutePath = '') {
  // Create a temps state in order to craete all sub state
  if (!store.hasOwnProperty('_state')) store._state = {};

  if (absolutePath === ROOT_STATE_KEY) {
    store._state = { ...module.state };
  } else {
    createFromPath(store._state, absolutePath, module.state);
  }
}

export function defineActions(store, actions, namespace = '', absolutePath = '') {
  // If no actions defined, return
  if (!actions) return;

  // Loop through actions and craete a subscription
  for (let [ key, action ] of Object.entries(actions)) {
    const actionsPath = [ namespace, key ].filter(path => path).join('/');

    createLocalContext(store, absolutePath);

    // store.actions.subscribe(actionsPath, action, {});
  }
}

/**
 * Display an error message if a mapped property is altered outside a store mutation
 */
function setterError() {
  console.error('[Litex][error] : Cannot mutate state property outside of a mutation');
}

/**
 * The createProxy method takes an initial state object 
 * and return a new Proxy that will handle change made to sub properties and dispatch an events
 * to all the listeners
 * @param {Object} state The initial state object
 */
export function createProxy(state) {
  const self = this;
  return new Proxy((state || {}), {
    set(state, key, value) {
  
      state[key] = value;

      self.events.publish('stateChange', self.state);
  
      if (self.status !== 'mutation') {
        console.warn(`[Litex][warn] You should use a mutation to set ${key}`);
      }
  
      self.status = 'resting';
  
      return true;
    },
  });
}

export function registerModules(store, modules, parentNamespace = '', parentAsbsolutePath = '') {
  for (let [ key, module ] of Object.entries(modules)) {
    // If the module should be namespaced
    // We use the module key to create a module name
    const moduleName = module.namespaced ? key : '';

    // We recover the parent namespace in order to create the full module namespace
    // If there is no namespace above, the module is added to the root
    const moduleNamespace = [ parentNamespace, moduleName ].filter(path => path).join('/');

    const absolutePath = [ parentAsbsolutePath, key === ROOT_STATE_KEY ? '' : key ].filter(path => path).join('/');

    // Define the state objecet with its sub states
    defineState(store, module, absolutePath ? absolutePath : ROOT_STATE_KEY);

    // Define actions with local states
    defineActions(store, module.actions, moduleNamespace, absolutePath);
    

    // store.actions.subscribe();
    if (module.hasOwnProperty('modules')) {
      // console.log(key, ' has a submodules');
      registerModules(store, module.modules, moduleNamespace, absolutePath);
    }

    return 
  }
  // Recusive loop to get all sub module
  // Resgister action and mutation with the right ctx object
  // Make accessible root state
  // Add module state in root state as namespace key
}

/*** Helpers ***/

export function isPromise(val) {
  return val && typeof val.then === 'function'
}

export function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}

export function createLocalContext(store, path) {
  const localState = getStateFromPath(store, path);
  console.log(localState);

  const context = {
    state: { ...localState },
    rootState: { ...store._state },
    dispatch: store.dispatch.bind(store),
    commit: store.commit.bind(store)
  };
}

function getStateFromPath(store, path) {
  if (!path) {
    return store._state;
  }
  return path.split('/').reduce((o, i) => o[SUB_STATE_IDENTIFIER+i], store._state);
}

/**
 * Create a new property in the given object for the given path
 * @param {Object} source The source object for which to create children
 * @param {String} path A string separated by "/" the represent the path a the new properties
 * @param {*} value The value to be appened to the path
 */
function createFromPath(source, path, value) {
  path.split('/').reduce((a, b, idx, array) => {
    const isLast = idx === array.length - 1;
    const key = SUB_STATE_IDENTIFIER+b;
    if (a[key] === undefined) a[key] = {};
    if (isLast) {
      return a[key] = value;
    }
    return a[key];
  }, source);
}
