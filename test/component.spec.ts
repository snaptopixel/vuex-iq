import Component from 'vue-class-component';
import Store from './app';
import Vue from 'vue';
import Vuex from 'vuex';
import { IUser } from './user';
import { mapAction, mapGetter, mapMutation } from '../decorators';

const store = new Vuex.Store(Store as any);

describe('vuex-iq component helpers', () => {
  @Component({store})
  class TestComponent extends Vue {
    @mapGetter('user.fullName')
    fullName: string;
    
    @mapAction('user.create')
    createUser: (user: IUser) => Promise<IUser>;

    @mapMutation('user.set')
    setUser: (user: IUser) => void;
  }

  const c = new TestComponent();
  const user = {firstName: 'Napolean', lastName: 'Dynamite', username: '@nunchucks'};

  it('exposes a $typedStore property', () => {
    chai.expect(c.$typedStore).to.eq(c.$store);
  });
  
  it('maps getters and actions', done => {
    c.createUser(user).then((createdUser) => {
      chai.expect(createdUser).to.eq(user);
      chai.expect(c.fullName).to.eq(c.$typedStore.getters['user.fullName']);
      chai.expect(c.fullName).to.eq(c.$typedStore.getters['user.fullName']);
      done();
    }).catch(done);
  });

  it('maps mutations', () => {
    c.setUser({firstName: 'Uncle', lastName: 'Rico', username: '@football'});
    expect(c.fullName).to.eq('Uncle Rico');
  });
});