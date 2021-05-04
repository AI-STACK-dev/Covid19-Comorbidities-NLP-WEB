const express = require('express')
const app = express()
const port = 3000
var fs = require("fs");
var bodyParser = require('body-parser')
var compression = require('compression')
var helmet = require('helmet')
// var ejs = require('ejs');
let {PythonShell} = require('python-shell')


var indexRouter = require('./routes/index')
var topicRouter = require('./routes/topic')

app.use(helmet())
const csp = require("helmet-csp");
app.use(csp({
  directives: {
    defaultSrc: ["'self'","'unsafe-inline'",'https://cdn.jsdelivr.net','https://code.jquery.com'],
    styleSrc: ["'self'","'unsafe-inline'",'https://fonts.googleapis.com','https://cdn.jsdelivr.net','https://code.jquery.com'],
    fontSrc: ["'self'","'unsafe-inline'",'https://fonts.googleapis.com','https://fonts.gstatic.com']
  }
}))

// parse application/x-www-form-urlencoded
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(compression())
//
app.set('views',__dirname + '/views');
app.set('view engine','ejs');
app.engine('html',require('ejs').renderFile);
//
app.get('*', function(req,res,next){
  fs.readdir("./data", function (error, filelist) {
    req.list=filelist;
    next();
  });
})
// let pyshell = new PythonShell('test2.py',{ mode: 'text'});
app.use('/',indexRouter)
app.use('/topic',topicRouter)


// app.post('/Load',(req, res) => {
//   let pyshell = new PythonShell('test_3.py',{ mode: 'json'});
//   var post = req.body;
//   var result;
//   console.log(post);
//   pyshell.send({ args: post.RiskFactor });
//   pyshell.on('message', function (message) {
//     console.log(message);
//     result+=message
//   //   setTimeout(() => res.render('template', {
//   //     title: "muyaho",
//   //     body: message
//   // }), 3000)
//   });
//   pyshell.end(function (err,code,signal) {
//     if (err) throw err;
//     console.log('The exit code was: ' + code);
//     console.log('The exit signal was: ' + signal);
//     console.log('finished');
//     res.render('template', {
//       title: "muyaho",
//       body: result
//   })
//   });
//   // res.render('template.html');
// })

// app.post('/submit', function (req, res) {
//   console.log("got a submit from main.js")
//   var post = req.body;
//   var spawn = require('child_process').spawn;
//   var process = spawn('python', ['./exec_v2.py',
//   post.RiskFactor[0],
//   post.RiskFactor[1]
//   ]  
//   );
//   process.stdout.on('data', function (data) {
//     console.log('results: %s', data.toString());
//       res.send(data.toString());
//   });
// });
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