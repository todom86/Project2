var express = require('express');
var app = express();

var dataRouter = require('./src/routes/getStateData');

var port = process.env.PORT || 5000;

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