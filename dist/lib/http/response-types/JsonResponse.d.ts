import { IResponse } from '../IResponse';
import { IHttpDriver } from '../IHttpDriver';
export declare class JsonResponse implements IResponse {
    private value;
    constructor(value: any);
    respond(response: any, driver: IHttpDriver): void;
}