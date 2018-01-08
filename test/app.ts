import { TypedStore } from './../index';
import { StoreOptions } from 'vuex';
import { getter, module } from '../decorators';
import user, { IUser } from './user';
import { State } from '../index';

declare module '../' {
  // Make sure we get typing on 'state' this should only be done in the root store
  interface State {
    user: IUser;
  }
  interface Getters {
    'app.hasUser': Boolean;
  }
}

@module({
  modules: { user }
})
class App extends TypedStore {
  user: IUser = null;

  @getter('app.hasUser')
  hasUser() {
    return !!this.user.firstName;
  }
}

export default App as StoreOptions<State>;