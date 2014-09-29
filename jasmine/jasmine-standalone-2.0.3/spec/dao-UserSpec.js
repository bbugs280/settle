describe("DAO User", function() {
   ;
    describe("Login: ", function(){
        var user;

        beforeEach(function(done){
            user = new User();
            user.login('test-user','1', function (result) {
                    user = result;
                    done();
            })

        });

        it("should login successful", function() {
            expect(user).toBeDefined();
            expect(user.username).toMatch('test-user');
            expect(user.email).toMatch('test@test.com');

        });
    })

    describe("get USER by email: ", function(){
        var user;
        var checkresult;
        beforeEach(function(done){
            user = new User();
            checkresult = new User();
            user.getUserByEmail('test@test.com', function (result) {
                checkresult = result;
                done();
            })

        });

        it("should get User successful", function() {
//            console.log("check : "+checkresult.email);
            expect(checkresult).toBeDefined();
            expect(checkresult.username).toMatch('test-user');
            expect(checkresult.email).toMatch('test@test.com');
//            expect(checkresult.credit).toMatch(0);
//            expect(checkresult.debit).toMatch(0);
//            expect(checkresult.balance).toMatch(0);

        });
    })

    describe("get USER by email : ", function(){
        var user;
        var checkresult;
        beforeEach(function(done){
            user = new User();
            checkresult = new User();
            user.getUserByEmail('', function (result) {
                console.log("check should be undefined: "+checkresult.email);
                checkresult = result;
                done();
            })

        });

        it("should get Empty", function() {
            expect(checkresult).toBeNull;

        });
    })

    describe("get Balance by email: ", function(){
        var user;
        var checkresult;
        beforeEach(function(done){
            user = new User();
            checkresult = new User();
            user.getBalanceByEmail('test@test.com', function (result) {
                checkresult = result;
                done();
            })
        });

        it("should get balance with Zeros ", function() {
//            console.log("check : "+checkresult.email);
            expect(checkresult.credit).toMatch(Number(0));
            expect(checkresult.debit).toMatch(Number(0));
            expect(checkresult.balance).toMatch(Number(0));
        });
    })

    describe("get Balance by email: ", function(){
        var user;
        var checkresult;
        beforeEach(function(done){
            user = new User();
            checkresult = new User();
            user.getBalanceByEmail('test-balance@test.com', function (result) {
                checkresult = result;
                done();
            })

        });

        it("should get balance with correct Credit, Debit, Balance ", function() {
//            console.log("check : "+checkresult.email);
            expect(checkresult.credit).toMatch(Number(123));
            expect(checkresult.debit).toMatch(Number(123));
            expect(checkresult.balance).toMatch(Number(0));

        });
    })

    describe("Update Existing Balance: ", function(){
        var user;
        var checkUser;
        beforeEach(function(done){
            user = new User();

            user.balanceId = 'bfwbd4NJwr';
            user.email = 'test-balance2@test.com';
            user.credit=Number(123);
            user.debit=Number(101);
            user.updateBalance(function (result) {
                checkUser = result;
                done();
            })

        });

        it("should save successful", function() {
            expect(checkUser.credit).toEqual(Number(123));
            expect(checkUser.debit).toEqual(Number(101));
            expect(checkUser.balance).toEqual(Number(22));

        });

    })

    describe("Update Balance that not created: ", function(){
        var user;
        var checkUser;
        beforeEach(function(done){
            user = new User();
            user.email = 'test-balance3@test.com';
            user.credit = Number(120);
            user.debit = Number(100);
            console.log("before calling update balance");

            user.updateBalance(function (result) {
                console.log("Update Balance successs????");
                checkUser = result;
                done();
            })

        });

        it("should save successful", function() {
            expect(checkUser.credit).toEqual(Number(120));
            expect(checkUser.debit).toEqual(Number(100));
            expect(checkUser.balance).toEqual(Number(20));

        });

    })
//    describe("Save: ", function(){
//
//        var user;
//        var checkUser;
//        beforeEach(function(done){
//            user = new User();
//            user.username="test-user";
//            user.email="test@test.com";
//
//            user.save(function (result) {
//                checkUser = result;
//                done();
//            })
//
//        });
//
//        it("should save successful", function() {
////            console.log(" user "+ user.toString());
//            expect(checkUser).toBeDefined;
//            expect(checkUser.get('username')).toEqual("test-user");
//            expect(checkUser.get('email')).toEqual("test@test.com");
//
//        });

//        afterEach(function(){
//            checkUser.destroy({
//                success: function(myObject) {
//                    // The object was deleted from the Parse Cloud.
//                    console.log("destroyed!!")
//                },
//                error: function(myObject, error) {
//                    // The delete failed.
//                    // error is a Parse.Error with an error code and message.
//                }
//                });
//        })
//    })

//    describe("get Friend: ", function(){
//        var checkUser;
//        var user;
//        beforeEach(function(done){
//            user = new User();
//            user.username="test-user";
//            user.email="test@test.com";
//
//            user.getFriends(function (result) {
//                checkUser = result;
//                done();
//            })
//        });
//
//        it("should save successful", function() {
//            expect(checkUser.friends.length).toBe(0);
//
//        });
//    })

    describe("ADD Friend: ", function(){
        var user;
        var checkresult;

        beforeEach(function(done){
            user = new User();
            user.username="test-user";
            user.email="test@test.com";

            user.addFriend("friend@gmail.com",function (result) {
                user.username="test-user";
                user.email="test@test.com";
                user.addFriend("friend2@gamil.com", function(result){
                    user.username="test-user";
                    user.email="test@test.com";
                    user.addFriend("friend2@gamil.com", function(result){
                        checkresult = result;
                        done();
                    });
                })
                })
        });


        it("should save successful", function() {
            expect(checkresult.length).toBe(2);

        });
    })

});
