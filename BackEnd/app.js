const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const { db } = require('./db/db');
const {readdirSync} = require('fs')
const app = express();
app.use(bodyParser.json());

require('dotenv').config()

const PORT = process.env.PORT

//middlewares
app.use(express.json());
app.use(cors());

//routes
readdirSync('./routes').map((route) => app.use('/api/v1', require('./routes/' + route)))


const server = () => {
    db()
    app.listen(PORT, () => {
        console.log('listening to port:', PORT);
    }) 
}

server()