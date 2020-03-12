import React, { createRef } from 'react'
import {Editor, EditorState, RichUtils} from 'draft-js'

const styles = require('./editor-wrapper.module.scss')

export interface EditorWrapperProps {
    onEditorStateChange: (editorState: EditorState) => void
}

export interface EditorWrapperState {
    editorState: EditorState
}

export class EditorWrapper extends React.Component<EditorWrapperProps, EditorWrapperState> {
    private editorRef = createRef<Editor>()


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
   
    render() {
        return (
            <div>
                <button onClick={this.handleBoldClick}>Bold</button>
                <div className={styles.editor} onClick={this.focusEditor}>
                    <Editor 
                        ref={this.editorRef} 
                        editorState={this.state.editorState} 
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