const flattenObject = (filePath) => {
    const fs = require('fs');

    const baseJSON = fs.readFileSync(filePath);
    
    const baseObj = JSON.parse(baseJSON);
    
    const newObjectArray = []
    
    for (const key of Object.keys(baseObj)) {
        for(const record of baseObj[key]) {
            newObjectArray.push({
                hotelNumber: key,
                ...record
            });
        }
    }
    
    fs.writeFileSync('allDataArray.json', JSON.stringify(newObjectArray));
}

module.exports = flattenObject;