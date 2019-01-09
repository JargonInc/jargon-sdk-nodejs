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

import { RenderItem, ResourceManager } from '@jargon/sdk-core'
import { Jovo } from 'jovo-core'

/**
 * JovoJargon contains Jargon's additions to the core Jovo framework
 * class.
 */
export interface JovoJargon {
  /** The resource manager for the current request */
  rm: ResourceManager

  /** Responds with the given text and ends session
   * @param {RenderItem} speech The item to render for the speech content
   */
  tell (speech: RenderItem): Promise<void>

  /**
   * Says speech and waits for answer from user.
   * Reprompt when user input fails.
   * Keeps session open.
   * @param {RenderItem} speech The item to render for the speech content
   * @param {RenderItem} repromptSpeech The item to render for the reprompt content
   */
  ask (speech: RenderItem, repromptSpeech?: RenderItem): Promise<void>

  /** Shows simple card to response
   * @param {RenderItem} title The item to render for the card's title
   * @param {RenderItem} content The item to render for the card's content
   */
  showSimpleCard (title: RenderItem, content: RenderItem): Promise<void>

  /** Shows image card to response
   * @param {RenderItem} title The item to render for the card's title
   * @param {RenderItem} content The item to render for the card's content
   * @param {string} imageUrl The URL for the image. Must be https
   */
  showImageCard (title: RenderItem, content: RenderItem, imageUrl: string): Promise<void>
}

export class JJ implements JovoJargon {
  constructor (private jovo: Jovo, public rm: ResourceManager) {}

  async tell (speech: RenderItem): Promise<void> {
    let s = await this.rm.render(speech)
    this.jovo.tell(s)
  }

  async ask (speech: RenderItem, repromptSpeech?: RenderItem): Promise<void> {
    let s: string
    let rs: string | undefined = undefined
    if (repromptSpeech) {
      [s, rs] = await this.rm.renderBatch([speech, repromptSpeech])
    } else {
      s = await this.rm.render(speech)
    }

    this.jovo.ask(s, rs)
  }

  async showSimpleCard (title: RenderItem, content: RenderItem): Promise<void> {
    let [t, c] = await this.rm.renderBatch([title, content])
    this.jovo.showSimpleCard(t, c)
  }

  async showImageCard (title: RenderItem, content: RenderItem, imageUrl: string): Promise<void> {
    let [t, c] = await this.rm.renderBatch([title, content])
    this.jovo.showImageCard(t, c, imageUrl)
  }
}
