import { interfaces, Response } from 'ask-sdk-model'
import { isString } from 'lodash'
import { AlexaReply, Ask, Hint, ITransition, IVoxaEvent, IVoxaReply, Reprompt, Say, Tell } from 'voxa'

// Voxa unfortunately doesn't export this
interface IDirective {
  writeToReply (reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>
}

export class JAsk implements IDirective {
  public static platform = Ask.platform
  public static key = Ask.key

  private _paths: string[]

  constructor (path: string | string[]) {
    this._paths = isString(path) ? [path] : path
  }

  public async writeToReply (reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    transition.flow = 'yield'
    transition.say = this._paths

    this._paths.forEach(async p => {
      // Ask has complex semantics: each path can refer to a single end resource, which is used as a statement,
      // or an object containing "ask" and "reprompt" keys. To handle this we'll first render the full path object,
      // and based on its contents figure out if we need to perform any variation selection.
      const statement = await event.renderer.renderPath(p, event)
      if (isString(statement)) {
        reply.addStatement(statement)

      } else if (statement.ask) {
        const a = statement.ask
        if (isString(a)) {
          reply.addStatement(a)
        } else {
          const item = event.$jargon.renderItems.get(p)
          reply.addStatement(await event.jrm.selectVariationFromObject(item!, a))
        }

        const r = statement.reprompt
        if (isString(r)) {
          reply.addReprompt(r)
        } else if (r) {
          const item = event.$jargon.renderItems.get(p)
          reply.addReprompt(await event.jrm.selectVariationFromObject(item!, r))
        }

      } else {
        const item = event.$jargon.renderItems.get(p)
        reply.addStatement(await event.jrm.selectVariationFromObject(item!, statement))
      }
    })
  }
}

export class JHint implements IDirective {
  public static platform = Hint.platform
  public static key = Hint.key

  constructor (private _path: string) {
  }

  public async writeToReply (reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    if (reply.hasDirective('Hint')) {
      throw new Error('At most one Hint directive can be specified in a response')
    }

    const ar = reply as AlexaReply
    const response: Response = ar.response || {}
    if (!response.directives) {
      response.directives = []
    }

    const text = await event.renderer.render(this._path, event)
    const directive: interfaces.display.HintDirective = {
      hint: {
        text,
        type: 'PlainText'
      },
      type: 'Hint'
    }

    response.directives.push(directive)
    ar.response = response
  }
}

export class JReprompt implements IDirective {
  public static platform = Reprompt.platform
  public static key = Reprompt.key

  constructor (private _path: string) {
  }

  public async writeToReply (reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const statement = await event.renderer.render(this._path, event)
    reply.addReprompt(statement)
  }
}

export class JSay implements IDirective {
  public static platform = Say.platform
  public static key = Say.key

  private _paths: string[]

  constructor (path: string | string[]) {
    this._paths = isString(path) ? [path] : path
  }

  public async writeToReply (reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    this._paths.forEach(async p => {
      const statement = await event.renderer.render(p, event)
      reply.addStatement(statement)
    })
  }
}

export class JTell implements IDirective {
  public static key: string = Tell.key
  public static platform: string = Tell.platform

  constructor (private _path: string) {}

  public async writeToReply (reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const statement = await event.renderer.render(this._path, event)
    reply.addStatement(statement)
    reply.terminate()
    transition.flow = 'terminate'
    transition.say = this._path
  }
}

// Voxa doesn't currently export Text, hence the copied constants
export class JText implements IDirective {
  public static key: string = 'text' // Text.key
  public static platform: string = 'core' // Text.platform

  private _paths: string[]

  constructor (path: string | string[]) {
    this._paths = isString(path) ? [path] : path
  }

  public async writeToReply (reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    this._paths.forEach(async p => {
      const statement = await event.renderer.render(p, event)
      reply.addStatement(statement, true)
    })
  }
}
