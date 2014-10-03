PlayerSpec-ref.jsdescribe("Angular Services", function() {



    describe("Parse Service:", function() {
        var ParseService;
        var login = false;

        beforeEach(function() {
            var $injector = angular.injector([ 'starter.services' ]);
            ParseService = $injector.get( 'ParseService' );

            setTimeout(function() {
                value = 0;

                ParseService.login('yeung.vincent@gmail.com',1,function(){login = true})
                done();
            }, 1);

        });

        it('should contain a ParseService',
            function() {

                expect( ParseService).not.toEqual(null);


            });
        it('should be able to Login with an account',
            function() {
                var loggeduser;
                ParseService.login('yeung.vincent@gmail.com','1',function(user){
                    loggeduser=Parse.User.current();
                    console.log(loggeduser.get('email'));
                });

                expect(loggeduser).not.toEqual(null);
//                console.log(loggeduser.get('email'));
//                expect(loggeduser.get('email')).toEqual('yeung.vincent@gmail.com');

            });

//        it('should be able to save transaction to Parse',
//            function() {
//
//                expect(ParseService.saveTransaction('abc',123,'yeung.vincent1@gmail.com','yeung.vincent@gmail.com','',null)).not.toEqual(null);
//
//            });

    });

    describe("DAO User Login: ", function(){
        var user;
        beforeEach(function(done){
            user = new User();
            user.login('yeung.vincent@gmail.com','1', {
                success: function (result) {
                    user = result;
                    done();
                }
            })

        });

        it("should login successful", function() {
            expect(user.email).toEqual(user.getCurrentUser().email);
            console.log(" user "+ JSON.stringify(user));
            done();
        });

//
//        it("should get user successful", function(done) {
//            setTimeout(function() {
//
//                var user = new User();
//                var resultuser = new User();
//                user.getUser('OqCdAlkWtJ', function(result){resultuser=result});
//
//                done();
//                console.log("result user "+ JSON.stringify(resultuser));
//                console.log(" user "+ JSON.stringify(user));
//                expect(resultuser.username).not.toEqual("");
//                expect(resultuser.username).toEqual(user.username);
//            }, 9000);
//
//
//        });

//        it("should save successful", function(done) {
//            var user = new User();
//
//            user.login('yeung.vincent@gmail.com','1',function(user){loggeduser=user});
//            expect(user.email).toEqual(user.getCurrentUser().email);
//            done();
//        });


//        afterEach(function() {
//
//        });
    })
});
