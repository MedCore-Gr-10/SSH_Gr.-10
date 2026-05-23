import { useEffect, useMemo, useState } from "react";
import { getMyProfile, updateMyProfile } from "../../../services/profileApi";
import "../../CSSpages/header-pages/Profile.css";

const emptyForm = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  phone_number: "",
  gender: "",
};

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [avatar, setAvatar] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const storageKey = profileData?.user?.id ? `profileExtras:${profileData.user.id}` : null;

  const displayName = useMemo(() => {
    const fullName = `${form.first_name} ${form.last_name}`.trim();
    return fullName || form.username || "Profile";
  }, [form.first_name, form.last_name, form.username]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyProfile();
        setProfileData(data);
        setForm({
          username: data.user?.username || "",
          email: data.profile?.email || "",
          first_name: data.profile?.first_name || "",
          last_name: data.profile?.last_name || "",
          phone_number: data.profile?.phone_number || "",
          gender: data.profile?.gender || "",
        });

        const extras = JSON.parse(localStorage.getItem(`profileExtras:${data.user?.id}`) || "{}");
        setAvatar(extras.avatar || "");
        setSummary(extras.summary || "");
      } catch (err) {
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = reader.result;
      setAvatar(value);
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify({ avatar: value, summary }));
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updated = await updateMyProfile(form);
      setProfileData(updated);
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify({ avatar, summary }));
      }
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const saveSummary = (event) => {
    event.preventDefault();
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ avatar, summary }));
      setMessage("Profile summary saved.");
      setError("");
    }
  };

  if (loading) {
    return <div className="profile-page"><div className="profile-state">Loading profile...</div></div>;
  }

  if (error && !profileData) {
    return <div className="profile-page"><div className="profile-error">{error}</div></div>;
  }

  const assignment = profileData?.assignment || {};
  const stats = profileData?.summary || {};
  const role = profileData?.user?.role || "";

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <label className="profile-avatar">
          {avatar ? <img src={avatar} alt={displayName} /> : <span>{displayName.slice(0, 1).toUpperCase()}</span>}
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </label>
        <div>
          <p className="profile-role">{role}</p>
          <h1>{displayName}</h1>
          <p>{assignment.hospital_name || "No hospital assignment"}</p>
        </div>
      </section>

      <div className="profile-grid">
        <section className="profile-panel">
          <h2>Profile Details</h2>
          <form className="profile-form" onSubmit={saveProfile}>
            <label>
              Username
              <input name="username" value={form.username} onChange={handleChange} />
            </label>
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} />
            </label>
            <label>
              First name
              <input name="first_name" value={form.first_name} onChange={handleChange} />
            </label>
            <label>
              Last name
              <input name="last_name" value={form.last_name} onChange={handleChange} />
            </label>
            <label>
              Phone
              <input name="phone_number" value={form.phone_number} onChange={handleChange} />
            </label>
            <label>
              Gender
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Not specified</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
          </form>
        </section>

        <section className="profile-panel">
          <h2>Assignment Summary</h2>
          <div className="profile-facts">
            <div><span>Hospital</span><strong>{assignment.hospital_name || "—"}</strong></div>
            <div><span>Department</span><strong>{assignment.department_name || "—"}</strong></div>
            <div><span>Specialization</span><strong>{assignment.specialization_name || "—"}</strong></div>
            <div><span>Hospital staff</span><strong>{stats.staff_count ?? 0}</strong></div>
            <div><span>Hospital patients</span><strong>{stats.patient_count ?? 0}</strong></div>
          </div>

          <form className="profile-summary-form" onSubmit={saveSummary}>
            <label>
              Profile summary
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="A short note about your role, focus, or responsibilities."
              />
            </label>
            <button type="submit">Save summary</button>
          </form>

          {message && <div className="profile-message">{message}</div>}
          {error && <div className="profile-error">{error}</div>}
        </section>
      </div>
    </div>
  );
}

export default Profile;
