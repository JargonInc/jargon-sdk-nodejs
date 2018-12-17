/*
 * Copyright 2018 Jargon, Inc. or its affiliates. All Rights Reserved.
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

import { RenderItem, ResourceManager } from '@jargon/sdk-core'
import { BasicCard, SimpleResponse, GoogleActionsV2UiElementsImage, GoogleActionsV2UiElementsButton, GoogleActionsV2UiElementsBasicCardImageDisplayOptions, BasicCardOptions, SimpleResponseOptions } from 'actions-on-google'

export interface JBasicCardOptions {
  title?: RenderItem
  subtitle?: RenderItem
  text?: RenderItem
  image?: GoogleActionsV2UiElementsImage
  buttons?: GoogleActionsV2UiElementsButton | GoogleActionsV2UiElementsButton[]
  display?: GoogleActionsV2UiElementsBasicCardImageDisplayOptions
}
const jbcFields = ['title', 'subtitle', 'text']

export interface JSimpleResponseOptions {
  speech: RenderItem
  text?: RenderItem
}
const jsrFields = ['speech', 'text']

export interface ResponseFactory {
  basicCard (options: JBasicCardOptions): Promise<BasicCard>
  simple (options: JSimpleResponseOptions | RenderItem): Promise<SimpleResponse>
}

export class CommonResponseFactory implements ResponseFactory {

  constructor (private _rm: ResourceManager) {}

  async basicCard (options: JBasicCardOptions): Promise<BasicCard> {
    const card: BasicCardOptions = await this._render(options, jbcFields)
    return new BasicCard(card)
  }

  async simple (options: JSimpleResponseOptions | RenderItem): Promise<SimpleResponse> {
    if (isRI(options)) {
      return new SimpleResponse(await this._rm.render(options))
    }

    const sro: SimpleResponseOptions = await this._render(options, jsrFields)
    return new SimpleResponse(sro)
  }

  protected async _render<J, G> (jopts: J, fields: string[]): Promise<G> {
    let ris: RenderItem[] = []
    for (const f of fields) {
      const val = jopts[f]
      val && ris.push(val)
    }
    const rendered = await this._rm.renderBatch(ris)

    let pg: Partial<G> = {}
    let i = 0
    for (const f of fields) {
      if (jopts[f]) {
        pg[f] = rendered[i++]
      }
    }

    pg = Object.assign({}, jopts, pg)
    return pg as G
  }
}

function isRI (ri: any): ri is RenderItem {
  return typeof ri.key === 'string'
}
