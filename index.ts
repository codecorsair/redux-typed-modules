/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @Author: JB (jb@codecorsair.com)
 * @Date: 2016-12-09 14:42:59
 * @Last Modified by: JB (jb@codecorsair.com)
 * @Last Modified time: 2016-12-13 17:08:46
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
    initialState: STATETYPE,
    actionExtraData?: () => ACTIONEXTRADATA,
    postReducer?: (state: STATETYPE) => STATETYPE,
  }) {
    this.initialState = options.initialState;
    this.actionExtraData = options.actionExtraData || (() => { return {} as ACTIONEXTRADATA;});
    this.postReducer = options.postReducer || null;

    // generate a unique id for this module.
    this.moduleID = generateID(6);
    let retryCount = 10;
    while (typeof globalModuleIDs[this.moduleID] !== 'undefined' && --retryCount >= 0) {
      this.moduleID = generateID(6);
    }
    // extremely unlikely to ever happen
    if (typeof globalModuleIDs[this.moduleID] !== 'undefined') throw new Error('failed to generate a unique module id');
    globalModuleIDs[this.moduleID] = this.moduleID;
  }

  createAction<ACTIONTYPE>(options: {
    type?: string,
    action: () => ACTIONTYPE,
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : () => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;
  createAction<ACTIONTYPE, ACTIONPARAM>(options: {
    type?: string, 
    action: (a: ACTIONPARAM) => ACTIONTYPE, 
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : (a: ACTIONPARAM) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;
  createAction<ACTIONTYPE, ACTIONPARAM>(options: {
    type?: string, 
    action: (() => ACTIONTYPE) | ((a: ACTIONPARAM) => ACTIONTYPE), 
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : (() => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) 
     | ((a: ACTIONPARAM) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) {
    
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
    }

    if (typeof this.actionDefs[type] !== 'undefined') throw new Error('duplicate type name provided to createAction or type name generation failed to generate a unique type name');

    this.actionDefs[type] = reducer;

    const actionExtraData = this.actionExtraData;

    if (action.length == 0) {
      return () => {
        const actionResult = (<() => ACTIONTYPE>action)() as any;
        return {
          ...actionResult, 
          type: type,
          ...(actionExtraData() as any)
        };
      };
    } else if (action.length >= 1) {
      return (a: ACTIONPARAM) => {
        const actionResult = (<(a: ACTIONPARAM) => ACTIONTYPE>action)(a) as any;
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
