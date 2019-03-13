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
import { AlexaEvent, AlexaPlatform, DialogFlowEvent, DialogFlowPlatform, IVoxaEvent, VoxaApp } from 'voxa'
import { DefaultResourceManagerFactory, ri } from '../lib'
import { makeJargonInternal } from '../lib/plugin'
import { JargonRenderer } from '../lib/renderer'
import { AlexaRequestBuilder } from './tools'

const arb = new AlexaRequestBuilder()
const rmf = new DefaultResourceManagerFactory({})
const app = new VoxaApp({ views: {} })

const variationTimes = 20

function makeVars (basic: string, plural: number) {
  return {
    basicParam: () => basic,
    pluralParam: () => plural
  }
}

function renderer (variables?: any): JargonRenderer {
  const config = {
    variables: variables,
    views: {}
  }
  return new JargonRenderer(config)
}

function makeAlexaEvent (locale: string = 'en-US'): IVoxaEvent {
  const r = arb.getIntentRequest('FakeIntent')
  const jrm = rmf.forLocale(locale)
  const e = new AlexaEvent(r)
  // @ts-ignore Code below ensures the event has the necessary Jargon additions
  e.platform = new AlexaPlatform(app)

  return {
    ...e,
    jrm,
    jargonResourceManager: jrm,
    $jargon: makeJargonInternal()
  }
}

function makeDialogflowEvent (locale: string = 'en-US'): IVoxaEvent {
  const r = require('./dialogflowSimpleIntentRequest.json')
  const jrm = rmf.forLocale(locale)
  const e = new DialogFlowEvent(r)
  // @ts-ignore Code below ensures the event has the necessary Jargon additions
  e.platform = new DialogFlowPlatform(app)

  return {
    ...e,
    jrm,
    jargonResourceManager: jrm,
    $jargon: makeJargonInternal()
  }
}

describe('Jargon Renderer', function () {
  it('Renders a simple string', async () => {
    const r = renderer()
    const s = await r.renderPath('simple', makeAlexaEvent())
    expect(s).equals('simple')
  })

  it('Renders using the correct locale', async () => {
    const r = renderer()
    const s = await r.renderPath('simple', makeAlexaEvent('de-DE'))
    expect(s).equals('de simple')
  })

  it('Renders a basic parameter correctly', async () => {
    const param = 'This is my param'
    const vars = makeVars(param, 0)
    const r = renderer(vars)
    const s = await r.renderPath('basicParam', makeAlexaEvent())
    expect(s).equals(`basicParam: ${param}`)
  })

  it('Uses passed in parameters instead of ones from config', async () => {
    const param = 'This is my param'
    const vars = makeVars('Not the param we should use', 0)
    const r = renderer(vars)
    const s = await r.renderPath('basicParam', makeAlexaEvent(), { basicParam: param })
    expect(s).equals(`basicParam: ${param}`)
  })

  it('Renders the correct plural case for 0', async () => {
    const vars = makeVars('', 0)
    const r = renderer(vars)
    const s = await r.renderPath('pluralParam', makeAlexaEvent())
    expect(s).equals('zero')
  })

  it('Renders the correct plural case for 1', async () => {
    const vars = makeVars('fish', 1)
    const r = renderer(vars)
    const s = await r.renderPath('pluralParam', makeAlexaEvent())
    expect(s).equals('One fish')
  })

  it('Renders the correct plural case for other', async () => {
    const vars = makeVars('', 17)
    const r = renderer(vars)
    const s = await r.renderPath('pluralParam', makeAlexaEvent())
    expect(s).equals('17')
  })

  it('Correctly passes the voxa event to variables when rendering', async () => {
    const id = 'UserID'
    const vars = {
      basicParam: (e: IVoxaEvent) => e.user.userId,
      pluralParam: () => 0
    }
    const r = renderer(vars)
    const e = makeAlexaEvent()
    e.user.userId = id
    const s = await r.renderPath('basicParam', e)
    expect(s).equals(`basicParam: ${id}`)
  })

  it('Correctly handles nested render items via variables', async () => {
    const param = 'param'
    const vars = {
      basicParam: () => ri('sub', { param }),
      pluralParam: () => 2
    }
    const r = renderer(vars)
    const s = await r.renderPath('basicParam', makeAlexaEvent())
    expect(s).equals(`basicParam: ${param}`)
  })

  it('Returns the platform-specific content if present', async () => {
    const r = renderer()
    const s: any = await r.renderPath('platformSpecific', makeAlexaEvent())
    expect(s.message).equals('alexa-specific message')
  })

  it('Filters out content for other platforms', async () => {
    const r = renderer()
    const s: any = await r.renderPath('platformSpecific', makeDialogflowEvent())
    expect(s.alexa).is.undefined
  })

  it('Returns the generic content when not from a matching platform', async () => {
    const r = renderer()
    const s: any = await r.renderPath('platformSpecific', makeDialogflowEvent())
    expect(s.message).equals('generic message')
  })

  it('Filters out platform specific responses when selecting variations', async () => {
    for (let i = 0; i < variationTimes; i++) {
      const r = renderer()
      const s = await r.render('platformSpecificWithVariations', makeDialogflowEvent())
      expect(s).oneOf(['First variation', 'Second variation'])
    }
  })

  it('Returns a platform-specific variation if present', async () => {
    for (let i = 0; i < variationTimes; i++) {
      const r = renderer()
      const s = await r.render('platformSpecificWithVariations', makeAlexaEvent())
      expect(s).oneOf(['First variation alexa', 'Second variation alexa'])
    }
  })
})
