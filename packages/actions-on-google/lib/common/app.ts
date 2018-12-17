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

import { DefaultResourceManagerFactory, DefaultResourceManagerOptions, ResourceManager, ResourceManagerFactory, ResourceManagerOptions } from '@jargon/sdk-core'
import { Conversation } from 'actions-on-google'
import { CommonResponseFactory, ResponseFactory } from '../common'

export interface JargonAppBaseOptions extends ResourceManagerOptions {
  // Placeholder for future options
}

export const DefaultJargonAppBaseOptions: Required<JargonAppBaseOptions> = {
  ...DefaultResourceManagerOptions
}

declare module 'actions-on-google' {
  export interface Conversation<TUserStorage> {
    jargonResourceManager: ResourceManager
    jrm: ResourceManager

    jargonResponseFactory: ResponseFactory
    jrf: ResponseFactory
  }
}

/**
 * Common Jargon application state for Actions SDK and Dialogflow
 */
export class JargonAppBase<TOpts extends JargonAppBaseOptions> {
  protected _options: Required<TOpts>
  protected _resourceManagerFactory: ResourceManagerFactory

  constructor (options: Required<TOpts>) {
    this._options = Object.assign({}, options)
    this._resourceManagerFactory = new DefaultResourceManagerFactory(this._options)
  }

  protected commonMiddleware<TUserStorage> (conv: Conversation<TUserStorage>) {
    const rm = this._resourceManagerFactory.forLocale(conv.user.locale)
    conv.jrm = rm
    conv.jargonResourceManager = rm

    const rf = new CommonResponseFactory(rm)
    conv.jrf = rf
    conv.jargonResponseFactory = rf
  }
}
