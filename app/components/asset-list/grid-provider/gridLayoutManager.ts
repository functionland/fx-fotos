import { Dimension, Layout, LayoutManager } from 'fula-recyclerlistview'
import Reanimated, { SharedValue } from 'react-native-reanimated'
import GridLayoutProvider from './gridLayoutProvider'
import { translateOrigin } from '../../../utils/helper'

export const MAX_COLUMNS = 4
export const MIN_COLUMNS = 1
export interface LayoutTransitionRange {
  colsRange: number[]
  translateX: number[]
  translateY: number[]
  scale: number[]
}
// We are basically recreating WrapGridLayoutManager here
export default class GridLayoutManager extends LayoutManager {
  // k is the number of columns
  private _allLayouts: Layout[][] // hold MAX_COLUMNS - MIN_COLUMNS + 1 sets of layouts

  private _columnNumber: SharedValue<number>

  private _layoutProvider: GridLayoutProvider

  private _window: Dimension

  private _totalHeight: Record<number, number>

  private _totalWidth: Record<number, number>

  constructor(
    layoutProvider: GridLayoutProvider,
    renderWindowSize: Dimension,
    columnsNumber: SharedValue<number>,
    scale: Reanimated.SharedValue<number>,
    cachedLayouts?: Layout[],
  ) {
    super()
    this._layoutProvider = layoutProvider
    this._window = renderWindowSize
    this._totalHeight = { [columnsNumber.value]: 0 }
    this._totalWidth = { [columnsNumber.value]: 0 }
    this._columnNumber = columnsNumber
    this._allLayouts = [[], [], [], []]
    this._allLayouts[this._columnNumber.value - MIN_COLUMNS] =
      cachedLayouts || []
  }

  public getStyleOverridesForIndex(index: number): object | undefined {
    // This is where to put the transform
    return undefined
  }

  public getContentDimension(): Dimension {
    return {
      height:
        this._totalHeight[this._columnNumber.value] || this._window.height,
      width: this._totalWidth[this._columnNumber.value] || this._window.width,
    }
  }

  public getAllContentDimension(): Dimension {
    return {
      height: this._totalHeight,
      width: this._totalWidth,
    }
  }

  public getLayouts(): Layout[] {
    return this._allLayouts[this._columnNumber.value - MIN_COLUMNS]
  }

  public getAllLayouts(): Layout[][] {
    return this._allLayouts
  }

  public getLayoutsForIndex(index: number): Layout[] {
    if (this._allLayouts.every(layout => index < layout.length)) {
      return this._allLayouts.map(layouts => layouts[index])
      // .map((layouts, idx) => ({
      //   layout: layouts[index],
      //   colNum: idx + MIN_COLUMNS,
      // }))
    }
    throw new Error('Layouts unavalaible')
  }

  public getGirdColumnsRange(): number[] {
    return this._allLayouts.map((_, idx) => idx + MIN_COLUMNS)
  }

  public getLayoutTransitionRangeForIndex(
    index: number,
    currentNumColumns: number,
  ): LayoutTransitionRange {
    const layouts = this.getLayoutsForIndex(index)
    const colsRange = this.getGirdColumnsRange()
    const currentLayout = layouts[currentNumColumns - MIN_COLUMNS]
    return layouts.reduce(
      (obj, layout) => {
        obj.translateX.push(
          translateOrigin(
            layout.x - currentLayout.x,
            currentLayout.width - layout.width,
          ),
        )
        obj.translateY.push(
          translateOrigin(
            layout.y - currentLayout.y,
            currentLayout.width - layout.width,
          ),
        )
        if (layout.width && currentLayout.width) {
          obj.scale.push(layout.width / currentLayout.width)
        } else obj.scale.push(1)

        return obj
      },
      {
        translateX: [],
        translateY: [],
        scale: [],
        colsRange,
      },
    )
  }

  public overrideLayout(index: number, dim: Dimension): boolean {
    // We may look into GridLayoutManager for a better algorithm
    const layout = this.getLayouts()[index]
    if (layout) {
      const heightDiff = Math.abs(dim.height - layout.height)
      const widthDiff = Math.abs(dim.width - layout.width)
      if (widthDiff < 3) {
        if (heightDiff === 0) {
          return false
        }
        dim.width = layout.width
      }
      layout.isOverridden = true
      layout.width = dim.width
      layout.height = dim.height
    }
    return true
  }

  public setMaxBounds(itemDim: Dimension): void {
    itemDim.width = Math.min(this._window.width, itemDim.width)
  }

  private _pointDimensionsToRect(itemRect: Layout, columnNumber: number): void {
    if (this._isHorizontal) {
      this._totalWidth[columnNumber] = itemRect.x
    } else {
      this._totalHeight[columnNumber] = itemRect.y
    }
  }

  public relayoutFromIndex(startIndex: number, itemCount: number): void {
    // we will calculate the other layouts as well
    // [-1, 0, 1].filter(d => this._columnNumber + d >= MIN_COLUMNS || this._columnNumber + d <= MAX_COLUMNS)
    this._allLayouts
      .map((layouts, idx) => ({ layouts, columnNumber: idx + MIN_COLUMNS }))
      .forEach(({ layouts, columnNumber }) => {
        let startX = 0
        let startY = 0
        let maxBound = 0
        // Locate which item is the first on the row we're starting
        startIndex = this._locateFirstNeighbourIndex(startIndex, layouts)
        const startVal = layouts[startIndex]
        if (startVal) {
          startX = startVal.x
          startY = startVal.y
          this._pointDimensionsToRect(startVal, columnNumber)
        }

        // initializing
        const oldItemCount = layouts.length
        const itemDim = { height: 0, width: 0 }
        let itemRect = null
        let oldLayout = null

        if (!this._totalWidth[columnNumber]) this._totalWidth[columnNumber] = 0
        if (!this._totalHeight[columnNumber])
          this._totalHeight[columnNumber] = 0

        for (let i = startIndex; i < itemCount; i++) {
          oldLayout = layouts[i]
          const layoutType = this._layoutProvider.getLayoutTypeForIndex(i)

          if (
            oldLayout &&
            oldLayout.isOverridden &&
            oldLayout.type === layoutType
          ) {
            // We're sure the old value are still valid
            itemDim.height = oldLayout.height
            itemDim.width = oldLayout.width
          } else {
            // recompute
            this._layoutProvider.setComputedLayout(
              layoutType,
              itemDim,
              i,
              columnNumber,
            )
          }
          // make sure the item is not wider than the screen
          this.setMaxBounds(itemDim)
          // wrap the item if needed
          while (
            !this._checkBounds(startX, startY, itemDim, this._isHorizontal)
          ) {
            if (this._isHorizontal) {
              startX += maxBound
              startY = 0
              this._totalWidth[columnNumber] += maxBound
            } else {
              startX = 0
              startY += maxBound
              this._totalHeight[columnNumber] += maxBound
            }
            maxBound = 0
          }
          maxBound = this._isHorizontal
            ? Math.max(maxBound, itemDim.width)
            : Math.max(maxBound, itemDim.height)

          // TODO: Talha creating array upfront will speed this up
          if (i > oldItemCount - 1) {
            // New items have been added to the dataprovider
            layouts.push({
              x: startX,
              y: startY,
              height: itemDim.height,
              width: itemDim.width,
              type: layoutType,
            })
          } else {
            // replacing
            itemRect = layouts[i]
            itemRect.x = startX
            itemRect.y = startY
            itemRect.type = layoutType
            itemRect.width = itemDim.width
            itemRect.height = itemDim.height
          }
          // jumping the origin around
          if (this._isHorizontal) {
            startY += itemDim.height
          } else {
            startX += itemDim.width
          }
        }
        if (oldItemCount > itemCount) {
          // Some elements have been removed from the data provider, so we're trimming the layouts
          layouts.splice(itemCount, oldItemCount - itemCount)
        }
        this._setFinalDimensions(maxBound, columnNumber)
      })
  }

  private _locateFirstNeighbourIndex(
    startIndex: number,
    layouts = this.getLayouts(),
  ): number {
    if (startIndex === 0) {
      return 0
    }
    let i = startIndex - 1
    for (; i >= 0; i--) {
      if (layouts[i].x === 0) {
        break
      }
    }
    return i
  }

  private _setFinalDimensions(maxBound: number, columnNumber: number): void {
    if (this._isHorizontal) {
      this._totalHeight[columnNumber] = this._window.height
      this._totalWidth[columnNumber] += maxBound
    } else {
      this._totalWidth[columnNumber] = this._window.width
      this._totalHeight[columnNumber] += maxBound
    }
  }

  private _checkBounds(
    itemX: number,
    itemY: number,
    itemDim: Dimension,
    isHorizontal: boolean,
  ): boolean {
    return isHorizontal
      ? itemY + itemDim.height <= this._window.height
      : itemX + itemDim.width <= this._window.width
  }
}
