const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '..', 'static')));

const port = process.env.PORT || 8787;
app.listen(port, () => console.log('static server listening on', port));
