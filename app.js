var express = require('express');
var cors = require('cors');
var app = express();

var dataRouter = require('./src/routes/getStateData');

var port = process.env.PORT || 8000;

// app.use((req,res,next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
//     next();
// });

app.use(express.static('public'));
app.use(express.static('src'));

app.set('views', 'src/views');
app.set('view engine', 'ejs');

app.use('/data', dataRouter.getData());

app.get('/', (req, res) => {
    res.render('index', {
        title: "State Analysis"
    });
});

app.listen(port, function() {
    console.log(`running server on port ${port}`)
});