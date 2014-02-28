var http = require('http'),
    cheerio = require('cheerio');

function download(url, callback) {
    http.get(url, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', function () {
            callback(data);
        });
    }).on('error', function () {
        callback(null);
    });
}

function display(data) {
    var $ = cheerio.load(data);
    var $daily = $('ul.header_daily1');
    var $sentences = $daily.children();

    var german = $($sentences[0]).text().trim();
    var chinese = $($sentences[1]).text().trim();

    console.log(german + ' / ' + chinese);
}

var url = 'http://de.hujiang.com';
download(url, function (data) {
    if (data) {
        display(data);
    } else {
        console.log('Something is wrong...')
    }
})
