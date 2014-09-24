describe("DAO User", function() {
    var user;
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
//            console.log(" user "+ user.username);
//            done();
        });
    })


});
