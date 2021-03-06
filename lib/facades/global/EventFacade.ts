import '../../../lib/event/EventDispatcher'
import { Facade, IFacade, IFacadeBase } from 'najs-facade'
import { IEventEmitter } from '../../../lib/event/IEventEmitter'
import { Najs } from '../../../lib/core/Najs'
import { make } from 'najs-binding'
import { GlobalFacadeClass } from '../../constants'

const facade = Facade.create<IEventEmitter>(<any>Najs, 'event', function() {
  return make<IEventEmitter>(GlobalFacadeClass.Event)
})

export const Event: IEventEmitter & IFacadeBase = facade
export const EventFacade: IEventEmitter & IFacade = facade
