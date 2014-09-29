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

//    describe("isTranIdExist", function(){
//        beforeEach(function(done){
//            tran = new Transaction();
//            tran.isTranIdExist('abc', function (result) {
//                isExist = result;
//                done();
//
//            });
//        });
//
//        it("should be true when call isTranIdExist", function(){
//            expect(isExist).toBe(true);
//        });
//
//    })

    describe("save", function(){
        var checkTran;
        beforeEach(function(done){
            tran = new Transaction();
            tran.tranId = "test";
            tran.amount= Number(0);
            tran.from="test-from";
            tran.to ="test-to";
            tran.note = "test-note";
//            tran..location", this.location);
            tran.save( function (result) {
                checkTran = result;
                done();

            });
        });

        it("should be saved successfully", function(){
            expect(checkTran).toBeDefined;
            expect(checkTran.get('tranId')).toEqual("test");
            expect(checkTran.get('amount')).toEqual(Number(0));
            expect(checkTran.get('from')).toEqual("test-from");
            expect(checkTran.get('to')).toEqual("test-to");
            expect(checkTran.get('note')).toEqual("test-note");
        });

        afterEach(function(done){
            checkTran.destroy();
            done();
        });
    })

});
