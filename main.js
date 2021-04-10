const express = require('express')
const app = express()
const port = 3000
var fs = require("fs");
var bodyParser = require('body-parser')
var compression = require('compression')
var helmet = require('helmet')


var indexRouter = require('./routes/index')
var topicRouter = require('./routes/topic')

app.use(helmet())
// parse application/x-www-form-urlencoded
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(compression())
app.get('*', function(req,res,next){
  fs.readdir("./data", function (error, filelist) {
    req.list=filelist;
    next();
  });
})
app.use('/',indexRouter)
app.use('/topic',topicRouter)

// app.get('/create',(req, res) => {
  
// })
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// var http = require("http");
// var url = require("url");