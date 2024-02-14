
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.set('debug', true);

const locationsSchema = new Schema({
    locationName: {
        type: String
    },
    addedby: {
        type: String,
        ref: 'users'
    },
    lastModifiedBy: {
        type: String,
        ref: 'users'
    },
    active: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: { createdAt: 'createdDate', updatedAt: 'updatedAt' },
        usePushEach: true
    })


module.exports = mongoose.model('locations', locationsSchema);
