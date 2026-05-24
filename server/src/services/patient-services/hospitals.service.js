import patientHospitalsRepository from "../../repositories/patient-hospitals.repository.js";

class PatientHospitalsService {
  formatHospital(hospital, selectedHospitalIds = []) {
    return {
      id: hospital.id,
      name: hospital.hospital_name || "",
      address: hospital.hospital_address || "",
      email: hospital.email || "",
      selected: selectedHospitalIds.includes(hospital.id),
    };
  }

  normalizeHospitalIds(hospitalIds) {
    if (!Array.isArray(hospitalIds)) {
      throw new Error("hospitalIds must be an array");
    }

    return [...new Set(hospitalIds.map((id) => Number(id)).filter(Number.isInteger))];
  }

  async listHospitals(patientId) {
    const [hospitals, patientHospitals] = await Promise.all([
      patientHospitalsRepository.findAllHospitals(),
      patientHospitalsRepository.findPatientHospitals(patientId),
    ]);

    const selectedHospitalIds = patientHospitals.map((entry) => entry.hospital_id);

    return {
      hospitals: hospitals.map((hospital) => this.formatHospital(hospital, selectedHospitalIds)),
      selectedHospitalIds,
    };
  }

  async updateSelectedHospitals(patientId, data) {
    const hospitalIds = this.normalizeHospitalIds(data.hospitalIds);

    if (hospitalIds.length) {
      const existingHospitals = await patientHospitalsRepository.findHospitalsByIds(hospitalIds);
      if (existingHospitals.length !== hospitalIds.length) {
        throw new Error("One or more selected hospitals do not exist");
      }
    }

    const patientHospitals = await patientHospitalsRepository.replacePatientHospitals(patientId, hospitalIds);
    const selectedHospitalIds = patientHospitals.map((entry) => entry.hospital_id);

    return {
      selectedHospitalIds,
    };
  }
}

export default new PatientHospitalsService();
