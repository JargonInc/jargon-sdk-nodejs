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

import { ResponseBuilder } from 'ask-sdk-core'
import { canfulfill, Directive, Intent, interfaces, Response } from 'ask-sdk-model'
import { JargonResponseBuilder, JargonResponseBuilderOptions } from '.'
import { escapeSSML } from './escape'
import { RenderItem, ResourceManager } from '@jargon/sdk-core'
import AudioItemMetadata = interfaces.audioplayer.AudioItemMetadata

export const DefaultJargonResponseBuilderOptions: Required<JargonResponseBuilderOptions> = {
  mergeSpeakAndReprompt: false
}

export class JRB implements JargonResponseBuilder {
  private _rb: ResponseBuilder
  private _rm: ResourceManager
  private _opts: Required<JargonResponseBuilderOptions>

  private _q: RBOp[] = []
  private _speak: string[] = []
  private _reprompt: string[] = []

  constructor (rb: ResponseBuilder, rm: ResourceManager, opts: JargonResponseBuilderOptions = {}) {
    this._rb = rb
    this._rm = rm
    this._opts = Object.assign({}, DefaultJargonResponseBuilderOptions, opts)
  }

  speak (speechOutput: RenderItem, merge?: boolean): this {
    let p = this._rm.render(speechOutput)
    let op = async (rb: ResponseBuilder) => {
      const val = escapeSSML(await p)
      if (this._shouldMerge(merge)) {
        this._speak.push(val)
      } else {
        this._speak = [val]
      }

      return rb
    }
    this._q.push(op)
    return this
  }

  reprompt (repromptSpeechOutput: RenderItem, merge?: boolean): this {
    let p = this._rm.render(repromptSpeechOutput)
    let op = async (rb: ResponseBuilder) => {
      const val = escapeSSML(await p)
      if (this._shouldMerge(merge)) {
        this._reprompt.push(val)
      } else {
        this._reprompt = [val]
      }

      return rb
    }
    this._q.push(op)
    return this
  }

  withSimpleCard (cardTitle: RenderItem, cardContent: RenderItem): this {
    let title = this._rm.render(cardTitle)
    let content = this._rm.render(cardContent)
    let op = async (rb: ResponseBuilder) => {
      return rb.withSimpleCard(await title, await content)
    }
    this._q.push(op)
    return this
  }

  withStandardCard (cardTitle: RenderItem, cardContent: RenderItem, smallImageUrl?: string, largeImageUrl?: string): this {
    let title = this._rm.render(cardTitle)
    let content = this._rm.render(cardContent)
    let op = async (rb: ResponseBuilder) => {
      return rb.withStandardCard(await title, await content, smallImageUrl, largeImageUrl)
    }
    this._q.push(op)
    return this
  }

  withLinkAccountCard (): this {
    this._rb.withLinkAccountCard()
    return this
  }

  withAskForPermissionsConsentCard (permissionArray: string[]): this {
    this._rb.withAskForPermissionsConsentCard(permissionArray)
    return this
  }

  addDelegateDirective (updatedIntent?: Intent): this {
    this._rb.addDelegateDirective(updatedIntent)
    return this
  }

  addElicitSlotDirective (slotToElicit: string, updatedIntent?: Intent): this {
    this._rb.addElicitSlotDirective(slotToElicit, updatedIntent)
    return this
  }

  addConfirmSlotDirective (slotToConfirm: string, updatedIntent?: Intent): this {
    this._rb.addConfirmSlotDirective(slotToConfirm, updatedIntent)
    return this
  }

  addConfirmIntentDirective (updatedIntent?: Intent): this {
    this._rb.addConfirmIntentDirective(updatedIntent)
    return this
  }

  addAudioPlayerPlayDirective (playBehavior: interfaces.audioplayer.PlayBehavior, url: string, token: string, offsetInMilliseconds: number, expectedPreviousToken?: string, audioItemMetadata?: AudioItemMetadata): this {
    this._rb.addAudioPlayerPlayDirective(playBehavior, url, token, offsetInMilliseconds, expectedPreviousToken, audioItemMetadata)
    return this
  }

  addAudioPlayerStopDirective (): this {
    this._rb.addAudioPlayerStopDirective()
    return this
  }

  addAudioPlayerClearQueueDirective (clearBehavior: interfaces.audioplayer.ClearBehavior): this {
    this._rb.addAudioPlayerClearQueueDirective(clearBehavior)
    return this
  }

  addRenderTemplateDirective (template: interfaces.display.Template): this {
    this._rb.addRenderTemplateDirective(template)
    return this
  }

  addHintDirective (text: RenderItem): this {
    let hint = this._rm.render(text)
    let op = async (rb: ResponseBuilder) => {
      return rb.addHintDirective(await hint)
    }
    this._q.push(op)
    return this
  }

  addVideoAppLaunchDirective (source: string, title?: RenderItem, subtitle?: RenderItem): this {
    if (title || subtitle) {
      let tp: Promise<string | undefined>
      let sp: Promise<string | undefined>

      if (title) {
        tp = this._rm.render(title)
      } else {
        tp = Promise.resolve(undefined)
      }

      if (subtitle) {
        sp = this._rm.render(subtitle)
      } else {
        sp = Promise.resolve(undefined)
      }

      let op = async (rb: ResponseBuilder) => {
        return rb.addVideoAppLaunchDirective(source, await tp, await sp)
      }
      this._q.push(op)
    } else {
      this._rb.addVideoAppLaunchDirective(source)
    }
    return this
  }

  withCanFulfillIntent (canFulfillIntent: canfulfill.CanFulfillIntent): this {
    this._rb.withCanFulfillIntent(canFulfillIntent)
    return this
  }

  withShouldEndSession (val: boolean): this {
    this._rb.withShouldEndSession(val)
    return this
  }

  addDirective (directive: Directive): this {
    this._rb.addDirective(directive)
    return this
  }

  async getResponse (): Promise<Response> {
    for (let op of this._q) {
      await op(this._rb)
    }

    if (this._speak.length > 0) {
      this._rb.speak(this._speak.join(' '))
    }

    if (this._reprompt.length > 0) {
      this._rb.reprompt(this._reprompt.join(' '))
    }

    return this._rb.getResponse()
  }

  private _shouldMerge (merge?: boolean): boolean {
    if (merge !== undefined) {
      return merge
    }

    return this._opts.mergeSpeakAndReprompt
  }
}

type RBOp = (rb: ResponseBuilder) => Promise<ResponseBuilder>
