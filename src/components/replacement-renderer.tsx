import React, { FunctionComponent } from 'react'

export const ReplacementRenderer: FunctionComponent = (props: any) => {
    // we can access props.entityKey here for managing settings

    const startDrag = (event: React.DragEvent<HTMLDivElement>) => {
        event.dataTransfer.dropEffect = 'move'
        event.dataTransfer.setData('text', `replacementKey:${props.entityKey}`)
    }

    return (
        <div 
            id='container'
            style={{
                background: 'green', 
                display: 'inline', 
                cursor: 'pointer', 
                userSelect: 'none',
                marginLeft: '4px',
                marginRight: '4px'
            }} 
            draggable="true"
            onDragStart={startDrag}
            suppressContentEditableWarning={true}
            contentEditable="false" // this prop restores normal behaviour for delete and navigation buttons
        >
            {props.decoratedText}
        </div>
    )
}