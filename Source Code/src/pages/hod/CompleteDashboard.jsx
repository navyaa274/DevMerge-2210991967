import React, { useState, useEffect } from 'react';
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
import hodService from '@/services/api/hodService';
import { useAuth } from '@/hooks/useAuth';

const HODDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Dashboard data states
    const [departmentOverview, setDepartmentOverview] = useState(null);
    const [cognitiveLoadData, setCognitiveLoadData] = useState([]);
    const [efficiencyMetrics, setEfficiencyMetrics] = useState(null);
    const [facultyPerformance, setFacultyPerformance] = useState([]);
    const [departmentCourses, setDepartmentCourses] = useState([]);
    const [workloadDistribution, setWorkloadDistribution] = useState([]);
    const [departmentSettings, setDepartmentSettings] = useState(null);
    const [courseApprovals, setCourseApprovals] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [broadcastStats, setBroadcastStats] = useState(null);
    const [gamificationConfig, setGamificationConfig] = useState(null);

    // Form states
    const [newDepartment, setNewDepartment] = useState({ name: '', code: '', description: '' });
    const [newProgram, setNewProgram] = useState({ name: '', code: '', degreeType: 'bachelors', duration: 4 });
    const [newCourse, setNewCourse] = useState({ name: '', code: '', credits: 3, semester: 1, courseType: 'core' });
    const [newSection, setNewSection] = useState({ name: '', semesterId: '', capacity: 60 });
    const [facultyAssignment, setFacultyAssignment] = useState({ courseId: '', facultyId: '', action: 'assign' });
    const [broadcastMessage, setBroadcastMessage] = useState({ message: '', severity: 'info', target: 'all' });

    // Filter states
    const [courseFilters, setCourseFilters] = useState({ page: 1, limit: 20, search: '', courseType: '', approvalStatus: '' });
    const [programFilters, setProgramFilters] = useState({ page: 1, limit: 20, search: '', degreeType: '', isActive: 'true' });
    const [sectionFilters, setSectionFilters] = useState({ page: 1, limit: 20, search: '', hasTeacher: '' });

    useEffect(() => {
        if (user?.department) {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load all dashboard data in parallel
            const [
                overviewRes,
                cogLoadRes,
                efficiencyRes,
                facultyPerfRes,
                coursesRes,
                workloadRes,
                settingsRes,
                approvalsRes,
                auditRes,
                broadcastRes,
                gamificationRes
            ] = await Promise.allSettled([
                hodService.getDepartmentOverview(user.department),
                hodService.getCognitiveLoadData(user.department),
                hodService.getEfficiencyMetrics(user.department),
                hodService.getFacultyPerformance(user.department),
                hodService.getDepartmentCourses(user.department),
                hodService.getWorkloadDistribution(user.department),
                hodService.getDepartmentSettings(user.department),
                hodService.getCourseApprovals({ departmentId: user.department }),
                hodService.getAuditLogs({ limit: 10 }),
                hodService.getBroadcastStats(),
                hodService.getGamificationConfig()
            ]);

            // Set data if successful
            if (overviewRes.status === 'fulfilled') setDepartmentOverview(overviewRes.value);
            if (cogLoadRes.status === 'fulfilled') setCognitiveLoadData(cogLoadRes.value.data || []);
            if (efficiencyRes.status === 'fulfilled') setEfficiencyMetrics(efficiencyRes.value);
            if (facultyPerfRes.status === 'fulfilled') setFacultyPerformance(facultyPerfRes.value.data || []);
            if (coursesRes.status === 'fulfilled') setDepartmentCourses(coursesRes.value.data?.courses || []);
            if (workloadRes.status === 'fulfilled') setWorkloadDistribution(workloadRes.value.data?.workloadDistribution || []);
            if (settingsRes.status === 'fulfilled') setDepartmentSettings(settingsRes.value.data?.department);
            if (approvalsRes.status === 'fulfilled') setCourseApprovals(approvalsRes.value.data?.courses || []);
            if (auditRes.status === 'fulfilled') setAuditLogs(auditRes.value.data?.logs || []);
            if (broadcastRes.status === 'fulfilled') setBroadcastStats(broadcastRes.value);
            if (gamificationRes.status === 'fulfilled') setGamificationConfig(gamificationRes.value);

        } catch (err) {
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDepartment = async () => {
        try {
            await hodService.createDepartment(newDepartment);
            setNewDepartment({ name: '', code: '', description: '' });
            await loadDashboardData();
        } catch (err) {
            setError(err.message || 'Failed to create department');
        }
    };

    const handleCreateProgram = async () => {
        try {
            await hodService.createProgram({ ...newProgram, department: user.department });
            setNewProgram({ name: '', code: '', degreeType: 'bachelors', duration: 4 });
            await loadDashboardData();
        } catch (err) {
            setError(err.message || 'Failed to create program');
        }
    };

    const handleCreateCourse = async () => {
        try {
            await hodService.createCourse({ 
                ...newCourse, 
                department: user.department,
                program: departmentOverview?.programs?.[0]?._id 
            });
            setNewCourse({ name: '', code: '', credits: 3, semester: 1, courseType: 'core' });
            await loadDashboardData();
        } catch (err) {
            setError(err.message || 'Failed to create course');
        }
    };

    const handleCreateSection = async () => {
        try {
            await hodService.createSection(newSection);
            setNewSection({ name: '', semesterId: '', capacity: 60 });
            await loadDashboardData();
        } catch (err) {
            setError(err.message || 'Failed to create section');
        }
    };

    const handleFacultyAssignment = async () => {
        try {
            await hodService.assignFaculty(facultyAssignment);
            setFacultyAssignment({ courseId: '', facultyId: '', action: 'assign' });
            await loadDashboardData();
        } catch (err) {
            setError(err.message || 'Failed to assign faculty');
        }
    };

    const handleSendBroadcast = async () => {
        try {
            await hodService.sendBroadcast(broadcastMessage);
            setBroadcastMessage({ message: '', severity: 'info', target: 'all' });
            await loadDashboardData();
        } catch (err) {
            setError(err.message || 'Failed to send broadcast');
        }
    };

    const handleUpdateGamification = async (multiplier) => {
        try {
            await hodService.updateGamificationMultiplier({ globalXpMultiplier: multiplier });
            await loadDashboardData();
        } catch (err) {
            setError(err.message || 'Failed to update gamification settings');
        }
    };

    const handleCourseApproval = async (courseId, action) => {
        try {
            // This would call an approval endpoint
            console.log(`Course ${courseId} ${action} by HOD`);
            await loadDashboardData();
        } catch (err) {
            setError(err.message || 'Failed to process course approval');
        }
    };

    const refreshData = () => {
        loadDashboardData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-lg font-medium">Loading HOD Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">HOD Dashboard</h1>
                <div className="flex gap-2">
                    <Button onClick={refreshData} variant="outline" size="sm">
                        Refresh Data
                    </Button>
                    <Badge variant="secondary">
                        Department: {user?.department?.name || 'N/A'}
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
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                    <TabsTrigger value="programs">Programs</TabsTrigger>
                    <TabsTrigger value="courses">Courses</TabsTrigger>
                    <TabsTrigger value="sections">Sections</TabsTrigger>
                    <TabsTrigger value="faculty">Faculty</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Department Overview Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Department Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {departmentOverview ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Total Courses</span>
                                            <Badge>{departmentOverview.totalCourses || 0}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Programs</span>
                                            <Badge>{departmentOverview.totalPrograms || 0}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Active Students</span>
                                            <Badge>{departmentOverview.totalStudents || 0}</Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Loading overview...</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Cognitive Load Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cognitive Load Indicators</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {cognitiveLoadData.length > 0 ? (
                                    <div className="space-y-2">
                                        {cognitiveLoadData.slice(0, 3).map((item, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span className="text-sm">{item.course || `Course ${index + 1}`}</span>
                                                <Progress value={item.riskScore || 0} className="w-20" />
                                                <Badge variant={item.riskScore > 70 ? "destructive" : "secondary"}>
                                                    {item.riskScore > 70 ? 'High Risk' : item.riskScore > 40 ? 'Medium' : 'Low'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No cognitive load data available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Efficiency Metrics Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Operational Efficiency</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {efficiencyMetrics ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Avg Response Time</span>
                                            <span>{efficiencyMetrics.avgResponseTime || 'N/A'}ms</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Completion Rate</span>
                                            <span>{efficiencyMetrics.completionRate || 'N/A'}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Efficiency Score</span>
                                            <Badge variant={efficiencyMetrics.efficiencyScore > 80 ? "default" : "secondary"}>
                                                {efficiencyMetrics.efficiencyScore || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Loading efficiency metrics...</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Faculty Performance Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Faculty Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {facultyPerformance.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Faculty</TableHead>
                                                <TableHead>Performance</TableHead>
                                                <TableHead>Workload</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {facultyPerformance.slice(0, 3).map((faculty, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{faculty.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={faculty.performance > 80 ? "default" : "secondary"}>
                                                            {faculty.performance}%
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{faculty.workload}h</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-muted-foreground">No faculty performance data</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={() => setActiveTab('courses')} className="w-full">
                                    Manage Course Approvals ({courseApprovals.filter(c => c.approvalStatus === 'pending_approval').length})
                                </Button>
                                <Button onClick={() => setActiveTab('faculty')} variant="outline" className="w-full">
                                    Assign Faculty
                                </Button>
                                <Button onClick={() => setActiveTab('broadcast')} variant="outline" className="w-full">
                                    Send Broadcast
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Departments Tab */}
                <TabsContent value="departments" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Department Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Department Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {departmentSettings && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Department Name</Label>
                                            <Input value={departmentSettings.name} readOnly />
                                        </div>
                                        <div>
                                            <Label>Department Code</Label>
                                            <Input value={departmentSettings.code} readOnly />
                                        </div>
                                        <div>
                                            <Label>HOD</Label>
                                            <Input value={departmentSettings.hod?.name || 'Not Assigned'} readOnly />
                                        </div>
                                        <div>
                                            <Label>Contact Email</Label>
                                            <Input value={departmentSettings.contactInfo?.email || ''} readOnly />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Create New Department */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Department</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Department Name</Label>
                                    <Input
                                        value={newDepartment.name}
                                        onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                                        placeholder="Enter department name"
                                    />
                                </div>
                                <div>
                                    <Label>Department Code</Label>
                                    <Input
                                        value={newDepartment.code}
                                        onChange={(e) => setNewDepartment({ ...newDepartment, code: e.target.value })}
                                        placeholder="Enter department code"
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Input
                                        value={newDepartment.description}
                                        onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                                        placeholder="Enter department description"
                                    />
                                </div>
                                <Button onClick={handleCreateDepartment} className="w-full">
                                    Create Department
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Programs Tab */}
                <TabsContent value="programs" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Programs List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Programs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {departmentOverview?.programs?.map((program, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{program.name}</div>
                                                <div className="text-sm text-muted-foreground">{program.code}</div>
                                            </div>
                                            <Badge variant={program.isActive ? "default" : "secondary"}>
                                                {program.degreeType}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Create New Program */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Program</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Program Name</Label>
                                    <Input
                                        value={newProgram.name}
                                        onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                                        placeholder="Enter program name"
                                    />
                                </div>
                                <div>
                                    <Label>Program Code</Label>
                                    <Input
                                        value={newProgram.code}
                                        onChange={(e) => setNewProgram({ ...newProgram, code: e.target.value })}
                                        placeholder="Enter program code"
                                    />
                                </div>
                                <div>
                                    <Label>Degree Type</Label>
                                    <Select value={newProgram.degreeType} onValueChange={(value) => setNewProgram({ ...newProgram, degreeType: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bachelors">Bachelors</SelectItem>
                                            <SelectItem value="masters">Masters</SelectItem>
                                            <SelectItem value="doctorate">Doctorate</SelectItem>
                                            <SelectItem value="diploma">Diploma</SelectItem>
                                            <SelectItem value="certificate">Certificate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleCreateProgram} className="w-full">
                                    Create Program
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Course Approvals */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Approvals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {courseApprovals.map((course, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{course.name}</div>
                                                <div className="text-sm text-muted-foreground">{course.code}</div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <Badge variant={
                                                    course.approvalStatus === 'approved' ? 'default' :
                                                    course.approvalStatus === 'rejected' ? 'destructive' :
                                                    course.approvalStatus === 'pending_approval' ? 'secondary' : 'outline'
                                                }>
                                                    {course.approvalStatus?.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                                <div className="space-x-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCourseApproval(course.id, 'approve')}
                                                        disabled={course.approvalStatus === 'approved'}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCourseApproval(course.id, 'reject')}
                                                        disabled={course.approvalStatus === 'rejected'}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Create New Course */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Course</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Course Name</Label>
                                    <Input
                                        value={newCourse.name}
                                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                        placeholder="Enter course name"
                                    />
                                </div>
                                <div>
                                    <Label>Course Code</Label>
                                    <Input
                                        value={newCourse.code}
                                        onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                                        placeholder="Enter course code"
                                    />
                                </div>
                                <div>
                                    <Label>Credits</Label>
                                    <Input
                                        type="number"
                                        value={newCourse.credits}
                                        onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                                        placeholder="Enter credits"
                                    />
                                </div>
                                <div>
                                    <Label>Semester</Label>
                                    <Input
                                        type="number"
                                        value={newCourse.semester}
                                        onChange={(e) => setNewCourse({ ...newCourse, semester: parseInt(e.target.value) })}
                                        placeholder="Enter semester"
                                    />
                                </div>
                                <div>
                                    <Label>Course Type</Label>
                                    <Select value={newCourse.courseType} onValueChange={(value) => setNewCourse({ ...newCourse, courseType: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="core">Core</SelectItem>
                                            <SelectItem value="elective">Elective</SelectItem>
                                            <SelectItem value="lab">Lab</SelectItem>
                                            <SelectItem value="seminar">Seminar</SelectItem>
                                            <SelectItem value="project">Project</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleCreateCourse} className="w-full">
                                    Create Course
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Sections Tab */}
                <TabsContent value="sections" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sections List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sections</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {workloadDistribution.map((section, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{section.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Capacity: {section.capacity} | Enrolled: {section.enrolled}
                                                </div>
                                            </div>
                                            <Badge variant={section.hasTeacher ? "default" : "secondary"}>
                                                {section.hasTeacher ? 'Has Teacher' : 'No Teacher'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Create New Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Section</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Section Name</Label>
                                    <Input
                                        value={newSection.name}
                                        onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                                        placeholder="Enter section name"
                                    />
                                </div>
                                <div>
                                    <Label>Semester ID</Label>
                                    <Input
                                        value={newSection.semesterId}
                                        onChange={(e) => setNewSection({ ...newSection, semesterId: e.target.value })}
                                        placeholder="Enter semester ID"
                                    />
                                </div>
                                <div>
                                    <Label>Capacity</Label>
                                    <Input
                                        type="number"
                                        value={newSection.capacity}
                                        onChange={(e) => setNewSection({ ...newSection, capacity: parseInt(e.target.value) })}
                                        placeholder="Enter capacity"
                                    />
                                </div>
                                <Button onClick={handleCreateSection} className="w-full">
                                    Create Section
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Faculty Tab */}
                <TabsContent value="faculty" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Faculty Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Faculty Assignment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Course</Label>
                                    <Select value={facultyAssignment.courseId} onValueChange={(value) => setFacultyAssignment({ ...facultyAssignment, courseId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departmentCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name} ({course.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Faculty</Label>
                                    <Select value={facultyAssignment.facultyId} onValueChange={(value) => setFacultyAssignment({ ...facultyAssignment, facultyId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select faculty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {facultyPerformance.map((faculty) => (
                                                <SelectItem key={faculty.id} value={faculty.id}>
                                                    {faculty.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Action</Label>
                                    <Select value={facultyAssignment.action} onValueChange={(value) => setFacultyAssignment({ ...facultyAssignment, action: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="assign">Assign</SelectItem>
                                            <SelectItem value="unassign">Unassign</SelectItem>
                                            <SelectItem value="reassign">Reassign</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleFacultyAssignment} className="w-full">
                                    {facultyAssignment.action === 'assign' ? 'Assign Faculty' : 
                                     facultyAssignment.action === 'unassign' ? 'Unassign Faculty' : 'Reassign Faculty'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Broadcast System */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Send Broadcast</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Message</Label>
                                    <Input
                                        value={broadcastMessage.message}
                                        onChange={(e) => setBroadcastMessage({ ...broadcastMessage, message: e.target.value })}
                                        placeholder="Enter broadcast message"
                                    />
                                </div>
                                <div>
                                    <Label>Severity</Label>
                                    <Select value={broadcastMessage.severity} onValueChange={(value) => setBroadcastMessage({ ...broadcastMessage, severity: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="info">Info</SelectItem>
                                            <SelectItem value="warning">Warning</SelectItem>
                                            <SelectItem value="error">Error</SelectItem>
                                            <SelectItem value="success">Success</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Target</Label>
                                    <Select value={broadcastMessage.target} onValueChange={(value) => setBroadcastMessage({ ...broadcastMessage, target: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Users</SelectItem>
                                            <SelectItem value="faculty">Faculty Only</SelectItem>
                                            <SelectItem value="students">Students Only</SelectItem>
                                            <SelectItem value="department">Department Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleSendBroadcast} className="w-full">
                                    Send Broadcast
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default HODDashboard;
