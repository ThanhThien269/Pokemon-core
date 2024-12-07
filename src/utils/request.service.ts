import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
  private _id: string;

  setUserId(_id: string) {
    this._id = _id;
  }

  getUserId() {
    return this._id;
  }
}
