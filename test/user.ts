import { TypedStore } from './../index';
import { action, getter, mutation, module } from '../decorators';
import { StoreOptions } from 'vuex';
import { State } from '../index';

declare module '../' {
  interface Mutations {
    'user.set': IUser;
  }
  interface Actions {
    'user.create': IUser;
  }
  interface Promises {
    'user.create': IUser;
  }
  interface Getters {
    'user.fullName': string;
    'user.displayName': string;
  }
}

export interface IUser {
  firstName: string;
  lastName: string;
  username: string;
}

@module
class User extends TypedStore implements IUser {
  firstName: string = null;
  lastName: string = null;
  username: string = null;

  @action('user.create')
  create(user: IUser) {
    const p = Promise.resolve(user);
    p.then(user => this.set(user));
    return p;
  }
  
  @mutation('user.set')
  set({firstName, lastName, username}: IUser) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
  }

  @getter('user.fullName')
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @getter('user.displayName')
  displayName() {
    return `${this.fullName()} (${this.username})`;
  }
}

export default User as StoreOptions<State>