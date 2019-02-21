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

import { expect } from 'chai'
import { JargonVoxa } from '../lib/'
import { JargonRenderer } from '../lib/renderer'
import { AlexaPlatform, VoxaApp } from 'voxa'
import { AlexaRequestBuilder } from './tools'
import { IAlexaPlatformConfig } from 'voxa/lib/src/platforms/alexa/AlexaPlatform'

const arb = new AlexaRequestBuilder()

it('Successfully creates a Voxa app with our renderer', () => {
  const app = makeApp()
  expect(app.renderer).instanceOf(JargonRenderer)
})

it('Gets the response from the resource file', async () => {
  const intent = 'SimpleIntent'
  const app = makeApp()
  app.onIntent(intent, { tell: intent })
  const skill = makeSkill(app)
  const event = arb.getIntentRequest(intent)
  const r = await skill.execute(event)
  expect(r.response.outputSpeech.ssml).equals('<speak>A simple response</speak>')
})

function makeApp (config: any = {}) {
  return JargonVoxa({}, config)
}

function makeSkill (app: VoxaApp, config?: IAlexaPlatformConfig) {
  return new AlexaPlatform(app, config)
}
