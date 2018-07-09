const temp1 = require('../config');
const temp2 = require('../app');

module.exports = (router) => {
    
    router.post('/', ( req, res) => {
        res.send(temp1.database.id);
    });

    return router;
}