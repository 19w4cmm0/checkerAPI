const Statistics = require('../models/statistics.model');

// Hàm cập nhật thống kê với optimistic concurrency control
const updateStatistics = async (type, userId) => {
    try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        // Sử dụng findOneAndUpdate với upsert để tránh race condition
        await Statistics.findOneAndUpdate(
            {
                type: type,
                userId: userId,
                date: dateStr,
            },
            {
                $inc: { count: 1 },
                $setOnInsert: {
                    type: type,
                    userId: userId,
                    date: dateStr,
                    createdAt: new Date()
                }
            },
            {
                upsert: true,
                new: true
            }
        );
    } catch (err) {
        console.error('Error updating statistics:', err);
        throw err; // Throw error để caller có thể handle
    }
};

// Hàm helper để tạo date range
const getDateRange = (startDate, endDate, period) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set time to start/end of day để đảm bảo capture đúng range
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
};

// Hàm helper để tạo aggregation pipeline
const createAggregationPipeline = (userId, dateRange, period) => {
    const { start, end } = dateRange;
    
    let groupStage;
    
    switch (period) {
        case 'today':
            groupStage = {
                $group: {
                    _id: {
                        type: '$type'
                    },
                    totalCount: { $sum: '$count' }
                }
            };
            break;
            
        case 'day':
            groupStage = {
                $group: {
                    _id: {
                        date: '$date',
                        type: '$type'
                    },
                    totalCount: { $sum: '$count' }
                }
            };
            break;
            
        case 'week':
            groupStage = {
                $group: {
                    _id: {
                        date: {
                            $concat: [
                                { $toString: { $isoWeekYear: { $dateFromString: { dateString: '$date' } } } },
                                '-W',
                                {
                                    $toString: {
                                        $cond: {
                                            if: { $lt: [{ $isoWeek: { $dateFromString: { dateString: '$date' } } }, 10] },
                                            then: {
                                                $concat: ['0', { $toString: { $isoWeek: { $dateFromString: { dateString: '$date' } } } }]
                                            },
                                            else: { $toString: { $isoWeek: { $dateFromString: { dateString: '$date' } } } }
                                        }
                                    }
                                }
                            ]
                        },
                        type: '$type'
                    },
                    totalCount: { $sum: '$count' },
                    // Thêm field để sort theo thời gian thực
                    sortDate: { 
                        $min: { $dateFromString: { dateString: '$date' } }
                    }
                }
            };
            break;
            
        case 'month':
            groupStage = {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: '%Y-%m',
                                date: { $dateFromString: { dateString: '$date' } }
                            }
                        },
                        type: '$type'
                    },
                    totalCount: { $sum: '$count' },
                    sortDate: { 
                        $min: { $dateFromString: { dateString: '$date' } }
                    }
                }
            };
            break;
            
        default:
            throw new Error('Invalid period. Must be today, day, week, or month');
    }

    const basePipeline = [
        {
            $match: {
                userId: userId,
                date: {
                    $gte: start,
                    $lte: end
                }
            }
        },
        groupStage
    ];

    // Thêm sort và project stages dựa trên period
    if (period === 'today') {
        basePipeline.push(
            {
                $sort: { 
                    '_id.type': 1 
                }
            },
            {
                $project: {
                    _id: 0,
                    date: start, // Sử dụng ngày hiện tại cho today
                    type: '$_id.type',
                    count: '$totalCount'
                }
            }
        );
    } else {
        basePipeline.push(
            {
                $sort: { 
                    sortDate: 1,
                    '_id.type': 1 
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    type: '$_id.type',
                    count: '$totalCount'
                }
            }
        );
    }

    return basePipeline;
};

// API lấy dữ liệu thống kê được tối ưu
module.exports.getStatistics = async (req, res) => {
    try {
        const { userId } = req.body;
        const period = req.query.period || 'day';
        
        // Validation
        if (!userId) {
            return res.status(400).json({
                code: 400,
                message: 'Thiếu userId trong yêu cầu!'
            });
        }

        if (!['today', 'day', 'week', 'month'].includes(period)) {
            return res.status(400).json({
                code: 400,
                message: 'Period phải là today, day, week hoặc month!'
            });
        }

        // Tính toán date range dựa trên period
        const endDate = new Date(req.query.endDate || Date.now());
        let startDate;
        let defaultDays;
        
        switch (period) {
            case 'today':
                // Chỉ lấy dữ liệu của ngày hôm nay
                startDate = new Date(endDate);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'day': 
                defaultDays = 7; 
                startDate = new Date(req.query.startDate || (endDate.getTime() - defaultDays * 24 * 60 * 60 * 1000));
                break;
            case 'week': 
                defaultDays = 30; 
                startDate = new Date(req.query.startDate || (endDate.getTime() - defaultDays * 24 * 60 * 60 * 1000));
                break;
            case 'month': 
                defaultDays = 90; 
                startDate = new Date(req.query.startDate || (endDate.getTime() - defaultDays * 24 * 60 * 60 * 1000));
                break;
        }
        
        const dateRange = getDateRange(startDate, endDate, period);
        const pipeline = createAggregationPipeline(userId, dateRange, period);

        console.log('Aggregation pipeline:', JSON.stringify(pipeline, null, 2));

        const stats = await Statistics.aggregate(pipeline);

        // Tạo response format nhất quán
        const formattedStats = stats.map(stat => ({
            date: stat.date,
            type: stat.type,
            count: stat.count
        }));

        res.status(200).json({
            code: 200,
            message: 'Lấy dữ liệu thống kê thành công!',
            data: formattedStats,
            meta: {
                period,
                startDate: dateRange.start,
                endDate: dateRange.end,
                totalRecords: formattedStats.length
            }
        });

    } catch (err) {
        console.error('Error in getStatistics:', err);
        res.status(500).json({
            code: 500,
            message: 'Lỗi server, vui lòng thử lại!',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Thêm API để lấy summary thống kê
module.exports.getStatisticsSummary = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                code: 400,
                message: 'Thiếu userId trong yêu cầu!'
            });
        }

        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const summary = await Statistics.aggregate([
            {
                $match: {
                    userId: userId,
                    date: { $gte: thirtyDaysAgo, $lte: today }
                }
            },
            {
                $group: {
                    _id: '$type',
                    totalCount: { $sum: '$count' },
                    avgPerDay: { $avg: '$count' },
                    maxPerDay: { $max: '$count' },
                    daysActive: { $addToSet: '$date' }
                }
            },
            {
                $project: {
                    _id: 0,
                    type: '$_id',
                    totalCount: 1,
                    avgPerDay: { $round: ['$avgPerDay', 2] },
                    maxPerDay: 1,
                    daysActive: { $size: '$daysActive' }
                }
            }
        ]);

        res.status(200).json({
            code: 200,
            message: 'Lấy tổng quan thống kê thành công!',
            data: summary
        });

    } catch (err) {
        console.error('Error in getStatisticsSummary:', err);
        res.status(500).json({
            code: 500,
            message: 'Lỗi server, vui lòng thử lại!',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports.updateStatistics = updateStatistics;