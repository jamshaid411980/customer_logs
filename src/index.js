var express = require('express')
var app = express()

app.use(express.json())
const port = 5873

//connect to mongodb
require('./config/dbconnect')
require('./models')
var mongoose = require("mongoose")
const CustomerLog = mongoose.model('customerLogs')
const Customer = mongoose.model('customers')
const { ObjectId } = mongoose.Types


app.post('/opiniionTest', async (req, res) => {
    console.log('opiniionTest called')
    try {


        const { locationId, startDate, endDate, sortProperty, sortOrder, offset, limit, useAggregation } = req.body
        // Convert date strings to Date objects
        const start = new Date(startDate)
        const end = new Date(endDate)

        let result = null
        if (useAggregation) {
            //new solution which is more effecient and avergae respone time is 10-12 ms
            //Get the objectid of the clientside sent locatin id
            let locid = new ObjectId(locationId)
            result = await CustomerLog.aggregate([
                // Stage 1: Match logs within the specified date range
                {
                    $match: {
                        logDate: {
                            $gte: start,
                            $lte: end
                        }
                    }
                },
                // Stage 2: Lookup customer details for each log
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'customer'
                    }
                },
                // Stage 3: Unwind the resulting array from the lookup to work with individual documents
                {
                    $unwind: '$customer'
                },
                // Stage 4: Lookup location details for each customer
                {
                    $lookup: {
                        from: 'locations',
                        localField: 'customer.locationId',
                        foreignField: '_id',
                        as: 'customer.location'
                    }
                },
                // Stage 5: Unwind the resulting array from the location lookup
                {
                    $unwind: '$customer.location'
                },
                // Stage 6: Filter logs by the specified location ID
                {
                    $match: {
                        'customer.location._id': locid
                    }
                },
                // Stage 7: Group logs by customerId and include customer information and make new field logs which contains all logs of a customer
                {
                    $group: {
                        _id: '$customer.firstName',
                        customer: { $first: '$customer' },
                        logs: { $push: '$$ROOT' }
                    }
                },
                // Stage 8: Project selective fields for the output document
                {
                    $project: {
                        '_id': 1,
                        'customer._id': 1,
                        'customer.firstName': 1,
                        'customer.lastName': 1,
                        'customer.location._id': 1,
                        'customer.location.locationName': 1,
                        'logs._id': 1,
                        'logs.type': 1,
                        'logs.text': 1,
                        'logs.logDate': 1

                        // Add more fields as needed
                    }
                },
                // Stage 9: Sort the result by client side provided sortproperty and sorting order
                {
                    $sort: { [sortProperty]: sortOrder }
                },
                // Stage 10: skip the resultant documents for pagination, offset is recieved from client side
                {
                    $skip: offset
                },
                // Stage 11: limit the resultant documents for pagination, limit is recieved from client side
                {
                    $limit: limit
                }
            ])
        } else {
            //previously submitted solution, which was really costly an avergae response time is 30+ms
            const query = {
                customerId: {
                    $in: await Customer.find({ locationId }).distinct('_id') //find distinct customers based on locationId Provided
                },
                logDate: {
                    $gte: start, //fetch only those logs which are between a startdate and end date
                    $lte: end
                }
            }

            //run the query with joins and sorting, and pagination
            const customerLogs = await CustomerLog.find(query)
                .populate({
                    path: 'customerId', //do a join with customer to get his firstname and lastname and also location
                    model: 'customers',
                    select: 'firstName lastName',
                    populate: {
                        path: 'locationId', // then do a nested join of customer with location to get location name
                        model: 'locations',
                        select: 'locationName'

                    }
                })
                .sort({ [sortProperty]: sortOrder }) //sort the result set on provided field name of the schema and also sort order 1 or -1 for ascn or desc
                .skip(offset) // pagination offset e.g. 0
                .limit(limit) // pagination limit e.g. 10 so we get first 10 logs                

            // Group customer logs by customer first name
            result = {}
            customerLogs.forEach(log => {
                if (!result[log.customerId.firstName]) {
                    result[log.customerId.firstName] = []
                }
                result[log.customerId.firstName].push(log)
            })
        }








        res.send(result)
    } catch (err) {

        res.send(err)
    }

})

app.listen(port, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`Server is running on ${port}`)
    }
})