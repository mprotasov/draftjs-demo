import { EditorState, ContentState, ContentBlock } from "draft-js";

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
