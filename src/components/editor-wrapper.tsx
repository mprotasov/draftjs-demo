import React, { createRef } from 'react'
import {Editor, EditorState, RichUtils, ContentBlock, Modifier, CompositeDecorator} from 'draft-js'
import { setAlignBlockType, AlignBlockType, setFontBlockType, FontBlockType, getReplacementEntityStrategy, REPLACEMENT } from './editor-utils'
import { ReplacementRenderer } from './replacement-renderer'

const styles = require('./editor-wrapper.module.scss')

export interface EditorWrapperProps {
    onEditorStateChange: (editorState: EditorState) => void
}

export interface EditorWrapperState {
    editorState: EditorState
}

export class EditorWrapper extends React.Component<EditorWrapperProps, EditorWrapperState> {
    private editorRef = createRef<Editor>()

    compositeDecorator = new CompositeDecorator([{
        strategy: getReplacementEntityStrategy,
        component: ReplacementRenderer
    }])

    state = {
        editorState: EditorState.createEmpty(this.compositeDecorator)
    }

    focusEditor = () => {        
        this.editorRef?.current?.focus()        
    }

    handleBoldClick = () => {
        this.setState({
            editorState: RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD')
        })
    }



     blockStyleFn = (contentBlock: ContentBlock): string => {
         const type = contentBlock.getType();
         const style = styles[type]
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
            settings: {data: 'data'}
        })
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

        const firstBlank = Modifier.insertText(contentState, editorState.getSelection(), ' ',   undefined, undefined) // we should add space before our repl...
        const textWithEntity = Modifier.insertText(firstBlank, editorState.getSelection(), 'Custom replacement', undefined, entityKey)
        const secondBlank = Modifier.insertText(textWithEntity, editorState.getSelection(), ' ', undefined, undefined) // ..and after

        this.setState({
            editorState: EditorState.push(editorState, secondBlank, 'insert-characters')
        }, () => this.focusEditor())
    }
   
    render() {
        return (
            <div>
                <button onClick={() => this.handleBoldChange('bold')}>Bold</button>
                <button onClick={() => this.handleAlignChange('left')}>Left</button>
                <button onClick={() => this.handleAlignChange('center')}>Center</button>
                <button onClick={() => this.handleAlignChange('right')}>Right</button>
                <button onClick={() => this.addReplacement()}>add repl</button>

                <div className={styles.editor} onClick={this.focusEditor}>
                    <Editor 
                        ref={this.editorRef} 
                        editorState={this.state.editorState} 
                        blockStyleFn={this.blockStyleFn}
                        onChange={editorState => {
                            this.props.onEditorStateChange(editorState)
                            this.setState({editorState})
                        }}
                    />
                </div>
            </div>
        )
    }
}