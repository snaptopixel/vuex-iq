/**
 * Extends interfaces in Vue.js
 */

import Vue from "vue";
import { TypedStore } from "../";

declare module "vue/types/vue" {
  interface Vue {
    $typedStore: TypedStore;
  }
}
