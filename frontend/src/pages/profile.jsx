/**
 * @fileoverview User profile page displaying personal information, membership status, and documents.
 * Supports viewing both current user's profile and other users' profiles via URL parameter.
 * @version 1.2.0
 * @author EXACTUM-dev
 */

// Import necessary libraries and components
import React, {useState, useEffect} from "react";
import {useUser, useAuth} from "@clerk/clerk-react";
import {useParams} from "react-router-dom";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";
// Atoms
import {Title2} from "../atoms/typography";

// Organisms
import ProfileInfo from "../organisms/profileInfo";
import AddressCard from "../organisms/addressCard";
import MembershipCard from "../organisms/membershipCard";
import TicketsCard from "../organisms/ticketsCard";
import DocumentsCard from "../organisms/documentsCard";
import HistoryCard from "../organisms/historyCard";

// Controllers
import { getCurrentUserProfile, getUserProfileById, updateUserById } from "../controllers/profile.controller";

// Hooks
import { useDbUser } from "../hooks/useDbUser";

/**
 * Renders the user profile page with personal information, address, membership, and documents.
 * Displays the authenticated user's profile by default or another user's profile when accessed via userId param.
 * @return {!React.Component} Profile page component with sidebar navigation.
 */
export default function ProfilePage() {
  const [current, setCurrent] = useState("profile");
  const [userProfile, setUserProfile] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {user, isLoaded} = useUser();
  const {getToken} = useAuth();
  const {userId} = useParams(); // Get userId from URL if present
  const {userData} = useDbUser(); // Get user privileges for RBAC

  // Fetch user profile from backend
  useEffect(() => {
    async function fetchProfile() {
      if (!isLoaded || !user) {
        return;
      }

      try {
        setLoading(true);
        const token = await getToken();

        // Always fetch current user's profile for permission checks
        const me = await getCurrentUserProfile(token);
        setCurrentUserProfile(me);

        // If userId is in URL, fetch that user's profile, otherwise use my profile
        const profileData = userId ? await getUserProfileById(userId, token) : me;
        setUserProfile(profileData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [isLoaded, user, getToken, userId]); // Added userId to dependencies

  const handleNavigate = (key) => setCurrent(key);

  // RBAC: Check if user can edit
  // Allow editing if:
  // 1. User is viewing their own profile (no userId in URL)
  // 2. User is viewing another user's profile (userId exists) AND has "Gestión de Usuarios" privilege
  const userPrivileges = userData?.userPrivileges?.privilegios || [];
  const hasUserManagementPrivilege = userPrivileges.includes("Gestión de Usuarios");
  const isOwnProfile = !userId; // No userId means viewing own profile
  const canEdit = isOwnProfile || (userId && hasUserManagementPrivilege);

  async function handleSaveEdits(fields) {
    const token = await getToken();
    try {
      // If viewing own profile, update current user
      if (isOwnProfile) {
        // If fields is already a full profile object (from documents update), use it directly
        if (fields.IDUsuario) {
          setUserProfile(fields);
          setCurrentUserProfile(fields); // Also update current user profile
        } else {
          // Otherwise, it's a partial update, call the API with current user's ID
          const updated = await updateUserById(currentUserProfile.IDUsuario, fields, token);
          setUserProfile(updated);
          setCurrentUserProfile(updated);
        }
      } else {
        // Editing another user's profile - only allowed with "Gestión de Usuarios"
        if (!hasUserManagementPrivilege) {
          const error = new Error('No se puede editar: falta privilegio de Gestión de Usuarios');
          throw error;
        }
        // If fields is already a full profile object (from documents update), use it directly
        if (fields.IDUsuario) {
          setUserProfile(fields);
        } else {
          // Otherwise, it's a partial update, call the API
          const updated = await updateUserById(userId, fields, token);
          setUserProfile(updated);
        }
      }
    } catch (err) {
      console.error('Error actualizando usuario:', err);
      setError(err.message || 'Error al actualizar el usuario');
      // Re-throw error so components can catch it and show modals
      throw err;
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{borderBottomColor: '#CAD00F'}}></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar el perfil</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Use profile data from backend, or empty object as fallback
  const profileData = userProfile || {};
  
  // Use userId from URL if viewing another user, otherwise use current user's ID
  const effectiveUserId = userId || currentUserProfile?.IDUsuario;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header component with user info */}
      <AppHeader user={user} />

      <div className="flex">
        <Sidebar current={current} onNavigate={handleNavigate} />

        <main className="flex-1 p-6 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
          <div className="max-w-[1100px] mx-auto">
            <Title2 className="mb-6">
              {userId ? 'Perfil de Usuario' : 'Mi Perfil'}
            </Title2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: profile info + address */}
            <div className="lg:col-span-2 space-y-6">
              <ProfileInfo data={profileData} canEdit={canEdit} onSave={handleSaveEdits} />
              <AddressCard data={profileData} canEdit={canEdit} onSave={handleSaveEdits} />
              <DocumentsCard data={profileData} canEdit={canEdit} onSave={handleSaveEdits} userId={effectiveUserId} />
              <HistoryCard data={profileData} canEdit={canEdit} onSave={handleSaveEdits} />
              </div>

              {/* Right column: membership and tickets */}
              <div className="space-y-6">
                <MembershipCard data={profileData} />
                <TicketsCard tickets={[]} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
