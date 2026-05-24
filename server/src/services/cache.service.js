import { createClient } from "redis";

class RedisCacheService {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
      socket: {
        connectTimeout: 1000,
        reconnectStrategy: false,
      },
    });
    this.connectPromise = null;

    this.client.on("error", (err) => {
      console.error("[Redis] Cache error:", err.message);
    });
  }

  async connect() {
    if (this.client.isOpen) {
      return true;
    }

    if (!this.connectPromise) {
      this.connectPromise = this.client.connect().catch((err) => {
        this.connectPromise = null;
        console.error("[Redis] Cache unavailable:", err.message);
        return false;
      });
    }

    return this.connectPromise;
  }

  doctorPatientsKey(doctorId) {
    return `doctor:${doctorId}:patients`;
  }

  async getJson(key) {
    const connected = await this.connect();
    if (!connected) return null;

    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      await this.delete(key);
      return null;
    }
  }

  async setJson(key, value, ttlSeconds) {
    const connected = await this.connect();
    if (!connected) return;

    await this.client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }

  async delete(key) {
    const connected = await this.connect();
    if (!connected) return;

    await this.client.del(key);
  }

  async invalidateDoctorPatients(doctorId) {
    if (!doctorId) return;
    await this.delete(this.doctorPatientsKey(doctorId));
  }
}

export default new RedisCacheService();
