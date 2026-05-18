const User = require("../../models/auth/User");

class EmailService {
  async sendWelcomeEmail(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    return {
      to: user.email,
      subject: "Welcome to the platform",
      html: `<h1>Welcome ${user.name}!</h1><p>Your account has been created successfully.</p>`,
    };
  }

  async sendPasswordResetEmail(userId, resetToken) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    return {
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="/reset-password?token=${resetToken}">here</a> to reset your password.</p>`,
    };
  }

  async sendCourseEnrollmentEmail(userId, courseName) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    return {
      to: user.email,
      subject: "Course Enrollment Confirmation",
      html: `<p>You have been enrolled in ${courseName}.</p>`,
    };
  }

  async sendNotificationEmail(userId, title, message) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    return {
      to: user.email,
      subject: title,
      html: `<p>${message}</p>`,
    };
  }

  async sendBulkEmails(userIds, subject, html) {
    const users = await User.find({ _id: { $in: userIds } });
    return users.map((user) => ({
      to: user.email,
      subject,
      html,
    }));
  }
}

module.exports = new EmailService();
