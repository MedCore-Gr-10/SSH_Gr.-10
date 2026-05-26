import cron from 'node-cron';
import slotGeneratorService from './doctor-services/slotGenerator.service.js';
import prisma from '../prisma.js';
import logsRepository from '../repositories/logs.repository.js';

let cronJobInstances = [];

/**
 * Generate slots for a single doctor
 * @param {string} doctorId - Doctor's UUID
 * @returns {Promise<Object>} Result of generation
 */
async function generateSlotsForDoctor(doctorId) {
  try {
    const result = await slotGeneratorService.generateWeeklySlots(
      doctorId,
      new Date(),
      null // No user ID for automated jobs
    );
    return { success: true, doctorId, ...result };
  } catch (error) {
    return { success: false, doctorId, error: error.message };
  }
}

/**
 * Generate slots for all active doctors with templates
 * @returns {Promise<Object>} Summary of generation
 */
async function generateSlotsForAllDoctors() {
  try {
    // Find all unique staff members with active templates
    const templates = await prisma.appointments_templates.findMany({
      where: { active_appointment_template: true },
      distinct: ['staff_id'],
      select: { staff_id: true }
    });

    const doctorIds = templates.map(t => t.staff_id).filter(Boolean);

    if (doctorIds.length === 0) {
      console.log('[CronJob] No doctors with active templates found');
      return { success: true, total_doctors: 0, results: [] };
    }

    console.log(`[CronJob] Starting slot generation for ${doctorIds.length} doctors`);

    const results = await Promise.allSettled(
      doctorIds.map(doctorId => generateSlotsForDoctor(doctorId))
    );

    const summary = {
      success: true,
      total_doctors: doctorIds.length,
      successful: 0,
      failed: 0,
      total_slots_created: 0,
      total_duplicates: 0,
      results: []
    };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const data = result.value;
        summary.results.push(data);

        if (data.success) {
          summary.successful++;
          summary.total_slots_created += data.created || 0;
          summary.total_duplicates += data.duplicates_skipped || 0;
        } else {
          summary.failed++;
        }
      } else {
        summary.results.push({
          success: false,
          doctorId: doctorIds[index],
          error: result.reason?.message || 'Unknown error'
        });
        summary.failed++;
      }
    });

    console.log('[CronJob] Slot generation completed:', summary);
    return summary;
  } catch (error) {
    console.error('[CronJob] Error in slot generation:', error);
    return { success: false, error: error.message };
  }
}

async function initializeCronJobs() {
  console.log('[CronJob] Initializing scheduled tasks...');

  const weeklySlotGenerationJob = cron.schedule('0 0 * * 1', async () => {
    console.log('[CronJob] Running weekly slot generation...');
    const startTime = Date.now();

    try {
      const result = await generateSlotsForAllDoctors();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[CronJob] Weekly slot generation completed in ${duration}s`);
    } catch (error) {
      console.error('[CronJob] Weekly slot generation failed:', error);
    }
  });

  cronJobInstances.push(weeklySlotGenerationJob);

  console.log('[CronJob] ✓ Scheduled: Weekly slot generation (Every Monday 00:00 UTC)');


  console.log('[CronJob] All scheduled tasks initialized');
}

function stopCronJobs() {
  console.log('[CronJob] Stopping all scheduled tasks...');
  cronJobInstances.forEach(job => {
    job.stop();
  });
  cronJobInstances = [];
  console.log('[CronJob] All scheduled tasks stopped');
}

async function manualTriggerSlotGeneration(hospitalId = null) {
  console.log('[CronJob] Manual trigger: Starting slot generation...');
  
  try {
    const result = await generateSlotsForAllDoctors();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Check cron job health
 * @returns {Object} Health status
 */
function getJobStatus() {
  return {
    jobs_count: cronJobInstances.length,
    jobs: cronJobInstances.map((job, index) => ({
      id: index,
      running: !job.stopped
    }))
  };
}

export {
  initializeCronJobs,
  stopCronJobs,
  manualTriggerSlotGeneration,
  getJobStatus,
  generateSlotsForAllDoctors,
  generateSlotsForDoctor
};
