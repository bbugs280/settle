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
        var checkresult = new SUser();
        var user = new SUser();

        beforeEach(function(done) {
            var $injector = angular.injector([ 'starter.services' ]);
            ParseService = $injector.get('ParseService');
            var Common = $injector.get('Common');

            user.getUserByEmail('test-recordqr@test.com', function(result){
                checkresult = result;
                console.log("Test recordQRCode - User Email = "+user.getEmail());
                console.log("Test recordQRCode - User name = "+user.getUsername());
                console.log("Test recordQRCode - User Credit = "+user.getCredit());
//                console.log("Test recordQRCode - Valid QRCode - User debit "+checkresult.deb);
                ParseService.recordQRCode(Common.getID(), Number(100), 'test-recordqr@test.com', 'test-recordqr2@test.com', 'note', null, user, function (result2) {
                    console.log("Test recordQRCode - success - User email"+user.getEmail());
                    console.log("Test recordQRCode - success - User credit "+user.getCredit());
                    checkresult = result2;
                    done();
                })
            });



        });

        it('should be able to save a transaction, update friends, update balance', function() {

            expect(user).not.toBeNull();
            expect(user).not.toBeUndefined();
//            expect(user.getUsername()).toMatch('test-user');
            expect(user.getCredit()).toMatch(Number(100));

        });


    });
});
