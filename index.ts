/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @Author: JB (jb@codecorsair.com)
 * @Date: 2016-12-09 14:42:59
 * @Last Modified by: JB (jb@codecorsair.com)
 * @Last Modified time: 2017-01-18 12:10:02
 */

const IDGenCharacters = 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ';
const IDGenCharactersLength = IDGenCharacters.length;
export function generateID(length: number) {
  let id = '';
  let counter = length;
  while (--counter >= 0) {
    id += IDGenCharacters.charAt(Math.floor(Math.random() *IDGenCharactersLength));
  }
  return id;
}

// a global list of module names to ensure unique generated action type names across modules.
const globalModuleIDs: {[id: string]: string} = {};

export class Module<STATETYPE, ACTIONEXTRADATA> {
  actionDefs: {[id: string]: (state: STATETYPE, action: any) => Partial<STATETYPE>} = {};

  initialState: STATETYPE;
  actionExtraData: () => ACTIONEXTRADATA;
  postReducer: (state: STATETYPE) => STATETYPE;

  reducerCreated: boolean = false;

  moduleID: string;

  constructor(options: {
    moduleID?: string,
    initialState: STATETYPE,
    actionExtraData?: () => ACTIONEXTRADATA,
    postReducer?: (state: STATETYPE) => STATETYPE,
  }) {
    this.initialState = options.initialState;
    this.actionExtraData = options.actionExtraData || (() => { return {} as ACTIONEXTRADATA;});
    this.postReducer = options.postReducer || null;
    this.moduleID = options.moduleID || null;

    if (this.moduleID && typeof globalModuleIDs[this.moduleID] !== 'undefined') throw new Error(`Module name "${this.moduleID}" is not unique.`);

    // generate a unique id for this module.
    if (!this.moduleID) {
      this.moduleID = generateID(6);
      let retryCount = 10;
      while (typeof globalModuleIDs[this.moduleID] !== 'undefined' && --retryCount >= 0) {
        this.moduleID = generateID(6);
      }
      // extremely unlikely to ever happen
      if (typeof globalModuleIDs[this.moduleID] !== 'undefined') throw new Error('failed to generate a unique module id');
    }
    globalModuleIDs[this.moduleID] = this.moduleID;
  }

  // no action params
  createAction<ACTIONTYPE>(options: {
    type?: string,
    action: () => ACTIONTYPE,
    reducer?: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : () => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;
  
  // action params
  createAction<ACTIONTYPE, A>(options: {
    type?: string, 
    action: (a: A) => ACTIONTYPE, 
    reducer?: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : (a: A) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;

  createAction<ACTIONTYPE, A, B>(options: {
    type?: string, 
    action: (a: A, b: B) => ACTIONTYPE, 
    reducer?: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : (a: A, b: B) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;

  createAction<ACTIONTYPE, A, B, C>(options: {
    type?: string, 
    action: (a: A, b: B, c: C) => ACTIONTYPE, 
    reducer?: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : (a: A, b: B, c: C) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;

  createAction<ACTIONTYPE, A, B, C, D>(options: {
    type?: string, 
    action: (a: A, b: B, c: C, d: D) => ACTIONTYPE, 
    reducer?: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : (a: A, b: B, c: C, d: D) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;

  createAction<ACTIONTYPE, A, B, C, D, E>(options: {
    type?: string, 
    action: (a: A, b: B, c: C, d: D, e: E) => ACTIONTYPE, 
    reducer?: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : (a: A, b: B, c: C, d: D, e: E) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;

  createAction<ACTIONTYPE, A, B, C, D, E, F>(options: {
    type?: string, 
    action: (a: A, b: B, c: C, d: D, e: E, f: F) => ACTIONTYPE, 
    reducer?: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : (a: A, b: B, c: C, d: D, e: E, f: F) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;

  createAction<ACTIONTYPE, A, B, C, D, E, F, G>(options: {
    type?: string, 
    action: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => ACTIONTYPE, 
    reducer?: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;

  // combined
  createAction<ACTIONTYPE, A, B, C, D, E, F, G>(options: {
    type?: string, 
    action: (() => ACTIONTYPE) 
            | ((a: A) => ACTIONTYPE) 
            | ((a: A, b: B, c: C) => ACTIONTYPE)
            | ((a: A, b: B, c: C, d: D) => ACTIONTYPE)
            | ((a: A, b: B, c: C, d: D, e: E) => ACTIONTYPE)
            | ((a: A, b: B, c: C, d: D, e: E, f: F) => ACTIONTYPE)
            | ((a: A, b: B, c: C, d: D, e: E, f: F, g: G) => ACTIONTYPE), 
    reducer?: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : (() => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) 
     | ((a: A) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>)
     | ((a: A, b: B) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>)
     | ((a: A, b: B, c: C) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>)
     | ((a: A, b: B, c: C, d: D) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>)
     | ((a: A, b: B, c: C, d: D, e: E) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>)
     | ((a: A, b: B, c: C, d: D, e: E, f: F) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>)
     | ((a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>)
  {
    
    if (this.reducerCreated) throw new Error("createAction may only be called before createReducer.");

    const {action, reducer} = options;

    let type = options.type;

    if (typeof type === 'undefined') {
      // generate a type 
      type = this.moduleID + '/' + generateID(6);
      let retry = 10;
      while (typeof this.actionDefs[type] !== 'undefined' && --retry >= 0) {
        type = this.moduleID + '/' + generateID(6);
      }
    } else if (type.indexOf('/') === 0) {
      // When the type name starts with a "/", we assume we want to prepend the module name.
      type = this.moduleID + type;
    }

    if (typeof this.actionDefs[type] !== 'undefined') throw new Error('duplicate type name provided to createAction or type name generation failed to generate a unique type name');

    this.actionDefs[type] = reducer || function(s, a) { return <Partial<STATETYPE>>{}; };

    const actionExtraData = this.actionExtraData;

    if (action.length == 0) {
      return () => {
        const actionResult = (<() => ACTIONTYPE>action)() as any;
        if (typeof actionResult === 'function') {
          return (dispatch: (action: any) => any, state: STATETYPE) => {
            return {
              ...(actionResult(dispatch, state) as any),
              type: type,
              ...(actionExtraData() as any)
            }
          }
        }
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    } else if (action.length === 1) {
      return (a: A) => {
        const actionResult = (<(a: A) => ACTIONTYPE>action)(a) as any;
        if (typeof actionResult === 'function') {
          return (dispatch: (action: any) => any, state: STATETYPE) => {
            return {
              ...(actionResult(dispatch, state) as any),
              type: type,
              ...(actionExtraData() as any)
            }
          }
        }
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    }  else if (action.length === 2) {
      return (a: A, b: B) => {
        const actionResult = (<(a: A, b: B) => ACTIONTYPE>action)(a, b) as any;
        if (typeof actionResult === 'function') {
          return (dispatch: (action: any) => any, state: STATETYPE) => {
            return {
              ...(actionResult(dispatch, state) as any),
              type: type,
              ...(actionExtraData() as any)
            }
          }
        }
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    }  else if (action.length === 3) {
      return (a: A, b: B, c: C) => {
        const actionResult = (<(a: A, b: B, c: C) => ACTIONTYPE>action)(a, b, c) as any;
        if (typeof actionResult === 'function') {
          return (dispatch: (action: any) => any, state: STATETYPE) => {
            return {
              ...(actionResult(dispatch, state) as any),
              type: type,
              ...(actionExtraData() as any)
            }
          }
        }
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    }  else if (action.length === 4) {
      return (a: A, b: B, c: C, d: D) => {
        const actionResult = (<(a: A, b: B, c: C, d: D) => ACTIONTYPE>action)(a, b, c, d) as any;
        if (typeof actionResult === 'function') {
          return (dispatch: (action: any) => any, state: STATETYPE) => {
            return {
              ...(actionResult(dispatch, state) as any),
              type: type,
              ...(actionExtraData() as any)
            }
          }
        }
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    }  else if (action.length === 5) {
      return (a: A, b: B, c: C, d: D, e: E) => {
        const actionResult = (<(a: A, b: B, c: C, d: D, e: E) => ACTIONTYPE>action)(a, b, c, d, e) as any;
        if (typeof actionResult === 'function') {
          return (dispatch: (action: any) => any, state: STATETYPE) => {
            return {
              ...(actionResult(dispatch, state) as any),
              type: type,
              ...(actionExtraData() as any)
            }
          }
        }
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    }  else if (action.length === 6) {
      return (a: A, b: B, c: C, d: D, e: E, f: F) => {
        const actionResult = (<(a: A, b: B, c: C, d: D, e: E, f: F) => ACTIONTYPE>action)(a, b, c, d, e, f) as any;
        if (typeof actionResult === 'function') {
          return (dispatch: (action: any) => any, state: STATETYPE) => {
            return {
              ...(actionResult(dispatch, state) as any),
              type: type,
              ...(actionExtraData() as any)
            }
          }
        }
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    }  else if (action.length === 7) {
      return (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => {
        const actionResult = (<(a: A, b: B, c: C, d: D, e: E, f: F, g: G) => ACTIONTYPE>action)(a, b, c, d, e, f, g) as any;
        if (typeof actionResult === 'function') {
          return (dispatch: (action: any) => any, state: STATETYPE) => {
            return {
              ...(actionResult(dispatch, state) as any),
              type: type,
              ...(actionExtraData() as any)
            }
          }
        }
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
        return {
          ...(state as any),
          ...(def(state, action) as any)
        };
      };
    } else {
      return (state: STATETYPE = this.initialState, action: {type: string}) => {
        let def = this.actionDefs[action.type];
        if (typeof def === 'undefined' || def === null) return state;
        return postReducer({
          ...(state as any),
          ...(def(state, action) as any)
        });
      };
    }
  }
}
