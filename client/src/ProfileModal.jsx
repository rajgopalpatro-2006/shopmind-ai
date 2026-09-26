import { useEffect, useState } from "react";

import {
  INDIAN_STATES,
  getCitiesByState,
} from "./data/indiaLocations";

import API_URL from "./api";

// =====================================================
// PROFILE MODAL
// =====================================================

function ProfileModal({
  onClose,
  onProfileUpdated,
}) {
  // ===================================================
  // PROFILE STATE
  // ===================================================

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [originalProfile, setOriginalProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [editMode, setEditMode] =
    useState(false);

  // ===================================================
  // PASSWORD STATE
  // ===================================================

  const [
    showPasswordForm,
    setShowPasswordForm,
  ] = useState(false);

  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] = useState("");

  // ===================================================
  // GET TOKEN
  // ===================================================

  const getToken = () => {
    return localStorage.getItem(
      "shopmindToken"
    );
  };

  // ===================================================
  // LOAD PROFILE
  // ===================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login to view your profile."
        );
      }

      const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not load your profile."
        );
      }

      const user =
        data.user || {};

      const loadedProfile = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address:
          user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode:
          user.pincode || "",
      };

      setProfile(
        loadedProfile
      );

      setOriginalProfile(
        loadedProfile
      );
    } catch (err) {
      console.error(
        "Load profile error:",
        err
      );

      setError(
        err.message ||
          "Could not load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ===================================================
  // PROFILE INPUT CHANGE
  // ===================================================

  const handleProfileChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    let newValue = value;

    // Phone = maximum 10 digits
    if (name === "phone") {
      newValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    // PIN = maximum 6 digits
    if (name === "pincode") {
      newValue = value
        .replace(/\D/g, "")
        .slice(0, 6);
    }

    setProfile(
      (current) => ({
        ...current,
        [name]: newValue,
      })
    );

    setError("");
    setSuccess("");
  };

  // ===================================================
  // STATE CHANGE
  // ===================================================

  const handleStateChange = (
    event
  ) => {
    const newState =
      event.target.value;

    setProfile(
      (current) => ({
        ...current,

        state: newState,

        // Reset city whenever
        // state changes
        city: "",
      })
    );

    setError("");
    setSuccess("");
  };

  // ===================================================
  // GET AVAILABLE CITIES
  // ===================================================

  const availableCities =
    getCitiesByState(
      profile.state
    );

  // ===================================================
  // SAVE PROFILE
  // ===================================================

  const handleSaveProfile = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login again."
        );
      }

      // NAME VALIDATION

      if (
        !profile.name.trim() ||
        profile.name.trim()
          .length < 2
      ) {
        throw new Error(
          "Please enter a valid name."
        );
      }

      // PHONE VALIDATION

      if (
        profile.phone &&
        !/^[0-9]{10}$/.test(
          profile.phone
        )
      ) {
        throw new Error(
          "Phone number must contain exactly 10 digits."
        );
      }

      // PIN VALIDATION

      if (
        profile.pincode &&
        !/^[0-9]{6}$/.test(
          profile.pincode
        )
      ) {
        throw new Error(
          "PIN code must contain exactly 6 digits."
        );
      }

      // CITY VALIDATION

      if (
        profile.state &&
        !profile.city
      ) {
        throw new Error(
          "Please select your city."
        );
      }

      // UPDATE PROFILE

      const response =
        await fetch(
          `${API_URL}/api/auth/profile`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name:
                profile.name.trim(),

              phone:
                profile.phone.trim(),

              address:
                profile.address.trim(),

              city:
                profile.city.trim(),

              state:
                profile.state.trim(),

              pincode:
                profile.pincode.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not update your profile."
        );
      }

      const updatedUser =
        data.user || {};

      const updatedProfile = {
        name:
          updatedUser.name || "",

        email:
          updatedUser.email || "",

        phone:
          updatedUser.phone || "",

        address:
          updatedUser.address ||
          "",

        city:
          updatedUser.city || "",

        state:
          updatedUser.state || "",

        pincode:
          updatedUser.pincode ||
          "",
      };

      setProfile(
        updatedProfile
      );

      setOriginalProfile(
        updatedProfile
      );

      // UPDATE LOCAL STORAGE

      const savedUser =
        localStorage.getItem(
          "shopmindUser"
        );

      let oldUser = {};

      try {
        oldUser = savedUser
          ? JSON.parse(
              savedUser
            )
          : {};
      } catch {
        oldUser = {};
      }

      const newLocalUser = {
        ...oldUser,
        ...updatedUser,
      };

      localStorage.setItem(
        "shopmindUser",
        JSON.stringify(
          newLocalUser
        )
      );

      // UPDATE APP USER STATE

      if (
        typeof onProfileUpdated ===
        "function"
      ) {
        onProfileUpdated(
          newLocalUser
        );
      }

      setEditMode(false);

      setSuccess(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Save profile error:",
        err
      );

      setError(
        err.message ||
          "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // CANCEL EDIT
  // ===================================================

  const handleCancelEdit =
    () => {
      if (originalProfile) {
        setProfile(
          originalProfile
        );
      }

      setEditMode(false);
      setError("");
      setSuccess("");
    };

  // ===================================================
  // PASSWORD INPUT CHANGE
  // ===================================================

  const handlePasswordChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setPasswordForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setPasswordError("");
    setPasswordSuccess("");
  };

  // ===================================================
  // CHANGE PASSWORD
  // ===================================================

  const handleChangePassword =
    async (event) => {
      event.preventDefault();

      try {
        setChangingPassword(
          true
        );

        setPasswordError("");
        setPasswordSuccess("");

        const {
          currentPassword,
          newPassword,
          confirmPassword,
        } = passwordForm;

        if (
          !currentPassword ||
          !newPassword ||
          !confirmPassword
        ) {
          throw new Error(
            "Please fill in all password fields."
          );
        }

        if (
          newPassword.length < 6
        ) {
          throw new Error(
            "New password must be at least 6 characters."
          );
        }

        if (
          newPassword !==
          confirmPassword
        ) {
          throw new Error(
            "New password and confirm password do not match."
          );
        }

        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Please login again."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/auth/change-password`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  currentPassword,
                  newPassword,
                  confirmPassword,
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Could not change your password."
          );
        }

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setPasswordSuccess(
          "Password changed successfully."
        );
      } catch (err) {
        console.error(
          "Change password error:",
          err
        );

        setPasswordError(
          err.message ||
            "Could not change your password."
        );
      } finally {
        setChangingPassword(
          false
        );
      }
    };

  // ===================================================
  // CLOSE PASSWORD FORM
  // ===================================================

  const closePasswordForm =
    () => {
      setShowPasswordForm(
        false
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordError("");
      setPasswordSuccess("");
    };

  // ===================================================
  // MODAL
  // ===================================================

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="profile-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="profile-header">
          <div className="profile-header-left">
            <div className="profile-avatar">
              {profile.name
                ? profile.name
                    .charAt(0)
                    .toUpperCase()
                : "👤"}
            </div>

            <div>
              <h2>
                My Account
              </h2>

              <p>
                Manage your profile
                and delivery
                information.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="profile-close-btn"
            onClick={onClose}
            aria-label="Close profile"
          >
            ✕
          </button>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="profile-state">
            <div className="profile-loading-icon">
              👤
            </div>

            <h3>
              Loading your
              profile...
            </h3>

            <p>
              Please wait a moment.
            </p>
          </div>
        )}

        {/* LOAD ERROR */}

        {!loading &&
          error &&
          !originalProfile && (
            <div className="profile-state">
              <div className="profile-error-icon">
                ⚠️
              </div>

              <h3>
                Could not load
                profile
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="profile-primary-btn"
                onClick={
                  loadProfile
                }
              >
                Try Again
              </button>
            </div>
          )}

        {/* PROFILE CONTENT */}

        {!loading &&
          originalProfile && (
            <div className="profile-body">

              {/* ACCOUNT INFORMATION */}

              <section className="profile-section">

                <div className="profile-section-heading">
                  <div>
                    <h3>
                      👤 Account
                      Information
                    </h3>

                    <p>
                      Your personal
                      account details.
                    </p>
                  </div>

                  {!editMode && (
                    <button
                      type="button"
                      className="profile-edit-btn"
                      onClick={() => {
                        setEditMode(
                          true
                        );

                        setError("");
                        setSuccess("");
                      }}
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>

                {/* SUCCESS MESSAGE */}

                {success && (
                  <div className="profile-success-message">
                    ✅ {success}
                  </div>
                )}

                {/* ERROR MESSAGE */}

                {error && (
                  <div className="profile-error-message">
                    ⚠️ {error}
                  </div>
                )}

                {/* PROFILE FORM */}

                <form
                  onSubmit={
                    handleSaveProfile
                  }
                >
                  <div className="profile-form-grid">

                    {/* NAME */}

                    <div className="profile-field">
                      <label htmlFor="profile-name">
                        Full Name
                      </label>

                      <input
                        id="profile-name"
                        type="text"
                        name="name"
                        value={
                          profile.name
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={
                          !editMode
                        }
                        placeholder="Your full name"
                      />
                    </div>

                    {/* EMAIL */}

                    <div className="profile-field">
                      <label htmlFor="profile-email">
                        Email Address
                      </label>

                      <input
                        id="profile-email"
                        type="email"
                        value={
                          profile.email
                        }
                        disabled
                      />

                      <small>
                        Email cannot
                        be changed
                        here.
                      </small>
                    </div>

                    {/* PHONE */}

                    <div className="profile-field">
                      <label htmlFor="profile-phone">
                        Phone Number
                      </label>

                      <input
                        id="profile-phone"
                        type="tel"
                        name="phone"
                        value={
                          profile.phone
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={
                          !editMode
                        }
                        placeholder="10-digit phone number"
                        inputMode="numeric"
                        maxLength={10}
                      />
                    </div>

                    {/* STATE */}

                    <div className="profile-field">
                      <label htmlFor="profile-state">
                        State / Union
                        Territory
                      </label>

                      <select
                        id="profile-state"
                        name="state"
                        value={
                          profile.state
                        }
                        onChange={
                          handleStateChange
                        }
                        disabled={
                          !editMode
                        }
                      >
                        <option value="">
                          Select your
                          state / UT
                        </option>

                        {INDIAN_STATES.map(
                          (state) => (
                            <option
                              key={
                                state
                              }
                              value={
                                state
                              }
                            >
                              {
                                state
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* CITY */}

                    <div className="profile-field">
                      <label htmlFor="profile-city">
                        City
                      </label>

                      <select
                        id="profile-city"
                        name="city"
                        value={
                          profile.city
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={
                          !editMode ||
                          !profile.state
                        }
                      >
                        <option value="">
                          {profile.state
                            ? "Select your city"
                            : "Select state first"}
                        </option>

                        {profile.city &&
                          !availableCities.includes(
                            profile.city
                          ) && (
                            <option
                              value={
                                profile.city
                              }
                            >
                              {
                                profile.city
                              }
                            </option>
                          )}

                        {availableCities.map(
                          (city) => (
                            <option
                              key={
                                city
                              }
                              value={
                                city
                              }
                            >
                              {
                                city
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* PIN CODE */}

                    <div className="profile-field">
                      <label htmlFor="profile-pincode">
                        PIN Code
                      </label>

                      <input
                        id="profile-pincode"
                        type="text"
                        name="pincode"
                        value={
                          profile.pincode
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={
                          !editMode
                        }
                        placeholder="6-digit PIN code"
                        inputMode="numeric"
                        maxLength={6}
                      />
                    </div>

                    {/* ADDRESS */}

                    <div className="profile-field profile-address-field">
                      <label htmlFor="profile-address">
                        Delivery
                        Address
                      </label>

                      <textarea
                        id="profile-address"
                        name="address"
                        value={
                          profile.address
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={
                          !editMode
                        }
                        placeholder="House / Flat No., Street, Area"
                        rows={3}
                      />
                    </div>

                  </div>

                  {/* EDIT ACTIONS */}

                  {editMode && (
                    <div className="profile-form-actions">

                      <button
                        type="button"
                        className="profile-cancel-btn"
                        onClick={
                          handleCancelEdit
                        }
                        disabled={
                          saving
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="profile-save-btn"
                        disabled={
                          saving
                        }
                      >
                        {saving
                          ? "Saving..."
                          : "💾 Save Changes"}
                      </button>

                    </div>
                  )}

                </form>

              </section>

              {/* SECURITY */}

              <section className="profile-section">

                <div className="profile-section-heading">

                  <div>
                    <h3>
                      🔐 Security
                    </h3>

                    <p>
                      Manage your
                      account password.
                    </p>
                  </div>

                  {!showPasswordForm && (
                    <button
                      type="button"
                      className="profile-password-btn"
                      onClick={() => {
                        setShowPasswordForm(
                          true
                        );

                        setPasswordError(
                          ""
                        );

                        setPasswordSuccess(
                          ""
                        );
                      }}
                    >
                      🔑 Change Password
                    </button>
                  )}

                </div>

                {/* PASSWORD FORM */}

                {showPasswordForm && (
                  <form
                    className="profile-password-form"
                    onSubmit={
                      handleChangePassword
                    }
                  >

                    {passwordSuccess && (
                      <div className="profile-success-message">
                        ✅{" "}
                        {
                          passwordSuccess
                        }
                      </div>
                    )}

                    {passwordError && (
                      <div className="profile-error-message">
                        ⚠️{" "}
                        {
                          passwordError
                        }
                      </div>
                    )}

                    {/* CURRENT PASSWORD */}

                    <div className="profile-field">
                      <label htmlFor="current-password">
                        Current
                        Password
                      </label>

                      <input
                        id="current-password"
                        type="password"
                        name="currentPassword"
                        value={
                          passwordForm.currentPassword
                        }
                        onChange={
                          handlePasswordChange
                        }
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="profile-password-grid">

                      {/* NEW PASSWORD */}

                      <div className="profile-field">
                        <label htmlFor="new-password">
                          New Password
                        </label>

                        <input
                          id="new-password"
                          type="password"
                          name="newPassword"
                          value={
                            passwordForm.newPassword
                          }
                          onChange={
                            handlePasswordChange
                          }
                          placeholder="Minimum 6 characters"
                          autoComplete="new-password"
                        />
                      </div>

                      {/* CONFIRM PASSWORD */}

                      <div className="profile-field">
                        <label htmlFor="confirm-password">
                          Confirm
                          Password
                        </label>

                        <input
                          id="confirm-password"
                          type="password"
                          name="confirmPassword"
                          value={
                            passwordForm.confirmPassword
                          }
                          onChange={
                            handlePasswordChange
                          }
                          placeholder="Enter password again"
                          autoComplete="new-password"
                        />
                      </div>

                    </div>

                    {/* PASSWORD ACTIONS */}

                    <div className="profile-form-actions">

                      <button
                        type="button"
                        className="profile-cancel-btn"
                        onClick={
                          closePasswordForm
                        }
                        disabled={
                          changingPassword
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="profile-save-btn"
                        disabled={
                          changingPassword
                        }
                      >
                        {changingPassword
                          ? "Changing..."
                          : "🔐 Update Password"}
                      </button>

                    </div>

                  </form>
                )}

              </section>

            </div>
          )}

      </div>
    </div>
  );
}

export default ProfileModal;