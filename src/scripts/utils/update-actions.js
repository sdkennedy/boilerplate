
var Update = require("./types").Update;

/**
 * creates an action function that pushes UpdateRequest events
 * @return {Bacon.Bus<UpdateRequest>}
 */
function createUpdateAction(){
    return function(id, entity){
        this.push( new Update(id, entity) );
    };
}

module.exports = {
    createUpdateAction
};