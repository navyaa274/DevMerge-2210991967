import apiClient from './apiClient';

/**
 * Standalone Code Editor Service
 * Handles code execution, file management, and session persistence
 */
const editorService = {
    // Create or get editor session
    createSession: async (roomId) => {
        try {
            const response = await apiClient.post('/code-editor/session', { roomId });
            return response.data;
        } catch (error) {
            console.error('Failed to create editor session:', error?.message);
            throw error;
        }
    },

    // Get existing session
    getSession: async (roomId) => {
        try {
            const response = await apiClient.get(`/code-editor/session/${roomId}`);
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch editor session:', error?.message);
            return { success: true, data: null };
        }
    },

    // Execute code
    executeCode: async (code, language, roomId) => {
        try {
            const response = await apiClient.post('/code-editor/execute', {
                code,
                language,
                roomId
            });
            return response.data;
        } catch (error) {
            console.error('Code execution error:', error?.message);
            throw error;
        }
    },

    // Save file
    saveFile: async (roomId, fileName, content, language) => {
        try {
            const response = await apiClient.post('/code-editor/save', {
                roomId,
                fileName,
                content,
                language
            });
            return response.data;
        } catch (error) {
            console.error('Save file error:', error?.message);
            throw error;
        }
    },

    // Update file
    updateFile: async (roomId, fileName, content, language) => {
        try {
            const response = await apiClient.put('/code-editor/file', {
                roomId,
                fileName,
                content,
                language
            });
            return response.data;
        } catch (error) {
            console.error('Update file error:', error?.message);
            throw error;
        }
    },

    // Delete file
    deleteFile: async (roomId, fileName) => {
        try {
            const response = await apiClient.delete('/code-editor/file', {
                data: { roomId, fileName }
            });
            return response.data;
        } catch (error) {
            console.error('Delete file error:', error?.message);
            throw error;
        }
    },

    // Get execution history
    getHistory: async (roomId) => {
        try {
            const response = await apiClient.get(`/code-editor/history/${roomId}`);
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch execution history:', error?.message);
            return { success: true, data: [] };
        }
    }
};

export default editorService;
