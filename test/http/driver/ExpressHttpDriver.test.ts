import 'jest'
import * as Sinon from 'sinon'
import * as Http from 'http'
import * as NajsBinding from 'najs-binding'
import { ExpressHttpDriver } from '../../../lib/http/driver/ExpressHttpDriver'
import { LogFacade as Log } from '../../../lib/facades/global/LogFacade'
import { Controller } from '../../../lib/http/controller/Controller'
import { ExpressController } from '../../../lib/http/controller/ExpressController'
import { isPromise } from '../../../lib/private/isPromise'

describe('ExpressHttpDriver', function() {
  describe('static .setXPoweredByMiddleware()', function() {
    it('returns a middleware that sets X-Powered-By header', function() {
      const middleware = ExpressHttpDriver.setXPoweredByMiddleware()
      expect(typeof middleware === 'function').toBe(true)
    })

    it('has default value is Najs/Express', function() {
      const response = {
        setHeader() {}
      }
      function next() {}
      const setHeaderStub = Sinon.stub(response, 'setHeader')

      const middleware = ExpressHttpDriver.setXPoweredByMiddleware()
      middleware.call(undefined, {}, response, next)
      expect(setHeaderStub.calledWith('X-Powered-By', 'Najs/Express'))
    })

    it('can be used with custom name', function() {
      const response = {
        setHeader() {}
      }
      function next() {}
      const setHeaderStub = Sinon.stub(response, 'setHeader')

      const middleware = ExpressHttpDriver.setXPoweredByMiddleware('Any name')
      middleware.call(undefined, {}, response, next)
      expect(setHeaderStub.calledWith('X-Powered-By', 'Any name'))
    })
  })

  describe('.getClassName()', function() {
    it('returns ExpressHttpDriver', function() {
      const driver = new ExpressHttpDriver()
      expect(driver.getClassName()).toEqual(ExpressHttpDriver.className)
    })
  })

  describe('.getNativeDriver()', function() {
    it('returns Express app instance', function() {
      const driver = new ExpressHttpDriver()
      expect(driver.getNativeDriver() === driver['express']).toBe(true)
    })
  })

  describe('.route()', function() {
    it('skips if method is not supported', function() {
      const driver = new ExpressHttpDriver()
      const getEndpointHandlersSpy = Sinon.spy(driver, <any>'getEndpointHandlers')

      driver.route({
        method: 'get-not-found',
        prefix: '',
        path: '/path',
        middleware: []
      })
      expect(getEndpointHandlersSpy.called).toBe(false)
    })

    it('joins prefix and path, calls getEndpointHandlers() to get endpoint handler', function() {
      const driver = new ExpressHttpDriver()
      const getEndpointHandlersSpy = Sinon.spy(driver, <any>'getEndpointHandlers')
      const logStub = Sinon.stub(Log, 'info')
      const route = {
        method: 'GET',
        prefix: '/',
        path: 'path',
        middleware: []
      }
      driver.route(route)
      expect(getEndpointHandlersSpy.calledWith('get', '/path', route)).toBe(true)
      getEndpointHandlersSpy.restore()
      logStub.restore()
    })

    it('does not pass handlers to this.express[method] if handler is empty', function() {
      const driver = new ExpressHttpDriver()

      const getEndpointHandlersStub = Sinon.stub(driver, <any>'getEndpointHandlers')
      getEndpointHandlersStub.returns([])

      const postExpressStub = Sinon.stub(driver['express'], 'post')
      const logStub = Sinon.stub(Log, 'info')
      const route = {
        method: 'POST',
        prefix: '/',
        path: 'path',
        middleware: []
      }
      driver.route(route)
      expect(postExpressStub.called).toBe(false)

      getEndpointHandlersStub.restore()
      postExpressStub.restore()
      logStub.restore()
    })

    it('passes handlers to this.express[method] with path and handler', function() {
      const driver = new ExpressHttpDriver()

      const fakeMiddleware = (a: any, b: any) => {}
      const fakeHandler = (a: any, b: any) => {}
      const getEndpointHandlersStub = Sinon.stub(driver, <any>'getEndpointHandlers')
      getEndpointHandlersStub.returns([fakeMiddleware, fakeHandler])

      const logStub = Sinon.stub(Log, 'info')
      const postExpressStub = Sinon.stub(driver['express'], 'post')

      const route = {
        method: 'POST',
        prefix: '/',
        path: 'path',
        middleware: []
      }
      driver.route(route)
      expect(postExpressStub.calledWith('/path', fakeMiddleware, fakeHandler)).toBe(true)

      getEndpointHandlersStub.restore()
      postExpressStub.restore()
      logStub.restore()
    })
  })

  describe('protected .getEndpointHandlers()', function() {
    it('pushes middleware to handlers if middleware is a function', function() {
      function handler() {}
      function middleware() {}
      const route = {
        middleware: ['something', middleware],
        endpoint: handler
      }

      const driver = new ExpressHttpDriver()
      const handlers = driver['getEndpointHandlers']('any', 'any', <any>route)
      expect(handlers).toHaveLength(2)
      expect(handlers[0] === middleware).toBe(true)
    })

    it('creates middlewareList and calls createNativeMiddlewareWrapper(), createBeforeMiddlewareWrapper() if the list not empty', function() {
      function handler() {}
      const middleware = {}
      const route = {
        middleware: ['something'],
        endpoint: handler
      }

      const driver = new ExpressHttpDriver()

      const getMiddlewareStub = Sinon.stub(driver['httpKernel'], 'getMiddleware')
      // no worries, it remove duplicated middleware
      getMiddlewareStub.returns([middleware, middleware, middleware, middleware])

      const createNativeMiddlewareWrapperSpy = Sinon.spy(driver, <any>'createNativeMiddlewareWrapper')
      const createBeforeMiddlewareWrapperSpy = Sinon.spy(driver, <any>'createBeforeMiddlewareWrapper')

      const handlers = driver['getEndpointHandlers']('any', 'any', <any>route)
      expect(handlers).toHaveLength(2)
      expect(createNativeMiddlewareWrapperSpy.calledWith([middleware])).toBe(true)
      expect(createBeforeMiddlewareWrapperSpy.calledWith([middleware])).toBe(true)
      getMiddlewareStub.restore()
    })

    it('calls createEndpointWrapperByFunction and pushes result to handlers', function() {
      function handler() {}
      const route = {
        middleware: [],
        endpoint: handler
      }

      const driver = new ExpressHttpDriver()
      const createEndpointWrapperByFunctionStub = Sinon.stub(driver, <any>'createEndpointWrapperByFunction')

      const handlers = driver['getEndpointHandlers']('any', 'any', <any>route)
      expect(handlers).toHaveLength(1)
      expect(createEndpointWrapperByFunctionStub.calledWith(handler)).toBe(true)

      createEndpointWrapperByFunctionStub.restore()
    })

    it('calls createEndpointWrapper and pushes result to handlers if controller is string', function() {
      const route = {
        middleware: [],
        controller: 'Test',
        endpoint: 'endpoint'
      }

      const driver = new ExpressHttpDriver()
      const createEndpointWrapperStub = Sinon.stub(driver, <any>'createEndpointWrapper')

      const handlers = driver['getEndpointHandlers']('any', 'any', <any>route)
      expect(handlers).toHaveLength(1)
      expect(createEndpointWrapperStub.calledWith('Test', 'endpoint')).toBe(true)

      createEndpointWrapperStub.restore()
    })

    it('calls createEndpointWrapper and pushes result to handlers if controller is Function', function() {
      const classDefinition = () => {}
      const route = {
        middleware: [],
        controller: classDefinition,
        endpoint: 'endpoint'
      }

      const driver = new ExpressHttpDriver()
      const createEndpointWrapperStub = Sinon.stub(driver, <any>'createEndpointWrapper')

      const handlers = driver['getEndpointHandlers']('any', 'any', <any>route)
      expect(handlers).toHaveLength(1)
      expect(createEndpointWrapperStub.calledWith(classDefinition, 'endpoint')).toBe(true)

      createEndpointWrapperStub.restore()
    })

    it('calls createEndpointWrapperByObject and pushes result to handlers if controller is Object', function() {
      const controllerObject = {}
      const route = {
        middleware: [],
        controller: controllerObject,
        endpoint: 'endpoint'
      }

      const driver = new ExpressHttpDriver()
      const createEndpointWrapperByObjectStub = Sinon.stub(driver, <any>'createEndpointWrapperByObject')

      const handlers = driver['getEndpointHandlers']('any', 'any', <any>route)
      expect(handlers).toHaveLength(1)
      expect(createEndpointWrapperByObjectStub.calledWith(controllerObject, 'endpoint')).toBe(true)

      createEndpointWrapperByObjectStub.restore()
    })
  })

  describe('protected .getMiddlewareList()', function() {
    it('returns an empty array if middleware is not Object or String', function() {
      const driver = new ExpressHttpDriver()
      expect(driver['getMiddlewareList'](12345)).toHaveLength(0)
      expect(driver['getMiddlewareList'](true)).toHaveLength(0)
      expect(driver['getMiddlewareList'](undefined)).toHaveLength(0)
    })

    it('returns an array wrap middleware if it is an Object', function() {
      const driver = new ExpressHttpDriver()
      const middleware = {}
      const list = driver['getMiddlewareList'](middleware)
      expect(list).toHaveLength(1)
      expect(list[0] === middleware).toBe(true)
    })

    it('calls HttpKernel.getMiddleware() if middleware is a string', function() {
      const driver = new ExpressHttpDriver()
      const getMiddlewareStub = Sinon.stub(driver['httpKernel'], 'getMiddleware')
      getMiddlewareStub.returns([1, 2, 3])
      const list = driver['getMiddlewareList']('test')
      expect(list).toHaveLength(3)
      expect(getMiddlewareStub.calledWith('test')).toBe(true)
      getMiddlewareStub.restore()
    })
  })

  describe('protected .createBeforeMiddlewareWrapper()', function() {
    it('returns an async function', function() {
      const driver = new ExpressHttpDriver()
      expect(typeof driver['createBeforeMiddlewareWrapper']([]) === 'function').toBe(true)
    })

    it('skipped if the middleware does not have .before() function', async function() {
      const hasBeforeMiddleware = {
        async before(request: any): Promise<any> {}
      }
      const hasNoBeforeMiddleware = {
        async after(request: any, response: any): Promise<any> {}
      }
      const next = function() {}

      const beforeSpy = Sinon.spy(hasBeforeMiddleware, 'before')
      const afterSpy = Sinon.spy(hasNoBeforeMiddleware, 'after')
      const nextSpy = Sinon.spy(next)

      const driver = new ExpressHttpDriver()
      const wrapper = driver['createBeforeMiddlewareWrapper']([hasBeforeMiddleware, hasNoBeforeMiddleware])

      const request = {}
      const response = {}
      await wrapper(<any>request, <any>response, nextSpy)
      expect(beforeSpy.calledWith(request, response)).toBe(true)
      expect(beforeSpy.firstCall.thisValue === hasBeforeMiddleware).toBe(true)
      expect(afterSpy.called).toBe(false)
      expect(nextSpy.called).toBe(true)
    })

    it('calls next() with error if there is any error in middleware', async function() {
      const error = new Error()
      const beforeOneMiddleware = {
        async before(request: any): Promise<any> {
          throw error
        }
      }
      const beforeTwoMiddleware = {
        async before(request: any): Promise<any> {}
      }
      const next = function() {}

      const beforeOneSpy = Sinon.spy(beforeOneMiddleware, 'before')
      const beforeTwoSpy = Sinon.spy(beforeTwoMiddleware, 'before')
      const nextSpy = Sinon.spy(next)

      const driver = new ExpressHttpDriver()
      const wrapper = driver['createBeforeMiddlewareWrapper']([beforeOneMiddleware, beforeTwoMiddleware])

      const request = {}
      const response = {}
      await wrapper(<any>request, <any>response, nextSpy)
      expect(beforeOneSpy.calledWith(request, response)).toBe(true)
      expect(beforeOneSpy.firstCall.thisValue === beforeOneMiddleware).toBe(true)
      expect(beforeTwoSpy.called).toBe(false)
      expect(nextSpy.calledWith(error)).toBe(true)
    })
  })

  describe('protected .createNativeMiddlewareWrapper()', function() {
    it('returns undefined', function() {
      const driver = new ExpressHttpDriver()
      expect(typeof driver['createNativeMiddlewareWrapper']([]) === 'undefined').toBe(true)
    })

    it('skipped if the middleware does not have .native() function', async function() {
      const hasNativeMiddleware = {
        native(httpDriver: any): void {}
      }
      const hasNoNativeMiddleware = {
        async after(request: any, response: any): Promise<any> {}
      }

      const nativeSpy = Sinon.spy(hasNativeMiddleware, 'native')
      const afterSpy = Sinon.spy(hasNoNativeMiddleware, 'after')

      const driver = new ExpressHttpDriver()
      driver['createNativeMiddlewareWrapper']([hasNativeMiddleware, hasNoNativeMiddleware])

      expect(nativeSpy.calledWith(driver)).toBe(true)
      expect(nativeSpy.firstCall.thisValue === hasNativeMiddleware).toBe(true)
      expect(afterSpy.called).toBe(false)
    })
  })

  describe('protected .createEndpointWrapper()', function() {
    class TestControllerA extends Controller {
      static className: string = 'TestControllerA'

      getClassName() {
        return TestControllerA.className
      }

      endpoint() {}
    }
    NajsBinding.register(TestControllerA)

    it('always returns a function despite Controller or Endpoint are invalid', function() {
      const driver = new ExpressHttpDriver()
      const result = driver['createEndpointWrapper']('NotFound', 'invalid', [])
      expect(typeof result === 'function').toBe(true)
    })

    it('calls make() and make() throws an error if Controller not found', async function() {
      const driver = new ExpressHttpDriver()
      const result = driver['createEndpointWrapper']('NotFound', 'invalid', [])
      expect(typeof result === 'function').toBe(true)
      try {
        await result(<any>{}, <any>{})
      } catch (error) {
        expect(error).toBeInstanceOf(ReferenceError)
        return
      }
      expect('shout not reach this line').toEqual('hum')
    })

    it('creates instance of Controller via make but do not call if endpoint not found', function() {
      const makeSpy = Sinon.spy(NajsBinding, 'make')
      const endpointSpy = Sinon.spy(TestControllerA.prototype, 'endpoint')
      const driver = new ExpressHttpDriver()
      const result = driver['createEndpointWrapper']('TestControllerA', 'invalid', [])

      const request = {}
      const response = {}
      result(<any>request, <any>response)
      expect(makeSpy.calledWith('TestControllerA', [request, response])).toBe(true)
      expect(endpointSpy.called).toBe(false)
      makeSpy.restore()
      endpointSpy.restore()
    })

    it('creates instance of Controller via make, calls endpoint and calls handleEndpointResult()', function() {
      const makeSpy = Sinon.spy(NajsBinding, 'make')
      const endpointSpy = Sinon.spy(TestControllerA.prototype, 'endpoint')
      const driver = new ExpressHttpDriver()
      const handleEndpointResultStub = Sinon.stub(driver, <any>'handleEndpointResult')

      const result = driver['createEndpointWrapper']('TestControllerA', 'endpoint', [])
      const request = {}
      const response = {}
      result(<any>request, <any>response)
      expect(makeSpy.calledWith('TestControllerA', [request, response])).toBe(true)
      expect(endpointSpy.called).toBe(true)
      expect(handleEndpointResultStub.calledWith(request, response, undefined, [])).toBe(true)

      makeSpy.restore()
      endpointSpy.restore()
      handleEndpointResultStub.restore()
    })
  })

  describe('protected .createEndpointWrapperByObject()', function() {
    it('always returns a function despite Controller or Endpoint are invalid', function() {
      const driver = new ExpressHttpDriver()
      const result = driver['createEndpointWrapperByObject']({}, 'invalid', [])
      expect(typeof result === 'function').toBe(true)
    })

    it('calls cloneControllerObject()/make() with controller instance but do not call if endpoint not found', function() {
      const makeSpy = Sinon.spy(NajsBinding, 'make')
      const controller: Object = NajsBinding.make('TestControllerA')
      const driver = new ExpressHttpDriver()
      const cloneControllerObjectSpy = Sinon.spy(driver, <any>'cloneControllerObject')
      const result = driver['createEndpointWrapperByObject'](controller, 'invalid', [])

      const request = {}
      const response = {}
      result(<any>request, <any>response)
      expect(makeSpy.calledWith('TestControllerA', [request, response])).toBe(true)
      expect(cloneControllerObjectSpy.called).toBe(true)

      makeSpy.restore()
      cloneControllerObjectSpy.restore()
    })

    it('calls cloneControllerObject()/make() with controller instance, calls endpoint and calls handleEndpointResult()', async function() {
      const makeSpy = Sinon.spy(NajsBinding, 'make')
      const controller: Object = NajsBinding.make('TestControllerA')

      const driver = new ExpressHttpDriver()
      const handleEndpointResultStub = Sinon.stub(driver, <any>'handleEndpointResult')
      const cloneControllerObjectSpy = Sinon.spy(driver, <any>'cloneControllerObject')
      const result = driver['createEndpointWrapperByObject'](controller, 'endpoint', [])

      const request = {}
      const response = {}
      result(<any>request, <any>response)
      expect(cloneControllerObjectSpy.called).toBe(true)
      expect(makeSpy.calledWith('TestControllerA', [request, response])).toBe(true)
      expect(handleEndpointResultStub.calledWith(request, response, undefined, [])).toBe(true)

      makeSpy.restore()
      cloneControllerObjectSpy.restore()
      handleEndpointResultStub.restore()
    })

    it('calls cloneControllerObject() with raw object but do not call if endpoint not found', function() {
      const controller: Object = NajsBinding.make('TestControllerA')

      const endpointSpy = Sinon.spy(controller, <any>'endpoint')

      const driver = new ExpressHttpDriver()
      const cloneControllerObjectSpy = Sinon.spy(driver, <any>'cloneControllerObject')
      const result = driver['createEndpointWrapperByObject'](controller, 'invalid', [])

      const request = {}
      const response = {}
      result(<any>request, <any>response)
      expect(cloneControllerObjectSpy.called).toBe(true)
      expect(endpointSpy.called).toBe(false)
      cloneControllerObjectSpy.restore()
      endpointSpy.restore()
    })

    it('calls cloneControllerObject() with raw object, calls endpoint and calls handleEndpointResult()', async function() {
      const controller: Object = {
        endpoint() {}
      }
      const endpointSpy = Sinon.spy(controller, <any>'endpoint')

      const driver = new ExpressHttpDriver()
      const handleEndpointResultStub = Sinon.stub(driver, <any>'handleEndpointResult')
      const cloneControllerObjectSpy = Sinon.spy(driver, <any>'cloneControllerObject')
      const result = driver['createEndpointWrapperByObject'](controller, 'endpoint', [])

      const request = {}
      const response = {}
      await result(<any>request, <any>response)
      expect(cloneControllerObjectSpy.called).toBe(true)
      expect(endpointSpy.called).toBe(true)
      expect(handleEndpointResultStub.calledWith(request, response, undefined, [])).toBe(true)
      cloneControllerObjectSpy.restore()
      endpointSpy.restore()
      handleEndpointResultStub.restore()
    })
  })

  describe('protected .createEndpointWrapperByFunction()', function() {
    function handler() {}
    const handlerSpy = Sinon.spy(handler)

    const driver = new ExpressHttpDriver()
    const result = driver['createEndpointWrapperByFunction'](handlerSpy, [])
    const handleEndpointResultStub = Sinon.stub(driver, <any>'handleEndpointResult')
    const request = { method: 'GET' }
    const response = {}

    it('returns a wrapper function for endpoint', function() {
      expect(typeof result).toEqual('function')
    })

    it('creates new Controller with request, response', function() {
      result(<any>request, <any>response)

      expect(handlerSpy.callCount).toEqual(1)
      const thisValue = handlerSpy.firstCall.thisValue
      expect(thisValue).toBeInstanceOf(Controller)
      expect(thisValue).toBeInstanceOf(ExpressController)
      expect(thisValue.request === request).toBe(true)
      expect(thisValue.response === response).toBe(true)
    })

    it("calls handleEndpointResult and passes response, endpoint's result", function() {
      expect(handlerSpy.firstCall.args[0] === request).toBe(true)
      expect(handlerSpy.firstCall.args[1] === response).toBe(true)

      expect(handleEndpointResultStub.calledWith(request, response, undefined, [])).toBe(true)
      handleEndpointResultStub.restore()
    })
  })

  describe('protected .cloneControllerObject()', function() {
    it('clones controller object by Object.assign with request, response', function() {
      const request = {}
      const response = {}
      const origin = { prop: 'anything', endpoint() {} }
      const driver = new ExpressHttpDriver()
      const clone = driver['cloneControllerObject'](origin, <any>request, <any>response)

      expect(clone === origin).toBe(false)
      expect(clone['prop']).toEqual('anything')
      expect(clone['endpoint'] === origin.endpoint).toBe(true)
      expect(clone['request'] === request).toBe(true)
      expect(clone['response'] === response).toBe(true)
    })

    it('does not do deep clone', function() {
      const request = {}
      const response = {}
      const ref = {}
      const origin = { ref, prop: 'anything', endpoint() {} }
      const driver = new ExpressHttpDriver()
      const clone = driver['cloneControllerObject'](origin, <any>request, <any>response)

      expect(clone['ref'] === origin.ref).toBe(true)
    })
  })

  describe('protected .handleEndpointResult()', function() {
    it('does nothing if result is undefined', function() {
      const request = {}
      const response = {}
      const driver = new ExpressHttpDriver()
      driver['handleEndpointResult'](<any>request, <any>response, undefined, [])
    })

    it('calls await if result is a Promise like', async function() {
      const iResponse = {
        respond(response: any, httpDriver: any) {}
      }
      const iResponseSpy = Sinon.spy(iResponse, 'respond')
      const promise = new Promise(function(resolve) {
        resolve(iResponse)
      })

      const request = {}
      const response = {}
      const driver = new ExpressHttpDriver()
      await driver['handleEndpointResult'](<any>request, <any>response, promise, [])
      expect(iResponseSpy.calledWith(request, response, driver)).toBe(true)
    })

    it('calls result.respond if result is IResponse', async function() {
      const iResponse = {
        respond(response: any, httpDriver: any) {}
      }
      const iResponseSpy = Sinon.spy(iResponse, 'respond')

      const request = {}
      const response = {}
      const driver = new ExpressHttpDriver()
      await driver['handleEndpointResult'](<any>request, <any>response, iResponse, [])
      expect(iResponseSpy.calledWith(request, response, driver)).toBe(true)
    })
  })

  describe('protected .applyAfterMiddlewareWrapper()', function() {
    it('returns a promise', function() {
      const driver = new ExpressHttpDriver()
      expect(isPromise(driver['applyAfterMiddlewareWrapper']([], <any>{}, <any>{}, undefined))).toBe(true)
    })

    it('returns value if middleware list is empty', async function() {
      const value = {}
      const driver = new ExpressHttpDriver()
      expect((await driver['applyAfterMiddlewareWrapper']([], <any>{}, <any>{}, value)) === value).toBe(true)
    })

    it('skips if middleware has no .after() function, can receive new instance of result', async function() {
      const freshResult = {}
      const hasAfterMiddleware = {
        async after(request: any, response: any, result: any): Promise<any> {
          return freshResult
        }
      }
      const hasNoAfterMiddleware = {
        async before(request: any, response: any): Promise<any> {}
      }

      const afterSpy = Sinon.spy(hasAfterMiddleware, 'after')
      const beforeSpy = Sinon.spy(hasNoAfterMiddleware, 'before')

      const request = {}
      const response = {}
      const result = {}

      const driver = new ExpressHttpDriver()
      const received = await driver['applyAfterMiddlewareWrapper'](
        [hasAfterMiddleware, hasNoAfterMiddleware],
        <any>request,
        <any>response,
        result
      )

      expect(afterSpy.calledWith(request, response, result)).toBe(true)
      expect(afterSpy.firstCall.thisValue === hasAfterMiddleware).toBe(true)
      expect(beforeSpy.called).toBe(false)
      expect(received === freshResult).toBe(true)
    })

    it('skips if middleware has no .after() function, can receive same instance of result', async function() {
      const hasAfterMiddleware = {
        async after(request: any, response: any, result: any): Promise<any> {
          return result
        }
      }
      const request = {}
      const response = {}
      const result = {}

      const driver = new ExpressHttpDriver()
      const received = await driver['applyAfterMiddlewareWrapper'](
        [hasAfterMiddleware],
        <any>request,
        <any>response,
        result
      )
      expect(received === result).toBe(true)
    })
  })

  describe('.setup()', function() {
    it('is called by constructor', function() {
      const setupSpy = Sinon.spy(ExpressHttpDriver.prototype, <any>'setup')
      new ExpressHttpDriver()
      expect(setupSpy.called).toBe(true)
    })

    it('calls .setupBodyParser()', function() {
      const setupBodyParser = Sinon.spy(ExpressHttpDriver.prototype, <any>'setupBodyParser')
      const driver = new ExpressHttpDriver()
      expect(setupBodyParser.calledWith(driver['express'])).toBe(true)
    })

    it('calls .setupSession()', function() {
      const setupSession = Sinon.spy(ExpressHttpDriver.prototype, <any>'setupSession')
      const driver = new ExpressHttpDriver()
      expect(setupSession.calledWith(driver['express'])).toBe(true)
    })

    it('calls .setupCookieParser()', function() {
      const setupCookieParser = Sinon.spy(ExpressHttpDriver.prototype, <any>'setupCookieParser')
      const driver = new ExpressHttpDriver()
      expect(setupCookieParser.calledWith(driver['express'])).toBe(true)
    })

    it('calls .setupViewEngine() for setting up the view engine', function() {
      const setupViewEngine = Sinon.spy(ExpressHttpDriver.prototype, <any>'setupViewEngine')
      const driver = new ExpressHttpDriver()
      expect(setupViewEngine.calledWith(driver['express'])).toBe(true)
    })

    it('calls .setupStaticAssets() for setting up the view engine', function() {
      const setupStaticAssets = Sinon.spy(ExpressHttpDriver.prototype, <any>'setupStaticAssets')
      const driver = new ExpressHttpDriver()
      expect(setupStaticAssets.calledWith(driver['express'])).toBe(true)
    })
  })

  describe('.start()', function() {
    it('never creates server if options = { createServer: false } (helpful for testing)', function() {
      const fakeServer = {
        listen(port: any, host: any) {}
      }
      const driver = new ExpressHttpDriver()

      const listenSpy = Sinon.spy(fakeServer, 'listen')

      const logStub = Log.createStub('info')
      const httpStub = Sinon.stub(Http, 'createServer')
      httpStub.returns(fakeServer)

      driver.start({ createServer: false })
      expect(httpStub.calledWith(driver['express'])).toBe(false)
      expect(logStub.calledWith('Listening at localhost:3000')).toBe(false)
      expect(listenSpy.calledWith(3000, 'localhost')).toBe(false)

      listenSpy.restore()
      httpStub.restore()
      Log.restoreFacade()
    })

    it('passes this.express to http.createServer() with default host=localhost, port=3000', function() {
      const fakeServer = {
        listen(port: any, host: any) {}
      }
      const driver = new ExpressHttpDriver()

      const listenSpy = Sinon.spy(fakeServer, 'listen')

      const logStub = Log.createStub('info')
      const httpStub = Sinon.stub(Http, 'createServer')
      httpStub.returns(fakeServer)

      driver.start()
      expect(httpStub.calledWith(driver['express'])).toBe(true)
      expect(logStub.calledWith('Listening at localhost:3000')).toBe(true)

      driver.start({ port: 3333 })
      expect(listenSpy.calledWith(3333, 'localhost')).toBe(true)
      expect(logStub.calledWith('Listening at localhost:3333')).toBe(true)

      driver.start({ host: '0.0.0.0' })
      expect(listenSpy.calledWith(3000, '0.0.0.0')).toBe(true)
      expect(logStub.calledWith('Listening at 0.0.0.0:3000')).toBe(true)

      driver.start({ port: 4444, host: '0.0.0.0' })
      expect(listenSpy.calledWith(4444, '0.0.0.0')).toBe(true)
      expect(logStub.calledWith('Listening at 0.0.0.0:4444')).toBe(true)

      listenSpy.restore()
      httpStub.restore()
      Log.restoreFacade()
    })
  })

  describe('.respondView()', function() {
    it('calls response.render()', function() {
      const response = {
        render: function() {}
      }
      const renderSpy = Sinon.spy(response, 'render')
      const driver = new ExpressHttpDriver()

      const variables = { any: 'thing' }

      driver.respondView(<any>response, 'test', variables)
      expect(renderSpy.calledWith('test', variables)).toBe(true)
    })
  })

  describe('.responseJson()', function() {
    it('calls response.json()', function() {
      const response = {
        json: function() {}
      }
      const jsonSpy = Sinon.spy(response, 'json')
      const driver = new ExpressHttpDriver()

      driver.respondJson(<any>response, 123)
      expect(jsonSpy.calledWith(123)).toBe(true)

      driver.respondJson(<any>response, '123')
      expect(jsonSpy.calledWith('123')).toBe(true)

      driver.respondJson(<any>response, [1, 2, 3])
      expect(jsonSpy.calledWith([1, 2, 3])).toBe(true)

      driver.respondJson(<any>response, { any: 'thing' })
      expect(jsonSpy.calledWith({ any: 'thing' })).toBe(true)
    })
  })

  describe('.responseJsonp()', function() {
    it('calls response.jsonp()', function() {
      const response = {
        jsonp: function() {}
      }
      const jsonpSpy = Sinon.spy(response, 'jsonp')
      const driver = new ExpressHttpDriver()

      driver.respondJsonp(<any>response, 123)
      expect(jsonpSpy.calledWith(123)).toBe(true)

      driver.respondJsonp(<any>response, '123')
      expect(jsonpSpy.calledWith('123')).toBe(true)

      driver.respondJsonp(<any>response, [1, 2, 3])
      expect(jsonpSpy.calledWith([1, 2, 3])).toBe(true)

      driver.respondJsonp(<any>response, { any: 'thing' })
      expect(jsonpSpy.calledWith({ any: 'thing' })).toBe(true)
    })
  })

  describe('.responseRedirect()', function() {
    it('calls response.redirect() with swapped params', function() {
      const response = {
        redirect: function() {}
      }
      const redirectSpy = Sinon.spy(response, 'redirect')
      const driver = new ExpressHttpDriver()

      driver.respondRedirect(<any>response, 'test', 304)
      expect(redirectSpy.calledWith(304, 'test')).toBe(true)
    })
  })
})
