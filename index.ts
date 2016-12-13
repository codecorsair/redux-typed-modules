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

export class Module<STATETYPE, ACTIONEXTRADATA> {
  actionDefs: {[id: string]: (state: STATETYPE, action: any) => Partial<STATETYPE>};

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

  createAction<ACTIONTYPE>(options: {
    type?: string,
    action: () => ACTIONTYPE,
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : () => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>;
  createAction<ACTIONTYPE, ACTIONPARAM>(options: {
    type?: string, 
    action: ((a: ACTIONPARAM) => ACTIONTYPE)
            | (() => ACTIONTYPE)
            | ((a: ACTIONPARAM) => ACTIONTYPE), 
    reducer: (state: Readonly<STATETYPE>, action: Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) => Partial<STATETYPE>,
  }) : (() => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) 
     | ((a: ACTIONPARAM) => Readonly<ACTIONTYPE & {type: string} & ACTIONEXTRADATA>) {
    
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
    } else if (action.arguments.length >= 1) {
      return (a: ACTIONPARAM) => {
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
