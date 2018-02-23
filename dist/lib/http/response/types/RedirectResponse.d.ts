import { IResponse } from '../IResponse';
import { IHttpDriver } from '../../driver/IHttpDriver';
export declare class RedirectResponse implements IResponse {
    protected url: string;
    protected status: number;
    constructor(url: string, status?: number);
    respond(request: any, response: any, driver: IHttpDriver): void;
}
