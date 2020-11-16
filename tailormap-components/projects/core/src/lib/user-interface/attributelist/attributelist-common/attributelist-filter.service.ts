import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttributelistFilterService {
  private initValueFilter = '';

  private messageSource = new BehaviorSubject(this.initValueFilter);
  public valueFilter$ = this.messageSource.asObservable();

  constructor() { }

  public changeMessage(message: string) {
    this.messageSource.next(message)
  }
}
