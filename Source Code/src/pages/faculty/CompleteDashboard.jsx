import React, { useState, useEffect, useRef } from 'react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import facultyService from '@/services/api/facultyService';
import { useAuth } from '@/hooks/useAuth';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Faculty data states
    const [facultyProfile, setFacultyProfile] = useState(null);
    const [facultyCourses, setFacultyCourses] = useState([]);
    const [facultySchedule, setFacultySchedule] = useState([]);
    const [facultyWorkload, setFacultyWorkload] = useState(null);
    const [facultyPerformance, setFacultyPerformance] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [officeHours, setOfficeHours] = useState([]);
    const [researchProfile, setResearchProfile] = useState(null);

    // Additional data states
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [messages, setMessages] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [gradebook, setGradebook] = useState([]);
    const [classRoster, setClassRoster] = useState([]);
    const [attendanceTracking, setAttendanceTracking] = useState([]);
    const [syllabusManagement, setSyllabusManagement] = useState([]);
    const [aiAssistant, setAiAssistant] = useState(null);
    const [performanceMetrics, setPerformanceMetrics] = useState(null);
    const [bulkOperations, setBulkOperations] = useState([]);
    const [newAssignment, setNewAssignment] = useState({ 
        title: '', 
        description: '', 
        courseId: '', 
        dueDate: '', 
        totalPoints: 100 
    });
    const [newExam, setNewExam] = useState({ 
        title: '', 
        courseId: '', 
        examDate: '', 
        duration: 120, 
        totalPoints: 100 
    });
    const [newAnnouncement, setNewAnnouncement] = useState({ 
        title: '', 
        message: '', 
        courseId: '' 
    });
    const [attendanceData, setAttendanceData] = useState({ 
        courseId: '', 
        date: '', 
        studentIds: [] 
    });
    const [gradeData, setGradeData] = useState({ 
        courseId: '', 
        studentId: '', 
        grade: '', 
        feedback: '' 
    });

    useEffect(() => {
        if (user?.id) {
            loadFacultyData();
        }
    }, [user]);

    const loadFacultyData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load critical data first
            const criticalData = await Promise.allSettled([
                facultyService.getFacultyProfile(user.id),
                facultyService.getFacultyCourses(user.id),
                facultyService.getFacultySchedule(user.id)
            ]);

            // Set critical data immediately
            if (criticalData[0].status === 'fulfilled') setFacultyProfile(criticalData[0].value);
            if (criticalData[1].status === 'fulfilled') setFacultyCourses(criticalData[1].value.data?.courses || []);
            if (criticalData[2].status === 'fulfilled') setFacultySchedule(criticalData[2].value.data?.schedule || []);

            // Load secondary data in background
            const secondaryData = await Promise.allSettled([
                facultyService.getFacultyWorkload(user.id),
                facultyService.getFacultyPerformance(user.id),
                facultyService.getAssignments(criticalData[1].value?.data?.courses?.[0]?.id || ''),
                facultyService.getExams(criticalData[1].value?.data?.courses?.[0]?.id || ''),
                facultyService.getCourseAnnouncements(criticalData[1].value?.data?.courses?.[0]?.id || ''),
                facultyService.getNotifications(user.id),
                facultyService.getOfficeHours(user.id),
                facultyService.getResearchProfile(user.id)
            ]);

            // Set secondary data
            if (secondaryData[0].status === 'fulfilled') setFacultyWorkload(secondaryData[0].value);
            if (secondaryData[1].status === 'fulfilled') setFacultyPerformance(secondaryData[1].value);
            if (secondaryData[2].status === 'fulfilled') setAssignments(secondaryData[2].value.data?.assignments || []);
            if (secondaryData[3].status === 'fulfilled') setExams(secondaryData[3].value.data?.exams || []);
            if (secondaryData[4].status === 'fulfilled') setAnnouncements(secondaryData[4].value.data?.announcements || []);
            if (secondaryData[5].status === 'fulfilled') setNotifications(secondaryData[5].value.data?.notifications || []);
            if (secondaryData[6].status === 'fulfilled') setOfficeHours(secondaryData[6].value.data?.officeHours || []);
            if (secondaryData[7].status === 'fulfilled') setResearchProfile(secondaryData[7].value);

            // Load tertiary data in background
            const tertiaryData = await Promise.allSettled([
                facultyService.getCalendarEvents(user.id),
                facultyService.getMessages(user.id),
                facultyService.getAnalytics(user.id),
                facultyService.getGradebook(user.id),
                facultyService.getClassRoster(user.id),
                facultyService.getAttendanceTracking(user.id),
                facultyService.getSyllabusManagement(user.id),
                facultyService.getAiAssistant(user.id),
                facultyService.getPerformanceMetrics(user.id),
                facultyService.getBulkOperations(user.id)
            ]);

            // Set tertiary data
            if (tertiaryData[0].status === 'fulfilled') setCalendarEvents(tertiaryData[0].value.data?.events || []);
            if (tertiaryData[1].status === 'fulfilled') setMessages(tertiaryData[1].value.data?.messages || []);
            if (tertiaryData[2].status === 'fulfilled') setAnalytics(tertiaryData[2].value);
            if (tertiaryData[3].status === 'fulfilled') setGradebook(tertiaryData[3].value.data?.gradebook || []);
            if (tertiaryData[4].status === 'fulfilled') setClassRoster(tertiaryData[4].value.data?.roster || []);
            if (tertiaryData[5].status === 'fulfilled') setAttendanceTracking(tertiaryData[5].value.data?.attendance || []);
            if (tertiaryData[6].status === 'fulfilled') setSyllabusManagement(tertiaryData[6].value.data?.syllabus || []);
            if (tertiaryData[7].status === 'fulfilled') setAiAssistant(tertiaryData[7].value);
            if (tertiaryData[8].status === 'fulfilled') setPerformanceMetrics(tertiaryData[8].value);
            if (tertiaryData[9].status === 'fulfilled') setBulkOperations(tertiaryData[9].value.data?.operations || []);

        } catch (err) {
            setError(err.message || 'Failed to load faculty data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async () => {
        try {
            await facultyService.createAssignment(newAssignment);
            setNewAssignment({ title: '', description: '', courseId: '', dueDate: '', totalPoints: 100 });
            await loadFacultyData();
        } catch (err) {
            setError(err.message || 'Failed to create assignment');
        }
    };

    const handleCreateExam = async () => {
        try {
            await facultyService.createExam(newExam);
            setNewExam({ title: '', courseId: '', examDate: '', duration: 120, totalPoints: 100 });
            await loadFacultyData();
        } catch (err) {
            setError(err.message || 'Failed to create exam');
        }
    };

    const handleSendAnnouncement = async () => {
        try {
            await facultyService.sendCourseAnnouncement(newAnnouncement.courseId, {
                title: newAnnouncement.title,
                message: newAnnouncement.message
            });
            setNewAnnouncement({ title: '', message: '', courseId: '' });
            await loadFacultyData();
        } catch (err) {
            setError(err.message || 'Failed to send announcement');
        }
    };

    const handleMarkAttendance = async () => {
        try {
            await facultyService.markAttendance(attendanceData);
            setAttendanceData({ courseId: '', date: '', studentIds: [] });
            await loadFacultyData();
        } catch (err) {
            setError(err.message || 'Failed to mark attendance');
        }
    };

    const handleUpdateGrades = async () => {
        try {
            await facultyService.updateStudentGrades(gradeData.courseId, gradeData.studentId, {
                grade: gradeData.grade,
                feedback: gradeData.feedback
            });
            setGradeData({ courseId: '', studentId: '', grade: '', feedback: '' });
            await loadFacultyData();
        } catch (err) {
            setError(err.message || 'Failed to update grades');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await facultyService.updateFacultyProfile(user.id, facultyProfile);
            await loadFacultyData();
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        }
    };

    const handleUpdateOfficeHours = async () => {
        try {
            await facultyService.updateOfficeHours(user.id, officeHours);
            await loadFacultyData();
        } catch (err) {
            setError(err.message || 'Failed to update office hours');
        }
    };

    const refreshData = () => {
        loadFacultyData();
    };

    // Add error recovery
    const retryFailedRequests = async () => {
        setError(null);
        await loadFacultyData();
    };

    // Add data caching to prevent unnecessary reloads
    const lastDataLoad = useRef(Date.now());
    const dataCacheTimeout = 5 * 60 * 1000; // 5 minutes

    const loadFacultyDataWithCache = async () => {
        const now = Date.now();
        if (now - lastDataLoad.current < dataCacheTimeout && !error) {
            return; // Use cached data
        }
        lastDataLoad.current = now;
        await loadFacultyData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-lg font-medium">Loading Faculty Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Faculty Dashboard</h1>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={refreshData} variant="outline" size="sm">
                        Refresh Data
                    </Button>
                    {error && (
                        <Button onClick={retryFailedRequests} variant="destructive" size="sm">
                            Retry
                        </Button>
                    )}
                    <Badge variant="secondary">
                        {facultyProfile?.name || 'Faculty Member'}
                    </Badge>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
                </Alert>
            )}

            {/* Main Dashboard Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-9">
                    <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
                    <TabsTrigger value="courses" className="text-xs md:text-sm">Courses</TabsTrigger>
                    <TabsTrigger value="assignments" className="text-xs md:text-sm">Assignments</TabsTrigger>
                    <TabsTrigger value="exams" className="text-xs md:text-sm">Exams</TabsTrigger>
                    <TabsTrigger value="calendar" className="text-xs md:text-sm">Calendar</TabsTrigger>
                    <TabsTrigger value="messages" className="text-xs md:text-sm">Messages</TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs md:text-sm">Analytics</TabsTrigger>
                    <TabsTrigger value="gradebook" className="text-xs md:text-sm">Gradebook</TabsTrigger>
                    <TabsTrigger value="profile" className="text-xs md:text-sm">Profile</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Faculty Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Faculty Profile</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {facultyProfile && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Name</span>
                                            <Badge>{facultyProfile.name}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Department</span>
                                            <Badge variant="outline">{facultyProfile.department?.name || 'N/A'}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Email</span>
                                            <span className="text-sm">{facultyProfile.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Employee ID</span>
                                            <span className="text-sm">{facultyProfile.employeeId}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Workload Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Workload Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {facultyWorkload && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Total Courses</span>
                                            <Badge>{facultyWorkload.totalCourses || 0}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Students</span>
                                            <Badge>{facultyWorkload.totalStudents || 0}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Teaching Hours</span>
                                            <span>{facultyWorkload.teachingHours || 0}h</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Office Hours</span>
                                            <span>{facultyWorkload.officeHours || 0}h</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Performance Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {facultyPerformance && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span>Student Rating</span>
                                            <Progress value={facultyPerformance.studentRating || 0} className="w-20" />
                                            <Badge>{facultyPerformance.studentRating || 0}%</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Research Score</span>
                                            <Progress value={facultyPerformance.researchScore || 0} className="w-20" />
                                            <Badge>{facultyPerformance.researchScore || 0}%</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Publications</span>
                                            <Badge>{facultyPerformance.publications || 0}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Overall Rating</span>
                                            <Badge variant={facultyPerformance.overallRating > 80 ? "default" : "secondary"}>
                                                {facultyPerformance.overallRating || 0}%
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Today's Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {facultySchedule.length > 0 ? (
                                    <div className="space-y-2">
                                        {facultySchedule.slice(0, 3).map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 border rounded">
                                                <div>
                                                    <div className="font-medium">{item.courseName}</div>
                                                    <div className="text-sm text-muted-foreground">{item.time}</div>
                                                </div>
                                                <Badge variant="outline">{item.type}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No classes scheduled for today</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Notifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Notifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {notifications.length > 0 ? (
                                    <div className="space-y-2">
                                        {notifications.slice(0, 3).map((notification, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 border rounded">
                                                <div>
                                                    <div className="font-medium">{notification.title}</div>
                                                    <div className="text-sm text-muted-foreground">{notification.message}</div>
                                                </div>
                                                <Badge variant={notification.read ? "secondary" : "default"}>
                                                    {notification.read ? 'Read' : 'New'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No new notifications</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={() => setActiveTab('assignments')} className="w-full">
                                    Create Assignment
                                </Button>
                                <Button onClick={() => setActiveTab('exams')} variant="outline" className="w-full">
                                    Schedule Exam
                                </Button>
                                <Button onClick={() => setActiveTab('students')} variant="outline" className="w-full">
                                    Mark Attendance
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Courses List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>My Courses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {facultyCourses.map((course, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{course.name}</div>
                                                <div className="text-sm text-muted-foreground">{course.code}</div>
                                                <div className="text-sm text-muted-foreground">{course.students?.length || 0} students</div>
                                            </div>
                                            <Badge variant={course.isActive ? "default" : "secondary"}>
                                                {course.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Management</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Select Course</Label>
                                    <Select value={newAnnouncement.courseId} onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, courseId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {facultyCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Announcement Title</Label>
                                    <Input
                                        value={newAnnouncement.title}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                        placeholder="Enter announcement title"
                                    />
                                </div>
                                <div>
                                    <Label>Message</Label>
                                    <Textarea
                                        value={newAnnouncement.message}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                        placeholder="Enter announcement message"
                                    />
                                </div>
                                <Button onClick={handleSendAnnouncement} className="w-full">
                                    Send Announcement
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={() => setActiveTab('assignments')} className="w-full" variant="outline">
                                    Manage Assignments
                                </Button>
                                <Button onClick={() => setActiveTab('exams')} className="w-full" variant="outline">
                                    Manage Exams
                                </Button>
                                <Button onClick={() => setActiveTab('students')} className="w-full" variant="outline">
                                    View Students
                                </Button>
                                <Button onClick={() => setActiveTab('profile')} className="w-full" variant="outline">
                                    Edit Profile
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Assignments Tab */}
                <TabsContent value="assignments" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Assignments List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>My Assignments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {assignments.map((assignment, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{assignment.title}</div>
                                                <div className="text-sm text-muted-foreground">{assignment.courseName}</div>
                                                <div className="text-sm text-muted-foreground">Due: {assignment.dueDate}</div>
                                            </div>
                                            <Badge variant={assignment.status === 'active' ? "default" : "secondary"}>
                                                {assignment.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Create Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Assignment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Assignment Title</Label>
                                    <Input
                                        value={newAssignment.title}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                        placeholder="Enter assignment title"
                                    />
                                </div>
                                <div>
                                    <Label>Course</Label>
                                    <Select value={newAssignment.courseId} onValueChange={(value) => setNewAssignment({ ...newAssignment, courseId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {facultyCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={newAssignment.description}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                        placeholder="Enter assignment description"
                                    />
                                </div>
                                <div>
                                    <Label>Due Date</Label>
                                    <Input
                                        type="datetime-local"
                                        value={newAssignment.dueDate}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Total Points</Label>
                                    <Input
                                        type="number"
                                        value={newAssignment.totalPoints}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, totalPoints: parseInt(e.target.value) })}
                                        placeholder="Enter total points"
                                    />
                                </div>
                                <Button onClick={handleCreateAssignment} className="w-full">
                                    Create Assignment
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Exams Tab */}
                <TabsContent value="exams" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Exams List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Scheduled Exams</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {exams.map((exam, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{exam.title}</div>
                                                <div className="text-sm text-muted-foreground">{exam.courseName}</div>
                                                <div className="text-sm text-muted-foreground">Date: {exam.examDate}</div>
                                                <div className="text-sm text-muted-foreground">Duration: {exam.duration} min</div>
                                            </div>
                                            <Badge variant={exam.status === 'scheduled' ? "default" : "secondary"}>
                                                {exam.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Create Exam */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule Exam</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Exam Title</Label>
                                    <Input
                                        value={newExam.title}
                                        onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                        placeholder="Enter exam title"
                                    />
                                </div>
                                <div>
                                    <Label>Course</Label>
                                    <Select value={newExam.courseId} onValueChange={(value) => setNewExam({ ...newExam, courseId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {facultyCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Exam Date</Label>
                                    <Input
                                        type="datetime-local"
                                        value={newExam.examDate}
                                        onChange={(e) => setNewExam({ ...newExam, examDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Duration (minutes)</Label>
                                    <Input
                                        type="number"
                                        value={newExam.duration}
                                        onChange={(e) => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                                        placeholder="Enter duration in minutes"
                                    />
                                </div>
                                <div>
                                    <Label>Total Points</Label>
                                    <Input
                                        type="number"
                                        value={newExam.totalPoints}
                                        onChange={(e) => setNewExam({ ...newExam, totalPoints: parseInt(e.target.value) })}
                                        placeholder="Enter total points"
                                    />
                                </div>
                                <Button onClick={handleCreateExam} className="w-full">
                                    Schedule Exam
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Student Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Management</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Course</Label>
                                    <Select value={gradeData.courseId} onValueChange={(value) => setGradeData({ ...gradeData, courseId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {facultyCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Student</Label>
                                    <Input
                                        value={gradeData.studentId}
                                        onChange={(e) => setGradeData({ ...gradeData, studentId: e.target.value })}
                                        placeholder="Enter student ID"
                                    />
                                </div>
                                <div>
                                    <Label>Grade</Label>
                                    <Input
                                        value={gradeData.grade}
                                        onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                                        placeholder="Enter grade"
                                    />
                                </div>
                                <div>
                                    <Label>Feedback</Label>
                                    <Textarea
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                        placeholder="Enter feedback"
                                    />
                                </div>
                                <Button onClick={handleUpdateGrades} className="w-full">
                                    Update Grade
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Attendance Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Mark Attendance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Course</Label>
                                    <Select value={attendanceData.courseId} onValueChange={(value) => setAttendanceData({ ...attendanceData, courseId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {facultyCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={attendanceData.date}
                                        onChange={(e) => setAttendanceData({ ...attendanceData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Student IDs (comma separated)</Label>
                                    <Textarea
                                        value={attendanceData.studentIds.join(', ')}
                                        onChange={(e) => setAttendanceData({ ...attendanceData, studentIds: e.target.value.split(',').map(id => id.trim()) })}
                                        placeholder="Enter student IDs separated by commas"
                                    />
                                </div>
                                <Button onClick={handleMarkAttendance} className="w-full">
                                    Mark Attendance
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Calendar Tab */}
                <TabsContent value="calendar" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Calendar Widget */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Academic Calendar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {calendarEvents.length > 0 ? (
                                        calendarEvents.slice(0, 5).map((event, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{event.title}</div>
                                                    <div className="text-sm text-muted-foreground">{event.date}</div>
                                                    <div className="text-sm text-muted-foreground">{event.course}</div>
                                                </div>
                                                <Badge variant={event.type === 'exam' ? 'destructive' : event.type === 'lecture' ? 'default' : 'secondary'}>
                                                    {event.type}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No upcoming events</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Today's Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {facultySchedule.length > 0 ? (
                                        facultySchedule.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{item.course}</div>
                                                    <div className="text-sm text-muted-foreground">{item.time}</div>
                                                    <div className="text-sm text-muted-foreground">{item.room}</div>
                                                </div>
                                                <Badge variant="outline">
                                                    {item.type}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No classes today</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Messages */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Messages</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {messages.length > 0 ? (
                                        messages.slice(0, 5).map((message, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{message.sender}</div>
                                                    <div className="text-sm text-muted-foreground">{message.subject}</div>
                                                    <div className="text-sm text-muted-foreground">{message.time}</div>
                                                </div>
                                                <Badge variant={message.read ? 'secondary' : 'default'}>
                                                    {message.read ? 'Read' : 'Unread'}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No messages</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Compose */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Compose</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>To</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select recipient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="students">Students</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="faculty">Faculty</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Subject</Label>
                                    <Input placeholder="Enter subject" />
                                </div>
                                <div>
                                    <Label>Message</Label>
                                    <Textarea placeholder="Enter your message" />
                                </div>
                                <Button className="w-full">Send Message</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Performance Analytics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Teaching Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {performanceMetrics ? (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span>Student Satisfaction</span>
                                                <Progress value={performanceMetrics.studentSatisfaction || 0} className="w-20" />
                                                <Badge>{performanceMetrics.studentSatisfaction || 0}%</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Assignment Completion Rate</span>
                                                <span>{performanceMetrics.assignmentCompletion || 0}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Average Response Time</span>
                                                <span>{performanceMetrics.responseTime || 0}h</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Teaching Hours</span>
                                                <span>{performanceMetrics.teachingHours || 0}h</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground">No analytics data available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {facultyCourses.length > 0 ? (
                                        facultyCourses.slice(0, 3).map((course, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{course.name}</div>
                                                    <div className="text-sm text-muted-foreground">{course.students || 0} students</div>
                                                </div>
                                                <Progress value={course.performance || 0} className="w-16" />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No courses available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Gradebook Tab */}
                <TabsContent value="gradebook" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Grade Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Grade Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {gradebook.length > 0 ? (
                                        gradebook.slice(0, 5).map((grade, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{grade.student}</div>
                                                    <div className="text-sm text-muted-foreground">{grade.course}</div>
                                                </div>
                                                <Badge variant={grade.grade >= 80 ? 'default' : grade.grade >= 60 ? 'secondary' : 'destructive'}>
                                                    {grade.grade}%
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No grades available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Class Roster */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Class Roster</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {classRoster.length > 0 ? (
                                        classRoster.slice(0, 5).map((student, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{student.name}</div>
                                                    <div className="text-sm text-muted-foreground">{student.email}</div>
                                                </div>
                                                <Badge variant="outline">
                                                    {student.status}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No students in roster</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Profile Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        value={facultyProfile?.name || ''}
                                        onChange={(e) => setFacultyProfile({ ...facultyProfile, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        value={facultyProfile?.email || ''}
                                        onChange={(e) => setFacultyProfile({ ...facultyProfile, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        value={facultyProfile?.phone || ''}
                                        onChange={(e) => setFacultyProfile({ ...facultyProfile, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Bio</Label>
                                    <Textarea
                                        value={facultyProfile?.bio || ''}
                                        onChange={(e) => setFacultyProfile({ ...facultyProfile, bio: e.target.value })}
                                        placeholder="Enter your bio"
                                    />
                                </div>
                                <Button onClick={handleUpdateProfile} className="w-full">
                                    Update Profile
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Office Hours */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Office Hours</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Office Hours Schedule</Label>
                                    <Textarea
                                        value={officeHours.join('\n')}
                                        onChange={(e) => setOfficeHours(e.target.value.split('\n'))}
                                        placeholder="Enter office hours (one per line)"
                                    />
                                </div>
                                <Button onClick={handleUpdateOfficeHours} className="w-full">
                                    Update Office Hours
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Research Profile */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Research Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Research Interests</Label>
                                    <Textarea
                                        value={researchProfile?.interests || ''}
                                        onChange={(e) => setResearchProfile({ ...researchProfile, interests: e.target.value })}
                                        placeholder="Enter research interests"
                                    />
                                </div>
                                <div>
                                    <Label>Publications</Label>
                                    <Textarea
                                        value={researchProfile?.publications?.join('\n') || ''}
                                        onChange={(e) => setResearchProfile({ ...researchProfile, publications: e.target.value.split('\n') })}
                                        placeholder="Enter publications (one per line)"
                                    />
                                </div>
                                <Button onClick={() => {
                                    // Handle research profile update
                                    console.log('Research profile updated:', researchProfile);
                                }} className="w-full">
                                    Update Research Profile
                                </Button>
                            </CardContent>
                        </Card>

                        {/* AI Assistant */}
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Assistant</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Ask AI Assistant</Label>
                                    <Textarea
                                        placeholder="Ask for help with course preparation, grading, etc."
                                    />
                                </div>
                                <Button className="w-full">Get AI Assistance</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FacultyDashboard;
