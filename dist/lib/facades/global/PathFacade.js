"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../../../lib/core/Path");
const Facade_1 = require("../Facade");
const Najs_1 = require("../../../lib/core/Najs");
const make_1 = require("../../../lib/core/make");
const constants_1 = require("../../constants");
const facade = Facade_1.Facade.create(Najs_1.Najs, 'path', function () {
    return make_1.make(constants_1.GlobalFacade.Path);
});
exports.Path = facade;
exports.PathFacade = facade;
