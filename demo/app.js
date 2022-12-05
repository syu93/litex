import { LitElement, html } from 'https://cdn.skypack.dev/lit-element';

import Litex, { mapState } from '../src/index.js';

const moduleA = {
  modules: {
    b: {
      namespaced: true,
      modules: {
        c: {
          namespaced: true,
          state: {
            hyperplop: 'plop'
          }
        }
      },
      state: {
        plop: 'Plop'
      },
      actions: {
        plop(ctx) {
          // console.log(this);
          console.log(ctx);
          console.log('submodule plop action');
        }
      }
    }
  },
  state: {
    ploper: 'Plopman plop'
  },
  mutations: {
    ploper(state, data) {
      state.ploper = 'Plopman2'
    }
  },
  actions: {
    plop(ctx) {
      console.log('another plop action')
    },
    ploper(ctx, data) {
      console.log(ctx);
      // commit('ploper', 'Plopmal');
    }
  }
};

const litex = new Litex.Store({
  modules: {
    a: moduleA
  },
  state: {
    counter: 1,
    name: 'Hervé TUTUAKU'
  },
  getters: {
    counter: state => state.counter,
    getName: state => state.name
  },
  mutations: {
    plop(state, data) {
      state.counter++;
    },
    updateName(state, newName) {
      state.name = newName;
    }
  },
  actions: {
    async plop(ctx) {
      console.log('Root plop actions');
      ctx.commit('plop');
      // setTimeout(() => {
      //   commit('plop', data);
      // }, 2000);
    },
    updateName({ commit }, newName) {
      commit('updateName', newName);
    }
  }
});

class DemoApp extends LitElement {
  constructor() {
    super();

      // mapState(this, [ 'counter' ]);
      // mapState(this,  { counterProp: state => state.counter });
      mapState(this,  { counterProp: 'counter', name: 'name' });
  }

  render() {
    return html`
      <h1>Welcome : ${this.name}</h1>
      <h2>Counter : ${this.counterProp}</h2>
      <ul>
        <li><a href="/">Index</a></li>
        <li><a href="/view2">page2</a></li>
        <li><a href="/view3">page3</a></li>
      </ul>
      <button @click="${this.newAction}">New action</button>
      <button class="update-name">Update name</button>
    `;
  }

  async newAction() {
    console.log(this.$store.getters.counter);
    await this.$store.dispatch('plop');
    await this.$store.dispatch('b/plop');
    // await this.$store.dispatch('ploper');
    console.log('actions ended');
  }
}

window.customElements.define('demo-app', DemoApp);
