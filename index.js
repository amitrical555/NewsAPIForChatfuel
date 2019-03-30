const express = require('express');
const bodyParser = require('body-parser');
const NewsAPI = require('newsapi');

const newsapi = new NewsAPI('b9f0fb374b1d45e38ad9da93bd592f0f');
const server = new express();

server.use(bodyParser.urlencoded({
    extended : true
}));
server.use(bodyParser.json());

server.get('/news', function(req, res) {
    const query = req.query.query;
    newsapi.v2.topHeadlines({
        q : query || 'chatbots',
        sources : 'abc-news, bbc-news, bbc-sport, business-insider, business-insider-uk, cnbc, cnn, crypto-coins-news, daily-mail, entertainment-weekly, espn, espn-cric-info, financial-times, fortune, fox-news, mtv-news, national-geographic, news24, techcrunch, the-hindu, the-new-york-times, the-times-of-india, usa-today',
    }).then(response => {
        let responseToSend;
        if (response.status === 'ok' && response.articles.length > 0) {
            const articles = response.articles.map(article => {
                return {
                    "title" : article.title,
                    "image_url" : article.urlToImage,
                    "subtitle" : article.description,
                    "buttons" : [
                        {
                            "type" : "web_url",
                            "url" : article.url,
                            "title" : "Read Full Article"
                        }
                    ]
                }
            });

            responseToSend = {
                "messages" : [
                    {
                        "attachment" : {
                            "type" : "template",
                            "payload" : {
                                "template_type" : "generic",
                                "image_aspect_ratio" : "square",
                                "elements" : articles.slice(0, 10)
                            }
                        }
                    }
                ]
            };

            return res.json(responseToSend);

        } else {
            responseToSend = {
                "messages" : [
                    {"text" : `Oops! Looks like I don't have any articles on ${query} as of now.`},
                    {"text" : `Please feel free to check back later or try searching for another topic.`}
                ]
            };

            return res.json(responseToSend);
        }
        
    }, (error) => {
        responseToSend = {
            "messages" : [
                {"text" : `Oops! Something went wrong while searching for articles on ${query}.`},
                {"text" : `Got this error: ${error}.`}
            ]
        };

        return res.json(responseToSend);
    });
});

server.listen((process.env.PORT || 8080), function() {
    console.log("Server is up and running...");
});