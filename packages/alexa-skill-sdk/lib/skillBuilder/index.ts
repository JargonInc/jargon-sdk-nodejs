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
import { DefaultJargonResponseBuilderOptions, JargonResponseBuilderOptions } from '../responseBuilder'

export interface SkillBuilderOptions extends ResourceManagerOptions, JargonResponseBuilderOptions {
}

export const DefaultSkillBuilderOptions: Required<SkillBuilderOptions> = {
  ...DefaultResourceManagerOptions,
  ...DefaultJargonResponseBuilderOptions
}

/**
 * JargonSkillBuilder installs itself onto an ASK SkillBuilder. Under the covers it creates
 * a Jargon ResourceManager, and installs interceptors on the base skill builder that handle
 * augmenting the ASK request objects with Jargon's additions (such as JargonResponseBuilder)
 */
export class JargonSkillBuilder {
  private _options: Required<SkillBuilderOptions>
  private _rmf: ResourceManagerFactory

  /**
   * Constructs a new JargonSkillBuilder
   * @param opts Options for the skill builder; defaults to an empty object
   */
  constructor (opts: SkillBuilderOptions = {}) {
    this._options = Object.assign({}, DefaultSkillBuilderOptions, opts)
    this._rmf = new DefaultResourceManagerFactory(this._options)
  }

  /**
   * Installs onto a base ASK skill builder
   * @param base The base ASK skill builder
   */
  installOnto <T extends BaseSkillBuilder> (base: T): T {
    base.addRequestInterceptors(new JargonRequestInterceptor(this._rmf, this._options))
    return base
  }

  /**
   * @deprecated Use installOnto instead
   * @param base The base ASK skill builder
   */
  wrap <T extends BaseSkillBuilder> (base: T): T {
    return this.installOnto(base)
  }
}
