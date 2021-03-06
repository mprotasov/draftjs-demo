import { ContentState, ContentBlock, SelectionState, Modifier } from "draft-js";
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

        return block.merge({ type: newType, depth: 0 })
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
            newType = (types[0] === 'normal' ? blockType : 'normal') + '-' + types[1]
        }

        return block.merge({ type: newType, depth: 0 })
    }
    )
}

const REPLACEMENT_REGEXP = /(%repl){1}[\s\S]+(repl%){1}/g
export const replacementStrategy = (contentBlock: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) => {
    findWithRegex(REPLACEMENT_REGEXP, contentBlock, callback)
}

function findWithRegex(regex: RegExp, contentBlock: ContentBlock, callback: (start: number, end: number) => void) {
    const text = contentBlock.getText();
    let matchArr, start;
    while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
    }
}

export const REPLACEMENT = 'REPLACEMENT'

export const getReplacementEntityStrategy = (contentBlock: ContentBlock, callback: any, contentState: ContentState) => {
    contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            if (entityKey === null) {
                return false;
            }
            return contentState.getEntity(entityKey).getType() === REPLACEMENT;
        },
        callback
    )
}

export const removeEntityRange = (contentState: ContentState, entityKey: string) => {
    let rangeStart
    let rangeEnd
    let rangeBlock: any
    contentState.getBlocksAsArray().forEach(block => {
        block.findEntityRanges(character => {
            if (character.getEntity() === entityKey) {
                return true
            }

            return false
        },
            (start, end) => {  
                rangeStart = block.getText().charAt(start - 1) === ' ' ? start - 1 : start // remove spaces that we added around replacement if needed
                rangeEnd = block.getText().charAt(end) === ' ' ? end + 1 : end             // ^
                rangeBlock = block
            })
    })
    if (rangeBlock) {
        const selection = new SelectionState({
            anchorKey: rangeBlock.getKey(),
            focusKey: rangeBlock.getKey(),
            focusOffset: rangeEnd,
            anchorOffset: rangeStart,
        })

        return Modifier.removeRange(contentState, selection, 'backward')
    }

    return contentState
}

export const getReplacementWithSpaces = (contentState: ContentState, selection: SelectionState, entityKey: string, label: string) => {
    const firstBlank = Modifier.insertText(contentState, selection, ' ', undefined, undefined) // we should add space before our repl...
    const textWithEntity = Modifier.insertText(firstBlank, selection, label, undefined, entityKey)
    const secondBlank = Modifier.insertText(textWithEntity, selection, ' ', undefined, undefined) // ..and after

    return secondBlank
}