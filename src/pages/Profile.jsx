// ANNA-APP/frontend/src/pages/Profile.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const PROFILE_KEY = "nivetha_anna_profile";

const EMPTY_PROFILE = {
  name: "",
  phone: "",
  email: "",
  address: "",
  profileImage: "",
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] =
    useState(EMPTY_PROFILE);

  const [originalProfile, setOriginalProfile] =
    useState(EMPTY_PROFILE);

  /* =====================================================
     CREATE PROFILE OBJECT
  ===================================================== */

  const createProfileObject = (owner) => ({
    name: owner?.name || "",
    phone:
      owner?.phone ||
      owner?.mobile ||
      owner?.loginPhone ||
      "",
    email: owner?.email || "",
    address: owner?.address || "",
    profileImage: owner?.profileImage || "",
  });

  /* =====================================================
     GET SAVED PROFILE
  ===================================================== */

  const getSavedProfile = () => {
    try {
      const saved =
        localStorage.getItem(PROFILE_KEY);

      if (!saved) {
        return null;
      }

      const parsed = JSON.parse(saved);

      if (
        !parsed ||
        typeof parsed !== "object"
      ) {
        return null;
      }

      return {
        ...EMPTY_PROFILE,
        ...parsed,
      };
    } catch (err) {
      console.error(
        "SAVED PROFILE READ ERROR:",
        err
      );

      return null;
    }
  };

  /* =====================================================
     SAVE PROFILE LOCALLY
  ===================================================== */

  const saveProfileLocally = (profileData) => {
    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profileData)
      );
    } catch (err) {
      console.error(
        "PROFILE LOCAL SAVE ERROR:",
        err
      );
    }
  };

  /* =====================================================
     LOAD PROFILE
     
     IMPORTANT:
     Do NOT put `user` or `updateUser` in dependency.
     Otherwise updateUser() can trigger a reload loop
     and cause the page to blink.
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        /* -----------------------------------------------
           1. Read saved profile
        ------------------------------------------------ */

        const savedProfile =
          getSavedProfile();

        /* -----------------------------------------------
           2. Read stored user
        ------------------------------------------------ */

        const storedUser =
          authService.getStoredUser();

        const currentUser =
          storedUser || user || null;

        /* -----------------------------------------------
           3. Local profile first
        ------------------------------------------------ */

        let latestProfile =
          savedProfile ||
          (currentUser
            ? createProfileObject(
                currentUser
              )
            : null);

        /* -----------------------------------------------
           4. Try backend
        ------------------------------------------------ */

        const phone =
          currentUser?.phone ||
          currentUser?.mobile ||
          currentUser?.loginPhone ||
          savedProfile?.phone ||
          "";

        if (phone) {
          try {
            const response =
              await authService.getCurrentUser(
                phone
              );

            const owner =
              response?.owner ||
              response?.user ||
              response?.data?.owner ||
              response?.data?.user ||
              null;

            if (owner) {
              latestProfile =
                createProfileObject(owner);

              /*
               * Save latest backend profile locally.
               *
               * IMPORTANT:
               * Do NOT call updateUser() here.
               * Calling updateUser() inside this effect
               * was causing the blinking/re-render loop.
               */
              saveProfileLocally(
                latestProfile
              );
            }
          } catch (backendError) {
            /*
             * Backend failure should not destroy
             * already saved profile data.
             */
            console.warn(
              "PROFILE BACKEND FETCH FAILED:",
              backendError?.response
                ?.data ||
                backendError?.message ||
                backendError
            );
          }
        }

        if (!mounted) {
          return;
        }

        /* -----------------------------------------------
           5. Set final profile
        ------------------------------------------------ */

        if (latestProfile) {
          const finalProfile = {
            ...EMPTY_PROFILE,
            ...latestProfile,
          };

          setProfile(finalProfile);
          setOriginalProfile(finalProfile);

          /*
           * Existing profile = VIEW MODE
           * Empty profile = EDIT MODE
           */
          if (
            finalProfile.name.trim()
          ) {
            setIsEditing(false);
          } else {
            setIsEditing(true);
          }
        } else {
          /*
           * First time profile setup.
           */
          setProfile({
            ...EMPTY_PROFILE,
          });

          setOriginalProfile({
            ...EMPTY_PROFILE,
          });

          setIsEditing(true);
        }
      } catch (err) {
        console.error(
          "PROFILE LOAD ERROR:",
          err?.response?.data ||
            err
        );

        if (!mounted) {
          return;
        }

        /*
         * Fallback:
         * local profile -> stored user -> context user
         */
        const savedProfile =
          getSavedProfile();

        const storedUser =
          authService.getStoredUser();

        const fallbackUser =
          savedProfile ||
          storedUser ||
          user ||
          null;

        if (fallbackUser) {
          const fallbackProfile =
            savedProfile ||
            createProfileObject(
              fallbackUser
            );

          setProfile(
            fallbackProfile
          );

          setOriginalProfile(
            fallbackProfile
          );

          setIsEditing(
            !fallbackProfile.name.trim()
          );
        } else {
          setProfile({
            ...EMPTY_PROFILE,
          });

          setOriginalProfile({
            ...EMPTY_PROFILE,
          });

          setIsEditing(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };

    /*
     * DO NOT add user/updateUser here.
     */
  }, []);

  /* =====================================================
     HANDLE INPUT
  ===================================================== */

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  /* =====================================================
     EDIT PROFILE
  ===================================================== */

  const handleEdit = () => {
    setOriginalProfile({
      ...profile,
    });

    setMessage("");
    setError("");
    setIsEditing(true);
  };

  /* =====================================================
     CANCEL EDIT
  ===================================================== */

  const handleCancel = () => {
    setProfile({
      ...originalProfile,
    });

    setMessage("");
    setError("");
    setIsEditing(false);
  };

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const name =
      profile.name.trim();

    const phone =
      profile.phone.trim();

    const email =
      profile.email.trim();

    const address =
      profile.address.trim();

    const profileImage =
      profile.profileImage.trim();

    /* -----------------------------------------------
       Validation
    ------------------------------------------------ */

    if (!name) {
      setError("Name is required");
      return;
    }

    if (!phone) {
      setError(
        "Phone number is required"
      );
      return;
    }

    try {
      setSaving(true);

      /* ---------------------------------------------
         Existing user
      ---------------------------------------------- */

      const storedUser =
        authService.getStoredUser();

      const currentPhone =
        storedUser?.phone ||
        storedUser?.mobile ||
        storedUser?.loginPhone ||
        user?.phone ||
        user?.mobile ||
        user?.loginPhone ||
        profile.phone ||
        phone;

      const profileData = {
        name,
        phone,
        email,
        address,
        profileImage,
        currentPhone,
      };

      /* ---------------------------------------------
         Save to MongoDB
      ---------------------------------------------- */

      const response =
        await authService.updateProfile(
          profileData
        );

      const updatedOwner =
        response?.owner ||
        response?.user ||
        response?.data?.owner ||
        response?.data?.user ||
        null;

      /* ---------------------------------------------
         Create final user
      ---------------------------------------------- */

      const finalUser = {
        ...(storedUser || {}),
        ...(user || {}),
        ...(updatedOwner || {}),

        name:
          updatedOwner?.name ||
          name,

        phone:
          updatedOwner?.phone ||
          phone,

        email:
          updatedOwner?.email ??
          email,

        address:
          updatedOwner?.address ??
          address,

        profileImage:
          updatedOwner?.profileImage ??
          profileImage,
      };

      /* ---------------------------------------------
         Save AuthContext / local user
      ---------------------------------------------- */

      if (
        typeof updateUser ===
        "function"
      ) {
        updateUser(finalUser);
      } else {
        authService.saveUser(
          finalUser
        );
      }

      /* ---------------------------------------------
         Save separate profile
         
         This survives logout.
      ---------------------------------------------- */

      const savedProfile =
        createProfileObject(
          finalUser
        );

      saveProfileLocally(
        savedProfile
      );

      /* ---------------------------------------------
         Update UI
      ---------------------------------------------- */

      setProfile(
        savedProfile
      );

      setOriginalProfile(
        savedProfile
      );

      setIsEditing(false);

      setMessage(
        "Profile saved successfully"
      );
    } catch (err) {
      console.error(
        "UPDATE PROFILE ERROR:",
        err?.response?.data ||
          err
      );

      setError(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {
    try {
      /*
       * Logout must clear authentication only.
       *
       * Profile data remains in:
       * - MongoDB
       * - nivetha_anna_user
       * - nivetha_anna_profile
       */

      await logout();
    } catch (err) {
      console.error(
        "LOGOUT ERROR:",
        err
      );
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner"></div>

          <p>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PROFILE UI
  ===================================================== */

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* HEADER */}
        <div className="profile-header">

          <button
            type="button"
            className="profile-back-btn"
            onClick={() =>
              navigate(-1)
            }
            aria-label="Go back"
            title="Go back"
          >
            ←
          </button>

          <div>
            <h1>
              My Profile
            </h1>

            <p>
              Manage your Anna account
              details
            </p>
          </div>

        </div>

        {/* PROFILE CARD */}
        <div className="profile-card">

          {/* AVATAR */}
          <div className="profile-avatar-section">

            <div className="profile-avatar">

              {profile.profileImage ? (
                <img
                  src={
                    profile.profileImage
                  }
                  alt="Profile"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <span>
                  {profile.name
                    ? profile.name
                        .charAt(0)
                        .toUpperCase()
                    : "A"}
                </span>
              )}

            </div>

            <div className="profile-user-info">

              <h2>
                {profile.name ||
                  "Anna"}
              </h2>

              <p>
                {profile.phone ||
                  "No phone number"}
              </p>

            </div>

          </div>

          {/* SUCCESS */}
          {message && (
            <div
              className="profile-success-message"
              role="status"
            >
              {message}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div
              className="profile-error-message"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* FORM */}
          <form
            className="profile-form"
            onSubmit={
              handleSubmit
            }
          >

            {/* NAME */}
            <div className="profile-form-group">

              <label htmlFor="name">
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={profile.name}
                onChange={
                  handleChange
                }
                placeholder="Enter your name"
                autoComplete="name"
                disabled={
                  !isEditing
                }
              />

            </div>

            {/* PHONE */}
            <div className="profile-form-group">

              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={
                  profile.phone
                }
                onChange={
                  handleChange
                }
                placeholder="Enter phone number"
                autoComplete="tel"
                disabled={
                  !isEditing
                }
              />

            </div>

            {/* EMAIL */}
            <div className="profile-form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={
                  profile.email
                }
                onChange={
                  handleChange
                }
                placeholder="Enter email address"
                autoComplete="email"
                disabled={
                  !isEditing
                }
              />

            </div>

            {/* ADDRESS */}
            <div className="profile-form-group">

              <label htmlFor="address">
                Address
              </label>

              <textarea
                id="address"
                name="address"
                value={
                  profile.address
                }
                onChange={
                  handleChange
                }
                placeholder="Enter address"
                rows="4"
                disabled={
                  !isEditing
                }
              />

            </div>

            {/* PROFILE IMAGE */}
            <div className="profile-form-group">

              <label htmlFor="profileImage">
                Profile Image URL
              </label>

              <input
                id="profileImage"
                name="profileImage"
                type="url"
                value={
                  profile.profileImage
                }
                onChange={
                  handleChange
                }
                placeholder="Enter profile image URL"
                disabled={
                  !isEditing
                }
              />

            </div>

            {/* BUTTONS */}
            {isEditing ? (
              <div className="profile-edit-actions">

                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                {profile.name && (
                  <button
                    type="button"
                    className="profile-cancel-btn"
                    onClick={
                      handleCancel
                    }
                    disabled={
                      saving
                    }
                  >
                    Cancel
                  </button>
                )}

              </div>
            ) : (
              <button
                type="button"
                className="profile-edit-btn"
                onClick={
                  handleEdit
                }
              >
                Edit Profile
              </button>
            )}

          </form>

          {/* ACCOUNT ACTIONS */}
          <div className="profile-actions">

            <button
              type="button"
              className="profile-password-btn"
              onClick={() =>
                navigate(
                  "/settings"
                )
              }
            >
              Change Password
            </button>

            <button
              type="button"
              className="profile-logout-btn"
              onClick={
                handleLogout
              }
            >
              Logout
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
