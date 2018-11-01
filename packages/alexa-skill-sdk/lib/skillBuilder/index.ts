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

import { BaseSkillBuilder } from 'ask-sdk-core'
import { ResourceManagerFactory, DefaultResourceManagerFactory, ResourceManagerOptions, DefaultResourceManagerOptions } from '@jargon/sdk-core'
import { JargonRequestInterceptor } from '../requestInterceptor'

export interface SkillBuilderOptions extends ResourceManagerOptions {
}

export const DefaultSkillBuilderOptions: Required<SkillBuilderOptions> = {
  ...DefaultResourceManagerOptions
}

export class JargonSkillBuilder {
  private _options: Required<SkillBuilderOptions>
  private _rmf: ResourceManagerFactory

  constructor (opts: SkillBuilderOptions = {}) {
    this._options = Object.assign({}, DefaultSkillBuilderOptions, opts)
    this._rmf = new DefaultResourceManagerFactory(this._options)
  }

  wrap <T extends BaseSkillBuilder> (base: T): T {
    base.addRequestInterceptors(new JargonRequestInterceptor(this._rmf))
    return base
  }
}
