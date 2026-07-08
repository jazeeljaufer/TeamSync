import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import "./Profile.css";

const avatarPresets = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia",
];

const Profile = () => {
  const { user, getProfile, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
    avatar: "",
    createdAt: "",
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        if (response?.user) {
          const u = response.user;
          setProfileData({
            name: u.name || "",
            email: u.email || "",
            role: u.role || "TEAM_MEMBER",
            avatar: u.avatar || "",
            createdAt: u.createdAt || "",
          });
        }
      } catch {
      }
    };
    fetchProfile();
  }, [getProfile]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const selectAvatarPreset = (url) => {
    setProfileData((prev) => ({ ...prev, avatar: url }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = {
        name: profileData.name,
        avatar: profileData.avatar,
      };

      if (passwordData.password) {
        if (passwordData.password !== passwordData.confirmPassword) {
          throw new Error("New passwords do not match.");
        }
        if (passwordData.password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        payload.password = passwordData.password;
      }

      await updateProfile(payload);
      setStatus({ type: "success", message: "Profile updated successfully!" });
      
      setPasswordData({ password: "", confirmPassword: "" });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Failed to update profile." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <DashboardLayout activeItem="profile" title="My Profile" subtitle="Manage your personal details and settings.">
      <div className="profile-page-container">
        
        <div className="profile-summary-card">
          <div className="profile-avatar-display">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Profile Avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-identity">
            <h2>{profileData.name || "User"}</h2>
            <p className="profile-email">{profileData.email}</p>
            <div className="profile-badges">
              <span className="profile-badge role-badge">
                {profileData.role.replace("_", " ")}
              </span>
              <span className="profile-badge date-badge">
                Member since {formatDate(profileData.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <form className="profile-edit-form" onSubmit={handleSaveProfile}>
          <section className="profile-form-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <InputField 
                id="profile-name" 
                name="name" 
                label="Full Name" 
                value={profileData.name} 
                onChange={handleProfileChange} 
              />
            </div>

            <div className="form-group" style={{ marginTop: "16px" }}>
              <label>Select Avatar Preset</label>
              <div className="avatar-presets-list">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`avatar-preset-btn ${profileData.avatar === preset ? "selected" : ""}`}
                    onClick={() => selectAvatarPreset(preset)}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "16px" }}>
              <InputField 
                id="profile-avatar" 
                name="avatar" 
                label="Or Custom Avatar URL" 
                value={profileData.avatar} 
                onChange={handleProfileChange} 
                required={false}
                placeholder="https://example.com/avatar.png"
              />
            </div>
          </section>

          <section className="profile-form-section" style={{ marginTop: "24px" }}>
            <h3>Security</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-outline)", marginBottom: "16px" }}>
              Leave blank if you do not want to change your password.
            </p>
            <div className="form-row">
              <InputField 
                id="profile-password" 
                name="password" 
                label="New Password" 
                type="password" 
                value={passwordData.password} 
                onChange={handlePasswordChange} 
                required={false}
                placeholder="********"
              />
              <InputField 
                id="profile-confirm-password" 
                name="confirmPassword" 
                label="Confirm New Password" 
                type="password" 
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange} 
                required={false}
                placeholder="********"
              />
            </div>
          </section>

          {status.message && (
            <div className={`status-message status-message--${status.type}`} style={{ margin: "20px 0", padding: "12px", borderRadius: "8px", backgroundColor: status.type === 'error' ? 'var(--color-error-container)' : 'var(--color-secondary-container)', color: status.type === 'error' ? 'var(--color-on-error-container)' : 'var(--color-primary)' }}>
              {status.message}
            </div>
          )}

          <div className="form-actions" style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" loading={isSubmitting}>Save Profile Changes</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
