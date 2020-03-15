import React from 'react'
import { EditorState } from 'draft-js'

export interface EditorStateViewerProps {
    editorState: EditorState
}

export class EditorStateViewer extends React.Component<EditorStateViewerProps> {
    render() {
         return (<div>
             <pre>
                 {JSON.stringify(this.props.editorState, null, 2)}
             </pre>
         </div>)
        // return <ReactJson src={this.props.editorState} enableClipboard={false} />
    }    
}