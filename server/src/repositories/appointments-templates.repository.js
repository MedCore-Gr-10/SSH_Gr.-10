import prisma from "../prisma.js";

/**
 * Repository for managing recurring appointment templates
 * Handles CRUD operations and validation queries
 */
class AppointmentsTemplatesRepository {
  
  /**
   * Create a new appointment template
   * @param {Object} data - Template data
   * @returns {Promise<Object>} Created template
   */
  async create(data) {
    return prisma.appointments_templates.create({ data });
  }

  /**
   * Find template by ID with related data
   * @param {number} id - Template ID
   * @returns {Promise<Object>} Template with relations
   */
  async findById(id) {
    return prisma.appointments_templates.findUnique({
      where: { id },
      include: { 
        staff_hospitals_departments: {
          include: {
            users: {
              include: {
                users_profiles: { include: { profiles: true } },
                roles: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Find all templates for a hospital
   * @param {number} hospitalId - Hospital ID
   * @returns {Promise<Array>} All templates for hospital
   */
  async findByHospital(hospitalId) {
    return prisma.appointments_templates.findMany({
      where: { hospital_id: hospitalId },
      include: {
        staff_hospitals_departments: {
          include: { users: { include: { users_profiles: { include: { profiles: true } }, roles: true } } }
        }
      },
      orderBy: { day_of_week: 'asc' }
    });
  }

  /**
   * Find all templates for a specific doctor/staff
   * @param {string} staffId - Staff UUID
   * @returns {Promise<Array>} All templates for staff
   */
  async findByStaffId(staffId) {
    return prisma.appointments_templates.findMany({
      where: { 
        staff_id: staffId,
        active_appointment_template: true 
      },
      orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }]
    });
  }

  /**
   * Find templates for doctor on specific day
   * @param {string} staffId - Staff UUID
   * @param {string} dayOfWeek - Day name (Monday, Tuesday, etc)
   * @returns {Promise<Array>} Templates for that day
   */
  async findByStaffAndDay(staffId, dayOfWeek) {
    return prisma.appointments_templates.findMany({
      where: {
        staff_id: staffId,
        day_of_week: dayOfWeek,
        active_appointment_template: true
      },
      orderBy: { start_time: 'asc' }
    });
  }

  /**
   * Find templates for doctor and hospital/department
   * @param {string} staffId - Staff UUID
   * @param {number} hospitalId - Hospital ID
   * @param {number} departmentId - Department ID
   * @returns {Promise<Array>} All templates for this assignment
   */
  async findByStaffAssignment(staffId, hospitalId, departmentId) {
    return prisma.appointments_templates.findMany({
      where: {
        staff_id: staffId,
        hospital_id: hospitalId,
        department_id: departmentId,
        active_appointment_template: true
      },
      orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }]
    });
  }

  /**
   * Check for overlapping templates on same day
   * @param {string} staffId - Staff UUID
   * @param {string} dayOfWeek - Day name
   * @param {Object} timeRange - { start_time, end_time }
   * @param {number} excludeId - ID of template to exclude from check
   * @returns {Promise<Array>} Overlapping templates
   */
  async findOverlappingTemplates(staffId, dayOfWeek, timeRange, excludeId = null) {
    return prisma.appointments_templates.findMany({
      where: {
        staff_id: staffId,
        day_of_week: dayOfWeek,
        active_appointment_template: true,
        ...(excludeId && { id: { not: excludeId } }),
        OR: [
          {
            // Template starts before new template ends
            AND: [
              { start_time: { lt: timeRange.end_time } },
              { end_time: { gt: timeRange.start_time } }
            ]
          }
        ]
      }
    });
  }

  /**
   * Get unique day_of_week values for a staff member
   * @param {string} staffId - Staff UUID
   * @returns {Promise<Array>} Unique days
   */
  async getStaffWorkingDays(staffId) {
    return prisma.appointments_templates.findMany({
      where: {
        staff_id: staffId,
        active_appointment_template: true
      },
      distinct: ['day_of_week'],
      select: { day_of_week: true }
    });
  }

  /**
   * Update template
   * @param {number} id - Template ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated template
   */
  async update(id, data) {
    return prisma.appointments_templates.update({ where: { id }, data });
  }

  /**
   * Delete template
   * @param {number} id - Template ID
   * @returns {Promise<Object>} Deleted template
   */
  async delete(id) {
    return prisma.appointments_templates.delete({ where: { id } });
  }

  /**
   * Check if template exists by unique constraint
   * @param {string} staffId - Staff UUID
   * @param {number} hospitalId - Hospital ID
   * @param {number} departmentId - Department ID
   * @param {string} dayOfWeek - Day name
   * @param {DateTime} startTime - Start time
   * @returns {Promise<Object>} Found template or null
   */
  async findByUniqueConstraint(staffId, hospitalId, departmentId, dayOfWeek, startTime) {
    return prisma.appointments_templates.findFirst({
      where: {
        staff_id: staffId,
        hospital_id: hospitalId,
        department_id: departmentId,
        day_of_week: dayOfWeek,
        start_time: startTime
      }
    });
  }

  /**
   * Count active templates for a staff member
   * @param {string} staffId - Staff UUID
   * @returns {Promise<number>} Count of templates
   */
  async countByStaff(staffId) {
    return prisma.appointments_templates.count({
      where: {
        staff_id: staffId,
        active_appointment_template: true
      }
    });
  }
}

export default new AppointmentsTemplatesRepository();
