import { IAutoload } from 'najs-binding';
import { Controller } from '../controller/Controller';
import { ContextualFacade } from 'najs-facade';
import { IRequestDataReader } from './IRequestDataReader';
import { HttpMethod } from '../HttpMethod';
export declare class RequestInput extends ContextualFacade<Controller> implements IRequestDataReader, IAutoload {
    protected data: Object;
    readonly method: HttpMethod;
    constructor(controller: Controller);
    getClassName(): string;
    protected createInputFromExpressController(): void;
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
}
