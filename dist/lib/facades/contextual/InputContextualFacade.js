"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../../http/request/RequestInput");
const najs_binding_1 = require("najs-binding");
const najs_facade_1 = require("najs-facade");
const constants_1 = require("../../constants");
const facade = najs_facade_1.Facade.create(function (context) {
    if (!context.input) {
        return najs_binding_1.make(constants_1.ContextualFacadeClass.Input, [context]);
    }
    return context.input;
});
exports.Input = facade;
exports.InputContextualFacade = facade;
