import insuranceRepository from "../../repositories/insurance.repository.js";
import profileRepository from "../../repositories/profile.repository.js";

class PatientInsuranceService {
  async getPatientProfile(userId) {
    const profileLink = await profileRepository.findUserProfile(userId);
    if (!profileLink?.profiles) {
      throw new Error("Patient profile not found");
    }
    return profileLink.profiles;
  }

  formatDate(value) {
    if (!value) return "";
    return value.toISOString().slice(0, 10);
  }

  isExpired(endDate) {
    if (!endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const policyEndDate = new Date(endDate);
    policyEndDate.setHours(0, 0, 0, 0);

    return policyEndDate < today;
  }

  formatInsurance(insurance) {
    if (!insurance) return null;

    return {
      id: insurance.id,
      companyName: insurance.provider || "",
      supportNumber: insurance.customer_support_number || "",
      email: insurance.insurance_company_email || "",
      policyNumber: insurance.policy_number || "",
      coveragePercent: insurance.coverage_percent ?? "",
      startDate: this.formatDate(insurance.start_date),
      endDate: this.formatDate(insurance.end_date),
      isExpired: this.isExpired(insurance.end_date),
    };
  }

  validateInsurance(data) {
    const companyName = data.companyName?.trim();
    const supportNumber = data.supportNumber?.trim();
    const email = data.email?.trim();
    const policyNumber = data.policyNumber?.trim();
    const coveragePercent = Number(data.coveragePercent);
    const startDate = data.startDate;
    const endDate = data.endDate;

    if (!companyName || !supportNumber || !email || !policyNumber || !startDate || !endDate) {
      throw new Error("Please fill in all insurance fields");
    }

    if (!Number.isInteger(coveragePercent) || coveragePercent < 0 || coveragePercent > 100) {
      throw new Error("Coverage percent must be a whole number between 0 and 100");
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
      throw new Error("Please enter valid policy dates");
    }

    if (parsedEndDate < parsedStartDate) {
      throw new Error("End date cannot be before start date");
    }

    if (this.isExpired(parsedEndDate)) {
      throw new Error("End date cannot be in the past. Please enter an active insurance policy.");
    }

    return {
      provider: companyName,
      customer_support_number: supportNumber,
      insurance_company_email: email,
      policy_number: policyNumber,
      coverage_percent: coveragePercent,
      start_date: parsedStartDate,
      end_date: parsedEndDate,
    };
  }

  async getInsurance(userId) {
    const profile = await this.getPatientProfile(userId);
    const insurance = await insuranceRepository.findCurrentProfileInsurance(profile.id);

    return this.formatInsurance(insurance);
  }

  async saveInsurance(userId, data) {
    const profile = await this.getPatientProfile(userId);
    const insuranceData = this.validateInsurance(data);
    const existingInsurance = await insuranceRepository.findCurrentProfileInsurance(profile.id);

    const insurance = existingInsurance
      ? await insuranceRepository.update(existingInsurance.id, insuranceData)
      : await insuranceRepository.create({
          profile_id: profile.id,
          ...insuranceData,
        });

    return this.formatInsurance(insurance);
  }

  async deleteInsurance(userId, insuranceId) {
    const profile = await this.getPatientProfile(userId);
    const insurance = await insuranceRepository.findProfileInsuranceById(profile.id, insuranceId);

    if (!insurance) {
      throw new Error("Insurance not found");
    }

    await insuranceRepository.delete(insurance.id);
    return { id: insurance.id };
  }
}

export default new PatientInsuranceService();
