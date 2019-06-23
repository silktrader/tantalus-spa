import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class HubService {
  private readonly connection: signalR.HubConnection;
  private readonly handlersMap = new Map<string, Array<string>>();

  constructor(private auth: AuthenticationService) {
    this.connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl(`https://localhost:5001/foodshub`, {
        accessTokenFactory: () => this.auth.currentUserValue.token
      })
      .build();

    this.connection.start();
  }

  public register(
    listenerName: string,
    name: string,
    method: (...args: any[]) => void
  ) {
    this.connection.on(name, method);
    const listeners = this.handlersMap.get(listenerName);
    if (listeners !== undefined) {
      listeners.push(name);
    } else {
      this.handlersMap.set(listenerName, new Array<string>(name));
    }
  }

  public deregisterAll(listenerName: string) {
    const handlers = this.handlersMap.get(listenerName);
    if (handlers === undefined) {
      return;
    }
    for (const handler of handlers) {
      this.connection.off(handler);
    }
  }
}
