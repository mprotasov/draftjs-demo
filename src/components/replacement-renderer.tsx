import React from 'react'

export const ReplacementRenderer = (props: any) => {
    // we can access props.entityKey here for managing settings
    return (
        <div style={{
            background: 'green', 
            display: 'inline', 
            cursor: 'pointer', 
            userSelect: 'none'}} 
            contentEditable="false" // this prop restores normal behaviour for delete and navigation buttons
        >
            {props.decoratedText}
        </div>
    )
}