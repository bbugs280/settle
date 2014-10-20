describe("DAO Transaction Services", function() {

    var isExist;
    describe("isTranIdExist", function(){

        beforeEach(function(done){
            var tran = new Transaction();
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

            var tran = new Transaction();
            tran.set('tranId','test');
            tran.set('amount',Number(0));
            tran.set('from','test-from');
            tran.set('to','test-to');
            tran.set('note','test-note');

            tran.save(null,{
                success: function(result) {

                    checkTran = result;
                    done();
                },
                error: function(result, error) {
                    alert('Failed to create new object, with error code: ' + error.message);
                }
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

//TODO getRelatedTran
    describe("getRelatedTran", function(){
        var checkTran;
        beforeEach(function(done){
            var tran = new Transaction();
            tran.getRelatedTran("test-getrelated-tran", function (result) {
                checkTran = result;
                done();
            });
        });

        it("should be able to get all related transactions successfully", function(){
            expect(checkTran.length).toEqual(3);
            //contain two record where you send money

            //contain 1 record where you receive money
//            expect(checkTran.get('tranId')).toEqual("test");

        });
//
//        afterEach(function(done){
//
//            done();
//        });
    })
});
