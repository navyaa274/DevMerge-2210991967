const moment = require('moment-timezone');

/**
 * Timezone-Aware Academic Scheduling Service (Month 25-26)
 * Handles global institutional scheduling across different timezones.
 */
class AcademicSchedulingService {
    /**
     * Schedule a class session with a specific timezone
     */
    scheduleSession(startTime, durationMinutes, timezone = 'UTC') {
        // Standardize input
        const baseTime = moment.tz(startTime, timezone);

        return {
            startTime: baseTime.toISOString(),
            displayTimes: {
                institutional: baseTime.format('YYYY-MM-DD HH:mm:ss') + ` (${timezone})`,
                local: baseTime.clone().local().format('YYYY-MM-DD HH:mm:ss'),
                utc: baseTime.clone().utc().format('YYYY-MM-DD HH:mm:ss')
            },
            endTime: baseTime.clone().add(durationMinutes, 'minutes').toISOString(),
            conflictPeriod: {
                start: baseTime.valueOf(),
                end: baseTime.clone().add(durationMinutes, 'minutes').valueOf()
            }
        };
    }

    /**
     * Detect scheduling conflicts in institutional calendars 
     */
    checkConflict(newSessionRequest, existingSessions) {
        const newStart = moment(newSessionRequest.conflictPeriod.start);
        const newEnd = moment(newSessionRequest.conflictPeriod.end);

        const conflicts = existingSessions.filter(session => {
            const start = moment(session.conflictPeriod.start);
            const end = moment(session.conflictPeriod.end);

            // True if the intervals overlap
            return (newStart.isBefore(end) && newEnd.isAfter(start));
        });

        return {
            hasConflict: conflicts.length > 0,
            conflictingSessions: conflicts
        };
    }

    /**
     * Convert between timezones for global cohorts
     */
    convertTime(time, fromTz, toTz) {
        return moment.tz(time, fromTz).tz(toTz).format();
    }
}

module.exports = new AcademicSchedulingService();
