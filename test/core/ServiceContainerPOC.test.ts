import 'jest'
import { make } from '../../lib/core/make'
import { register } from '../../lib/core/register'

function autoload(classDefinition: any): any {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    console.log(
      'autoload decorator runs container',
      target.constructor.className,
      'binding',
      classDefinition.className,
      'with key',
      key
    )

    const className = classDefinition.className
    Object.defineProperty(target, key, {
      get: function(this: any) {
        if (typeof this.__autoload === 'undefined') {
          this.__autoload = {}
        }

        if (typeof this.__autoload[className] === 'undefined') {
          this.__autoload[className] = make(className)
        }

        if (this.__autoloadContext) {
          this.__autoload[className].__autoloadContext = this.__autoloadContext
        }
        console.log(this.__autoloadContext)
        return this.__autoload[className]
      },
      set: function(value: any) {
        throw new Error('Can not set autoload property "' + key + '"')
      }
    })
  }
}

export class TodoModel {
  static className = 'TodoModel'
}
register(TodoModel)

export class TodoRepository {
  static className = 'TodoRepository'

  @autoload(TodoModel) todoModel: TodoModel
}
register(TodoRepository)

export class TodoService {
  static className = 'TodoService'

  @autoload(TodoModel) todoModel: TodoModel
  @autoload(TodoRepository) todoRepository: TodoRepository
}
register(TodoService)

// ------------------------------------------------------------------------------------------------
export class TodoController {
  static className = 'TodoController'
  protected __autoloadContext: Object

  constructor(requestId: string) {
    this.__autoloadContext = { requestId }
  }

  @autoload(TodoService) todoService: TodoService
}
register(TodoController)

describe('ServiceContainerPOC', function() {
  it('does something', function() {
    const controllerOne = new TodoController('123')
    controllerOne.todoService.todoModel
    controllerOne.todoService.todoRepository
    console.log(controllerOne.todoService.todoRepository.todoModel['__autoloadContext'])

    const controllerTwo = new TodoController('456')
    controllerTwo.todoService.todoRepository
    controllerTwo.todoService.todoRepository.todoModel
    console.log(controllerTwo.todoService.todoRepository.todoModel['__autoloadContext'])

    const service = new TodoService()
    service.todoModel
    service.todoRepository.todoModel
    console.log(service.todoRepository.todoModel['__autoloadContext'])
  })
})