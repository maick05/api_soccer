const express = require('express')
const bodyParser = require('body-parser')
const consign = require('consign')

const app = new express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
        
consign()
    .include('controllers')
    .into(app);

app.listen(8082, () => console.log('Api rodando'))
