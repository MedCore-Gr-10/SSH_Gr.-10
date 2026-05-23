import emergencyContactsRepository from "../../repositories/emergency-contacts.repository.js";
import profileRepository from "../../repositories/profile.repository.js";

class PatientEmergencyContactsService {
  formatContact(contact) {
    return {
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      relationship: contact.relationship,
      phoneNumber: contact.phone_number,
      idNumber: contact.id_number,
    };
  }

  async getPatientProfile(userId) {
    const profileLink = await profileRepository.findUserProfile(userId);
    if (!profileLink?.profiles) {
      throw new Error("Patient profile not found");
    }
    return profileLink.profiles;
  }

  validateContact(data) {
    const requiredFields = ["firstName", "lastName", "email", "relationship", "phoneNumber", "idNumber"];
    const missingField = requiredFields.find((field) => !data[field]?.trim());

    if (missingField) {
      throw new Error("Please fill in all emergency contact fields");
    }
  }

  async listContacts(patientId) {
    const profile = await this.getPatientProfile(patientId);
    const contacts = await emergencyContactsRepository.findPatientContacts(patientId);

    return {
      contacts: contacts.map((contact) => this.formatContact(contact)),
      currentContactId: profile.current_emergency_contact_id,
    };
  }

  async createContact(patientId, data) {
    this.validateContact(data);
    const profile = await this.getPatientProfile(patientId);

    const contact = await emergencyContactsRepository.create({
      patient_id: patientId,
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      email: data.email.trim(),
      relationship: data.relationship.trim(),
      phone_number: data.phoneNumber.trim(),
      id_number: data.idNumber.trim(),
    });

    if (!profile.current_emergency_contact_id) {
      await profileRepository.updateCurrentEmergencyContact(profile.id, contact.id);
    }

    return this.formatContact(contact);
  }

  async setCurrentContact(patientId, contactId) {
    const profile = await this.getPatientProfile(patientId);
    const contact = await emergencyContactsRepository.findPatientContactById(patientId, contactId);

    if (!contact) {
      throw new Error("Emergency contact not found");
    }

    await profileRepository.updateCurrentEmergencyContact(profile.id, contact.id);

    return {
      currentContactId: contact.id,
    };
  }

  async deleteContact(patientId, contactId) {
    const profile = await this.getPatientProfile(patientId);
    const contact = await emergencyContactsRepository.findPatientContactById(patientId, contactId);

    if (!contact) {
      throw new Error("Emergency contact not found");
    }

    await emergencyContactsRepository.delete(contact.id);

    if (profile.current_emergency_contact_id === contact.id) {
      const remainingContacts = await emergencyContactsRepository.findPatientContacts(patientId);
      await profileRepository.updateCurrentEmergencyContact(profile.id, remainingContacts[0]?.id || null);
    }

    return { id: contact.id };
  }
}

export default new PatientEmergencyContactsService();
