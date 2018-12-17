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

import { expect } from 'chai'
import { DefaultResourceManagerFactory, DefaultResourceManagerOptions, ri } from '@jargon/sdk-core'
import { CommonResponseFactory, JBasicCardOptions, JSimpleResponseOptions } from '../../lib/common'

const rm = new DefaultResourceManagerFactory(DefaultResourceManagerOptions).forLocale('en-US')
const rf = new CommonResponseFactory(rm)

it('Creates the expected BasicCard with title and text', async () => {
  const opts: JBasicCardOptions = {
    title: ri('TITLE'),
    text: ri('TEXT'),
    buttons: [],
    display: 'CROPPED'
  }

  const card = await rf.basicCard(opts)
  expect(card.title).equals('title')
  expect(card.formattedText).equals('text')
  expect(card.buttons).length(0)
  expect(card.imageDisplayOptions).equals('CROPPED')
})

it('Creates a simple response from a single render item', async () => {
  const simple = await rf.simple(ri('TITLE'))
  expect(simple.textToSpeech).equals('title')
  expect(simple.displayText).equals(undefined)
})

it('Creates a simple response from options without display text', async () => {
  const opt: JSimpleResponseOptions = {
    speech: ri('TITLE')
  }
  const simple = await rf.simple(opt)
  expect(simple.textToSpeech).equals('title')
  expect(simple.displayText).equals(undefined)
})

it('Creates a simple response from options with display text', async () => {
  const opt: JSimpleResponseOptions = {
    speech: ri('TITLE'),
    text: ri('TEXT')
  }
  const simple = await rf.simple(opt)
  expect(simple.textToSpeech).equals('title')
  expect(simple.displayText).equals('text')
})
