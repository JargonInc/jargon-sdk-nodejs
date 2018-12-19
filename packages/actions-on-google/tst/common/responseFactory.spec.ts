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

import { DefaultResourceManagerFactory, DefaultResourceManagerOptions, ri } from '@jargon/sdk-core'
import { expect } from 'chai'
import { CommonResponseFactory, JBasicCardOptions, JBrowseCarouselItemOptions, JButtonOptions, JImageOptions, JLinkOutSuggestionOptions, JMediaObjectOptions, JSimpleResponseOptions, JTableColumn, JTableOptions, JTableRow } from '../../lib/common'

/* tslint:disable:no-unused-expression */

const rm = new DefaultResourceManagerFactory(DefaultResourceManagerOptions).forLocale('en-US')
const rf = new CommonResponseFactory(rm)

const riText = ri('TEXT')
const riTitle = ri('TITLE')

const cropped = 'CROPPED'
const text = 'text'
const title = 'title'

it('Creates the expected BasicCard with title and text', async () => {
  const opts: JBasicCardOptions = {
    title: riTitle,
    text: riText,
    buttons: [],
    display: cropped
  }

  const card = await rf.basicCard(opts)
  expect(card.title).equals(title)
  expect(card.formattedText).equals(text)
  expect(card.buttons).length(0)
  expect(card.imageDisplayOptions).equals(cropped)
  expect(card.image).to.be.undefined
})

it('Creates a browse carousel item', async () => {
  const url = 'https://www.example.com/an_item'
  const opts: JBrowseCarouselItemOptions = {
    title: riTitle,
    url: url,
    description: riText,
    footer: riText
  }

  const bci = await rf.browseCarouselItem(opts)
  expect(bci.openUrlAction!.url).equals(url)
  expect(bci.description).equals(text)
  expect(bci.footer).equals(text)
  expect(bci.title).equals(title)
})

it('Creates a button', async () => {
  const url = 'https://www.example.com'
  const opts: JButtonOptions = {
    title: riTitle,
    url: url
  }

  const button = await rf.button(opts)
  expect(button.title).equals(title)
  expect(button.openUrlAction!.url).equals(url)
})

it('Creates an image', async () => {
  const url = 'https://www.example.com/image.png'
  const opts: JImageOptions = {
    url: url,
    alt: riText
  }

  const img = await rf.image(opts)
  expect(img.accessibilityText).equals(text)
  expect(img.url).equals(url)
})

it('Creates a link out suggestion', async () => {
  const url = 'https://www.example.com'
  const opts: JLinkOutSuggestionOptions = {
    url: url,
    name: riTitle
  }

  const los = await rf.linkOutSuggestion(opts)
  expect(los.destinationName).equals(title)
  expect(los.url).equals(url)
})

it('Creates a media object', async () => {
  const url = 'https://www.example.com/sounds.mp4'
  const opts: JMediaObjectOptions = {
    name: riTitle,
    description: riText,
    url: url
  }

  const ms = await rf.mediaObject(opts)
  expect(ms.contentUrl).equals(url)
  expect(ms.description).equals(text)
  expect(ms.name).equals(title)
})

it('Creates a simple response from a single render item', async () => {
  const simple = await rf.simple(riTitle)
  expect(simple.textToSpeech).equals(title)
  expect(simple.displayText).equals(undefined)
})

it('Creates a simple response from options without display text', async () => {
  const opt: JSimpleResponseOptions = {
    speech: riTitle
  }
  const simple = await rf.simple(opt)
  expect(simple.textToSpeech).equals(title)
  expect(simple.displayText).equals(undefined)
})

it('Creates a simple response from options with display text', async () => {
  const opt: JSimpleResponseOptions = {
    speech: riTitle,
    text: riText
  }
  const simple = await rf.simple(opt)
  expect(simple.textToSpeech).equals(title)
  expect(simple.displayText).equals(text)
})

it('Creates a suggestion with a single member', async () => {
  const s = await rf.suggestions(riText)
  expect(s.suggestions).length(1)
  expect(s.suggestions[0].title).equals(text)
})

it('Creates a suggestion with a multiple members', async () => {
  const s = await rf.suggestions(riText, riTitle)
  expect(s.suggestions).length(2)
  expect(s.suggestions[0].title).equals(text)
  expect(s.suggestions[1].title).equals(title)
})

it('Creates a table', async () => {
  const to: JTableOptions = {
    title: riTitle,
    subtitle: riText,
    rows: []
  }

  const table = await rf.table(to)
  expect(table.title!).equals(title)
  expect(table.subtitle!).equals(text)
})

it('Creates a table column', async () => {
  const tc: JTableColumn = {
    header: riTitle
  }

  const column = await rf.tableColumn(tc)
  expect(column.header!).equals(title)
})

it('Creates a table row', async () => {
  const jtr: JTableRow = {
    cells: [riText, riTitle],
    dividerAfter: true
  }

  const tr = await rf.tableRow(jtr)
  expect(tr.cells!).length(2)
  expect(tr.cells![0].toString()).equals(text)
  expect(tr.cells![1].toString()).equals(title)
  expect(tr.dividerAfter).to.be.true
})
