import React from 'react';
import { Drawer, Checkbox } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DragHandleOutlined } from '@mui/icons-material';

const ColumnSettingsDrawer = ({ 
  visible, 
  onClose, 
  columnSettings, 
  onColumnVisibilityChange, 
  onColumnReorder, 
  onCheckAll 
}) => {
  const allChecked = columnSettings?.columns.every(col => col.visible) || false;
  const indeterminate = columnSettings?.columns.some(col => col.visible) && !allChecked;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onColumnReorder(result);
  };

  return (
    <Drawer
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: 'white',
          paddingRight: '40px'
        }}>
          <SettingOutlined style={{ fontSize: '18px' }} />
          <span style={{ fontSize: '12px', fontWeight: 500 }}>Toggle Cols</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={280}
      className="column-settings-drawer"
      closable={false}
      extra={
        <Checkbox
          indeterminate={indeterminate}
          checked={allChecked}
          onChange={(e) => onCheckAll(e.target.checked)}
          className="check-all-checkbox"
        >
          <span className="check-all-text">{allChecked ? 'Uncheck All' : 'Check All'}</span>
        </Checkbox>
      }
    >
      <div className="column-settings-content">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="columns-list"
              >
                {columnSettings?.columns.map((col, index) => (
                  <Draggable 
                    key={col.key} 
                    draggableId={col.key} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          marginBottom: '8px'
                        }}
                        className={`column-item ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        <div className="column-item-content">
                          <div {...provided.dragHandleProps} className="drag-handle">
                            <DragHandleOutlined />
                          </div>
                          <Checkbox
                            checked={col.visible}
                            onChange={(e) => onColumnVisibilityChange(col.key, e.target.checked)}
                            className="column-checkbox"
                          >
                            <span className="column-title">{col.title}</span>
                          </Checkbox>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <style>
        {`
          .column-settings-drawer .ant-drawer-header {
            background: #7B83EB;
            border-bottom: none;
            padding: 12px 16px;
          }

          .column-settings-drawer .ant-drawer-title {
            color: white;
            font-size: 15px;
            font-weight: 500;
          }

          .column-settings-drawer .ant-drawer-body {
            padding: 0;
          }

          .column-settings-content {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .check-all-checkbox {
            margin-right: 0;
          }

          .check-all-text {
            font-size: 13px;
            font-weight: 500;
            color: white;
          }

          .columns-list {
            flex: 1;
            overflow-y: auto;
            padding: 12px 16px;
            min-height: 100px;
          }

          .column-item {
            background: white;
            border: 1px solid #f0f0f0;
            border-radius: 6px;
            transition: all 0.2s ease;
          }

          .column-item.dragging {
            background: #fafafa;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            border: 1px solid #7B83EB;
          }

          .column-item-content {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
          }

          .drag-handle {
            color: #999;
            cursor: grab;
            font-size: 14px;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .drag-handle:hover {
            background: #f5f5f5;
            color: #666;
          }

          .drag-handle:active {
            cursor: grabbing;
          }

          .column-checkbox {
            flex: 1;
          }

          .column-title {
            font-size: 13px;
            color: #262626;
          }

          .column-settings-drawer .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .column-settings-drawer .ant-checkbox:hover .ant-checkbox-inner,
          .column-settings-drawer .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #7B83EB;
          }

          .column-settings-drawer .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #7B83EB;
            border-color: #7B83EB;
          }

          .column-settings-drawer .ant-checkbox-indeterminate .ant-checkbox-inner::after {
            background-color: #7B83EB;
          }

          .column-settings-drawer .ant-checkbox-wrapper .ant-checkbox-inner {
            border-color: white;
          }

          .column-settings-drawer .ant-checkbox-wrapper:hover .ant-checkbox-inner {
            border-color: white;
          }

          .column-settings-drawer .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
            background-color: white;
            border-color: white;
          }

          .column-settings-drawer .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner::after {
            border-color: #7B83EB;
          }
        `}
      </style>
    </Drawer>
  );
};

export default ColumnSettingsDrawer; 