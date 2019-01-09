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

import { DefaultResourceManagerFactory, DefaultResourceManagerOptions, ResourceManagerFactory, ResourceManagerOptions } from '@jargon/sdk-core'
import { BaseApp, Extensible, HandleRequest, Plugin } from 'jovo-core'
import { JJ, JovoJargon } from '../jovojargon'

/** Options for the Jargon plugin */
export interface JargonPluginOptions extends ResourceManagerOptions {
}

declare module 'jovo-core/dist/src/Jovo' {
  export interface Jovo {
    jargon: JovoJargon
  }
}

/** The Jargon plugin for the Jovo framework */
export class JargonPlugin extends Extensible implements Plugin {
  private _options: Required<JargonPluginOptions>
  private _rmf: ResourceManagerFactory

  /** Constructor for the plugin
   * @param {any} options Optional options for the plugin. The values in DefaultResourceManagerOptions will be used for anything not provided
   */
  constructor (options: any = {}) {
    super()
    this._options = Object.assign({}, DefaultResourceManagerOptions, options)
    this._rmf = new DefaultResourceManagerFactory(this._options)
  }

  /** Called by the Jovo framework after the plugin is installed */
  public install (app: BaseApp): void {
    app.middleware('after.platform.init')!.use((handleRequest: HandleRequest) => {
      const jovo = handleRequest.jovo!
      const locale = jovo.$request!.getLocale()
      let rm = this._rmf.forLocale(locale)
      jovo.jargon = new JJ(jovo, rm)
    })
  }

  public uninstall (parent?: any): void {
    // Nothing to do here
  }
}
