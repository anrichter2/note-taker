const express = require('express');
const path = require('path');
const fs = require('fs');
const noteData = require('./db/db.json')
const { v4: uuidv4 } = require('uuid')
const PORT = process.env.PORT || 3001;

const app = express();

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET routes for the homepage and notes page
app.get('/', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET and POST requests for getting and submitting notes for the notes page
app.get('/api/notes', (req, res) => 
    fs.readFile('./db/db.json', 'utf-8', (err, noteData) => {
        return res.json(JSON.parse(noteData));
    })
);

app.post('/api/notes', (req, res) => {
    const {title, text} = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuidv4(),
        };
    
        fs.readFile('./db/db.json', 'utf-8', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const parsedData = JSON.parse(data);
                parsedData.push(newNote);
                fs.writeFile('./db/db.json', JSON.stringify(parsedData, null, 4), (err) =>
                err ? console.error(err): console.log('New note written to ./db/db.json'))
            }
        });

        const response = {
            status: 'success',
            body: newNote,
        };

        res.json(response);
    } else {
        res.json('Error in posting new note');
    }
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    for (let i = 0; i < noteData.length; i++) {
        if (noteId === noteData[i].id) {
            fs.readFile('./db/db.json', 'utf-8', (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    const editData = JSON.parse(data);
                    editData.splice(i, 1);
                    fs.writeFile('./db/db.json', JSON.stringify(editData, null, 4), (err) =>
                    err ? console.error(err): console.log('Note deleted from ./db/db.json'))
                }
            });
        }
    }
    return res.json('No match found')
})

// Wildcard route to take you back to the homepage
app.get('*', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () => 
    console.log(`App listening at http://localhost:${PORT}`)
);