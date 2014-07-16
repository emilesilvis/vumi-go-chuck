var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;
var assert = require('assert');


describe("app", function() {
    describe("GoApp", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();

            tester = new AppTester(app);

            tester
                .setup.config.app({
                    name: 'test_app'
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("when the user starts a session", function() {
            it("should check whether they are registered and if not, should ask for name", function() {
                return tester
                    .start()
                    .check.interaction({
                        state: 'states:registration:name',
                        reply: [
                          'What is your name?'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user gives name", function() {
            it("should greet user by name and show menu", function() {
                return tester
                    .setup.user.state('states:registration:name')
                    .input('Foo')
                    .check.interaction({
                        state: 'states:registered',
                        reply: [
                          'Hi Foo! What do you want to do?',
                          '1. Show me a joke',
                          '2. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });

        /*
        describe("when the user starts a session", function() {
            it("should ask them want they want to do", function() {
                return tester
                    .start()
                    .check.interaction({
                        state: 'states:start',
                        reply: [
                            'Hi null! What do you want to do?',
                            '1. Show me a joke',
                            '2. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });
        */

        describe("when the user asks to see a joke", function() {
            it("should show a joke", function() {
                return tester
                    .setup.user.state('states:registered')
                    .input('1')
                    .check(function(api) {
                        var req = api.http.requests[0];
                        assert.equal(req.url, 'http://api.icndb.com/jokes/random');
                    })                    
                    .check.interaction({
                        state: 'states:joke',
                        reply: [
                            'joke: This is a Chuck Norris joke!'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user asks to exit", function() {
            it("should say thank you and end the session", function() {
                return tester
                    .setup.user.state('states:registered')
                    .input('2')
                    .check.interaction({
                        state: 'states:end',
                        reply: 'Thanks, cheers!'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });
        
    });

});
