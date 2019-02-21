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

import { RenderParams, ri } from '@jargon/sdk-core'
import { IVoxaEvent, Renderer } from 'voxa'
import { IRendererConfig } from 'voxa/src/renderers/Renderer'

export class JargonRenderer extends Renderer {
  private _vars: any
  constructor (config: IRendererConfig) {
    super({
      views: {},
      ...config
    })

    this._vars = config.variables || {}
  }

  public async renderPath (view: string, voxaEvent: IVoxaEvent, variables?: any): Promise<any> {
    const params = this._makeRenderParams(voxaEvent, variables)
    const item = ri(view, params, voxaEvent.jargonRenderOptions)
    return voxaEvent.jrm!.renderObject(item)
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
