const fs = require('fs');

function makeRow(array, className='') {
    return array.map(x => `<td class='${className}'>${x}</td>`).join('');
}

function getHTMLTable(array, numRows, numCols, func) {
    const rowsData = [];

    const header = [''];
    for (let c=0; c<numCols; c++) {
        header.push(`<strong>s${c}</strong>`);
    }
    rowsData.push(makeRow(header, 'header'));

    for (let r=0; r<numRows; r++) {
        const rowData = [];
        rowData.push(`<strong>d${r}</strong>`);

        for (let c=0; c<numCols; c++) {
            const data = (array[r] && array[r][c]) ? array[r][c] : '';
            rowData.push(func(data));
        }


        rowsData.push(makeRow(rowData));
    }

    const html = rowsData.map(x => `<tr>${x}</tr>`).join('');
    return `<table cellspacing='0' border='1px solid #000'>${html}</table>`
}

function getHTML(best, stats, env) {
    const html = [];
    html.push(`<h2>Population Max Fitness: ${best.maxFitness}</h2>`);
    html.push(`<ul>${stats.join('')}</ul>`);

    const { rooms, students, teachers } = best.getTimetable();

    html.push(`<div id='rooms'><h2>Room Timetable</h2>`);
    for(let r=0; r<env.numRoom; r++) {
        function formatLesson(slot) {
            if (!slot) {
                return '';
            }

            const lessons = [];
            for(let i=0; i<slot.length; i++) {
                const l = slot[i].lessonId;
                lessons.push(`<strong>${l}</strong><br />`
                    + `(${env.lessons[l].students.join(', ')})`
                    + `[${env.lessons[l].teachers.join(', ')}]`);
            }

            return lessons.join(`<hr/>`);
        }

        html.push(`<h3>Room ${r}</h3>`);
        html.push(getHTMLTable(rooms[r], env.numDay, env.numSlot, formatLesson));
    }
    html.push('</div>');

    html.push(`<div id='students'><h2>Students Timetable</h2>`);
    for(let s=0; s<env.numStudent; s++) {
        function formatLesson(slot) {
            if (!slot) {
                return '';
            }

            const lessons = [];
            for(let i=0; i<slot.length; i++) {
                const l = slot[i].lessonId;
                lessons.push(`<strong>${l}</strong><br />`
                    + `R${slot[i].room} `
                    + `[${env.lessons[l].teachers.join(', ')}]`);
            }

            return lessons.join(`<hr/>`);
        }

        html.push(`<h3>Student ${s}</h3>`);
        html.push(getHTMLTable(students[s], env.numDay, env.numSlot, formatLesson));
    }
    html.push('</div>');

    html.push(`<div id='teachers'><h2>Teachers Timetable</h2>`);
    for(let t=0; t<env.numTeacher; t++) {
        function formatLesson(slot) {
            if (!slot) {
                return '';
            }

            const lessons = [];
            for(let i=0; i<slot.length; i++) {
                const l = slot[i].lessonId;
                lessons.push(`<strong>${l}</strong><br />`
                    + `R${slot[i].room} `
                    + `[${env.lessons[l].students.join(', ')}]`);
            }

            return lessons.join(`<hr/>`);
        }

        html.push(`<h3>Teachers ${t}</h3>`);
        html.push(getHTMLTable(teachers[t], env.numDay, env.numSlot, formatLesson));
    }
    html.push('</div>');

    const template = fs.readFileSync('template.html').toString();
    return template.replace('{{html}}', html.join('\n'));
}

module.exports = getHTML;
