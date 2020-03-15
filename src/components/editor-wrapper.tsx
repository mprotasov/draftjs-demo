import React, { createRef } from 'react'
import {Editor, EditorState, RichUtils, ContentBlock, Modifier} from 'draft-js'

const styles = require('./editor-wrapper.module.scss')

export interface EditorWrapperProps {
    onEditorStateChange: (editorState: EditorState) => void
}

export interface EditorWrapperState {
    editorState: EditorState
}

export class EditorWrapper extends React.Component<EditorWrapperProps, EditorWrapperState> {
    private editorRef = createRef<Editor>()
    private stylesMap = new Map<string, string>([['left', styles.left], ['right', styles.right], ['center', styles.center]])

    state = {
        editorState: EditorState.createEmpty()
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
         const style = this.stylesMap.get(type)
         return style || ''
       }

      handleAlignChange = (align: string) => {
          const contentState = Modifier.setBlockType(this.state.editorState.getCurrentContent(), this.state.editorState.getSelection(), align)

          this.setState({
            editorState: EditorState.push(this.state.editorState, contentState, 'change-block-type')
        })
      }
   
    render() {
        return (
            <div>
                <button onClick={this.handleBoldClick}>Bold</button>
                <button onClick={() => this.handleAlignChange('left')}>Left</button>
                <button onClick={() => this.handleAlignChange('center')}>Center</button>
                <button onClick={() => this.handleAlignChange('right')}>Right</button>

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