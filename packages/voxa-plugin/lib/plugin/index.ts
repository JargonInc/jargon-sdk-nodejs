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

import { DefaultResourceManagerFactory, DefaultResourceManagerOptions, ResourceManager, ResourceManagerFactory, ResourceManagerOptions, RenderOptions } from '@jargon/sdk-core'
import { IVoxaEvent, IVoxaReply, VoxaApp } from 'voxa'
import { JargonRenderer } from '../renderer'

declare module 'voxa/lib/src/VoxaEvent' {
  export interface IVoxaEvent {
    jrm?: ResourceManager
    jargonResourceManager?: ResourceManager
    jargonRenderOptions?: RenderOptions
  }
}

export interface JargonVoxaOptions extends ResourceManagerOptions {
}

export function JargonVoxa (options: JargonVoxaOptions, voxaConfig: any): VoxaApp {
  const config = {
    views: {},
    ...voxaConfig,
    RenderClass: JargonRenderer
  }

  const app = new VoxaApp(config)
  const plugin = new JargonVoxaPlugin(options)
  plugin.installOnto(app)

  return app
}

class JargonVoxaPlugin {
  private _options: Required<JargonVoxaOptions>
  private _rmf: ResourceManagerFactory

  constructor (options: JargonVoxaOptions) {
    this._options = Object.assign({}, DefaultResourceManagerOptions, options)
    this._rmf = new DefaultResourceManagerFactory(this._options)
  }

  public installOnto (app: VoxaApp) {
    app.onRequestStarted(this.requestHandler)
  }

  requestHandler = (event: IVoxaEvent, reply: IVoxaReply) => {
    const locale = event.request.locale || 'en-US'
    event.jrm = this._rmf.forLocale(locale)
    event.jargonResourceManager = event.jrm
  }
}
