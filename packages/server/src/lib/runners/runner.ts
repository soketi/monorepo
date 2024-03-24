import { RouterType } from 'itty-router';
import { Server } from '../server';

export abstract class Runner {
  constructor(protected instance: Server) {
    //
  }

  async registerHttpRoutes(router: RouterType): Promise<RouterType> {
    return router;
  }

  async registerWebsocketsRoutes(router: RouterType): Promise<RouterType> {
    return router;
  }

  async startup() {
    this.registerHttpRoutes(this.instance.httpRouter);
    this.registerWebsocketsRoutes(this.instance.wsRouter);
  }

  async cleanup() {
    //
  }
}
