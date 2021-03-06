import '../../../lib/event/EventDispatcher'
import { Facade, IFacade, IFacadeBase } from 'najs-facade'
import { IDispatcher } from '../../../lib/event/IDispatcher'
import { Najs } from '../../../lib/core/Najs'
import { make } from 'najs-binding'
import { GlobalFacadeClass } from '../../constants'

const facade = Facade.create<IDispatcher>(<any>Najs, 'event', function() {
  return make<IDispatcher>(GlobalFacadeClass.Event)
})

export const Dispatcher: IDispatcher & IFacadeBase = facade
export const DispatcherFacade: IDispatcher & IFacade = facade
