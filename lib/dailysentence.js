var cheerio = require('cheerio'),
    Table = require('cli-table'),
    async = require('async'),
    request = require('request');

module.exports = function () {
    'use strict';

    var config = [{
        'name': 'en',
        'url': 'http://www.hujiang.com'
    }, {
        'name': 'de',
        'url': 'http://de.hujiang.com'
    }, {
        'name': 'jp',
        'url': 'http://jp.hujiang.com'
    }];

    var EnglishParser = function () {
        this.parse = function (data) {
            var $ = cheerio.load(data);
            var $daily = $('#daily_body_2004');
            var sentence = $daily.text().trim();
            var sentences = sentence.split(/\s+(?=[\u4e00-\u9fa5])/);
            var english = '', chinese = '';

            if (sentences.length > 1) {
                english = sentences[0];
                chinese = sentences[1];
            }

            return ['英语', english, chinese];
        };
    };

    var GermanParser = function () {
        this.parse = function (data) {
            var $ = cheerio.load(data);
            var $daily = $('ul.header_daily1');
            var $sentences = $daily.children();

            var german = '', chinese = '';

            if ($sentences.length >= 2) {
                german = $($sentences[0]).text().trim();
                chinese = $($sentences[1]).text().trim();
            }

            return ['德语', german, chinese];
        };
    };

    var JapaneseParser = function () {
        this.parse = function (data) {
            var $ = cheerio.load(data);
            var $daily = $('#daily_show');
            var sentences = $daily.find('a').text().split('/');

            var japanese = '', chinese = '';

            if (sentences.length >= 2) {
                japanese = sentences[0].trim();
                chinese = sentences[1].trim();
            }

            return ['日语', japanese, chinese];
        };
    };

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
    };

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
            console.log('Input is empty...');
        }
    };

    var results = [];
    var options = {};
    var parser = null;

    async.forEach(config, function (language, callback) {
        options = {
            url: language.url
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                parser = createParser(language.name);

                if (parser) {
                    try {
                        results.push(parser.parse(body));
                    } catch (error) {
                        console.log(error);
                    }
                }
            }

            callback();
        });
    }, function (error) {
        if (error) {
            console.log('Something is wrong...');
        } else {
            render(results);
        }
    });
};
