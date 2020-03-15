import { EditorState, ContentState, ContentBlock, SelectionState, DraftBlockType } from "draft-js";
const modifyBlockForContentState = require('draft-js/lib/modifyBlockForContentState')

export type AlignBlockType = 'left' | 'center' | 'right'
export type FontBlockType = 'normal' | 'bold'

export const getSelectedBlocks = (contentState: ContentState, anchorKey: string, focusKey: string): ContentBlock[] => {
    const isSameBlock = anchorKey === focusKey;
    const startingBlock = contentState.getBlockForKey(anchorKey);
    const selectedBlocks = [startingBlock];
  
    if (!isSameBlock) {
      let blockKey = anchorKey;
  
      while (blockKey !== focusKey) {
        const nextBlock = contentState.getBlockAfter(blockKey);
        selectedBlocks.push(nextBlock);
        blockKey = nextBlock.getKey();
      }
    }
  
    return selectedBlocks;
  }

  export const setAlignBlockType = (
    contentState: ContentState,
    selectionState: SelectionState,
    blockType: AlignBlockType,
  ): ContentState => {
    return modifyBlockForContentState(contentState, selectionState, (block: ContentBlock) => {
        const currentType = block.getType()
        let newType = ''

        if (currentType === 'unstyled') {
            newType = 'normal-' + blockType
        }
        else {
            const types = currentType.split('-')
            newType = types[0] + '-' + blockType
        }

        return block.merge({type: newType, depth: 0})
    }
    )
  }

  export const setFontBlockType = (
    contentState: ContentState,
    selectionState: SelectionState,
    blockType: FontBlockType,
  ): ContentState => {
    return modifyBlockForContentState(contentState, selectionState, (block: ContentBlock) => {
        const currentType = block.getType()
        let newType = ''
        if (currentType === 'unstyled') {
            newType = blockType + '-left'
        }
        else {
            const types = currentType.split('-')
            newType = (types[0] === 'normal' ? blockType : 'normal')  + '-' + types[1]
        }

        return block.merge({type: newType, depth: 0})
    }
    )
  }