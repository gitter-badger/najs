import { IRouteData } from '../routing/interfaces/IRouteData';
export declare type HttpDriverStartOptions = {
    createServer?: boolean;
    port?: number;
    host?: any;
};
export interface IHttpDriver<T = any> {
    getNativeDriver(): T;
    start(options?: HttpDriverStartOptions): void;
    route(data: IRouteData): void;
    respondView(response: any, view: string, variables: Object): void;
    respondJson(response: any, value: any): void;
    respondJsonp(response: any, value: any): void;
    respondRedirect(response: any, path: string, code: number): void;
}
