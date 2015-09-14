// Data types
class Update{
    constructor(id, entity){
        this.id = id;
        this.entity = entity;
    }
}

class UpdateResult{
    /**
     * @param  {bool} success update was successful made
     * @param  {Update} update  the requested udpate
     * @param  {obj} result the result of the update if the update was successful
     * @param  {Error} error the error that happened if the update was not success
     */
    constructor(success, update, result, error){
        this.success = success;
        this.update = update;
        this.result = result;
        this.error = error;
    }
}

module.exports = {
    Update,
    UpdateResult
}