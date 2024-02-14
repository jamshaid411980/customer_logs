
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.set('debug', true);

const customerLogsSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'customers'
    },
    type: {
        type: String
    },
    text: {
        type: String
    },
    addedby: {
        type: String,
        ref: 'users'
    },
    date: {
        type: Date
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
        timestamps: { createdAt: 'logDate', updatedAt: 'updatedAt' },
        usePushEach: true
    })


module.exports = mongoose.model('customerLogs', customerLogsSchema);
