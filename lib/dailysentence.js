var http = require('http'),
    cheerio = require('cheerio'),
    Table = require('cli-table');

module.exports = function () {
    var config = {
        'en': {
            'url': 'http://www.hujiang.com'
        },
        'de': {
            'url': 'http://de.hujiang.com'
        },
        'jp': {
            'url': 'http://jp.hujiang.com'
        }
    }

    var EnglishParser = function () {
        this.parse = function (data) {
            var $ = cheerio.load(data);
            var $daily = $('#daily_body');
            var $sentences = $daily.children();

            var english = $($sentences[0]).text().trim();
            var chinese = $($sentences[1]).text().trim();

            return ['英语', english, chinese];
        }
    }

    var GermanParser = function () {
        this.parse = function (data) {
            var $ = cheerio.load(data);
            var $daily = $('ul.header_daily1');
            var $sentences = $daily.children();

            var german = $($sentences[0]).text().trim();
            var chinese = $($sentences[1]).text().trim();

            return ['德语', german, chinese];
        }
    }

    var JapaneseParser = function () {
        this.parse = function (data) {
            var $ = cheerio.load(data);
            var $daily = $('#daily_show');
            var sentences = $daily.find('a').text().split('/');

            var japanese = sentences[0].trim();
            var chinese = sentences[1].trim();

            return ['日语', japanese, chinese];
        }
    }

    var download = function (url, callback) {
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

    var createParser = function (name) {
        switch (name) {
            case 'en':
                return new EnglishParser();
            case 'de':
                return new GermanParser();
            case 'jp':
                return new JapaneseParser();
            default:
                return null;
        }
    }

    var render = function (results) {
        if (results) {
            var table = new Table({
                head: ['语种', '原文', '翻译']
            });

            for (var i = 0, length = results.length; i < length; i++) {
                table.push(results[i]);
            }

            console.log(table.toString());
        } else {
            console.log('Input is empty...')
        }
    }

    var results = [];
    var length = Object.keys(config).length;

    for (var language in config) {
        download(config[language].url, (function (lan) {
            return function (data) {
                var parser = createParser(lan);

                if (parser) {
                    results.push(parser.parse(data));
                }

                if (results.length == length) {
                    render(results);
                }
            }
        })(language))
    }
}
