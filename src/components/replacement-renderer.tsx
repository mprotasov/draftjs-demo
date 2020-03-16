import React, { FunctionComponent } from 'react'

const styles = require('./replacement-renderer.module.scss')

export const ReplacementRenderer: FunctionComponent = (props: any) => {
    // we can access props.entityKey here for managing settings

    const startDrag = (event: React.DragEvent<HTMLDivElement>) => {
        event.dataTransfer.dropEffect = 'move'
        event.dataTransfer.setData('text', `replacementKey:${props.entityKey}`)
    }

    return (
        <div 
            id='container'
            className={styles.replacementRenderer}
            draggable="true"
            onDragStart={startDrag}
            suppressContentEditableWarning={true}
            contentEditable="false" // this prop restores normal behaviour for delete and navigation buttons
        >
            {props.decoratedText}
        </div>
    )
}