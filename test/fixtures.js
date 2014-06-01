module.exports = function() {
    return [{
        "request": {
            "method": "GET",
            "url": "http://api.icndb.com/jokes/random"
        },
        "response": {
            "code": 200,
            "data": {
              type: "success",
              value: {
                id: 123,
                joke: "This is a Chuck Norris joke!",
                categories: [ ]
              }           
            },
        }
    }];
};
