/**
 * Study Time Allocator
 * Logic to distribute weekly hours based on student level and priority
 */

exports.allocateTime = (studentLevel, prioritizedTopics) => {
    // 1. Determine Total Weekly Budget
    const budgetMap = {
        'Weak': 10,
        'Average': 7,
        'Advanced': 5
    };

    const totalBudget = budgetMap[studentLevel || 'Average'];

    // 2. Distribute Budget
    // Rules: 50% to high priority, 30% second, 20% others
    const allocation = prioritizedTopics.slice(0, 3).map((topic, index) => {
        let percentage = 0;
        if (index === 0) percentage = 0.5;
        else if (index === 1) percentage = 0.3;
        else percentage = 0.2;

        return {
            ...topic,
            estimatedHours: Math.round(totalBudget * percentage),
            practiceBuffer: Math.ceil(totalBudget * percentage * 0.5) // 30 mins practice per hour
        };
    });

    return {
        totalBudget,
        topics: allocation
    };
};
