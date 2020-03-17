import React, { createRef } from 'react'
import Editor, { composeDecorators } from 'draft-js-plugins-editor'
import { EditorState, ContentBlock, SelectionState, DraftDragType, DraftHandleValue } from 'draft-js'
import { setAlignBlockType, AlignBlockType, setFontBlockType, FontBlockType, getReplacementEntityStrategy, REPLACEMENT, removeEntityRange, getReplacementWithSpaces } from './editor-utils'
import { ReplacementRenderer } from './replacement-renderer'
import createBlockDndPlugin from 'draft-js-drag-n-drop-plugin'
import createImagePlugin from 'draft-js-image-plugin'
import { testImg } from './test-image-base64'

const styles = require('./editor-wrapper.module.scss')

export interface EditorWrapperProps {
    onEditorStateChange: (editorState: EditorState) => void
}

export interface EditorWrapperState {
    editorState: EditorState
}

const blockDndPlugin = createBlockDndPlugin()

const decorator = composeDecorators(blockDndPlugin.decorator)
const imagePlugin = createImagePlugin({ decorator })

const decorators = [
    {
        strategy: getReplacementEntityStrategy,
        component: ReplacementRenderer
    }
]

export class EditorWrapper extends React.Component<EditorWrapperProps, EditorWrapperState> {
    private editorRef = createRef<Editor>()

    state = {
        editorState: EditorState.createEmpty()
    }

    focusEditor = () => {
        this.editorRef?.current?.focus()
    }

    blockStyleFn = (contentBlock: ContentBlock): string => {
        const type = contentBlock.getType();
        let style = styles[type]
        
        // temporary solution for images
        if (contentBlock.getType() === 'atomic') {
            style = styles['normal-center']
        }

        return style || ''
    }

    handleAlignChange = (align: AlignBlockType) => {
        const contentState = setAlignBlockType(this.state.editorState.getCurrentContent(), this.state.editorState.getSelection(), align)
        this.setState(
            {
                editorState: EditorState.push(this.state.editorState, contentState, 'change-block-type')
            },
            () => this.focusEditor())
    }

    handleBoldChange = (fontStyle: FontBlockType) => {
        const contentState = setFontBlockType(this.state.editorState.getCurrentContent(), this.state.editorState.getSelection(), fontStyle)
        this.setState(
            {
                editorState: EditorState.push(this.state.editorState, contentState, 'change-block-type')
            },
            () => this.focusEditor())
    }

    addReplacement = () => {
        const editorState = this.state.editorState
        const contentState = editorState.getCurrentContent()
        const contentStateWithEntity = contentState.createEntity(REPLACEMENT, 'IMMUTABLE', {
            label: 'Custom replacement'
        })
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

        this.setState({
            editorState: EditorState.push(editorState, getReplacementWithSpaces(contentState, editorState.getSelection(), entityKey, 'Custom replacement'), 'insert-characters')
        }, () => this.focusEditor())
    }

    handleDrop = (selection: SelectionState, dataTransfer: any, isInternal: DraftDragType): DraftHandleValue => {
        const text: string = dataTransfer.data.getData('text')
        if (text.startsWith('replacementKey:')) {
            const entityKey = text.split(':')[1]

            const editorState = this.state.editorState
            const contentState = editorState.getCurrentContent()
            const entity = contentState.getEntity(entityKey)

            const newContentState = removeEntityRange(contentState, entityKey)
            
            this.setState({
                editorState: EditorState.push(editorState, getReplacementWithSpaces(newContentState, selection, entityKey, entity.getData().label), 'insert-characters')
            }, () => this.focusEditor())

            return 'handled'
        }

        return 'not-handled'  
    }

    addImage = () => {
        this.setState(
            {
                editorState:imagePlugin.addImage(this.state.editorState, testImg)
            }, 
            () => this.focusEditor())
    }

    render() {
        return (
            <div>
                <button onClick={() => this.handleBoldChange('bold')}>Bold</button>
                <button onClick={() => this.handleAlignChange('left')}>Left</button>
                <button onClick={() => this.handleAlignChange('center')}>Center</button>
                <button onClick={() => this.handleAlignChange('right')}>Right</button>
                <button onClick={() => this.addReplacement()}>add repl</button>
                <button onClick={() => this.addImage()}>add image</button>

                <div className={styles.editor} onClick={this.focusEditor}>
                    <Editor
                        decorators={decorators}
                        plugins={[blockDndPlugin, imagePlugin]}
                        ref={this.editorRef}
                        editorState={this.state.editorState}
                        blockStyleFn={this.blockStyleFn}
                        onChange={editorState => {
                            this.props.onEditorStateChange(editorState)
                            this.setState({ editorState })
                        }}
                        handleDrop={this.handleDrop}
                    />
                </div>
            </div>
        )
    }
}