/**
 * Difficulty Engine (Rule-Based)
 * Logic to determine target difficulty and Bloom's layers based on student state
 */

exports.getDifficultySettings = (studentLevel, weaknessSeverity = 'Low') => {
    const level = studentLevel || 'Average';

    // 1. Difficulty Mapping Matrix
    const matrix = {
        'Weak': {
            'High': { target: 'Easy', distribution: { easy: 0.7, medium: 0.2, hard: 0.1 }, bloomRange: ['Remember', 'Understand'] },
            'Medium': { target: 'Easy/Medium', distribution: { easy: 0.5, medium: 0.4, hard: 0.1 }, bloomRange: ['Remember', 'Understand', 'Apply'] },
            'Low': { target: 'Medium', distribution: { easy: 0.3, medium: 0.6, hard: 0.1 }, bloomRange: ['Understand', 'Apply'] }
        },
        'Average': {
            'High': { target: 'Medium', distribution: { easy: 0.3, medium: 0.6, hard: 0.1 }, bloomRange: ['Understand', 'Apply'] },
            'Medium': { target: 'Medium', distribution: { easy: 0.2, medium: 0.6, hard: 0.2 }, bloomRange: ['Apply', 'Analyze'] },
            'Low': { target: 'Medium/Hard', distribution: { easy: 0.1, medium: 0.5, hard: 0.4 }, bloomRange: ['Apply', 'Analyze', 'Evaluate'] }
        },
        'Advanced': {
            'High': { target: 'Medium/Hard', distribution: { easy: 0.1, medium: 0.5, hard: 0.4 }, bloomRange: ['Apply', 'Analyze'] },
            'Medium': { target: 'Hard', distribution: { easy: 0.1, medium: 0.3, hard: 0.6 }, bloomRange: ['Analyze', 'Evaluate'] },
            'Low': { target: 'Hard/Expert', distribution: { easy: 0.0, medium: 0.2, hard: 0.8 }, bloomRange: ['Evaluate', 'Create'] }
        }
    };

    return matrix[level][weaknessSeverity] || matrix['Average']['Medium'];
};
