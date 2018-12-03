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

import { HandlerInput, RequestInterceptor } from 'ask-sdk-core'
import { ResourceManagerFactory, ResourceManager } from '@jargon/sdk-core'
import { JRB, JargonResponseBuilder, JargonResponseBuilderOptions } from '../responseBuilder'

export interface JargonHandlerInput extends HandlerInput {
  jargonResponseBuilder: JargonResponseBuilder
  jrb: JargonResponseBuilder
  jargonResourceManager: ResourceManager
  jrm: ResourceManager
}

export class JargonRequestInterceptor implements RequestInterceptor {
  private _opts: JargonResponseBuilderOptions
  private _rmf: ResourceManagerFactory

  constructor (rmf: ResourceManagerFactory, opts: JargonResponseBuilderOptions = {}) {
    this._opts = opts
    this._rmf = rmf
  }

  process (handlerInput: HandlerInput): Promise<void> | void {
    let req = handlerInput.requestEnvelope.request

    // @ts-ignore locale isn't defined for all request types
    let locale: string = req.locale || ''
    let rm = this._rmf.forLocale(locale)
    let jrb = new JRB(handlerInput.responseBuilder, rm, this._opts)

    let attributes = handlerInput.attributesManager.getRequestAttributes()
    attributes.jargonResponseBuilder = jrb
    attributes.jrb = jrb
    attributes.jargonResourceManager = rm
    attributes.jrm = rm

    let jhi: JargonHandlerInput = handlerInput as JargonHandlerInput
    jhi.jargonResponseBuilder = jrb
    jhi.jrb = jrb
    jhi.jargonResourceManager = rm
    jhi.jrm = rm
  }
}
