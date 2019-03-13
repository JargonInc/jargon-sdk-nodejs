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

// tslint:disable:no-unused-expression

import { expect } from 'chai'
import { JargonVoxa } from '../lib/'
import { JargonRenderer } from '../lib/renderer'
import { AlexaPlatform, DialogFlowPlatform, VoxaApp } from 'voxa'
import { AlexaRequestBuilder } from './tools'
import { IAlexaPlatformConfig } from 'voxa/lib/src/platforms/alexa/AlexaPlatform'
import { IDialogFlowPlatformConfig } from 'voxa/lib/src/platforms/dialogflow/DialogFlowPlatform'
// import { inspect } from 'util'

const arb = new AlexaRequestBuilder()
const intent = 'SimpleIntent'

const variationTimes = 20

describe('Jargon Voxa Plugin', function () {
  describe('#Ask', function () {
    it('Selects a response variation', async () => {
      const r = await executeAlexaTransition({ ask: 'variation' })
      expect(r.response.outputSpeech.ssml).oneOf(['<speak>First variation</speak>', '<speak>Second variation</speak>'])
    })

    it('Handles an object with ask and reprompt', async () => {
      const r = await executeAlexaTransition({ ask: 'simpleAskAndReprompt' })
      expect(r.response.outputSpeech.ssml).equals('<speak>ask message</speak>')
      expect(r.response.reprompt.outputSpeech.ssml).equals('<speak>reprompt message</speak>')
    })

    it('Handles an object with ask and reprompt variations', async () => {
      const r = await executeAlexaTransition({ ask: 'variationAskAndReprompt' })
      expect(r.response.outputSpeech.ssml).oneOf(['<speak>ask message 1</speak>', '<speak>ask message 2</speak>'])
      expect(r.response.reprompt.outputSpeech.ssml).oneOf(['<speak>reprompt message 1</speak>', '<speak>reprompt message 2</speak>'])
    })
  })

  it('Successfully creates a Voxa app with our renderer', () => {
    const app = makeApp()
    expect(app.renderer).instanceOf(JargonRenderer)
  })

  it('Gets the tell response from the resource file', async () => {
    const r = await executeAlexaTransition({ tell: intent })
    expect(r.response.outputSpeech.ssml).equals('<speak>A simple response</speak>')
    expect(r.response.shouldEndSession).to.be.true
  })

  it('Selects a reprompt variation using Jargon logic', async () => {
    const r = await executeAlexaTransition({ reprompt: 'variation' })
    expect(r.response.reprompt.outputSpeech.ssml).oneOf(['<speak>First variation</speak>', '<speak>Second variation</speak>'])
  })

  it('Selects a say variation using Jargon logic', async () => {
    const r = await executeAlexaTransition({ say: 'variation' })
    expect(r.response.outputSpeech.ssml).oneOf(['<speak>First variation</speak>', '<speak>Second variation</speak>'])
  })

  it('Selects a platform specific say variation using Jargon logic', async () => {
    for (let i = 0; i < variationTimes; i++) {
      const r = await executeAlexaTransition({ say: 'platformSpecificWithVariations' })
      expect(r.response.outputSpeech.ssml).oneOf(['<speak>First variation alexa</speak>', '<speak>Second variation alexa</speak>'])
    }
  })

  it('Merges together multiple say resources', async () => {
    const r = await executeAlexaTransition({ say: ['variation.v1', 'variation.v2'] })
    expect(r.response.outputSpeech.ssml).equals('<speak>First variation\nSecond variation</speak>')
  })

  it('Selects a text variation using Jargon logic', async () => {
    const r = await executeDialogflowTransition({ text: 'variation' })
    expect(r.fulfillmentText).oneOf(['First variation', 'Second variation'])
  })

  it('Merges together multiple text resources', async () => {
    const r = await executeDialogflowTransition({ text: ['variation.v1', 'variation.v2'] })
    expect(r.fulfillmentText).equals('First variation Second variation')
  })

  it('Renders the directives in the reply object', async () => {
    const r = await executeAlexaTransition({ reply: 'reply.s1' })
    expect(r.response.outputSpeech.ssml).equals('<speak>reply s1 ask</speak>')
    expect(r.response.reprompt.outputSpeech.ssml).oneOf(['<speak>reply s1 reprompt 1</speak>', '<speak>reply s1 reprompt 2</speak>'])
  })

  it('Includes a hint with variations', async () => {
    const r = await executeAlexaTransition({ alexaHint: 'hint' })
    const ds = r.response.directives
    expect(ds).to.have.length(1)
    const hint = ds[0]
    expect(hint.hint.text).oneOf(['hint 1', 'hint 2'])
  })
})

function executeAlexaTransition (transition: any, appConfig?: any, platformConfig?: any): Promise<any> {
  const app = makeApp(appConfig)
  app.onIntent(intent, transition)
  const platform = makeAlexaPlatform(app, platformConfig)
  const request = arb.getIntentRequest(intent)
  return platform.execute(request)
}

function executeDialogflowTransition (transition: any, appConfig?: any, platformConfig?: any): Promise<any> {
  const app = makeApp(appConfig)
  app.onIntent(intent, transition)
  const platform = makeDialogflowPlatform(app, platformConfig)
  const request = require('./dialogflowSimpleIntentRequest.json')
  return platform.execute(request)
}

function makeApp (config: any = {}) {
  return JargonVoxa({}, config)
}

function makeAlexaPlatform (app: VoxaApp, config?: IAlexaPlatformConfig) {
  return new AlexaPlatform(app, config)
}

function makeDialogflowPlatform (app: VoxaApp, config?: IDialogFlowPlatformConfig) {
  return new DialogFlowPlatform(app, config)
}
