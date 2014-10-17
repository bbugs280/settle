describe("DAO User", function() {

    describe("Login: ", function(){

        var checkuser;
        beforeEach(function(done){
            var user = new SUser();
            user.login('test-user','1', function (result) {
                checkuser = result;
                done();
            })

        });

        it("should login successful", function() {
//            expect(checkuser).toBeDefined();
            expect(checkuser.get('username')).toMatch('test-user');
            expect(checkuser.get('email')).toMatch('test@test.com');

        });
    })

    describe("get USER by email: ", function(){

        var checkresult;
        beforeEach(function(done){
            var user = new SUser();
            checkresult = new SUser();
            user.getUserByEmail('test@test.com', function (result) {

                checkresult = result;
                done();
            })

        });

        it("should get User successful", function() {
//            console.log("check : "+checkresult.email);
//            expect(checkresult).toBeDefined();
            expect(checkresult.getUsername()).toMatch('test-user');
            expect(checkresult.getEmail()).toMatch('test@test.com');
//            expect(checkresult.credit).toMatch(0);
//            expect(checkresult.debit).toMatch(0);
//            expect(checkresult.balance).toMatch(0);

        });
    })

    describe("get USER by email : ", function(){

        var checkresult;
        beforeEach(function(done){
            var user = new SUser();
            checkresult = new SUser();
            user.getUserByEmail('', function (result) {
                console.log("check should be undefined: "+checkresult.email);
                checkresult = result;
                done();
            })

        });

        it("should get Null", function() {
            expect(checkresult).toBeNull();
        });
    })

    describe("get Balance by email: ", function(){

        var checkCredit;
        var checkDebit;
        var checkBalance;
        beforeEach(function(done){
            var user = new SUser();
            checkresult = new SUser();
            user.getBalanceByEmail('test@test.com', function (result, result2, result3, result4) {

                checkCredit = result;
                checkDebit = result2;
                checkBalance = result3;

                done();
            })
        });

        it("should get balance with Zeros ", function() {
//            console.log("check : "+checkresult.email);

            expect(checkCredit).toMatch(Number(0));
            expect(checkDebit).toMatch(Number(0));
            expect(checkBalance).toMatch(Number(0));
        });
    })

    describe("get Balance by email: ", function(){

        var checkCredit;
        var checkDebit;
        var checkBalance;
        beforeEach(function(done){
            var user = new SUser();
            checkresult = new SUser();
            user.getBalanceByEmail('test-balance@test.com', function (result, result2, result3, result4) {
                checkCredit = result;
                checkDebit = result2;
                checkBalance = result3;
                done();
            })

        });

        it("should get balance with correct Credit, Debit, Balance ", function() {
//            console.log("check : "+checkresult.email);
            expect(checkCredit).toMatch(Number(123));
            expect(checkDebit).toMatch(Number(123));
            expect(checkBalance).toMatch(Number(0));

        });
    })

    describe("Update Existing Balance: ", function(){
        var checkCredit;
        var checkDebit;
        var checkBalance;

        beforeEach(function(done){
            var user = new SUser();
console.log("test-balance2@test.com start")
            user.setBalanceId("bfwbd4NJwr");
            user.setEmail('test-balance2@test.com');
            user.setCredit(Number(123));
            user.setDebit(Number(101));
            user.updateBalance(function (result, result2, result3, result4) {
                checkCredit = result;
                checkDebit = result2;
                checkBalance = result3;
                done();
            })

        });

        it("should save successful", function() {
            expect(checkCredit).toMatch(Number(123));
            expect(checkDebit).toMatch(Number(101));
            expect(checkBalance).toMatch(Number(22));

        });

    })

    describe("Update Balance that not created: ", function(){

        var checkCredit;
        var checkDebit;
        var checkBalance;
        beforeEach(function(done){
            var user = new SUser();

            user.setEmail('test-balance3@test.com');
            user.setCredit(Number(120));
            user.setDebit(Number(100));
            console.log("before calling update balance");

            user.updateBalance(function (result, result2, result3) {
                checkCredit = result;
                checkDebit = result2;
                checkBalance = result3;
                done();
            })

        });

        it("should save successful", function() {
            expect(checkCredit).toMatch(Number(120));
            expect(checkDebit).toMatch(Number(100));
            expect(checkBalance).toMatch(Number(20));

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

        var checkresult;

        beforeEach(function(done){
            var user1 = new SUser();
//            user1.="test-user";
            var friendcount =
            user1.setEmail("test-friend@test.com");

            user1.addFriend("friend@gmail.com",function (result) {
                checkresult=result;
                console.log('Test - Added 1st Friend success'+result);
                user1 = new SUser();
                user1.username="test-user";
                user1.email="test@test.com";
                user1.addFriend("f2@gmail.com", function (result){
                    console.log('Test - Added 2nd Friend success'+result);
                    console.log('Test - Added 2nd Friend success typeof '+typeof result);
                    done();
                })

            });
        });


        it("should save successful", function() {
            expect(checkresult.length).toBe(2);

        });
    })

});
