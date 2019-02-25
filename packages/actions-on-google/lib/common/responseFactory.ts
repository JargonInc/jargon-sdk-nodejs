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

import { RenderItem, ResourceManager } from '@jargon/sdk-core'
import { BasicCard, BasicCardOptions, BrowseCarouselItem, BrowseCarouselItemOptions, Button, ButtonOptions, GoogleActionsV2UiElementsBasicCardImageDisplayOptions, GoogleActionsV2UiElementsButton, GoogleActionsV2UiElementsImage, GoogleActionsV2UiElementsOpenUrlAction, GoogleActionsV2UiElementsTableCardColumnPropertiesHorizontalAlignment, Image, ImageOptions, LinkOutSuggestion, LinkOutSuggestionOptions, MediaObject, MediaObjectOptions, SimpleResponse, SimpleResponseOptions, Suggestions, Table, TableColumn, TableOptions, TableRow } from 'actions-on-google'

/**
 * A Jargonized version of BasicCardOptions
 */
export interface JBasicCardOptions {
  title?: RenderItem
  subtitle?: RenderItem
  text?: RenderItem
  image?: GoogleActionsV2UiElementsImage
  buttons?: GoogleActionsV2UiElementsButton | GoogleActionsV2UiElementsButton[]
  display?: GoogleActionsV2UiElementsBasicCardImageDisplayOptions
}
const jBasicCardFields = ['title', 'subtitle', 'text']

/**
 * A Jargonized version of BrowseCarouselItemOptions
 */
export interface JBrowseCarouselItemOptions {
  title: RenderItem
  url: string
  description?: RenderItem
  footer?: RenderItem
  image?: GoogleActionsV2UiElementsImage
}
const jBrowseCarouselItemFields = ['title', 'description', 'footer']

/**
 * A Jargonized version of ButtonOptions
 */
export interface JButtonOptions {
  title: RenderItem
  url?: string
  action?: GoogleActionsV2UiElementsOpenUrlAction
}
const jButtonFields = ['title']

/**
 * A Jargonized version of ImageOptions
 */
export interface JImageOptions {
  url: string
  alt: RenderItem
  height?: number
  width?: number
}
const jImageFields = ['alt']

/**
 * A Jargonized version of LinkOutSuggestionOptions
 */
export interface JLinkOutSuggestionOptions {
  name: RenderItem
  url: string
}
const jLinkOutSuggestionFields = ['name']

/**
 * A Jargonized version of MediaObjectOptions
 */
export interface JMediaObjectOptions {
  url: string
  description?: RenderItem
  name?: RenderItem
  icon?: GoogleActionsV2UiElementsImage
  image?: GoogleActionsV2UiElementsImage
}
const jMediaObjectFields = ['description', 'name']

/**
 * A Jargonized version of SimpleResponseOptions
 */
export interface JSimpleResponseOptions {
  speech: RenderItem
  text?: RenderItem
}
const jSimpleResponseFields = ['speech', 'text']

/**
 * A Jargonized version of TableOptions
 */
export interface JTableOptions {
  title?: RenderItem
  subtitle?: RenderItem
  image?: GoogleActionsV2UiElementsImage
  columns?: (TableColumn | string)[] | number
  columnProperties?: (TableColumn | string)[]
  rows: (TableRow | string[])[]
  dividers?: boolean
  buttons?: GoogleActionsV2UiElementsButton | GoogleActionsV2UiElementsButton[]
}
const jTableOptionsFields = ['title', 'subtitle']

/**
 * A Jargonized version of TableColumn
 */
export interface JTableColumn {
  header?: RenderItem
  horizontalAlignment?: GoogleActionsV2UiElementsTableCardColumnPropertiesHorizontalAlignment
  align?: GoogleActionsV2UiElementsTableCardColumnPropertiesHorizontalAlignment
}
const jTableColumnFields = ['header']

/**
 * A Jargonized version of TableRow
 */
export interface JTableRow {
  cells?: RenderItem[]
  dividerAfter?: boolean
}

/**
 * ResponseFactory simplifies the construction of response objects via the Jargon
 * SDK. The various options objects mirror the constructors for the associated Actions
 * on Google response objects, but take RenderItems instead of raw string parameters for
 * content that is spoken or displayed to the end user.
 *
 * Note that all of the methods in ResponseFactory return a Promise to the response object.
 */
export interface ResponseFactory {
  basicCard (options: JBasicCardOptions): Promise<BasicCard>
  browseCarouselItem (options: JBrowseCarouselItemOptions): Promise<BrowseCarouselItem>
  button (options: JButtonOptions): Promise<Button>
  image (options: JImageOptions): Promise<Image>
  linkOutSuggestion (options: JLinkOutSuggestionOptions): Promise<LinkOutSuggestion>
  mediaObject (options: JMediaObjectOptions): Promise<MediaObject>
  simple (options: JSimpleResponseOptions | RenderItem): Promise<SimpleResponse>
  suggestions (...suggestions: RenderItem[]): Promise<Suggestions>
  table (options: JTableOptions): Promise<Table>
  tableColumn (column: JTableColumn): Promise<TableColumn>
  tableRow (row: JTableRow): Promise<TableRow>
}

/**
 * The core implementation of ResponseFactory
 */
export class CommonResponseFactory implements ResponseFactory {

  constructor (private _rm: ResourceManager) {}

  async basicCard (options: JBasicCardOptions): Promise<BasicCard> {
    const card: BasicCardOptions = await this._render(options, jBasicCardFields)
    return new BasicCard(card)
  }

  async browseCarouselItem (options: JBrowseCarouselItemOptions): Promise<BrowseCarouselItem> {
    const bci: BrowseCarouselItemOptions = await this._render(options, jBrowseCarouselItemFields)
    return new BrowseCarouselItem(bci)
  }

  async button (options: JButtonOptions): Promise<Button> {
    const button: ButtonOptions = await this._render(options, jButtonFields)
    return new Button(button)
  }

  async image (options: JImageOptions): Promise<Image> {
    const image: ImageOptions = await this._render(options, jImageFields)
    return new Image(image)
  }

  async linkOutSuggestion (options: JLinkOutSuggestionOptions): Promise<LinkOutSuggestion> {
    const los: LinkOutSuggestionOptions = await this._render(options, jLinkOutSuggestionFields)
    return new LinkOutSuggestion(los)
  }

  async mediaObject (options: JMediaObjectOptions): Promise<MediaObject> {
    const mos: MediaObjectOptions = await this._render(options, jMediaObjectFields)
    return new MediaObject(mos)
  }

  async simple (options: JSimpleResponseOptions | RenderItem): Promise<SimpleResponse> {
    if (isRI(options)) {
      return new SimpleResponse(await this._rm.render(options))
    }

    const sro: SimpleResponseOptions = await this._render(options, jSimpleResponseFields)
    return new SimpleResponse(sro)
  }

  async suggestions (...suggestions: RenderItem[]): Promise<Suggestions> {
    const rendered = await this._rm.renderBatch(suggestions)
    return new Suggestions(rendered)
  }

  async table (options: JTableOptions): Promise<Table> {
    const to: TableOptions = await this._render(options, jTableOptionsFields)
    return new Table(to)
  }

  async tableColumn (column: JTableColumn): Promise<TableColumn> {
    const c: TableColumn = await this._render(column, jTableColumnFields)
    return c
  }

  async tableRow (row: JTableRow): Promise<TableRow> {
    let cells: string[] | undefined
    if (row.cells) {
      cells = await this._rm.renderBatch(row.cells)
    }

    return Object.assign({}, row, { cells: cells })
  }

  protected async _render<J, G> (jOpts: J, fields: string[]): Promise<G> {
    let ris: RenderItem[] = []
    for (const f of fields) {
      const val = jOpts[f]
      val && ris.push(val)
    }
    const rendered = await this._rm.renderBatch(ris)

    let pg: Partial<G> = {}
    let i = 0
    for (const f of fields) {
      if (jOpts[f]) {
        pg[f] = rendered[i++]
      }
    }

    pg = Object.assign({}, jOpts, pg)
    return pg as G
  }
}

function isRI (ri: any): ri is RenderItem {
  return typeof ri.key === 'string'
}
