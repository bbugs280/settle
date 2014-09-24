describe("DAO Transaction Services", function() {
    var tran;
    var isExist;
    describe("isTranIdExist", function(){

        beforeEach(function(done){
            tran = new Transaction();
            tran.isTranIdExist('', function (result) {

                    isExist = result;
                    done();

            });
        });

        it("should be false when call isTranIdExist", function(){
            expect(isExist).toBe(false);
        });

    })

    describe("isTranIdExist", function(){
        beforeEach(function(done){
            tran = new Transaction();
            tran.isTranIdExist('abc', function (result) {
                isExist = result;
                done();

            });
        });

        it("should be true when call isTranIdExist", function(){
            expect(isExist).toBe(true);
        });

    })
});
