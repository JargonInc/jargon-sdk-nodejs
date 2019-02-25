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

import { Contexts, DialogflowApp, DialogflowConversation } from 'actions-on-google'
import { DefaultJargonAppBaseOptions, JargonAppBase, JargonAppBaseOptions } from '../common'

export interface JargonDialogflowAppOptions extends JargonAppBaseOptions {
  // Placeholder for future options
}

export const DefaultJargonDialogflowAppOptions: Required<JargonDialogflowAppOptions> = {
  ...DefaultJargonAppBaseOptions
}

/**
 * The main entrypoint into the Jargon SDK for Dialogflow applications
 */
export class JargonDialogflowApp<
  TConvData = {},
  TUserStorage = {},
  TContexts extends Contexts = Contexts,
  TConversation extends DialogflowConversation<TConvData, TUserStorage, TContexts> = DialogflowConversation<TConvData, TUserStorage, TContexts>
  >
extends JargonAppBase<JargonDialogflowAppOptions> {
  constructor (options?: JargonDialogflowAppOptions) {
    super(Object.assign({}, DefaultJargonDialogflowAppOptions, options))
  }

  /**
   * Install jargon onto the provided Dialogflow application
   * @param app {DialogflowApp} The application to install the JDK onto
   */
  public installOnto (
    app: DialogflowApp<TConvData, TUserStorage, TContexts, TConversation>
    ) {
    app.middleware(this.middleware)
  }

  // DialogflowApp.middleware hardcodes the types for DialogflowConversation
  middleware = (conv: DialogflowConversation<{}, {}, Contexts>) => {
    this.commonMiddleware(conv)
  }
}
