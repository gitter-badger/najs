import { IAutoload } from 'najs-binding';
import { ContextualFacade } from 'najs-facade';
import { Controller } from '../controller/Controller';
import { ISession } from './ISession';
export declare class Session extends ContextualFacade<Controller> implements ISession, IAutoload {
    protected data: Object;
    constructor(controller: Controller);
    getClassName(): string;
    clear(): this;
    get<T extends any>(name: string): T;
    get<T extends any>(name: string, defaultValue: T): T;
    has(name: string): boolean;
    exists(name: string): boolean;
    all(): Object;
    only(name: string): Object;
    only(names: string[]): Object;
    only(...args: Array<string | string[]>): Object;
    except(name: string): Object;
    except(names: string[]): Object;
    except(...args: Array<string | string[]>): Object;
    set<T extends any>(path: string, value: T): this;
    put<T extends any>(path: string, value: T): this;
    push<T extends any>(path: string, value: T): this;
    pull<T extends any>(path: string): T;
    pull<T extends any>(path: string, defaultValue: T): T;
    delete(path: string): this;
    remove(path: string): this;
    forget(path: string): this;
    flush(): this;
}