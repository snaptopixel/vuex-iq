# vuex-iq

> Smarter Vuex + TypeScript applications with full type-safety and code completion via decorators and idiomatic TypeScript patterns.

 [![Build Status](https://img.shields.io/circleci/project/snaptopixel/vuex-iq/master.svg)](https://circleci.com/gh/snaptopixel/vuex-iq) [![npm package](https://img.shields.io/npm/v/vuex-iq.svg)](https://www.npmjs.com/package/vuex-iq)

### Usage

**Required**: Add the following snippet to the `compilerOptions` object inside tsconfig.json:
```json
"experimentalDecorators": true
```

#### Declaring state, actions, getters and mutations
By leveraging TypeScript's built-in "declaration merging" we can provide typings that will propagate throughout our entire application while remaining loosely-coupled and avoiding boilerplate (importing constants, etc). The following example shows how to declare actions and mutations with strictly typed payloads, as well as strictly typed getters:
```ts
declare module 'vuex-iq' {
  interface State {
    'someProp': number;
  }
  interface Actions {
    'someAction': number; // payload type
  }
  interface Getters {
    'someGetter': boolean; // value type
  }
  interface Mutations {
    'someMutation': string // payload type
  }
}
```
Once everything has been declared we can start writing the actual module as a class using the decorators:  

```ts
import { action, getter, module, mutation } from 'vuex-iq/decorators';

/* Declarations from the previous example here */

@module
export default class someStore extends TypedStore {
  someProp: number = null;

  @getter('someGetter')
  someGetter() {
    return isNaN(this.someProp);
  }
  @mutation('someMutation')
  someMutation(payload: string) {

  }
}
```