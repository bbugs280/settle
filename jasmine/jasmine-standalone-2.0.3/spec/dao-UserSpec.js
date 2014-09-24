describe("DAO User", function() {
    var user;
    var checkresult;
    describe("Login: ", function(){

        beforeEach(function(done){
            user = new User();
            user.login('yeung.vincent@gmail.com','1', function (result) {
                    user = result;
                    done();
            })

        });

        it("should login successful", function() {
            expect(user).toBeDefined();
            expect(user.username).toMatch('yeung.vincent@gmail.com');

        });
    })

    describe("getUSER by email: ", function(){

        beforeEach(function(done){
            user = new User();
            user.getUser('yeung.vincent@gmail.com', function (result) {
                checkresult = result;
                done();
            })

        });

        it("should get User successful", function() {
            expect(checkresult).toBeDefined();
//            expect(user.username).toMatch('yeung.vincent@gmail.com');

        });
    })
//    describe("Save: ", function(){
//
//        beforeEach(function(done){
//            user = new User();
//            user.username="abc";
//            user.email="you@you.com";
//            user.password="123";
//            user.save(function (result) {
//                checkresult = result;
//                done();
//            })
//
//        });
//
//        it("should save successful", function() {
//            console.log(" user "+ user.toString());
//            expect(user).toEqual(checkresult);
//
//
//        });
//
//        afterEach(function(done){
//
//            done();
//        })
//    })

});
