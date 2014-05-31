var go = {};
go;

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var JsonApi = vumigo.http.api.JsonApi;

    var GoApp = App.extend(function(self) {
        App.call(self, 'states:start');

        self.init = function() {
            self.http = new JsonApi(self.im);
        };        

        self.states.add('states:start', function(name) {
            return new ChoiceState(name, {
                
                question: 'Hi there! What do you want to do?',

                choices: [
                    new Choice('joke', 'Show a joke'),
                    new Choice('end', 'Exit')],

                next: function(choice) {
                    //return choice.value;
                    if (choice.value == 'joke') {
                      return self
                        .http.get('http://api.icndb.com/jokes/random')
                        .then(function(resp){
                            return {
                              name: 'states:joke',
                              creator_opts: {
                                method: 'get',
                                foo: 'bar',
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

        self.states.add('states:joke', function(name, opts) {
            return new EndState(name, {
              
              text: opts.echo.joke,
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
