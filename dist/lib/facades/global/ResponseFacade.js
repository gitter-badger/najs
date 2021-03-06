"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../../../lib/http/response/ResponseFactory");
const najs_facade_1 = require("najs-facade");
const Najs_1 = require("../../../lib/core/Najs");
const najs_binding_1 = require("najs-binding");
const constants_1 = require("../../constants");
const facade = najs_facade_1.Facade.create(Najs_1.Najs, 'response', function () {
    return najs_binding_1.make(constants_1.GlobalFacadeClass.Response);
});
exports.Response = facade;
exports.ResponseFacade = facade;
