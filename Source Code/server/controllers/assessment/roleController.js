const Role = require('../../models/assessment/roles');
const Permission = require('../../models/assessment/permissions');
const RolePermission = require('../../models/assessment/rolePermissions');
const UserRole = require('../../models/assessment/userRoles');

class RoleController {
  // Create a new role
  async createRole(req, res) {
    try {
      const userId = req.user.id;
      const { name, display_name, description, level, color, icon, is_system_role } = req.body;

      // Check permissions (only super_admin can create system roles)
      if (is_system_role && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super administrators can create system roles'
        });
      }

      const allowedRoles = ['admin', 'super_admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can create roles'
        });
      }

      const role = new Role({
        name,
        display_name,
        description,
        level: level || 1,
        color: color || '#6B7280',
        icon,
        is_system_role: is_system_role || false,
        created_by: userId
      });

      const savedRole = await role.save();

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: savedRole
      });
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create role',
        error: error.message
      });
    }
  }

  // Get all roles
  async getRoles(req, res) {
    try {
      const { include_inactive = false } = req.query;

      let filter = {};
      if (!include_inactive) {
        filter.is_active = true;
      }

      const roles = await Role.find(filter)
        .populate('created_by', 'first_name last_name username')
        .sort({ level: 1, name: 1 });

      res.status(200).json({
        success: true,
        data: roles,
        count: roles.length
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch roles',
        error: error.message
      });
    }
  }

  // Get a specific role with permissions
  async getRole(req, res) {
    try {
      const { roleId } = req.params;

      const role = await Role.findById(roleId)
        .populate('created_by', 'first_name last_name username');

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Get role permissions
      const rolePermissions = await RolePermission.find({
        role_id: roleId,
        is_active: true
      }).populate('permission_id');

      res.status(200).json({
        success: true,
        data: {
          role: role,
          permissions: rolePermissions.map(rp => rp.permission_id)
        }
      });
    } catch (error) {
      console.error('Error fetching role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role',
        error: error.message
      });
    }
  }

  // Update a role
  async updateRole(req, res) {
    try {
      const { roleId } = req.params;
      const updateData = req.body;

      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Check permissions
      const allowedRoles = ['admin', 'super_admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can update roles'
        });
      }

      // Prevent modification of system roles unless super_admin
      if (role.is_system_role && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'System roles can only be modified by super administrators'
        });
      }

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.created_at;
      delete updateData.created_by;

      updateData.updated_at = Date.now();

      const updatedRole = await Role.findByIdAndUpdate(
        roleId,
        updateData,
        { new: true, runValidators: true }
      ).populate('created_by', 'first_name last_name username');

      res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        data: updatedRole
      });
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role',
        error: error.message
      });
    }
  }

  // Delete a role
  async deleteRole(req, res) {
    try {
      const { roleId } = req.params;

      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Check permissions
      const allowedRoles = ['admin', 'super_admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can delete roles'
        });
      }

      // Prevent deletion of system roles
      if (role.is_system_role) {
        return res.status(403).json({
          success: false,
          message: 'System roles cannot be deleted'
        });
      }

      // Check if role is assigned to users
      const userCount = await UserRole.countDocuments({
        role_id: roleId,
        is_active: true
      });

      if (userCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete role that is assigned to ${userCount} user(s). Remove all assignments first.`
        });
      }

      // Soft delete by marking as inactive
      await Role.findByIdAndUpdate(roleId, {
        is_active: false,
        updated_at: Date.now()
      });

      res.status(200).json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete role',
        error: error.message
      });
    }
  }

  // Assign role to user
  async assignRole(req, res) {
    try {
      const { userId, roleId } = req.params;
      const { scope_conditions, notes } = req.body;
      const assignedBy = req.user.id;

      // Check permissions
      const allowedRoles = ['admin', 'super_admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can assign roles'
        });
      }

      // Verify role exists and is active
      const role = await Role.findOne({ _id: roleId, is_active: true });
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found or inactive'
        });
      }

      // Check if user already has this role
      const existingRole = await UserRole.findOne({
        user_id: userId,
        role_id: roleId,
        is_active: true
      });

      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'User already has this role'
        });
      }

      const userRole = new UserRole({
        user_id: userId,
        role_id: roleId,
        scope_conditions: scope_conditions || {},
        assigned_by: assignedBy,
        notes
      });

      const savedUserRole = await userRole.save();
      await savedUserRole.populate([
        { path: 'user_id', select: 'first_name last_name username email' },
        { path: 'role_id', select: 'name display_name level' },
        { path: 'assigned_by', select: 'first_name last_name username' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Role assigned successfully',
        data: savedUserRole
      });
    } catch (error) {
      console.error('Error assigning role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign role',
        error: error.message
      });
    }
  }

  // Remove role from user
  async removeRole(req, res) {
    try {
      const { userId, roleId } = req.params;
      const removedBy = req.user.id;

      // Check permissions
      const allowedRoles = ['admin', 'super_admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can remove roles'
        });
      }

      const userRole = await UserRole.findOne({
        user_id: userId,
        role_id: roleId,
        is_active: true
      });

      if (!userRole) {
        return res.status(404).json({
          success: false,
          message: 'User does not have this role'
        });
      }

      // Soft delete by marking as inactive
      await UserRole.findByIdAndUpdate(userRole._id, {
        is_active: false,
        updated_at: Date.now()
      });

      res.status(200).json({
        success: true,
        message: 'Role removed successfully'
      });
    } catch (error) {
      console.error('Error removing role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove role',
        error: error.message
      });
    }
  }

  // Get user roles
  async getUserRoles(req, res) {
    try {
      const { userId } = req.params;

      // Check permissions (users can view their own roles, admins can view any)
      if (req.user.id !== userId && !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const userRoles = await UserRole.find({
        user_id: userId,
        is_active: true
      }).populate([
        { path: 'role_id', select: 'name display_name level color icon' },
        { path: 'assigned_by', select: 'first_name last_name username' }
      ]).sort({ assigned_at: -1 });

      res.status(200).json({
        success: true,
        data: userRoles
      });
    } catch (error) {
      console.error('Error fetching user roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user roles',
        error: error.message
      });
    }
  }

  // Get role permissions
  async getRolePermissions(req, res) {
    try {
      const { roleId } = req.params;

      const rolePermissions = await RolePermission.find({
        role_id: roleId,
        is_active: true
      }).populate('permission_id');

      res.status(200).json({
        success: true,
        data: rolePermissions.map(rp => rp.permission_id)
      });
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role permissions',
        error: error.message
      });
    }
  }

  // Update role permissions
  async updateRolePermissions(req, res) {
    try {
      const { roleId } = req.params;
      const { permissionIds } = req.body;
      const updatedBy = req.user.id;

      // Check permissions
      const allowedRoles = ['admin', 'super_admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can update role permissions'
        });
      }

      // Verify role exists
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Remove existing permissions
      await RolePermission.updateMany(
        { role_id: roleId },
        { is_active: false, updated_at: Date.now() }
      );

      // Add new permissions
      const permissionInserts = permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId,
        granted_by: updatedBy
      }));

      await RolePermission.insertMany(permissionInserts);

      res.status(200).json({
        success: true,
        message: 'Role permissions updated successfully'
      });
    } catch (error) {
      console.error('Error updating role permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role permissions',
        error: error.message
      });
    }
  }

  // Get all permissions
  async getPermissions(req, res) {
    try {
      const permissions = await Permission.find({ is_active: true })
        .sort({ category: 1, resource: 1, action: 1 });

      res.status(200).json({
        success: true,
        data: permissions
      });
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch permissions',
        error: error.message
      });
    }
  }

  // Create a new permission
  async createPermission(req, res) {
    try {
      const userId = req.user.id;
      const { name, display_name, description, resource, action, scope, category } = req.body;

      // Check permissions (only super_admin can create system permissions)
      if (!['super_admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only super administrators can create permissions'
        });
      }

      const permission = new Permission({
        name,
        display_name,
        description,
        resource,
        action,
        scope: scope || 'global',
        category: category || 'system',
        created_by: userId
      });

      const savedPermission = await permission.save();

      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: savedPermission
      });
    } catch (error) {
      console.error('Error creating permission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create permission',
        error: error.message
      });
    }
  }
}

module.exports = new RoleController();
