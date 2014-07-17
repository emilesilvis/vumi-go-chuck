var go = {};
go;

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var JsonApi = vumigo.http.api.JsonApi;
    var FreeText = vumigo.states.FreeText;
    var LanguageChoice = vumigo.states.LanguageChoice;

    var GoApp = App.extend(function(self) {
        App.call(self, 'states:start');
        var $ = self.$;

        self.init = function() {
            self.http = new JsonApi(self.im);

        return self.im
            .contacts.for_user()
            .then(function(user_contact) {
                self.contact = user_contact;
            });

        };

        self.states.add('states:start', function(name) {
            return self.contact.extra.registered === 'true'
                ?  self.states.create('states:registered')
                :  self.states.create('states:language');
        });

        self.states.add('states:language', function(name) {
          return new LanguageChoice(name,
            {
                next: "states:registration:name",
                question: "What language would you like to use?",
                choices: [
                  new Choice("af", "Afrikaans"),
                  new Choice("en", "English") ]
            }
          );        
        });

        self.states.add('states:registration:name', function(name) {
            return new FreeText(name, {
                question: $('What is your name?'),

                next: function(content) {
                    self.contact.name = content;
                    self.contact.extra.registered = 'true';

                    return self.im
                        .contacts.save(self.contact)
                        .then(function() {
                            return 'states:registered';
                        });
                }
            });
        });        

        self.states.add('states:registered', function(name) {
            return new ChoiceState(name, {
                
                question: 'Hi ' + self.contact.name + '! What do you want to do?',

                choices: [
                    new Choice('joke', 'Show me a joke'),
                    new Choice('end', 'Exit')],

                next: function(choice) {
                    if (choice.value == 'joke') {
                      return self
                        .http.get('http://api.icndb.com/jokes/random?escape=javascript')
                        .then(function(resp){
                            return {
                              name: 'states:joke',
                              creator_opts: {
                                method: 'get',
                                echo: resp.data
                              }
                            };
                        });
                    } else if (choice.value == 'end') {
                      return 'states:end';
                    }
                }
            });
        });

        /*
        self.states.add('states:start', function(name) {
            return new ChoiceState(name, {
                
                question: 'Hi ' + self.contact.name + '! What do you want to do?',

                choices: [
                    new Choice('joke', 'Show me a joke'),
                    new Choice('end', 'Exit')],

                next: function(choice) {
                    //return choice.value;
                    if (choice.value == 'joke') {
                      return self
                        .http.get('http://api.icndb.com/jokes/random?escape=javascript')
                        .then(function(resp){
                            return {
                              name: 'states:joke',
                              creator_opts: {
                                method: 'get',
                                echo: resp.data
                              }
                            };
                        });
                    } else if (choice.value == 'end') {
                      return 'states:end';
                    }

                }
            });
        });
        */

        self.states.add('states:joke', function(name, opts) {
            return new EndState(name, {
              
              text: 'joke: ' + opts.echo.value.joke,
              next: 'states:start'
            });
        });

        self.states.add('states:end', function(name) {
            return new EndState(name, {
                text: 'Thanks, cheers!',
                next: 'states:start'
            });
        });
    });

    return {
        GoApp: GoApp
    };
}();

go.init = function() {
    var vumigo = require('vumigo_v02');
    var InteractionMachine = vumigo.InteractionMachine;
    var GoApp = go.app.GoApp;


    return {
        im: new InteractionMachine(api, new GoApp())
    };
}();
