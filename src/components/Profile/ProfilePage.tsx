import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit, Save, X, Wallet, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { extractSkillsFromText } from '../../lib/ai';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().optional(),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  skills: z.array(z.string()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const { user, updateProfile } = useAuth();
  const { wallet, connectWallet } = useWallet();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      linkedin_url: user?.linkedin_url || '',
      skills: user?.skills || [],
    },
  });

  const bioValue = watch('bio');
  const skillsValue = watch('skills');

  React.useEffect(() => {
    if (bioValue) {
      const skills = extractSkillsFromText(bioValue);
      setExtractedSkills(skills);
    } else {
      setExtractedSkills([]);
    }
  }, [bioValue]);

  React.useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        skills: user.skills || [],
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = skillsValue || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    setValue('skills', newSkills);
  };

  const addCustomSkill = (skill: string) => {
    const currentSkills = skillsValue || [];
    if (skill.trim() && !currentSkills.includes(skill.trim())) {
      setValue('skills', [...currentSkills, skill.trim()]);
    }
  };

  const updateWalletAddress = async () => {
    if (wallet.connected && wallet.publicKey) {
      try {
        await updateProfile({ wallet_address: wallet.publicKey });
      } catch (error) {
        console.error('Error updating wallet address:', error);
      }
    }
  };

  React.useEffect(() => {
    if (wallet.connected && wallet.publicKey && user?.wallet_address !== wallet.publicKey) {
      updateWalletAddress();
    }
  }, [wallet.connected, wallet.publicKey]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between -mt-16 mb-6">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-700">
                {user.name.charAt(0)}
              </span>
            </div>
            
            <div className="mt-16 flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              {isEditing ? (
                <input
                  {...register('name')}
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              )}
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-700">{user.bio || 'No bio provided'}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Profile
              </label>
              {isEditing ? (
                <input
                  {...register('linkedin_url')}
                  type="url"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              ) : user.linkedin_url ? (
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <span>View LinkedIn Profile</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <p className="text-gray-500">No LinkedIn profile provided</p>
              )}
              {errors.linkedin_url && (
                <p className="mt-1 text-sm text-red-600">{errors.linkedin_url.message}</p>
              )}
            </div>

            {/* Wallet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address
              </label>
              <div className="flex items-center space-x-3">
                {wallet.connected ? (
                  <div className="flex-1 flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <Wallet className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Connected</p>
                      <p className="text-xs text-green-600 font-mono">
                        {wallet.publicKey?.slice(0, 8)}...{wallet.publicKey?.slice(-8)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Connect Phantom Wallet</span>
                  </button>
                )}
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Skills
                </label>
                {isEditing && <Sparkles className="h-4 w-4 text-purple-500" />}
              </div>

              {isEditing && extractedSkills.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 mb-2">AI-suggested skills from your bio:</p>
                  <div className="flex flex-wrap gap-2">
                    {extractedSkills.map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          skillsValue?.includes(skill)
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomSkill(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(skillsValue || user.skills || []).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {(skillsValue || user.skills || []).length === 0 && (
                <p className="text-gray-500 text-sm">No skills added yet</p>
              )}
            </div>

            {/* Account Info */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Member since:</span>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};