import Vue from 'vue';
import Vuex, { ActionContext } from 'vuex';
import {
  Actions,
  Getters,
  Mutations,
  Promises,
  State,
  TypedStore
  } from './index';
import { copyOwnProperties, ModuleScope } from './utils';
import { WatchOptions } from 'vue/types/options';

Vue.use(Vuex);

Vue.use({
  install(vue, options) {
    Object.defineProperty(vue.prototype, '$typedStore', {
      get() {
        return this.$store;
      }
    });
  }
});

// Child decorators execute first so we have to queue factory functions
// in order to define things on the store/module instance
let queuedDecorators: ((store: any, scope: ModuleScope) => void)[] = [];
let queuedWatchers: {getter: (state:State, getters:Getters) => any, callback: (value: any, oldValue: any) => void, options: WatchOptions}[] = [];

// We need a reference to the root store for dispatching and commiting
// so we use a simple plugin to get it
let rootStore: TypedStore;
function initPlugin(store: TypedStore) {
  rootStore = store;
  queuedWatchers.forEach(({getter, options, callback}) => store.watch(getter, callback, options));
}

interface IModuleConfig {
  // `namespaced` is intentionally NOT supported
  // IMHO the decorators do it better, you just need to make sure your
  // getters, mutations and actions have unique names
  modules?: Object;
}

export function module(target: any): any;
export function module(config:IModuleConfig = {}): any {
  // queuedDecorators has already been populated at this point by the child decorators,
  // so we cache it and reinitialize for the next @module
  const decorators = queuedDecorators;
  queuedDecorators = [];
  function factory(target: any) {
    const scope = new ModuleScope();
    // This is the actual StoreOptions object that replaces the class
    const store: any = {
      state: {},
      modules: config.modules,
      actions: {},
      mutations: {},
      getters: {},
      plugins: [initPlugin] // Add the plugin to every module, since we don't know which will be the root store
    };
    // Copy any state properties off of the instance
    const instance = new target();
    copyOwnProperties(instance, store.state);
    // Configure the store, now that it exists
    decorators.forEach(callback => callback(store, scope));
    return store;
  }
  if (typeof config === 'function') {
    return factory(config);
  } else {
    return factory;
  }
}

export function getter<T extends keyof Getters>(name: T) {
  type GetterFunc = () => Getters[T];
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<GetterFunc>) => {
    queuedDecorators.push((store: any, scope: ModuleScope) => {
      Object.defineProperty(scope.getters, propertyKey, descriptor);
      store.getters[name] = (state: any, getters: any, rootState: any, rootGetters: any) => {
        return descriptor.value.apply(scope.getterScope(state, rootState, rootGetters));
      }
    });
  }
}

export function action<T extends keyof Actions>(name: T) {
  type ActionFunc = (payload: Actions[T]) => Promise<Promises[T]>;
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<ActionFunc>) => {
    queuedDecorators.push((store: any, scope: ModuleScope) => {
      scope.actions[propertyKey] = (payload: any) => {
        rootStore.dispatch(name, payload);
      };
      store.actions[name] = (context: ActionContext<any, any>, ...args: any[]) => {
        return descriptor.value.apply(scope.actionScope(context), args);
      }
    });
  }
}

export function mutation<T extends keyof Mutations>(name: T) {
  type MutationFunc = (payload: Mutations[T]) => void;
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<MutationFunc>) => {
    queuedDecorators.push((store: any, scope: ModuleScope) => {
      scope.mutations[propertyKey] = (payload: any) => {
        rootStore.commit(name, payload);
      };
      store.mutations[name] = (state: any, ...args: any[]) => {
        descriptor.value.apply(state, args);
      }
    });
  }
}

export function mapGetter(name: keyof Getters) {
  return (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      get: () => rootStore.getters[name]
    });
  }
}

export function mapAction<T extends keyof Actions>(name: T) {
  return (target: any, propertyKey: string) => {
    target[propertyKey] = (payload: Actions[T]) => rootStore.dispatch(name, payload);
  }
}

export function mapMutation<T extends keyof Mutations>(name: T) {
  return (target: any, propertyKey: string) => {
    target[propertyKey] = (payload: Mutations[T]) => rootStore.commit(name, payload);
  }
}