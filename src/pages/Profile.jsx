import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Phone, Camera, Save, Loader2, Mail } from 'lucide-react';

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, address, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
        });
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // DELETE OLD AVATAR IF EXISTS
      if (avatarUrl) {
        try {
          const oldPath = avatarUrl.split('/avatars/')[1];
          if (oldPath) {
             const { error: deleteError } = await supabase.storage
              .from('avatars')
              .remove([oldPath]);
             
             if (deleteError) {
               console.warn('Failed to delete old avatar:', deleteError.message);
             }
          }
        } catch (err) {
          console.warn('Error parsing old avatar URL for deletion:', err);
        }
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // Update profile immediately with new avatar
      await updateProfile(publicUrl);

    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async (newAvatarUrl = null) => {
    try {
      setUpdating(true);

      const updates = {
        id: user.id,
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        updated_at: new Date().toISOString(),
      };

      if (newAvatarUrl) {
        updates.avatar_url = newAvatarUrl;
      }

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }

      await refreshProfile();

      if (!newAvatarUrl) {
          alert('Profile updated successfully!');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
          
          {/* Header / Cover Placeholder */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
             <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            {/* Avatar Section */}
            <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row sm:items-end gap-6">
              <div className="relative group mx-auto sm:mx-0">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-lg transition-colors duration-300">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <User size={48} />
                    </div>
                  )}
                </div>
                
                <label 
                  className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 active:scale-95 transition-all border-2 border-white dark:border-gray-900"
                  title="Change Avatar"
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={uploadAvatar} 
                    disabled={uploading}
                    className="hidden" 
                  />
                </label>
              </div>
              
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left mb-2 flex-1">
                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{formData.full_name || 'Your Name'}</h1>
                 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mt-2">
                    <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1.5">
                      <Mail size={15} />
                      {user.email}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 capitalize">
                      {user.role || 'Member'}
                    </span>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  Personal Information
                </h2>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Full Name */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="e.g. John Doe"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. +62 812..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="e.g. Jl. Sudirman No. 123, Jakarta"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => updateProfile()}
                  disabled={updating}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100 font-medium shadow-sm hover:shadow-md"
                >
                  {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
