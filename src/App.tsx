import React from 'react';
import { EditorWrapper } from './components/editor-wrapper'
import { EditorStateViewer } from './components/editor-state-viewer'
import { EditorState } from 'draft-js'

export interface AppState {
  editorState: EditorState
}

export class App extends React.Component<{}, AppState> {
    state = {
      editorState: EditorState.createEmpty()
    }

    render() {
      return (
        <div style={{display: 'flex'}}>
          <EditorWrapper onEditorStateChange={editorState => this.setState({editorState})} />
          <EditorStateViewer editorState={this.state.editorState} />
        </div>
      );
    }
}

export default App;
