describe("DAO User", function() {

    describe("Login: ", function(){

        var checkuser = new SUser();
        beforeEach(function(done){

            var user = new SUser();
            Parse.User.logIn('test-user','1', function (result) {
                checkuser = result;

                done();
            })

        });

        it("should login successful", function() {
            expect(checkuser.get('username')).toMatch('test-user');
            expect(checkuser.get('email')).toMatch('test@test.com');

        });
    })

    describe("get USER by email: ", function(){
        var user = new SUser();
        var checkresult;
        beforeEach(function(done){

            checkresult = new SUser();
            user.getUserByEmail('test@test.com', function (result) {
                checkresult = result;

                done();
            })

        });

        it("should get User successful", function() {
//            console.log("check : "+checkresult.email);
//            expect(checkresult).toBeDefined();
            expect(checkresult.get('username')).toMatch('test-user');
            expect(checkresult.get('email')).toMatch('test@test.com');
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
                checkresult = result;
                done();
            })

        });

        it("should get Null", function() {
            expect(checkresult).toBeNull();
        });
    })

    describe("get Balance by email: ", function(){
        var checkresult;
        beforeEach(function(done){
            var user = new SUser();
            user.getBalanceByEmail('test@test.com', function (result) {
                checkresult=result;

                done();
            })
        });

        it("should get balance with Zeros ", function() {

            expect(checkresult.get('credit')).toMatch(Number(0));
            expect(checkresult.get('debit')).toMatch(Number(0));
            expect(checkresult.get('balance')).toMatch(Number(0));
        });
    })

    describe("get Balance by email: ", function(){

        var checkresult;
        beforeEach(function(done){
            var user = new SUser();
            checkresult = new SUser();
            user.getBalanceByEmail('test-balance@test.com', function (result) {
                checkresult=result;
                done();
            })

        });

        it("should get balance with correct Credit, Debit, Balance ", function() {

            expect(checkresult.get('credit')).toMatch(Number(123));
            expect(checkresult.get('debit')).toMatch(Number(123));
            expect(checkresult.get('balance')).toMatch(Number(0));
        });
    })

    describe("Update Existing Balance: ", function(){

        var checkresult;
        beforeEach(function(done){
            var user = new SUser();
            var Balance = Parse.Object.extend("balance");
            var bal = new Balance();
            bal.id="bfwbd4NJwr";
            bal.set('email','test-balance2@test.com');
            bal.set('credit',Number(123));
            bal.set('debit',Number(101));

            user.updateBalance(bal,function (result) {
                checkresult = result;

                done();
            })

        });

        it("should save successful", function() {
            expect(checkresult.get('credit')).toMatch(Number(123));
            expect(checkresult.get('debit')).toMatch(Number(101));
            expect(checkresult.get('balance')).toMatch(Number(22));

        });

    })

    describe("Update Balance that not created: ", function(){
        var checkresult;

        beforeEach(function(done){
            var user = new SUser();
            var Balance = Parse.Object.extend("balance");
            var bal = new Balance();
            bal.set('email','test-balance3@test.com');
            bal.set('credit',Number(120));
            bal.set('debit',Number(100));
            console.log("before calling update balance");

            user.updateBalance(bal,function (result, result2, result3) {
                checkresult = result;
                done();
            })

        });

        it("should save successful", function() {
            expect(checkresult.get('credit')).toMatch(Number(120));
            expect(checkresult.get('debit')).toMatch(Number(100));
            expect(checkresult.get('balance')).toMatch(Number(20));

        });

    })


    describe("ADD Friend: ", function(){
        var noOfFriend=0;
        var checkresult;
        beforeEach(function(done){
            var user1 = new SUser();
//            user1.="test-user";
            user1.getFriendList('test-friend@test.com', function(result){
                noOfFriend = result.get('friends').length;

                user1.addFriend(result,'f2@gmail.com', function(result){


                    checkresult=result;
                    done();
                })
            })

        });


        it("should save successful", function() {
            expect(checkresult.get('friends').length).toBe(noOfFriend);

        });
    })

});
