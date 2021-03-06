import 'jest'
import * as Sinon from 'sinon'
import * as Middleware from '../../../lib/http/middleware/ExpressCorsMiddleware'
import { make } from 'najs-binding'
import { isPromise } from '../../../lib/private/isPromise'

describe('ExpressCorsMiddleware', function() {
  it('has shared Express.RequestHandler called CsurfProtection which not init by default', function() {
    expect(Middleware.CorsEnable).toBeUndefined()
  })

  it('creates CsurfProtection from "csurf" module with {cookie: true} options when constructor called', function() {
    const getOptionsSpy = Sinon.spy(Middleware.ExpressCorsMiddleware.prototype, 'getOptions')
    make(Middleware.ExpressCorsMiddleware.className)
    expect(typeof Middleware.CorsEnable === 'function').toBe(true)
    expect(getOptionsSpy.called).toBe(true)
    getOptionsSpy.restore()
  })

  it('creates CsurfProtection only one time', function() {
    const getOptionsSpy = Sinon.spy(Middleware.ExpressCorsMiddleware.prototype, 'getOptions')
    make(Middleware.ExpressCorsMiddleware.className)
    expect(getOptionsSpy.called).toBe(false)
  })

  it('implements IAutoload interface with class name "ExpressCorsMiddleware"', function() {
    expect(new Middleware.ExpressCorsMiddleware().getClassName()).toEqual('ExpressCorsMiddleware')
  })

  describe('.before()', function() {
    it('returns a promise, which calls CsurfProtection with request, response and fake next function', async function() {
      const request = {}
      const response = {}
      const instance = new Middleware.ExpressCorsMiddleware()

      function fakeCsurfProtection(request: any, response: any, done: any) {
        done()
      }

      const csurfProtectionStub = Sinon.stub(Middleware, 'CorsEnable')
      csurfProtectionStub.callsFake(fakeCsurfProtection)

      const result = instance.before(<any>request, <any>response)

      expect(isPromise(result)).toBe(true)
      expect(csurfProtectionStub.firstCall.args[0] === request).toBe(true)
      expect(csurfProtectionStub.firstCall.args[1] === response).toBe(true)
      expect(typeof csurfProtectionStub.firstCall.args[2] === 'function').toBe(true)
      csurfProtectionStub.restore()
    })

    it('sets promise to Rejected if there is an error', async function() {
      const instance = new Middleware.ExpressCorsMiddleware()

      function fakeCsurfProtection(request: any, response: any, done: any) {
        done(new Error('Test'))
      }

      const csurfProtectionStub = Sinon.stub(Middleware, 'CorsEnable')
      csurfProtectionStub.callsFake(fakeCsurfProtection)
      try {
        await instance.before(<any>{}, <any>{})
      } catch (error) {
        expect(error.message).toEqual('Test')
        csurfProtectionStub.restore()
        return
      }
      expect('should not reach this line').toEqual('hmm')
    })
  })
})
