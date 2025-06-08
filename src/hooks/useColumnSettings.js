import { useState } from 'react';

const useColumnSettings = (initialColumns) => {
  const [columnSettingsVisible, setColumnSettingsVisible] = useState(false);
  const [columnSettings, setColumnSettings] = useState({
    columns: initialColumns.map((col, index) => ({
      ...col,
      visible: true,
      order: index
    }))
  });

  const handleColumnVisibilityChange = (key, checked) => {
    setColumnSettings(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.key === key ? { ...col, visible: checked } : col
      )
    }));
  };

  const handleColumnReorder = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(columnSettings.columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the order property for each item
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setColumnSettings(prev => ({
      ...prev,
      columns: updatedItems
    }));
  };

  const handleCheckAll = (checked) => {
    setColumnSettings(prev => ({
      ...prev,
      columns: prev.columns.map(col => ({ ...col, visible: checked }))
    }));
  };

  const getVisibleColumns = () => {
    return columnSettings.columns
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order);
  };

  return {
    columnSettingsVisible,
    setColumnSettingsVisible,
    columnSettings,
    handleColumnVisibilityChange,
    handleColumnReorder,
    handleCheckAll,
    getVisibleColumns
  };
};

export default useColumnSettings; 