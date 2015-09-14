var Bacon = require("baconjs");
var Update = require("update-types").Update;

class ApiResponse{
    toUpdateStream(){
        return Bacon.never();
    }
    entityToUpdate(id, entity){
        return Update(id, entity);
    }
}

class ApiEntityResponse extends ApiResponse{
    constructor(entity){
        super();
        this.entity = entity;
    }
    toUpdateStream(){
        return Bacon.once(
            this.entityToUpdate(this.entity)
        );
    }
}

class ApiCollectionResponse extends ApiResponse{
    constructor(entities){
        super();
        this.entities = entities || [];
    }
    toUpdateStream(){
        return Bacon.fromArray(
            this.entities.map( this.entityToUpdate )
        );
    }
    loadMore(){

    }
}

module.exports = {
    ApiEntityResponse,
    ApiCollectionResponse
}