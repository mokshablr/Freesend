

export function getChangedRows(liveArray, oldArray, callbackFn) {
    // Create a Map from oldArray with ID as the key
    const oldMap = new Map();
    oldArray.forEach(row => {
      const id = row[0];
      oldMap.set(id, row);
    });
  
    // Array to store changed rows
    const changedRows = Array();
  
    // Compare liveArray with oldArray
    liveArray.forEach(liveRow => {
      const id = liveRow[0];
      const mandatoryFiled = liveRow[1];
      if (mandatoryFiled) {
        const oldRow = oldMap.get(id);
  
        if (!oldRow) {
          // Row is new in liveArray (not present in oldArray)
          if(callbackFn){
            liveRow = callbackFn(liveRow, oldRow);
          }
          changedRows.push(liveRow);
        } else if (!arraysEqual(liveRow, oldRow)) {
          // Row exists in both arrays but has changed
          if(callbackFn){
            liveRow = callbackFn(liveRow, oldRow);
          }
          changedRows.push(liveRow);
        }
      }
    });
  
    return changedRows;
  }
  
  // Helper function to compare two arrays (excluding the ID column)
  export function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  