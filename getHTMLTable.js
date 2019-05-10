function getHTMLTable(array, numRows, numCols, func) {
    const rowsData = [];
    for (let r=0; r<numRows; r++) {
        const rowData = [];

        for (let c=0; c<numCols; c++) {
            const data = (array[r] && array[r][c]) ? array[r][c] : '';
            rowData.push(func(data));
        }


        rowsData.push(rowData.map(x => `<td>${x}</td>`).join(''));
    }

    const html = rowsData.map(x => `<tr>${x}</tr>`).join('');
    return `<table>${html}</table>`
}

module.exports = getHTMLTable;
