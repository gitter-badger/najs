"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaValidatorClass = 'SchemaValidator';
exports.SystemClass = {
    HttpKernel: 'Najs.HttpKernel',
    HttpDriver: 'Najs.HttpDriver',
    ExpressSessionStore: 'Najs.ExpressSessionStore'
};
exports.ContextualFacadeClass = {
    Input: 'Najs.RequestInput',
    Session: 'Najs.Session'
};
exports.ResponseTypeClass = {
    Back: 'Najs.BackResponse',
    Json: 'Najs.JsonResponse',
    Jsonp: 'Najs.JsonpResponse',
    Redirect: 'Najs.RedirectResponse',
    View: 'Najs.ViewResponse'
};
exports.GlobalFacadeClass = {
    Application: 'Najs.Application',
    Cache: 'Najs.Cache',
    Config: 'Najs.Config',
    Event: 'Najs.EventDispatcher',
    Log: 'Najs.WinstonLogger',
    Path: 'Najs.Path',
    Redis: 'Najs.RedisClient',
    Response: 'Najs.ResponseFactory',
    Route: 'Najs.RouteFactory'
};
/**
 * This Object Configuration's key
 */
exports.ConfigurationKeys = {
    Port: 'port',
    Host: 'host',
    ViewEngineName: 'view.engine',
    HandlerBarsOptions: 'view.handlebars',
    Session: 'session',
    Redis: 'redis',
    Mongoose: 'mongoose.uri',
    MongooseOptions: 'mongoose.options',
    Paths: {
        app: 'path.app',
        config: 'path.config',
        layout: 'path.layout',
        public: 'path.public',
        resource: 'path.resources',
        route: 'path.route',
        storage: 'path.storage',
        view: 'path.view'
    },
    Middleware: {
        csurfOptions: 'middleware.csurf',
        corsOptions: 'middleware.cors'
    },
    Cache: {
        engine: 'cache.engine',
        redis: 'cache.redis'
    }
};
