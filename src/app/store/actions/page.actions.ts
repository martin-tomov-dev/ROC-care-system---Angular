import { Action } from '@ngrx/store';

import { IPageData } from '../../interfaces/page-data';

export const SET = '[PageData] Set';
export const UPDATE = '[PageData] Update';
export const RESET = '[PageData] Reset';

export class Set implements Action {
  readonly type = SET;

  constructor(public data: IPageData) {
    console.log('SET==========================');
  }
}

export class Update implements Action {
  
  readonly type = UPDATE;
  
  constructor(public data: any) {
    console.log('UPDATE======================');
  }
}

export class Reset implements Action {
  readonly type = RESET;
  constructor() {
    console.log('RESET=======================');
  }
}

export type All = Set | Update | Reset;
