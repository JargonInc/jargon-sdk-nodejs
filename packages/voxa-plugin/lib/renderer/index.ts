/*
 * Copyright 2019 Jargon, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { RenderItem, RenderParams, ri } from '@jargon/sdk-core'
import { isString, pickBy } from 'lodash'
import { IVoxaEvent, Renderer } from 'voxa'

declare module 'voxa' {
  export interface Renderer {
    render (view: string, voxaEvent: IVoxaEvent, variables?: any): Promise<string>
  }
}

// Ideally this would be constructed via referring to the actual platform classes,
// but we'd need to instantiate instances of each of them to do so
const platformNames = ['alexa', 'botframework', 'dialogflow']

function messageFilter (value: string | object, key: string): boolean {
  return isString(value) && !platformNames.includes(key)
}

export class JargonRenderer extends Renderer {
  private _vars: any
  // Should be IRenderedConfig, but that's not currently exported from Voxa
  constructor (config: any) {
    super({
      views: {},
      ...config
    })

    this._vars = config.variables || {}
  }

  public async render (view: string, voxaEvent: IVoxaEvent, variables?: any): Promise<string> {
    const item = this._makeRenderItem(view, voxaEvent, variables)
    const message = await this._platformSpecificMessage(item, voxaEvent)

    if (isString(message)) {
      return message
    }

    const variants = pickBy(message, messageFilter)
    return voxaEvent.jrm.selectVariationFromObject(item, variants)
  }

  public renderPath<T> (view: string, voxaEvent: IVoxaEvent, variables?: any): Promise<string | T> {
    const item = this._makeRenderItem(view, voxaEvent, variables)
    return this._platformSpecificMessage(item, voxaEvent)
  }

  private async _platformSpecificMessage<T> (item: RenderItem, voxaEvent: IVoxaEvent): Promise<string | T> {
    let message: any = await voxaEvent.jrm.renderObject(item)

    // Check for a platform-specific message, and filter out messages for other platforms
    const platform = voxaEvent.platform.name
    if (platform && message[platform]) {
      message = message[platform]
    } else {
      for (const p of platformNames) {
        delete message[p]
      }
    }

    return message
  }

  private _makeRenderItem (view: string, voxaEvent: IVoxaEvent, variables?: any): RenderItem {
    const params = this._makeRenderParams(voxaEvent, variables)
    const item = ri(view, params, voxaEvent.jargonRenderOptions)
    voxaEvent.$jargon.renderItems.set(view, item)
    return item
  }

  private _makeRenderParams (voxaEvent: IVoxaEvent, variables?: any): RenderParams {
    const params = {
      ...variables
    }
    for (const v in this._vars) {
      if (!params[v]) {
        const f = this._vars[v]
        Object.defineProperty(params, v, {
          enumerable: true,
          get: () => f(voxaEvent)
        })
      }
    }

    return params
  }
}
