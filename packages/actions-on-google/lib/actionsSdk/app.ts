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

import { ActionsSdkApp, ActionsSdkConversation } from 'actions-on-google'
import { DefaultJargonAppBaseOptions, JargonAppBase, JargonAppBaseOptions } from '../common'

export interface JargonActionsSdkAppOptions extends JargonAppBaseOptions {
  // Placeholder for future options
}

export const DefaultJargonActionsSdkAppOptions: Required<JargonActionsSdkAppOptions> = {
  ...DefaultJargonAppBaseOptions
}

/**
 * The main entrypoint into the Jargon SDK for Actions SDK applications
 */
export class JargonActionsSdkApp<
  TConvData = {},
  TUserStorage = {},
  TConversation extends ActionsSdkConversation<TConvData, TUserStorage> = ActionsSdkConversation<TConvData, TUserStorage>
  >
extends JargonAppBase<JargonActionsSdkAppOptions> {
  constructor (options?: JargonActionsSdkAppOptions) {
    super(Object.assign({}, DefaultJargonActionsSdkAppOptions, options))
  }

  /**
   * Install jargon onto the provided Actions SDK application
   * @param app {ActionsSdkApp} The application to install the JDK onto
   */
  public installOnto (
    app: ActionsSdkApp<TConvData, TUserStorage, TConversation>
    ) {
    app.middleware(this.middleware)
  }

  // ActionsSdkApp.middleware hardcodes the types for ActionsSdkConversation
  middleware = (conv: ActionsSdkConversation<{}, {}>) => {
    this.commonMiddleware(conv)
  }
}
