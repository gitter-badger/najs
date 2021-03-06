import '../../../lib/core/Path'
import { Facade, IFacade, IFacadeBase } from 'najs-facade'
import { IPath } from '../../../lib/core/IPath'
import { Najs } from '../../../lib/core/Najs'
import { make } from 'najs-binding'
import { GlobalFacadeClass } from '../../constants'

const facade = Facade.create<IPath>(<any>Najs, 'path', function() {
  return make<IPath>(GlobalFacadeClass.Path)
})

export const Path: IPath & IFacadeBase = facade
export const PathFacade: IPath & IFacade = facade
