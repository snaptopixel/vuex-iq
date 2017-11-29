import Vuex, { StoreOptions } from 'vuex';
import { TypedStore } from '../index';

import Store from './app';
import { IUser } from './user';

describe('vuex-iq', () => {
  const store = new Vuex.Store(Store as any) as TypedStore;

  const subscribeSpy = sinon.spy();
  const subscribeActionSpy = sinon.spy();
  const watchSpy = sinon.spy();

  store.subscribe(subscribeSpy);
  store.subscribeAction(subscribeActionSpy);
  store.watch(state => {
    return state.user.lastName;
  }, watchSpy);

  const mockUsers: {[name: string]: IUser} = {
    pedro: {firstName: 'Pedro', lastName: 'Sanchez', username: '@voteforpedro'},
    rico: {firstName: 'Deb', lastName: 'Bradshaw', username: '@handicrafts'},
    napolean: {firstName: 'Napolean', lastName: 'Dynamite', username: '@nunchucks'}
  }

  it('can create store via @store decorator', () => {
    // App moduleZ
    const appOpts = Store as StoreOptions<Store>;
    expect(appOpts.modules).to.be.an.instanceof(Object);
    expect(appOpts.actions).to.be.an.instanceof(Object);
    expect(appOpts.mutations).to.be.an.instanceof(Object);
    expect(appOpts.getters).to.be.an.instanceof(Object);
    expect(appOpts.getters['app/hasUser']).to.be.an.instanceOf(Function);
    // User module
    const userOpts = appOpts.modules.user;
    expect(userOpts.modules).to.be.undefined;
    expect(userOpts.actions).to.be.an.instanceof(Object);
    expect(userOpts.mutations).to.be.an.instanceof(Object);
    expect(userOpts.getters).to.be.an.instanceof(Object);
    expect(userOpts.getters['user/fullName']).to.be.an.instanceOf(Function);
    expect(userOpts.getters['user/displayName']).to.be.an.instanceOf(Function);
    expect(userOpts.mutations['user/set']).to.be.an.instanceOf(Function);
    expect(userOpts.actions['user/create']).to.be.an.instanceOf(Function);
  });

  it('can return promise and trigger mutation via @action decorator', done => {
    store.dispatch('user/create', mockUsers.pedro).then(user => { // Promise result is properly typed as well
      expect(store.state.user).to.deep.eq(user); // State is mutated appropriately
      done();
    }).catch(done);
  });

  it('can read state in getter via @getter decorator', () => {
    expect(store.getters['app/hasUser']).to.be.true; // Getters can read state
    expect(store.getters['user/fullName']).to.eq(`${mockUsers.pedro.firstName} ${mockUsers.pedro.lastName}`); // Getters have access to child state
  });

  it('can access other getter in getter via @getter decorator', () => {
    expect(store.getters['user/displayName']).to.eq(`${mockUsers.pedro.firstName} ${mockUsers.pedro.lastName} (${mockUsers.pedro.username})`); // Getters have access to other getters
  });

  it('can change state via @mutation decorator', () => {
    const bob = {firstName: 'Bob', lastName: 'Dobalina', username: '@bob'};
    store.commit('user/set', bob);
    expect(store.state.user).not.to.eq(bob);
    expect(store.state.user).to.deep.eq(bob);
  });

});