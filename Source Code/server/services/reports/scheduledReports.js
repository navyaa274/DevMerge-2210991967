/**
 * Scheduled Reports Service
 * Manages automated report generation and distribution
 */

const ReportBuilder = require('./reportBuilder');
const emailService = require('../../utils/emailService');
const cron = require('node-cron');

class ScheduledReports {
  constructor() {
    this.schedules = new Map();
    this.reports = [];
  }

  /**
   * Create scheduled report
   */
  createSchedule(config) {
    const {
      id,
      name,
      schedule, // cron expression
      reportConfig,
      recipients,
      enabled = true
    } = config;

    if (this.schedules.has(id)) {
      throw new Error('Schedule with this ID already exists');
    }

    const task = cron.schedule(schedule, async () => {
      await this.generateAndSend(id, reportConfig, recipients);
    }, {
      scheduled: enabled
    });

    this.schedules.set(id, {
      id,
      name,
      schedule,
      reportConfig,
      recipients,
      enabled,
      task,
      lastRun: null,
      nextRun: this.getNextRun(schedule)
    });

    return {
      success: true,
      message: 'Schedule created successfully',
      schedule: this.getScheduleInfo(id)
    };
  }

  /**
   * Generate and send report
   */
  async generateAndSend(scheduleId, reportConfig, recipients) {
    try {
      console.log(`Generating scheduled report: ${scheduleId}`);

      // Generate report
      const report = await ReportBuilder.buildReport(reportConfig);

      // Convert to CSV
      const csv = ReportBuilder.exportToCSV(report);

      // Send to recipients
      for (const recipient of recipients) {
        await emailService.sendEmail({
          to: recipient,
          subject: `Scheduled Report: ${report.title}`,
          html: this.generateEmailHTML(report),
          attachments: [{
            filename: `report-${Date.now()}.csv`,
            content: csv
          }]
        });
      }

      // Update last run
      const schedule = this.schedules.get(scheduleId);
      if (schedule) {
        schedule.lastRun = new Date();
        schedule.nextRun = this.getNextRun(schedule.schedule);
      }

      // Store report
      this.reports.push({
        scheduleId,
        generatedAt: new Date(),
        report,
        recipients
      });

      console.log(`Report sent successfully to ${recipients.length} recipients`);

      return { success: true };
    } catch (error) {
      console.error('Error generating scheduled report:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate email HTML
   */
  generateEmailHTML(report) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>${report.title}</h2>
          <p>Generated at: ${new Date(report.generatedAt).toLocaleString()}</p>
          
          <h3>Summary</h3>
          <table style="border-collapse: collapse; width: 100%;">
            ${Object.entries(report.summary).map(([key, value]) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${key}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${JSON.stringify(value)}</td>
              </tr>
            `).join('')}
          </table>
          
          <p>Full report is attached as CSV.</p>
        </body>
      </html>
    `;
  }

  /**
   * Update schedule
   */
  updateSchedule(id, updates) {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Stop existing task
    schedule.task.stop();

    // Update config
    Object.assign(schedule, updates);

    // Create new task if schedule changed
    if (updates.schedule) {
      schedule.task = cron.schedule(updates.schedule, async () => {
        await this.generateAndSend(id, schedule.reportConfig, schedule.recipients);
      }, {
        scheduled: schedule.enabled
      });
    } else if (schedule.enabled) {
      schedule.task.start();
    }

    return {
      success: true,
      schedule: this.getScheduleInfo(id)
    };
  }

  /**
   * Delete schedule
   */
  deleteSchedule(id) {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    schedule.task.stop();
    this.schedules.delete(id);

    return {
      success: true,
      message: 'Schedule deleted successfully'
    };
  }

  /**
   * Enable/disable schedule
   */
  toggleSchedule(id, enabled) {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    schedule.enabled = enabled;
    
    if (enabled) {
      schedule.task.start();
    } else {
      schedule.task.stop();
    }

    return {
      success: true,
      schedule: this.getScheduleInfo(id)
    };
  }

  /**
   * Get schedule info
   */
  getScheduleInfo(id) {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      return null;
    }

    return {
      id: schedule.id,
      name: schedule.name,
      schedule: schedule.schedule,
      enabled: schedule.enabled,
      lastRun: schedule.lastRun,
      nextRun: schedule.nextRun,
      recipients: schedule.recipients
    };
  }

  /**
   * List all schedules
   */
  listSchedules() {
    return Array.from(this.schedules.values()).map(s => this.getScheduleInfo(s.id));
  }

  /**
   * Get next run time
   */
  getNextRun(cronExpression) {
    // Simple implementation - would use a cron parser in production
    return new Date(Date.now() + 86400000); // Next day
  }

  /**
   * Get report history
   */
  getReportHistory(scheduleId = null, limit = 50) {
    let reports = this.reports;

    if (scheduleId) {
      reports = reports.filter(r => r.scheduleId === scheduleId);
    }

    return reports
      .sort((a, b) => b.generatedAt - a.generatedAt)
      .slice(0, limit)
      .map(r => ({
        scheduleId: r.scheduleId,
        generatedAt: r.generatedAt,
        title: r.report.title,
        recipients: r.recipients.length
      }));
  }

  /**
   * Run schedule immediately
   */
  async runNow(id) {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    return await this.generateAndSend(
      id,
      schedule.reportConfig,
      schedule.recipients
    );
  }
}

// Singleton instance
const scheduledReportsService = new ScheduledReports();

module.exports = scheduledReportsService;
