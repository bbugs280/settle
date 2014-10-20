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
        var fromBal;
        var toBal;
        var fromFriends;
        var toFriends;
        var checkTran;

        beforeEach(function(done) {
            var $injector = angular.injector([ 'starter.services' ]);
            ParseService = $injector.get('ParseService');
            var Common = $injector.get('Common');
            var user = new SUser();
            user.getUserByEmail('test-recordqr@test.com', function(user){
                console.log("Test Service - RecordQRCode user email = " + user.get('email'));
                ParseService.recordQRCode(Common.getID(), Number(100), 'test-recordqr@test.com', 'test-recordqr2@test.com', 'note', null, user, function (tran) {
                    checkTran=tran;
                    user.getBalanceByEmail('test-recordqr@test.com', function(frombal){
                        fromBal=frombal;
                        user.getBalanceByEmail('test-recordqr2@test.com', function(tobal){
                            toBal = tobal;
                            user.getFriendList('test-recordqr@test.com',function(fromfd){
                                fromFriends = fromfd;
                                user.getFriendList('test-recordqr2@test.com', function(tofd){
                                    toFriends = tofd;
                                    done();
                                })
                            })

                        })
                    })
                })
            });


        });

        it('should be able to save a transaction, update friends, update balance', function() {
            //from user has correct balance
            expect(fromBal.get('balance')).toEqual(Number(-100));
            //from user has correct friend in friendlist
            expect(toBal.get('balance')).toEqual(Number(100));
            //to user has correct balance
            expect(fromFriends.get('friends').length).toEqual(1);
            //to user has correct friend in friendlist
            expect(toFriends.get('friends').length).toEqual(1);
        });

        afterEach(function(done){
            fromBal.destroy();
            toBal.destroy();
            fromFriends.destroy();
            toFriends.destroy();
            checkTran.destroy();
            done();
        });

    });
});
