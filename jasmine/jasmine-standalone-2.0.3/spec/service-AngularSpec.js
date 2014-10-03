describe("Angular Services", function() {


    describe("Parse Service - Login ", function() {
        var ParseService;
        var checkuser;
        beforeEach(function(done) {
            var $injector = angular.injector([ 'starter.services' ]);
            ParseService = $injector.get('ParseService');

            ParseService.login('test-user','1', function (result) {
                checkuser = result;
                done();
            })

        });

        it('should be able to Login with an account', function() {

                expect(checkuser).not.toBeNull();
                expect(checkuser).not.toBeUndefined();
                expect(checkuser.getUsername()).toMatch('test-user');
            });


    });

    describe("Parse Service - recordQRCode ", function() {
        var ParseService;
        var checkresult;
        beforeEach(function(done) {
            var $injector = angular.injector([ 'starter.services' ]);
            ParseService = $injector.get('ParseService');
            var Common = $injector.get('Common');
            var user = new User()
            user.getUserByEmail('test@test.com', function(result){
                console.log("Test recordQRCode - Valid QRCode - User "+user.getEmail());
                ParseService.recordQRCode(Common.getID(), Number(100), 'test@test.com', 'test2@test.com', 'note', null, result, function (result2) {
                    checkresult = result2;
                    done();
                })
            });



        });

        it('should be able to save a transaction, update friends, update balance', function() {

            expect(checkresult).not.toBeNull();
            expect(checkresult).not.toBeUndefined();
//            expect(checkuser.getUsername()).toMatch('test-user');
        });


    });
});
