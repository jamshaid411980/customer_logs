
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.set('debug', true);

const customersSchema = new Schema({
    locationId: {
        type: Schema.Types.ObjectId,
        ref: 'locations'
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
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


module.exports = mongoose.model('customers', customersSchema);
