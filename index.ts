import { TypedDispatch } from './index';
import { MutationPayload } from 'vuex';
import { WatchOptions } from 'vue/types/options';

export interface Getters { }
export interface Mutations { }
export interface Actions { }
type ActionTypes = { [type in keyof Actions]: any };
export interface Promises extends ActionTypes { }
export interface State { }

export type TypedDispatch = <T extends keyof Actions>(type: T, value?: Actions[T] ) => Promise<Promises[T]>;

declare module 'vuex' {
  interface MutationPayload {
    type: keyof Mutations
  }
}

export class TypedStore {
  // TODO: subscribe and watch probably need work
  watch: <T>(getter: (state: State, getters?: Getters) => T, cb: (value: T, oldValue: T) => void, options?: WatchOptions) => void;
  subscribe: (fn: (mutation: MutationPayload, state: State) => any) => void;
  subscribeAction?: <T extends keyof Actions>(fn: (mutation: T, state: State) => any) => void;
  commit: <T extends keyof Mutations>(type: T, value?: Mutations[T] ) => void;
  dispatch: <T extends keyof Actions>(type: T, value?: Actions[T] ) => Promise<Promises[T]>;
  getters: {[key in keyof Getters]: Getters[key]};
  state: State;
}
