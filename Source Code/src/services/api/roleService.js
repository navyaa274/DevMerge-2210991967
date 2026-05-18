import apiClient from './apiClient';

class RoleService {
  // Create a new role
  async createRole(roleData) {
    try {
      const response = await apiClient.post('/assessment/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  // Get all roles
  async getRoles(params = {}) {
    try {
      const response = await apiClient.get('/assessment/roles', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  // Get a specific role with permissions
  async getRole(roleId) {
    try {
      const response = await apiClient.get(`/assessment/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  // Update a role
  async updateRole(roleId, updateData) {
    try {
      const response = await apiClient.put(`/assessment/roles/${roleId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  // Delete a role
  async deleteRole(roleId) {
    try {
      const response = await apiClient.delete(`/assessment/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  // Assign role to user
  async assignRole(userId, roleId, scopeConditions = {}) {
    try {
      const response = await apiClient.post(`/assessment/users/${userId}/roles/${roleId}`, {
        scope_conditions: scopeConditions
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  // Remove role from user
  async removeRole(userId, roleId) {
    try {
      const response = await apiClient.delete(`/assessment/users/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  }

  // Get user roles
  async getUserRoles(userId) {
    try {
      const response = await apiClient.get(`/assessment/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      throw error;
    }
  }

  // Update role permissions
  async updateRolePermissions(roleId, permissionIds) {
    try {
      const response = await apiClient.put(`/assessment/roles/${roleId}/permissions`, {
        permissionIds
      });
      return response.data;
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  }

  // Get role permissions
  async getRolePermissions(roleId) {
    try {
      const response = await apiClient.get(`/assessment/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
  }

  // Get all permissions
  async getPermissions() {
    try {
      const response = await apiClient.get('/assessment/permissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }

  // Create a new permission
  async createPermission(permissionData) {
    try {
      const response = await apiClient.post('/assessment/permissions', permissionData);
      return response.data;
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }

  // Check if user has permission
  async checkPermission(permission, resource = null, scope = null) {
    try {
      const userRoles = await this.getUserRoles(); // Get current user's roles
      if (!userRoles.data || userRoles.data.length === 0) {
        return false;
      }

      // Get permissions for each role
      const rolePermissions = await Promise.all(
        userRoles.data.map(role => this.getRolePermissions(role.role_id._id))
      );

      // Check if any role has the required permission
      for (const rolePerms of rolePermissions) {
        if (rolePerms.data && rolePerms.data.some(perm =>
          perm.name === permission ||
          (perm.resource === resource && perm.action === permission)
        )) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Get user's effective permissions
  async getEffectivePermissions() {
    try {
      const userRoles = await this.getUserRoles();
      if (!userRoles.data || userRoles.data.length === 0) {
        return { data: [] };
      }

      const allPermissions = new Set();

      // Collect permissions from all roles
      for (const userRole of userRoles.data) {
        const rolePerms = await this.getRolePermissions(userRole.role_id._id);
        if (rolePerms.data) {
          rolePerms.data.forEach(perm => allPermissions.add(perm));
        }
      }

      return { data: Array.from(allPermissions) };
    } catch (error) {
      console.error('Error getting effective permissions:', error);
      throw error;
    }
  }
}

export default new RoleService();
