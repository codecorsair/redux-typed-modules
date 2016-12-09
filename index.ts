/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @Author: JB (jb@codecorsair.com)
 * @Date: 2016-12-09 14:42:59
 * @Last Modified by: JB (jb@codecorsair.com)
 * @Last Modified time: 2016-12-09 18:21:07
 */

const IDGenCharacters = '23456789abdegjkmnpqrvwxyz';
const IDGenCharactersLength = IDGenCharacters.length;
export function generateID(length: number) {
  let id = '';
  let counter = length;
  while (--counter >= 0) {
    id += IDGenCharacters.charAt(Math.floor(Math.random() *IDGenCharactersLength));
  }
  return id;
}

export class Module<STATETYPE, ACTIONEXTRADATA> {
  actionDefs: {[id: string]: (state: STATETYPE, action: any) => STATETYPE};

  initialState: STATETYPE;
  actionExtraData: () => ACTIONEXTRADATA;
  postReducer: (state: STATETYPE) => STATETYPE;

  reducerCreated: boolean = false;

  constructor(options: {
    initialState: STATETYPE,
    actionExtraData?: () => ACTIONEXTRADATA,
    postReducer?: (state: STATETYPE) => STATETYPE,
  }) {
    this.initialState = options.initialState;
    this.actionExtraData = options.actionExtraData || (() => { return {} as ACTIONEXTRADATA;});
    this.postReducer = options.postReducer || null;
  }

  createAction<ACTIONTYPE extends Object>(options: {
    type?: string,
    action: () => ACTIONTYPE,
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Readonly<STATETYPE>,
  }) : () => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;
  createAction<ACTIONTYPE extends Object, A>(options: {
    type?: string,
    action: (a: A) => ACTIONTYPE,
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Readonly<STATETYPE>,
  }) : (a: A) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;
  createAction<ACTIONTYPE extends Object, A, B>(options: {
    type?: string, 
    action: (a: A, b: B) => ACTIONTYPE, 
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Readonly<STATETYPE>,
  }) : (a: A, b: B) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;
  createAction<ACTIONTYPE extends Object, A, B, C>(options: {
    type?: string, 
    action: (a: A, b: B, c: C) => ACTIONTYPE, 
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Readonly<STATETYPE>,
  }) : (a: A, b: B, c: C) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;
  createAction<ACTIONTYPE extends Object, A, B, C, D>(options: {
    type?: string, 
    action: (a: A, b: B, c: C, d: D) => ACTIONTYPE, 
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Readonly<STATETYPE>,
  }) : (a: A, b: B, c: C, d: D) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;
  createAction<ACTIONTYPE extends Object, A, B, C, D, E>(options: {
    type?: string, 
    action: (a: A, b: B, c: C, d: D, e: E) => ACTIONTYPE, 
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Readonly<STATETYPE>,
  }) : (a: A, b: B, c: C, d: D, e: E) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;
  createAction<ACTIONTYPE extends Object, A, B, C, D, E, F>(options: {
    type?: string, 
    action: ((a: A, b: B, c: C, d: D, e: E, f: F) => ACTIONTYPE)
            | (() => ACTIONTYPE)
            | ((a: A) => ACTIONTYPE)
            | ((a: A, b: B) => ACTIONTYPE)
            | ((a: A, b: B, c: C) => ACTIONTYPE)
            | ((a: A, b: B, c: C, d: D) => ACTIONTYPE)
            | ((a: A, b: B, c: C, d: D, e: E) => ACTIONTYPE), 
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Readonly<STATETYPE>,
  }) : (() => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) 
     | ((a: A) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) 
     | ((a: A, b: B) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>)
     | ((a: A, b: B, c: C) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>)
     | ((a: A, b: B, c: C, d: D) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>)
     | ((a: A, b: B, c: C, d: D, e: E) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>)
     | ((a: A, b: B, c: C, d: D, e: E, f: F) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) {
    
    if (this.reducerCreated) throw new Error("createAction may only be called before createReducer.");

    const {action, reducer} = options;
    let type = options.type;

    if (typeof type === 'undefined') {
      // generate a type 
      type = generateID(6);
      let retry = 10;
      while (typeof this.actionDefs[type] != 'undefined' && --retry >= 0) {
        type = generateID(6);
      }
    }

    if (typeof this.actionDefs[type] != 'undefined') throw new Error('duplicate type name provided to createAction or type name generation failed to generate a unique type name');

    this.actionDefs[type] = reducer;

    const actionExtraData = this.actionExtraData;

    if (action.arguments.length === 0) {
      return () => {
        const actionResult = (<() => ACTIONTYPE>action)() as any;
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    } else if (action.arguments.length === 1) {
      return (a: A) => {
        const actionResult = (<() => ACTIONTYPE>action)() as any;
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    } else if (action.arguments.length === 2) {
      return (a: A, b: B) => {
        const actionResult = (<() => ACTIONTYPE>action)() as any;
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    } else if (action.arguments.length === 3) {
      return (a: A, b: B, c: C) => {
        const actionResult = (<() => ACTIONTYPE>action)() as any;
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    } else if (action.arguments.length === 4) {
      return (a: A, b: B, c: C, d: D) => {
        const actionResult = (<() => ACTIONTYPE>action)() as any;
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData()as any)
        };
      };
    } else if (action.arguments.length === 5) {
      return (a: A, b: B, c: C, d: D, e: E) => {
        const actionResult = (<() => ACTIONTYPE>action)() as any;
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    } else if (action.arguments.length === 6) {
      return (a: A, b: B, c: C, d: D, e: E, f: F) => {
        const actionResult = (<() => ACTIONTYPE>action)() as any;
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    }
  }

  createReducer() {
    this.reducerCreated = true;
    const postReducer = this.postReducer;
    if (postReducer === null) {
      return (state: STATETYPE = this.initialState, action: {type: string}) => {
        let def = this.actionDefs[action.type];
        if (typeof def === 'undefined' || def === null) return state;
        return def(state, action);
      };
    } else {
      return (state: STATETYPE = this.initialState, action: {type: string}) => {
        let def = this.actionDefs[action.type];
        if (typeof def === 'undefined' || def === null) return state;
        return postReducer(def(state, action));
      };
    }
  }
}
